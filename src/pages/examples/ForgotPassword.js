import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button, InputGroup, Spinner } from "@themesberg/react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/Data_security_01.jpg";

export default function ForgotPassword() {
  const history = useHistory(); // useHistory for React Router v5
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 0",
        background: "linear-gradient(white, white)",
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
        <Row className="g-0 d-flex flex-column flex-md-row" style={{ minHeight: "500px" }}>
          {/* Left Side */}
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
              alt="Forgot Password"
              className="img-fluid mb-3"
              style={{ maxHeight: "200px" }}
            />
            <h2 className="fw-bold display-6" style={{ color: "#fff" }}>
              Forgot Password?
            </h2>
            <p className="mt-2 fs-6" style={{ color: "#fff" }}>
              Enter your registered email to reset your password
            </p>
          </Col>

          {/* Right Side */}
          <Col md={6} className="d-flex align-items-center justify-content-center bg-white p-4">
            <div className="w-100" style={{ maxWidth: "360px" }}>
              {!submitted ? (
                <>
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
                          aria-label="Email address for password recovery"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>

                    <Button
                      type="submit"
                      className="w-100 text-white fw-bold d-flex justify-content-center align-items-center"
                      style={{
                        background: "linear-gradient(to right, #6a11cb, #2575fc)",
                        border: "none",
                        padding: "0.75rem",
                        fontSize: "1rem",
                      }}
                      disabled={loading}
                    >
                      {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
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
                </>
              ) : (
                <div className="text-center">
                  <h5>Check your email!</h5>
                  <p>
                    We’ve sent a password reset link to <strong>{email}</strong>
                  </p>
                  <Button
                    onClick={() => history.push(Routes.Signin.path)}
                    className="mt-3"
                    style={{
                      background: "linear-gradient(to bottom, #2575fc, #6a11cb)",
                      border: "none",
                      color: "#fff",
                      padding: "0.5rem 1.5rem",
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
