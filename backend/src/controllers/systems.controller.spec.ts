import { SystemsController } from './systems.controller';
import { SystemsService } from '../services/systems.service';
import { SystemEntity } from '../entities/system.entity';

const SYSTEM_ID = '11111111-1111-1111-1111-111111111111';

describe('SystemsController', () => {
  let controller: SystemsController;
  let service: jest.Mocked<Pick<SystemsService, 'findAll' | 'findOneOrFail'>>;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOneOrFail: jest.fn(),
    };
    controller = new SystemsController(service as unknown as SystemsService);
  });

  it('findAll returns every system', async () => {
    const systems = [{ id: SYSTEM_ID }] as SystemEntity[];
    service.findAll.mockResolvedValue(systems);

    expect(await controller.findAll()).toBe(systems);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne returns a single system by id', async () => {
    const system = { id: SYSTEM_ID } as SystemEntity;
    service.findOneOrFail.mockResolvedValue(system);

    expect(await controller.findOne(SYSTEM_ID)).toBe(system);
    expect(service.findOneOrFail).toHaveBeenCalledWith(SYSTEM_ID);
  });
});
