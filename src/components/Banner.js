import React, { useState } from "react";
import {
    Col,
    Row,
    Card,
    Button,
    Image,
    Modal,
    Form
} from "@themesberg/react-bootstrap";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Dummy Data (Replace with API later)
const dummyBanners = [
    { id: 1, url: "https://via.placeholder.com/300x150?text=Banner+1", uploadedAt: "" },
    { id: 2, url: "https://via.placeholder.com/300x150?text=Banner+2", uploadedAt: "" },
];

const BannerPage = () => {
    const [banners, setBanners] = useState(dummyBanners);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // 🔹 Open Modal
    const handleAddBanner = () => {
        setShowModal(true);
    };

    // 🔹 Close Modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    // 🔹 File Select
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        if (file) {
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };

    // 🔹 Upload Banner (simulated here, replace with API later)
    const handleUpload = () => {
        if (!selectedFile) return;

        const newBanner = {
            id: banners.length + 1,
            url: previewUrl,
            uploadedAt: new Date().toLocaleDateString("en-GB"),
        };

        setBanners([newBanner, ...banners]);
        handleCloseModal();
    };

    // 🔹 Delete Banner
    const handleDelete = (id) => {
        setBanners(banners.filter((banner) => banner.id !== id));
    };

    return (
        <>

            {/* 🔹 Banner Upload Instruction */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>Add Banner Images</h5>
                            <p className="text-muted">Upload your image file here.</p>
                        </div>
                        <Button variant="primary" onClick={handleAddBanner}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add Banner
                        </Button>
                    </div>
                </Card.Body>
            </Card>


            {/* 🔹 Banner Grid */}
            <Row>
                {banners.map((banner) => (
                    <Col key={banner.id} xs={12} sm={6} md={4} lg={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <div className="position-relative">
                                <Image src={banner.url} alt="Banner" className="card-img-top rounded" />
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="position-absolute top-0 end-0 m-2 rounded-circle"
                                    onClick={() => handleDelete(banner.id)}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                </Button>
                            </div>
                            <Card.Body className="text-center">
                                <small className="text-muted">Uploaded: {banner.uploadedAt}</small>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 🔹 Pagination */}
            <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                <Button variant="outline-primary" size="sm">Previous</Button>
                <span className="mx-3">Page 1 of 2</span>
                <Button variant="outline-primary" size="sm">Next</Button>
            </div>

            {/* 🔹 Add Banner Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload New Banner</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Choose Banner Image</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    </Form.Group>

                    {previewUrl && (
                        <div className="mt-3 text-center">
                            <Image src={previewUrl} alt="Preview" fluid rounded />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpload} disabled={!selectedFile}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BannerPage;
