import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHash } from 'crypto';
import { QueryFailedError } from 'typeorm';
import { ArtifactsRepository } from '../repositories/artifacts.repository';
import { ArtifactEntity } from '../entities/artifact.entity';
import { ArtifactResponseDto } from '../dto/artifact-response.dto';
import { SystemsService } from './systems.service';
import { ARTIFACT_CREATED_EVENT } from '../events/notification.events';
import {
  ArtifactCreatedEvent,
  ArtifactDownload,
  UploadArtifactInput,
} from '../interfaces';

const UNIQUE_VIOLATION = '23505';
const MAX_VERSION_RETRIES = 3;

@Injectable()
export class ArtifactsService {
  private readonly logger = new Logger(ArtifactsService.name);

  constructor(
    private readonly artifactsRepository: ArtifactsRepository,
    private readonly systemsService: SystemsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async upload(input: UploadArtifactInput): Promise<ArtifactResponseDto> {
    const { systemId, file } = input;
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException('An empty or missing file was provided');
    }

    await this.systemsService.assertExists(systemId);

    const name = input.name?.trim() || file.originalname;
    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    const saved = await this.persistWithVersionRetry({
      systemId,
      name,
      filename: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size,
      checksum,
      content: file.buffer,
    });

    const dto = ArtifactResponseDto.fromEntity(saved);
    this.eventEmitter.emit(ARTIFACT_CREATED_EVENT, {
      systemId: dto.systemId,
      artifactId: dto.id,
      name: dto.name,
      version: dto.version,
      sizeBytes: dto.sizeBytes,
      createdAt: dto.createdAt,
    } satisfies ArtifactCreatedEvent);

    return dto;
  }

  async listBySystem(systemId: string): Promise<ArtifactResponseDto[]> {
    await this.systemsService.assertExists(systemId);
    const artifacts = await this.artifactsRepository.findBySystem(systemId);
    return artifacts.map(ArtifactResponseDto.fromEntity);
  }

  async download(id: string): Promise<ArtifactDownload> {
    const artifact = await this.artifactsRepository.findWithContentById(id);
    if (!artifact) {
      throw new NotFoundException(`Artifact "${id}" not found`);
    }
    return {
      filename: artifact.filename,
      mimeType: artifact.mimeType,
      content: artifact.content,
    };
  }

  /**
   * Computes the next version and inserts. Because version assignment is
   * read-then-write, a concurrent upload of the same (system, name) can collide
   * on the unique index; we retry a few times before surfacing a conflict.
   */
  private async persistWithVersionRetry(
    data: Omit<Partial<ArtifactEntity>, 'version'> & { systemId: string; name: string },
  ): Promise<ArtifactEntity> {
    for (let attempt = 1; attempt <= MAX_VERSION_RETRIES; attempt++) {
      const current = await this.artifactsRepository.currentVersion(
        data.systemId,
        data.name,
      );
      const entity = this.artifactsRepository.create({
        ...data,
        version: current + 1,
      });
      try {
        return await this.artifactsRepository.save(entity);
      } catch (err) {
        if (
          err instanceof QueryFailedError &&
          (err as unknown as { code?: string }).code === UNIQUE_VIOLATION &&
          attempt < MAX_VERSION_RETRIES
        ) {
          this.logger.warn(
            `Version collision for ${data.systemId}/${data.name}, retrying (${attempt})`,
          );
          continue;
        }
        if (
          err instanceof QueryFailedError &&
          (err as unknown as { code?: string }).code === UNIQUE_VIOLATION
        ) {
          throw new ConflictException(
            'Concurrent upload conflict, please retry',
          );
        }
        throw err;
      }
    }
    // Unreachable, but satisfies the type checker.
    throw new ConflictException('Unable to assign artifact version');
  }
}
