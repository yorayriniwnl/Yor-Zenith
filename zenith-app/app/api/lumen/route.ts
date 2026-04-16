import { NextRequest, NextResponse } from "next/server";
import type { LumenInput } from "@/lib/lumen/types";
import { optimizeEnergy } from "@/lib/lumen/optimize";

export async function POST(req: NextRequest) {
  try {
    const body: LumenInput = await req.json();
    return NextResponse.json(optimizeEnergy(body));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
