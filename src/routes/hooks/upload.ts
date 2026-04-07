import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { FastifyReply, FastifyRequest } from "fastify";
import { uuidv7 as v7 } from "uuidv7";

const UPLOAD_DIR = path.join(__dirname, "./../../../uploads");

export async function uploadFile(request: FastifyRequest, reply: FastifyReply) {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const data = await request.file();

  if (!data) {
    throw new Error("Arquivo não encontrado.");
  }

  const fileName = v7();
  const extensionFile = path.parse(data.filename).ext; // pode ser aceito: ".pdf|.jpg|.png|.JPG"
  const pathFile = `${UPLOAD_DIR}/${fileName}${extensionFile}`; // literal template

  await pipeline(data.file, fs.createWriteStream(pathFile));
  request.pathFile = pathFile;
}
