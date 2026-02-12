import { Component, inject, OnInit, OnDestroy, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/integrations/supabase.service';
import { Membership } from '../../../core/domain/models/membership.model';
import { ButtonComponent } from '../../../shared/components/button.component';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="min-h-screen bg-black text-white pt-12 pb-12 px-4 flex flex-col items-center">
      
      <!-- Brand Logo (Standalone Header) -->
      <div class="mb-12 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" (click)="goHome()">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1">graphic_eq</span>
          <span class="text-2xl font-bold tracking-tighter monotech italic">FLOWMIX</span>
        </div>
        <div class="h-px w-12 bg-primary/30"></div>
      </div>

      <!-- Main Card -->
      <div class="w-full max-w-[800px] glass p-8 md:p-12 rounded-2xl border border-white/10 relative overflow-hidden">
        
        <!-- Background Blur Blob -->
        <div class="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div #confettiOverlay class="absolute inset-0 pointer-events-none"></div>

        <!-- Header -->
        <div class="mb-10 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-2 monotech tracking-tight">Estado de Solicitud</h2>
          <p class="text-white/60 text-sm md:text-base font-mono">
            ID: <span class="text-white/90">{{ membershipId() }}</span>
          </p>
        </div>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p class="text-white/50 animate-pulse">Consultando sistema...</p>
          </div>
        } @else if (error()) {
          <div class="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <span class="material-symbols-outlined text-red-400 text-4xl mb-2">error_outline</span>
            <p class="text-red-200">{{ error() }}</p>
            <app-button class="mt-4" variant="outline" (action)="loadMembership()">Reintentar</app-button>
          </div>
        } @else {
          
          <!-- Stepper Vertical -->
          <div class="relative pl-4 md:pl-0">
            <!-- Connecting Line -->
            <div class="absolute left-[27px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-primary/50 to-white/10 md:hidden"></div>

            <div class="space-y-12">
              
              <!-- STEP 1: Aporte Recibido -->
              <div class="flex gap-6 relative">
                 <div class="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-black/50 border-2 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                    <span class="material-symbols-outlined text-primary text-2xl">check</span>
                 </div>
                 <div class="pt-2">
                    <h3 class="text-xl font-bold text-white mb-1">Aporte Recibido</h3>
                    <p class="text-white/60 text-sm leading-relaxed">
                      Tu contribución está registrada en nuestro sistema y asegurada.
                    </p>
                    <div class="mt-2 text-xs text-primary/80 font-mono bg-primary/10 inline-block px-2 py-1 rounded">
                      Completado
                    </div>
                 </div>
              </div>

              <!-- STEP 2: Verificación -->
              <div class="flex gap-6 relative" [class.opacity-50]="step() < 2">
                 <div class="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-black/50 border-2 flex items-center justify-center transition-all duration-500"
                      [class.border-primary]="step() >= 2"
                      [class.border-white-10]="step() < 2"
                      [class.shadow-glow]="step() === 2">
                    @if (step() > 2) {
                      <span class="material-symbols-outlined text-primary text-2xl">check</span>
                    } @else if (step() === 2) {
                      <span class="material-symbols-outlined text-primary text-2xl animate-pulse">manage_search</span>
                    } @else {
                      <span class="text-white/20 font-bold">2</span>
                    }
                 </div>
                 <div class="pt-2">
                    <h3 class="text-xl font-bold mb-1" [class.text-white]="step() >= 2" [class.text-white-40]="step() < 2">
                      Verificación de Comunidad
                    </h3>
                    <p class="text-sm leading-relaxed" [class.text-white-60]="step() >= 2" [class.text-white-30]="step() < 2">
                      Un mantenedor está validando el aporte para asegurar la sostenibilidad del proyecto.
                    </p>
                    @if (step() === 2) {
                      <div class="mt-3 flex items-center gap-2 text-yellow-500/80 text-xs font-mono bg-yellow-500/10 px-3 py-1 rounded w-fit">
                        <div class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                        En Progreso...
                      </div>
                    }
                 </div>
              </div>

              <!-- STEP 3: Activación -->
              <div class="flex gap-6 relative" [class.opacity-50]="step() < 3">
                 <div class="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-black/50 border-2 flex items-center justify-center transition-all duration-500"
                      [class.border-green-500]="step() === 3"
                      [class.border-white-10]="step() < 3"
                      [class.shadow-[0_0_30px_rgba(34,197,94,0.4)]]="step() === 3">
                    @if (step() === 3) {
                      <span class="material-symbols-outlined text-green-500 text-2xl">verified</span>
                    } @else {
                      <span class="text-white/20 font-bold">3</span>
                    }
                 </div>
                 <div class="pt-2">
                    <h3 class="text-xl font-bold mb-1" [class.text-white]="step() === 3" [class.text-white-40]="step() < 3">
                      Activación
                    </h3>
                    <p class="text-sm leading-relaxed" [class.text-white-60]="step() === 3" [class.text-white-30]="step() < 3">
                      ¡Listo! Tu membresía está activa. Gracias por apoyar el proyecto.
                    </p>

                    @if (step() === 3) {
                      <div class="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div class="text-sm text-white/60">Disfruta de tus beneficios de miembro.</div>
                        <div class="mt-6 glass p-4 rounded-lg border border-white/10 bg-white/5">
                          <div class="text-xs font-mono text-white/60 uppercase tracking-widest mb-2">Beneficios</div>
                          <ul class="space-y-2">
                            @for (b of benefits(); track b) {
                              <li class="flex items-center gap-2 text-white/80 text-sm">
                                <span class="material-symbols-outlined text-primary text-base">check_circle</span>
                                {{ b }}
                              </li>
                            }
                          </ul>
                          <div class="mt-4">
                            <app-button variant="primary" size="md" icon="group" (action)="joinWhatsapp()" [disabled]="!whatsappLink()">
                              Unirme al grupo de WhatsApp
                            </app-button>
                          </div>
                        </div>
                      </div>
                    }
                 </div>
              </div>

            </div>
          </div>
        }
      </div>

      <!-- Footer Help -->
      <div class="mt-8 text-center text-white/30 text-xs">
        <p>¿Tienes problemas? Escribe a soporte&#64;softwarelibredj.org</p>
        <p class="mt-1 font-mono text-[10px] opacity-50">SECURE_TRACK_ID: {{ membershipId() }}</p>
      </div>

    </div>
  `,
  styles: [`
    .shadow-glow { box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.4); }
  `]
})
export class PaymentStatusComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  @ViewChild('confettiOverlay', { static: false }) confettiOverlay?: ElementRef<HTMLDivElement>;

  membershipId = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // 1 = Recibido, 2 = Validando, 3 = Activo
  step = signal<number>(1);

  status = signal<string>('');
  level = signal<'apoyo' | 'interno' | 'socio' | ''>('');

  private realtimeSubscription: any = null;
  private pollingInterval: any = null;
  private confettiPlayed = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.membershipId.set(id);
        this.loadMembership();
        this.subscribeToUpdates();
        this.startPollingFallback();
      } else {
        this.loading.set(false);
        this.error.set('ID de seguimiento inválido');
      }
    });
  }

  ngOnDestroy() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  async loadMembership() {
    this.loading.set(true);
    this.error.set(null);

    const id = this.membershipId();
    const membership = await this.supabase.getMembershipById(id);

    if (membership) {
      console.log('✅ Membership data loaded. Status:', membership.status, '| UUID:', membership.id);
      this.updateState(membership.status);
      if (membership.level) this.level.set((membership.level as any) || '');
      
      // If we have a UUID and we haven't resubscribed yet, do it now for better reliability
      if (membership.id && !this.realtimeSubscription?.topic?.includes(membership.id)) {
        console.log('🔄 Re-subscribing using UUID for stability...');
        if (this.realtimeSubscription) {
          this.realtimeSubscription.unsubscribe();
        }
        this.subscribeToUpdates(membership.id);
      }
    } else {
      this.error.set('No encontramos una solicitud con ese ID.');
    }
    this.loading.set(false);
  }

  subscribeToUpdates(overrideId?: string) {
    const id = overrideId || this.membershipId();
    console.log('🔄 Attempting real-time subscription for:', id);

    this.realtimeSubscription = this.supabase.subscribeToMembership(id, (payload) => {
      console.log('⚡ [REALTIME] Event:', payload.eventType, '| Data:', payload.new);
      if (payload.new && payload.new.status) {
        console.log('✅ [REALTIME] Status changed to:', payload.new.status);
        this.updateState(payload.new.status);
      }
    });

    if (this.realtimeSubscription) {
      setTimeout(() => {
        const state = this.realtimeSubscription?.state;
        console.log(`📡 [REALTIME] Subscription state for ${id}:`, state);
        if (state !== 'joined') {
          console.warn('⚠️ [REALTIME] Not joined yet. Polling will handle updates if it stays this way.');
        }
      }, 2500);
    }
  }

  startPollingFallback() {
    // Poll every 20 seconds as a safety net
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    
    this.pollingInterval = setInterval(() => {
      console.log('🔍 [POLLING] Checking status fallback...');
      this.loadMembership();
    }, 20000);
  }

  updateState(status: string) {
    const normalizedStatus = status.toLowerCase();
    console.log('🛠 Processing status update:', normalizedStatus);
    this.status.set(normalizedStatus);

    if (normalizedStatus === 'active') {
      console.log('🎉 Status is ACTIVE. Moving to Step 3.');
      this.step.set(3);
      if (!this.confettiPlayed) {
        this.confettiPlayed = true;
        setTimeout(() => this.fireConfetti(), 150);
      }
    } else if (normalizedStatus === 'pending_verification' || normalizedStatus === 'pending') {
      console.log('⏳ Status is PENDING. Moving to Step 2.');
      this.step.set(2);
    } else if (normalizedStatus === 'rejected' || normalizedStatus === 'cancelled') {
      console.log('❌ Status is REJECTED/CANCELLED.');
      this.error.set('Esta solicitud ha sido rechazada o cancelada. Revisa tu correo.');
    } else {
      console.log('❓ Status unrecognized or initial. Moving to Step 1.');
      this.step.set(1);
    }
  }

  private fireConfetti() {
    const host = this.confettiOverlay?.nativeElement;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.width = host.clientWidth;
    canvas.height = host.clientHeight;
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { host.removeChild(canvas); return; }
    const colors = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a78bfa','#14b8a6'];
    const parts: any[] = [];
    const count = Math.min(180, Math.floor((canvas.width * canvas.height) / 8000));
    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 40,
        vx: -1 + Math.random() * 2,
        vy: 2 + Math.random() * 3,
        size: 6 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vr: (-0.1 + Math.random() * 0.2),
        alpha: 1,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.5 ? 'rect' : 'tri'
      });
    }
    let start: number | null = null;
    const duration = 1800;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rot += p.vr;
        p.alpha = Math.max(0, 1 - elapsed / duration);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.7);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size/2);
          ctx.lineTo(p.size/2, p.size/2);
          ctx.lineTo(-p.size/2, p.size/2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        host.removeChild(canvas);
      }
    };
    requestAnimationFrame(tick);
  }

  benefits(): string[] {
    const l = this.level();
    if (l === 'apoyo') {
      return ['Acceso a builds estables','Soporte básico por email','Reconocimiento en la comunidad'];
    }
    if (l === 'interno') {
      return ['Acceso a builds anticipadas (Beta)','Soporte prioritario','Canal de feedback directo'];
    }
    if (l === 'socio') {
      return ['Acceso Total (Full Suite)','Soporte 1‑a‑1','Acceso preferencial a novedades'];
    }
    return ['Beneficios de miembro'];
  }
  whatsappLink(): string {
    const l = this.level();
    if (l === 'apoyo') return 'https://chat.whatsapp.com/supporters';
    if (l === 'interno') return 'https://chat.whatsapp.com/internos';
    if (l === 'socio') return 'https://chat.whatsapp.com/socios';
    return '';
  }
  joinWhatsapp() {
    const url = this.whatsappLink();
    if (!url) return;
    window.open(url, '_blank');
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
