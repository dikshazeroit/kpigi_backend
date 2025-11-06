import React, { useState } from "react";
import { Card, Table, Button, Modal } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrashAlt, faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New User Registered", message: "John Doe has joined.", date: "2025-11-05" },
    { id: 2, title: "Server Update", message: "Server will be down at 12 AM.", date: "2025-11-04" },
    { id: 3, title: "Payment Received", message: "You received $200.", date: "2025-11-03" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState({});

  const handleClose = () => {
    setShowModal(false);
    setCurrentNotification({});
  };

  const handleShow = (notification) => {
    setCurrentNotification(notification);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <Card.Body className="d-flex align-items-center">
          <FontAwesomeIcon icon={faBell} size="2x" className="me-3 text-primary" />
          <div>
            <h5 className="mb-0">Notifications</h5>
            <p className="mb-0 text-muted">View and manage your notifications.</p>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{notification.id}</td>
                  <td>{notification.title}</td>
                  <td>{notification.message}</td>
                  <td>{notification.date}</td>
                  <td>
                    <Button size="sm" variant="info" className="me-2" onClick={() => handleShow(notification)}>
                      <FontAwesomeIcon icon={faEye} className="me-1" /> View
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(notification.id)}>
                      <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Title:</strong> {currentNotification.title}</p>
          <p><strong>Message:</strong> {currentNotification.message}</p>
          <p><strong>Date:</strong> {currentNotification.date}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
