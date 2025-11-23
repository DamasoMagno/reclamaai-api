import z from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/authenticate";

const complaintSchema = z.object({
  id: z.number(),
  text: z.string(),
  description: z.string().nullable(),
  status: z.string(), // ajuste conforme enum real no schema prisma se houver
  topicId: z.uuid().nullable(),
  userId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  location: z.string(),
});

export const topicRoutes: FastifyPluginAsyncZod = async (app) => {
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

      const complaints = await prisma.complaint.findMany({
        orderBy: { createdAt: "desc" },
        take,
        skip,
      });

      return reply.status(200).send({ complaints });
    }
  );

  app.get(
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

      const complaint = await prisma.complaint.findUnique({
        where: { id },
      });

      if (!complaint) {
        return reply.status(404).send({ message: "Complaint not found" });
      }

      return reply.status(200).send({ complaint });
    }
  );

  app.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: complaintSchema,
      },
    },
    async (request, reply) => {
      const user = request.user;
      const { text, location, topicId } = request.body;

      const created = await prisma.complaint.create({
        data: {
          text,
          location,
          userId: user.sub,
          topicId,
        },
      });

      return reply.status(201).send({ complaint: created });
    }
  );

  // Atualiza complaint (autenticado)
  app.put(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          text: z.string().optional(),
          description: z.string().optional(),
          status: z.string().optional(),
          topicId: z.uuid().optional(),
          location: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { text, location, topicId } = request.body;

      // opcional: checar permissões aqui (proprietário ou admin)
      const updated = await prisma.complaint.update({
        where: { id },
        data: {
          text,
          location,
          topicId: topicId ?? null,
        },
      });

      return reply.status(200).send({ complaint: updated });
    }
  );

  // Deleta complaint (autenticado)
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

      await prisma.complaint.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
