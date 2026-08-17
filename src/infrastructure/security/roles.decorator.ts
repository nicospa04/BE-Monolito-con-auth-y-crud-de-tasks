import { SetMetadata } from '@nestjs/common';
import { Role } from '../../domain/role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]): MethodDecorator =>
  SetMetadata(ROLES_KEY, roles);
