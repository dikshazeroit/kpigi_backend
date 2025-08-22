import React, { useState } from "react";
import {
    Card,
    Button,
    Form,
    Row,
    Col,
    Modal,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faUpload, faPlus } from "@fortawesome/free-solid-svg-icons";

const AddVideoPage = () => {
    const [videos, setVideos] = useState([
        {
            id: 1,
            title: "Butterfly ",
            url: "https://www.w3schools.com/html/mov_bbb.mp4", // sample video
            date: "06/08/2025",
        },
        {
            id: 2,
            title: "Nature View",
            url: "https://www.w3schools.com/html/movie.mp4", // sample video
            date: "06/08/2025",
        },

    ]);

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file || !title) {
            alert("Please enter a title and select a video!");
            return;
        }

        const newVideo = {
            id: videos.length + 1,
            title,
            url: URL.createObjectURL(file), // create local preview
            date: new Date().toLocaleString(),
        };

        setVideos([...videos, newVideo]);
        setFile(null);
        setTitle("");
        setShowModal(false);
    };

    const handleDelete = (id) => {
        // setVideos(videos.filter((v) => v.id !== id));
    };

    return (
        <div className="p-3">
            {/* Header + Add Video Button */}
            <Card className="mb-4 p-3 d-flex flex-row justify-content-between align-items-center">
                <h5 className="mb-0">Upload Animated Video</h5>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add Video
                </Button>
            </Card>

            {/* Video List */}
            <Card className="p-3">
                <Row>
                    {videos.map((video) => (
                        <Col key={video.id} md={4} className="mb-3">
                            <Card className="p-3 text-center shadow-sm">
                                <video
                                    src={video.url}
                                    controls
                                    style={{ width: "100%", height: "200px", borderRadius: "10px" }}
                                ></video>
                                <h6 className="mt-2">{video.title}</h6>
                                <small className="text-muted">Uploaded: {video.date}</small>
                                <Button
                                    variant="light"
                                    className="mt-2 text-danger"
                                    onClick={() => handleDelete(video.id)}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Add Video Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Video</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Video Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter video title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Video File</Form.Label>
                            <Form.Control
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        {file && (
                            <video
                                src={URL.createObjectURL(file)}
                                controls
                                style={{ width: "100%", borderRadius: "10px", marginTop: "10px" }}
                            ></video>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpload}>
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Upload Video
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AddVideoPage;
