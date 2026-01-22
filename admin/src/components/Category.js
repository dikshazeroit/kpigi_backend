// Category.jsx
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Spinner,
  InputGroup,
  Pagination,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../api/ApiServices";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);


  const [form, setForm] = useState({
    c_name: "",
    c_description: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      console.log("Fetched Categories:", res.data);
      setCategories(res.data || []);
      setFiltered(res.data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories on search
  useEffect(() => {
    const s = search.toLowerCase();
    const filteredData = categories.filter((c) =>
      c.c_name.toLowerCase().includes(s)
    );
    setFiltered(filteredData);
    setCurrentPage(1); // reset to first page on search
  }, [search, categories]);

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);


  const handleSubmit = async () => {
    if (!form.c_name.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Category name required",
        text: "Please enter a category name.",
      });
    }

    if (saving) return;
    setSaving(true);

    try {
      if (editData) {
        await updateCategory({ c_uuid: editData.c_uuid, ...form });
        Swal.fire({
          icon: "success",
          title: "Category Updated",
          text: `"${form.c_name}" has been updated successfully.`,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        await createCategory(form);
        Swal.fire({
          icon: "success",
          title: "Category Added",
          text: "New category created successfully!",
          timer: 1800,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditData(null);
      setForm({ c_name: "", c_description: "" });
      fetchCategories();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to save category.",
      });
    } finally {
      setSaving(false);
    }
  };


  // Toggle category status
  const handleStatus = async (cat) => {
    await toggleCategoryStatus({
      c_uuid: cat.c_uuid,
      c_status: cat.c_status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
    fetchCategories();
  };

  // Delete category
  const handleDelete = async (cat) => {
    if (cat.c_is_default) {
      return Swal.fire({
        icon: "info",
        title: "Not Allowed",
        text: "Default category cannot be deleted.",
      });
    }

    const result = await Swal.fire({
      title: `Delete "${cat.c_name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(cat.c_uuid);
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: `"${cat.c_name}" has been deleted.`,
          timer: 1800,
          showConfirmButton: false,
        });
        fetchCategories();
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Unable to delete category.",
        });
      }
    }
  };

  return (
    <div>
      <Card border="light" className="shadow-sm">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={faClipboardList} className="me-2" />
            Category Management
          </h4>

          <Button
            variant="primary"
            onClick={() => {
              setEditData(null);
              setForm({ c_name: "", c_description: "" });
              setShowModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Category
          </Button>
        </div>

        {/* SEARCH */}
        <Card.Body>
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <InputGroup style={{ maxWidth: "280px" }}>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by category name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* TABLE */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="text-muted fw-semibold">
                Loading data, please wait...
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h6>No categories found</h6>
              <small>Add a new category to get started</small>
            </div>
          ) : (
            <>
              <Table responsive hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Sr. No.</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((cat, index) => (
                    <tr key={cat.c_uuid}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        <strong>{cat.c_name}</strong>{" "}
                        {cat.c_is_default && (
                          <Badge bg="info" className="ms-2">
                            Default
                          </Badge>
                        )}
                      </td>
                      <td className="text-muted">{cat.c_description || "-"}</td>
                      <td>
                        <Form.Check
                          type="switch"
                          checked={cat.c_status === "ACTIVE"}
                          onChange={() => handleStatus(cat)}
                          label={
                            <Badge
                              bg={
                                cat.c_status === "ACTIVE" ? "success" : "secondary"
                              }
                            >
                              {cat.c_status}
                            </Badge>
                          }
                        />
                      </td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="blue"
                          className="me-2"
                          onClick={() => {
                            setEditData(cat);
                            setForm({
                              c_name: cat.c_name,
                              c_description: cat.c_description,
                            });
                            setShowModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-white" />
                        </Button>

                        {!cat.c_is_default && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(cat)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-white" />
                          </Button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* PAGINATION */}
              {totalPages > 0 && (
                <div className="d-flex justify-content-end mt-3">
                  <Pagination className="justify-content-end mt-3">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Prev
                    </Pagination.Prev>

                    {/* Show only the current page */}
                    <Pagination.Item active>{currentPage}</Pagination.Item>

                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Pagination.Next>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              placeholder="e.g. Medical, Education"
              value={form.c_name}
              onChange={(e) => setForm({ ...form, c_name: e.target.value })}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Optional description"
              value={form.c_description}
              onChange={(e) =>
                setForm({ ...form, c_description: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          {/* Cancel Button */}
          <Button
            variant="primary"
            onClick={() => {
              setShowModal(false);
              setEditData(null);
              setForm({ c_name: "", c_description: "" });
              setSaving(false);
            }}
          >
            Cancel
          </Button>

          {/* Save Button */}
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Category"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Category;
