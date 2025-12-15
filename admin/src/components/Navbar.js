import React, { useState } from "react";
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

import { useHistory} from "react-router-dom";

import NOTIFICATIONS_DATA from "../data/notifications";
import Profile3 from "../assets/img/team/profile-picture-3.jpg";
import notificationImg from "../assets/img/team/notification-alert 1.png";
import { Routes } from "../routes";
export default function TopNavbar() {
  const history = useHistory();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const areNotificationsRead = notifications.every((n) => n.read);

  const markNotificationsAsRead = () => {
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }, 300);
  };
  const adminName = localStorage.getItem("name")?.trim() || "Admin";

const adminImage = localStorage.getItem("adminImage")
  ? `https://animaa-1.s3.eu-north-1.amazonaws.com/user-media/${localStorage.getItem("adminImage")}`
  : Profile3;


// Debug Logs
console.log("ADMIN NAME →", adminName);
console.log("ADMIN IMAGE →", adminImage);
console.log("LOCAL STORAGE name →", localStorage.getItem("name"));
console.log("LOCAL STORAGE adminImage →", localStorage.getItem("adminImage"));


const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("adminImage");
  sessionStorage.clear();

   window.location.href = Routes.Signin.path; 
};

  const NotificationItem = ({ link, sender, image, time, message, read }) => (
    <ListGroup.Item action href={link} className="border-bottom border-light">
      <Row className="align-items-center">
        <Col className="col-auto">
          <Image
            src={image}
            className="user-avatar lg-avatar rounded-circle"
          />
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
      style={{
        paddingTop: "10px",
        paddingBottom: "px",
        position: "relative",
        top: 0,
        // zIndex: 1020,
      }}
    >
      <Container fluid className="px-0">

        <div className="d-flex justify-content-between align-items-center w-100">

          {/* ================== SEARCH / WELCOME BAR ================== */}
          <div className="d-flex align-items-center">
            <div
              // className="d-flex align-items-center px-3 py-2 rounded shadow-sm"
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
              {/* Search Icon */}
              <span
                role="img"
                aria-label="search"
                className="me-2"
                style={{ fontSize: "18px" }}
              >
                🔍
              </span>

              {/* Text */}
              <h6 style={{ margin: 0, color: "#000" }}>
                Hello, <strong>Welcome Admin this is your</strong> –{" "}
                <span style={{ color: "rgb(27, 44, 193)" }}>
                  Kpigi Admin Panel
                </span>
              </h6>
            </div>
          </div>

          {/* ================== RIGHT SECTION ================== */}
          <Nav className="align-items-center">

            {/* ===== NOTIFICATIONS ===== */}
            <Dropdown as={Nav.Item} onToggle={markNotificationsAsRead}>
              <Dropdown.Toggle
                as={Nav.Link}
                className="text-dark icon-notifications me-lg-3"
              >
                <span className="icon icon-sm">
                  <img
                    src={notificationImg}
                    alt="Notification"
                    style={{
                      width: "24px",
                      height: "24px",
                      objectFit: "contain",
                    }}
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

            {/* ===== USER PROFILE ===== */}
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
                <div className="media d-flex align-items-center">
                   <Image
      src={adminImage}
      className="user-avatar md-avatar rounded-circle"
      onError={(e) => (e.target.src = Profile3)}
    />
                  <div className="media-body ms-2 text-dark d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">
                     {adminName}
                    </span>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                <Dropdown.Item
                  className="fw-bold"
                  onClick={() => history.push("/profile")}
                >
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" />{" "}
                  My Profile
                </Dropdown.Item>

                <Dropdown.Item
  className="fw-bold"
  onClick={handleLogout}
>
  <FontAwesomeIcon
    icon={faSignOutAlt}
    className="text-danger me-2"
  />{" "}
  Logout
</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          </Nav>
        </div>

      </Container>
    </Navbar>
  );
}
