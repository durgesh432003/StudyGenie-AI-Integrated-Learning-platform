import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
  const { user } = await req.json();

  if (!user || !user.primaryEmailAddress?.emailAddress || !user.fullName) {
    return NextResponse.json(
      { error: "Missing user data" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const email = user.primaryEmailAddress.emailAddress;
  const name = user.fullName;

  try {
    const existingUser = await db
      .select()
      .from(USER_TABLE)
      .where(eq(USER_TABLE.email, email));

    if (existingUser.length > 0) {
      if (!existingUser[0].customerId) {
        const customer = await stripe.customers.create({
          email: existingUser[0].email,
          name: existingUser[0].userName,
        });
        await db
          .update(USER_TABLE)
          .set({ customerId: customer.id })
          .where(eq(USER_TABLE.id, existingUser[0].id));
        return NextResponse.json({
          ...existingUser[0],
          customerId: customer.id,
        });
      }
      return NextResponse.json(existingUser[0]);
    }

    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });

    const newUser = await db
      .insert(USER_TABLE)
      .values({
        userName: name,
        email: email,
        isMember: false,
        customerId: customer.id,
      })
      .returning();

    return NextResponse.json(newUser[0]);
  } catch (error) {
    console.error("Error in create-user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
