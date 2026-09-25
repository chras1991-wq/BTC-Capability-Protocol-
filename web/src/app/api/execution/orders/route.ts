import {NextResponse} from "next/server";
import {listExecutionOrders} from "@/lib/execution";

export const dynamic = "force-dynamic";

function optionalPositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const result = listExecutionOrders({
    page: optionalPositiveInt(searchParams.get("page")),
    pageSize: optionalPositiveInt(searchParams.get("pageSize")),
    domain: searchParams.get("domain") || undefined,
    executionClass: searchParams.get("executionClass") || undefined,
    duration: optionalPositiveInt(searchParams.get("duration")),
    maxPriceCents: optionalPositiveInt(searchParams.get("maxPriceCents")),
    query: searchParams.get("query") || undefined,
  });

  return NextResponse.json({
    ...result,
    catalogSize: 21_000,
    origin: "operator",
    inventoryState: "capability-specification",
    executionEnabled: false,
  });
}
