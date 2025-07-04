import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { state } from "../../states";

export const data = new SlashCommandBuilder()
  .setName("set-config")
  .setDescription("Set Config For Server")
  .addRoleOption((option) =>
    option
      .setName("quarantine-role")
      .setDescription("Role to assign to new members for quarantine")
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("verification-channel")
      .setDescription("Channel where verification happens")
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("welcome-channel")
      .setDescription("Channel to send welcome messages (optional)")
      .setRequired(false)
  )
  .addRoleOption((option) =>
    option
      .setName("verified-role")
      .setDescription("Role to assign after verification (optional)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({
      content: "This command can only be used in a server!",
      ephemeral: true,
    });
    return;
  }

  if (!interaction.memberPermissions?.has("Administrator")) {
    await interaction.reply({
      content: "You need Administrator permissions to use this command!",
      ephemeral: true,
    });
    return;
  }

  const quarantineRole = interaction.options.getRole("quarantine-role");
  const verificationChannel = interaction.options.getChannel(
    "verification-channel"
  );
  const welcomeChannel = interaction.options.getChannel("welcome-channel");
  const verifiedRole = interaction.options.getRole("verified-role");

  if (!quarantineRole || !verificationChannel) {
    await interaction.reply({
      content: "Required options are missing!",
      ephemeral: true,
    });
    return;
  }

  const config = {
    guildId: interaction.guildId,
    quarantineRoleId: quarantineRole.id,
    verificationChannelId: verificationChannel.id,
    welcomeChannelId: welcomeChannel?.id,
    verifiedRoleId: verifiedRole?.id,
  };

  try {
    await state.setServerConfig(config);
    await interaction.reply({
      content: `Server configuration saved successfully!\n\n**Quarantine Role:** ${quarantineRole}\n**Verification Channel:** ${verificationChannel}${
        welcomeChannel ? `\n**Welcome Channel:** ${welcomeChannel}` : ""
      }${verifiedRole ? `\n**Verified Role:** ${verifiedRole}` : ""}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error saving server config:", error);
    await interaction.reply({
      content: "Failed to save server configuration. Please try again.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
