import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL as string;

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export { prisma };
