import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TasksService } from '../../../application/tasks.service';
import { User } from '../../../domain/user';
import { TaskStatus } from '../../../domain/task';
import { JwtAuthGuard } from '../../../infrastructure/security/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { TaskPageResponseDto, TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type AuthenticatedRequest = Request & { user: User };

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Creates a task owned by the authenticated user' })
  @ApiCreatedResponse({ type: TaskResponseDto })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return TaskResponseDto.from(
      await this.tasksService.createForUser(request.user.id, {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? TaskStatus.TODO,
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lists the authenticated users tasks' })
  @ApiOkResponse({ type: TaskPageResponseDto })
  async list(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListTasksQueryDto,
  ): Promise<TaskPageResponseDto> {
    return TaskPageResponseDto.from(
      await this.tasksService.listForUser(request.user.id, query),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns one task owned by the authenticated user' })
  @ApiOkResponse({ type: TaskResponseDto })
  async get(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskResponseDto> {
    return TaskResponseDto.from(
      await this.tasksService.getForUser(id, request.user.id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates one task owned by the authenticated user' })
  @ApiOkResponse({ type: TaskResponseDto })
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return TaskResponseDto.from(
      await this.tasksService.updateForUser(id, request.user.id, dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes one task owned by the authenticated user' })
  @ApiNoContentResponse()
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.tasksService.deleteForUser(id, request.user.id);
  }
}
