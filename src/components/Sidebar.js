import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faUsers,
  faChartLine,
  faSignOutAlt,
  faWallet,
  faTimes,
  faUser,
  faDollarSign,
  faBell,
  faGavel,
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from "@themesberg/react-bootstrap";
import logo from "../assets/img/pages/demdey1.png";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
import { Routes } from "../routes";

export default function Sidebar() {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const CollapsableNavItem = ({ eventKey, title, icon, children }) => {
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button as={Nav.Link} className="d-flex justify-content-between align-items-center">
            <span>
              <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /></span>
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav className="flex-column">{children}</Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const NavItem = ({ title, link, external, target, icon, badgeText, badgeBg = "secondary", badgeColor = "primary" }) => {
    const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon && <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /></span>}
            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText && (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">
              {badgeText}
            </Badge>
          )}
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* Mobile Navbar */}
      <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand className="me-lg-5 text-white fw-bold" as={Link} to={Routes.DashboardOverview.path}></Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      {/* Sidebar */}
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner px-4 pt-3">
            <div className="text-center mb-4">
              <img src={logo} height="100" alt="demdey Logo" />
            </div>

            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image src={ProfilePicture} className="card-img-top rounded-circle border-white" />
                </div>
                <div className="d-block">
                  <h6>Hi, Jane</h6>
                  <Button as={Link} variant="secondary" size="xs" to={Routes.Signin.path} className="text-dark">
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>

            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem title="Dashboard" link={Routes.DashboardOverview.path} icon={faChartPie} />
              <CollapsableNavItem eventKey="tables/" title="User Management" icon={faUser}>
                <NavItem title="User List" link={Routes.BootstrapTables.path} />
              </CollapsableNavItem>
              <CollapsableNavItem eventKey="circle/" title="Circle" icon={faUsers}>
                <NavItem title="My Circle Page" link={Routes.CirclesPage.path} />
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
              <CollapsableNavItem eventKey="notifications/" title="Notifications" icon={faBell}>
                <NavItem title="My Notifications" link={Routes.NotificationsPage.path} />
              </CollapsableNavItem>
                <CollapsableNavItem eventKey="Disputes/" title="Disputes" icon={faGavel}>
                <NavItem title="My Disputes" link={Routes.DisputesWrapper.path} />
              </CollapsableNavItem>
              
              

              <Dropdown.Divider className="my-3 border-indigo" />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
}
