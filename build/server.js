"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const fastify_api_reference_1 = __importDefault(require("@scalar/fastify-api-reference"));
// import cron from "node-cron";
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const env_1 = require("./env");
const problem_1 = require("./routes/problem");
const category_1 = require("./routes/category");
const user_1 = require("./routes/user");
const comment_1 = require("./routes/comment");
const subcategory_1 = require("./routes/subcategory");
// import { prisma } from "./lib/prisma";
const app = (0, fastify_1.default)().withTypeProvider();
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.register(cors_1.default, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
});
app.register(jwt_1.default, {
    secret: env_1.env.SECRET_KEY,
});
app.register(swagger_1.default, {
    openapi: {
        info: {
            title: "API TopBurguer",
            version: "1.0.0",
        },
    },
});
app.register(fastify_api_reference_1.default, {
    routePrefix: "/docs",
});
app.register(problem_1.problemRoutes, {
    prefix: "/problem",
});
app.register(user_1.userRoutes, {
    prefix: "/user",
});
app.register(category_1.categoryRoutes, {
    prefix: "/category",
});
app.register(comment_1.commentRoutes, {
    prefix: "/comment"
});
app.register(subcategory_1.subcategoryRoutes, {
    prefix: "/subcategory"
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
app.listen({ port: env_1.env.PORT }, (error) => {
    if (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
    console.log(`Server listening at http://localhost:${env_1.env.PORT}`);
    console.log(`Docs available at http://localhost:${env_1.env.PORT}/docs`);
});
