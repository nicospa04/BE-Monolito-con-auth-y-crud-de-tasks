import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('registers a user and returns it through Basic Auth', async () => {
    const username = `nico-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username,
        email: `${username}@example.com`,
        password: 'password123',
      })
      .expect(201)
      .expect(({ body }: { body: Record<string, unknown> }) => {
        expect(body).toMatchObject({ username, roles: ['USER'] });
        expect(body.passwordHash).toBeUndefined();
      });

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(username, 'password123')
      .expect(200)
      .expect(({ body }: { body: Record<string, unknown> }) =>
        expect(body.username).toBe(username),
      );
  });

  afterEach(async () => {
    await app.close();
  });
});
