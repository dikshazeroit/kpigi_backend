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

// import Accordion from "./components/Accordion";
// import Alerts from "./components/Alerts";
// import Badges from "./components/Badges";
// import Breadcrumbs from "./components/Breadcrumbs";
// import Buttons from "./components/Buttons";
// import Forms from "./components/Forms";
// import Navs from "./components/Navs";
// import Navbars from "./components/Navbars";
// import Tables from "./components/Tables";

// Menu Pages
import CampaignManagementPage from "./CampaignManagement/CampaignManagement";
import DonationManagementPage from "./donation/DonationManagement";
import WalletPage from "./wallet/wallet";
import PayoutsPage from "./payouts/payouts";
import CategoriesPage from "./Category/CategoriesPage"
import AnalyticsPage from "./Analytics/AnalyticsManagement";
import Disputes from "./diputes/Disputes";
import HelpWrapper from "./Helps/helps";
import FaqsPage from "./support/FaqsPage";
import PrivacyPage from "./PrivacyPolicy/privacy";
import TermsPage from "./TERMS/Terms";
import ProtectedRoute from "./examples/ProtectedRoute";


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
          {/* <Preloader show={!loaded} /> */}

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

      {/* PUBLIC PAGES */}
      <RouteWithSidebar exact path={Routes.PrivacyPolicy.path} component={PrivacyPage} />
      <RouteWithSidebar exact path={Routes.TermsAndConditions.path} component={TermsPage} />

      {/* PROTECTED + SIDEBAR ROUTES */}

      <ProtectedRoute
        exact
        path={Routes.DashboardOverview.path}
        component={() => <RouteWithSidebar component={DashboardOverview} />}
      />

      <ProtectedRoute
        exact
        path={Routes.Profile.path}
        component={() => <RouteWithSidebar component={Profile} />}
      />

      <ProtectedRoute
        exact
        path={Routes.EditProfile.path}
        component={() => <RouteWithSidebar component={EditProfile} />}
      />

      <ProtectedRoute
        exact
        path={Routes.BootstrapTables.path}
        component={() => <RouteWithSidebar component={BootstrapTables} />}
      />

      <ProtectedRoute
        exact
        path={Routes.CampaignManagementPage.path}
        component={() => <RouteWithSidebar component={CampaignManagementPage} />}
      />

      <ProtectedRoute
        exact
        path={Routes.DonationManagementPage.path}
        component={() => <RouteWithSidebar component={DonationManagementPage} />}
      />

      <ProtectedRoute
        exact
        path={Routes.WalletPage.path}
        component={() => <RouteWithSidebar component={WalletPage} />}
      />

      <ProtectedRoute
        exact
        path={Routes.PayoutsPage.path}
        component={() => <RouteWithSidebar component={PayoutsPage} />}
      />

      <ProtectedRoute
        exact
        path={Routes.CategoriesPage.path}
        component={() => <RouteWithSidebar component={CategoriesPage} />}
      />

      <ProtectedRoute
        exact
        path={Routes.AnalyticsPage.path}
        component={() => <RouteWithSidebar component={AnalyticsPage} />}
      />

      <ProtectedRoute
        exact
        path={Routes.FaqsPage.path}
        component={() => <RouteWithSidebar component={FaqsPage} />}
      />
      {/* Non-protected sidebar routes */}
      <RouteWithSidebar exact path={Routes.DisputesWrapper.path} component={Disputes} />
      <RouteWithSidebar exact path={Routes.Help.path} component={HelpWrapper} />

    </Switch>
  );
}

