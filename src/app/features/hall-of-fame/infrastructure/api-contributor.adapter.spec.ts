import { TestBed } from '@angular/core/testing';
import { ApiContributorAdapter } from './api-contributor.adapter';

describe('ApiContributorAdapter', () => {
  let service: ApiContributorAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiContributorAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock partners', async () => {
    const partners = await service.getPartners();
    expect(partners.length).toBeGreaterThan(0);
    expect(partners[0].tier).toBe('partner');
    expect(partners[0].badges.length).toBeGreaterThan(0);
  });

  it('should return mock insiders', async () => {
    const insiders = await service.getInsiders();
    expect(insiders.length).toBeGreaterThan(0);
    expect(insiders[0].tier).toBe('insider');
  });

  it('should return full contributors response', async () => {
    const response = await service.getContributors();
    expect(response.partners).toBeDefined();
    expect(response.insiders).toBeDefined();
    expect(response.supporters).toBeDefined();
    
    expect(response.partners.length).toBeGreaterThan(0);
    expect(response.insiders.length).toBeGreaterThan(0);
    // Supporters might be implemented or empty in mock, checking defined
    expect(Array.isArray(response.supporters)).toBeTrue();
  });
});
