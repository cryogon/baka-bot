import { eq } from "drizzle-orm";
import { db } from "../db";
import { safeAwait } from "./safe-await";
import { users } from "../db/schema";

export async function getOsuId(discordId: string) {
  const [err, data] = await safeAwait(() =>
    db.query.users.findFirst({ where: eq(users.discordId, discordId) })
  );
  if (err || !data) return null;
  return data.osuId;
}
