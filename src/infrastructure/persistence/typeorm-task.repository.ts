import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTaskData,
  TaskPageQuery,
  TaskRepository,
  UpdateTaskData,
} from '../../domain/task.repository';
import { Task, TaskPage } from '../../domain/task';
import { TaskEntity } from './task.entity';

@Injectable()
export class TypeOrmTaskRepository implements TaskRepository {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly repository: Repository<TaskEntity>,
  ) {}

  async create(task: CreateTaskData): Promise<Task> {
    return this.repository.save(this.repository.create(task));
  }

  async findByIdAndOwnerId(id: number, ownerId: number): Promise<Task | null> {
    return this.repository.findOneBy({ id, ownerId });
  }

  async findPageByOwnerId(
    ownerId: number,
    query: TaskPageQuery,
  ): Promise<TaskPage> {
    const [items, total] = await this.repository.findAndCount({
      where: { ownerId, ...(query.status ? { status: query.status } : {}) },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return { items, total, page: query.page, limit: query.limit };
  }

  async updateByIdAndOwnerId(
    id: number,
    ownerId: number,
    changes: UpdateTaskData,
  ): Promise<Task | null> {
    const task = await this.findByIdAndOwnerId(id, ownerId);
    if (!task) return null;
    return this.repository.save(Object.assign(task, changes));
  }

  async deleteByIdAndOwnerId(id: number, ownerId: number): Promise<boolean> {
    const result = await this.repository.delete({ id, ownerId });
    return result.affected === 1;
  }
}
