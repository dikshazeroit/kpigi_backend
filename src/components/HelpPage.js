import React, { useState } from "react";

const faqs = [
  {
    q: "What is a digital ROSCA?",
    a: "A rotating savings and credit association (ROSCA) lets members contribute a fixed amount regularly, and one member receives the total pot each round until all members have been served."
  },
  {
    q: "How is Ajolink different from traditional ROSCAs?",
    a: "Ajolink automates contributions, payouts, and risk controls with escrow wallets, transparent ledgers, and identity verification. It removes the need for manual trust and tracking."
  },
  {
    q: "How does the payout work?",
    a: "On each cycle day, all contributions are verified and the pooled funds are released automatically to that round’s recipient wallet. Everyone sees proof on the ledger."
  },
  {
    q: "What happens if someone misses a payment?",
    a: "There’s a 24–48h grace period, after which a late fee applies. If the member defaults, their bond is used to cover the shortfall or a replacement is auto-assigned."
  },
  {
    q: "Is my money safe?",
    a: "Yes. All funds are held in escrow (either smart-contract or custodian backed). Every transaction is auditable and visible on your circle’s ledger."
  },
  {
    q: "What is a security bond?",
    a: "It’s a small refundable deposit (10–20% of your cycle contribution) held in escrow to protect the circle in case of missed payments. It’s refunded when the circle ends successfully."
  },
  {
    q: "Can I borrow ahead of my turn?",
    a: "Yes — in ‘Susu+’ mode, members with strong reputations or collateral can request an early payout with fees or interest applied."
  },
  {
    q: "Which payment methods are supported?",
    a: "Cards, ACH/bank transfers, Paystack, Flutterwave, M-Pesa, and stablecoins like USDC or cUSD, depending on your region."
  },
  {
    q: "What fees does Ajolink charge?",
    a: "A small service fee (1–2%) per contribution. Some circles include early-slot auction premiums that reduce overall fees for everyone."
  },
  {
    q: "What if I have a dispute?",
    a: "Use the in-app Dispute Module. You can upload evidence, track progress, and receive a resolution within defined time windows."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Frequently Asked Questions</h1>

      {faqs.map((item, i) => (
        <div key={i} className="mb-3">
          <button
            className="btn btn-outline-primary w-100 text-start"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.q}
          </button>
          {openIndex === i && (
            <div className="p-3 border bg-light mt-2">{item.a}</div>
          )}
        </div>
      ))}

      <div className="mt-5">
        <h5>Still need help?</h5>
        <p>
          Contact us at <a href="mailto:support@ajolink.com">support@ajolink.com</a>
        </p>
      </div>
    </div>
  );
};

export default FAQ;
