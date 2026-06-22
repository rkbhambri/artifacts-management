import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SystemEntity } from './system.entity';

/**
 * An artifact produced by a pipeline run. Binary content is stored inline as
 * `bytea`. See README for the trade-offs of this approach vs object storage.
 */
@Entity({ name: 'artifact' })
@Index(['systemId', 'name'])
export class ArtifactEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'system_id', type: 'uuid' })
  systemId: string;

  @ManyToOne(() => SystemEntity, (system) => system.artifacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'system_id' })
  system: SystemEntity;

  /** Logical name, stable across versions (e.g. "schema.sql"). */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Original uploaded filename. */
  @Column({ type: 'varchar', length: 512 })
  filename: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  @Column({
    name: 'size_bytes',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  sizeBytes: number;

  /** SHA-256 hex digest of the content, for integrity verification. */
  @Column({ type: 'varchar', length: 64 })
  checksum: string;

  /** Monotonically increasing per (systemId, name). */
  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'bytea', select: false })
  content: Buffer;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
