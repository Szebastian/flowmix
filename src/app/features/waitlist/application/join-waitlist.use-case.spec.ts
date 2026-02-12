import { TestBed } from '@angular/core/testing';
import { JoinWaitlistUseCase } from './join-waitlist.use-case';
import { WaitlistRepository } from '../domain/waitlist.repository';
import { WaitlistDataService } from '@app/core/waitlist/waitlist-data.service';
import { JoinWaitlistRequest, WaitlistPosition } from '../domain/waitlist.model';

describe('JoinWaitlistUseCase', () => {
  let useCase: JoinWaitlistUseCase;
  let mockRepository: jasmine.SpyObj<WaitlistRepository>;
  let mockDataService: jasmine.SpyObj<WaitlistDataService>;

  const mockRequest: JoinWaitlistRequest = {
    djName: 'Test DJ',
    email: 'test@test.com',
    country: 'US',
    gender: 'not_specified',
    referral: 'Instagram',
    consentMarketing: true
  };

  const mockResponse: WaitlistPosition = {
    userId: '123',
    djName: 'Test DJ',
    email: 'test@test.com',
    position: 5,
    totalEntries: 100,
    joinedAt: new Date()
  };

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('WaitlistRepository', ['joinWaitlist']);
    mockDataService = jasmine.createSpyObj('WaitlistDataService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        JoinWaitlistUseCase,
        { provide: WaitlistRepository, useValue: mockRepository },
        { provide: WaitlistDataService, useValue: mockDataService }
      ]
    });

    useCase = TestBed.inject(JoinWaitlistUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should join waitlist successfully', async () => {
    mockRepository.joinWaitlist.and.returnValue(Promise.resolve(mockResponse));

    expect(useCase.loading()).toBeFalse();
    
    await useCase.execute(mockRequest);

    expect(useCase.loading()).toBeFalse();
    expect(useCase.error()).toBeNull();
    expect(useCase.success()).toEqual(mockResponse);
    
    expect(mockRepository.joinWaitlist).toHaveBeenCalledWith(mockRequest);
    expect(mockDataService.add).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const errorMsg = 'Repository error';
    mockRepository.joinWaitlist.and.rejectWith(new Error(errorMsg));

    await useCase.execute(mockRequest);

    expect(useCase.loading()).toBeFalse();
    expect(useCase.error()).toBe(errorMsg);
    expect(useCase.success()).toBeNull();
    
    expect(mockDataService.add).not.toHaveBeenCalled();
  });

  it('should reset state', () => {
    mockRepository.joinWaitlist.and.returnValue(Promise.resolve(mockResponse));
    
    useCase.execute(mockRequest).then(() => {
        expect(useCase.success()).not.toBeNull();
        
        useCase.reset();
        
        expect(useCase.loading()).toBeFalse();
        expect(useCase.error()).toBeNull();
        expect(useCase.success()).toBeNull();
    });
  });
});
