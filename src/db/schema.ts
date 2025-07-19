import {
  pgTable,
  unique,
  integer,
  text,
  bigint,
  char,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "users_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  discordId: text("discord_id").notNull().unique(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  osuId: bigint("osu_id", { mode: "number" }).notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const guilds = pgTable(
  "guilds",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "guilds_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    guildId: text("guild_id").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: text("user_id").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [unique("guild_id_discord_id").on(table.guildId, table.userId)]
);

export const guildConfig = pgTable("guild_config", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "guild_config_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  guildId: text("guild_id").notNull().unique(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  quarantineRoleId: text("quarantine_role_id").notNull(),
  verificationChannelId: text("verification_channel_id").notNull(),
  welcomeChannelId: text("welcome_channel_id"),
  verifiedRoleId: text("verified_role_id"),
  botPrefix: char("bot_prefix"), // what command needs to be prefixed with for bot to call it
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});
