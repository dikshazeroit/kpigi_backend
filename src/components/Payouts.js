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
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    amount: "",
    date: "",
    status: "",
  });

  const [searchTerm, setSearchTerm] = useState(""); // Search term

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Simulate API fetch
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPayouts([
        { id: 1, user: "John Doe", amount: "$100", date: "2025-06-08", status: "Paid" },
        { id: 2, user: "Jane Smith", amount: "$150", date: "2025-06-08", status: "Pending" },
        { id: 3, user: "Michael Lee", amount: "$200", date: "2025-06-09", status: "Paid" },
        { id: 4, user: "Sarah Johnson", amount: "$120", date: "2025-06-09", status: "Pending" },
        { id: 5, user: "Alice Brown", amount: "$250", date: "2025-06-10", status: "Paid" },
        { id: 6, user: "David Wilson", amount: "$175", date: "2025-06-10", status: "Pending" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ user: "", amount: "", date: "", status: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (payout) => {
    setEditMode(true);
    setCurrentId(payout.id);
    setFormData({ ...payout });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPayouts(payouts.filter((p) => p.id !== id));
    if ((currentPage - 1) * itemsPerPage >= payouts.length - 1) {
      setCurrentPage(Math.max(1, currentPage - 1));
    }
  };

  const handleSave = () => {
    if (editMode) {
      setPayouts(
        payouts.map((p) => (p.id === currentId ? { ...p, ...formData } : p))
      );
    } else {
      setPayouts([...payouts, { id: payouts.length + 1, ...formData }]);
    }
    setShowModal(false);
  };

  // Filter payouts based on search term
  const filteredPayouts = payouts.filter((p) =>
    p.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-3">
      {/* Header with Search Bar on Right */}
      <Card className="mb-4 p-3 d-flex flex-row justify-content-between align-items-center shadow-sm">
        <h5 className="mb-0">Manage Payouts</h5>
        <div className="d-flex align-items-center">
          {/* Search Bar */}
          <InputGroup className="me-2">
            <FormControl
              placeholder="Search by user"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </InputGroup>
          {/* Add Button */}
          <Button variant="primary" onClick={handleOpenAdd}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Payout
          </Button>
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
                  <th>User</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayouts.length > 0 ? (
                  paginatedPayouts.map((p, idx) => (
                    <tr key={p.id}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{p.user}</td>
                      <td>{p.amount}</td>
                      <td>{p.date}</td>
                      <td>{p.status}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No payouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center my-3">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}

            <div className="text-center text-muted small">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredPayouts.length)} of{" "}
              {filteredPayouts.length}
            </div>
          </>
        )}
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Payout" : "Add Payout"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control
                type="text"
                value={formData.user}
                onChange={(e) =>
                  setFormData({ ...formData, user: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="text"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editMode ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PayoutsPage;
