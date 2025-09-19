import { getErrorEmbed } from "../embeds/error";
import { getScoreEmbed } from "../embeds/single-score";
import { osu } from "../states/osu";
import type { Score, Type } from "../types";
import { getOsuId, getOsuIdWithUsername } from "../utils/get-osu-id";

export async function checkScore(
  discordId: string,
  beatmapId: number,
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

  const scores = await osu.beatmaps.getBeatmapUserScoresV2(beatmapId, osuId);
  if (!scores.length) return getErrorEmbed("No Scores Found");
  if (scores.length === 1) {
    const score = scores[0] as unknown as Score;
    return await getScoreEmbed(score);
  }
  return getErrorEmbed("Not Supported Yet");
}

function getUnixTimestamp(time?: string) {
  if (!time) return 0;
  const date = new Date(time);
  return Math.floor(date.getTime() / 1000);
}
