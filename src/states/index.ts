import { Collection } from "discord.js";
import type { ServerConfig } from "../types";

const configFile = Bun.file("server-config.json");
class StateManager {
  private static instance: StateManager;
  private commands = new Collection();
  private serverConfigs = new Map<string, ServerConfig>();

  private constructor() {
    this.loadServerConfigs();
  }

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

  async setServerConfig(config: ServerConfig) {
    this.serverConfigs.set(config.guildId, config);
    // TODO: Replace it with db later
    if (await configFile.exists()) {
      const oldData = (await configFile.json()) as any;
      oldData[config.guildId] = config;
      Bun.write(configFile, JSON.stringify(oldData));
      return;
    }
    Bun.write(configFile, JSON.stringify({ [config.guildId]: config }));
  }

  getServerConfig(guildId: string) {
    return this.serverConfigs.get(guildId);
  }

  async loadServerConfigs() {
    const file = (await configFile.json()) as any;
    for (const key in file) {
      this.serverConfigs.set(key, file[key]);
    }
  }
}

export const state = StateManager.getInstance();
