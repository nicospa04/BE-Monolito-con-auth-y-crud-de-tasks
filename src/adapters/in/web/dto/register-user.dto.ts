import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'nico' })
  @IsString()
  @Length(3, 50)
  username!: string;

  @ApiProperty({ example: 'nico@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
