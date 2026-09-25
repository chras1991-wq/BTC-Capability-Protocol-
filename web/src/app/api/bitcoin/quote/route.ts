import {NextResponse} from "next/server";
import {quoteUsdCentsInSats} from "@/lib/bitcoin-price";
import {getHashrateOrder, parseOrderId} from "@/lib/hashrate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const id = searchParams.get("orderId") ?? "";
  const ordinal = parseOrderId(id);
  if (ordinal == null) {
    return NextResponse.json({error: "order specification not found"}, {status: 404});
  }

  try {
    const order = getHashrateOrder(ordinal);
    const quote = await quoteUsdCentsInSats(order.priceCents);
    return NextResponse.json({orderId: order.id, quote});
  } catch {
    return NextResponse.json({error: "BTC quote unavailable"}, {status: 503});
  }
}
