export class CpfInvalidError extends Error {
  public readonly invalidCpfs: string[];

  constructor(invalidCpfs: string[] = []) {
    const message =
      invalidCpfs.length > 0
        ? `CPF(s) inválido(s): ${invalidCpfs.join(", ")}.`
        : "CPF inválido.";
    super(message);
    this.invalidCpfs = invalidCpfs;
  }
}
