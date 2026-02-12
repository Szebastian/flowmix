import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@app/core/i18n/i18n-service';
import { Contributor } from '../../../domain/contributor.model';
import { ShareImageService } from '@app/shared/services/share-image.service';

@Component({
  selector: 'app-supporter-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid mt-12 gap-12" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))">
      <ng-container *ngFor="let supporter of supporters()">
        <div class="glass p-6 md:p-8 rounded-2xl neon-glow-supporter border-supporter/20 hover:border-supporter/40 transition-all group hover:bg-supporter/5 relative">
          
          <!-- Share Button Top Right -->
          <div class="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            <button type="button"
                    class="w-8 h-8 rounded-full border border-supporter/30 bg-black/40 hover:bg-supporter/20 text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center group/btn focus:outline-none focus:ring-2 focus:ring-supporter/50"
                    [disabled]="isSharing(supporter.id)"
                    [attr.aria-expanded]="isMenuOpen(supporter.id) ? 'true' : 'false'"
                    [attr.aria-label]="isMenuOpen(supporter.id) ? 'Cerrar opciones de compartir' : 'Abrir opciones de compartir'"
                    (click)="toggleMenu(supporter.id)"
                    (keyup.enter)="toggleMenu(supporter.id)">
               @if (isSharing(supporter.id)) {
                 <span class="inline-block w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span>
               } @else {
                 <span class="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">share</span>
               }
            </button>
            
            @if (isMenuOpen(supporter.id)) {
              <div class="glass border border-white/10 rounded-lg overflow-hidden shadow-xl animate-fade-in-down origin-top-right flex flex-col min-w-[140px]">
                <button type="button"
                        class="flex items-center gap-2 w-full text-left text-[10px] monotech uppercase tracking-widest px-3 py-2 hover:bg-supporter/10 text-white/80 hover:text-white focus:outline-none transition-colors border-b border-white/5"
                        [disabled]="isSharing(supporter.id)"
                        (click)="shareOg(supporter)"
                        (keyup.enter)="shareOg(supporter)">
                  <span class="material-symbols-outlined text-[14px]">image</span>
                  <span>Post (OG)</span>
                </button>
                <button type="button"
                        class="flex items-center gap-2 w-full text-left text-[10px] monotech uppercase tracking-widest px-3 py-2 hover:bg-supporter/10 text-white/80 hover:text-white focus:outline-none transition-colors"
                        [disabled]="isSharing(supporter.id)"
                        (click)="shareStory(supporter)"
                        (keyup.enter)="shareStory(supporter)">
                  <span class="material-symbols-outlined text-[14px]">amp_stories</span>
                  <span>Story</span>
                </button>
              </div>
            }
          </div>

          <div class="flex items-center justify-between mb-6">
            <div class="relative shrink-0">
              <div class="w-16 h-16 rounded-full border border-supporter/40 overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.25)] group-hover:scale-110 transition-transform flex items-center justify-center bg-supporter/10">
                <img *ngIf="supporter.avatar" [src]="imageSrc(supporter.avatar)" [alt]="supporter.displayName" class="w-full h-full object-cover" loading="lazy" decoding="async">
                <span *ngIf="!supporter.avatar" class="text-white/60 text-lg monotech uppercase">{{ (supporter.username || '?').charAt(0) }}</span>
              </div>
            </div>
          </div>
          <h4 class="text-lg font-black monotech text-white group-hover:text-supporter transition-colors mb-2 pr-8">
            {{ supporter.username }}
          </h4>
          <p class="text-[11px] monotech text-white/50 uppercase tracking-wider mb-4">
            {{ supporter.displayName }}
          </p>
          <div class="flex items-center gap-2 pt-4 border-t border-supporter/10">
            <span class="material-symbols-outlined text-[14px] text-supporter/70">favorite</span>
            <span class="text-[10px] monotech text-white/40">{{ supporter.contributions }} {{ contributionsLabel }}</span>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [],
})
export class SupporterGridComponent {
  supporters = input.required<Contributor[]>();
  private readonly i18n = inject(I18nService);
  private readonly share = inject(ShareImageService);
  language = this.i18n.language;
  
  // State per item
  activeMenuId = signal<string | null>(null);
  sharingIds = signal<Set<string>>(new Set());

  imageSrc(url: string | undefined): string {
    return url || '';
  }

  get contributionsLabel(): string {
    return this.language() === 'en' ? 'contributions' : 'contribuciones';
  }

  isMenuOpen(id: string): boolean {
    return this.activeMenuId() === id;
  }

  isSharing(id: string): boolean {
    return this.sharingIds().has(id);
  }

  toggleMenu(id: string) {
    if (this.activeMenuId() === id) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(id);
    }
  }

  async shareOg(s: Contributor) {
    if (this.isSharing(s.id)) return;
    this.sharingIds.update(set => {
      const newSet = new Set(set);
      newSet.add(s.id);
      return newSet;
    });
    
    try {
      const dataUrl = await this.share.generateOgImage({
        name: s.displayName || s.username,
        avatarUrl: s.avatar,
        tier: 'supporter',
        profileUrl: `${window.location.origin}/hall-of-fame#${encodeURIComponent(s.username)}`
      });
      await this.share.shareWeb(
        dataUrl,
        `${s.username}_og.png`,
        'Muro de la Fama · FLOWMIX',
        `¡Orgulloso de ser parte de FLOWMIX como Colaborador Nivel 03! 🎧 Únete a la comunidad aquí:`,
        `${window.location.origin}/hall-of-fame#${encodeURIComponent(s.username)}`
      );
      this.activeMenuId.set(null);
    } finally {
      this.sharingIds.update(set => {
        const newSet = new Set(set);
        newSet.delete(s.id);
        return newSet;
      });
    }
  }

  async shareStory(s: Contributor) {
    if (this.isSharing(s.id)) return;
    this.sharingIds.update(set => {
      const newSet = new Set(set);
      newSet.add(s.id);
      return newSet;
    });

    try {
      const dataUrl = await this.share.generateStoryImage({
        name: s.displayName || s.username,
        avatarUrl: s.avatar,
        tier: 'supporter',
        profileUrl: `${window.location.origin}/hall-of-fame#${encodeURIComponent(s.username)}`
      });
      await this.share.shareWeb(
        dataUrl,
        `${s.username}_story.png`,
        'Muro de la Fama · FLOWMIX',
        `¡Orgulloso de ser parte de FLOWMIX como Colaborador Nivel 03! 🎧 Únete a la comunidad aquí:`,
        `${window.location.origin}/hall-of-fame#${encodeURIComponent(s.username)}`
      );
      this.activeMenuId.set(null);
    } finally {
      this.sharingIds.update(set => {
        const newSet = new Set(set);
        newSet.delete(s.id);
        return newSet;
      });
    }
  }
}
