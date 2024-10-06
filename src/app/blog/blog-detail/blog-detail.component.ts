import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogService } from '../blog.service';
import { BlogPost, BlogComment } from '../model/blog';
import { Timestamp } from '@angular/fire/firestore';
import { AuthServices } from '../../auth/auth.service';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent implements OnInit {
  blogPost!: BlogPost | null;
  loading: boolean = true;
  errorMessage: string | null = null;
  comments: BlogComment[] = [];
  commentForm!: FormGroup;
  currentUser: any;

  constructor(
    private route: ActivatedRoute, private blogService: BlogService, private authService: AuthServices, private fb: FormBuilder, private location: Location) { }

  ngOnInit() {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(6)]]
    });

    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      this.blogService.getPostById(blogId).subscribe(
        post => {
          this.blogPost = this.convertTimestamps(post);
          this.comments = this.blogPost.comments || [];
          this.loading = false;
        },
        error => {
          this.errorMessage = 'Error fetching blog post';
          this.loading = false;
        }
      );
    }

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  addComment() {
    if (this.blogPost && this.currentUser && this.commentForm.valid) {
      const comment: Omit<BlogComment, 'id' | 'createdAt'> = {
        content: this.commentForm.get('content')?.value.trim(),
        authorId: this.currentUser.uid,
        authorName: this.currentUser.displayName || 'Anonymous'
      };

      this.blogService.addComment(this.blogPost.id, comment).then(() => {
        this.commentForm.reset();
        this.blogService.getComments(this.blogPost!.id).subscribe(
          comments => this.comments = comments.map(this.convertTimestamp)
        );
      });
    }
  }

  private convertTimestamps(post: BlogPost): BlogPost {
    return {
      ...post,
      createdAt: post.createdAt instanceof Timestamp ? post.createdAt.toDate() : post.createdAt,
      updatedAt: post.updatedAt instanceof Timestamp ? post.updatedAt.toDate() : post.updatedAt,
      comments: post.comments ? post.comments.map(this.convertTimestamp) : []
    };
  }

  private convertTimestamp(comment: BlogComment): BlogComment {
    return {
      ...comment,
      createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : comment.createdAt
    };
  }

  goBack() {
    this.location.back();
  }

  get contentControl() {
    return this.commentForm.get('content');
  }

  get contentInvalid() {
    return this.contentControl?.invalid && (this.contentControl?.dirty || this.contentControl?.touched);
  }

  get contentErrors() {
    if (this.contentControl?.errors) {
      if (this.contentControl.errors['required']) {
        return 'Comment is required.';
      }
      if (this.contentControl.errors['minlength']) {
        return 'Comment must be at least 6 character long.';
      }
    }
    return null;
  }
}