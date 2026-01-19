import React, { useState, useEffect, useRef } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSignOutAlt,
  faTimes,
  faDollarSign,
  faLifeRing,
  faUserShield,
  faDonate,
  faFunnelDollar,
  faClipboardList,
  faChartPie,
  faIdCard
} from "@fortawesome/free-solid-svg-icons";

import { Nav, Image, Button, Dropdown, Navbar } from "@themesberg/react-bootstrap";

import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
import DashboardIcon from "../assets/img/team/dashboard-svgrepo-com 1.png";
import logo from "../assets/img/pages/appstore-preview.png"

import { Routes } from "../routes";

export default function Sidebar({ userName = "Jane" }) {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const [collapseShow, setCollapseShow] = useState("");
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
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("adminImage");
    sessionStorage.clear();
    window.location.href = Routes.Signin.path; // redirect
  };

  const NavItem = ({ title, link, icon, imageIcon, textColor = "#000", iconColor = "#000" }) => {
    const isActive = link === pathname;

    return (
      <Nav.Item>
        <Nav.Link
          as={Link}
          to={link}
          className={`sidebar-btn mb-2 ${isActive ? "active-btn" : ""}`}
          style={{
            color: isActive ? "#fff" : textColor,
            backgroundColor: isActive ? "#0d6efd" : "transparent",
            borderRadius: "5px",
            padding: "8px 12px",
          }}
        >
          <span className="d-flex align-items-center">
            {icon && (
              <span
                className="sidebar-icon"
                style={{ color: isActive ? "#fff" : iconColor, minWidth: "20px" }}
              >
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
                  style={{
                    filter: isActive ? "brightness(0) invert(1)" : "invert(50%)",
                  }}
                />
              </span>
            )}
            <span className="sidebar-text ms-2">{title}</span>
          </span>
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden p-2">
        <button
          className="cursor-pointer text-black opacity-50 px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
          type="button"
          onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Mobile Navbar */}
      <Navbar expand={false} variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand className="text-white fw-bold" as={Link} to={Routes.DashboardOverview.path} />
        <Navbar.Toggle as={Button} onClick={toggleSidebar}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      {/* Sidebar */}
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          ref={sidebarRef}
          className={`collapse sidebar d-md-block ${show ? "show" : ""} ${collapseShow}`}
        >
          <div className="sidebar-inner sidebar-bg px-4 pt-3">
            <div className="text-center mb-4">
              <Link to={Routes.DashboardOverview.path} onClick={() => setShow(false)}>
                <Image
                  src={logo}
                  alt="Kpigi Logo"
                  style={{
                    width: "100px",        // adjust size
                    height: "auto",
                    margin: "10px 0",
                    borderRadius: "5px",
                    padding: "10px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                  }}
                />
              </Link>
            </div>


            {/* Mobile User Card */}
            <div className="user-card d-flex d-md-none align-items-center justify-content-between pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div>
                  <h6>Hi, {userName}</h6>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleLogout}
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
                icon={faChartPie}
                textColor="#ff6347"
                iconColor="#ff6347"
              />
              <NavItem
                title="User Management"
                link={Routes.BootstrapTables.path}
                icon={faUsers}
                textColor="#32cd32"
                iconColor="#32cd32"
              />
              <NavItem
                title="Fund Management"
                link={Routes.CampaignManagementPage.path}
                icon={faFunnelDollar}
                textColor="#1e90ff"
                iconColor="#1e90ff"
              />
              <NavItem
                title="Donation Management"
                link={Routes.DonationManagementPage.path}
                icon={faDonate}
                textColor="#1e90ff"
                iconColor="#1e90ff"
              />
              <NavItem
                title="Payouts Requests"
                link={Routes.PayoutsPage.path}
                icon={faDollarSign}
                textColor="#ffa500"
                iconColor="#ffa500"
              />
              <NavItem
                title="Categories"
                link={Routes.CategoriesPage.path}
                icon={faClipboardList}
                textColor="#ffa500"
                iconColor="#ffa500"
              />
              {/* <NavItem
                title="Wallet"
                link={Routes.WalletPage.path}
                icon={faWallet}
                textColor="#ff69b4"
                iconColor="#ff69b4"
              /> */}
              {/*              
              <NavItem
                title="Analytics"
                link={Routes.AnalyticsPage.path}
                icon={faChartLine}
                textColor="#20b2aa"
                iconColor="#20b2aa"
              /> */}
              {/* <NavItem
                title="Disputes"
                link={Routes.DisputesWrapper.path}
                icon={faGavel}
                textColor="#8a2be2"
                iconColor="#8a2be2"
              />
              <NavItem
                title="Help Center"
                link={Routes.Help.path}
                icon={faLifeRing}
                textColor="#00ced1"
                iconColor="#00ced1"
              /> */}
              <NavItem
                title="Faq"
                link={Routes.FaqsPage.path}
                icon={faLifeRing}
                textColor="#00ced1"
                iconColor="#00ced1"
              />
              <NavItem
                title="About Management"
                link={Routes.PrivacyPolicy.path}
                icon={faUserShield}
                textColor="#dc143c"
                iconColor="#dc143c"
              />
              <NavItem
                title="KYC Management"
                link={Routes.KycPage.path}
                icon={faIdCard}
                textColor="#dc143c"
                iconColor="#dc143c"
              />
              {/* <NavItem
                title="Terms & Conditions"
                link={Routes.TermsAndConditions.path}
                icon={faInfoCircle}
                textColor="#dc143c"
                iconColor="#dc143c"
              /> */}

              <Dropdown.Divider className="my-3" />
              {/* <Nav.Item>
                <Nav.Link
                  onClick={handleLogout}
                  className="sidebar-btn mb-2"
                  style={{
                    color: "#fff",
                    backgroundColor: "transparent",
                    borderRadius: "5px",
                    padding: "8px 12px",
                  }}
                >
                  <span className="d-flex align-items-center">
                    <span className="sidebar-icon" style={{ color: "#ffffff", minWidth: "20px" }}>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                    </span>
                    <span className="sidebar-text ms-2">Logout</span>
                  </span>
                </Nav.Link>
              </Nav.Item> */}
             


            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
}
