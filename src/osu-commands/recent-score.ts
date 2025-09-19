import { osu } from "../states/osu";
import type { Ruleset, Score, Type } from "../types";
import { getOsuId, getOsuIdWithUsername } from "../utils/get-osu-id";
import { safeAwait } from "../utils/safe-await";
import { getErrorEmbed } from "../embeds/error";
import { getScoreEmbed } from "../embeds/single-score";

export async function getRecentScore(
  param: string,
  mode: Ruleset = "osu",
  type: Type = "discordId"
) {
  const osuId =
    type === "discordId"
      ? await getOsuId(param)
      : type === "osuUsername"
      ? await getOsuIdWithUsername(param)
      : Number(param);

  if (!osuId) {
    return getErrorEmbed("Couldn't find osu id for discord user: " + param);
  }

  const [err, data] = await safeAwait(() =>
    osu.users.getUserScores(osuId, {
      mode,
      type: "recent",
      limit: 1,
      include_fails: true,
    })
  );

  if (err || !data) {
    console.log("Failed to get recent score: err", err);
    return getErrorEmbed();
  }

  if (!data.length) return getErrorEmbed("No recent score available");
  const recentScore = data[0] as Score;
  return getScoreEmbed(recentScore);
}
