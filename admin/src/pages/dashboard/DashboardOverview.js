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
import { useHistory } from "react-router-dom";

import {
  getDashboardSummary,
  getDashboardStats,
  getRecentActivities,
} from "../../api/ApiServices";

const DashboardOverview = () => {
  const history = useHistory();
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
      setSummary(summaryRes.data);
      setDonationStats(statsRes?.data?.data || []);
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
    { icon: faUsers, label: "Total Users", value: summary.totalUsers, bg: "#2e59d9", textColor: "#ffffff", route: "/tables/user-list" },
    { icon: faHandHoldingHeart, label: "Total Fundraisers", value: summary.totalFunds, bg: "#17a673", textColor: "#ffffff", route: "/campaigns/list" },
    { icon: faChartLine, label: "Active Fundraisers", value: summary.activeFunds, bg: "#2c9faf", textColor: "#ffffff", route: "/campaigns/list" },
    { icon: faDollarSign, label: "Pending Payouts", value: summary.pendingPayouts, bg: "#dda20a", textColor: "#ffffff", route: "/payouts/list" },
  ];

  const barChartData = donationStats.map((item, index) => ({
    id: index + 1,
    label: `Day ${item._id}`,
    value: item.total,
  }));


  const cardStyle = (bg, color) => ({
    background: bg,
    color: color,
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginTop: "20px",
    transition: "transform 0.2s, box-shadow 0.2s",
  });

  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  };

  return (
    <div className="dashboard-wrapper" style={{ padding: "30px" }}>
      {/* Inline <style> for hover */}
      <style>{`
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* SUMMARY CARDS */}
      <Row className="mb-4 g-3">
        {summaryCards.map((card, idx) => (
          <Col key={idx} xs={12} sm={6} md={3}>
            <Card
              className="shadow-sm dashboard-card"
              style={{
                background: card.bg,
                color: card.textColor, 
                borderRadius: "14px",
                padding: "20px",
                textAlign: "center",
                cursor: card.route ? "pointer" : "default",
                marginTop: "20px",
              }}
              onClick={() => card.route && history.push(card.route)}
            >
              <FontAwesomeIcon icon={card.icon} size="2x" className="mb-2" style={{ color: card.textColor }} />
              <h6 className="mb-1" style={{ color: card.textColor }}>{card.label}</h6>
              <h4 className="fw-bold" style={{ color: card.textColor }}>{card.value}</h4>
            </Card>
          </Col>
        ))}
      </Row>

      {/* BAR CHART */}
      <Row className="mb-4 g-3">
        <Col lg={12}>
          <Card className="shadow-sm p-3 rounded-4">
            <BarChartWidget title="Donations Overview" value="" percentage={0} data={barChartData} />
          </Card>
        </Col>
      </Row>

      {/* RECENT ACTIVITIES */}
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
                      <td colSpan="3" className="text-center">No records found</td>
                    </tr>
                  ) : (
                    activities.map((fund) => (
                      <tr key={fund._id}>
                        <td>{fund.f_title}</td>
                        <td>
                          <Badge bg={fund.f_status === "ACTIVE" ? "success" : "secondary"}>{fund.f_status}</Badge>
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
