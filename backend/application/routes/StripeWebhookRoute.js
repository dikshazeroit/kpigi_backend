// import express from "express";
// import Stripe from "stripe";
// import DonationModel from "../model/DonationModel.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// router.post(
//   "/stripe/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         req.headers["stripe-signature"],
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.error("❌ Stripe Webhook Signature Error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     const intent = event.data.object;

//     if (event.type === "payment_intent.succeeded") {
//       await DonationModel.updateOne(
//         { d_payment_intent_id: intent.id },
//         { d_status: "SUCCESS" }
//       );
//     }

//     if (event.type === "payment_intent.payment_failed") {
//       await DonationModel.updateOne(
//         { d_payment_intent_id: intent.id },
//         { d_status: "FAILED" }
//       );
//     }

//     res.json({ received: true });
//   }
// );

// export default router;
import express from "express";
import Stripe from "stripe";
import DonationModel from "../model/DonationModel.js";
import FundModel from "../model/FundModel.js";
import UsersCredentialsModel from "../model/UserModel.js";

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
      return res.status(400).send(`Webhook Error`);
    }

    const intent = event.data.object;

    /* ================= SUCCESS ================= */
    if (event.type === "payment_intent.succeeded") {

      // 1️⃣ Donation fetch
      const donation = await DonationModel.findOne({
        d_payment_intent_id: intent.id,
      });

      if (!donation || donation.d_status === "SUCCESS") {
        return res.json({ received: true });
      }

      // 2️⃣ Mark donation success
      donation.d_status = "SUCCESS";
      await donation.save();

      // 3️⃣ Find fund
      const fund = await FundModel.findOne({
        f_uuid: donation.d_fk_f_uuid,
      });
      if (!fund) return res.json({ received: true });

      // 4️⃣ Find fund owner
      const owner = await UsersCredentialsModel.findOne({
        uc_uuid: fund.f_fk_uc_uuid,
      });
      if (!owner) return res.json({ received: true });

      // 5️⃣ CREDIT WALLET (NET AMOUNT)
      owner.uc_balance =
        Number(owner.uc_balance || 0) +
        Number(donation.d_amount_to_owner);

      await owner.save();

      console.log(
        `✅ Wallet credited ${donation.d_amount_to_owner} to ${owner.uc_uuid}`
      );
    }

    /* ================= FAILED ================= */
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
