import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private setupDone = signal<boolean>(false);
  private authenticated = signal<boolean>(false);
  private allowedUsersKey = 'admin_allowed_users';
  private pendingKey = 'admin_pending_login';

  constructor(private readonly router: Router) {
    const stored = localStorage.getItem('admin_creds');
    // FORZAMOS setupDone a true para ocultar la pantalla de "Configurar Admin"
    // y mostrar siempre el login por email (OTP).
    this.setupDone.set(true); 
    const allowed = localStorage.getItem(this.allowedUsersKey);
    if (!allowed) {
      this.setAllowedUsers(['miguel.bellidodev@gmail.com', 'flowmix.app@gmail.com']);
    }
  }

  isSetup(): boolean {
    return this.setupDone();
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  async setup(username: string, password: string): Promise<boolean> {
    if (!this.isAllowedUser(username)) return false;
    const hash = await this.hash(`${username}:${password}`);
    localStorage.setItem('admin_creds', hash);
    this.setupDone.set(true);
    this.authenticated.set(true);
    return true;
  }

  async login(username: string, password: string): Promise<boolean> {
    if (!this.isAllowedUser(username)) return false;
    const stored = localStorage.getItem('admin_creds');
    if (!stored) {
      return false;
    }
    const hash = await this.hash(`${username}:${password}`);
    const ok = stored === hash;
    this.authenticated.set(ok);
    return ok;
  }

  logout(): void {
    this.authenticated.set(false);
    localStorage.removeItem('admin_token');
    this.router.navigateByUrl('/');
  }

  async startEmailLogin(email: string): Promise<{ ok: boolean; code?: string }> {
    const normalized = email.trim().toLowerCase();
    if (!this.isAllowedUser(normalized)) return { ok: false };
    const code = this.generateCode();
    // IMPORTANT: Normalizar siempre antes de hashear para coincidir con verifyEmailCode
    const hash = await this.hash(`${normalized}:${code}`);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const payload = { email: normalized, hash, expiresAt };
    try {
      localStorage.setItem(this.pendingKey, JSON.stringify(payload));
    } catch {}
    return { ok: true, code };
  }
  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    try {
      const raw = localStorage.getItem(this.pendingKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.email || !data.hash || !data.expiresAt) return false;
      if (Date.now() > Number(data.expiresAt)) return false;
      const expectedHash = await this.hash(`${String(email).trim().toLowerCase()}:${String(code).trim()}`);
      const ok = expectedHash === data.hash;
      this.authenticated.set(ok);
      return ok;
    } catch {
      return false;
    }
  }
  clearPending(): void {
    localStorage.removeItem(this.pendingKey);
  }
  getPending(): { email: string; expiresAt: number } | null {
    try {
      const raw = localStorage.getItem(this.pendingKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.email || !data.expiresAt) return null;
      return { email: String(data.email), expiresAt: Number(data.expiresAt) };
    } catch {
      return null;
    }
  }
  getRemainingMs(): number {
    const p = this.getPending();
    if (!p) return 0;
    const left = Number(p.expiresAt) - Date.now();
    return left > 0 ? left : 0;
  }
  generateCode(): string {
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += Math.floor(Math.random() * 10);
    }
    return out;
  }

  setAllowedUsers(users: string[]): void {
    const list = (users || []).map(u => (u || '').trim().toLowerCase()).filter(Boolean).join(',');
    localStorage.setItem(this.allowedUsersKey, list);
  }
  getAllowedUsers(): string[] {
    const raw = localStorage.getItem(this.allowedUsersKey) || '';
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  isAllowedUser(user: string): boolean {
    const u = (user || '').trim().toLowerCase();
    const list = this.getAllowedUsers().map(s => s.toLowerCase());
    return !!u && list.includes(u);
  }

  private async hash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
