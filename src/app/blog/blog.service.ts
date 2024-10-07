import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc, query, where, arrayUnion, docData } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthServices } from '../auth/auth.service';
import { BlogComment, BlogPost } from './model/blog';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  
  constructor(private firestore: Firestore, private toastr: ToastrService, private authService: AuthServices ) {}

  public createPost(post: Omit<BlogPost, 'id' | 'likes'>) {
    const postsCollection = collection(this.firestore, 'posts');
    const postWithLikes = { ...post, likes: 0 };
    this.toastr.success('Blog added Successfully');
    return addDoc(postsCollection, postWithLikes);
  }

  public getPosts(): Observable<BlogPost[]> {
    const postsCollection = collection(this.firestore, 'posts');
    return collectionData(postsCollection, { idField: 'id' }).pipe(
      map(posts => posts as BlogPost[])
    );
  }

  public updatePost(id: string, post: Partial<BlogPost>) {
    const docRef = doc(this.firestore, `posts/${id}`);
    this.toastr.success('Blog updated Successfully');
    return updateDoc(docRef, { ...post, updatedAt: new Date() });
  }

  public deletePost(id: string) {
    const docRef = doc(this.firestore, `posts/${id}`);
    this.toastr.success('Blog deleted Successfully');
    return deleteDoc(docRef);
  }
    
  public async likePost(post: BlogPost): Promise<void> {
    const docRef = doc(this.firestore, `posts/${post.id}`);
  
    try {
      const currentUser = await this.authService.getCurrentUser().pipe(take(1)).toPromise();
  
      if (!currentUser) { return; }
  
      const currentUserId = currentUser.uid;
      const hasLiked = post.likedBy.includes(currentUserId);
      const updatedLikes = hasLiked ? post.likes - 1 : post.likes + 1;
      const updatedLikedBy = hasLiked ? post.likedBy.filter(id => id !== currentUserId) : [...post.likedBy, currentUserId];

      await updateDoc(docRef, { 
        likes: updatedLikes, 
        likedBy: updatedLikedBy 
      });
      this.toastr.success(hasLiked ? 'Like removed' : 'Post liked');
  
    } catch (error) {
      console.error('Error updating likes:', error);
      this.toastr.error('Failed to update likes. Please try again.');
    }
  }

  public getPostById(id: string): Observable<BlogPost> {
    const docRef = doc(this.firestore, `posts/${id}`);
    return docData(docRef, { idField: 'id' }).pipe(
      map(post => post as BlogPost)
    );
  }
 
  public async addComment(postId: string, comment: Omit<BlogComment, 'id' | 'createdAt'>): Promise<void> {
   const docRef = doc(this.firestore, `posts/${postId}`);
   const newComment: BlogComment = {
    ...comment,
    id: doc(collection(this.firestore, 'comments')).id,
    createdAt: new Date()
  };

  try {
    await updateDoc(docRef, {
      comments: arrayUnion(newComment)
    });
    this.toastr.success('Comment added successfully');
  } catch (error) {
    console.error('Error adding comment:', error);
    this.toastr.error('Failed to add comment. Please try again.');
  }
  }

  public getComments(postId: string): Observable<BlogComment[]> {
   return this.getPostById(postId).pipe(
   map(post => post.comments || [])
   );
  }
}