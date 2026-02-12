import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { WaitlistRepository } from '../domain/waitlist.repository';
import { JoinWaitlistRequest, WaitlistPosition } from '../domain/waitlist.model';
import { SupabaseService } from '@app/core/integrations/supabase.service';

@Injectable({ providedIn: 'root' })
export class HttpWaitlistAdapter implements WaitlistRepository {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);

  async joinWaitlist(request: JoinWaitlistRequest): Promise<WaitlistPosition> {
    console.log('👀 1. Iniciando joinWaitlist con datos:', request);
    if (!this.isValidEmail(request.email)) {
      throw new Error('El formato del email no es válido.');
    }

    // 1. Supabase (Principal)
    if (this.supabase.isConfigured()) {
      // 1. Keep Profile for global recognition
      const profileData = {
        id: '',
        username: request.userName || request.email.split('@')[0],
        djName: request.djName,
        email: request.email,
        nationality: request.nationality || ''
      };
      const profileRes = await this.supabase.upsertProfileCompat(profileData);
      
      if (!profileRes.ok) {
         console.error('❌ Error crítico al crear perfil:', profileRes.error);
         // Si falla la creación del perfil, no podemos continuar con las relaciones
         throw new Error(`No se pudo crear el perfil de usuario: ${profileRes.error}`);
      }

      // 1.5 Get Profile ID for foreign key
      const prof = await this.supabase.getProfileByEmail(request.email);

      // 2. Insert Technical Data (Atomic-like)
      if (prof?.id) {
         const techRes = await this.supabase.upsertTechnicalCompat({
            userId: prof.id,
            osFamily: request.os || 'Unknown',
            osVersion: request.osVersion || '',
            architecture: request.architecture || 'x64',
            audioFormats: ['mp3', 'wav'] // Default as requested
         });
         
         if (!techRes.ok) {
            console.error('⚠️ Error al guardar datos técnicos (no bloqueante):', techRes.error);
         }
      } else {
         console.error('❌ No se pudo recuperar el ID del perfil recién creado para asociar datos técnicos.');
      }

      // 3. Join dedicated waiting_list (Legacy/Backup)
      const waitRes = await this.supabase.joinWaitingList({
        email: request.email,
        username: prof?.username || request.userName || '',
        dj_name: request.djName,
        nationality: request.nationality || '',
        instagram: request.instagram,
        status: request.status || 'pending_delivery'
      });

      if (!waitRes.ok) {
        console.warn('⚠️ Tabla de waitlist no disponible, se continúa sin inserción dedicada.');
      }

      // 3. Confirmation Email
      const emailRes = await this.supabase.sendConfirmationEmail(request.email);
      
      if (!emailRes.ok) {
        // En lugar de alertar, solo logueamos. El usuario ya está registrado en DB y el email encolado.
        console.warn('⚠️ Fallo envío directo de email, encolado para reintento:', emailRes.error);
      }

      return {
        userId: request.email,
        djName: request.djName,
        email: request.email,
        position: 1,
        totalParticipants: 1,
        totalEntries: 1,
        percentile: 100,
        joinedAt: new Date()
      };
    } else {
        throw new Error('Supabase no está configurado y se ha eliminado el fallback.');
    }
  }

  async getPosition(userId: string): Promise<WaitlistPosition> {
    // Mock para cumplir con la interfaz hasta tener endpoint de lectura
    return {
      userId: userId,
      djName: 'User',
      email: userId,
      position: 0,
      totalParticipants: 0,
      totalEntries: 0, // Mock compatibility
      percentile: 0,
      joinedAt: new Date()
    };
  }

  private isValidEmail(email: string): boolean {
    // Regex estándar para validación de emails (soporta subdominios y caracteres especiales comunes)
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }
}
