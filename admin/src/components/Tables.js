import React, { useState, useEffect } from "react";
import { Card, Table, Form, Row, Col, Pagination } from "@themesberg/react-bootstrap";
import { getAllUsers } from "../api/ApiServices";

export const PageUserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(""); // requester / donor
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchUsers = async () => {
    try {
      const params = { page, limit, search };
      const res = await getAllUsers(params);

      let data = res.payload || [];

      // ⭐ Filter: requester / donor
      if (role) {
        data = data.filter((u) => (u.uc_role || "").toLowerCase() === role.toLowerCase());
      }

      // ⭐ Filter: date range
      if (start) {
        data = data.filter((u) => u.uc_created_at?.substring(0, 10) >= start);
      }

      if (end) {
        data = data.filter((u) => u.uc_created_at?.substring(0, 10) <= end);
      }

      // ⭐ Search (name or email)
      if (search) {
        data = data.filter(
          (u) =>
            u.uc_full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.uc_email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setUsers(data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error("Error loading users", error);
    }
  };

  // Load users when page or search changes
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // Reload when filters change
  useEffect(() => {
    setPage(1);
    fetchUsers();
  }, [role, start, end]);

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header>
        <h5 className="mb-0">User List</h5>
      </Card.Header>

      <Card.Body>

        {/* Filters */}
        <Row className="mb-3 align-items-end">

          {/* User Role filter */}
          <Col md={3}>
            <Form.Group>
              <Form.Label>User Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">All</option>
                <option value="requester">Requester</option>
                <option value="donor">Donor</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Date from */}
          <Col md={2}>
            <Form.Group>
              <Form.Label>From</Form.Label>
              <Form.Control
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Date to */}
          <Col md={2}>
            <Form.Group>
              <Form.Label>To</Form.Label>
              <Form.Control
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Search */}
          <Col md={5}>
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* USERS TABLE */}
        <Table hover responsive>
          <thead className="thead-light">
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
                  <td>{index + 1}</td>
                  <td>{u.uc_full_name}</td>
                  <td>{u.uc_email}</td>

                  {/* uc_role (requester / donor) */}
                  <td className="text-capitalize">{u.uc_role || "N/A"}</td>

                  {/* Date */}
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

        {/* Pagination */}
        <Pagination className="d-flex justify-content-end">
          <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
          <Pagination.Item active>{page}</Pagination.Item>
          <Pagination.Next
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          />
        </Pagination>

      </Card.Body>
    </Card>
  );
};
