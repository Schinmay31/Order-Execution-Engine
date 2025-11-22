// src/config-env.ts
import dotenv from 'dotenv';
dotenv.config();

const DOT_ENV = {
  PORT: parseInt(process.env.PORT || "3000"),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://localhost:5432/order_engine",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "cookie-secret",
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT)
    : undefined,
  DATABASE_SSL_REJECT_UNAUTHORIZED:
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true",
  DATABASE_SSL_CA: process.env.DATABASE_SSL_CA,
  DATABASE_SSL: process.env.DATABASE_SSL === "true",
};

export default DOT_ENV;