import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { ArtifactsService } from './artifacts.service';
import { ArtifactsRepository } from '../repositories/artifacts.repository';
import { SystemsService } from './systems.service';
import { ArtifactEntity } from '../entities/artifact.entity';
import { ARTIFACT_CREATED_EVENT } from '../events/notification.events';

const SYSTEM_ID = '11111111-1111-1111-1111-111111111111';

const makeFile = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    originalname: 'schema.sql',
    mimetype: 'application/sql',
    size: 12,
    buffer: Buffer.from('CREATE TABLE'),
    ...overrides,
  }) as Express.Multer.File;

describe('ArtifactsService', () => {
  let service: ArtifactsService;
  let repo: jest.Mocked<Partial<ArtifactsRepository>>;
  let systems: jest.Mocked<Partial<SystemsService>>;
  let emitter: EventEmitter2;

  beforeEach(async () => {
    repo = {
      currentVersion: jest.fn().mockResolvedValue(0),
      create: jest.fn((data) => data as ArtifactEntity),
      save: jest.fn(async (entity: ArtifactEntity) => ({
        ...entity,
        id: 'artifact-uuid',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      })),
      findBySystem: jest.fn(),
      findWithContentById: jest.fn(),
    };
    systems = {
      assertExists: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ArtifactsService,
        EventEmitter2,
        { provide: ArtifactsRepository, useValue: repo },
        { provide: SystemsService, useValue: systems },
      ],
    }).compile();

    service = moduleRef.get(ArtifactsService);
    emitter = moduleRef.get(EventEmitter2);
  });

  describe('upload', () => {
    it('persists metadata, computes checksum, assigns version 1, and emits an event', async () => {
      const emitSpy = jest.spyOn(emitter, 'emit');
      const file = makeFile();

      const result = await service.upload({ systemId: SYSTEM_ID, file });

      const expectedChecksum = createHash('sha256')
        .update(file.buffer)
        .digest('hex');

      expect(systems.assertExists).toHaveBeenCalledWith(SYSTEM_ID);
      expect(result.version).toBe(1);
      expect(result.checksum).toBe(expectedChecksum);
      expect(result.name).toBe('schema.sql');
      expect(emitSpy).toHaveBeenCalledWith(
        ARTIFACT_CREATED_EVENT,
        expect.objectContaining({ systemId: SYSTEM_ID, version: 1 }),
      );
    });

    it('increments the version for an existing artifact name', async () => {
      (repo.currentVersion as jest.Mock).mockResolvedValue(3);

      const result = await service.upload({
        systemId: SYSTEM_ID,
        name: 'schema.sql',
        file: makeFile(),
      });

      expect(result.version).toBe(4);
    });

    it('rejects an empty file', async () => {
      await expect(
        service.upload({ systemId: SYSTEM_ID, file: makeFile({ size: 0 }) }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('uses the uploaded filename as the name when none is provided', async () => {
      const result = await service.upload({
        systemId: SYSTEM_ID,
        file: makeFile({ originalname: 'config.yaml' }),
      });
      expect(result.name).toBe('config.yaml');
    });
  });

  describe('listBySystem', () => {
    it('asserts the system exists and maps entities to DTOs', async () => {
      (repo.findBySystem as jest.Mock).mockResolvedValue([
        {
          id: 'artifact-uuid',
          systemId: SYSTEM_ID,
          name: 'schema.sql',
          filename: 'schema.sql',
          mimeType: 'application/sql',
          sizeBytes: 12,
          checksum: 'abc',
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ]);

      const result = await service.listBySystem(SYSTEM_ID);

      expect(systems.assertExists).toHaveBeenCalledWith(SYSTEM_ID);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('artifact-uuid');
      expect(
        (result[0] as unknown as Record<string, unknown>).content,
      ).toBeUndefined();
    });

    it('propagates NotFound when the system is missing', async () => {
      (systems.assertExists as jest.Mock).mockRejectedValue(
        new NotFoundException('missing'),
      );

      await expect(service.listBySystem(SYSTEM_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('download', () => {
    it('throws NotFound when the artifact does not exist', async () => {
      (repo.findWithContentById as jest.Mock).mockResolvedValue(null);
      await expect(service.download('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns content and headers for an existing artifact', async () => {
      (repo.findWithContentById as jest.Mock).mockResolvedValue({
        filename: 'schema.sql',
        mimeType: 'application/sql',
        content: Buffer.from('data'),
      });
      const result = await service.download('artifact-uuid');
      expect(result.filename).toBe('schema.sql');
      expect(result.content.toString()).toBe('data');
    });
  });
});
