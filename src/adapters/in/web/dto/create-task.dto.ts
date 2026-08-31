import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '../../../../domain/task';

export class CreateTaskDto {
  @ApiProperty({ example: 'Prepare portfolio' })
  @IsString()
  @Length(1, 120)
  title!: string;

  @ApiPropertyOptional({ example: 'Record a short demo of the API.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
