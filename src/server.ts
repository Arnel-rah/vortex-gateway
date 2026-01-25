import Fastify from 'fastify';
import fastifyRedis from '@fastify/redis';
import { setupRateLimiter } from './limiter';

const isDev = process.env.NODE_ENV !== 'production';

const server = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : true,
});

const start = async () => {
  try {
    const { default: swagger } = await import('@fastify/swagger');
    const { default: swaggerUi } = await import('@fastify/swagger-ui');

    await server.register(swagger, {
      openapi: {
        info: {
          title: 'Vortex Shield API',
          description: 'Lightweight API Gateway with advanced rate limiting using Fastify and Redis. Protects your endpoints from abuse.',
          version: '1.0.0',
        },
        servers: [
          { url: 'http://localhost:3000', description: 'Local development' },
        ],
      },
    });

    await server.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: true,
      },
    });

    server.log.info('Swagger/OpenAPI documentation registered at /docs');

    await server.register(fastifyRedis, {
      host: process.env.REDIS_HOST || 'redis',
      port: 6379,
    });

    await setupRateLimiter(server);

    server.get('/health', {
      schema: {
        description: 'Check if the gateway is online',
        tags: ['system'],
        summary: 'Health check',
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'Vortex Online' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }, async () => {
      return { status: 'Vortex Online', timestamp: new Date().toISOString() };
    });

    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server listening on http://0.0.0.0:3000`);
    server.log.info(`API Documentation: http://localhost:3000/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();