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
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
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