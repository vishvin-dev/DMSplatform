import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg'; 

// --- Mock Data (Kept for component functionality) ---
const mockIndents = [
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/001', createdBy: 'John Doe', createdOn: '2025-09-09T10:30:00Z', date: '09/09/2025', time: '10:30:00 AM', division: 'City Division', subDivision: 'Central Sub-Division', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Section A / Section B', selectedOptions: [{ name: 'Section A', code: 'SEC-A', quantity: 0 }, { name: 'Section B', code: 'SEC-B', quantity: 0 }], status: 'To Be Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/002', createdBy: 'Jane Smith', createdOn: '2025-09-08T15:45:12Z', date: '08/09/2025', time: '03:45:12 PM', division: 'Rural Division', subDivision: 'West Sub-Division', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'West Sub-Division / East Sub-Division', selectedOptions: [{ name: 'West Sub-Division', code: 'W-SD', quantity: 80 }, { name: 'East Sub-Division', code: 'E-SD', quantity: 120 }], status: 'Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/003', createdBy: 'Peter Jones', createdOn: '2025-09-07T11:00:00Z', date: '07/09/2025', time: '11:00:00 AM', division: 'City Division', subDivision: 'North Sub-Division', submitTo: 'section', sectionCode: 'N-SEC', selectedOptionNames: 'North Section / South Section', selectedOptions: [{ name: 'North Section', code: 'N-SEC', quantity: 50 }, { name: 'South Section', code: 'S-SEC', quantity: 70 }], status: 'Returned for Revision', rejectionReason: 'North Section quantity seems low. Please recheck and correct physical count before resubmitting.' }, 
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/004', createdBy: 'Mary Williams', createdOn: '2025-09-10T09:20:00Z', date: '10/09/2025', time: '09:20:00 AM', division: 'Metro Division', subDivision: 'East Sub-Division', submitTo: 'subdivision', subDivisionCode: 'E-SD', selectedOptionNames: 'Downtown Section / Uptown Section', selectedOptions: [{ name: 'Downtown Section', code: 'DT-SEC', quantity: 0 }, { name: 'Uptown Section', code: 'UT-SEC', quantity: 0 }], status: 'Rejected' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/005', createdBy: 'David Brown', createdOn: '2025-09-06T18:05:00Z', date: '06/09/2025', time: '06:05:00 PM', division: 'Rural Division', subDivision: 'South Sub-Division', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'South Sub-Division', selectedOptions: [{ name: 'South Sub-Division', code: 'S-SD', quantity: 150 }], status: 'Returned for Revision', rejectionReason: 'The division information is incomplete. Please correct the submission data.' }, 
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/006', createdBy: 'Susan Miller', createdOn: '2025-09-05T14:30:00Z', date: '05/09/2025', time: '02:30:00 PM', division: 'City Division', subDivision: 'Central Sub-Division', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Park Avenue Section', selectedOptions: [{ name: 'Park Avenue Section', code: 'PA-SEC', quantity: 50 }], status: 'To Be Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/007', createdBy: 'Michael Clark', createdOn: '2025-09-04T12:00:00Z', date: '04/09/2025', time: '12:00:00 PM', division: 'Rural Division', subDivision: 'East Sub-Division', submitTo: 'subdivision', subDivisionCode: 'E-SD', selectedOptionNames: 'Highway Section', selectedOptions: [{ name: 'Highway Section', code: 'HW-SEC', quantity: 90 }], status: 'Approved' },
];
// --- End of Mock Data ---

// Function to replace '/' with 'and' for display
const formatSelectedOptions = (names) => {
    if (!names) return '';
    return names.replace(/\s\/\s/g, ' and ');
};

