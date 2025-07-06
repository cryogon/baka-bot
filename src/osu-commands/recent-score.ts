import { EmbedBuilder } from "@discordjs/builders";
import { osu } from "../states/osu";
import type { Ruleset } from "../types";
import { getOsuId } from "../utils/get-osu-id";
import { safeAwait } from "../utils/safe-await";
import { Colors } from "discord.js";

type Score = Awaited<ReturnType<typeof osu.users.getUserScores>>[0];

export async function getRecentScore(discordId: string, mode: Ruleset = "osu") {
  const osuId = await getOsuId(discordId);
  if (!osuId) {
    return getErrorEmbed("Couldn't find osu id for discord user: " + discordId);
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

  if (!data.length) getErrorEmbed("No recent score available");
  const recentScore = data[0] as Score;
  return getScoreEmbed(recentScore, mode);
}

function getScoreEmbed(score: Score, mode: Ruleset) {
  if (!score.beatmap || !score.beatmapset || !score.user)
    return getErrorEmbed();

  const embed = new EmbedBuilder({
    author: {
      name: `Recent ${mode} score for ${score.user.username}`,
      icon_url: score.user.avatar_url,
      url: `https://osu.ppy.sh/u/${score.user.id}`,
    },
    description: `Hello Wassup\nwhat is the fucking structure of embed\nL`,
    image: { url: score.beatmapset.covers.card },
    thumbnail: { url: score.beatmapset.covers["card@2x"] },
    timestamp: new Date().toISOString(),
    color: Colors.LuminousVividPink,
    fields: [
      {
        name: "<:bpm:1391315336183414885>",
        value: score.beatmap.bpm?.toString() || "N/A",
        inline: true,
      },
      { name: "Test", value: "bruh value or whatever", inline: true },
    ],
  });
  return embed;
}

function getErrorEmbed(errMsg: string = "Something went wrong dawg") {
  return new EmbedBuilder({ description: errMsg });
}
