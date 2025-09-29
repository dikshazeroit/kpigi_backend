import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button, InputGroup } from "@themesberg/react-bootstrap";
import { Link, useHistory } from "react-router-dom";

import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/forgot.svg";

export default function ForgotPassword() {
  const history = useHistory();
  const [email, setEmail] = useState("");

  const handleRecover = (e) => {
    e.preventDefault();
    // TODO: call API to send reset link
    alert(`Password reset link sent to ${email}`);
    // Navigate back to Sign In page
    history.push(Routes.Signin.path);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
        padding: "1rem",
      }}
    >
      <Card
        className="border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "1000px",
          borderRadius: "20px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Row className="g-0 d-flex flex-column flex-md-row" style={{ minHeight: "550px" }}>
          {/* Left Side - Illustration */}
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
              alt="Forgot Password"
              className="img-fluid mb-3"
              style={{ maxHeight: "220px" }}
            />
            <h2 className="fw-bold display-5">Forgot Password?</h2>
            <p className="mt-2 fs-6">Enter your email to reset your password</p>
          </Col>

          {/* Right Side - Form */}
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center bg-white p-4"
          >
            <div className="w-100" style={{ maxWidth: "380px" }}>
              <h3 className="mb-4 text-center">Recover Account</h3>

              <Form onSubmit={handleRecover}>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

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
                  Send Reset Link
                </Button>

                <div className="text-center mt-3">
                  <Link
                    to={Routes.Signin.path}
                    className="small text-decoration-none text-primary"
                  >
                    <FontAwesomeIcon icon={faAngleLeft} className="me-2" />
                    Back to Sign In
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
