import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Spinner, Badge } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faHandHoldingHeart,
  faDollarSign,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

import { CircleChartWidget, BarChartWidget } from "../../components/Widgets";

import {
  getDashboardSummary,
  getDashboardStats,
  getRecentActivities,
} from "../../api/ApiServices";

const DashboardOverview = () => {
  // ✅ SAFE DEFAULT STATE
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalFunds: 0,
    activeFunds: 0,
    pendingPayouts: 0,
  });

  const [donationStats, setDonationStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [summaryRes, statsRes, activityRes] = await Promise.all([
        getDashboardSummary(),
        getDashboardStats(),
        getRecentActivities(),
      ]);
      console.log("SUMMARY FROM API →", summary);


      // ✅ SUMMARY
      setSummary(summaryRes.data); 


      // ✅ STATS (array from aggregation)
      setDonationStats(statsRes?.data?.data || []);

      // ✅ RECENT FUNDS AS ACTIVITIES
      setActivities(activityRes?.data?.data || []);
    } catch (err) {
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

 const summaryCards = [
  {
    icon: faUsers,
    label: "Total Users",
    value: summary?.totalUsers || 0,
    bg: "#4e73df",
  },
  {
    icon: faHandHoldingHeart,
    label: "Total Fundraisers",
    value: summary?.totalFunds || 0,
    bg: "#1cc88a",
  },
  {
    icon: faChartLine,
    label: "Active Fundraisers",
    value: summary?.activeFunds || 0,
    bg: "#36b9cc",
  },
  {
    icon: faDollarSign,
    label: "Pending Payouts",
    value: summary?.pendingPayouts || 0,
    bg: "#f6c23e",
  },
];


  // ✅ BAR CHART DATA (from aggregation)
  const barChartData = donationStats.map((item, index) => ({
    id: index + 1,
    label: `Day ${item._id}`,
    value: item.total,
  }));

  return (
    <div className="dashboard-wrapper" style={{ padding: "30px" }}>
      {/* SUMMARY CARDS */}
      <Row className="mb-4 g-3">
        {summaryCards.map((card, idx) => (
          <Col key={idx} xs={12} sm={6} md={3}>
            <Card
              className="shadow-sm"
              style={{
                background: card.bg,
                color: "#fff",
                borderRadius: "14px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <FontAwesomeIcon icon={card.icon} size="2x" className="mb-2" />
              <h6 className="mb-1">{card.label}</h6>
              <h4 className="fw-bold">{card.value}</h4>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHART */}
      <Row className="mb-4 g-3">
        <Col lg={12}>
          <Card className="shadow-sm p-3 rounded-4">
            <BarChartWidget
              title="Donations Overview"
              value=""
              percentage={0}
              data={barChartData}
            />
          </Card>
        </Col>
      </Row>

      {/* RECENT ACTIVITIES (FUNDS) */}
      <Row>
        <Col>
          <Card className="shadow-sm rounded-4">
            <Card.Header>
              <h5 className="mb-0">Recent Fundraisers</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    activities.map((fund) => (
                      <tr key={fund._id}>
                        <td>{fund.f_title}</td>
                        <td>
                          <Badge bg={fund.f_status === "ACTIVE" ? "success" : "secondary"}>
                            {fund.f_status}
                          </Badge>
                        </td>
                        <td>{new Date(fund.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
