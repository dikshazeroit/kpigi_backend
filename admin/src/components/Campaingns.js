import React, { useState, useEffect } from "react";
import {
  Table,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Card,
  Modal,
  Pagination,
  Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faEye, faFunnelDollar } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Image_Url } from "../api/ApiClient";
import "react-image-lightbox/style.css";
import ReactImageLightbox from "react-image-lightbox";


// API IMPORTS
import {
  getAllFundraisers,
  approveFundraiserAPI,
  rejectFundraiserAPI,
  pauseFundraiserAPI,
  resumeFundraiserAPI,
  closeFundraisers
} from "../api/ApiServices";

const defaultImage =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [photoIndex, setPhotoIndex] = useState(0); 
  const [isOpen, setIsOpen] = useState(false);

  const campaignsPerPage = 10;

  // ====== Pause / Reject / Close Reason Modal ======
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState(""); // "PAUSE", "REJECT", "CLOSE"
  const [reasonText, setReasonText] = useState("");
  const [campaignForReason, setCampaignForReason] = useState(null);

  // ====== FETCH DATA ======
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const statusParam = filter === "All" ? "" : filter.toUpperCase();
      const data = await getAllFundraisers(page, campaignsPerPage, search, statusParam);
      setCampaigns(data.payload || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, filter, search]);

  // ====== STATUS TEXT ======
  const getStatusText = (status) => {
    switch (status) {
      case "PENDING": return "Pending";
      case "ACTIVE": return "Active";
      case "PAUSED": return "Paused";
      case "CLOSED":
      case "REJECTED": return "Rejected";
      default: return status;
    }
  };

  // ====== OPEN REASON MODAL ======
  const openReasonModal = (campaign, type) => {
    setCampaignForReason(campaign);
    setReasonType(type); // "PAUSE", "REJECT", or "CLOSE"
    setReasonText("");
    setShowReasonModal(true);
  };

  // ====== HANDLE PAUSE / REJECT / CLOSE SUBMIT ======
  const handleReasonSubmit = async () => {
    if (!reasonText.trim()) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please enter a reason!" });
      return;
    }

    try {
      let res;

      if (reasonType === "PAUSE") {
        res = await pauseFundraiserAPI(campaignForReason.f_uuid, reasonText);
      } else if (reasonType === "REJECT") {
        res = await rejectFundraiserAPI(campaignForReason.f_uuid, reasonText);
      } else if (reasonType === "CLOSE") {
        res = await closeFundraisers(campaignForReason.f_uuid, reasonText);
      }

      if (res.status) {
        Swal.fire({
          icon: "success",
          title:
            reasonType === "PAUSE" ? "Paused!" :
              reasonType === "REJECT" ? "Rejected!" : "Closed!",
          text: res.message || `${reasonType === "CLOSE" ? "Fundraiser closed" : reasonType === "PAUSE" ? "Fundraiser paused" : "Fundraiser rejected"}. Notification sent.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.message || "Operation failed" });
      }

      setShowReasonModal(false);
      setCampaignForReason(null);
      setReasonText("");
      fetchCampaigns();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  // ====== HANDLE APPROVE ======
  const handleApprove = async (campaign) => {
    try {
      const res = await approveFundraiserAPI(campaign.f_uuid);
      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: res.message || "Fundraiser approved successfully",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      fetchCampaigns();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to approve fundraiser",
      });
    }
  };

  // ====== HANDLE RESUME ======
  const handleResume = async (campaign) => {
    try {
      const res = await resumeFundraiserAPI(campaign.f_uuid);
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Resumed!",
          text: res.message || "Fundraiser resumed successfully",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
      fetchCampaigns();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to resume fundraiser",
      });
    }
  };

  const openLightbox = (index) => {
    setPhotoIndex(index); // Set the index of the image clicked
    setIsOpen(true); // Open the lightbox
  };

  return (
    <div>
      <Card border="light" className="shadow-sm">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h4 className="mb-0">
            <FontAwesomeIcon icon={faFunnelDollar} className="me-2" />
            Fund Management
          </h4>
        </div>

        <Card.Body>
          {/* FILTER + SEARCH */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All Funds</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CLOSED">Rejected</option>
              </Form.Select>
            </Col>

            <Col md={8}>
              <Form.Control
                placeholder="Search by title or requester"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>

          {/* TABLE */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="text-muted fw-semibold">Loading data, please wait...</div>
            </div>
          ) : (
            <Table bordered hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Sr. No</th>
                  <th>Title</th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th>Raised / Goal</th>
                  <th>Date</th>
                  <th>Verification</th>
                  <th>Story</th>
                  <th>Media</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c, index) => (
                    <tr key={c.f_uuid}>
                      <td>{(page - 1) * campaignsPerPage + index + 1}</td>
                      <td>{c.f_title}</td>
                      <td>{c.userName || "Anonymous"}</td>
                      <td>
                        <Badge bg="info">{getStatusText(c.f_status)}</Badge>
                      </td>
                      <td>${c.f_amount}</td>
                      <td>{new Date(c.f_deadline).toLocaleDateString()}</td>
                      <td>{c.f_status === "ACTIVE" ? "Verified" : "Pending"}</td>

                      {/* Story Column */}
                      <td className="text-truncate" style={{ maxWidth: "200px" }}>
                        {c.f_story ? (
                          c.f_story.length > 100 ? (
                            <>
                              {c.f_story.substring(0, 100)}...{" "}
                              <span
                                className="text-primary"
                                style={{ cursor: "pointer" }}
                                onClick={() => alert("Show full story here")}
                              >
                                Read More
                              </span>
                            </>
                          ) : (
                            c.f_story
                          )
                        ) : (
                          "No story available"
                        )}
                      </td>

                      {/* Media Column (Images + Video) */}
                      <td>
                        <div className="media-container">
                          {c.f_media_one && (
                            <img
                              src={Image_Url + c.f_media_one}
                              alt="Media 1"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                margin: "5px",
                                cursor: "pointer",
                              }}
                              onClick={() => openLightbox(index)} // Open lightbox on click
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultImage; 
                              }}
                            />
                          )}
                          {c.f_media_two && (
                            <img
                              src={Image_Url + c.f_media_two}
                              alt="Media 2"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                margin: "5px",
                                cursor: "pointer",
                              }}
                              onClick={() => openLightbox(index)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultImage;
                              }}
                            />
                          )}
                          {/* Repeat for other images... */}
                        </div>
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="blue"
                          className="me-1 mb-1"
                          onClick={() => setSelectedCampaign(c)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>

                        {c.f_status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              className="me-1 mb-1"
                              onClick={() => handleApprove(c)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="mb-1"
                              onClick={() => openReasonModal(c, "REJECT")}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {c.f_status === "ACTIVE" && (
                          <>
                            <Button
                              size="sm"
                              variant="warning"
                              className="me-1 mb-1"
                              onClick={() => openReasonModal(c, "PAUSE")}
                            >
                              <FontAwesomeIcon icon={faPause} /> Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="mb-1"
                              onClick={() => openReasonModal(c, "CLOSE")}
                            >
                              Close
                            </Button>
                          </>
                        )}

                        {c.f_status === "PAUSED" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              className="me-1 mb-1"
                              onClick={() => handleResume(c)}
                            >
                              <FontAwesomeIcon icon={faPlay} /> Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="mb-1"
                              onClick={() => openReasonModal(c, "CLOSE")}
                            >
                              Close
                            </Button>
                          </>
                        )}

                        {(c.f_status === "CLOSED" || c.f_status === "REJECTED") && (
                          <span className="text-muted">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

          )}
        </Card.Body>

      </Card>

      {/* DETAILS MODAL */}
      <Modal show={!!selectedCampaign} onHide={() => setSelectedCampaign(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Campaign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <>
              <p><strong>Title:</strong> {selectedCampaign.f_title}</p>
              <p><strong>Requester:</strong> {selectedCampaign.userName || "Anonymous"}</p>
              <p><strong>Status:</strong> {getStatusText(selectedCampaign.f_status)}</p>
              <p><strong>Amount:</strong> ${selectedCampaign.f_amount}</p>

              {/* Story Section */}
              <p><strong>Story:</strong></p>
              <p>{selectedCampaign.f_story || "No story available"}</p>

              {/* Media Section */}
              <p><strong>Media:</strong></p>
              <div className="media-container">
                {selectedCampaign.f_media_one && (
                  <img
                    src={Image_Url + selectedCampaign.f_media_one}
                    alt="Media 1"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      margin: "5px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage; 
                    }}
                  />
                )}
                {selectedCampaign.f_media_two && (
                  <img
                    src={Image_Url + selectedCampaign.f_media_two}
                    alt="Media 2"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      margin: "5px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage; 
                    }}
                  />
                )}
                {selectedCampaign.f_media_three && (
                  <img
                    src={Image_Url + selectedCampaign.f_media_three}
                    alt="Media 3"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      margin: "5px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage; 
                    }}
                  />
                )}
                {selectedCampaign.f_media_four && (
                  <img
                    src={Image_Url + selectedCampaign.f_media_four}
                    alt="Media 4"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      margin: "5px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage; 
                    }}
                  />
                )}
                {selectedCampaign.f_media_five && (
                  <video width="100" height="100" controls style={{ margin: "5px" }}>
                    <source src={Image_Url + selectedCampaign.f_media_five} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>Close</Button>
        </Modal.Footer>
      </Modal>


      {/* REASON MODAL */}
      <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {reasonType === "PAUSE" ? "Pause Campaign" :
              reasonType === "REJECT" ? "Reject Campaign" : "Close Campaign"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Enter reason..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReasonModal(false)}>Cancel</Button>
          <Button
            variant={reasonType === "PAUSE" ? "warning" : "danger"}
            onClick={handleReasonSubmit}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
        {isOpen && (
        <ReactImageLightbox
          mainSrc={Image_Url + campaigns[photoIndex].f_media_one}  
          nextSrc={Image_Url + campaigns[(photoIndex + 1) % campaigns.length].f_media_one}
          prevSrc={Image_Url + campaigns[(photoIndex + campaigns.length - 1) % campaigns.length].f_media_one}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + campaigns.length - 1) % campaigns.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % campaigns.length)}
        />
      )}
    </div>
  );
}
