import express from "express";
import Stripe from "stripe";
import DonationModel from "../model/DonationModel.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Stripe Webhook Signature Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const intent = event.data.object;

    if (event.type === "payment_intent.succeeded") {
      await DonationModel.updateOne(
        { d_payment_intent_id: intent.id },
        { d_status: "SUCCESS" }
      );
    }

    if (event.type === "payment_intent.payment_failed") {
      await DonationModel.updateOne(
        { d_payment_intent_id: intent.id },
        { d_status: "FAILED" }
      );
    }

    res.json({ received: true });
  }
);

export default router;
