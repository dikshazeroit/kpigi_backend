import React, { useState, useEffect } from "react";
import {
  Col,
  Row,
  Card,
  Button,
  Modal,
  Form,
  Tabs,
  Tab,
  Table,
  Badge,
  Spinner,
  ProgressBar,
} from "@themesberg/react-bootstrap";
import {
  faPlus,
  faTrash,
  faPause,
  faPlay,
  faStop,
  faHeartbeat,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const dummyCircles = [
  {
    id: 1,
    name: "Family Savings",
    status: "Active",
    members: [
      { id: 1, name: "Alice", bond: 50, state: "active", paid: true },
      { id: 2, name: "Bob", bond: 50, state: "active", paid: false },
    ],
    totalPot: 500,
    nextPayout: "10/11/2025",
    contribution: 100,
    cadence: "Monthly",
    seats: 5,
    startDate: "01/11/2025",
    healthScore: 85,
    missedPayments: 1,
  },
  {
    id: 2,
    name: "Office Circle",
    status: "Pending",
    members: [],
    totalPot: 0,
    contribution: 50,
    cadence: "Weekly",
    seats: 6,
    startDate: "15/11/2025",
    healthScore: null,
  },
];

export default function CirclesPage() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCircle, setNewCircle] = useState({
    name: "",
    contribution: "",
    cadence: "Monthly",
    seats: 1,
    startDate: "",
  });
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Active");

  useEffect(() => {
    setTimeout(() => {
      setCircles(dummyCircles);
      setLoading(false);
    }, 600);
  }, []);

  const handleCreateCircle = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddCircle = () => {
    setCreating(true);
    setTimeout(() => {
      const circle = {
        id: circles.length + 1,
        ...newCircle,
        members: [],
        status: "Pending",
        totalPot: 0,
        nextPayout: "TBD",
        healthScore: null,
      };
      setCircles([circle, ...circles]);
      setCreating(false);
      handleCloseModal();
    }, 600);
  };

  const handleDeleteCircle = (id) => {
    setCircles(circles.filter((c) => c.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setCircles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const filteredCircles = circles.filter((c) => c.status === selectedTab);

  return (
    <>
      <Card className="mb-3 shadow-sm border-0">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Circle Management</h4>
          <Button variant="primary" onClick={handleCreateCircle}>
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Circle
          </Button>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Tabs
          activeKey={selectedTab}
          onSelect={(k) => setSelectedTab(k)}
          className="mb-3"
        >
          {["Active", "Pending", "Completed", "Paused"].map((status) => (
            <Tab eventKey={status} title={status} key={status}>
              <Row>
                {filteredCircles.map((circle) => (
                  <Col key={circle.id} md={4} className="mb-4">
                    <Card className="h-100 shadow-sm border-0">
                      <Card.Body className="text-center">
                        <h5 className="fw-semibold">{circle.name}</h5>
                        <Badge
                          bg={
                            circle.status === "Active"
                              ? "success"
                              : circle.status === "Paused"
                              ? "warning"
                              : circle.status === "Completed"
                              ? "secondary"
                              : "info"
                          }
                          className="mb-2"
                        >
                          {circle.status}
                        </Badge>
                        <p className="text-muted mb-1">
                          Members: {circle.members.length}
                        </p>
                        <p className="text-muted mb-1">
                          Contribution: ${circle.contribution}
                        </p>
                        <p className="text-muted mb-1">
                          Cadence: {circle.cadence}
                        </p>
                        <p className="text-muted mb-1">
                          Total Pot: ${circle.totalPot}
                        </p>

                        {circle.healthScore && (
                          <div className="mt-3">
                            <FontAwesomeIcon
                              icon={faHeartbeat}
                              className="me-2 text-danger"
                            />
                            <small>Health Score: {circle.healthScore}%</small>
                            <ProgressBar
                              now={circle.healthScore}
                              variant={
                                circle.healthScore > 75
                                  ? "success"
                                  : circle.healthScore > 50
                                  ? "warning"
                                  : "danger"
                              }
                              className="mt-1"
                            />
                          </div>
                        )}

                        <div className="mt-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => setSelectedCircle(circle)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-circle"
                            onClick={() => handleDeleteCircle(circle.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-danger"
                            />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Tab>
          ))}
        </Tabs>
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
              <Tab eventKey="members" title="Members & Order">
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
                        <td>${m.bond}</td>
                        <td>{m.state}</td>
                        <td>{m.paid ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>

              <Tab eventKey="config" title="Circle Config">
                <p>Contribution: ${selectedCircle.contribution}</p>
                <p>Cadence: {selectedCircle.cadence}</p>
                <p>Seats: {selectedCircle.seats}</p>
                <p>Start Date: {selectedCircle.startDate}</p>
              </Tab>

              <Tab eventKey="timeline" title="Timeline / Flags">
                <p>Track who paid, missed payments, or defaulted.</p>
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

      {/* Create Circle Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Circle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Circle Name</Form.Label>
              <Form.Control
                type="text"
                value={newCircle.name}
                onChange={(e) =>
                  setNewCircle({ ...newCircle, name: e.target.value })
                }
              />
            </Form.Group>
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
            <Form.Group className="mb-2">
              <Form.Label>Seats</Form.Label>
              <Form.Control
                type="number"
                value={newCircle.seats}
                onChange={(e) =>
                  setNewCircle({ ...newCircle, seats: e.target.value })
                }
              />
            </Form.Group>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleAddCircle}
            disabled={creating || !newCircle.name || !newCircle.contribution}
          >
            {creating ? "Creating..." : "Create Circle"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
