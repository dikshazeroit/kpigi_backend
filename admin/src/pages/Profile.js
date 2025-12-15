import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row, Breadcrumb } from '@themesberg/react-bootstrap';
import { ProfileCardWidget } from "../components/Widgets";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <>
      {/* 🔹 Breadcrumb Header Section */}
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-xl-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item></Breadcrumb.Item>

            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>

            <Breadcrumb.Item>Profile</Breadcrumb.Item>
            <Breadcrumb.Item active>User Profile</Breadcrumb.Item>
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
      </Row>
    </>
  );
};

export default Profile;
