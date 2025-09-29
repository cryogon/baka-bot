import { Auth, Client } from "osu-web.js";

if (
  !process.env.OSU_CLIENT_ID ||
  !process.env.OSU_CLIENT_SECRET ||
  !process.env.OSU_CALLBACK_URL
) {
  throw new Error("OSU CREDS MISSING");
}

const clientId = Number(process.env.OSU_CLIENT_ID);
const clientSecret = process.env.OSU_CLIENT_SECRET;
const redirectUri = process.env.OSU_CALLBACK_URL;

const auth = new Auth(clientId, clientSecret, redirectUri);

const creds = await auth.clientCredentialsGrant();

export const osu = new Client(creds.access_token);

function keepAccessTokenAlive() {
  setTimeout(async () => {
    const cred = await auth.clientCredentialsGrant();
    osu.setAccessToken(cred.access_token);
    keepAccessTokenAlive();
  }, creds.expires_in * 1000 - 2000); // trigger it 2 seconds early
}

keepAccessTokenAlive();
