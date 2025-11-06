import React from "react";
import { Breadcrumb } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBell } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

// Import the main notifications component
import NotificationsPage from "../../components/Notification";

export default function NotificationsWrapper() {
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
                        <Breadcrumb.Item>Notifications</Breadcrumb.Item>
                        <Breadcrumb.Item active>Notifications Management</Breadcrumb.Item>
                    </Breadcrumb>
                    <h4>Notifications Management</h4>
                </div>
            </div>

            {/* Main Notifications content */}
            <NotificationsPage />

        </>
    );
}
