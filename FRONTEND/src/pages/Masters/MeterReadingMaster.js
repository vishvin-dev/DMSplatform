import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getAllMeterReadingMaster, postCreateMeterReadingMaster, putUpdateMeterReadingMaster } from "../../helpers/fakebackend_helper";
import { GET_METER_READING_MASTER } from "../../helpers/url_helper";
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

const MeterReadingReasonMaster = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [data, setData] = useState([]);
    const [edit_items, setedit_items] = useState([]);
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // New state variables for sorting and pagination
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Sorting function
    const sortData = (data, key, direction) => {
        if (!key) return data; // If key is null, keep original order
        return [...data].sort((a, b) => {
            if (a[key] === null) return 1;
            if (b[key] === null) return -1;
            if (a[key] === null && b[key] === null) return 0;
            let aValue = a[key];
            let bValue = b[key];

            if (typeof aValue === 'boolean') {
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Get sorted and paginated data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data; // No sort, just backend order
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
            header: 'ReasonCode',
            accessorKey: 'meterReadingReasonCode',
            key: 'meterReadingReasonCode',
            sortable: true,
        },
        {
            header: 'ReasonName',
            accessorKey: 'meterReadingReasonName',
            key: 'meterReadingReasonName',
            sortable: true,
        },
        {
            header: 'IsMeterReadingMandatory',
            accessorKey: 'isMeterReadingMandatory',
            key: 'isMeterReadingMandatory',
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

    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        var usernm = obj.user.loginName;
        const payload = {
            flagId: 1,
            requestUserName: usernm
        }
        let response = getAllMeterReadingMaster(payload);
        var allDesignations = await response;
        setData(allDesignations.data);
        setDataBk(allDesignations.data);
        setUserName(usernm);
        setedit_update(false);
        setedit_items([]);
    }

    const tog_list = () => {
        setedit_update(false);
        validation.resetForm();
        setedit_items([]);
        setmodal_list(!modal_list);
    };

    const updateRow = (row) => {
        const filterData = row;
        tog_list();
        setedit_update(true);
        setedit_items(filterData);
        validation.setValues({
            meterReadingReasonCode: filterData.meterReadingReasonCode || "",
            meterReadingReasonName: filterData.meterReadingReasonName || "",
            isMeterReadingMandatory: filterData.isMeterReadingMandatory || false,
            status: filterData.status || false,
            meterReadingReasonId: filterData.meterReadingReasonId || ""
        });
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            meterReadingReasonCode: edit_items.meterReadingReasonCode || "",
            meterReadingReasonName: edit_items.meterReadingReasonName || "",
            isMeterReadingMandatory: edit_items.isMeterReadingMandatory || false,
            status: edit_items.status || false,
            requestUserName: username,
            meterReadingReasonId: edit_items.meterReadingReasonId || ""
        },
        validationSchema: Yup.object({
            meterReadingReasonCode: Yup.string().required("ReasonCode is required"),
            meterReadingReasonName: Yup.string().required("ReasonName is required"),
        }),
        onSubmit: async (values) => {
            try {
                let response;
                if (edit_update) {
                    // Update request
                    response = await putUpdateMeterReadingMaster({
                        meterReadingReasonId: values.meterReadingReasonId,
                        meterReadingReasonCode: values.meterReadingReasonCode,
                        meterReadingReasonName: values.meterReadingReasonName,
                        isMeterReadingMandatory: values.isMeterReadingMandatory,
                        status: values.status,
                        requestUserName: username
                    });
                } else {
                    // Create request
                    response = await postCreateMeterReadingMaster({
                        meterReadingReasonCode: values.meterReadingReasonCode,
                        meterReadingReasonName: values.meterReadingReasonName,
                        isMeterReadingMandatory: values.isMeterReadingMandatory,
                        status: values.status,
                        requestUserName: username
                    });
                }

                // Extract the first message object from response.data array
                const resultMessage = response?.data?.[0];

                if (resultMessage) {
                    const code = resultMessage.responseStatusCode;
                    const message = resultMessage.responseStatusCodeGUIDisplay;

                    setResponse(message);

                    if (code === '000') {
                        setSuccessModal(true);
                        setErrorModal(false);
                    } else {
                        setSuccessModal(false);
                        setErrorModal(true);
                    }

                    // Post-submit actions
                    tog_list();
                    getOnLoadingData();
                    validation.resetForm();
                } else {
                    setResponse("Unexpected response format");
                    setSuccessModal(false);
                    setErrorModal(true);
                }
            } catch (error) {
                console.error("Error during submission:", error);
                setResponse("Operation failed");
                setSuccessModal(false);
                setErrorModal(true);
            }
        }
    });

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.trim() === '') {
            setData(databk);
        } else {
            const filtered = databk.filter((item) => {
                return (
                    item.meterReadingReasonCode?.toLowerCase().includes(term.toLowerCase()) ||
                    item.meterReadingReasonName?.toLowerCase().includes(term.toLowerCase())
                );
            });
            setData(filtered);
        }
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
                            // If clicked active sorted column, toggle direction
                            if (sortConfig.key === col.key) {
                                setSortConfig({ key: col.key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
                            } else {
                                setSortConfig({ key: col.key, direction: 'asc' });
                            }
                        }}
                        style={{
                            cursor: col.sortable ? 'pointer' : 'default',
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
                <td>{row.meterReadingReasonCode}</td>
                <td>{row.meterReadingReasonName}</td>
                <td>{row.isMeterReadingMandatory ? 'Yes' : 'No'}</td>
                <td>
                    {row.status ? (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">Inactive</span>
                    ) : (
                        <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
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
                    <BreadCrumb title="MeterReadingReason Master" pageTitle="Masters" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">
                                                MeterReadingReason Creation
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
                                                    placeholder="Search for reasons..."
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

            {/* Add/Edit Modal */}
            <Modal isOpen={modal_list} toggle={tog_list} centered size="md">
                <ModalHeader className="bg-primary text-white p-3" toggle={tog_list}>
                    <span className="modal-title text-white">
                        {edit_update ? 'Update Reason' : 'Add Reason'}
                    </span>
                </ModalHeader>
                <form onSubmit={validation.handleSubmit}>
                    <ModalBody>
                        <div className="mb-3 fw text-muted">
                            Please fill mandatory information below <span className="text-danger">*</span>
                        </div>

                        <Row>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label>ReasonCode <span className="text-danger">*</span></Label>
                                    <Input
                                        name="meterReadingReasonCode"
                                        type="text"
                                        placeholder="Enter ReasonCode"
                                        value={validation.values.meterReadingReasonCode}
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        invalid={validation.touched.meterReadingReasonCode && !!validation.errors.meterReadingReasonCode}
                                    />
                                    {validation.touched.meterReadingReasonCode && validation.errors.meterReadingReasonCode && (
                                        <FormFeedback>{validation.errors.meterReadingReasonCode}</FormFeedback>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label>ReasonName <span className="text-danger">*</span></Label>
                                    <Input
                                        name="meterReadingReasonName"
                                        type="text"
                                        placeholder="Enter ReasonName"
                                        value={validation.values.meterReadingReasonName}
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        invalid={validation.touched.meterReadingReasonName && !!validation.errors.meterReadingReasonName}
                                    />
                                    {validation.touched.meterReadingReasonName && validation.errors.meterReadingReasonName && (
                                        <FormFeedback>{validation.errors.meterReadingReasonName}</FormFeedback>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <div className="form-check form-switch form-switch-lg" dir="ltr">
                                        <Input
                                            type="switch"
                                            className="form-check-input"
                                            id="isMeterReadingMandatory"
                                            name="isMeterReadingMandatory"
                                            checked={validation.values.isMeterReadingMandatory}
                                            onChange={validation.handleChange}
                                        />
                                        <Label className="form-check-label" htmlFor="isMeterReadingMandatory">
                                            IsMeterReadingMandatory: {' '}
                                            <span className={`badge text-uppercase ${validation.values.isMeterReadingMandatory
                                                    ? 'bg-success-subtle text-success'
                                                    : 'bg-danger-subtle text-danger'
                                                }`}>
                                                {validation.values.isMeterReadingMandatory ? 'Yes' : 'No'}
                                            </span>
                                        </Label>
                                    </div>
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
                                                checked={!validation.values.status}
                                                onChange={(e) => validation.setFieldValue("status", !e.target.checked)}
                                            />
                                            <Label className="form-check-label" htmlFor="customSwitchsizelg">
                                                Status: {' '}
                                                <span className={`badge text-uppercase ${!validation.values.status
                                                    ? 'bg-success-subtle text-success'
                                                    : 'bg-danger-subtle text-danger'
                                                    }`}>
                                                    {!validation.values.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </Label>
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}
                    </ModalBody>
                    <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
                        {/* <Button color="light" className="me-2" onClick={() => validation.resetForm()}>
                            Reset
                        </Button> */}
                        <Button color="primary" type="submit" className="me-2" id="add-btn">
                            {edit_update ? 'Update' : 'Save'}
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

export default MeterReadingReasonMaster;