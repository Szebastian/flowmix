import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      <div class="text-gray-400 text-xs lg:text-sm font-medium mb-2 group-hover:text-primary transition-colors monotech uppercase tracking-wider">{{ label() }}</div>
      <div class="text-2xl md:text-3xl lg:text-4xl font-black font-display text-white mb-1 tracking-tight">{{ value() }}</div>
      @if (description()) {
        <div class="text-[10px] md:text-xs text-gray-500 font-medium">{{ description() }}</div>
      }
    </div>
  `
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  description = input<string>();
  variant = input<'default' | 'minimal'>('default');

  protected containerClasses() {
    if (this.variant() === 'minimal') {
      return "h-full flex flex-col justify-center group cursor-default";
    }
    return "glass p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all duration-300 group hover:bg-white/5";
  }
}
