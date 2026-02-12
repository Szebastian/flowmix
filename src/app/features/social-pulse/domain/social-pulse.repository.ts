import { Injectable } from '@angular/core';
import { SocialPulseResponse } from './post.model';

@Injectable({
  providedIn: 'root',
})
export abstract class SocialPulseRepository {
  abstract syncFeed(): Promise<SocialPulseResponse>;

  abstract getPosts(): Promise<SocialPulseResponse>;
}
