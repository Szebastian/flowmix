import { Injectable } from '@angular/core';
import { SocialPulseRepository } from '../domain/social-pulse.repository';
import { SocialPulseResponse } from '../domain/post.model';

@Injectable({
  providedIn: 'root',
})
export class ApiSocialPulseAdapter extends SocialPulseRepository {
  // Instagram API configuration
  private readonly instagramAccessToken = '';  // Set your Instagram Graph API token here
  private readonly instagramBusinessAccountId = '';  // Set your Instagram Business Account ID here
  private readonly mockInstagramPosts = [
    {
      id: 'post_1',
      author: {
        id: 'author_1',
        username: '@flowmix_official',
        displayName: 'FLOWMIX Official',
      },
      content: 'Testing the new low-latency neural engine. Zero lag. #flowmix #audio',
      imageUrl:
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=625&fit=crop',
      likes: 1200,
      comments: 42,
      shares: 15,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      source: 'instagram' as const,
    },
    {
      id: 'post_2',
      author: {
        id: 'author_1',
        username: '@flowmix_official',
        displayName: 'FLOWMIX Official',
      },
      content: 'Real-time audio processing powered by open-source innovation 🎵',
      imageUrl:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=625&fit=crop',
      likes: 2150,
      comments: 87,
      shares: 42,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      source: 'instagram' as const,
    },
    {
      id: 'post_3',
      author: {
        id: 'author_1',
        username: '@flowmix_official',
        displayName: 'FLOWMIX Official',
      },
      content: 'Join our community of audio engineers and producers',
      imageUrl:
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=625&fit=crop',
      likes: 890,
      comments: 34,
      shares: 12,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      source: 'instagram' as const,
    },
    {
      id: 'post_4',
      author: {
        id: 'author_1',
        username: '@flowmix_official',
        displayName: 'FLOWMIX Official',
      },
      content: 'Beyond Audio Engine - Now available for beta testing 🚀',
      imageUrl:
        'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=625&fit=crop',
      likes: 3400,
      comments: 156,
      shares: 78,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      source: 'instagram' as const,
    },
    {
      id: 'post_5',
      author: {
        id: 'author_1',
        username: '@flowmix_official',
        displayName: 'FLOWMIX Official',
      },
      content: 'Introducing Hall of Fame - Recognizing our core contributors',
      imageUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=625&fit=crop',
      likes: 1560,
      comments: 62,
      shares: 28,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      source: 'instagram' as const,
    },
    {
      id: 'post_6',
      author: {
        id: 'author_1',
        username: '@flowmix_official',
        displayName: 'FLOWMIX Official',
      },
      content: 'Premium membership tiers now live - Supporter, Insider, Partner',
      imageUrl:
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&h=625&fit=crop',
      likes: 2240,
      comments: 95,
      shares: 54,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      source: 'instagram' as const,
    },
  ];

  constructor() {
    super();
  }

  async syncFeed(): Promise<SocialPulseResponse> {
    // If you have Instagram API credentials, uncomment and use this:
    // if (this.instagramAccessToken && this.instagramBusinessAccountId) {
    //   return this.fetchInstagramPosts();
    // }
    
    // Otherwise, return mock Instagram posts
    return {
      posts: this.mockInstagramPosts,
      totalPosts: this.mockInstagramPosts.length,
      lastSyncAt: new Date(),
    };
  }

  async getPosts(): Promise<SocialPulseResponse> {
    return this.syncFeed();
  }

  // Optional: Implement real Instagram API integration
  // private async fetchInstagramPosts(): Promise<SocialPulseResponse> {
  //   try {
  //     const response = await fetch(
  //       `https://graph.instagram.com/${this.instagramBusinessAccountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count&access_token=${this.instagramAccessToken}`
  //     );
  //     const data = await response.json();
  //     
  //     const posts = data.data.map((item: any) => ({
  //       id: item.id,
  //       author: {
  //         id: this.instagramBusinessAccountId,
  //         username: '@flowmix_official',
  //         displayName: 'FLOWMIX Official',
  //       },
  //       content: item.caption || 'Check out this post!',
  //       imageUrl: item.media_url,
  //       likes: item.like_count || 0,
  //       comments: item.comments_count || 0,
  //       shares: 0,
  //       createdAt: new Date(item.timestamp),
  //       source: 'instagram' as const,
  //     }));
  //
  //     return {
  //       posts,
  //       totalPosts: posts.length,
  //       lastSyncAt: new Date(),
  //     };
  //   } catch (error) {
  //     console.error('Error fetching Instagram posts:', error);
  //     throw error;
  //   }
  // }
}
