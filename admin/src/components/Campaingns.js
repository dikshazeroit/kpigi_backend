import React, { useState, useEffect } from "react";
import {
    Table,
    Row,
    Col,
    Form,
    Button,
    Badge,
    Card,
    Modal,
    Pagination,
    Spinner,

} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faTimes, faInfoCircle, faFunnelDollar, } from "@fortawesome/free-solid-svg-icons";


// API IMPORTS
import {
    getAllFundraisers,
    approveFundraiserAPI,
    rejectFundraiserAPI,
    pauseFundraiserAPI,
    resumeFundraiserAPI,
} from "../api/ApiServices";

export default function Campaign() {
    const [campaigns, setCampaigns] = useState([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);

    const campaignsPerPage = 10;

    // Fetch data from API
    // Fetch data from API
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const statusParam = filter === "All" ? "" : filter.toUpperCase();
            const data = await getAllFundraisers(page, campaignsPerPage, search, statusParam);

            setCampaigns(data.payload || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch campaigns when page, filter, or search changes
    useEffect(() => {
        fetchCampaigns();
    }, [page, filter, search]);

    // ACTION HANDLERS
    const handlePause = async (campaign) => {
        try {
            await pauseFundraiserAPI(campaign.f_uuid, "Paused by admin");
            fetchCampaigns(setPage);
        } catch (err) {
            console.log("Pause error", err);
        }
    };

    const handleResume = async (campaign) => {
        try {
            await resumeFundraiserAPI(campaign.f_uuid);
            fetchCampaigns(setPage);
        } catch (err) {
            console.log("Resume error", err);
        }
    };

    const handleClose = async (campaign) => {
        try {
            await rejectFundraiserAPI(campaign.f_uuid, "Closed by admin");
            fetchCampaigns(setPage);
        } catch (err) {
            console.log("Close error", err);
        }
    };

    const handleApprove = async (campaign) => {
        try {
            await approveFundraiserAPI(campaign.f_uuid);
            fetchCampaigns(setPage);
        } catch (err) {
            console.log("Approve error", err);
        }
    };

    return (
        <div>
            <Card border="light" className="shadow-sm">

                {/* PAGE TITLE */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h4 className="mb-0">
                        <FontAwesomeIcon icon={faFunnelDollar} className="me-2" />
                        Fund Management
                    </h4>
                </div>

                <Card.Body>

                    {/* FILTER + SEARCH */}
                    <Row className="mb-4">
                        <Col md={4}>
                            <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="All">All Funds</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PAUSED">Paused</option>
                                <option value="FLAGGED">Flagged</option>
                                <option value="CLOSED">Closed</option>
                            </Form.Select>
                        </Col>

                        <Col md={8}>
                            <Form.Control
                                placeholder="Search by title or requester"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>
                    </Row>

                    {/* TABLE */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                            <div className="text-muted fw-semibold">
                                Loading  data, please wait...
                            </div>
                        </div>
                    ) : (
                        <Table bordered hover responsive className="align-middle text-left">
                            <thead className="table-light">
                                <tr>
                                    <th>Sr. No</th>
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
                                {campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-muted py-4">
                                            No campaigns found
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((c, index) => (
                                        <tr key={c.f_uuid}>
                                            <td>
                                                {(page - 1) * campaignsPerPage + index + 1}
                                            </td>
                                            <td>{c.f_title}</td>
                                            <td>{c.userName}</td>

                                            <td>
                                                <Badge
                                                    bg={
                                                        c.f_status === "ACTIVE"
                                                            ? "success"
                                                            : c.f_status === "PAUSED"
                                                                ? "warning"
                                                                : "secondary"
                                                    }
                                                >
                                                    {c.f_status}
                                                </Badge>
                                                {c.flagged && (
                                                    <Badge bg="danger" className="ms-1">
                                                        Flagged
                                                    </Badge>
                                                )}
                                            </td>

                                            <td>${c.f_amount} / ${c.f_amount}</td>
                                            <td>{new Date(c.f_deadline).toLocaleDateString()}</td>
                                            <td>{c.f_status === "ACTIVE" ? "Verified" : "Pending"}</td>

                                            <td>
                                                <Button size="sm" variant="primary" className="me-1"
                                                    onClick={() => setSelectedCampaign(c)} >
                                                    <FontAwesomeIcon icon={faInfoCircle} /> Details </Button>

                                                {c.f_status === "PENDING" && (
                                                    <Button size="sm" variant="success" className="me-1"
                                                        onClick={() => handleApprove(c)}>
                                                        Approve
                                                    </Button>
                                                )}

                                                {c.f_status === "ACTIVE" && (
                                                    <Button size="sm" variant="warning" className="me-1"
                                                        onClick={() => handlePause(c)}>
                                                        <FontAwesomeIcon icon={faPause} />
                                                    </Button>
                                                )}

                                                {c.f_status === "PAUSED" && (
                                                    <Button size="sm" variant="success" className="me-1"
                                                        onClick={() => handleResume(c)}>
                                                        <FontAwesomeIcon icon={faPlay} />
                                                    </Button>
                                                )}

                                                {c.f_status !== "CLOSED" && (
                                                    <Button size="sm" variant="danger"
                                                        onClick={() => handleClose(c)}>
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                    {totalPages >= 1 && (
                        <Pagination className="justify-content-end mt-3">
                            <Pagination.Prev
                                disabled={page === 1}
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            >
                                Prev
                            </Pagination.Prev>

                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === page}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}

                            <Pagination.Next
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Next
                            </Pagination.Next>
                        </Pagination>
                    )}



                </Card.Body>
            </Card>
            {/* DETAILS MODAL */}
            <Modal show={!!selectedCampaign} onHide={() => setSelectedCampaign(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Campaign Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedCampaign && (
                        <Row className="mb-3">
                            <Col md={6}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Campaign Info</Card.Title>
                                        <p><strong>Title:</strong> {selectedCampaign.f_title}</p>
                                        <p><strong>Goal:</strong> ${selectedCampaign.f_amount}</p>
                                        <p><strong>Status:</strong> {selectedCampaign.f_status}</p>
                                        <p><strong>Deadline:</strong> {new Date(selectedCampaign.f_deadline).toLocaleDateString()}</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Requester & Bank</Card.Title>
                                        <p><strong>User UUID:</strong> {selectedCampaign.userName}</p>
                                        <p><strong>Fraud Reports:</strong> {selectedCampaign.fraudReports}</p>
                                        <p><strong>Flagged:</strong> {selectedCampaign.flagged ? "Yes" : "No"}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}
