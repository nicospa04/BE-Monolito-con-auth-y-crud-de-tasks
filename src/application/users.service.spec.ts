import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../domain/role';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const users = new Map<string, User>();
  const saveUser = jest.fn<(user: Omit<User, 'id'>) => Promise<User>>((user) =>
    Promise.resolve({ id: 1, ...user }),
  );
  const findUser = jest.fn<(username: string) => Promise<User | null>>(
    (username: string) => Promise.resolve(users.get(username) ?? null),
  );
  const userExists = jest.fn<(username: string) => Promise<boolean>>(
    (username: string) => Promise.resolve(users.has(username)),
  );
  const repository: UserRepository = {
    save: saveUser,
    findByUsername: findUser,
    existsByUsername: userExists,
  };
  const cache = {
    get: jest.fn<(key: string) => Promise<User | undefined>>(),
    set: jest.fn<(key: string, user: User) => Promise<void>>(() =>
      Promise.resolve(),
    ),
  };
  let service: UsersService;

  beforeEach(async () => {
    users.clear();
    jest.clearAllMocks();
    cache.get.mockResolvedValue(undefined);
    cache.set.mockResolvedValue(undefined);
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: repository },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('registers a USER with a hashed password', async () => {
    const user = await service.register({
      username: 'nico',
      email: 'nico@example.com',
      password: 'password123',
    });

    expect(user.roles).toEqual([Role.USER]);
    expect(await bcrypt.compare('password123', user.passwordHash)).toBe(true);
    expect(user.passwordHash).not.toBe('password123');
  });

  it('rejects duplicate usernames', async () => {
    users.set('nico', {
      id: 1,
      username: 'nico',
      email: 'nico@example.com',
      passwordHash: 'hash',
      roles: [Role.USER],
    });

    await expect(
      service.register({
        username: 'nico',
        email: 'other@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a cached user without querying the repository', async () => {
    const user: User = {
      id: 1,
      username: 'nico',
      email: 'nico@example.com',
      passwordHash: 'hash',
      roles: [Role.USER],
    };
    cache.get.mockResolvedValue(user);

    await expect(service.getByUsername('nico')).resolves.toEqual(user);
    expect(findUser).not.toHaveBeenCalled();
  });

  it('rejects unknown users', async () => {
    await expect(service.getByUsername('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
