import React from "react";
import { Breadcrumb } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import WalletPage from "../../components/wallet";

export default function WalletCreatePage() {
  return (
    <div className="page-wrapper">

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center page-header mb-4">
        <div>
        

          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
              <FontAwesomeIcon icon={faHome} /> Home
            </Breadcrumb.Item>

            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/wallet" }}>
              Wallet
            </Breadcrumb.Item>

            <Breadcrumb.Item active>Create Wallet</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* WALLET CONTENT */}
      <div className="content-section">
        <WalletPage />
      </div>

      {/* PAGE SPACING / EXTRA CSS */}
      <style>{`
        .page-wrapper {
          padding: 10px 0;
        }
        .page-header {
          padding-bottom: 18px;
          border-bottom: 1px solid #e5e5e5;
          margin-bottom: 28px !important;
        }
        .page-title {
          font-size: 22px;
          margin-bottom: 6px !important;
        }
        .content-section {
          padding-top: 10px;
        }
      `}</style>

    </div>
  );
}
