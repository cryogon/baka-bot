import type { ScoreV2 } from "osu-web.js";
import { getErrorEmbed } from "../embeds/error";
import { osu } from "../states/osu";
import type { Type } from "../types";
import { getOsuId, getOsuIdWithUsername } from "../utils/get-osu-id";
import { EmbedBuilder } from "discord.js";
import { getUser } from "../wrapper/get-user";
import { ranks } from "../constants";
import { getUnixTimestamp } from "../utils/unix-timestamp";

type Beatmap = {
  id: number;
  title: string | null;
  imageUrl: string | undefined;
  url: string;
};
export async function checkScore(
  discordId: string,
  beatmap: Beatmap,
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

  const scores = await osu.beatmaps.getBeatmapUserScoresV2(beatmap.id, osuId);
  if (!scores.length) return getErrorEmbed("No Scores Found");
  if (scores.length === 1) {
    const score = scores[0] as unknown as ScoreV2;
    console.log("Score", score);
    return await getCheckScoreEmbed(score, beatmap);
  }
  return getErrorEmbed("Multiple Score, Not Supported Yet");
}

async function getCheckScoreEmbed(score: ScoreV2, beatmap: Beatmap) {
  const user = await getUser(score.user_id);
  if (!user || !beatmap.title || !beatmap.imageUrl || score.rank === "F") {
    return getErrorEmbed();
  }
  const embed = new EmbedBuilder({
    author: {
      icon_url: `https://a.ppy.sh/${score.user_id}`,
      name: `${user.username}: ${user.statistics.pp} (#${user.statistics.global_rank} ${user.country.code}${user.statistics.country_rank})`,
      url: `https://osu.ppy.sh/u/${score.user_id}`,
    },
    title: beatmap.title,
    url: beatmap.url,
    image: {
      url: beatmap.imageUrl,
    },
    description: `
    ${ranks[score.rank]} +${score.mods.map((mod) => mod.acronym).join("")} ${
      score.total_score
    } ${(score.accuracy * 100).toFixed(2)}% <t:${getUnixTimestamp(
      score.ended_at
    )}:R>
    ${score.pp}/max_pp ${score.max_combo}/max_combo {${
      score.statistics.great || 0
    }, ${score.statistics.ok || 0}, ${score.statistics.meh || 0}, ${
      score.statistics.miss || 0
    }}
    `,
  });
  return embed;
}
