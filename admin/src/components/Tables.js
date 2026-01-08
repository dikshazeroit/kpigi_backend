import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Form,
  Row,
  Col,
  Pagination,
  Spinner,
  Badge,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { getAllUsers } from "../api/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUsers } from "@fortawesome/free-solid-svg-icons";

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
      const res = await getAllUsers(page, limit, search);

      let data = res.payload || [];

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

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [role, start, end]);

  return (
    <Card border="light" className="shadow-sm p-3">
      <Card.Header className="border-0 bg-white p-0 mb-4">
        <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faUsers} />
          User-List
        </h3>
      </Card.Header>

      <Card.Body>
        {/* ================= FILTERS ================= */}
        <div className="p-3 rounded bg-light mb-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Label className="fw-semibold">User Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">All</option>
                <option value="requester">Requester</option>
                <option value="donor">Donor</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label className="fw-semibold">From</Form.Label>
              <Form.Control
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Col>

            <Col md={2}>
              <Form.Label className="fw-semibold">To</Form.Label>
              <Form.Control
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Col>

            <Col md={5}>
              <Form.Label className="fw-semibold">Search</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </div>

        {/* ================= TABLE ================= */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <div className="text-muted fw-semibold">
              Loading data, please wait...
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Sr.No.</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <tr key={u._id} className="table-row-hover">
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td className="fw-semibold">{u.uc_full_name}</td>
                      <td>{u.uc_email}</td>

                      <td>
                        <Badge
                          bg={
                            u.uc_role === "donor"
                              ? "success"
                              : u.uc_role === "requester"
                                ? "info"
                                : "secondary"
                          }
                        >
                          {u.uc_role || "N/A"}
                        </Badge>
                      </td>

                      <td>{u.uc_created_at?.substring(0, 10)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="text-muted">
                        <strong>No Users Found</strong>
                        <br />
                        Try adjusting your filters or search keywords.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <Pagination className="justify-content-end mt-3">
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
