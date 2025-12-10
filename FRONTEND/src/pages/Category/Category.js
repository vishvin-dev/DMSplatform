import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader,
    Row, Label, FormFeedback, Modal, Input, FormGroup, Table, Badge, Spinner
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { getCategoryCreation } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';

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

const Category = () => {
    // State management
    const [modal, setModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState(null);
    const [username, setUserName] = useState('');
    const [databk, setDataBk] = useState([]); // original backend order reference

    // Sorting config: null = original
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    document.title = `Category | DMS`;

    // Table columns configuration
    const columns = useMemo(
        () => [
            {
                header: 'Category Name',
                accessorKey: 'CategoryName',
                key: 'CategoryName',
                sortable: true,
            },
            {
                header: 'Description',
                accessorKey: 'Description',
                key: 'Description',
                sortable: true,
            },
            {
                header: 'Status',
                accessorKey: 'IsActive',
                key: 'IsActive',
                sortable: true,
            },
            {
                header: 'Created By',
                accessorKey: 'requestUserName',
                key: 'requestUserName',
                sortable: true,
            },
            {
                header: 'Created At',
                accessorKey: 'CreatedOn',
                key: 'CreatedOn',
                sortable: true,
            },
            {
                header: 'Action',
                accessorKey: 'action',
                key: 'action',
                sortable: false,
            },
        ],
        []
    );

    // Initialize user name
    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem('authUser'));
        setUserName(obj?.user?.Email || 'admin');
    }, []);

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategoryCreation({
                flagId: 1,
                requestUserName: username
            });
            
            if (response?.status === "success") {
                setCategories(response.data || []);
                setDataBk(response.data || []); // Store original data
            } else {
                setResponse(response?.message || 'Failed to fetch categories');
                setErrorModal(true);
                setCategories([]);
                setDataBk([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setResponse('Error fetching categories');
            setErrorModal(true);
            setCategories([]);
            setDataBk([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [username]);

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

    // Handle search functionality
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSortConfig({ key: null, direction: null }); // reset sorting when searching
        if (term.trim() === '') {
            setCategories(databk); // use original backend order
            setPage(0);
        } else {
            const filtered = databk.filter((item) => {
                return (
                    (item.CategoryName || '').toLowerCase().includes(term.toLowerCase()) ||
                    (item.Description || '').toLowerCase().includes(term.toLowerCase())
                    // (item.requestUserName || '').toLowerCase().includes(term.toLowerCase())
                );
            });
            setCategories(filtered);
            setPage(0);
        }
    };

    // Use original order if NO sort
    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return categories;
        return sortData(categories, sortConfig.key, sortConfig.direction);
    }, [categories, sortConfig]);

    const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, page, pageSize]);

    // Form validation schema - UPDATED: CategoryName max length changed from 75 to 50
    const validationSchema = Yup.object({
        CategoryName: Yup.string()
            .required('Category name is required')
            .max(50, 'Category name must be less than 50 characters'),
        Description: Yup.string()
            .required('Description is required')
            .max(150, 'Description must be less than 150 characters')
    });

    // Form configuration
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            Category_Id: currentCategory?.Category_Id || '',
            CategoryName: currentCategory?.CategoryName || '',
            Description: currentCategory?.Description || '',
            IsActive: currentCategory?.IsActive !== undefined ? currentCategory.IsActive : 1
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setSubmitting(true);
                let response;
                
                if (editMode) {
                    response = await getCategoryCreation({
                        flagId: 3,
                        Category_Id: values.Category_Id,
                        CategoryName: values.CategoryName,
                        Description: values.Description,
                        IsActive: values.IsActive,
                        requestUserName: username
                    });
                } else {
                    response = await getCategoryCreation({
                        flagId: 2,
                        CategoryName: values.CategoryName,
                        Description: values.Description,
                        IsActive: 1,
                        requestUserName: username
                    });
                }
                
                if (response?.status === "success") {
                    setResponse(response.message);
                    setSuccessModal(true);
                    await fetchCategories();
                    handleCloseModal();
                } else {
                    setResponse(response?.message || `Failed to ${editMode ? 'update' : 'add'} category`);
                    setErrorModal(true);
                }
            } catch (error) {
                console.error('Error saving category:', error);
                setResponse('Error saving category');
                setErrorModal(true);
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Modal handlers
    const handleCloseModal = () => {
        setModal(false);
        setEditMode(false);
        setCurrentCategory(null);
        formik.resetForm();
    };

    const handleOpenModal = () => {
        setModal(true);
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setEditMode(true);
        setModal(true);
    };

    const toggleStatus = () => {
        formik.setFieldValue('IsActive', formik.values.IsActive === 1 ? 0 : 1);
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

    // Table row rendering
    const renderTableRows = () => {
        if (!paginatedData || paginatedData.length === 0) {
            return (
                <tr>
                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>
                        {searchTerm ? 'No categories found matching your search' : 'No categories found'}
                    </td>
                </tr>
            );
        }
        return paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
                <td>{row.CategoryName || ''}</td>
                <td>{row.Description || ''}</td>
                <td>
                    {row.IsActive === 1 ? (
                        <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
                    ) : (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">Inactive</span>
                    )}
                </td>
                <td>{row.requestUserName || username}</td>
                <td>{row.CreatedOn ? new Date(row.CreatedOn).toLocaleDateString() : ''}</td>
                <td>
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => handleEdit(row)}
                        title="Edit Category"
                    >
                        <i className="ri-edit-2-line"></i>
                    </Button>
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
            <div style={{ 
                position: 'sticky',
                bottom: 0,
                background: 'white',
                padding: '15px 0',
                borderTop: '1px solid #dee2e6',
                zIndex: 1
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                }}>
                    {/* Left: Showing Results & Page Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
                            Showing{' '}
                            <b style={{ color: '#222', fontWeight: 600 }}>
                                {pageSize === -1 ? sortedData.length : Math.min(pageSize, sortedData.length - (page * pageSize))}
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

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb  pageTitle="Category Upload" />

                    <Card>
                        <CardHeader className="bg-primary text-white p-3">
                            <Row className="g-4 align-items-center">
                                <Col className="d-flex align-items-center">
                                    <h4 className="mb-0 card-title text-white">Categories</h4>
                                </Col>
                            </Row>
                        </CardHeader>

                        <CardBody style={{ paddingBottom: '80px' }}>
                            {/* Search and Add Controls */}
                            <Row className="g-4 mb-3">
                                <Col sm={4}>
                                    <div className="search-box ms-2">
                                        <Input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search for categories..."
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
                                            onClick={handleOpenModal}
                                            disabled={submitting}
                                        >
                                            <i className="ri-add-fill me-1 align-bottom"></i> Add
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            {/* Categories Table */}
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner color="primary" />
                                    <p className="mt-2">Loading categories...</p>
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ 
                                    maxHeight: 'calc(100vh - 300px)',
                                    overflowY: 'auto'
                                }}>
                                    <table className="grid-table mb-0" style={{ minWidth: 1020, width: '100%', backgroundColor: 'transparent' }}>
                                        <thead className="table-light" style={{ 
                                            position: 'sticky', 
                                            top: 0, 
                                            zIndex: 1, 
                                            background: 'white' 
                                        }}>
                                            {renderTableHeader()}
                                        </thead>
                                        <tbody>
                                            {renderTableRows()}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {!loading && renderPagination()}
                        </CardBody>
                    </Card>
                </Container>
            </div>

            {/* Add/Edit Category Modal */}
            <Modal isOpen={modal} toggle={handleCloseModal} centered>
                <ModalHeader className="bg-primary text-white p-3" toggle={handleCloseModal}>
                    <span className="modal-title text-white">
                        {editMode ? 'Update Category' : 'Add Category'}
                    </span>
                </ModalHeader>
                <form onSubmit={formik.handleSubmit}>
                    <ModalBody>
                        <div className="mb-3 text-muted">
                            Please fill mandatory information below <span className="text-danger">*</span>
                        </div>
                        
                        <FormGroup className="mb-3">
                            <Label htmlFor="CategoryName">
                                Category Name <span className="text-danger">*</span>
                            </Label>
                            <Input
                                name="CategoryName"
                                placeholder="Enter Category Name"
                                type="text"
                                maxLength={50} // UPDATED: Changed from 75 to 50
                                id="CategoryName"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.CategoryName}
                                invalid={!!(formik.touched.CategoryName && formik.errors.CategoryName)}
                            />
                            {formik.touched.CategoryName && formik.errors.CategoryName && (
                                <FormFeedback type="invalid">
                                    {formik.errors.CategoryName}
                                </FormFeedback>
                            )}
                            <div className="text-muted small mt-1">
                                {formik.values.CategoryName?.length || 0}/50 characters
                            </div>
                        </FormGroup>

                        <FormGroup className="mb-3">
                            <Label htmlFor="Description">
                                Description <span className="text-danger">*</span>
                            </Label>
                            <Input
                                name="Description"
                                placeholder="Enter Description"
                                type="textarea"
                                rows="3"
                                maxLength={150}
                                id="Description"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.Description}
                                invalid={!!(formik.touched.Description && formik.errors.Description)}
                            />
                            {formik.touched.Description && formik.errors.Description && (
                                <FormFeedback type="invalid">
                                    {formik.errors.Description}
                                </FormFeedback>
                            )}
                            <div className="text-muted small mt-1">
                                {formik.values.Description?.length || 0}/150 characters
                            </div>
                        </FormGroup>

                        {editMode && (
                            <FormGroup className="mb-3">
                                <Label>Status</Label>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="form-check form-switch">
                                        <Input
                                            type="switch"
                                            className="form-check-input"
                                            checked={formik.values.IsActive === 1}
                                            onChange={toggleStatus}
                                            style={{ height: "24px", width: "46px" }}
                                        />
                                    </div>
                                    <span className={`badge ${formik.values.IsActive === 1 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} text-uppercase`}>
                                        {formik.values.IsActive === 1 ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </FormGroup>
                        )}
                    </ModalBody>
                    
                    <ModalFooter style={{ borderTop: 'none' }}>
                        <Button 
                            color="primary" 
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Spinner size="sm" className="me-1" />
                                    {editMode ? 'Updating...' : 'Saving...'}
                                </>
                            ) : (
                                editMode ? 'Update' : 'Save'
                            )}
                        </Button>
                        <Button color="danger" onClick={handleCloseModal} disabled={submitting}>
                            Close
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            <SuccessModal
                show={successModal}
                onCloseClick={() => setSuccessModal(false)}
                successMsg={response || 'Operation completed successfully'}
            />

            <ErrorModal
                show={errorModal}
                onCloseClick={() => setErrorModal(false)}
                errorMsg={response || 'An error occurred'}
            />
        </React.Fragment>
    );
};

export default Category;