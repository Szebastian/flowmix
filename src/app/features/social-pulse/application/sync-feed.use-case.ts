import { Injectable, signal } from '@angular/core';
import { SocialPulseRepository } from '../domain/social-pulse.repository';
import { SocialPulseResponse } from '../domain/post.model';

@Injectable({
  providedIn: 'root',
})
export class SyncFeedUseCase {
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly feedSignal = signal<SocialPulseResponse | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  feed = this.feedSignal.asReadonly();

  constructor(private readonly socialPulseRepository: SocialPulseRepository) {}

  async execute(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const feed = await this.socialPulseRepository.syncFeed();
      this.feedSignal.set(feed);
    } catch (error) {
      this.errorSignal.set(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
