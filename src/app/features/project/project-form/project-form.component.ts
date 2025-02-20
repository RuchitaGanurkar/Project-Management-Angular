
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
        <h2>Create New Project</h2>

        <div class="form-group">
          <label for="name">Project Name</label>
          <input 
            id="name" 
            type="text" 
            formControlName="name" 
            class="form-control"
            [class.error]="submitted && f['name'].errors"
          >
          <div *ngIf="submitted && f['name'].errors" class="error-message">
            <div *ngIf="f['name'].errors?.['required']">Project name is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="team">Team</label>
          <select 
            id="team" 
            formControlName="team" 
            class="form-control"
            [class.error]="submitted && f['team'].errors"
          >
            <option value="">Select Team</option>
            <option value="Frontend Team">Frontend Team</option>
            <option value="Backend Team">Backend Team</option>
            <option value="QA Team">QA Team</option>
            <option value="DevOps Team">DevOps Team</option>
          </select>
          <div *ngIf="submitted && f['team'].errors" class="error-message">
            <div *ngIf="f['team'].errors?.['required']">Team is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="status">Initial Status</label>
          <select 
            id="status" 
            formControlName="status" 
            class="form-control"
            [class.error]="submitted && f['status'].errors"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
          </select>
          <div *ngIf="submitted && f['status'].errors" class="error-message">
            <div *ngIf="f['status'].errors?.['required']">Status is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="currentWeekStatus">Current Week Status</label>
          <textarea 
            id="currentWeekStatus" 
            formControlName="currentWeekStatus" 
            class="form-control"
            rows="3"
            [class.error]="submitted && f['currentWeekStatus'].errors"
          ></textarea>
          <div *ngIf="submitted && f['currentWeekStatus'].errors" class="error-message">
            <div *ngIf="f['currentWeekStatus'].errors?.['required']">Current week status is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="nextWeekFocus">Next Week Focus</label>
          <textarea 
            id="nextWeekFocus" 
            formControlName="nextWeekFocus" 
            class="form-control"
            rows="3"
            [class.error]="submitted && f['nextWeekFocus'].errors"
          ></textarea>
          <div *ngIf="submitted && f['nextWeekFocus'].errors" class="error-message">
            <div *ngIf="f['nextWeekFocus'].errors?.['required']">Next week focus is required</div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Project' }}
          </button>
        </div>

        <div *ngIf="error" class="error-message">
          {{error}}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .project-form {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h2 {
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 10px;
      }

      .project-form {
        padding: 20px;
      }
    }
  `]
})
export class ProjectFormComponent {
  projectForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.formBuilder.group({
      name: ['', Validators.required],
      team: ['', Validators.required],
      status: ['', Validators.required],
      currentWeekStatus: ['', Validators.required],
      nextWeekFocus: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.projectForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.projectForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.projectService.createProject({
      name: this.f['name'].value,
      team: this.f['team'].value,
      status: this.f['status'].value,
      currentWeekStatus: this.f['currentWeekStatus'].value,
      nextWeekFocus: this.f['nextWeekFocus'].value,
      tasks: []
    }).subscribe({
      next: () => {
        this.router.navigate(['/project']);
      },
      error: error => {
        this.error = error.message || 'Something went wrong';
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/project']);
  }
}