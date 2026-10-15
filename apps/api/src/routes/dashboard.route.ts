import type { FastifyInstance } from "fastify";
import { createRepositories } from "../repositories/repository.factory.js";
import { DashboardService, ProviderOrchestrator } from "../services/index.js";

const { customerRepo, transactionRepo } = createRepositories();
const dashboardService = new DashboardService(
  new ProviderOrchestrator(),
  customerRepo,
  transactionRepo,
);

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

  app.get("/customers/:customerId/transactions", async (request, reply) => {
    const { customerId } = request.params as { customerId: string };
    const id = Number(customerId);

    if (Number.isNaN(id)) {
      return reply.status(400).send({ error: "customerId must be a number" });
    }

    const transactions = await transactionRepo.findByCustomerId(id);
    return reply.status(200).send({ customerId: id, transactions });
  });
}
