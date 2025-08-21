import React, { useState } from "react";
import {
    Row,
    Col,
    Card,
    Table,
    Button,
    Modal,
    Form
} from "@themesberg/react-bootstrap";

const SubscriptionPage = () => {
    const [subscriptions, setSubscriptions] = useState([
        {
            id: 1,
            name: "Yearly Plan",
            price: "$999.9",
            duration: "Yearly",
            features: [
                "Access to premium job listings",
                "Profile visibility boost",
                "Priority support"
            ]
        },
        {
            id: 2,
            name: "Monthly Plan",
            price: "$99.9",
            duration: "Monthly",
            features: [
                "Unlimited access to premium content",
                "Ad-free experience",
                "Priority customer support",
                "Early access to new features"
            ]
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        duration: "",
        features: ""
    });

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({ name: "", price: "", duration: "", features: "" });
        setShowModal(true);
    };

    // Open Edit Modal with data
    const handleOpenEdit = (sub) => {
        setEditMode(true);
        setCurrentId(sub.id);
        setFormData({
            name: sub.name,
            price: sub.price,
            duration: sub.duration,
            features: sub.features.join(", ")
        });
        setShowModal(true);
    };

    // Save (Add or Update)
    // const handleSave = () => {
    //     if (!formData.name || !formData.price) return;

    //     if (editMode) {
    //         // Update existing subscription
    //         setSubscriptions(
    //             subscriptions.map((sub) =>
    //                 sub.id === currentId
    //                     ? {
    //                         ...sub,
    //                         name: formData.name,
    //                         price: formData.price,
    //                         duration: formData.duration,
    //                         features: formData.features.split(",").map((f) => f.trim())
    //                     }
    //                     : sub
    //             )
    //         );
    //     } else {
    //         // Add new subscription
    //         setSubscriptions([
    //             ...subscriptions,
    //             {
    //                 id: subscriptions.length + 1,
    //                 name: formData.name,
    //                 price: formData.price,
    //                 duration: formData.duration,
    //                 features: formData.features.split(",").map((f) => f.trim())
    //             }
    //         ]);
    //     }

    //     setShowModal(false);
    //     setFormData({ name: "", price: "", duration: "", features: "" });
    //     setCurrentId(null);
    //     setEditMode(false);
    // };

    // Delete
    const handleDelete = (id) => {
        // setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    };

    return (
        <Row>
            <Col xs={12}>
                <Card border="light" className="shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5>Manage Subscriptions</h5>
                        <Button variant="primary" onClick={handleOpenAdd}>
                            Add Subscription
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Plan Name</th>
                                    <th>Price</th>
                                    <th>Duration</th>
                                    <th>Features</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((sub, index) => (
                                    <tr key={sub.id}>
                                        <td>{index + 1}</td>
                                        <td>{sub.name}</td>
                                        <td>{sub.price}</td>
                                        <td>{sub.duration}</td>
                                        <td>
                                            <ul style={{ paddingLeft: "18px" }}>
                                                {sub.features.map((f, i) => (
                                                    <li key={i}>{f}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleOpenEdit(sub)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(sub.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>

            {/* Add/Edit Subscription Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editMode ? "Edit Subscription" : "Add Subscription"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Plan Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter plan name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter price"
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({ ...formData, price: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Monthly / Yearly"
                                value={formData.duration}
                                onChange={(e) =>
                                    setFormData({ ...formData, duration: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Features</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter features separated by commas"
                                value={formData.features}
                                onChange={(e) =>
                                    setFormData({ ...formData, features: e.target.value })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary">
                        {editMode ? "Update" : "Save"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Row>
    );
};

export default SubscriptionPage;
