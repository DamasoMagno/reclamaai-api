"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subcategoryRoutes = void 0;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
const paginationSchema = zod_1.default.object({
    page: zod_1.default.coerce.number().min(1).default(1),
    limit: zod_1.default.coerce.number().min(1).max(100).default(10),
});
const subcategoryRoutes = async (app) => {
    // 📌 GET /subcategory?page&limit
    app.get("/", {
        schema: {
            querystring: paginationSchema,
        },
    }, async (request, reply) => {
        const { page, limit } = request.query;
        const take = limit;
        const skip = (page - 1) * limit;
        const subcategories = await prisma_1.prisma.subcategory.findMany({
            take,
            skip,
            include: {
                category: true,
            },
        });
        return reply.status(200).send({ subcategories });
    });
    // 📌 GET /subcategory/:id
    app.get("/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const subcategory = await prisma_1.prisma.subcategory.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
        if (!subcategory) {
            return reply.status(404).send({ message: "Subcategory not found" });
        }
        return reply.status(200).send({ subcategory });
    });
    // 📌 POST /subcategory
    app.post("/", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            body: zod_1.default.object({
                name: zod_1.default.string().min(1),
                categoryId: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { name, categoryId } = request.body;
        // Verificar se a categoria existe
        const category = await prisma_1.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            return reply.status(404).send({ message: "Category not found" });
        }
        const subcategory = await prisma_1.prisma.subcategory.create({
            data: {
                name,
                categoryId,
            },
        });
        return reply.status(201).send({ subcategory });
    });
    // 📌 PUT /subcategory/:id
    app.put("/:id", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
            body: zod_1.default.object({
                name: zod_1.default.string().optional(),
                categoryId: zod_1.default.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { name, categoryId } = request.body;
        const subcategory = await prisma_1.prisma.subcategory.findUnique({
            where: { id },
        });
        if (!subcategory) {
            return reply.status(404).send({ message: "Subcategory not found" });
        }
        // Se trocar a categoria, verificar se ela existe
        if (categoryId) {
            const categoryExists = await prisma_1.prisma.category.findUnique({
                where: { id: categoryId },
            });
            if (!categoryExists) {
                return reply.status(404).send({ message: "Category not found" });
            }
        }
        await prisma_1.prisma.subcategory.update({
            where: { id },
            data: {
                name,
                categoryId,
            },
        });
        return reply.status(204).send();
    });
    // 📌 DELETE /subcategory/:id
    app.delete("/:id", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const subcategory = await prisma_1.prisma.subcategory.findUnique({
            where: { id },
        });
        if (!subcategory) {
            return reply.status(404).send({ message: "Subcategory not found" });
        }
        await prisma_1.prisma.subcategory.delete({
            where: { id },
        });
        return reply.status(204).send();
    });
};
exports.subcategoryRoutes = subcategoryRoutes;
