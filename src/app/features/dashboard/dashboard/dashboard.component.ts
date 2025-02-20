
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Welcome, {{currentUser?.username}}</h1>
        <button class="btn btn-logout" (click)="logout()">Logout</button>
      </header>

      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total Projects</h3>
          <div class="stat-value">{{(totalProjects$ | async) || 0}}</div>
        </div>
        <div class="stat-card">
          <h3>Active Projects</h3>
          <div class="stat-value">{{(activeProjects$ | async) || 0}}</div>
        </div>
        <div class="stat-card">
          <h3>Completed Projects</h3>
          <div class="stat-value">{{(completedProjects$ | async) || 0}}</div>
        </div>
      </div>

      <div class="dashboard-content">
        <section class="recent-projects">
          <div class="section-header">
            <h2>Recent Projects</h2>
            <button 
              *ngIf="isProjectManager()" 
              class="btn btn-primary"
              routerLink="/project/create"
            >
              Create Project
            </button>
          </div>

          <div class="project-grid">
            <div *ngFor="let project of (recentProjects$ | async)" class="project-card">
              <div class="project-header">
                <h3>{{project.name}}</h3>
                <span class="status-badge" [class]="project.status">
                  {{project.status}}
                </span>
              </div>
              <div class="project-info">
                <p><strong>Team:</strong> {{project.team}}</p>
                <p><strong>Tasks:</strong> {{project.tasks.length}}</p>
                <p><strong>Updated:</strong> {{project.updatedAt | date:'short'}}</p>
              </div>
              <div class="project-footer">
                <button 
                  class="btn btn-primary"
                  [routerLink]="['/project', project.id]"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="task-summary" *ngIf="isDeveloper()">
          <h2>Your Tasks</h2>
          <div class="task-list">
            <div *ngFor="let task of (recentTasks$ | async)" class="task-item">
              <span class="jira-id">{{task.jiraId}}</span>
              <span class="task-desc">{{task.description}}</span>
              <span class="status-badge" [class]="task.status">
                {{task.status}}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .project-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .status-badge.active {
      background: #28a745;
      color: white;
    }

    .status-badge.completed {
      background: #17a2b8;
      color: white;
    }

    .status-badge.on-hold {
      background: #ffc107;
      color: black;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-item {
      background: white;
      border-radius: 4px;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .jira-id {
      font-weight: bold;
      color: #0052cc;
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

    .btn-logout {
      background: #dc3545;
      color: white;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  projects$: Observable<Project[]>;
  totalProjects$: Observable<number>;
  activeProjects$: Observable<number>;
  completedProjects$: Observable<number>;
  recentProjects$: Observable<Project[]>;
  recentTasks$: Observable<any[]>;

  constructor(
    private authService: AuthService,
    private projectService: ProjectService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.projects$ = this.projectService.getProjects();
    
    this.totalProjects$ = this.projects$.pipe(
      map(projects => projects.length)
    );

    this.activeProjects$ = this.projects$.pipe(
      map(projects => projects.filter(p => p.status === 'active').length)
    );

    this.completedProjects$ = this.projects$.pipe(
      map(projects => projects.filter(p => p.status === 'completed').length)
    );

    this.recentProjects$ = this.projects$.pipe(
      map(projects => 
        [...projects]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 6)
      )
    );

    this.recentTasks$ = this.projects$.pipe(
      map(projects => {
        const allTasks = projects.flatMap(p => p.tasks);
        return allTasks
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
      })
    );
  }

  ngOnInit() {}

  isProjectManager(): boolean {
    return this.currentUser?.role === 'project-manager';
  }

  isDeveloper(): boolean {
    return this.currentUser?.role === 'dev';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}