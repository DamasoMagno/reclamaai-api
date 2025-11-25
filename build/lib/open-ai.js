"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = require("openai");
const env_1 = require("../env");
const openai = new openai_1.OpenAI({
    apiKey: env_1.env.OPENAI_API_KEY,
});
exports.openai = openai;
