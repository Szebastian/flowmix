import { Injectable, signal } from '@angular/core';
import { WaitlistPosition } from '@app/features/waitlist/domain/waitlist.model';

@Injectable({ providedIn: 'root' })
export class WaitlistDataService {
  private storageKey = 'waitlist_entries';
  private entriesSignal = signal<WaitlistPosition[]>([]);

  constructor() {
    this.load();
  }

  entries() {
    return this.entriesSignal();
  }

  add(entry: WaitlistPosition) {
    const next = [...this.entriesSignal(), entry];
    this.entriesSignal.set(next);
    this.save();
  }

  getCountsBy<K extends keyof WaitlistPosition>(field: K): { label: string; count: number }[] {
    const map = new Map<string, number>();
    for (const e of this.entriesSignal()) {
      const key = String(e[field] ?? '').trim();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  exportCSV(): string {
    const headers = [
      'userId',
      'djName',
      'email',
      'position',
      'totalEntries',
      'joinedAt',
      'country',
      'genre',
      'gender',
      'referral',
      'consentMarketing',
      'nationality',
      'instagram',
      'interests',
    ];
    const lines = [headers.join(',')];
    for (const e of this.entriesSignal()) {
      const row = [
        e.userId,
        this.escape(e.djName),
        this.escape(e.email),
        String(e.position),
        String(e.totalEntries),
        new Date(e.joinedAt).toISOString(),
        this.escape(e.country ?? ''),
        this.escape(e.genre ?? ''),
        this.escape(e.gender ?? ''),
        this.escape(e.referral ?? ''),
        String(e.consentMarketing ?? false),
        this.escape(e.nationality ?? ''),
        this.escape(e.instagram ?? ''),
        this.escape((e.interests ?? []).join('|')),
      ];
      lines.push(row.join(','));
    }
    return lines.join('\n');
  }

  private escape(value: string): string {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entriesSignal()));
    } catch {
      // Ignore write errors
    }
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WaitlistPosition[];
      this.entriesSignal.set(parsed);
    } catch {
      // Ignore read errors
    }
  }
}
