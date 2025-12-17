export interface User {
    id: number;
    name: string;
    email: string;
    created_at: Date;
  }
  
  export interface ApiResponse {
    message: string;
  }

  export type TaskState = 'not_started' | 'in_progress' | 'complete';
  export type TaskColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

  export interface Task {
    id: number;
    title: string;
    description: string | null;
    state: TaskState;
    color: TaskColor;
    user_id: number | null;
    created_at: Date;
    updated_at: Date;
  }