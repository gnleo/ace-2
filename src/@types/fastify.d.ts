import fastify from "fastify";
import type { Multipart } from "@fastify/multipart";

declare module "fastify" {
  export interface FastifyRequest {
    file?: Multipart;
    pathFile?: string;
  }
}
