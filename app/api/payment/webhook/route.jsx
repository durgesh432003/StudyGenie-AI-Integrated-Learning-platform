import { db } from "@/configs/db";
import { PAYMENT_RECORD_TABLE, USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEB_HOOK_KEY;

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const data = event.data.object;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed":
        await db
          .update(USER_TABLE)
          .set({ isMember: true })
          .where(eq(USER_TABLE.email, data.customer_details.email));
        break;

      case "invoice.paid":
        await db.insert(PAYMENT_RECORD_TABLE).values({
          customerId: data.customer,
          sessionId: data.subscription,
        });
        break;

      case "invoice.payment_failed":
        await db
          .update(USER_TABLE)
          .set({ isMember: false })
          .where(eq(USER_TABLE.email, data.customer_email || data.customer_details.email));
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return new NextResponse("Webhook handling failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
