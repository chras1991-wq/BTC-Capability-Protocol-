import {NextResponse} from "next/server";
import {getExecutionOrder, parseExecutionOrderId} from "@/lib/execution";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: {params: Promise<{id: string}>},
) {
  const {id} = await context.params;
  const ordinal = parseExecutionOrderId(id);
  if (ordinal == null) {
    return NextResponse.json({error: "execution right not found"}, {status: 404});
  }

  return NextResponse.json({
    order: getExecutionOrder(ordinal),
    execution: {
      enabled: false,
      reason: "operator route control and signed capacity proof required",
    },
  });
}
