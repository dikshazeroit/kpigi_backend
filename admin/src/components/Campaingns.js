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
import {
    faPause,
    faPlay,
    faInfoCircle,
    faFunnelDollar,
} from "@fortawesome/free-solid-svg-icons";
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

    // REJECT MODAL STATES
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [campaignToReject, setCampaignToReject] = useState(null);

    const campaignsPerPage = 10;

    // ================= FETCH DATA =================
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const statusParam = filter === "All" ? "" : filter.toUpperCase();
            const data = await getAllFundraisers(
                page,
                campaignsPerPage,
                search,
                statusParam
            );

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

    // ================= ACTION HANDLERS =================
    const handlePause = async (campaign) => {
        await pauseFundraiserAPI(campaign.f_uuid, "Paused by admin");
        fetchCampaigns();
    };

    const handleResume = async (campaign) => {
        await resumeFundraiserAPI(campaign.f_uuid);
        fetchCampaigns();
    };

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

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Please enter a reason!",
            });
            return;
        }

        try {
            const res = await rejectFundraiserAPI(
                campaignToReject.f_uuid,
                rejectReason
            );

            Swal.fire({
                icon: "success",
                title: "Rejected!",
                text: res.message || "Fundraiser rejected successfully",
                timer: 2000,
                showConfirmButton: false,
            });

            setShowRejectModal(false);
            setCampaignToReject(null);
            setRejectReason("");

            fetchCampaigns();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message || "Failed to reject fundraiser",
            });
        }
    };

    // ================= STATUS TEXT =================
    const getStatusText = (status) => {
        switch (status) {
            case "PENDING":
                return "Pending";
            case "ACTIVE":
                return "Active";
            case "PAUSED":
                return "Paused";
            case "CLOSED":
            case "REJECTED":
                return "Rejected";
            default:
                return status;
        }
    };

    return (
        <div>
            <Card border="light" className="shadow-sm">
                {/* TITLE */}
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
                            <Form.Select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
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
                            <div className="text-muted fw-semibold">
                                Loading data, please wait...
                            </div>
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
                                            <td>{c.user?.uc_full_name ?? "Anonymous"}</td>

                                            <td>
                                                <Badge bg="info">{getStatusText(c.f_status)}</Badge>
                                            </td>

                                            <td>${c.f_amount}</td>
                                            <td>
                                                {new Date(c.f_deadline).toLocaleDateString()}
                                            </td>
                                            <td>{c.f_status === "ACTIVE" ? "Verified" : "Pending"}</td>

                                            {/* ACTIONS */}
                                            <td>
                                                <div className="fw-semibold mb-1">
                                                    {getStatusText(c.f_status)}
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="me-1 mb-1"
                                                    onClick={() => setSelectedCampaign(c)}
                                                >
                                                    <FontAwesomeIcon icon={faInfoCircle} /> Details
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
                                                            onClick={() => {
                                                                setCampaignToReject(c);
                                                                setRejectReason("");
                                                                setShowRejectModal(true);
                                                            }}
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
                                                            onClick={() => handlePause(c)}
                                                        >
                                                            <FontAwesomeIcon icon={faPause} /> Pause
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            className="mb-1"
                                                            onClick={() => {
                                                                setCampaignToReject(c);
                                                                setRejectReason("Closed by admin");
                                                                setShowRejectModal(true);
                                                            }}
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
                                                            onClick={() => {
                                                                setCampaignToReject(c);
                                                                setRejectReason("Closed by admin");
                                                                setShowRejectModal(true);
                                                            }}
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
                    {/* Pagination */}


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
                        <>
                            <p>
                                <strong>Title:</strong> {selectedCampaign.f_title}
                            </p>
                            <p>
                                <strong>Requester:</strong> {selectedCampaign.user?.uc_full_name ?? "Anonymous"}
                            </p>
                            <p>
                                <strong>Status:</strong> {getStatusText(selectedCampaign.f_status)}
                            </p>
                            <p>
                                <strong>Amount:</strong> ${selectedCampaign.f_amount}
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* REJECT MODAL */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reject Campaign</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Reason for rejection</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleReject}>
                        Submit Reject
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
