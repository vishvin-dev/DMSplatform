import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader,
    Row, Label, FormFeedback, Modal, Input, FormGroup, Form, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from 'react-toastify';
import { getAllSurveyCategoryCreation, postAllSurveyCategoryCreation, putUpdateSurveyCategoryCreation } from "../../helpers/fakebackend_helper"
import { GET_SURVEY_CATEGORY_CREATION } from "../../helpers/url_helper"
import 'react-toastify/dist/ReactToastify.css';
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



const SurveyCategoryCreation = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [buttonval, setbuttonval] = useState('Add Survey Category');
    const [subButtonval, setSubButtonval] = useState('Save');
    const [edit_items, setedit_items] = useState(null);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [checked, setChecked] = React.useState(false);
    const [checkedText, setCheckedText] = React.useState('');

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
            header: 'SurveyCategoryCode',
            accessorKey: 'surveyCategoryCode',
            key: 'surveyCategoryCode',
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
        setedit_update(false);
        setbuttonval('Add Survey Category');
        validation.resetForm();
        setSubButtonval('Save');
        setedit_items(null);
        setmodal_list(!modal_list);
    };

    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName
        setUserName(usernm);
        const payload = {
            flagId: 1,
            requestUserName: usernm
        }
        let response = getAllSurveyCategoryCreation(payload);
        var SurveyCategoryCreation = await response;
        setData(SurveyCategoryCreation.data);
        setDataBk(SurveyCategoryCreation.data);

        setedit_update(false);
        setedit_items([])
        setbuttonval('AddSurveyCategory')
        setSubButtonval('Save');
    }

    const updateRow = (row) => {
        const filterData = row;
        tog_list();
        setedit_update(true);
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_items(filterData);
        setbuttonval('Update SurveyCategory');
        setSubButtonval('Save')
    }

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            surveyCategoryId: edit_items?.surveyCategoryId,
            surveyCategoryName: edit_items?.surveyCategoryName,
            surveyCategoryCode: edit_items?.surveyCategoryCode,
            isDisabled: false,
            requestUserName: "",
        },
        validationSchema: Yup.object({
            surveyCategoryName: Yup.string().required("Please Enter Survey Category Name"),
            surveyCategoryCode: Yup.string().required("Please Enter Survey Category Code"),
        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = await putUpdateSurveyCategoryCreation({
                        surveyCategoryId: values.surveyCategoryId,
                        surveyCategoryName: values.surveyCategoryName,
                        surveyCategoryCode: values.surveyCategoryCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {
                    response = await postAllSurveyCategoryCreation({
                        surveyCategoryName: values.surveyCategoryName,
                        surveyCategoryCode: values.surveyCategoryCode,
                        isDisabled: false,
                        requestUserName: username
                    });
                }

                const data = response?.data?.[0];

                if (data) {
                    setResponse(data.responseStatusCodeGUIDisplay);

                    if (data.responseStatusCode === '100') {
                        // Already exists
                        setSuccessModal(false);
                        setErrorModal(true);
                    } else {
                        // Success
                        setSuccessModal(true);
                        setErrorModal(false);
                    }

                    tog_list();
                    getOnLoadingData();
                    validation.resetForm();
                }
            } catch (error) {
                setSuccessModal(false);
                setErrorModal(true);
            }
        }
    });

    const filter = (e) => {
        const keyword = e.target.value;
        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.surveyCategoryName.toLowerCase().includes(keyword.toLowerCase()) ||
                    d.surveyCategoryCode.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
        setPage(0); // Reset to first page when filtering
    };

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
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
                <td>{row.surveyCategoryCode}</td>
                <td>
                    {row.status ? (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
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
                    <BreadCrumb title="SurveyCategoryCreation" pageTitle="Survey" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">
                                                SurveyCategoryCreation
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
                                                    placeholder="Search for survey categories..."
                                                    value={name}
                                                    onChange={filter}
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
            <Modal isOpen={modal_list} toggle={() => { tog_list(); }} centered>
                <ModalHeader className="bg-primary text-white p-3" toggle={() => { tog_list(); }}>
                    <span className="modal-title text-white">
                        {buttonval}
                    </span>
                </ModalHeader>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    validation.handleSubmit();
                    return false;
                }}>
                    <ModalBody>
                        <div className="mb-3 fw text-muted">
                            Please fill mandatory information below <span className="text-danger">*</span>
                        </div>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="surveyCategoryName">SurveyCategoryName <span className="text-danger">*</span></Label>
                                    <Input
                                        name="surveyCategoryName"
                                        placeholder="Enter SurveyCategoryName"
                                        type="text"
                                        className="form-control"
                                        id="surveyCategoryName"
                                        value={validation.values.surveyCategoryName || ""}
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        invalid={
                                            validation.touched.surveyCategoryName && validation.errors.surveyCategoryName ? true : false
                                        }
                                    />
                                    {validation.touched.surveyCategoryName && validation.errors.surveyCategoryName ? (
                                        <FormFeedback type="invalid">{validation.errors.surveyCategoryName}</FormFeedback>
                                    ) : null}
                                </FormGroup>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="surveyCategoryCode">SurveyCategoryCode <span className="text-danger">*</span></Label>
                                    <Input
                                        name="surveyCategoryCode"
                                        placeholder="Enter SurveyCategoryCode"
                                        type="text"
                                        className="form-control"
                                        id="surveyCategoryCode"
                                        value={validation.values.surveyCategoryCode || ""}
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        invalid={
                                            validation.touched.surveyCategoryCode && validation.errors.surveyCategoryCode ? true : false
                                        }
                                    />
                                    {validation.touched.surveyCategoryCode && validation.errors.surveyCategoryCode ? (
                                        <FormFeedback type="invalid">{validation.errors.surveyCategoryCode}</FormFeedback>
                                    ) : null}
                                </FormGroup>
                                {edit_update && (
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
                                                <span className={`badge text-uppercase ${checkedText === 'Active'
                                                        ? 'bg-success-subtle text-success'
                                                        : 'bg-danger-subtle text-danger'
                                                    }`}>
                                                    {checkedText}
                                                </span>
                                            </Label>
                                        </div>
                                    </FormGroup>
                                )}
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
                        {/* <Button color="light" className="me-2" onClick={() => validation.resetForm()}>
                            Reset
                        </Button> */}
                        <Button color="primary" type="submit" className="me-2" id="add-btn">
                            {subButtonval}
                        </Button>
                        <Button color="danger" onClick={tog_list}>
                            Close
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </React.Fragment>
    );
};

export default SurveyCategoryCreation;
