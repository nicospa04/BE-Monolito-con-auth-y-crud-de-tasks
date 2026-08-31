import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskPage } from '../domain/task';
import {
  CreateTaskData,
  TaskPageQuery,
  TaskRepository,
  UpdateTaskData,
} from '../domain/task.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async createForUser(
    ownerId: number,
    task: Omit<CreateTaskData, 'ownerId'>,
  ): Promise<Task> {
    return this.taskRepository.create({ ...task, ownerId });
  }

  async listForUser(ownerId: number, query: TaskPageQuery): Promise<TaskPage> {
    return this.taskRepository.findPageByOwnerId(ownerId, query);
  }

  async getForUser(id: number, ownerId: number): Promise<Task> {
    const key = this.cacheKey(id, ownerId);
    const cached = await this.cache.get<Task>(key);
    if (cached) return cached;

    const task = await this.taskRepository.findByIdAndOwnerId(id, ownerId);
    if (!task) throw new NotFoundException('Task not found');

    await this.cache.set(key, task);
    return task;
  }

  async updateForUser(
    id: number,
    ownerId: number,
    changes: UpdateTaskData,
  ): Promise<Task> {
    const task = await this.taskRepository.updateByIdAndOwnerId(
      id,
      ownerId,
      changes,
    );
    if (!task) throw new NotFoundException('Task not found');

    await this.cache.del(this.cacheKey(id, ownerId));
    return task;
  }

  async deleteForUser(id: number, ownerId: number): Promise<void> {
    const deleted = await this.taskRepository.deleteByIdAndOwnerId(id, ownerId);
    if (!deleted) throw new NotFoundException('Task not found');

    await this.cache.del(this.cacheKey(id, ownerId));
  }

  private cacheKey(id: number, ownerId: number): string {
    return `tasks:owner:${ownerId}:task:${id}`;
  }
}
