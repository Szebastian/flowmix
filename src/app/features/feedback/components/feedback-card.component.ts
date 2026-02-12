import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '@app/shared/components/user-card.component';
import { Feedback } from '../models/feedback.model';

@Component({
  selector: 'app-feedback-card',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  template: `
    <div class="h-full relative group">
        <!-- Quote Bubble -->
        <div class="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl mb-4 group-hover:bg-white/10 transition-colors">
            <!-- Quote Icon -->
            <div class="absolute -top-3 -left-2 bg-black/50 border border-white/10 rounded-full p-2">
                <span class="material-symbols-outlined text-primary text-xl">format_quote</span>
            </div>
            
            <p class="text-white/80 monotech text-sm leading-relaxed italic">
                "{{ feedback().quote }}"
            </p>

            @if (feedback().rating) {
                <div class="flex gap-1 mt-3">
                    @for (star of [1,2,3,4,5]; track star) {
                        <span class="material-symbols-outlined text-xs" 
                              [class.text-yellow-400]="star <= (feedback().rating || 0)"
                              [class.text-white/10]="star > (feedback().rating || 0)">star</span>
                    }
                </div>
            }
        </div>

        <!-- User Info -->
        <div class="pl-4">
            <app-user-card 
                [name]="feedback().name"
                [role]="feedback().role"
                [imageUrl]="feedback().imageUrl"
                variant="default"
                layout="horizontal"
            />
        </div>
    </div>
  `
})
export class FeedbackCardComponent {
  feedback = input.required<Feedback>();
}
