// DonationAdminPanel.jsx
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
} from "@fortawesome/free-solid-svg-icons";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import Papa from "papaparse";

import {
    getAllDonations as getAllDonationsAPI,
    markDonationSafe as markDonationSafeAPI,
    markDonationFraud as markDonationFraudAPI,
} from "../api/ApiServices";

export default function Donation() {
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

    // ===========================
    // FETCH DONATIONS (Memoized)
    // ===========================
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
                console.error("Fetch donations error:", err);
                setDonations([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [search, minAmount, maxAmount, limit]
    );

    // ===========================
    // TRIGGER FETCH ONLY ON PAGE CHANGE
    // ===========================
    useEffect(() => {
        fetchDonations(currentPage);
    }, [currentPage, fetchDonations]);

    // ===========================
    // EXPORT CSV
    // ===========================
    const exportCSV = () => {
        if (!donations.length) {
            alert("No donations available to export");
            return;
        }

        const csv = Papa.unparse(
            donations.map((d) => ({
                donation_uuid: d.d_uuid,
                donor_uuid: d.d_fk_uc_uuid,
                donor_name: d.donor?.uc_full_name || "",
                fundraiser_uuid: d.d_fk_f_uuid,
                fundraiser_title: d.fundraiser?.f_title || "",
                amount: d.d_amount,
                platform_fee: d.d_platform_fee,
                status: d.d_status,
                createdAt: new Date(d.createdAt).toLocaleString(),
            }))
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "donations.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // ===========================
    // SAFE / FRAUD ACTIONS
    // ===========================
    const handleMarkSafe = async (d_uuid) => {
        setActionLoading(true);
        try {
            await markDonationSafeAPI({ d_uuid });
            await fetchDonations(currentPage);
            setSelectedDonation(null);
        } catch (err) {
            console.error("Mark safe error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkFraud = async (d_uuid) => {
        setActionLoading(true);
        try {
            await markDonationFraudAPI({ d_uuid, reason: "Marked by admin" });
            await fetchDonations(currentPage);
            setSelectedDonation(null);
        } catch (err) {
            console.error("Mark fraud error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    // ===========================
    // CHART DATA
    // ===========================
    const chartData = donations.slice(0, 20).map((d, i) => ({
        name: `D${i + 1}`,
        amount: d.d_amount,
    }));

    return (
        <div className={darkMode ? "donation-admin dark-mode p-4" : "donation-admin p-4"}>
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center page-header">

            </div>
            <Card border="light" className="shadow-sm">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    {/* Title */}
                    <div>
                        <h4 className="mb-0">
                            <FontAwesomeIcon icon={faDonate} className="me-2" />
                            Donation Management
                        </h4>
                        <small className="text-muted">
                            Manage all donations and export reports
                        </small>
                    </div>

                    {/* Buttons */}
                    <div className="mt-3 mt-md-0">
                        <button
                            className="btn btn-outline-secondary me-2"
                            onClick={() => setDarkMode((s) => !s)}
                        >
                            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />{" "}
                            {darkMode ? "Light" : "Dark"}
                        </button>

                        <button className="btn btn-success" onClick={exportCSV}>
                            <FontAwesomeIcon icon={faDownload} /> Export CSV
                        </button>
                    </div>
                </div>


                {/* FILTERS */}
                <Card className="mb-3 p-3 shadow-sm">
                    <Row className="g-2">
                        <Col md={5}>
                            <Form.Control
                                placeholder="Search donor / fundraiser UUID"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Col>

                        <Col md={2}>
                            <Form.Control
                                type="number"
                                placeholder="Min amount"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                            />
                        </Col>

                        <Col md={2}>
                            <Form.Control
                                type="number"
                                placeholder="Max amount"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                            />
                        </Col>

                        <Col md={3} className="text-end">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setCurrentPage(1);
                                    fetchDonations(1);
                                }}
                            >
                                Apply
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* SUMMARY */}
                <Row className="mb-3">
                    <Col md={4}>
                        <Card className="p-3 mb-2 shadow-sm">
                            <h6>Total Donations</h6>
                            <h4>{donations.length}</h4>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="p-3 mb-2 shadow-sm">
                            <h6>Total Amount</h6>
                            <h4>${donations.reduce((s, d) => s + (d.d_amount || 0), 0)}</h4>
                        </Card>
                    </Col>

                    <Col md={4}>
                        <Card className="p-3 mb-2 shadow-sm">
                            <h6>High Value (&gt;10k)</h6>
                            <h4>{donations.filter((d) => d.d_amount > 10000).length}</h4>
                        </Card>
                    </Col>
                </Row>

                {/* CHART */}
                <Card className="mb-4 p-3 shadow-sm">
                    <h6>Donation Amounts</h6>
                    <div style={{ width: "100%", height: 240 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" hide />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* TABLE */}
                <Card className="mb-3 shadow-sm">
                    <Card.Body>
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
                                        <th>Donor</th>
                                        <th>Fundraiser</th>
                                        <th>Amount</th>
                                        <th>Fee</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th style={{ width: 180 }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {donations.map((d) => (
                                        <tr key={d.d_uuid}>
                                            <td>
                                                <Button variant="link" size="sm" onClick={() => setSelectedDonation(d)}>
                                                    <FontAwesomeIcon icon={faUser} />{" "}
                                                    {d.donor?.uc_full_name || d.d_fk_uc_uuid || "Anonymous"}
                                                </Button>
                                            </td>

                                            <td>{d.fundraiser?.f_title || d.d_fk_f_uuid}</td>
                                            <td>${d.d_amount}</td>
                                            <td>${d.d_platform_fee ?? 0}</td>
                                            <td>{d.d_status}</td>
                                            <td>{new Date(d.createdAt).toLocaleString()}</td>

                                            <td>
                                                <Button size="sm" variant="success" className="me-2" onClick={() => handleMarkSafe(d.d_uuid)}>
                                                    <FontAwesomeIcon icon={faCheck} /> Safe
                                                </Button>

                                                <Button size="sm" variant="danger" onClick={() => handleMarkFraud(d.d_uuid)}>
                                                    <FontAwesomeIcon icon={faTimes} /> Fraud
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        {donations.length > 0 && (
                            <div className="d-flex justify-content-center mt-3">
                                <Pagination>
                                    {/* First Page */}
                                    <Pagination.First
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                    />

                                    {/* Previous Page */}
                                    <Pagination.Prev
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    />

                                    {/* Always show first page */}
                                    <Pagination.Item
                                        active={currentPage === 1}
                                        onClick={() => setCurrentPage(1)}
                                    >
                                        1
                                    </Pagination.Item>

                                    {/* Left Ellipsis */}
                                    {currentPage > 4 && <Pagination.Ellipsis disabled />}

                                    {/* Pages around current page */}
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        if (pageNum === 1 || pageNum === totalPages) return null;
                                        if (pageNum >= currentPage - 2 && pageNum <= currentPage + 2) {
                                            return (
                                                <Pagination.Item
                                                    key={pageNum}
                                                    active={currentPage === pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </Pagination.Item>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Right Ellipsis */}
                                    {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}

                                    {/* Always show last page */}
                                    {totalPages > 1 && (
                                        <Pagination.Item
                                            active={currentPage === totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                        >
                                            {totalPages}
                                        </Pagination.Item>
                                    )}

                                    {/* Next Page */}
                                    <Pagination.Next
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    />

                                    {/* Last Page */}
                                    <Pagination.Last
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                    />
                                </Pagination>

                            </div>
                        )}



                    </Card.Body>
                </Card>
            </Card>

            {/* MODAL */}
            <Modal show={!!selectedDonation} onHide={() => setSelectedDonation(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Donation Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedDonation && (
                        <>
                            <p>
                                <strong>Donation UUID:</strong> {selectedDonation.d_uuid}
                            </p>
                            <p>
                                <strong>Donor:</strong>{" "}
                                {selectedDonation.donor?.uc_full_name || selectedDonation.d_fk_uc_uuid}
                            </p>
                            <p>
                                <strong>Fundraiser:</strong>{" "}
                                {selectedDonation.fundraiser?.f_title || selectedDonation.d_fk_f_uuid}
                            </p>
                            <p>
                                <strong>Amount:</strong> ${selectedDonation.d_amount}
                            </p>
                            <p>
                                <strong>Platform fee:</strong> ${selectedDonation.d_platform_fee ?? 0}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedDonation.d_status}
                            </p>
                            <p>
                                <strong>Meta:</strong>{" "}
                                <pre style={{ whiteSpace: "pre-wrap" }}>
                                    {JSON.stringify(selectedDonation.d_meta || {}, null, 2)}
                                </pre>
                            </p>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedDonation(null)}>
                        Close
                    </Button>

                    <Button variant="success" onClick={() => handleMarkSafe(selectedDonation.d_uuid)} disabled={actionLoading}>
                        <FontAwesomeIcon icon={faCheck} /> Mark Safe
                    </Button>

                    <Button variant="danger" onClick={() => handleMarkFraud(selectedDonation.d_uuid)} disabled={actionLoading}>
                        <FontAwesomeIcon icon={faTimes} /> Mark Fraud
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* STYLES */}
            <style jsx="true">{`
        .dark-mode {
          background: #0f1724;
          color: #e6eef8;
        }
        .dark-mode .card {
          background: #0b1220;
        }
        .dark-mode table {
          color: #e6eef8;
        }
      `}</style>
        </div>
    );
}
