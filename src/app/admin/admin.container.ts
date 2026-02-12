import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '@app/shared/components/input.component';
import { ButtonComponent } from '@app/shared/components/button.component';
import { AdminStoreService } from '@app/core/admin/admin-store.service';
import { AdminAuthService } from '@app/core/admin/admin-auth.service';
import { StatCardComponent } from '@app/shared/components/stat-card.component';
import { AnalyticsService } from '@app/core/analytics/analytics.service';
import { WaitlistDataService } from '@app/core/waitlist/waitlist-data.service';
import { SupabaseService } from '@app/core/integrations/supabase.service';

@Component({
  selector: 'app-admin-container',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, StatCardComponent],
  template: `
    <section class="w-full max-w-[1200px] mx-auto">
      <div class="glass p-6 rounded-2xl border border-white/10 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-black monotech uppercase tracking-tighter">Panel Admin</h3>
          <div class="flex items-center gap-3">
            <span class="monotech text-[10px] text-white/40 uppercase">Actualiza métricas visibles</span>
            <app-button variant="outline" size="sm" (action)="logout()">Cerrar sesión</app-button>
          </div>
        </div>

        <div class="glass rounded-xl border border-white/10 bg-black/40 p-4">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div class="p-4"><app-stat-card variant="minimal" label="Total Members" [value]="store.totalMembers()" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Waitlist" [value]="store.waitlistCount()" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Hours Streamed" [value]="store.hoursStreamed()" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Countries" [value]="store.countries()" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Supporters" [value]="store.supporters()" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Insiders" [value]="store.insiders()" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Partners" [value]="store.partners()" /></div>
          </div>
        </div>

        <div class="glass rounded-xl border border-white/10 bg-black/40 p-4 space-y-4">
          <h4 class="monotech text-[12px] uppercase text-white/60">Access Core (Allowlist)</h4>
          <div class="space-y-3 mb-3">
            @for (email of adminList; track $index) {
              <div class="flex gap-2">
                <app-input class="flex-1" icon="mail" [value]="email" (valueChange)="updateAdmin($index, $event)" [placeholder]="'Email ' + ($index + 1) + ' autorizado'" />
                <app-button variant="outline" size="sm" (action)="removeAdmin($index)">X</app-button>
              </div>
            }
          </div>
          <div class="flex gap-3">
            <app-button variant="ghost" size="sm" (action)="addAdmin()">+ Agregar Email</app-button>
            <app-button variant="primary" size="sm" (action)="saveAllowlist()">Guardar acceso</app-button>
          </div>
          @if (sbMessage) {
            <div class="text-[10px] monotech text-white/50">{{ sbMessage }}</div>
          }
        </div>

        <div class="glass rounded-xl border border-white/10 bg-black/40 p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="p-4"><app-stat-card variant="minimal" label="Access Core Clicks" [value]="analytics.getCount('access_core_click')" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Waitlist Submits" [value]="analytics.getCount('waitlist_submit')" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Language Switches" [value]="analytics.getCount('language_switch')" /></div>
            <div class="p-4"><app-stat-card variant="minimal" label="Admin Saves" [value]="analytics.getCount('admin_save')" /></div>
          </div>
        </div>

        <div class="glass rounded-xl border border-white/10 bg-black/40 p-4 space-y-6">
          <div class="flex items-center justify-between">
            <h4 class="monotech text-[12px] uppercase text-white/60">Distribución de Waitlist</h4>
            <app-button variant="outline" size="sm" (action)="exportCSV()">Exportar CSV</app-button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-3">
              <p class="monotech text-[10px] text-white/40 uppercase">Top Países</p>
              <div class="space-y-2">
                @for (item of waitlist.getCountsBy('country').slice(0,5); track item.label) {
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-white/80">{{ item.label }}</span>
                    <span class="text-white/40">{{ item.count }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="space-y-3">
              <p class="monotech text-[10px] text-white/40 uppercase">Top Géneros</p>
              <div class="space-y-2">
                @for (item of waitlist.getCountsBy('genre').slice(0,5); track item.label) {
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-white/80">{{ item.label }}</span>
                    <span class="text-white/40">{{ item.count }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="glass rounded-xl border border-white/10 bg-black/40 p-4 space-y-4">
          <h4 class="monotech text-[12px] uppercase text-white/60">Integración Supabase</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <app-input
              icon="link"
              [value]="sbUrl"
              (valueChange)="sbUrl = $event"
              placeholder="URL del proyecto Supabase"
            />
            <app-input
              icon="key"
              [value]="sbAnon"
              (valueChange)="sbAnon = $event"
              placeholder="Anon Key (API)"
            />
            <app-input
              icon="table_rows"
              [value]="sbTable"
              (valueChange)="sbTable = $event"
              placeholder="Nombre de la tabla (por ej. waitlist)"
            />
          </div>
          <div class="flex gap-3">
            <app-button variant="primary" size="sm" (action)="saveSupabase()">Guardar Supabase</app-button>
            <app-button variant="outline" size="sm" (action)="testSupabase()">Probar inserción</app-button>
            <app-button variant="ghost" size="sm" (action)="countSupabase()">Contar filas/columnas</app-button>
            <app-button variant="outline" size="sm" (action)="testEmailFunction()">Probar Email (Edge Fn)</app-button>
          </div>
          @if (sbMessage) {
            <div class="text-[10px] monotech text-white/50 break-all">{{ sbMessage }}</div>
          }

          <div class="mt-6 space-y-3">
            <h5 class="monotech text-[12px] uppercase text-white/60">Pasarela de pagos (Payment Links)</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <app-input
                icon="link"
                [value]="payApoyo"
                (valueChange)="payApoyo = $event"
                placeholder="URL pago: Apoyo (Stripe/Mercado Pago)"
              />
              <app-input
                icon="link"
                [value]="payInterno"
                (valueChange)="payInterno = $event"
                placeholder="URL pago: Interno"
              />
              <app-input
                icon="link"
                [value]="paySocio"
                (valueChange)="paySocio = $event"
                placeholder="URL pago: Socio"
              />
            </div>
            <div class="flex gap-3">
              <app-button variant="primary" size="sm" (action)="savePaymentLinks()">Guardar enlaces</app-button>
              <app-button variant="outline" size="sm" (action)="testPaymentLinks()">Probar (abrir en nueva pestaña)</app-button>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <h5 class="monotech text-[12px] uppercase text-white/60">Transferencia bancaria</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-input
                icon="badge"
                [value]="bankAlias"
                (valueChange)="bankAlias = $event"
                placeholder="Alias / Identificador"
              />
              <app-input
                icon="description"
                [value]="bankInfo"
                (valueChange)="bankInfo = $event"
                placeholder="Instrucciones (banco, cuenta, plazo, etc.)"
              />
            </div>
            <div class="flex gap-3">
              <app-button variant="primary" size="sm" (action)="saveBank()">Guardar alias/instrucciones</app-button>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <div class="flex justify-between items-center">
              <h5 class="monotech text-[12px] uppercase text-white/60">Lista de Membresías</h5>
              <app-button variant="ghost" size="sm" (action)="loadMemberships()">Refrescar</app-button>
            </div>
            
            <div class="overflow-x-auto max-h-[300px] border border-white/10 rounded-xl bg-black/20 mb-4">
              <table class="w-full text-left text-[10px] monotech text-white/70">
                <thead class="sticky top-0 bg-black border-b border-white/10 text-white/40">
                  <tr>
                    <th class="p-2">Email</th>
                    <th class="p-2">Nivel</th>
                    <th class="p-2">Estado</th>
                    <th class="p-2">Recibo</th>
                    <th class="p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of membershipsList(); track m.id) {
                    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td class="p-2">{{ m.email }}</td>
                      <td class="p-2">{{ m.level }}</td>
                      <td class="p-2">
                        <span [class.text-green-400]="m.status === 'active'" 
                              [class.text-yellow-400]="m.status === 'pending_verification'"
                              [class.text-red-400]="m.status === 'cancelled' || m.status === 'rejected'">
                          {{ m.status }}
                        </span>
                      </td>
                      <td class="p-2">
                        @if (m.receipt_url) {
                          <a [href]="m.receipt_url" target="_blank" class="text-blue-400 hover:underline">Ver</a>
                        } @else {
                          -
                        }
                      </td>
                      <td class="p-2">
                        <button class="text-white hover:text-[#00e5ff] underline" (click)="selectMembership(m)">Gestionar</button>
                      </td>
                    </tr>
                  }
                  @if (membershipsList().length === 0) {
                    <tr>
                      <td colspan="5" class="p-4 text-center text-white/30">No hay datos cargados (pulsa Refrescar)</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <h5 class="monotech text-[12px] uppercase text-white/60">Gestión de membresías</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <app-input
                icon="mail"
                [value]="memberEmail"
                (valueChange)="memberEmail = $event"
                placeholder="Email del usuario"
              />
              <div class="relative">
                <input type="file" accept="image/*"
                       (change)="onAvatarSelected($event)"
                       class="w-full h-[44px] bg-black/20 border border-white/10 rounded-xl px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm" />
              </div>
              <div class="relative">
                <select
                  [(ngModel)]="memberStatus"
                  class="w-full h-[44px] bg-black/20 border border-white/10 rounded-xl px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                >
                  <option value="pending_verification">pending_verification</option>
                  <option value="active">active</option>
                  <option value="pending">pending</option>
                  <option value="expired">expired</option>
                  <option value="cancelled">cancelled</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <div class="relative">
                <select
                  [(ngModel)]="memberLevel"
                  class="w-full h-[44px] bg-black/20 border border-white/10 rounded-xl px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm"
                >
                  <option value="apoyo">apoyo</option>
                  <option value="interno">interno</option>
                  <option value="socio">socio</option>
                </select>
              </div>
              <app-input
                icon="note"
                [value]="memberNotes"
                (valueChange)="memberNotes = $event"
                placeholder="Notas internas"
              />
            </div>
            <div class="flex gap-3">
              <app-button variant="primary" size="sm" (action)="updateMembership()">Actualizar estado</app-button>
              <app-button variant="outline" size="sm" (action)="sendBenefits()">Enviar beneficios</app-button>
              <app-button variant="outline" size="sm" (action)="uploadAvatarForMember()">Subir avatar</app-button>
              <app-button variant="ghost" size="sm" (action)="checkAvatar()">Comprobar imagen</app-button>
            </div>
            @if (memberMessage) {
              <div class="text-[10px] monotech text-white/50">{{ memberMessage }}</div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Total Members (texto)</p>
            <app-input [value]="store.totalMembers()" (valueChange)="store.setTotalMembers($event)" placeholder="12.5K" />
          </div>
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Waitlist (número)</p>
            <app-input [value]="store.waitlistCount().toString()" (valueChange)="onNumber($event, 'waitlist')" placeholder="842" />
          </div>
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Hours Streamed (texto)</p>
            <app-input [value]="store.hoursStreamed()" (valueChange)="store.setHoursStreamed($event)" placeholder="1.2M" />
          </div>
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Countries (número)</p>
            <app-input [value]="store.countries().toString()" (valueChange)="onNumber($event, 'countries')" placeholder="45" />
          </div>
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Supporters (número)</p>
            <app-input [value]="store.supporters().toString()" (valueChange)="onNumber($event, 'supporters')" placeholder="6200" />
          </div>
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Insiders (número)</p>
            <app-input [value]="store.insiders().toString()" (valueChange)="onNumber($event, 'insiders')" placeholder="4800" />
          </div>
          <div class="space-y-3">
            <p class="monotech text-[10px] text-white/40 uppercase">Partners (número)</p>
            <app-input [value]="store.partners().toString()" (valueChange)="onNumber($event, 'partners')" placeholder="150" />
          </div>
        </div>

        <div class="flex gap-4">
          <app-button variant="primary" size="md" (action)="save()">Guardar</app-button>
          <app-button variant="ghost" size="md" (action)="reset()">Reset</app-button>
        </div>
      </div>
    </section>
  `,
})
export class AdminContainerComponent {
  store: AdminStoreService = inject(AdminStoreService);
  auth: AdminAuthService = inject(AdminAuthService);
  analytics: AnalyticsService = inject(AnalyticsService);
  waitlist: WaitlistDataService = inject(WaitlistDataService);
  supabase: SupabaseService = inject(SupabaseService);
  sbUrl = this.supabase.getUrl();
  sbAnon = this.supabase.getAnonKey();
  sbTable = this.supabase.getTable();
  sbMessage = '';

