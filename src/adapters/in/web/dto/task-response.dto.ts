import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Task, TaskPage, TaskStatus } from '../../../../domain/task';

export class TaskResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: TaskStatus })
  status!: TaskStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static from(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

export class TaskPageResponseDto {
  @ApiProperty({ type: TaskResponseDto, isArray: true })
  items!: TaskResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  static from(page: TaskPage): TaskPageResponseDto {
    return {
      items: page.items.map((task) => TaskResponseDto.from(task)),
      total: page.total,
      page: page.page,
      limit: page.limit,
    };
  }
}
