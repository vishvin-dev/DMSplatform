import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Spinner, Alert
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg'; 

// Assuming 'indentView' is available from your helpers
import { indentView } from '../../helpers/fakebackend_helper'; 

// =================================================================
// 1. CONSTANTS AND UTILITY FUNCTIONS
// =================================================================

const INITIAL_INDENTS = [];
// This map will be populated by the API Flag 1 response
let GLOBAL_STATUS_MAP = {}; 

// Hardcoded statuses for the UI dropdown based on your Flag 1 response, plus an 'All' option.
const HARDCODED_STATUSES = [
    { label: 'All', value: 'all' },
    { label: 'Pending Approval', value: 'To Be Approved' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Acknowledged', value: 'Acknowledged' },
    { label: 'Returned for Revision', value: 'ResubmittedToOfficers' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Closed', value: 'Closed' },
];

const formatSelectedOptions = (names) => {
    if (!names) return '';
    const parts = names.split('/').map(p => p.trim()).filter(p => p.length > 0);
    return parts.join(' / ');
};

const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const submitTo = indentData.submitTo || '';
    const selectedOptions = indentData.selectedOptions || [];
    const isReturned = indentData.status === 'Rejected' || indentData.status === 'Returned for Revision' || indentData.status === 'ResubmittedToOfficers';
    
    // Check if quantity data exists to decide if we show the quantity columns
    const hasQuantityData = indentData.officerEnteredQty || indentData.finalApprovedQty;

    const getToCode = () => {
        if (submitTo === 'division') return indentData.divisionCode;
        if (submitTo === 'subdivision') return indentData.subDivisionCode;
        return indentData.subDivisionCode || indentData.sectionCode;
    };
    const formattedOptionNames = `${indentData.division} / ${indentData.subDivision} / ${indentData.sectionNames || ''}`; 

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {indentData.indentNumber}</div>
                    <div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {indentData.date}</div><div><strong>Time:</strong> {indentData.time}</div></div>
                </div>
                
                {isReturned && indentData.rejectionReason && (
                    <div className="alert alert-info p-3 mb-3 border border-info" style={{ fontSize: '14px' }}>
                        <h6 className="mb-1 text-dark">Revision Instructions:</h6>
                        <p className="mb-0 fw-bold">{indentData.rejectionReason}</p>
                    </div>
                )}
                
                {/* Quantity summary section (removed to integrate into the table below) */}

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
                            {hasQuantityData && <th>Officer Confirmed Qty</th>}
                            {hasQuantityData && <th>Final Approved Qty</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {/* CRITICAL FIX: Iterate over selectedOptions for detail rows */}
                        {selectedOptions.map((option, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{option.divisionName}</td>
                                <td>{option.subDivisionName}</td>
                                <td>{option.name}</td>
                                {/* Display top-level quantity data on every row */}
                                {hasQuantityData && <td className="text-center">{indentData.officerEnteredQty || '0'}</td>}
                                {hasQuantityData && <td className="text-center">{indentData.finalApprovedQty || '0'}</td>}
                            </tr>
                        ))}
                    </tbody>
                </Table>
                
                <p>Kindly process and arrange for handover of physical consumer records of above mentioned location.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};

// Function to normalize API response data to the UI format
const normalizeIndentData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => {
        const createdDate = new Date(item.CreatedOn || new Date());
        
        const statusId = item.Status_Id;
        const status = GLOBAL_STATUS_MAP[statusId] || item.IndentStatus || 'Unknown';
        
        const division = item.division_names || 'N/A';
        const subDivision = item.subdivision_names || 'N/A';
        const sectionNames = item.section_names || 'N/A';

        const submitTo = (item.CreatedByRole || '').includes('Section') ? 'section' : 
                         (item.CreatedByRole || '').includes('SubDivision') ? 'subdivision' : 'division';

        // Split multi-value fields (so_codes and section_names) by comma
        const soCodesArray = (item.so_codes || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
        const sectionNamesArray = (item.section_names || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
        const maxLen = Math.max(soCodesArray.length, sectionNamesArray.length);
        
        const normalizedSections = Array.from({ length: maxLen }).map((_, index) => ({
            name: sectionNamesArray[index] || soCodesArray[index] || 'N/A',
            code: soCodesArray[index] || item.sd_codes, 
            quantity: 0, 
            divisionName: division, 
            subDivisionName: subDivision
        }));


        return {
            indentNumber: item.fullIndentNo || item.Indent_No || 'N/A',
            createdBy: item.FirstName || item.RequestUserName || 'N/A',
            approvedBy: item.FinalApprovedByUser || 'N/A', 
            createdOn: item.CreatedOn,
            date: createdDate.toLocaleDateString('en-GB'),
            time: createdDate.toLocaleTimeString('en-US', { hour12: true }),
            division: division,
            subDivision: subDivision,
            subDivisionCode: item.sd_codes,
            divisionCode: item.div_codes,
            sectionCode: item.so_codes,
            submitTo: submitTo,
            status: status, // This is the combined/mapped status name
            sectionNames: sectionNames,
            
            // **CAPTURED QUANTITY FIELDS**
            finalApprovedQty: item.FinalApprovedQty || null,
            officerEnteredQty: item.OfficerEnteredQty || null,
            
            // Consolidated names for table display (using raw names)
            selectedOptionNames: `${division}/${subDivision}/${sectionNames}`, 
            // CRITICAL FIX: Array of sections for modal detail rows
            selectedOptions: normalizedSections, 
            rejectionReason: item.RejectedComment || null, 
        };
    });
};

// =================================================================
// 3. API FETCHING LOGIC (Two Concurrent Calls: Flag 1 for Map, Flag 2 for Data)
// =================================================================

const fetchIndentData = async (sessionData, setIndents, setTotalCount, setIsLoading, setError) => {
    const requestUserName = sessionData.requestUserName || null;

    setIsLoading(true);
    setError(null);
    setIndents(INITIAL_INDENTS);

    // Payloads for concurrent fetching
    const statusPayload = { "flagId": 1, "RequestUserName": requestUserName };
    const dataPayload = { "flagId": 2, "RequestUserName": requestUserName };

    try {
        // Run both API calls concurrently
        const [statusResponse, dataResponse] = await Promise.all([
            indentView(statusPayload),
            indentView(dataPayload)
        ]);

        // --- Step 1: Process Status Map (Flag 1) ---
        if (statusResponse && statusResponse.status === 'success' && Array.isArray(statusResponse.result)) {
            const statusMap = {};
            statusResponse.result.forEach(s => {
                // Populate global map: { 1: 'To Be Approved', 2: 'Approved', ... }
                statusMap[s.Status_Id] = s.StatusName;
            });
            GLOBAL_STATUS_MAP = statusMap;
        } else {
             console.error("Failed to fetch Status Map (Flag 1). Using fallback status from Flag 2 data.");
        }

        // --- Step 2: Process Indent Data (Flag 2) ---
        if (dataResponse && dataResponse.status === 'success') {
            const resultData = dataResponse.result || [];
            
            // Normalize data, using the freshly populated GLOBAL_STATUS_MAP
            const normalizedData = normalizeIndentData(resultData);

            setIndents(normalizedData);
            setTotalCount(dataResponse.count || normalizedData.length || 0);
        } else {
            setError(dataResponse.message || 'Failed to fetch Indent data (Flag 2).');
        }

    } catch (err) {
        console.error("API Fetch Error (Flag 1/2 Concurrent Call):", err);
        setError('An unexpected network error occurred while fetching data.');
    } finally {
        setIsLoading(false);
    }
};


// =================================================================
// 4. MAIN COMPONENT
// =================================================================

const IndentView = () => {
    document.title = `Indent Queue | DMS`;

    // --- Session Data Retrieval ---
    const sessionData = useMemo(() => {
        // Retrieve RequestUserName from sessionStorage, defaulting to the one in the screenshot
        const fallbackEmail = sessionStorage.getItem('Email') || sessionStorage.getItem('requestUserName') || "projectmanager@gmail.com";
        return { requestUserName: fallbackEmail };
    }, []);

    // --- State Variables ---
    const [indents, setIndents] = useState(INITIAL_INDENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [totalCount, setTotalCount] = useState(0); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndent, setSelectedIndent] = useState(null);

    // Filter States
    const [viewStatus, setViewStatus] = useState('all'); 
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    // Table States
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    

    // --- Data Fetching and Refresh ---
    const refreshData = useCallback(() => {
        if (!sessionData.requestUserName) {
            setFetchError("Authentication error: Missing RequestUserName session data.");
            return;
        }

        // Fetch both Flag 1 (Status Map) and Flag 2 (Data List)
        fetchIndentData(sessionData, setIndents, setTotalCount, setIsLoading, setFetchError);

        setPage(0);

    }, [sessionData]);


    useEffect(() => {
        refreshData();
    }, [refreshData]);


    // --- Core Filtering Logic (Local Filters) ---
    const filteredIndents = useMemo(() => {
        let results = indents;

        // --- 1. Status Filter ---
        if (viewStatus !== 'all') {
             results = results.filter(i => i.status === viewStatus);
        }
        
        // --- 2. Date Range Filter (IGNORED for now) ---

        // --- 3. Search Filter ---
        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.selectedOptionNames || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return results;
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
            case 'Resubmitted': 
            case 'ResubmittedToOfficers':
            case 'Returned for Revision': return 'info';
            case 'Acknowledged': return 'info'; 
            case 'Closed': return 'dark';
            default: return 'secondary';
        }
    };

    // --- Column Definition ---
    const columns = useMemo(() => [
        { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
        { header: 'Status', accessorKey: 'status', sortable: true }, 
        { header: 'Created by', accessorKey: 'createdBy', sortable: true },
        { header: 'Section/Sub-Division', accessorKey: 'selectedOptionNames', sortable: true },
        { header: 'Created on', accessorKey: 'createdOn', sortable: true },
        { header: 'Action', accessorKey: 'action', sortable: false },
    ], []);

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
        if (isLoading) { return (<tr><td colSpan={columns.length} className="text-center py-5"><Spinner size="sm" className="me-2" /> Loading Indents...</td></tr>); }
        if (fetchError) { return (<tr><td colSpan={columns.length} className="text-center py-5"><Alert color="danger" className="mb-0">{fetchError}</Alert></td></tr>); }

        if (!paginatedData || paginatedData.length === 0) {
            let message = "No Documents Found.";
            if (viewStatus !== 'all') {
                message = `No Documents Found with status: ${viewStatus}.`;
            } else if (indents.length === 0) {
                message = `No Indent data fetched (${totalCount} total).`;
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
                            
                            {/* --- Status Filter --- */}
                            <Col md="auto" sm={6} className="filter-col">
                                <FormGroup className="mb-0">
                                    <Label for="statusFilter">Filter by Status</Label>
                                    <Input
                                        type="select"
                                        id="statusFilter"
                                        value={viewStatus}
                                        onChange={(e) => setViewStatus(e.target.value)}
                                        className="filter-control-group small-filter-input"
                                        disabled={isLoading}
                                    >
                                        {/* Hardcoded options */}
                                        {HARDCODED_STATUSES.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                                {/* Display current filter counts */}
                                                {option.label === 'All' ? ` (${indents.length})` : 
                                                 ` (${filteredIndents.filter(i => i.status === option.value).length})`}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>

                            {/* --- Search Box --- */}
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

                {/* 1. View Indent Modal */}
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