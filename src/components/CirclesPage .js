import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  InputGroup,
  FormControl,
  Modal,
  Tabs,
  Tab,
  Pagination,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faEye,
  faPause,
  faPlay,
  faStop,
} from "@fortawesome/free-solid-svg-icons";

// 🧱 Dummy Data
const dummyCircles = [
  {
    id: 1,
    name: "Family Savings",
    status: "Active",
    organizer: { id: 101, name: "John Doe" },
    currency: "USD",
    amountPerCycle: 100,
    totalMembers: 5,
    totalPot: 500,
    cadence: "Monthly",
    startDate: "2025-11-01",
    nextPayoutDate: "2025-11-10",
    payoutOrder: ["Alice", "Bob", "Carol", "David", "Eve"],
    healthScore: 85,
    missedPayments: 1,
    circleBondRate: 0.1,
    platformFeeRate: 1.5,
    reputationScore: 92,
    ledgerVisible: true,
    members: [
      { id: 1, name: "Alice", role: "member", bondAmount: 10, state: "active", paidCurrentCycle: true },
      { id: 2, name: "Bob", role: "member", bondAmount: 10, state: "active", paidCurrentCycle: false },
    ],
    escrow: { currentBalance: 200, contractAddress: "0x1234abcd5678ef...", lastAudit: "2025-11-05" },
    rules: { gracePeriodHours: 24, lateFeePercent: 2, autoReplacement: true, auctionEnabled: false },
  },
  {
    id: 2,
    name: "Office Circle",
    status: "Pending",
    organizer: { id: 202, name: "Sarah Lee" },
    currency: "USD",
    amountPerCycle: 50,
    totalMembers: 6,
    totalPot: 300,
    cadence: "Weekly",
    startDate: "2025-11-15",
    nextPayoutDate: null,
    payoutOrder: [],
    healthScore: null,
    missedPayments: 0,
    circleBondRate: 0.1,
    platformFeeRate: 1.5,
    reputationScore: null,
    ledgerVisible: false,
    members: [],
    escrow: { currentBalance: 0, contractAddress: null, lastAudit: null },
    rules: { gracePeriodHours: 24, lateFeePercent: 2, autoReplacement: true, auctionEnabled: true, auctionMaxPremiumPercent: 5 },
  },
  {
    id: 3,
    name: "Startup Friends",
    status: "Active",
    organizer: { id: 303, name: "Mike Chen" },
    currency: "USD",
    amountPerCycle: 200,
    totalMembers: 4,
    totalPot: 800,
    cadence: "Monthly",
    startDate: "2025-10-01",
    nextPayoutDate: "2025-11-01",
    payoutOrder: ["Mike", "Sara", "Tom", "Lily"],
    healthScore: 90,
    missedPayments: 0,
    circleBondRate: 0.15,
    platformFeeRate: 2,
    reputationScore: 88,
    ledgerVisible: true,
    members: [
      { id: 1, name: "Mike", role: "organizer", bondAmount: 20, state: "active", paidCurrentCycle: true },
      { id: 2, name: "Sara", role: "member", bondAmount: 20, state: "active", paidCurrentCycle: true },
    ],
    escrow: { currentBalance: 600, contractAddress: "0xabcd1234ef567890...", lastAudit: "2025-10-28" },
    rules: { gracePeriodHours: 48, lateFeePercent: 3, autoReplacement: true, auctionEnabled: false },
  },
  {
    id: 4,
    name: "Neighborhood Fund",
    status: "Completed",
    organizer: { id: 404, name: "Priya Sharma" },
    currency: "USD",
    amountPerCycle: 75,
    totalMembers: 3,
    totalPot: 225,
    cadence: "Monthly",
    startDate: "2025-07-01",
    nextPayoutDate: null,
    payoutOrder: ["Priya", "Ravi", "Ananya"],
    healthScore: 100,
    missedPayments: 0,
    circleBondRate: 0.1,
    platformFeeRate: 1,
    reputationScore: 95,
    ledgerVisible: true,
    members: [
      { id: 1, name: "Priya", role: "organizer", bondAmount: 10, state: "completed", paidCurrentCycle: true },
      { id: 2, name: "Ravi", role: "member", bondAmount: 10, state: "completed", paidCurrentCycle: true },
    ],
    escrow: { currentBalance: 0, contractAddress: "0xcompleted1234abcd...", lastAudit: "2025-09-01" },
    rules: { gracePeriodHours: 24, lateFeePercent: 2, autoReplacement: false, auctionEnabled: false },
  },
  {
    id: 5,
    name: "College Friends",
    status: "Active",
    organizer: { id: 505, name: "Rahul Mehta" },
    currency: "USD",
    amountPerCycle: 150,
    totalMembers: 5,
    totalPot: 750,
    cadence: "Weekly",
    startDate: "2025-11-05",
    nextPayoutDate: "2025-11-12",
    payoutOrder: ["Rahul", "Sneha", "Ananya", "John", "Priya"],
    healthScore: 80,
    missedPayments: 2,
    circleBondRate: 0.2,
    platformFeeRate: 2,
    reputationScore: 88,
    ledgerVisible: true,
    members: [
      { id: 1, name: "Rahul", role: "organizer", bondAmount: 30, state: "active", paidCurrentCycle: true },
      { id: 2, name: "Sneha", role: "member", bondAmount: 30, state: "active", paidCurrentCycle: false },
    ],
    escrow: { currentBalance: 300, contractAddress: "0xcollege1234abcd...", lastAudit: "2025-11-07" },
    rules: { gracePeriodHours: 24, lateFeePercent: 2, autoReplacement: true, auctionEnabled: true, auctionMaxPremiumPercent: 4 },
  },
  {
    id: 6,
    name: "Gym Buddies Fund",
    status: "Paused",
    organizer: { id: 606, name: "Anjali Kapoor" },
    currency: "USD",
    amountPerCycle: 60,
    totalMembers: 4,
    totalPot: 240,
    cadence: "Weekly",
    startDate: "2025-09-10",
    nextPayoutDate: "2025-11-11",
    payoutOrder: ["Anjali", "Rohan", "Simran", "Nikhil"],
    healthScore: 70,
    missedPayments: 2,
    circleBondRate: 0.1,
    platformFeeRate: 1.5,
    reputationScore: 75,
    ledgerVisible: true,
    members: [
      { id: 1, name: "Anjali", role: "organizer", bondAmount: 15, state: "paused", paidCurrentCycle: true },
      { id: 2, name: "Rohan", role: "member", bondAmount: 15, state: "paused", paidCurrentCycle: false },
    ],
    escrow: { currentBalance: 100, contractAddress: "0xgym1234abcd...", lastAudit: "2025-10-30" },
    rules: { gracePeriodHours: 12, lateFeePercent: 1, autoReplacement: false, auctionEnabled: false },
  },
  {
    id: 7,
    name: "Travel Fund",
    status: "Active",
    organizer: { id: 707, name: "Vikram Singh" },
    currency: "USD",
    amountPerCycle: 120,
    totalMembers: 6,
    totalPot: 720,
    cadence: "Monthly",
    startDate: "2025-08-20",
    nextPayoutDate: "2025-11-20",
    payoutOrder: ["Vikram", "Meera", "Arjun", "Priya", "Sonia", "Karan"],
    healthScore: 95,
    missedPayments: 0,
    circleBondRate: 0.15,
    platformFeeRate: 2,
    reputationScore: 90,
    ledgerVisible: true,
    members: [
      { id: 1, name: "Vikram", role: "organizer", bondAmount: 25, state: "active", paidCurrentCycle: true },
      { id: 2, name: "Meera", role: "member", bondAmount: 20, state: "active", paidCurrentCycle: true },
    ],
    escrow: { currentBalance: 500, contractAddress: "0xtravel1234abcd...", lastAudit: "2025-11-01" },
    rules: { gracePeriodHours: 24, lateFeePercent: 2, autoReplacement: true, auctionEnabled: false },
  },
];

