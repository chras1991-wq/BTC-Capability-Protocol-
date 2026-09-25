import {NextResponse} from "next/server";
import {getHashrateOrder, parseOrderId} from "@/lib/hashrate";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: {params: Promise<{id: string}>},
) {
  const {id} = await context.params;
  const ordinal = parseOrderId(id);
  if (ordinal == null) {
    return NextResponse.json({error: "order specification not found"}, {status: 404});
  }

  return NextResponse.json({
    order: getHashrateOrder(ordinal),
    execution: {
      enabled: false,
      reason: "supplier Stratum endpoint and signed telemetry proof required",
    },
  });
}
