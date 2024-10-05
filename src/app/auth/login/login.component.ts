import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServices } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthServices) {}

  ngOnInit(): void {
    this.initializeLogin();
  }

  initializeLogin() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async handleLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.getRawValue();

      try {
        const response = await this.authService.login(email, password);
        this.isLoading = false;

        if (response.success) {
          this.router.navigate(['/blog']);
        }
      } catch (error) {
        this.isLoading = false;
        console.error('Error during login:', error);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
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