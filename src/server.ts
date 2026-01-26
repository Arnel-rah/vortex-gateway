import Fastify from "fastify";
import fastifyRedis from "@fastify/redis";
import fastifyJwt from "@fastify/jwt";
import { setupRateLimiter } from "./limiter";
import applySecurityHeaders, { 
  applyRelaxedSecurityHeaders, 
  applySwaggerSecurityHeaders 
} from "./utils/http/securityHeaders";

const isDev = process.env.NODE_ENV !== "production";

const server = Fastify({
  logger: isDev
    ? {
        level: "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
      }
    : true,
});

const start = async () => {
  try {
    await server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "super-secret-vortex-key-2026",
    });

    const { default: swagger } = await import("@fastify/swagger");
    const { default: swaggerUi } = await import("@fastify/swagger-ui");

    await server.register(swagger, {
      openapi: {
        info: {
          title: "Vortex Shield API",
          description: "Lightweight API Gateway with advanced rate limiting using Fastify and Redis.",
          version: "1.0.0",
        },
        servers: [{ url: "http://localhost:3000" }],
      },
    });

    await server.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: { docExpansion: "full", deepLinking: true },
    });

    await server.register(fastifyRedis, {
      host: process.env.REDIS_HOST || "redis",
      port: 6379,
    });

    await setupRateLimiter(server);

    server.post("/login", async (req, reply) => {
      const token = server.jwt.sign({ user: "Arnel", role: "admin" });
      return { token };
    });

    server.get(
      "/health",
      {
        schema: {
          description: "Health check",
          tags: ["system"],
          response: {
            200: {
              type: "object",
              properties: {
                status: { type: "string" },
                timestamp: { type: "string" },
              },
            },
          },
        },
      },
      async () => ({ status: "Vortex Online", timestamp: new Date().toISOString() })
    );

    server.delete(
      "/admin/unban/:ip",
      {
        schema: {
          summary: "Unban an IP address",
          tags: ["Admin"],
          params: {
            type: "object",
            properties: { ip: { type: "string", format: "ipv4" } },
          },
        },
      },
      async (request: any) => {
        const { ip } = request.params;
        await server.redis.del(`vortex:blacklist:${ip}`);
        await server.redis.del(`vortex:violations:${ip}`);
        return { status: "success", message: `IP ${ip} unbanned.` };
      }
    );

    server.addHook("onRequest", async (req, reply) => {
      const url = req.url;

      if (url.startsWith("/docs")) {
        applySwaggerSecurityHeaders(reply);
        return;
      }

      if (url === "/health" || url === "/login") {
        applyRelaxedSecurityHeaders(reply);
        return;
      }

      applySecurityHeaders(reply);

      try {
        await req.jwtVerify();
      } catch (err) {
        if (url !== "/health" && url !== "/login" && !url.startsWith("/docs")) {
          return reply.code(401).send({ error: "Unauthorized", message: "Token invalid" });
        }
      }
    });

    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();