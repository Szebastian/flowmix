import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '@app/core/i18n/i18n-service';
import { FeedbackCardComponent } from './components/feedback-card.component';
import { FeedbackFormComponent } from './components/feedback-form.component';
import { Feedback } from './models/feedback.model';
import { SupabaseService } from '@app/core/integrations/supabase.service';
import { InputComponent } from '@app/shared/components/input.component';
import { ButtonComponent } from '@app/shared/components/button.component';

@Component({
  selector: 'app-feedback-container',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedbackCardComponent, FeedbackFormComponent, InputComponent, ButtonComponent],
  template: `
    <section class="w-full max-w-7xl mx-auto px-6 py-24" id="feedback">
      <header class="text-center space-y-6 mb-16">
        <h2 class="text-4xl lg:text-5xl font-black monotech uppercase tracking-tighter text-white">
          {{ title }}
        </h2>
        <div class="w-32 h-1 bg-primary mx-auto"></div>
        <p class="monotech text-xs text-white/40 uppercase tracking-[0.3em]">
          {{ subtitle }}
        </p>
      </header>

      <div class="mb-12">
        <app-feedback-form />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div class="glass p-6 rounded-3xl border border-white/10 bg-black/40">
          <div class="space-y-3 mb-6">
            <h3 class="text-2xl font-black monotech uppercase tracking-tighter">{{ issueTitle }}</h3>
            <p class="text-white/40 text-xs monotech uppercase tracking-widest">{{ issueSubtitle }}</p>
          </div>
          <div class="space-y-4">
            <app-input
              [id]="'issue-email'"
              [label]="issueEmailLabel"
              [type]="'email'"
              [placeholder]="emailPlaceholder"
              [value]="issueEmail()"
              (valueChange)="issueEmail.set($event)"
              [autocomplete]="'email'"
            ></app-input>
            <div>
              <label for="issue-type" class="block mb-2 text-sm font-medium text-gray-300">{{ issueTypeLabel }}</label>
              <select
                id="issue-type"
                [(ngModel)]="issueTypeValue"
                name="issueType"
                class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all font-mono text-sm"
              >
                <option value="demo">{{ issueTypeDemo }}</option>
                <option value="installer">{{ issueTypeInstaller }}</option>
              </select>
            </div>
            <div>
              <label for="issue-desc" class="block mb-2 text-sm font-medium text-gray-300">{{ issueDescLabel }}</label>
              <textarea
                id="issue-desc"
                [(ngModel)]="issueDescValue"
                name="issueDesc"
                rows="4"
                class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all font-mono text-sm"
                [placeholder]="issueDescPlaceholder"
              ></textarea>
            </div>
            <div class="flex items-center justify-end">
              <app-button variant="primary" size="md" [disabled]="issueSubmitting()" (action)="submitIssue()">{{ issueSubmit }}</app-button>
            </div>
            @if (issueMessage()) {
              <div class="text-sm" [class.text-green-400]="issueSuccess()" [class.text-red-400]="!issueSuccess()">{{ issueMessage() }}</div>
            }
          </div>
        </div>

        <div class="glass p-6 rounded-3xl border border-white/10 bg-black/40">
          <div class="space-y-3 mb-6">
            <h3 class="text-2xl font-black monotech uppercase tracking-tighter">{{ featuresTitle }}</h3>
            <p class="text-white/40 text-xs monotech uppercase tracking-widest">{{ featuresSubtitle }}</p>
          </div>
          <div class="glass rounded-xl border border-white/10 bg-black/30 p-4 mb-6">
            <div class="flex flex-wrap items-center gap-4 justify-between">
              <div>
                <span class="monotech text-[10px] text-white/40 uppercase tracking-widest">{{ votesSummaryLabel }}</span>
                <div class="text-white font-semibold">
                  {{ featureCategoryInputLabel }}: 
                  <span class="text-primary">{{ filterCategory === 'all' ? featureFilterAll : featureCategoryLabel(filterCategory) }}</span>
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <span class="monotech text-[10px] text-white/40 uppercase tracking-widest">{{ totalVotesLabel }}</span>
                  <span class="font-bold">{{ totals().total }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="monotech text-[10px] text-supporter uppercase">{{ supporterLabel }}</span>
                  <span class="font-bold">{{ totals().supporter }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="monotech text-[10px] text-insider uppercase">{{ insiderLabel }}</span>
                  <span class="font-bold">{{ totals().insider }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="monotech text-[10px] text-partner uppercase">{{ partnerLabel }}</span>
                  <span class="font-bold">{{ totals().partner }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="md:col-span-2">
              <label for="feature-filter" class="block mb-2 text-sm font-medium text-gray-300">{{ featureFilterLabel }}</label>
              <select
                id="feature-filter"
                [(ngModel)]="filterCategory"
                name="filterCategory"
                (ngModelChange)="refreshFeatures()"
                class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all font-mono text-sm"
              >
                <option value="all">{{ featureFilterAll }}</option>
                <option value="ux">{{ featureCategoryLabel('ux') }}</option>
                <option value="audio_engine">{{ featureCategoryLabel('audio_engine') }}</option>
                <option value="integrations">{{ featureCategoryLabel('integrations') }}</option>
                <option value="performance">{{ featureCategoryLabel('performance') }}</option>
                <option value="compatibility">{{ featureCategoryLabel('compatibility') }}</option>
              </select>
            </div>
          </div>
          <div class="space-y-4 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <app-input
                [id]="'feature-email'"
                [label]="featureEmailLabel"
                [type]="'email'"
                [placeholder]="emailPlaceholder"
                [value]="featureEmail()"
                (valueChange)="featureEmail.set($event)"
                [autocomplete]="'email'"
              ></app-input>
              <app-input
                [id]="'feature-title'"
                [label]="featureTitleLabel"
                [type]="'text'"
                [placeholder]="featureTitlePlaceholder"
                [value]="featureTitle()"
                (valueChange)="featureTitle.set($event)"
              ></app-input>
            </div>
            <div>
              <label for="feature-desc" class="block mb-2 text-sm font-medium text-gray-300">{{ featureDescLabel }}</label>
              <textarea
                id="feature-desc"
                [(ngModel)]="featureDescValue"
                name="featureDesc"
                rows="3"
                class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all font-mono text-sm"
                [placeholder]="featureDescPlaceholder"
              ></textarea>
            </div>
            <div>
              <label for="feature-cat" class="block mb-2 text-sm font-medium text-gray-300">{{ featureCategoryInputLabel }}</label>
              <select
                id="feature-cat"
                [(ngModel)]="featureCategory"
                name="featureCategory"
                class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all font-mono text-sm"
              >
                <option value="ux">{{ featureCategoryLabel('ux') }}</option>
                <option value="audio_engine">{{ featureCategoryLabel('audio_engine') }}</option>
                <option value="integrations">{{ featureCategoryLabel('integrations') }}</option>
                <option value="performance">{{ featureCategoryLabel('performance') }}</option>
                <option value="compatibility">{{ featureCategoryLabel('compatibility') }}</option>
              </select>
            </div>
            <div class="flex items-center justify-end">
              <app-button variant="insider" size="md" [disabled]="featureSubmitting()" (action)="submitFeature()">{{ featureSubmit }}</app-button>
            </div>
            @if (featureMessage()) {
              <div class="text-sm" [class.text-green-400]="featureSuccess()" [class.text-red-400]="!featureSuccess()">{{ featureMessage() }}</div>
            }
          </div>
          <div class="space-y-6">
            @for (feat of features(); track feat.id) {
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <span class="font-semibold">{{ feat.title }}</span>
                  <app-button variant="secondary" size="sm" (action)="vote(feat.id)">{{ voteLabel }}</app-button>
                </div>
                <div class="space-y-1">
                  <div class="flex items-center gap-3">
                    <span class="monotech text-[10px] text-supporter uppercase">{{ supporterLabel }}</span>
                    <div class="h-2 bg-white/10 rounded-full w-full">
                      <div class="h-2 bg-supporter rounded-full" [style.width.%]="barWidth(feat.supporter)"></div>
                    </div>
                    <span class="text-white/50 text-xs">{{ feat.supporter }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="monotech text-[10px] text-insider uppercase">{{ insiderLabel }}</span>
                    <div class="h-2 bg-white/10 rounded-full w-full">
                      <div class="h-2 bg-insider rounded-full" [style.width.%]="barWidth(feat.insider)"></div>
                    </div>
                    <span class="text-white/50 text-xs">{{ feat.insider }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="monotech text-[10px] text-partner uppercase">{{ partnerLabel }}</span>
                    <div class="h-2 bg-white/10 rounded-full w-full">
                      <div class="h-2 bg-partner rounded-full" [style.width.%]="barWidth(feat.partner)"></div>
                    </div>
                    <span class="text-white/50 text-xs">{{ feat.partner }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (item of feedbacks(); track item.id) {
          <app-feedback-card [feedback]="item" class="h-full block" />
        }
      </div>
    </section>
  `
})
export class FeedbackContainerComponent implements OnInit {
  i18n = inject(I18nService);
  supabase = inject(SupabaseService);

