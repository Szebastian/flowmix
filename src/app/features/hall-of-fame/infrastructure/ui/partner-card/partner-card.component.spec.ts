import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerCardComponent } from './partner-card.component';
import { I18nService } from '@app/core/i18n/i18n-service';
import { signal } from '@angular/core';
import { Contributor } from '../../../domain/contributor.model';

describe('PartnerCardComponent', () => {
  let component: PartnerCardComponent;
  let fixture: ComponentFixture<PartnerCardComponent>;
  let mockI18nService: any;

  const mockContributor: Contributor = {
    id: 'c1',
    username: 'partner_user',
    displayName: 'Partner User',
    tier: 'partner',
    badges: [],
    verifiedAt: new Date(),
    contributions: 42,
    avatar: 'https://example.com/avatar.jpg'
  };

  beforeEach(async () => {
    mockI18nService = {
      language: signal('en'),
      get: jasmine.createSpy('get').and.callFake((key: string) => {
        const translations: any = {
          'FOUNDING_DONOR': 'Founding Donor',
          'FEEDBACK_HERO': 'Feedback Hero'
        };
        return translations[key] || key;
      })
    };

    await TestBed.configureTestingModule({
      imports: [PartnerCardComponent],
      providers: [
        { provide: I18nService, useValue: mockI18nService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contributor', mockContributor);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display contributor username', () => {
    const usernameEl = fixture.nativeElement.querySelector('h3');
    expect(usernameEl.textContent).toContain('Partner User');
  });

  it('should display translated labels', () => {
    expect(mockI18nService.get).toHaveBeenCalledWith('FOUNDING_DONOR');
    expect(mockI18nService.get).toHaveBeenCalledWith('FEEDBACK_HERO');
    
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Founding Donor');
    expect(textContent).toContain('Feedback Hero');
  });
});
