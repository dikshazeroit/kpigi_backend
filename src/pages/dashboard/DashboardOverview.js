import React from "react";
import { Row, Col, Card } from "@themesberg/react-bootstrap";

import {
  CircleChartWidget,
  BarChartWidget,
  ProgressTrackWidget,
  RankingWidget,
  SalesValueWidget,
  SalesValueWidgetPhone,
} from "../../components/Widgets";

import {
  faUsers,
  faHandHoldingHeart,
  faDollarSign,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const DashboardOverview = () => {
  const categoryData = [
    { id: 1, label: "Medical", value: 45, color: "primary" },
    { id: 2, label: "Education", value: 25, color: "success" },
    { id: 3, label: "Business", value: 15, color: "warning" },
    { id: 4, label: "Emergency", value: 15, color: "danger" },
  ];

  const donationChartData = [
    { id: 1, label: "Mon", value: 420, color: "#0d6efd" },
    { id: 2, label: "Tue", value: 380, color: "#28a745" },
    { id: 3, label: "Wed", value: 510, color: "#ffc107" },
    { id: 4, label: "Thu", value: 620, color: "#17a2b8" },
    { id: 5, label: "Fri", value: 480, color: "#dc3545" },
    { id: 6, label: "Sat", value: 540, color: "#6f42c1" },
    { id: 7, label: "Sun", value: 300, color: "#6610f2" },
  ];

  // Summary cards with inline color
  const summaryCards = [
    { icon: faHandHoldingHeart, category: "Total Campaigns", title: "3,280", bgColor: "#4e73df", textColor: "#fff" },
    { icon: faChartLine, category: "Active Campaigns", title: "1,870", bgColor: "#1cc88a", textColor: "#fff" },
    { icon: faDollarSign, category: "Pending Payouts", title: "$42,900", bgColor: "#36b9cc", textColor: "#fff" },
    { icon: faUsers, category: "Total Users", title: "12,540", bgColor: "#f6c23e", textColor: "#343a40" }, 
  ];

  return (
    <div
      className="dashboard-wrapper"
      style={{
        background: "#f5f7fa",
        minHeight: "100vh",
        padding: "30px 30px 20px 30px",
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      {/* SUMMARY CARDS */}
      <Row className="mb-4 g-3">
        {summaryCards.map(({ icon, category, title, bgColor, textColor }, idx) => (
          <Col key={idx} xs={12} sm={6} md={3}>
            <Card
              className="shadow-sm"
              style={{
                padding: "20px",
                borderRadius: "12px",
                minHeight: "130px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                transition: "all 0.3s ease",
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>
                <i className={`fas ${icon.iconName}`} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>
                {category}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.4rem" }}>{title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS ROW */}
      <Row className="mb-4 g-3">
        <Col xs={12} lg={6}>
          <Card className="shadow-sm p-3" style={{ borderRadius: "12px" }}>
            <CircleChartWidget title="Campaign Categories Breakdown" data={categoryData} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="shadow-sm p-3" style={{ borderRadius: "12px" }}>
            <BarChartWidget
              title="Daily Donations"
              value="$58,430"
              percentage={18}
              data={donationChartData}
            />
          </Card>
        </Col>
      </Row>

      {/* REVENUE ROW */}
      <Row className="mb-4 g-3">
        <Col xs={12} lg={6}>
          <SalesValueWidget title="Platform Revenue (Web)" value="$12,740" percentage={10} />
        </Col>
        <Col xs={12} lg={6}>
          <SalesValueWidgetPhone title="Platform Revenue (Mobile)" value="$8,950" percentage={6} />
        </Col>
      </Row>

      {/* PROGRESS + RANKING ROW */}
      <Row className="g-3">
        <Col xs={12} lg={6}>
          <ProgressTrackWidget title="Approval Queue Progress" />
        </Col>
        <Col xs={12} lg={6}>
          <RankingWidget title="Top Performing Campaigns" />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
