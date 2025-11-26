import React from 'react';
import { createRoot } from 'react-dom/client';
import './scss/volt.scss';  

// core styles
import "./scss/volt.scss";

// vendor styles
import "react-datetime/css/react-datetime.css";

import HomePage from "./pages/HomePage";
import { BrowserRouter } from 'react-router-dom';
// import ScrollToTop from "./components/ScrollToTop";

// Get the root element
const container = document.getElementById("root");

// Create a root
const root = createRoot(container);

// Render your app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  </React.StrictMode>
);
