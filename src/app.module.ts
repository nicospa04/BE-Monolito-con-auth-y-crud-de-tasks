import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { UserEntity } from './infrastructure/persistence/user.entity';
import { AuthController } from './adapters/in/web/auth.controller';
import { AdminController } from './adapters/in/web/admin.controller';
import { UserRepository } from './domain/user.repository';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { UsersService } from './application/users.service';
import { BasicStrategy } from './infrastructure/security/basic.strategy';
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
    TypeOrmModule.forFeature([UserEntity]),
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
  controllers: [AuthController, AdminController],
  providers: [
    UsersService,
    BasicStrategy,
    RolesGuard,
    TypeOrmUserRepository,
    { provide: UserRepository, useExisting: TypeOrmUserRepository },
  ],
})
export class AppModule {}
