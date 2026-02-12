import { Component, inject, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '@app/core/i18n/i18n-service';
import { JoinWaitlistUseCase } from './application/join-waitlist.use-case';
import { GetPositionUseCase } from './application/get-position.use-case';
import { HttpWaitlistAdapter } from './infrastructure/http-waitlist.adapter';
import { WaitlistRepository } from './domain/waitlist.repository';
import { WaitlistFormComponent } from './infrastructure/ui/waitlist-form/waitlist-form.component';
import { JoinWaitlistRequest } from './domain/waitlist.model';
import { AnalyticsService } from '@app/core/analytics/analytics.service';

@Component({
  selector: 'app-waitlist-container',
  standalone: true,
  imports: [CommonModule, WaitlistFormComponent],
  providers: [
    { provide: WaitlistRepository, useClass: HttpWaitlistAdapter },
    JoinWaitlistUseCase,
    GetPositionUseCase,
    AnalyticsService,
  ],
  template: `
    <section class="scroll-mt-32 w-full flex justify-center lg:justify-end" id="waitlist">
      <div class="@container w-full max-w-[1100px]">
        <div class="glass p-1.5 rounded-[2rem] @xl:rounded-[3rem] border-primary/30 relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
          <div class="glass p-4 md:p-8 @xl:p-12 rounded-[1.8rem] @xl:rounded-[2.8rem] relative overflow-hidden">
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full"></div>
            
            <div class="flex flex-col gap-6 items-stretch">
              <div class="space-y-3 text-center @xl:text-left">
                <h2 class="text-3xl @xl:text-4xl font-black monotech uppercase tracking-tighter leading-none break-words">
                  {{ waitlistLabel }}
                </h2>
                <div class="h-1 w-20 bg-primary @xl:ml-0 mx-auto"></div>
              </div>
              
              <div class="w-full max-w-[860px] mx-auto">
                <p class="text-[10px] monotech text-white/60 uppercase tracking-widest font-bold mb-2">
                  {{ securePriorityLabel }}
                </p>
                <app-waitlist-form
                  [isLoading]="joinWaitlist.loading()"
                  [successPosition]="joinWaitlist.success()"
                  [errorMessage]="joinWaitlist.error()"
                  [membershipTierInput]="membershipTier()"
                  [startAtPayment]="startAtPayment()"
                  (onSubmitForm)="onJoinWaitlist($event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [],
})
export class WaitlistContainerComponent implements OnInit {
  membershipTier = input<string>('');
  startAtPayment = input<boolean>(false);
  joinWaitlist = inject(JoinWaitlistUseCase);
  getPosition = inject(GetPositionUseCase);
  private readonly i18n = inject(I18nService);
  language = this.i18n.language;
  private readonly analytics = inject(AnalyticsService);

  get waitlistLabel(): string {
    return this.i18n.get('WAITLIST');
  }

  get queueLabel(): string {
    return this.i18n.get('QUEUE');
  }

  get securePriorityLabel(): string {
    return this.i18n.get('SECURE_PRIORITY');
  }

  get confirmationMessage(): string {
    return this.language() === 'en' ? 'You secured your spot. Welcome to FLOWMIX!' : 'Has asegurado tu lugar. ¡Bienvenido a FLOWMIX!';
  }

  ngOnInit(): void {
    this.getPosition.execute('user_current');
  }

  onJoinWaitlist(request: JoinWaitlistRequest): void {
    this.analytics.track('waitlist_submit');
    this.joinWaitlist.execute(request);
  }
}
