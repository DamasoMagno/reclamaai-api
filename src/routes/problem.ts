import z from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/authenticate";

export const problemRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(10),
        }),
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const take = limit;
      const skip = (page - 1) * limit;

      const problems = await prisma.problem.findMany({
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: {
          subcategory: true,
        },
      });

      return reply.status(200).send({ problems });
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const problem = await prisma.problem.findUnique({
        where: { id },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
          commment: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!problem) {
        return reply.status(404).send({ message: "Problem not found" });
      }

      return reply.status(200).send({ problem });
    }
  );

  app.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          location: z.string().min(1),
          subcategoryId: z.string().uuid(),
          recurrence: z.enum(["ALWAYS", "SOMETIMES", "FIRST"]),
          impact: z.enum(["CITY", "NEIGHBORHOOD", "STREET"]),
          status: z.enum(["STATED", "IN_PROGRESS", "FINISHED"])
        }),
      },
    },
    async (request, reply) => {
      const userId = request.user.sub;
 
      const { location, subcategoryId, recurrence, impact, status } = request.body;

      const problemExists = await prisma.problem.findFirst({
        where: {
          location, subcategoryId,
        }
      })

      if (problemExists) {
        return reply.status(200).send({ message: "The problem already exists." });
      }

      const subcat = await prisma.subcategory.findUnique({
        where: { id: subcategoryId },
      });

      if (!subcat) {
        return reply.status(404).send({ message: "Subcategory not found" });
      }

      const problem = await prisma.problem.create({
        data: {
          location,
          subcategoryId,
          recurrence,
          impact,
          status: 'STATED',
        },
      });

      return reply.status(201).send({ problem });
    }
  );

  app.put(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          location: z.string().optional(),
          subcategoryId: z.string().uuid().optional(),
          recurrence: z.enum(["ALWAYS", "SOMETIMES", "FIRST"]).optional(),
          impact: z.enum(["CITY", "NEIGHBORHOOD", "STREET"]).optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const problem = await prisma.problem.findUnique({
        where: { id },
      });

      if (!problem) {
        return reply.status(404).send({ message: "Problem not found" });
      }


      const updated = await prisma.problem.update({
        where: { id },
        data: request.body,
      });

      return reply.status(200).send({ problem: updated });
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      await prisma.problem.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
