import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, InputGroup } from "@themesberg/react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { Routes } from "../../routes";
import { Alert, Collapse } from "@mui/material";
import BgImage from "../../assets/img/illustrations/Data_security_01.jpg";
import { isAuthenticated, loginAdmin } from "../../api/Auth";
import { getAdminWithRoleAPI } from "../../api/ApiServices";
import CryptoJS from "crypto-js";

export default function Signin() {
  // Secret key for encryption
  const secretKey = "my_super_secret_key";
  const history = useHistory();

  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      history.push(Routes.DashboardOverview.path);
    }
  }, [history]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Login
      await loginAdmin(email, password);

        history.push(Routes.DashboardOverview.path);

    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(white, white)",
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
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Row className="g-0 flex-column flex-md-row">
          {/* Left Illustration */}
          <Col
            md={6}
            className="d-flex flex-column align-items-center justify-content-center text-center p-4"
            style={{
              background: "linear-gradient(to bottom, #2575fc, #6a11cb)",
              color: "white",
            }}
          >
            <img
              src={BgImage}
              alt="Data Security Illustration"
              className="img-fluid mb-4"
              style={{
                maxHeight: "260px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
              }}
            />
            <h2 className="fw-bold display-6 mb-2" style={{ color: "white" }}>
              Welcome Back!
            </h2>
            <p className="fs-6 mb-0">
              Login to your <strong>Kpigi Admin Dashboard</strong>
            </p>
          </Col>

          {/* Right Login Form */}
          <Col md={6} className="d-flex align-items-center justify-content-center bg-white p-5">
            <div className="w-100" style={{ maxWidth: "380px" }}>
              <h3 className="fw-bold text-center mb-4" style={{ fontSize: "1.9rem" }}>
                Admin Login
              </h3>

              <Collapse in={showAlert}>
                <Alert severity="success" style={{ marginBottom: "1rem" }}>
                  Login successful! Redirecting...
                </Alert>
              </Collapse>

              {errorMsg && (
                <Alert severity="error" className="mb-3">
                  {errorMsg}
                </Alert>
              )}

              <Form onSubmit={handleSignIn}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: "#f1f5f9", border: "none" }}>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="admin@kpigi.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ backgroundColor: "#f9fafb", border: "none" }}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: "#f1f5f9", border: "none" }}>
                      <FontAwesomeIcon icon={faUnlockAlt} />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ backgroundColor: "#f9fafb", border: "none" }}
                    />
                    <InputGroup.Text
                      style={{ cursor: "pointer", backgroundColor: "#f1f5f9", border: "none" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <FormCheck>
                    <FormCheck.Input id="rememberMe" className="me-2" />
                    <FormCheck.Label htmlFor="rememberMe">Remember me</FormCheck.Label>
                  </FormCheck>
                  <Link to="/forgot-password" className="small fw-semibold" style={{ color: "#2575fc" }}>
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100 fw-bold shadow-sm"
                  style={{
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    border: "none",
                    padding: "0.8rem",
                    fontSize: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
