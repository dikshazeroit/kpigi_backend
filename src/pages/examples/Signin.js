import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUnlockAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Form,
  Card,
  Button,
  FormCheck,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { Routes } from "../../routes";
import Swal from "sweetalert2";
import BgImage from "../../assets/img/illustrations/forgots.svg";

export default function Signin() {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();

Swal.fire({
  title: " Welcome Back!",
  text: "Login successfully",
  icon: "success",
  iconColor: "green",
  background: "#ffffff",
  color: "#333",
  showConfirmButton: true,
  confirmButtonText: "OK",
  timer: 3000,
  timerProgressBar: true, 
});




    setTimeout(() => {
      history.push(Routes.DashboardOverview.path);
    }, 1500);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #ffffff, #dbeafe, #a5b4fc)", // white-blended blue gradient
        padding: "20px",
      }}
    >
      <Card
        className="border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "950px",
          borderRadius: "18px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Row className="g-0 d-flex flex-column flex-md-row">
          {/* Left Visual Section */}
          <Col
            md={6}
            className="d-flex flex-column align-items-center justify-content-center text-center p-4"
            style={{
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              color: "white",
            }}
          >
            <img
              src={BgImage}
              alt="Sign In"
              className="img-fluid mb-4"
              style={{
                maxHeight: "260px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
              }}
            />

            <h2 className="fw-bold display-6 mb-2" style={{ color: "#fff" }}>
              Welcome Back!
            </h2>
            <p className="fs-6 mb-0" style={{ color: "#f0f0f0" }}>
              Login in to your <strong>AjoLink Admin Dashboard</strong>
            </p>
          </Col>

          {/* Right Form Section */}
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center bg-white p-5"
          >
            <div className="w-100" style={{ maxWidth: "380px" }}>
              <h3
                style={{
                  fontWeight: "700",
                  fontSize: "1.9rem",
                  color: "#1b2cc1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  gap: "10px",
                  marginBottom: "1.8rem",
                }}
              >
                <span
                  role="img"
                  aria-label="lock"
                  style={{ fontSize: "1.9rem" }}
                >

                </span>
                Admin Login
              </h3>

              <Form onSubmit={handleSignIn}>
                {/* Email */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      style={{ backgroundColor: "#f1f5f9", border: "none" }}
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="admin@example.com"
                      required
                      style={{ backgroundColor: "#f9fafb", border: "none" }}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      style={{ backgroundColor: "#f1f5f9", border: "none" }}
                    >
                      <FontAwesomeIcon icon={faUnlockAlt} />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      required
                      style={{ backgroundColor: "#f9fafb", border: "none" }}
                    />
                    <InputGroup.Text
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#f1f5f9",
                        border: "none",
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                {/* Remember + Forgot */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <FormCheck>
                    <FormCheck.Input id="rememberMe" className="me-2" />
                    <FormCheck.Label htmlFor="rememberMe">
                      Remember me
                    </FormCheck.Label>
                  </FormCheck>
                  <Link
                    to="/forgot-password"
                    className="small text-decoration-none fw-semibold"
                    style={{ color: "#1b2cc1" }}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-100 fw-bold shadow-sm"
                  style={{
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    border: "none",
                    padding: "0.8rem",
                    fontSize: "1rem",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) =>
                  (e.target.style.background =
                    "linear-gradient(to right, #2575fc, #6a11cb)")
                  }
                  onMouseOut={(e) =>
                  (e.target.style.background =
                    "linear-gradient(to right, #6a11cb, #2575fc)")
                  }
                >
                  Login In
                </Button>

                {/* Signup Link */}
                <p className="text-center mt-4 mb-0 text-muted">
                  {" "}
                  <Link
                    to="/signup"
                    className="fw-semibold text-decoration-none"
                    style={{ color: "#1b2cc1" }}
                  >

                  </Link>
                </p>
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
