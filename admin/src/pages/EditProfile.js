import React from "react";
import { Col, Row, Breadcrumb } from '@themesberg/react-bootstrap';
import { GeneralInfoForm } from "../components/Forms";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const EditProfile = () => {
  return (
    <>
      {/* 🔹 Breadcrumb Header Section */}
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-xl-0">
          <Breadcrumb
            className="d-flex align-items-center flex-nowrap"
            listProps={{
              className:
                "breadcrumb-dark breadcrumb-transparent mb-0 d-flex align-items-center",
            }}
          >

          </Breadcrumb>
        </div>
      </div>

      {/* 🔹 Edit Profile Content */}
      <Row>
        <Col xs={12} xl={20}>
          <Row>
            <Col>
              <GeneralInfoForm />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default EditProfile;
