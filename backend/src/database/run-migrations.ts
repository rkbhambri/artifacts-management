import AppDataSource from './data-source';

/**
 * Programmatic migration runner used by the Docker entrypoint so we don't rely
 * on ts-node / the TypeORM CLI in the production image.
 */
async function run(): Promise<void> {
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations();
  if (migrations.length === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Applied ${migrations.length} migration(s).`);
  }
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Migration run failed:', err);
  process.exit(1);
});
