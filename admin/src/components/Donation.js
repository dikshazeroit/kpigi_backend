import React, { useEffect, useState, useCallback, useMemo } from "react";
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
    const [loading, setLoading] = useState(true); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");

    const [darkMode, setDarkMode] = useState(() => {
        
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) : false;
    });

    const [selectedDonation, setSelectedDonation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const limit = 10;

    
    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode));

        
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    // ================= FETCH DONATIONS =================
    const fetchDonations = useCallback(
        async (page = 1) => {
            setLoading(true);
            try {
                const resp = await getAllDonationsAPI({
                    page,
                    limit,
                    search: search.trim(),
                    min_amount: minAmount || 0,
                    max_amount: maxAmount || 999999999,
                });

                setDonations(resp.payload || []);
                setTotalPages(resp.pagination?.totalPages || 1);
            } catch (err) {
                console.error("Error fetching donations:", err);
                setDonations([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [search, minAmount, maxAmount]
    );

    
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            fetchDonations(1);
            setCurrentPage(1);
        }, 500); 

        setDebounceTimer(timer);

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [search, minAmount, maxAmount]);

    useEffect(() => {
        fetchDonations(currentPage);
    }, [currentPage]);

    const donationsWithSerial = useMemo(() => {
        if (!donations.length) return [];

        const startIndex = (currentPage - 1) * limit + 1;
        return donations.map((donation, index) => ({
            ...donation,
            serialNo: startIndex + index
        }));
    }, [donations, currentPage]);

    // ================= EXPORT CSV =================
    const exportCSV = () => {
        if (!donations.length) {
            alert("No data to export!");
            return;
        }

        const csv = Papa.unparse(
            donations.map((d) => ({
                "Sr. No.": donations.indexOf(d) + 1,
                "Donation UUID": d.d_uuid,
                "Donor Name": d.donor?.uc_full_name ?? "Anonymous",
                "Fundraiser": d.fundraiser?.f_title ?? "",
                "Amount": d.d_amount,
                "Fee": d.d_platform_fee ?? 0,
                "Status": d.d_status,
                "Date": new Date(d.createdAt).toLocaleString(),
            }))
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `donations_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // ================= ACTIONS =================
    const handleMarkSafe = async (id) => {
        if (!id) return;

        setActionLoading(true);
        try {
            await markDonationSafeAPI({ d_uuid: id });
            await fetchDonations(currentPage);
            setSelectedDonation(null);
        } catch (error) {
            console.error("Error marking donation as safe:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkFraud = async (id) => {
        if (!id) return;

        setActionLoading(true);
        try {
            await markDonationFraudAPI({ d_uuid: id, reason: "Marked by admin" });
            await fetchDonations(currentPage);
            setSelectedDonation(null);
        } catch (error) {
            console.error("Error marking donation as fraud:", error);
        } finally {
            setActionLoading(false);
        }
    };

    // ================= STYLES =================
    const styles = {
        darkMode: {
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            minHeight: '100vh'
        },
        lightMode: {
            backgroundColor: '#f8f9fa',
            color: '#212529',
            minHeight: '100vh'
        }
    };

    return (
        <div style={darkMode ? styles.darkMode : styles.lightMode} className="p-4">
            <Card
                className="shadow-sm"
                bg={darkMode ? "dark" : "light"}
                text={darkMode ? "white" : "dark"}
            >
                {/* HEADER */}
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <FontAwesomeIcon icon={faDonate} className="me-2" />
                        Donation Management
                    </h4>
                    <div>
                        <Button
                            variant={darkMode ? "light" : "secondary"}
                            className="me-2"
                            onClick={() => setDarkMode(!darkMode)}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                        </Button>
                        <Button
                            variant="success"
                            onClick={exportCSV}
                            disabled={!donations.length}
                        >
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Export CSV
                        </Button>
                    </div>
                </Card.Header>

                {/* FILTERS */}
                <Card.Body>
                    <Row className="g-3 mb-4">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    placeholder="Search by donor or fundraiser..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Min Amount ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Max Amount ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    placeholder="999999999"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    fetchDonations(1);
                                    setCurrentPage(1);
                                }}
                                disabled={loading}
                                className="w-100"
                            >
                                {loading ? "Loading..." : "Apply Filters"}
                            </Button>
                        </Col>
                    </Row>

                    {/* TABLE */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant={darkMode ? "light" : "primary"} />
                            <div className={`mt-3 ${darkMode ? "text-light" : "text-muted"}`}>
                                Loading donations...
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table
                                    bordered
                                    hover
                                    responsive
                                    variant={darkMode ? "dark" : "light"}
                                    striped
                                >
                                    <thead>
                                        <tr>
                                            <th width="80">Sr.No</th>
                                            <th>Donor</th>
                                            <th>Fundraiser</th>
                                            <th>Amount</th>
                                            <th>Fee</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th width="200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donationsWithSerial.length > 0 ? (
                                            donationsWithSerial.map((d) => (
                                                <tr key={d.d_uuid}>
                                                    <td className="text-center fw-bold">{d.serialNo}</td>
                                                    <td>
                                                        <FontAwesomeIcon icon={faUser} className="me-2 text-muted" />
                                                        {d.donor?.uc_full_name ?? "Anonymous"}
                                                    </td>
                                                    <td>{d.fundraiser?.f_title ?? "No Fundraiser"}</td>
                                                    <td className="fw-bold">${(d.d_amount ?? 0).toFixed(2)}</td>
                                                    <td>${(d.d_platform_fee ?? 0).toFixed(2)}</td>
                                                    <td>
                                                        <span className={`badge ${d.d_status === 'completed' ? 'bg-success' : d.d_status === 'fraud' ? 'bg-danger' : 'bg-warning'}`}>
                                                            {d.d_status ?? "Pending"}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <Button
                                                            variant="info"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => setSelectedDonation(d)}
                                                            title="View Details"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            className="me-2"
                                                            onClick={() => handleMarkSafe(d.d_uuid)}
                                                            disabled={actionLoading || d.d_status === 'completed'}
                                                            title="Mark as Safe"
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleMarkFraud(d.d_uuid)}
                                                            disabled={actionLoading || d.d_status === 'fraud'}
                                                            title="Mark as Fraud"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center py-4">
                                                    <div className="text-muted">
                                                        <FontAwesomeIcon icon={faDonate} size="2x" className="mb-2" />
                                                        <br />
                                                        <strong>No donations found</strong>
                                                        <p className="mt-2">Try changing your filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 0 && (
                                <div className="d-flex justify-content-end mt-3">
                                    <Pagination className="justify-content-end mt-3">
                                        <Pagination.Prev
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            Prev
                                        </Pagination.Prev>

                                        {/* Show only the current page */}
                                        <Pagination.Item active>{currentPage}</Pagination.Item>

                                        <Pagination.Next
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            Next
                                        </Pagination.Next>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* VIEW MODAL */}
            <Modal
                show={!!selectedDonation}
                onHide={() => !actionLoading && setSelectedDonation(null)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Donation Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDonation && (
                        <div className="p-3">
                           
                            <Row className="mb-2">
                                <Col sm={4}><strong>Donor:</strong></Col>
                                <Col sm={8}>
                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                    {selectedDonation.donor?.uc_full_name ?? "Anonymous"}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4}><strong>Fundraiser:</strong></Col>
                                <Col sm={8}>{selectedDonation.fundraiser?.f_title || 'N/A'}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4}><strong>Amount:</strong></Col>
                                <Col sm={8}>${(selectedDonation.d_amount || 0).toFixed(2)}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4}><strong>Fee:</strong></Col>
                                <Col sm={8}>${(selectedDonation.d_platform_fee || 0).toFixed(2)}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4}><strong>Status:</strong></Col>
                                <Col sm={8}>
                                    <span className={`badge ${selectedDonation.d_status === 'completed' ? 'bg-success' : selectedDonation.d_status === 'fraud' ? 'bg-danger' : 'bg-warning'}`}>
                                        {selectedDonation.d_status || 'Pending'}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4}><strong>Date:</strong></Col>
                                <Col sm={8}>
                                    {new Date(selectedDonation.createdAt).toLocaleDateString()}
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setSelectedDonation(null)}
                        disabled={actionLoading}
                    >
                        Close
                    </Button>
                    <Button
                        variant="success"
                        disabled={actionLoading || selectedDonation?.d_status === 'completed'}
                        onClick={() => handleMarkSafe(selectedDonation?.d_uuid)}
                    >
                        {actionLoading ? <Spinner size="sm" /> : 'Mark as Safe'}
                    </Button>
                    <Button
                        variant="danger"
                        disabled={actionLoading || selectedDonation?.d_status === 'fraud'}
                        onClick={() => handleMarkFraud(selectedDonation?.d_uuid)}
                    >
                        {actionLoading ? <Spinner size="sm" /> : 'Mark as Fraud'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}