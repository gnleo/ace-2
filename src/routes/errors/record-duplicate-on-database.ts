import { DrizzleQueryError } from "drizzle-orm";

/** Código de erro PostgreSQL para violação de constraint UNIQUE */
const PG_UNIQUE_VIOLATION = "23505";

export class RecordDuplicateOnDatabaseError extends Error {
  constructor(
    message: string = "Registro duplicado.",
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "RecordDuplicateOnDatabaseError";
    Object.setPrototypeOf(this, RecordDuplicateOnDatabaseError.prototype);
  }

  /**
   * Verifica se o erro é uma violação de constraint UNIQUE (PostgreSQL 23505)
   * e retorna uma instância de RecordDuplicateOnDatabaseError com a mensagem informada,
   * ou null caso não seja.
   */
  static detect(
    error: unknown,
    message?: string,
  ): RecordDuplicateOnDatabaseError | null {
    if (error instanceof DrizzleQueryError && error.cause) {
      const cause = error.cause as { code?: string };
      if (cause.code === PG_UNIQUE_VIOLATION) {
        return new RecordDuplicateOnDatabaseError(
          message ?? "Registro duplicado.",
          {
            cause: error,
          },
        );
      }
    }
    return null;
  }
}
