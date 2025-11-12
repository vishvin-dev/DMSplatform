import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';

import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
// import { findLabelByLink } from '../../Layouts/MenuHelper/menuUtils';

import {
    postCreateRoles,
    putUpdateRoles,
    getAllRoles,
//     deleteRoles
} from '../../helpers/fakebackend_helper';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GET_ROLES } from '../../helpers/url_helper';

const SORT_ARROW_SIZE = 13; // px

// SortArrows component using SVG
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

const RolesCreation = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = useState(false);
    const [buttonval, setbuttonval] = useState('Add Role');
    const [subButtonval, setSubButtonval] = useState('Save');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]); // original backend order reference
    const [username, setUserName] = useState('');
    const [checkedText, setCheckedText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Sorting config: null = original
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Sorting function
    const sortData = (data, key, direction) => {
        if (!key || !direction) return data; // Don't sort if original!
        return [...data].sort((a, b) => {
            const aValue = a[key] === null || a[key] === undefined ? '' : a[key];
            const bValue = b[key] === null || b[key] === undefined ? '' : b[key];
            let aVal = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
            let bVal = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
            if (direction === 'asc') {
                if (aVal < bVal) return -1;
                if (aVal > bVal) return 1;
                return 0;
            } else {
                if (aVal > bVal) return -1;
                if (aVal < bVal) return 1;
                return 0;
            }
        });
    };

    // Use original order if NO sort
    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return data;
        return sortData(data, sortConfig.key, sortConfig.direction);
    }, [data, sortConfig]);


    const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, page, pageSize]);

    const columns = useMemo(
        () => [
            {
                header: 'RoleName',
                accessorKey: 'RoleName',
                key: 'RoleName',
                sortable: true,
            },
            {
                header: 'RoleCode',
                accessorKey: 'Role_Code',
                key: 'Role_Code',
                sortable: true,
            },
            {
                header: 'Description',
                accessorKey: 'Description',
                key: 'Description',
                sortable: true,
            },
            {
                header: 'CreatedOn',
                accessorKey: 'CreatedOn',
                key: 'CreatedOn',
                sortable: true,
            },
            {
                header: 'CreatedBy',
                accessorKey: 'RequestUserName',
                key: 'RequestUserName',
                sortable: true,
            },
            {
                header: 'Status',
                accessorKey: 'Status',
                key: 'Status',
                sortable: true,
            },
            // {
            //     header: 'Action',
            //     accessorKey: 'action',
            //     key: 'action',
            //     sortable: false,
            // },
        ],
        []
    );

    const tog_list = () => {
        setedit_update(false);
        setbuttonval('Add Role');
        validation.resetForm();
        setSubButtonval('Save');
        setedit_items([]);
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
        const obj = JSON.parse(sessionStorage.getItem('authUser'));
        let response = getAllRoles(GET_ROLES);
        let allRoles = await response;
        let usernm = obj.user.Email;
        setUserName(usernm);
        setData(allRoles.data);
        setDataBk(allRoles.data); 
        setUserName(usernm);
        setedit_update(false);
        setedit_items([]);
        setbuttonval('Add Role');
        setSubButtonval('Save');
        setSortConfig({ key: null, direction: null }); // reset sort on reload
        setPage(0);
        document.title = `Roles Management | DMS`;
    }

    // Delete To do
    const onClickTodoDelete = (data) => {
        setedit_items(data);
        setSuccessModal(true);
    };

    const handleDeleteRole = async () => {
        try {
            if (edit_items) {
                let Role_Id = edit_items.row.original.Role_Id;
                let response = deleteRoles(Role_Id);
                let deleteMsg = await response;
                // get existing Records
                let allRolesResponse = getAllRoles(ROLES_URL_GET_DELETE);
                let allRoles = await allRolesResponse;
                setData(allRoles.data.data);
                setDataBk(allRoles.data.data);
                setedit_items('');
                setSuccessModal(false);
                setSortConfig({ key: null, direction: null });
                setPage(0);
                toast.success(deleteMsg.responseString, { autoClose: 3000 });
            }
        } catch (error) {
            toast.error('Roles Delete Failed', { autoClose: 3000 });
        }
    };

    const updateRow = async (item) => {
        const filterData = item;
        tog_list();
        setChecked(filterData.Status); 
        setCheckedText(filterData.Status ? 'Active' : 'InActive');
        setedit_update(true);
        setedit_items(filterData);
        setbuttonval('Update Role');
        setSubButtonval('Update');
    };

    // Form submission handler with trimming
    const handleFormSubmit = async (values) => {
        // Trim all string fields before submission
        const trimmedValues = {
            ...values,
            RoleName: values.RoleName ? values.RoleName.trim() : values.RoleName,
            Role_Code: values.Role_Code ? values.Role_Code.trim() : values.Role_Code,
            Description: values.Description ? values.Description.trim() : values.Description,
        };

        let response;
        try {
            if (edit_update === true) {
                response = putUpdateRoles({
                    Role_Id: edit_items.Role_Id,
                    RoleName: trimmedValues.RoleName,
                    Role_Code: trimmedValues.Role_Code,
                    Description: trimmedValues.Description,
                    Status: checked,
                    RequestUserName: username,
                });
            } else {
                response = postCreateRoles({
                    RoleName: trimmedValues.RoleName,
                    Description: trimmedValues.Description,
                    Role_Code: trimmedValues.Role_Code,
                    Status: true,
                    RequestUserName: username,
                });
            }
            let data = await response;
            if (data) {
                if (data.status !== 'success') {
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
                validation.resetForm();
            }
        } catch (error) {
            setSuccessModal(false);
            setErrorModal(true);
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            Role_Id: edit_items.Role_Id || '',
            RoleName: edit_items.RoleName || '',
            Role_Code: edit_items.Role_Code || '',
            Description: edit_items.Description || '',
            Status: false,
            RequestUserName: '',
        },
        validationSchema: Yup.object({
            RoleName: Yup.string()
                .required('Please Enter Your RoleName')
                .matches(/^[A-Za-z][A-Za-z\s]*$/, 'RoleName should contain only alphabets and spaces between words')
                .transform((value) => value ? value.trim() : value)
                .test('no-leading-spaces', 'RoleName should not start with space', 
                    (value) => !value || !value.startsWith(' '))
                .max(20, 'RoleName should not exceed 20 characters'),
            Role_Code: Yup.string()
                .required('Please Enter Your Role_Code')
                .matches(/^[A-Za-z0-9][A-Za-z0-9\s]*$/, 'Role_Code should contain only alphanumeric characters and spaces between words')
                .transform((value) => value ? value.trim() : value)
                .test('no-leading-spaces-rolecode', 'RoleCode should not start with space', 
                    (value) => !value || !value.startsWith(' '))
                .max(20, 'Role_Code should not exceed 20 characters'),
            Description: Yup.string()
                .required('Please Enter Your Description')
                .transform((value) => value ? value.trim() : value)
                .test('no-leading-spaces-desc', 'Description should not start with space', 
                    (value) => !value || !value.startsWith(' '))
                .max(50, 'Description should not exceed 50 characters'),
        }),
        onSubmit: async (values) => {
            await handleFormSubmit(values);
        },
    });

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(!checked ? 'Active' : 'InActive');
    };

    // Input handlers to enforce character limits and patterns - Prevent leading spaces
    const handleRoleNameChange = (e) => {
        let value = e.target.value;
        
        // Prevent leading spaces
        if (value.startsWith(' ')) {
            value = value.trimStart();
        }
        
        // Only allow alphabets and spaces, and limit to 20 characters
        value = value.replace(/[^A-Za-z\s]/g, '').slice(0, 20);
        validation.setFieldValue('RoleName', value);
    };

    const handleRoleCodeChange = (e) => {
        let value = e.target.value;
        
        // Prevent leading spaces
        if (value.startsWith(' ')) {
            value = value.trimStart();
        }
        
        // Only allow alphanumeric and spaces, and limit to 20 characters
        value = value.replace(/[^A-Za-z0-9\s]/g, '').slice(0, 20);
        validation.setFieldValue('Role_Code', value);
    };

    const handleDescriptionChange = (e) => {
        let value = e.target.value;
        
        // Prevent leading spaces
        if (value.startsWith(' ')) {
            value = value.trimStart();
        }
        
        value = value.slice(0, 100);
        validation.setFieldValue('Description', value);
    };

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSortConfig({ key: null, direction: null }); // reset sorting when searching
        if (term.trim() === '') {
            setData(databk); // use original backend order
            setPage(0);
        } else {
            const filtered = databk.filter((item) => {
                return (
                    (item.RoleName || '').toLowerCase().includes(term.toLowerCase()) ||
                    (item.Role_Code || '').toLowerCase().includes(term.toLowerCase()) ||
                    (item.Description || '').toLowerCase().includes(term.toLowerCase()) ||
                    (item.RequestUserName || '').toLowerCase().includes(term.toLowerCase())
                );
            });
            setData(filtered);
            setPage(0);
        }
    };

    // Table header rendering
    const renderTableHeader = () => (
        <tr>
            {columns.map((col, idx) => {
                if (!col.sortable) {
                    return <th key={col.key || idx}>{col.header}</th>;
                }
                const sortingStates = [null, 'asc', 'desc'];
                let active = sortConfig.key === col.key && sortConfig.direction !== null;
                let direction = active ? sortConfig.direction : 'asc';
                return (
                    <th
                        key={col.key || idx}
                        onClick={() => {
                            if (!col.sortable) return;
                            if (sortConfig.key !== col.key) {
                                // Start sorting ascending
                                setSortConfig({ key: col.key, direction: 'asc' });
                            } else if (sortConfig.direction === 'asc') {
                                setSortConfig({ key: col.key, direction: 'desc' });
                            } else if (sortConfig.direction === 'desc') {
                                setSortConfig({ key: null, direction: null }); // return to original order
                            } else {
                                setSortConfig({ key: col.key, direction: 'asc' });
                            }
                            setPage(0); // always reset to first page
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
                <td>{row.RoleName || ''}</td>
                <td>{row.Role_Code || ''}</td>
                <td>{row.Description || ''}</td>
                <td>{row.CreatedOn || ''}</td>
                <td>{row.RequestUserName || ''}</td>
                <td>
                    {row.Status ? (
                        <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
                    ) : (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
                    )}
                </td>
                {/* <td>
                    <div className="d-flex gap-2">
                        <Button color="primary" className="btn-sm edit-item-btn" onClick={() => updateRow(row)}>
                            <i className="ri-edit-2-line"></i>
                        </Button>
                    </div>
                </td> */}
            </tr>
        ));
    };

    // useEffect(() => {
    //     const obj = JSON.parse(sessionStorage.getItem('authUser'));
    //     const menuPage = JSON.parse(obj?.user?.menuPage || '[]');
    //     const applicationCode = obj?.user?.applicationCode;
    //     const currentPath = window.location.pathname;

    //     const currentPageLabel = findLabelByLink(menuPage, currentPath) || 'Page';
    //     document.title = `${currentPageLabel} | DMS`;
    // }, []);

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
                    <BreadCrumb  title="Roles Creation"pageTitle="Roles Management" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="d-flex align-items-center">
                                            <h4 className="mb-0 card-title text-white">Roles Creation</h4>
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
                                                    placeholder="Search for roles..."
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
                                            <div className="fixed-table-outer" style={{ background: 'transparent' }}>
                                                <table className="grid-table mb-0" style={{ minWidth: 1020, width: '100%',backgroundColor: 'transparent' }}>
                                                    <thead>
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

            {/* Add Modal */}
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
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="validationCustom01">
                                        RoleName <span className="text-danger">*</span>
                                    </Label>
                                    <Input
                                        name="RoleName"
                                        placeholder="Enter RoleName"
                                        type="text"
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={handleRoleNameChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.RoleName || ''}
                                        invalid={
                                            validation.touched.RoleName && validation.errors.RoleName ? true : false
                                        }
                                    />
                                    {validation.touched.RoleName && validation.errors.RoleName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.RoleName}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="validationCustom02">
                                        Role_Code <span className="text-danger">*</span>
                                    </Label>
                                    <Input
                                        name="Role_Code"
                                        placeholder="Enter Role_Code"
                                        type="text"
                                        className="form-control"
                                        id="validationCustom02"
                                        onChange={handleRoleCodeChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.Role_Code || ''}
                                        invalid={
                                            validation.touched.Role_Code && validation.errors.Role_Code ? true : false
                                        }
                                    />
                                    {validation.touched.Role_Code && validation.errors.Role_Code ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.Role_Code}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FormGroup className="mb-3">
                                    <Label htmlFor="validationTextarea">
                                        Description <span className="text-danger">*</span>
                                    </Label>
                                    <Input
                                        name="Description"
                                        placeholder="Enter Description"
                                        type="textarea"
                                        className="form-control"
                                        id="validationTextarea"
                                        onChange={handleDescriptionChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.Description || ''}
                                        invalid={
                                            validation.touched.Description && validation.errors.Description
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.Description && validation.errors.Description ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.Description}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                        </Row>
                     {edit_update && (
                            <Row>
                                <Col md={12}>
                                    <FormGroup className="mb-3">
                                        <Label>Status</Label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="form-check form-switch">
                                                <Input
                                                    type="switch"
                                                    className="form-check-input"
                                                    checked={checked}
                                                    onChange={handleChange}
                                                    style={{ height: "24px", width: "46px" }}
                                                />
                                            </div>
                                            {checked ? (
                                                 <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
                                                
                                            ) : (
                                                <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
                                            )}
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                        )}
                    </ModalBody>
                    <ModalFooter className="text-white justify-content-end" style={{ borderTop: 'none' }}>
                        <Button color="primary" type="submit" className="me-2" id="add-btn" >
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

export default RolesCreation;