import osu from "node-osu";

if (!process.env.OSU_API_KEY) {
  throw new Error("OSU_API_KEY is not set in the environment variables");
}

export const osuApi = new osu.Api(process.env.OSU_API_KEY, {});
