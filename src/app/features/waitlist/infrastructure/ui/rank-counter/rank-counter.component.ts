import { Component, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@app/core/i18n/i18n-service';
import { WaitlistRankingResponse } from '../../../domain/waitlist.model';

@Component({
  selector: 'app-rank-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-black/80 rounded-3xl p-8 border border-primary/20 space-y-4 neon-glow-blue">
      <div class="flex justify-between items-center">
        <span class="monotech text-[10px] text-white/40 uppercase tracking-widest"
          >{{ yourPositionLabel }}</span
        >
        <span class="monotech text-[10px] text-primary font-bold animate-pulse uppercase"
          >{{ isSyncing() ? syncingText : readyText }}</span
        >
      </div>
      <div class="flex items-baseline gap-4">
        <span class="text-5xl @[600px]:text-6xl font-black monotech text-white tracking-tighter"
          >#{{ ranking()?.position || '-' }}</span
        >
        <span class="text-primary material-symbols-outlined text-4xl">trending_up</span>
      </div>
      <p class="text-[10px] text-white/20 monotech uppercase tracking-widest">
        {{ globalRankPrefix }} {{ ranking()?.totalParticipants || '-' }} {{ globalRankSuffix }}
      </p>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class RankCounterComponent {
  ranking = input<WaitlistRankingResponse | null>(null);
  isSyncing = input(false);
  private readonly i18n = inject(I18nService);
  language = this.i18n.language;

  displayRank = computed(() => {
    return this.ranking()?.position || 0;
  });

  get yourPositionLabel(): string {
    return this.i18n.get('YOUR_POSITION');
  }

  get syncingText(): string {
    return this.i18n.get('SYNCING');
  }

  get readyText(): string {
    return this.language() === 'en' ? 'READY' : 'LISTO';
  }

  get globalRankPrefix(): string {
    return this.language() === 'en' ? 'GLOBAL RANK OUT OF' : 'RANGO GLOBAL DE';
  }

  get globalRankSuffix(): string {
    return this.language() === 'en' ? 'PEERS' : 'PARES';
  }
}
