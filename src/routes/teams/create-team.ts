import z from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client";
import { teamSchema } from "../../database/schema";
import { RecordDuplicateOnDatabaseError } from "../errors/record-duplicate-on-database";

export const createTeamRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/team",
    {
      schema: {
        tags: ["Team"],
        summary: "Create a team",
        body: z.object({
          name: z
            .string({ error: "Nome é obrigatório." })
            .transform((value) => value.toUpperCase()),
          owner: z
            .string({ error: "Representante do time é obrigatório." })
            .transform((value) => value.toUpperCase()),
        }),
        response: {
          201: z.undefined(),
          400: z.object({ error: z.string() }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, owner } = request.body;

      try {
        await db.insert(teamSchema).values({ name, owner });
        return reply.status(201).send();
      } catch (error) {
        const databaseError = RecordDuplicateOnDatabaseError.detect(error);
        if (databaseError) {
          return reply.status(409).send({ message: databaseError.message });
        }
        throw error;
      }
    },
  );
};
