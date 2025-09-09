import type { Message } from "discord.js";
import { state } from "../states";
import { getRecentScore } from "../osu-commands/recent-score";
import { getOsuProfile } from "../osu-commands/profile";

export async function handleOsuCommands(message: Message) {
  if (!message.guild) return;
  const config = state.getServerConfig(message.guild.id);
  if (!config || !config.botPrefix) return;
  const channel = message.guild.channels.cache.get(message.channelId) as any;
  if (!channel) return;
  const msg = message.content.trim();
  const prefix = config.botPrefix;
  if (!msg.startsWith(prefix)) return;
  const chunks = msg.split(" ");

  if (msg.startsWith(`${prefix}rs`)) {
    if (chunks.length <= 1) {
      const embed = await getRecentScore(message.author.id);
      return channel.send({ embeds: [embed] });
    }

    const param = chunks[1] as string;
    console.log("Param", param, chunks);
    if (param.startsWith("<@")) {
      const discordId = param.substring(2, param.length - 1);
      const embed = await getRecentScore(discordId);
      return channel.send({ embeds: [embed] });
    }

    // username
    if (Number.isNaN(Number(param))) {
      const embed = await getRecentScore(param, "osu", "osuUsername");
      return channel.send({ embeds: [embed] });
    }

    const embed = await getRecentScore(param, "osu", "osuId");
    return channel.send({ embeds: [embed] });
  }

  if (msg.startsWith(`${prefix}osu`)) {
    const embed = await getOsuProfile(message.author.id);
    channel.send({ embeds: [embed] });
  }
}
