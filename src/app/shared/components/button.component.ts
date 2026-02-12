import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'supporter' | 'insider' | 'partner';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      (click)="action.emit()"
      [ngClass]="getButtonClasses()"
      class="monotech font-black uppercase tracking-widest transition-all duration-300 rounded-2xl"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [],
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  fullWidth = input(false);
  disabled = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  action = output<void>();

  getButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center gap-3';
    const sizeClasses = {
      sm: 'text-xs py-2 px-3 rounded-lg',
      md: 'text-sm py-3 px-6 rounded-xl',
      lg: 'text-sm py-6 px-8 rounded-2xl tracking-[0.2em]',
    };

    const variantClasses = {
      primary:
        'bg-primary text-black shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_40px_rgba(0,209,255,0.6)] hover:brightness-110 hover:scale-[1.02]',
      secondary: 'bg-secondary text-white hover:shadow-[0_0_40px_rgba(189,0,255,0.5)]',
      outline: 'border border-primary text-primary hover:bg-primary hover:text-black',
      ghost: 'bg-transparent text-white hover:bg-white/10',
      supporter: 'border border-supporter text-supporter hover:bg-supporter hover:text-black shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]',
      insider: 'bg-insider text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:brightness-110 hover:scale-[1.02]',
      partner: 'bg-partner text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:brightness-110 hover:scale-[1.02]',
    };

    return `${baseClasses} ${this.fullWidth() ? 'w-full' : ''} ${sizeClasses[this.size()]} ${variantClasses[this.variant()]} ${
      this.disabled() ? 'opacity-50 cursor-not-allowed' : ''
    }`;
  }
}
