import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const TestDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_TEST,
  entities: [__dirname + '/modules/**/*.entity.{ts,js}'],
  synchronize: true,
});
