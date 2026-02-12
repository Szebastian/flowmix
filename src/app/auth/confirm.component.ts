import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@app/shared/components/button.component';
import { SupabaseService } from '@app/core/integrations/supabase.service';
import { I18nService } from '@app/core/i18n/i18n-service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <section class="min-h-screen w-full flex items-center justify-center px-6 py-12 relative">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/10 blur-[160px] rounded-full"></div>
      </div>
      <div class="w-full max-w-lg mx-auto text-center space-y-8 relative z-10">
        <div class="flex items-center justify-center gap-3">
          <span class="material-symbols-outlined text-primary text-4xl">graphic_eq</span>
          <span class="text-3xl font-black tracking-tighter monotech italic uppercase">FLOWMIX</span>
        </div>
        <div class="glass rounded-3xl p-8 border border-primary/20 space-y-4">
          @if (status() === 'ok') {
            <div class="flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-5xl">verified</span>
            </div>
            <h1 class="text-2xl font-black monotech uppercase tracking-tighter">{{ title() }}</h1>
            <p class="text-white/90 font-semibold">{{ thanks() }}</p>
            <p class="text-white/70">{{ welcomeText() }}</p>
            <div class="flex items-center justify-center gap-3 pt-2">
              <app-button variant="primary" size="md" (action)="goHome()">{{ goHomeLabel() }}</app-button>
              <app-button variant="secondary" size="md" (action)="goFeedback()">{{ goFeedbackLabel() }}</app-button>
            </div>
          } @else if (status() === 'pending') {
            <div class="flex items-center justify-center">
              <span class="material-symbols-outlined text-[44px] text-white/70 animate-pulse">sync</span>
            </div>
            <h1 class="text-2xl font-black monotech uppercase tracking-tighter">{{ verifying() }}</h1>
            <p class="text-white/70">{{ verifyingHint() }}</p>
          } @else {
            <div class="flex items-center justify-center">
              <span class="material-symbols-outlined text-partner text-5xl">error</span>
            </div>
            <h1 class="text-2xl font-black monotech uppercase tracking-tighter">{{ errorTitle() }}</h1>
            <p class="text-red-400">{{ errorMessage() }}</p>
            <div class="flex items-center justify-center gap-3 pt-2">
              <app-button variant="primary" size="md" (action)="goHome()">{{ goHomeLabel() }}</app-button>
              <app-button variant="secondary" size="md" (action)="resend()">{{ resendLabel() }}</app-button>
            </div>
            @if (resentMessage()) {
              <p class="text-white/60 text-xs">{{ resentMessage() }}</p>
            }
          }
        </div>
      </div>
    </section>
  `
})
export class ConfirmComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly supabase = inject(SupabaseService);
  private readonly i18n = inject(I18nService);
  status = signal<'pending' | 'ok' | 'error'>('pending');
  errorMessage = signal<string>('');
  resentMessage = signal<string>('');
  title = () => this.i18n.get('CONFIRM_TITLE');
  verifying = () => this.i18n.get('CONFIRM_VERIFYING');
  verifyingHint = () => this.i18n.get('CONFIRM_VERIFYING_HINT');
  errorTitle = () => this.i18n.get('CONFIRM_ERROR');
  thanks = () => this.i18n.get('CONFIRM_THANKS');
  welcomeText = () => this.i18n.get('CONFIRM_WELCOME_TEXT');
  goHomeLabel = () => this.i18n.get('GO_HOME');
  resendLabel = () => this.i18n.get('CONFIRM_RESEND');
  goFeedbackLabel = () => this.i18n.get('CONFIRM_GO_FEEDBACK');
  
  async ngOnInit(): Promise<void> {
    const qp = this.route.snapshot.queryParamMap;
    const tokenHash = qp.get('token_hash') || '';
    const type = (qp.get('type') as 'signup' | 'magiclink') || 'signup';
    let email = qp.get('email') || this.supabase.getLastEmail() || '';

    const hash = window.location.hash || '';
    const hasAccessToken = hash.includes('access_token=');
    if (hasAccessToken) {
      this.status.set('ok');
      return;
    }

    if (!tokenHash || !email) {
      this.status.set('error');
      this.errorMessage.set('Enlace inválido o incompleto.');
      return;
    }
    const res = await this.supabase.verifyEmail(tokenHash, email, type);
    if (res.ok) {
      this.status.set('ok');
    } else {
      this.status.set('error');
      this.errorMessage.set(res.error || 'No se pudo verificar el correo.');
    }
  }
  goHome(): void {
    this.router.navigateByUrl('/');
  }
  goFeedback(): void {
    this.router.navigateByUrl('/feedback');
  }
  async resend(): Promise<void> {
    const email = this.supabase.getLastEmail();
    if (!email) {
      this.resentMessage.set(this.i18n.get('CONFIRM_RESEND_ERROR'));
      return;
    }
    const res = await this.supabase.sendConfirmationEmail(email);
    if (res.ok) {
      this.resentMessage.set(this.i18n.get('CONFIRM_RESENT'));
    } else {
      this.resentMessage.set(res.error || this.i18n.get('CONFIRM_RESEND_ERROR'));
    }
  }
}
