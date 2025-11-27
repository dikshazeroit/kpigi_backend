import React, { useState } from "react";
import { Table, Row, Col, Form, Button, Badge, Card, Modal } from "@themesberg/react-bootstrap";
import { faPause, faPlay, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Sample campaigns data
const sampleCampaigns = [
  { id: 1, title: "Emergency Surgery for My Son", requester: "John Doe", status: "Active", goal: 5000, raised: 1200, date: "2025-11-20", bankCard: "**** 1234", verification: "Verified", flagged: false, fraudReports: 0 },
  { id: 2, title: "School Supplies for Kids", requester: "Jane Smith", status: "Paused", goal: 2000, raised: 800, date: "2025-11-15", bankCard: "**** 5678", verification: "Pending", flagged: true, fraudReports: 2 },
  { id: 3, title: "Business Startup Fund", requester: "Ali Khan", status: "Closed", goal: 10000, raised: 10000, date: "2025-10-30", bankCard: "**** 9876", verification: "Verified", flagged: false, fraudReports: 0 }
];

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState(sampleCampaigns);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesFilter = filter === "All" || c.status === filter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.requester.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAction = (campaign, action) => {
    const updated = campaigns.map(c => {
      if (c.id === campaign.id) {
        if (action === "Pause") c.status = "Paused";
        if (action === "Resume") c.status = "Active";
        if (action === "Close") c.status = "Closed";
      }
      return c;
    });
    setCampaigns(updated);
  };

  return (
    <div className="p-3">

      {/* Extra CSS */}
<style>{`
  .table td, .table th {
    padding: 30px 25px !important;
  }
  .search-input {
    padding: 12px 18px !important;
    border-radius: 10px !important;
  }
  .filter-card, .table-card {
    padding: 30px !important;
    border-radius: 12px !important;
  }

  /* PAGE TITLE SPACING */
  .page-header-section {
    margin-bottom: 45px !important;
    margin-top: 10px !important;
    padding-bottom: 25px !important;  /* Added */
  }

  .page-title {
    margin-bottom: 30px !important;
  }

  .page-subtitle {
    margin-bottom: 35px !important;
    margin-top: 4px !important;
  }
`}</style>



      {/* PAGE TITLE */}
      <div className="page-header-section">
        <h4 className="fw-bold page-title">Hello, Welcome Kpigi – Admin Panel</h4>
        <p className="text-muted page-subtitle">
          Manage all fundraising campaigns here
        </p>
      </div>

      {/* FILTER & SEARCH SECTION */}
      <Card className="mb-4 shadow-sm filter-card">
        <Card.Body>
          <Row className="g-4">

            {/* STATUS FILTER */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Status Filter</Form.Label>
                <Form.Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="py-2"
                >
                  <option value="All">All Campaigns</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Flagged">Flagged</option>
                  <option value="Closed">Closed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* SEARCH BAR */}
            <Col md={8}>
              <Form.Group>
                <Form.Label className="fw-semibold">Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="🔍 Search by title or requester"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </Form.Group>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* CAMPAIGNS TABLE */}
      <Card className="shadow-sm table-card">
        <Card.Body>
          <h5 className="fw-bold mb-3">Campaign List</h5>

          <Table bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Requester</th>
                <th>Status</th>
                <th>Raised / Goal</th>
                <th>Date</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(c => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.title}</td>
                    <td>{c.requester}</td>

                    <td>
                      <Badge
                        bg={
                          c.status === "Active"
                            ? "success"
                            : c.status === "Paused"
                            ? "warning"
                            : "secondary"
                        }
                        className="px-3 py-2"
                      >
                        {c.status}
                      </Badge>

                      {c.flagged && (
                        <Badge bg="danger" className="ms-2 px-3 py-2">
                          Flagged
                        </Badge>
                      )}
                    </td>

                    <td>${c.raised} / ${c.goal}</td>
                    <td>{c.date}</td>

                    <td>
                      <Badge bg={c.verification === "Verified" ? "success" : "warning"} className="px-3 py-2">
                        {c.verification}
                      </Badge>
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        className="me-2 mb-1"
                        onClick={() => setSelectedCampaign(c)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} /> Detail
                      </Button>

                      {c.status === "Active" && (
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2 mb-1"
                          onClick={() => handleAction(c, "Pause")}
                        >
                          <FontAwesomeIcon icon={faPause} />
                        </Button>
                      )}

                      {c.status === "Paused" && (
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2 mb-1"
                          onClick={() => handleAction(c, "Resume")}
                        >
                          <FontAwesomeIcon icon={faPlay} />
                        </Button>
                      )}

                      {c.status !== "Closed" && (
                        <Button
                          size="sm"
                          variant="danger"
                          className="mb-1"
                          onClick={() => handleAction(c, "Close")}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* DETAILS MODAL */}
      <Modal show={!!selectedCampaign} onHide={() => setSelectedCampaign(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Campaign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Campaign Info</Card.Title>
                      <p><strong>Title:</strong> {selectedCampaign.title}</p>
                      <p><strong>Goal:</strong> ${selectedCampaign.goal}</p>
                      <p><strong>Raised:</strong> ${selectedCampaign.raised}</p>
                      <p><strong>Status:</strong> {selectedCampaign.status}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Requester Info</Card.Title>
                      <p><strong>Name:</strong> {selectedCampaign.requester}</p>
                      <p><strong>Bank Card:</strong> {selectedCampaign.bankCard}</p>
                      <p><strong>Verification:</strong> {selectedCampaign.verification}</p>
                      <p><strong>Fraud Reports:</strong> {selectedCampaign.fraudReports}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card>
                <Card.Body>
                  <Card.Title>Donation Progress</Card.Title>
                  <p>${selectedCampaign.raised} raised of ${selectedCampaign.goal}</p>
                  <Form.Range
                    value={(selectedCampaign.raised / selectedCampaign.goal) * 100}
                    readOnly
                  />
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
