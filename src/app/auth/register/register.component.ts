import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServices } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthServices) {}

  ngOnInit(): void {
    this.initializeSignup();
  }

  initializeSignup() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatpassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password');
    const repeatPassword = form.get('repeatpassword');

    if (password?.value !== repeatPassword?.value) {
      repeatPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }
  
  async handleSignup() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, username, password } = this.registerForm.getRawValue();

      try {
        const response = await this.authService.register(email, username, password);
        this.isLoading = false;

        if (response.success) {
          this.router.navigate(['']);
        }
      } catch (error) {
        this.isLoading = false;
        console.error('Error during registration:', error);
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['']);
  }

  onGoogleLogin() {
    this.authService.googleSignIn().subscribe(
      (response) => {
        if (response.success) {
          this.router.navigate(['/blog']);
        }
      },
      (err: any) => {
        console.error('Error during Google login:', err);
      }
    );
  }
}