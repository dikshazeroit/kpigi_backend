import React from "react";
import { Breadcrumb } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import PrivacyPolicy from "../../components/PrivacyPolicy";

export default function PrivacyPage() {
  return (
    <>
      <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-xl-0">
         
        </div>
      </div>

      {/* === MAIN CONTENT AREA (SPACING FIXED) === */}
      <div className="container-fluid px-0">  {/* FULL WIDTH */}
        <div className="card shadow-sm p-3 border-0 rounded-3">
          <PrivacyPolicy />
        </div>
      </div>
    </>
  );
}
