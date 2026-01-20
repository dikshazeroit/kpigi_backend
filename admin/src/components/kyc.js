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
    Spinner,
    InputGroup,
    Pagination,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faUserCheck,
    faUserTimes,
    faPause,
    faPlay,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Image_Url } from "../api/ApiClient";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { getAllUsersWithKyc, approveKyc, rejectKYC } from "../api/ApiServices";

const ITEMS_PER_PAGE = 10;
const defaultProfileImg =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
const defaultDocImg = "https://via.placeholder.com/200x150?text=Document+Not+Found";

export default function KycManagement() {
    const [kycList, setKycList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [reason, setReason] = useState("");
    const [actionType, setActionType] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getAllUsersWithKyc(
                    page,
                    ITEMS_PER_PAGE,
                    search.trim(),
                    filter === "ALL" ? "" : filter
                );

                setKycList(res.data || []);
                setTotalItems(res.pagination?.total || 0);
            } catch (err) {
                console.error("Fetch error:", err);
                Swal.fire("Error", "Failed to fetch KYC data", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, search, filter]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const statusBadge = (status) => {
        switch (status) {
            case "NOT_STARTED":
                return <Badge bg="secondary">Not Started</Badge>;
            case "PENDING":
                return <Badge bg="warning">Pending</Badge>;
            case "VERIFIED":
                return <Badge bg="success">Verified</Badge>;
            case "PAUSED":
                return <Badge bg="secondary">Paused</Badge>;
            case "REJECTED":
                return <Badge bg="danger">Rejected</Badge>;
            default:
                return <Badge bg="secondary">NOT STARTED</Badge>;
        }
    };

    const updateStatus = (uuid, status) => {
        setKycList((prev) =>
            prev.map((k) =>
                k.uc_uuid === uuid ? { ...k, kyc: { ...k.kyc, status } } : k
            )
        );
    };

    const handleApprove = async (user) => {
        if (!user.kyc?.kyc_uuid) {
            Swal.fire("Error", "Invalid KYC record", "error");
            return;
        }

        try {
            setLoading(true);
            const res = await approveKyc(user.kyc.kyc_uuid);

            // Update status based on API response
            const newStatus = res?.data?.status || "VERIFIED";
            updateStatus(user.uc_uuid, newStatus);

            console.log("KYC approved:", res.data);
            Swal.fire("Approved", "KYC VERIFIED successfully", "success");
        } catch (error) {
            console.error("KYC approval failed:", error);
            Swal.fire("Error", "Failed to approve KYC", "error");
        } finally {
            setLoading(false);
        }
    };

    const openReason = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setReason("");
        setShowReasonModal(true);
    };

    const submitReason = async () => {
        if (actionType === "REJECT" && !reason.trim()) {
            Swal.fire("Warning", "Please enter a reason", "warning");
            console.log("Rejected action aborted: reason empty");
            return;
        }

        setLoading(true);
        try {
            if (actionType === "REJECT") {
                const res = await rejectKYC(selectedUser.kyc?.kyc_uuid, reason);

                const updatedKyc = res?.data?.data;
                if (!updatedKyc) {
                    console.warn("No KYC data returned from API");
                }

                setKycList((prev) =>
                    prev.map((u) =>
                        u.uc_uuid === selectedUser.uc_uuid
                            ? { ...u, kyc: updatedKyc }
                            : u
                    )
                );

                Swal.fire("Rejected", "KYC rejected successfully", "success");
            }

            if (actionType === "PAUSE") {
                console.log("Pausing KYC for user:", selectedUser.uc_uuid);
                setKycList((prev) =>
                    prev.map((u) =>
                        u.uc_uuid === selectedUser.uc_uuid
                            ? { ...u, kyc: { ...u.kyc, status: "PAUSED" } }
                            : u
                    )
                );
                Swal.fire("Paused", "KYC paused successfully", "success");
            }

            if (actionType === "RESUME") {
                console.log("Resuming KYC for user:", selectedUser.uc_uuid);
                setKycList((prev) =>
                    prev.map((u) =>
                        u.uc_uuid === selectedUser.uc_uuid
                            ? { ...u, kyc: { ...u.kyc, status: "VERIFIED" } }
                            : u
                    )
                );
                Swal.fire("Resumed", "KYC resumed successfully", "success");
            }
        } catch (error) {
            console.error("Action failed:", error);
            Swal.fire("Error", "Failed to complete action", "error");
        } finally {
            console.log("submitReason finished, hiding modal and stopping loading");
            setShowReasonModal(false);
            setLoading(false);
        }
    };

    return (
        <Card border="light" className="shadow-sm p-3" style={{ marginBottom: "10px" }}>
            <Card.Body>
                {/* SEARCH + FILTER */}
                <Row className="mb-4 align-items-center" style={{ marginBottom: "10px" }}>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Select
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="ALL">All</option>
                                <option value="NOT_STARTED">Not Started</option>
                                <option value="PENDING">Pending</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="PAUSED">Paused</option>
                                <option value="REJECTED">Rejected</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={8} className="d-flex justify-content-end">
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by name, email, or document"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Col>
                </Row>

                {/* TABLE */}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <Table bordered hover responsive>
                            <thead className="bg-light">
                                <tr>
                                    <th>Sr.No.</th>
                                    <th>Profile</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Document</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {kycList.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted">
                                            No records found
                                        </td>
                                    </tr>
                                ) : (
                                    kycList.map((u, i) => {
                                        const kyc = u.kyc || {};

                                        return (
                                            <tr key={u.uc_uuid}>
                                                {/* Sr No */}
                                                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>

                                                {/* Profile Image */}
                                                <td className="text-center">
                                                    <img
                                                        src={u.uc_profile_photo ? Image_Url + u.uc_profile_photo : defaultProfileImg}
                                                        alt="profile"
                                                        style={{
                                                            width: "45px",
                                                            height: "45px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            border: "2px solid #ddd",
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = defaultProfileImg;
                                                        }}
                                                    />
                                                </td>

                                                {/* Name */}
                                                <td>{u.uc_full_name}</td>

                                                {/* Email */}
                                                <td>{u.uc_email}</td>

                                                {/* Address */}
                                                <td>{kyc.address || "-"}</td>

                                                {/* Document Image + Type */}
                                                <td className="text-center">
                                                    {kyc.idImageName ? (
                                                        <>
                                                            <img
                                                                src={`${Image_Url.replace(/\/$/, "")}/${kyc.idImageName}`}
                                                                alt={kyc.idType || "Document"}
                                                                style={{
                                                                    width: "45px",
                                                                    height: "45px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "4px",
                                                                    border: "1px solid #ccc",
                                                                    marginBottom: "4px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => setSelectedUser(u)}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://via.placeholder.com/45x45?text=No+Img";
                                                                }}
                                                            />
                                                            <div style={{ fontSize: "12px" }}>
                                                                {kyc.idType || "-"}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td>{statusBadge(kyc?.status || "NOT_STARTED")}</td>

                                                {/* Date */}
                                                <td>
                                                    {kyc.createdAt
                                                        ? new Date(kyc.createdAt).toLocaleDateString()
                                                        : "-"}
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => setSelectedUser(u)}
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>

                                                    {kyc.status === "PENDING" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                className="me-1"
                                                                onClick={() => handleApprove(u)}
                                                            >
                                                                <FontAwesomeIcon icon={faUserCheck} />
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() => openReason(u, "REJECT")}
                                                            >
                                                                <FontAwesomeIcon icon={faUserTimes} />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {kyc.status === "PAUSED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => openReason(u, "RESUME")}
                                                        >
                                                            <FontAwesomeIcon icon={faPlay} />
                                                        </Button>
                                                    )}

                                                    {kyc.status === "VERIFIED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="warning"
                                                            onClick={() => openReason(u, "PAUSE")}
                                                        >
                                                            <FontAwesomeIcon icon={faPause} />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>

                        {/* ================= PAGINATION ================= */}
                        <Pagination className="justify-content-end mt-3">
                            <Pagination.Prev
                                disabled={page === 1 || totalPages === 0}
                                onClick={() => setPage(Math.max(page - 1, 1))}
                            >
                                Prev
                            </Pagination.Prev>

                            {[...Array(totalPages || 1)].map((_, idx) => {
                                const pageNum = idx + 1;
                                return (
                                    <Pagination.Item
                                        key={pageNum}
                                        active={page === pageNum}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Pagination.Item>
                                );
                            })}

                            <Pagination.Next
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage(Math.min(page + 1, totalPages || 1))}
                            >
                                Next
                            </Pagination.Next>
                        </Pagination>
                    </>
                )}
            </Card.Body>

            {/* VIEW MODAL */}
            <Modal
                show={!!selectedUser && !showReasonModal}
                onHide={() => setSelectedUser(null)}
                centered
                size="lg"

            >
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title>KYC Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <Row className="g-4">
                            <Col md={4} className="text-center">
                                <img
                                    src={
                                        selectedUser?.uc_profile_photo
                                            ? `${Image_Url.replace(/\/$/, '')}/${selectedUser.uc_profile_photo}`
                                            : defaultProfileImg
                                    }
                                    alt={selectedUser?.uc_full_name || "User"}
                                    className="rounded-circle border mb-3"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultProfileImg;
                                    }}
                                />

                                <h5 className="mb-1">{selectedUser.uc_full_name}</h5>
                                <p className="text-muted mb-0">{selectedUser.uc_email}</p>
                                <div className="mt-3">
                                    {statusBadge(selectedUser.kyc?.status)}
                                </div>
                            </Col>

                            <Col md={8}>
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">User Information</h6>
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <div className="mb-2">
                                                <small className="text-muted d-block">Full Name</small>
                                                <strong>{selectedUser.uc_full_name || "-"}</strong>
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="mb-2">
                                                <small className="text-muted d-block">Email</small>
                                                <strong>{selectedUser.uc_email || "-"}</strong>
                                            </div>
                                        </Col>
                                        <Col xs={12}>
                                            <div className="mb-2">
                                                <small className="text-muted d-block">Address</small>
                                                <strong>{selectedUser.kyc?.address || "-"}</strong>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Document Details</h6>
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <div className="mb-2">
                                                <small className="text-muted d-block">Document Type</small>
                                                <strong>{selectedUser.kyc?.idType || "-"}</strong>
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="mb-2">
                                                <small className="text-muted d-block">Submitted Date</small>
                                                <strong>
                                                    {selectedUser.kyc?.createdAt
                                                        ? new Date(selectedUser.kyc.createdAt).toLocaleDateString('en-GB')
                                                        : "-"}
                                                </strong>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div>
                                    <h6 className="text-muted mb-3">Document Preview</h6>
                                    {selectedUser?.kyc?.idImageName ? (
                                        <div className="text-center">
                                            <img
                                                src={
                                                    selectedUser?.kyc?.idImageName
                                                        ? `${Image_Url.replace(/\/$/, '')}/${selectedUser.kyc.idImageName}`
                                                        : defaultDocImg
                                                }
                                                alt={selectedUser?.kyc?.idType || "Document"}
                                                className="img-fluid border rounded"
                                                style={{ maxHeight: "300px", maxWidth: "100%" }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = defaultDocImg;
                                                }}
                                            />
                                            <p className="text-muted mt-2">
                                                Click and drag to view full size
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 border rounded bg-light">
                                            <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                                            <p className="text-muted">No document uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button variant="light" onClick={() => setSelectedUser(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* REASON MODAL */}
            <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Reason</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowReasonModal(false);
                            setSelectedUser(null);  
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={submitReason}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}