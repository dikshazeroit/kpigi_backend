import React, { useState } from "react";
import { Table, Row, Col, Form, Button, Badge, Card, Modal, Pagination } from "@themesberg/react-bootstrap";
import { faPause, faPlay, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Sample campaigns data
const sampleCampaigns = [
  { id: 1, title: "Emergency Surgery for My Son", requester: "John Doe", status: "Active", goal: 5000, raised: 1200, date: "2025-11-20", bankCard: "**** 1234", verification: "Verified", flagged: false, fraudReports: 0 },
  { id: 2, title: "School Supplies for Kids", requester: "Jane Smith", status: "Paused", goal: 2000, raised: 800, date: "2025-11-15", bankCard: "**** 5678", verification: "Pending", flagged: true, fraudReports: 2 },
  { id: 3, title: "Business Startup Fund", requester: "Ali Khan", status: "Closed", goal: 10000, raised: 10000, date: "2025-10-30", bankCard: "**** 9876", verification: "Verified", flagged: false, fraudReports: 0 },
  { id: 4, title: "Medical Aid for Elderly", requester: "Maria Lopez", status: "Active", goal: 3000, raised: 1500, date: "2025-11-10", bankCard: "**** 4321", verification: "Verified", flagged: false, fraudReports: 0 },
  { id: 5, title: "Community Library Fund", requester: "Ahmed Khan", status: "Paused", goal: 2500, raised: 1000, date: "2025-11-05", bankCard: "**** 8765", verification: "Pending", flagged: false, fraudReports: 0 },
  { id: 6, title: "Clean Water Project", requester: "Lucy Brown", status: "Active", goal: 7000, raised: 4500, date: "2025-11-02", bankCard: "**** 6543", verification: "Verified", flagged: false, fraudReports: 0 }
];

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState(sampleCampaigns);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const campaignsPerPage = 3;

  // Filter and search campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesFilter = filter === "All" || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.requester.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination calculations
  const indexOfLast = currentPage * campaignsPerPage;
  const indexOfFirst = indexOfLast - campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);

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
    <div>
      {/* Filter & Search */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Campaigns</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Flagged">Flagged</option>
            <option value="Closed">Closed</option>
          </Form.Select>
        </Col>
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Search by title or requester"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Campaigns Table */}
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
          {currentCampaigns.map(c => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.requester}</td>
              <td>
                <Badge bg={c.status === "Active" ? "success" : c.status === "Paused" ? "warning" : "secondary"}>
                  {c.status}
                </Badge>
                {c.flagged && <Badge bg="danger" className="ms-1">Flagged</Badge>}
              </td>
              <td>${c.raised} / ${c.goal}</td>
              <td>{c.date}</td>
              <td>{c.verification}</td>
              <td>
                <Button size="sm" variant="primary" className="me-1" onClick={() => setSelectedCampaign(c)}>
                  <FontAwesomeIcon icon={faInfoCircle} /> Detail
                </Button>
                {c.status === "Active" && (
                  <Button size="sm" variant="warning" className="me-1" onClick={() => handleAction(c, "Pause")}>
                    <FontAwesomeIcon icon={faPause} />
                  </Button>
                )}
                {c.status === "Paused" && (
                  <Button size="sm" variant="success" className="me-1" onClick={() => handleAction(c, "Resume")}>
                    <FontAwesomeIcon icon={faPlay} />
                  </Button>
                )}
                {c.status !== "Closed" && (
                  <Button size="sm" variant="danger" onClick={() => handleAction(c, "Close")}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item key={i + 1} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      {/* Campaign Detail Modal */}
      <Modal show={!!selectedCampaign} onHide={() => setSelectedCampaign(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Campaign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Campaign Info</Card.Title>
                      <p><strong>Title:</strong> {selectedCampaign.title}</p>
                      <p><strong>Category:</strong> {selectedCampaign.category || "N/A"}</p>
                      <p><strong>Goal:</strong> ${selectedCampaign.goal}</p>
                      <p><strong>Raised:</strong> ${selectedCampaign.raised}</p>
                      <p><strong>Status:</strong> {selectedCampaign.status}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Requester & Bank</Card.Title>
                      <p><strong>Name:</strong> {selectedCampaign.requester}</p>
                      <p><strong>Bank Card:</strong> {selectedCampaign.bankCard}</p>
                      <p><strong>Verification:</strong> {selectedCampaign.verification}</p>
                      <p><strong>Fraud Reports:</strong> {selectedCampaign.fraudReports}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Donation Progress */}
              <Card>
                <Card.Body>
                  <Card.Title>Donation Progress</Card.Title>
                  <p>${selectedCampaign.raised} raised of ${selectedCampaign.goal}</p>
                  <Form.Group className="mb-2">
                    <Form.Label>Progress</Form.Label>
                    <Form.Range value={(selectedCampaign.raised / selectedCampaign.goal) * 100} readOnly />
                  </Form.Group>
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
