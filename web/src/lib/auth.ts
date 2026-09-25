import {PrivyClient} from "@privy-io/node";
import {ProtocolError} from "./store";

const appId =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cmt9hky9c01is0cjoiw60nprw";

export function serverAuthConfigured(): boolean {
  return Boolean(process.env.PRIVY_APP_SECRET);
}

export async function requirePrivyUser(request: Request): Promise<string> {
  const secret = process.env.PRIVY_APP_SECRET;
  if (!secret) {
    throw new ProtocolError("server authentication is not activated", 503);
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  if (!accessToken) throw new ProtocolError("authentication required", 401);

  try {
    const client = new PrivyClient({appId, appSecret: secret});
    const claims = await client.utils().auth().verifyAccessToken(accessToken);
    return claims.user_id;
  } catch {
    throw new ProtocolError("invalid Privy session", 401);
  }
}
