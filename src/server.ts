import fastifySwagger from "@fastify/swagger";
import scalarAPIReference from "@scalar/fastify-api-reference";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createModalityRoute } from "./routes/modality/create-modality";
import { createTutorRoute } from "./routes/tutor/create-tutor";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { createPlayerRoute } from "./routes/player/create-player";
import { patchAvatarPlayerRoute } from "./routes/player/patch-avatar-player";
import { registerTeamPlayersRoute } from "./routes/teams/record-players-team";
import { listAllTeamRoute } from "./routes/teams/list-all-team";
import { createTeamRoute } from "./routes/teams/create-team";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:SS Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

server.register(fastifyMultipart);

server.register(fastifyStatic, {
  root: `${__dirname}/../uploads`,
  prefix: "/file/",
});

if (process.env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API gerenciamento de eventos esportivos",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarAPIReference, {
    routePrefix: "/docs",
  });
}

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.get("/health", (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send();
});

server.register(createModalityRoute);
server.register(createTutorRoute);

server.register(createPlayerRoute);
server.register(patchAvatarPlayerRoute);

server.register(createTeamRoute);
server.register(registerTeamPlayersRoute);
server.register(listAllTeamRoute);

export { server };
