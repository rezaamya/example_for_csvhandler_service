import * as process from 'process';

export interface IPostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database_name: string;
}

const postgresConfig = () => ({
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database_name: process.env.POSTGRES_DB,
  },
});

export default postgresConfig;
