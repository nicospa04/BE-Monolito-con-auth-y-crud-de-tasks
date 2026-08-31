import { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface DatabaseConfigInput {
  databasePath?: string;
  databaseUrl?: string;
}

export function createDatabaseOptions(
  input: DatabaseConfigInput = {
    databasePath: process.env.DATABASE_PATH,
    databaseUrl: process.env.DATABASE_URL,
  },
): TypeOrmModuleOptions {
  if (input.databasePath) {
    return {
      type: 'sqlite',
      database: input.databasePath,
      autoLoadEntities: true,
      synchronize: true,
    };
  }

  if (!input.databaseUrl) {
    throw new Error('DATABASE_URL must be configured outside tests');
  }

  return {
    type: 'postgres',
    url: input.databaseUrl,
    autoLoadEntities: true,
    synchronize: false,
  };
}
