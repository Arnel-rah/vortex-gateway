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
    await server.register(fastifyRedis, {
      host: process.env.REDIS_HOST || 'redis', 
      port: 6379, 
    });

    await setupRateLimiter(server);

    server.get('/health', async () => {
      return { status: 'Vortex Online', timestamp: new Date().toISOString() };
    });

    await server.listen({ port: 3000, host: '0.0.0.0' });
    server.log.info(`Server listening on http://0.0.0.0:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();