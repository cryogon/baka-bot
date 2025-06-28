import { Events, MessageFlags, type CacheType, type Interaction } from "discord.js";
import { state } from "../states";

export const name = Events.InteractionCreate;
export async function execute(interaction:Interaction<CacheType>){
     if (interaction.isButton()) {
    console.log("I'm button");
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command: any = state.getDiscordCommand(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
