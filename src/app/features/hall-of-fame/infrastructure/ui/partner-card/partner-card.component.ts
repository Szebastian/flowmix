import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@app/core/i18n/i18n-service';
import { Contributor } from '../../../domain/contributor.model';
import { ShareImageService } from '@app/shared/services/share-image.service';

@Component({
  selector: 'app-partner-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] neon-glow-red relative overflow-hidden group hover:bg-partner/5 transition-all duration-500">
      <div
        class="absolute -right-16 -top-16 w-48 h-48 bg-partner/10 blur-[80px] rounded-full group-hover:bg-partner/20 transition-all"
      ></div>

      <!-- Top Right Share Button -->
      <div class="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex flex-col items-end gap-2">
        <button type="button"
                class="w-10 h-10 rounded-full border border-partner/30 bg-black/40 hover:bg-partner/20 text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center group/btn focus:outline-none focus:ring-2 focus:ring-partner/50"
                [disabled]="sharing()"
                [attr.aria-expanded]="menuOpen() ? 'true' : 'false'"
                [attr.aria-label]="menuOpen() ? 'Cerrar opciones de compartir' : 'Abrir opciones de compartir'"
                (click)="toggleMenu()"
                (keyup.enter)="toggleMenu()">
           @if (sharing()) {
             <span class="inline-block w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span>
           } @else {
             <span class="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">share</span>
           }
        </button>
        
        @if (menuOpen()) {
          <div class="glass border border-white/10 rounded-xl overflow-hidden shadow-xl animate-fade-in-down origin-top-right flex flex-col min-w-[160px]">
            <button type="button"
                    class="flex items-center gap-3 w-full text-left text-[11px] monotech uppercase tracking-widest px-4 py-3 hover:bg-partner/10 text-white/80 hover:text-white focus:outline-none transition-colors border-b border-white/5"
                    [disabled]="sharing()"
                    (click)="shareOg()"
                    (keyup.enter)="shareOg()">
              <span class="material-symbols-outlined text-[16px]">image</span>
              <span>Post (OG)</span>
            </button>
            <button type="button"
                    class="flex items-center gap-3 w-full text-left text-[11px] monotech uppercase tracking-widest px-4 py-3 hover:bg-partner/10 text-white/80 hover:text-white focus:outline-none transition-colors"
                    [disabled]="sharing()"
                    (click)="shareStory()"
                    (keyup.enter)="shareStory()">
              <span class="material-symbols-outlined text-[16px]">amp_stories</span>
              <span>Story</span>
            </button>
          </div>
        }
      </div>

      <div class="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 text-center md:text-left">
        <div
          class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-partner/10 flex items-center justify-center border border-partner/30 group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-[0_0_24px_rgba(239,68,68,0.25)]"
        >
          @if (contributor().avatar) {
            <img [src]="imageSrc()" [alt]="contributor().displayName" class="w-full h-full object-cover" loading="lazy" decoding="async">
          } @else {
            <span class="material-symbols-outlined text-partner text-4xl md:text-5xl">rocket</span>
          }
        </div>
        <div class="flex-1 space-y-4 w-full">
            <div class="flex flex-col md:flex-row items-center md:justify-between gap-2 relative">
            <h3 class="text-2xl md:text-3xl font-black monotech tracking-tight break-all md:break-normal pr-12">{{ contributor().username }}</h3>
          </div>
          <div class="flex flex-wrap justify-center md:justify-start gap-2">
            <span class="text-[10px] monotech text-white/40 border border-white/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest"
              >{{ foundingDonorLabel }}</span
            >
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full">
              <span class="material-symbols-outlined text-[12px] text-secondary">terminal</span>
              <span class="text-[9px] monotech text-secondary uppercase font-bold"
                >{{ feedbackHeroLabel }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PartnerCardComponent {
  contributor = input.required<Contributor>();
  private readonly i18n = inject(I18nService);
  private readonly share = inject(ShareImageService);
  language = this.i18n.language;
  sharing = signal(false);
  menuOpen = signal(false);
  imageSrc(): string {
    return this.contributor().avatar || '';
  }

  get foundingDonorLabel(): string {
    return this.i18n.get('FOUNDING_DONOR');
  }

  get feedbackHeroLabel(): string {
    return this.i18n.get('FEEDBACK_HERO');
  }
  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }
  async shareOg() {
    if (this.sharing()) return;
    this.sharing.set(true);
    try {
      const c = this.contributor();
      const dataUrl = await this.share.generateOgImage({
        name: c.displayName || c.username,
        avatarUrl: c.avatar,
        tier: 'partner',
        profileUrl: `${window.location.origin}/hall-of-fame#${encodeURIComponent(c.username)}`
      });
      await this.share.shareWeb(
        dataUrl,
        `${c.username}_og.png`,
        'Muro de la Fama · FLOWMIX',
        `¡Orgulloso de ser parte de FLOWMIX como Socio Nivel 01! 🎧 Únete a la comunidad aquí:`,
        `${window.location.origin}/hall-of-fame#${encodeURIComponent(c.username)}`
      );
      this.menuOpen.set(false);
    } finally {
      this.sharing.set(false);
    }
  }
  async shareStory() {
    if (this.sharing()) return;
    this.sharing.set(true);
    try {
      const c = this.contributor();
      const dataUrl = await this.share.generateStoryImage({
        name: c.displayName || c.username,
        avatarUrl: c.avatar,
        tier: 'partner',
        profileUrl: `${window.location.origin}/hall-of-fame#${encodeURIComponent(c.username)}`
      });
      await this.share.shareWeb(
        dataUrl,
        `${c.username}_story.png`,
        'Muro de la Fama · FLOWMIX',
        `¡Orgulloso de ser parte de FLOWMIX como Socio Nivel 01! 🎧 Únete a la comunidad aquí:`,
        `${window.location.origin}/hall-of-fame#${encodeURIComponent(c.username)}`
      );
      this.menuOpen.set(false);
    } finally {
      this.sharing.set(false);
    }
  }
}
