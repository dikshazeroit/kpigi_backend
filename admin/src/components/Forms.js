import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faPen } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Card, Form, InputGroup, Button } from "@themesberg/react-bootstrap";
import avatar from "../assets/img/pages/avatar.jpg";
import { updateAdminProfile } from "../api/ApiServices"; 

export const GeneralInfoForm = () => {
  // STATE VARIABLES
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [profileImg, setProfileImg] = useState(avatar);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load existing user data from localStorage on mount
 // Load existing user data from localStorage on mount
useEffect(() => {
  setFirstName(localStorage.getItem("firstName") || "");
  setSurname(localStorage.getItem("surname") || "");
  setEmail(localStorage.getItem("email") || "");
  setPhone(localStorage.getItem("phone") || "");
  setAddress(localStorage.getItem("address") || "");
  
  const savedImage = localStorage.getItem("adminImage");
  if (savedImage) {
    // If image already has full URL, use it
    setProfileImg(savedImage.startsWith("http") ? savedImage : `https://animaa-1.s3.eu-north-1.amazonaws.com/user-media/${savedImage}`);
  } else {
    setProfileImg(avatar);
  }
}, []);


  // Image preview
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setProfileImg(URL.createObjectURL(file));
    }
  };

  // Submit Handler
const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (phone && !/^\d{10}$/.test(phone)) {
    alert("Phone number must be exactly 10 digits!");
    return;
  }

  const formData = new FormData();
  formData.append("name", firstName);
  formData.append("surname", surname);
  formData.append("phone", phone);
  formData.append("address", address);
  if (password) formData.append("password", password);
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await updateAdminProfile(formData);

    // Construct S3 URL if image exists
    const imageUrl = res.payload.image 
      ? `https://animaa-1.s3.eu-north-1.amazonaws.com/user-media/${res.payload.image}` 
      : avatar;

    // Update Local Storage
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("surname", surname);
    localStorage.setItem("phone", phone);
    localStorage.setItem("address", address);
    localStorage.setItem("name", res.payload.name);
    localStorage.setItem("adminImage", imageUrl);

    setProfileImg(imageUrl); // Update profile image in UI
    alert("Profile updated successfully!");
  } catch (err) {
    console.error(err);
    alert("Profile update failed!");
  }
};


  return (
    <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-4">Edit Information</h5>

        {/* Profile Image */}
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

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="upload-profile-img"
          />

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

        {/* FORM START */}
        <Form onSubmit={handleSubmit}>
          {/* Name */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group id="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Email + Phone */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  disabled
                  value={email}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group id="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} // digits only
                  maxLength={10} // limit to 10 digits
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <Row>
            <Col className="mb-3">
              <Form.Group id="address">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Password + Confirm Password */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="password">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Submit */}
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
