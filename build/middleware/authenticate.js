"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.send(err);
    }
}
