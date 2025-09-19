import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';

import BreadCrumb from '../../Components/Common/BreadCrumb';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"

import * as Yup from "yup";
import { useFormik } from "formik";

import {
    postLocationTypeCreate,
    putLocationTypeUpdate,
    getLocationTypeByCountryIdAndClientId,
    getParentLocationType,
} from "../../helpers/fakebackend_helper";

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

const LocationType = () => {
    const [buttonval, setbuttonval] = useState('Add LocationType');
    const [submitVal, setSubmitVal] = useState('Save');
    const [data, setData] = useState([]);
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [name, setName] = useState('');
    const [modal_list, setmodal_list] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [edit_items, setedit_items] = useState([]);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = useState(true);
    const [response, setResponse] = useState('');
    const [pLocationType, setPLocationType] = useState([]);
    const [parentLocationTypeId, setParentLocationTypeId] = useState('');
    const [locationTypeId, setLocationTypeId] = useState('');
    const [isTableDisbled, setIsTableDisbled] = useState(true);
    const [hasLocationTypes, setHasLocationTypes] = useState(false);
    const [checkedText, setCheckedText] = useState('InActive');
    const [searchTerm, setSearchTerm] = useState('');

    // New state variables for sorting and pagination
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Sorting function
    const sortData = (data, key, direction) => {
        if (!key) return data;
        return [...data].sort((a, b) => {
            // Defensive: handle null/undefined/empty
            if (a[key] === null || a[key] === undefined) return 1;
            if (b[key] === null || b[key] === undefined) return -1;
            if (a[key] === null && b[key] === null) return 0;
            if (typeof a[key] === 'string' && typeof b[key] === 'string') {
                const aValue = a[key].toLowerCase();
                const bValue = b[key].toLowerCase();
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                return 0;
            } else {
                if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
                if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
                return 0;
            }
        });
    };

    const sortedData = useMemo(() => {
        // If sortConfig.key is empty, show original order
        if (!sortConfig.key) return data;
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
            header: 'LocationTypeName',
            accessorKey: 'locationTypeName',
            key: 'locationTypeName',
            sortable: true,
        },
        {
            header: 'LocationTypeCode',
            accessorKey: 'locationTypeCode',
            key: 'locationTypeCode',
            sortable: true,
        },
        {
            header: 'LocationTypeDesc',
            accessorKey: 'locationDescription',
            key: 'locationDescription',
            sortable: true,
        },
        {
            header: 'ParentLocationTypeName',
            accessorKey: 'parentLocationTypeName',
            key: 'parentLocationTypeName',
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

    const loadData = async () => {
        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.loginName;
            setUserName(usernm);
            const payload = {
                flagId: 1,
                requestUserName: usernm
            };
            const response = await getLocationTypeByCountryIdAndClientId(payload);
            const fetchedData = response?.data || [];
            setData(fetchedData);
            setDataBk(fetchedData);
            setIsTableDisbled(false);
            setHasLocationTypes(fetchedData.length > 0);
        } catch (error) {
            setIsTableDisbled(false);
        }
    };

    const loadParentLocationType = async () => {
        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.loginName;
            const payload = {
                flagId: 2,
                requestUserName: usernm
            };
            const response = await getParentLocationType(payload);
            const pLocationTypeList = response.data.map((pLT) => ({
                value: pLT.locationTypeId,
                label: pLT.locationTypeName,
            }));
            setPLocationType(pLocationTypeList);
        } catch (error) {
            console.error("Error loading parent location types:", error);
        }
    };

    useEffect(() => {
        loadData();
        loadParentLocationType();
    }, []);

    const updateRow = async (data) => {
        const filterData = data.row.original;
        setedit_items(filterData);
        setedit_update(true);
        setLocationTypeId(filterData.locationTypeId);

        // Set parent location type dropdown
        const typeList = [{
            value: filterData.parentLocationTypeId,
            label: filterData.parentLocationTypeName,
        }];
        setPLocationType(typeList);
        setParentLocationTypeId(filterData.parentLocationTypeId);

        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setmodal_list(true);
        setbuttonval('Update LocationType');
        setSubmitVal('Update');
    };

    const tog_list = () => {
        setedit_update(false);
        setedit_items([]);
        setbuttonval('Add LocationType');
        setSubmitVal('Save');
        setmodal_list(!modal_list);
        setParentLocationTypeId('');
        setLocationTypeId('');
        setChecked(true);
        setCheckedText('Active');
        loadParentLocationType(); // Load fresh parent location types when opening modal
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
                    item.locationTypeName?.toLowerCase().includes(term.toLowerCase()) ||
                    item.locationTypeCode?.toLowerCase().includes(term.toLowerCase()) ||
                    item.locationDescription?.toLowerCase().includes(term.toLowerCase()) ||
                    item.parentLocationTypeName?.toLowerCase().includes(term.toLowerCase())
                );
            });
            setData(filtered);
        }
        setPage(0);
    };

    const filter = (e) => {
        handleSearch(e);
        setName(e.target.value);
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
                                // Toggle direction
                                setSortConfig({ key: col.key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
                            } else {
                                // Start with asc for new column
                                setSortConfig({ key: col.key, direction: 'asc' });
                            }
                        }}
                        style={{
                            cursor: col.sortable ? 'pointer' : 'default',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            paddingRight: 14,
                            verticalAlign: 'middle',
                        }}
                        aria-sort={active ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : undefined}
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
                <td>{row.locationTypeName}</td>
                <td>{row.locationTypeCode}</td>
                <td>{row.locationDescription}</td>
                <td>{row.parentLocationTypeName}</td>
                <td>
                    {row.status ? (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">Inactive</span>
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
            locationTypeId: locationTypeId || "",
            locationTypeName: edit_items.locationTypeName || "",
            locationTypeCode: edit_items.locationTypeCode || "",
            locationTypeDescription: edit_items.locationDescription || "",
            parentLocationTypeId: parentLocationTypeId || ""
        },
        validationSchema: Yup.object({
            locationTypeName: Yup.string().max(50, 'Maximum 50 characters allowed').required("Please enter Role Name"),
            locationTypeCode: Yup.string().max(50, 'Maximum 50 characters allowed').required("Please enter Role Code"),
            locationTypeDescription: Yup.string().max(50, 'Maximum 50 characters allowed').required("Please enter Role Description"),
        }),
        onSubmit: async (values) => {
            try {
                let response;

                if (edit_update === true) {
                    // Update existing record
                    response = await putLocationTypeUpdate({
                        flagId: 4,
                        locationTypeId: edit_items.locationTypeId,
                        locationTypeName: values.locationTypeName,
                        locationTypeCode: values.locationTypeCode,
                        locationTypeDescription: values.locationTypeDescription,
                        parentLocationTypeId: values.parentLocationTypeId || 0,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {
                    // Create new record
                    response = await postLocationTypeCreate({
                        flagId: 3,
                        locationTypeName: values.locationTypeName,
                        locationTypeCode: values.locationTypeCode,
                        locationTypeDescription: values.locationTypeDescription,
                        parentLocationTypeId: Number(values.parentLocationTypeId),
                        isDisabled: false,
                        requestUserName: username
                    });
                }

                const responseData = response.data[0];
                if (responseData?.responseStatusCode === '000') {
                    setResponse(responseData.responseStatusCodeGUIDisplay || "Operation successful");
                    setSuccessModal(true);
                    setErrorModal(false);

                    // Refresh the data after successful operation
                    await loadData();

                    // Reset form and close modal
                    formValidation.resetForm();
                    setedit_update(false);
                    setedit_items([]);
                    setbuttonval('Add LocationType');
                    setSubmitVal('Save');
                    setmodal_list(false);
                } else {
                    setResponse(responseData.responseStatusCodeGUIDisplay || "Operation failed");
                    setSuccessModal(false);
                    setErrorModal(true);
                }

            } catch (error) {
                setResponse("An error occurred while processing your request");
                setSuccessModal(false);
                setErrorModal(true);
            }
        }
    });

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(!checked == true ? 'Active' : 'InActive');
    };

    useEffect(() => {
        if (modal_list && !edit_update) {
            formValidation.resetForm({
                values: {
                    locationTypeName: "",
                    locationTypeCode: "",
                    locationTypeDescription: "",
                    parentLocationTypeId: "",
                },
            });
            setPLocationType([]);
            setHasLocationTypes(false);
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
                    <BreadCrumb title="LocationType" pageTitle="Pages" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">
                                                LocationType
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
                                                    placeholder="Search for LocationType..."
                                                    value={searchTerm}
                                                    onChange={filter}
                                                />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </Col>
                                        <Col sm>
                                            <div className="d-flex justify-content-sm-end">
                                                <Button color="primary" className="add-btn me-1"
                                                    onClick={() => {
                                                        tog_list();
                                                    }}
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
                                    <Label htmlFor="locationTypeName">LocationTypeName <span className="text-danger">*</span></Label>
                                    <Input
                                        name="locationTypeName"
                                        placeholder="Enter LocationTypeName"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="locationTypeName"
                                        onChange={formValidation.handleChange}
                                        onBlur={formValidation.handleBlur}
                                        value={formValidation.values.locationTypeName || ""}
                                        invalid={
                                            formValidation.touched.locationTypeName &&
                                            formValidation.errors.locationTypeName
                                        }
                                    />
                                    {formValidation.touched.locationTypeName &&
                                        formValidation.errors.locationTypeName ? (
                                        <FormFeedback type="invalid">
                                            {formValidation.errors.locationTypeName}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="locationTypeCode">LocationTypeCode <span className="text-danger">*</span></Label>
                                    <Input
                                        name="locationTypeCode"
                                        placeholder="Enter LocationTypeCode"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="locationTypeCode"
                                        onChange={formValidation.handleChange}
                                        onBlur={formValidation.handleBlur}
                                        value={formValidation.values.locationTypeCode || ""}
                                        invalid={
                                            formValidation.touched.locationTypeCode &&
                                            formValidation.errors.locationTypeCode
                                        }
                                    />
                                    {formValidation.touched.locationTypeCode &&
                                        formValidation.errors.locationTypeCode ? (
                                        <FormFeedback type="invalid">
                                            {formValidation.errors.locationTypeCode}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="locationTypeDescription">LocationTypeDescription <span className="text-danger">*</span></Label>
                                    <Input
                                        type="textarea"
                                        name="locationTypeDescription"
                                        placeholder="Enter LocationTypeDescription"
                                        maxLength={50}
                                        className="form-control"
                                        id="locationTypeDescription"
                                        onChange={formValidation.handleChange}
                                        onBlur={formValidation.handleBlur}
                                        value={formValidation.values.locationTypeDescription || ""}
                                        invalid={
                                            formValidation.touched.locationTypeDescription &&
                                            formValidation.errors.locationTypeDescription
                                        }
                                    />
                                    {formValidation.touched.locationTypeDescription &&
                                        formValidation.errors.locationTypeDescription ? (
                                        <FormFeedback type="invalid">
                                            {formValidation.errors.locationTypeDescription}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>

                        {hasLocationTypes && (
                            <Row>
                                <Col md={12}>
                                    <FormGroup className="mb-3">
                                        <Label htmlFor="parentLocationTypeId">ParentLocationType</Label>
                                        <Input
                                            name="parentLocationTypeId"
                                            type="select"
                                            className="form-control"
                                            id="parentLocationTypeId"
                                            onChange={formValidation.handleChange}
                                            onBlur={formValidation.handleBlur}
                                            value={formValidation.values.parentLocationTypeId || ""}
                                            invalid={
                                                formValidation.touched.parentLocationTypeId &&
                                                formValidation.errors.parentLocationTypeId
                                            }
                                        >
                                            <option value="">Select ParentLocationType</option>
                                            {pLocationType.map((item, key) => (
                                                <option key={key} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </Input>
                                        {formValidation.touched.parentLocationTypeId &&
                                            formValidation.errors.parentLocationTypeId ? (
                                            <FormFeedback type="invalid">
                                                {formValidation.errors.parentLocationTypeId}
                                            </FormFeedback>
                                        ) : null}
                                    </FormGroup>

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

export default LocationType;
