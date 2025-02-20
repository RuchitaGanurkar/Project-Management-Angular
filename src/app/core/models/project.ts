import { Task } from "./task";

export interface Project {
    id: number;
    name: string;
    team: string;
    status: 'active' | 'completed' | 'on-hold';
    currentWeekStatus: string;
    nextWeekFocus: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
  }