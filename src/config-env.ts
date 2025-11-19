// src/config-env.ts
import dotenv from 'dotenv';
dotenv.config();

const DOT_ENV = {
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/order_engine',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Auth
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret',
} as const;

export default DOT_ENV;