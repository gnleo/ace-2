import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { uploadFile } from "../hooks/upload";
import { db } from "../../database/client";
import { playerSchema } from "../../database/schema";
import { eq } from "drizzle-orm";
import { rm } from "node:fs/promises";

export const patchAvatarPlayerRoute: FastifyPluginAsyncZod = async (server) => {
  server.patch(
    "/player/:id",
    {
      schema: {
        tags: ["Player"],
        summary: "Upload file to presentation of player",
        consumes: ["multipart/form-data"],
        params: z.object({
          id: z.string(),
        }),
        response: {
          204: z.undefined,
          404: z.object({ message: z.string() }),
        },
      },
      preHandler: [uploadFile],
    },
    async (request, reply) => {
      const { id } = request.params;
      const [pathFile, filename] = request.pathFile!.split("/uploads/");

      try {
        const alreadyExistsPlayer = await db
          .select({ avatar: playerSchema.avatar })
          .from(playerSchema)
          .where(eq(playerSchema.id, id));

        if (alreadyExistsPlayer.length === 0) {
          throw new Error("Jogador não encontrado.");
        }

        if (alreadyExistsPlayer[0].avatar !== null) {
          const COMPLETE_PATH_FILE = `${pathFile}/uploads/${alreadyExistsPlayer[0].avatar}`;
          await rm(COMPLETE_PATH_FILE);
        }

        await db
          .update(playerSchema)
          .set({ avatar: filename })
          .where(eq(playerSchema.id, id));

        return reply.status(204).send();
      } catch (error) {
        throw error;
      }
    },
  );
};
