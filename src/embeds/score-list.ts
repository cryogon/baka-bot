import { EmbedBuilder } from "discord.js";
import type { Score } from "osu-web.js";
import { osu } from "../states/osu";

export async function getScoreList(scores: Score[]) {
  if (scores.length > 0) return null;
  const user = await osu.users.getUser((scores[0] as Score).user_id);

  const embed = new EmbedBuilder({
    author: {
      name: `${user.username} (#${user.statistics.global_rank} IN${user.statistics.country_rank})`,
      url: `https://osu.ppy.sh/u/${user.id}`,
      icon_url: `https://flagpedia.net/data/flags/w580/${user.country_code.toLowerCase()}.png`
    },
    description: scores.map((score)=>{
        `${score.rank} +${score.mods}`
    }).join("\n")
  });
}
