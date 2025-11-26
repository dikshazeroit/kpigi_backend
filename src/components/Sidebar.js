import React, { useState, useEffect, useRef } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChartLine,
  faSignOutAlt,
  faWallet,
  faTimes,
  faUser,
  faDollarSign,
  faGavel,
  faLifeRing,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

import {
  Nav,
  Badge,
  Image,
  Button,
  Dropdown,
  Accordion,
  Navbar,
} from "@themesberg/react-bootstrap";

import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";

// Your dashboard icon
import DashboardIcon from "../assets/img/team/dashboard-svgrepo-com 1.png";

import { Routes } from "../routes";

export default function Sidebar({ userName = "Jane" }) {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const sidebarRef = useRef();

  const toggleSidebar = () => setShow(!show);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (show && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  // -------------------------------
  // NavItem with PNG/SVG image support
  // -------------------------------
  const NavItem = ({
    title,
    link,
    icon,
    imageIcon,
    badgeText,
    external,
    target,
    badgeBg = "secondary",
    badgeColor = "primary",
  }) => {
    const isActive = link === pathname;
    const linkProps = external ? { href: link, target } : { as: Link, to: link };

    return (
      <Nav.Item className={isActive ? "active" : ""}>
        <Nav.Link
          {...linkProps}
          className={badgeText ? "d-flex justify-content-between align-items-center" : ""}
        >
          <span className="d-flex align-items-center">
            {icon && (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />
              </span>
            )}

            {imageIcon && (
              <span className="sidebar-icon">
                <img
                  src={imageIcon}
                  alt={title}
                  width="20"
                  height="20"
                  style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
                />
              </span>
            )}

            <span className="sidebar-text ms-2">{title}</span>
          </span>

          {badgeText && (
            <Badge pill bg={badgeBg} text={badgeColor} className="ms-2">
              {badgeText}
            </Badge>
          )}
        </Nav.Link>
      </Nav.Item>
    );
  };

  const CollapsableNavItem = ({ eventKey, title, icon, children }) => {
    const defaultKey = pathname.includes(eventKey) ? eventKey : "";
    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button
            as={Nav.Link}
            className="d-flex justify-content-between align-items-center"
          >
            <span className="d-flex align-items-center">
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />
              </span>
              <span className="sidebar-text ms-2">{title}</span>
            </span>
          </Accordion.Button>

          <Accordion.Body className="multi-level">
            <Nav className="flex-column">{children}</Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  return (
    <>
      {/* Mobile Navbar */}
      <Navbar
        expand={false}
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand
          className="text-white fw-bold"
          as={Link}
          to={Routes.DashboardOverview.path}
        ></Navbar.Brand>
        <Navbar.Toggle
          as={Button}
          aria-controls="sidebar-navbar"
          onClick={toggleSidebar}
        >
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      {/* Sidebar */}
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          ref={sidebarRef}
          className={`collapse sidebar d-md-block ${show ? "show" : ""}`}
        >
          <div className="sidebar-inner sidebar-bg px-4 pt-3">
            {/* Logo at the top */}
            <div className="text-center mb-4">
              <Link
                to={Routes.DashboardOverview.path}
                onClick={() => setShow(false)} // close sidebar on mobile when clicking logo
              >
                <img
                  src={`${process.env.PUBLIC_URL}/Kpigi.png`}
                  alt="Kpigi Logo"
                  width="140"
                  style={{ cursor: "pointer" }}
                />
              </Link>
            </div>


            {/* Mobile user card */}
            <div className="user-card d-flex d-md-none align-items-center justify-content-between pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Hi, {userName}</h6>
                  <Button
                    variant="secondary"
                    size="xs"
                    as={Link}
                    to={Routes.Signin.path}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Sign Out
                  </Button>
                </div>
              </div>

              <Nav.Link className="collapse-close d-md-none" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>

            {/* Sidebar Navigation */}
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem
                title="Dashboard"
                link={Routes.DashboardOverview.path}
                imageIcon={DashboardIcon}
              />

              <CollapsableNavItem eventKey="tables/" title="User Management" icon={faUser}>
                <NavItem title="User List" link={Routes.BootstrapTables.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="/" title="Campaigns" icon={faUsers}>
                <NavItem title="Campaign Management" link={Routes.CampaignManagementPage.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="wallet/" title="Wallet" icon={faWallet}>
                <NavItem title="My Wallet" link={Routes.WalletPage.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="payouts/" title="Payouts" icon={faDollarSign}>
                <NavItem title="My Payouts" link={Routes.PayoutsPage.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="analytics/" title="Analytics" icon={faChartLine}>
                <NavItem title="My Analytics" link={Routes.AnalyticsPage.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="disputes/" title="Disputes" icon={faGavel}>
                <NavItem title="My Disputes" link={Routes.DisputesWrapper.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="support/" title="Support" icon={faLifeRing}>
                <NavItem title="Help Center" link={Routes.Help.path} />
                <NavItem title="FAQs" link={Routes.FAQ.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="privacy/" title="Privacy & Policy" icon={faUserShield}>
                <NavItem title="Privacy Policy" link={Routes.PrivacyPolicy.path} />
              </CollapsableNavItem>

              <CollapsableNavItem eventKey="terms/" title="Terms & Conditions" icon={faUserShield}>
                <NavItem title="Terms & Conditions" link={Routes.TermsAndConditions.path} />
              </CollapsableNavItem>

              <Dropdown.Divider className="my-3" />

              {/* Logout */}
              <NavItem title="Logout" link={Routes.Signin.path} icon={faSignOutAlt} />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
}
