import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row,
    Label, FormFeedback, Modal, Input, FormGroup
} from 'reactstrap';
import Select from 'react-select';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import {
    getAllNotification, NotificationType, getRolesList, NotificationAdd, Notificationupdate
} from "../../helpers/fakebackend_helper";
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';

import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    getAllNotifications, NotificationTypes,
    getRolesLists
} from '../../helpers/url_helper';

// Sort arrow SVGs
const SORT_ARROW_SIZE = 13;
function SortArrows({ direction, active }) {
    return (
        <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block' }}>
                <polyline
                    points="3,8 6.5,4 10,8"
                    fill="none"
                    stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block', marginTop: -2 }}>
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

const Notification = () => {
    // DATA
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = useState(false);
    const [buttonval, setbuttonval] = useState('Add Notification');
    const [subButtonval, setSubButtonval] = useState('Save');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [checkedText, setCheckedText] = useState('');
    const [types, setTypes] = useState([]);
    const [roles, setroles] = useState([]);
    const [rolezz, setrolezz] = useState([]);
    const [selected, setSelected] = useState([]);
    const [countryId, setCountryId] = useState(0);
    const [NotificationShow, setNotificationShow] = useState(false);
    const [rolesShow, setrolesShow] = useState(false);
    const [modal_delete, setmodal_delete] = useState(false);

    // Table/grid & paging states
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    // For consistent columns
    const columns = useMemo(
        () => [
            { header: 'NotificationType', accessorKey: 'notificationTypeName', key: 'notificationTypeName', sortable: true },
            { header: 'NotificationNote', accessorKey: 'notificationNote', key: 'notificationNote', sortable: true },
            { header: 'StartDate', accessorKey: 'startedOn', key: 'startedOn', sortable: true },
            { header: 'ExpiryDate', accessorKey: 'endedOn', key: 'endedOn', sortable: true },
            { header: 'CreatedOn', accessorKey: 'requestDate', key: 'requestDate', sortable: true },
            { header: 'CreatedBy', accessorKey: 'requestUserName', key: 'requestUserName', sortable: true },
            { header: "Status", accessorKey: "status", key: "status", sortable: true },
            { header: 'Action', accessorKey: 'action', key: 'action', sortable: false },
        ],
        []
    );

    const tog_list = () => {
        setedit_update(false);
        setbuttonval('Add Notification');
        validation.resetForm();
        loadNotificationTypes(countryId);
        RoleList(countryId);
        setSubButtonval('Save');
        setedit_items([]);
        setmodal_list(!modal_list);
    };

    // Load Notification Types
    async function loadNotificationTypes(value) {
        let id = value;
        if (id === '') {
            setTypes([]);
            setSelected([]);
            setNotificationShow(false);
        } else {
            let response = await NotificationType(NotificationTypes);
            const typeList = response.data?.map((type) => ({
                value: type.notificationTypeId,
                label: type.notificationTypeName,
            })) || [];
            setTypes(typeList);
            setSelected(typeList);
            setNotificationShow(typeList.length > 0);
        }
    }

    // Load Roles Types
    async function RoleList(value) {
        let id = value;
        if (id === '') {
            setroles([]);
            setSelected([]);
        } else {
            let response = await getRolesList(getRolesLists);
            const roleZ = response;
            setrolezz(roleZ);
            const rolesArr = roleZ.data?.map((type) => ({
                value: type.roleid,
                label: type.roleName,
            })) || [];
            setrolesShow(rolesArr.length > 0);
            setroles(rolesArr);
            setrolezz(rolesArr);
            setSelected(rolesArr);
        }
    }

    const tog_delete = () => setmodal_delete(!modal_delete);

    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        let response = await getAllNotification(getAllNotifications);
        var allNotification = response;
        var usernm = obj?.user?.loginName;
        setData(allNotification.data);
        setDataBk(allNotification.data);
        setUserName(usernm);
        setedit_update(false);
        setedit_items([]);
        setrolezz(roles);
        setbuttonval('Add Notification');
        setSubButtonval('Save');
        setSortConfig({ key: null, direction: null }); // reset sort
        setPage(0);
    }

    const formatDateToYYYYMMDD = (dateString) => {
        if (!dateString) return "";
        const datePart = dateString.split(' ')[0]; // "DD/MM/YYYY"
        const parts = datePart.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        return "";
    };

    // Table sort logic
    const sortData = (data, key, direction) => {
        if (!key || !direction) return data;
        return [...data].sort((a, b) => {
            let aValue = a[key] === null || a[key] === undefined ? '' : a[key];
            let bValue = b[key] === null || b[key] === undefined ? '' : b[key];
            aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
            bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
            if (direction === 'asc') {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            } else {
                if (aValue > bValue) return -1;
                if (aValue < bValue) return 1;
                return 0;
            }
        });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return data;
        return sortData(data, sortConfig.key, sortConfig.direction);
    }, [data, sortConfig]);

    const actualPageSize = pageSize === -1 ? sortedData.length : pageSize;
    const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, page, pageSize]);

    // Search
    const handleSearch = (e) => {
        const keyword = e.target.value.trim();
        setSearchTerm(keyword);
        setSortConfig({ key: null, direction: null });
        setPage(0);
        if (keyword !== '') {
            const results = databk?.filter((d) =>
                (d.roleName ?? '').toLowerCase().includes(keyword.toLowerCase()) ||
                (d.notificationNote ?? '').toLowerCase().includes(keyword.toLowerCase()) ||
                (d.notificationTypeName ?? '').toLowerCase().includes(keyword.toLowerCase())
            );
            setData(results);
        } else {
            setData(databk);
        }
    };

    // Edit/update
    const updateRow = async (item) => {
        const filterData = item;
        await RoleList();
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_update(true);

        const roleIdsArray = filterData.roleIds
            ? filterData.roleIds.split(',').map(id => parseInt(id.trim(), 10))
            : [];

        setedit_items({
            ...filterData,
            notification_note: filterData.notificationNote,
            startdate: formatDateToYYYYMMDD(filterData.startedOn),
            expirydate: formatDateToYYYYMMDD(filterData.endedOn),
            roleIds: roleIdsArray,
            rolelist: Array.isArray(edit_items.roleIds) && edit_items.roleIds.length > 0
                ? roles.filter(role => edit_items.roleIds.includes(role.value))
                : []
        });
        setbuttonval('Update Notification');
        setSubButtonval('Save');
        setmodal_list(true);
    };

    // Table header rendering
    const renderTableHeader = () => (
        <tr>
            {columns.map((col, idx) => {
                if (!col.sortable) {
                    return <th key={col.key || idx}>{col.header}</th>;
                }
                let active = sortConfig.key === col.key && sortConfig.direction !== null;
                let direction = active ? sortConfig.direction : 'asc';
                return (
                    <th
                        key={col.key || idx}
                        onClick={() => {
                            if (!col.sortable) return;
                            if (sortConfig.key !== col.key) {
                                setSortConfig({ key: col.key, direction: 'asc' });
                            } else if (sortConfig.direction === 'asc') {
                                setSortConfig({ key: col.key, direction: 'desc' });
                            } else if (sortConfig.direction === 'desc') {
                                setSortConfig({ key: null, direction: null });
                            } else {
                                setSortConfig({ key: col.key, direction: 'asc' });
                            }
                            setPage(0);
                        }}
                        style={{
                            cursor: col.sortable ? 'pointer' : 'default',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            paddingRight: 14,
                            verticalAlign: 'middle',
                        }}
                    >
                        {col.header}
                        <SortArrows active={active} direction={sortConfig.direction || 'asc'} />
                        {sortConfig.key === col.key && sortConfig.direction === null && (
                            <span style={{ fontSize: 10, color: '#748391', marginLeft: 4 }}>(Original)</span>
                        )}
                    </th>
                );
            })}
        </tr>
    );

    // Table row rendering
    const renderTableRows = () => {
        if (!paginatedData || paginatedData.length === 0) {
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
                <td>{row.notificationTypeName || ''}</td>
                <td>{row.notificationNote || ''}</td>
                <td>{row.startedOn || ''}</td>
                <td>{row.endedOn || ''}</td>
                <td>{row.requestDate || ''}</td>
                <td>{row.requestUserName || ''}</td>
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

    // PAGINATION
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
                            if (pageNum >= 0 && pageNum < pageCount) {
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
                            } else {
                                return null;
                            }
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

    // FORMS
    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            Notificationtype: edit_items.notificationTypeId || "",
            rolelist: Array.isArray(edit_items.roleIds) && edit_items.roleIds.length > 0
                ? roles.filter(role => edit_items.roleIds.includes(role.value))
                : [],
            roleIds: edit_items.roleIds || [],
            notification_note: edit_items.notification_note || "",
            startdate: edit_items.startdate || "",
            expirydate: edit_items.expirydate || "",
            requestUserName: username
        },
        validationSchema: Yup.object({
            Notificationtype: Yup.string().required("Notification type is required"),
            notification_note: Yup.string().required("Please enter your notification note"),
            startdate: Yup.string().required("Please choose Start Date"),
            expirydate: Yup.string().required("Please choose End Date"),
        }),

        onSubmit: async (values) => {
            let roleIDs;
            if (!values.rolelist || values.rolelist.length === 0) {
                roleIDs = [];
            } else {
                roleIDs = values.rolelist.map(option => option.value);
            }
            try {
                let response;
                if (edit_update === true) {
                    const formatDate = (date) => {
                        const d = new Date(date);
                        return d.toISOString().split('T')[0];
                    };
                    const updatePayload = {
                        notificationId: edit_items.notificationId,
                        notificationTypeId: parseInt(values.Notificationtype, 10),
                        roleIds: roleIDs.map(id => parseInt(id, 10)),
                        note: values.notification_note,
                        startedOn: formatDate(values.startdate),
                        endedOn: formatDate(values.expirydate),
                        isDisabled: !checked,
                        requestUserName: username
                    };
                    response = await Notificationupdate(updatePayload);
                }
                else {
                    const addPayload = {
                        notificationTypeId: parseInt(values.Notificationtype, 10),
                        RoleIDs: roleIDs,
                        NotificationNote: values.notification_note,
                        startedOn: values.startdate,
                        endedOn: values.expirydate,
                        IsDisabled: false,
                        requestUserName: username
                    };
                    response = await NotificationAdd(addPayload);
                }
                if (response) {
                    if (response.responseStatusCode === '-101') {
                        setResponse(response.displayMessage);
                        setSuccessModal(false);
                        setErrorModal(true);
                    } else {
                        setResponse(response.displayMessage);
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

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(!checked ? 'InActive' : 'Active');
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
                    <BreadCrumb title="NotificationCreation" pageTitle="Notification" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">NotificationCreation</h4>
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
                                                    placeholder="Search for Notification..."
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
                                                    <i className="ri-add-line align-bottom me-1"></i> Add
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={12}>
                                            <div className="fixed-table-outer" style={{ background: 'transparent' }}>
                                                <table className="table table-bordered table-hover mb-0">
                                                    <thead className="table-light">
                                                        {renderTableHeader()}
                                                    </thead>
                                                    <tbody>{renderTableRows()}</tbody>
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
            <Modal isOpen={modal_list} toggle={tog_list} centered>
                <ModalHeader className="bg-primary text-white p-3" toggle={tog_list}>
                    <span className="modal-title text-white">{buttonval}</span>
                </ModalHeader>
                <form
                    className="tablelist-form"
                    onSubmit={e => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                    }}
                >
                    <ModalBody>
                        <div className="mb-3 fw text-muted">
                            Please fill mandatory information below <span className="text-danger">*</span>
                        </div>
                        {NotificationShow && (
                            <Row>
                                <Col md={12}>
                                    <FormGroup className="mb-3">
                                        <Label>
                                            NotificationType <span className="text-danger">*</span>
                                        </Label>
                                        <Input
                                            name="Notificationtype"
                                            placeholder="Choose Notification"
                                            type="select"
                                            maxLength={75}
                                            className="form-control"
                                            onChange={validation.handleChange}
                                            onBlur={validation.handleBlur}
                                            value={validation.values.Notificationtype || ""}
                                            invalid={
                                                validation.touched.Notificationtype &&
                                                    validation.errors.Notificationtype
                                                    ? true
                                                    : false
                                            }
                                        >
                                            <option value="">Notification Type</option>
                                            {types.map((item, key) => (
                                                <React.Fragment key={key}>
                                                    <option value={item.value} key={key}>{item.label}</option>
                                                </React.Fragment>
                                            ))}
                                        </Input>
                                        {validation.touched.Notificationtype &&
                                            validation.errors.Notificationtype ? (
                                            <FormFeedback type="invalid">
                                                {validation.errors.Notificationtype}
                                            </FormFeedback>
                                        ) : null}
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label>
                                        DesignationList <span className="text-danger">*</span>
                                    </Label>
                                    <Select
                                        id="rolelist"
                                        name="rolelist"
                                        isMulti
                                        isSearchable={false}
                                        options={roles}
                                        classNamePrefix="select"
                                        value={validation.values.rolelist || []}
                                        onChange={(selectedOptions) => {
                                            validation.setFieldValue("rolelist", selectedOptions);
                                            validation.setFieldValue("roleIds", selectedOptions.map(opt => opt.value));
                                        }}
                                        onBlur={() => validation.setFieldTouched("rolelist", true)}
                                    />
                                    {validation.touched.rolelist && validation.errors.rolelist ? (
                                        <div className="text-danger">{validation.errors.rolelist}</div>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label>
                                        NotificationNote <span className="text-danger">*</span>
                                    </Label>
                                    <Input
                                        type="textarea"
                                        name="notification_note"
                                        placeholder="Enter Note"
                                        maxLength={500}
                                        rows={5}
                                        className="form-control"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.notification_note || ""}
                                        invalid={
                                            validation.touched.notification_note &&
                                                validation.errors.notification_note
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.notification_note &&
                                        validation.errors.notification_note ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.notification_note}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        {/* Start Date (Calendar - MUI styling) */}
                        <Row>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label className="form-label required">
                                        StartDate <span className="text-danger">*</span>
                                    </Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            views={['year', 'month', 'day']}
                                            value={validation.values.startdate ? dayjs(validation.values.startdate) : null}
                                            onChange={(newValue) => {
                                                validation.setFieldValue(
                                                    'startdate',
                                                    newValue ? newValue.toISOString().slice(0, 10) : ''
                                                );

                                                // Clear expirydate if it is outside the same month
                                                if (validation.values.expirydate) {
                                                    const expiry = dayjs(validation.values.expirydate);
                                                    if (!expiry.isSame(newValue, 'month')) {
                                                        validation.setFieldValue('expirydate', '');
                                                    }
                                                }
                                            }}
                                            disableFuture
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    name="startdate"
                                                    size="small"
                                                    fullWidth
                                                    error={Boolean(validation.touched.startdate && validation.errors.startdate)}
                                                    helperText={
                                                        validation.touched.startdate && validation.errors.startdate
                                                            ? validation.errors.startdate
                                                            : ''
                                                    }
                                                    sx={{
                                                        mt: 0.5,
                                                        mb: 0,
                                                        '& .MuiInputBase-root': {
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            height: '32px',
                                                            paddingTop: '4px',
                                                            paddingBottom: '4px',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label className="form-label required">
                                        ExpiryDate <span className="text-danger">*</span>
                                    </Label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            views={['year', 'month', 'day']}
                                            value={validation.values.expirydate ? dayjs(validation.values.expirydate) : null}
                                            onChange={(newValue) => {
                                                validation.setFieldValue(
                                                    'expirydate',
                                                    newValue ? newValue.toISOString().slice(0, 10) : ''
                                                );
                                            }}
                                            minDate={
                                                validation.values.startdate ? dayjs(validation.values.startdate).startOf('month') : undefined
                                            }
                                            maxDate={
                                                validation.values.startdate ? dayjs(validation.values.startdate).endOf('month') : undefined
                                            }
                                            disabled={!validation.values.startdate}
                                            shouldDisableDate={(date) => {
                                                if (!validation.values.startdate) return true;

                                                const startDate = dayjs(validation.values.startdate);

                                                // Allow only dates within the same month as StartDate
                                                return !date.isSame(startDate, 'month');
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    name="expirydate"
                                                    size="small"
                                                    fullWidth
                                                    error={Boolean(validation.touched.expirydate && validation.errors.expirydate)}
                                                    helperText={
                                                        validation.touched.expirydate && validation.errors.expirydate
                                                            ? validation.errors.expirydate
                                                            : ''
                                                    }
                                                    sx={{
                                                        mt: 0.5,
                                                        mb: 0,
                                                        '& .MuiInputBase-root': {
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            height: '32px',
                                                            paddingTop: '4px',
                                                            paddingBottom: '4px',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#ccc',
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </FormGroup>
                            </Col>
                        </Row>
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
                    <ModalFooter className="text-white justify-content-end" style={{ borderTop: 'none' }}>
                        <Button color="primary" className="me-2" id="add-btn">{subButtonval}</Button>
                        <Button color="danger" onClick={tog_list}>Close</Button>
                    </ModalFooter>
                </form>
            </Modal>
        </React.Fragment>
    );
};

export default Notification;