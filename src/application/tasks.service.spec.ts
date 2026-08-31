import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Task, TaskStatus } from '../domain/task';
import { TaskRepository } from '../domain/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  const task: Task = {
    id: 42,
    title: 'Prepare portfolio',
    description: null,
    status: TaskStatus.TODO,
    ownerId: 7,
    createdAt: new Date('2026-08-31T00:00:00.000Z'),
    updatedAt: new Date('2026-08-31T00:00:00.000Z'),
  };
  const repository = {
    create: jest.fn(),
    findByIdAndOwnerId: jest.fn(),
    findPageByOwnerId: jest.fn(),
    updateByIdAndOwnerId: jest.fn(),
    deleteByIdAndOwnerId: jest.fn(),
  };
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();
    cache.get.mockResolvedValue(undefined);
    cache.set.mockResolvedValue(undefined);
    cache.del.mockResolvedValue(undefined);
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: repository },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();
    service = module.get(TasksService);
  });

  it('returns a cached task without querying the repository', async () => {
    cache.get.mockResolvedValue(task);

    await expect(service.getForUser(42, 7)).resolves.toEqual(task);
    expect(repository.findByIdAndOwnerId).not.toHaveBeenCalled();
  });

  it('does not expose another users task', async () => {
    repository.findByIdAndOwnerId.mockResolvedValue(null);

    await expect(service.getForUser(42, 8)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findByIdAndOwnerId).toHaveBeenCalledWith(42, 8);
  });

  it('invalidates the cached task after an update', async () => {
    const updatedTask = { ...task, title: 'Publish portfolio' };
    repository.updateByIdAndOwnerId.mockResolvedValue(updatedTask);

    await expect(
      service.updateForUser(42, 7, { title: 'Publish portfolio' }),
    ).resolves.toEqual(updatedTask);
    expect(cache.del).toHaveBeenCalledWith('tasks:owner:7:task:42');
  });

  it('invalidates the cached task after deletion', async () => {
    repository.deleteByIdAndOwnerId.mockResolvedValue(true);

    await expect(service.deleteForUser(42, 7)).resolves.toBeUndefined();
    expect(cache.del).toHaveBeenCalledWith('tasks:owner:7:task:42');
  });
});
