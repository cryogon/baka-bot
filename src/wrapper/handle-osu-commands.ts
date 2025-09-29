import type { Message } from "discord.js";
import { state } from "../states";
import { getRecentScore } from "../osu-commands/recent-score";
import { getOsuProfile } from "../osu-commands/profile";
import { commandParser } from "../utils/command-parser";
import { getBeatmapFromConversation } from "../utils/get-last-valid-embed";
import { getErrorEmbed } from "../embeds/error";
import { checkScore } from "../osu-commands/check";

export async function handleOsuCommands(message: Message) {
  if (!message.guild) return;
  const config = state.getServerConfig(message.guild.id);
  if (!config || !config.botPrefix) return;
  const channel = message.guild.channels.cache.get(message.channelId) as any;
  if (!channel) return;
  const msg = message.content.trim();
  const prefix = config.botPrefix;
  if (!msg.startsWith(prefix)) return;
  const command = commandParser(msg);

  if (command.command === "rs") {
    if (!command.user) {
      const embed = await getRecentScore(message.author.id);
      return channel.send({ embeds: [embed] });
    }
    const embed = await getRecentScore(
      command.user.value,
      "osu",
      command.user.type
    );
    return channel.send({ embeds: [embed] });
  }

  if (command.command === "osu") {
    if (!command.user) {
      const embed = await getOsuProfile(message.author.id);
      return channel.send({ embeds: [embed] });
    }
    const embed = await getOsuProfile(
      command.user.value,
      "osu",
      command.user.type
    );
    return channel.send({ embeds: [embed] });
  }

  if (command.command === "c") {
    const beatmap = await getBeatmapFromConversation(message);
    if (!beatmap) return getErrorEmbed("Failed to find the beatmap");
    if (!command.user) {
      const embed = await checkScore(message.author.id, beatmap);
      return channel.send({ embeds: [embed] });
    }
    const embed = await checkScore(
      command.user.value,
      beatmap,
      command.user.type
    );
    return channel.send({ embeds: [embed] });
  }
}
