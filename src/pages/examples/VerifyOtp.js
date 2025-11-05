import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faKey } from "@fortawesome/free-solid-svg-icons";
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
import BgImage from "../../assets/img/illustrations/signin.svg"; // 🟢 use your OTP illustration image

export default function VerifyOtp() {
    const history = useHistory();
    const [otp, setOtp] = useState("");

    // ✅ Prevent scroll when page is open
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleVerify = (e) => {
        e.preventDefault();
        // Only design — no API or alert
        history.push(Routes.ResetPassword.path);
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
                            alt="Verify OTP"
                            className="img-fluid mb-3"
                            style={{ maxHeight: "200px" }}
                        />
                        <h2 className="fw-bold display-6">Verify Your OTP</h2>
                        <p className="mt-2 fs-6">
                            Enter the 8-digit OTP sent to your registered email
                        </p>
                    </Col>

                    {/* Right Side - OTP Form */}
                    <Col
                        md={6}
                        className="d-flex align-items-center justify-content-center bg-white p-4"
                    >
                        <div className="w-100" style={{ maxWidth: "360px" }}>
                            <h3 className="mb-4 text-center">OTP Verification</h3>

                            <Form onSubmit={handleVerify}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Enter OTP</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <FontAwesomeIcon icon={faKey} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter 8-digit OTP"
                                            maxLength="8"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
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
                                    Verify OTP
                                </Button>

                                <div className="text-center mt-3">
                                    <p className="small mb-1">
                                        Didn’t receive the OTP?{" "}
                                        <Link
                                            to="#"
                                            className="text-primary text-decoration-none fw-bold"
                                        >
                                            Resend
                                        </Link>
                                    </p>


                                </div>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
