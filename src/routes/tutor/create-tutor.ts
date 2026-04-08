import z from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { cpf as validator } from "cpf-cnpj-validator";
import { db } from "../../database/client";
import { guardianSchema, modalitySchema } from "../../database/schema";
import { eq } from "drizzle-orm";
import { CpfInvalidError } from "../errors/cpf-invalid";

export const createTutorRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/tutor",
    {
      schema: {
        tags: ["Tutor"],
        summary: "Create a record for a legal guardian of the athlete.",
        body: z.object({
          name: z
            .string({ error: "Nome é obrigatório." })
            .transform((value) => value.toUpperCase()),
          cpf: z.string().min(11, { error: "Número mínimo de caracteres 11." }),
          rg: z.string().optional(),
        }),
        response: {
          201: z.undefined(),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, cpf, rg } = request.body; // desestruturação

      try {
        if (!validator.isValid(cpf)) {
          throw new CpfInvalidError();
        }

        await db.insert(guardianSchema).values({ name, cpf, rg });

        return reply.status(201).send();
      } catch (error) {
        if (error instanceof CpfInvalidError) {
          return reply.status(409).send({ message: error.message });
        }
        throw error;
      }
    },
  );
};
