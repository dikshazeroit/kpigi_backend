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
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faUserCheck,
    faUserTimes,
    faPause,
    faPlay,
    faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Image_Url } from "../api/ApiClient";
import { faSearch, } from "@fortawesome/free-solid-svg-icons";



const defaultProfileImg =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";


/* Dummy data */
const dummyKycData = Array.from({ length: 37 }, (_, i) => ({
    id: i + 1,
    uuid: `kyc-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@mail.com`,
    documentType: i % 2 === 0 ? "Aadhar" : "Passport",
    documentNumber: `DOC${1000 + i}`,
    status:
        i % 4 === 0
            ? "PENDING"
            : i % 4 === 1
                ? "VERIFIED"
                : i % 4 === 2
                    ? "PAUSED"
                    : "REJECTED",
    submittedAt: new Date().toISOString(),
}));

const ITEMS_PER_PAGE = 10;

export default function KycManagement() {
    const [kycList, setKycList] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [reason, setReason] = useState("");
    const [actionType, setActionType] = useState("");

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setKycList(dummyKycData);
            setLoading(false);
        }, 500);
    }, []);

    const filteredData = kycList.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.email.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === "ALL" ? true : item.status === filter;

        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const statusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <Badge bg="warning">Pending</Badge>;
            case "VERIFIED":
                return <Badge bg="success">Verified</Badge>;
            case "PAUSED":
                return <Badge bg="secondary">Paused</Badge>;
            case "REJECTED":
                return <Badge bg="danger">Rejected</Badge>;
            default:
                return status;
        }
    };

    const updateStatus = (uuid, status) => {
        setKycList((prev) => prev.map((k) => (k.uuid === uuid ? { ...k, status } : k)));
    };

    const handleApprove = (user) => {
        updateStatus(user.uuid, "VERIFIED");
        Swal.fire("Approved", "KYC approved successfully", "success");
    };

    const openReason = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setReason("");
        setShowReasonModal(true);
    };

    const submitReason = () => {
        if (!reason.trim()) {
            Swal.fire("Warning", "Please enter a reason", "warning");
            return;
        }

        if (actionType === "REJECT") updateStatus(selectedUser.uuid, "REJECTED");
        if (actionType === "PAUSE") updateStatus(selectedUser.uuid, "PAUSED");
        if (actionType === "RESUME") updateStatus(selectedUser.uuid, "VERIFIED");

        Swal.fire("Success", "Action completed", "success");
        setShowReasonModal(false);
    };

    return (
        <Card border="light" className="shadow-sm p-3"style={{marginBottom:"10px"}}>
            <Card.Header className="border-0 bg-white p-0 mb-4"style={{marginBottom:"10px"}}>



            </Card.Header>

            <Card.Body>
                {/* SEARCH + FILTER */}
                <Row className="mb-4 align-items-center"style={{marginBottom:"10px"}}>

                    {/* LEFT – FILTER */}
                    <Col md={4}>
                        <Form.Group className="mb-0">
                            <Form.Select
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="ALL">All</option>
                                <option value="PENDING">Pending</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="PAUSED">Paused</option>
                                <option value="REJECTED">Rejected</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* RIGHT – SEARCH */}
                    <Col md={8} className="d-flex justify-content-end">
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by name or email"
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
                    <Table bordered hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Sr.No.</th>
                                <th>Profile Image</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Document</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((u, i) => (
                                    <tr key={u.uuid}>
                                        <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                        <td>
                                            <img
                                                src={`${Image_Url}${u.uuid}/profile.jpg`}
                                                alt="Profile"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = defaultProfileImg;
                                                }}
                                                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                                            />
                                        </td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.documentType}</td>
                                        <td>{statusBadge(u.status)}</td>
                                        <td>{new Date(u.submittedAt).toLocaleDateString()}</td>
                                        <td>
                                            <Button size="sm" className="me-1" onClick={() => setSelectedUser(u)}>
                                                <FontAwesomeIcon icon={faEye} />
                                            </Button>

                                            {u.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleApprove(u)}
                                                    >
                                                        <FontAwesomeIcon icon={faUserCheck} />
                                                    </Button>{" "}
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => openReason(u, "REJECT")}
                                                    >
                                                        <FontAwesomeIcon icon={faUserTimes} />
                                                    </Button>
                                                </>
                                            )}

                                            {u.status === "PAUSED" && (
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => openReason(u, "RESUME")}
                                                >
                                                    <FontAwesomeIcon icon={faPlay} />
                                                </Button>
                                            )}

                                            {u.status === "VERIFIED" && (
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
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </Card.Body>

            {/* VIEW MODAL */}
            <Modal show={!!selectedUser} onHide={() => setSelectedUser(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>KYC Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div className="text-center">
                            {/* Profile Image */}
                            <img
                                src={`https://i.pravatar.cc/100?img=${selectedUser.id}`}
                                alt={selectedUser.name}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom: "15px",
                                }}
                            />
                            <p><strong>Name:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p>
                                <strong>Document:</strong> {selectedUser.documentType}
                            </p>
                            {/* Document Image */}
                            <img
                                src={`https://via.placeholder.com/200x120?text=${selectedUser.documentType}`}
                                alt={selectedUser.documentType}
                                style={{
                                    width: "200px",
                                    height: "120px",
                                    objectFit: "cover",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    marginBottom: "10px",
                                }}
                            />
                            <p><strong>Document No:</strong> {selectedUser.documentNumber}</p>
                            <p><strong>Status:</strong> {statusBadge(selectedUser.status)}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedUser(null)}>
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
                    <Button variant="secondary" onClick={() => setShowReasonModal(false)}>
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
