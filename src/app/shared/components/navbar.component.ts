import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/i18n/i18n-service';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../core/analytics/analytics.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="sticky top-0 z-[100] w-full glass border-b border-white/5">
      <div class="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[60px] py-4 flex items-center justify-between">
        <!-- LOGO -->
        <div class="flex items-center gap-2 md:gap-3 cursor-pointer" (click)="goHome()">
          <span class="material-symbols-outlined text-primary text-2xl md:text-3xl lg:text-4xl" style="font-variation-settings: 'FILL' 1" aria-hidden="true"
            >graphic_eq</span
          >
          <span class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tighter monotech italic">FLOWMIX</span>
        </div>

        <!-- DESKTOP MENU -->
        <div class="hidden lg:flex items-center gap-6">
          <button
            type="button"
            (click)="goHome()"
            class="px-4 py-2 rounded-lg text-[12px] monotech font-black uppercase tracking-widest text-white/80 hover:text-primary transition-colors"
          >
            {{ navHome() }}
          </button>
          <button
            type="button"
            (click)="goAbout()"
            class="px-4 py-2 rounded-lg text-[12px] monotech font-black uppercase tracking-widest text-white/80 hover:text-primary transition-colors"
          >
            {{ navAbout() }}
          </button>
          <button
            type="button"
            (click)="goMemberships()"
            class="px-4 py-2 rounded-lg text-[12px] monotech font-black uppercase tracking-widest text-white/80 hover:text-primary transition-colors"
          >
            {{ navMemberships() }}
          </button>
          <button
            type="button"
            (click)="goFeedback()"
            class="px-4 py-2 rounded-lg text-[12px] monotech font-black uppercase tracking-widest text-white/80 hover:text-primary transition-colors"
          >
            {{ navFeedback() }}
          </button>
          
          <!-- Language Selector -->
          <div class="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10" role="group" aria-label="Language selector">
            <button
              (click)="selectLanguage('en')"
              [ngClass]="{ 'text-primary': language() === 'en', 'text-white/40': language() !== 'en' }"
              class="px-2.5 py-1.5 text-[12px] monotech font-bold transition-colors hover:text-primary"
            >
              EN
            </button>
            <span class="text-white/20 text-[12px]" aria-hidden="true">/</span>
            <button
              (click)="selectLanguage('es')"
              [ngClass]="{ 'text-primary': language() === 'es', 'text-white/40': language() !== 'es' }"
              class="px-2.5 py-1.5 text-[12px] monotech font-bold transition-colors hover:text-primary"
            >
              ES
            </button>
          </div>

          <button
            type="button"
            (click)="goAdmin()"
            class="bg-primary/20 border border-primary/50 px-5 py-2.5 rounded-lg text-primary text-[12px] monotech font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
          >
            ACCESS_CORE
          </button>
        </div>

        <!-- MOBILE MENU TOGGLE -->
        <button 
          (click)="toggleMenu()" 
          class="lg:hidden p-2 text-white hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          <span class="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>
    </nav>

    <!-- MOBILE MENU OVERLAY -->
    @if (menuOpen()) {
      <div class="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-5 duration-300 flex flex-col">
        <!-- HEADER -->
        <div class="px-4 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-2">
             <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1">graphic_eq</span>
             <span class="text-lg font-bold tracking-tighter monotech italic">FLOWMIX</span>
          </div>
          <button (click)="toggleMenu()" class="p-2 text-white/60 hover:text-white transition-colors">
            <span class="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <!-- LINKS -->
        <div class="flex-1 flex flex-col items-center justify-center gap-8 p-8 overflow-y-auto">
          <button
            (click)="goHome()"
            class="text-2xl font-black monotech uppercase tracking-widest text-white hover:text-primary transition-colors"
          >
            {{ navHome() }}
          </button>
          <button
            (click)="goAbout()"
            class="text-2xl font-black monotech uppercase tracking-widest text-white hover:text-primary transition-colors"
          >
            {{ navAbout() }}
          </button>
          <button
            (click)="goMemberships()"
            class="text-2xl font-black monotech uppercase tracking-widest text-white hover:text-primary transition-colors"
          >
            {{ navMemberships() }}
          </button>
          <button
            (click)="goFeedback()"
            class="text-2xl font-black monotech uppercase tracking-widest text-white hover:text-primary transition-colors"
          >
            {{ navFeedback() }}
          </button>

          <div class="w-12 h-[1px] bg-white/10 my-4"></div>

          <!-- Language Selector Mobile -->
          <div class="flex items-center gap-6">
            <button
              (click)="selectLanguage('en')"
              [ngClass]="{ 'text-primary scale-110': language() === 'en', 'text-white/40': language() !== 'en' }"
              class="text-xl monotech font-bold transition-all"
            >
              ENGLISH
            </button>
            <button
              (click)="selectLanguage('es')"
              [ngClass]="{ 'text-primary scale-110': language() === 'es', 'text-white/40': language() !== 'es' }"
              class="text-xl monotech font-bold transition-all"
            >
              ESPAÑOL
            </button>
          </div>

          <div class="w-12 h-[1px] bg-white/10 my-4"></div>

          <button
            (click)="goAdmin()"
            class="bg-primary/20 border border-primary/50 px-8 py-4 rounded-xl text-primary text-sm monotech font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all w-full max-w-[200px]"
          >
            ACCESS_CORE
          </button>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class NavbarComponent {
  private readonly i18n = inject(I18nService);
  private readonly analytics = inject(AnalyticsService);
  language = this.i18n.language;
  private readonly router = inject(Router);

  menuOpen = signal(false);

  navFeedback(): string { return this.i18n.get('NAV_FEEDBACK'); }
  navAbout(): string { return this.i18n.get('NAV_ABOUT'); }
  navMemberships(): string { return this.i18n.get('NAV_MEMBERSHIPS'); }
  navHome(): string { return this.i18n.get('NAV_HOME'); }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  selectLanguage(lang: 'en' | 'es'): void {
    this.i18n.setLanguage(lang);
    // No cerramos el menú automáticamente al cambiar idioma para que el usuario vea el cambio, 
    // pero es opcional. Lo dejaré abierto.
  }

  goAdmin(): void {
    this.analytics.track('access_core_click');
    this.menuOpen.set(false);
    this.router.navigateByUrl('/admin');
  }

  goHome(): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/');
  }

  goMemberships(): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/membresias');
  }

  goFeedback(): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/feedback');
  }

  goAbout(): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/nosotros');
  }
}
