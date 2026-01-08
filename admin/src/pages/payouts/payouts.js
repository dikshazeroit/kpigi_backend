import React from "react";

import { Breadcrumb } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';
import PayoutsPage from "../../components/Payouts";

const Payouts = () => {
    return (
        <>
            <div className="d-xl-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="d-block mb-4 mb-xl-0">
                   
                </div>
            </div>

            <PayoutsPage />
        </>
    );
};

export default Payouts;
