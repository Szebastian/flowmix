import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UserCardVariant = 'default' | 'partner' | 'insider' | 'supporter';
export type UserCardLayout = 'horizontal' | 'vertical';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      <!-- Icon/Avatar Section -->
      <div [class]="headerClasses()">
        <div [class]="avatarClasses()">
          @if (imageUrl()) {
            <img [src]="imageSrc()" [alt]="name()" class="w-full h-full object-cover" loading="lazy" decoding="async">
          } @else if (icon()) {
            <span class="material-symbols-outlined" [class]="iconColorClass()">{{ icon() }}</span>
          } @else {
            <span class="text-lg font-bold text-gray-400">{{ name().charAt(0) }}</span>
          }
        </div>
        
        @if (layout() === 'vertical' && variant() !== 'insider') {
           <span class="material-symbols-outlined text-sm opacity-40" [class]="iconColorClass()">stars</span>
        }
      </div>

      <!-- Content Section -->
      <div [class]="contentClasses()">
        <div class="font-bold monotech truncate transition-colors" [class]="nameClasses()">{{ name() }}</div>
        <div class="monotech truncate uppercase tracking-wider" [class]="roleClasses()">{{ role() }}</div>
      </div>
    </div>
  `
})
export class UserCardComponent {
  name = input.required<string>();
  role = input.required<string>();
  imageUrl = input<string>();
  icon = input<string>();
  variant = input<UserCardVariant>('default');
  layout = input<UserCardLayout>('horizontal');

  containerClasses = computed(() => {
    const base = "glass border transition-all duration-300 group";
    const layout = this.layout() === 'horizontal' 
      ? "p-4 rounded-xl flex items-center gap-4 hover:bg-white/5" 
      : "p-6 rounded-3xl flex flex-col gap-4"; // Vertical matches 'insider' card style
    
    const colors = {
      default: "border-white/10",
      partner: "border-partner/20 hover:border-partner/50", // Partner usually has its own component, but just in case
      insider: "border-insider/20 hover:border-insider/50 neon-glow-blue",
      supporter: "border-supporter/20 hover:border-supporter/50 neon-glow-supporter"
    }[this.variant()];

    return `${base} ${layout} ${colors}`;
  });

  headerClasses = computed(() => {
    return this.layout() === 'horizontal' 
      ? "shrink-0" 
      : "flex items-center justify-between";
  });

  avatarClasses = computed(() => {
    const base = "flex items-center justify-center overflow-hidden border shrink-0 transition-transform group-hover:scale-105 duration-500";
    const size = this.layout() === 'horizontal' ? "w-12 h-12 rounded-full" : "w-12 h-12 rounded-xl";
    
    const colors = {
      default: "bg-gray-800 border-white/20",
      partner: "bg-partner/10 border-partner/30",
      insider: "bg-insider/10 border-insider/30",
      supporter: "bg-supporter/10 border-supporter/30"
    }[this.variant()];

    return `${base} ${size} ${colors}`;
  });

  contentClasses = computed(() => {
    return this.layout() === 'horizontal' ? "overflow-hidden" : "";
  });

  imageSrc = computed(() => {
    return this.imageUrl() || '';
  });

  nameClasses = computed(() => {
    const colors = {
      default: "text-white",
      partner: "text-white group-hover:text-partner",
      insider: "text-white group-hover:text-insider text-lg",
      supporter: "text-white group-hover:text-supporter"
    }[this.variant()];
    return colors;
  });

  roleClasses = computed(() => {
    const base = this.layout() === 'horizontal' ? "text-sm" : "text-[10px] mt-1";
    const colors = {
      default: "text-gray-400",
      partner: "text-white/40",
      insider: "text-white/40",
      supporter: "text-white/40"
    }[this.variant()];
    return `${base} ${colors}`;
  });

  iconColorClass = computed(() => {
     return {
      default: "text-white",
      partner: "text-partner",
      insider: "text-insider",
      supporter: "text-supporter"
    }[this.variant()];
  });
}
