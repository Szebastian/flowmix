import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appGlassEffect]',
  standalone: true,
})
export class GlassEffectDirective {
  constructor(private el: ElementRef) {
    this.el.nativeElement.classList.add('glass');
  }
}
