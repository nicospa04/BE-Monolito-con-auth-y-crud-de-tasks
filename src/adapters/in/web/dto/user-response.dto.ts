import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../domain/role';
import { User } from '../../../../domain/user';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'nico' })
  username!: string;

  @ApiProperty({ example: 'nico@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, isArray: true })
  roles!: Role[];

  static from(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
  }
}
