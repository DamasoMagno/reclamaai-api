"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = void 0;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
const paginationSchema = zod_1.default.object({
    page: zod_1.default.coerce.number().min(1).default(1),
    limit: zod_1.default.coerce.number().min(1).max(100).default(10),
});
const commentRoutes = async (app) => {
    app.get("/", {
        schema: {
            querystring: paginationSchema,
        },
    }, async (request, reply) => {
        const { page, limit } = request.query;
        const take = limit;
        const skip = (page - 1) * limit;
        const comments = await prisma_1.prisma.comment.findMany({
            take,
            skip,
            include: {
                user: true,
                problem: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return reply.status(200).send({ comments });
    });
    app.get("/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const comment = await prisma_1.prisma.comment.findUnique({
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
    });
    app.post("/", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            body: zod_1.default.object({
                content: zod_1.default.string().min(1),
                problemId: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { content, problemId } = request.body;
        const userId = request.user.sub;
        // Verificar se o tópico existe
        const problem = await prisma_1.prisma.problem.findUnique({ where: { id: problemId } });
        if (!problem) {
            return reply.status(404).send({ message: "Topic not found" });
        }
        const comment = await prisma_1.prisma.comment.create({
            data: {
                content,
                problemId,
                userId,
            },
        });
        return reply.status(201).send({ comment });
    });
    app.put("/:id", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
            body: zod_1.default.object({
                content: zod_1.default.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { content } = request.body;
        const userId = request.user.sub;
        const comment = await prisma_1.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return reply.status(404).send({ message: "Comment not found" });
        }
        if (comment.userId !== userId) {
            return reply.status(403).send({ message: "Not allowed" });
        }
        await prisma_1.prisma.comment.update({
            where: { id },
            data: { content },
        });
        return reply.status(204).send();
    });
    app.delete("/:id", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.sub;
        const comment = await prisma_1.prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return reply.status(404).send({ message: "Comment not found" });
        }
        if (comment.userId !== userId) {
            return reply.status(403).send({ message: "Not allowed" });
        }
        await prisma_1.prisma.comment.delete({
            where: { id },
        });
        return reply.status(204).send();
    });
};
exports.commentRoutes = commentRoutes;
