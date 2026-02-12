import { Component, computed, effect, inject, input, OnInit, OnDestroy, output, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '@app/core/i18n/i18n-service';
import { SupabaseService } from '@app/core/integrations/supabase.service';
import { JoinWaitlistRequest, WaitlistPosition } from '../../../domain/waitlist.model';
import { InputComponent } from '@app/shared/components/input.component';
import { ButtonComponent } from '@app/shared/components/button.component';
import { COUNTRIES } from '@app/shared/data/countries.data';

@Component({
  selector: 'app-waitlist-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="w-full max-w-md mx-auto">
      @if (!(success() || successLocal())) {
        <!-- Progress Bar -->
        <div class="mb-8 space-y-2">
          <div class="flex justify-between text-[10px] monotech text-white/40 uppercase tracking-wider">
            <span>{{ stepLabel }}</span>
            <span>{{ step() }} / {{ totalSteps }}</span>
          </div>
          <div class="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              class="h-full bg-[#00e5ff] transition-all duration-500 ease-out"
              [style.width.%]="progress()"
            ></div>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="min-h-[400px] flex flex-col justify-between" novalidate>
          
          <!-- Steps Container -->
          <div class="flex-1">
            
            <!-- STEP 1: IDENTITY & CONTACT -->
            @if (step() === 1) {
              <div class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <h3 class="text-2xl font-bold text-white monotech">{{ getStepTitle(1) }}</h3>
                    <p class="text-white/60 text-sm">{{ getStepDescription(1) }}</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <!-- Email -->
                  <app-input
                    [value]="email()"
                    (valueChange)="email.set($event)"
                    (blur)="onEmailBlur()"
                    label="Email"
                    placeholder="tu@email.com"
                    type="email"
                    [disabled]="isLoading()"
                    class="w-full font-mono"
                    [showSuccess]="isEmailValid()"
                  ></app-input>
                  @if (duplicateEmail()) {
                    <p class="text-[10px] monotech text-red-400 ml-2">Este correo ya se encuentra registrado</p>
                  }

                  @if (showFullName()) {
                    <div class="animate-in fade-in slide-in-from-right-4 duration-300">
                      <app-input
                        [value]="fullName()"
                        (valueChange)="fullName.set(sanitizeFullName($event))"
                        label="Nombre Completo"
                        placeholder="Nombre y Apellido"
                        [disabled]="isLoading()"
                        class="w-full font-mono"
                        [showSuccess]="isFullNameValid()"
                      ></app-input>
                    </div>
                  }

                  @if (showAlias()) {
                    <div class="animate-in fade-in slide-in-from-right-4 duration-300">
                      <app-input
                        [value]="djName()"
                        (valueChange)="djName.set(sanitizeAlias($event))"
                        (blur)="checkDjNameAvailability()"
                        label="Alias de DJ"
                        placeholder="Tu alias en FlowMix"
                        [disabled]="isLoading()"
                        class="w-full font-mono"
                        [showSuccess]="isAliasValid() && djNameStatus() !== 'taken'"
                      ></app-input>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- STEP 2: PROFILE & SOCIAL -->
            @if (step() === 2) {
              <div class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div class="space-y-2">
                  <h3 class="text-2xl font-bold text-white monotech">{{ getStepTitle(2) }}</h3>
                  <p class="text-white/60 text-sm">{{ getStepDescription(2) }}</p>
                </div>

                <div class="space-y-4">
                  <!-- Country Selector -->
                  <div class="relative group">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00e5ff] transition-colors z-10">public</span>
                    <select
                      [ngModel]="country()"
                      (ngModelChange)="country.set($event)"
                      name="country"
                      [disabled]="isLoading()"
                      class="w-full h-[52px] bg-black/20 border border-white/10 rounded-xl px-4 pl-12 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all appearance-none cursor-pointer font-mono text-base"
                    >
                      <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">{{ countryPlaceholder }}</option>
                      @for (c of countries; track c.code) {
                        <option [value]="c.name" class="bg-[#0a0a0a]">{{ getCountryFlag(c.code) }} {{ c.name }}</option>
                      }
                    </select>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none material-symbols-outlined text-sm">expand_more</span>
                  </div>

                  <!-- OS Selection (Dropdown) -->
                  <div class="relative group">
                     <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00e5ff] transition-colors z-10">computer</span>
                     <select
                       [ngModel]="os()"
                       (ngModelChange)="os.set($event); osVersion.set('')" 
                       name="os"
                       [disabled]="isLoading()"
                       class="w-full h-[52px] bg-black/20 border border-white/10 rounded-xl px-4 pl-12 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all appearance-none cursor-pointer font-mono text-base"
                     >
                       <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">Sistema Operativo</option>
                       @for (opt of osOptions; track opt.value) {
                         <option [value]="opt.value" class="bg-[#0a0a0a]">{{ opt.label }}</option>
                       }
                     </select>
                     @if (os()) {
                       <span class="absolute right-10 top-1/2 -translate-y-1/2 text-green-400 material-symbols-outlined text-lg animate-in fade-in zoom-in">check_circle</span>
                     }
                     <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none material-symbols-outlined text-sm">expand_more</span>
                  </div>

                  <!-- Architecture (Dropdown) -->
                  @if (os()) {
                     <div class="relative group animate-in fade-in slide-in-from-top-2">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00e5ff] transition-colors z-10">memory</span>
                        <select
                          [ngModel]="architecture()"
                          (ngModelChange)="architecture.set($event)"
                          name="architecture"
                          [disabled]="isLoading()"
                          class="w-full h-[52px] bg-black/20 border border-white/10 rounded-xl px-4 pl-12 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all appearance-none cursor-pointer font-mono text-base"
                        >
                          <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">Arquitectura</option>
                          @for (opt of archOptions(); track opt.value) {
                            <option [value]="opt.value" class="bg-[#0a0a0a]">{{ opt.label }}</option>
                          }
                        </select>
                        @if (architecture()) {
                           <span class="absolute right-10 top-1/2 -translate-y-1/2 text-green-400 material-symbols-outlined text-lg animate-in fade-in zoom-in">check_circle</span>
                        }
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none material-symbols-outlined text-sm">expand_more</span>
                     </div>
                  }

                  <!-- OS Version (Dropdown) -->
                   @if (os()) {
                      <div class="relative group animate-in fade-in slide-in-from-top-2">
                         <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00e5ff] transition-colors z-10">settings_suggest</span>
                         <select
                           [ngModel]="osVersion()"
                           (ngModelChange)="osVersion.set($event)"
                           name="osVersion"
                           [disabled]="isLoading()"
                           class="w-full h-[52px] bg-black/20 border border-white/10 rounded-xl px-4 pl-12 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all appearance-none cursor-pointer font-mono text-base"
                         >
                           <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">Versión del Sistema</option>
                           @for (v of osVersions(); track v) {
                             <option [value]="v" class="bg-[#0a0a0a]">{{ v }}</option>
                           }
                         </select>
                         @if (osVersion()) {
                            <span class="absolute right-10 top-1/2 -translate-y-1/2 text-green-400 material-symbols-outlined text-lg animate-in fade-in zoom-in">check_circle</span>
                         }
                         <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none material-symbols-outlined text-sm">expand_more</span>
                      </div>
                   }

                  <!-- Current Software (Dropdown) -->
                  <div class="relative group">
                     <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00e5ff] transition-colors z-10">album</span>
                     <select
                       [ngModel]="currentSoftware()"
                       (ngModelChange)="currentSoftware.set($event)"
                       name="currentSoftware"
                       [disabled]="isLoading()"
                       class="w-full h-[52px] bg-black/20 border border-white/10 rounded-xl px-4 pl-12 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all appearance-none cursor-pointer font-mono text-base"
                     >
                       <option value="" disabled selected class="bg-[#0a0a0a] text-white/60">Software Actual (Opcional)</option>
                       @for (sw of softwareOptions; track sw) {
                         <option [value]="sw" class="bg-[#0a0a0a]">{{ sw }}</option>
                       }
                     </select>
                     <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none material-symbols-outlined text-sm">expand_more</span>
                  </div>

                  <!-- Audio Preferences -->
                  <div class="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                    <p class="text-[10px] monotech text-white/60 uppercase tracking-widest pl-1">Preferencias de Audio</p>
                    <div class="grid grid-cols-2 gap-3">
                      @for (format of availableAudioFormats; track format) {
                        <button
                          type="button"
                          (click)="toggleAudioFormat(format)"
                          [class.border-[#00e5ff]]="audioFormats().includes(format)"
                          [class.text-[#00e5ff]]="audioFormats().includes(format)"
                          [class.bg-[#00e5ff]/10]="audioFormats().includes(format)"
                          [class.border-white/10]="!audioFormats().includes(format)"
                          [class.text-white/60]="!audioFormats().includes(format)"
                          class="h-[48px] flex items-center justify-center gap-2 rounded-xl border bg-black/20 hover:bg-white/5 transition-all duration-300 font-mono text-sm uppercase"
                        >
                          <span class="material-symbols-outlined text-lg">music_note</span>
                          {{ format }}
                        </button>
                      }
                    </div>
                  </div>

                  
                  
                  @if (showErrors() && !isStep2Valid()) {
                    <p class="text-[10px] monotech text-partner/80 animate-in fade-in">
                      Completa los datos técnicos requeridos
                    </p>
                  }
                </div>
              </div>
            }

            <!-- STEP 3: CONFIRM & RECEIVE ACCESS -->
            @if (step() === 3) {
              <div class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 min-h-[250px] flex flex-col justify-center">
                <div class="space-y-4 text-center">
                  <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 mb-2">
                    <span class="material-symbols-outlined text-primary text-3xl">mail</span>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-2xl font-bold text-white monotech">{{ getStepTitle(3) }}</h3>
                    <p class="text-white/80 text-sm leading-relaxed max-w-[280px] mx-auto">
                      {{ getStepDescription(3) }}
                    </p>
                  </div>

                  <div class="pt-4 flex flex-col items-center gap-3">
                    <label class="flex items-center gap-3 text-[10px] monotech text-white/40 cursor-pointer hover:text-white/60 transition-colors">
                      <input type="checkbox" [checked]="consentMarketing()" (change)="consentMarketing.set($any($event.target).checked)" class="accent-primary" />
                      Acepto recibir novedades y actualizaciones
                    </label>
                  </div>
                </div>
              </div>
            }

          </div>

          <!-- Navigation Buttons -->
          <div class="pt-8 flex gap-3">
            @if (step() > 1) {
              <button
                type="button"
                (click)="prevStep()"
                [disabled]="isLoading() || saving()"
                class="h-[52px] px-6 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all font-mono uppercase text-sm"
              >
                <span class="material-symbols-outlined">arrow_back</span>
              </button>
            }
            
            <app-button
              [type]="step() === totalSteps ? 'submit' : 'button'"
              [disabled]="(isLoading() || saving()) || !isCurrentStepValid()"
              variant="primary"
              size="lg"
              [fullWidth]="true"
              (action)="step() === totalSteps ? onSubmit() : nextStep()"
            >
              {{ step() === totalSteps ? ((isLoading() || saving()) ? processingText : claimPositionText) : nextText }}
              @if (!(isLoading() || saving())) {
                <span class="material-symbols-outlined text-lg">{{ step() === totalSteps ? 'double_arrow' : 'arrow_forward' }}</span>
              }
            </app-button>
          </div>

          @if (error()) {
            <div class="mt-4 text-red-200 text-sm monotech p-4 bg-red-950/40 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 shadow-lg shadow-red-900/10 backdrop-blur-sm">
              <span class="material-symbols-outlined text-red-400 shrink-0 mt-0.5">error</span>
              <span class="leading-relaxed">{{ error() }}</span>
            </div>
          }
        </form>
      } @else {
        <!-- Success State -->
        <div class="glass p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center space-y-6 animate-in fade-in zoom-in duration-500">
           <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 animate-pulse">
             <span class="material-symbols-outlined text-primary text-4xl">mail</span>
           </div>
           <div class="space-y-4">
             <h3 class="text-2xl font-bold monotech text-white">{{ successTitle }}</h3>
             <div class="space-y-2">
               <p class="text-white/80 monotech text-sm leading-relaxed">{{ successTextMain }}</p>
               <p class="text-primary monotech text-[10px] uppercase tracking-widest font-bold">
                 {{ successTextHint }}
               </p>
               @if (countdown() > 0) {
                 <p class="text-white/60 monotech text-xs">
                   El formulario se reiniciará en {{ countdown() }} segundos...
                 </p>
               }
             </div>
           </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class WaitlistFormComponent implements OnInit {
  // --- Form Data ---
  // Step 1: Identity
  userName = signal('');
  fullName = signal('');
  djName = signal('');
  email = signal('');
  
  // Step 2: Profile & Social
  country = signal('');
  os = signal('');
  osVersion = signal('');
  architecture = signal('');
  currentSoftware = signal('');
  audioFormats = signal<string[]>(['mp3', 'wav']);
  instagram = signal('');
  
  consentMarketing = signal(true);
  
  autoFilled = signal(false);
  hasCheckedEmail = signal(false);
  private checkedEmails = new Set<string>();
  djNameStatus = signal<'checking' | 'available' | 'taken' | 'none'>('none');
  profilesHasFullNameColumn = signal<boolean | null>(null);
  duplicateEmail = signal<boolean>(false);
  saving = signal<boolean>(false);
  successLocal = signal<boolean>(false);
  localError = signal<string | null>(null);
  countdown = signal<number>(0);
  private countdownTimer: any = null;
  
  countries = COUNTRIES;
  
  // --- Options ---
  readonly osOptions = [
    { label: 'Windows', value: 'Windows' },
    { label: 'macOS', value: 'macOS' },
    { label: 'Linux', value: 'Linux' }
  ];

  readonly archOptions = computed(() => {
    const os = this.os();
    if (os === 'Windows') {
      return [
        { label: 'x64 (Estándar)', value: 'x64' },
        { label: 'ARM64', value: 'arm64' }
      ];
    } else if (os === 'macOS') {
      return [
        { label: 'Apple Silicon (M1/M2/M3)', value: 'arm64' },
        { label: 'Intel Core (i5/i7/i9)', value: 'x86_64' }
      ];
    } else if (os === 'Linux') {
      return [
        { label: 'x86_64 (PC)', value: 'x86_64' },
        { label: 'AArch64 (ARM)', value: 'aarch64' }
      ];
    }
    return [];
  });

  readonly softwareOptions = [
    'Rekordbox',
    'Serato',
    'Traktor',
    'Virtual DJ',
    'Engine DJ',
    'Other / Otro'
  ];

  readonly availableAudioFormats = ['mp3', 'wav', 'flac', 'aiff'];

  // Computed for OS Versions
  readonly osVersions = computed(() => {
    const os = this.os();
    if (os === 'Windows') {
      return ['Windows 11', 'Windows 10'];
    } else if (os === 'macOS') {
      return ['Sonoma', 'Ventura', 'Monterey'];
    } else if (os === 'Linux') {
      return ['Ubuntu', 'Fedora', 'Debian'];
    }
    return [];
  });

  // --- Wizard State ---
  step = signal(1);
  totalSteps = 3;
  showErrors = signal(false);

  // --- Inputs/Outputs ---
  isLoading = input<boolean>(false);
  successPosition = input<WaitlistPosition | null>(null);
  errorMessage = input<string | null>(null);
  membershipTierInput = input<string>('');
  startAtPayment = input<boolean>(false);
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onSubmitForm = output<JoinWaitlistRequest>();
  
  private readonly i18n = inject(I18nService);
  readonly supabase = inject(SupabaseService);
  language = this.i18n.language;

  // Computed
  progress = computed(() => (this.step() / this.totalSteps) * 100);

  toggleAudioFormat(format: string) {
    this.audioFormats.update(formats => {
      if (formats.includes(format)) {
        return formats.filter(f => f !== format);
      } else {
        return [...formats, format];
      }
    });
  }

  ngOnInit(): void {
    this.loadDraft();
    this.detectCountry();
    this.detectSystem();
    this.supabase.checkProfilesFullNameColumn().then(v => this.profilesHasFullNameColumn.set(v));
  }

  detectSystem() {
    const userAgent = navigator.userAgent;
    let os = '';
    
    // OS Detection
    if (userAgent.indexOf('Win') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) os = 'Linux';
    else if (userAgent.indexOf('like Mac') !== -1) os = 'macOS';

    if (os) {
      this.os.set(os);
      
      // Attempt Architecture Detection
      if (os === 'macOS') {
        // Default to Apple Silicon as it's the target, user can change if Intel
        // Most modern browsers on M-series still report Intel, so we can't rely on UA perfectly
        this.architecture.set('arm64'); 
      } else if (os === 'Windows') {
         if (userAgent.includes('ARM64')) this.architecture.set('arm64');
         else this.architecture.set('x64');
      } else if (os === 'Linux') {
         if (userAgent.includes('aarch64') || userAgent.includes('arm')) this.architecture.set('aarch64');
         else this.architecture.set('x86_64');
      }

      // Pre-select a suggested OS version based on options
      const versions = this.osVersions();
      if (versions.length && !this.osVersion()) {
        this.osVersion.set(versions[0]);
      }
    }
  }

  constructor() {
    // Email monitor for auto-fill
    effect(() => {
      const emailValue = this.email();
      const isValid = this.isEmailValid();
      if (isValid && !this.checkedEmails.has(emailValue)) {
        untracked(() => this.checkExistingUser(emailValue));
      }
      untracked(() => this.saveDraft());
    });

    // General auto-save
    effect(() => {
      this.userName();
      this.djName();
      this.country();
      this.os();
      this.architecture();
      this.currentSoftware();
      this.step();
      untracked(() => this.saveDraft());
    });

    // Success auto-reset watcher (input-driven)
    effect(() => {
      const s = this.successPosition();
      if (s) {
        this.successLocal.set(true);
        this.startResetCountdown(10);
      }
    });
  }

  private detectCountry(): void {
    if (this.country()) return; // Don't overwrite if already set (e.g. from draft)
    try {
      const region = navigator.language.split('-')[1];
      if (region) {
        const found = this.countries.find(c => c.code === region.toUpperCase());
        if (found) this.country.set(found.name);
      }
    } catch {
      // Silent fallback
    }
  }

  async checkExistingUser(email: string): Promise<void> {
    if (!email || this.checkedEmails.has(email)) return;
    this.checkedEmails.add(email);
    
    console.log('🔍 Checking waitlist for:', email);
    const profile = await this.supabase.getProfileByEmail(email);
    
    if (profile) {
      console.log('✨ [Waitlist] Profile found for ' + email + ':', profile);
      this.duplicateEmail.set(true);
      untracked(() => {
        if (profile.username && profile.username.trim()) {
          console.log('  -> Auto-filling username:', profile.username);
          this.userName.set(profile.username);
        }
        
        const rawDjName = profile.djName?.trim() || '';
        if (rawDjName.length >= 2) {
          const sanitized = this.sanitizeAlias(rawDjName);
          console.log('  -> ✅ Auto-filling djName:', sanitized);
          this.djName.set(sanitized);
          this.checkDjNameAvailability();
        }
        
        const nat = (profile.nationality || '').trim();
        if (nat) {
          const maybeCode = nat.length <= 3 ? nat.toUpperCase() : '';
          const byCode = maybeCode ? this.countries.find(c => c.code === maybeCode) : undefined;
          if (byCode) {
            console.log('  -> Auto-filling country (code→name):', byCode.name);
            this.country.set(byCode.name);
          } else {
            console.log('  -> Auto-filling country (name):', nat);
            this.country.set(nat);
          }
        }
        
        this.autoFilled.set(true);
        this.saveDraft();
      });
    } else {
      console.log('ℹ️ [Waitlist] No profile found for email:', email);
      this.duplicateEmail.set(false);
    }
    this.hasCheckedEmail.set(true);
  }

  onEmailBlur(): void {
    if (this.isEmailValid()) {
      this.checkExistingUser(this.email());
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  saveDraft(): void {
    const draft = {
      userName: this.userName(),
      djName: this.djName(),
      email: this.email(),
      country: this.country(),
      os: this.os(),
      osVersion: this.osVersion(),
      architecture: this.architecture(),
      currentSoftware: this.currentSoftware(),
      instagram: this.instagram(),
      step: this.step()
    };
    localStorage.setItem('waitlist_draft', JSON.stringify(draft));
  }

  loadDraft(): void {
    const raw = localStorage.getItem('waitlist_draft');
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft.userName) this.userName.set(draft.userName);
      if (draft.djName) this.djName.set(draft.djName);
      if (draft.email) {
        this.email.set(draft.email);
        this.checkExistingUser(draft.email);
      }
      if (draft.country) this.country.set(draft.country);
      if (draft.os) this.os.set(draft.os);
      if (draft.osVersion) this.osVersion.set(draft.osVersion);
      if (draft.architecture) this.architecture.set(draft.architecture);
      if (draft.currentSoftware) this.currentSoftware.set(draft.currentSoftware);
      if (draft.instagram) this.instagram.set(draft.instagram);
      if (draft.step) this.step.set(draft.step);
    } catch (e) { void e; }
  }

  resetDraft(): void {
    localStorage.removeItem('waitlist_draft');
    this.userName.set('');
    this.djName.set('');
    this.email.set('');
    this.autoFilled.set(false);
    this.checkedEmails.clear();
    console.log('🗑️ Waitlist draft cleared');
  }

  // --- Dynamic Options ---
  

  // --- Navigation Logic ---

  async nextStep(): Promise<void> {
    if (!this.isCurrentStepValid()) {
      this.showErrors.set(true);
      return;
    }

    this.showErrors.set(false);

    // Persist identity when leaving Step 1
    if (this.step() === 1 && this.supabase.isConfigured()) {
      try {
        await this.supabase.upsertProfileCompat({
          id: '',
          username: this.userName() || (this.email()?.split('@')[0] || ''),
          fullName: this.fullName() || '',
          djName: this.djName() || '',
          email: this.email() || '',
          nationality: this.country() || ''
        });
      } catch (e) {
        console.warn('No se pudo guardar el perfil en Supabase:', e);
      }
    }

    // Persist technical data when leaving Step 2
    if (this.step() === 2 && this.supabase.isConfigured()) {
      try {
        const email = this.email();
        let prof = await this.supabase.getProfileByEmail(email);
        let userId = prof?.id || '';

        if (!userId) {
          await this.supabase.upsertProfileCompat({
            id: '',
            username: this.userName() || (email?.split('@')[0] || ''),
            djName: this.djName(),
            email,
            nationality: this.country() || ''
          });
          prof = await this.supabase.getProfileByEmail(email);
          userId = prof?.id || '';
        }

        if (userId) {
          await this.supabase.upsertTechnicalDetailed({
            userId,
            osFamily: this.os() || '',
            osVersion: this.osVersion() || '',
            architecture: this.architecture() || '',
            audioFormats: this.audioFormats()
          });
        }
      } catch (e) {
        console.warn('No se pudo persistir technical_data en Supabase:', e);
      }
    }

    this.step.update(s => Math.min(s + 1, this.totalSteps));
  }

  prevStep(): void {
    this.showErrors.set(false);
    this.step.update(s => Math.max(s - 1, 1));
  }

  isCurrentStepValid(): boolean {
    switch (this.step()) {
      case 1: return this.isStep1Valid();
      case 2: return this.isStep2Valid();
      case 3: return this.isStep3Valid();
      default: return false;
    }
  }

  // --- Validation ---

  isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((this.email() || '').trim()));
  userValid = computed(() => (this.userName() || '').trim().length >= 3);
  isAliasValid = computed(() => /^[\p{L}\d _-]{2,40}$/u.test((this.djName() || '').trim()));
  isFullNameValid = computed(() => /^[\p{L} ]{3,60}$/u.test((this.fullName() || '').trim()));
  
  isStep1Valid = computed(() => {
    const nameValid = this.isFullNameValid();
    const djValid = this.isAliasValid() && this.djNameStatus() !== 'taken';
    return nameValid && djValid && this.isEmailValid() && !this.duplicateEmail();
  });
  showFullName = computed(() => this.isEmailValid() && !this.duplicateEmail());
  showAlias = computed(() => this.showFullName() && ((this.fullName() || '').trim().length > 0));

  sanitizeAlias(v: string): string {
    const s = (v || '').normalize('NFKC');
    const cleaned = s.replace(/[^\p{L}\d _-]+/gu, '');
    const singleSpaced = cleaned.replace(/\s+/g, ' ').trim();
    const words = singleSpaced.split(' ');
    const titled = words.map(w => {
      if (!w) return '';
      return w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase();
    }).join(' ');
    return titled;
  }

  titleCase(v: string): string {
    const s = (v || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
    return s.split(' ').map(w => w ? (w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase()) : '').join(' ');
  }

  sanitizeFullName(v: string): string {
    const s = (v || '').normalize('NFKC');
    const cleaned = s.replace(/[^\p{L} ]+/gu, '');
    const singleSpaced = cleaned.replace(/\s+/g, ' ').trim();
    return this.titleCase(singleSpaced);
  }

  isStep2Valid = computed(() => !!this.country() && !!this.os() && !!this.osVersion() && !!this.architecture());

  isStep3Valid = computed(() => true); // No strictly required fields in Step 3 interests

  async checkDjNameAvailability(): Promise<void> {
    const name = this.djName();
    if (!name || name.length < 2) {
      this.djNameStatus.set('none');
      return;
    }
    // Permitir nombres duplicados (múltiples DJs pueden llamarse igual)
    this.djNameStatus.set('available');
  }


  async onSubmit(): Promise<void> {
    if (!this.isCurrentStepValid()) {
      this.showErrors.set(true);
      return;
    }
    this.localError.set(null);
    this.onSubmitForm.emit({
      userName: this.userName(),
      djName: this.djName(),
      email: this.email(),
      country: this.country(),
      nationality: this.country(),
      instagram: this.instagram(),
      os: this.os(),
      osVersion: this.osVersion(),
      architecture: this.architecture(),
      currentSoftware: this.currentSoftware(),
      audioFormats: this.audioFormats(),
      status: 'pending_delivery'
    });
  }
  

  // --- UI Helpers ---

  getCountryFlag(code: string): string {
    if (!code || code === 'OTHER') return '🌍';
    try {
      return code
        .toUpperCase()
        .split('')
        .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
        .join('');
    } catch {
      return '🌍';
    }
  }

  getStepTitle(step: number): string {
    const isEn = this.language() === 'en';
    switch (step) {
      case 1: return isEn ? 'Identity & Contact' : 'Identidad y Contacto';
      case 2: return isEn ? 'Technical & Location' : 'Entorno Técnico y Ubicación';
      case 3: return isEn ? 'Confirm & Receive Access' : 'Confirmar y Recibir Acceso';
      default: return '';
    }
  }

  getStepDescription(step: number): string {
    const isEn = this.language() === 'en';
    const osName = this.os() || (isEn ? 'your system' : 'tu sistema');
    
    switch (step) {
      case 1: return isEn ? 'Start by entering your basic info.' : 'Comienza con tu información básica.';
      case 2: return isEn ? 'Tell us about your machine and location.' : 'Cuéntanos sobre tu equipo y ubicación.';
      case 3: return isEn 
        ? `By confirming, you will receive an email with the download link compatible with ${osName}.` 
        : `Al confirmar, recibirás un correo con el link de descarga compatible con ${osName}.`;
      default: return '';
    }
  }

  get stepLabel(): string {
    return this.language() === 'en' ? 'Step' : 'Paso';
  }

  get nextText(): string {
    return this.language() === 'en' ? 'Continue' : 'Continuar';
  }

  get djNamePlaceholder(): string { return this.i18n.get('DJ_NAME'); }
  get emailPlaceholder(): string { return this.i18n.get('EMAIL_ADDRESS'); }
  get processingText(): string { return this.i18n.get('PROCESSING'); }
  get claimPositionText(): string {
    return this.language() === 'en' ? 'FINISH' : 'FINALIZAR ';
  }

  get countryPlaceholder(): string { return this.language() === 'en' ? 'Select Country' : 'Selecciona país'; }
  get genderPlaceholder(): string { return this.i18n.get('GENDER_PLACEHOLDER'); }
  get genderMale(): string { return this.i18n.get('GENDER_MALE'); }
  get genderFemale(): string { return this.i18n.get('GENDER_FEMALE'); }
  get genderNotSpecified(): string { return this.i18n.get('GENDER_NOT_SPECIFIED'); }
  get referralPlaceholder(): string { return this.language() === 'en' ? 'Select an option' : 'Selecciona una opción'; }

  get successTitle(): string {
    return this.language() === 'en' ? 'Registration Successful' : '¡Registro Exitoso!';
  }

  get successTextMain(): string {
    return this.language() === 'en' 
      ? 'Check your email' 
      : 'Revisa tu correo';
  }

  get successTextHint(): string {
    return this.language() === 'en'
      ? 'We sent you a confirmation'
      : 'Te enviamos una confirmación';
  }

  get success() {
    return () => this.successPosition();
  }

  get error() {
    return () => this.localError() ?? this.errorMessage();
  }

  startResetCountdown(seconds: number): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.countdown.set(seconds);
    this.countdownTimer = setInterval(() => {
      const current = this.countdown();
      const next = current - 1;
      this.countdown.set(next);
      if (next <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.resetDraft();
        this.country.set('');
        this.os.set('');
        this.osVersion.set('');
        this.architecture.set('');
        this.currentSoftware.set('');
        this.audioFormats.set(['mp3','wav']);
        this.instagram.set('');
        this.consentMarketing.set(true);
        this.step.set(1);
        this.successLocal.set(false);
        this.showErrors.set(false);
        this.localError.set(null);
        this.duplicateEmail.set(false);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
