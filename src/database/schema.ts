import { uuid, pgTable, text, integer, date } from "drizzle-orm/pg-core";
import { uuidv7 as v7 } from "uuidv7";

const uuidV7PrimaryKey = (columnDbName: string = "id") =>
  uuid(columnDbName)
    .primaryKey()
    .$defaultFn(() => v7())
    .notNull();

export const modalitySchema = pgTable("modality", {
  id: uuidV7PrimaryKey(),
  name: text().notNull(),
  maxPlayers: integer("max_players").notNull(),
});

export const guardianSchema = pgTable("guardian", {
  id: uuidV7PrimaryKey(),
  name: text().notNull(),
  cpf: text().notNull().unique(),
  rg: text(),
});

export const teamSchema = pgTable("team", {
  id: uuidV7PrimaryKey(),
  name: text().notNull().unique(),
  owner: text().notNull(),
});

export const playerSchema = pgTable("player", {
  id: uuidV7PrimaryKey(),
  name: text().notNull(),
  cpf: text().notNull().unique(),
  rg: text(),
  avatar: text(),
  birthDate: date("birth_date", { mode: "date" }),
  guardianId: uuid("guardian_id").references(() => guardianSchema.id, {
    onDelete: "no action",
  }),
});

export const modalityPlayerSchema = pgTable("modality_player", {
  id: uuidV7PrimaryKey(),
  modalityId: uuid("modality_id").references(() => modalitySchema.id, {
    onDelete: "cascade",
  }),
  playerId: uuid("player_id").references(() => playerSchema.id, {
    onDelete: "cascade",
  }),
  position: text(),
});

export const teamPlayerSchema = pgTable("team_player", {
  id: uuidV7PrimaryKey(),
  teamId: uuid("team_id").references(() => teamSchema.id, {
    onDelete: "cascade",
  }),
  playerId: uuid("player_id").references(() => playerSchema.id, {
    onDelete: "cascade",
  }),
});
