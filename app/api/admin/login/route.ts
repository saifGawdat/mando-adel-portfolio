import { NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
