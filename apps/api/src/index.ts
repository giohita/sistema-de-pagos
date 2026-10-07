import "dotenv/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { dashboardRoutes } from "./routes/dashboard.route.js";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

await app.register(helmet);
await app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || true,
});

app.get("/health", async () => ({ status: "ok" }));

await app.register(dashboardRoutes, { prefix: "/api/v1" });

const PORT = Number(process.env.API_PORT || 3001);
const HOST = process.env.API_HOST || "0.0.0.0";

await app.listen({ port: PORT, host: HOST });

console.log(`🚀 PayLinkHub API running at http://${HOST}:${PORT}`);
