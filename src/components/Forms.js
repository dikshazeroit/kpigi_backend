import React, { useState } from "react";
import moment from "moment-timezone";
import Datetime from "react-datetime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEye, faEyeSlash, faPen } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Card, Form, InputGroup, Button } from "@themesberg/react-bootstrap";
import avatar from "../assets/img/pages/avatar.jpg";

export const GeneralInfoForm = () => {
  const [birthday, setBirthday] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImg, setProfileImg] = useState(avatar); // default is avatar image

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImg(URL.createObjectURL(event.target.files[0])); // show selected image
    }
  };

  return (
    <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-4">Edit Information</h5>

        {/* Profile Image Section */}
        <div className="text-center position-relative mb-4" style={{ display: "inline-block" }}>
          <img
            src={profileImg}
            alt="Profile"
            className="rounded-circle"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "3px solid #fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          />

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="upload-profile-img"
          />

          {/* Edit Icon - Right Side */}
          <label
            htmlFor="upload-profile-img"
            style={{
              position: "absolute",
              bottom: "10px",
              right: "0",
              background: "#fff",
              borderRadius: "50%",
              padding: "6px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faPen} color="#555" />
          </label>
        </div>

        {/* Form Fields */}
        <Form>
          {/* Name */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control required type="text" placeholder="Enter your first name" />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group id="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control required type="text" placeholder="Also your last name" />
              </Form.Group>
            </Col>
          </Row>

          {/* Email & Phone */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control required type="email" placeholder="name@company.com" />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group id="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control required type="number" placeholder="+12-345 678 910" />
              </Form.Group>
            </Col>
          </Row>

          {/* Password & Confirm Password */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                  />
                  <InputGroup.Text
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group id="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                  />
                  <InputGroup.Text
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          {/* Submit Button */}
          <div className="mt-3">
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};
