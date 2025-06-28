import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { osuApi } from "../../states/osu";

export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("link osu profile!")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The osu! username to look up")
      .setMinLength(3)
      .setMaxLength(15)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const osuUsername = interaction.options.getString("username", true);
    await interaction.deferReply();

    const user = await osuApi.getUser({ u: osuUsername });
    console.log("User", user);
    if (!user || !user.name) {
      await interaction.editReply(`❌ User "${osuUsername}" not found.`);
      return;
    }

    await interaction.editReply(`Linked: ${user.name}(#${user.pp.rank}[#${user.country}${user.pp.countryRank}])`);
  } catch (err) {
    console.error("Error fetching osu! user:", err);
    await interaction.editReply(
      "❌ Failed to fetch osu! profile. Please try again later."
    );
  }
}
