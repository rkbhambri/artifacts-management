import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { ArtifactEntity } from '../entities/artifact.entity';
import { ArtifactsService } from '../services/artifacts.service';
import { ArtifactsController } from '../controllers/artifacts.controller';
import { ArtifactsRepository } from '../repositories/artifacts.repository';
import { SystemsModule } from './systems.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtifactEntity]),
    SystemsModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: memoryStorage(),
        limits: { fileSize: config.get<number>('maxUploadBytes') },
      }),
    }),
  ],
  controllers: [ArtifactsController],
  providers: [ArtifactsService, ArtifactsRepository],
})
export class ArtifactsModule {}
