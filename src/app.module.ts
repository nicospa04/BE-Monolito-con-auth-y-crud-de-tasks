import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import KeyvRedis from '@keyv/redis';
import { UserEntity } from './infrastructure/persistence/user.entity';
import { TaskEntity } from './infrastructure/persistence/task.entity';
import { AuthController } from './adapters/in/web/auth.controller';
import { AdminController } from './adapters/in/web/admin.controller';
import { TasksController } from './adapters/in/web/tasks.controller';
import { UserRepository } from './domain/user.repository';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { TaskRepository } from './domain/task.repository';
import { TypeOrmTaskRepository } from './infrastructure/persistence/typeorm-task.repository';
import { UsersService } from './application/users.service';
import { TasksService } from './application/tasks.service';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { getJwtSecret } from './infrastructure/security/jwt.config';
import { RolesGuard } from './infrastructure/security/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? 'learning.sqlite',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([UserEntity, TaskEntity]),
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: 10 * 60 * 1000,
        ...(process.env.REDIS_URL
          ? { stores: [new KeyvRedis(process.env.REDIS_URL)] }
          : {}),
      }),
    }),
  ],
  controllers: [AuthController, AdminController, TasksController],
  providers: [
    UsersService,
    TasksService,
    AuthService,
    JwtStrategy,
    RolesGuard,
    TypeOrmUserRepository,
    TypeOrmTaskRepository,
    { provide: UserRepository, useExisting: TypeOrmUserRepository },
    { provide: TaskRepository, useExisting: TypeOrmTaskRepository },
  ],
})
export class AppModule {}
