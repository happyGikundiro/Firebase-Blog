import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthServices } from '../../auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User as CustomUser } from '../../auth/model/model';
import { User as FirebaseUser } from '@angular/fire/auth';
import { Subscription, switchMap } from 'rxjs';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: CustomUser | null = null;
  firebaseUser: FirebaseUser | null = null;
  profileForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;

  userSubscription!: Subscription;
  updateSubscription!: Subscription;

  constructor(private authService: AuthServices, private fb: FormBuilder, private location: Location) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      profileImage: [null]
    });

    this.userSubscription = this.authService.getCurrentUser().subscribe(fbUser => {
      this.firebaseUser = fbUser;
      if (fbUser) {
        this.user = {
          email: fbUser.email || '', username: fbUser.displayName || '', password: '', photoURL: fbUser.photoURL || ''
        };
        this.profileForm.patchValue({
          displayName: fbUser.displayName || ''
        });
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  updateProfile() {
    if (!this.profileForm.valid || !this.firebaseUser) return;
  
    this.isLoading = true;
    const { displayName } = this.profileForm.value;
  
    const updateOperation$ = this.selectedFile
      ? this.authService.uploadProfileImage(this.firebaseUser, this.selectedFile).pipe(
          switchMap(photoURL => 
            this.authService.updateUserProfile(this.firebaseUser!, { displayName, photoURL })
          )
        )
      : this.authService.updateUserProfile(this.firebaseUser, { displayName });
  
    this.updateSubscription = updateOperation$.subscribe({
      next: () => {
        this.isLoading = false;
        if (this.user) {
          this.user.username = displayName;
          this.user.photoURL = this.firebaseUser?.photoURL || this.user.photoURL;
        }
        this.authService.toastr.success('Updated Successfully');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating profile:', error);
        this.authService.toastr.error('Update Failed');
      }
    });
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }
}