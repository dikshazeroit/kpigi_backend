import React, { useState } from "react";
import { useHistory } from "react-router-dom"; // ✅ Add this
import {
  faUsers,
  faUserTie,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { Col, Row } from "@themesberg/react-bootstrap";
import {
  BarChartWidget,
  TeamMembersWidget,
  ProgressTrackWidget,
  RankingWidget,
  SalesValueWidget,
  SalesValueWidgetPhone,
} from "../../components/Widgets";
import { totalOrders } from "../../data/charts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Dashboard() {
  const history = useHistory(); // ✅ Initialize history


  const [stats] = useState({
    totalUsers: 12,
    totalCircles: 30,
    totalContribution: "1000",
  });


  // Reusable Stat Card component
  const StatCard = ({ title, count, icon, gradient }) => (
    <div
      className="p-4 shadow-sm text-white"
      style={{
        background: gradient,
        borderRadius: "10px", // slight smooth edges
        cursor: "pointer",
      }}
      onClick={() => history.push("/tables/user-tables")} // ✅ Navigate on click
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-light mb-1">{title}</h6>
          <h2 className="fw-bold mb-0">{count}</h2>
        </div>
        {/* Smaller icon without circle */}
        <div className="fs-3 opacity-75">
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* --- Stats Section --- */}
      <Row className="justify-content-md-center mt-4">
        <Col xs={12} sm={6} xl={4} className="mb-4">
          <StatCard
            title="Total Users"
            count={stats.totalUsers}
            icon={faUsers}
            gradient="linear-gradient(135deg, #4e54c8, #8f94fb)"
          />
        </Col>

        <Col xs={12} sm={6} xl={4} className="mb-4">
          <StatCard
            title="Total Circles"
            count={stats.totalCircles}
            icon={faUserTie}
            gradient="linear-gradient(135deg, #11998e, #38ef7d)"
          />
        </Col>

        <Col xs={12} sm={6} xl={4} className="mb-4">
          <StatCard
            title="Total Contribution"
            count={stats.totalContribution}
            icon={faDollarSign}
            gradient="linear-gradient(135deg, #ff512f, #dd2476)"
          />
        </Col>
      </Row>

      {/* --- Sales Section --- */}
      <Row>
        <Col xs={12} className="mb-4 d-none d-sm-block">
          <SalesValueWidget />
        </Col>

        <Col xs={12} className="mb-4 d-sm-none">
          <SalesValueWidgetPhone />
        </Col>
      </Row>

      {/* --- Bottom Widgets --- */}
      <Row>
        <Col xs={12} xl={12} className="mb-4">
          <Row>
            <Col xs={12} xl={8} className="mb-4">
              <Row>
                <Col xs={12} lg={6} className="mb-4">
                  <TeamMembersWidget />
                </Col>
                <Col xs={12} lg={6} className="mb-4">
                  <ProgressTrackWidget />
                </Col>
              </Row>
            </Col>

            <Col xs={12} xl={4}>
              <Row>
                <Col xs={12} className="mb-4">
                  <BarChartWidget
                    title="Total Orders"
                    value={452}
                    percentage={18.2}
                    data={totalOrders}
                  />
                </Col>
                <Col xs={12} className="px-0 mb-4">
                  <RankingWidget />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}
