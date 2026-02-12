import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@app/core/domain/models/profile.model';
import { Membership } from '@app/core/domain/models/membership.model';
import { TechnicalData } from '@app/core/domain/models/technical-data.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private urlKey = 'sb_url';
  private anonKeyKey = 'sb_anon';
  private tableKey = 'sb_table';
  private urlSignal = signal<string>('');
  private anonSignal = signal<string>('');
  private tableSignal = signal<string>('waitlist');
  private profilesTableSignal = signal<string>('profiles');
  private membershipsTableSignal = signal<string>('memberships');
  private technicalTableSignal = signal<string>('technical_data');
  private unifiedViewSignal = signal<string>('dj_unified');
  private feedbacksTableSignal = signal<string>('feedbacks');
  private feedbackViewSignal = signal<string>('dj_feedbacks');
  private featureRequestsTableSignal = signal<string>('feature_requests');
  private featureVotesTableSignal = signal<string>('feature_votes');
  private featureVotesViewSignal = signal<string>('feature_votes_by_membership');
  private issueReportsTableSignal = signal<string>('issue_reports');
  private emailJobsTableSignal = signal<string>('email_jobs');
  private waitingListTableSignal = signal<string>('waitlist');
  private profilesHasFullNameColumnSignal = signal<boolean | null>(null);
  private redirectKey = 'sb_redirect';
  private redirectSignal = signal<string>('');
  private lastEmailKey = 'sb_last_email';
  private paySupporterKey = 'pay_apoyo';
  private payInsiderKey = 'pay_interno';
  private payPartnerKey = 'pay_socio';
  private paySupporterSignal = signal<string>('');
  private payInsiderSignal = signal<string>('');
  private payPartnerSignal = signal<string>('');
  private bankAliasKey = 'bank_alias';
  private bankInfoKey = 'bank_info';
  private bankAliasSignal = signal<string>('');
  private bankInfoSignal = signal<string>('');
  private client: SupabaseClient | null = null;
  private avatarCache: Record<string, string> = {};

  constructor() {
    const u = (localStorage.getItem(this.urlKey) || '').trim();
    if (u && !this.isValidSupabaseUrl(u)) {
      console.warn('[SupabaseService] LocalStorage contained invalid URL:', u);
    }
    const k = (localStorage.getItem(this.anonKeyKey) || '').trim();
    const t = localStorage.getItem(this.tableKey) || 'waitlist';
    const r = localStorage.getItem(this.redirectKey) || '';
    const p1 = localStorage.getItem(this.paySupporterKey) || '';
    const p2 = localStorage.getItem(this.payInsiderKey) || '';
    const p3 = localStorage.getItem(this.payPartnerKey) || '';
    const ba = localStorage.getItem(this.bankAliasKey) || '';
    const bi = localStorage.getItem(this.bankInfoKey) || '';
    this.urlSignal.set(u);
    this.anonSignal.set(k);
    this.tableSignal.set(t);
    this.redirectSignal.set(r);
    this.paySupporterSignal.set(p1);
    this.payInsiderSignal.set(p2);
    this.payPartnerSignal.set(p3);
    this.bankAliasSignal.set(ba);
    this.bankInfoSignal.set(bi);
    if (this.isValidSupabaseUrl(u) && this.isValidAnonKey(k)) this.initClient(u, k);
  }

  getProfilesHasFullNameColumn(): boolean | null {
    return this.profilesHasFullNameColumnSignal();
  }
  async checkProfilesFullNameColumn(): Promise<boolean> {
    const cached = this.profilesHasFullNameColumnSignal();
    if (cached !== null) return cached;

    if (!this.client) { this.profilesHasFullNameColumnSignal.set(null); return false; }
    try {
      // Use select('*') to avoid 400 error if column doesn't exist
      const { data, error } = await this.client
        .from(this.profilesTableSignal())
        .select('*')
        .limit(1);
      
      if (error) {
        // If even select(*) fails, assume false but don't cache as true
        this.profilesHasFullNameColumnSignal.set(false);
        return false;
      }

      // If no data, we can't be sure, but it's safer to assume false to avoid insert errors
      if (!data || data.length === 0) {
        this.profilesHasFullNameColumnSignal.set(false);
        return false;
      }

      // Check if the returned object has the key
      const hasColumn = 'full_name' in data[0];
      this.profilesHasFullNameColumnSignal.set(hasColumn);
      return hasColumn;
    } catch {
      this.profilesHasFullNameColumnSignal.set(null);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  getUrl(): string {
    return this.urlSignal();
  }
  getAnonKey(): string {
    return this.anonSignal();
  }
  getTable(): string {
    return this.tableSignal();
  }

  setConfig(url: string, anonKey: string): void {
    const safeUrl = (url || '').trim();
    const safeKey = (anonKey || '').trim();
    
    if (safeUrl && !this.isValidSupabaseUrl(safeUrl)) {
      console.warn('[SupabaseService] setConfig received invalid URL:', safeUrl);
    }

    this.urlSignal.set(safeUrl);
    this.anonSignal.set(safeKey);
    try {
      localStorage.setItem(this.urlKey, safeUrl);
      localStorage.setItem(this.anonKeyKey, safeKey);
    } catch { void 0; }
    if (this.isValidSupabaseUrl(safeUrl) && this.isValidAnonKey(safeKey)) {
      this.initClient(safeUrl, safeKey);
    } else {
      this.client = null;
    }
  }
  setTable(table: string): void {
    this.tableSignal.set(table || 'waitlist');
    try { localStorage.setItem(this.tableKey, this.tableSignal()); } catch { void 0; }
  }
  setNormalizedTables(p: string, m: string, t: string): void {
    this.profilesTableSignal.set(p || 'profiles');
    this.membershipsTableSignal.set(m || 'memberships');
    this.technicalTableSignal.set(t || 'technical_data');
  }
  setUnifiedView(view: string): void {
    this.unifiedViewSignal.set(view || 'dj_unified');
  }
  setAuthRedirectBase(url: string): void {
    this.redirectSignal.set(url);
    try { localStorage.setItem(this.redirectKey, url); } catch { void 0; }
  }
  setFeedbackTable(table: string): void {
    this.feedbacksTableSignal.set(table || 'feedbacks');
  }
  setFeedbackView(view: string): void {
    this.feedbackViewSignal.set(view || 'dj_feedbacks');
  }
  setFeatureRequestsTable(table: string): void {
    this.featureRequestsTableSignal.set(table || 'feature_requests');
  }
  setFeatureVotesTable(table: string): void {
    this.featureVotesTableSignal.set(table || 'feature_votes');
  }
  setFeatureVotesView(view: string): void {
    this.featureVotesViewSignal.set(view || 'feature_votes_by_membership');
  }
  setIssueReportsTable(table: string): void {
    this.issueReportsTableSignal.set(table || 'issue_reports');
  }
  setEmailJobsTable(table: string): void {
    this.emailJobsTableSignal.set(table || 'email_jobs');
  }

  async sendLoginCode(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const res = await this.client.functions.invoke('send-login-code', {
        body: { email, code }
      });
      const err = (res as any)?.error;
      if (err) return { ok: false, error: String(err.message || err) };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: this.toErrorString(e) };
    }
  }

  // Payment Links config (Stripe/MercadoPago/etc)
  setPaymentLink(tier: 'apoyo' | 'interno' | 'socio', url: string): void {
    const safe = url || '';
    switch (tier) {
      case 'apoyo':
        this.paySupporterSignal.set(safe);
        try { localStorage.setItem(this.paySupporterKey, safe); } catch { }
        break;
      case 'interno':
        this.payInsiderSignal.set(safe);
        try { localStorage.setItem(this.payInsiderKey, safe); } catch { }
        break;
      case 'socio':
        this.payPartnerSignal.set(safe);
        try { localStorage.setItem(this.payPartnerKey, safe); } catch { }
        break;
    }
  }
  getPaymentLink(tier: 'apoyo' | 'interno' | 'socio'): string {
    switch (tier) {
      case 'apoyo': return this.paySupporterSignal();
      case 'interno': return this.payInsiderSignal();
      case 'socio': return this.payPartnerSignal();
    }
  }
  hasPaymentLink(tier: 'apoyo' | 'interno' | 'socio'): boolean {
    return !!this.getPaymentLink(tier);
  }

  // Bank transfer alias and info
  setBankAlias(alias: string): void {
    const v = alias || '';
    this.bankAliasSignal.set(v);
    try { localStorage.setItem(this.bankAliasKey, v); } catch { }
  }
  getBankAlias(): string {
    return this.bankAliasSignal();
  }
  setBankInfo(info: string): void {
    const v = info || '';
    this.bankInfoSignal.set(v);
    try { localStorage.setItem(this.bankInfoKey, v); } catch { }
  }
  getBankInfo(): string {
    return this.bankInfoSignal();
  }

  private isErrorLike(e: unknown): e is { message?: unknown } {
    return typeof e === 'object' && e !== null && 'message' in e;
  }
  private toErrorString(e: unknown): string {
    if (this.isErrorLike(e)) return String(e.message ?? e);
    return String(e);
  }

  private isValidSupabaseUrl(url: string): boolean {
    if (!url) return false;
    try { new URL(url); } catch { return false; }
    return /supabase\.co/.test(url) || url.includes('localhost') || url.includes('127.0.0.1');
  }
  private isValidAnonKey(key: string): boolean {
    if (!key) return false;
    const len = key.length;
    return len >= 20 && /^[A-Za-z0-9\.\-\_\+]+$/.test(key);
  }

  private initClient(url: string, anonKey: string): void {
    try {
      this.client = createClient(url.trim(), anonKey.trim(), {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            apikey: anonKey.trim(),
            Authorization: `Bearer ${anonKey.trim()}`
          }
        }
      });
    } catch {
      this.client = null;
    }
  }
  async ensureInstagramAvatar(email: string, username: string): Promise<{ ok: boolean; url?: string; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    const uname = (username || '').trim();
    if (!uname) return { ok: false, error: 'Username vacío' };
    try {
      const res = await this.client.functions.invoke('get-instagram-avatar', {
        body: { username: uname },
      });
      if ((res as any)?.error) {
        const err = (res as any).error;
        return { ok: false, error: `[edge:get-instagram-avatar] ${err.message || String(err)}` };
      }
      const url = (res as any)?.data?.avatarUrl as string;
      if (!url) return { ok: false, error: 'URL vacía' };
      const { error: updErr } = await this.client
        .from(this.profilesTableSignal())
        .update({ foto_url: url })
        .eq('email', email);
      if (updErr) return { ok: false, error: `[profiles] ${updErr.message}` };
      return { ok: true, url };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }
  async backfillAvatarsFromInstagram(limit = 25): Promise<{ ok: boolean; processed: number; errors?: Array<{ email: string; error: string }> }> {
    if (!this.client) return { ok: false, processed: 0, errors: [{ email: '', error: 'Cliente no configurado' }] };
    try {
      const { data, error } = await this.client
        .from(this.profilesTableSignal())
        .select('email, username, foto_url')
        .is('foto_url', null)
        .limit(limit);
      if (error) return { ok: false, processed: 0, errors: [{ email: '', error: error.message }] };
      const rows = (data || []).filter((r: any) => !!r.email && !!r.username);
      const errors: Array<{ email: string; error: string }> = [];
      let processed = 0;
      for (const r of rows) {
        const res = await this.ensureInstagramAvatar(r.email, r.username);
        if (!res.ok) {
          errors.push({ email: r.email, error: res.error || 'error desconocido' });
        } else {
          processed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      return { ok: errors.length === 0, processed, errors: errors.length ? errors : undefined };
    } catch (e: any) {
      return { ok: false, processed: 0, errors: [{ email: '', error: String(e?.message ?? e) }] };
    }
  }

  async upsertWaitlist(entry: {
    email: string;
    djName?: string;
    referral?: string;
    gender?: string;
    country?: string;
    consentMarketing?: boolean;
    userName?: string;
    os?: string;
    osVersion?: string;
    architecture?: string;
    currentSoftware?: string;
    nationality?: string;
    audioFormats?: string[];
  }): Promise<boolean> {
    if (!this.client) return false;
    const row: Record<string, unknown> = { email: entry.email };
    if (entry.djName) row.dj_name = entry.djName;
    if (entry.country) row.country = entry.country;
    if (entry.gender) row.gender = entry.gender;
    if (entry.referral) row.referral = entry.referral;
    if (typeof entry.consentMarketing === 'boolean') row.consent_marketing = entry.consentMarketing;

    // New fields mapping
    if (entry.userName) row.user_name = entry.userName;
    if (entry.os) row.os = entry.os;
    if (entry.osVersion) row.os_version = entry.osVersion;
    if (entry.architecture) row.architecture = entry.architecture;
    if (entry.currentSoftware) row.current_software = entry.currentSoftware;
    if (entry.nationality) row.nationality = entry.nationality;
    if (entry.audioFormats && entry.audioFormats.length) row.audio_formats = entry.audioFormats;

    const { error } = await this.client.from(this.tableSignal()).upsert([row], { onConflict: 'email' });
    return !error;
  }

  async joinWaitingList(entry: {
    email: string;
    username: string;
    dj_name: string;
    nationality: string;
    instagram?: string;
    interests?: string[];
    status?: string;
    os?: string;
    osVersion?: string;
    architecture?: string;
    currentSoftware?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const row: Record<string, unknown> = {
        email: entry.email,
        user_name: entry.username,
        dj_name: entry.dj_name,
        nationality: entry.nationality,
        instagram: entry.instagram || null,
        interests: entry.interests || [],
        status: entry.status || null,
        joined_at: new Date().toISOString()
      };
      if (entry.os) row['os'] = entry.os;
      if (entry.osVersion) row['os_version'] = entry.osVersion;
      if (entry.architecture) row['architecture'] = entry.architecture;
      if (entry.currentSoftware) row['current_software'] = entry.currentSoftware;

      const { error } = await this.client
        .from(this.waitingListTableSignal())
        .upsert([row], { onConflict: 'email' });

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async upsertWaitlistDetailed(entry: {
    email: string;
    djName: string;
    referral?: string;
    gender?: string;
    country?: string;
    consentMarketing?: boolean;
    userName?: string;
    os?: string;
    osVersion?: string;
    architecture?: string;
    currentSoftware?: string;
    nationality?: string;
    audioFormats?: string[];
  }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const row: Record<string, unknown> = { email: entry.email };
      if (entry.djName) row.dj_name = entry.djName;
      if (entry.country) row.country = entry.country;
      if (entry.gender) row.gender = entry.gender;
      if (entry.referral) row.referral = entry.referral;
      if (typeof entry.consentMarketing === 'boolean') row.consent_marketing = entry.consentMarketing;

      // New fields mapping
      if (entry.userName) row.user_name = entry.userName;
      if (entry.os) row.os = entry.os;
      if (entry.osVersion) row.os_version = entry.osVersion;
      if (entry.architecture) row.architecture = entry.architecture;
      if (entry.currentSoftware) row.current_software = entry.currentSoftware;
      if (entry.nationality) row.nationality = entry.nationality;
      if (entry.audioFormats && entry.audioFormats.length) row.audio_formats = entry.audioFormats;

      const { error } = await this.client.from(this.tableSignal()).upsert([row], { onConflict: 'email' });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async upsertProfile(profile: Profile): Promise<boolean> {
    if (!this.client) return false;
    const row: Record<string, unknown> = {
      username: profile.username,
      full_name: profile.fullName || null,
      dj_name: profile.djName,
      email: profile.email,
      nationality: profile.nationality,
      foto_url: profile.fotoUrl || null,
      primary_software: profile.primarySoftware,
    };
    const { error } = await this.client
      .from(this.profilesTableSignal())
      .upsert([row], { onConflict: 'email' });
    return !error;
  }
  async upsertProfileCompat(profile: Profile): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const hasFullName = this.getProfilesHasFullNameColumn() === true;
      const { data: existing, error: selErr } = await this.client
        .from(this.profilesTableSignal())
        .select('id, username')
        .eq('email', profile.email)
        .limit(1)
        .maybeSingle();
      if (selErr) return { ok: false, error: selErr.message };
      if (existing?.id) {
        // En lugar de intentar un update complejo con todas las columnas posibles que pueden fallar (400 Bad Request),
        // usamos una estrategia de "mejora progresiva": primero lo esencial.
        
        // Payload base seguro
        const payload: Record<string, unknown> = {
          dj_name: profile.djName,
          nationality: profile.nationality,
          primary_software: profile.primarySoftware,
        };
        
        // Agregamos opcionales solo si tenemos alta certeza (o lo dejamos para un segundo paso si es necesario)
        if (hasFullName && profile.fullName) {
             // payload['full_name'] = profile.fullName; 
        }

        const { error: updErr } = await this.client
          .from(this.profilesTableSignal())
          .update(payload)
          .eq('email', profile.email);

        if (updErr) {
            // Si falla incluso con lo básico, intentamos solo actualizar dj_name que es lo más crítico para el UI
             const minimalPayload = { dj_name: profile.djName };
             const { error: minErr } = await this.client
                .from(this.profilesTableSignal())
                .update(minimalPayload)
                .eq('email', profile.email);
                
             if (minErr) return { ok: false, error: `[profiles] Update failed: ${minErr.message}` };
        }
        return { ok: true };
      } else {
        // Nuevo perfil
        let baseUsername = profile.username || (profile.email.split('@')[0]);
        let attempt = 0;
        
        while (attempt < 2) {
          // Schema mínimo garantizado
          const row: Record<string, unknown> = {
            username: baseUsername,
            dj_name: profile.djName,
            email: profile.email,
            nationality: profile.nationality,
            primary_software: profile.primarySoftware
          };

          // Campos opcionales solo si estamos seguros
          if (hasFullName && profile.fullName) {
             row['full_name'] = profile.fullName;
          }
          if (profile.fotoUrl) {
             // Por seguridad, intentamos omitir foto_url en el primer insert para evitar errores 400
             // si la columna no existe o hay problemas de tipo.
             // Se puede actualizar después si es crítico.
             // row['foto_url'] = profile.fotoUrl; 
          }

          const { error: insErr } = await this.client
            .from(this.profilesTableSignal())
            .upsert([row], { onConflict: 'email' });
          
          if (!insErr) return { ok: true };
          
          const msg = insErr.message?.toLowerCase() ?? '';

          // Handle email conflict (profile already exists)
          const isEmailConflict = 
            insErr.code === '23505' || 
            msg.includes('profiles_email_key') || 
            (msg.includes('duplicate key value') && msg.includes('email'));
            
          if (isEmailConflict) {
            console.log('Perfil ya existe (email conflict), continuando...');
            return { ok: true };
          }

          const isUsernameConflict = msg.includes('duplicate key value') && msg.includes('username');
          if (isUsernameConflict) {
            baseUsername = `${baseUsername}_${Math.random().toString(36).slice(2, 6)}`;
            attempt++;
            continue;
          }

          // Si falla por columna desconocida, reintentamos con lo mínimo absoluto
          if (msg.includes('column') || msg.includes('does not exist')) {
              console.warn('Fallo insert completo, reintentando con payload mínimo:', msg);
              const minimalRow = {
                  email: profile.email,
                  username: baseUsername,
                  dj_name: profile.djName
              };
              const { error: minErr } = await this.client
                .from(this.profilesTableSignal())
                .upsert([minimalRow], { onConflict: 'email' });
              
              if (!minErr) return { ok: true };
              return { ok: false, error: `[profiles] Retry failed: ${minErr.message}` };
          }

          return { ok: false, error: `[profiles] ${insErr.message}` };
        }
        return { ok: true };
      }
    } catch (e: any) {
      return { ok: false, error: `[profiles] ${String(e?.message ?? e)}` };
    }
  }

  async upsertTechnical(data: TechnicalData & { audioFormats?: string[] }): Promise<boolean> {
    if (!this.client) return false;
    const row: Record<string, unknown> = {
      user_id: data.userId,
      os_family: data.osFamily,
      os_version: data.osVersion,
      architecture: data.architecture,
    };
    if (data.audioFormats && data.audioFormats.length) row.audio_formats = data.audioFormats;
    const { error } = await this.client
      .from(this.technicalTableSignal())
      .upsert([row], { onConflict: 'user_id' });
    return !error;
  }
  async upsertTechnicalDetailed(data: TechnicalData & { audioFormats?: string[] }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const row: Record<string, unknown> = {
        user_id: data.userId,
        os_family: data.osFamily,
        os_version: data.osVersion,
        architecture: data.architecture,
      };
      if (data.audioFormats && data.audioFormats.length) row.audio_formats = data.audioFormats;
      const { error } = await this.client
        .from(this.technicalTableSignal())
        .upsert([row], { onConflict: 'user_id' });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async upsertTechnicalCompat(data: TechnicalData & { audioFormats?: string[] }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const row: Record<string, unknown> = {
        user_id: data.userId,
        os_family: data.osFamily,
        os_version: data.osVersion,
        architecture: data.architecture
      };

      // Intentamos primero verificar si existe para evitar usar 'upsert' que causa 400 Bad Request
      // si no existe el constraint UNIQUE en 'user_id'.
      const { data: existing, error: selErr } = await this.client
        .from(this.technicalTableSignal())
        .select('id')
        .eq('user_id', data.userId)
        .maybeSingle();

      if (selErr) {
        console.warn('[SupabaseService] Error checking technical_data existence:', selErr);
        // Si falla el select, intentamos insert directo (puede fallar si duplicado, pero es el mejor intento)
        const { error: insErr } = await this.client.from(this.technicalTableSignal()).insert([row]);
        if (insErr) return { ok: false, error: insErr.message };
        return { ok: true };
      }

      if (existing) {
        const { error: updErr } = await this.client
          .from(this.technicalTableSignal())
          .update(row)
          .eq('user_id', data.userId);
        
        if (updErr) return { ok: false, error: `[technical update] ${updErr.message}` };
      } else {
        const { error: insErr } = await this.client
          .from(this.technicalTableSignal())
          .insert([row]);
          
        if (insErr) return { ok: false, error: `[technical insert] ${insErr.message}` };
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async upsertMembership(m: Membership): Promise<boolean> {
    if (!this.client) return false;
    const row: Record<string, unknown> = {
      user_id: m.userId,
      level: m.level,
      status: m.status,
      start_date: m.startDate,
      receipt_url: m.receiptUrl ?? null,
      transaction_ref: m.transactionRef ?? null,
      internal_notes: m.internalNotes ?? null,
    };
    const { error } = await this.client
      .from(this.membershipsTableSignal())
      .upsert([row], { onConflict: 'user_id' });
    return !error;
  }

  async upsertMembershipCompat(m: Membership): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const { data: existing, error: selErr } = await this.client
        .from(this.membershipsTableSignal())
        .select('id')
        .eq('user_id', m.userId)
        .limit(1)
        .maybeSingle();
      if (selErr) return { ok: false, error: selErr.message };
      const payload: Record<string, unknown> = {
        level: m.level,
        status: m.status,
        start_date: m.startDate,
        receipt_url: m.receiptUrl ?? null,
        transaction_ref: m.transactionRef ?? null,
        internal_notes: m.internalNotes ?? null,
        months_paid: m.monthsPaid ?? 1,
        expiry_date: m.expiryDate ?? null,
      };

      // Helper for fallback retry
      const executeOperation = async (isUpdate: boolean): Promise<{ ok: boolean; error?: string }> => {
        const query = this.client.from(this.membershipsTableSignal());
        const promise = isUpdate
          ? query.update(payload).eq('user_id', m.userId)
          : query.upsert([{ ...payload, user_id: m.userId }], { onConflict: 'user_id' });

        const { error } = await promise;

        if (error) {
          // CHECK FOR SCHEMA CACHE / COLUMN ERRORS
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('schema cache') || msg.includes('column')) {
            console.warn('⚠️ Fallback: Retrying membership save without new columns due to schema error.');

            // Create Safe Payload (Legacy columns only)
            const safePayload: Record<string, unknown> = {
              level: m.level,
              status: m.status,
              start_date: m.startDate,
              receipt_url: m.receiptUrl ?? null,
              transaction_ref: m.transactionRef ?? null,
            };

            // Append missing info to internal_notes
            const extraInfo = ` | FALLBACK_DATA: months_paid=${m.monthsPaid}, expiry=${m.expiryDate}`;
            safePayload['internal_notes'] = (m.internalNotes || '') + extraInfo;
            if (!isUpdate) safePayload['user_id'] = m.userId;

            const retryQuery = this.client.from(this.membershipsTableSignal());
            const retryPromise = isUpdate
              ? retryQuery.update(safePayload).eq('user_id', m.userId)
              : retryQuery.upsert([safePayload], { onConflict: 'user_id' });

            const { error: retryErr } = await retryPromise;
            if (retryErr) return { ok: false, error: `[memberships] ${retryErr.message}` };
            return { ok: true };
          }
          return { ok: false, error: `[memberships] ${error.message}` };
        }
        return { ok: true };
      };

      return await executeOperation(!!existing?.id);
    } catch (e: any) {
      return { ok: false, error: `[memberships] ${String(e?.message ?? e)}` };
    }
  }

  async uploadPaymentReceipt(file: Blob, fileName: string): Promise<{ ok: boolean; url?: string; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const bucket = 'payments';
      const path = `receipts/${Date.now()}_${fileName}`;
      const { error: upErr } = await this.client.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: (file as any).type || 'application/octet-stream'
      });
      if (upErr) return { ok: false, error: upErr.message };
      const { data } = this.client.storage.from(bucket).getPublicUrl(path);
      const publicUrl = data?.publicUrl || null;
      if (!publicUrl) return { ok: false, error: 'No se pudo obtener URL pública del recibo' };
      return { ok: true, url: publicUrl };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async uploadAvatar(file: Blob, fileName: string): Promise<{ ok: boolean; url?: string; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const bucket = 'colaboradores_fotos';
      // Use just the fileName (which will be userId or email) to overwrite if exists, or append timestamp? 
      // User said "El nombre del archivo debe ser el id del usuario o su email para evitar duplicados"
      // So if I use just email/id, it will overwrite, which is good for profile pic.
      // But I should probably add an extension if possible, or just trust content-type handling.
      // Let's assume fileName comes with extension or we construct it. 
      // The instruction says "El nombre del archivo debe ser el id del usuario o su email".
      // Let's stick to a clean path.
      
      const path = `${fileName}`; 
      
      const { error: upErr } = await this.client.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: (file as any).type || 'application/octet-stream',
        cacheControl: '3600'
      });
      
      if (upErr) return { ok: false, error: upErr.message };
      
      const { data } = this.client.storage.from(bucket).getPublicUrl(path);
      // Append timestamp to url to bust cache if needed? No, public URL is static usually.
      // But if we overwrite, the URL stays the same. The browser might cache it.
      // Adding a query param with timestamp is a common trick on the client side.
      // For now, just return the base public URL.
      
      const publicUrl = data?.publicUrl || null;
      if (!publicUrl) return { ok: false, error: 'No se pudo obtener URL pública del avatar' };
      
      return { ok: true, url: publicUrl };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async resolveAvatarUrlByEmail(email: string): Promise<string | null> {
    if (!this.client) return null;
    const cached = this.avatarCache[email];
    if (cached) return cached;
    try {
      const bucket = 'colaboradores_fotos';
      const safeEmail = email.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { data, error } = await this.client.storage.from(bucket).list('', { search: `${safeEmail}_avatar_` });
      if (error) return null;
      const files = (data || []) as any[];
      if (!files.length) return null;
      const sorted = files.sort((a: any, b: any) => {
        const ta = new Date(a.updated_at || a.created_at || 0).getTime();
        const tb = new Date(b.updated_at || b.created_at || 0).getTime();
        return tb - ta;
      });
      const path = sorted[0]?.name;
      if (!path) return null;
      const { data: pub } = this.client.storage.from(bucket).getPublicUrl(path);
      const url = pub?.publicUrl || null;
      if (url) this.avatarCache[email] = url;
      return url;
    } catch {
      return null;
    }
  }

  async checkAvatarExists(email: string): Promise<{ exists: boolean; url?: string; source?: 'profile' | 'storage'; error?: string }> {
    if (!this.client) return { exists: false, error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client
        .from(this.profilesTableSignal())
        .select('*')
        .eq('email', email)
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        const url = data.foto_url || data.avatar_url || data.avatar || data.image || data.picture || null;
        if (url) return { exists: true, url, source: 'profile' };
      }
      const resolved = await this.resolveAvatarUrlByEmail(email);
      if (resolved) return { exists: true, url: resolved, source: 'storage' };
      return { exists: false };
    } catch (e: any) {
      return { exists: false, error: String(e?.message ?? e) };
    }
  }

  async listMemberships(limit = 50): Promise<{ data: any[]; error?: string }> {
    if (!this.client) return { data: [], error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client
        .from(this.membershipsTableSignal())
        .select('*')
        .order('start_date', { ascending: false })
        .limit(limit);
      if (error) return { data: [], error: `[memberships] ${error.message}` };

      const rows = data ?? [];
      let profilesMap: Record<string, any> = {};
      const userIds = rows.map((m: any) => m.user_id).filter((v: any) => !!v);
      const key = this.getAnonKey() || '';
      const canProfileFetch = this.isValidAnonKey(key) && !!this.client;
      if (userIds.length && canProfileFetch) {
        try {
          // Use select('*') to safely fetch whatever columns exist (including foto_url if present)
          // without triggering 400 Bad Request for missing columns.
          const { data: profs, error: profErr } = await this.client
            .from(this.profilesTableSignal())
            .select('*')
            .in('id', userIds);
            
          if (profErr) {
             console.error('[SupabaseService] Error fetching profiles:', profErr.message);
          } else {
             for (const p of (profs || [])) profilesMap[p.id] = p;
          }
        } catch (e: any) {
          console.error('[SupabaseService] Unexpected error fetching profiles:', e.message);
        }
      }

      const mapped = await Promise.all(rows.map(async (m: any) => {
        const prof = profilesMap[m.user_id] || null;
        const email = prof?.email;
        const username = prof?.username ?? (email ? email.split('@')[0] : undefined);
        const djName = prof?.dj_name;
        // Try multiple common column names for avatar
        let fotoUrl = prof?.foto_url || prof?.avatar_url || prof?.avatar || prof?.image || prof?.picture || null;
        
        if (prof && !fotoUrl) {
           // Debug: Log available keys if no avatar found, to help identify correct column
           // console.log('[SupabaseService] Profile keys for user:', Object.keys(prof));
           if (email) {
             const resolved = await this.resolveAvatarUrlByEmail(email);
             if (resolved) fotoUrl = resolved;
           }
        }

        return { ...m, email, djName, username, fotoUrl };
      }));
      const uniqueMap: Record<string, any> = {};
      const deduped: any[] = [];
      for (const item of mapped) {
        const uid = item.user_id;
        if (!uid) {
          deduped.push(item);
          continue;
        }
        if (!uniqueMap[uid]) {
          uniqueMap[uid] = true;
          deduped.push(item);
        }
      }
      return { data: deduped };
    } catch (e: any) {
      return { data: [], error: String(e?.message ?? e) };
    }
  }

  async updateMembershipStatusByEmail(email: string, status: 'active' | 'pending' | 'pending_verification' | 'expired' | 'cancelled' | 'rejected', internalNotes?: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const prof = await this.getProfileByEmail(email);
      if (!prof?.id) return { ok: false, error: 'Perfil no encontrado' };
      // Fetch membership to include level in email_jobs (column is NOT NULL in some environments)
      let levelForJob: 'apoyo' | 'interno' | 'socio' | null = null;
      try {
        const { data: mem } = await this.client
          .from(this.membershipsTableSignal())
          .select('level')
          .eq('user_id', prof.id)
          .limit(1)
          .maybeSingle();
        if (mem?.level && ['apoyo', 'interno', 'socio'].includes(mem.level)) {
          levelForJob = mem.level as 'apoyo' | 'interno' | 'socio';
        }
      } catch { /* ignore */ }
      const payload: Record<string, unknown> = {
        status,
        internal_notes: internalNotes ?? null
      };
      const { error } = await this.client
        .from(this.membershipsTableSignal())
        .update(payload)
        .eq('user_id', prof.id);
      if (error) return { ok: false, error: `[memberships] ${error.message}` };
      if (status === 'active') {
        const due = new Date();
        due.setMonth(due.getMonth() + 1);
        const jobPayload: Record<string, unknown> = {
          email,
          level: levelForJob ?? 'apoyo',
          type: 'expiry_notice',
          status: 'scheduled',
          created_at: new Date().toISOString(),
          user_id: prof.id,
          payload: { user_id: prof.id, due_date: due.toISOString() }
        };
        const { error: jobErr } = await this.client.from(this.emailJobsTableSignal()).insert([jobPayload]);
        if (jobErr) return { ok: false, error: `[email_jobs] ${jobErr.message}` };
      }
      if (status === 'expired') {
        const jobPayload: Record<string, unknown> = {
          email,
          level: levelForJob ?? 'apoyo',
          type: 'expired_notice',
          status: 'queued',
          created_at: new Date().toISOString(),
          user_id: prof.id,
          payload: { user_id: prof.id }
        };
        const { error: jobErr } = await this.client.from(this.emailJobsTableSignal()).insert([jobPayload]);
        if (jobErr) return { ok: false, error: `[email_jobs] ${jobErr.message}` };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: `[memberships] ${String(e?.message ?? e)}` };
    }
  }
  async updateMembershipStatusByUserId(userId: string, status: 'active' | 'pending' | 'pending_verification' | 'expired' | 'cancelled' | 'rejected', internalNotes?: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const payload: Record<string, unknown> = {
        status,
        internal_notes: internalNotes ?? null
      };
      const { error } = await this.client
        .from(this.membershipsTableSignal())
        .update(payload)
        .eq('user_id', userId);
      if (error) return { ok: false, error: `[memberships] ${error.message}` };
      // Optional email job scheduling requires email/level; fetch if available
      try {
        const { data: prof } = await this.client
          .from(this.profilesTableSignal())
          .select('email')
          .eq('id', userId)
          .limit(1)
          .maybeSingle();
        const email = prof?.email as string | undefined;
        let levelForJob: 'apoyo' | 'interno' | 'socio' | null = null;
        try {
          const { data: mem } = await this.client
            .from(this.membershipsTableSignal())
            .select('level')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
          if (mem?.level && ['apoyo', 'interno', 'socio'].includes(mem.level)) {
            levelForJob = mem.level as 'apoyo' | 'interno' | 'socio';
          }
        } catch { /* ignore */ }
        if (email && status === 'active') {
          const due = new Date();
          due.setMonth(due.getMonth() + 1);
          const jobPayload: Record<string, unknown> = {
            email,
            level: levelForJob ?? 'apoyo',
            type: 'expiry_notice',
            status: 'scheduled',
            created_at: new Date().toISOString(),
            user_id: userId,
            payload: { user_id: userId, due_date: due.toISOString() }
          };
          await this.client.from(this.emailJobsTableSignal()).insert([jobPayload]);
        }
        if (email && status === 'expired') {
          const jobPayload: Record<string, unknown> = {
            email,
            level: levelForJob ?? 'apoyo',
            type: 'expired_notice',
            status: 'queued',
            created_at: new Date().toISOString(),
            user_id: userId,
            payload: { user_id: userId }
          };
          await this.client.from(this.emailJobsTableSignal()).insert([jobPayload]);
        }
      } catch { /* ignore optional jobs */ }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: `[memberships] ${String(e?.message ?? e)}` };
    }
  }

  async enqueueBenefitsEmail(email: string, level: 'apoyo' | 'interno' | 'socio', months?: number): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const prof = await this.getProfileByEmail(email);
      const safeLevel = (['apoyo', 'interno', 'socio'] as const).includes(level) ? level : 'apoyo';
      const payload: Record<string, unknown> = {
        email,
        level: safeLevel,
        type: 'benefits',
        status: 'queued',
        created_at: new Date().toISOString(),
        user_id: prof?.id ?? null,
        payload: { user_id: prof?.id ?? null, level: safeLevel, priority: safeLevel === 'socio' ? 'high' : 'normal', months_prepaid: months ?? 1 }
      };
      const { error } = await this.client.from(this.emailJobsTableSignal()).insert([payload]);
      if (error) return { ok: false, error: `[email_jobs] ${error.message}` };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: `[email_jobs] ${this.toErrorString(e)}` };
    }
  }

  async enqueuePendingPaymentNotification(email: string, level: 'apoyo' | 'interno' | 'socio', transactionRef?: string, monthsPaid?: number): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const prof = await this.getProfileByEmail(email);
      const safeLevel = (['apoyo', 'interno', 'socio'] as const).includes(level) ? level : 'apoyo';
      const payload: Record<string, unknown> = {
        email,
        level: safeLevel,
        type: 'notificación_pago_pendiente',
        status: 'queued',
        created_at: new Date().toISOString(),
        user_id: prof?.id ?? null,
        payload: { user_id: prof?.id ?? null, level: safeLevel, transaction_ref: transactionRef ?? null, months_paid: monthsPaid ?? 1 }
      };
      const { error } = await this.client.from(this.emailJobsTableSignal()).insert([payload]);
      if (error) return { ok: false, error: `[email_jobs] ${error.message}` };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: `[email_jobs] ${this.toErrorString(e)}` };
    }
  }

  async getUnified(limit = 50): Promise<{ data: any[]; error?: string }> {
    if (!this.client) return { data: [], error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client.from(this.unifiedViewSignal()).select('*').limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: data ?? [] };
    } catch (e: any) {
      return { data: [], error: String(e?.message ?? e) };
    }
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    if (!this.client) return null;
    const { data, error } = await this.client
      .from(this.profilesTableSignal())
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      username: data.username,
      djName: data.dj_name,
      email: data.email,
      nationality: data.nationality,
      fotoUrl: data.foto_url,
      primarySoftware: data.primary_software
    };
  }

  async isDjNameAvailable(djName: string): Promise<boolean> {
    if (!this.client || !djName) return true;
    try {
      const { data, error } = await this.client
        .from(this.profilesTableSignal())
        .select('dj_name')
        .eq('dj_name', djName)
        .limit(1)
        .maybeSingle();
      if (error) return true; // Fail safe
      return !data;
    } catch {
      return true;
    }
  }

  async sendConfirmationEmail(email: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      console.log('[SupabaseService] Invocando Edge Function: send-waitlist-welcome para', email);
      
      // Construimos la URL manualmente para usar fetch y tener mejor control de errores
      const projectUrl = this.getUrl();
      const functionUrl = `${projectUrl}/functions/v1/send-waitlist-welcome`;
      const anonKey = this.getAnonKey();

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        },
        body: JSON.stringify({ email, name: email.split('@')[0] })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SupabaseService] Edge Function Failed (${response.status}):`, errorText);
        
        // Fallback: Intento de inserción en tabla de cola (email_jobs)
        try {
             await this.client.from('email_jobs').insert([{
                 email: email,
                 type: 'welcome_waitlist',
                 status: 'pending_retry',
                 payload: { error: errorText, status: response.status },
                 level: 'apoyo'
             }]);
             console.log('[SupabaseService] Fallo envío directo, encolado en email_jobs para reintento.');
        } catch (queueErr) {
             console.warn('[SupabaseService] No se pudo encolar el fallo de email:', queueErr);
        }

        return { ok: false, error: `Edge Function Error ${response.status}: ${errorText}` };
      }
      
      const data = await response.json();
      console.log('[SupabaseService] Email enviado correctamente:', data);
      return { ok: true };
    } catch (e: any) {
      // Fallback para errores de red / fetch
       try {
             await this.client.from('email_jobs').insert([{
                 email: email,
                 type: 'welcome_waitlist',
                 status: 'pending_retry',
                 payload: { error: String(e?.message ?? e) },
                 level: 'apoyo'
             }]);
        } catch {}
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async verifyEmail(tokenHash: string, email: string, type: 'signup' | 'magiclink' = 'signup'): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client.auth.verifyOtp({
        type,
        token_hash: tokenHash,
        email
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async testInsert(): Promise<boolean> {
    return await this.upsertWaitlist({
      email: `test_${Date.now()}@example.com`,
      djName: 'DJ Test',
      userName: 'TestUser',
      os: 'Windows',
      osVersion: '11',
      architecture: 'x64',
      currentSoftware: 'Rekordbox',
      nationality: 'Spain',
      gender: 'not_specified',
      referral: 'other',
      consentMarketing: true,
      audioFormats: ['mp3', 'wav', 'flac']
    });
  }

  async testInsertDetailed(): Promise<{ ok: boolean; error?: string }> {
    return await this.upsertWaitlistDetailed({
      email: `test_${Date.now()}@example.com`,
      djName: 'DJ Test',
      userName: 'TestUser',
      os: 'Windows',
      osVersion: '11',
      architecture: 'x64',
      currentSoftware: 'Rekordbox',
      nationality: 'Spain',
      gender: 'not_specified',
      referral: 'other',
      consentMarketing: true,
      audioFormats: ['mp3', 'flac']
    });
  }

  async getRowCount(): Promise<{ count: number | null; error?: string }> {
    if (!this.client) return { count: null, error: 'Cliente no configurado' };
    try {
      const { count, error } = await this.client
        .from(this.tableSignal())
        .select('*', { count: 'exact', head: true });
      if (error) return { count: null, error: error.message };
      return { count: count ?? null };
    } catch (e: any) {
      return { count: null, error: String(e?.message ?? e) };
    }
  }

  async getColumnCount(): Promise<{ count: number | null; error?: string }> {
    if (!this.client) return { count: null, error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client
        .from(this.tableSignal())
        .select('*')
        .limit(1);
      if (error) return { count: null, error: error.message };
      if (data && data.length > 0) return { count: Object.keys(data[0] ?? {}).length };
      return { count: null };
    } catch (e: any) {
      return { count: null, error: String(e?.message ?? e) };
    }
  }

  async getCountsDetailed(): Promise<{ rows: number | null; cols: number | null; error?: string }> {
    const r = await this.getRowCount();
    const c = await this.getColumnCount();
    const err = r.error || c.error;
    return { rows: r.count, cols: c.count, error: err };
  }

  getLastEmail(): string | null {
    try { return localStorage.getItem(this.lastEmailKey); } catch { return null; }
  }

  async addFeedback(entry: { userId: string; quote: string; rating?: number }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const payload: Record<string, unknown> = {
        user_id: entry.userId,
        quote: entry.quote,
        rating: typeof entry.rating === 'number' ? entry.rating : null
      };
      const { error } = await this.client.from(this.feedbacksTableSignal()).insert([payload]);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async listFeedbacks(limit = 12): Promise<{ data: Array<{ id: string; name: string; role: string; quote: string; rating?: number; created_at?: string }>; error?: string }> {
    if (!this.client) return { data: [], error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client
        .from(this.feedbackViewSignal())
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return { data: [], error: error.message };
      const mapped = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name ?? row.username ?? row.dj_name ?? 'Anon',
        role: row.role ?? (row.level ? String(row.level) : 'apoyo'),
        quote: row.quote,
        rating: typeof row.rating === 'number' ? row.rating : undefined,
        created_at: row.created_at
      }));
      return { data: mapped };
    } catch (e: unknown) {
      return { data: [], error: this.toErrorString(e) };
    }
  }

  async addFeatureRequest(entry: { title: string; description?: string; userId?: string; category?: string }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const payload: Record<string, unknown> = {
        title: entry.title,
        description: entry.description ?? null,
        user_id: entry.userId ?? null,
        category: entry.category ?? null
      };
      const { error } = await this.client.from(this.featureRequestsTableSignal()).insert([payload]);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: this.toErrorString(e) };
    }
  }

  async voteFeature(entry: { featureId: string; userId?: string; membership?: 'apoyo' | 'interno' | 'socio' }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const payload: Record<string, unknown> = {
        feature_id: entry.featureId,
        user_id: entry.userId ?? null,
        membership: entry.membership ?? null
      };
      const { error } = await this.client.from(this.featureVotesTableSignal()).insert([payload]);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: this.toErrorString(e) };
    }
  }

  async listFeatureRequestsWithVotes(limit = 10, category?: string): Promise<{ data: Array<{ id: string; title: string; category?: string; supporter: number; insider: number; partner: number; total: number }>; error?: string }> {
    if (!this.client) return { data: [], error: 'Cliente no configurado' };
    try {
      let query = this.client
        .from(this.featureVotesViewSignal())
        .select('*');
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query
        .order('total', { ascending: false })
        .limit(limit);
      if (error) return { data: [], error: error.message };
      const mapped = (data ?? []).map((row: Record<string, unknown>) => {
        const r = row as Record<string, unknown>;
        const title =
          typeof r['title'] === 'string'
            ? (r['title'] as string)
            : typeof r['feature_title'] === 'string'
              ? (r['feature_title'] as string)
              : 'Feature';
        const category = typeof r['category'] === 'string' ? (r['category'] as string) : undefined;
        const supporter = typeof r['supporter'] === 'number'
          ? (r['supporter'] as number)
          : typeof r['apoyo'] === 'number'
            ? (r['apoyo'] as number)
            : 0;
        const insider = typeof r['insider'] === 'number'
          ? (r['insider'] as number)
          : typeof r['interno'] === 'number'
            ? (r['interno'] as number)
            : 0;
        const partner = typeof r['partner'] === 'number'
          ? (r['partner'] as number)
          : typeof r['socio'] === 'number'
            ? (r['socio'] as number)
            : 0;
        const total = typeof r['total'] === 'number' ? (r['total'] as number) : 0;
        return {
          id: String(r['id']),
          title,
          category,
          supporter: Number(supporter),
          insider: Number(insider),
          partner: Number(partner),
          total: Number(total),
        };
      });
      return { data: mapped };
    } catch (e: unknown) {
      return { data: [], error: this.toErrorString(e) };
    }
  }

  async reportIssue(entry: { email: string; type: 'demo' | 'installer'; description: string }): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const payload: Record<string, unknown> = {
        email: entry.email,
        type: entry.type,
        description: entry.description
      };
      const { error } = await this.client.from(this.issueReportsTableSignal()).insert([payload]);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: this.toErrorString(e) };
    }
  }

  // Tracking Methods
  async getMembershipById(ref: string): Promise<Membership | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from(this.membershipsTableSignal())
        .select('*')
        .eq('transaction_ref', ref)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        level: data.level,
        status: data.status,
        startDate: data.start_date,
        receiptUrl: data.receipt_url,
        transactionRef: data.transaction_ref,
        internalNotes: data.internal_notes,
        monthsPaid: data.months_paid,
        expiryDate: data.expiry_date
      };
    } catch (e) {
      console.error('Error fetching membership:', e);
      return null;
    }
  }

  subscribeToMembership(refOrId: string, callback: (payload: any) => void) {
    if (!this.client) return null;
    
    // Choose filter based on format (UUID vs Tracking ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refOrId);
    const filter = isUuid ? `id=eq.${refOrId}` : `transaction_ref=eq.${refOrId}`;

    return this.client
      .channel(`membership:${refOrId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memberships',
          filter: filter
        },
        (payload) => callback(payload)
      )
      .subscribe();
  }

  async getMembershipByUserId(userId: string): Promise<Membership | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from(this.membershipsTableSignal())
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      return {
        userId: data.user_id,
        level: data.level,
        status: data.status,
        startDate: data.start_date,
        receiptUrl: data.receipt_url,
        transactionRef: data.transaction_ref,
        internalNotes: data.internal_notes,
        monthsPaid: data.months_paid,
        expiryDate: data.expiry_date
      };
    } catch (e) {
      console.error('Error fetching membership by user ID:', e);
      return null;
    }
  }

  async sendDeliveryEmail(email: string, djName: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client.functions.invoke('send-delivery-email', {
        body: { 
          type: 'INSERT', 
          table: 'waiting_list',
          record: { email, dj_name: djName, status: 'pending_delivery' }
        }
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async getInstagramAvatar(username: string): Promise<{ ok: boolean; avatarUrl?: string; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client.functions.invoke('get-instagram-avatar', {
        body: { username },
      });

      if (error) {
         console.error('Supabase Function Error:', error);
         return { ok: false, error: error.message };
      }
      
      if (data?.error) {
          return { ok: false, error: data.error };
      }

      return { ok: true, avatarUrl: data.avatarUrl };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }

  async syncInstagramProfile(username: string, userId: string): Promise<{ ok: boolean; avatarUrl?: string; error?: string }> {
    if (!this.client) return { ok: false, error: 'Cliente no configurado' };
    try {
      const { data, error } = await this.client.functions.invoke('sync-instagram-profile', {
        body: { instagram_username: username, user_id: userId },
      });

      if (error) {
         console.error('Supabase Sync Function Error:', error);
         return { ok: false, error: error.message };
      }
      
      if (data?.error) {
          return { ok: false, error: data.error };
      }

      return { ok: true, avatarUrl: data.avatarUrl };
    } catch (e: any) {
      return { ok: false, error: String(e?.message ?? e) };
    }
  }
}
