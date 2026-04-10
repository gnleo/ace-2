import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client";
import {
  playerSchema,
  teamPlayerSchema,
  teamSchema,
} from "../../database/schema";
import { eq, name } from "drizzle-orm";

export const listAllTeamRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/team",
    {
      schema: {
        tags: ["Team"],
        summary: "List all teams.",
        response: {
          200: z.object({
            teams: z.array(
              z.object({
                teamId: z.string(),
                name: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const teams = await db
          .select({
            teamId: teamSchema.id,
            name: teamSchema.name,
          })
          .from(teamSchema);

        return reply.status(200).send({ teams });
      } catch (error) {
        throw error;
      }
    },
  );
};
