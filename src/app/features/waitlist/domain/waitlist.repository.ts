import { Injectable } from '@angular/core';
import { JoinWaitlistRequest, WaitlistPosition } from './waitlist.model';

@Injectable({ providedIn: 'root' })
export abstract class WaitlistRepository {
  abstract joinWaitlist(request: JoinWaitlistRequest): Promise<WaitlistPosition>;
  abstract getPosition(userId: string): Promise<WaitlistPosition>;
}