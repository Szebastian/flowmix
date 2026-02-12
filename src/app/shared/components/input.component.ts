import { Component, input, output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full block group">
      <div class="relative w-full">
        @if (icon()) {
          <span class="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 group-focus-within:text-primary transition-colors select-none z-10" aria-hidden="true">
            {{ icon() }}
          </span>
        }
        
        <input
          #inputElement
          [id]="id()"
          [type]="type() === 'password' && reveal() ? (show ? 'text' : 'password') : type()"
          placeholder=" "
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur($event)"
          (focus)="onFocus($event)"
          [disabled]="disabled()"
          [class.pl-14]="icon()"
          [class.pl-6]="!icon()"
          [class.pr-14]="reveal() || showSuccess() || showError()"
          [class.pr-6]="!reveal() && !showSuccess() && !showError()"
          [class.border-partner]="showError()"
          [class.text-partner]="showError()"
          [attr.aria-label]="ariaLabel() || label() || placeholder()"
          [attr.name]="nameAttr()"
          [attr.autocomplete]="autocomplete()"
          class="input-base peer"
        />

        <!-- Floating Label -->
        <label 
          [for]="id()" 
          class="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none transition-all duration-200 peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary"
          [class.left-14]="icon()"
          [class.text-partner]="showError()"
        >
          {{ label() || placeholder() }}
        </label>

        <!-- Validation Icons -->
        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          @if (showSuccess()) {
            <span class="material-symbols-outlined text-supporter animate-in zoom-in duration-300">check_circle</span>
          }
          @if (showError()) {
            <span class="material-symbols-outlined text-partner animate-in zoom-in duration-300">cancel</span>
          }
        </div>

        @if (type() === 'password' && reveal()) {
          <button
            type="button"
            (click)="toggle()"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors z-10"
            aria-label="Mostrar/ocultar contraseña"
          >
            <span class="material-symbols-outlined text-[20px]">{{ show ? 'visibility_off' : 'visibility' }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    input.input-base {
      display: block;
      width: 100% !important;
      height: 64px !important;
      padding-top: 14px !important; /* Space for the floating label */
      box-sizing: border-box !important;
      appearance: none !important;
      background-color: transparent !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      outline: none !important;
      border-radius: 1rem !important;
      color: white !important;
      font-size: 1rem;
      transition: all 0.2s ease;
      margin: 0 !important;
    }

    input.input-base:focus {
      border-color: #00e5ff !important;
      box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.1) !important;
    }

    input.input-base:-webkit-autofill {
      -webkit-text-fill-color: white !important;
      -webkit-box-shadow: 0 0 0px 1000px #0a0a0a inset !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  `]
})
export class InputComponent implements AfterViewInit {
  id = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);
  label = input<string>();
  ariaLabel = input<string>();
  icon = input<string>();
  type = input<string>('text');
  nameAttr = input<string>();
  autocomplete = input<string>();
  placeholder = input<string>('');
  value = input<string>('');
  disabled = input<boolean>(false);
  reveal = input<boolean>(false);
  autoFocus = input<boolean>(false);
  
  // Validation markers
  showSuccess = input<boolean>(false);
  showError = input<boolean>(false);

  valueChange = output<string>();
  blur = output<FocusEvent>();
  focus = output<FocusEvent>();
  
  show = false;

  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    if (this.autoFocus()) {
      setTimeout(() => {
        this.inputElement.nativeElement.focus();
      }, 0);
    }
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onBlur(event: FocusEvent) {
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent) {
    this.focus.emit(event);
  }

  toggle() {
    this.show = !this.show;
  }
}
