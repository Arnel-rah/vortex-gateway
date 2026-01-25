import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const setupRateLimiter = async (fastify: FastifyInstance) => {
  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { redis } = fastify;
      const ip = request.ip;

      const KEY_LIMIT = `vortex:ratelimit:${ip}`;
      const KEY_VIOLATIONS = `vortex:violations:${ip}`;
      const KEY_BLACKLIST = `vortex:blacklist:${ip}`;

      try {
        const isBanned = await redis.get(KEY_BLACKLIST);
        if (isBanned) {
          fastify.log.warn(`[SECURITY] Blocked request from banned IP: ${ip}`);
          return reply.code(403).send({
            error: "Forbidden",
            message:
              "Vortex Shield: Your IP is temporarily banned (24h) for repeated abuse.",
            code: 403,
          });
        }

        const current = await redis.incr(KEY_LIMIT);
        if (current === 1) await redis.expire(KEY_LIMIT, 60);

        if (current > 20) {
          const violations = await redis.incr(KEY_VIOLATIONS);
          if (violations >= 5) {
            await redis.set(KEY_BLACKLIST, "banned", "EX", 86400);
            fastify.log.error(`[BAN] IP ${ip} has been blacklisted for 24h.`);
          }

          return reply.code(429).send({
            error: "Too Many Requests",
            message:
              "Rate limit exceeded. Repeated violations will lead to a 24h ban.",
            violations_count: violations,
          });
        }
      } catch (err) {
        fastify.log.error({ err }, "Rate Limiter Error");
      }
    },
  );
};
