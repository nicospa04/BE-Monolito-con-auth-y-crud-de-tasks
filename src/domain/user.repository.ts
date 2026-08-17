import { User } from './user';

export abstract class UserRepository {
  abstract save(user: Omit<User, 'id'>): Promise<User>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract existsByUsername(username: string): Promise<boolean>;
}
