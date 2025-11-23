import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export const userRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth",
    {
      schema: {
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (!userExists) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      const isPasswordValid = await compare(password, userExists.password);

      if (!isPasswordValid) {
        reply.status(401).send({ message: "Invalid password" });
        return;
      }

      const token = await reply.jwtSign({
        sub: userExists.id,
        name: userExists.name,
        email: userExists.email,
      });

      return reply.status(200).send({ token });
    }
  );

  app.post(
    "/register",
    {
      schema: {
        body: z.object({
          email: z.email(),
          password: z.string(),
          name: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { email, password, name } = request.body;

      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        reply.status(400).send({ message: "User already exists" });
        return;
      }

      const hashedPassword = await hash(password, 10);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      return { message: "User created" };
    }
  );
};
