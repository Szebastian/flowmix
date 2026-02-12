import { TestBed } from '@angular/core/testing';
import { GetContributorsUseCase } from './get-contributors.use-case';
import { ContributorRepository } from '../domain/contributor.repository';
import { ContributorResponse } from '../domain/contributor.model';

describe('GetContributorsUseCase', () => {
  let useCase: GetContributorsUseCase;
  let mockRepository: jasmine.SpyObj<ContributorRepository>;

  const mockResponse: ContributorResponse = {
    partners: [
      { id: '1', username: 'partner', displayName: 'Partner', tier: 'partner', badges: [], verifiedAt: new Date(), contributions: 10 }
    ],
    insiders: [],
    supporters: []
  };

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('ContributorRepository', ['getContributors']);

    TestBed.configureTestingModule({
      providers: [
        GetContributorsUseCase,
        { provide: ContributorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(GetContributorsUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should load contributors successfully', async () => {
    mockRepository.getContributors.and.returnValue(Promise.resolve(mockResponse));

    expect(useCase.loading()).toBeFalse();
    expect(useCase.contributors()).toBeNull();

    const promise = useCase.execute();
    
    // While executing, loading should be true (hard to test with async/await as it finishes fast in microtask)
    // But we can check final state
    await promise;

    expect(useCase.loading()).toBeFalse();
    expect(useCase.error()).toBeNull();
    expect(useCase.contributors()).toEqual(mockResponse);
    expect(mockRepository.getContributors).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const errorMsg = 'Network error';
    mockRepository.getContributors.and.rejectWith(new Error(errorMsg));

    await useCase.execute();

    expect(useCase.loading()).toBeFalse();
    expect(useCase.error()).toBe(errorMsg);
    expect(useCase.contributors()).toBeNull();
  });
});
