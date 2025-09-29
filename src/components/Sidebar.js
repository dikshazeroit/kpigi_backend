import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/img/pages/demdey1.png"; // Import your logo image here
import {
  faChartPie,
  faFile,
  faQuestion,
  faSignOutAlt,
  faSubscript,
  faTimes,
  faUser,
  faVideo
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from "@themesberg/react-bootstrap";

import { Routes } from "../routes";
// Dummy Logo Image (You can replace with your own)
// import authlogo from "../assets/img/pages/authlogo.svg"; 
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
export default (props = {}) => {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const CollapsableNavItem = ({ eventKey, title, icon, children = null }) => {
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button
            as={Nav.Link}
            className="d-flex justify-content-between align-items-center"
          >
            <span>
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
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

  const NavItem = ({
    title,
    link,
    external,
    target,
    icon,
    image,
    badgeText,
    badgeBg = "secondary",
    badgeColor = "primary"
  }) => {
    const classNames = badgeText
      ? "d-flex justify-content-start align-items-center justify-content-between"
      : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
            ) : null}
            {image ? (
              <Image
                src={image}
                width={20}
                height={20}
                className="sidebar-icon svg-icon"
              />
            ) : null}

            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge
              pill
              bg={badgeBg}
              text={badgeColor}
              className="badge-md notification-count ms-2"
            >
              {badgeText}
            </Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* Mobile Navbar */}
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand
          className="me-lg-5 text-white fw-bold"
          as={Link}
          to={Routes.DashboardOverview.path}
        >

        </Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      {/* Sidebar */}
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}
        >
          <div className="sidebar-inner px-4 pt-3">
            {/* Admin Panel Title for Desktop */}
            <div className="text-center mb-4">
              <img
                src={logo} height="100"
                alt="demdey Logo"
              />
            </div>

            {/* Mobile user card */}
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Hi, Jane</h6>
                  <Button
                    as={Link}
                    variant="secondary"
                    size="xs"
                    to={Routes.Signin.path}
                    className="text-dark"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />{" "}
                    Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>

            {/* Menu Items */}
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem
                title="Dashboard"
                link={Routes.DashboardOverview.path}
                icon={faChartPie}
              />
              <CollapsableNavItem
                eventKey="tables/"
                title="User Management"
                icon={faUser}
              >
                <NavItem
                  title={<span className="fs-6">User List</span>}
                  link={Routes.BootstrapTables.path}
                />
                {/* <NavItem
                  title={<span className="fs-6">User Table</span>}
                /> */}

              </CollapsableNavItem>

              <CollapsableNavItem
                eventKey="banner/"
                title="Banner"
                icon={faFile}
              >
                <NavItem
                  title={<span className="fs-6">Create Banner</span>}
                  link={Routes.CreateBanner.path}
                />

              </CollapsableNavItem>
              <CollapsableNavItem
                eventKey="subscription/"
                title="Subscription"
                icon={faSubscript}
              >
                <NavItem
                  title={<span className="fs-6">Create Subscription</span>}
                  link={Routes.CreateSubscription.path}
                />

              </CollapsableNavItem>

              <CollapsableNavItem
                eventKey="Animated Video/"
                title="Animated Video"
                icon={faVideo}
              >
                <NavItem
                  title={<span className="fs-6">Add Animated Video</span>}
                  link={Routes.CreateAnimatedVideo.path}
                />

              </CollapsableNavItem>

              <CollapsableNavItem
                eventKey="FAQ Management/"
                title="FAQ Management"
                icon={faQuestion}
              >
                <NavItem
                  title={<span className="fs-6">Add FAQ</span>}
                  link={Routes.FaqManagement.path}
                />

              </CollapsableNavItem>

              <Dropdown.Divider className="my-3 border-indigo" />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
