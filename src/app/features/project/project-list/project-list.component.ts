// src/app/features/project/project-list/project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="project-list-container">
      <div class="filters">
        <div class="filter-group">
          <label for="team">Team</label>
          <select [formControl]="teamFilter" class="filter-control">
            <option value="">All Teams</option>
            <option *ngFor="let team of teams" [value]="team">{{team}}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="status">Status</label>
          <select [formControl]="statusFilter" class="filter-control">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      <div class="projects-grid">
        <div *ngFor="let project of filteredProjects$ | async" class="project-card">
          <div class="project-header">
            <h3>{{project.name}}</h3>
            <span class="status-badge" [class]="project.status">{{project.status}}</span>
          </div>
          
          <div class="project-info">
            <p><strong>Team:</strong> {{project.team}}</p>
            <p><strong>Tasks:</strong> {{project.tasks.length}}</p>
            <p><strong>Updated:</strong> {{project.updatedAt | date:'short'}}</p>
          </div>

          <div class="project-footer">
            <button class="btn btn-primary" [routerLink]="['/project', project.id]">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project-list-container {
      padding: 20px;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-control {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .project-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .project-header h3 {
      margin: 0;
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

    .project-info {
      margin-bottom: 15px;
    }

    .project-info p {
      margin: 5px 0;
    }

    .project-footer {
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

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        gap: 10px;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectListComponent implements OnInit {
  teamFilter = new FormControl('');
  statusFilter = new FormControl('');
  teams: string[] = [];
  projects$: Observable<Project[]>;
  filteredProjects$: Observable<Project[]>;

  constructor(private projectService: ProjectService) {
    this.projects$ = this.projectService.getProjects();
    
    // Initialize filteredProjects$ in constructor
    this.filteredProjects$ = combineLatest([
      this.projects$,
      this.teamFilter.valueChanges.pipe(startWith('')),
      this.statusFilter.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([projects, team, status]) => {
        return projects.filter(project => {
          const teamMatch = !team || project.team === team;
          const statusMatch = !status || project.status === status;
          return teamMatch && statusMatch;
        });
      })
    );
  }

  ngOnInit() {
    // Extract unique teams from projects
    this.projects$.subscribe(projects => {
      this.teams = [...new Set(projects.map(p => p.team))];
    });
  }
}