import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "customer" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "system" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "customer_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_system_customer" FOREIGN KEY ("customer_id")
          REFERENCES "customer"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_system_customer_id" ON "system" ("customer_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "artifact" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "system_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "filename" character varying(512) NOT NULL,
        "mime_type" character varying(255) NOT NULL,
        "size_bytes" bigint NOT NULL,
        "checksum" character varying(64) NOT NULL,
        "version" integer NOT NULL,
        "content" bytea NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_artifact_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_artifact_system" FOREIGN KEY ("system_id")
          REFERENCES "system"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_artifact_system_id" ON "artifact" ("system_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_artifact_system_name" ON "artifact" ("system_id", "name")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_artifact_system_name_version" ON "artifact" ("system_id", "name", "version")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "artifact"`);
    await queryRunner.query(`DROP TABLE "system"`);
    await queryRunner.query(`DROP TABLE "customer"`);
  }
}
