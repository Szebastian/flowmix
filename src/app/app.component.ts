import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from './core/i18n/i18n-service';
import { StatusBarComponent } from './shared/components/status-bar.component';
import { NavbarComponent } from './shared/components/navbar.component';
import { FooterComponent } from './shared/components/footer.component';
import { ButtonComponent } from './shared/components/button.component';
import { StatCardComponent } from './shared/components/stat-card.component';
import { WaitlistContainerComponent } from './features/waitlist/waitlist.container';
import { HallOfFameContainerComponent } from './features/hall-of-fame/hall-of-fame.container';
import { AdminStoreService } from './core/admin/admin-store.service';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    StatusBarComponent,
    NavbarComponent,
    FooterComponent,
    WaitlistContainerComponent,
    HallOfFameContainerComponent,
    ButtonComponent,
    StatCardComponent,
    RouterOutlet
  ],
  template: `
    <!-- GLOBAL PRELOADER OVERLAY -->
    @if (isLoading()) {
      <div class="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500"
           [class.opacity-0]="isFadingOut()">
        
        <div class="flex flex-col items-center gap-8 w-full max-w-md px-8">
           <!-- Logo Icon Pulse -->
           <span class="material-symbols-outlined text-primary text-6xl lg:text-8xl animate-pulse" 
                 style="font-variation-settings: 'FILL' 1">graphic_eq</span>
           
           <!-- Percentage -->
           <h1 class="text-6xl md:text-8xl font-black monotech text-white tabular-nums tracking-tighter">
             {{ loadingProgress() }}%
           </h1>

           <!-- Progress Bar -->
           <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
             <div class="absolute inset-y-0 left-0 bg-primary transition-all duration-100 ease-out"
                  [style.width.%]="loadingProgress()"></div>
           </div>

           <!-- Status Text -->
           <div class="flex items-center gap-3">
             <span class="w-2 h-2 bg-primary rounded-full animate-ping"></span>
             <span class="monotech text-xs md:text-sm text-white/60 tracking-[0.2em] uppercase">
               {{ loadingText() }}
             </span>
           </div>
        </div>
      </div>
    }

    <div class="dark bg-[#050505] font-display text-white selection:bg-primary selection:text-black min-h-screen audio-grid overflow-x-hidden"
         [class.hidden]="isLoading() && !isFadingOut()"> <!-- Hide content until fading starts to prevent FOUC completely -->
      @if (!isIsolatedRoute()) {
        <app-status-bar />
        <app-navbar />
      }

      <router-outlet></router-outlet>

      @if (!isAdminOrConfirmRoute() && !isFeedbackRoute() && !isAboutRoute() && !isMembershipRoute()) {
      <main class="w-full mx-auto px-4 md:px-6 lg:px-12 pt-0 pb-12 space-y-24 lg:space-y-48 relative">
        <!-- AMBIENT BACKGROUND -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

        <!-- HERO SECTION & WAITLIST -->
        <div class="w-full max-w-[1440px] mx-auto -mt-6 lg:-mt-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start">
            <header class="text-center lg:text-left space-y-4 lg:space-y-6 flex flex-col justify-center relative z-10">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 w-fit mx-auto lg:mx-0 backdrop-blur-md">
                <span class="material-symbols-outlined text-[14px] text-primary">shutter_speed</span>
                <span class="monotech text-[10px] text-primary uppercase tracking-[0.3em] font-bold"
                  >{{ priorityLabel() }}</span
                >
              </div>
              <h1 class="text-4xl md:text-5xl lg:text-[5vw] font-black tracking-tight uppercase leading-tight pb-4 pr-4">
                {{ beyondLabel() }} <br />
                <span class="bg-gradient-to-r from-primary via-insider to-secondary bg-clip-text text-transparent italic pr-8 pb-1 inline-block">
                  {{ audioLabel() }}
                </span>
                @if (engineLabel()) {
                  <br />
                  {{ engineLabel() }}
                }
              </h1>
              <p class="max-w-2xl lg:mx-0 mx-auto text-white/40 text-sm md:text-lg 2xl:text-xl monotech leading-relaxed uppercase tracking-wide px-2 lg:px-0">
                {{ nextGenLabel() }}
              </p>
            </header>

            <div class="w-full flex justify-center lg:justify-end relative z-10">
              <app-waitlist-container class="w-full" [membershipTier]="selectedMembership()" [startAtPayment]="startAtPayment()" />
            </div>
          </div>
        </div>

        <!-- STATS SECTION -->
        <div class="w-full max-w-[1800px] mx-auto mb-12 lg:mb-28">
           <div class="glass rounded-2xl border border-white/5 bg-black/60 backdrop-blur-xl overflow-hidden">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-0 md:gap-0 divide-x divide-y md:divide-y-0 divide-white/5">
              <div class="p-6 lg:p-10 flex items-center justify-center hover:bg-white/5 transition-colors group">
                <app-stat-card variant="minimal" label="Total Members" [value]="admin.totalMembers()" description="+120 this week" />
              </div>
              <div class="p-6 lg:p-10 flex items-center justify-center hover:bg-white/5 transition-colors group">
                <app-stat-card variant="minimal" label="Waitlist" [value]="admin.waitlistCount()" description="High demand" />
              </div>
              <div class="p-6 lg:p-10 flex items-center justify-center hover:bg-white/5 transition-colors group">
                <app-stat-card variant="minimal" label="Hours Streamed" [value]="admin.hoursStreamed()" description="Global uptime" />
              </div>
              <div class="p-6 lg:p-10 flex items-center justify-center hover:bg-white/5 transition-colors group">
                <app-stat-card variant="minimal" label="Countries" [value]="admin.countries()" description="Worldwide reach" />
              </div>
            </div>
          </div>
        </div>

        <!-- PROBLEM / SOLUTION -->
        <section class="w-full max-w-[1440px] mx-auto px-0 md:px-6 lg:px-12 py-8 lg:py-24">
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-stretch">
                 <!-- Problem -->
                 <div class="space-y-4 lg:space-y-6 glass p-6 lg:p-12 rounded-[1.5rem] lg:rounded-[2rem] border border-partner/20 bg-partner/5 hover:bg-partner/10 transition-colors">
                     <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-partner/20 flex items-center justify-center mb-2 lg:mb-4">
                        <span class="material-symbols-outlined text-partner text-xl lg:text-2xl">lock</span>
                     </div>
                     <h2 class="text-2xl lg:text-3xl font-black monotech uppercase tracking-tighter text-partner">
                         {{ problemTitle() }} <br>
                         <span class="text-white/40 text-lg lg:text-xl">{{ problemSubtitle() }}</span>
                     </h2>
                     <p class="text-white/80 leading-relaxed text-base lg:text-lg">{{ problemDesc() }}</p>
                 </div>
                 <!-- Solution -->
                 <div class="space-y-4 lg:space-y-6 text-right glass p-6 lg:p-12 rounded-[1.5rem] lg:rounded-[2rem] border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-end">
                     <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 lg:mb-4">
                        <span class="material-symbols-outlined text-primary text-xl lg:text-2xl">lock_open</span>
                     </div>
                     <h2 class="text-2xl lg:text-3xl font-black monotech uppercase tracking-tighter text-primary">
                         {{ solutionTitle() }} <br>
                         <span class="text-white/40 text-lg lg:text-xl">{{ solutionSubtitle() }}</span>
                     </h2>
                     <p class="text-white/80 leading-relaxed text-base lg:text-lg">{{ solutionDesc() }}</p>
                 </div>
             </div>
        </section>

        <!-- PHILOSOPHY / ABOUT REMOVED -->

        @defer (on viewport) {
          <app-hall-of-fame-container />
        } @placeholder {
          <div class="w-full h-[500px] flex items-center justify-center">
             <span class="text-white/20 monotech animate-pulse">LOADING HALL OF FAME...</span>
          </div>
        }
        <!-- MEMBERSHIP TIERS SECTION -->
        <section class="space-y-12 lg:space-y-24 pb-12 lg:pb-24" id="memberships">
          <div class="text-center space-y-4 lg:space-y-6">
            <h2 class="text-3xl md:text-4xl lg:text-6xl font-black monotech uppercase tracking-tighter text-white">
              {{ membershipLabel() }}
            </h2>
            <div class="w-20 lg:w-32 h-1 bg-primary mx-auto"></div>
          </div>
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <!-- SUPPORTER TIER -->
            <div class="glass p-6 lg:p-8 rounded-[2rem] border-supporter/20 flex flex-col group hover:bg-supporter/5 transition-all">
              <div class="flex justify-between items-start mb-6 lg:mb-8">
                <span class="material-symbols-outlined text-supporter text-3xl lg:text-4xl">volunteer_activism</span>
                <span class="monotech text-[10px] text-supporter font-bold uppercase border border-supporter/30 px-3 py-1 rounded-full">{{ level01Label() }}</span>
              </div>
              <h3 class="text-xl lg:text-2xl font-black monotech uppercase mb-6 lg:mb-8">{{ supporterTierLabel() }}</h3>

              <ul class="space-y-3 lg:space-y-4 text-white/70 mb-6 lg:mb-8 text-sm lg:text-base">
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-supporter shrink-0">check</span>
                  <span>{{ supporterBenefit1() }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-supporter shrink-0">check</span>
                  <span>{{ supporterBenefit2() }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-supporter shrink-0">check</span>
                  <span>{{ supporterBenefit3() }}</span>
                </li>
              </ul>

              <app-button variant="supporter" [fullWidth]="true" size="lg" (action)="goToMembership('apoyo')">
                <div class="flex flex-col items-center gap-1">
                  <span>{{ upgradeNowLabel() }}</span>
                  <span class="text-[10px] opacity-60 font-medium tracking-normal">{{ supporterLabel() }}</span>
                </div>
              </app-button>
            </div>
            <!-- INSIDER TIER (Featured) -->
            <div class="glass p-6 lg:p-8 rounded-[2rem] border-insider/40 flex flex-col bg-insider/5 relative lg:scale-105 z-10 group hover:bg-insider/10 transition-all">
              <div class="absolute inset-0 bg-gradient-to-br from-insider/10 to-transparent pointer-events-none"></div>
              <div class="flex justify-between items-start mb-6 lg:mb-8">
                <span class="material-symbols-outlined text-insider text-3xl lg:text-4xl">verified</span>
                <span class="monotech text-[10px] text-insider font-bold uppercase bg-insider/20 px-3 py-1 rounded-full">{{ level02Label() }}</span>
              </div>
              <h3 class="text-xl lg:text-2xl font-black monotech uppercase mb-6 lg:mb-8">{{ insiderTierLabel() }}</h3>

              <ul class="space-y-3 lg:space-y-4 text-white/70 mb-6 lg:mb-8 text-sm lg:text-base">
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-insider shrink-0">check</span>
                  <span>{{ insiderBenefit1() }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-insider shrink-0">check</span>
                  <span>{{ insiderBenefit2() }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-insider shrink-0">check</span>
                  <span>{{ insiderBenefit3() }}</span>
                </li>
              </ul>

              <app-button variant="insider" [fullWidth]="true" size="lg" (action)="goToMembership('interno')">
                <div class="flex flex-col items-center gap-1">
                  <span>{{ upgradeNowLabel() }}</span>
                  <span class="text-[10px] opacity-80 font-medium tracking-normal">{{ insiderLabel() }}</span>
                </div>
              </app-button>
            </div>
            <!-- PARTNER TIER -->
            <div class="glass p-6 lg:p-8 rounded-[2rem] border-partner/20 flex flex-col group hover:bg-partner/5 transition-all">
              <div class="flex justify-between items-start mb-6 lg:mb-8">
                <span class="material-symbols-outlined text-partner text-3xl lg:text-4xl">diamond</span>
                <span class="monotech text-[10px] text-partner font-bold uppercase border border-partner/30 px-3 py-1 rounded-full">{{ level03Label() }}</span>
              </div>
              <h3 class="text-xl lg:text-2xl font-black monotech uppercase mb-6 lg:mb-8">{{ partnerTierLabel() }}</h3>

              <ul class="space-y-3 lg:space-y-4 text-white/70 mb-6 lg:mb-8 text-sm lg:text-base">
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-partner shrink-0">check</span>
                  <span>{{ partnerBenefit1() }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-partner shrink-0">check</span>
                  <span>{{ partnerBenefit2() }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-partner shrink-0">check</span>
                  <span>{{ partnerBenefit3() }}</span>
                </li>
              </ul>

              <app-button variant="partner" [fullWidth]="true" size="lg" (action)="goToMembership('socio')">
                <div class="flex flex-col items-center gap-1">
                  <span>{{ upgradeNowLabel() }}</span>
                  <span class="text-[10px] opacity-60 font-medium tracking-normal">{{ partnerLabel() }}</span>
                </div>
              </app-button>
            </div>
          </div>
        </section>
        
        <!-- MEMBERSHIP BENEFITS DETAILS REMOVED -->

        <!-- FEEDBACK SECTION REMOVED -->

      </main>
      }
      @if (!isIsolatedRoute()) {
        <app-footer />
      }
    </div>
  `,
  styles: [
    `
      :host {
        --primary: #0dccf2;
        --secondary: #ff00ff;
        --supporter: #22c55e;
        --insider: #3b82f6;
        --partner: #ef4444;
        --charcoal: #0a0a0a;
        --glass: rgba(255, 255, 255, 0.03);
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  selectedMembership = signal('');
  startAtPayment = signal(false);
  title = 'FLOWMIX | Social Pulse';
  private readonly i18n = inject(I18nService);
  language = this.i18n.language;
  admin = inject(AdminStoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  currentUrl = signal('');

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.url);
    });
  }

  isAdminOrConfirmRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/admin') || url.startsWith('/confirm');
  });

  isIsolatedRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/admin') || url.startsWith('/confirm') || url.startsWith('/track');
  });

  isFeedbackRoute = computed(() => {
    return this.currentUrl().startsWith('/feedback');
  });

  isAboutRoute = computed(() => {
    return this.currentUrl().startsWith('/nosotros');
  });

  isMembershipRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/membresias') || url.startsWith('/track');
  });

  priorityLabel = computed(() => this.language() === 'en' ? 'PRIORITY PROTOCOL ALPHA' : 'PROTOCOLO DE PRIORIDAD ALFA');

  // PRELOADER LOGIC
  isLoading = signal(true);
  isFadingOut = signal(false);
  loadingProgress = signal(0);
  
  loadingText = computed(() => {
    const p = this.loadingProgress();
    if (p < 30) return this.language() === 'en' ? 'INITIALIZING CORE SYSTEMS...' : 'INICIALIZANDO SISTEMAS...';
    if (p < 70) return this.language() === 'en' ? 'LOADING ASSETS...' : 'CARGANDO RECURSOS...';
    if (p < 90) return this.language() === 'en' ? 'CONNECTING TO NETWORK...' : 'CONECTANDO A LA RED...';
    return this.language() === 'en' ? 'READY TO LAUNCH' : 'LISTO PARA INICIAR';
  });

  private simulateLoading() {
    // Simulación de carga no lineal para sensación orgánica
    const interval = setInterval(() => {
      this.loadingProgress.update(current => {
        // Velocidad variable: más rápido al principio, más lento al final
        let increment = 0;
        if (current < 30) increment = Math.floor(Math.random() * 5) + 2;
        else if (current < 70) increment = Math.floor(Math.random() * 3) + 1;
        else if (current < 95) increment = Math.random() > 0.5 ? 1 : 0; // Pausa dramática al final
        else increment = 1;

        const next = current + increment;

        if (next >= 100) {
          clearInterval(interval);
          this.completeLoading();
          return 100;
        }
        return next;
      });
    }, 50); // Tick cada 50ms
  }

  private completeLoading() {
    // Fase 1: Fade out
    this.isFadingOut.set(true);
    
    // Fase 2: Remover del DOM
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500); // Coincide con duration-500 del CSS
  }
  nextGenLabel = computed(() => this.i18n.get('NEXT_GEN_AUDIO'));
  membershipLabel = computed(() => this.i18n.get('MEMBERSHIP_TIERS'));
  supporterLabel = computed(() => this.i18n.get('JOIN_FOUNDATION'));
  insiderLabel = computed(() => this.i18n.get('EARLY_ACCESS_POWER'));
  partnerLabel = computed(() => this.i18n.get('DIRECT_INFLUENCE'));
  beyondLabel = computed(() => this.i18n.get('HERO_PRECISION'));
  audioLabel = computed(() => this.i18n.get('HERO_NEXT_GEN'));
  engineLabel = computed(() => this.i18n.get('HERO_FOR_DJ'));
  
  problemTitle = computed(() => this.i18n.get('PROBLEM_TITLE'));
  problemSubtitle = computed(() => this.i18n.get('PROBLEM_SUBTITLE'));
  problemDesc = computed(() => this.i18n.get('PROBLEM_DESC'));
  solutionTitle = computed(() => this.i18n.get('SOLUTION_TITLE'));
  solutionSubtitle = computed(() => this.i18n.get('SOLUTION_SUBTITLE'));
  solutionDesc = computed(() => this.i18n.get('SOLUTION_DESC'));

  level01Label = computed(() => this.i18n.get('LEVEL_01'));
  supporterTierLabel = computed(() => this.i18n.get('SUPPORTER'));
  upgradeNowLabel = computed(() => this.i18n.get('UPGRADE_NOW'));
  
  level02Label = computed(() => this.i18n.get('LEVEL_02'));
  insiderTierLabel = computed(() => this.i18n.get('INSIDER'));
  
  level03Label = computed(() => this.i18n.get('LEVEL_03'));
  partnerTierLabel = computed(() => this.i18n.get('PARTNER'));

  // Benefits
  supporterBenefit1 = computed(() => this.i18n.get('SUPPORTER_B1'));
  supporterBenefit2 = computed(() => this.i18n.get('SUPPORTER_B2'));
  supporterBenefit3 = computed(() => this.i18n.get('SUPPORTER_B3'));

  insiderBenefit1 = computed(() => this.i18n.get('INSIDER_B1'));
  insiderBenefit2 = computed(() => this.i18n.get('INSIDER_B2'));
  insiderBenefit3 = computed(() => this.i18n.get('INSIDER_B3'));

  partnerBenefit1 = computed(() => this.i18n.get('PARTNER_B1'));
  partnerBenefit2 = computed(() => this.i18n.get('PARTNER_B2'));
  partnerBenefit3 = computed(() => this.i18n.get('PARTNER_B3'));



  goToMembership(tier: string): void {
    this.router.navigate(['/membresias'], { queryParams: { tier } });
  }

  ngOnInit(): void {
    this.simulateLoading();
    const qp = this.route.snapshot.queryParamMap;
    const tier = qp.get('tier');
    const pay = qp.get('pay') === '1';
    if (tier) {
      this.selectedMembership.set(tier);
      try { localStorage.setItem('preferred_membership', tier); } catch (e) { void e; }
    } else {
      try {
        const stored = localStorage.getItem('preferred_membership');
        if (stored) this.selectedMembership.set(stored);
      } catch (e) { void e; }
    }
    this.startAtPayment.set(pay);
    if (pay) {
      const el = document.getElementById('waitlist');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd && this.router.url.startsWith('/')) {
        const tree = this.router.parseUrl(this.router.url);
        const t = tree.queryParams['tier'];
        const p = tree.queryParams['pay'] === '1';
        if (t) {
          this.selectedMembership.set(t);
          try { localStorage.setItem('preferred_membership', t); } catch (e) { void e; }
        }
        this.startAtPayment.set(p);
        if (p) {
          const el = document.getElementById('waitlist');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
}
