import {
  EmbedBuilder,
  Events,
  GuildMember,
  TextChannel,
} from "discord.js";
import { state } from "../states";
import type { ServerConfig } from "../types";

export const name = Events.GuildMemberAdd;
export async function execute(member: GuildMember) {
  console.log("New Member Joined", member.user.username);
  // NOTE: need to add checking, if user joins again and they have already verified once then they don't require to verify again
  try {
    const config = state.getServerConfig(member.guild.id);
    if (!config) {
      console.log(`No configuration found for guild: ${member.guild.name}.`);
      return;
    }

    const botMember = member.guild.members.me;
    if (!botMember) {
      console.error("Bot member not found in guild");
      return;
    }

    const quarantineRole = member.guild.roles.cache.get(
      config.quarantineRoleId
    );
    if (!quarantineRole) {
      console.error(`Quarantine role not found in guild: ${member.guild.name}`);
      return;
    }

    // Check if bot can manage this specific role
    if (quarantineRole.position >= botMember.roles.highest.position) {
      console.error(
        `Bot cannot manage role ${quarantineRole.name} - role is higher than bot's highest role`
      );
      console.error(
        `Quarantine role position: ${quarantineRole.position}, Bot's highest role position: ${botMember.roles.highest.position}`
      );
      return;
    }

    // Check if bot has permission to manage roles
    if (!member.guild.members.me?.permissions.has("ManageRoles")) {
      console.error(
        `Bot doesn't have ManageRoles permission in guild: ${member.guild.name}`
      );
      return;
    }

    await member.roles.add(quarantineRole);
    console.log(
      `Added quarantine role to ${member.user.tag} in ${member.guild.name}`
    );

    await sendVerificationMessage(member, config);
  } catch (err: any) {
    console.error("Error handling new member:", err.message);
    console.error("Full error:", err);
  }
}

async function sendVerificationMessage(
  member: GuildMember,
  config: ServerConfig
) {
  const verificationChannel = member.guild.channels.cache.get(
    config.verificationChannelId
  ) as TextChannel;
  if (!verificationChannel) {
    console.error(
      `Verification channel not found in guild: ${member.guild.name}`
    );
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🛡️ Welcome! Please Verify Yourself")
    .setDescription(
      `Welcome to **${member.guild.name}**, ${member.user}!\n\nTo access all channels, use \`/link\` command to link your osu profile`
    )
    .setColor(0x3498db)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: `User ID: ${member.user.id}`,
      iconURL: member.guild.iconURL() || undefined,
    });

  await verificationChannel.send({
    content: `${member.user}`,
    embeds: [embed],
  });
}
