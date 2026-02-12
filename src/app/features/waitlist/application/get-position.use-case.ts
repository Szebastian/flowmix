import { Injectable, signal } from '@angular/core';
import { WaitlistRepository } from '../domain/waitlist.repository';
import { WaitlistRankingResponse } from '../domain/waitlist.model';

@Injectable({
  providedIn: 'root',
})
export class GetPositionUseCase {
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly positionSignal = signal<WaitlistRankingResponse | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  position = this.positionSignal.asReadonly();

  constructor(private readonly waitlistRepository: WaitlistRepository) {}

  async execute(userId: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const position = await this.waitlistRepository.getPosition(userId);
      this.positionSignal.set(position);
    } catch (error) {
      this.errorSignal.set(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
