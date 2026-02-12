import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <app-button
      [variant]="variant"
      [size]="size"
      [fullWidth]="fullWidth"
      [disabled]="disabled"
      (action)="onAction()"
    >
      Test Button
    </app-button>
  `,
  imports: [ButtonComponent],
  standalone: true
})
class TestHostComponent {
  variant: 'primary' | 'secondary' = 'primary';
  size: 'sm' | 'md' = 'md';
  fullWidth = false;
  disabled = false;
  onAction = jasmine.createSpy('onAction');
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should render content', () => {
    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.textContent).toContain('Test Button');
  });

  it('should apply variant classes', () => {
    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.classList.contains('bg-primary')).toBeTrue();

    hostComponent.variant = 'secondary';
    fixture.detectChanges();
    expect(buttonElement.classList.contains('bg-secondary')).toBeTrue();
  });

  it('should apply size classes', () => {
    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.classList.contains('text-sm')).toBeTrue(); // md size

    hostComponent.size = 'sm';
    fixture.detectChanges();
    expect(buttonElement.classList.contains('text-xs')).toBeTrue();
  });

  it('should apply full width class', () => {
    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.classList.contains('w-full')).toBeFalse();

    hostComponent.fullWidth = true;
    fixture.detectChanges();
    expect(buttonElement.classList.contains('w-full')).toBeTrue();
  });

  it('should handle disabled state', () => {
    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.classList.contains('opacity-50')).toBeFalse();

    hostComponent.disabled = true;
    fixture.detectChanges();
    expect(buttonElement.classList.contains('opacity-50')).toBeTrue();
    expect(buttonElement.classList.contains('cursor-not-allowed')).toBeTrue();
  });

  it('should emit action on click', () => {
    const buttonElement = fixture.nativeElement.querySelector('button');
    buttonElement.click();
    expect(hostComponent.onAction).toHaveBeenCalled();
  });
});
