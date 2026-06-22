import { ArtifactResponseDto } from './artifact-response.dto';
import { ArtifactEntity } from '../entities/artifact.entity';

describe('ArtifactResponseDto.fromEntity', () => {
  const entity = {
    id: 'artifact-uuid',
    systemId: 'system-uuid',
    name: 'schema.sql',
    filename: 'schema.sql',
    mimeType: 'application/sql',
    sizeBytes: 2048,
    checksum: 'deadbeef',
    version: 3,
    content: Buffer.from('sensitive content'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  } as ArtifactEntity;

  it('maps every metadata field and serializes the date', () => {
    const dto = ArtifactResponseDto.fromEntity(entity);

    expect(dto).toEqual({
      id: 'artifact-uuid',
      systemId: 'system-uuid',
      name: 'schema.sql',
      filename: 'schema.sql',
      mimeType: 'application/sql',
      sizeBytes: 2048,
      checksum: 'deadbeef',
      version: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('never exposes the binary content', () => {
    const dto = ArtifactResponseDto.fromEntity(entity);

    expect((dto as unknown as Record<string, unknown>).content).toBeUndefined();
  });

  it('coerces a string sizeBytes (bigint column) to a number', () => {
    const dto = ArtifactResponseDto.fromEntity({
      ...entity,
      sizeBytes: '4096' as unknown as number,
    } as ArtifactEntity);

    expect(dto.sizeBytes).toBe(4096);
    expect(typeof dto.sizeBytes).toBe('number');
  });
});
