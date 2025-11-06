import React from "react";
import { Breadcrumb } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faGavel } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

// Import the main Disputes component
import DisputesPage from "../../pages/DisputesPage";

export default function DisputesWrapper() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-xl-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Disputes</Breadcrumb.Item>
            <Breadcrumb.Item active>Disputes Management</Breadcrumb.Item>
          </Breadcrumb>
          <h4>Disputes Management</h4>
        </div>
      </div>

      {/* Main Disputes content */}
      <DisputesPage />
    </>
  );
}
