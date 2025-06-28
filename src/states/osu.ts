import { api } from "osu";

if (!process.env.OSU_API_KEY) {
  throw new Error("OSU_API_KEY is not set in the environment variables");
}

export const osuApi = api(process.env.OSU_API_KEY);
