import React, { useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faChartLine, faFlagUsa, faFolderOpen, faGlobeEurope, faPen } from '@fortawesome/free-solid-svg-icons';
import { faAngular, faBootstrap, faReact, faVuejs } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Card, Image, Button, ListGroup, ProgressBar } from '@themesberg/react-bootstrap';
import { CircleChart, BarChart, SalesValueChart, SalesValueChartPhone } from "./Charts";
import { useHistory } from "react-router-dom";

import Profile1 from "../assets/img/team/profile-picture-3.jpg";
import ProfileCover from "../assets/img/pages/profile-cover.jpg";
import teamMembers from "../data/teamMembers";

// ------------------ Profile Card Widget ------------------
export const ProfileCardWidget = () => {
  const history = useHistory();
  const fileInputRef = useRef(null);
  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (file) console.log("Selected file:", file);
  };

  return (
    <Card border="light" className="text-center p-0 mb-4 position-relative">
      <div
        style={{ backgroundImage: `url(${ProfileCover})`, height: "200px", backgroundSize: "cover", backgroundPosition: "center" }}
        className="profile-cover rounded-top"
      />
      <FontAwesomeIcon
        icon={faPen}
        title="Edit Cover Image"
        onClick={() => fileInputRef.current.click()}
        style={{
          position: "absolute", top: "10px", right: "20px", cursor: "pointer",
          color: "#333", background: "#fff", padding: "10px", borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)", height: "36px", width: "36px",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
        }}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      />
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleCoverChange} />

      <Card.Body className="pb-5">
        <Card.Img src={Profile1} alt="Profile" className="user-avatar large-avatar rounded-circle mx-auto mt-n7 mb-4" />
        <Card.Title>abc</Card.Title>
        <Card.Subtitle className="fw-normal">Admin</Card.Subtitle>

        { <div className="text-start px-4">
          {  <h5 className="fw-bold mb-3">Profile Information</h5> }
          <p className="mb-1"><strong>Full Name:</strong> abc</p>
          <p className="mb-1"><strong>Mobile:</strong> 7876299622</p>
          <p className="mb-1"><strong>Email:</strong> abc@mailinator.com</p>
          <p className="mb-0"><strong>Location:</strong> Kharar, Mohali</p>
        </div> }

        <FontAwesomeIcon
          icon={faPen}
          onClick={() => history.push("/editProfile")}
          style={{
            position: "absolute", top: "345px", right: "15px", cursor: "pointer",
            color: "#555", background: "#fff", padding: "8px", borderRadius: "50%",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)", height: "30px", width: "30px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px"
          }}
        />
      </Card.Body>
    </Card>
  );
};
 
