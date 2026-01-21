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
    faPlay,
    faIdCard,
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
            case "REJECTED":
                return <Badge bg="danger">Rejected</Badge>;
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

            Swal.fire("VERIFIED", "KYC verified successfully", "success");
        } catch (error) {
            console.error("KYC VERIFIED failed:", error);
            Swal.fire("Error", "Failed to verify KYC", "error");
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
            return;
        }

        setLoading(true);

        try {
            if (actionType === "REJECT") {
                await rejectKYC(selectedUser.kyc?.kyc_uuid, reason);

                setKycList((prev) =>
                    prev.map((u) =>
                        u.uc_uuid === selectedUser.uc_uuid
                            ? { ...u, kyc: { ...u.kyc, status: "REJECTED" } }
                            : u
                    )
                );

                Swal.fire("Rejected", "KYC rejected successfully", "success");
            }

            if (actionType === "RESUME") {
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
            setShowReasonModal(false);
            setSelectedUser(null);
            setReason("");
            setActionType("");
            setLoading(false);
        }
    };

    return (
        <Card border="light" className="shadow-sm p-3" style={{ marginBottom: "10px" }}>
            <Card.Body>
                {/* ================= HEADER ================= */}
                <Row className="mb-4 align-items-center">
                    <Col>
                        <h4 className="mb-0 d-flex align-items-center">
                            <FontAwesomeIcon icon={faIdCard} className="me-2 text-primary" />
                            KYC Management
                        </h4>
                    </Col>
                </Row>

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
                                    <th>Date of Birth</th>
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
                                                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>

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

                                                <td>{u.uc_full_name}</td>

                                                <td>{u.uc_email}</td>

                                                <td>{kyc.address || "-"}</td>

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

                                                <td>{statusBadge(kyc?.status || "NOT_STARTED")}</td>

                                                <td>
                                                    {kyc.createdAt
                                                        ? new Date(kyc.dateOfBirth).toLocaleDateString()
                                                        : "-"}
                                                </td>

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

                                                    {/* Pause button removed for VERIFIED status */}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>

                        {/* PAGINATION */}
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
                                            ? `${Image_Url.replace(/\/$/, "")}/${selectedUser.uc_profile_photo}`
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
                                <div className="mt-3">{statusBadge(selectedUser.kyc?.status)}</div>
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
                                                <small className="text-muted d-block">Date of Birth</small>
                                                <strong>
                                                    {selectedUser.kyc?.dateOfBirth
                                                        ? new Date(selectedUser.kyc.dateOfBirth).toLocaleDateString(
                                                            "en-GB"
                                                        )
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
                                            <div
                                                className="border rounded overflow-hidden position-relative"
                                                style={{
                                                    maxHeight: "300px",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => {
                                                    if (selectedUser?.kyc?.idImageName) {
                                                        const imageUrl = `${Image_Url.replace(/\/$/, "")}/${selectedUser.kyc.idImageName}`;
                                                        window.open(imageUrl, '_blank');
                                                    }
                                                }}
                                                title="Click to view full size"
                                            >
                                                <img
                                                    src={
                                                        selectedUser?.kyc?.idImageName
                                                            ? `${Image_Url.replace(/\/$/, "")}/${selectedUser.kyc.idImageName}`
                                                            : defaultDocImg
                                                    }
                                                    alt={selectedUser?.kyc?.idType || "Document"}
                                                    className="img-fluid"
                                                    style={{
                                                        maxHeight: "300px",
                                                        width: "auto"
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = defaultDocImg;
                                                    }}
                                                />
                                                <div className="position-absolute top-0 end-0 m-2">
                                                    <span className="badge bg-dark bg-opacity-75">
                                                        <i className="fas fa-expand"></i>
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-muted mt-2">
                                                <small>
                                                    <i className="fas fa-mouse-pointer me-1"></i>
                                                    Click on image to view in full size
                                                </small>
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
                    <Button variant="primary" onClick={() => setSelectedUser(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* REASON MODAL */}
            <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter reject Reason</Modal.Title>
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
