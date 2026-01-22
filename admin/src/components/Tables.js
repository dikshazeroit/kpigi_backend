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
import { faSearch, faUsers, faTrash, faEdit, faEye, faUserCheck, faUserTimes } from "@fortawesome/free-solid-svg-icons";
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
      console.log("Fetched users:", data);

      // Apply role filter
      if (role) {
        data = data.filter((u) => (u.uc_role || "").toLowerCase() === role.toLowerCase());
      }

      // Apply start date filter
      if (start) {
        data = data.filter((u) => u.uc_created_at?.substring(0, 10) >= start);
      }

      // Apply end date filter
      if (end) {
        data = data.filter((u) => u.uc_created_at?.substring(0, 10) <= end);
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

  // ================= EFFECTS =================
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [role, start, end, search]);

  // Fetch users whenever page or filters change
  useEffect(() => {
    fetchUsers();
  }, [page, search, role, start, end]);

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

  // ================= VIEW USER =================
  const handleViewUser = (user) => {
    const profileImg = user.uc_profile_photo
      ? Image_Url + user.uc_profile_photo
      : defaultProfileImg;

    Swal.fire({
      title: "User Details",
      html: `
        <div style="text-align:center; margin-bottom:15px;">
          <img src="${profileImg}" alt="User" style="
            width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid #ddd;"
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
      width: 550,
      showCancelButton: true,
      confirmButtonText: "Update User",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      background: "#ffffff",
      customClass: {
        popup: 'rounded-3'
      },

      html: `
        <style>
          .edit-user-form {
            text-align: left;
          }

          .edit-user-form label {
            font-size: 13px;
            font-weight: 600;
            margin: 10px 0 5px;
            display: block;
            color: #495057;
          }

          .edit-user-form input,
          .edit-user-form select,
          .edit-user-form textarea {
            width: 100%;
            padding: 10px 14px;
            font-size: 14px;
            border-radius: 8px;
            border: 1.5px solid #dee2e6;
            transition: all 0.2s;
            background: #f8f9fa;
          }

          .edit-user-form input:focus,
          .edit-user-form select:focus,
          .edit-user-form textarea:focus {
            border-color: #0d6efd;
            outline: none;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          }

          .edit-user-row {
            display: flex;
            gap: 15px;
            margin-bottom: 5px;
          }

          .edit-user-row div {
            flex: 1;
          }

          .edit-user-form textarea {
            min-height: 80px;
            resize: vertical;
          }

          .edit-user-switch {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
            padding: 12px;
            background: #e7f1ff;
            border-radius: 8px;
            font-size: 14px;
          }

          .edit-user-switch input {
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #0d6efd;
          }

          .form-section-title {
            font-size: 15px;
            font-weight: 700;
            color: #0d6efd;
            margin: 20px 0 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e9ecef;
          }
        </style>

        <div class="edit-user-form">
          <div class="form-section-title">Basic Information</div>
          
          <label>Full Name</label>
          <input id="swal-name" value="${user.uc_full_name || ""}" />

          <label>Email</label>
          <input id="swal-email" type="email" value="${user.uc_email || ""}" />

          <div class="form-section-title">Contact Details</div>
          
          <div class="edit-user-row">
            <div>
              <label>Country Code</label>
              <input id="swal-country" value="${user.uc_country_code || ""}" />
            </div>
            <div>
              <label>Phone</label>
              <input id="swal-phone" value="${user.uc_phone || ""}" />
            </div>
          </div>

          <div class="form-section-title">Additional Information</div>
          
          <label>Role</label>
          <select id="swal-role" class="form-select">
            <option value="DONOR" ${user.uc_role === "DONOR" ? "selected" : ""}>Donor</option>
            <option value="REQUESTER" ${user.uc_role === "REQUESTER" ? "selected" : ""}>Requester</option>
          </select>

          <label>Bio</label>
          <textarea id="swal-bio">${user.uc_bio || ""}</textarea>

          <div class="edit-user-switch">
            <input type="checkbox" id="swal-notify" ${user.uc_notifications_enabled ? "checked" : ""} />
            <label for="swal-notify" style="font-weight: 600;">Enable Notifications</label>
          </div>
        </div>
      `,

      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const email = document.getElementById("swal-email").value.trim();

        if (!name || !email) {
          Swal.showValidationMessage("Full name and email are required");
          return false;
        }

        return {
          uc_full_name: name,
          uc_email: email,
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
      Swal.fire({
        title: "Updated!",
        text: "User has been updated successfully.",
        icon: "success",
        background: "#f8f9fa",
        confirmButtonColor: "#0d6efd"
      });
      fetchUsers();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update user",
        "error"
      );
    }
  };


  return (
    <Card border="light" className="shadow-sm p-3">
      <Card.Header className="border-0 bg-white p-0 mb-4">
        <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faUsers} /> User List
        </h3>
      </Card.Header>

      <Card.Body>
        {/* ================= FILTERS ================= */}
        <div className="p-3 rounded bg-light mb-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Label className="fw-semibold">User Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
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
                placeholder="Start date"
              />
            </Col>

            <Col md={2}>
              <Form.Label className="fw-semibold">To</Form.Label>
              <Form.Control
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="End date"
              />
            </Col>
            <Col md={5}>
              <Form.Label className="fw-semibold">Search</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name ..."
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
            <div className="text-muted fw-semibold">Loading data, please wait...</div>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Sr.No.</th>
                  <th>Profile Photo</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Country Code</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="text-center">2FA Verification</th>

                  <th>Date Created</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <tr key={u._id}>
                      <td>{(page - 1) * limit + index + 1}</td>

                      <td className="text-center">
                        <img
                          src={u.uc_profile_photo ? Image_Url + u.uc_profile_photo : defaultProfileImg}
                          alt="profile"
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #ddd",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProfileImg;
                          }}
                        />
                      </td>

                      <td className="fw-semibold">{u.uc_full_name}</td>
                      <td>{u.uc_email}</td>
                      <td>{u.uc_country_code || "No Data Found"}</td>
                      <td>{u.uc_phone || "No Data Found"}</td>

                      <td style={{ padding: "15px" }}>
                        <Badge
                          className="px-3 py-2"
                          style={{
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: u.uc_role === "DONOR" ? "#d1e7dd" :
                              u.uc_role === "REQUESTER" ? "#cfe2ff" : "#e2e3e5",
                            color: u.uc_role === "DONOR" ? "#0f5132" :
                              u.uc_role === "REQUESTER" ? "#052c65" : "#41464b",
                            border: `1px solid ${u.uc_role === "DONOR" ? "#badbcc" :
                              u.uc_role === "REQUESTER" ? "#9ec5fe" : "#d3d6d8"}`
                          }}
                        >
                          {u.uc_role || "No Data"}
                        </Badge>
                      </td>

                      {/*  2FA Column */}

                      <td style={{ padding: "15px" }} className="text-center">
                        <Badge
                          bg={u.uc_is_2fa_enabled ? "success" : "danger"}
                          className="px-3 py-2"
                          style={{
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            minWidth: "85px"
                          }}
                        >
                          <FontAwesomeIcon
                            icon={u.uc_is_2fa_enabled ? faUserCheck : faUserTimes}
                            className="me-1"
                          />
                          {u.uc_is_2fa_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </td>

                      <td>{u.uc_created_at?.substring(0, 10) || "No Data Found"}</td>

                      <td className="text-center">
                        <Button variant="info" size="sm" className="me-2" onClick={() => handleViewUser(u)}>
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditUser(u)}>
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
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Pagination.Prev>
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Pagination.Next>
          </Pagination>
        )}
      </Card.Body>
    </Card>
  );
};