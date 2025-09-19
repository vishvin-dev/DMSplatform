import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    postGeographyTypeCreate,
    putGeographyTypeUpdate,
    getGeographyTypesByCountryId,
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

const GeographyType = () => {
    const [buttonval, setbuttonval] = useState('Add Geography Type');
    const [submitVal, setSubmitVal] = useState('Save');
    const [countries, setCountries] = useState([]);
    const [username, setUserName] = useState('');
    const [data, setData] = useState([]);
    const [databk, setDataBk] = useState([]);
    const [name, setName] = useState('');
    const [modal_list, setmodal_list] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [edit_items, setedit_items] = useState([]);
    const [edit_update, setedit_update] = useState(false);
    const [response, setResponse] = useState('');
    const [types, setTypes] = useState([]);
    const [selected, setSelected] = useState([]);
    const [isTableDisbled, setIsTableDisbled] = useState(false);
    const [countryId, setCountryId] = useState(0);
    const [parentGeographyTypeId, setParentGeographyTypeId] = useState('');
    const [parentGeographyShow, setParentGeographyShow] = useState(false);
    const [checked, setChecked] = useState(true);
    const [checkedText, setCheckedText] = useState('InActive');
    const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

    // New state variables for sorting and pagination
  const [sortConfig, setSortConfig] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    const pageSizeOptions = [
        { value: 5, label: '5 items' },
        { value: 10, label: '10 items' },
        { value: 25, label: '25 items' },
        { value: 50, label: '50 items' },
        { value: -1, label: 'All items' },
    ];

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
    if (!sortConfig || !sortConfig.key) return data;
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
            header: 'GeographyTypeName',
            accessorKey: 'geographyTypeName',
            key: 'geographyTypeName',
            sortable: true,
        },
        {
            header: 'GeographyTypeCode',
            accessorKey: 'geographyTypeCode',
            key: 'geographyTypeCode',
            sortable: true,
        },
        {
            header: 'GeographyTypeDesc',
            accessorKey: 'geographyTypeDescription',
            key: 'geographyTypeDescription',
            sortable: true,
        },
        {
            header: 'ParentGeographyType',
            accessorKey: 'parentGeographyTypeName',
            key: 'parentGeographyTypeName',
            sortable: true,
        },
        {
            header: 'CreatedOn',
            accessorKey: 'requestDate',
            key: 'requestDate',
            sortable: true,
        },
        {
            header: 'CreatedBy',
            accessorKey: 'requestUserName',
            key: 'requestUserName',
            sortable: true,
        },
        {
            header: 'Status',
            accessorKey: 'status',
            key: 'status',
            sortable: false,
        },
        {
            header: 'Action',
            accessorKey: 'action',
            key: 'action',
            sortable: false,
        },
    ], []);

    async function loadGeographyTypes(value, latestOnly = true) {
        let id = value;
        try {
            let response = await getGeographyTypesByCountryId(id);
            const allTypes = response.data || [];

            // Sort by descending ID
            const sorted = allTypes.sort((a, b) => b.geographyTypeId - a.geographyTypeId);

            if (latestOnly) {
                const latestType = sorted[0];
                if (latestType) {
                    setParentGeographyShow(true);
                    setTypes([{
                        value: latestType.geographyTypeId,
                        label: latestType.geographyTypeName,
                        parentId: latestType.parentGeographyTypeID
                    }]);
                    return [latestType];
                } else {
                    setParentGeographyShow(false);
                    setTypes([]);
                    return [];
                }
            } else {
                const typeList = sorted.map((type) => ({
                    value: type.geographyTypeId,
                    label: type.geographyTypeName,
                    parentId: type.parentGeographyTypeID
                }));
                setParentGeographyShow(typeList.length > 0);
                setTypes(typeList);
                return typeList;
            }
        } catch (error) {
            console.error("Error loading geography types:", error);
            setParentGeographyShow(false);
            setTypes([]);
            return [];
        }
    }

    const updateRow = async (data) => {
        const filterData = data.row.original;
        console.log("Editing:", filterData);

        setedit_items(filterData);
        setedit_update(true);
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');

        setbuttonval('Update GeographyType');
        setSubmitVal('Update');

        const allTypes = await loadGeographyTypes(countryId, false); // get all types
        const currentParentType = allTypes.find(t => t.value === filterData.parentGeographyTypeID);

        setTypes(currentParentType ? [currentParentType] : []);

        setParentGeographyTypeId(filterData.parentGeographyTypeID || null);
        setmodal_list(true);
    };

    const tog_list = () => {
        setedit_update(false);
        setedit_items([]);
        loadGeographyTypes(countryId);
        setbuttonval('Add GeographyType');
        setSubmitVal('Save');
        setmodal_list(!modal_list);
        setChecked(true);
        setCheckedText('Active');
    };

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(!checked == true ? 'Active' : 'InActive');
    };

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setName(term);
        if (term.trim() === '') {
            setData(databk);
        } else {
            const filtered = databk.filter((item) => {
                return (
                    item.geographyTypeName?.toLowerCase().includes(term.toLowerCase()) ||
                    item.geographyTypeCode?.toLowerCase().includes(term.toLowerCase()) ||
                    item.geographyTypeDescription?.toLowerCase().includes(term.toLowerCase()) ||
                    item.parentGeographyTypeName?.toLowerCase().includes(term.toLowerCase()) ||
                    item.requestUserName?.toLowerCase().includes(term.toLowerCase())
                );
            });
            setData(filtered);
        }
        setPage(0);
    };

    const filter = (e) => {
        handleSearch(e);
    };

    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        var usernm = obj.user.loginName;
        setUserName(usernm);

        try {
            let response = await getGeographyTypesByCountryId(countryId);
            setData(response.data);
            setDataBk(response.data);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    const refreshData = async () => {
        try {
            let response = await getGeographyTypesByCountryId(countryId);
            setData(response.data);
            setDataBk(response.data);
        } catch (error) {
            console.error("Error refreshing data:", error);
        }
    };

    // Table header rendering
    const renderTableHeader = () => (
    <tr>
        {columns.map((col, idx) => {
            if (!col.sortable) {
                return <th key={col.key || idx}>{col.header}</th>;
            }
            const active = sortConfig && sortConfig.key === col.key;
            let direction = (active && sortConfig) ? sortConfig.direction : 'asc';
            return (
                <th
                    key={col.key || idx}
                    onClick={() => {
                        if (!col.sortable) return;
                        if (!sortConfig || sortConfig.key !== col.key) {
                            setSortConfig({ key: col.key, direction: 'asc' });
                        } else if (sortConfig.direction === 'asc') {
                            setSortConfig({ key: col.key, direction: 'desc' });
                        } else if (sortConfig.direction === 'desc') {
                            setSortConfig(null); // Backend order (no sort) on third click
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
                    <SortArrows active={!!active} direction={direction} />
                </th>
            );
        })}
    </tr>
);

    // PAGINATION
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
                <td>{row.geographyTypeName}</td>
                <td>{row.geographyTypeCode}</td>
                <td>{row.geographyTypeDescription}</td>
                <td>{row.parentGeographyTypeName}</td>
                <td>{row.requestDate}</td>
                <td>{row.requestUserName}</td>
                <td>
                    {row.status === true ? (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
                    ) : (
                        <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
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

    const formValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            parentGeographyTypeId: edit_items.parentGeographyTypeID ?? "",  // Formik manages it
            geographyTypeName: edit_items.geographyTypeName || "",
            geographyTypeCode: edit_items.geographyTypeCode || "",
            geographyTypeDescription: edit_items.geographyTypeDescription || ""
        },
        validationSchema: Yup.object({
            geographyTypeName: Yup.string().max(50).required("Please Enter GeographyTypeName"),
            geographyTypeCode: Yup.string().max(50).required("Please Enter GeographyTypeCode"),
            geographyTypeDescription: Yup.string().max(50).required("Please Enter GeographyTypeDescription")
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                let response;

                if (edit_update) {
                    response = await putGeographyTypeUpdate({
                        GeographyTypeID: edit_items.geographyTypeId,
                        GeographyTypeName: values.geographyTypeName,
                        GeographyTypeCode: values.geographyTypeCode,
                        GeographyTypeDescription: values.geographyTypeDescription,
                        ParentGeographyTypeID: values.parentGeographyTypeId || null,
                        IsDisabled: !checked,
                        RequestUserName: username
                    });
                } else {
                    response = await postGeographyTypeCreate({
                        GeographyTypeName: values.geographyTypeName,
                        GeographyTypeCode: values.geographyTypeCode,
                        GeographyTypeDescription: values.geographyTypeDescription,
                        ParentGeographyTypeID: Number(values.parentGeographyTypeId) || null,
                        IsDisabled: false,
                        RequestUserName: username
                    });
                }

                const responseData = response.data || response;

                if (responseData?.responseStatusCode === '000') {
                    setResponse(responseData.responseStatusCodeGUIDisplay || "Operation successful");
                    setSuccessModal(true);
                    setErrorModal(false);

                    await refreshData();

                    resetForm();
                    setedit_update(false);
                    setedit_items([]);
                    setbuttonval('Add Geography Type');
                    setSubmitVal('Save');
                    setTypes([]);
                    setSelected([]);
                    tog_list();
                } else {
                    setResponse(responseData.responseStatusCodeGUIDisplay || "Operation failed");
                    setSuccessModal(false);
                    setErrorModal(true);
                }

            } catch (error) {
                console.error("Submit error:", error);
                setResponse("An unexpected error occurred");
                setSuccessModal(false);
                setErrorModal(true);
            }
        }
    });


    useEffect(() => {
  if (modal_list && !edit_update) {
    formValidation.resetForm({
      values: {
        geographyTypeName: "",
        geographyTypeCode: "",
        geographyTypeDescription: "",
        parentGeographyTypeId: "",
      }
    });

    // Reset dependent dropdown data
    setTypes([]);
    setParentGeographyShow(false); // hide the parent dropdown if needed
  }
}, [modal_list, edit_update]);

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
                    <BreadCrumb title="Geography Type" pageTitle="Pages" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">
                                                GeographyType
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
                                                    placeholder="Search for GeographyType..."
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
                    <span className="modal-title text-white">
                        {buttonval}
                    </span>
                </ModalHeader>
                <form className="tablelist-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        formValidation.handleSubmit();
                        return false;
                    }}>
                    <ModalBody>
                        <div className="mb-3 fw text-muted">
                            Please fill mandatory information below <span className="text-danger">*</span>
                        </div>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="validationCustom01">GeographyTypeName <span className="text-danger">*</span></Label>
                                    <Input
                                        name="geographyTypeName"
                                        placeholder="Enter Geography ypeName"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={formValidation.handleChange}
                                        onBlur={formValidation.handleBlur}
                                        value={formValidation.values.geographyTypeName || ""}
                                        invalid={
                                            formValidation.touched.geographyTypeName &&
                                            formValidation.errors.geographyTypeName
                                        }
                                    />
                                    {formValidation.touched.geographyTypeName &&
                                        formValidation.errors.geographyTypeName ? (
                                        <FormFeedback type="invalid">
                                            {formValidation.errors.geographyTypeName}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="validationCustom02">GeographyTypeCode <span className="text-danger">*</span></Label>
                                    <Input
                                        name="geographyTypeCode"
                                        placeholder="Enter GeographyTypeCode"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom02"
                                        onChange={formValidation.handleChange}
                                        onBlur={formValidation.handleBlur}
                                        value={formValidation.values.geographyTypeCode || ""}
                                        invalid={
                                            formValidation.touched.geographyTypeCode &&
                                            formValidation.errors.geographyTypeCode
                                        }
                                    />
                                    {formValidation.touched.geographyTypeCode &&
                                        formValidation.errors.geographyTypeCode ? (
                                        <FormFeedback type="invalid">
                                            {formValidation.errors.geographyTypeCode}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="geographyTypeDescription">GeographyTypeDescription <span className="text-danger">*</span></Label>
                                    <Input
                                        type="textarea"
                                        name="geographyTypeDescription"
                                        placeholder="Enter GeographyTypeDescription"
                                        className="form-control"
                                        id="geographyTypeDescription"
                                        maxLength={50}
                                        onChange={formValidation.handleChange}
                                        onBlur={formValidation.handleBlur}
                                        value={formValidation.values.geographyTypeDescription || ""}
                                        invalid={
                                            formValidation.touched.geographyTypeDescription &&
                                            formValidation.errors.geographyTypeDescription
                                        }
                                    />
                                    {formValidation.touched.geographyTypeDescription &&
                                        formValidation.errors.geographyTypeDescription ? (
                                        <FormFeedback type="invalid">
                                            {formValidation.errors.geographyTypeDescription}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        {parentGeographyShow && (
                            <Row>
                                <Col md={12}>
                                    <FormGroup className="mb-3">
                                        <Label htmlFor="validationCustom03">ParentGeographyType</Label>
                                        <Input
                                            name="parentGeographyTypeId"
                                            type="select"
                                            className="form-control"
                                            id="parentGeographyTypeId-field"
                                            onChange={formValidation.handleChange}
                                            onBlur={formValidation.handleBlur}
                                            value={formValidation.values.parentGeographyTypeId || ""}
                                            invalid={
                                                formValidation.touched.parentGeographyTypeId &&
                                                formValidation.errors.parentGeographyTypeId
                                            }
                                            disabled={edit_update}
                                        >
                                            <option value="">Parent GeographyType</option>
                                            {types.map((item, key) => (
                                                <option key={key} value={item.value}>{item.label}</option>
                                            ))}
                                        </Input>
                                        {formValidation.touched.parentGeographyTypeId &&
                                            formValidation.errors.parentGeographyTypeId ? (
                                            <FormFeedback type="invalid">
                                                {formValidation.errors.parentGeographyTypeId}
                                            </FormFeedback>
                                        ) : null}
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}
                       {edit_update && (
                            <Row>
                                <Col md={12}>
                                    <FormGroup className="mb-3">
                                        <div className="form-check form-switch form-switch-lg" dir="ltr">
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="SwitchCheck1"
                                                checked={checked}
                                                onChange={handleChange}
                                            />
                                            <Label className="form-check-label" htmlFor="SwitchCheck1">
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

export default GeographyType;
