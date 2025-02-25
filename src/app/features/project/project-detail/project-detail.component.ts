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
  templateUrl:'./project-detail.component.html' ,
  styleUrls: ['./project-detail.component.css']


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
      description: ['', Validators.required],
      status: ['in-progress', Validators.required]
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
    console.log('Add Task clicked'); 
    
    if (this.taskForm.invalid || !this.project) {
      console.log('Form invalid or project null', this.taskForm.errors);
      return;
    }
  
    const newTask: Task = {
      id: Date.now(),
      projectId: this.project.id,
      jiraId: this.taskForm.get('jiraId')?.value,
      description: this.taskForm.get('description')?.value,
      status: this.taskForm.get('status')?.value || 'in-progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating new task:', newTask); 
    
    // Add to project tasks
    if (!this.project.tasks) {
      this.project.tasks = [];
    }
    this.project.tasks.push(newTask);
    
    this.saveToLocalStorage();
    
    this.taskForm.reset({
      status: 'in-progress'
    });
    
    console.log('Task added, project now:', this.project); 
  }

  private saveToLocalStorage(): void {
    if (!this.project) return;
    
    const projectsStr = localStorage.getItem('projects');
    const projects = projectsStr ? JSON.parse(projectsStr) : [];
    
    const index = projects.findIndex((p: any) => p.id === this.project!.id);
    if (index !== -1) {
      projects[index] = this.project;
    } else {
      projects.push(this.project);
    }
    
    localStorage.setItem('projects', JSON.stringify(projects));
    console.log('Saved to localStorage:', projects); 
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

   
    if (!this.project) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    let yPos = margin;

    doc.setFontSize(20);
    doc.text(`Project Report: ${this.project.name}`, margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.text(`Team: ${this.project.team}`, margin, yPos);
    yPos += 10;
    doc.text(`Status: ${this.project.status}`, margin, yPos);
    yPos += 10;
    doc.text(`Last Updated: ${new Date(this.project.updatedAt).toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    doc.setFontSize(16);
    doc.text('Current Week Status', margin, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(this.project.currentWeekStatus || 'No status update', margin, yPos, {
      maxWidth: 170
    });
    yPos += 15;


    doc.setFontSize(16);
    doc.text('Next Week Focus', margin, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(this.project.nextWeekFocus || 'No focus set', margin, yPos, {
      maxWidth: 170
    });
    yPos += 15;

    doc.setFontSize(16);
    doc.text('Tasks', margin, yPos);
    yPos += 10;
    doc.setFontSize(12);

    this.project.tasks.forEach((task: { jiraId: any; description: any; status: any; }) => {
      const taskText = `• ${task.jiraId}: ${task.description} (${task.status})`;
      doc.text(taskText, margin, yPos, {
        maxWidth: 170
      });
      yPos += 10;
    });

    doc.save(`${this.project.name}-report.pdf`);
  }



}