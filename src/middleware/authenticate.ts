import { FastifyReply, FastifyRequest } from "fastify";

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}
export { authenticate };
