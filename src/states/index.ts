import { Collection } from "discord.js";

class StateManager {
  private static instance: StateManager;
  private commands = new Collection();

  private constructor() {}

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }

    return StateManager.instance;
  }

  setDiscordCommand(key: unknown, value: unknown) {
    this.commands.set(key, value);
  }

  getDiscordCommand(key: unknown) {
    return this.commands.get(key);
  }
}

export const state = StateManager.getInstance();
