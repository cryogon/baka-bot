import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  GuildMemberRoleManager,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { osu } from "../../states/osu";
import { createWelcomeImage } from "../../utils/generate-welcome-image";
import { state } from "../../states";
import { db } from "../../db";
import { guilds, users } from "../../db/schema";
import { eq } from "drizzle-orm";

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

    const botMember = interaction.guild.members.me;
    if (!botMember) {
      console.error("Bot member not found in guild");
      return;
    }

    const quarantineRole = interaction.guild.roles.cache.get(
      config.quarantineRoleId
    );

    if (!quarantineRole) {
      console.error(
        `Quarantine role not found in guild: ${interaction.guild.name}`
      );
      return await interaction.reply(
        "this bot has configured properly, ping the server admin's dawg."
      );
    }

    if (quarantineRole.position >= botMember.roles.highest.position) {
      console.error(
        `Bot cannot manage role ${quarantineRole.name} - role is higher than bot's highest role`
      );
      console.error(
        `Quarantine role position: ${quarantineRole.position}, Bot's highest role position: ${botMember.roles.highest.position}`
      );
      return await interaction.reply("Nope can't do");
    }

    if (!interaction.guild.members.me?.permissions.has("ManageRoles")) {
      console.error(
        `Bot doesn't have ManageRoles permission in guild: ${interaction.guild.name}`
      );
      return await interaction.reply("Nope can't do");
    }

    const osuUsername = interaction.options.getString("username", true);
    await interaction.deferReply();

    const user = await osu.users.getUser(osuUsername, { key: "username" });
    if (!user || !user.username) {
      await interaction.editReply(`❌ User "${osuUsername}" not found.`);
      return;
    }

    const userExistsInServer = await db.query.guilds.findFirst({
      where: eq(guilds.userId, interaction.user.id),
    });

    const userExists = await db.query.users.findFirst({
      where: eq(users.discordId, interaction.user.id),
    });

    try {
      await db
        .insert(users)
        .values({ discordId: interaction.user.id, osuId: user.id })
        .onConflictDoUpdate({
          target: [users.discordId, users.osuId],
          set: { osuId: user.id },
        });
    } catch (err) {
      console.log("Failed to link user. err:", err);
      await interaction.editReply(`something went wrong`);
      return;
    }

    await interaction.editReply(
      !userExists
        ? `Linked: ${interaction.user.username} with ${user.username}`
        : `${interaction.user.username} changed their linked osu profile to ${user.username}`
    );

    if (userExistsInServer) return;
    if (
      interaction.member?.roles &&
      interaction.member?.roles instanceof GuildMemberRoleManager
    ) {
      await interaction.member.roles.remove(config.quarantineRoleId);
      config.verifiedRoleId &&
        (await interaction.member.roles.add(config.verifiedRoleId));
    }

    try {
      await db
        .insert(guilds)
        .values({ userId: interaction.user.id, guildId: interaction.guild.id })
        .onConflictDoNothing();
    } catch (err) {
      console.log("Failed to insert user. err:", err);
      await interaction.editReply(`something went wrong`);
      return;
    }

    // only send welcome image if user links for the first time
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
