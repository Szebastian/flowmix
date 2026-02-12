import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCardComponent } from './post-card.component';
import { Post } from '../../../domain/post.model';
import { Component, Input } from '@angular/core';

// Mock UserCardComponent
@Component({
  selector: 'app-user-card',
  standalone: true,
  template: '<div>User Card: {{name}}</div>'
})
class MockUserCardComponent {
  @Input() name = '';
  @Input() role = '';
  @Input() imageUrl = '';
  @Input() variant = '';
  @Input() layout = '';
}

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;

  const mockPost: Post = {
    id: '1',
    content: 'Test Content',
    imageUrl: 'https://example.com/image.jpg',
    likes: 100,
    comments: 20,
    shares: 5,
    source: 'instagram',
    createdAt: new Date(),
    author: {
      id: 'auth1',
      username: 'author',
      displayName: 'Author Name',
      avatar: 'https://example.com/avatar.jpg'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCardComponent],
    })
    .overrideComponent(PostCardComponent, {
      remove: { imports: [] }, // We can't easily remove real imports here in unit tests without complex setup, 
                               // but we can override the template or rely on NO_ERRORS_SCHEMA.
                               // Better approach: Stub the component in imports if possible, or use overrideComponent.
                               // Angular testing allows overriding components.
      add: { imports: [MockUserCardComponent] }
    })
    .compileComponents();

    // To properly mock standalone components in imports, we often need to override the component under test
    // OR just include the Mock in TestBed and let Angular resolve it (if it wasn't standalone).
    // Since it IS standalone and imported directly, we must override the imports of PostCardComponent.
    TestBed.overrideComponent(PostCardComponent, {
      set: {
        imports: [MockUserCardComponent, /** CommonModule is implied/needed */ ]
      }
    });

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', mockPost);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display post content', () => {
    const content = fixture.nativeElement.querySelector('p');
    expect(content.textContent).toContain('Test Content');
  });

  it('should display likes and comments', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('100'); // Likes
    expect(text).toContain('20');  // Comments
  });

  it('should render image', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('image.jpg');
    expect(img.alt).toBe('Test Content');
  });
});
