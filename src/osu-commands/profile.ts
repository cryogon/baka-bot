import { EmbedBuilder } from "discord.js";
import { getErrorEmbed } from "../embeds/error";
import { osu } from "../states/osu";
import type { Ruleset } from "../types";
import { getUserFriendlyModeName } from "../utils/get-friendly-mode-name";
import { getOsuId } from "../utils/get-osu-id";

export async function getOsuProfile(discordId: string, mode: Ruleset = "osu") {
  const osuId = await getOsuId(discordId);
  if (!osuId) {
    return getErrorEmbed("Couldn't find osu id for discord user: " + discordId);
  }
  const profile = await osu.users.getUser(osuId, { mode, key: "id" });
  const gameMode = getUserFriendlyModeName(mode);
  const stats = profile.statistics;
  if (!stats) {
    return getErrorEmbed();
  }

  const teamText = profile.team
    ? `**Team**: [${profile.team.short_name}](https://osu.ppy.sh/teams/${profile.team.id})`
    : "";
    
  const embed = new EmbedBuilder({
    title: `${gameMode}! Profile for ${profile.username}`,
    url: `https://osu.ppy.sh/u/${profile.id}`,
    thumbnail: {
      url: profile.avatar_url,
    },
    description: `
    ▸ **Rank**: #${stats.global_rank} (IN#${stats.country_rank})
    ▸ **Peak Rank**: #${
      profile.rank_highest?.rank
    } archeived <t:${getUnixTimestamp(profile.rank_highest?.updated_at)}:R>
    ▸ **Level**: ${stats.level.current} + ${stats.level.progress}% ${teamText}
    ▸ **PP**: ${stats.pp} **Acc**: ${stats.hit_accuracy.toFixed(2)}%
    ▸ **Playcount**: ${stats.play_count} (${Math.round(
      (stats.play_time || 0) / (60 * 60)
    )})
    // Rank soon tm
    `,
  });
  return embed;
}

function getUnixTimestamp(time?: string) {
  if (!time) return 0;
  const date = new Date(time);
  return Math.floor(date.getTime() / 1000);
}