// --- Template for the initial Indent / Resubmit View (Simplified) ---
const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const submitTo = indentData.submitTo || '';
    const selectedOptions = indentData.selectedOptions || [];
    const isReturned = indentData.status === 'Returned for Revision';
    
    const getToCode = () => {
        if (submitTo === 'division') return indentData.divisionCode;
        if (submitTo === 'subdivision') return indentData.subDivisionCode;
        return indentData.subDivisionCode || indentData.sectionCode;
    };
    const formattedOptionNames = formatSelectedOptions(indentData.selectedOptionNames);

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {indentData.indentNumber}</div>
                    <div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {indentData.date}</div><div><strong>Time:</strong> {indentData.time}</div></div>
                </div>
                
                {/* Manager/Officer Reason for Revision */}
                {isReturned && indentData.rejectionReason && (
                    <div className="alert alert-info p-3 mb-3 border border-info" style={{ fontSize: '14px' }}>
                        <h6 className="mb-1 text-dark">Revision Instructions:</h6>
                        <p className="mb-0 fw-bold">{indentData.rejectionReason}</p>
                    </div>
                )}
                
                <div><p>To,</p><p>The {submitTo.charAt(0).toUpperCase() + submitTo.slice(1)} Officer</p><p>{getToCode()}</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Request for physical records of Gescom Consumer of {formattedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>With reference to the above DWA no and subject, we request for the physical available consumer records of the below listed location(s).</p></div>
                
                <Table bordered size="sm" className="mb-4">
                    <thead>
                        <tr>
                            <th>SL NO</th>
                            <th>Division</th>
                            <th>Sub-Division</th>
                            <th>Section / Sub-Division</th>
                            {isReturned && <th style={{ width: '20%' }}>Last Recorded Qty</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedOptions.map((option, index) => {
                            const recordedQty = option.quantity || 0;

                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{indentData.division}</td>
                                    <td>{indentData.subDivision}</td>
                                    <td>{option.name}</td>
                                    {isReturned && <td className="fw-bold text-danger">{recordedQty}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                
                <p>Kindly process and arrange for handover of physical consumer records of above mentioned location.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};

const IndentView = () => {
    document.title = `Indent Queue | DMS`;

    const [indents] = useState(mockIndents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndent, setSelectedIndent] = useState(null);

    // Filter States
    const [viewStatus, setViewStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    // Data and Form States
    const [filteredIndents, setFilteredIndents] = useState(mockIndents);
    
    // Table States
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- Column Definition ---
    const columns = useMemo(() => [
        { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
        { header: 'Status', accessorKey: 'status', sortable: true }, 
        { header: 'Created by', accessorKey: 'createdBy', sortable: true },
        { header: 'Section/Sub-Division', accessorKey: 'selectedOptionNames', sortable: true },
        { header: 'Created on', accessorKey: 'createdOn', sortable: true },
        { header: 'Action', accessorKey: 'action', sortable: false },
    ], []);

    // --- Core Filtering Logic ---
    useEffect(() => {
        let results = indents;

        // 1. Filter by Status
        if (viewStatus === 'to_approve') {
            results = results.filter(indent => indent.status === 'To Be Approved');
        } else if (viewStatus === 'approved') {
            results = results.filter(indent => indent.status === 'Approved');
        } else if (viewStatus === 'rejected') {
            results = results.filter(indent => indent.status === 'Rejected');
        } else if (viewStatus === 'returned_for_revision') {
            results = results.filter(indent => indent.status === 'Returned for Revision');
        } else if (viewStatus === 'all') {
            results = indents;
        }

        // 2. Filter by Date Range (using createdOn)
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;

        if (start > 0 || end !== Infinity) {
            results = results.filter(indent => {
                const createdTime = new Date(indent.createdOn).getTime();
                // Check if createdTime is within the selected range (inclusive)
                return createdTime >= start && createdTime <= end;
            });
        }

        // 3. Filter by Search Term
        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.selectedOptionNames || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredIndents(results);
        setSortConfig({ key: null, direction: null });
        setPage(0);
    }, [searchTerm, indents, viewStatus, startDate, endDate]);


    const sortData = (data, key, direction) => {
        if (!key || !direction) return data;
        return [...data].sort((a, b) => {
            const aValue = a[key] === null || a[key] === undefined ? '' : a[key];
            const bValue = b[key] === null || b[key] === undefined ? '' : b[key];
            let aVal = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
            let bVal = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
            
            if (direction === 'asc') {
                if (aVal < bVal) return -1; if (aVal > bVal) return 1; return 0;
            } else {
                if (aVal > bVal) return -1; if (aVal < bVal) return 1; return 0;
            }
        });
    };

    const sortedData = useMemo(() => {
        return sortData(filteredIndents, sortConfig.key, sortConfig.direction);
    }, [filteredIndents, sortConfig]);

    const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, page, pageSize]);

    // --- Modal Toggles ---
    const toggleViewModal = () => setIsViewModalOpen(!isViewModalOpen);

    const handleViewClick = (indent) => {
        setSelectedIndent(indent);
        toggleViewModal();
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'To Be Approved': return 'warning';
            case 'Returned for Revision': return 'info';
            default: return 'secondary';
        }
    };

    // --- Render Logic (Table) ---
    const renderTableHeader = () => (
        <tr>
            {columns.map((col) => {
                const isActionOrUnsortable = !col.sortable;
                return (
                    <th key={col.accessorKey} 
                        onClick={() => {
                            if (isActionOrUnsortable) return;
                            if (sortConfig.key !== col.accessorKey) { setSortConfig({ key: col.accessorKey, direction: 'asc' }); }
                            else if (sortConfig.direction === 'asc') { setSortConfig({ key: col.accessorKey, direction: 'desc' }); }
                            else { setSortConfig({ key: null, direction: null }); }
                            setPage(0);
                        }} 
                        style={{ 
                            cursor: isActionOrUnsortable ? 'default' : 'pointer', 
                            userSelect: 'none', 
                            whiteSpace: 'nowrap',
                            textAlign: col.accessorKey === 'action' ? 'left' : 'left'
                        }} 
                    >
                        {col.header}
                    </th>
                );
            })}
        </tr>
    );

    const renderTableRows = () => {
        if (!paginatedData || paginatedData.length === 0) {
            let message = "No Documents Found.";
             if (viewStatus === 'returned_for_revision') {
                 message = "No Documents Found in the Resubmit Queue.";
            } else if (viewStatus === 'to_approve') {
                message = "No Documents Found Pending Approval.";
            } else if (viewStatus === 'approved') {
                message = "No Approved Documents Found.";
            } else if (viewStatus === 'rejected') {
                message = "No Rejected Documents Found.";
            } else if (viewStatus === 'all') {
                message = "No Documents Found matching the criteria.";
            }

            return (<tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>{message}</td></tr>);
        }
        return paginatedData.map((indent) => (
            <tr key={indent.indentNumber}>
                <td>{indent.indentNumber}</td>
                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                <td>{indent.createdBy}</td>
                <td>
                    {formatSelectedOptions(indent.selectedOptionNames)}
                </td>
                <td>{new Date(indent.createdOn).toLocaleString()}</td>
                <td style={{ textAlign: 'left' }}>
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        {/* ONLY View button remains */}
                        <Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button>
                    </div>
                </td>
            </tr>
        ));
    };

    const renderPagination = () => {
        const pageSizeOptions = [{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 25, label: '25' }, { value: -1, label: 'All' }];
        const totalPages = pageCount;

        return (
            <div style={{ margin: '18px 0 12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }} >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
                            Showing{' '}<b style={{ color: '#222', fontWeight: 600 }}>{paginatedData.length}</b>{' '}of <b>{sortedData.length}</b> Results
                        </span>
                        <select value={pageSize} onChange={e => {
                            setPageSize(e.target.value === '-1' ? -1 : parseInt(e.target.value, 10));
                            setPage(0);
                        }} style={{ border: '1px solid #c9ddf7', borderRadius: 7, padding: '7px 10px', fontSize: 15, width: '80px', color: '#444', marginTop: 4, outline: 'none', background: 'white' }} >
                            {pageSizeOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                    </div>
                    <div className="btn-group" role="group" aria-label="Pagination">
                        <button type="button" className="btn btn-light" disabled={page === 0 || pageSize === -1} onClick={() => setPage(Math.max(page - 1, 0))} >Previous</button>
                        {pageSize !== -1 && Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            let pageNum = i;
                            if (totalPages > 5) {
                                if (page >= 2 && page < totalPages - 2) { pageNum = page - 2 + i; }
                                else if (page >= totalPages - 2) { pageNum = totalPages - 5 + i; }
                            }
                            if (pageNum >= 0 && pageNum < totalPages) {
                                return (<button key={pageNum} type="button" className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`} onClick={() => setPage(pageNum)} disabled={page === pageNum} >{pageNum + 1}</button>);
                            } else { return null; }
                        })}
                        <button type="button" className="btn btn-light" disabled={(page >= totalPages - 1 || totalPages === 0) || pageSize === -1} onClick={() => setPage(Math.min(page + 1, totalPages - 1))} >Next</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-content">
            <style>{`
                /* Ensure horizontal scrollbar for overflowing content in the table */
                .table-responsive { overflow-x: auto; }

                .a4-sheet-modal{width:100%;border:1px solid #ccc;background-color:#fff;background-size:100% 100%;background-repeat:no-repeat;font-family:Arial,sans-serif;color:#000;font-size:13px;line-height:1.6;margin:0 auto}
                .content-wrapper-modal{padding:14% 8% 8%}
                .a4-sheet-modal table,.a4-sheet-modal th,.a4-sheet-modal td{font-size:12px;padding:5px}
                .scrollable-modal-body{max-height:70vh;overflow-y:auto;}
                .filter-control-group .form-control {
                    height: calc(1.5em + 0.75rem + 2px);
                    padding: 0.375rem 0.75rem;
                }

                /* New styles for optimized filter row */
                .filter-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px 15px; /* Vertical and horizontal gap */
                    align-items: flex-end;
                }
                .filter-col {
                    flex-grow: 0;
                    /* Set a fixed max-width for the filter columns on larger screens */
                    max-width: 200px; 
                }
                .search-col {
                    flex-grow: 1;
                    /* Ensure the search bar takes up the remaining space */
                    min-width: 250px;
                }
                .small-filter-input {
                    min-width: 160px; /* Ensure select and date inputs are compact */
                }
            `}</style>
            <Container fluid>
                <Card>
                    <CardHeader className="bg-primary text-white p-3"><h5 className="mb-0 text-white">Indent Request View</h5></CardHeader>
                    <CardBody>
                        <Row className="g-3 mb-3 align-items-end filter-row">
                            
                            {/* --- Status Filter (LEFT SIDE) - Use md="auto" to size to content on medium screens and up */}
                            <Col md="auto" sm={6} className="filter-col">
                                <FormGroup className="mb-0">
                                    <Label for="statusFilter">Filter by Status</Label>
                                    <Input
                                        type="select"
                                        id="statusFilter"
                                        value={viewStatus}
                                        onChange={(e) => setViewStatus(e.target.value)}
                                        className="filter-control-group small-filter-input"
                                    >
                                        <option value="all">All ({indents.length})</option>
                                        <option value="to_approve">Pending Approval ({indents.filter(i => i.status === 'To Be Approved').length})</option>
                                        <option value="approved">Approved ({indents.filter(i => i.status === 'Approved').length})</option>
                                        <option value="rejected">Rejected ({indents.filter(i => i.status === 'Rejected').length})</option>
                                        <option value="returned_for_revision">Returned for Revision ({indents.filter(i => i.status === 'Returned for Revision').length})</option>
                                    </Input>
                                </FormGroup>
                            </Col>

                            {/* --- Date Range Filter (From Date - LEFT SIDE) --- */}
                            <Col md="auto" sm={6} className="filter-col">
                                <FormGroup className="mb-0">
                                    <Label for="startDate">From Date</Label>
                                    <Input
                                        type="date"
                                        id="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="filter-control-group small-filter-input"
                                    />
                                </FormGroup>
                            </Col>
                            
                            {/* --- Date Range Filter (To Date - LEFT SIDE) --- */}
                            <Col md="auto" sm={6} className="filter-col">
                                <FormGroup className="mb-0">
                                    <Label for="endDate">To Date</Label>
                                    <Input
                                        type="date"
                                        id="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="filter-control-group small-filter-input"
                                    />
                                </FormGroup>
                            </Col>

                            {/* --- Search Box (RIGHT SIDE) - Use md={true} to take remaining space */}
                            <Col md={true} sm={12} className="search-col">
                                <FormGroup className="mb-0">
                                    <Label for="searchBox" style={{ opacity: 0 }}>Search Label</Label>
                                    <div className="search-box">
                                        <Input 
                                            type="text" 
                                            id="searchBox"
                                            className="form-control" 
                                            placeholder="Search by Indent #, Location, or Creator..." 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                        />
                                        <i className="ri-search-line search-icon"></i>
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>
                        <div className="table-responsive">
                            <table className="table grid-table table-hover table-nowrap align-middle mb-0">
                                <thead className="table-light">{renderTableHeader()}</thead>
                                <tbody>{renderTableRows()}</tbody>
                            </table>
                        </div>
                        {renderPagination()}
                    </CardBody>
                </Card>

                {/* 1. View Indent Modal (ONLY Modal Remaining) */}
                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.indentNumber} ({selectedIndent.status})</ModalHeader>
                        <ModalBody className="scrollable-modal-body">
                            {renderIndentTemplate(selectedIndent)}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                        </ModalFooter>
                    </Modal>
                )}
            </Container>
        </div>
    );
};

export default IndentView;