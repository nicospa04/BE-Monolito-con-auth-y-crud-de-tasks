import { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface DatabaseConfigInput {
  databasePath?: string;
  databaseUrl?: string;
  nodeEnv?: string;
}

export function createDatabaseOptions(
  input: DatabaseConfigInput = {
    databasePath: process.env.DATABASE_PATH,
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
  },
): TypeOrmModuleOptions {
  if (input.databasePath) {
    if (input.nodeEnv !== 'test') {
      throw new Error('DATABASE_PATH is supported only in test environments');
    }
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
