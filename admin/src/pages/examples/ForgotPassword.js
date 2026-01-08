import React, { useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Form,
  Card,
  Button,
  InputGroup,
  Spinner,
} from "@themesberg/react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/Data_security_01.jpg";

// Import your API service
import { forgotPassword } from "../../api/Auth";

export default function ForgotPassword() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API
      const res = await forgotPassword(email);

      console.log("FORGOT PASSWORD RESPONSE:", res);

      setSubmitted(true);

      // Show success popup
      Swal.fire({
        title: "Email Sent!",
        text: `A password reset OTP has been sent to ${email}`,
        icon: "success",
        confirmButtonColor: "#2575fc",
      });

      // Redirect to verify OTP page with email
      setTimeout(() => {
        history.push({
          pathname: "/verify-otp",
          state: { email },
        });
      }, 1300);

    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error!",
        text: err?.response?.data?.message || "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#d33",
      });

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
        <Row
          className="g-0 d-flex flex-column flex-md-row"
          style={{ minHeight: "500px" }}
        >
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
              Enter your registered email to receive the reset link
            </p>
          </Col>

          {/* Right Side */}
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center bg-white p-4"
          >
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
                      {loading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : null}
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
                    A password reset link has been sent to:
                    <br />
                    <strong>{email}</strong>
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
