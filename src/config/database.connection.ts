import { Pool } from 'pg';
import DOT_ENV from '../config-env';

export const connectToDB = (): Pool  => {
    const pool = new Pool({
      connectionString: DOT_ENV.DATABASE_URL,
      ssl: DOT_ENV.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      max: 20, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('connect', () => {
      console.log(' PostgreSQL connected successfully');
    });

    pool.on('error', (err:any) => {
      console.error(' PostgreSQL error:', err);
      process.exit(-1);
    });

    return pool;
  }