import React, { useEffect, useState, useCallback } from "react";
import {
    Table,
    Row,
    Col,
    Card,
    Button,
    Form,
    Modal,
    Pagination,
    Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faUser,
    faMoon,
    faSun,
    faCheck,
    faTimes,
    faDonate,
    faEye,

} from "@fortawesome/free-solid-svg-icons";

import Papa from "papaparse";

import {
    getAllDonations as getAllDonationsAPI,
    markDonationSafe as markDonationSafeAPI,
    markDonationFraud as markDonationFraudAPI,
} from "../api/ApiServices";

export default function DonationAdminPanel() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");

    const [darkMode, setDarkMode] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const limit = 10;

    // ================= FETCH DONATIONS =================
    const fetchDonations = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const resp = await getAllDonationsAPI({
                    page,
                    limit,
                    search,
                    min_amount: minAmount || 0,
                    max_amount: maxAmount || 999999999,
                });

                setDonations(resp.payload || []);
                setTotalPages(resp.pagination?.totalPages || 1);
                setCurrentPage(resp.pagination?.currentPage || page);
            } catch (err) {
                console.error(err);
                setDonations([]);
            } finally {
                setLoading(false);
            }
        },
        [search, minAmount, maxAmount]
    );

    useEffect(() => {
        fetchDonations(currentPage);
    }, [currentPage, fetchDonations]);

    // ================= EXPORT CSV =================
    const exportCSV = () => {
        if (!donations.length) return;

        const csv = Papa.unparse(
            donations.map((d) => ({
                donation_uuid: d.d_uuid,
                donor_name: d.donor?.uc_full_name ?? "Anonymous",
                fundraiser: d.fundraiser?.f_title ?? "",
                amount: d.d_amount,
                fee: d.d_platform_fee ?? 0,
                status: d.d_status,
                date: new Date(d.createdAt).toLocaleString(),
            }))
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "donations.csv";
        link.click();
    };

    // ================= ACTIONS =================
    const handleMarkSafe = async (id) => {
        setActionLoading(true);
        await markDonationSafeAPI({ d_uuid: id });
        await fetchDonations(currentPage);
        setSelectedDonation(null);
        setActionLoading(false);
    };

    const handleMarkFraud = async (id) => {
        setActionLoading(true);
        await markDonationFraudAPI({ d_uuid: id, reason: "Marked by admin" });
        await fetchDonations(currentPage);
        setSelectedDonation(null);
        setActionLoading(false);
    };

    return (
        <div className={darkMode ? "dark-mode p-4" : "p-4"}>
            <Card className="shadow-sm">
                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h4>
                        <FontAwesomeIcon icon={faDonate} /> Donation Management
                    </h4>
                    <div>
                        <Button
                            variant="outline-secondary"
                            className="me-2"
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                        </Button>
                        <Button variant="success" onClick={exportCSV}>
                            <FontAwesomeIcon icon={faDownload} /> Export
                        </Button>
                    </div>
                </div>

                {/* FILTERS */}
                <Card className="p-3 m-3">
                    <Row className="g-2">
                        <Col md={5}>
                            <Form.Control
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Control
                                type="number"
                                placeholder="Min amount"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Control
                                type="number"
                                placeholder="Max amount"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                            />
                        </Col>
                        <Col md={1}>
                            <Button onClick={() => fetchDonations(1)}>Go</Button>
                        </Col>
                    </Row>
                </Card>

                {/* TABLE */}
                {/* TABLE */}
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" />
                            <div className="text-muted fw-semibold mt-2">
                                Loading data, please wait...
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Donor</th>
                                        <th>Fundraiser</th>
                                        <th>Amount</th>
                                        <th>Fee</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations && donations.length > 0 ? (
                                        donations.map((d) => (
                                            <tr key={d.d_uuid}>
                                                <td>
                                                    <FontAwesomeIcon icon={faUser} />{" "}
                                                    {d.donor?.uc_full_name ?? "Anonymous"}
                                                </td>
                                                <td>{d.fundraiser?.f_title ?? "No Fundraiser"}</td>
                                                <td>${d.d_amount ?? 0}</td>
                                                <td>${d.d_platform_fee ?? 0}</td>
                                                <td>{d.d_status ?? "Pending"}</td>
                                                <td>{new Date(d.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => setSelectedDonation(d)}
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        className="me-1"
                                                        onClick={() => handleMarkSafe(d.d_uuid)}
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleMarkFraud(d.d_uuid)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                <strong className="text-muted">No donations found</strong>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {totalPages >= 1 && (
                        <Pagination className="justify-content-end mt-3">
                            <Pagination.Prev
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                                Prev
                            </Pagination.Prev>

                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}

                            <Pagination.Next
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Next
                            </Pagination.Next>
                        </Pagination>
                    )}
                </Card.Body>
            </Card>

            {/* VIEW MODAL */}
            <Modal show={!!selectedDonation} onHide={() => setSelectedDonation(null)}>
                <Modal.Header>
                    <Modal.Title>Donation Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDonation && (
                        <>
                            <p><strong>Donor:</strong> {selectedDonation.donor?.uc_full_name ?? "Anonymous"}</p>
                            <p><strong>Fundraiser:</strong> {selectedDonation.fundraiser?.f_title}</p>
                            <p><strong>Amount:</strong> ${selectedDonation.d_amount}</p>
                            <p><strong>Fee:</strong> ${selectedDonation.d_platform_fee ?? 0}</p>
                            <p><strong>Status:</strong> {selectedDonation.d_status}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedDonation(null)}>
                        Close
                    </Button>
                    <Button
                        variant="success"
                        disabled={actionLoading}
                        onClick={() => handleMarkSafe(selectedDonation.d_uuid)}
                    >
                        Safe
                    </Button>
                    <Button
                        variant="danger"
                        disabled={actionLoading}
                        onClick={() => handleMarkFraud(selectedDonation.d_uuid)}
                    >
                        Fraud
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}