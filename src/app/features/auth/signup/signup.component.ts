
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
        <h2>Sign Up</h2>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username" 
            type="text" 
            formControlName="username" 
            class="form-control"
            [class.error]="submitted && f['username'].errors"
          >
          <div *ngIf="submitted && f['username'].errors" class="error-message">
            <div *ngIf="f['username'].errors?.['required']">Username is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            type="password" 
            formControlName="password" 
            class="form-control"
            [class.error]="submitted && f['password'].errors"
          >
          <div *ngIf="submitted && f['password'].errors" class="error-message">
            <div *ngIf="f['password'].errors?.['required']">Password is required</div>
            <div *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</div>
          </div>
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select 
            id="role" 
            formControlName="role" 
            class="form-control"
            [class.error]="submitted && f['role'].errors"
          >
            <option value="">Select Role</option>
            <option value="dev">Developer</option>
            <option value="project-manager">Project Manager</option>
          </select>
          <div *ngIf="submitted && f['role'].errors" class="error-message">
            <div *ngIf="f['role'].errors?.['required']">Role is required</div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="loading">
          {{ loading ? 'Loading...' : 'Sign Up' }}
        </button>

        <div *ngIf="error" class="error-message">
          {{error}}
        </div>

        <p class="auth-link">
          Already have an account? <a routerLink="/auth/login">Login</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .auth-form {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .btn {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }

    .btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .auth-link {
      text-align: center;
      margin-top: 20px;
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.signupForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.signup(
      this.f['username'].value,
      this.f['password'].value,
      this.f['role'].value
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }
}