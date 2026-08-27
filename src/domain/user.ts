import { Role } from './role';

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  roles: Role[];
  refreshTokenHash: string | null;
  refreshTokenExpiresAt: Date | null;
}
