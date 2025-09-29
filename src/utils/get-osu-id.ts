import { eq } from "drizzle-orm";
import { db } from "../db";
import { safeAwait } from "./safe-await";
import { users } from "../db/schema";
import { osu } from "../states/osu";

export async function getOsuId(discordId: string) {
  const [err, data] = await safeAwait(() =>
    db.query.users.findFirst({ where: eq(users.discordId, discordId) })
  );
  if (err || !data) return null;
  return data.osuId;
}

export async function getOsuIdWithUsername(username: string) {
  const [err, data] = await safeAwait(() =>
    db.query.users.findFirst({ where: eq(users.osuUsername, username) })
  );
  // if not available in db then try to fetch from osu api
  if (err || !data) {
    const user = await osu.users.getUser(username);
    if (!user) return null;
    return user.id;
  }
  return data.osuId;
}
