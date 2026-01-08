import React, { useEffect, useState } from "react";
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Badge,
    Spinner,
    InputGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faLifeRing
} from "@fortawesome/free-solid-svg-icons";

import {
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaqStatus,
} from "../api/ApiServices";

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    // DELETE MODAL STATES
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteData, setDeleteData] = useState(null);

    const [form, setForm] = useState({
        f_question: "",
        f_answer: "",
    });

    // ================= Fetch FAQs =================
    const fetchFaqs = async () => {
        setLoading(true);
        const res = await getAllFaqs();
        setFaqs(res?.data || []);
        setFiltered(res?.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    // ================= Search =================
    useEffect(() => {
        const s = search.toLowerCase();
        setFiltered(
            faqs.filter((f) =>
                f.f_question.toLowerCase().includes(s)
            )
        );
    }, [search, faqs]);

    // ================= Submit =================
    const handleSubmit = async () => {
        if (!form.f_question.trim() || !form.f_answer.trim()) {
            return Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Both Question and Answer are required.",
            });
        }

        try {
            if (editData) {
                await updateFaq({
                    f_uuid: editData.f_uuid,
                    ...form,
                });

                Swal.fire({
                    icon: "success",
                    title: "FAQ Updated",
                    text: "The FAQ has been updated successfully.",
                    timer: 1800,
                    showConfirmButton: false,
                });

            } else {
                await createFaq(form);

                Swal.fire({
                    icon: "success",
                    title: "FAQ Added",
                    text: "New FAQ added successfully.",
                    timer: 1800,
                    showConfirmButton: false,
                });
            }

            setShowModal(false);
            setEditData(null);
            setForm({ f_question: "", f_answer: "" });
            fetchFaqs();

        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
            });
        }
    };


    // ================= Status Toggle =================
    const handleStatus = async (faq) => {
        await toggleFaqStatus({
            f_uuid: faq.f_uuid,
            f_active: faq.f_active === "1" ? "0" : "1",
        });
        fetchFaqs();
    };

    // ================= Delete =================
    const handleDelete = (faq) => {
        Swal.fire({
            title: "Delete FAQ?",
            text: `Are you sure you want to delete: "${faq.f_question}"`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteFaq(faq.f_uuid);

                    Swal.fire({
                        icon: "success",
                        title: "Deleted",
                        text: "FAQ has been deleted successfully.",
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    fetchFaqs();

                } catch (err) {
                    console.error(err);
                    Swal.fire({
                        icon: "error",
                        title: "Delete Failed",
                        text: "Could not delete FAQ.",
                    });
                }
            }
        });
    };


    const confirmDelete = async () => {
        await deleteFaq(deleteData.f_uuid);
        setShowDeleteModal(false);
        setDeleteData(null);
        fetchFaqs();
    };

    return (
        <Card border="light" className="shadow-sm">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                    <h4 className="m-0">
                        <FontAwesomeIcon icon={faLifeRing} className="me-2" />
                        FAQ Management
                    </h4>
                    <p className="text-muted mb-0">Manage your Frequently Asked Questions</p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => {
                        setEditData(null);
                        setForm({ f_question: "", f_answer: "" });
                        setShowModal(true);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add FAQ
                </Button>
            </div>


            {/* BODY */}
            <Card.Body>
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search question..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                        <div className="text-muted fw-semibold">
                            Loading Faq data....
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <h6>No FAQs found</h6>
                        <small>Add FAQs to help users</small>
                    </div>
                ) : (
                    <Table responsive hover className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Sr. No.</th>
                                <th>Question</th>
                                <th>Answer</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((faq, index) => (
                                <tr key={faq.f_uuid}>
                                    <td>{index + 1}</td> {/* Sr. No. */}
                                    <td><strong>{faq.f_question}</strong></td>

                                    <td className="text-muted">
                                        {faq.f_answer.length > 80
                                            ? faq.f_answer.substring(0, 80) + "..."
                                            : faq.f_answer}
                                    </td>

                                    <td>
                                        <Form.Check
                                            type="switch"
                                            checked={faq.f_active === "1"}
                                            onChange={() => handleStatus(faq)}
                                            label={
                                                <Badge bg={faq.f_active === "1" ? "success" : "secondary"}>
                                                    {faq.f_active === "1" ? "ACTIVE" : "INACTIVE"}
                                                </Badge>
                                            }
                                        />
                                    </td>

                                    <td className="text-end">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            className="me-2"
                                            onClick={() => {
                                                setEditData(faq);
                                                setForm({
                                                    f_question: faq.f_question,
                                                    f_answer: faq.f_answer,
                                                });
                                                setShowModal(true);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleDelete(faq)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                )}
            </Card.Body>

            {/* ADD / EDIT MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editData ? "Edit FAQ" : "Add FAQ"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            value={form.f_question}
                            onChange={(e) =>
                                setForm({ ...form, f_question: e.target.value })
                            }
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Answer</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={form.f_answer}
                            onChange={(e) =>
                                setForm({ ...form, f_answer: e.target.value })
                            }
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Save FAQ
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* DELETE CONFIRM MODAL */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger">
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Delete FAQ
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center">
                    <p>Are you sure you want to delete this FAQ?</p>
                    <div className="bg-light p-3 rounded">
                        <strong>{deleteData?.f_question}</strong>
                    </div>
                    <p className="text-muted mt-3 mb-0">
                        This action cannot be undone.
                    </p>
                </Modal.Body>

                <Modal.Footer className="justify-content-center">
                    <Button variant="light" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Yes, Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default Faq;
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Table,
//   Button,
//   Modal,
//   Form,
//   Badge,
//   Spinner,
//   InputGroup,
//   Breadcrumb,
// } from "@themesberg/react-bootstrap";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faPlus,
//   faEdit,
//   faTrash,
//   faSearch,
//   faHome,
// } from "@fortawesome/free-solid-svg-icons";
// import { Link } from "react-router-dom";

// import {
//   getAllFaqs,
//   createFaq,
//   updateFaq,
//   deleteFaq,
//   toggleFaqStatus,
// } from "../../api/ApiServices";

// const FaqsPage = () => {
//   const [faqs, setFaqs] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [search, setSearch] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editData, setEditData] = useState(null);

//   // DELETE MODAL STATES
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleteData, setDeleteData] = useState(null);

//   const [form, setForm] = useState({
//     f_question: "",
//     f_answer: "",
//   });

//   // ================= Fetch FAQs =================
//   const fetchFaqs = async () => {
//     setLoading(true);
//     const res = await getAllFaqs();
//     setFaqs(res?.data || []);
//     setFiltered(res?.data || []);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchFaqs();
//   }, []);

//   // ================= Search =================
//   useEffect(() => {
//     const s = search.toLowerCase();
//     setFiltered(
//       faqs.filter((f) =>
//         f.f_question.toLowerCase().includes(s)
//       )
//     );
//   }, [search, faqs]);

//   // ================= Submit =================
//   const handleSubmit = async () => {
//     if (!form.f_question.trim() || !form.f_answer.trim()) {
//       return alert("Question and Answer both required");
//     }

//     if (editData) {
//       await updateFaq({
//         f_uuid: editData.f_uuid,
//         ...form,
//       });
//     } else {
//       await createFaq(form);
//     }

//     setShowModal(false);
//     setEditData(null);
//     setForm({ f_question: "", f_answer: "" });
//     fetchFaqs();
//   };

//   // ================= Status Toggle =================
//   const handleStatus = async (faq) => {
//     await toggleFaqStatus({
//       f_uuid: faq.f_uuid,
//       f_active: faq.f_active === "1" ? "0" : "1",
//     });
//     fetchFaqs();
//   };

//   // ================= Delete =================
//   const handleDelete = (faq) => {
//     setDeleteData(faq);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     await deleteFaq(deleteData.f_uuid);
//     setShowDeleteModal(false);
//     setDeleteData(null);
//     fetchFaqs();
//   };

//   return (
//     <Card border="light" className="shadow-sm">
//       {/* HEADER */}
//       <div className="d-flex justify-content-between align-items-center page-header mb-4">
//         <Breadcrumb className="breadcrumb-dark breadcrumb-transparent">
//           <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
//             <FontAwesomeIcon icon={faHome} /> Home
//           </Breadcrumb.Item>
//           <Breadcrumb.Item active>FAQ Management</Breadcrumb.Item>
//         </Breadcrumb>

//         <Button
//           variant="primary"
//           onClick={() => {
//             setEditData(null);
//             setForm({ f_question: "", f_answer: "" });
//             setShowModal(true);
//           }}
//         >
//           <FontAwesomeIcon icon={faPlus} className="me-2" />
//           Add FAQ
//         </Button>
//       </div>

//       {/* BODY */}
//       <Card.Body>
//         <InputGroup className="mb-3">
//           <InputGroup.Text>
//             <FontAwesomeIcon icon={faSearch} />
//           </InputGroup.Text>
//           <Form.Control
//             placeholder="Search question..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </InputGroup>

//         {loading ? (
//           <div className="text-center py-5">
//             <Spinner animation="border" />
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-5 text-muted">
//             <h6>No FAQs found</h6>
//             <small>Add FAQs to help users</small>
//           </div>
//         ) : (
//           <Table responsive hover className="align-middle">
//             <thead className="bg-light">
//               <tr>
//                 <th>Question</th>
//                 <th>Answer</th>
//                 <th>Status</th>
//                 <th className="text-end">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((faq) => (
//                 <tr key={faq.f_uuid}>
//                   <td><strong>{faq.f_question}</strong></td>

//                   <td className="text-muted">
//                     {faq.f_answer.length > 80
//                       ? faq.f_answer.substring(0, 80) + "..."
//                       : faq.f_answer}
//                   </td>

//                   <td>
//                     <Form.Check
//                       type="switch"
//                       checked={faq.f_active === "1"}
//                       onChange={() => handleStatus(faq)}
//                       label={
//                         <Badge bg={faq.f_active === "1" ? "success" : "secondary"}>
//                           {faq.f_active === "1" ? "ACTIVE" : "INACTIVE"}
//                         </Badge>
//                       }
//                     />
//                   </td>

//                   <td className="text-end">
//                     <Button
//                       size="sm"
//                       variant="outline-primary"
//                       className="me-2"
//                       onClick={() => {
//                         setEditData(faq);
//                         setForm({
//                           f_question: faq.f_question,
//                           f_answer: faq.f_answer,
//                         });
//                         setShowModal(true);
//                       }}
//                     >
//                       <FontAwesomeIcon icon={faEdit} />
//                     </Button>

//                     <Button
//                       size="sm"
//                       variant="outline-danger"
//                       onClick={() => handleDelete(faq)}
//                     >
//                       <FontAwesomeIcon icon={faTrash} />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         )}
//       </Card.Body>

//       {/* ADD / EDIT MODAL */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>{editData ? "Edit FAQ" : "Add FAQ"}</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Question</Form.Label>
//             <Form.Control
//               value={form.f_question}
//               onChange={(e) =>
//                 setForm({ ...form, f_question: e.target.value })
//               }
//             />
//           </Form.Group>

//           <Form.Group>
//             <Form.Label>Answer</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={4}
//               value={form.f_answer}
//               onChange={(e) =>
//                 setForm({ ...form, f_answer: e.target.value })
//               }
//             />
//           </Form.Group>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="light" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSubmit}>
//             Save FAQ
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* DELETE CONFIRM MODAL */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title className="text-danger">
//             <FontAwesomeIcon icon={faTrash} className="me-2" />
//             Delete FAQ
//           </Modal.Title>
//         </Modal.Header>

//         <Modal.Body className="text-center">
//           <p>Are you sure you want to delete this FAQ?</p>
//           <div className="bg-light p-3 rounded">
//             <strong>{deleteData?.f_question}</strong>
//           </div>
//           <p className="text-muted mt-3 mb-0">
//             This action cannot be undone.
//           </p>
//         </Modal.Body>

//         <Modal.Footer className="justify-content-center">
//           <Button variant="light" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={confirmDelete}>
//             Yes, Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Card>
//   );
// };

// export default FaqsPage;
