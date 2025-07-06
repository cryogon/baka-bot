import { Collection } from "discord.js";
import type { ServerConfig } from "../types";
import { db } from "../db";
import { guildConfig } from "../db/schema";

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
    try {
      const { guildId: _, ...rest } = config;
      await db
        .insert(guildConfig)
        .values(config)
        .onConflictDoUpdate({ set: rest, target: guildConfig.guildId });
      return true;
    } catch (err) {
      console.error("Failed to upload config. err:", err);
      return false;
    }
  }

  getServerConfig(guildId: string) {
    return this.serverConfigs.get(guildId);
  }

  async loadServerConfigs() {
    // not using try/catch since I want bot to crash if it can't load the configs
    const configs = await db.query.guildConfig.findMany({
      columns: { id: false, createdAt: false, updatedAt: false },
    });

    for (const config of configs) {
      this.serverConfigs.set(config.guildId, config);
    }
  }
}

export const state = StateManager.getInstance();
