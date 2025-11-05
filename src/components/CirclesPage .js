import React, { useState, useEffect } from "react";
import { Col, Row, Card, Button, Modal, Form, Tabs, Tab, Table, Spinner } from "@themesberg/react-bootstrap";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Dummy data
const dummyCircles = [
  {
    id: 1,
    name: "Family Savings",
    members: [
      { id: 1, name: "Alice", bond: 50, state: "active" },
      { id: 2, name: "Bob", bond: 50, state: "active" },
    ],
    totalPot: 500,
    nextPayout: "10/11/2025",
    contribution: 100,
    cadence: "Monthly",
    seats: 5,
    startDate: "01/11/2025",
  },
];

function CirclesPage() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newCircle, setNewCircle] = useState({
    name: "",
    contribution: "",
    cadence: "Monthly",
    seats: 1,
    startDate: "",
  });
  const [creating, setCreating] = useState(false);

  const [selectedCircle, setSelectedCircle] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCircles(dummyCircles);
      setLoading(false);
    }, 500);
  }, []);

  const handleCreateCircle = () => {
    setWizardStep(1);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCircle({
      name: "",
      contribution: "",
      cadence: "Monthly",
      seats: 1,
      startDate: "",
    });
    setCreating(false);
  };

  const handleNextStep = () => setWizardStep((s) => Math.min(s + 1, 3));
  const handlePrevStep = () => setWizardStep((s) => Math.max(s - 1, 1));

  const handleAddCircle = () => {
    setCreating(true);
    setTimeout(() => {
      const circle = {
        id: circles.length + 1,
        name: newCircle.name,
        members: [],
        totalPot: 0,
        nextPayout: "TBD",
        ...newCircle,
      };
      setCircles([circle, ...circles]);
      handleCloseModal();
    }, 500);
  };

  const handleDeleteCircle = (id) => {
    setCircles(circles.filter((c) => c.id !== id));
  };

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h5>My Circles</h5>
            <p className="text-muted">View and manage your savings circles.</p>
          </div>
          <Button variant="primary" onClick={handleCreateCircle}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Circle
          </Button>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" role="status" variant="primary" />
        </div>
      ) : (
        <Row>
          {circles.map((circle) => (
            <Col key={circle.id} xs={12} sm={6} md={4} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <h5>{circle.name}</h5>
                  <p className="mb-1">Members: {circle.members.length}</p>
                  <p className="mb-1">Total Pot: ${circle.totalPot}</p>
                  <p className="mb-1">Contribution: ${circle.contribution}</p>
                  <small className="text-muted">Next Payout: {circle.nextPayout}</small>
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={() => setSelectedCircle(circle)}
                  >
                    View Details
                  </Button>
                </Card.Body>
                <Card.Footer className="text-center">
                  <Button
                    variant="light"
                    size="sm"
                    className="rounded-circle"
                    onClick={() => handleDeleteCircle(circle.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal for Circle Creation */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Circle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {wizardStep === 1 && (
            <Form.Group>
              <Form.Label>Circle Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter circle name"
                value={newCircle.name}
                onChange={(e) =>
                  setNewCircle({ ...newCircle, name: e.target.value })
                }
              />
            </Form.Group>
          )}
          {wizardStep === 2 && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Contribution Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  value={newCircle.contribution}
                  onChange={(e) =>
                    setNewCircle({ ...newCircle, contribution: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Cadence</Form.Label>
                <Form.Select
                  value={newCircle.cadence}
                  onChange={(e) =>
                    setNewCircle({ ...newCircle, cadence: e.target.value })
                  }
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Seats</Form.Label>
                <Form.Control
                  type="number"
                  value={newCircle.seats}
                  onChange={(e) =>
                    setNewCircle({ ...newCircle, seats: e.target.value })
                  }
                />
              </Form.Group>
            </>
          )}
          {wizardStep === 3 && (
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={newCircle.startDate}
                onChange={(e) =>
                  setNewCircle({ ...newCircle, startDate: e.target.value })
                }
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          {wizardStep > 1 && (
            <Button variant="secondary" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {wizardStep < 3 && (
            <Button variant="primary" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {wizardStep === 3 && (
            <Button
              variant="primary"
              onClick={handleAddCircle}
              disabled={creating || !newCircle.name || !newCircle.contribution}
            >
              {creating ? "Creating..." : "Create Circle"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Circle Detail Modal */}
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
            <Tabs defaultActiveKey="members" className="mb-3">
              <Tab eventKey="members" title="Members">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Bond</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCircle.members.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>${m.bond}</td>
                        <td>{m.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>
              <Tab eventKey="payouts" title="Payouts / Contributions">
                <p>Timeline & payout details will go here.</p>
              </Tab>
              <Tab eventKey="early" title="Early Payout Options">
                <p>Auction & reputation-based slots UI here.</p>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CirclesPage;
