import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";

// Pages
import DashboardOverview from "./dashboard/DashboardOverview";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import BootstrapTables from "./tables/BootstrapTables";

import Signin from "./examples/Signin";
import Signup from "./examples/Signup";
import ForgotPassword from "./examples/ForgotPassword";
import VerifyOtp from "./examples/VerifyOtp";
import ResetPassword from "./examples/ResetPassword";

// Components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";

import Accordion from "./components/Accordion";
import Alerts from "./components/Alerts";
import Badges from "./components/Badges";
import Breadcrumbs from "./components/Breadcrumbs";
import Buttons from "./components/Buttons";
import Forms from "./components/Forms";
import Navs from "./components/Navs";
import Navbars from "./components/Navbars";
import Tables from "./components/Tables";

// Menu Pages
import CampaignManagementPage from "./CampaignManagement/CampaignManagement";
import DonationManagementPage from "./donation/DonationManagement";
import WalletPage from "./wallet/wallet";
import PayoutsPage from "./payouts/payouts";
import CategoriesPage from "./Category/CategoriesPage"
import AnalyticsPage from "./Analytics/AnalyticsManagement";
import Disputes from "./diputes/Disputes";
import HelpWrapper from "./Helps/helps";
import FAQ from "./Helps/helps";
import PrivacyPage from "./PrivacyPolicy/privacy";
import TermsPage from "./TERMS/Terms";


// ====================
// ROUTE WRAPPERS
// ====================

const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={!loaded} />
          <Component {...props} />
        </>
      )}
    />
  );
};

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={!loaded} />

          <Sidebar />

          <main className="content">
            <Navbar />
            <Component {...props} />
          </main>
        </>
      )}
    />
  );
};


// ====================
// MAIN ROUTER
// ====================

export default function AppRoutes() {
  return (
    <Switch>
      {/* DEFAULT REDIRECT */}
      <Redirect exact from="/" to={Routes.Signin.path} />

      {/* AUTH ROUTES */}
      <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />
      <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />
      <RouteWithLoader exact path={Routes.ForgotPassword.path} component={ForgotPassword} />
      <RouteWithLoader exact path={Routes.VerifyOtp.path} component={VerifyOtp} />
      <RouteWithLoader exact path={Routes.ResetPassword.path} component={ResetPassword} />

      {/* SIDEBAR ROUTES */}
      <RouteWithSidebar exact path={Routes.DashboardOverview.path} component={DashboardOverview} />

      <RouteWithSidebar exact path={Routes.Profile.path} component={Profile} />
      <RouteWithSidebar exact path={Routes.EditProfile.path} component={EditProfile} />

      <RouteWithSidebar exact path={Routes.BootstrapTables.path} component={BootstrapTables} />

      {/* MENU PAGES */}
      <RouteWithSidebar exact path={Routes.CampaignManagementPage.path} component={CampaignManagementPage} />
      <RouteWithSidebar exact path={Routes.DonationManagementPage.path} component={DonationManagementPage} />
      <RouteWithSidebar exact path={Routes.WalletPage.path} component={WalletPage} />
      <RouteWithSidebar exact path={Routes.PayoutsPage.path} component={PayoutsPage} />
      <RouteWithSidebar exact path={Routes.CategoriesPage.path} component={CategoriesPage} />
      <RouteWithSidebar exact path={Routes.AnalyticsPage.path} component={AnalyticsPage} />
      <RouteWithSidebar exact path={Routes.DisputesWrapper.path} component={Disputes} />
      <RouteWithSidebar exact path={Routes.Help.path} component={HelpWrapper} />
      <RouteWithSidebar exact path={Routes.FAQ.path} component={FAQ} />
      <RouteWithSidebar exact path={Routes.PrivacyPolicy.path} component={PrivacyPage} />
      <RouteWithSidebar exact path={Routes.TermsAndConditions.path} component={TermsPage} />

      {/* COMPONENTS */}
      <RouteWithSidebar exact path={Routes.Accordions.path} component={Accordion} />
      <RouteWithSidebar exact path={Routes.Alerts.path} component={Alerts} />
      <RouteWithSidebar exact path={Routes.Badges.path} component={Badges} />
      <RouteWithSidebar exact path={Routes.Breadcrumbs.path} component={Breadcrumbs} />
      <RouteWithSidebar exact path={Routes.Buttons.path} component={Buttons} />
      <RouteWithSidebar exact path={Routes.Forms.path} component={Forms} />
      <RouteWithSidebar exact path={Routes.Navs.path} component={Navs} />
      <RouteWithSidebar exact path={Routes.Navbars.path} component={Navbars} />
      <RouteWithSidebar exact path={Routes.Tables.path} component={Tables} />
    </Switch>
  );
}
