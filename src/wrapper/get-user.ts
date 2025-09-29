import { osu } from "../states/osu";

// TODO: need caching
export async function getUser(osuId: number) {
  const user = await osu.users.getUser(osuId, { query: { key: "id" } });
  return user;
}