  // Payment Links config
  payApoyo = this.supabase.getPaymentLink('apoyo');
  payInterno = this.supabase.getPaymentLink('interno');
  paySocio = this.supabase.getPaymentLink('socio');
  bankAlias = this.supabase.getBankAlias();
  bankInfo = this.supabase.getBankInfo();
  adminList = this.auth.getAllowedUsers();

  addAdmin() {
    this.adminList.push('');
  }

  removeAdmin(index: number) {
    this.adminList.splice(index, 1);
  }

  updateAdmin(index: number, value: string) {
    this.adminList[index] = value;
  }

  savePaymentLinks() {
    this.supabase.setPaymentLink('apoyo', this.payApoyo);
    this.supabase.setPaymentLink('interno', this.payInterno);
    this.supabase.setPaymentLink('socio', this.paySocio);
    this.sbMessage = 'Enlaces de pago guardados';
  }
  saveAllowlist() {
    const list = this.adminList.map(v => (v || '').trim()).filter(Boolean);
    inject(AdminAuthService).setAllowedUsers(list);
    this.sbMessage = 'Access Core actualizado';
  }
  testPaymentLinks() {
    const urls = [this.payApoyo, this.payInterno, this.paySocio].filter(Boolean);
    urls.forEach(u => window.open(u, '_blank'));
  }
  saveBank() {
    this.supabase.setBankAlias(this.bankAlias);
    this.supabase.setBankInfo(this.bankInfo);
    this.sbMessage = 'Alias e instrucciones de transferencia guardados';
  }

