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
import { faPause, faPlay, faEye, faFunnelDollar } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

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

    // ====== Pause / Reject Reason Modal ======
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [reasonType, setReasonType] = useState(""); // "PAUSE" or "REJECT"
    const [reasonText, setReasonText] = useState("");
    const [campaignForReason, setCampaignForReason] = useState(null);

    // ====== FETCH DATA ======
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

    useEffect(() => {
        fetchCampaigns();
    }, [page, filter, search]);

    // ====== STATUS TEXT ======
    const getStatusText = (status) => {
        switch (status) {
            case "PENDING": return "Pending";
            case "ACTIVE": return "Active";
            case "PAUSED": return "Paused";
            case "CLOSED":
            case "REJECTED": return "Rejected";
            default: return status;
        }
    };

    // ====== OPEN REASON MODAL ======
    const openReasonModal = (campaign, type) => {
        setCampaignForReason(campaign);
        setReasonType(type);
        setReasonText("");
        setShowReasonModal(true);
    };

    // ====== HANDLE PAUSE / REJECT SUBMIT ======
    const handleReasonSubmit = async () => {
        if (!reasonText.trim()) {
            Swal.fire({ icon: "warning", title: "Warning", text: "Please enter a reason!" });
            return;
        }

        try {
            let res;
            if (reasonType === "PAUSE") {
                res = await pauseFundraiserAPI(campaignForReason.f_uuid, reasonText);
            } else if (reasonType === "REJECT") {
                res = await rejectFundraiserAPI(campaignForReason.f_uuid, reasonText);
            }

            if (res.status) {
                Swal.fire({
                    icon: "success",
                    title: reasonType === "PAUSE" ? "Paused!" : "Rejected!",
                    text: res.message || `${reasonType === "PAUSE" ? "Fundraiser paused" : "Fundraiser rejected"}. Notification sent.`,
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
            } else {
                Swal.fire({ icon: "error", title: "Error", text: res.message || "Operation failed" });
            }

            setShowReasonModal(false);
            setCampaignForReason(null);
            setReasonText("");
            fetchCampaigns();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Operation failed",
            });
        }
    };

    // ====== HANDLE APPROVE ======
    const handleApprove = async (campaign) => {
        try {
            const res = await approveFundraiserAPI(campaign.f_uuid);
            Swal.fire({
                icon: "success",
                title: "Approved!",
                text: res.message || "Fundraiser approved successfully",
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
            fetchCampaigns();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Failed to approve fundraiser",
            });
        }
    };

    // ====== HANDLE RESUME ======
    const handleResume = async (campaign) => {
        try {
            const res = await resumeFundraiserAPI(campaign.f_uuid);
            if (res.status) {
                Swal.fire({
                    icon: "success",
                    title: "Resumed!",
                    text: res.message || "Fundraiser resumed successfully",
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end",
                });
            }
            fetchCampaigns();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Failed to resume fundraiser",
            });
        }
    };

    return (
        <div>
            <Card border="light" className="shadow-sm">
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
                                <option value="PENDING">Pending</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PAUSED">Paused</option>
                                <option value="CLOSED">Rejected</option>
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
                            <div className="text-muted fw-semibold">Loading data, please wait...</div>
                        </div>
                    ) : (
                        <Table bordered hover responsive className="align-middle">
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
                                        <td colSpan="8" className="text-center text-muted">
                                            No campaigns found
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((c, index) => (
                                        <tr key={c.f_uuid}>
                                            <td>{(page - 1) * campaignsPerPage + index + 1}</td>
                                            <td>{c.f_title}</td>
                                            <td>{c.userName || "Anonymous"}</td> {/* <- userName from API */}

                                            <td>
                                                <Badge bg="info">{getStatusText(c.f_status)}</Badge>
                                            </td>

                                            <td>${c.f_amount}</td>
                                            <td>{new Date(c.f_deadline).toLocaleDateString()}</td>
                                            <td>{c.f_status === "ACTIVE" ? "Verified" : "Pending"}</td>

                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="blue"
                                                    className="me-1 mb-1"
                                                    onClick={() => setSelectedCampaign(c)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>

                                                {c.f_status === "PENDING" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            className="me-1 mb-1"
                                                            onClick={() => handleApprove(c)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            className="mb-1"
                                                            onClick={() => openReasonModal(c, "REJECT")}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                {c.f_status === "ACTIVE" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="warning"
                                                            className="me-1 mb-1"
                                                            onClick={() => openReasonModal(c, "PAUSE")}
                                                        >
                                                            <FontAwesomeIcon icon={faPause} /> Pause
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            className="mb-1"
                                                            onClick={() => openReasonModal(c, "REJECT")}
                                                        >
                                                            Close
                                                        </Button>
                                                    </>
                                                )}

                                                {c.f_status === "PAUSED" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            className="me-1 mb-1"
                                                            onClick={() => handleResume(c)}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} /> Resume
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            className="mb-1"
                                                            onClick={() => openReasonModal(c, "REJECT")}
                                                        >
                                                            Close
                                                        </Button>
                                                    </>
                                                )}

                                                {(c.f_status === "CLOSED" || c.f_status === "REJECTED") && (
                                                    <span className="text-muted">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}

                    {/* ================= PAGINATION ================= */}
                    {totalPages > 1 && (
                        <Pagination className="justify-content-end mt-3">
                            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Pagination.Prev>
                            <Pagination.Item active>{page}</Pagination.Item>
                            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Pagination.Next>
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
                        <>
                            <p><strong>Title:</strong> {selectedCampaign.f_title}</p>
                            <p><strong>Requester:</strong> {selectedCampaign.userName || "Anonymous"}</p>
                            <p><strong>Status:</strong> {getStatusText(selectedCampaign.f_status)}</p>
                            <p><strong>Amount:</strong> ${selectedCampaign.f_amount}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* REASON MODAL (PAUSE or REJECT) */}
            <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{reasonType === "PAUSE" ? "Pause Campaign" : "Reject/Close Campaign"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            placeholder="Enter reason..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReasonModal(false)}>Cancel</Button>
                    <Button variant={reasonType === "PAUSE" ? "warning" : "danger"} onClick={handleReasonSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
