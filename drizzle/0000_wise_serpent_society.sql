-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"discord_id" text NOT NULL,
	"osu_id" bigint NOT NULL,
	CONSTRAINT "osu_id_discord_id" UNIQUE("discord_id","osu_id")
);

*/