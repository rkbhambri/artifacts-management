import { ApiProperty } from '@nestjs/swagger';
import { ArtifactEntity } from '../entities/artifact.entity';

/** Metadata-only view of an artifact (never includes binary content). */
export class ArtifactResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  systemId: string;

  @ApiProperty({
    description: 'Logical name, stable across versions',
    example: 'schema.sql',
  })
  name: string;

  @ApiProperty({ description: 'Original uploaded filename', example: 'schema.sql' })
  filename: string;

  @ApiProperty({ example: 'application/sql' })
  mimeType: string;

  @ApiProperty({ description: 'Size of the content in bytes', example: 2048 })
  sizeBytes: number;

  @ApiProperty({ description: 'SHA-256 hex digest of the content' })
  checksum: string;

  @ApiProperty({
    description: 'Monotonically increasing per (systemId, name)',
    example: 1,
  })
  version: number;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  static fromEntity(entity: ArtifactEntity): ArtifactResponseDto {
    return {
      id: entity.id,
      systemId: entity.systemId,
      name: entity.name,
      filename: entity.filename,
      mimeType: entity.mimeType,
      sizeBytes: Number(entity.sizeBytes),
      checksum: entity.checksum,
      version: entity.version,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