  feedbacks = signal<Feedback[]>([]);
  issueEmail = signal('');
  issueTypeValue: 'demo' | 'installer' = 'demo';
  issueDescValue = '';
  issueSubmitting = signal(false);
  issueMessage = signal('');
  issueSuccess = signal(false);

  features = signal<{ id: string; title: string; supporter: number; insider: number; partner: number; total: number }[]>([]);
  maxVotes = computed(() => {
    const arr = this.features();
    return arr.reduce((m, f) => Math.max(m, f.total, f.supporter, f.insider, f.partner), 1);
  });
  featureEmail = signal('');
  featureTitle = signal('');
  featureDescValue = '';
  featureSubmitting = signal(false);
  featureMessage = signal('');
  featureSuccess = signal(false);
  featureCategory: 'ux' | 'audio_engine' | 'integrations' | 'performance' | 'compatibility' = 'ux';
  filterCategory: 'all' | 'ux' | 'audio_engine' | 'integrations' | 'performance' | 'compatibility' = 'all';
  totals = computed(() => {
    const arr = this.features();
    return {
      total: arr.reduce((s, f) => s + (f.total || 0), 0),
      supporter: arr.reduce((s, f) => s + (f.supporter || 0), 0),
      insider: arr.reduce((s, f) => s + (f.insider || 0), 0),
      partner: arr.reduce((s, f) => s + (f.partner || 0), 0),
    };
  });

