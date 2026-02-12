import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, translations } from '@app/core/i18n/i18n-service';

@Component({
  selector: 'app-about-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full max-w-7xl mx-auto px-6 py-24" id="nosotros">
      <header class="text-center space-y-6 mb-16">
        <h2 class="text-4xl lg:text-5xl font-black monotech uppercase tracking-tighter text-white">
          {{ t('NOSOTROS_TITLE') }}
        </h2>
        <div class="w-32 h-1 bg-primary mx-auto"></div>
      </header>

      <div class="max-w-4xl mx-auto space-y-10">
        <div class="space-y-3">
          <h3 class="text-2xl font-black monotech uppercase tracking-tighter text-white">
            {{ t('EVOL_CABINA_TITLE') }}
          </h3>
          <div class="w-20 h-[2px] bg-white/10"></div>
          <p class="text-white/80 leading-relaxed">{{ t('NOS_P1') }}</p>
          <p class="text-white/80 leading-relaxed">{{ t('NOS_P2') }}</p>
        </div>

        <div class="space-y-4">
          <h3 class="text-2xl font-black monotech uppercase tracking-tighter text-white">
            {{ t('MANIFIESTO_TITLE') }}
          </h3>
          <div class="w-20 h-[2px] bg-white/10"></div>
          <div class="space-y-3">
            <p class="text-white/80 leading-relaxed">{{ t('MAN_LIBERTAD') }}</p>
            <p class="text-white/80 leading-relaxed">{{ t('MAN_TRANSPARENCIA') }}</p>
            <p class="text-white/80 leading-relaxed">{{ t('MAN_RENDIMIENTO') }}</p>
            <p class="text-white/80 leading-relaxed">{{ t('MAN_EVOLUCION') }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-2xl font-black monotech uppercase tracking-tighter text-white">
            {{ t('SURVIVE_TITLE') }}
          </h3>
          <div class="w-20 h-[2px] bg-white/10"></div>
          <p class="text-white/80 leading-relaxed">{{ t('SURVIVE_P1') }}</p>
          <p class="text-white/80 leading-relaxed">{{ t('SURVIVE_P2') }}</p>
          <ul class="list-disc pl-6 space-y-2 text-white/80">
            <li>{{ t('SURVIVE_LIST_ONE') }}</li>
            <li>{{ t('SURVIVE_LIST_TWO') }}</li>
            <li>{{ t('SURVIVE_LIST_THREE') }}</li>
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-2xl font-black monotech uppercase tracking-tighter text-white">
            {{ t('INFLUENCIA_TITLE') }}
          </h3>
          <div class="w-20 h-[2px] bg-white/10"></div>
          <p class="text-white/80 leading-relaxed">{{ t('INFLUENCIA_P1') }}</p>
          <p class="text-white/80 leading-relaxed">{{ t('INFLUENCIA_P2') }}</p>
        </div>
      </div>
    </section>
  `,
})
export class AboutContainerComponent {
  private readonly i18n = inject(I18nService);
  t(key: any): string {
    return this.i18n.get(key);
  }
}
