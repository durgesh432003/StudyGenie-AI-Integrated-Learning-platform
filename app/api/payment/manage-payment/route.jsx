import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req) {
  // Make sure the Stripe secret key is available
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Make sure the return URL is available
  if (!process.env.NEXT_PUBLIC_RETURN_URL) {
    console.error("Missing NEXT_PUBLIC_RETURN_URL environment variable");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Create the billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXT_PUBLIC_RETURN_URL,
      configuration: process.env.NEXT_PUBLIC_STRIPE_PORTAL_ID,
    });
    
    // Return the session data including the URL
    return NextResponse.json({ portalSession });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
