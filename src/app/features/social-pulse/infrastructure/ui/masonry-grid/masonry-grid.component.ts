import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../post-card/post-card.component';
import { Post } from '../../../domain/post.model';

@Component({
  selector: 'app-masonry-grid',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="masonry-grid">
      <ng-container *ngFor="let post of posts()">
        <app-post-card [post]="post" />
      </ng-container>
    </div>
  `,
  styles: [],
})
export class MasonryGridComponent {
  posts = input.required<Post[]>();
}
