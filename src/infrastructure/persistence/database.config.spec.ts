import { createDatabaseOptions } from './database.config';

describe('createDatabaseOptions', () => {
  it('uses SQLite only when a test database path is explicitly provided', () => {
    expect(
      createDatabaseOptions({ databasePath: ':memory:', nodeEnv: 'test' }),
    ).toMatchObject({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
    });
  });

  it('uses PostgreSQL without synchronize when a connection URL is provided', () => {
    expect(
      createDatabaseOptions({
        databaseUrl: 'postgres://user:password@localhost:5432/learning',
        nodeEnv: 'development',
      }),
    ).toMatchObject({ type: 'postgres', synchronize: false });
  });

  it('fails fast without a database configuration', () => {
    expect(() => createDatabaseOptions({})).toThrow('DATABASE_URL');
  });

  it('rejects SQLite outside test environments', () => {
    expect(() =>
      createDatabaseOptions({
        databasePath: 'learning.sqlite',
        nodeEnv: 'development',
      }),
    ).toThrow('DATABASE_PATH');
  });
});
