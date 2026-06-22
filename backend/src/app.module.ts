import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { loadConfiguration } from './config/configuration';
import { dataSourceOptions } from './database/data-source';
import { SystemsModule } from './modules/systems.module';
import { ArtifactsModule } from './modules/artifacts.module';
import { NotificationsModule } from './modules/notifications.module';
import { HealthModule } from './modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    EventEmitterModule.forRoot(),
    SystemsModule,
    ArtifactsModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
