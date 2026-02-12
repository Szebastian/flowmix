import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly darkModeSignal = signal<boolean>(true);
  
  isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.setDarkMode(isDark);
  }

  setDarkMode(isDark: boolean): void {
    this.darkModeSignal.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkModeSignal());
  }
}
