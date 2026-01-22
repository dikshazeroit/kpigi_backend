import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Pagination,
  InputGroup,
  FormControl,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faSearch, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import {
  getAllwithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
} from "../api/ApiServices";

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // ================= FETCH WITHDRAWALS =================
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await getAllwithdrawal();
      if (response.status) {
        setWithdrawals(response.payload || []);
      } else {
        setWithdrawals([]);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setWithdrawals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // ================= APPROVE WITHDRAWAL =================
  // ================= APPROVE WITHDRAWAL =================
  const handleApprove = async (w_uuid) => {
    console.log("Approving withdrawal:", w_uuid);

    try {
      const res = await approveWithdrawal(w_uuid);
      console.log("API response:", res);

      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: res.message || "Withdrawal approved successfully and email sent.",
          timer: 2500,
          showConfirmButton: false,
        });

        fetchWithdrawals();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res.message || "Something went wrong.",
        });
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to approve withdrawal",
      });
    }
  };

  // ================= REJECT WITHDRAWAL =================
  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    if (!rejectReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please enter a reason for rejection!",
      });
      return;
    }

    try {
      const res = await rejectWithdrawal(selectedWithdrawal.w_uuid, rejectReason);

      Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: res.message || "Withdrawal rejected successfully and email sent.",
        timer: 2500,
        showConfirmButton: false,
      });

      setShowRejectModal(false);
      setRejectReason("");
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to reject withdrawal",
      });
    }
  };

  // ================= PAGINATION & SEARCH =================
  const filteredWithdrawals = withdrawals.filter((w) =>
    w.w_account_holder_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);

  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge bg="warning">{status}</Badge>;
      case "PROCESSING":
        return <Badge bg="info">{status}</Badge>;
      case "COMPLETED":
        return <Badge bg="success">{status}</Badge>;
      case "REJECTED":
        return <Badge bg="danger">{status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-3">
      {/* ================= HEADER ================= */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faDollarSign} style={{ fontSize: "1.8rem" }} />
            <h5 className="mb-0 fw-bold">Manage Withdrawals</h5>
          </div>
          <InputGroup style={{ width: "250px" }}>
            <FormControl
              type="text"
              placeholder="Search by account holder..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>
        </Card.Header>
      </Card>

      {/* ================= TABLE ================= */}
      <Card className="p-3 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="text-muted fw-semibold">Loading data, please wait...</div>
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Account Holder</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Account Number</th>
                  <th>IFSC</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWithdrawals.length > 0 ? (
                  paginatedWithdrawals.map((w, idx) => (
                    <tr key={w.w_uuid}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{w.w_account_holder_name || "No Data Found"}</td>
                      <td>{w.user?.uc_email || "No Data Found"}</td>
                      <td>${w.w_amount}</td>
                      <td>{w.w_account_number}</td>
                      <td>{w.w_ifsc_code}</td>
                      <td>{getStatusBadge(w.w_status)}</td>
                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td>
                        {(w.w_status === "PENDING" || w.w_status === "PROCESSING") && (
                          <>
                            {w.w_status !== "COMPLETED" && w.w_status !== "REJECTED" && (
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleApprove(w.w_uuid)}
                              >
                                <FontAwesomeIcon icon={faCheck} /> Approve
                              </Button>
                            )}

                            {w.w_status === "PENDING" && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setRejectReason("");
                                  setShowRejectModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTimes} /> Reject
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No withdrawals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* ================= PAGINATION ================= */}
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
      </Card>

      {/* ================= REJECT MODAL ================= */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WithdrawalManagement;
