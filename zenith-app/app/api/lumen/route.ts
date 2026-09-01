import { NextRequest, NextResponse } from "next/server";
import { optimizeEnergy } from "@/lib/lumen/optimize";
import { requireApiSession } from "@/lib/apiAuth";
import { parseLumenInput } from "@/lib/requestValidation";
import { enforceBodyLimit, enforceSameOrigin } from "@/lib/requestGuards";

export async function POST(req: NextRequest) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(req, 64 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const authError = await requireApiSession();
  if (authError) return authError;

  try {
    const body = parseLumenInput(await req.json());
    return NextResponse.json(optimizeEnergy(body));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
