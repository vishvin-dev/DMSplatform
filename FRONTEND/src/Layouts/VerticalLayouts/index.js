import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Collapse } from 'reactstrap';
// Import Data
import navdata from "../LayoutMenuData";
//i18n
import { withTranslation } from "react-i18next";
import withRouter from "../../Components/Common/withRouter";
import { useSelector } from "react-redux";
import { createSelector } from 'reselect';

const VerticalLayout = (props) => {
    const navData = navdata().props.children;
    const path = props.router.location.pathname;
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [activeChildMenu, setActiveChildMenu] = useState(null);


    /*
 layout settings
 */

    const selectLayoutState = (state) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            leftsidbarSizeType: layout.leftsidbarSizeType,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
            layoutType: layout.layoutType
        })
    );
    // Inside your component
    const {
        leftsidbarSizeType, sidebarVisibilitytype, layoutType
    } = useSelector(selectLayoutProperties);

    //vertical and semibox resize events
    const resizeSidebarMenu = useCallback(() => {
        var windowSize = document.documentElement.clientWidth;
        if (windowSize >= 1025) {
            if (document.documentElement.getAttribute("data-layout") === "vertical") {
                document.documentElement.setAttribute("data-sidebar-size", leftsidbarSizeType);
            }
            if (document.documentElement.getAttribute("data-layout") === "semibox") {
                document.documentElement.setAttribute("data-sidebar-size", leftsidbarSizeType);
            }
            if ((sidebarVisibilitytype === "show" || layoutType === "vertical" || layoutType === "twocolumn") && document.querySelector(".hamburger-icon")) {
                //      document.querySelector(".hamburger-icon").classList.remove("open");
                // } else {
                //      document.querySelector(".hamburger-icon").classList.add("open");
                // }
                var hamburgerIcon = document.querySelector(".hamburger-icon");
                if (hamburgerIcon !== null) {
                    hamburgerIcon.classList.remove("open");
                }
            } else {
                var hamburgerIcon = document.querySelector(".hamburger-icon");
                if (hamburgerIcon !== null) {
                    hamburgerIcon.classList.add("open");
                }
            }

        } else if (windowSize < 1025 && windowSize > 767) {
            document.body.classList.remove("twocolumn-panel");
            if (document.documentElement.getAttribute("data-layout") === "vertical") {
                document.documentElement.setAttribute("data-sidebar-size", "sm");
            }
            if (document.documentElement.getAttribute("data-layout") === "semibox") {
                document.documentElement.setAttribute("data-sidebar-size", "sm");
            }
            if (document.querySelector(".hamburger-icon")) {
                document.querySelector(".hamburger-icon").classList.add("open");
            }
        } else if (windowSize <= 767) {
            document.body.classList.remove("vertical-sidebar-enable");
            if (document.documentElement.getAttribute("data-layout") !== "horizontal") {
                document.documentElement.setAttribute("data-sidebar-size", "lg");
            }
            if (document.querySelector(".hamburger-icon")) {
                document.querySelector(".hamburger-icon").classList.add("open");
            }
        }
    }, [leftsidbarSizeType, sidebarVisibilitytype, layoutType]);

    useEffect(() => {
        window.addEventListener("resize", resizeSidebarMenu, true);
    }, [resizeSidebarMenu]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const initMenu = () => {
            const pathName = process.env.PUBLIC_URL + path;
            const ul = document.getElementById("navbar-nav");
            const items = ul.getElementsByTagName("a");
            let itemsArray = [...items]; // converts NodeList to Array
            removeActivation(itemsArray);
            let matchingMenuItem = itemsArray.find((x) => {
                return x.pathname === pathName;
            });
            if (matchingMenuItem) {
                activateParentDropdown(matchingMenuItem);
            }
        };
        if (props.layoutType === "vertical") {
            initMenu();
        }
    }, [path, props.layoutType]);

    function activateParentDropdown(item) {
        item.classList.add("active");
        let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

        if (parentCollapseDiv) {
            // to set aria expand true remaining
            parentCollapseDiv.classList.add("show");
            parentCollapseDiv.parentElement.children[0].classList.add("active");
            parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
            if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
                parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
                if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
                    parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
                if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
                    parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").classList.add("show");
                    parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
                }
            }
            return false;
        }
        return false;
    }

    const removeActivation = (items) => {
        let actiItems = items.filter((x) => x.classList.contains("active"));

        actiItems.forEach((item) => {
            if (item.classList.contains("menu-link")) {
                if (!item.classList.contains("active")) {
                    item.setAttribute("aria-expanded", false);
                }
                if (item.nextElementSibling) {
                    item.nextElementSibling.classList.remove("show");
                }
            }
            if (item.classList.contains("nav-link")) {
                if (item.nextElementSibling) {
                    item.nextElementSibling.classList.remove("show");
                }
                item.setAttribute("aria-expanded", false);
            }
            item.classList.remove("active");
        });
    };

    return (
        <React.Fragment>
            {/* Static MENU Title - This will always be at the top */}
            <li className="menu-title">
                <span data-key="t-menu" style={{ fontSize: "1.1rem" }}>
                    MENU
                </span>
            </li>

            {/* START: Added HOME button */}
            <li className="nav-item">
                <Link className="nav-link menu-link" to="/welcomepage">
                    <i className="ri-home-line"></i>
                    <span>Home</span>
                </Link>
            </li>
            {/* END: Added HOME button */}
           <li className="nav-item">
  <Link className="nav-link menu-link" to="/dashboard">
    <i className="ri-dashboard-line"></i>
    <span>Dashboard</span>
  </Link>
</li>

            {/* Map over the navigation data */}
            {(navData || []).map((item, key) => (
                <React.Fragment key={key}>
                    {item.subItems ? (
                        <li className="nav-item">
                            <Link
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveMenu((prev) => (prev === item.label ? null : item.label));
                                }}
                                className="nav-link menu-link"
                                to="/#"
                                data-bs-toggle="collapse"
                            >
                                <i className={item.icon}></i>
                                <span>{props.t(item.label)}</span>
                                {item.badgeName && (
                                    <span className={`badge badge-pill bg-${item.badgeColor}`}>{item.badgeName}</span>
                                )}
                            </Link>

                            <Collapse className="menu-dropdown" isOpen={activeMenu === item.label}>
                                <ul className="nav nav-sm flex-column">
                                    {item.subItems.map((subItem, subKey) => (
                                        <li className="nav-item" key={subKey}>
                                            {!subItem.isChildItem ? (
                                                <Link
                                                    to={subItem.link || "/#"}
                                                    className="nav-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    {props.t(subItem.label)}
                                                    {subItem.badgeName && (
                                                        <span className={`badge badge-pill bg-${subItem.badgeColor}`}>{subItem.badgeName}</span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <>
                                                    <Link
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveSubMenu((prev) =>
                                                                prev === subItem.label ? null : subItem.label
                                                            );
                                                        }}
                                                        className="nav-link"
                                                        to="/#"
                                                    >
                                                        {props.t(subItem.label)}
                                                        {subItem.badgeName && (
                                                            <span className={`badge badge-pill bg-${subItem.badgeColor}`}>{subItem.badgeName}</span>
                                                        )}
                                                    </Link>

                                                    <Collapse className="menu-dropdown" isOpen={activeSubMenu === subItem.label}>
                                                        <ul className="nav nav-sm flex-column">
                                                            {subItem.childItems?.map((childItem, childKey) => (
                                                                <li className="nav-item" key={childKey}>
                                                                    {!childItem.childItems ? (
                                                                        <Link
                                                                            to={childItem.link || "/#"}
                                                                            className="nav-link"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                            }}
                                                                        >
                                                                            {props.t(childItem.label)}
                                                                        </Link>
                                                                    ) : (
                                                                        <>
                                                                            <Link
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    setActiveChildMenu((prev) =>
                                                                                        prev === childItem.label ? null : childItem.label
                                                                                    );
                                                                                }}
                                                                                to="/#"
                                                                                className="nav-link"
                                                                            >
                                                                                {props.t(childItem.label)}
                                                                            </Link>

                                                                            <Collapse
                                                                                className="menu-dropdown"
                                                                                isOpen={activeChildMenu === childItem.label}
                                                                            >
                                                                                <ul className="nav nav-sm flex-column">
                                                                                    {childItem.childItems.map((subChildItem, subChildKey) => (
                                                                                        <li className="nav-item" key={subChildKey}>
                                                                                            <Link
                                                                                                to={subChildItem.link || "/#"}
                                                                                                className="nav-link"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                }}
                                                                                            >
                                                                                                {props.t(subChildItem.label)}
                                                                                            </Link>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </Collapse>
                                                                        </>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Collapse>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </Collapse>
                        </li>
                    ) : (
                        <li className="nav-item">
                            <Link className="nav-link menu-link" to={item.link || "/#"}>
                                <i className={item.icon}></i>
                                <span>{props.t(item.label)}</span>
                                {item.badgeName && (
                                    <span className={`badge badge-pill bg-${item.badgeColor}`}>{item.badgeName}</span>
                                )}
                            </Link>
                        </li>
                    )}
                </React.Fragment>
            ))}
        </React.Fragment>
    );

};

VerticalLayout.propTypes = {
    location: PropTypes.object,
    t: PropTypes.any,
};

export default withRouter(withTranslation()(VerticalLayout));