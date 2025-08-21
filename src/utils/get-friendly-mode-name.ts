import type { Ruleset } from "../types";

export function getUserFriendlyModeName(mode: Ruleset) {
  switch (mode) {
    case "fruits":
      return "ctb";
    default:
      return mode;
  }
}
