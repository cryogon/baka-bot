import type { Message } from "discord.js";
import { state } from "../states";
import { getRecentScore } from "../osu-commands/recent-score";

export async function handleOsuCommands(message: Message) {
  if (!message.guild) return;
  const config = state.getServerConfig(message.guild.id);
  if (!config || !config.botPrefix) return;
  const channel = message.guild.channels.cache.get(message.channelId) as any;
  if (!channel) return;
  const msg = message.content;
  const prefix = config.botPrefix;
  if (!msg.startsWith(prefix)) return;
  // temp for test
  if (msg === `${prefix}rs`) {
    const embed = await getRecentScore(message.author.id);
    channel.send({ embeds: [embed] });
  }
}
