import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import {
  Row,
  Col,
  Nav,
  Image,
  Navbar,
  Dropdown,
  Container,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

import NOTIFICATIONS_DATA from "../data/notifications";
import Profile3 from "../assets/img/team/profile-picture-3.jpg";
import notificationImg from "../assets/img/team/notification-alert 1.png";
import { Routes } from "../routes";
import { getAdminProfile } from "../api/ApiServices";

export default function TopNavbar() {
  const history = useHistory();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [adminImage, setAdminImage] = useState(Profile3);
  const [adminName, setAdminName] = useState("Admin");

  // Fetch admin details from API
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await getAdminProfile();
        const admin = res.payload;

        setAdminName(admin.name || "Admin");

        const imageUrl = admin.image
          ? `https://animaa-1.s3.eu-north-1.amazonaws.com/user-media/${admin.image}`
          : Profile3;

        setAdminImage(imageUrl);
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        // fallback defaults
        setAdminName("Admin");
        setAdminImage(Profile3);
      }
    };

    fetchAdmin();
  }, []);


  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const { name, image } = e.detail;
      setAdminName(name || "Admin");
      setAdminImage(image || Profile3);
    };

    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  const areNotificationsRead = notifications.every((n) => n.read);

  const markNotificationsAsRead = () => {
    setTimeout(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, 300);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear token/session
        localStorage.removeItem("token");
        sessionStorage.clear();

        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.href = Routes.Signin.path;
        }, 1500);
      }
    });
  };

  const NotificationItem = ({ link, sender, image, time, message, read }) => (
    <ListGroup.Item action href={link} className="border-bottom border-light">
      <Row className="align-items-center">
        <Col className="col-auto">
          <Image src={image} className="user-avatar lg-avatar rounded-circle" />
        </Col>
        <Col className="ps-0 ms--2">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="h6 mb-0 text-small">{sender}</h4>
            <small className={read ? "" : "text-danger"}>{time}</small>
          </div>
          <p className="font-small mt-1 mb-0">{message}</p>
        </Col>
      </Row>
    </ListGroup.Item>
  );

  return (
    <Navbar
      expand="lg"
      className="navbar-main shadow-sm"
      style={{ paddingTop: "10px", position: "relative", top: 0 }}
    >
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between align-items-center w-100">
          {/* SEARCH / WELCOME */}
          <div className="d-flex align-items-center">
            <div
              style={{
                backgroundColor: "#fff",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
                border: "1px solid #ddd",
                minWidth: "340px",
                height: "40px",
                fontSize: "14px",
                color: "#000",
              }}
            >
              <span
                role="img"
                aria-label="search"
                className="me-2"
                style={{ fontSize: "18px" }}
              >
                🔍
              </span>
              <h6 style={{ margin: 0, color: "#000" }}>
                Hello, <strong>Welcome Admin this is your</strong> –{" "}
                <span style={{ color: "rgb(27, 44, 193)" }}>
                  Kpigi Admin Panel
                </span>
              </h6>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <Nav className="align-items-center">
            {/* NOTIFICATIONS */}
            <Dropdown as={Nav.Item} onToggle={markNotificationsAsRead}>
              <Dropdown.Toggle
                as={Nav.Link}
                className="text-dark icon-notifications me-lg-3"
              >
                <span className="icon icon-sm">
                  <img
                    src={notificationImg}
                    alt="Notification"
                    style={{ width: "24px", height: "24px", objectFit: "contain" }}
                    className="bell-shake"
                  />
                  {!areNotificationsRead && (
                    <span className="icon-badge rounded-circle unread-notifications" />
                  )}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-center mt-2 py-0">
                <ListGroup className="list-group-flush">
                  <Nav.Link
                    href="#"
                    className="text-center text-primary fw-bold border-bottom border-light py-3"
                  >
                    Notifications
                  </Nav.Link>
                  {notifications.map((n) => (
                    <NotificationItem key={n.id} {...n} />
                  ))}
                  <Dropdown.Item className="text-center text-primary fw-bold py-3">
                    View all
                  </Dropdown.Item>
                </ListGroup>
              </Dropdown.Menu>
            </Dropdown>

            {/* ADMIN PROFILE */}
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
                <div className="media d-flex align-items-center">
                  <Image
                    src={adminImage}
                    className="user-avatar md-avatar rounded-circle"
                    onError={(e) => (e.target.src = Profile3)}
                  />
                  <div className="media-body ms-2 text-dark d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">{adminName}</span>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                <Dropdown.Item
                  className="fw-bold"
                  onClick={() => history.push("/profile")}
                >
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" /> My Profile
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-danger me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}