  async ngOnInit(): Promise<void> {
    const { data, error } = await this.supabase.listFeedbacks(12);
    if (error) {
      this.feedbacks.set([
        {
          id: 'fallback-1',
          name: 'DJ K-Lix',
          role: 'apoyo',
          quote: 'The audio analysis is unlike anything I have seen. It completely changed how I organize my library.',
          rating: 5
        },
        {
          id: 'fallback-2',
          name: 'Sarah Pulse',
          role: 'interno',
          quote: 'Finally, a tool that understands the technical side of DJing without overcomplicating the workflow.',
          rating: 5
        },
        {
          id: 'fallback-3',
          name: 'Mike Deep',
          role: 'socio',
          quote: 'Integration with FLAC support is a game changer for audiophiles. Pristine quality.',
          rating: 4
        }
      ]);
      return;
    }
    this.feedbacks.set(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        quote: row.quote,
        rating: row.rating
      }))
    );
    const fv = await this.supabase.listFeatureRequestsWithVotes(8);
    if (fv.error) {
      this.features.set([
        { id: 'f1', title: 'Soporte VST en análisis', supporter: 32, insider: 18, partner: 6, total: 56 },
        { id: 'f2', title: 'Modo Performance en vivo', supporter: 28, insider: 22, partner: 11, total: 61 },
        { id: 'f3', title: 'Exportación avanzada FLAC', supporter: 40, insider: 30, partner: 9, total: 79 }
      ]);
    } else {
      this.features.set(fv.data ?? []);
    }
  }

  get title(): string {
    return this.i18n.get('FEEDBACK_TITLE');
  }

  get subtitle(): string {
    return this.i18n.get('FEEDBACK_SUBTITLE');
  }

  get issueTitle(): string { return this.i18n.get('ISSUE_REPORT_TITLE'); }
  get issueSubtitle(): string { return this.i18n.get('ISSUE_REPORT_SUBTITLE'); }
  get issueEmailLabel(): string { return this.i18n.get('ISSUE_REPORT_EMAIL_LABEL'); }
  get emailPlaceholder(): string { return this.i18n.get('EMAIL_ADDRESS'); }
  get issueTypeLabel(): string { return this.i18n.get('ISSUE_REPORT_TYPE_LABEL'); }
  get issueTypeDemo(): string { return this.i18n.get('ISSUE_REPORT_TYPE_DEMO'); }
  get issueTypeInstaller(): string { return this.i18n.get('ISSUE_REPORT_TYPE_INSTALLER'); }
  get issueDescLabel(): string { return this.i18n.get('ISSUE_REPORT_DESCRIPTION_LABEL'); }
  get issueDescPlaceholder(): string { return this.i18n.get('ISSUE_REPORT_DESCRIPTION_PLACEHOLDER'); }
  get issueSubmit(): string { return this.i18n.get('ISSUE_REPORT_SUBMIT'); }

  get featuresTitle(): string { return this.i18n.get('FEATURE_REQUESTS_TITLE'); }
  get featuresSubtitle(): string { return this.i18n.get('MOST_VOTED_BY_MEMBERSHIP'); }
  get voteLabel(): string { return this.i18n.get('VOTE'); }
  get supporterLabel(): string { return this.i18n.get('SUPPORTER'); }
  get insiderLabel(): string { return this.i18n.get('INSIDER'); }
  get partnerLabel(): string { return this.i18n.get('PARTNER'); }
  get featureEmailLabel(): string { return this.i18n.get('FEATURE_PROPOSE_EMAIL_LABEL'); }
  get featureTitleLabel(): string { return this.i18n.get('FEATURE_PROPOSE_TITLE_LABEL'); }
  get featureTitlePlaceholder(): string { return this.i18n.get('FEATURE_PROPOSE_TITLE_PLACEHOLDER'); }
  get featureDescLabel(): string { return this.i18n.get('FEATURE_PROPOSE_DESCRIPTION_LABEL'); }
  get featureDescPlaceholder(): string { return this.i18n.get('FEATURE_PROPOSE_DESCRIPTION_PLACEHOLDER'); }
  get featureSubmit(): string { return this.i18n.get('FEATURE_PROPOSE_SUBMIT'); }
  get featureCategoryInputLabel(): string { return this.i18n.get('FEATURE_CATEGORY_LABEL'); }
  get featureFilterLabel(): string { return this.i18n.get('FEATURE_FILTER_LABEL'); }
  get featureFilterAll(): string { return this.i18n.get('FEATURE_FILTER_ALL'); }
  get votesSummaryLabel(): string { return this.i18n.get('FEATURE_VOTES_SUMMARY'); }
  get totalVotesLabel(): string { return this.i18n.get('TOTAL_VOTES'); }
  featureCategoryLabel(cat: 'ux' | 'audio_engine' | 'integrations' | 'performance' | 'compatibility'): string {
    switch (cat) {
      case 'ux': return this.i18n.get('FEATURE_CATEGORY_UX');
      case 'audio_engine': return this.i18n.get('FEATURE_CATEGORY_AUDIO_ENGINE');
      case 'integrations': return this.i18n.get('FEATURE_CATEGORY_INTEGRATIONS');
      case 'performance': return this.i18n.get('FEATURE_CATEGORY_PERFORMANCE');
      case 'compatibility': return this.i18n.get('FEATURE_CATEGORY_COMPATIBILITY');
    }
  }

  barWidth(count: number): number {
    const max = this.maxVotes();
    const pct = Math.round((count / (max || 1)) * 100);
    return Math.max(5, Math.min(100, pct));
  }

  async submitIssue(): Promise<void> {
    this.issueSubmitting.set(true);
    this.issueMessage.set('');
    this.issueSuccess.set(false);
    try {
      const email = this.issueEmail().trim();
      const desc = (this.issueDescValue || '').trim();
      const type = this.issueTypeValue;
      if (!email || !desc) {
        this.issueMessage.set(this.i18n.get('ISSUE_REPORT_ERROR'));
        this.issueSuccess.set(false);
        return;
      }
      const res = await this.supabase.reportIssue({ email, type, description: desc });
      if (!res.ok) {
        this.issueMessage.set(res.error || this.i18n.get('ISSUE_REPORT_ERROR'));
        this.issueSuccess.set(false);
        return;
      }
      this.issueMessage.set(this.i18n.get('ISSUE_REPORT_SUCCESS'));
      this.issueSuccess.set(true);
      this.issueDescValue = '';
    } finally {
      this.issueSubmitting.set(false);
    }
  }

  async vote(id: string): Promise<void> {
    await this.supabase.voteFeature({ featureId: id });
    const fv = await this.supabase.listFeatureRequestsWithVotes(8, this.filterCategory === 'all' ? undefined : this.filterCategory);
    if (!fv.error) this.features.set(fv.data ?? []);
  }

  async submitFeature(): Promise<void> {
    this.featureSubmitting.set(true);
    this.featureMessage.set('');
    this.featureSuccess.set(false);
    try {
      const email = this.featureEmail().trim();
      const title = this.featureTitle().trim();
      const desc = (this.featureDescValue || '').trim();
      if (!title) {
        this.featureMessage.set(this.i18n.get('FEATURE_PROPOSE_ERROR'));
        this.featureSuccess.set(false);
        return;
      }
      let userId: string | undefined;
      if (email) {
        const prof = await this.supabase.getProfileByEmail(email);
        userId = prof?.id || undefined;
      }
      const res = await this.supabase.addFeatureRequest({ title, description: desc, userId, category: this.featureCategory });
      if (!res.ok) {
        this.featureMessage.set(res.error || this.i18n.get('FEATURE_PROPOSE_ERROR'));
        this.featureSuccess.set(false);
        return;
      }
      this.featureMessage.set(this.i18n.get('FEATURE_PROPOSE_SUCCESS'));
      this.featureSuccess.set(true);
      this.featureTitle.set('');
      this.featureDescValue = '';
      const fv = await this.supabase.listFeatureRequestsWithVotes(8, this.filterCategory === 'all' ? undefined : this.filterCategory);
      if (!fv.error) this.features.set(fv.data ?? []);
    } finally {
      this.featureSubmitting.set(false);
    }
  }
  async refreshFeatures(): Promise<void> {
    const fv = await this.supabase.listFeatureRequestsWithVotes(8, this.filterCategory === 'all' ? undefined : this.filterCategory);
    if (!fv.error) this.features.set(fv.data ?? []);
  }
}
