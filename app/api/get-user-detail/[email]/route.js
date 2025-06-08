import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const email = pathSegments[pathSegments.length - 1];
    const user = await db
      .select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.email, email));
    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}