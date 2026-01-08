import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faPen } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Card, Form, InputGroup, Button } from "@themesberg/react-bootstrap";
import avatar from "../assets/img/pages/avatar.jpg";
import Swal from "sweetalert2";
import { updateAdminProfile, getAdminProfile } from "../api/ApiServices";
import { useHistory } from "react-router-dom";

export const GeneralInfoForm = () => {
  const history = useHistory();

  // STATES
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

  // 🚀 LOAD ADMIN DETAILS FROM API (NOT LOCALSTORAGE)
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await getAdminProfile();
        const admin = res.payload;

        setFirstName(admin.firstName || "");
        setSurname(admin.lastName || "");
        setEmail(admin.email || "");
        setPhone(admin.phone || "");
        setAddress(admin.address || "");

        const imageUrl = admin.image
          ? `https://animaa-1.s3.eu-north-1.amazonaws.com/user-media/${admin.image}`
          : avatar;

        setProfileImg(imageUrl);
      } catch (err) {
        console.error("Error loading admin profile:", err);
      }
    };

    fetchAdmin();
  }, []);

  // Image preview
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setProfileImg(URL.createObjectURL(file)); // preview
    }
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Please make sure both passwords match.",
      });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Phone",
        text: "Phone number must be exactly 10 digits.",
      });
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

      const newImageUrl = res.payload.image
        ? `https://animaa-1.s3.eu-north-1.amazonaws.com/user-media/${res.payload.image}`
        : avatar;

      setProfileImg(newImageUrl);

      // 🔥 Dispatch event for TopNavbar to update instantly
      window.dispatchEvent(new CustomEvent("profile-updated", {
        detail: {
          name: res.payload.name,
          image: newImageUrl
        }
      }));

      Swal.fire
        ({
          icon: "success",
          title: "Profile Updated successfully!",
          timer: 1500, showConfirmButton: false,
        })
        .then(() => { history.push("/profile"); });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating your profile.",
      });
    }

  };

  return (
    <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-4">Administrator Profile Information</h5>

        <div
          className="mb-4"
          style={{
            display: "flex",
            justifyContent: "center", // horizontally center
            alignItems: "center",     // vertically center if needed
            position: "relative",
          }}
        >
          <img
            src={profileImg}
            alt="Admin"
            className="rounded-circle"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "3px solid #fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          />

          {/* Upload button */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="upload-admin-img"
          />

          <label
            htmlFor="upload-admin-img"
            style={{
              position: "absolute",
              bottom: "0",
              right: "calc(50% - 60px)", // adjust relative to image width
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

        {/* FORM */}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Enter last name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" disabled value={email} />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="Enter phone number"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </Form.Group>

          {/* PASSWORD */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <InputGroup.Text onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button
              style={{
                backgroundColor: "#262B40",
                color: "#ffffff",
                border: "none",
              }}
              className="me-2"
              onClick={() => history.push("/profile")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              style={{
                backgroundColor: "#262B40",
                color: "#ffffff",
                border: "none",
              }}
            >
              Save Changes
            </Button>
          </div>

        </Form>
      </Card.Body>
    </Card>
  );
};
