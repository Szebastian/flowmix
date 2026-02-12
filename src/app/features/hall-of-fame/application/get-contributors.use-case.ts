import { Injectable, signal } from '@angular/core';
import { ContributorRepository } from '../domain/contributor.repository';
import { ContributorResponse } from '../domain/contributor.model';

@Injectable({
  providedIn: 'root',
})
export class GetContributorsUseCase {
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly contributorsSignal = signal<ContributorResponse | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  contributors = this.contributorsSignal.asReadonly();

  constructor(private readonly contributorRepository: ContributorRepository) {}

  async execute(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const contributors = await this.contributorRepository.getContributors();
      this.contributorsSignal.set(contributors);
    } catch (error) {
      this.errorSignal.set(
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
