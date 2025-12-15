import React from "react";
import { Breadcrumb } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <>
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-xl-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
              <FontAwesomeIcon icon={faHome} /> Home
            </Breadcrumb.Item>
            <Breadcrumb.Item>Profile</Breadcrumb.Item>
            <Breadcrumb.Item active>Profile Overview</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* Add your profile content here */}
    </>
  );
};

export default Profile;
