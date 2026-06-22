import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemEntity } from '../entities/system.entity';
import { SystemsService } from '../services/systems.service';
import { SystemsController } from '../controllers/systems.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemEntity])],
  controllers: [SystemsController],
  providers: [SystemsService],
  exports: [SystemsService],
})
export class SystemsModule {}
