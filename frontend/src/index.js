// Dear Programmer:
// When I wrote this code, only God and I knew How it Worked?
// Now After completing it Only God Knows it...!!!
//
// Therefore, if you are trying to optimize this routines and it
// fails (most surely).
// Plz do not try to contact me, I will not be able to help you...!!!
// Just Increase this counter as a
// Warning for the next person who tries to optimize this code.
// 
// Total_Hours_Wasted = 600

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
