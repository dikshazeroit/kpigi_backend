import React from "react";
import { Row, Col } from "@themesberg/react-bootstrap";

import {
  CounterWidget,
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
  // Pie Chart – Campaign Categories Breakdown
  const categoryData = [
    { id: 1, label: "Medical", value: 45, color: "primary" },
    { id: 2, label: "Education", value: 25, color: "success" },
    { id: 3, label: "Business", value: 15, color: "warning" },
    { id: 4, label: "Emergency", value: 15, color: "danger" },
  ];

  // Bar Chart – Daily Donations
  const donationChartData = [
    { id: 1, label: "Mon", value: 420, color: "#0d6efd" },
    { id: 2, label: "Tue", value: 380, color: "#28a745" },
    { id: 3, label: "Wed", value: 510, color: "#ffc107" },
    { id: 4, label: "Thu", value: 620, color: "#17a2b8" },
    { id: 5, label: "Fri", value: 480, color: "#dc3545" },
    { id: 6, label: "Sat", value: 540, color: "#6f42c1" },
    { id: 7, label: "Sun", value: 300, color: "#6610f2" },
  ];

  return (
    <div
      className="dashboard-wrapper"
      style={{ background: "#f5f7fa", minHeight: "100vh", padding: "20px" }}
    >
      {/* ========================== */}
      {/*       SUMMARY CARDS        */}
      {/* ========================== */}

      <Row className="mb-4">
        <Col sm={6} xl={3} className="mb-4">
          <CounterWidget
            icon={faHandHoldingHeart}
            iconColor="primary"
            category="Total Campaigns"
            title="3,280"
            style={{
              backgroundColor: "blue",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)"
            }}
          />
        </Col>

        <Col sm={6} xl={3} className="mb-4">
          <CounterWidget
            icon={faChartLine}
            iconColor="success"
            category="Active Campaigns"
            title="1,870"
            style={{
              backgroundColor: "#28a745",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)"
            }}
          />
        </Col>

        <Col sm={6} xl={3} className="mb-4">
          <CounterWidget
            icon={faDollarSign}
            iconColor="warning"
            category="Pending Payouts"
            title="$42,900"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)"
            }}
          />
        </Col>

        <Col sm={6} xl={3} className="mb-4">
          <CounterWidget
            icon={faUsers}
            iconColor="info"
            category="Total Users"
            title="12,540"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)"
            }}
          />
        </Col>
      </Row>

      {/* ========================== */}
      {/*   CATEGORY + DONATIONS     */}
      {/* ========================== */}

      <Row className="mb-4">
        <Col xs={12} xl={6} className="mb-4">
          <CircleChartWidget
            title="Campaign Categories Breakdown"
            data={categoryData}
          />
        </Col>

        <Col xs={12} xl={6} className="mb-4">
          <BarChartWidget
            title="Daily Donations"
            value="$58,430"
            percentage={18}
            data={donationChartData}
          />
        </Col>
      </Row>

      {/* ========================== */}
      {/*      SALES WIDGETS         */}
      {/* ========================== */}

      <Row className="mb-4">
        <Col xs={12} xl={6} className="mb-4">
          <SalesValueWidget title="Platform Revenue (Web)" value="$12,740" percentage={10} />
        </Col>

        <Col xs={12} xl={6} className="mb-4">
          <SalesValueWidgetPhone
            title="Platform Revenue (Mobile)"
            value="$8,950"
            percentage={6}
          />
        </Col>
      </Row>

      {/* ========================== */}
      {/*   PROGRESS + RANKING       */}
      {/* ========================== */}

      <Row className="mb-4">
        <Col xs={12} xl={6} className="mb-4">
          <ProgressTrackWidget title="Approval Queue Progress" />
        </Col>

        <Col xs={12} xl={6} className="mb-4">
          <RankingWidget title="Top Performing Campaigns" />
        </Col>
      </Row>

    </div>
  );
};

export default DashboardOverview;
