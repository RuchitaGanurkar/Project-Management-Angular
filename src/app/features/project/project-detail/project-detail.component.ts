// src/app/features/project/project-detail/project-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project';
import { Task } from '../../../core/models/task';
import { AuthService } from '../../../core/services/auth.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="project-detail-container" *ngIf="project">
      <div class="project-header">
        <h2>{{project.name}}</h2>
        <span class="status-badge" [class]="project.status">{{project.status}}</span>
      </div>

      <div class="content-wrapper">
        <div class="main-content">
          <section class="status-section">
            <h3>Project Status</h3>
            <div *ngIf="isEditMode; else statusDisplay">
              <form [formGroup]="statusForm" (ngSubmit)="updateStatus()">
                <div class="form-group">
                  <label>Current Week Status</label>
                  <textarea 
                    formControlName="currentWeekStatus" 
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Next Week Focus</label>
                  <textarea 
                    formControlName="nextWeekFocus" 
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>

                <div class="button-group">
                  <button type="submit" class="btn btn-primary">Save</button>
                  <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <ng-template #statusDisplay>
              <div class="status-info">
                <div class="info-group">
                  <h4>Current Week Status</h4>
                  <p>{{project.currentWeekStatus || 'No status update'}}</p>
                </div>

                <div class="info-group">
                  <h4>Next Week Focus</h4>
                  <p>{{project.nextWeekFocus || 'No focus set'}}</p>
                </div>

                <button 
                  *ngIf="isDeveloper()" 
                  class="btn btn-primary" 
                  (click)="enableEditMode()"
                >
                  Update Status
                </button>
              </div>
            </ng-template>
          </section>

          <section class="tasks-section">
            <h3>Tasks</h3>
            <div class="task-list">
              <div *ngFor="let task of project.tasks" class="task-item">
                <div class="task-header">
                  <span class="jira-id">{{task.jiraId}}</span>
                  <span class="status-badge" [class]="task.status">{{task.status}}</span>
                </div>
                <p class="task-description">{{task.description}}</p>
                <div class="task-actions" *ngIf="isDeveloper()">
                  <button 
                    class="btn btn-sm" 
                    [class.btn-success]="task.status === 'in-progress'"
                    [class.btn-primary]="task.status === 'done'"
                    (click)="toggleTaskStatus(task)"
                  >
                    {{task.status === 'in-progress' ? 'Mark Done' : 'Mark In Progress'}}
                  </button>
                </div>
              </div>

              <form *ngIf="isDeveloper()" [formGroup]="taskForm" (ngSubmit)="addTask()" class="new-task-form">
                <div class="form-group">
                  <input 
                    type="text" 
                    formControlName="jiraId" 
                    placeholder="JIRA ID (e.g., PROJ-123)"
                    class="form-control"
                  >
                </div>
                <div class="form-group">
                  <input 
                    type="text" 
                    formControlName="description" 
                    placeholder="Task description"
                    class="form-control"
                  >
                </div>
                <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">
                  Add Task
                </button>
              </form>
            </div>
          </section>
        </div>

        <div class="side-panel">
          <div class="project-info">
            <h3>Project Info</h3>
            <p><strong>Team:</strong> {{project.team}}</p>
            <p><strong>Created:</strong> {{project.createdAt | date}}</p>
            <p><strong>Last Updated:</strong> {{project.updatedAt | date}}</p>
            <p><strong>Total Tasks:</strong> {{project.tasks.length}}</p>
          </div>

          <div class="project-actions">
            <button 
              *ngIf="isProjectManager()" 
              class="btn btn-primary"
              (click)="exportPDF()"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project-detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .content-wrapper {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 30px;
    }

    .status-section,
    .tasks-section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .task-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .jira-id {
      font-weight: bold;
      color: #0052cc;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .status-badge.in-progress {
      background: #0052cc;
      color: white;
    }

    .status-badge.done {
      background: #28a745;
      color: white;
    }

    .task-actions {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 0.875rem;
    }

    .side-panel {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      height: fit-content;
    }

    .new-task-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }

    @media (max-width: 768px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }

      .side-panel {
        order: -1;
      }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  statusForm: FormGroup;
  taskForm: FormGroup;
  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.statusForm = this.formBuilder.group({
      currentWeekStatus: ['', Validators.required],
      nextWeekFocus: ['', Validators.required]
    });

    this.taskForm = this.formBuilder.group({
      jiraId: ['', [Validators.required, Validators.pattern(/^[A-Z]+-\d+$/)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.projectService.getProjectById(projectId).subscribe(project => {
      if (project) {
        this.project = project;
        this.statusForm.patchValue({
          currentWeekStatus: project.currentWeekStatus,
          nextWeekFocus: project.nextWeekFocus
        });
      }
    });
  }

  isDeveloper(): boolean {
    return this.authService.getCurrentUser()?.role === 'dev';
  }

  isProjectManager(): boolean {
    return this.authService.getCurrentUser()?.role === 'project-manager';
  }

  enableEditMode(): void {
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.project) {
      this.statusForm.patchValue({
        currentWeekStatus: this.project.currentWeekStatus,
        nextWeekFocus: this.project.nextWeekFocus
      });
    }
  }

  updateStatus(): void {
    if (this.statusForm.invalid || !this.project) return;

    this.projectService.updateProject(this.project.id, {
      currentWeekStatus: this.statusForm.get('currentWeekStatus')?.value,
      nextWeekFocus: this.statusForm.get('nextWeekFocus')?.value
    }).subscribe(updatedProject => {
      this.project = updatedProject;
      this.isEditMode = false;
    });
  }

  addTask(): void {
    if (this.taskForm.invalid || !this.project) return;

    this.projectService.addTask(this.project.id, {
      jiraId: this.taskForm.get('jiraId')?.value,
      description: this.taskForm.get('description')?.value,
      status: 'in-progress'
    }).subscribe(newTask => {
      if (this.project) {
        this.project.tasks.push(newTask);
        this.taskForm.reset();
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    if (!this.project) return;

    const newStatus = task.status === 'in-progress' ? 'done' : 'in-progress';
    this.projectService.updateTask(this.project.id, task.id, {
      status: newStatus
    }).subscribe(updatedTask => {
      const taskIndex = this.project?.tasks.findIndex((t: { id: any; }) => t.id === task.id) ?? -1;
      if (taskIndex !== -1 && this.project) {
        this.project.tasks[taskIndex] = updatedTask;
      }
    });
  }

  exportPDF(): void {
    console.log('Exporting project as PDF...');
  }
}