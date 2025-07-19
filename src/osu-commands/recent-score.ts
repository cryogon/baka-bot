import { EmbedBuilder } from "@discordjs/builders";
import { osu } from "../states/osu";
import type { Ruleset } from "../types";
import { getOsuId } from "../utils/get-osu-id";
import { safeAwait } from "../utils/safe-await";
import { Colors } from "discord.js";
import { secondsToLengthString } from "../utils/seconds-to-length-string";
import { getScore } from "../utils/get-score";

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

  if (!data.length) return getErrorEmbed("No recent score available");
  const recentScore = data[0] as Score;
  console.log("Score", recentScore);
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

function getErrorEmbed(errMsg: string = "Something went wrong dawg") {
  return new EmbedBuilder({ description: errMsg });
}

function getUserFriendlyModeName(mode: Ruleset) {
  switch (mode) {
    case "fruits":
      return "ctb";
    default:
      return mode;
  }
}
