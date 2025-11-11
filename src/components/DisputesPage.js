import React, { useState, useEffect } from "react";
import { Card, Table, Form, Pagination, Spinner, Breadcrumb } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"; // for internal routing

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All, Open, Resolved, Pending
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDisputes([
        { id: 1, user: "John Doe", issue: "Payment not received", status: "Open" },
        { id: 2, user: "Jane Smith", issue: "Refund request", status: "Resolved" },
        { id: 3, user: "Mark Wilson", issue: "Account locked", status: "Pending" },
        { id: 4, user: "Alice Brown", issue: "Unauthorized charge", status: "Open" },
        { id: 5, user: "Michael Green", issue: "Double payment", status: "Resolved" },
        { id: 6, user: "Laura Clark", issue: "Missing payout", status: "Pending" },
        { id: 7, user: "Chris Evans", issue: "Refund delay", status: "Open" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      d.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const paginatedDisputes = filteredDisputes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-3">
      {/* Breadcrumb with clickable Home */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Breadcrumb className="mb-0">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
            <FontAwesomeIcon icon={faHome} className="me-1" /> Home
          </Breadcrumb.Item>
          <Breadcrumb.Item active style={{ color: "#66799e" }}>
            Disputes Management
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Card className="p-3 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading disputes...</p>
          </div>
        ) : (
          <>
            {/* Header row: title left, search/filter right in one row */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <h5 className="mb-2 mb-md-0">Disputes & Support</h5>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search by user or issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "250px" }}
                />
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: "150px" }}
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Pending">Pending</option>
                </Form.Select>
              </div>
            </div>

            {/* Table */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDisputes.length > 0 ? (
                  paginatedDisputes.map((d, idx) => (
                    <tr key={d.id}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{d.user}</td>
                      <td>{d.issue}</td>
                      <td>
                        <span
                          className={`badge ${
                            d.status === "Open"
                              ? "bg-warning text-dark"
                              : d.status === "Resolved"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No disputes found.
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
          </>
        )}
      </Card>
    </div>
  );
};

export default DisputesPage;
