import { inject, Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User as FirebaseUser } from "@angular/fire/auth";
import { ToastrService } from "ngx-toastr";
import { from, Observable, switchMap } from "rxjs";
import { Storage, ref, uploadBytes, getDownloadURL } from "@angular/fire/storage";

@Injectable({
    providedIn: 'root'
})

export class AuthServices{
    firebaseAuth = inject(Auth);
    toastr = inject(ToastrService);
    storage = inject(Storage);

    register(email: string, username: string, password: string): Observable<{ success: boolean }>{
        const result = createUserWithEmailAndPassword(
            this.firebaseAuth,
            email,
            password,
        ).then(async (result) => {
          await updateProfile(result.user, { displayName: username });
            this.toastr.success('Registration Successful');
            return { success: true }; 
        }).catch(error => {
          this.toastr.error(error.message, 'Registration Error');
          return { success: false };
        });

        return from(result);
    }

    login(email: string, password: string): Observable<{ success: boolean }> {
        const result = signInWithEmailAndPassword(
          this.firebaseAuth,
          email,
          password
        ).then(() => {
          this.toastr.success('Login Successful');
          return { success: true };
        }).catch(error => {
          this.toastr.error(error.message, 'Login Error');
          return { success: false };
        });
      
        return from(result);
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
      return new Observable<FirebaseUser | null>((observer) => {
          const unsubscribe = onAuthStateChanged(this.firebaseAuth, (user) => {
              observer.next(user);
          });
          return { unsubscribe };
      });
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