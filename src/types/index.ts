export interface ServerConfig {
  guildId: string;
  quarantineRoleId: string;
  verificationChannelId: string;
  welcomeChannelId?: string | null;
  verifiedRoleId?: string | null;
  botPrefix?: string | null;
}

export type Ruleset = "osu" | "mania" | "taiko" | "fruits";
