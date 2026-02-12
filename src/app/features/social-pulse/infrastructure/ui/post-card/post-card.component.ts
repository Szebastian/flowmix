import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../domain/post.model';
import { UserCardComponent } from '@app/shared/components/user-card.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  template: `
    <div class="break-inside-avoid mb-6">
      <div class="rounded-3xl overflow-hidden border border-white/10 neon-glow-cyan group relative">
        <img
          [src]="post().imageUrl"
          [alt]="post().content"
          class="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute bottom-0 left-0 right-0 glass m-3 p-4 rounded-2xl flex flex-col gap-3">
          
          <app-user-card
            [name]="post().author.displayName"
            [role]="'@' + post().author.username"
            [imageUrl]="post().author.avatar"
            variant="default"
            layout="horizontal"
            class="block"
          ></app-user-card>

          <p class="text-[10px] monotech leading-tight opacity-80 line-clamp-2">{{ post().content }}</p>

          <div class="flex items-center gap-4 text-primary px-2">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">favorite</span>
              <span class="monotech text-[9px] font-bold">{{ post().likes | number }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">chat_bubble</span>
              <span class="monotech text-[9px] font-bold">{{ post().comments }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PostCardComponent {
  post = input.required<Post>();
}
