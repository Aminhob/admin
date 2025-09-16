import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'license_management',
  synchronize: false, // Always false when using migrations
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../models/**/*.{js,ts}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{js,ts}')],
  subscribers: [],
  migrationsRun: false, // We'll run migrations manually
});

// Export a function to initialize the data source
export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    return AppDataSource;
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    throw err;
  }
};

// For migration scripts
if (require.main === module) {
  initializeDataSource().catch(err => {
    console.error('Failed to initialize data source:', err);
    process.exit(1);
  });
}
