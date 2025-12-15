import React, { useState } from "react";

const initialFaqs = [
  {
    q: "What is a digital ROSCA?",
    a: "A rotating savings and credit association (ROSCA) lets members contribute a fixed amount regularly, and one member receives the total pot each round until all members have been served.",
  },
  {
    q: "How is Ajolink different from traditional ROSCAs?",
    a: "Ajolink automates contributions, payouts, and risk controls with escrow wallets, transparent ledgers, and identity verification.",
  },
  {
    q: "Is my data secure on Ajolink?",
    a: "Yes. All user data is encrypted and stored securely using industry-grade security practices and compliance standards.",
  },
  {
    q: "Can I withdraw my money anytime?",
    a: "Withdrawals are processed based on the active ROSCA schedule. Funds in your Ajolink wallet can be withdrawn at any time if available.",
  },
  {
    q: "Do I need to verify my identity?",
    a: "Yes. KYC (Know Your Customer) verification is mandatory to ensure the safety and legitimacy of all transactions on Ajolink.",
  },
];

const FAQ = () => {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [openIndex, setOpenIndex] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(faqs.length / itemsPerPage);
  const currentFaqs = faqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // New FAQ form
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddFAQ = () => {
    if (!newQ.trim() || !newA.trim()) return alert("Please enter both question and answer");
    setFaqs([...faqs, { q: newQ, a: newA }]);
    setNewQ("");
    setNewA("");
    setShowForm(false);
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1>Frequently Asked Questions</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Question"}
        </button>
      </div>

      {/* Add Question Form */}
      {showForm && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="mb-3">Add a New Question</h5>
          <input
            type="text"
            placeholder="Enter your question"
            className="form-control mb-2"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
          />
          <textarea
            rows="3"
            placeholder="Enter the answer"
            className="form-control mb-2"
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
          ></textarea>
          <button className="btn btn-success" onClick={handleAddFAQ}>
            Add FAQ
          </button>
        </div>
      )}

      {/* FAQ List */}
      {currentFaqs.map((item, i) => (
        <div key={i} className="mb-3">
          <button
            className="btn btn-outline-primary w-100 text-start fw-semibold"
            onClick={() =>
              setOpenIndex(
                openIndex === i + (currentPage - 1) * itemsPerPage
                  ? null
                  : i + (currentPage - 1) * itemsPerPage
              )
            }
          >
            {item.q}
          </button>
          {openIndex === i + (currentPage - 1) * itemsPerPage && (
            <div className="p-3 border bg-light mt-2">{item.a}</div>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Help Center Section */}
      <div className="mt-5 pt-5 border-top text-center">
        <h3 className="mb-3">Help Center</h3>
        <p className="text-muted mb-4">
          Need further assistance? Our support team is here to help you.
        </p>

        <div className="d-flex flex-column align-items-center gap-2">
          <p>
            📧 <strong>Email:</strong>{" "}
            <a href="mailto:support@ajolink.com">support@ajolink.com</a>
          </p>
          <p>
            📞 <strong>Phone:</strong> +91 98765 43210
          </p>
          <p>
            📍 <strong>Address:</strong> Ajolink Pvt. Ltd., 3rd Floor, Tech Park,
            Bengaluru, India
          </p>
        </div>

        <div className="mt-4">
          <small className="text-muted">
            © {new Date().getFullYear()} Ajolink. All rights reserved.
          </small>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