  onNumber(val: string, field: 'waitlist' | 'countries' | 'supporters' | 'insiders' | 'partners') {
    const n = Number(val.replace(/[^\d.-]/g, ''));
    if (Number.isFinite(n)) {
      switch (field) {
        case 'waitlist':
          this.store.setWaitlistCount(n);
          break;
        case 'countries':
          this.store.setCountries(n);
          break;
        case 'supporters':
          this.store.setSupporters(n);
          break;
        case 'insiders':
          this.store.setInsiders(n);
          break;
        case 'partners':
          this.store.setPartners(n);
          break;
      }
    }
  }

  reset() {
    this.store.reset();
  }

  save() {
    this.store.save();
    this.analytics.track('admin_save');
  }

  logout() {
    this.auth.logout();
  }

  exportCSV() {
    const csv = this.waitlist.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowmix_waitlist_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  saveSupabase() {
    this.supabase.setConfig(this.sbUrl, this.sbAnon);
    this.supabase.setTable(this.sbTable);
    this.sbMessage = this.supabase.isConfigured() ? 'Supabase configurado' : 'Error de configuración';
  }
  async testSupabase() {
    const res = await this.supabase.testInsertDetailed();
    this.sbMessage = res.ok ? 'Inserción OK' : `Error en inserción: ${res.error ?? 'desconocido'}`;
  }
  async testEmailFunction() {
    this.sbMessage = 'Enviando prueba de email...';
    const email = prompt('Ingresa el email para recibir la prueba:', 'test@example.com');
    if (!email) {
      this.sbMessage = 'Prueba cancelada';
      return;
    }
    const res = await this.supabase.sendConfirmationEmail(email);
    this.sbMessage = res.ok 
      ? `Email enviado correctamente a ${email}` 
      : `Error enviando email: ${res.error}`;
  }
  async countSupabase() {
    const res = await this.supabase.getCountsDetailed();
    const rows = res.rows ?? 'N/A';
    const cols = res.cols ?? 'N/A';
    this.sbMessage = res.error ? `Filas: ${rows} | Columnas: ${cols} | Error: ${res.error}` : `Filas: ${rows} | Columnas: ${cols}`;
  }
  avatarUploadFile: File | null = null;
  onAvatarSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.avatarUploadFile = file;
    if (file) this.memberMessage = `Archivo seleccionado: ${file.name}`;
  }
  async uploadAvatarForMember() {
    if (!this.memberEmail) {
      this.memberMessage = 'Ingresa un email válido';
      return;
    }
    if (!this.avatarUploadFile) {
      this.memberMessage = 'Selecciona un archivo de imagen';
      return;
    }
    try {
      const safeEmail = this.memberEmail.replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = this.avatarUploadFile.name.split('.').pop() || 'jpg';
      const fileName = `${safeEmail}_avatar.${ext}`;
      const up = await this.supabase.uploadAvatar(this.avatarUploadFile, fileName);
      if (!up.ok || !up.url) {
        this.memberMessage = `Error subiendo avatar: ${up.error ?? 'desconocido'}`;
        return;
      }
      const prof = await this.supabase.getProfileByEmail(this.memberEmail);
      if (!prof) {
        this.memberMessage = 'Perfil no encontrado';
        return;
      }
      const updated = { ...prof, fotoUrl: up.url };
      const res = await this.supabase.upsertProfileCompat(updated);
      this.memberMessage = res.ok ? 'Avatar subido y perfil actualizado' : `Error actualizando perfil: ${res.error ?? 'desconocido'}`;
    } catch (e: any) {
      this.memberMessage = String(e?.message ?? e);
    }
  }

