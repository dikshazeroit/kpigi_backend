import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
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

  // Simulate API fetch
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPayouts([
        { id: 1, user: "John Doe", amount: "$100", date: "06/08/2025", status: "Paid" },
        { id: 2, user: "Jane Smith", amount: "$150", date: "06/08/2025", status: "Pending" },
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

  return (
    <div className="p-3">
      <Card className="mb-4 p-3 d-flex flex-row justify-content-between align-items-center">
        <h5 className="mb-0">Manage Payouts</h5>
        <Button variant="primary" onClick={handleOpenAdd}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Payout
        </Button>
      </Card>

      <Card className="p-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading payouts...</p>
          </div>
        ) : (
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
              {payouts.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
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
              ))}
            </tbody>
          </Table>
        )}
      </Card>

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
