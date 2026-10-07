import "dotenv/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { dashboardRoutes } from "./routes/dashboard.route.js";

const app = Fastify({
  logger: { level: env.api.logLevel },
});

await app.register(helmet);
await app.register(cors, {
  origin: env.api.allowedOrigins?.split(",") || true,
});

app.get("/health", async () => ({ status: "ok" }));

await app.register(dashboardRoutes, { prefix: "/api/v1" });

const PORT = env.api.port;
const HOST = env.api.host;

await app.listen({ port: PORT, host: HOST });

console.log(`🚀 PayLinkHub API running at http://${HOST}:${PORT}`);
