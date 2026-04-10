import { NextRequest } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return Response.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as any;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: "active",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: "active",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { plan },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: subscription.status === "active" ? "active" : subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "canceled" },
        });

        await prisma.user.update({
          where: { id: sub.userId },
          data: { plan: "free" },
        });
      }
      break;
    }
  }

  return Response.json({ received: true });
}
