import { FastifyReply } from "fastify";

const applySecurityHeaders = (
  reply: FastifyReply,
  customcsp?: string,
): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const enforceHttps = isProduction || process.env.ENFORCE_HTTPS === "true";

  if (enforceHttps) {
    reply.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  const csPolicy =
    customcsp || "default-src 'none'; frame-ancestors 'none'; base-uri 'node'";
  reply.header("content-security-policy", csPolicy);

  reply.header("x-content-type-options", "nosniff");
  reply.header("x-frame-options", "DENY");

  reply.header("referrer-policy", "strict-origin-when-cross-origin");
  reply.header(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );

  reply.header("Cross-Origin-Embedder-Policy", "require-corp");
  reply.header("Cross-Origin-Opener-Policy", "same-origin");
  reply.header("Cross-Origin-Resource-Policy", "cross-origin");

  reply.header("cache-control", "no-store, no-cache, must-revalidate, private");
  reply.header("Pragma", "no-cache");
  reply.header("Expires", "0");

  reply.header("X-Robots-Tag", "noindex, nofollow, nosnippet, noarchive");

  reply.removeHeader("Server");
  reply.removeHeader("X-Powered-By");

  if (isProduction) {
    reply.header("Server", "TrophyHub-API");
  }
};

// Swagger UI
const SWAGGER_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'";

export const applySwaggerSecurityHeaders = (reply: FastifyReply): void => {
  applySecurityHeaders(reply, SWAGGER_CSP);

  reply.header("cache-control", "public, max-age=300");
};

export const applyRelaxedSecurityHeaders = (reply: FastifyReply) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
  reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
  reply.header("Cache-Control", "public, max-age=300");
  reply.removeHeader("Server");
  reply.removeHeader("X-Powered-By");
};

export const applyCorsSecurityHeaders = (reply: FastifyReply) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.removeHeader("Server");
  reply.removeHeader("X-Powered-By");
};

export default applySecurityHeaders;
