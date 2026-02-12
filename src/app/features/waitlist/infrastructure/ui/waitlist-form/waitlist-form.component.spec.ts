import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitlistFormComponent } from './waitlist-form.component';
import { I18nService } from '@app/core/i18n/i18n-service';
import { signal } from '@angular/core';
import { SupabaseService } from '@app/core/integrations/supabase.service';

describe('WaitlistFormComponent', () => {
  let component: WaitlistFormComponent;
  let fixture: ComponentFixture<WaitlistFormComponent>;
  let mockI18nService: any;
  let mockSupabaseService: any;

  beforeEach(async () => {
    mockI18nService = {
      language: signal('es'),
      get: jasmine.createSpy('get').and.callFake((key: string) => key)
    };

    mockSupabaseService = {
      getProfileByEmail: jasmine.createSpy('getProfileByEmail').and.returnValue(Promise.resolve(null)),
      isDjNameAvailable: jasmine.createSpy('isDjNameAvailable').and.returnValue(Promise.resolve(true))
    };

    await TestBed.configureTestingModule({
      imports: [WaitlistFormComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService },
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WaitlistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Step 1: Identity', () => {
    it('should be invalid initially', () => {
      expect(component.isStep1Valid()).toBeFalse();
    });

    it('should accept alias with letters and spaces', () => {
      component.fullName.set('Juan Perez');
      component.djName.set('dj pepe');
      component.email.set('test@example.com');
      expect(component.isAliasValid()).toBeTrue();
      expect(component.isStep1Valid()).toBeTrue();
    });

    it('should be valid when all fields are filled correctly', () => {
      component.fullName.set('Juan Perez');
      component.djName.set('DJ Test');
      component.email.set('test@example.com');
      // DJ name check status usually defaults to 'none' or needs to be 'available'
      // The validation logic checks if length >= 2 and status !== 'taken'
      
      expect(component.isStep1Valid()).toBeTrue();
    });

    it('should validate email format', () => {
      component.fullName.set('Juan Perez');
      component.djName.set('DJ Test');
      component.email.set('invalid-email');
      expect(component.isStep1Valid()).toBeFalse();
      
      component.email.set('valid@email.com');
      expect(component.isStep1Valid()).toBeTrue();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      // Setup valid Step 1
      component.fullName.set('Juan Perez');
      component.djName.set('DJ Test');
      component.email.set('test@example.com');
    });

    it('should proceed to step 2 when step 1 is valid', () => {
      component.nextStep();
      expect(component.step()).toBe(2);
    });

    it('should not proceed if step is invalid', () => {
      component.email.set(''); // Invalidate
      component.nextStep();
      expect(component.step()).toBe(1);
      expect(component.showErrors()).toBeTrue();
    });

    it('should allow going back', () => {
      component.nextStep();
      expect(component.step()).toBe(2);
      
      component.prevStep();
      expect(component.step()).toBe(1);
    });
  });

  describe('Step 2: Technical', () => {
    beforeEach(() => {
      // Fast forward to Step 2
      component.userName.set('TestUser');
      component.djName.set('DJ Test');
      component.email.set('test@example.com');
      component.step.set(2);
    });

    it('should be invalid initially', () => {
      expect(component.isStep2Valid()).toBeFalse();
    });

    it('should populate OS versions dynamically', () => {
      component.os.set('Windows');
      fixture.detectChanges();
      const versions = component.osVersions();
      expect(versions).toContain('Windows 11');
      
      component.os.set('macOS');
      fixture.detectChanges();
      expect(component.osVersions()).toContain('Sonoma');
    });

    it('should be valid when all fields are selected', () => {
      component.country.set('Argentina');
      component.os.set('Windows');
      component.osVersion.set('Windows 11');
      component.architecture.set('x64');
      expect(component.isStep2Valid()).toBeTrue();
    });

    // New Audio Preferences Tests
    describe('Audio Preferences', () => {
      it('should have MP3 and WAV selected by default', () => {
        const formats = component.audioFormats();
        expect(formats).toContain('mp3');
        expect(formats).toContain('wav');
        expect(formats.length).toBe(2);
      });

      it('should toggle audio formats correctly', () => {
        // Toggle MP3 off
        component.toggleAudioFormat('mp3');
        expect(component.audioFormats()).not.toContain('mp3');
        expect(component.audioFormats()).toContain('wav');

        // Toggle FLAC on
        component.toggleAudioFormat('flac');
        expect(component.audioFormats()).toContain('flac');
      });
    });
  });

  describe('Step 3: Confirmation', () => {
    beforeEach(() => {
      // Fast forward to Step 3
      component.userName.set('TestUser');
      component.djName.set('DJ Test');
      component.email.set('test@example.com');
      
      component.country.set('Argentina');
      component.os.set('Windows');
      component.osVersion.set('Windows 11');
      component.architecture.set('x64');

      component.step.set(3);
    });

    it('should be valid initially', () => {
      expect(component.isStep3Valid()).toBeTrue();
    });

    it('should emit onSubmitForm when valid and submitted', () => {
      component.currentSoftware.set('Rekordbox');
      
      spyOn(component.onSubmitForm, 'emit');
      
      component.onSubmit();
      
      expect(component.onSubmitForm.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        userName: 'TestUser',
        email: 'test@example.com',
        currentSoftware: 'Rekordbox',
        os: 'Windows',
        architecture: 'x64',
        audioFormats: jasmine.arrayContaining(['mp3', 'wav'])
      }));
    });
  });
});
