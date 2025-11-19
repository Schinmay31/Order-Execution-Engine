// src/app.ts
import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import { Pool } from 'pg';
import Redis from 'ioredis';
import DOT_ENV from './config-env';
import { routes } from './routes/index';
import { errorHandler } from './middleware/errorHandler.middleware';
// import { authMiddleware } from './middleware/auth.middleware';
import { connectToDB } from './config/database.connection';
import { connectToRedis } from './config/redis.connection';

// Extend FastifyRequest to include requestTime property
declare module 'fastify' {
  interface FastifyRequest {
    requestTime?: number;
  }
}

export class App {
  public app: FastifyInstance;
  public port: number;
  public db: Pool;
  public redis: Redis;

  constructor() {
    // Initialize Fastify instance
    this.app = Fastify({
    logger:false,
      bodyLimit: 52428800, // 50MB LLimit
      trustProxy: true,
    });

    this.port = DOT_ENV.PORT || 3000;
    this.db = this.initializeDatabase();
    this.redis = this.initializeRedis();
  }

  // Initialize PostgreSQL connection
  private initializeDatabase(): Pool {
    return connectToDB();  
}

  // Initialize Redis connection
  private initializeRedis(): Redis {
   return connectToRedis()  
}

  // Register all plugins and middleware
  public async initialize() {
    try {
      
        await this.app.register(helmet, {
        contentSecurityPolicy: false,
      });

      await this.app.register(cors, {
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      });

      await this.app.register(compress, {
        global: true,
      });

      await this.app.register(cookie, {
        secret: DOT_ENV.COOKIE_SECRET || 'my-secret-key',
      });

      await this.app.register(rateLimit, {
        max: 50, // Max requests
        timeWindow: '1 minute', // Per minute
        redis: this.redis, // Redis for distributed rate limiting
      });

      await this.app.register(websocket, {
        options: {
          maxPayload: 1048576, // 1MB max payload
        },
      });

      this.app.decorate('db', this.db);
      this.app.decorate('redis', this.redis);

      // Global hooks
      this.registerHooks();

      // Routes
      await this.registerRoutes();

      // Error handler
      this.registerErrorHandler();

      console.log('Fastify app initialized successfully');
    } catch (err) {
      console.error('Error during initialization:', err);
      throw err;
    }
  }

  // Register global hooks 
  private registerHooks() {
    // Request logging
    this.app.addHook('onRequest', async (request, reply) => {
      request.requestTime = Date.now();
    });

    // Response time logging
    this.app.addHook('onResponse', async (request, reply) => {
      const responseTime = Date.now() - (request.requestTime || 0);
      console.log(
        `${request.method} ${request.url} - ${reply.statusCode} - ${responseTime}ms`
      );
    });
  }

  // Register routes 
  private async registerRoutes() {
    
    // Register main routes
    await this.app.register(routes, { prefix: '/api' });
  }

  // Error handler 
  private registerErrorHandler() {
    this.app.setErrorHandler(errorHandler);
  }

  // Start server 
  public async listen() {
    try {
      await this.app.listen({ 
        port: this.port, 
        host: '0.0.0.0' // Important for Docker/Railway
      });
      
      console.log(`Server is running...`);
      
      return this.app;
    } catch (err) {
      this.app.log.error(err);
      process.exit(1);
    }
  }

  // Graceful shutdown
  public async close() {
    console.log('Shutting down gracefully...');
    
    await this.db.end();
    this.redis.disconnect();
    await this.app.close();
    
    console.log('Server closed');
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received');
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received');
});