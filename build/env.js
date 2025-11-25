"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, { message: "DATABASE_URL is required" }),
    PORT: zod_1.z.coerce.number().min(1, { message: "PORT is required" }).default(3000),
    SECRET_KEY: zod_1.z.string().min(1, { message: "SECRET_KEY is required" }),
    OPENAI_API_KEY: zod_1.z.string().min(1, { message: "OPENAI_API_KEY is required" }),
});
exports.env = envSchema.parse(process.env);
