import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const Navdata = () => {
    const history = useNavigate();

    // Unified state to track open menus by their ID or key
    const [menuState, setMenuState] = useState({});
    const [currentMainState, setCurrentMainState] = useState("Administrator");

    const toggleMenu = (key, isMain = false) => (e) => {
        e.preventDefault();

        // Handle single open section for main menus
        if (isMain) {
            setCurrentMainState(key);
            setMenuState((prevState) => ({
                ...Object.keys(prevState).reduce((acc, curr) => {
                    acc[curr] = false;
                    return acc;
                }, {}),
                [key]: !prevState[key],
            }));
        } else {
            setMenuState((prevState) => ({
                ...prevState,
                [key]: !prevState[key],
            }));
        }

        updateIconSidebar(e);
    };

    function updateIconSidebar(e) {
        if (e?.target?.getAttribute("subitems")) {
            const ul = document.getElementById("two-column-menu");
            const iconItems = ul.querySelectorAll(".nav-icon.active");
            iconItems.forEach((item) => {
                item.classList.remove("active");
                const id = item.getAttribute("subitems");
                const submenu = document.getElementById(id);
                if (submenu) submenu.classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove("twocolumn-panel");

    }, [currentMainState]);


    

    const rawUserData = JSON.parse(sessionStorage.getItem("authUser") || "{}");
    const menuItems = rawUserData?.user?.menuPage || [];




    const parsedMenuItems = menuItems.map(item => ({
        ...item,
        click: toggleMenu(item.label, true), // replace string with actual function
        stateVariables: menuState[item.label],
        subItems: item.subItems?.map(sub => ({
            ...sub,
            click: toggleMenu(sub.label),
            stateVariables: menuState[sub.label],
            childItems: sub.childItems || []

        })) || []
    }));


    return <React.Fragment>{parsedMenuItems}</React.Fragment>;
};

export default Navdata;