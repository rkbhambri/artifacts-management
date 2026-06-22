import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemEntity } from '../entities/system.entity';

@Injectable()
export class SystemsService {
  constructor(
    @InjectRepository(SystemEntity)
    private readonly systemRepo: Repository<SystemEntity>,
  ) {}

  findAll(): Promise<SystemEntity[]> {
    return this.systemRepo.find({
      relations: { customer: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOneOrFail(id: string): Promise<SystemEntity> {
    const system = await this.systemRepo.findOne({
      where: { id },
      relations: { customer: true },
    });
    if (!system) {
      throw new NotFoundException(`System "${id}" not found`);
    }
    return system;
  }

  /** Lightweight existence check used by the artifacts module. */
  async assertExists(id: string): Promise<void> {
    const exists = await this.systemRepo.exists({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`System "${id}" not found`);
    }
  }
}
