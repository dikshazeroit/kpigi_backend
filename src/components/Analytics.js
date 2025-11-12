import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  ProgressBar,
  Pagination,
  Form,
  InputGroup,
  FormControl,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";

const AnalyticsPage = () => {
  // Example analytics data
  const [analyticsData] = useState([
    { id: 1, metric: "Total Users", value: 1200, progress: 75 },
    { id: 2, metric: "Active Sessions", value: 450, progress: 60 },
    { id: 3, metric: "New Signups", value: 300, progress: 40 },
    { id: 4, metric: "Revenue", value: "$12,000", progress: 80 },
    { id: 5, metric: "Transactions", value: 540, progress: 55 },
    { id: 6, metric: "Refunds", value: 30, progress: 10 },
    { id: 7, metric: "Engagement Rate", value: "68%", progress: 68 },
    { id: 8, metric: "User Retention", value: "85%", progress: 85 },
  ]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filter data based on search query
  const filteredData = analyticsData.filter((item) =>
    item.metric.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      {/* Header with Search Bar */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h5>
              <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
              Analytics Dashboard
            </h5>
            <p className="mb-0 text-muted">Overview of key metrics and performance.</p>
          </div>

          <div className="d-flex align-items-center mt-2 mt-md-0">
            {/* Search Bar */}
            <InputGroup className="me-2">
              <FormControl
                placeholder="🔍Search metrics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to first page on search
                }}
              />
              <InputGroup.Text>
                
              </InputGroup.Text>
            </InputGroup>

            {/* Export Button */}
            <Button variant="primary">
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              Export Report
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mb-4">
        {analyticsData.slice(0, 4).map((data) => (
          <Col key={data.id} sm={6} lg={3} className="mb-3">
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <Card.Title className="fw-bold text-muted">{data.metric}</Card.Title>
                <h3 className="fw-bold text-dark">{data.value}</h3>
                <ProgressBar now={data.progress} label={`${data.progress}%`} className="mt-2" />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3 fw-bold">Recent Activity</h5>

          <Table hover responsive bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Metric</th>
                <th>Value</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((data, index) => (
                  <tr key={data.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{data.metric}</td>
                    <td>{data.value}</td>
                    <td>
                      <ProgressBar
                        now={data.progress}
                        label={`${data.progress}%`}
                        variant={data.progress > 70 ? "success" : "info"}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No metrics found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center my-3">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />

                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          <div className="text-center text-muted small">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
