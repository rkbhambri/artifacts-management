import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtifactEntity } from '../entities/artifact.entity';

/**
 * Data-access layer for artifacts. Keeps TypeORM specifics out of the service
 * and centralizes the queries that back versioning and content retrieval.
 */
@Injectable()
export class ArtifactsRepository {
  constructor(
    @InjectRepository(ArtifactEntity)
    private readonly repo: Repository<ArtifactEntity>,
  ) {}

  /** Metadata for all artifacts in a system, newest first. */
  findBySystem(systemId: string): Promise<ArtifactEntity[]> {
    return this.repo.find({
      where: { systemId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Loads a single artifact including its binary content. */
  findWithContentById(id: string): Promise<ArtifactEntity | null> {
    return this.repo.findOne({
      where: { id },
      select: {
        id: true,
        systemId: true,
        name: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        checksum: true,
        version: true,
        content: true,
        createdAt: true,
      },
    });
  }

  /** Highest existing version for a (systemId, name), or 0 if none. */
  async currentVersion(systemId: string, name: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('artifact')
      .select('MAX(artifact.version)', 'max')
      .where('artifact.system_id = :systemId', { systemId })
      .andWhere('artifact.name = :name', { name })
      .getRawOne<{ max: string | null }>();
    return result?.max ? parseInt(result.max, 10) : 0;
  }

  create(data: Partial<ArtifactEntity>): ArtifactEntity {
    return this.repo.create(data);
  }

  save(artifact: ArtifactEntity): Promise<ArtifactEntity> {
    return this.repo.save(artifact);
  }
}
