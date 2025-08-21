import React from "react";

import { Breadcrumb } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import SubscriptionPage from "../../components/Subscription";


export default () => {
    return (
        <>
            <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="d-block mb-4 mb-xl-0">
                    <Breadcrumb className="d-none d-md-inline-block" listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}>
                        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/dashboard" }}>
                            <FontAwesomeIcon icon={faHome} />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Subscription</Breadcrumb.Item>
                        <Breadcrumb.Item active>Create Subscription</Breadcrumb.Item>
                    </Breadcrumb>
                    {/* <h4>Create Subscription</h4> */}
                </div>
            </div>
            <SubscriptionPage />
        </>
    );
};