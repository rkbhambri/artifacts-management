import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ArtifactsController } from './artifacts.controller';
import { ArtifactsService } from '../services/artifacts.service';
import { ArtifactResponseDto } from '../dto/artifact-response.dto';
import { ArtifactDownload } from '../interfaces';

const SYSTEM_ID = '11111111-1111-1111-1111-111111111111';
const ARTIFACT_ID = '22222222-2222-2222-2222-222222222222';

const makeFile = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    originalname: 'schema.sql',
    mimetype: 'application/sql',
    size: 12,
    buffer: Buffer.from('CREATE TABLE'),
    ...overrides,
  }) as Express.Multer.File;

const dto: ArtifactResponseDto = {
  id: ARTIFACT_ID,
  systemId: SYSTEM_ID,
  name: 'schema.sql',
  filename: 'schema.sql',
  mimeType: 'application/sql',
  sizeBytes: 12,
  checksum: 'abc123',
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('ArtifactsController', () => {
  let controller: ArtifactsController;
  let service: jest.Mocked<
    Pick<ArtifactsService, 'upload' | 'listBySystem' | 'download'>
  >;

  beforeEach(() => {
    service = {
      upload: jest.fn(),
      listBySystem: jest.fn(),
      download: jest.fn(),
    };
    controller = new ArtifactsController(
      service as unknown as ArtifactsService,
      {} as ConfigService,
    );
  });

  describe('upload', () => {
    it('delegates to the service with the systemId, name, and file', async () => {
      const file = makeFile();
      service.upload.mockResolvedValue(dto);

      const result = await controller.upload(SYSTEM_ID, file, {
        name: 'schema.sql',
      });

      expect(service.upload).toHaveBeenCalledWith({
        systemId: SYSTEM_ID,
        name: 'schema.sql',
        file,
      });
      expect(result).toBe(dto);
    });

    it('passes through an undefined name when none is provided', async () => {
      const file = makeFile();
      service.upload.mockResolvedValue(dto);

      await controller.upload(SYSTEM_ID, file, {});

      expect(service.upload).toHaveBeenCalledWith({
        systemId: SYSTEM_ID,
        name: undefined,
        file,
      });
    });
  });

  describe('list', () => {
    it('returns the artifacts for a system', async () => {
      service.listBySystem.mockResolvedValue([dto]);

      const result = await controller.list(SYSTEM_ID);

      expect(service.listBySystem).toHaveBeenCalledWith(SYSTEM_ID);
      expect(result).toEqual([dto]);
    });
  });

  describe('download', () => {
    it('streams the content with attachment headers', async () => {
      const download: ArtifactDownload = {
        filename: 'schema.sql',
        mimeType: 'application/sql',
        content: Buffer.from('data'),
      };
      service.download.mockResolvedValue(download);
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.download(ARTIFACT_ID, res);

      expect(service.download).toHaveBeenCalledWith(ARTIFACT_ID);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/sql',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="schema.sql"',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        download.content.length,
      );
      expect(res.send).toHaveBeenCalledWith(download.content);
    });

    it('URL-encodes filenames in the Content-Disposition header', async () => {
      service.download.mockResolvedValue({
        filename: 'my file.sql',
        mimeType: 'application/sql',
        content: Buffer.from('x'),
      });
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.download(ARTIFACT_ID, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="my%20file.sql"',
      );
    });
  });
});
