import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipFormComponent } from './ui/membership-form.component';

@Component({
  selector: 'app-memberships-container',
  standalone: true,
  imports: [CommonModule, MembershipFormComponent],
  template: `
    <section class="w-full max-w-5xl mx-auto px-6 py-24">
      <app-membership-form />
    </section>
  `,
  styles: [],
})
export class MembershipsContainerComponent {}
