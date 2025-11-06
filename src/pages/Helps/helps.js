import React from "react";
import { Breadcrumb } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function HelpWrapper() {
    return (
        <>
            <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="d-block mb-4 mb-xl-0">
                    <Breadcrumb
                        className="d-none d-md-inline-block"
                        listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
                    >
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Help & FAQ</Breadcrumb.Item>
                        <Breadcrumb.Item active>Help Center</Breadcrumb.Item>
                    </Breadcrumb>
                    <h4>Help & FAQ</h4>
                </div>
            </div>

            {/* Main content */}
            <div className="card p-4">
                <h5>Frequently Asked Questions</h5>
                <p>Here you can provide FAQ content or links to help articles.</p>
            </div>
        </>
    );
}
