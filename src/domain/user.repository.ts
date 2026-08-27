import { User } from './user';

export abstract class UserRepository {
  abstract save(user: Omit<User, 'id'>): Promise<User>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findById(id: number): Promise<User | null>;
  abstract existsByUsername(username: string): Promise<boolean>;
  abstract setRefreshToken(
    userId: number,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void>;
  abstract clearRefreshToken(userId: number): Promise<void>;
}
