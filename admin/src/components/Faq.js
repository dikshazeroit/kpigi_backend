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
import Swal from "sweetalert2";
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faLifeRing
} from "@fortawesome/free-solid-svg-icons";

import {
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaqStatus,
} from "../api/ApiServices";

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const [form, setForm] = useState({
        f_question: "",
        f_answer: "",
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // FAQs per page

    // ================= Fetch FAQs =================
    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const res = await getAllFaqs();
            setFaqs(res?.data || []);
            setFiltered(res?.data || []);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    // ================= Search =================
    useEffect(() => {
        const s = search.toLowerCase();
        const filteredData = faqs.filter((f) =>
            f.f_question.toLowerCase().includes(s)
        );
        setFiltered(filteredData);
        setCurrentPage(1); // reset page on search
    }, [search, faqs]);

    // ================= Submit =================
    const handleSubmit = async () => {
        if (!form.f_question.trim() || !form.f_answer.trim()) {
            return Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Both Question and Answer are required.",
            });
        }

        try {
            if (editData) {
                await updateFaq({ f_uuid: editData.f_uuid, ...form });

                Swal.fire({
                    icon: "success",
                    title: "FAQ Updated",
                    text: "The FAQ has been updated successfully.",
                    timer: 1800,
                    showConfirmButton: false,
                });
            } else {
                await createFaq(form);

                Swal.fire({
                    icon: "success",
                    title: "FAQ Added",
                    text: "New FAQ added successfully.",
                    timer: 1800,
                    showConfirmButton: false,
                });
            }

            setShowModal(false);
            setEditData(null);
            setForm({ f_question: "", f_answer: "" });
            fetchFaqs();
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
            });
        }
    };

    // ================= Status Toggle =================
    const handleStatus = async (faq) => {
        await toggleFaqStatus({
            f_uuid: faq.f_uuid,
            f_active: faq.f_active === "1" ? "0" : "1",
        });
        fetchFaqs();
    };

    // ================= Delete =================
    const handleDelete = (faq) => {
        Swal.fire({
            title: "Delete FAQ?",
            text: `Are you sure you want to delete: "${faq.f_question}"`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteFaq(faq.f_uuid);

                    Swal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: "FAQ has been deleted successfully.",
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    fetchFaqs();

                } catch (err) {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Delete Failed",
                        text: "Could not delete FAQ.",
                    });
                }
            }
        });
    };

    // ================= Pagination =================
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedFaqs = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Card border="light" className="shadow-sm">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                    <h4 className="m-0">
                        <FontAwesomeIcon icon={faLifeRing} className="me-2" />
                        FAQ Management
                    </h4>
                    <p className="text-muted mb-0">Manage your Frequently Asked Questions</p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => {
                        setEditData(null);
                        setForm({ f_question: "", f_answer: "" });
                        setShowModal(true);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add FAQ
                </Button>
            </div>

            {/* BODY */}
            <Card.Body>
                <Row className="mb-3">
                    <Col className="d-flex justify-content-end">
                        <InputGroup style={{ maxWidth: "280px" }}>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by questions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                </Row>


                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                        <div className="text-muted fw-semibold">
                            Loading data, please wait...
                        </div>
                    </div>
                ) : paginatedFaqs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <h6>No FAQs found</h6>
                        <small>Add FAQs to help users</small>
                    </div>
                ) : (
                    <>
                        <Table responsive hover className="align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Sr. No.</th>
                                    <th>Question</th>
                                    <th>Answer</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedFaqs.map((faq, index) => (
                                    <tr key={faq.f_uuid}>
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td><strong>{faq.f_question}</strong></td>
                                        <td className="text-muted">
                                            {faq.f_answer.length > 80
                                                ? faq.f_answer.substring(0, 80) + "..."
                                                : faq.f_answer}
                                        </td>
                                        <td>
                                            <Form.Check
                                                type="switch"
                                                checked={faq.f_active === "1"}
                                                onChange={() => handleStatus(faq)}
                                                label={
                                                    <Badge bg={faq.f_active === "1" ? "success" : "secondary"}>
                                                        {faq.f_active === "1" ? "ACTIVE" : "INACTIVE"}
                                                    </Badge>
                                                }
                                            />
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-2"
                                                onClick={() => {
                                                    setEditData(faq);
                                                    setForm({
                                                        f_question: faq.f_question,
                                                        f_answer: faq.f_answer,
                                                    });
                                                    setShowModal(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDelete(faq)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <div className="d-flex justify-content-end mt-3">

                                {totalPages >= 1 && (
                                    <Pagination className="justify-content-end mt-3">
                                        <Pagination.Prev
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            Prev
                                        </Pagination.Prev>

                                        {[...Array(totalPages)].map((_, i) => (
                                            <Pagination.Item
                                                key={i + 1}
                                                active={i + 1 === currentPage}
                                                onClick={() => setCurrentPage(i + 1)}
                                            >
                                                {i + 1}
                                            </Pagination.Item>
                                        ))}

                                        <Pagination.Next
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            Next
                                        </Pagination.Next>
                                    </Pagination>
                                )}
                            </div>
                        )}
                    </>
                )}
            </Card.Body>

            {/* ADD / EDIT MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editData ? "Edit FAQ" : "Add FAQ"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            value={form.f_question}
                            onChange={(e) =>
                                setForm({ ...form, f_question: e.target.value })
                            }
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Answer</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={form.f_answer}
                            onChange={(e) =>
                                setForm({ ...form, f_answer: e.target.value })
                            }
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save FAQ
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default Faq;