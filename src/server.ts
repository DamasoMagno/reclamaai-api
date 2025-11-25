import fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import jwt from "@fastify/jwt";
import scalar from "@scalar/fastify-api-reference";
// import cron from "node-cron";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";

import { problemRoutes } from "./routes/problem";
import { categoryRoutes } from "./routes/category";
import { userRoutes } from "./routes/user";
import { commentRoutes } from "./routes/comment";
import { subcategoryRoutes } from "./routes/subcategory";

// import { prisma } from "./lib/prisma";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});

app.register(jwt, {
  secret: env.SECRET_KEY,
});

app.register(swagger, {
  openapi: {
    info: {
      title: "API TopBurguer",
      version: "1.0.0",
    },
  },
});

app.register(scalar, {
  routePrefix: "/docs",
});

app.register(problemRoutes, {
  prefix: "/problem",
});

app.register(userRoutes, {
  prefix: "/user",
});

app.register(categoryRoutes, {
  prefix: "/category",
});

app.register(commentRoutes, {
  prefix: "/comment",
});

app.register(subcategoryRoutes, {
  prefix: "/subcategory",
});

// cron.schedule("*/10 * * * *", async () => {
//   try {
//     const complaints = await prisma.complaint.findMany({
//       orderBy: { createdAt: "desc" },
//       take: 200,
//     });

//     console.log(
//       `[cron] checked ${
//         complaints.length
//       } complaints at ${new Date().toISOString()}`
//     );
//   } catch (error) {
//     console.error("[cron] error while checking complaints:", error);
//   }
// });

app.listen({ port: env.PORT, host: env.HOST }, (error) => {
  if (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }

  console.log(`Server listening on port ${env.PORT}`);
});
