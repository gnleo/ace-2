import z from "zod";
import { cpf as validator } from "cpf-cnpj-validator";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CpfInvalidError } from "../errors/cpf-invalid";
import { db } from "../../database/client";
import { playerSchema } from "../../database/schema";
import { RecordDuplicateOnDatabaseError } from "../errors/record-duplicate-on-database";

export const createPlayerRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/player",
    {
      schema: {
        tags: ["Player"],
        summary: "Create a player",
        body: z.object({
          players: z.array(
            z.object({
              name: z
                .string({ error: "Nome é obrigatório." })
                .transform((value) => value.toUpperCase()),
              cpf: z.string({ error: "CPF é obrigatório." }).min(14, {
                error: "Número mínimo de caracteres não atingido.",
              }),
              rg: z.string().optional(),
              birthDate: z.coerce.date({
                error: "Data de nascimento inválida.",
              }),
              guardianId: z.uuidv7().optional(),
            }),
          ),
        }),
        response: {
          201: z.undefined(),
          400: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { players } = request.body;

      try {
        const invalidCpfs = players
          .map((p) => p.cpf)
          .filter((cpf) => !validator.isValid(cpf));

        if (invalidCpfs.length > 0) {
          throw new CpfInvalidError(invalidCpfs);
        }

        await db.insert(playerSchema).values(players);

        return reply.status(201).send();
      } catch (error) {
        if (error instanceof CpfInvalidError) {
          return reply.status(400).send({ message: error.message });
        }

        const databaseError = RecordDuplicateOnDatabaseError.detect(error);
        if (databaseError) {
          return reply.status(409).send({ message: databaseError.message });
        }
        throw error;
      }
    },
  );
};
