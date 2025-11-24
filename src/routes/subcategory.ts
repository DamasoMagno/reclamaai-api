import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/authenticate";

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const subcategoryRoutes: FastifyPluginAsyncZod = async (app) => {
  // 📌 GET /subcategory?page&limit
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

      const subcategories = await prisma.subcategory.findMany({
        take,
        skip,
        include: {
          category: true,
        },
      });

      return reply.status(200).send({ subcategories });
    }
  );

  // 📌 GET /subcategory/:id
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

      const subcategory = await prisma.subcategory.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!subcategory) {
        return reply.status(404).send({ message: "Subcategory not found" });
      }

      return reply.status(200).send({ subcategory });
    }
  );

  // 📌 POST /subcategory
  app.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          name: z.string().min(1),
          categoryId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, categoryId } = request.body;

      // Verificar se a categoria existe
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return reply.status(404).send({ message: "Category not found" });
      }

      const subcategory = await prisma.subcategory.create({
        data: {
          name,
          categoryId,
        },
      });

      return reply.status(201).send({ subcategory });
    }
  );

  // 📌 PUT /subcategory/:id
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
          categoryId: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, categoryId } = request.body;

      const subcategory = await prisma.subcategory.findUnique({
        where: { id },
      });

      if (!subcategory) {
        return reply.status(404).send({ message: "Subcategory not found" });
      }

      // Se trocar a categoria, verificar se ela existe
      if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!categoryExists) {
          return reply.status(404).send({ message: "Category not found" });
        }
      }

      await prisma.subcategory.update({
        where: { id },
        data: {
          name,
          categoryId,
        },
      });

      return reply.status(204).send();
    }
  );

  // 📌 DELETE /subcategory/:id
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

      const subcategory = await prisma.subcategory.findUnique({
        where: { id },
      });

      if (!subcategory) {
        return reply.status(404).send({ message: "Subcategory not found" });
      }

      await prisma.subcategory.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
