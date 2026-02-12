import { Injectable, inject } from '@angular/core';
import { ContributorRepository } from '../domain/contributor.repository';
import { Contributor, ContributorResponse } from '../domain/contributor.model';
import { SupabaseService } from '@app/core/integrations/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseContributorAdapter extends ContributorRepository {
  private supabase = inject(SupabaseService);

  async getContributors(): Promise<ContributorResponse> {
    if (!this.supabase.isConfigured()) {
      console.warn('[SupabaseContributorAdapter] Cliente Supabase no configurado. Configure las credenciales en el panel de administración (/admin).');
      return { partners: [], insiders: [], supporters: [] };
    }
    const { data, error } = await this.supabase.listMemberships(100);

    if (error) {
      console.error('[SupabaseContributorAdapter] Error al obtener membresías:', error);
      return { partners: [], insiders: [], supporters: [] };
    }
    
    if (!data) return { partners: [], insiders: [], supporters: [] };

    // Filter only active memberships for the Wall of Fame (case-insensitive)
      const activeData = data.filter((m: any) => m.status?.toLowerCase() === 'active');

      // console.log(`[SupabaseContributorAdapter] Total memberships: ${data.length}, Active: ${activeData.length}`);

      const contributors: Contributor[] = activeData.map((m: any) => ({
      id: m.id || m.user_id,
      username: m.username || (m.email ? m.email.split('@')[0] : 'Anonymous'),
      displayName: m.djName || m.username || 'Anonymous',
      // Prioritize database URL, then try Unavatar (Gravatar/Socials), otherwise undefined (UI fallback)
      avatar: m.fotoUrl || (m.email ? `https://unavatar.io/${m.email}` : undefined),
      tier: this.mapLevelToTier(m.level),
      badges: [], // TODO: Implement badges logic
      verifiedAt: new Date(m.start_date),
      contributions: 0, // TODO: Calculate contributions
    }));

    return {
      partners: contributors.filter(c => c.tier === 'partner'),
      insiders: contributors.filter(c => c.tier === 'insider'),
      supporters: contributors.filter(c => c.tier === 'supporter'),
    };
  }

  private mapLevelToTier(level: string): 'partner' | 'insider' | 'supporter' {
    switch (level) {
      case 'socio': return 'partner';
      case 'interno': return 'insider';
      case 'apoyo': return 'supporter';
      default: return 'supporter';
    }
  }

  // Fallback implementations required by abstract class if any
  async getPartners(): Promise<Contributor[]> {
    const all = await this.getContributors();
    return all.partners;
  }
  
  async getInsiders(): Promise<Contributor[]> {
    const all = await this.getContributors();
    return all.insiders;
  }

  async getSupporters(): Promise<Contributor[]> {
    const all = await this.getContributors();
    return all.supporters;
  }
}
