CREATE TABLE "guilds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guilds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "guild_id_discord_id" UNIQUE("guild_id","user_id")
);
