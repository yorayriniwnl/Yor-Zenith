import { execFileSync } from "child_process";
import { NextRequest, NextResponse } from "next/server";
import { LumenInput, LumenOutput } from "@/lib/lumen/types";

export async function POST(req: NextRequest) {
  try {
    const body: LumenInput = await req.json();
    const jsonArg = JSON.stringify(body);

    const stdout = execFileSync("python3", ["run.py", jsonArg], {
      encoding: "utf-8",
    });

    const result: LumenOutput = JSON.parse(stdout);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
