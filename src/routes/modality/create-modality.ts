import z from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client";
import { modalitySchema } from "../../database/schema";
import { eq } from "drizzle-orm";

export const createModalityRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/modality",
    {
      schema: {
        tags: ["Modality"],
        summary: "Create a sporting modality",
        body: z.object({
          name: z
            .string({ error: "Nome é obrigatório." })
            .transform((value) => value.toUpperCase()),
          maxPlayers: z.coerce
            .number({ error: "Número máximo de atletas não informado." })
            .min(8, { error: "Número informado não permitido." }),
        }),
        response: {
          201: z.undefined(),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, maxPlayers } = request.body; // desestruturação

      try {
        // select name from modality where name="basquete";
        const alreadyExistsModality = await db
          .select({ name: modalitySchema.name })
          .from(modalitySchema)
          .where(eq(modalitySchema.name, name));

        if (alreadyExistsModality.length > 0) {
          return reply
            .status(409)
            .send({ message: "Essa modalidade já existe." });
        }

        await db.insert(modalitySchema).values({ name, maxPlayers });

        return reply.status(201).send();
      } catch (error) {
        throw new Error("error");
      }
    },
  );
};
