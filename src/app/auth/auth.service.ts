import { inject, Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User as FirebaseUser } from "@angular/fire/auth";
import { ToastrService } from "ngx-toastr";
import { from, fromEventPattern, Observable, switchMap } from "rxjs";
import { Storage, ref, uploadBytes, getDownloadURL } from "@angular/fire/storage";

@Injectable({
    providedIn: 'root'
})

export class AuthServices{
    firebaseAuth = inject(Auth);
    toastr = inject(ToastrService);
    storage = inject(Storage);

    public async register(email: string, username: string, password: string): Promise<{ success: boolean }> {
      try {
          const result = await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
          await updateProfile(result.user, { displayName: username });
          this.toastr.success('Registration Successful');
          return { success: true };
      } catch (error: unknown) {
          if (error instanceof Error) {
              this.toastr.error(error.message, 'Registration Error');
          } else {
              this.toastr.error('An unknown error occurred', 'Registration Error');
          }
          return { success: false };
      }
    }
  
    public async login(email: string, password: string): Promise<{ success: boolean }> {
      try {
          await signInWithEmailAndPassword(this.firebaseAuth, email, password);
          this.toastr.success('Login Successful');
          return { success: true };
      } catch (error: unknown) {
          if (error instanceof Error) {
              this.toastr.error(error.message, 'Login Error');
          } else {
              this.toastr.error('An unknown error occurred', 'Login Error');
          }
          return { success: false };
      }
    }

    googleSignIn(): Observable<{ success: boolean }> {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
      });

      const result = signInWithPopup(this.firebaseAuth, provider)
        .then(() => {
          this.toastr.success('Login Successful');
          return { success: true };
        })
        .catch(error => {
          this.toastr.error(error.message, 'Login Error');
          return { success: false };
       });

        return from(result);
    }
      
    logout(): Observable<void> {
        const result = signOut(this.firebaseAuth).then(() => {
          this.toastr.success('Logout Successful');
        }).catch(error => {
          this.toastr.error(error.message, 'Logout Error');
        });
  
        return from(result);
    }

    getCurrentUser(): Observable<FirebaseUser | null> {
      return fromEventPattern<FirebaseUser | null>(
        (handler) => onAuthStateChanged(this.firebaseAuth, handler),
      );
    }
      
    uploadProfileImage(user: FirebaseUser, file: File): Observable<string> {
      const filePath = `profile-images/${user.uid}`;
      const storageRef = ref(this.storage, filePath);
        
      return from(uploadBytes(storageRef, file)).pipe(
          switchMap(() => from(getDownloadURL(storageRef)))
      );
    }

    updateUserProfile(user: FirebaseUser, profileData: { displayName?: string, photoURL?: string }): Observable<void> {
        return from(updateProfile(user, profileData));
    }
}