import React, { useState, useEffect } from "react";
import {
    Col,
    Row,
    Card,
    Button,
    Image,
    Modal,
    Form,
    Spinner
} from "@themesberg/react-bootstrap";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import carImg from "../assets/img/pages/car.jpg";
import natureImg from "../assets/img/pages/nature.jpg";

// Dummy Data (Replace with API later)
const dummyBanners = [
    { id: 1, title: "Car Banner", url: carImg, uploadedAt: "20/08/2025" },
    { id: 2, title: "Nature Banner", url: natureImg, uploadedAt: "20/08/2025" },
];

const BannerPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [title, setTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const bannersPerPage = 6;
    const totalPages = Math.ceil(banners.length / bannersPerPage);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setBanners(dummyBanners);
            setLoading(false);
        }, 1000);
    }, []);

    const handleAddBanner = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setTitle("");
        setUploading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        if (file) {
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };

    const handleUpload = () => {
        if (!selectedFile || !title.trim()) return;

        setUploading(true);

        setTimeout(() => {
            const newBanner = {
                id: banners.length + 1,
                title: title.trim(),
                url: previewUrl,
                uploadedAt: new Date().toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }),
            };

            setBanners([newBanner, ...banners]);
            handleCloseModal();
            setCurrentPage(1);
        }, 1200);
    };

    const handleDelete = (id) => {
        setBanners(banners.filter((banner) => banner.id !== id));
    };

    const indexOfLast = currentPage * bannersPerPage;
    const indexOfFirst = indexOfLast - bannersPerPage;
    const currentBanners = banners.slice(indexOfFirst, indexOfLast);

    return (
        <>
            {/* Upload Section */}
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

            {/* Loader */}
            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    {/* Banner Grid */}
                    <Row>
                        {currentBanners.map((banner) => (
                            <Col key={banner.id} xs={12} sm={6} md={4} lg={4} className="mb-4">
                                <Card className="h-100 shadow-sm">
                                    <div className="position-relative">
                                        {/* 🔹 Fixed Height Image */}
                                        <Image
                                            src={banner.url}
                                            alt="Banner"
                                            className="card-img-top rounded"
                                            style={{ height: "200px", objectFit: "cover" }}
                                        />
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
                                        {banner.title && <h6 className="mb-1">{banner.title}</h6>}
                                        <small className="text-muted">Uploaded: {banner.uploadedAt}</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="mx-3">Page {currentPage} of {totalPages || 1}</span>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload New Banner</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Banner Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter banner title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Choose Banner Image</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    </Form.Group>

                    {previewUrl && (
                        <div className="mt-3 text-center">
                            {/* 🔹 Fixed height preview */}
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                fluid
                                rounded
                                style={{ maxHeight: "200px", objectFit: "cover" }}
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!selectedFile || !title.trim() || uploading}
                    >
                        {uploading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Uploading...
                            </>
                        ) : (
                            "Upload"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BannerPage;
