"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const bcryptjs_1 = require("bcryptjs");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const userRoutes = async (app) => {
    app.post("/auth", {
        schema: {
            body: zod_1.z.object({
                email: zod_1.z.email(),
                password: zod_1.z.string(),
            }),
        },
    }, async (request, reply) => {
        const { email, password } = request.body;
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!userExists) {
            reply.status(404).send({ message: "User not found" });
            return;
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(password, userExists.password);
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
    });
    app.post("/register", {
        schema: {
            body: zod_1.z.object({
                email: zod_1.z.email(),
                password: zod_1.z.string(),
                name: zod_1.z.string(),
            }),
        },
    }, async (request, reply) => {
        const { email, password, name } = request.body;
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (userExists) {
            reply.status(400).send({ message: "User already exists" });
            return;
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(password, 10);
        await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        return { message: "User created" };
    });
};
exports.userRoutes = userRoutes;
