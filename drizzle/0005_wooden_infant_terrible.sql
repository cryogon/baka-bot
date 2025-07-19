ALTER TABLE "users" DROP CONSTRAINT "osu_id_discord_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_discord_id_unique" UNIQUE("discord_id");