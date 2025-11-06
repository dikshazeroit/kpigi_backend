import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Spinner
} from "@themesberg/react-bootstrap";

const WalletPage = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    balance: "",
    currency: "USD",
    status: "Active"
  });

  // Simulated API Fetch
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setWallets([
        {
          id: 1,
          user: "John Doe",
          balance: "500.00",
          currency: "USD",
          status: "Active"
        },
        {
          id: 2,
          user: "Jane Smith",
          balance: "250.50",
          currency: "USD",
          status: "Suspended"
        }
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  // Open Add Wallet Modal
  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ user: "", balance: "", currency: "USD", status: "Active" });
    setShowModal(true);
  };

  // Open Edit Wallet Modal
  const handleOpenEdit = (wallet) => {
    setEditMode(true);
    setCurrentId(wallet.id);
    setFormData({
      user: wallet.user,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status
    });
    setShowModal(true);
  };

  // Delete Wallet
  const handleDelete = (id) => {
    setWallets(wallets.filter((w) => w.id !== id));
  };

  return (
    <Row>
      <Col xs={12}>
        <Card border="light" className="shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>Wallet Management</h5>
            <Button variant="primary" onClick={handleOpenAdd}>
              Add Wallet
            </Button>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading wallets...</p>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Sr.No</th>
                    <th>User</th>
                    <th>Balance</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet, index) => (
                    <tr key={wallet.id}>
                      <td>{index + 1}</td>
                      <td>{wallet.user}</td>
                      <td>${wallet.balance}</td>
                      <td>{wallet.currency}</td>
                      <td>{wallet.status}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenEdit(wallet)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(wallet.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Add/Edit Wallet Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Wallet" : "Add Wallet"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter user name"
                value={formData.user}
                onChange={(e) =>
                  setFormData({ ...formData, user: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter wallet balance"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              >
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="EUR">EUR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            {editMode ? "Update Wallet" : "Save Wallet"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default WalletPage;
