import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user';
import { UserEntity } from './user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: Omit<User, 'id'>): Promise<User> {
    return this.repository.save(this.repository.create(user));
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOneBy({ username });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.repository.existsBy({ username });
  }

  async setRefreshToken(
    userId: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void> {
    await this.repository.update(userId, {
      refreshTokenHash,
      refreshTokenExpiresAt,
    });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.repository.update(userId, {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
  }
}
