import React, { useEffect, useState } from "react";
// Import Link from react-router-dom to handle navigation
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { Container } from "reactstrap";

// Layout Components
import VerticalLayout from "./VerticalLayouts";
import TwoColumnLayout from "./TwoColumnLayout";
import HorizontalLayout from "./HorizontalLayout";

// Import Images
import logoSm from "../assets/images/Logo.png";
import logoDark from "../assets/images/logo-dark.png";
import logoLight from "../assets/images/logo-light.png";

const Sidebar = ({ layoutType }) => {

  const addEventListenerOnSmHoverMenu = () => {
    if (document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    } else if (document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover-active') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    }
  };

  return (
    <React.Fragment>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box">
          <Link to="/" className="logo logo-light mt-4 d-block">
            <span className="logo-lg">
              <div className="d-flex align-items-center ms-3">
                <img src={logoSm} alt="logo" height="90" className="me-3" />
                <span style={{ color: "#000000" }} className="fw-bold fs-1">DMS</span>
              </div>
            </span>
          </Link>

          <Link to="/" className="logo logo-light">
            <span className="logo-sm">
              <img src={logoSm} alt="" height="22" />
            </span>
            <span className="logo-lg">
              <h1 className="logoColor">DMS</h1>
            </span>
          </Link>

          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>

        {layoutType === "horizontal" ? (
          <div id="scrollbar">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                <HorizontalLayout />
                {/* START: Added Logout Button for Horizontal Layout */}
                <li className="nav-item">
                    <Link className="nav-link menu-link" to="/logout">
                        <i className="ri-logout-box-r-line"></i> <span>Logout</span>
                    </Link>
                </li>
                {/* END: Added Logout Button */}
              </ul>
            </Container>
          </div>
        ) : layoutType === 'twocolumn' ? (
          <React.Fragment>
            <TwoColumnLayout layoutType={layoutType} />
            {/* Note: For TwoColumnLayout, you might need to add the logout button inside that component itself if it doesn't use the shared navbar-nav structure */}
            <div className="sidebar-background"></div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <SimpleBar id="scrollbar" className="h-100">
              <Container fluid>
                <div id="two-column-menu"></div>
                <ul className="navbar-nav" id="navbar-nav">
                  <VerticalLayout layoutType={layoutType} />
                  
                  {/* START: Added Logout Button for Vertical Layout */}
                  <li className="nav-item">
                    <Link className="nav-link menu-link" to="/logout">
                        {/* You can change the icon to whatever fits your icon library */}
                        <i className="ri-logout-box-r-line"></i> <span>Logout</span>
                    </Link>
                  </li>
                  {/* END: Added Logout Button */}

                </ul>
              </Container>
            </SimpleBar>
            <div className="sidebar-background"></div>
          </React.Fragment>
        )}
      </div>
      <div className="vertical-overlay"></div>
    </React.Fragment>
  );
};

export default Sidebar;