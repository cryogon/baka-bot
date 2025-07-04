import { pgTable, unique, integer, text, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	discordId: text("discord_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	osuId: bigint("osu_id", { mode: "number" }).notNull(),
}, (table) => [
	unique("osu_id_discord_id").on(table.discordId, table.osuId),
]);
