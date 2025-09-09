import type { osu } from "../states/osu";

export interface ServerConfig {
  guildId: string;
  quarantineRoleId: string;
  verificationChannelId: string;
  welcomeChannelId?: string | null;
  verifiedRoleId?: string | null;
  botPrefix?: string | null;
}

export type Ruleset = "osu" | "mania" | "taiko" | "fruits";
export type Score = Awaited<ReturnType<typeof osu.users.getUserScores>>[0];
export type Type = "discordId" | "osuId" | "osuUsername";