export default function CirclesPage() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCircle, setSelectedCircle] = useState(null);

  // 🧭 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setTimeout(() => {
      setCircles(dummyCircles);
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this circle?")) {
      setCircles((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        const totalPages = Math.ceil(updated.length / itemsPerPage);
        if (currentPage > totalPages) setCurrentPage(totalPages || 1);
        return updated;
      });
      setSelectedCircle(null);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === "Completed" && !window.confirm("Are you sure you want to close this circle?")) return;
    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedCircle?.id === id) setSelectedCircle((prev) => ({ ...prev, status: newStatus }));
  };

  const filteredCircles = circles.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCircles.length / itemsPerPage);
  const paginatedCircles = filteredCircles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(value);
  };

  return (
    <>
      {/* Header */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Circle Management</h4>
          <div className="d-flex align-items-center gap-2">
            <InputGroup style={{ width: "250px" }}>
              <FormControl
                placeholder="🔍Search circles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Circle
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Loading */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Table */}
          <Card className="shadow-sm border-0">
            <Table striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Members</th>
                  <th>Total Pot</th>
                  <th>Amount per Cycle</th>
                  <th>Cadence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCircles.length > 0 ? (
                  paginatedCircles.map((circle, i) => (
                    <tr key={circle.id}>
                      <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td>{circle.name}</td>
                      <td>
                        <Badge
                          bg={
                            circle.status === "Active"
                              ? "success"
                              : circle.status === "Pending"
                              ? "warning"
                              : circle.status === "Paused"
                              ? "info"
                              : "secondary"
                          }
                        >
                          {circle.status}
                        </Badge>
                      </td>
                      <td>{circle.totalMembers}</td>
                      <td>{formatCurrency(circle.totalPot, circle.currency)}</td>
                      <td>{formatCurrency(circle.amountPerCycle, circle.currency)}</td>
                      <td>{circle.cadence}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => setSelectedCircle(circle)}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(circle.id)}
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No circles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center my-3">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          <div className="text-center text-muted small mb-3">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredCircles.length)} of{" "}
            {filteredCircles.length}
          </div>
        </>
      )}

      {/* Circle Details Modal */}
      <Modal
        show={!!selectedCircle}
        onHide={() => setSelectedCircle(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedCircle?.name} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCircle && (
            <Tabs defaultActiveKey="members">
              <Tab eventKey="members" title="Members">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Bond</th>
                      <th>Status</th>
                      <th>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCircle.members.length > 0 ? (
                      selectedCircle.members.map((m, i) => (
                        <tr key={m.id}>
                          <td>{i + 1}</td>
                          <td>{m.name}</td>
                          <td>{formatCurrency(m.bondAmount, selectedCircle.currency)}</td>
                          <td>{m.state}</td>
                          <td>{m.paidCurrentCycle ? "✅" : "❌"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No members yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>

              <Tab eventKey="config" title="Circle Config">
                <p>Amount per Cycle: {formatCurrency(selectedCircle.amountPerCycle, selectedCircle.currency)}</p>
                <p>Cadence: {selectedCircle.cadence}</p>
                <p>Start Date: {selectedCircle.startDate}</p>
                <p>Next Payout Date: {selectedCircle.nextPayoutDate || "N/A"}</p>
                <p>Circle Bond Rate: {selectedCircle.circleBondRate * 100}%</p>
                <p>Platform Fee Rate: {selectedCircle.platformFeeRate}%</p>
                <p>Health Score: {selectedCircle.healthScore || "N/A"}</p>
                <p>Reputation Score: {selectedCircle.reputationScore || "N/A"}</p>
                <p>Missed Payments: {selectedCircle.missedPayments}</p>
                <p>Ledger Visible: {selectedCircle.ledgerVisible ? "Yes" : "No"}</p>
              </Tab>

              <Tab eventKey="escrow" title="Escrow">
                <p>Current Balance: {formatCurrency(selectedCircle.escrow.currentBalance, selectedCircle.currency)}</p>
                <p>Contract Address: {selectedCircle.escrow.contractAddress || "N/A"}</p>
                <p>Last Audit: {selectedCircle.escrow.lastAudit || "N/A"}</p>
              </Tab>

              <Tab eventKey="rules" title="Circle Rules">
                <p>Grace Period (hours): {selectedCircle.rules.gracePeriodHours}</p>
                <p>Late Fee (%): {selectedCircle.rules.lateFeePercent}</p>
                <p>Auto Replacement: {selectedCircle.rules.autoReplacement ? "Yes" : "No"}</p>
                <p>Auction Enabled: {selectedCircle.rules.auctionEnabled ? "Yes" : "No"}</p>
                {selectedCircle.rules.auctionEnabled && (
                  <p>Max Auction Premium (%): {selectedCircle.rules.auctionMaxPremiumPercent}</p>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div className="d-flex gap-2">
            {selectedCircle?.status === "Active" && (
              <>
                <Button
                  variant="info"
                  onClick={() => handleStatusChange(selectedCircle.id, "Paused")}
                  title="Pause"
                >
                  <FontAwesomeIcon icon={faPause} />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange(selectedCircle.id, "Completed")}
                  title="Complete"
                >
                  <FontAwesomeIcon icon={faStop} />
                </Button>
              </>
            )}
            {selectedCircle?.status === "Paused" && (
              <Button
                variant="success"
                onClick={() => handleStatusChange(selectedCircle.id, "Active")}
                title="Resume"
              >
                <FontAwesomeIcon icon={faPlay} />
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={() => setSelectedCircle(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
