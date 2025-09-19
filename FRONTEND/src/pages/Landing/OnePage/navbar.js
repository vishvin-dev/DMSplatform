import React, { useState, useEffect } from "react";
import { Collapse, Container, NavbarToggler, NavLink } from "reactstrap";
import Scrollspy from "react-scrollspy";
import { Link } from "react-router-dom";

// Import Images
import logodark from "../../../assets/images/logo-dark.png";
import logolight from "../../../assets/images/logo-light.png";
// import { getApplicationDetails } from "../../../helpers/fakebackend_helper"
// import { APPLICATION_DETAILS } from "../../../helpers/url_helper"

const Navbar = () => {
    const [isOpenMenu, setisOpenMenu] = useState(false);
    const [navClass, setnavClass] = useState("");
    const [appDetails, setAppDetails] = useState(null);


    const toggle = () => setisOpenMenu(!isOpenMenu);

    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
    });

    const scrollNavigation = () => {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setnavClass("is-sticky");
        } else {
            setnavClass("");
        }
    }

    const [activeLink, setActiveLink] = useState();
    useEffect(() => {
        const activation = (event) => {
            const target = event.target;
            if (target) {
                target.classList.add('active');
                setActiveLink(target);
                if (activeLink && activeLink !== target) {
                    activeLink.classList.remove('active');
                }
            }
        };
        const defaultLink = document.querySelector('.navbar li.a.active');
        if (defaultLink) {
            defaultLink?.classList.add("active")
            setActiveLink(defaultLink)
        }
        const links = document.querySelectorAll('.navbar a');
        links.forEach((link) => {
            link.addEventListener('click', activation);
        });
        return () => {
            links.forEach((link) => {
                link.removeEventListener('click', activation);
            });
        };
    }, [activeLink]);



    //displaying the application details
    // const getOnLoading = async () => {
    //     try {
    //         const response =  getApplicationDetails(APPLICATION_DETAILS);
    //         const data =await response.data;
    //         console.log(data,"datttatatatta")

    //         if (data.status === "success") {
    //             setAppDetails(data.data[0]); // take first item from array
    //         } else {
    //             console.error("Failed to fetch application details");
    //         }
    //     } catch (err) {
    //         console.error("Error fetching data:", err.message || err);
    //     }
    // };

    // useEffect(() => {
    //     getOnLoading();
    // }, []);

    return (
        <React.Fragment>
            <nav className={"navbar navbar-expand-lg navbar-landing fixed-top " + navClass} id="navbar">
                <Container>
                    <Link className="navbar-brand" to="/index">
                        {/*<img src={logodark} className="card-logo card-logo-dark" alt="logo dark" height="17" />*/}
                        <img src={logolight} className="card-logo card-logo-light" alt="logo light" height="17" />
                        <h3 className="card-logo card-logo-dark">Vigilance Management System(VMS)</h3>
                    </Link>

                    <NavbarToggler className="navbar-toggler py-0 fs-20 text-body" onClick={toggle} type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <i className="mdi mdi-menu"></i>
                    </NavbarToggler>

                    <Collapse
                        isOpen={isOpenMenu}
                        className="navbar-collapse"
                        id="navbarSupportedContent"
                    >
                        <Scrollspy
                            offset={-18}
                            items={[
                                "hero",
                                "services",
                                "features",
                                "plans",
                                "reviews",
                                "team",
                                "contact",
                            ]}
                            currentClassName="active"
                            className="navbar-nav mx-auto mt-2 mt-lg-0"
                            id="navbar-example"
                        >
                            <li className="nav-item">
                                <NavLink href="#hero">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink href="#services">Services</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink href="#features">Features</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink href="#plans">Plans</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink href="#reviews">Reviews</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink href="#team">Team</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink href="#contact">Contact</NavLink>
                            </li>
                        </Scrollspy>

                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex flex-row align-items-center gap-2">
                            <li className="nav-item">
                                <Link to="/login" className="btn btn-link fw-medium text-decoration-none text-body">
                                    Sign in
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="btn btn-primary">
                                    Sign Up
                                </Link>
                            </li>
                        </ul>


                    </Collapse>
                </Container>
            </nav>
        </React.Fragment>
    );
};

export default Navbar;