  memberEmail = '';
  memberStatus: 'active' | 'pending' | 'pending_verification' | 'expired' | 'cancelled' = 'pending_verification';
  memberLevel: 'apoyo' | 'interno' | 'socio' = 'apoyo';
  memberNotes = '';
  memberMessage = '';
  membershipsList = signal<any[]>([]);
  selectedUserId: string | null = null;

  async loadMemberships() {
    const res = await this.supabase.listMemberships();
    if (res.error) {
      console.error('Error cargando membresías:', res.error);
      this.memberMessage = `Error listando: ${res.error}`;
    } else {
      this.membershipsList.set(res.data);
    }
  }

  selectMembership(m: any) {
    this.memberEmail = m.email || '';
    this.selectedUserId = m.user_id || null;
    this.memberStatus = m.status;
    this.memberLevel = m.level;
    this.memberNotes = m.internal_notes || '';
    this.memberMessage = 'Usuario seleccionado';
  }

  async updateMembership() {
    let res: { ok: boolean; error?: string };
    if (this.memberEmail) {
      res = await this.supabase.updateMembershipStatusByEmail(this.memberEmail, this.memberStatus, this.memberNotes);
    } else if (this.selectedUserId) {
      res = await this.supabase.updateMembershipStatusByUserId(this.selectedUserId, this.memberStatus, this.memberNotes);
    } else {
      this.memberMessage = 'Selecciona una membresía desde la lista';
      return;
    }
    this.memberMessage = res.ok ? 'Estado actualizado' : `Error: ${res.error ?? 'desconocido'}`;
    if (res.ok && this.memberStatus === 'active') {
      // Prefer email if disponible; si no, intentar obtener por user_id
      let email = this.memberEmail;
      if (!email && this.selectedUserId) {
        const prof = await this.supabase.getMembershipByUserId(this.selectedUserId);
        // getMembershipByUserId no retorna email; intentar leer perfil
        try {
          const key = this.supabase.getAnonKey() || '';
          const canFetch = key && key.length >= 20;
          if (canFetch) {
            const s = this.supabase as any;
            const client = (s['client'] as any) || null;
            if (client) {
              const { data } = await client.from('profiles').select('email').eq('id', this.selectedUserId).limit(1).maybeSingle();
              email = data?.email;
            }
          }
        } catch { /* ignore */ }
      }
      const mail = email ? await this.supabase.enqueueBenefitsEmail(email, this.memberLevel) : { ok: false, error: 'Email no disponible' };
      if (mail.ok) {
        this.memberMessage = 'Estado actualizado y beneficios encolados';
      } else {
        this.memberMessage = `Estado ok, pero error en email: ${mail.error ?? 'desconocido'}`;
      }
    }
  }
  async sendBenefits() {
    if (!this.memberEmail) {
      this.memberMessage = 'Ingresa un email válido';
      return;
    }
    const res = await this.supabase.enqueueBenefitsEmail(this.memberEmail, this.memberLevel);
    this.memberMessage = res.ok ? 'Beneficios encolados' : `Error: ${res.error ?? 'desconocido'}`;
  }
  async checkAvatar() {
    if (!this.memberEmail) {
      this.memberMessage = 'Ingresa un email válido';
      return;
    }
    const res = await this.supabase.checkAvatarExists(this.memberEmail);
    if (res.exists && res.url) {
      this.memberMessage = `Imagen encontrada (${res.source}): ${res.url}`;
    } else if (res.error) {
      this.memberMessage = `Error comprobando imagen: ${res.error}`;
    } else {
      this.memberMessage = 'Imagen no encontrada para este email';
    }
  }
}
