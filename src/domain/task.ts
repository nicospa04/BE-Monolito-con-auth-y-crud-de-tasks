export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskPage {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}
