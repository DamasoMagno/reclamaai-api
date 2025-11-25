"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
const paginationSchema = zod_1.default.object({
    page: zod_1.default.coerce.number().min(1).default(1),
    limit: zod_1.default.coerce.number().min(1).max(100).default(10),
});
const categoryRoutes = async (app) => {
    app.get("/", {
        schema: {
            querystring: paginationSchema,
        },
    }, async (request, reply) => {
        const { page, limit } = request.query;
        const take = limit;
        const skip = (page - 1) * limit;
        const categories = await prisma_1.prisma.category.findMany({
            take,
            skip,
            include: {
                subcategories: true,
            },
        });
        return reply.status(200).send({ categories });
    });
    app.get("/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            reply.status(404).send({ message: "Category not found" });
            return;
        }
        return reply.status(200).send({ category });
    });
    app.post("/", {
        schema: {
            body: zod_1.default.object({
                name: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { name } = request.body;
        await prisma_1.prisma.category.create({
            data: {
                name,
            },
        });
        return reply.status(201).send();
    });
    app.put("/:id", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
            body: zod_1.default.object({
                name: zod_1.default.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { name } = request.body;
        await prisma_1.prisma.category.update({
            where: { id },
            data: {
                name,
            },
        });
        return reply.status(204).send();
    });
    app.delete("/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        await prisma_1.prisma.category.delete({
            where: { id },
        });
        return reply.status(204).send();
    });
};
exports.categoryRoutes = categoryRoutes;
