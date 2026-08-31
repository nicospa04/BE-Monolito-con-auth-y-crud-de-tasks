import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured to run migrations');
}

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity, TaskEntity],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
});
