import { OsuApi } from "osu-sdk";

export const osu = new OsuApi({
  client_id: process.env.OSU_CLIENT_ID || "",
  client_secret: process.env.OSU_CLIENT_SECRET || "",
});

await osu.getClientCredentialsToken(["public"]); // only access publically available data
