import React, { useState } from "react";
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
import { Link, useHistory } from "react-router-dom";
import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/forgots.svg";

export default function ResetPassword() {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleReset = (e) => {
    e.preventDefault();
    // Only design — no API or alert
    history.push(Routes.Signin.path);
  };

  return (
    <div
      style={{
        height: "100vh",
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
              background: "linear-gradient(to right, #ffffff, #6a11cb, #2575fc)",
              color: "white",
            }}
          >
            <img
              src={BgImage}
              alt="Reset Password"
              className="img-fluid mb-3"
              style={{ maxHeight: "200px" }}
            />

            <h2 className="fw-bold display-6" style={{ color: "#000" }}>
              Reset Your Password
            </h2>

            <p className="mt-2 fs-6" style={{ color: "#000" }}>
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
                  className="w-100 text-white fw-bold"
                  style={{
                    background: "linear-gradient(to right, #ffffff, #6a11cb, #2575fc)",
                    border: "none",
                    padding: "0.75rem",
                    fontSize: "1rem",
                  }}
                >
                  Reset Password
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
