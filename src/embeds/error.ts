import { EmbedBuilder } from "discord.js";

export function getErrorEmbed(errMsg: string = "Something went wrong dawg") {
  return new EmbedBuilder({ description: errMsg });
}
