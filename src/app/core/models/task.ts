export interface Task {
    id: number;
    projectId: number;
    description: string;
    status: 'in-progress' | 'done';
    jiraId: string;
    createdAt: Date;
    updatedAt: Date;
  }