import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../model/model';
import { AuthServices } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm!: FormGroup;
  isLoading = false;
  user: User = {
    email:'',
    username: '',
    password: ''
  }

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthServices){}

  ngOnInit(): void {
    this.initializeSignup();
  }

  initializeSignup(){
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatpassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password');
    const repeatPassword = form.get('repeatpassword');

    if (password?.value !== repeatPassword?.value) {
      repeatPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }

  handleSignup() {
    if (this.registerForm.valid) {
      const getSignupValues = this.registerForm.getRawValue();
      this.isLoading = true;

      this.authService.register(getSignupValues.email, getSignupValues.username, getSignupValues.password).
      subscribe((response) => {
        this.isLoading = false; 
        if (response.success) {
          this.router.navigate(['']);
        }
      },(error) => {
        this.isLoading = false;
        console.error(error);
      });
    }else{
      this.registerForm.markAllAsTouched();
    }
  }

  getFormFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Can`t be empty';
    } else if (field?.hasError('email')) {
      return 'Enter a valid email';
    } else if (field?.hasError('minlength')) {
      return `At least 6 characters long`;
    }else if (fieldName === 'repeatpassword' && this.registerForm.hasError('mismatch')) {
      return 'Passwords must match';
    }
    return '';
  }

  navigateToLogin(): void{
    this.router.navigate([''])
  }

  onGoogleLogin() {
    this.authService.googleSignIn().subscribe(
      (response) => {
        if (response.success) {
          this.router.navigate(['/blog']);
        } else {
          console.error('Google login failed');
        }
      },
      (err: any) => {
        console.error('Error during Google login:', err);
      }
    );
  }
}