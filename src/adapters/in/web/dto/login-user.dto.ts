import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'nico' })
  @IsString()
  @Length(3, 50)
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
