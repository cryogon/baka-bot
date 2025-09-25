import type { Message } from "discord.js";

export async function getBeatmapFromConversation(message: Message) {
  const msg = await getLastValidEmbed(message);
  const embed = msg?.embeds?.[0];

  if (!msg || !embed || !embed.url) {
    return null;
  }

  const beatmap = {
    id: Number(embed.url.split("/").at(-1) || "NA"),
    title: embed.title,
    imageUrl: embed.image?.url,
    url: embed.url,
  };

  if (Number.isNaN(beatmap.id)) {
    return null;
  }

  return beatmap;
}

/**
 * get last valid embed from the conversation e.g use >c to get last valid score embed or map embed
 * gives priority to tagged message
 */
async function getLastValidEmbed(message: Message) {
  if (message.reference) {
    const repliedMessage = await message.fetchReference();
    return repliedMessage;
  }

  const messages = await message.channel.messages.fetch({ limit: 10 });
  const msg = messages.find(
    (message) =>
      message.author.bot &&
      message.embeds &&
      message.embeds.length &&
      ["/b", "/beatmaps"].some((s) => message.embeds[0]?.url?.includes(s))
  );
  return msg;
}
