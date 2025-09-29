import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg';

// --- Mock Data ---
const mockIndents = [
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/001', createdBy: 'John Doe', createdOn: '2025-09-09T10:30:00Z', date: '09/09/2025', time: '10:30:00 AM', division: 'City Division', subDivision: 'Central Sub-Division', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Section A / Section B', selectedOptions: [{ name: 'Section A', code: 'SEC-A', quantity: 0 }, { name: 'Section B', code: 'SEC-B', quantity: 0 }], status: 'To Be Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/002', createdBy: 'Jane Smith', createdOn: '2025-09-08T15:45:12Z', date: '08/09/2025', time: '03:45:12 PM', division: 'Rural Division', subDivision: 'West Sub-Division', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'West Sub-Division / East Sub-Division', selectedOptions: [{ name: 'West Sub-Division', code: 'W-SD', quantity: 80 }, { name: 'East Sub-Division', code: 'E-SD', quantity: 120 }], status: 'Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/003', createdBy: 'Peter Jones', createdOn: '2025-09-07T11:00:00Z', date: '07/09/2025', time: '11:00:00 AM', division: 'City Division', subDivision: 'North Sub-Division', submitTo: 'section', sectionCode: 'N-SEC', selectedOptionNames: 'North Section / South Section', selectedOptions: [{ name: 'North Section', code: 'N-SEC', quantity: 50 }, { name: 'South Section', code: 'S-SEC', quantity: 70 }], status: 'Returned for Revision', rejectionReason: 'North Section quantity seems low. Please recheck and correct physical count before resubmitting.' }, 
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/004', createdBy: 'Mary Williams', createdOn: '2025-09-10T09:20:00Z', date: '10/09/2025', time: '09:20:00 AM', division: 'Metro Division', subDivision: 'East Sub-Division', submitTo: 'subdivision', subDivisionCode: 'E-SD', selectedOptionNames: 'Downtown Section / Uptown Section', selectedOptions: [{ name: 'Downtown Section', code: 'DT-SEC', quantity: 0 }, { name: 'Uptown Section', code: 'UT-SEC', quantity: 0 }], status: 'Rejected' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/005', createdBy: 'David Brown', createdOn: '2025-09-06T18:05:00Z', date: '06/09/2025', time: '06:05:00 PM', division: 'Rural Division', subDivision: 'South Sub-Division', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'South Sub-Division', selectedOptions: [{ name: 'South Sub-Division', code: 'S-SD', quantity: 150 }], status: 'Returned for Revision', rejectionReason: 'The division information is incomplete. Please correct the submission data.' }, 
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/006', createdBy: 'Susan Miller', createdOn: '2025-09-05T14:30:00Z', date: '05/09/2025', time: '02:30:00 PM', division: 'City Division', subDivision: 'Central Sub-Division', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Park Avenue Section', selectedOptions: [{ name: 'Park Avenue Section', code: 'PA-SEC', quantity: 50 }], status: 'To Be Approved' },
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

