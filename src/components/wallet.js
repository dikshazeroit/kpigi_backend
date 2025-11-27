import React, { useState, useEffect } from "react";
import { Card, Button, Form, Modal, Table, InputGroup, FormControl, Badge, Pagination, Row, Col } from "@themesberg/react-bootstrap";

export default function WalletPageWrapper() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWalletId, setCurrentWalletId] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    balance: "",
    currency: "USD",
    status: "Active",
    cardLast4: "1234",
  });

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCurrency, setFilterCurrency] = useState("All");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setWallets([
        { id: 1, user: "John Doe", balance: 500.0, currency: "USD", status: "Active", lastTransaction: "2025-11-05", cardLast4: "4321" },
        { id: 2, user: "Jane Smith", balance: 250.5, currency: "USD", status: "Suspended", lastTransaction: "2025-11-03", cardLast4: "9876" },
        { id: 3, user: "Alice Brown", balance: 1000.0, currency: "USD", status: "Active", lastTransaction: "2025-10-31", cardLast4: "1111" },
        { id: 4, user: "David Lee", balance: 600, currency: "NGN", status: "Closed", lastTransaction: "2025-10-20", cardLast4: "5555" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Modal handlers
  const handleShowModal = (wallet = null) => {
    if (wallet) {
      setFormData(wallet);
      setEditMode(true);
      setCurrentWalletId(wallet.id);
    } else {
      setFormData({ user: "", balance: "", currency: "USD", status: "Active", cardLast4: "1234" });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setFormData({ user: "", balance: "", currency: "USD", status: "Active", cardLast4: "1234" });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      setWallets(wallets.map((w) => (w.id === currentWalletId ? { ...formData } : w)));
    } else {
      const newWallet = { ...formData, id: wallets.length + 1, lastTransaction: new Date().toISOString().slice(0, 10) };
      setWallets([...wallets, newWallet]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => setWallets(wallets.filter((w) => w.id !== id));

  const statusVariant = { Active: "success", Suspended: "warning", Closed: "secondary" };

  // Filter + search
  const filteredWallets = wallets.filter((w) => {
    const matchesSearch = w.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || w.status === filterStatus;
    const matchesCurrency = filterCurrency === "All" || w.currency === filterCurrency;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);
  const paginatedWallets = filteredWallets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4">
      {/* Wallet Overview */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          {wallets[0] && (
            <div>
              <h5>Current Balance: ${wallets[0].balance.toFixed(2)}</h5>
              <p>Linked Card: **** {wallets[0].cardLast4}</p>
              <small className="text-muted">Donations are sent instantly minus 2.8% platform fee</small>
            </div>
          )}
         
        </Card.Body>
      </Card>

      {/* Filters & Search */}
      <Row className="mb-3 g-2 align-items-center">
        <Col xs="auto">
          <Form.Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Closed">Closed</option>
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Form.Select value={filterCurrency} onChange={(e) => { setFilterCurrency(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Currencies</option>
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="USDC">USDC</option>
          </Form.Select>
        </Col>
        <Col xs="auto" className="ms-auto">
          <InputGroup style={{ width: "250px" }}>
            <FormControl
              placeholder="🔍 Search wallets..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={() => handleShowModal()}>
            + Add Wallet
          </Button>
        </Col>
      </Row>

      {/* Wallet Table */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <span className="spinner-border" role="status" />
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
                  {paginatedWallets.length > 0 ? paginatedWallets.map((wallet, index) => (
                    <tr key={wallet.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{wallet.user}</td>
                      <td>${wallet.balance.toFixed(2)}</td>
                      <td>{wallet.currency}</td>
                      <td><Badge bg={statusVariant[wallet.status]}>{wallet.status}</Badge></td>
                      <td>{wallet.lastTransaction}</td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleShowModal(wallet)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(wallet.id)}>Delete</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="text-center">No wallets found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center my-3">
                  <Pagination>
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} />
                    {[...Array(totalPages)].map((_,idx) => (
                      <Pagination.Item key={idx} active={idx+1===currentPage} onClick={()=>setCurrentPage(idx+1)}>{idx+1}</Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} />
                    <Pagination.Last onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Wallet Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Wallet" : "Add New Wallet"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control type="text" name="user" value={formData.user} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Balance</Form.Label>
              <Form.Control type="number" step="0.01" name="balance" value={formData.balance} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Select name="currency" value={formData.currency} onChange={handleChange}>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="USDC">USDC</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option>Active</option>
                <option>Suspended</option>
                <option>Closed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Card Last 4 Digits</Form.Label>
              <Form.Control type="text" name="cardLast4" value={formData.cardLast4} onChange={handleChange} required />
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" type="submit">{editMode ? "Save Changes" : "Add Wallet"}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
