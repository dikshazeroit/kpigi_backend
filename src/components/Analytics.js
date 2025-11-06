import React, { useState } from "react";
import { Card, Table, Button, Row, Col, ProgressBar } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faDownload } from "@fortawesome/free-solid-svg-icons";

const AnalyticsPage = () => {
  // Example analytics data
  const [analyticsData] = useState([
    { id: 1, metric: "Total Users", value: 1200, progress: 75 },
    { id: 2, metric: "Active Sessions", value: 450, progress: 60 },
    { id: 3, metric: "New Signups", value: 300, progress: 40 },
    { id: 4, metric: "Revenue", value: "$12,000", progress: 80 },
  ]);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h5>
              <FontAwesomeIcon icon={faChartLine} className="me-2" />
              Analytics Dashboard
            </h5>
            <p className="mb-0 text-muted">Overview of key metrics and performance.</p>
          </div>
          <Button variant="primary">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export Report
          </Button>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        {analyticsData.map((data) => (
          <Col key={data.id} sm={6} lg={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>{data.metric}</Card.Title>
                <h3>{data.value}</h3>
                <ProgressBar now={data.progress} label={`${data.progress}%`} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <Card.Body>
          <h5 className="mb-3">Recent Activity</h5>
          <Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Metric</th>
                <th>Value</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((data) => (
                <tr key={data.id}>
                  <td>{data.id}</td>
                  <td>{data.metric}</td>
                  <td>{data.value}</td>
                  <td>
                    <ProgressBar now={data.progress} label={`${data.progress}%`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
