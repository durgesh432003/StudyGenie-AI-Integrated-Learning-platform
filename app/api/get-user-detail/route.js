import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    const user = await db
      .select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.email, email));
    return NextResponse.json({ user: user[0] });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}