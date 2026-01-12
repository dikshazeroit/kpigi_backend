import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import {

  Nav,
  Image,
  Navbar,
  Dropdown,
  Container,

} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

import Profile3 from "../assets/img/team/profile-picture-3.jpg";
import { Routes } from "../routes";
import { getAdminProfile } from "../api/ApiServices";

export default function TopNavbar() {
  const history = useHistory();
  const [adminImage, setAdminImage] = useState(Profile3);
  const [adminName, setAdminName] = useState("Admin");

  // Fetch admin details from API
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await getAdminProfile();
        const admin = res.payload;

        // Use au_name and au_surname if available, fallback to admin.name if needed
        const fullName =
          (admin.au_name || admin.name ? `${admin.au_name || ""} ${admin.au_surname || ""}`.trim() : "") || admin.name || "Admin";

        setAdminName(fullName);

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

  // Listen for external profile update events
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      const { name, image } = e.detail;
      setAdminName(name || "Admin");
      setAdminImage(image || Profile3);
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);


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


  return (
    <Navbar
      expand="lg"
      className="navbar-main shadow-sm"
      style={{ padding: "10px 20px" }}
    >
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between align-items-center w-100">

          {/* DASHBOARD */}
          <h6
            className="mb-0 fw-bold text-dark"
            style={{
              fontSize: "1.2rem",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
              fontWeight: "bold",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            DASHBOARD
          </h6>

          {/* RIGHT SIDE (SEARCH + PROFILE) */}
          <div className="d-flex align-items-center gap-3">

            {/* WELCOME / SEARCH BOX */}
            <div
              style={{
                backgroundColor: "#fff",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
                border: "2px solid #ddd",
                height: "40px",
                fontSize: "14px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span
                role="img"
                aria-label="search"
                style={{ fontSize: "16px", marginRight: "8px" }}
              >
                🔍
              </span>
              <span>
                Hello, Welcome <strong>{adminName}</strong> –{" "}
                <span style={{ color: "#64748b" }}>
                  this is your Kpigi Admin Panel
                </span>
              </span>
            </div>

            {/* PROFILE */}
            <Nav className="align-items-center">
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link} className="p-0">
                  <div className="d-flex align-items-center">
                    <Image
                      src={adminImage}
                      className="user-avatar md-avatar rounded-circle"
                      onError={(e) => (e.target.src = Profile3)}
                    />
                    <span className="ms-2 fw-bold text-black d-none d-lg-block">
                      {adminName}
                    </span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="user-dropdown dropdown-menu-end mt-2">
                  <Dropdown.Item
                    className="fw-bold"
                    onClick={() => history.push("/profile")}
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Item className="fw-bold" onClick={handleLogout}>
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      className="text-danger me-2"
                    />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>

          </div>
        </div>
      </Container>

    </Navbar>
  );

}
