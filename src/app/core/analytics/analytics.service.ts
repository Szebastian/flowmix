import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private counts = signal<Record<string, number>>({});

  track(event: string): void {
    const current = this.counts();
    this.counts.set({
      ...current,
      [event]: (current[event] || 0) + 1
    });
  }

  getCount(event: string): number {
    return this.counts()[event] || 0;
  }
}
