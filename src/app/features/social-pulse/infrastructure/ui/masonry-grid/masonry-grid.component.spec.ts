import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasonryGridComponent } from './masonry-grid.component';
import { Post } from '../../../domain/post.model';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-post-card',
  standalone: true,
  template: '<div class="post-card-mock">{{post?.content}}</div>'
})
class MockPostCardComponent {
  @Input() post: any;
}

describe('MasonryGridComponent', () => {
  let component: MasonryGridComponent;
  let fixture: ComponentFixture<MasonryGridComponent>;

  const mockPosts: Post[] = [
    {
      id: '1',
      content: 'Post 1',
      imageUrl: '',
      likes: 1,
      comments: 1,
      shares: 0,
      source: 'instagram',
      createdAt: new Date(),
      author: { id: 'u1', username: 'u1', displayName: 'U1', avatar: '' }
    },
    {
      id: '2',
      content: 'Post 2',
      imageUrl: '',
      likes: 2,
      comments: 2,
      shares: 0,
      source: 'custom',
      createdAt: new Date(),
      author: { id: 'u2', username: 'u2', displayName: 'U2', avatar: '' }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasonryGridComponent]
    })
    .overrideComponent(MasonryGridComponent, {
      set: {
        imports: [MockPostCardComponent, /** CommonModule */]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasonryGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('posts', mockPosts);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct number of posts', () => {
    const cards = fixture.nativeElement.querySelectorAll('.post-card-mock');
    expect(cards.length).toBe(2);
  });

  it('should pass data to post cards', () => {
    const firstCard = fixture.nativeElement.querySelector('.post-card-mock');
    expect(firstCard.textContent).toContain('Post 1');
  });
});
