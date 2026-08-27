import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { createValidationPipe } from './../src/infrastructure/validation.pipe';

interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  it('registers, authenticates, refreshes and logs out a user with JWT', async () => {
    const username = `nico-${Date.now()}`;
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);

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

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password: 'password123' })
      .expect(200)
      .expect(({ body }: { body: Record<string, unknown> }) => {
        expect(body.accessToken).toEqual(expect.any(String));
        expect(body.refreshToken).toEqual(expect.any(String));
      });
    const loginTokens = login.body as AuthTokensResponse;

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginTokens.accessToken}`)
      .expect(200)
      .expect(({ body }: { body: Record<string, unknown> }) =>
        expect(body.username).toBe(username),
      );

    await request(app.getHttpServer())
      .get('/api/admin/health')
      .set('Authorization', `Bearer ${loginTokens.accessToken}`)
      .expect(403);

    const refresh = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: loginTokens.refreshToken })
      .expect(200);
    const refreshTokens = refresh.body as AuthTokensResponse;

    expect(refreshTokens.refreshToken).not.toBe(loginTokens.refreshToken);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send({ refreshToken: refreshTokens.refreshToken })
      .expect(204);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: refreshTokens.refreshToken })
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
