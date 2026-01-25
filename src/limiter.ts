import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export const setupRateLimiter = async (fastify: FastifyInstance) => {
  
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const { redis } = fastify;
    const ip = request.ip;
    const key = `vortex:ratelimit:${ip}`;
    const MAX_REQUESTS = 20;
    const WINDOW_TIME = 60;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, WINDOW_TIME);
      }

      reply.header('X-RateLimit-Limit', MAX_REQUESTS);
      reply.header('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - current));

      if (current > MAX_REQUESTS) {
        fastify.log.warn(`Rate limit exceeded for IP: ${ip}`);
        return reply.code(429).send({
          status: 'error',
          code: 429,
          message: 'Too many requests, Vortex Gateway has throttled your connection.',
          retry_after: await redis.ttl(key)
        });
      }
    } catch (err) {
        fastify.log.error({ err }, 'Redis Rate Limiter Error');
        return;
    }
  });
};