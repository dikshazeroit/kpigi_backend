import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Badge,
  Card,
} from "@themesberg/react-bootstrap";

// ====== WalletPage Component ======
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
    status: "Active",
  });

  // ====== Simulated API Fetch ======
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setWallets([
        {
          id: 1,
          user: "John Doe",
          balance: "500.00",
          currency: "USD",
          status: "Active",
          lastTransaction: "2025-11-05",
        },
        {
          id: 2,
          user: "Jane Smith",
          balance: "250.50",
          currency: "USD",
          status: "Suspended",
          lastTransaction: "2025-11-03",
        },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  // ====== Handlers ======
  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({
      user: "",
      balance: "",
      currency: "USD",
      status: "Active",
    });
  };

  const handleShow = () => setShowModal(true);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editMode) {
      setWallets(
        wallets.map((wallet) =>
          wallet.id === currentId ? { ...wallet, ...formData } : wallet
        )
      );
    } else {
      const newWallet = {
        id: wallets.length + 1,
        ...formData,
        lastTransaction: new Date().toISOString().slice(0, 10),
      };
      setWallets([...wallets, newWallet]);
    }

    handleClose();
  };

  const handleEdit = (wallet) => {
    setFormData(wallet);
    setEditMode(true);
    setCurrentId(wallet.id);
    setShowModal(true);
  };

  const handleDelete = (id) =>
    setWallets(wallets.filter((wallet) => wallet.id !== id));

  const statusVariant = {
    Active: "success",
    Suspended: "warning",
    Closed: "secondary",
  };

  // ====== UI ======
  return (
    <div className="p-4">
      <h4 className="mb-3">Wallet Management</h4>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">All Wallets</h6>
          <Button size="sm" variant="primary" onClick={handleShow}>
            + Add Wallet
          </Button>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading wallets...</p>
          </div>
        ) : (
          <Table responsive bordered hover className="align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Balance</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Last Transaction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet, index) => (
                <tr key={wallet.id}>
                  <td>{index + 1}</td>
                  <td>{wallet.user}</td>
                  <td>${parseFloat(wallet.balance).toFixed(2)}</td>
                  <td>{wallet.currency}</td>
                  <td>
                    <Badge bg={statusVariant[wallet.status]}>
                      {wallet.status}
                    </Badge>
                  </td>
                  <td>{wallet.lastTransaction}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => handleEdit(wallet)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
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
      </Card>

      {/* ===== Modal Form ===== */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Edit Wallet" : "Add New Wallet"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control
                type="text"
                name="user"
                value={formData.user}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="USDC">USDC</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Suspended</option>
                <option>Closed</option>
              </Form.Select>
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" className="me-2" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? "Save Changes" : "Add Wallet"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WalletPage;
