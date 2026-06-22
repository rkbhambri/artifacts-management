import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ArtifactsService } from '../services/artifacts.service';
import { ArtifactResponseDto } from '../dto/artifact-response.dto';
import { UploadArtifactDto } from '../dto/upload-artifact.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { SkipSuccessWrapper } from '../decorators/skip-success-wrapper.decorator';

@ApiTags('artifacts')
@Controller()
export class ArtifactsController {
  constructor(
    private readonly artifactsService: ArtifactsService,
    private readonly configService: ConfigService,
  ) {}

  /** Upload (write) endpoint, protected by the API-key guard. */
  @Post('systems/:systemId/artifacts')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an artifact to a system' })
  @ApiSecurity('api-key')
  @ApiParam({ name: 'systemId', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        name: {
          type: 'string',
          description: 'Optional logical name (defaults to filename)',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ArtifactResponseDto })
  upload(
    @Param('systemId', ParseUUIDPipe) systemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadArtifactDto,
  ): Promise<ArtifactResponseDto> {
    return this.artifactsService.upload({ systemId, name: body.name, file });
  }

  @Get('systems/:systemId/artifacts')
  @ApiOperation({ summary: 'List artifact metadata for a system' })
  @ApiParam({ name: 'systemId', format: 'uuid' })
  @ApiOkResponse({ type: ArtifactResponseDto, isArray: true })
  list(
    @Param('systemId', ParseUUIDPipe) systemId: string,
  ): Promise<ArtifactResponseDto[]> {
    return this.artifactsService.listBySystem(systemId);
  }

  @Get('artifacts/:id/download')
  @SkipSuccessWrapper()
  @ApiOperation({ summary: 'Download an artifact’s binary content' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({
    description: 'Raw artifact content as an attachment',
    schema: { type: 'string', format: 'binary' },
  })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const artifact = await this.artifactsService.download(id);
    res.setHeader('Content-Type', artifact.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(artifact.filename)}"`,
    );
    res.setHeader('Content-Length', artifact.content.length);
    res.send(artifact.content);
  }
}
