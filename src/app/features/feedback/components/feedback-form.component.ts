import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '@app/core/i18n/i18n-service';
import { InputComponent } from '@app/shared/components/input.component';
import { ButtonComponent } from '@app/shared/components/button.component';
import { SupabaseService } from '@app/core/integrations/supabase.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="glass p-6 rounded-3xl border border-white/10 bg-black/40">
      <div class="space-y-3 mb-6 text-center">
        <h3 class="text-2xl font-black monotech uppercase tracking-tighter">{{ title }}</h3>
        <p class="text-white/40 text-xs monotech uppercase tracking-widest">{{ subtitle }}</p>
      </div>

      <form (ngSubmit)="onSubmit()" novalidate class="space-y-4">
        <app-input
          [id]="'feedback-email'"
          [label]="emailLabel"
          [type]="'email'"
          [placeholder]="emailPlaceholder"
          [value]="email()"
          (valueChange)="email.set($event)"
          [autocomplete]="'email'"
        ></app-input>

        <div class="relative">
          <label for="feedback-quote" class="block mb-2 text-sm font-medium text-gray-300">{{ quoteLabel }}</label>
          <textarea
            id="feedback-quote"
            [(ngModel)]="quoteValue"
            name="quote"
            rows="4"
            class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all font-mono text-sm"
            [placeholder]="quotePlaceholder"
          ></textarea>
        </div>

        <div class="space-y-2">
          <span class="block text-sm font-medium text-gray-300">{{ ratingLabel }}</span>
          <div class="flex items-center gap-2">
            @for (star of [1,2,3,4,5]; track star) {
              <button type="button" class="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                (click)="setRating(star)"
                [aria-pressed]="rating() === star"
                [attr.aria-label]="'Rate ' + star"
              >
                <span class="material-symbols-outlined text-xl" [class.text-yellow-400]="star <= rating()" [class.text-white/20]="star > rating()">star</span>
              </button>
            }
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <app-button [type]="'submit'" variant="primary" size="md" [disabled]="submitting()">
            {{ submitText }}
          </app-button>
        </div>
      </form>

      @if (message()) {
        <div class="mt-4 text-sm" [class.text-green-400]="success()" [class.text-red-400]="!success()">{{ message() }}</div>
      }
    </div>
  `
})
export class FeedbackFormComponent {
  i18n = inject(I18nService);
  supabase = inject(SupabaseService);

  email = signal('');
  quoteValue = '';
  rating = signal(0);
  submitting = signal(false);
  message = signal('');
  success = signal(false);

  setRating(val: number) {
    this.rating.set(val);
  }

  async onSubmit(): Promise<void> {
    this.submitting.set(true);
    this.message.set('');
    this.success.set(false);
    try {
      const email = this.email().trim();
      const quote = (this.quoteValue || '').trim();
      const rating = this.rating();
      if (!email || !quote) {
        this.message.set(this.i18n.get('FEEDBACK_FORM_ERROR'));
        this.success.set(false);
        return;
      }
      const prof = await this.supabase.getProfileByEmail(email);
      const userId = prof?.id || '';
      const res = await this.supabase.addFeedback({ userId, quote, rating });
      if (!res.ok) {
        this.message.set(res.error || this.i18n.get('FEEDBACK_FORM_ERROR'));
        this.success.set(false);
        return;
      }
      this.message.set(this.i18n.get('FEEDBACK_FORM_SUCCESS'));
      this.success.set(true);
      this.quoteValue = '';
      this.rating.set(0);
    } finally {
      this.submitting.set(false);
    }
  }

  get title(): string { return this.i18n.get('FEEDBACK_FORM_TITLE'); }
  get subtitle(): string { return this.i18n.get('FEEDBACK_FORM_SUBTITLE'); }
  get emailLabel(): string { return this.i18n.get('FEEDBACK_FORM_EMAIL_LABEL'); }
  get emailPlaceholder(): string { return this.i18n.get('EMAIL_ADDRESS'); }
  get quoteLabel(): string { return this.i18n.get('FEEDBACK_FORM_QUOTE_LABEL'); }
  get quotePlaceholder(): string { return this.i18n.get('FEEDBACK_FORM_QUOTE_PLACEHOLDER'); }
  get ratingLabel(): string { return this.i18n.get('FEEDBACK_FORM_RATING_LABEL'); }
  get submitText(): string { return this.i18n.get('FEEDBACK_FORM_SUBMIT'); }
}
