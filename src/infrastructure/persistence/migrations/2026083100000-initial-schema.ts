import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema2026083100000 implements MigrationInterface {
  name = 'InitialSchema2026083100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "roles" text NOT NULL,
        "refreshTokenHash" character varying,
        "refreshTokenExpiresAt" TIMESTAMP,
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL NOT NULL,
        "title" character varying(120) NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'TODO',
        "ownerId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_tasks_owner_status" ON "tasks" ("ownerId", "status")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_tasks_owner_status"');
    await queryRunner.query('DROP TABLE "tasks"');
    await queryRunner.query('DROP TABLE "users"');
  }
}
