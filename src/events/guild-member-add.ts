import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  GuildMember,
  TextChannel,
} from "discord.js";
import { state } from "../states";
import type { ServerConfig } from "../types";

export const name = Events.GuildMemberAdd;
export async function execute(member: GuildMember) {
  console.log("New Member Joined", member);
  // NOTE: need to add checking, if user joins again and they have already verified once then they don't require to verify again
  try {
    const config = state.getServerConfig(member.guild.id);
    if (!config) {
      console.log(`No configuration found for guild: ${member.guild.name}.`);
      return;
    }
    console.log("Found Config");
    const quarantineRole = member.guild.roles.cache.get(
      config.quarantineRoleId
    );
    if (!quarantineRole) {
      console.error(`Quarantine role not found in guild: ${member.guild.name}`);
      return;
    }
    console.log("Found quarantineRole");

    await member.roles.add(quarantineRole);
    console.log(
      `Added quarantine role to ${member.user.tag} in ${member.guild.name}`
    );

    await sendVerificationMessage(member, config);
  } catch (err) {
    console.error("Error handling new member:", err);
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
      `Welcome to **${member.guild.name}**, ${member.user}!\n\nTo access all channels, please click the button below to verify yourself.`
    )
    .setColor(0x3498db)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: `User ID: ${member.user.id}`,
      iconURL: member.guild.iconURL() || undefined,
    });

  const verifyButton = new ButtonBuilder()
    .setCustomId("verify_user")
    .setLabel("✅ Verify Me")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

  await verificationChannel.send({
    content: `${member.user}`,
    embeds: [embed],
    components: [row],
  });
}
