# Vortex Shield 🛡️

**Fastify + Redis API Gateway with Advanced Rate Limiting**

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.29-blue)](https://fastify.io/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)

Lightweight and performant API gateway built with **Fastify** and **Redis** for intelligent rate limiting. Designed to protect your APIs from abuse, spam, and basic DDoS attacks.

Perfect for microservices, SaaS backends, or any public API needing traffic control.

## ✨ Features

- ⚡ Blazing fast rate limiting using Redis (token bucket / sliding window)
- 🐳 Fully Dockerized (multi-stage build, alpine-based, < 100MB image)
- 🔒 Production-ready logging (JSON in prod, pretty in dev)
- 🌿 Clean TypeScript architecture
- 🚀 Easy to extend (add auth, proxying, monitoring...)

## 🚀 Quick Start

### With Docker (recommended)

```bash
git clone https://github.com/yourusername/vortex-gateway.git
cd vortex-gateway
docker compose up --build
