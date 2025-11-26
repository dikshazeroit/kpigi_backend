import React, { useState, useMemo } from "react";
import { Card, Table, Form, Row, Col, Pagination } from "@themesberg/react-bootstrap";

export const PageUserTable = () => {
  // Memoize data so it doesn't change on every render
  const data = useMemo(() => [
    { id: 1, name: "Rohan Sharma", email: "rohan@gmail.com", role: "requester", created: "2025-01-12" },
    { id: 2, name: "Neha Verma", email: "neha@gmail.com", role: "donor", created: "2025-02-03" },
    { id: 3, name: "Mohit Singh", email: "mohit@gmail.com", role: "requester", created: "2025-02-15" },
    { id: 4, name: "Aditi Rao", email: "aditi@gmail.com", role: "donor", created: "2025-03-02" },
    { id: 5, name: "Karan Patel", email: "karan@gmail.com", role: "requester", created: "2025-03-10" },
    { id: 6, name: "Priya Pandit", email: "priya@gmail.com", role: "donor", created: "2025-03-12" },
    { id: 7, name: "Aman Gupta", email: "aman@gmail.com", role: "requester", created: "2025-03-20" },
    { id: 8, name: "Simran Kaur", email: "simran@gmail.com", role: "donor", created: "2025-03-25" },
  ], []); // ✅ stable across renders

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  // Filter data based on search, role, and date range
  const filtered = useMemo(() => {
    return data
      .filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
      .filter((u) => (role ? u.role === role : true))
      .filter((u) => {
        if (start && u.created < start) return false;
        if (end && u.created > end) return false;
        return true;
      });
  }, [data, search, role, start, end]); // ✅ data is stable, dependencies correct

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const currentData = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [search, role, start, end]);

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header>
        <h5 className="mb-0">User List</h5>
      </Card.Header>

      <Card.Body>
        {/* Filters Row */}
        <Row className="mb-3 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">All</option>
                <option value="requester">Requester</option>
                <option value="donor">Donor</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>From</Form.Label>
              <Form.Control type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>To</Form.Label>
              <Form.Control type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Form.Group>
          </Col>

          <Col md={5} className="text-end">
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search name / email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Table */}
        <Table hover responsive>
          <thead className="thead-light">
            <tr>
              <th>#ID</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Date Created</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="text-capitalize">{u.role}</td>
                  <td>{u.created}</td>
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
          <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
        </Pagination>
      </Card.Body>
    </Card>
  );
};
