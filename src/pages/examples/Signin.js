import React, { useState, useEffect } from "react";
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
import BgImage from "../../assets/img/illustrations/signin.svg";

export default function Signin() {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Scroll to top when page mounts (fixes scroll leftover from dashboard)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden"; // disable scroll
    return () => {
      document.body.style.overflow = "auto"; // restore on unmount
    };
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Login Successful!",
      text: "Welcome back to your dashboard!",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
    });

    setTimeout(() => {
      history.push(Routes.DashboardOverview.path);
    }, 1500);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 0",
        background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
      }}
    >
      <Card
        className="border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "950px",
          borderRadius: "20px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Row
          className="g-0 d-flex flex-column flex-md-row"
          style={{ minHeight: "500px" }}
        >
          {/* Left Side */}
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
              className="img-fluid mb-3"
              style={{ maxHeight: "200px" }}
            />
            <h2 className="fw-bold display-6">Welcome Back!</h2>
            <p className="mt-2 fs-6">Sign in to your admin dashboard</p>
          </Col>

          {/* Right Side */}
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center bg-white p-4"
          >
            <div className="w-100" style={{ maxWidth: "360px" }}>
              <h3
                className="mb-4 text-center d-flex align-items-center justify-content-center"
                style={{
                  gap: "10px",
                  fontWeight: "600",
                  fontSize: "1.6rem",
                  color: "#333",
                }}
              >
                <span role="img" aria-label="hand" style={{ fontSize: "1.8rem" }}>👉</span>
                AjoLink Login
              </h3>

              <Form onSubmit={handleSignIn}>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="admin@example.com"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faUnlockAlt} />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      required
                    />
                    <InputGroup.Text
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                {/* Remember + Forgot */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FormCheck>
                    <FormCheck.Input id="rememberMe" className="me-2" />
                    <FormCheck.Label htmlFor="rememberMe">
                      Remember me
                    </FormCheck.Label>
                  </FormCheck>
                  <Link
                    to="/forgot-password"
                    className="small text-decoration-none text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-100 text-white fw-bold"
                  style={{
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    border: "none",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                >
                  Sign In
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
