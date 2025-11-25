"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.problemRoutes = void 0;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../lib/prisma");
const authenticate_1 = require("../middleware/authenticate");
const problemRoutes = async (app) => {
    app.get("/", {
        schema: {
            querystring: zod_1.default.object({
                page: zod_1.default.coerce.number().min(1).default(1),
                limit: zod_1.default.coerce.number().min(1).max(100).default(10),
            }),
        },
    }, async (request, reply) => {
        const { page, limit } = request.query;
        const take = limit;
        const skip = (page - 1) * limit;
        const problems = await prisma_1.prisma.problem.findMany({
            orderBy: { createdAt: "desc" },
            take,
            skip,
            include: {
                subcategory: true,
                commment: true,
            },
        });
        return reply.status(200).send({ problems });
    });
    app.get("/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const problem = await prisma_1.prisma.problem.findUnique({
            where: { id },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
                commment: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (!problem) {
            return reply.status(404).send({ message: "Problem not found" });
        }
        return reply.status(200).send({ problem });
    });
    app.post("/", {
        schema: {
            body: zod_1.default.object({
                location: zod_1.default.string().min(1),
                subcategoryId: zod_1.default.string().uuid(),
                recurrence: zod_1.default.enum(["ALWAYS", "SOMETIMES", "FIRST"]),
                impact: zod_1.default.enum(["CITY", "NEIGHBORHOOD", "STREET"]),
            }),
        },
    }, async (request, reply) => {
        // const userId = request.user.sub;
        const { location, subcategoryId, recurrence, impact } = request.body;
        const problemExists = await prisma_1.prisma.problem.findFirst({
            where: {
                location,
                subcategoryId,
            },
        });
        if (problemExists) {
            return reply.status(200).send({ problemId: problemExists.id });
        }
        const subcat = await prisma_1.prisma.subcategory.findUnique({
            where: { id: subcategoryId },
        });
        if (!subcat) {
            return reply.status(404).send({ message: "Subcategory not found" });
        }
        const problem = await prisma_1.prisma.problem.create({
            data: {
                location,
                subcategoryId,
                recurrence,
                impact,
                status: "STATED",
            },
        });
        return reply.status(201).send({ problem });
    });
    app.put("/:id", {
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
            body: zod_1.default.object({
                location: zod_1.default.string().optional(),
                subcategoryId: zod_1.default.string().uuid().optional(),
                recurrence: zod_1.default.enum(["ALWAYS", "SOMETIMES", "FIRST"]).optional(),
                impact: zod_1.default.enum(["CITY", "NEIGHBORHOOD", "STREET"]).optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const problem = await prisma_1.prisma.problem.findUnique({
            where: { id },
        });
        if (!problem) {
            return reply.status(404).send({ message: "Problem not found" });
        }
        const updated = await prisma_1.prisma.problem.update({
            where: { id },
            data: request.body,
        });
        return reply.status(200).send({ problem: updated });
    });
    app.delete("/:id", {
        preHandler: [authenticate_1.authenticate],
        schema: {
            params: zod_1.default.object({
                id: zod_1.default.string().uuid(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params;
        await prisma_1.prisma.problem.delete({
            where: { id },
        });
        return reply.status(204).send();
    });
};
exports.problemRoutes = problemRoutes;
