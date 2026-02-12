import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-input
      [id]="id"
      [label]="label"
      [icon]="icon"
      [type]="type"
      [placeholder]="placeholder"
      [value]="value"
      [disabled]="disabled"
      [reveal]="reveal"
      [autoFocus]="autoFocus"
      (valueChange)="onValueChange($event)"
    ></app-input>
  `,
  imports: [InputComponent],
  standalone: true
})
class TestHostComponent {
  id = 'test-id';
  label = 'Test Label';
  icon = '';
  type = 'text';
  placeholder = 'Test Placeholder';
  value = '';
  disabled = false;
  reveal = false;
  autoFocus = false;
  onValueChange = jasmine.createSpy('onValueChange');
}

describe('InputComponent', () => {
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

  it('should render label when provided', () => {
    const labelElement = fixture.nativeElement.querySelector('label');
    expect(labelElement).toBeTruthy();
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should render icon when provided', () => {
    hostComponent.icon = 'search';
    fixture.detectChanges();
    const iconElement = fixture.nativeElement.querySelector('.material-symbols-outlined');
    expect(iconElement).toBeTruthy();
    expect(iconElement.textContent).toContain('search');
    
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.classList.contains('pl-14')).toBeTrue();
  });

  it('should emit valueChange on input', () => {
    const inputElement = fixture.nativeElement.querySelector('input');
    inputElement.value = 'New Value';
    inputElement.dispatchEvent(new Event('input'));
    
    expect(hostComponent.onValueChange).toHaveBeenCalledWith('New Value');
  });

  it('should handle disabled state', () => {
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.disabled).toBeFalse();

    hostComponent.disabled = true;
    fixture.detectChanges();
    expect(inputElement.disabled).toBeTrue();
  });

  it('should handle password reveal toggle', () => {
    hostComponent.type = 'password';
    hostComponent.reveal = true;
    fixture.detectChanges();

    const inputElement = fixture.nativeElement.querySelector('input');
    const toggleButton = fixture.nativeElement.querySelector('button');
    
    expect(inputElement.type).toBe('password');
    expect(toggleButton).toBeTruthy();

    toggleButton.click();
    fixture.detectChanges();
    expect(inputElement.type).toBe('text');
    
    toggleButton.click();
    fixture.detectChanges();
    expect(inputElement.type).toBe('password');
  });

  it('should autofocus if enabled', fakeAsync(() => {
    // Re-create component to test initialization logic
    const freshFixture = TestBed.createComponent(TestHostComponent);
    freshFixture.componentInstance.autoFocus = true;
    
    const inputElement = freshFixture.nativeElement.querySelector('input');
    spyOn(inputElement, 'focus');
    
    freshFixture.detectChanges();
    tick(); // wait for setTimeout(0)
    
    expect(inputElement.focus).toHaveBeenCalled();
  }));
});
