import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/authenticate";

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const categoryRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const take = limit;
      const skip = (page - 1) * limit;

      const categories = await prisma.category.findMany({
        take,
        skip,
      });

      return reply.status(200).send({ categories });
    }
  );

  app.get(
    "/:id",
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        reply.status(404).send({ message: "Category not found" });
        return;
      }

      return reply.status(200).send({ category });
    }
  );

  app.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          name: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name } = request.body;

      await prisma.category.create({
        data: {
          name,
        },
      });

      return reply.status(201).send();
    }
  );

  app.put(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name } = request.body;

      await prisma.category.update({
        where: { id },
        data: {
          name,
        },
      });

      return reply.status(204).send();
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      await prisma.category.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
