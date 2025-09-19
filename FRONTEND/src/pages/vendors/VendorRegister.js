import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup,Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import {
    postAllvendors,
    putUpdateRoles,
    getAllvendors,
    deleteRoles,
    putUpdateVendor
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROLES_URL_GET_DELETE, } from '../../helpers/url_helper';
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

const vendor = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [buttonval, setbuttonval] = useState('Add Vendor');
    const [subButtonval, setSubButtonval] = useState('Save');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [checkedText, setCheckedText] = React.useState('');
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

    // Get sorted and filtered data
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item =>
            item.vendorName?.toLowerCase().includes(lowerSearch) ||
            item.vendorCode?.toLowerCase().includes(lowerSearch) ||
            item.contactPerson?.toLowerCase().includes(lowerSearch) ||
            item.emailAddress?.toLowerCase().includes(lowerSearch) ||
            item.contactNo?.toLowerCase().includes(lowerSearch) ||
            item.vendorAddress?.toLowerCase().includes(lowerSearch) ||
            item.fieldDelimiter?.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm, data]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return sortData(filteredData, sortConfig.key, sortConfig.direction);
    }, [filteredData, sortConfig]);

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
            header: 'VendorName',
            accessorKey: 'vendorName',
            key: 'vendorName',
            sortable: true,
        },
        {
            header: 'VendorCode',
            accessorKey: 'vendorCode',
            key: 'vendorCode',
            sortable: true,
        },
        {
            header: 'ContactPerson',
            accessorKey: 'contactPerson',
            key: 'contactPerson',
            sortable: true,
        },
        {
            header: 'EmailAddress',
            accessorKey: 'emailAddress',
            key: 'emailAddress',
            sortable: true,
        },
        {
            header: 'ContactNumber',
            accessorKey: 'contactNo',
            key: 'contactNo',
            sortable: true,
        },
        {
            header: 'VendorAddress',
            accessorKey: 'vendorAddress',
            key: 'vendorAddress',
            sortable: true,
        },
        {
            header: 'FieldDelimiter',
            accessorKey: 'fieldDelimiter',
            key: 'fieldDelimiter',
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

    const tog_list = () => {
        if (modal_list) {
            setedit_update(false);
            setedit_items([]);
            setChecked(false);
            setbuttonval('Add Vendor');
            setSubButtonval('Save');
            setTimeout(() => {
                validation.resetForm();
            }, 100);
        } else {
            if (!edit_update) {
                setbuttonval('Add Vendor');
                setSubButtonval('Save');
                setChecked(false);
                setedit_items([]);
                validation.resetForm();
            }
        }
        setmodal_list(!modal_list);
    };

    const [modal_delete, setmodal_delete] = useState(false);
    const tog_delete = () => {
        setmodal_delete(!modal_delete);
    };

    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.loginName
            const payload = {
                flagId: 1,
                requestUserName: usernm
            }
            let response;
            response = getAllvendors(payload);
            var allRoles = await response;
            console.log(allRoles, "allroless")
            setData(allRoles.data || []);
            setDataBk(allRoles.data || []);
            setUserName(usernm);
            setedit_update(false);
            setedit_items([])
            setbuttonval('Add Vendor')
            setSubButtonval('Save');
        } catch (error) {
            setData([]);
            setDataBk([]);
        }
    }

    // Delete To do
    const onClickTodoDelete = (data) => {
        setedit_items(data);
        setSuccessModal(true);
    };

    const handleDeleteRole = async () => {
        try {
            if (edit_items) {
                let roleId = edit_items.row.original.roleId;
                let response;
                response = deleteRoles(roleId);
                var deleteMsg = await response;
                //get existing Records
                response = getAllRoles(ROLES_URL_GET_DELETE);
                var allRoles = await response;
                setData(allRoles);
                setDataBk(allRoles);
                setedit_items('');
                setSuccessModal(false);
                toast.success(deleteMsg.responseString, { autoClose: 3000 });
            }
        } catch (error) {
            toast.error("Roles Delete Failed", { autoClose: 3000 });
        }
    };

    const updateRow = async (rowData) => {
        const filterData = rowData;
        console.log(filterData);

        setedit_update(true);
        setedit_items(filterData);
        setbuttonval('Update Vendor');
        setSubButtonval('Update');
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');

        const formValues = {
            vendorID: filterData.vendorID || '',
            vendorName: filterData.vendorName || '',
            vendorCode: filterData.vendorCode || '',
            contactPerson: filterData.contactPerson || '',
            emailAddress: filterData.emailAddress || '',
            contactNo: filterData.contactNo || '',
            vendorAddress: filterData.vendorAddress || '',
            fieldDelimiter: filterData.fieldDelimiter || '',
            status: filterData.status || false,
            requestUserName: username
        };

        validation.resetForm();
        setTimeout(() => {
            validation.setValues(formValues);
            setmodal_list(true);
        }, 50);
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            vendorID: edit_items.vendorID || '',
            vendorName: edit_items.vendorName || '',
            vendorCode: edit_items.vendorCode || '',
            contactPerson: edit_items.contactPerson || '',
            emailAddress: edit_items.emailAddress || '',
            contactNo: edit_items.contactNo || '',
            vendorAddress: edit_items.vendorAddress || '',
            fieldDelimiter: edit_items.fieldDelimiter || '',
            status: edit_items.status || false,
            requestUserName: username
        },
        validationSchema: Yup.object({
    vendorName: Yup.string()
        .max(50, 'Maximum 50 characters allowed')
        .required("Please Enter VendorName"),
    vendorCode: Yup.string()
        .max(20, 'Maximum 20 characters allowed')
        .required("Please Enter VendorCode"),
    contactPerson: Yup.string()
        .max(50, 'Maximum 50 characters allowed')
        .required("Please Enter ContactPerson"),
    emailAddress: Yup.string()
        .email("Invalid email address")
        .max(100, 'Maximum 100 characters allowed')
        .required("Please Enter EmailAddress"),
    contactNo: Yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(10, 'Must be only digits')
        .max(12, 'Must be only digits')
        .required("Please Enter ContactNumber"),
    vendorAddress: Yup.string()
        .max(200, 'Maximum 200 characters allowed')
        .required("Please Enter VendorAddress"),
    fieldDelimiter: Yup.string()
        .max(10, 'Maximum 10 characters allowed')
        .required("Please Enter FieldDelimiter"),
}),
        onSubmit: async (values) => {
            try {
                let response;

                if (edit_update === true) {
                    const updatePayload = {
                        ...values,
                        isDisabled: !checked,
                        requestUserName: username || ''
                    };
                    response = await putUpdateVendor(updatePayload);
                } else {
                    const createPayload = {
                        ...values,
                        isDisabled: false,
                        requestUserName: username || ''
                    };
                    response = await postAllvendors(createPayload);
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
                    validation.resetForm();
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

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
    };

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setPage(0);
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
                <td>{row.vendorName}</td>
                <td>{row.vendorCode}</td>
                <td>{row.contactPerson}</td>
                <td>{row.emailAddress}</td>
                <td>{row.contactNo}</td>
                <td>{row.vendorAddress}</td>
                <td>{row.fieldDelimiter}</td>
                <td>
                    {!row.status ? (
                        <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
                    ) : (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">Inactive</span>
                    )}
                </td>
                <td>
                    <div className="d-flex gap-2">
                        <Button color="primary" className="btn-sm edit-item-btn" onClick={() => updateRow(row)}>
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
                    <BreadCrumb title="Vendor Creation" pageTitle="Pages" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">
                                                Vendor Creation
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
                                                    placeholder="Search for vendors..."
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

            {/* Modal Form */}
            <Modal isOpen={modal_list} toggle={tog_list} centered size="lg">
  <ModalHeader className="bg-primary text-white p-3" toggle={tog_list}>
    <span className="modal-title text-white">{buttonval}</span>
  </ModalHeader>
  <form
    className="tablelist-form"
    onSubmit={(e) => {
      e.preventDefault();
      validation.handleSubmit();
      return false;
    }}
  >
    <ModalBody>
      <div className="mb-3 fw text-muted">
        Please fill mandatory information below <span className="text-danger">*</span>
      </div>

      {/* Main Form Fields - Split into two columns */}
      <Row>
        {/* First Column */}
        <Col md={6}>
          {[
            { name: 'vendorName', label: 'VendorName', placeholder: 'Enter VendorName', maxLength: 50 },
            { name: 'vendorCode', label: 'VendorCode', placeholder: 'Enter VendorCode', maxLength: 20 },
            { name: 'contactPerson', label: 'ContactPerson', placeholder: 'Enter ContactPerson', maxLength: 50 },
            { name: 'emailAddress', label: 'EmailAddress', placeholder: 'Enter Email', maxLength: 100 },
          ].map((field) => (
            <FormGroup className="mb-3" key={field.name}>
              <Label htmlFor={field.name}>
                {field.label} <span className="text-danger">*</span>
              </Label>
              <Input
                name={field.name}
                placeholder={field.placeholder}
                type={field.type || 'text'}
                className="form-control"
                id={field.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values[field.name] || ''}
                invalid={validation.touched[field.name] && validation.errors[field.name] ? true : false}
                maxLength={field.maxLength}
              />
              {validation.touched[field.name] && validation.errors[field.name] && (
                <FormFeedback type="invalid">{validation.errors[field.name]}</FormFeedback>
              )}
            </FormGroup>
          ))}
        </Col>

        {/* Second Column */}
        <Col md={6}>
          {[
            { name: 'contactNo', label: 'ContactNumber', placeholder: 'Enter ContactNumber', maxLength: 20 },
            { name: 'vendorAddress', label: 'VendorAddress', placeholder: 'Enter VendorAddress', maxLength: 200 },
            { name: 'fieldDelimiter', label: 'FieldDelimiter', placeholder: 'Enter FieldDelimiter', maxLength: 10 },
          ].map((field) => (
            <FormGroup className="mb-3" key={field.name}>
              <Label htmlFor={field.name}>
                {field.label} <span className="text-danger">*</span>
              </Label>
              <Input
                name={field.name}
                placeholder={field.placeholder}
                type={field.type || 'text'}
                className="form-control"
                id={field.name}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values[field.name] || ''}
                invalid={validation.touched[field.name] && validation.errors[field.name] ? true : false}
                maxLength={field.maxLength}
              />
              {validation.touched[field.name] && validation.errors[field.name] && (
                <FormFeedback type="invalid">{validation.errors[field.name]}</FormFeedback>
              )}
            </FormGroup>
          ))}
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
                        checked={checked}
                        onChange={handleChange}
                      />
                      <Label className="form-check-label" htmlFor="customSwitchsizelg">
                        Status: {' '}
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
              </Row>
            )}
    </ModalBody>
    <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
      <Button color="primary" type="submit" className="me-2" id="add-btn">
        {subButtonval}
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

export default vendor;
