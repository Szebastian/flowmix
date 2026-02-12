import { Injectable, signal, inject } from '@angular/core';
import { WaitlistRepository } from '../domain/waitlist.repository';
import {
  JoinWaitlistRequest,
  WaitlistPosition,
} from '../domain/waitlist.model';
import { WaitlistDataService } from '@app/core/waitlist/waitlist-data.service';

@Injectable({
  providedIn: 'root',
})
export class JoinWaitlistUseCase {
  private readonly waitlistRepository = inject(WaitlistRepository);
  private readonly data = inject(WaitlistDataService);

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly successSignal = signal<WaitlistPosition | null>(null);

  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  success = this.successSignal.asReadonly();

  async execute(request: JoinWaitlistRequest): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const position = await this.waitlistRepository.joinWaitlist(request);
      this.successSignal.set(position);
      const enriched: WaitlistPosition = {
        ...position,
        country: request.country,
        genre: request.genre,
        gender: request.gender,
        referral: request.referral,
        consentMarketing: request.consentMarketing,
        userName: request.userName,
        nationality: request.nationality,
        instagram: request.instagram,
        status: request.status,
      };
      this.data.add(enriched);
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Manejo amigable de errores
      if (
        errorMsg.includes('waitlist_email_key') || 
        (errorMsg.includes('duplicate key') && errorMsg.includes('email')) ||
        (error?.code === '23505' && !errorMsg.includes('username') && !errorMsg.includes('dj_name'))
      ) {
        this.errorSignal.set('¡Ya estás en la lista! Este correo ya ha sido registrado previamente. Pronto recibirás noticias nuestras.');
        setTimeout(() => this.errorSignal.set(null), 5000);
      } else if (errorMsg.includes('username') || errorMsg.includes('user_name')) {
        this.errorSignal.set('El nombre de usuario ya está en uso. Por favor intenta con otro.');
        setTimeout(() => this.errorSignal.set(null), 5000);
      } else if (errorMsg.includes('dj_name')) {
        this.errorSignal.set('El nombre de DJ ya está registrado. Por favor elige otro.');
        setTimeout(() => this.errorSignal.set(null), 5000);
      } else {
        this.errorSignal.set(errorMsg || 'Ocurrió un error inesperado.');
        setTimeout(() => this.errorSignal.set(null), 5000);
      }
    } finally {
      this.loadingSignal.set(false);
    }
  }

  reset(): void {
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
    this.successSignal.set(null);
  }
}
