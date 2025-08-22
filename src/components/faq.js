import React, { useState } from "react";
import {
    Card,
    Button,
    Modal,
    Form,
    Table,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const FaqPage = () => {
    const [faqs, setFaqs] = useState([
        {
            id: 1,
            question: "What is React?",
            answer: "React is a JavaScript library for building UI."
        },
        {
            id: 2,
            question: "What is a component?",
            answer: "A component is a reusable piece of UI."
        },
        {
            id: 3,
            question: "What is state in React?",
            answer: "State is an object that stores dynamic data."
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // add | view | edit
    const [currentFaq, setCurrentFaq] = useState({ id: null, question: "", answer: "" });

    const handleClose = () => {
        setShowModal(false);
        setCurrentFaq({ id: null, question: "", answer: "" });
    };

    const handleShow = (type, faq = { id: null, question: "", answer: "" }) => {
        setModalType(type);
        setCurrentFaq(faq);
        setShowModal(true);
    };

    const handleSave = () => {
        if (modalType === "add") {
            setFaqs([...faqs, { ...currentFaq, id: faqs.length + 1 }]);
        } else if (modalType === "edit") {
            setFaqs(faqs.map((f) => (f.id === currentFaq.id ? currentFaq : f)));
        }
        handleClose();
    };

    const handleDelete = (id) => {
        // setFaqs(faqs.filter((f) => f.id !== id));
    };

    return (
        <div className="p-4">
            <Card className="mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>FAQ Management</h5>
                        <p className="mb-0 text-muted">Click the button to add a new question & answer.</p>
                    </div>
                    <Button variant="primary" onClick={() => handleShow("add")}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Question
                    </Button>
                </Card.Body>
            </Card>

            <Table hover className="faq-table align-items-center">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {faqs.map((faq) => (
                        <tr key={faq.id}>
                            <td>{faq.id}</td>
                            <td>{faq.question}</td>
                            <td>{faq.answer}</td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="info"
                                    className="me-2 btn-xs"
                                    onClick={() => handleShow("view", faq)}

                                >
                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                    View
                                </Button>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    className="me-2 btn-xs"
                                    onClick={() => handleShow("edit", faq)}
                                >
                                    <FontAwesomeIcon icon={faEdit} className="me-1" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    className="me-2 btn-xs"
                                    onClick={() => handleDelete(faq.id)}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} className="me-1" />
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal for Add/View/Edit */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === "add" && "Add Question"}
                        {modalType === "view" && "View Question"}
                        {modalType === "edit" && "Edit Question"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalType === "view" ? (
                        <>
                            <p><strong>Question:</strong> {currentFaq.question}</p>
                            <p><strong>Answer:</strong> {currentFaq.answer}</p>
                        </>
                    ) : (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Question</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={currentFaq.question}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Answer</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={currentFaq.answer}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    {modalType !== "view" && (
                        <Button variant="primary" onClick={handleSave}>
                            {modalType === "add" ? "Add" : "Save Changes"}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FaqPage;