// --- Template for the Acknowledgement (No changes, kept for completeness) ---
const renderAcknowledgementTemplate = (ackData) => {
    if (!ackData) return null;
    const selectedOptionsWithQuantity = ackData.selectedOptions || [];
    const formattedOptionNames = formatSelectedOptions(ackData.selectedOptionNames);

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><strong>Indent No.:</strong> {ackData.indentNumber}</div><div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {ackData.date}</div><div><strong>Time:</strong> {ackData.time}</div></div></div>
                <div><p>To,</p><p>The Project Manager</p><p>Vishvin Technologies</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Acknowledgement of Physical Records for {formattedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>This is to acknowledge the receipt of the physical consumer records with reference to the above DWA no and subject for the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4">
                    <thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th><th>Quantity Received</th></tr></thead>
                    <tbody>
                        {selectedOptionsWithQuantity.map((option, index) => (
                            <tr key={index}><td>{index + 1}</td><td>{ackData.division}</td><td>{ackData.subDivision}</td><td>{option.name}</td><td>{option.quantity}</td></tr>
                        ))}
                    </tbody>
                </Table>
                
                {ackData.comments && (
                    <div style={{ marginBottom: '20px' }}>
                        <p><strong>Comments/Remarks:</strong> {ackData.comments}</p>
                    </div>
                )}

                <p>The handover of the physical consumer records for the above mentioned locations has been processed.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};


const ViewIndent = () => {
    document.title = `Resubmit Queue | DMS`;

    const [indents, setIndents] = useState(mockIndents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndent, setSelectedIndent] = useState(null);

    // DEFAULT VIEW: Show only documents marked 'Returned for Revision' (Resubmit Queue)
    const [viewStatus, setViewStatus] = useState('returned_for_revision'); 

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [isPmResubmitQtyModalOpen, setIsPmResubmitQtyModalOpen] = useState(false); // NEW MODAL for PM Resubmit Qty

    // Data and Form States
    const [filteredIndents, setFilteredIndents] = useState(mockIndents);
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalComments, setApprovalComments] = useState(''); 
    const [formError, setFormError] = useState('');
    const [sectionQuantities, setSectionQuantities] = useState([]); // Used for Officer Approve
    
    // PM Resubmit specific state
    const [pmResubmitQuantities, setPmResubmitQuantities] = useState([]); 
    const [resubmitFormError, setResubmitFormError] = useState('');

    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });
    
    // Table States
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- Column Definition ---
    const columns = useMemo(() => [
        { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
        { header: 'Status', accessorKey: 'status', sortable: true }, 
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

        // 2. Filter by Search Term
        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.selectedOptionNames || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredIndents(results);
        setSortConfig({ key: null, direction: null });
        setPage(0);
    }, [searchTerm, indents, viewStatus]);


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
    const toggleRejectModal = () => setIsRejectModalOpen(!isRejectModalOpen);
    const toggleQuantityModal = () => setIsQuantityModalOpen(!isQuantityModalOpen);
    const toggleAcknowledgementModal = () => setIsAcknowledgementModalOpen(!isAcknowledgementModalOpen);
    const toggleResponseModal = () => setIsResponseModalOpen(!isResponseModalOpen);
    const togglePmResubmitQtyModal = () => setIsPmResubmitQtyModalOpen(!isPmResubmitQtyModalOpen);

    const handleViewClick = (indent) => {
        setSelectedIndent(indent);
        toggleViewModal();
    };
    
    // --- PM Resubmit Actions ---

    // 1. Opens the Quantity Correction modal for the Project Manager
    const handleOpenPmResubmit = (indent) => {
        setSelectedIndent(indent);
        
        const initialQuantities = indent.selectedOptions.map(option => ({
            code: option.code,
            name: option.name,
            // Use existing quantity if present, otherwise default to empty string for re-entry
            quantity: option.quantity !== undefined ? option.quantity.toString() : '' 
        }));

        setPmResubmitQuantities(initialQuantities);
        setResubmitFormError('');
        togglePmResubmitQtyModal();
    };

    // 2. Handles input change in the PM Resubmit Quantity modal
    const handlePmResubmitQuantityChange = (code, value) => {
        const validatedValue = value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0) ? value : '';
        
        setPmResubmitQuantities(prev => prev.map(item =>
            (item.code === code) ? { ...item, quantity: validatedValue } : item
        ));
        setResubmitFormError('');
    };

    // 3. Submits the corrected quantities and status (MAIN PM SUBMISSION LOGIC)
    const handlePmResubmitSubmit = () => {
        // --- VALIDATION ---
        const invalidQuantity = pmResubmitQuantities.some(item => 
            item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity))
        );

        if (invalidQuantity) {
            setResubmitFormError('All quantities must be entered and be non-negative integers before resubmitting.');
            return;
        }
        // --- END VALIDATION ---

        // Prepare updated options array with corrected quantities
        const updatedSelectedOptions = selectedIndent.selectedOptions.map(original => {
            const correctedItem = pmResubmitQuantities.find(q => q.code === original.code);
            return {
                ...original,
                // Update the quantity field with the PM's corrected value
                quantity: correctedItem ? parseInt(correctedItem.quantity, 10) : original.quantity
            };
        });

        // 1. Update the indent status and data in the main state
        setIndents(prev => prev.map(i => 
            i.indentNumber === selectedIndent.indentNumber ? { 
                ...i, 
                status: 'To Be Approved', 
                rejectionReason: null, // Clear the reason upon resubmit
                selectedOptions: updatedSelectedOptions
            } : i
        ));
        
        // 2. Show success response
        setResponseModalContent({
            title: 'Resubmitted!',
            message: `Indent ${selectedIndent.indentNumber} has been corrected and resubmitted successfully for officer approval.`,
            isSuccess: true
        });
        
        togglePmResubmitQtyModal();
        toggleResponseModal();
        
        // Update view to filter the resubmitted document out of the current queue
        setViewStatus('returned_for_revision'); 
        setSelectedIndent(null);
    };

    // --- Officer's Actions (Kept for completeness) ---
    const handleOpenApprove = (indent) => {
        setSelectedIndent(indent); 
        if (indent && indent.selectedOptions) {
            const initialQuantities = indent.selectedOptions.map(option => ({
                ...option,
                quantity: ''
            }));
            setSectionQuantities(initialQuantities);
            setFormError('');
            setApprovalComments(''); 
            toggleQuantityModal();
        }
    };

    const handleOpenReject = (indent) => {
        setSelectedIndent(indent); 
        setRejectionReason('');
        setFormError('');
        toggleRejectModal();
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            setFormError('Rejection reason is required.');
            return;
        }

        setIndents(prev => prev.map(indent => 
            indent.indentNumber === selectedIndent.indentNumber ? { ...indent, status: 'Rejected', rejectionReason: rejectionReason } : indent
        ));

        setResponseModalContent({
            title: 'Rejected',
            message: `Indent ${selectedIndent.indentNumber} has been rejected.`,
            isSuccess: false
        });
        toggleRejectModal();
        toggleResponseModal();
    };

    const handleQuantitySubmit = () => {
        const invalidQuantity = sectionQuantities.some(item =>
            item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity))
        );

        if (invalidQuantity) {
            setFormError('All quantities must be entered and be non-negative integers.');
            return;
        }

        const ackData = {
            ...selectedIndent,
            comments: approvalComments, 
            selectedOptions: selectedIndent.selectedOptions.map(original => {
                const updatedItem = sectionQuantities.find(q => q.code === original.code);
                return {
                    ...original,
                    quantity: updatedItem ? parseInt(updatedItem.quantity, 10) : original.quantity
                };
            })
        };

        setAcknowledgementData(ackData);
        toggleQuantityModal();
        toggleAcknowledgementModal();
    };

    const handleSubmitAcknowledgement = () => {
        setIndents(prev => prev.map(indent =>
            indent.indentNumber === acknowledgementData.indentNumber ? { ...indent, status: 'Approved' } : indent
        ));

        setResponseModalContent({
            title: 'Success!',
            message: `Acknowledgement for ${acknowledgementData.indentNumber} has been submitted successfully.`,
            isSuccess: true
        });
        toggleAcknowledgementModal();
        toggleResponseModal();
    };
    
    // --- Helper functions for common logic ---
    const handleSectionQuantityChange = (code, value) => {
        // Used for Officer Approval (isQuantityModalOpen)
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setSectionQuantities(prev => prev.map(item =>
                (item.code === code) ? { ...item, quantity: value } : item
            ));
            setFormError('');
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'To Be Approved': return 'warning';
            case 'Returned for Revision': return 'info'; // Resubmit Queue
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
            return (<tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>No Documents Found in the Resubmit Queue</td></tr>);
        }
        return paginatedData.map((indent) => (
            <tr key={indent.indentNumber}>
                <td>{indent.indentNumber}</td>
                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                <td>
                    {formatSelectedOptions(indent.selectedOptionNames)}
                </td>
                <td>{new Date(indent.createdOn).toLocaleString()}</td>
                <td style={{ textAlign: 'left' }}>
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        {/* Always show View button */}
                        <Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button>
                        
                        {/* Project Manager's Resubmit Action */}
                        {indent.status === 'Returned for Revision' && (
                            <Button color="success" size="sm" onClick={() => handleOpenPmResubmit(indent)}>Resubmit</Button>
                        )}

                        {/* Officer's Actions (Visible if user manually filters to To Be Approved) */}
                        {indent.status === 'To Be Approved' && (
                            <>
                                <Button color="success" size="sm" onClick={() => handleOpenApprove(indent)}>Approve</Button>
                                <Button color="danger" size="sm" onClick={() => handleOpenReject(indent)}>Reject</Button>
                            </>
                        )}
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
                .response-modal-body{text-align:center;padding:2.5rem 1.5rem;}
                .response-icon{width:80px;height:80px;border-radius:50%;margin:0 auto 1.5rem auto;display:flex;align-items:center;justify-content:center;}
                .response-icon.success{background-color:#f0f9f4;border:1px solid #d4edda;}
                .response-icon.error{background-color:#f8d7da;border:1px solid #f5c6cb;}
                .response-icon svg{width:40px;height:40px;}
                .filter-button-group .btn {
                    font-weight: 600;
                }
            `}</style>
            <Container fluid>
                <Card>
                    <CardHeader className="bg-primary text-white p-3"><h5 className="mb-0 text-white">Indent Request Approval</h5></CardHeader>
                    <CardBody>
                        <Row className="g-4 mb-3 align-items-center">
                            <Col sm={8}>
                                {/* --- Filter Buttons (Focus on Resubmit queue) --- */}
                                <div className="filter-button-group d-flex gap-2">
                                    <Button 
                                        color={viewStatus === 'to_approve' ? 'warning' : 'light'} 
                                        onClick={() => setViewStatus('to_approve')}>
                                        Pending Approval ({indents.filter(i => i.status === 'To Be Approved').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'returned_for_revision' ? 'info' : 'light'} 
                                        onClick={() => setViewStatus('returned_for_revision')}>
                                        Resubmit Queue ({indents.filter(i => i.status === 'Returned for Revision').length})
                                    </Button>
                                    
                                    <Button 
                                        color={viewStatus === 'approved' ? 'success' : 'light'} 
                                        onClick={() => setViewStatus('approved')}>
                                        Approved ({indents.filter(i => i.status === 'Approved').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'rejected' ? 'danger' : 'light'} 
                                        onClick={() => setViewStatus('rejected')}>
                                        Rejected ({indents.filter(i => i.status === 'Rejected').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'all' ? 'primary' : 'light'} 
                                        onClick={() => setViewStatus('all')}>
                                        All ({indents.length})
                                    </Button>
                                </div>
                            </Col>
                            <Col sm={4}>
                                <div className="search-box">
                                    <Input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search by Indent # or Location..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                    />
                                    <i className="ri-search-line search-icon"></i>
                                </div>
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

                {/* 1. View Indent Modal (Used for all status viewing) */}
                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.indentNumber} ({selectedIndent.status})</ModalHeader>
                        <ModalBody className="scrollable-modal-body">
                            {renderIndentTemplate(selectedIndent)}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                            
                            {/* Project Manager Resubmit Action from Modal */}
                            {selectedIndent.status === 'Returned for Revision' && (
                                <Button color="success" onClick={() => { toggleViewModal(); handleOpenPmResubmit(selectedIndent); }}>Resubmit Document</Button>
                            )}

                        </ModalFooter>
                    </Modal>
                )}
                
                {/* 2. PM RESUBMIT QUANTITY CORRECTION MODAL */}
                <Modal isOpen={isPmResubmitQtyModalOpen} toggle={togglePmResubmitQtyModal} centered>
                    <ModalHeader toggle={togglePmResubmitQtyModal}>Correct Quantities & Resubmit: {selectedIndent?.indentNumber}</ModalHeader>
                    <ModalBody>
                        <p className="text-muted small">Please verify and correct the quantity of physical records to be handed over.</p>
                        
                        {/* Display Last Recorded Reason for context */}
                        {selectedIndent?.rejectionReason && (
                             <div className="alert alert-warning p-2 mb-3 border border-warning" style={{ fontSize: '14px' }}>
                                <strong>Reason:</strong> {selectedIndent.rejectionReason}
                            </div>
                        )}

                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Table bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th style={{ width: '130px' }}>Quantity Handovered <span className="text-danger">*</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pmResubmitQuantities.map((item) => (
                                        <tr key={item.code}>
                                            <td>{item.name}</td>
                                            <td>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handlePmResubmitQuantityChange(item.code, e.target.value)} 
                                                    style={{ width: '100px' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        {resubmitFormError && <p className="text-danger mt-2">{resubmitFormError}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={togglePmResubmitQtyModal}>Cancel</Button>
                        <Button color="success" onClick={handlePmResubmitSubmit}>Confirm Resubmit</Button>
                    </ModalFooter>
                </Modal>


                {/* 3. Reject Indent Modal (Officer's rejection - remains the same) */}
                <Modal isOpen={isRejectModalOpen} toggle={toggleRejectModal} centered>
                    <ModalHeader toggle={toggleRejectModal}>Reject Indent: {selectedIndent?.indentNumber}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label htmlFor="rejectionReason">Rejection Reason <span className="text-danger">*</span></Label>
                            <Input type="textarea" id="rejectionReason" rows="3" value={rejectionReason} onChange={(e) => { setRejectionReason(e.target.value); setFormError(''); }} placeholder="Provide a clear reason" />
                        </FormGroup>
                        {formError && <p className="text-danger mt-2">{formError}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleRejectModal}>Cancel</Button>
                        <Button color="danger" onClick={handleRejectSubmit}>Confirm Rejection</Button>
                    </ModalFooter>
                </Modal>
                
                {/* 4. Quantity Entry Modal (Officer Approves - remains the same) */}
                <Modal isOpen={isQuantityModalOpen} toggle={toggleQuantityModal} centered>
                    <ModalHeader toggle={toggleQuantityModal}>Enter Quantities for: {selectedIndent?.indentNumber}</ModalHeader>
                    <ModalBody>
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Table bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>Quantity <span className="text-danger">*</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedIndent?.selectedOptions.map((option, index) => {
                                        const currentQty = sectionQuantities.find(item => item.code === option.code)?.quantity || '';

                                        return (
                                            <tr key={option.code}>
                                                <td>{option.name}</td>
                                                <td>
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        value={currentQty} 
                                                        onChange={(e) => handleSectionQuantityChange(option.code, e.target.value)} 
                                                        style={{ width: '100px' }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                        {formError && <p className="text-danger mt-2">{formError}</p>}
                        
                        {/* Comments Field */}
                        <FormGroup className="mt-3">
                            <Label htmlFor="approvalComments">Comments (Optional)</Label>
                            <Input 
                                type="textarea" 
                                id="approvalComments" 
                                rows="2" 
                                value={approvalComments} 
                                onChange={(e) => setApprovalComments(e.target.value)} 
                                placeholder="Enter any specific remarks regarding the records..." 
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleQuantityModal}>Cancel</Button>
                        <Button color="success" onClick={handleQuantitySubmit}>Next: Acknowledge Preview</Button>
                    </ModalFooter>
                </Modal>

                {/* 5. Acknowledgement Preview Modal */}
                {acknowledgementData && (
                    <Modal isOpen={isAcknowledgementModalOpen} toggle={toggleAcknowledgementModal} centered size="lg">
                        <ModalHeader toggle={toggleAcknowledgementModal}>Acknowledgement Preview: {acknowledgementData.indentNumber}</ModalHeader>
                        <ModalBody className="scrollable-modal-body">{renderAcknowledgementTemplate(acknowledgementData)}</ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleAcknowledgementModal}>Cancel</Button>
                            <Button color="primary" onClick={handleSubmitAcknowledgement}>Submit Acknowledgement</Button>
                        </ModalFooter>
                    </Modal>
                )}

                {/* 6. Final Response Modal */}
                <Modal isOpen={isResponseModalOpen} toggle={toggleResponseModal} centered>
                    <ModalBody className="response-modal-body">
                        <div className={`response-icon ${responseModalContent.isSuccess ? 'success' : 'error'}`}>
                            {responseModalContent.isSuccess ? (
                                <svg stroke="#28a745" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg stroke="#dc3545" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            )}
                        </div>
                        <h5 className="mb-3">{responseModalContent.title}</h5>
                        <p className="text-muted">{responseModalContent.message}</p>
                        <Button color="primary" onClick={toggleResponseModal}>Done</Button>
                    </ModalBody>
                </Modal>
            </Container>
        </div>
    );
};

export default ViewIndent;