import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, Table, Button, Image } from "@themesberg/react-bootstrap";

// Dummy Data
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    image: "https://via.placeholder.com/50"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 9123456789",
    image: "https://via.placeholder.com/50"
  },
  {
    id: 3,
    name: "Robert Brown",
    email: "robert@example.com",
    phone: "+91 9988776655",
    image: "https://via.placeholder.com/50"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+91 9090909090",
    image: "https://via.placeholder.com/50"
  },
  {
    id: 5,
    name: "David Miller",
    email: "david@example.com",
    phone: "+91 9871234567",
    image: "https://via.placeholder.com/50"
  },
];

export const PageUserTable = () => {
  const TableRow = ({ id, name, email, phone, image }) => {
    return (
      <tr>
        <td>{id}</td>
        <td>
          <Image
            src={image}
            roundedCircle
            width={40}
            height={40}
            className="me-2"
          />
        </td>
        <td>{name}</td>
        <td>{email}</td>
        <td>{phone}</td>
        <td>
          <Button variant="info" size="sm" className="me-2">
            <FontAwesomeIcon icon={faEye} className="me-1" /> View
          </Button>
          <Button variant="primary" size="sm" className="me-2">
            <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
          </Button>
          <Button variant="danger" size="sm">
            <FontAwesomeIcon icon={faTrashAlt} className="me-1" /> Delete
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <Card border="light" className="table-wrapper table-responsive shadow-sm">
      <Card.Header>
        <h5 className="mb-0">Users List</h5>
      </Card.Header>
      <Card.Body className="pt-0">
        <Table hover className="user-table align-items-center">
          <thead>
            <tr>
              <th className="border-bottom">Sr No.</th>
              <th className="border-bottom">Image</th>
              <th className="border-bottom">Name</th>
              <th className="border-bottom">Email</th>
              <th className="border-bottom">Phone No.</th>
              <th className="border-bottom">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id} {...user} />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
