import type { FastifyInstance } from "fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard/:customerId", async (request, reply) => {
    const { customerId } = request.params as { customerId: string };

    // Walking skeleton: mock data, real endpoint, 200 OK.
    // Adapters + providers will replace this in the next commit.
    return reply.status(200).send({
      customer: {
        id: Number(customerId),
        fullName: "Terry Medhurst",
        email: "atuny0@sohu.com",
        phone: "+63 791 675 8914",
        address: {
          street: "1745 T Street Southeast",
          city: "Washington",
          country: "United States",
        },
      },
      transactions: [
        {
          id: 1,
          title: "iPhone 9",
          quantity: 1,
          totalUsd: 549,
          totalEur: 510,
          totalGbp: 430,
        },
        {
          id: 2,
          title: "MacBook Pro",
          quantity: 1,
          totalUsd: 1749,
          totalEur: 1626,
          totalGbp: 1371,
        },
      ],
      summary: {
        count: 2,
        totalUsd: 2298,
      },
      fx: {
        base: "USD",
        rates: { EUR: 0.9297, GBP: 0.7829 },
      },
      providers: {
        core: { healthy: true, latencyMs: 120 },
        pagos: { healthy: true, latencyMs: 95 },
        fx: { healthy: true, latencyMs: 80 },
        inestable: { healthy: false, error: "not yet integrated" },
      },
      partial: true,
      warnings: ["Walking skeleton: providers not yet wired."],
    });
  });
}
