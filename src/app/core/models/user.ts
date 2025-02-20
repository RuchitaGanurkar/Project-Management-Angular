export interface User {
    id: number;
    username: string;
    password: string;
    role: 'dev' | 'project-manager';
  }