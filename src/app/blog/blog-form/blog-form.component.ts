import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage, ref, uploadBytes, getDownloadURL } from "@angular/fire/storage";
import { BlogService } from '../blog.service';
import { AuthServices } from '../../auth/auth.service';
import { BlogPost } from '../model/blog';

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.css'
})
export class BlogFormComponent implements OnInit {
  @Input() editMode = false;
  @Input() postToEdit: BlogPost | null = null;
  @Output() postAdded = new EventEmitter<void>();
  @Output() postUpdated = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();
  
  postForm!: FormGroup;
  currentUser: any;
  currentImageUrl: string | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private storage: Storage, private blogService: BlogService, private authService: AuthServices) {}

  ngOnInit() {
    this.initForm();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    if (this.editMode && this.postToEdit) {
      this.postForm.patchValue(this.postToEdit);
      this.currentImageUrl = this.postToEdit.imageUrl;
    }
  }

  private initForm() {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      image: [null, this.editMode ? null : Validators.required],
    });
  }

  get titleError(): string | null {
    const control = this.postForm.get('title');
    if (control?.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'Title is required.';
      }
      if (control.errors?.['minlength']) {
        return 'Title must be at least 3 characters long.';
      }
    }
    return null;
  }

  get contentError(): string | null {
    const control = this.postForm.get('content');
    if (control?.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'Content is required.';
      }
      if (control.errors?.['minlength']) {
        return 'Content must be at least 10 characters long.';
      }
    }
    return null;
  }

  get imageError(): string | null {
    const control = this.postForm.get('image');
    if (control?.invalid && control.touched) {
      return 'Image is required.';
    }
    return null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.postForm.patchValue({ image: file });
      this.postForm.get('image')?.updateValueAndValidity();
    }

    const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
  }

  async onSubmit() {
    if (this.postForm.valid) {
      this.isLoading = true;
      try {
        const { title, content, image } = this.postForm.value;
        let imageUrl: string | undefined = this.currentImageUrl || undefined;

        if (image && image instanceof File) {
          imageUrl = await this.uploadImage(image);
        }

        const post: Partial<BlogPost> = {
          title, content, imageUrl, authorId: this.currentUser.uid, authorName: this.currentUser.displayName, updatedAt: new Date(),
        };

        if (this.editMode && this.postToEdit) {
          await this.blogService.updatePost(this.postToEdit.id!, post);
          this.postUpdated.emit(this.postToEdit?.id);
          this.editMode = false
        } else {
          await this.blogService.createPost({
            ...post,
            createdAt: new Date(),
          } as BlogPost);
          this.postAdded.emit();
        }

        this.postForm.reset();
        this.currentImageUrl = null;
        this.closeModal();
      } catch (error) {
        console.error('Error submitting post:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async uploadImage(image: File): Promise<string> {
    const filePath = `blogImages/${new Date().getTime()}_${image.name}`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  }

  closeModal() {
    this.modalClosed.emit();
  }
}