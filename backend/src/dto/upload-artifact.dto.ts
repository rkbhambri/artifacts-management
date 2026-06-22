import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Optional multipart fields accompanying the uploaded file. When `name` is
 * omitted, the artifact's logical name defaults to the uploaded filename.
 */
export class UploadArtifactDto {
  @ApiPropertyOptional({
    description:
      'Logical name for the artifact. Defaults to the uploaded filename. ' +
      'Re-using a name creates a new version.',
    maxLength: 255,
    example: 'schema.sql',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
