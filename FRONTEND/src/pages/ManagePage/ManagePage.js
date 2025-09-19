import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Card, CardBody, CardHeader,
  Col, Container,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Row, Label, FormFeedback, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import ErrorModal from "../../Components/Common/ErrorModal";
import SuccessModal from "../../Components/Common/SuccessModal";
import { ToastContainer } from "react-toastify";
import { getManagePageDpdwns, getManagePageDetails, savePage, updatePage } from "../../helpers/fakebackend_helper"
import { GET_MANAGE_PAGE_DETAILS } from "../../helpers/url_helper"
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"

const SORT_ARROW_SIZE = 13; // px

// SortArrows component using SVG
function SortArrows({ direction, active }) {
  return (
    <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
      <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: "block" }}>
        <polyline
          points="3,8 6.5,4 10,8"
          fill="none"
          stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: "block", marginTop: -2 }}>
        <polyline
          points="3,5 6.5,9 10,5"
          fill="none"
          stroke={active && direction === 'desc' ? '#1064ea' : '#c1c5ca'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// Utility: get page details by ID from data array
function useThemePrimaryColor() {
  const [color, setColor] = useState("#198754"); // Bootstrap 5 success/green fallback
  useEffect(() => {
    const root = document.documentElement;
    let cssColor =
      getComputedStyle(root).getPropertyValue('--bs-primary').trim() ||
      getComputedStyle(root).getPropertyValue('--primary').trim();
    if (cssColor && /^#|rgb/.test(cssColor)) setColor(cssColor);
  }, []);
  return color;
}

const ManagePage = () => {
  const themePrimary = useThemePrimaryColor();

  // Live theme detection
  const [isDarkMode, setIsDarkMode] = useState(() => (
    document.body.classList.contains("dark") ||
    document.documentElement.classList.contains("dark")
  ));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(
        document.body.classList.contains("dark") ||
        document.documentElement.classList.contains("dark")
      );
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Chip styles for multi select
  const selectCustomStyles = {
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: "transparent",
      color: isDarkMode ? "#fff" : "#212529",
      border: `1px solid ${themePrimary}`,
      borderRadius: "4px",
      marginRight: "3px",
      padding: "0 2px",
      opacity: 1,
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: isDarkMode ? "#fff" : "#212529",
      opacity: 1,
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: isDarkMode ? "#fff" : themePrimary,
      borderRadius: "3px",
      background: "transparent",
      opacity: 1,
      ":hover": {
        backgroundColor: themePrimary,
        color: "#fff",
      },
    }),
    option: (styles, { isSelected, isFocused }) => ({
      ...styles,
      backgroundColor: "transparent",
      color: isSelected || isFocused
        ? themePrimary
        : isDarkMode
          ? "#fff"
          : "#212529",
      fontWeight: isSelected ? 700 : 400,
      opacity: 1,
      ":active": {
        backgroundColor: "rgba(0,0,0,0.05)",
        color: themePrimary,
      },
    }),
    control: (styles, state) => ({
      ...styles,
      backgroundColor: "transparent",
      borderColor: state.isFocused
        ? themePrimary
        : state.menuIsOpen
          ? themePrimary
          : "#ced4da",
      boxShadow: state.isFocused ? `0 0 0 1px ${themePrimary}` : "none",
      "&:hover": { borderColor: themePrimary },
      minHeight: "38px",
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: isDarkMode ? '#20232a' : 'white',
      zIndex: 10,
    }),
    placeholder: (styles) => ({
      ...styles,
      color: isDarkMode ? '#bfc9d1' : "#adb5bd",
    }),
    input: (styles) => ({
      ...styles,
      color: isDarkMode ? '#fff' : '#212529',
      opacity: 1,
    }),
  };

  // State variables
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [pageType, setPageType] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [response, setResponse] = useState("");
  const [username, setUserName] = useState('');
  const [data, setData] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [mainPage, setMainPage] = useState([]);
  const [parentChild, setParentChild] = useState([]);
  const [subChild, setSubChild] = useState([]);
  const [selectedMainPageId, setSelectedMainPageId] = useState(null);
  const [selectedParentChildId, setSelectedParentChildId] = useState(null);

  // New state variables for sorting and pagination
  // => Default: do NOT sort when page loads
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Sorting function
  const sortData = (data, key, direction) => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] === null && b[key] === null) return 0;
      const aValue = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Get sorted and paginated data
  // Only apply sort if key is set!
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredPages;
    return sortData(filteredPages, sortConfig.key, sortConfig.direction);
  }, [filteredPages, sortConfig]);

  // Calculate pagination values
  const actualPageSize = pageSize === -1 ? sortedData.length : pageSize;
  const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize]);

  const columns = useMemo(() => [
    {
      header: 'PageName',
      accessorKey: 'PageName',
      key: 'PageName',
      sortable: true,
    },
    {
      header: 'IconName',
      accessorKey: 'PageIcon',
      key: 'PageIcon',
      sortable: true,
    },
    {
      header: 'PageURL',
      accessorKey: 'PageURL',
      key: 'PageURL',
      sortable: true,
    },
    {
      header: 'ParentPage',
      accessorKey: 'ParentPageName',
      key: 'ParentPageName',
      sortable: true,
    },
    {
      header: 'RoleName',
      accessorKey: 'roles',
      key: 'roles',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'Status',
      key: 'Status',
      sortable: true,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      key: 'action',
      sortable: false,
    },
  ], []);

  const toSmallInt = (val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const flagIdFunction = async (flagId, userName, setState, parentPageId) => {
    try {
      const params = { flagId, requestUserName: userName };
      if (flagId === 4 && parentPageId) {
        params.parentPageId = parentPageId;
      }
      const response = await getManagePageDpdwns(params);
      console.log(response,"response")
      const options = response?.data || [];
      if (setState) setState(options);
      return options;
    } catch (error) {
      console.error(`Error fetching options for flag ${flagId}:`, error.message);
      return [];
    }
  };

  useEffect(() => {

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    if (!obj || !obj.user) return;

    const usernm = obj.user.loginName;
    setUserName(usernm);

    const fetchData = async () => {
      try {
        const viewResponse = await getManagePageDetails(GET_MANAGE_PAGE_DETAILS);
        if (viewResponse?.data) {
          setData(viewResponse.data);
          setPages(viewResponse.data);
          setFilteredPages(viewResponse.data);
        }

        const mainPages = await flagIdFunction(3, usernm, setMainPage);
        if (mainPages.length > 0) {
          const mainPageId = mainPages[0].pageId;
          setSelectedMainPageId(mainPageId);

          const parentPages = await flagIdFunction(4, usernm, setParentChild, mainPageId);
          console.log(parentPages,"parentPages")
          if (parentPages.length > 0) {
            const parentPageId = parentPages[0].pageId;
            setSelectedParentChildId(parentPageId);
            await flagIdFunction(4, usernm, setSubChild, parentPageId);
          }

          const rolesData = await flagIdFunction(2, usernm, null, mainPageId);
          if (rolesData.length > 0) {
            const formattedRoles = rolesData.map(role => ({
              value: role.roleId,
              label: role.roleName,
            }));
            setRolesList(formattedRoles);

            const selectedRoles = rolesData
              .filter(role => role.isAllocated)
              .map(role => role.roleId);
            formik.setFieldValue("RoleName", selectedRoles);
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, []);

  const handleMainPageChange = async (e) => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    const pageId = e.target.value;
    setSelectedMainPageId(pageId);
    formik.setFieldValue("MainPageID", pageId);

    const childPages = await flagIdFunction(4, usernm, setParentChild, pageId);
    setSubChild([]);
    setSelectedParentChildId(null);
    formik.setFieldValue("ParentPageID", "");

    if (childPages?.length > 0) {
      setSelectedParentChildId(childPages[0].pageId);
      formik.setFieldValue("ParentPageID", childPages[0].pageId);
      await flagIdFunction(4, usernm, setSubChild, childPages[0].pageId);
    }
  };

  const handleParentChildChange = async (e) => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    const pageId = e.target.value;
    setSelectedParentChildId(pageId);
    formik.setFieldValue("ParentPageID", pageId);
    await flagIdFunction(4, usernm, setSubChild, pageId);
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPages(pages);
    } else {
      setFilteredPages(
        pages.filter((page) =>
          Object.values(page)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
    setPage(0); // Reset to first page when searching
  }, [searchTerm, pages]);

  const initialValues = {
    PageName: "",
    PageURL: "",
    IconName: "",
    MainPageID: "",
    ParentPageID: "",
    ChildPageID: "",
    RoleName: [],
    PageType: "1",
    OrderChange: "IsAfter",
    orderChangeEnabled: false,
  };

const formik = useFormik({
  enableReinitialize: true,
  initialValues,
  onSubmit: async (values) => {
    try {
      const rolesJson = rolesList.map(r => ({
        roleid: r.value,
        isallocated: values.RoleName.includes(r.value)
      }));

      let isParentChildPage = Number(pageType);
      let parentPageId = 0;

      if (values.orderChangeEnabled) {
        if (isParentChildPage === 1) {
          // MainPage: no parent selected → parentPageId = 0
          parentPageId = 0;
        } else if (isParentChildPage === 2) {
          // ParentPage: send selected ParentPageID if available, else fallback to MainPageID
          parentPageId = values.ParentPageID
            ? toSmallInt(values.ParentPageID)
            : toSmallInt(values.MainPageID);
        } else if (isParentChildPage === 3) {
          // ChildPage: send selected ChildPageID if available, else fallback to ParentPageID
          parentPageId = values.ChildPageID
            ? toSmallInt(values.ChildPageID)
            : toSmallInt(values.ParentPageID);
        }
      }

      const isReOrder = !!values.orderChangeEnabled;
      const isBeforeAfter = !!(values.orderChangeEnabled && values.OrderChange === "IsAfter");
      const flagId = editMode ? 6 : 5;
      const pageId = editMode ? Number(selectedPageId) : 0;
      const isDisabled = editMode ? isActive : true;

      const payload = {
        flagId,
        pageId,
        pageName: values.PageName,
        pageUrl: values.PageURL,
        pageIcon: values.IconName,
        parentPageId, // ✅ Correct dynamic logic applied here
        roles: JSON.stringify(rolesJson),
        isParentChildPage,
        isReOrder,
        isBeforeAfter,
        isDisabled,
        requestUserName: username
      };

      const result = editMode
        ? await updatePage(payload)
        : await savePage(payload);

      if (result.status === "success") {
        setResponse(editMode ? "Page updated successfully" : "Page created successfully");
        setSuccessModal(true);
        setModalOpen(false);

        const viewResponse = await getManagePageDetails(GET_MANAGE_PAGE_DETAILS);
        if (viewResponse?.data) {
          setData(viewResponse.data);
          setPages(viewResponse.data);
          setFilteredPages(viewResponse.data);
        }
      } else {
        setResponse(result.displayMessage || "Operation failed");
        setErrorModal(true);
      }
    } catch (e) {
      setResponse("An error occurred");
      setErrorModal(true);
    }
  }
});

  const openAddModal = () => {
    setEditMode(false);
    setSelectedPageId(null);
    setPageType("1");
    setModalOpen(true);
    setIsActive(true);
    formik.resetForm();
    formik.setFieldValue("OrderChange", "IsAfter"); // Set default to IsAfter
  };

  const openEditModal = async (pageId) => {
    try {
      setEditMode(true);
      setSelectedPageId(pageId);

      if (!data || data.length === 0) {
        setResponse("Page data is still loading. Please try again shortly.");
        setErrorModal(true);
        return;
      }

      const pageDetails = data.find((page) => String(page.PageId) === String(pageId));
      if (!pageDetails) {
        setResponse("Page not found");
        setErrorModal(true);
        return;
      }

      formik.setValues({
        PageName: pageDetails.PageName || "",
        PageURL: pageDetails.PageURL || "",
        IconName: pageDetails.IconName || "",
        MainPageID: pageDetails.MainPageID || "",
        ParentPageID: pageDetails.ParentPageID || "",
        ChildPageID: pageDetails.ChildPageID || "",
        RoleName: pageDetails.RoleName
          ? pageDetails.RoleName.split(",").map((role) => role.trim()).filter(Boolean)
          : [],
        PageType: String(pageDetails.PageType) || "1",
        OrderChange: "IsAfter", // Set default to IsAfter
        orderChangeEnabled: false,
      });

      setPageType(String(pageDetails.PageType) || "1");
      setIsActive(!!pageDetails.Status);
      setModalOpen(true);

    } catch (error) {
      console.error("Failed to open edit modal:", error);
      setResponse("An error occurred while opening the edit form.");
      setErrorModal(true);
    }
  };

  // Table header rendering
  const renderTableHeader = () => (
    <tr>
      {columns.map((col, idx) => {
        if (!col.sortable) {
          return <th key={col.key || idx}>{col.header}</th>;
        }
        const active = sortConfig.key === col.key;
        return (
          <th
            key={col.key || idx}
            onClick={() => {
              if (!col.sortable) return;
              if (sortConfig.key === col.key) {
                setSortConfig({ key: col.key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
              } else {
                setSortConfig({ key: col.key, direction: 'asc' });
              }
            }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              paddingRight: 14,
              verticalAlign: "middle"
            }}
          >
            {col.header}
            <SortArrows active={active} direction={sortConfig.direction} />
          </th>
        );
      })}
    </tr>
  );

  // PAGINATION
  const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

  const renderPagination = () => {
    const pageSizeOptions = [
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 15, label: '15' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
      { value: -1, label: 'All' },
    ];

    return (
      <div style={{ margin: '18px 0 12px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {/* Left: Showing Results & Page Size */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
              Showing{' '}
              <b style={{ color: '#222', fontWeight: 600 }}>
                {pageSize === -1 ? sortedData.length : Math.min(pageSize, sortedData.length)}
              </b>{' '}
              of <b>{sortedData.length}</b> Results
            </span>
            <select
              value={pageSize}
              onChange={e => {
                const val = e.target.value === '-1' ? -1 : parseInt(e.target.value, 10);
                setPageSize(val);
                setPage(0);
              }}
              style={{
                border: '1px solid #c9ddf7',
                borderRadius: 7,
                padding: '7px 10px',
                fontSize: 15,
                width: '80px',
                color: '#444',
                marginTop: 4,
                outline: 'none',
                background: 'white',
                boxShadow: '0 0 0 2px #d0ebfd66',
              }}
            >
              {pageSizeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Pagination Controls */}
          <div className="btn-group" role="group" aria-label="Pagination">
            <button
              type="button"
              className="btn btn-light"
              disabled={page === 0 || pageSize === -1}
              onClick={() => setPage(Math.max(page - 1, 0))}
            >
              Previous
            </button>
            {pageSize !== -1 && Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
              let pageNum = i;
              if (pageCount > 5) {
                if (page >= 3 && page < pageCount - 2) {
                  pageNum = page - 2 + i;
                } else if (page >= pageCount - 2) {
                  pageNum = pageCount - 5 + i;
                }
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`}
                  onClick={() => setPage(pageNum)}
                  disabled={page === pageNum}
                  aria-current={page === pageNum ? 'page' : undefined}
                  style={{ minWidth: 36 }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              type="button"
              className="btn btn-light"
              disabled={(page >= pageCount - 1 || pageCount === 0) || pageSize === -1}
              onClick={() => setPage(Math.min(page + 1, pageCount - 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Table row rendering
  const renderTableRows = () => {
    if (paginatedData.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>
            No data found
          </td>
        </tr>
      );
    }
    return paginatedData.map((row, rowIndex) => (
      <tr key={rowIndex}>
        <td>{row.PageName}</td>
        <td>{row.PageIcon}</td>
        <td>{row.PageURL}</td>
        <td>{row.ParentPageName}</td>
        <td>{row.roles}</td>
        <td>
          {row.Status ? (
            <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
          ) : (
            <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
          )}
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button color="primary" className="btn-sm edit-item-btn" onClick={() => openEditModal(row.PageId)}>
              <i className="ri-edit-2-line"></i>
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  useEffect(() => {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const menuPage = JSON.parse(obj?.user?.menuPage || "[]");
      const applicationCode = obj?.user?.applicationCode;
      const currentPath = window.location.pathname;
  
      const currentPageLabel = findLabelByLink(menuPage, currentPath) || "Page";
  
      document.title = `${currentPageLabel} | ${applicationCode}`;
    }, []);


  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
      <SuccessModal
        show={successModal}
        onCloseClick={() => setSuccessModal(false)}
        successMsg={response}
      />
      <ErrorModal
        show={errorModal}
        onCloseClick={() => setErrorModal(false)}
        successMsg={response}
      />

      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Manage Page" pageTitle="Pages" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="bg-primary text-white p-3">
                  <Row className="g-4 align-items-center">
                    <Col className="d-flex align-items-center">
                      <h4 className="mb-0 card-title text-white">
                        Manage Page
                      </h4>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row className="g-4 mb-3">
                    <Col sm={4}>
                      <div className="search-box ms-2">
                        <Input
                          id="searchResultList"
                          type="text"
                          className="form-control"
                          placeholder="Search for pages..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </Col>
                    <Col sm>
                      <div className="d-flex justify-content-sm-end">
                        <Button
                          color="primary"
                          className="add-btn me-1"
                          onClick={openAddModal}
                          id="create-btn"
                        >
                          <i className="ri-add-fill me-1 align-bottom"></i> Add
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={12}>
                      <div className="table-responsive">
                                                <table className="table table-bordered table-hover mb-0">
                                                    <thead className="table-light">
                                                        {renderTableHeader()}
                                                    </thead>
                                                    <tbody>
                                                        {renderTableRows()}
                                                    </tbody>
                                                </table>
                                            </div>
                      {renderPagination()}
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        centered
        style={{ maxWidth: 600 }}
      >
        <ModalHeader
          className="bg-primary text-white p-3"
          toggle={() => setModalOpen(false)}
        >
          <span className="modal-title text-white">
            {editMode ? "Update Page" : "Add Page"}
          </span>
        </ModalHeader>
        <form onSubmit={formik.handleSubmit}>
          <ModalBody style={{ padding: 16 }}>
            <div className="mb-3 fw text-muted">
              Please fill mandatory information below{" "}
              <span className="text-danger">*</span>
            </div>

            {/* ==== FORM FIELDS ==== */}
            <FormGroup className="mb-3">
              <Label htmlFor="PageName">
                PageName <span className="text-danger">*</span>
              </Label>
              <Input
                name="PageName"
                placeholder="Enter PageName"
                type="text"
                maxLength={50}
                className="form-control"
                id="PageName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.PageName || ""}
                invalid={formik.touched.PageName && !!formik.errors.PageName}
              />
              {formik.touched.PageName && formik.errors.PageName && (
                <FormFeedback type="invalid">
                  {formik.errors.PageName}
                </FormFeedback>
              )}
            </FormGroup>

            <FormGroup className="mb-3">
              <Label htmlFor="PageURL">
                PageURL <span className="text-danger">*</span>
              </Label>
              <Input
                name="PageURL"
                placeholder="Enter PageURL"
                type="text"
                maxLength={50}
                className="form-control"
                id="PageURL"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.PageURL || ""}
                invalid={formik.touched.PageURL && !!formik.errors.PageURL}
              />
              {formik.touched.PageURL && formik.errors.PageURL && (
                <FormFeedback type="invalid">
                  {formik.errors.PageURL}
                </FormFeedback>
              )}
            </FormGroup>

            <FormGroup className="mb-3">
              <Label htmlFor="IconName">
                IconName <span className="text-danger">*</span>
              </Label>
              <Input
                name="IconName"
                placeholder="Enter IconName"
                type="text"
                maxLength={50}
                className="form-control"
                id="IconName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.IconName || ""}
                invalid={formik.touched.IconName && !!formik.errors.IconName}
              />
              {formik.touched.IconName && formik.errors.IconName && (
                <FormFeedback type="invalid">
                  {formik.errors.IconName}
                </FormFeedback>
              )}
            </FormGroup>

            <FormGroup className="mb-3">
              <Label>PageType</Label>
              <div>
                {/* MainPage Radio */}
                <FormGroup check inline>
                  <Input
                    type="radio"
                    name="PageType"
                    value="1"
                    checked={pageType === "1"}
                    onChange={() => {
                      setPageType("1");
                      formik.setFieldValue("PageType", "1");
                      formik.setFieldValue("MainPageID", "");
                      formik.setFieldValue("ParentPageID", "");
                      formik.setFieldValue("ChildPageID", "");
                      formik.setFieldValue("orderChangeEnabled", false);
                    }}
                  />
                  <Label check className="ms-1">MainPage</Label>
                </FormGroup>

                {/* ParentPage Radio */}
                <FormGroup check inline>
                  <Input
                    type="radio"
                    name="PageType"
                    value="2"
                    checked={pageType === "2"}
                    onChange={() => {
                      setPageType("2");
                      formik.setFieldValue("PageType", "2");
                      formik.setFieldValue("orderChangeEnabled", false);
                      formik.setFieldValue("ChildPageID", "");
                    }}
                  />
                  <Label check className="ms-1">ParentPage</Label>
                </FormGroup>

                {/* ChildPage Radio (unchanged) */}
                <FormGroup check inline>
                  <Input
                    type="radio"
                    name="PageType"
                    value="3"
                    checked={pageType === "3"}
                    onChange={() => {
                      setPageType("3");
                      formik.setFieldValue("PageType", "3");
                      formik.setFieldValue("ChildPageID", "");
                      formik.setFieldValue("orderChangeEnabled", false);
                    }}
                  />
                  <Label check className="ms-1">ChildPage</Label>
                </FormGroup>
              </div>
            </FormGroup>

            {/* MAIN PAGE specific UI */}
            {pageType === "1" && (
              <FormGroup className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Input
                    type="checkbox"
                    id="orderChangeCheckboxMain"
                    className="me-2"
                    checked={formik.values.orderChangeEnabled || false}
                    onChange={(e) => {
                      formik.setFieldValue("orderChangeEnabled", e.target.checked);
                      if (!e.target.checked) {
                        formik.setFieldValue("MainPageID", "");
                      }
                    }}
                  />
                  <Label htmlFor="orderChangeCheckboxMain" className="mb-0 fw-semibold">
                    Do you want to change order.?
                  </Label>
                </div>

                {formik.values.orderChangeEnabled && (
                  <FormGroup className="mt-2">
                    <Label htmlFor="MainPageID">MainPage</Label>
                    <Input
                      type="select"
                      name="MainPageID"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.MainPageID || ""}
                    >
                      <option value="">Select MainPage</option>
                      {mainPage.map((pg) => (
                        <option key={pg.pageId} value={pg.pageId}>
                          {pg.pageName}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                )}
              </FormGroup>
            )}

            {/* PARENT PAGE specific UI */}
            {pageType === "2" && (
              <>
                <FormGroup className="mb-3">
                  <Label htmlFor="MainPageID">ParentPage</Label>
                  <Input
                    type="select"
                    name="MainPageID"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.MainPageID || ""}
                  >
                    <option value="">Select ParentPage</option>
                    {mainPage.map((pg) => (
                      <option key={pg.pageId} value={pg.pageId}>
                        {pg.pageName}
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                <FormGroup className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Input
                      type="checkbox"
                      id="orderChangeCheckboxParent"
                      className="me-2"
                      checked={formik.values.orderChangeEnabled || false}
                      onChange={(e) => {
                        formik.setFieldValue("orderChangeEnabled", e.target.checked);
                        if (!e.target.checked) {
                          formik.setFieldValue("ParentPageID", "");
                        }
                      }}
                    />
                    <Label htmlFor="orderChangeCheckboxParent" className="mb-0 fw-semibold">
                      Do you want to change order?
                    </Label>
                  </div>

                  {formik.values.orderChangeEnabled && (
                    <FormGroup className="mt-2">
                      <Label htmlFor="ParentPageID">ParentPage</Label>
                      <Input
                        type="select"
                        name="ParentPageID"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.ParentPageID || ""}
                      >
                        <option value="">Select ParentPage</option>
                        {parentChild.map((pg) => (
                          <option key={pg.pageId} value={pg.pageId}>
                            {pg.pageName}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  )}
                </FormGroup>
              </>
            )}

            {pageType === "3" && (
              <>
                {/* Always show MainPage dropdown for ChildPage */}
                <FormGroup className="mb-3">
                  <Label htmlFor="MainPageID">MainPage</Label>
                  <Input
                    type="select"
                    name="MainPageID"
                    onChange={handleMainPageChange}
                    onBlur={formik.handleBlur}
                    value={selectedMainPageId || ""}
                  >
                    <option value="">Select MainPage</option>
                    {mainPage.map((pg) => (
                      <option key={pg.pageId} value={pg.pageId}>
                        {pg.pageName}
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                {/* Order Change Checkbox */}
                <FormGroup className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Input
                      type="checkbox"
                      id="orderChangeCheckbox"
                      className="me-2"
                      checked={formik.values.orderChangeEnabled || false}
                      onChange={(e) => {
                        formik.setFieldValue("orderChangeEnabled", e.target.checked);
                        if (!e.target.checked) {
                          formik.setFieldValue("ParentPageID", "");
                          formik.setFieldValue("ChildPageID", "");
                        }
                      }}
                    />
                    <Label htmlFor="orderChangeCheckbox" className="mb-0 fw-semibold">
                      Do you want to change order?
                    </Label>
                  </div>

                  {/* Order Type Radio Buttons */}
                  {formik.values.orderChangeEnabled && (
                    <div className="mt-2">
                      <FormGroup check inline>
                        <Input
                          type="radio"
                          name="OrderChange"
                          value="IsBefore"
                          checked={formik.values.OrderChange === "IsBefore"}
                          onChange={() =>
                            formik.setFieldValue("OrderChange", "IsBefore")
                          }
                        />
                        <Label check className="ms-1">
                          IsBefore
                        </Label>
                      </FormGroup>
                      <FormGroup check inline>
                        <Input
                          type="radio"
                          name="OrderChange"
                          value="IsAfter"
                          checked={formik.values.OrderChange === "IsAfter"}
                          onChange={() =>
                            formik.setFieldValue("OrderChange", "IsAfter")
                          }
                        />
                        <Label check className="ms-1">
                          IsAfter
                        </Label>
                      </FormGroup>
                    </div>
                  )}
                </FormGroup>

                {/* Conditional dropdowns for ParentPage and ChildPage */}
                {formik.values.orderChangeEnabled && (
                  <>
                    <FormGroup className="mb-3">
                      <Label htmlFor="ParentPageID">ParentPage</Label>
                      <Input
                        type="select"
                        name="ParentPageID"
                        onChange={handleParentChildChange}
                        onBlur={formik.handleBlur}
                        value={selectedParentChildId || ""}
                      >
                        <option value="">Select ParentPage</option>
                        {parentChild.map((pg) => (
                          <option key={pg.pageId} value={pg.pageId}>
                            {pg.pageName}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>

                    <FormGroup className="mb-3">
                      <Label htmlFor="ChildPageID">Child Page</Label>
                      <Input
                        type="select"
                        name="ChildPageID"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.ChildPageID || ""}
                      >
                        <option value="">Select Child Page</option>
                        {subChild.map((pg) => (
                          <option key={pg.pageId} value={pg.pageId}>
                            {pg.pageName}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </>
                )}
              </>
            )}


            {/* RoleName multi select */}
            <FormGroup className="mb-3">
              <Label htmlFor="RoleName">
                RoleName <span className="text-danger">*</span>
              </Label>
              <Select
                id="RoleName"
                options={rolesList}
                isMulti
                styles={selectCustomStyles}
                value={rolesList.filter((opt) =>
                  (formik.values.RoleName || []).includes(opt.value)
                )}
                onChange={(selectedOptions) => {
                  formik.setFieldValue(
                    "RoleName",
                    (selectedOptions || []).map((option) => option.value)
                  );
                }}
                onBlur={formik.handleBlur}
                placeholder="Select roles"
                closeMenuOnSelect={false}
                className={
                  formik.touched.RoleName && formik.errors.RoleName
                    ? "is-invalid"
                    : ""
                }
              />
              {formik.touched.RoleName && formik.errors.RoleName && (
                <div
                  style={{
                    color: "#f46a6a",
                    fontSize: 13,
                    marginTop: 3,
                  }}
                >
                  {formik.errors.RoleName}
                </div>
              )}
            </FormGroup>

            {editMode && (
              <FormGroup className="mb-3">
                <Label>Status</Label>
                <br />
                <div className="form-check form-switch form-switch-sm">
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="customSwitchsizelg"
                    checked={isActive}
                    onChange={() => setIsActive((prev) => !prev)}
                    style={{ height: "24px", width: "46px" }}
                  />
                  <Label
                    className="form-check-label"
                    htmlFor="customSwitchsizelg"
                  >
                    {isActive ? (
                      <span
                        className="badge bg-success-subtle text-success text-uppercase ms-1"
                        style={{ fontSize: "10px", padding: "2px 7px" }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className="badge bg-danger-subtle text-danger text-uppercase ms-1"
                        style={{ fontSize: "10px", padding: "2px 7px" }}
                      >
                        InActive
                      </span>
                    )}
                  </Label>
                </div>
              </FormGroup>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="hstack gap-2 justify-content-end">
              <Button type="submit" color="primary" id="add-btn">
                {editMode ? "Update" : "Save"}
              </Button>
              <Button
                type="button"
                className="btn btn-danger"
                onClick={() => setModalOpen(false)}
              >
                Close
              </Button>
              
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </React.Fragment>
  );
};

export default ManagePage;