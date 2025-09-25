import { EmbedBuilder } from "discord.js";
import { getErrorEmbed } from "../embeds/error";
import { osu } from "../states/osu";
import type { Ruleset, Type } from "../types";
import { getUserFriendlyModeName } from "../utils/get-friendly-mode-name";
import { getOsuId, getOsuIdWithUsername } from "../utils/get-osu-id";
import { ranks } from "../constants";
import { getUnixTimestamp } from "../utils/unix-timestamp";

export async function getOsuProfile(
  discordId: string,
  mode: Ruleset = "osu",
  type: Type = "discordId"
) {
  const osuId =
    type === "discordId"
      ? await getOsuId(discordId)
      : type === "osuUsername"
      ? await getOsuIdWithUsername(discordId)
      : Number(discordId);

  if (!osuId) {
    return getErrorEmbed("Couldn't find osu id for discord user: " + discordId);
  }

  const profile = await osu.users.getUser(osuId, { query: { key: "id" } });
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
    ▸ **Ranks**: ${ranks.SSH} ${stats.grade_counts.ssh} ${ranks.SS}> ${
      stats.grade_counts.ss
    } ${ranks.SH} ${stats.grade_counts.sh} ${ranks.S} ${stats.grade_counts.s} ${
      ranks.A
    } ${stats.grade_counts.a}
    `,
  });
  return embed;
}
