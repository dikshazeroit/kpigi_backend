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
  Button,
} from "@themesberg/react-bootstrap";
import { getAllUsers, DeleteUserById, updateUser } from "../api/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUsers, faTrash, faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Image_Url } from "../api/ApiClient";



export const PageUserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const defaultProfileImg =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

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
        data = data.filter(
          (u) => u.uc_created_at?.substring(0, 10) >= start
        );
      }

      if (end) {
        data = data.filter(
          (u) => u.uc_created_at?.substring(0, 10) <= end
        );
      }

      setUsers(data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error loading users", err);
      Swal.fire("Error", "Failed to load users", "error");
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

  // ================= DELETE USER =================
  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await DeleteUserById(id);
      Swal.fire("Deleted!", "User has been deleted.", "success");
      fetchUsers();
    } catch (error) {
      console.error("Delete failed", error);
      Swal.fire("Error", "Failed to delete user", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewUser = (user) => {
    const profileImg = user.uc_profile_photo
      ? Image_Url + user.uc_profile_photo
      : defaultProfileImg;

    Swal.fire({
      title: "User Details",
      html: `
      <div style="text-align:center; margin-bottom:15px;">
        <img 
          src="${profileImg}"
          alt="User"
          style="
            width:120px;
            height:120px;
            border-radius:50%;
            object-fit:cover;
            border:3px solid #ddd;
          "
          onerror="this.src='${defaultProfileImg}'"
        />
      </div>

      <p><strong>Full Name:</strong> ${user.uc_full_name || "No Data Found"}</p>
      <p><strong>Email:</strong> ${user.uc_email || "No Data Found"}</p>
      <p><strong>Role:</strong> ${user.uc_role || "No Data Found"}</p>
      <p><strong>Phone:</strong> ${user.uc_phone || "No Data Found"}</p>
      <p><strong>Country Code:</strong> ${user.uc_country_code || "No Data Found"}</p>
      <p><strong>Bio:</strong> ${user.uc_bio || "No Data Found"}</p>
      <p><strong>Notifications Enabled:</strong> ${user.uc_notifications_enabled ? "Yes" : "No"}</p>
      <p><strong>Date Created:</strong> ${user.uc_created_at?.substring(0, 10) || "No Data Found"}</p>
    `,
      confirmButtonText: "Close",
    });
  };




  // ================= EDIT USER =================
  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit User",
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Full Name" value="${user.uc_full_name || ""}" />` +
        `<input id="swal-email" class="swal2-input" placeholder="Email" value="${user.uc_email || ""}" />` +
        `<select id="swal-role" class="swal2-input">
          <option value="DONOR" ${user.uc_role === "DONOR" ? "selected" : ""}>Donor</option>
          <option value="REQUESTER" ${user.uc_role === "REQUESTER" ? "selected" : ""}>Requester</option>
        </select>` +
        `<input id="swal-phone" class="swal2-input" placeholder="Phone" value="${user.uc_phone || ""}" />` +
        `<input id="swal-country" class="swal2-input" placeholder="Country Code" value="${user.uc_country_code || ""}" />` +
        `<textarea id="swal-bio" class="swal2-textarea" placeholder="Bio">${user.uc_bio || ""}</textarea>` +
        `<div class="swal2-checkbox">
            <input type="checkbox" id="swal-notify" ${user.uc_notifications_enabled ? "checked" : ""} />
            <label for="swal-notify">Enable Notifications</label>
         </div>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          uc_full_name: document.getElementById("swal-name").value,
          uc_email: document.getElementById("swal-email").value,
          uc_role: document.getElementById("swal-role").value,
          uc_phone: document.getElementById("swal-phone").value,
          uc_country_code: document.getElementById("swal-country").value,
          uc_bio: document.getElementById("swal-bio").value,
          uc_notifications_enabled: document.getElementById("swal-notify").checked,
        };
      },
    });

    if (!formValues) return;

    try {
      await updateUser(user._id, formValues);
      Swal.fire("Updated!", "User has been updated.", "success");
      fetchUsers();
    } catch (error) {
      console.error("Update failed", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to update user", "error");
    }
  };

  return (
    <Card border="light" className="shadow-sm p-3">
      <Card.Header className="border-0 bg-white p-0 mb-4">
        <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faUsers} />
          User List
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
                  <th>profile photo</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>country code</th>
                  <th>phone</th>
                  <th>Role</th>
                  <th>Date Created</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <tr key={u._id}>
                      {/* Sr.No */}
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td className="text-center">
                        <img
                          src={
                            u.uc_profile_photo
                              ? Image_Url + u.uc_profile_photo
                              : defaultProfileImg
                          }
                          alt="profile"
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #ddd"
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfileImg;
                          }}
                        />
                      </td>
                      {/* User Name */}
                      <td className="fw-semibold">{u.uc_full_name}</td>

                      {/* Email */}
                      <td>{u.uc_email}</td>

                      {/* Country Code */}
                      <td>{u.uc_country_code || "No Data Found"}</td>

                      {/* Phone */}
                      <td>{u.uc_phone || "No Data Found"}</td>

                      {/* Role */}
                      <td>
                        <Badge
                          bg={
                            u.uc_role === "DONOR"
                              ? "success"
                              : u.uc_role === "REQUESTER"
                                ? "info"
                                : "secondary"
                          }
                        >
                          {u.uc_role || "No Data Found"}
                        </Badge>
                      </td>

                      {/* Date Created */}
                      <td>{u.uc_created_at?.substring(0, 10) || "No Data Found"}</td>

                      {/* Actions */}

                      <td className="text-center">
                        {/* View Button */}
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewUser(u)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>

                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditUser(u)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          disabled={deletingId === u._id}
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          {deletingId === u._id ? <Spinner size="sm" /> : <FontAwesomeIcon icon={faTrash} />}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <strong className="text-muted">No Users Found</strong>
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
            >
              Prev
            </Pagination.Prev>

            {/* Current Page */}
            <Pagination.Item active className="mx-2">
              {page}
            </Pagination.Item>

            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Pagination.Next>
          </Pagination>
        )}
      </Card.Body>
    </Card>
  );
};
