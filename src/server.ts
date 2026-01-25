import Fastify from 'fastify';
import fastifyRedis from '@fastify/redis';
import { setupRateLimiter } from './limiter';

const server = Fastify({ 
  logger: { transport: { target: 'pino-pretty' } } 
});

const start = async () => {
  try {
    await server.register(fastifyRedis, {
      host: process.env.REDIS_HOST || '127.0.0.1',
    });
    await setupRateLimiter(server);

    server.get('/health', async () => {
      return { status: 'Vortex Online', timestamp: new Date().toISOString() };
    });

    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();