// ------------------ Counter Widget ------------------
export const CounterWidget = ({ icon, iconColor, category, title }) => (
  <Card border="light" className="shadow-sm">
    <Card.Body>
      <Row className="d-block d-xl-flex align-items-center">
        <Col xl={5} className="text-xl-center d-flex align-items-center justify-content-xl-center mb-3 mb-xl-0">
          <div className={`icon icon-shape icon-md icon-${iconColor} rounded me-4 me-sm-0`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <div className="d-sm-none">
            <h5>{category}</h5>
            <h3 className="mb-1">{title}</h3>
          </div>
        </Col>
        <Col xs={12} xl={7} className="px-xl-0">
          <div className="d-none d-sm-block">
            <h5>{category}</h5>
            <h3 className="mb-1">{title}</h3>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

// ------------------ Circle Chart Widget ------------------
export const CircleChartWidget = ({ title, data = [] }) => {
  const series = data.map(d => d.value);
  return (
    <Card border="light" className="shadow-sm">
      <Card.Body>
        <Row className="d-block d-xl-flex align-items-center">
          <Col xs={12} xl={5} className="text-xl-center d-flex align-items-center justify-content-xl-center mb-3 mb-xl-0">
            <CircleChart series={series} />
          </Col>
          <Col xs={12} xl={7} className="px-xl-0">
            <h5 className="mb-3">{title}</h5>
            {data.map(d => (
              <h6 key={d.id} className="fw-normal text-gray">
                <FontAwesomeIcon icon={d.icon} className={`icon icon-xs text-${d.color} w-20 me-1`} />
                {` ${d.label} ${d.value}%`}
              </h6>
            ))}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// ------------------ Bar Chart Widget ------------------
export const BarChartWidget = ({ title, value, percentage, data = [] }) => {
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const series = data.map(d => d.value);
  const percentageIcon = percentage < 0 ? faAngleDown : faAngleUp;
  const percentageColor = percentage < 0 ? "text-danger" : "text-success";

  return (
    <Card border="light" className="shadow-sm">
      <Card.Body className="d-flex flex-row align-items-center flex-0 border-bottom">
        <div className="d-block">
          <h6 className="fw-normal text-gray mb-2">{title}</h6>
          <h3>{value}</h3>
          <small className="mt-2">
            <FontAwesomeIcon icon={percentageIcon} className={`${percentageColor} me-1`} />
            <span className={`${percentageColor} fw-bold`}>{percentage}%</span>
          </small>
        </div>
        <div className="d-block ms-auto">
          {data.map(d => (
            <div key={d.id} className="d-flex align-items-center text-end mb-2">
              <span className={`shape-xs rounded-circle bg-${d.color} me-2`} />
              <small className="fw-normal">{d.label}</small>
            </div>
          ))}
        </div>
      </Card.Body>
      <Card.Body className="p-2">
        <BarChart labels={labels} series={series} />
      </Card.Body>
    </Card>
  );
};

// ------------------ Sales vs Target Widget ------------------
export const SalesVsTargetWidget = ({ title, value, target }) => {
  const percentage = ((value / target) * 100).toFixed(0);
  const percentageIcon = value < target ? faAngleDown : faAngleUp;
  const percentageColor = value < target ? "text-danger" : "text-success";

  return (
    <Card border="light" className="shadow-sm">
      <Card.Body>
        <h6 className="fw-normal text-gray">{title}</h6>
        <h3>${value}</h3>
        <small>
          <FontAwesomeIcon icon={percentageIcon} className={`${percentageColor} me-1`} />
          <span className={percentageColor}>{percentage}% of target</span>
        </small>
      </Card.Body>
    </Card>
  );
};

// ------------------ Sales Value Widgets ------------------
export const SalesValueWidget = ({ title, value, percentage }) => {
  const percentageIcon = percentage < 0 ? faAngleDown : faAngleUp;
  const percentageColor = percentage < 0 ? "text-danger" : "text-success";
  return ( 
    <Card className="bg-secondary-alt shadow-sm">
      <Card.Header className="d-flex flex-row align-items-center flex-0">
        <div className="d-block">
          <h5 className="fw-normal mb-2">{title}</h5>
          <h3>${value}</h3>
          <small className="fw-bold mt-2">
            <span className="me-2">Yesterday</span>
            <FontAwesomeIcon icon={percentageIcon} className={`${percentageColor} me-1`} />
            <span className={percentageColor}>{percentage}%</span>
          </small>
        </div>
      </Card.Header>
      <Card.Body className="p-2">
        <SalesValueChart />
      </Card.Body>
    </Card>
  );
};

export const SalesValueWidgetPhone = ({ title, value, percentage }) => {
  const percentageIcon = percentage < 0 ? faAngleDown : faAngleUp;
  const percentageColor = percentage < 0 ? "text-danger" : "text-success";
  return (
    <Card className="bg-secondary-alt shadow-sm">
      <Card.Header className="d-md-flex flex-row align-items-center flex-0">
        <div className="d-block mb-3 mb-md-0">
          <h5 className="fw-normal mb-2">{title}</h5>
          <h3>${value}</h3>
          <small className="fw-bold mt-2">
            <span className="me-2">Yesterday</span>
            <FontAwesomeIcon icon={percentageIcon} className={`${percentageColor} me-1`} />
            <span className={percentageColor}>{percentage}%</span>
          </small>
        </div>
      </Card.Header>
      <Card.Body className="p-2">
        <SalesValueChartPhone />
      </Card.Body>
    </Card>
  );
};

// ------------------ Progress Track Widget ------------------
export const ProgressTrackWidget = () => {
  const Progress = ({ title, percentage, icon, color, last = false }) => {
    const extraClassName = last ? "" : "mb-2";
    return (
      <Row className={`align-items-center ${extraClassName}`}>
        <Col xs="auto">
          <span className={`icon icon-md text-${color}`}>
            <FontAwesomeIcon icon={icon} className="me-1" />
          </span>
        </Col>
        <Col>
          <div className="progress-wrapper">
            <div className="progress-info">
              <h6 className="mb-0">{title}</h6>
              <small className="fw-bold text-dark"><span>{percentage} %</span></small>
            </div>
            <ProgressBar variant={color} now={percentage} min={0} max={100} />
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="border-bottom border-light"><h5 className="mb-0">Progress track</h5></Card.Header>
      <Card.Body>
        <Progress title="Rocket - SaaS Template" color="purple" icon={faBootstrap} percentage={34} />
        <Progress title="Pixel - Design System" color="danger" icon={faAngular} percentage={60} />
        <Progress title="Spaces - Listings Template" color="tertiary" icon={faVuejs} percentage={45} />
        <Progress title="Stellar - Dashboard" color="info" icon={faReact} percentage={35} />
        <Progress last title="Volt - Dashboard" color="purple" icon={faBootstrap} percentage={34} />
      </Card.Body>
    </Card>
  );
};

// ------------------ Ranking Widget ------------------
export const RankingWidget = () => (
  <Card border="light" className="shadow-sm">
    <Card.Body>
      <div className="d-flex align-items-center justify-content-between border-bottom border-light pb-3">
        <h6><FontAwesomeIcon icon={faGlobeEurope} className="icon icon-xs me-3" /> Global Rank</h6>
        <Card.Link href="#" className="text-primary fw-bold">#755 <FontAwesomeIcon icon={faChartLine} className="ms-2" /></Card.Link>
      </div>
      <div className="d-flex align-items-center justify-content-between border-bottom border-light py-3">
        <div>
          <h6 className="mb-0"><FontAwesomeIcon icon={faFlagUsa} className="icon icon-xs me-3" />Country Rank</h6>
          <div className="small card-stats">United States <FontAwesomeIcon icon={faAngleUp} className="icon icon-xs text-success ms-2" /></div>
        </div>
        <Card.Link href="#top" className="text-primary fw-bold">#32 <FontAwesomeIcon icon={faChartLine} className="ms-2" /></Card.Link>
      </div>
      <div className="d-flex align-items-center justify-content-between pt-3">
        <div>
          <h6 className="mb-0"><FontAwesomeIcon icon={faFolderOpen} className="icon icon-xs me-3" />Category Rank</h6>
          <Card.Link href="#top" className="small card-stats">Travel &gt; Accomodation</Card.Link>
        </div>
        <Card.Link href="#top" className="text-primary fw-bold">#16 <FontAwesomeIcon icon={faChartLine} className="ms-2" /></Card.Link>
      </div>
    </Card.Body>
  </Card>
);

// ------------------ Team Members Widget ------------------
export const TeamMembersWidget = () => {
  const TeamMember = ({ name, statusKey, image, icon, btnText }) => {
    const status = { online: { color: "success", label: "Online" }, inMeeting: { color: "warning", label: "In a meeting" }, offline: { color: "danger", label: "Offline" } };
    const statusColor = status[statusKey] ? status[statusKey].color : 'danger';
    const statusLabel = status[statusKey] ? status[statusKey].label : 'Offline';

    return (
      <ListGroup.Item className="px-0">
        <Row className="align-items-center">
          <Col className="col-auto"><Image src={image} className="rounded-circle" /></Col>
          <Col className="ms--2">
            <h4 className="h6 mb-0">{name}</h4>
            <span className={`text-${statusColor}`}>● </span>
            <small>{statusLabel}</small>
          </Col>
          <Col className="col-auto">
            <Button variant="tertiary" size="sm"><FontAwesomeIcon icon={icon} className="me-1" /> {btnText}</Button>
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="border-bottom border-light d-flex justify-content-between">
        <h5 className="mb-0">Team members</h5>
        <Button variant="secondary" size="sm">See all</Button>
      </Card.Header>
      <Card.Body>
        <ListGroup className="list-group-flush list my--3">
          {teamMembers.map(tm => <TeamMember key={tm.id} {...tm} />)}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
