import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();

  const [isAdministrator, setIsAdministrator] = useState(false);
  const [isMasters, setIsMasters] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInvoiceManage, setIsInvoiceManage] = useState(false);

  const [isUsers, setUsers] = useState(false);
  const [isApplication, setApplication] = useState(false);
  const [isInvoice, setInvoice] = useState(false);
  const [isSubscription, setSubscription] = useState(false);
  const [isGeography, setGeography] = useState(false);
  const [isLocation, setLocation] = useState(false);
  const [isMaterial, setMaterial] = useState(false);
  const [isMiscelleneous, setMiscelleneous] = useState(false);
  const [isVendor, setVendor] = useState(false);
  const [isMeterSetting, setMeterSetting] = useState(false); // Added new state variable

  const [iscurrentState, setIscurrentState] = useState("Administrator");
  const [isSurveyCategory, setSurveyCategory] = useState(false);
  

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id)) document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Administrator") setIsAdministrator(false);
    if (iscurrentState !== "Masters") setIsMasters(false);
    if (iscurrentState !== "Admin") setIsAdmin(false);
  }, [history, iscurrentState, isAdministrator, isMasters, isAdmin]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: 1,
      label: "Administrator",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isAdministrator,
      click: function (e) {
        e.preventDefault();
        setIsAdministrator(!isAdministrator);
        setIscurrentState("Administrator");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: 8,
          label: "Application Setting",
          link: "/#",
          parentId: 1,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setApplication(!isApplication);
          },
          stateVariables: isApplication,
          childItems: [
            {
              id: 9,
              label: "Application Creation",
              link: "/es-application",
              parentId: 8,
            },
            {
              id: 10,
              link: "/es-application-feature",
              label: "Application Feature Creation",
              parentId: 8,
            },
          ],
        },
        {
          id: 12,
          label: "Subscription Setting",
          link: "/#",
          parentId: 1,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setSubscription(!isSubscription);
          },
          stateVariables: isSubscription,
          childItems: [
            {
              id: 13,
              label: "Subscription Type",
              link: "/subscription-type",
              parentId: 12,
            },
            {
              id: 14,
              link: "/subscription-category",
              label: "Subscription Category",
              parentId: 12,
            },
            {
              id: 15,
              link: "/subscription-subcategory",
              label: "Subscription Sub Category",
              parentId: 12,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      label: "Masters",
      icon: "ri-database-2-line",
      link: "/#",
      stateVariables: isMasters,
      click: function (e) {
        e.preventDefault();
        setIsMasters(!isMasters);
        setIscurrentState("Masters");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: 21,
          label: "Geography Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setGeography(!isGeography);
          },
          stateVariables: isGeography,
          childItems: [
            {
              id: 23,
              label: "Geography Creation",
              link: "/geography",
              parentId: 21,
            },
            {
              id: 22,
              label: "Geography Type",
              link: "/geography-type",
              parentId: 21,
            },
          ],
        },
        {
          id: 24,
          label: "Location Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setLocation(!isLocation);
          },
          stateVariables: isLocation,
          childItems: [
            {
              id: 25,
              label: "Location Type",
              link: "/location-type",
              parentId: 24,
            },
            {
              id: 26,
              label: "Location Creation",
              link: "/location",
              parentId: 24,
            },
          ],
        },
        {
          id: 27,
          label: "Invoice Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setInvoice(!isInvoice);
          },
          stateVariables: isInvoice,
          childItems: [
            {
              id: 31,
              label: "Particular Master",
              link: "/particular-master",
              parentId: 27,
            },
            {
              id: 28,
              label: "Invoice Type",
              link: "/invoice-type",
              parentId: 27,
            },
            {
              id: 29,
              label: "Invoice Category",
              link: "/invoice-catagory",
              parentId: 27,
            },
            {
              id: 30,
              label: "Invoice Sub Category",
              link: "/invoice-sub-catagory",
              parentId: 27,
            },
          ],
        },
        {
          id: 32,
          label: "Material Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setMaterial(!isMaterial);
          },
          stateVariables: isMaterial,
          childItems: [
            {
              id: 33,
              label: "Material Type",
              link: "/material-type",
              parentId: 32,
            },
            {
              id: 35,
              label: "Make Master",
              link: "/make-master",
              parentId: 32,
            },
            {
              id: 36,
              label: "Capacity Master",
              link: "/capacity-master",
              parentId: 32,
            },
            {
              id: 39,
              label: "Units Of Measurement",
              link: "/unit-of-measurement",
              parentId: 32,
            },
            {
              id: 50,
              label: "Material Category",
              link: "/material-category",
              parentId: 32,
            },
            {
              id: 51,
              label: "Material Sub Category",
              link: "/material-sub-category",
              parentId: 32,
            },
            {
              id: 52,
              label: "Material Receive Mode",
              link: "/material-receive-mode",
              parentId: 32,
            },
            {
              id: 53,
              label: "Model Master",
              link: "/model-master",
              parentId: 32,
            },
            {
              id: 54,
              label: "Client Material SubCategory",
              link: "/client-material-sub-category",
              parentId: 32,
            },
            {
              id: 70,
              label: "Abbreviation Master",
              link: "/abbreviation-master",
              parentId: 32,
            },
            {
              id: 71,
              label: "Client Supplier Allocation",
              link: "/client-supplier-allocation",
              parentId: 32,
            },
            {
              id: 72,
              label: "Approval Process",
              link: "/approval-process",
              parentId: 32,
            },
            {
              id: 73,
              label: "Approval Management",
              link: "/approval-management",
              parentId: 32,
            },
            {
              id: 74,
              label: "Client Page Permission",
              link: "/client-page-permission",
              parentId: 32,
            },
          ],
        },
        {
          id: 75,
          label: "Vendor Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setVendor(!isVendor);
          },
          stateVariables: isVendor,
          childItems: [
            {
              id: 76,
              label: "Vendor Creation",
              link: "/vendor-creation",
              parentId: 75,
            },
            {
              id: 77,
              label: "VendorMeterReader Creation ",
              link: "/VendorMeterReader-Creation",
              parentId: 75,
            },

          ],
        },
        {
          id: 82,
          label: "Survey Category",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setSurveyCategory(!isSurveyCategory); 
          },
          stateVariables: isSurveyCategory, 
          childItems: [
            {
              id: 83, 
              label: "SurveyCategoryCreation",
              link: "/SurveyCategoryCreation",
              parentId: 82,
            },
            {
              id: 84, 
              label: "Satisfaction Level",
              link: "/SatisfactionLevel",
              parentId: 82,
            },
            {
              id: 85, 
              label: "SurveySubCategory ",
              link: "/SurveySubCategory",
              parentId: 82,
            },
          ],
        },
        {
          id: 34,
          label: "Miscellaneous Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setMiscelleneous(!isMiscelleneous);
          },
          stateVariables: isMiscelleneous,
          childItems: [
            {
              id: 37,
              label: "Reason Category",
              link: "/reason-category",
              parentId: 34,
            },
            {
              id: 38,
              label: "Reason Sub Category",
              link: "/reason-sub-category",
              parentId: 34,
            },
            {
              id: 55,
              label: "Document Type",
              link: "/document-type",
              parentId: 34,
            },
            {
              id: 56,
              label: "Document Category",
              link: "/document-category",
              parentId: 34,
            },
          ],
        },
        // {
        //   id: 84,
        //   label: "Meter Setting",
        //   link: "/#",
        //   parentId: 4,
        //   isChildItem: true,
        //   click: function (e) {
        //     e.preventDefault();
        //     setMeterSetting(!isMeterSetting);
        //   },
        //   stateVariables: isMeterSetting,
        //   childItems: [
        //     {
        //       id: 96,
        //       label: "Meter Reading Creation",
        //       link: "/MeterReadingMaster",
        //       parentId: 84,
        //     },
        //   ],
        // },
        {
          id: 84,
          label: "Meter Setting",
          link: "/#",
          parentId: 4,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setMeterSetting(!isMeterSetting);
          },
          stateVariables: isMeterSetting,
          childItems: [
            {
              id: 96,
              label: "Meter Reading Creation",
              link: "/MeterReadingMaster",
              parentId: 84,
            },
            {
              id: 97,
              label: "Meter Reading Registration",
              link: "/MeterReadingRegistration",
              parentId: 84,
            },
            {
              id: 98,
              label: "MeterReaderDeviceAllocation",
              link: "/MeterReaderDeviceAllocation",
              parentId: 84,
            },
            {
              id: 99,
              label: "MeterReaderTourPlan",
              link: "/MeterReaderTourPlan",
              parentId: 84,
            },
            {
              id: 99,
              label: "ConsumerHistory",
              link: "/ConsumerInformation",
              parentId: 84,
            },
            {
              id: 100,
              label: "Managepage",
              link: "/managepage",
              parentId: 84,
            },

          ],
        },
      ],
    },
    {
      id: 2,
      label: "Admin",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isAdmin,
      click: function (e) {
        e.preventDefault();
        setIscurrentState("Admin");
        setIsAdmin(!isAdmin);
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: 40,
          label: "User Setting",
          link: "/#",
          parentId: 2,
          isChildItem: true,
          click: function (e) {
            e.preventDefault();
            setUsers(!isUsers);
          },
          stateVariables: isUsers,
          childItems: [
            {
              id: 16,
              label: "Role Creation",
              link: "/roles-creation",
              parentId: 40,
            },
            {
              id: 41,
              link: "/client-role-allocation",
              label: "Client Role Creation",
              parentId: 40,
            },
            {
              id: 17,
              link: "/user-creation",
              label: "User Creation",
              parentId: 40,
            },
            {
              id: 42,
              link: "/DesignationCreation",
              label: "Designation Creation",
              parentId: 40,
            },
            {
              id: 43,
              link: "/ManageUser",
              label: "Manage User",
              parentId: 40,
            },
          ],
        },
      ],
    },
    {
      id: 60,
      label: "Invoice Management",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isInvoiceManage,
      click: function (e) {
        e.preventDefault();
        setIsInvoiceManage(!isInvoiceManage);
      },
      subItems: [
        {
          id: 61,
          label: "Supplier Master",
          link: "/supplier-master",
          parentId: 60,
        },
        {
          id: 62,
          label: "Customer Master",
          link: "/customer-master",
          parentId: 60,
        },
      ],
    },
  ];

  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;