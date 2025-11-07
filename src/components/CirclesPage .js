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
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faEye,
  faPause,
  faPlay,
  faStop,
  faHeartbeat,
} from "@fortawesome/free-solid-svg-icons";

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
      {
        id: 1,
        name: "Alice",
        role: "member",
        bondAmount: 10,
        state: "active",
        paidCurrentCycle: true,
        contributionHistory: [
          { cycle: 1, amount: 100, date: "2025-11-01", status: "paid" },
        ],
        payoutReceived: false,
        reputationScore: 95,
      },
      {
        id: 2,
        name: "Bob",
        role: "member",
        bondAmount: 10,
        state: "active",
        paidCurrentCycle: false,
        contributionHistory: [
          { cycle: 1, amount: 0, date: null, status: "pending" },
        ],
        payoutReceived: false,
        reputationScore: 80,
      },
    ],
    escrow: {
      currentBalance: 200,
      contractAddress: "0x1234abcd5678ef...",
      lastAudit: "2025-11-05",
    },
    rules: {
      gracePeriodHours: 24,
      lateFeePercent: 2,
      autoReplacement: true,
      auctionEnabled: false,
    },
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
    escrow: {
      currentBalance: 0,
      contractAddress: null,
      lastAudit: null,
    },
    rules: {
      gracePeriodHours: 24,
      lateFeePercent: 2,
      autoReplacement: true,
      auctionEnabled: true,
      auctionMaxPremiumPercent: 5,
    },
  },
];


export default function CirclesPage() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCircle, setSelectedCircle] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setCircles(dummyCircles);
      setLoading(false);
    }, 600);
  }, []);

  const handleDelete = (id) => setCircles(circles.filter((c) => c.id !== id));
  const handleStatusChange = (id, newStatus) =>
    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

  const filteredCircles = circles.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Circle Management</h4>
          <InputGroup style={{ width: "250px" }}>
            <FormControl
              placeholder="Search circles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Circle
          </Button>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Card className="shadow-sm border-0">
          <Table striped bordered hover responsive className="mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Members</th>
                <th>Total Pot</th>
                <th>Contribution</th>
                <th>Cadence</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCircles.length > 0 ? (
                filteredCircles.map((circle, i) => (
                  <tr key={circle.id}>
                    <td>{i + 1}</td>
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
                    <td>{circle.members.length}</td>
                    <td>₹{circle.totalPot}</td>
                    <td>₹{circle.contribution}</td>
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
                    {selectedCircle.members.map((m, i) => (
                      <tr key={m.id}>
                        <td>{i + 1}</td>
                        <td>{m.name}</td>
                        <td>₹{m.bond}</td>
                        <td>{m.state}</td>
                        <td>{m.paid ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>

              <Tab eventKey="config" title="Circle Config">
                <p>Contribution: ₹{selectedCircle.contribution}</p>
                <p>Cadence: {selectedCircle.cadence}</p>
                <p>Seats: {selectedCircle.seats}</p>
                <p>Start Date: {selectedCircle.startDate}</p>
              </Tab>

              <Tab eventKey="actions" title="Actions">
                <div className="d-flex gap-2">
                  {selectedCircle.status === "Active" && (
                    <Button
                      variant="warning"
                      onClick={() =>
                        handleStatusChange(selectedCircle.id, "Paused")
                      }
                    >
                      <FontAwesomeIcon icon={faPause} className="me-2" /> Pause
                    </Button>
                  )}
                  {selectedCircle.status === "Paused" && (
                    <Button
                      variant="success"
                      onClick={() =>
                        handleStatusChange(selectedCircle.id, "Active")
                      }
                    >
                      <FontAwesomeIcon icon={faPlay} className="me-2" /> Resume
                    </Button>
                  )}
                  {selectedCircle.status !== "Completed" && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        handleStatusChange(selectedCircle.id, "Completed")
                      }
                    >
                      <FontAwesomeIcon icon={faStop} className="me-2" /> Close
                    </Button>
                  )}
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
