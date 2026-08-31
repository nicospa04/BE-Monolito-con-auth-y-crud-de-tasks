import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { createValidationPipe } from './../src/infrastructure/validation.pipe';

interface AuthTokensResponse {
  accessToken: string;
}

interface CreatedTaskResponse {
  id: number;
}

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  it('keeps tasks private to their owner and returns fresh data after an update', async () => {
    const suffix = Date.now();
    await request(app.getHttpServer()).get('/api/tasks').expect(401);

    const ownerToken = await registerAndLogin(`owner-${suffix}`);
    const otherUserToken = await registerAndLogin(`other-${suffix}`);

    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Prepare portfolio' })
      .expect(201);
    const taskId = (created.body as CreatedTaskResponse).id;

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200)
      .expect(({ body }: { body: Record<string, unknown> }) =>
        expect(body.title).toBe('Prepare portfolio'),
      );

    await request(app.getHttpServer())
      .get('/api/tasks?page=1&limit=10&status=TODO')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200)
      .expect(({ body }: { body: { items: Array<{ id: number }> } }) =>
        expect(body.items.map((task) => task.id)).toContain(taskId),
      );

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ title: 'Hijacked task' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Publish portfolio' })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200)
      .expect(({ body }: { body: Record<string, unknown> }) =>
        expect(body.title).toBe('Publish portfolio'),
      );
  });

  async function registerAndLogin(username: string): Promise<string> {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username,
        email: `${username}@example.com`,
        password: 'password123',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password: 'password123' })
      .expect(200);
    return (login.body as AuthTokensResponse).accessToken;
  }

  afterEach(async () => {
    await app.close();
  });
});
