import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/i18n/i18n-service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-black/90 border-b border-white/5 h-10 overflow-hidden flex items-center relative z-[110]">
      <div class="flex whitespace-nowrap items-center gap-12 px-6 lg:px-12">
        <div class="flex items-center gap-6 monotech text-[10px] uppercase tracking-widest font-medium">
          <div class="flex items-center gap-2 text-primary">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>SYSTEM_STATUS: {{ language() === 'en' ? 'EN_ES_READY' : 'EN_ES_LISTO' }}</span>
          </div>
          <span class="text-white/20">/</span>
          <div class="flex items-center gap-2 text-partner">
            <span class="material-symbols-outlined text-[14px]">public</span>
            <span>NODE: BILINGUAL</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class StatusBarComponent {
  private readonly i18n = inject(I18nService);
  language = this.i18n.language;
}
