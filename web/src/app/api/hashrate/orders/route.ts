import {NextResponse} from "next/server";
import {listHashrateOrders} from "@/lib/hashrate";

export const dynamic = "force-dynamic";

function optionalPositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const result = listHashrateOrders({
    page: optionalPositiveInt(searchParams.get("page")),
    pageSize: optionalPositiveInt(searchParams.get("pageSize")),
    region: searchParams.get("region") || undefined,
    mode: searchParams.get("mode") || undefined,
    duration: optionalPositiveInt(searchParams.get("duration")),
    maxPriceCents: optionalPositiveInt(searchParams.get("maxPriceCents")),
    query: searchParams.get("query") || undefined,
  });

  return NextResponse.json({
    ...result,
    catalogSize: 21_000,
    inventoryState: "specification-only",
    executionEnabled: false,
  });
}
