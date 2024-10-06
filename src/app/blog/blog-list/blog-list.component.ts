import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { BlogPost } from '../model/blog';
import { AuthServices } from '../../auth/auth.service';
import { Timestamp } from 'firebase/firestore';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css'
})
export class BlogListComponent implements OnInit {
  
  blogs: BlogPost[] = [];
  currentUser: any;
  isModalOpen: boolean = false;
  postToEdit: BlogPost | null = null;
  isDeleteModalOpen: boolean = false;
  currentBlogId: string | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private blogService: BlogService, private authService: AuthServices, private router: Router) {}

  ngOnInit() {
    this.loadBlogs();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  loadBlogs() {
    this.loading = true;
    this.errorMessage = null;
    this.blogService.getPosts().pipe(
      catchError(error => {
        this.loading = false;
        this.errorMessage = 'Failed to load blogs. Please try again later.';
        return of([]); 
      })
    ).subscribe(blogs => {
      this.blogs = blogs.map(blog => ({
        ...blog,
        createdAt: blog.createdAt instanceof Timestamp ? blog.createdAt.toDate() : blog.createdAt,
        likedBy: blog.likedBy || [],
        liked: (blog.likedBy || []).includes(this.currentUser?.uid)
      }));
      this.loading = false;
    });
  }

  onDelete(postId: string) {
    this.blogService.deletePost(postId).then(() => {
      this.loadBlogs();
      this.toggleDeleteModal(null);
    });
  }

  onLike(blog: BlogPost) {
    this.blogService.likePost(blog).then(() => {
      blog.liked = !blog.liked;
      blog.likes += blog.liked ? 1 : -1;
      if (blog.liked) {
        blog.likedBy.push(this.currentUser.uid);
      } else {
        blog.likedBy = blog.likedBy.filter(id => id !== this.currentUser.uid);
      }
    });
  }

  showEditForm(postId: string) {
    this.postToEdit = this.blogs.find(blog => blog.id === postId) || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.postToEdit = null;
  }

  onPostUpdated() {
    this.closeModal();
    this.loadBlogs();
  }

  toggleDeleteModal(blogId: string | null): void {
    this.isDeleteModalOpen = !this.isDeleteModalOpen;
    this.currentBlogId = blogId;
  }

  navigateToDetail(blogId: string) {
    this.router.navigate(['/blog/blog', blogId]);
  }
}