
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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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