import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { osu } from "../../states/osu";
import { createWelcomeImage } from "../../utils/generate-welcome-image";
import { state } from "../../states";

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
    if (!interaction.guild) {
      return await interaction.reply("command is only usable on servers");
    }

    const config = state.getServerConfig(interaction.guild.id);
    if (!config) {
      console.log(
        `No configuration found for guild: ${interaction.guild.name}.`
      );
      return await interaction.reply(
        "this bot has configured properly, ping the server admin's dawg."
      );
    }

    const osuUsername = interaction.options.getString("username", true);
    await interaction.deferReply();

    const user = await osu.users.getUser(osuUsername, { key: "username" });
    if (!user || !user.username) {
      await interaction.editReply(`❌ User "${osuUsername}" not found.`);
      return;
    }
    const imageBuffer = await createWelcomeImage(
      interaction.user.username,
      osuUsername,
      interaction.user.avatarURL({ size: 512, extension: "jpg" }) || "",
      user.avatar_url,
      interaction.guild?.name
    );

    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "welcome.png",
    });
    await interaction.editReply(`Linked: ${user.username} | ${user.id}`);
    const welcomeChannel = interaction.client.channels.cache.get(
      config.welcomeChannelId || interaction.channelId
    ) as any;

    if (welcomeChannel) {
      welcomeChannel.send({ files: [attachment] });
    }
  } catch (err) {
    console.error("Error fetching osu! user:", err);
    await interaction.editReply(
      "❌ Failed to fetch osu! profile. Please try again later."
    );
  }
}
