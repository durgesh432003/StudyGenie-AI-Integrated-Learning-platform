import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const email = pathSegments[pathSegments.length - 1];
    
    console.log("Fetching user details for email:", email);
    
    const user = await db
      .select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.email, email));
    
    if (!user || user.length === 0) {
      console.log("No user found with email:", email);
      // If user doesn't exist, create a default user object
      return NextResponse.json({
        userName: email.split('@')[0],
        email: email,
        isMember: false
      });
    }
    
    console.log("User found:", user[0]);
    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching user details:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}