
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 
 './project-form.component.html'   
,
  styleUrl: 
    './project-form.component.css'
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