import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client";
import { playerSchema, teamPlayerSchema } from "../../database/schema";
import { eq } from "drizzle-orm";

export const listAllPlayerOfTeamRoute: FastifyPluginAsyncZod = async (
  server,
) => {
  server.get(
    "/team/:id/players",
    {
      schema: {
        tags: ["Team"],
        summary: "List all players of team.",
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.array(
            z.object({
              playerId: z.string(),
              name: z.string(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const players = await db
          .select({
            playerId: playerSchema.id,
            name: playerSchema.name,
          })
          .from(playerSchema)
          .innerJoin(teamPlayerSchema, eq(playerSchema.id, teamPlayerSchema.id))
          .where(eq(teamPlayerSchema.id, id));

        return reply.status(200).send(players);
      } catch (error) {
        throw error;
      }
    },
  );
};
