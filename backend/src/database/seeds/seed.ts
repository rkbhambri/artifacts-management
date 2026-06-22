import AppDataSource from '../data-source';
import { CustomerEntity } from '../../entities/customer.entity';
import { SystemEntity } from '../../entities/system.entity';

/**
 * Idempotent seed of the Customer -> System hierarchy. Artifacts are created at
 * runtime via the upload API, so they are intentionally not seeded here.
 */
const SEED = [
  {
    customer: 'Acme Corp',
    systems: ['checkout-service', 'billing-service'],
  },
  {
    customer: 'Globex',
    systems: ['inventory-platform'],
  },
];

async function run(): Promise<void> {
  await AppDataSource.initialize();
  const customerRepo = AppDataSource.getRepository(CustomerEntity);
  const systemRepo = AppDataSource.getRepository(SystemEntity);

  for (const entry of SEED) {
    let customer = await customerRepo.findOne({
      where: { name: entry.customer },
    });
    if (!customer) {
      customer = await customerRepo.save(
        customerRepo.create({ name: entry.customer }),
      );
      console.log(`Created customer "${customer.name}" (${customer.id})`);
    }

    for (const systemName of entry.systems) {
      const existing = await systemRepo.findOne({
        where: { name: systemName, customerId: customer.id },
      });
      if (!existing) {
        const system = await systemRepo.save(
          systemRepo.create({ name: systemName, customerId: customer.id }),
        );
        console.log(`  Created system "${system.name}" (${system.id})`);
      }
    }
  }

  await AppDataSource.destroy();
  console.log('Seed complete.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
