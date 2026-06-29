import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ message: "Verify pass QR token placeholder" }, { status: 200 });
}
