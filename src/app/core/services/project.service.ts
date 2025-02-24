
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Project } from '../models/project';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [];
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  constructor() {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      this.projects = JSON.parse(storedProjects);
      this.projectsSubject.next(this.projects);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }

  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  getProjectById(id: number): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === id);
    return of(project).pipe(delay(500));
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: []
    };

    this.projects.push(newProject);
    this.projectsSubject.next(this.projects);
    this.saveToLocalStorage();

    return of(newProject).pipe(delay(500));
  }

  updateProject(id: number, updates: Partial<Project>): Observable<Project> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');

    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date()
    };

    this.projectsSubject.next(this.projects);
    this.saveToLocalStorage();

    return of(this.projects[index]).pipe(delay(500));
  }

  addTask(projectId: number, task: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const newTask: Task = {
      ...task,
      id: Math.floor(Math.random() * 1000),
      projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.tasks.push(newTask);
    this.projectsSubject.next(this.projects);
    this.saveToLocalStorage();

    return of(newTask).pipe(delay(500));
  }

  updateTask(projectId: number, taskId: number, updates: Partial<Task>): Observable<Task> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    project.tasks[taskIndex] = {
      ...project.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.projectsSubject.next(this.projects);
    this.saveToLocalStorage();

    return of(project.tasks[taskIndex]).pipe(delay(500));
  }
}