import type { FastifyInstance } from "fastify";
import { DashboardService, ProviderOrchestrator } from "../services/index.js";

const dashboardService = new DashboardService(new ProviderOrchestrator());

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard/:customerId", async (request, reply) => {
    const { customerId } = request.params as { customerId: string };
    const id = Number(customerId);

    if (Number.isNaN(id)) {
      return reply.status(400).send({ error: "customerId must be a number" });
    }

    const dashboard = await dashboardService.buildDashboard(id);
    return reply.status(200).send(dashboard);
  });
}
