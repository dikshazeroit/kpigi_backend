import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  faUsers,
  faUserTie,
  faWallet,
  faShieldAlt,
  faHandHoldingUsd,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Card } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  BarChartWidget,
  TeamMembersWidget,
  ProgressTrackWidget,
  RankingWidget,
  SalesValueWidget,
  SalesValueWidgetPhone,
} from "../../components/Widgets";
import { totalOrders } from "../../data/charts";

export default function Dashboard() {
  const history = useHistory();

  //  Metrics
  const [stats] = useState({
    totalCircles: 18,
    totalMembers: 342,
    totalContributions: "₹2,45,000",
    totalPayouts: "₹1,75,000",
    walletBalance: "₹68,400",
    complianceScore: "98%",
  });

  //  Reusable Stat Card
  const StatCard = ({ title, count, icon, gradient, onClick }) => (
    <Card
      className="border-0 text-white shadow-sm hover-scale"
      style={{
        background: gradient,
        borderRadius: "12px",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <Card.Body className="d-flex justify-content-between align-items-center py-4 px-3">
        <div>
          <h6 className="fw-light mb-1">{title}</h6>
          <h2 className="fw-bold mb-0">{count}</h2>
        </div>
        <div className="fs-2 opacity-75">
          <FontAwesomeIcon icon={icon} />
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <>

      {/* --- Top Cards Row --- */}
      <Row className="g-4">
        <Col xs={12} sm={6} xl={4}>
          <StatCard
            title="Total Circles"
            count={stats.totalCircles}
            icon={faUserTie}
            gradient="linear-gradient(135deg, #36D1DC, #5B86E5)"
            onClick={() => history.push("/circle/circles")} />
        </Col>

        <Col xs={12} sm={6} xl={4}>
          <StatCard
            title="Total Members"
            count={stats.totalMembers}
            icon={faUsers}
            gradient="linear-gradient(135deg, #11998e, #38ef7d)"
            onClick={() => history.push("/tables/user-tables")} />
        </Col>

        <Col xs={12} sm={6} xl={4}>
          <StatCard
            title="Total Contributions"
            count={stats.totalContributions}
            icon={faChartLine}
            gradient="linear-gradient(135deg, #ff512f, #dd2476)"
            onClick={() => history.push("analytics/Analytics")}
          />
        </Col>
      </Row>

      {/* --- Second Row --- */}
      <Row className="g-4 mt-1">
        <Col xs={12} sm={6} xl={6}>
          <StatCard
            title="Total Payouts"
            count={stats.totalPayouts}
            icon={faHandHoldingUsd}
            gradient="linear-gradient(135deg, #f7971e, #ffd200)"
            onClick={() => history.push("/payouts/Payouts")}
          />
        </Col>

        <Col xs={12} sm={6} xl={6}>
          <StatCard
            title="Wallet Balance"
            count={stats.walletBalance}
            icon={faWallet}
            gradient="linear-gradient(135deg, #4e54c8, #8f94fb)"
            onClick={() => history.push("/wallet/wallets")}
          />
        </Col>
      </Row>

      {/* --- Third Row (Payout Chart) --- */}
      <Row className="g-4 mt-1">
        {/* Desktop / Tablet view */}
        <Col xs={12} sm={12} xl={12} className="d-none d-sm-block">
          <SalesValueWidget title="Payouts" />
        </Col>

        {/* Mobile view */}
        <Col xs={12} className="d-sm-none">
          <SalesValueWidgetPhone />
        </Col>
      </Row>

      {/* --- Bottom Widgets --- */}
      <Row className="g-4 mt-4">
        {/* Left side: Team + Payout tracking */}
        <Col xs={12} xl={8}>
          <Row className="g-4">
            <Col xs={12} lg={6}>
              <TeamMembersWidget title="Top Performing Circles" />
            </Col>
            <Col xs={12} lg={6}>
              <ProgressTrackWidget title="Payout Tracking" />
            </Col>
          </Row>
        </Col>

        {/* Right side: Charts */}
        <Col xs={12} xl={4}>
          <Row className="g-4">
            <Col xs={12}>
              <BarChartWidget
                title="Circle Contribution Growth"
                value={452}
                percentage={18.2}
                data={totalOrders}
              />
            </Col>
            <Col xs={12}>
              <RankingWidget title="Top Members by Contributions" />
            </Col>
          </Row>
        </Col>
      </Row>

    </>
  );
}
