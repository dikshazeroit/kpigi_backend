import React, { useState, useEffect } from "react";
import { Card, Table, Button, Spinner } from "@themesberg/react-bootstrap";

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDisputes([
        { id: 1, user: "John Doe", issue: "Payment not received", status: "Open" },
        { id: 2, user: "Jane Smith", issue: "Refund request", status: "Resolved" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-3">
      <Card className="mb-4 p-3 d-flex flex-row justify-content-between align-items-center">
        <h5 className="mb-0">Disputes & Support</h5>
      </Card>

      <Card className="p-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading disputes...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d, idx) => (
                <tr key={d.id}>
                  <td>{idx + 1}</td>
                  <td>{d.user}</td>
                  <td>{d.issue}</td>
                  <td>{d.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default DisputesPage;
