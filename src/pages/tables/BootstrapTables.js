import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Breadcrumb } from "@themesberg/react-bootstrap";
import { Link } from "react-router-dom";
import { PageUserTable } from "../../components/Tables";

const BootstrapTables = () => {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="mb-4 mb-xl-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
              <FontAwesomeIcon icon={faHome} /> Home
            </Breadcrumb.Item>
            <Breadcrumb.Item>Tables</Breadcrumb.Item>
            <Breadcrumb.Item active>User tables</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* === MAIN CONTENT AREA (SPACING FIXED) === */}
      <div className="container-fluid px-0">  {/* FULL WIDTH */}
        <div className="card shadow-sm p-3 border-0 rounded-3">
          <PageUserTable />
        </div>
      </div>
    </>
  );
};

export default BootstrapTables;
