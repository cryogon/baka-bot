import { Colors, EmbedBuilder } from "discord.js";
import { getErrorEmbed } from "./error";
import type { Ruleset, Score } from "../types";
import { getScore } from "../utils/get-score";
import { getUserFriendlyModeName } from "../utils/get-friendly-mode-name";
import { secondsToLengthString } from "../utils/seconds-to-length-string";

export async function getScoreEmbed(score: Score) {
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
      name: `Recent ${getUserFriendlyModeName(score.mode)} score for ${
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
