import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminStoreService {
  totalMembers = signal<string>('12.5K');
  waitlistCount = signal<number>(842);
  hoursStreamed = signal<string>('1.2M');
  countries = signal<number>(45);
  supporters = signal<number>(6200);
  insiders = signal<number>(4800);
  partners = signal<number>(150);
  private storageKey = 'admin_metrics';

  setTotalMembers(val: string) {
    this.totalMembers.set(val);
  }
  setWaitlistCount(val: number) {
    this.waitlistCount.set(val);
  }
  setHoursStreamed(val: string) {
    this.hoursStreamed.set(val);
  }
  setCountries(val: number) {
    this.countries.set(val);
  }
  setSupporters(val: number) {
    this.supporters.set(val);
  }
  setInsiders(val: number) {
    this.insiders.set(val);
  }
  setPartners(val: number) {
    this.partners.set(val);
  }

  constructor() {
    this.load();
  }

  save() {
    const payload = {
      totalMembers: this.totalMembers(),
      waitlistCount: this.waitlistCount(),
      hoursStreamed: this.hoursStreamed(),
      countries: this.countries(),
      supporters: this.supporters(),
      insiders: this.insiders(),
      partners: this.partners(),
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {}
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.totalMembers === 'string') this.totalMembers.set(data.totalMembers);
      if (typeof data.waitlistCount === 'number') this.waitlistCount.set(data.waitlistCount);
      if (typeof data.hoursStreamed === 'string') this.hoursStreamed.set(data.hoursStreamed);
      if (typeof data.countries === 'number') this.countries.set(data.countries);
      if (typeof data.supporters === 'number') this.supporters.set(data.supporters);
      if (typeof data.insiders === 'number') this.insiders.set(data.insiders);
      if (typeof data.partners === 'number') this.partners.set(data.partners);
    } catch {}
  }

  reset() {
    this.totalMembers.set('12.5K');
    this.waitlistCount.set(842);
    this.hoursStreamed.set('1.2M');
    this.countries.set(45);
    this.supporters.set(6200);
    this.insiders.set(4800);
    this.partners.set(150);
    this.save();
  }
}
