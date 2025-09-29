import { Events, Message } from "discord.js";
import { handleOsuCommands } from "../wrapper/handle-osu-commands";

export const name = Events.MessageCreate;

export async function execute(message: Message) {
  handleOsuCommands(message).catch(console.error);
}
