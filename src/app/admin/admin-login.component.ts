import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '@app/shared/components/input.component';
import { ButtonComponent } from '@app/shared/components/button.component';
import { AdminAuthService } from '@app/core/admin/admin-auth.service';
import { SupabaseService } from '@app/core/integrations/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent],
  template: `
    <section class="w-full max-w-[600px] mx-auto px-6 py-24">
      <div class="glass p-8 rounded-2xl border border-white/10 space-y-8">
        <div class="space-y-2">
          <h3 class="text-2xl font-black monotech uppercase tracking-tighter">
            {{ auth.isSetup() ? 'Acceso Admin' : 'Configurar Admin' }}
          </h3>
          <span class="monotech text-[10px] text-white/40 uppercase">
            {{ auth.isSetup() ? 'Ingresa tus credenciales' : 'Crea usuario y contraseña' }}
          </span>
        </div>

        @if (!auth.isSetup()) {
          <div class="space-y-6">
            <app-input
              icon="person"
              [type]="setupUserType"
              placeholder="Nombre de usuario"
              [value]="setupUser"
              (valueChange)="setupUser = $event"
            />
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-[10px] monotech text-white/40">
                <input type="checkbox" [checked]="rememberUser" (change)="onRememberChange($event)" />
                Recordar usuario
              </label>
              <app-button variant="ghost" size="sm" (action)="toggleSetupUserType()">
                {{ setupUserType === 'text' ? 'Ocultar' : 'Mostrar' }}
              </app-button>
            </div>
            <app-input
              icon="lock"
              type="password"
              [reveal]="true"
              placeholder="Contraseña"
              [value]="setupPass"
              (valueChange)="setupPass = $event"
            />
            <app-button variant="primary" size="lg" [fullWidth]="true" (action)="onSetup()">
              Configurar
            </app-button>
            @if (message) {
              <div class="text-xs monotech text-white/50">{{ message }}</div>
            }
          </div>
        } @else {
          <div class="space-y-6">
            <!-- STEP 1: EMAIL -->
            @if (step === 'email') {
              <div class="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                <app-input
                  icon="mail"
                  placeholder="Correo autorizado"
                  [value]="email"
                  (valueChange)="email = $event"
                  (keyup.enter)="onSendCode()"
                  [showError]="emailError"
                />
                
                <app-button 
                  variant="primary" 
                  size="lg" 
                  [fullWidth]="true" 
                  [disabled]="isLoading"
                  (action)="onSendCode()"
                >
                  {{ isLoading ? 'Enviando...' : 'Enviar Código' }}
                </app-button>
                
                <div class="text-center">
                  <span class="text-[10px] monotech text-white/40">Se enviará un código de verificación</span>
                </div>
              </div>
            }

            <!-- STEP 2: CODE -->
            @if (step === 'code') {
              <div class="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <!-- Email display / Back button -->
                <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-white/40 text-sm">mail</span>
                    <span class="text-sm text-white/80 font-mono">{{ email }}</span>
                  </div>
                  <button (click)="resetToEmail()" class="text-[10px] monotech text-primary hover:underline hover:text-primary/80 transition-colors">
                    CAMBIAR EMAIL
                  </button>
                </div>

                <app-input
                  icon="confirmation_number"
                  placeholder="Código de acceso"
                  [value]="code"
                  (valueChange)="code = $event"
                  [autoFocus]="true"
                  (keyup.enter)="onVerifyCode()"
                  [showError]="codeError"
                />

                <div class="w-full h-2 rounded-lg bg-white/10 overflow-hidden">
                  <div class="h-2 transition-[width] duration-300" [ngClass]="barClass" [style.width.%]="progressPercent"></div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[10px] monotech text-white/40">Expira en {{ countdown }}</span>
                  <app-button variant="ghost" size="sm" (action)="onSendCode()" [disabled]="isLoading">
                    REENVIAR CÓDIGO
                  </app-button>
                </div>

                <app-button 
                  variant="primary" 
                  size="lg" 
                  [disabled]="expired || isLoading" 
                  [fullWidth]="true" 
                  (action)="onVerifyCode()"
                >
                  {{ isLoading ? 'Verificando...' : 'Acceder' }}
                </app-button>
              </div>
            }

            @if (message) {
              <div class="text-xs monotech text-partner/80 text-center animate-in fade-in zoom-in duration-200">{{ message }}</div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService);

  setupUser = '';
  setupPass = '';
  email = '';
  code = '';
  message = '';
  rememberUser = true;
  setupUserType: 'text' | 'password' = 'text';
  countdown = '';
  expired = false;
  private timer: any = null;
  private readonly totalMs = 10 * 60 * 1000;
  progressPercent = 0;
  barClass = 'bg-green-500';

  step: 'email' | 'code' = 'email';

  ngOnInit() {
    const rem = localStorage.getItem('admin_remember');
    this.rememberUser = rem !== '0';
    if (this.rememberUser) {
      const saved = localStorage.getItem('admin_user') || '';
      this.email = saved;
      if (!this.auth.isSetup()) {
        this.setupUser = saved;
      }
    }
    
    // Check pending but don't auto-switch if expired
    // MODIFICADO: No auto-cambiar a 'code' para que el usuario siempre vea el botón de enviar primero
    const pending = this.auth.getPending();
    if (pending && pending.email) {
      this.email = pending.email;
      // No cambiamos step a 'code' automáticamente
      // this.step = 'code'; 
      // this.setupCountdown(pending.expiresAt);
    }
  }

  resetToEmail() {
    this.step = 'email';
    this.auth.clearPending();
    this.message = '';
    this.code = '';
    this.codeError = false;
    this.emailError = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async onSetup() {
    if (!this.setupUser || !this.setupPass) {
      this.message = 'Completa usuario y contraseña';
      return;
    }
    if (!this.auth.isAllowedUser(this.setupUser)) {
      this.message = 'Usuario no autorizado';
      return;
    }
    const ok = await this.auth.setup(this.setupUser, this.setupPass);
    if (ok) {
      this.message = 'Configuración exitosa';
      localStorage.setItem('admin_token', 'flowmix-admin');
      localStorage.setItem('admin_user', this.setupUser); // Siempre guardar para el guardia
      
      if (this.rememberUser) {
        localStorage.setItem('admin_remember', '1');
      } else {
        localStorage.setItem('admin_remember', '0');
      }
      this.router.navigateByUrl('/admin');
    }
  }

  emailError = false;
  codeError = false;

  async onSendCode() {
    this.message = '';
    this.emailError = false;
    const email = (this.email || '').trim().toLowerCase();
    if (!email) {
      this.emailError = true;
      this.message = 'Completa el correo';
      return;
    }
    if (!this.auth.isAllowedUser(email)) {
      this.emailError = true;
      this.message = 'Usuario no autorizado';
      return;
    }

    this.isLoading = true;
    try {
      const start = await this.auth.startEmailLogin(email);
      if (!start.ok || !start.code) {
        this.message = 'No se pudo iniciar el login';
        return;
      }
      const { ok, error } = await this.supabase.sendLoginCode(email, start.code);
      if (!ok) {
        this.message = error || 'Error al enviar el código';
        return;
      }
      this.message = ''; // Limpiar mensaje de error si había
      this.step = 'code'; // AVANZAR AL SIGUIENTE PASO
      this.code = ''; // Asegurar que el campo de código esté limpio
      this.codeError = false;
      const pending = this.auth.getPending();
      if (pending) this.setupCountdown(pending.expiresAt);
    } finally {
      this.isLoading = false;
    }
  }
  isLoading = false;

  async onVerifyCode() {
    this.message = '';
    this.emailError = false;
    this.codeError = false;
    const email = (this.email || '').trim().toLowerCase();
    const code = (this.code || '').trim();
    
    if (!email) this.emailError = true;
    if (!code) this.codeError = true;
    
    if (!email || !code) {
      this.message = 'Completa correo y código';
      return;
    }
    
    this.isLoading = true;
    try {
      const ok = await this.auth.verifyEmailCode(email, code);
      if (ok) {
        this.message = 'Acceso concedido';
        localStorage.setItem('admin_token', 'flowmix-admin');
        localStorage.setItem('admin_user', email.trim().toLowerCase()); // Siempre guardar para el guardia

        if (this.rememberUser) {
          localStorage.setItem('admin_remember', '1');
        } else {
          localStorage.setItem('admin_remember', '0');
        }
        this.auth.clearPending();
        
        // Asegurar que el usuario esté en la lista permitida del localStorage para el Guard
        const currentAllowed = localStorage.getItem('admin_allowed_users');
        if (!currentAllowed || !currentAllowed.includes(email)) {
           const list = this.auth.getAllowedUsers();
           if (!list.includes(email)) list.push(email);
           this.auth.setAllowedUsers(list);
        }

        // Intentar navegar
        // HACK: Pequeño delay para asegurar que el guard lea los valores actualizados
        setTimeout(async () => {
          const nav = await this.router.navigateByUrl('/admin');
          if (!nav) {
            console.warn('Router navigation failed, forcing reload');
            window.location.href = '/admin';
          }
        }, 100);
      } else {
        this.codeError = true;
        this.message = 'Código inválido o expirado';
      }
    } catch (e: any) {
      console.error('Error verifying code:', e);
      this.message = 'Error interno al verificar';
    } finally {
      this.isLoading = false;
    }
  }

  onRememberChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.rememberUser = target.checked;
  }

  toggleSetupUserType() {
    this.setupUserType = this.setupUserType === 'text' ? 'password' : 'text';
  }
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  private setupCountdown(expiresAt: number) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const tick = () => {
      const leftMs = this.auth.getRemainingMs();
      this.expired = leftMs <= 0;
      const total = Math.max(0, Math.floor(leftMs / 1000));
      const m = Math.floor(total / 60);
      const s = total % 60;
      const ss = s < 10 ? `0${s}` : `${s}`;
      this.countdown = `${m}:${ss}`;
      const pct = Math.max(0, Math.min(100, Math.floor((leftMs / this.totalMs) * 100)));
      this.progressPercent = pct;
      if (leftMs <= 30_000) {
        this.barClass = 'bg-red-500';
      } else if (leftMs <= 120_000) {
        this.barClass = 'bg-yellow-500';
      } else {
        this.barClass = 'bg-green-500';
      }
      if (this.expired && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
    tick();
    this.timer = setInterval(tick, 1000);
  }
}
