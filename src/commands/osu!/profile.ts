import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getRecentScore } from "../../osu-commands/recent-score";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("get osu profile");

export async function execute(interaction: CommandInteraction) {
  const embed = await getRecentScore(interaction.user.id);
  await interaction.reply({ embeds: [embed] });
}
