import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getRecentScore } from "../../osu-commands/recent-score";

export const data = new SlashCommandBuilder()
  .setName("recent-score")
  .setDescription("get recent score!");

export async function execute(interaction: CommandInteraction) {
  const embed = await getRecentScore(interaction.user.id);
  await interaction.reply({ embeds: [embed] });
}
