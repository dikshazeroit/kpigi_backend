import React, { useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
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
  InputGroup,
} from "@themesberg/react-bootstrap";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/Data_security_01.jpg";

// API
import { resetPassword } from "../../api/Auth";

export default function ResetPassword() {
  const history = useHistory();
  const location = useLocation();

  // Email passed from OTP page
  const email = location.state?.email;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      return Swal.fire({
        icon: "warning",
        title: "Email missing",
        text: "Please restart the password reset process.",
      });
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        text: "Please make sure both passwords are the same.",
      });
    }

    try {
      setLoading(true);

      const res = await resetPassword(email, newPassword, confirmPassword);

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "You can now log in with your new password.",
        confirmButtonColor: "#2575fc",
      });

      setTimeout(() => {
        history.push(Routes.Signin.path);
      }, 1200);

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: err?.response?.data?.message || "Something went wrong.",
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
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              color: "white",
            }}
          >
            <img
              src={BgImage}
              alt="Reset Password"
              className="img-fluid mb-3"
              style={{ maxHeight: "200px" }}
            />

            <h2 className="fw-bold display-6" style={{ color: "#f0f0f0" }}>
              Reset Your Password
            </h2>

            <p className="mt-2 fs-6" style={{ color: "#f0f0f0" }}>
              Set a new password to regain access to your account
            </p>
          </Col>

          {/* Right Side */}
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center bg-white p-4"
          >
            <div className="w-100" style={{ maxWidth: "360px" }}>
              <h3 className="mb-4 text-center">Create New Password</h3>

              <Form onSubmit={handleReset}>
                {/* New Password */}
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faUnlockAlt} />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                {/* Confirm Password */}
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faUnlockAlt} />
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputGroup.Text
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-100 text-white fw-bold"
                  style={{
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    border: "none",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

                {/* Back to Sign In */}
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
