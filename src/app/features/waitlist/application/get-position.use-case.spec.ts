import { TestBed } from '@angular/core/testing';
import { GetPositionUseCase } from './get-position.use-case';
import { WaitlistRepository } from '../domain/waitlist.repository';
import { WaitlistPosition } from '../domain/waitlist.model';

describe('GetPositionUseCase', () => {
  let useCase: GetPositionUseCase;
  let mockRepository: jasmine.SpyObj<WaitlistRepository>;

  const mockResponse: WaitlistPosition = {
    userId: 'user123',
    djName: 'Test DJ',
    email: 'test@test.com',
    position: 10,
    totalEntries: 200,
    joinedAt: new Date(),
    referral: 'Instagram'
  };

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('WaitlistRepository', ['getPosition']);

    TestBed.configureTestingModule({
      providers: [
        GetPositionUseCase,
        { provide: WaitlistRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(GetPositionUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should get position successfully', async () => {
    mockRepository.getPosition.and.returnValue(Promise.resolve(mockResponse));

    expect(useCase.loading()).toBeFalse();
    
    await useCase.execute('user123');

    expect(useCase.loading()).toBeFalse();
    expect(useCase.error()).toBeNull();
    expect(useCase.position()).toEqual(mockResponse);
    
    expect(mockRepository.getPosition).toHaveBeenCalledWith('user123');
  });

  it('should handle errors', async () => {
    const errorMsg = 'Not found';
    mockRepository.getPosition.and.rejectWith(new Error(errorMsg));

    await useCase.execute('user123');

    expect(useCase.loading()).toBeFalse();
    expect(useCase.error()).toBe(errorMsg);
    expect(useCase.position()).toBeNull();
  });
});
