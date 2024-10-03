import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  @Input() formType: 'login' | 'register' = 'login';
  @Input() isLoading: boolean = false;
  @Input() formGroup!: FormGroup;

  @Output() submitForm = new EventEmitter<void>(); 

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.formType === 'register') {
      this.formGroup.addControl('repeatpassword', this.fb.control('', [Validators.required]));
    }
  }

  get emailError(): string {
    const field = this.formGroup.get('email');
    if (field?.touched && field?.invalid) {
      if (field.hasError('required')) {
        return 'Can\'t be empty';
      } else if (field.hasError('email')) {
        return 'Enter a valid email';
      }
    }
    return '';
  }

  get usernameError(): string {
    const field = this.formGroup.get('username');
    if (field?.touched && field?.invalid) {
      if (field.hasError('required')) {
        return 'Can\'t be empty';
      }
    }
    return '';
  }

  get passwordError(): string {
    const field = this.formGroup.get('password');
    if (field?.touched && field?.invalid) {
      if (field.hasError('required')) {
        return 'Can\'t be empty';
      } else if (field.hasError('minlength')) {
        return 'At least 6 characters long';
      }
    }
    return '';
  }

  get repeatPasswordError(): string {
    const field = this.formGroup.get('repeatpassword');
    if (field?.touched && field?.invalid) {
      if (field.hasError('required')) {
        return 'Can\'t be empty';
      } else if (this.formGroup.hasError('mismatch')) {
        return 'Passwords must match';
      }
    }
    return '';
  }

  onSubmit() {
    
    if (this.formGroup.valid) {
      this.submitForm.emit();  
    } else {
      this.formGroup.markAllAsTouched();
      return;
    }
  }

}