import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
  Modal, Input, FormGroup,Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  getAllSurveyCategory,
  postCreateSurveySubCategory,
  putUpdateSurveySubCategory
} from "../../helpers/fakebackend_helper";
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

const SurveySubCategory = () => {
  const [buttonval, setbuttonval] = useState('Add SurveySubCategory');
  const [submitVal, setSubmitVal] = useState('Save');
  const [data, setData] = useState([]);
  const [databk, setDataBk] = useState([]);
  const [modal_list, setmodal_list] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [edit_items, setedit_items] = useState({});
  const [edit_update, setedit_update] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState(false);
  const [categories, setCategories] = useState([]);
  const [username, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    if (!sortConfig.key) return data; // keep backend order
    return sortData(data, sortConfig.key, sortConfig.direction);
  }, [data, sortConfig]);
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
      header: 'SurveyCategoryName',
      accessorKey: 'surveyCategoryName',
      key: 'surveyCategoryName',
      sortable: true,
    },
    {
      header: 'SurveySubCategoryName',
      accessorKey: 'surveySubCategoryName',
      key: 'surveySubCategoryName',
      sortable: true,
    },
    {
      header: 'SurveySubCategoryCode',
      accessorKey: 'surveySubCategoryCode',
      key: 'surveySubCategoryCode',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      key: 'status',
      sortable: true,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      key: 'action',
      sortable: false,
    },
  ], []);

  // Improved initialValues handling for Formik
  const getInitialValues = () => {
    const categoryId = edit_items && (edit_items.surveyCategoryId || edit_items.SurveyCategoryId);

    return {
      surveySubCategoryCode: edit_items && edit_items.surveySubCategoryCode ? edit_items.surveySubCategoryCode : "",
      surveySubCategoryName: edit_items && edit_items.surveySubCategoryName ? edit_items.surveySubCategoryName : "",
      surveyCategoryId: categoryId ? String(categoryId) : "",
    };
  };

  const formValidation = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(),
    validationSchema: Yup.object({
      surveyCategoryId: Yup.string().required("Please select Category"),
      surveySubCategoryCode: Yup.string().max(20, 'Maximum 20 characters allowed').required("Please enter Survey SubCategory Code"),
      surveySubCategoryName: Yup.string().max(50, 'Maximum 50 characters allowed').required("Please enter Survey SubCategory Name"),
    }),
    onSubmit: async (values) => {
      try {
        let response;
        if (edit_update) {
          const categoryIdToUse = values.surveyCategoryId;

          if (!categoryIdToUse) {
            throw new Error("Category ID is required for update");
          }

          if (!edit_items.surveySubCategoryId) {
            throw new Error("Survey SubCategory ID is required for update");
          }

          const updatePayload = {
            flagId: 4,
            surveySubCategoryId: parseInt(edit_items.surveySubCategoryId),
            surveyCategoryId: parseInt(categoryIdToUse),
            surveySubCategoryCode: values.surveySubCategoryCode.trim(),
            surveySubCategoryName: values.surveySubCategoryName.trim(),
            isDisabled: !status,
            requestUserName: username || ''
          };

          response = await putUpdateSurveySubCategory(updatePayload);
        } else {
          if (!values.surveyCategoryId) {
            throw new Error("Category selection is required");
          }

          const createPayload = {
            flagId: 3,
            surveyCategoryId: parseInt(values.surveyCategoryId),
            surveySubCategoryCode: values.surveySubCategoryCode.trim(),
            surveySubCategoryName: values.surveySubCategoryName.trim(),
            isDisabled: false,
            requestUserName: username || ''
          };

          response = await postCreateSurveySubCategory(createPayload);
        }

        if (response && response.data) {
          const res = Array.isArray(response.data) ? response.data[0] : response.data;

          if (res && (res.responseStatusCode === '100' || res.responseStatusCode === '-100')) {
            setResponse(res.responseStatusCodeGUIDisplay || "Error occurred.");
            setSuccessModal(false);
            setErrorModal(true);
          } else {
            setResponse(res?.responseStatusCodeGUIDisplay || "Operation completed successfully!");
            setSuccessModal(true);
            setErrorModal(false);
          }

          tog_list();
          await getOnLoadingData();
          formValidation.resetForm();
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        let errorMessage = "Submission failed. Please try again.";
        if (error.message) {
          errorMessage = error.message;
        }

        setResponse(errorMessage);
        setSuccessModal(false);
        setErrorModal(true);
      }
    }
  });

  useEffect(() => {
    getOnLoadingData();
    loadSurveyCategoryDropdownList();
  }, []);

  // Enhanced useEffect to handle edit mode form initialization
  useEffect(() => {
    if (edit_update && edit_items.surveySubCategoryId && modal_list && categories.length > 0) {
      const categoryIdFromEditItem = edit_items.surveyCategoryId || edit_items.SurveyCategoryId;
      const currentCategoryId = formValidation.values.surveyCategoryId;
      const expectedCategoryId = categoryIdFromEditItem ? String(categoryIdFromEditItem) : "";

      if (currentCategoryId !== expectedCategoryId) {
        const formValues = {
          surveySubCategoryCode: edit_items.surveySubCategoryCode || "",
          surveySubCategoryName: edit_items.surveySubCategoryName || "",
          surveyCategoryId: expectedCategoryId
        };

        formValidation.setValues(formValues);
      }
    }
  }, [edit_update, edit_items, modal_list, categories]);

  async function getOnLoadingData() {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      var usernm = obj.user.loginName;
      setUserName(usernm);
      const payload = {
        flagId: 1,
        requestUserName: usernm
      };

      let response = await getAllSurveyCategory(payload);

      setData(response.data || []);
      setDataBk(response.data || []);

      setedit_update(false);
      setedit_items({});
      setbuttonval('Add SurveySubCategory');
    } catch (error) {
      setData([]);
      setDataBk([]);
    }
  }

  const loadSurveyCategoryDropdownList = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj?.user?.loginName || username;

      const payload = {
        flagId: 2,
        requestUserName: usernm
      };

      const response = await getAllSurveyCategory(payload);

      const categoryData = response.data || [];
      const sortedList = categoryData.sort((a, b) =>
        (a.surveyCategoryName || '').localeCompare(b.surveyCategoryName || '')
      );
      setCategories(sortedList);
    } catch (error) {
      setCategories([]);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setData(databk);
    } else {
      const filtered = databk.filter((item) => {
        return (
          item.surveySubCategoryName?.toLowerCase().includes(term.toLowerCase()) ||
          item.surveyCategoryName?.toLowerCase().includes(term.toLowerCase()) ||
          item.surveySubCategoryCode?.toLowerCase().includes(term.toLowerCase())
        );
      });
      setData(filtered);
    }
    setPage(0);
  };

  const updateRow = (dataCell) => {
    const rowData = dataCell.row.original;
    const categoryId = rowData.surveyCategoryId || rowData.SurveyCategoryId;

    setedit_update(true);
    setedit_items(rowData);
    setbuttonval('Update SurveySubCategory');
    setSubmitVal('Update');
    setStatus(!rowData.status);

    const setFormAndOpenModal = () => {
      const foundCategory = categories.find(cat => cat.surveyCategoryId === categoryId);

      const formValues = {
        surveySubCategoryCode: rowData.surveySubCategoryCode || "",
        surveySubCategoryName: rowData.surveySubCategoryName || "",
        surveyCategoryId: categoryId ? String(categoryId) : ""
      };

      formValidation.resetForm();

      setTimeout(() => {
        formValidation.setValues(formValues);
        setmodal_list(true);
      }, 50);
    };

    loadSurveyCategoryDropdownList().then(() => {
      setFormAndOpenModal();
    }).catch(error => {
      if (categories.length > 0) {
        setFormAndOpenModal();
      }
    });
  };

  const tog_list = () => {
    if (modal_list) {
      setedit_update(false);
      setedit_items({});
      setStatus(false);
      setbuttonval('Add SurveySubCategory');
      setSubmitVal('Save');
      setTimeout(() => {
        formValidation.resetForm();
      }, 100);
    } else {
      if (!edit_update) {
        setbuttonval('Add SurveySubCategory');
        setSubmitVal('Save');
        setStatus(false);
        setedit_items({});
        formValidation.resetForm();
      }
    }
    setmodal_list(!modal_list);
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
        <td>{row.surveyCategoryName}</td>
        <td>{row.surveySubCategoryName}</td>
        <td>{row.surveySubCategoryCode}</td>
        <td>
          {!row.status ? (
            <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
          ) : (
            <span className="badge bg-danger-subtle text-danger text-uppercase">Inactive</span>
          )}
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button color="primary" className="btn-sm edit-item-btn" onClick={() => updateRow({ row: { original: row } })}>
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
      <SuccessModal show={successModal} onCloseClick={() => setSuccessModal(false)} successMsg={response} />
      <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} successMsg={response} />
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="SurveySubCategory" pageTitle="Pages" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="bg-primary text-white p-3">
                  <Row className="g-4 align-items-center">
                    <Col className="d-flex align-items-center">
                      <h4 className="mb-0 card-title text-white">
                        SurveySubCategory
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
                          placeholder="Search for SurveySubCategory..."
                          value={searchTerm}
                          onChange={handleSearch}
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

      <Modal isOpen={modal_list} toggle={tog_list} centered size="lg">
        <ModalHeader className="bg-primary text-white p-3" toggle={tog_list}>
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
                  <Label htmlFor="surveyCategoryId">
                    SurveyCategoryName <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    className="form-control"
                    name="surveyCategoryId"
                    id="surveyCategoryId"
                    value={formValidation.values.surveyCategoryId}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    invalid={
                      formValidation.touched.surveyCategoryId &&
                      formValidation.errors.surveyCategoryId
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option
                        key={cat.surveyCategoryId}
                        value={String(cat.surveyCategoryId)}
                      >
                        {cat.surveyCategoryName}
                      </option>
                    ))}
                  </Input>
                  {formValidation.touched.surveyCategoryId && formValidation.errors.surveyCategoryId ? (
                    <FormFeedback type="invalid">
                      {formValidation.errors.surveyCategoryId}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label>SurveySubCategoryCode <span className="text-danger">*</span></Label>
                  <Input
                    name="surveySubCategoryCode"
                    placeholder="Enter SurveySubCategoryCode"
                    value={formValidation.values.surveySubCategoryCode}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    invalid={formValidation.touched.surveySubCategoryCode && !!formValidation.errors.surveySubCategoryCode}
                    maxLength={20}
                  />
                  {formValidation.touched.surveySubCategoryCode && formValidation.errors.surveySubCategoryCode && (
                    <FormFeedback>{formValidation.errors.surveySubCategoryCode}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label>SurveySubCategoryName <span className="text-danger">*</span></Label>
                  <Input
                    name="surveySubCategoryName"
                    placeholder="Enter SurveySubCategoryName"
                    value={formValidation.values.surveySubCategoryName}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    invalid={formValidation.touched.surveySubCategoryName && !!formValidation.errors.surveySubCategoryName}
                    maxLength={50}
                  />
                  {formValidation.touched.surveySubCategoryName && formValidation.errors.surveySubCategoryName && (
                    <FormFeedback>{formValidation.errors.surveySubCategoryName}</FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
            {edit_update && (
              <Row>
                <Col md={12}>
               <FormGroup className="mb-3">
  <div className="form-check form-switch form-switch-lg" dir="ltr">
    <Input
      type="switch"
      className="form-check-input"
      id="customSwitchsizelg"
      checked={status}
      onChange={() => setStatus(!status)}
    />
    <Label className="form-check-label" htmlFor="customSwitchsizelg">
      Status:{" "}
      <span
        className={`badge text-uppercase ${
          status ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
        }`}
      >
        {status ? "Active" : "Inactive"}
      </span>
    </Label>
  </div>
</FormGroup>

                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
            {/* <Button color="light" className="me-2" onClick={() => formValidation.resetForm()}>
              Reset
            </Button> */}
            <Button color="primary" type="submit" className="me-2" id="add-btn">
              {submitVal}
            </Button>
            <Button color="danger" onClick={tog_list}>
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </React.Fragment>
  );
};

export default SurveySubCategory;
