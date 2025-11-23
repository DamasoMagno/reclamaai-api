import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/authenticate";

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const commentRoutes: FastifyPluginAsyncZod = async (app) => {
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

      const comments = await prisma.comment.findMany({
        take,
        skip,
        include: {
          user: true,
          problem: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return reply.status(200).send({ comments });
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

      const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
          user: true,
          problem: true,
        },
      });

      if (!comment) {
        return reply.status(404).send({ message: "Comment not found" });
      }

      return reply.status(200).send({ comment });
    }
  );

  app.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          content: z.string().min(1),
          problemId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { content, problemId } = request.body;

      const userId = request.user.sub;

      // Verificar se o tópico existe
      const problem = await prisma.problem.findUnique({ where: { id: problemId } });
      if (!problem) {
        return reply.status(404).send({ message: "Topic not found" });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          problemId,
          userId,
        },
      });

      return reply.status(201).send({ comment });
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
          content: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { content } = request.body;
      const userId = request.user.sub;

      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return reply.status(404).send({ message: "Comment not found" });
      }

      if (comment.userId !== userId) {
        return reply.status(403).send({ message: "Not allowed" });
      }

      await prisma.comment.update({
        where: { id },
        data: { content },
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
      const userId = request.user.sub;

      const comment = await prisma.comment.findUnique({ where: { id } });

      if (!comment) {
        return reply.status(404).send({ message: "Comment not found" });
      }

      if (comment.userId !== userId) {
        return reply.status(403).send({ message: "Not allowed" });
      }

      await prisma.comment.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
