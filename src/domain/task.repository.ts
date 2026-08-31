import { Task, TaskPage, TaskStatus } from './task';

export interface CreateTaskData {
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
}

export interface TaskPageQuery {
  page: number;
  limit: number;
  status?: TaskStatus;
}

export abstract class TaskRepository {
  abstract create(task: CreateTaskData): Promise<Task>;
  abstract findByIdAndOwnerId(
    id: number,
    ownerId: number,
  ): Promise<Task | null>;
  abstract findPageByOwnerId(
    ownerId: number,
    query: TaskPageQuery,
  ): Promise<TaskPage>;
  abstract updateByIdAndOwnerId(
    id: number,
    ownerId: number,
    changes: UpdateTaskData,
  ): Promise<Task | null>;
  abstract deleteByIdAndOwnerId(id: number, ownerId: number): Promise<boolean>;
}
