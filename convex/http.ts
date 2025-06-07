import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

// 🟦 Stripe Webhook Route
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-05-28.basil",
    });

    const sig = request.headers.get("stripe-signature");
    const body = await request.text();

    if (!sig) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Stripe webhook error:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle subscription created/paid events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email;
      const customerId = session.customer?.toString();
      const subscriptionId = session.subscription?.toString();

      if (!email || !customerId || !subscriptionId) {
        return new Response("Missing session details", { status: 400 });
      }

      try {
        await ctx.runMutation(api.users.upgradeToProStripe, {
          email,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
      } catch (error) {
        console.error("Error upgrading user:", error);
        return new Response("Error upgrading user", { status: 500 });
      }
    }

    return new Response("Stripe webhook processed", { status: 200 });
  }),
});

// 🟩 Clerk Webhook Route
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Missing svix headers", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying Clerk webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          userId: id,
          email,
          name,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Clerk webhook processed", { status: 200 });
  }),
});

export default http;
