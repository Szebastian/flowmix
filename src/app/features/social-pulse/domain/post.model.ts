export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  source: 'instagram' | 'custom';
}

export interface SocialPulseResponse {
  posts: Post[];
  totalPosts: number;
  lastSyncAt: Date;
}
