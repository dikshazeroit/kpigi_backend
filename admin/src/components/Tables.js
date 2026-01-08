import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Form,
  Row,
  Col,
  Pagination,
  Spinner,
} from "@themesberg/react-bootstrap";
import { getAllUsers } from "../api/ApiServices";

export const PageUserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // ✅ CORRECT FUNCTION CALL
      const res = await getAllUsers(page, limit, search);

      let data = res.payload || [];

      // Optional frontend filters
      if (role) {
        data = data.filter(
          (u) => (u.uc_role || "").toLowerCase() === role.toLowerCase()
        );
      }

      if (start) {
        data = data.filter((u) => u.uc_created_at?.substring(0, 10) >= start);
      }

      if (end) {
        data = data.filter((u) => u.uc_created_at?.substring(0, 10) <= end);
      }

      setUsers(data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  // Load on page/search
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // Reset page on filters
  useEffect(() => {
    setPage(1);
  }, [role, start, end]);

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header>
        <h5 className="mb-0">User List</h5>
      </Card.Header>

      <Card.Body>
        {/* ================= FILTERS ================= */}
        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>User Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All</option>
              <option value="requester">Requester</option>
              <option value="donor">Donor</option>
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>From</Form.Label>
            <Form.Control
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Col>

          <Col md={2}>
            <Form.Label>To</Form.Label>
            <Form.Control
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Col>

          <Col md={5}>
            <Form.Label>Search</Form.Label>
            <Form.Control
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>

        {/* ================= TABLE ================= */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u, index) => (
                  <tr key={u._id}>
                    <td>{(page - 1) * limit + index + 1}</td>
                    <td>{u.uc_full_name}</td>
                    <td>{u.uc_email}</td>
                    <td className="text-capitalize">{u.uc_role || "N/A"}</td>
                    <td>{u.uc_created_at?.substring(0, 10)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    No Users Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <Pagination className="justify-content-end">

            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            />

            {(() => {
              const visiblePages = 5;
              let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
              let endPage = startPage + visiblePages - 1;

              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - visiblePages + 1);
              }

              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Pagination.Item
                    key={i}
                    active={page === i}
                    onClick={() => setPage(i)}
                  >
                    {i}
                  </Pagination.Item>
                );
              }
              return pages;
            })()}

            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            />
          </Pagination>
        )}
      </Card.Body>
    </Card>
  );
};
