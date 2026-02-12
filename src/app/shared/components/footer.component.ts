import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/i18n/i18n-service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="mt-40 bg-[#050505] border-t border-white/5 relative">
      <div class="py-24 px-8 w-full max-w-[1440px] mx-auto flex flex-col items-center gap-16">
        <div class="flex flex-col items-center gap-6 text-center">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-4xl" aria-hidden="true">graphic_eq</span>
            <span class="text-3xl font-black tracking-tighter monotech italic uppercase">FLOWMIX</span>
          </div>
          <p class="text-white/40 text-[10px] uppercase tracking-[0.5em] leading-relaxed max-w-lg">
            {{ bilingual() }}
          </p>
        </div>
        
        <div class="flex flex-col items-center gap-3">
          <div class="flex items-center gap-3 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-lg">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
            <span class="monotech text-[9px] text-primary/80 uppercase font-bold tracking-widest"
              >Global Sync Active</span
            >
          </div>
          <p class="monotech text-[8px] text-white/20 uppercase tracking-[0.4em]">
            Latency: 1.1ms • Region: EN/ES
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [],
})
export class FooterComponent {
  private readonly i18n = inject(I18nService);
  language = this.i18n.language;

  bilingual() {
    return this.language() === 'en'
      ? 'Bilingual Ecosystem • Redesigning the future of open source audio'
      : 'Ecosistema Bilingüe • Rediseñando el futuro del audio de código abierto';
  }
}
