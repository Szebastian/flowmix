import { TestBed } from '@angular/core/testing';
import { ApiSocialPulseAdapter } from './api-social-pulse.adapter';

describe('ApiSocialPulseAdapter', () => {
  let service: ApiSocialPulseAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiSocialPulseAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock posts when syncFeed is called', async () => {
    const response = await service.syncFeed();
    expect(response).toBeDefined();
    expect(response.posts.length).toBeGreaterThan(0);
    expect(response.totalPosts).toBe(response.posts.length);
    expect(response.lastSyncAt).toBeDefined();
    
    const firstPost = response.posts[0];
    expect(firstPost.source).toBe('instagram');
    expect(firstPost.author.username).toBe('@flowmix_official');
  });

  it('should return mock posts when getPosts is called', async () => {
    const response = await service.getPosts();
    expect(response).toBeDefined();
    expect(response.posts.length).toBeGreaterThan(0);
  });
});
