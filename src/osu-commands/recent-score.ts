import { EmbedBuilder } from "@discordjs/builders";
import { osu } from "../states/osu";
import type { Ruleset } from "../types";
import { getOsuId, getOsuIdWithUsername } from "../utils/get-osu-id";
import { safeAwait } from "../utils/safe-await";
import { Colors } from "discord.js";
import { secondsToLengthString } from "../utils/seconds-to-length-string";
import { getScore } from "../utils/get-score";
import { getErrorEmbed } from "../embeds/error";
import { getUserFriendlyModeName } from "../utils/get-friendly-mode-name";

type Score = Awaited<ReturnType<typeof osu.users.getUserScores>>[0];
type Type = "discordId" | "osuId" | "osuUsername";

export async function getRecentScore(
  param: string,
  mode: Ruleset = "osu",
  type: Type = "discordId"
) {
  console.log("Recent Score Args", param, mode, type);
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
  return getScoreEmbed(recentScore, mode);
}

async function getScoreEmbed(score: Score, mode: Ruleset) {
  if (
    !score.beatmap ||
    !score.beatmapset ||
    !score.user ||
    !score.maximum_statistics
  )
    return getErrorEmbed();

  const { result, ifFcResult } = await getScore(score);
  const embed = new EmbedBuilder({
    author: {
      name: `Recent ${getUserFriendlyModeName(mode)} score for ${
        score.user.username
      }`,
      icon_url: score.user.avatar_url,
      url: `https://osu.ppy.sh/u/${score.user.id}`,
    },
    title: `${score.beatmapset.artist} - ${score.beatmapset.title} [${
      score.beatmap.version
    }] +${score.mods.map((m) => m.acronym).join("")} [${
      score.beatmap.difficulty_rating
    }★]`,
    url: score.beatmap?.url,
    description: `-> ${score.rank} | \`${result.pp.toFixed(
      2
    )}PP\` (${ifFcResult.pp.toFixed(2)}PP for fc) | \`${(
      (score.accuracy || 0) * 100
    ).toFixed(
      2
    )}\` \n-> <:length:1391315456140251216> \`${secondsToLengthString(
      score.beatmap.total_length || 0
    )}\` | <:bpm:1391315336183414885> \`${score.beatmap.bpm}\` | AR: \`${
      score.beatmap.ar
    }\` | OD: \`${score.beatmap.accuracy}\` | HP: \`${
      score.beatmap.drain
    }\` | CS: \`${score.beatmap.cs}\`\n-> \`${score.total_score}\` | \`x${
      score.max_combo
    }/${result.difficulty.maxCombo || 0}\` | [${
      score.statistics?.great || 0
    }, ${score.statistics?.ok || 0}, ${score.statistics?.meh || 0}, ${
      score.statistics?.miss || 0
    }]`,

    image: { url: score.beatmapset.covers["card@2x"] }, // bottom huge image
    // thumbnail: { url: score.beatmapset.covers.card }, // top right image
    timestamp: score.ended_at,
    color: Colors.LuminousVividPink,
    footer: {
      text: `Baka-Bot • ${score.beatmapset.status}`,
    },
  });

  // free memory
  result.free();
  ifFcResult.free();

  return embed;
}
