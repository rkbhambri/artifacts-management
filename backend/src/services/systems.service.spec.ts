import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SystemsService } from './systems.service';
import { SystemEntity } from '../entities/system.entity';

const SYSTEM_ID = '11111111-1111-1111-1111-111111111111';

describe('SystemsService', () => {
  let service: SystemsService;
  let repo: jest.Mocked<
    Pick<Repository<SystemEntity>, 'find' | 'findOne' | 'exists'>
  >;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
    };
    service = new SystemsService(repo as unknown as Repository<SystemEntity>);
  });

  it('findAll loads systems with their customer, oldest first', async () => {
    const systems = [{ id: SYSTEM_ID }] as SystemEntity[];
    repo.find.mockResolvedValue(systems);

    expect(await service.findAll()).toBe(systems);
    expect(repo.find).toHaveBeenCalledWith({
      relations: { customer: true },
      order: { createdAt: 'ASC' },
    });
  });

  describe('findOneOrFail', () => {
    it('returns the system when found', async () => {
      const system = { id: SYSTEM_ID } as SystemEntity;
      repo.findOne.mockResolvedValue(system);

      expect(await service.findOneOrFail(SYSTEM_ID)).toBe(system);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: SYSTEM_ID },
        relations: { customer: true },
      });
    });

    it('throws NotFound when the system does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOneOrFail(SYSTEM_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('assertExists', () => {
    it('resolves when the system exists', async () => {
      repo.exists.mockResolvedValue(true);

      await expect(service.assertExists(SYSTEM_ID)).resolves.toBeUndefined();
      expect(repo.exists).toHaveBeenCalledWith({ where: { id: SYSTEM_ID } });
    });

    it('throws NotFound when the system is absent', async () => {
      repo.exists.mockResolvedValue(false);

      await expect(service.assertExists(SYSTEM_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
