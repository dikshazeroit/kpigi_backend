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
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  getAllPayouts,
  approvePayout,
  rejectPayout,
  updatePayoutStatus,
} from "../api/ApiServices";

const PayoutManagement = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPayout, setSelectedPayout] = useState(null);

  // Fetch payouts
  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await getAllPayouts(currentPage, itemsPerPage, searchTerm);

      if (response.status) {
        setPayouts(response.payload || []);
      } else {
        setPayouts([]);
      }
    } catch (err) {
      console.error("Error fetching payouts:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayouts();
  }, [currentPage, searchTerm]);

  // Approve payout
  const handleApprove = async (p_uuid) => {
    try {
      await approvePayout({ p_uuid });
      fetchPayouts();
    } catch (err) {
      console.error("Error approving payout:", err);
    }
  };

  // Reject payout
  const handleReject = async () => {
    if (!selectedPayout) return;
    try {
      await rejectPayout({ p_uuid: selectedPayout.p_uuid, reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedPayout(null);
      fetchPayouts();
    } catch (err) {
      console.error("Error rejecting payout:", err);
    }
  };

  // Update payout status manually
  const handleUpdateStatus = async (p_uuid, status) => {
    try {
      await updatePayoutStatus({ p_uuid, status });
      fetchPayouts();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredPayouts = payouts.filter((p) =>
  p.userName?.toLowerCase().includes(searchTerm.toLowerCase())
);
const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
const paginatedPayouts = filteredPayouts.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  return (
    <div className="p-3">
      <Card className="mb-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 fw-bold">Manage Payouts</h5>
          <InputGroup style={{ width: "250px" }}>
            <FormControl
              placeholder="Search by user name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>
        </div>
      </Card>

      <Card className="p-3 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading payouts...</p>
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayouts.length > 0 ? (
                  paginatedPayouts.map((p, idx) => (
                    <tr key={p.p_uuid}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{p.userName}</td>
                      <td>{p.p_amount}</td>
                      <td>{p.p_fee}</td>
                      <td>{p.p_status}</td>
                      <td>{new Date(p.createdAt).toLocaleString()}</td>
                      <td>
                        {p.p_status !== "SENT" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleApprove(p.p_uuid)}
                            >
                              <FontAwesomeIcon icon={faCheck} /> Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setSelectedPayout(p);
                                setShowRejectModal(true);
                              }}
                            >
                              <FontAwesomeIcon icon={faTimes} /> Reject
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatus(p.p_uuid, "PENDING")}
                        >
                          Mark Pending
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No payouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center my-3">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Payout</Modal.Title>
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

export default PayoutManagement;
