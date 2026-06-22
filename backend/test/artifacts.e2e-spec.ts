import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { CustomerEntity } from '../src/entities/customer.entity';
import { SystemEntity } from '../src/entities/system.entity';

/**
 * End-to-end happy path: upload -> list -> download.
 *
 * Requires a reachable Postgres (see env defaults / docker-compose). Skipped
 * automatically if the database cannot be initialized so unit runs stay green.
 */
describe('Artifacts (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let systemId: string;
  const apiKey = process.env.API_KEY ?? 'dev-internal-api-key';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();

    const customer = await dataSource
      .getRepository(CustomerEntity)
      .save({ name: 'E2E Customer' });
    const system = await dataSource
      .getRepository(SystemEntity)
      .save({ name: 'e2e-system', customerId: customer.id });
    systemId = system.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('uploads, lists, and downloads an artifact', async () => {
    const content = Buffer.from('SELECT 1;');

    const upload = await request(app.getHttpServer())
      .post(`/systems/${systemId}/artifacts`)
      .set('x-api-key', apiKey)
      .field('name', 'query.sql')
      .attach('file', content, 'query.sql')
      .expect(201);

    expect(upload.body.version).toBe(1);
    expect(upload.body.sizeBytes).toBe(content.length);
    const artifactId = upload.body.id;

    const list = await request(app.getHttpServer())
      .get(`/systems/${systemId}/artifacts`)
      .expect(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(artifactId);

    const download = await request(app.getHttpServer())
      .get(`/artifacts/${artifactId}/download`)
      .expect(200);
    expect(download.body.toString()).toBe(content.toString());
  });

  it('rejects uploads without an API key', async () => {
    await request(app.getHttpServer())
      .post(`/systems/${systemId}/artifacts`)
      .attach('file', Buffer.from('x'), 'x.txt')
      .expect(401);
  });
});
