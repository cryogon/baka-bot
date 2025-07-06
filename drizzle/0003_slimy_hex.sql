CREATE TABLE "guild_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "guild_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guild_id" text NOT NULL,
	"quarantine_role_id" text NOT NULL,
	"verification_channel_id" text NOT NULL,
	"welcome_channel_id" text,
	"verified_role_id" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "guild_config_guild_id_unique" UNIQUE("guild_id")
);
