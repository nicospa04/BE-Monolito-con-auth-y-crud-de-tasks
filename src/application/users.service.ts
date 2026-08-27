import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../domain/role';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user.repository';

export interface RegisterUserCommand {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async register(command: RegisterUserCommand): Promise<User> {
    if (await this.userRepository.existsByUsername(command.username)) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(command.password, 12);
    const user = await this.userRepository.save({
      username: command.username,
      email: command.email,
      passwordHash,
      roles: [Role.USER],
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
    await this.cache.set(this.cacheKey(user.username), user);
    return user;
  }

  async getByUsername(username: string): Promise<User> {
    const key = this.cacheKey(username);
    const cached = await this.cache.get<User>(key);
    if (cached) return cached;

    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    await this.cache.set(key, user);
    return user;
  }

  async getById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setRefreshToken(
    userId: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    await this.userRepository.setRefreshToken(
      userId,
      refreshTokenHash,
      refreshTokenExpiresAt,
    );
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepository.clearRefreshToken(userId);
  }

  private cacheKey(username: string): string {
    return `users:${username}`;
  }
}
