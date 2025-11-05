import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import {
   Nav, Image, Navbar, Dropdown, Container,
} from '@themesberg/react-bootstrap';
import { useHistory } from "react-router-dom"; // ✅ for navigation

import Profile3 from "../assets/img/team/profile-picture-3.jpg";

export default function TopNavbar(props) {
  const history = useHistory(); // ✅ for navigation

 
 

  return (
    <Navbar variant="dark" expanded className="ps-0 pe-2 pb-0">
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between w-100">
          {/* Search bar */}
          <div className="d-flex align-items-center">
            <div
              className="d-flex align-items-center px-3 py-2 rounded shadow-sm"
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minWidth: "320px",
                fontSize: "14px",
                color: "#000",
              }}
            >
              <span role="img" aria-label="search" className="me-2">
                🔍
              </span>
              <span>
                Hello, <strong>Welcome Admin</strong> – this is your{" "}
                <strong style={{ color: "#1b2cc1" }}>AjoLink Admin Panel</strong>
              </span>
            </div>
          </div>

          <Nav className="align-items-center">
            {/* User Profile */}
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
                <div className="media d-flex align-items-center">
                  <Image src={Profile3} className="user-avatar md-avatar rounded-circle" />
                  <div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">Bonnie Green</span>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                <Dropdown.Item
                  className="fw-bold"
                  onClick={() => history.push("/profile")} // ✅ navigate to profile/widgets page
                >
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" /> My Profile
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
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
