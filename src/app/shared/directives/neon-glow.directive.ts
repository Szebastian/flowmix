import { Directive, ElementRef, input } from '@angular/core';

@Directive({
  selector: '[appNeonGlow]',
  standalone: true,
})
export class NeonGlowDirective {
  glowColor = input<'red' | 'blue' | 'green' | 'cyan' | 'violet'>('cyan');

  constructor(private el: ElementRef) {
    this.setupGlow();
  }

  private setupGlow(): void {
    const color = this.glowColor();
    this.el.nativeElement.classList.add(`neon-glow-${color}`);
  }
}
