import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { loadConfiguration } from '../config/configuration';
import { CustomerEntity } from '../entities/customer.entity';
import { SystemEntity } from '../entities/system.entity';
import { ArtifactEntity } from '../entities/artifact.entity';
import { InitSchema1700000000000 } from './migrations/1700000000000-InitSchema';

const config = loadConfiguration();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [CustomerEntity, SystemEntity, ArtifactEntity],
  migrations: [InitSchema1700000000000],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
