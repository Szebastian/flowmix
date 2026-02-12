import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@app/core/i18n/i18n-service';
import { SyncFeedUseCase } from './application/sync-feed.use-case';
import { ApiSocialPulseAdapter } from './infrastructure/api-social-pulse.adapter';
import { SocialPulseRepository } from './domain/social-pulse.repository';
import { MasonryGridComponent } from './infrastructure/ui/masonry-grid/masonry-grid.component';

@Component({
  selector: 'app-social-pulse-container',
  standalone: true,
  imports: [CommonModule, MasonryGridComponent],
  providers: [
    { provide: SocialPulseRepository, useClass: ApiSocialPulseAdapter },
    SyncFeedUseCase,
  ],
  template: `
    <section class="space-y-16 py-12 bg-black rounded-[3rem] -mx-4 px-4 border border-white/5 overflow-hidden">
      <header class="text-center space-y-4">
        <h2 class="text-5xl font-black monotech uppercase tracking-tighter">
          {{ socialPulseLabel }} <br />
          <span class="text-primary text-3xl">{{ realTimeFeedLabel }}</span>
        </h2>
        <div class="flex items-center justify-center gap-4">
          <div class="h-[1px] w-12 bg-primary/40"></div>
          <p class="monotech text-[10px] text-white/40 uppercase tracking-[0.3em]">
            {{ realTimeEcosystemLabel }}
          </p>
          <div class="h-[1px] w-12 bg-secondary/40"></div>
        </div>
      </header>
      @if (syncFeed.feed()?.posts?.length) {
        <app-masonry-grid [posts]="syncFeed.feed()!.posts" />
      }
      @if (syncFeed.loading()) {
        <div class="text-center text-white/40 py-12">
          <span class="monotech">{{ syncingLabel }}</span>
        </div>
      }
      @if (syncFeed.error()) {
        <div class="text-center text-red-400 py-12">
          <span class="monotech">{{ syncFeed.error() }}</span>
        </div>
      }
    </section>
  `,
  styles: [],
})
export class SocialPulseContainerComponent implements OnInit {
  syncFeed = inject(SyncFeedUseCase);
  private readonly i18n = inject(I18nService);
  language = this.i18n.language;

  get socialPulseLabel(): string {
    return this.i18n.get('SOCIAL_PULSE');
  }

  get realTimeFeedLabel(): string {
    return this.i18n.get('REAL_TIME_FEED');
  }

  get realTimeEcosystemLabel(): string {
    return this.i18n.get('REAL_TIME_FEEDS');
  }

  get syncingLabel(): string {
    return this.i18n.get('SYNCING_FEED');
  }

  ngOnInit(): void {
    this.syncFeed.execute();
  }
}
