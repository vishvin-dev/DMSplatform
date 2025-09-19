import React, { useState, useMemo, useEffect } from "react";
import {
  Button, Card, CardBody, CardHeader, Col, Container,
  ModalBody, ModalFooter, ModalHeader, Row, Label,
  FormFeedback, Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import BreadCrumb from '../../Components/Common/BreadCrumb';
// ... existing code ... <remove TableContainer import>
import ErrorModal from "../../Components/Common/ErrorModal";
import SuccessModal from "../../Components/Common/SuccessModal";
import { ToastContainer } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getAllGeographyCreation, postCreateGeographyCreation, putUpdateGeographyCreation, getGeographyCreationDpdwns } from "../../helpers/fakebackend_helper"
import { GET_GEOGRAPHY_CREATION } from "../../helpers/url_helper"
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

const Switch = ({ checked, onChange, id }) => (
  <div className="form-check form-switch d-inline-block align-middle">
    <input
      className="form-check-input"
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      style={{ width: '2.5em', height: '1.3em' }}
    />
  </div>
);

const Geography = () => {
  const [buttonval, setbuttonval] = useState('Add Geography');
  const [submitVal, setSubmitVal] = useState('Save');
  const [tableData, setTableData] = useState();
  const [modal_list, setmodal_list] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [edit_items, setedit_items] = useState({});
  const [edit_update, setedit_update] = useState(false);

  const [response, setResponse] = useState('');
  const [geographyTypeId, setGeographyTypeId] = useState('');
  const [parentGeographyId, setParentGeographyId] = useState('');
  const [data, setData] = useState([]);
  const [databk, setDataBk] = useState([...data]);
  const [username, setUserName] = useState('');
  const [parentGeographyOptions, setParentGeographyOptions] = useState([]);
  const [geographyTypeNameOptions, setGeographyTypeNameOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [checked, setChecked] = useState(true);
  const [checkedText, setCheckedText] = useState('InActive');

  // New state variables for sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
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
  const sortedData = useMemo(() => {
    // Only sort if key is provided AND user has clicked a header
    if (!sortConfig.key) return data;
    return sortData(data, sortConfig.key, sortConfig.direction);
  }, [data, sortConfig]);;

  // Calculate pagination values
  const actualPageSize = pageSize === -1 ? sortedData.length : pageSize;
  const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize]);

  const getHeaderClass = () => "card-primary text-white p-3";

  const columns = useMemo(() => [
    {
      header: "GeographyTypeName",
      accessorKey: "geographyTypeName",
      key: "geographyTypeName",
      sortable: true,
    },
    {
      header: "GeographyName",
      accessorKey: "geographyName",
      key: "geographyName",
      sortable: true,
    },
    {
      header: "GeographyCode",
      accessorKey: "geographyCode",
      key: "geographyCode",
      sortable: true,
    },
    {
      header: "GeographyDescription",
      accessorKey: "geographyDescription",
      key: "geographyDescription",
      sortable: true,
    },
    {
      header: "PostalCode",
      accessorKey: "postalCode",
      key: "postalCode",
      sortable: true,
    },
    {
      header: "ParentGeographyName",
      accessorKey: "parentGeographyName",
      key: "parentGeographyName",
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      key: 'status',
      sortable: true,
    },
    {
      header: "Action",
      accessorKey: "action",
      key: "action",
      sortable: false,
    },
  ], []);

  useEffect(() => {
    getOnLoadingData();
  }, []);

  async function getOnLoadingData() {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    let response = await getAllGeographyCreation(GET_GEOGRAPHY_CREATION);
    const allDesignations = response.data;
    const usernm = obj.user.loginName;

    setData(allDesignations);
    setDataBk(allDesignations);
    setUserName(usernm);
    setedit_update(false);
    setedit_items([]);
  }

  const flagIdFunction = async (flagID, setState, requestUserName) => {
    try {
      const params = { flagID, requestUserName };
      const response = await getGeographyCreationDpdwns(params);
      const options = response?.data || [];
      console.log(response, "reponseee")
      setState(options);
    } catch (error) {
      console.error(`Error fetching options for flag ${flagID}:`, error.message);
    }
  };

  useEffect(() => {

    const fetch = async () => {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj.user.loginName;
      setUserName(usernm);

      await flagIdFunction(2, setGeographyTypeNameOptions, usernm);
    }

    fetch()

  }, []);


  const handleGeographyTypeChange = async (e) => {
    const selectedGeographyTypeId = e.target.value;
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;

    formValidation.setFieldValue("geographyTypeId", selectedGeographyTypeId);
    formValidation.setFieldValue("parentGeographyId", "");

    if (selectedGeographyTypeId) {
      const params = {
        flagID: 3,
        requestUserName: usernm,
        geographyTypeId: Number(selectedGeographyTypeId),
      };

      try {
        const response = await getGeographyCreationDpdwns(params);
        const options = response?.data || [];
        console.log("response", response)
        setParentGeographyOptions(options);
      } catch (error) {
        console.error("Failed to fetch parent geography options:", error);
        setParentGeographyOptions([]); // fallback to empty
      }
    } else {
      setParentGeographyOptions([]);
    }
  };

  useEffect(() => {
  if (modal_list && !edit_update) {
    // Reset form to default values
    formValidation.resetForm({
      values: {
        geographyTypeId: "",
        geographyName: "",
        geographyCode: "",
        geographyDescription: "",
        postalCode: "",
        parentGeographyId: "",
      }
    });

    // Clear dropdown options
    setParentGeographyOptions([]);
  }
}, [modal_list, edit_update]);


  useEffect(() => {
    if (searchTerm.trim() === '') {
      setData(databk);
    } else {
      const filtered = databk.filter((item) => {
        return (
          item.geographyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.geographyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.geographyDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.postalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.parentGeographyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.geographyTypeName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setData(filtered);
    }
    setPage(0);
  }, [searchTerm, databk]);

  const updateRow = async (data) => {
    const filterData = data.row.original;
    console.log(filterData, "filterData");

    setedit_items(filterData);
    setedit_update(true);
    setGeographyTypeId(filterData.geographyTypeId || '');
    setParentGeographyId(filterData.parentGeographyId || '');
    setChecked(!filterData.status);
    setCheckedText(filterData.status ? 'InActive' : 'Active');
    setmodal_list(true);
    setbuttonval("Update Geography");
    setSubmitVal("Update");

    formValidation.setFieldValue("geographyTypeId", filterData.geographyTypeId || '');
    formValidation.setFieldValue("parentGeographyId", filterData.parentGeographyId || '');
    if (filterData.geographyTypeId) {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj.user.loginName;

      const params = {
        flagID: 3,
        requestUserName: usernm,
        geographyTypeId: Number(filterData.geographyTypeId),
      };

      try {
        const response = await getGeographyCreationDpdwns(params);
        const options = response?.data || [];
        console.log("response", response);
        setParentGeographyOptions(options);
      } catch (error) {
        console.error("Failed to fetch parent geography options:", error);
        setParentGeographyOptions([]);
      }
    } else {
      setParentGeographyOptions([]);
    }
  };

  const tog_list = () => {
    setedit_update(false);
    setedit_items({});
    setbuttonval("Add Geography");
    setSubmitVal("Save");
    setmodal_list(!modal_list);
    setGeographyTypeId('');
    setParentGeographyId('');
    setChecked(true);
    setCheckedText('Active');
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
              // If sorting this column for first time, use ascending; if same column, toggle
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
  // PAGINATION - Updated with centered results and left-aligned page size dropdown
  // PAGINATION - Updated with centered results and left-aligned page size dropdown
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
        <td>{row.geographyTypeName || ''}</td>
        <td>{row.geographyName}</td>
        <td>{row.geographyCode}</td>
        <td>{row.geographyDescription}</td>
        <td>{row.postalCode}</td>
        <td>{row.parentGeographyName}</td>
        <td>
          {row.status === true ? (
            <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
          ) : (
            <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
          )}
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button
              color="primary"
              className="btn-sm edit-item-btn"
              onClick={() => updateRow({ row: { original: row } })}
            >
              <i className="ri-edit-2-line"></i>
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  // FORMIK LOGIC
  const formValidation = useFormik({
    enableReinitialize: true,
    initialValues: {
      // geographyId:geographyId || "",
      geographyTypeId: geographyTypeId || "",
      geographyName: edit_items.geographyName || "",
      geographyCode: edit_items.geographyCode || "",
      geographyDescription: edit_items.geographyDescription || "",
      postalCode: edit_items.postalCode || "",
      parentGeographyId: parentGeographyId || "",
    },
    validationSchema: Yup.object({
      geographyTypeId: Yup.string().required("Please select GeographyType"),
      geographyName: Yup.string().max(50, "Maximum 50 characters allowed").required("Please enter GeographyName"),
      geographyCode: Yup.string().max(50, "Maximum 50 characters allowed").required("Please enter GeographyCode"),
      geographyDescription: Yup.string().max(50, "Maximum 50 characters allowed").required("Please enter GeographyDescription"),
      postalCode: Yup.string().max(50, "Maximum 50 characters allowed"),
    }),
    onSubmit: async (values) => {
      let response;
      try {
        if (edit_update === true) {
          response = await putUpdateGeographyCreation({
            geographyId: edit_items.geographyId,
            geographyTypeId: Number(values.geographyTypeId),
            geographyName: values.geographyName,
            geographyCode: values.geographyCode,
            geographyDescription: values.geographyDescription,
            postalCode: values.postalCode,
            parentGeographyId: Number(values.parentGeographyId),
            isDisabled: !checked,
            requestUserName: username,
          });
        } else {
          response = await postCreateGeographyCreation({
            geographyTypeId: Number(values.geographyTypeId),
            geographyName: values.geographyName,
            geographyCode: values.geographyCode,
            geographyDescription: values.geographyDescription,
            postalCode: values.postalCode,
            parentGeographyId: Number(values.parentGeographyId),
            isDisabled: false,
            requestUserName: username,
          });
        }

        const data = response
        if (data) {
          if (data.status === !'success') {
            setResponse(data.message);
            setSuccessModal(false);
            setErrorModal(true);
          } else {
            setResponse(data.message);
            setSuccessModal(true);
            setErrorModal(false);
          }
          tog_list();
          getOnLoadingData();
          formValidation.resetForm();
        }
      } catch (error) {
        setSuccessModal(false);
        setErrorModal(true);
      }
    },
  });

  const handleChange = () => {
    setChecked(!checked);
    setCheckedText(!checked == true ? 'Active' : 'InActive');
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
          <BreadCrumb title="Geography" pageTitle="Pages" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className={getHeaderClass()}>
                  <Row className="g-4 align-items-center">
                    <Col className="col-sm-auto">
                      <h4 className="mb-sm-0 card-title mb-0 align-self-center text-white">
                        Geography
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
                          placeholder="Search for Geography..."
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
                          onClick={tog_list}
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

      <Modal isOpen={modal_list} toggle={tog_list} centered>
        <ModalHeader className={getHeaderClass()} toggle={tog_list}>
          <span className="modal-title text-white">{buttonval}</span>
        </ModalHeader>
        <form
          className="tablelist-form"
          onSubmit={(e) => {
            e.preventDefault();
            formValidation.handleSubmit();
            return false;
          }}
        >
          <ModalBody>
            <div className="mb-3 fw text-muted">
              Please fill mandatory information below <span className="text-danger">*</span>
            </div>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label htmlFor="geographyTypeId">
                    GeographyTypeName <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    className="form-control"
                    name="geographyTypeId"
                    id="geographyTypeId"
                    value={formValidation.values.geographyTypeId || ""}
                    onChange={handleGeographyTypeChange}
                    onBlur={formValidation.handleBlur}
                    placeholder="Select Geography Type"
                  >
                    <option value="">Select GeographyType</option>
                    {geographyTypeNameOptions.map(type => (
                      <option key={type.geographyTypeId} value={type.geographyTypeId}>
                        {type.geographyTypeName}
                      </option>
                    ))}
                  </Input>
                  {formValidation.touched.geographyTypeId &&
                    formValidation.errors.geographyTypeId && (
                      <FormFeedback type="invalid">
                        {formValidation.errors.geographyTypeId}
                      </FormFeedback>
                    )}
                </FormGroup>
              </Col>
            </Row>

            {/* Parent Geography should be at last position */}
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label htmlFor="geographyName">
                    GeographyName <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    name="geographyName"
                    id="geographyName"
                    maxLength={50} // Add this
                    value={formValidation.values.geographyName || ""}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    placeholder="Enter GeographyName "
                  />
                  {formValidation.touched.geographyName && formValidation.errors.geographyName && (
                    <FormFeedback type="invalid">{formValidation.errors.geographyName}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label htmlFor="geographyCode">
                    GeographyCode <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    name="geographyCode"
                    id="geographyCode"
                    value={formValidation.values.geographyCode || ""}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    placeholder="Enter GeographyCode"
                  />
                  {formValidation.touched.geographyCode && formValidation.errors.geographyCode && (
                    <FormFeedback type="invalid">{formValidation.errors.geographyCode}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label htmlFor="geographyDescription">
                    GeographyDescription <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    name="geographyDescription"
                    id="geographyDescription"
                    maxLength={100} // Add this
                    value={formValidation.values.geographyDescription || ""}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    placeholder="Enter GeographyDescription "
                  />
                  {formValidation.touched.geographyDescription && formValidation.errors.geographyDescription && (
                    <FormFeedback type="invalid">{formValidation.errors.geographyDescription}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label htmlFor="postalCode">
                    PostalCode <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    name="postalCode"
                    id="postalCode"
                    maxLength={10} // Add this
                    value={formValidation.values.postalCode || ""}
                    onChange={(e) => {
                      // Only allow numbers
                      const re = /^[0-9\b]+$/;
                      if (e.target.value === '' || re.test(e.target.value)) {
                        formValidation.handleChange(e);
                      }
                    }}
                    onBlur={formValidation.handleBlur}
                    placeholder="Enter PostalCode "
                  />
                  {formValidation.touched.postalCode && formValidation.errors.postalCode && (
                    <FormFeedback type="invalid">{formValidation.errors.postalCode}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>

            {/* Conditionally render the Parent Geography dropdown */}
            {formValidation.values.geographyTypeId && parentGeographyOptions.length > 0 && (
              <Row>
                <Col md={12}>
                  <FormGroup className="mb-3">
                    <Label htmlFor="parentGeographyId">ParentGeography</Label>
                    <Input
                      type="select"
                      className="form-control"
                      name="parentGeographyId"
                      id="parentGeographyId"
                      value={formValidation.values.parentGeographyId || ""}
                      onChange={formValidation.handleChange}
                      onBlur={formValidation.handleBlur}
                    >
                      <option value="">Select ParentGeography</option>
                      {parentGeographyOptions.length > 0 ? (
                        parentGeographyOptions.map(item => (
                          <option key={item.geographyId} value={item.geographyId}>
                            {item.geographyName}
                          </option>
                        ))
                      ) : (
                        <option disabled value="">
                          No parent available
                        </option>
                      )}
                    </Input>
                    {formValidation.touched.parentGeographyId &&
                      formValidation.errors.parentGeographyId && (
                        <FormFeedback type="invalid">
                          {formValidation.errors.parentGeographyId}
                        </FormFeedback>
                      )}
                  </FormGroup>

                  {/* Toggle Switch */}
                  {edit_update && (
                    <Row>
                      <Col md={10}>
                    <FormGroup className="mb-3">
                        <div className="form-check form-switch form-switch-lg">
                          <Input className="form-check-input" type="checkbox" role="switch"
                            id="SwitchCheck1" checked={checked} onClick={handleChange} />
                          <Label className="form-check-label" htmlFor="SwitchCheck1">
                             {' '}
                            <span className={`badge text-uppercase ${checked
                                ? 'bg-success-subtle text-success'
                                : 'bg-danger-subtle text-danger'
                              }`}>
                              {checked ? 'Active' : 'Inactive'}
                            </span>
                          </Label>
                        </div>
                      </FormGroup>
                      </Col>
                      <Col md={1}></Col>
                    </Row>
                  )}

                </Col>
              </Row>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="submit" color="primary">
              {submitVal}
            </Button>
            <Button
              type="button"
              color="danger"
              onClick={tog_list}
            >
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </React.Fragment>
  );
};

export default Geography;
