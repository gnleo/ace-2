import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client";
import { teamPlayerSchema } from "../../database/schema";

export const registerTeamPlayersRoute: FastifyPluginAsyncZod = async (
  server,
) => {
  server.post(
    "/team/:teamId/players",
    {
      schema: {
        tags: ["Team"],
        summary: "Register team players",
        params: z.object({
          teamId: z.string(),
        }),
        body: z.object({
          players: z.array(
            z.object({
              id: z.string(),
            }),
          ),
        }),
      },
    },
    async (request, reply) => {
      const { teamId } = request.params;
      const { players } = request.body;

      const data = players.map((player) => ({
        teamId,
        playerId: player.id,
      }));

      await db.insert(teamPlayerSchema).values(data);
      return reply.status(201).send();
    },
  );
};
