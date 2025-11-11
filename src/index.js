
import React from 'react';
import ReactDOM from 'react-dom';


// core styles
import "./scss/volt.scss";

// vendor styles
import "react-datetime/css/react-datetime.css";

import HomePage from "./pages/HomePage";
import { BrowserRouter } from 'react-router-dom';
// import ScrollToTop from "./components/ScrollToTop";

ReactDOM.render(
  < BrowserRouter >
    <HomePage />
  </BrowserRouter >,
  document.getElementById("root")
);
