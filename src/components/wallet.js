import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Badge,
  Card,
  Pagination,
  InputGroup,
  FormControl,
} from "@themesberg/react-bootstrap";

const WalletPage = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    balance: "",
    currency: "USD",
    status: "Active",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCurrency, setFilterCurrency] = useState("All");

  // Simulated API fetch
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setWallets([
        { id: 1, user: "John Doe", balance: "500.00", currency: "USD", status: "Active", lastTransaction: "2025-11-05" },
        { id: 2, user: "Jane Smith", balance: "250.50", currency: "USD", status: "Suspended", lastTransaction: "2025-11-03" },
        { id: 3, user: "Alice Brown", balance: "1000.00", currency: "USD", status: "Active", lastTransaction: "2025-10-31" },
        { id: 4, user: "David Johnson", balance: "120.75", currency: "USD", status: "Closed", lastTransaction: "2025-10-25" },
        { id: 5, user: "Michael Lee", balance: "600.00", currency: "USD", status: "Active", lastTransaction: "2025-10-28" },
        { id: 6, user: "Emily Davis", balance: "330.45", currency: "USD", status: "Active", lastTransaction: "2025-11-06" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Handlers
  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({ user: "", balance: "", currency: "USD", status: "Active" });
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

  const handleDelete = (id) => {
    setWallets(wallets.filter((wallet) => wallet.id !== id));
    if ((currentPage - 1) * itemsPerPage >= wallets.length - 1) {
      setCurrentPage(Math.max(1, currentPage - 1));
    }
  };

  const statusVariant = {
    Active: "success",
    Suspended: "warning",
    Closed: "secondary",
  };

  // Filter wallets
  const filteredWallets = wallets.filter((wallet) => {
    const matchesSearch = wallet.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || wallet.status === filterStatus;
    const matchesCurrency = filterCurrency === "All" || wallet.currency === filterCurrency;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const paginatedWallets = filteredWallets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      {/* Page Title */}
      <h4 className="fw-bold mb-3">Wallet Management</h4>

      {/* Header Card */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="fw-bold mb-0">All Wallets</h6>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <InputGroup style={{ width: "250px" }}>
              <FormControl
                placeholder="🔍 Search wallets..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>

            <Form.Select
              style={{ width: "160px" }}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Closed">Closed</option>
            </Form.Select>

            <Form.Select
              style={{ width: "160px" }}
              value={filterCurrency}
              onChange={(e) => {
                setFilterCurrency(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
              <option value="USDC">USDC</option>
            </Form.Select>

            <Button variant="primary" onClick={handleShow}>
              + Add Wallet
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Wallet Table */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading wallets...</p>
            </div>
          ) : (
            <>
              <Table responsive hover bordered className="align-middle">
                <thead className="bg-light">
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
                  {paginatedWallets.length > 0 ? (
                    paginatedWallets.map((wallet, index) => (
                      <tr key={wallet.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No wallets found.
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
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
                {Math.min(currentPage * itemsPerPage, filteredWallets.length)} of{" "}
                {filteredWallets.length}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Wallet" : "Add New Wallet"}</Modal.Title>
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
