import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBoxOpen, faCartArrowDown, faChartPie, faChevronDown, faClipboard, faCommentDots, faFileAlt, faPlus, faRocket, faStore } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Breadcrumb } from '@themesberg/react-bootstrap';
import { ProfileCardWidget } from "../components/Widgets";
import { faHome } from "@fortawesome/free-solid-svg-icons";
// import { GeneralInfoForm } from "../components/Forms";

// import Profile3 from "../assets/img/team/profile-picture-3.jpg";


export default () => {
  return (
    <>
      {/* 🔹 Breadcrumb Header Section */}
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-xl-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item>
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Profile</Breadcrumb.Item>
            <Breadcrumb.Item active> User Profile</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* 🔹 Main Profile Content */}
      <Row>
        <Col xs={12} xl={20}>
          <Row>
            <Col xs={12}>
              <ProfileCardWidget />
            </Col>
          </Row>
        </Col>
        {/* <Col xs={12} xl={20}>
          <GeneralInfoForm />
        </Col> */}

      </Row>
    </>
  );
};
