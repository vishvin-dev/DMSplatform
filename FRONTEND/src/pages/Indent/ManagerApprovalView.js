import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Collapse
} from 'reactstrap';
// Assuming letterheadImg is correctly imported
import letterheadImg from './VishvinLetterHead.jpg';

// --- Helper component for Sort Arrows (unchanged) ---
const SORT_ARROW_SIZE = 13;
function SortArrows({ direction, active }) {
    return (
        <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block' }}>
                <polyline points="3,8 6.5,4 10,8" fill="none" stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block', marginTop: -2 }}>
                <polyline points="3,5 6.5,9 10,5" fill="none" stroke={active && direction === 'desc' ? '#1064ea' : '#c1c5ca'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    );
}

// --- Mock Data (increased dummy data) ---
const mockIndents = [
    // 1. To Be Approved (Pending Officer)
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/001', createdBy: 'John Doe', createdOn: '2025-09-09T10:30:00Z', date: '09/09/2025', time: '10:30:00 AM', division: 'City Division', subDivision: 'Central Sub-Division', section: 'Main Street Section', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Section A / Section B', selectedOptions: [{ name: 'Section A', code: 'SEC-A' }, { name: 'Section B', code: 'SEC-B' }], status: 'To Be Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/010', createdBy: 'Mike Johnson', createdOn: '2025-09-16T14:00:00Z', date: '16/09/2025', time: '02:00:00 PM', division: 'Rural Division', subDivision: 'South Sub-Division', section: 'Farm Section', submitTo: 'subdivision', subDivisionCode: 'S-SD', selectedOptionNames: 'Farm Section', selectedOptions: [{ name: 'Farm Section', code: 'FM-SEC' }], status: 'To Be Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/011', createdBy: 'Emily White', createdOn: '2025-09-17T08:45:00Z', date: '17/09/2025', time: '08:45:00 AM', division: 'Metro Division', subDivision: 'West Sub-Division', section: 'Suburban Section', submitTo: 'division', divisionCode: 'M-DIV', selectedOptionNames: 'Suburban Section', selectedOptions: [{ name: 'Suburban Section', code: 'SUB-SEC' }], status: 'To Be Approved' },
    
    // 2. Approved (Ready for Manager Acknowledge) - Has Officer's Quantities
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/002', createdBy: 'Jane Smith', createdOn: '2025-09-08T15:45:12Z', date: '08/09/2025', time: '03:45:12 PM', division: 'Rural Division', subDivision: 'West Sub-Division', section: 'Westside Section', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'West Sub-Division / East Sub-Division', selectedOptions: [{ name: 'West Sub-Division', code: 'W-SD', quantity: 80 }, { name: 'East Sub-Division', code: 'E-SD', quantity: 120 }], status: 'Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/007', createdBy: 'Alice Johnson', createdOn: '2025-09-15T11:00:00Z', date: '15/09/2025', time: '11:00:00 AM', division: 'Tech Division', subDivision: 'North Sub-Division', submitTo: 'subdivision', subDivisionCode: 'N-SD', selectedOptionNames: 'Server Section', selectedOptions: [{ name: 'Server Section', code: 'SRV-S', quantity: 45 }], status: 'Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/008', createdBy: 'Bob Brown', createdOn: '2025-09-14T14:30:00Z', date: '14/09/2025', time: '02:30:00 PM', division: 'Sales Division', subDivision: 'South Sub-Division', submitTo: 'division', divisionCode: 'S-DIV', selectedOptionNames: 'Records East / Records West', selectedOptions: [{ name: 'Records East', code: 'RE-S', quantity: 10 }, { name: 'Records West', code: 'RW-S', quantity: 15 }], status: 'Approved' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/009', createdBy: 'Charlie Davis', createdOn: '2025-09-13T09:00:00Z', date: '13/09/2025', time: '09:00:00 AM', division: 'City Division', subDivision: 'Central Sub-Division', submitTo: 'section', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Park Section', selectedOptions: [{ name: 'Park Section', code: 'PK-S', quantity: 200 }], status: 'Approved' },
    
    // 3. Rejected
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/004', createdBy: 'Mary Williams', createdOn: '2025-09-10T09:20:00Z', date: '10/09/2025', time: '09:20:00 AM', division: 'Metro Division', subDivision: 'East Sub-Division', section: 'Downtown Section', submitTo: 'subdivision', subDivisionCode: 'E-SD', selectedOptionNames: 'Downtown Section / Uptown Section', selectedOptions: [{ name: 'Downtown Section', code: 'DT-SEC', quantity: 0 }, { name: 'Uptown Section', code: 'UT-SEC', quantity: 0 }], status: 'Rejected' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/012', createdBy: 'Frank Taylor', createdOn: '2025-09-18T16:50:00Z', date: '18/09/2025', time: '04:50:00 PM', division: 'City Division', subDivision: 'Central Sub-Division', section: 'Downtown Section', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'East Side', selectedOptions: [{ name: 'East Side', code: 'ES-SD', quantity: 0 }], status: 'Rejected' },

    // 4. Acknowledged (Final State) - Has Final Quantities
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/005', createdBy: 'David Brown', createdOn: '2025-09-06T18:05:00Z', date: '06/09/2025', time: '06:05:00 PM', division: 'Rural Division', subDivision: 'South Sub-Division', section: 'South Section', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'South Sub-Division', selectedOptions: [{ name: 'South Sub-Division', code: 'S-SD', quantity: 150 }], status: 'Acknowledged' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/013', createdBy: 'Grace Lee', createdOn: '2025-09-19T09:30:00Z', date: '19/09/2025', time: '09:30:00 AM', division: 'Metro Division', subDivision: 'East Sub-Division', section: 'Uptown Section', submitTo: 'subdivision', subDivisionCode: 'E-SD', selectedOptionNames: 'Uptown Section', selectedOptions: [{ name: 'Uptown Section', code: 'UT-SEC', quantity: 95 }], status: 'Acknowledged' },

    // 5. Resubmitted by Manager 
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/006', createdBy: 'Susan Miller', createdOn: '2025-09-05T14:30:00Z', date: '05/09/2025', time: '02:30:00 PM', division: 'City Division', subDivision: 'Central Sub-Division', section: 'Park Avenue Section', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Park Avenue Section', selectedOptions: [{ name: 'Park Avenue Section', code: 'PA-SEC', quantity: 50 }], status: 'Resubmitted' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/014', createdBy: 'Olivia Chen', createdOn: '2025-09-20T12:00:00Z', date: '20/09/2025', time: '12:00:00 PM', division: 'Tech Division', subDivision: 'North Sub-Division', section: 'Mainframe Section', submitTo: 'subdivision', subDivisionCode: 'N-SD', selectedOptionNames: 'Mainframe Section', selectedOptions: [{ name: 'Mainframe Section', code: 'MF-SEC', quantity: 100 }], status: 'Resubmitted' },
];
// --- End of Mock Data ---

// --- Template 1: Original Indent (Used for To Be Approved and Rejected status) (unchanged) ---
const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const submitTo = indentData.submitTo || '';
    const selectedOptions = indentData.selectedOptions || [];
    const getToCode = () => {
        if (submitTo === 'division') return indentData.divisionCode;
        if (submitTo === 'subdivision') return indentData.subDivisionCode;
        return indentData.subDivisionCode || indentData.sectionCode;
    };

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><strong>Indent No.:</strong> {indentData.indentNumber}</div><div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {indentData.date}</div><div><strong>Time:</strong> {indentData.time}</div></div></div>
                <div><p>To,</p><p>The {submitTo.charAt(0).toUpperCase() + submitTo.slice(1)} Officer</p><p>{getToCode()}</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Request for physical records of Gescom Consumer of {indentData.selectedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>With reference to the above DWA no and subject, we request for the physical available consumer records of the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4"><thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th></tr></thead><tbody>{selectedOptions.map((option, index) => (<tr key={index}><td>{index + 1}</td><td>{indentData.division}</td><td>{indentData.subDivision}</td><td>{option.name}</td></tr>))}</tbody></Table>
                <p>Kindly process and arrange for handover of physical consumer records of above mentioned location.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};

// --- Template 2: Officer Approval/Manager Acknowledge (Used for Approved, Acknowledged, and Resubmitted status) (unchanged) ---
const renderAcknowledgementTemplate = (ackData) => {
    if (!ackData) return null;
    const selectedOptionsWithQuantity = ackData.selectedOptions || [];
    const isApprovedStatus = ackData.status === 'Approved';
    const isResubmittedStatus = ackData.status === 'Resubmitted';
    
    let titleText = 'Acknowledgement of Physical Records';
    if (isApprovedStatus) titleText = 'Confirmation of Records for Manager Review (Officer Approved)';
    if (isResubmittedStatus) titleText = 'RESUBMITTED: Records Awaiting Correction';
    
    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><strong>Indent No.:</strong> {ackData.indentNumber}</div><div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {ackData.date}</div><div><strong>Time:</strong> {ackData.time}</div></div></div>
                <div><p>To,</p><p>The Project Manager</p><p>Vishvin Technologies</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: {titleText} for {ackData.selectedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                
                {isResubmittedStatus && ackData.managerComment && (
                    <div className="alert alert-primary mb-3 p-2 border border-primary">
                        <strong>Manager's Comment:</strong> {ackData.managerComment}
                    </div>
                )}

                <div><p>Dear Sir/Madam,</p><p>This is to acknowledge the receipt of the physical consumer records with reference to the above DWA no and subject for the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4">
                    <thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th><th>Quantity Received</th></tr></thead>
                    <tbody>
                        {selectedOptionsWithQuantity.map((option, index) => (
                            <tr key={index}><td>{index + 1}</td><td>{ackData.division}</td><td>{ackData.subDivision}</td><td>{option.name}</td><td>{option.quantity}</td></tr>
                        ))}
                    </tbody>
                </Table>
                <p>The handover of the physical consumer records for the above mentioned locations has been processed.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};


const ManagerApprovalView = () => {
    document.title = `Manager Review | DMS`;

    const [indents, setIndents] = useState(mockIndents);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndent, setSelectedIndent] = useState(null);

    const [viewStatus, setViewStatus] = useState('approved'); 

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false); 

    // Data and Form States
    const [filteredIndents, setFilteredIndents] = useState(mockIndents);
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [resubmitComment, setResubmitComment] = useState('');
    const [formError, setFormError] = useState('');
    const [sectionQuantities, setSectionQuantities] = useState([]);
    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });
    
    // Table States
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- Column Definition (unchanged) ---
    const columns = useMemo(() => [
        { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
        { header: 'Status', accessorKey: 'status', sortable: true },
        { header: 'Created by', accessorKey: 'createdBy', sortable: true },
        { header: 'Created on', accessorKey: 'createdOn', sortable: true },
        { header: 'View Indent', accessorKey: 'action', sortable: false },
    ], []);

    // --- Core Filtering Logic (unchanged) ---
    useEffect(() => {
        let results = indents;

        if (viewStatus === 'to_approve') { 
            results = results.filter(indent => indent.status === 'To Be Approved');
        } else if (viewStatus === 'approved') { 
            results = results.filter(indent => indent.status === 'Approved');
        } else if (viewStatus === 'rejected') {
            results = results.filter(indent => indent.status === 'Rejected');
        } else if (viewStatus === 'acknowledged') {
            results = results.filter(indent => indent.status === 'Acknowledged');
        } else if (viewStatus === 'resubmitted') { 
             results = results.filter(indent => indent.status === 'Resubmitted');
        }

        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredIndents(results);
        setSortConfig({ key: null, direction: null });
        setPage(0);
    }, [searchTerm, indents, viewStatus]);


    // --- MODAL TOGGLES (unchanged) ---
    const toggleViewModal = () => setIsViewModalOpen(!isViewModalOpen);
    const toggleRejectModal = () => setIsRejectModalOpen(!isRejectModalOpen);
    const toggleQuantityModal = () => setIsQuantityModalOpen(!isQuantityModalOpen);
    const toggleAcknowledgementModal = () => setIsAcknowledgementModalOpen(!isAcknowledgementModalOpen);
    const toggleResponseModal = () => setIsResponseModalOpen(!isResponseModalOpen);
    const toggleResubmitModal = () => setIsResubmitModalOpen(!isResubmitModalOpen);

    const handleViewClick = (indent) => {
        setSelectedIndent(indent);
        toggleViewModal();
    };

    // --- HELPER FUNCTIONS (unchanged) ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success'; // Ready for Manager Acknowledge
            case 'Acknowledged': return 'info'; // Final Status
            case 'Rejected': return 'danger';
            case 'To Be Approved': return 'warning'; // Pending at Officer
            case 'Resubmitted': return 'primary'; // Back to Officer
            default: return 'secondary';
        }
    };

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

    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, page, pageSize]);

    // --- ACTION HANDLERS ---
    
    // Handler for Acknowledge button
    const handleOpenAcknowledge = () => {
        if (!selectedIndent || selectedIndent.status !== 'Approved') return;
        
        // **MODIFIED: DO NOT PRE-POPULATE QUANTITY**
        const initialQuantities = selectedIndent.selectedOptions.map(option => ({
            ...option,
            quantity: '' // Set to empty string
        }));
        
        setSectionQuantities(initialQuantities);
        setFormError('');
        toggleViewModal();
        toggleQuantityModal();
    };
    
    // Handler for Resubmit button
    const handleOpenResubmit = () => {
        if (!selectedIndent || selectedIndent.status !== 'Approved') return;

        // Populate initial quantities from the *officer's* confirmed quantities, but set to string for user input
        // The instruction was to set to empty string, but for resubmit, setting it to the *officer's value* is a common UX pattern,
        // allowing the manager to correct a single field. Sticking to the prompt's `''` for now, but will show officer's value.
        const initialQuantities = selectedIndent.selectedOptions.map(option => ({
            ...option,
            quantity: '' // Set to empty string, manager must input the quantity they received/are resubmitting with
        }));
        
        setSectionQuantities(initialQuantities);
        setResubmitComment('');
        setFormError('');
        toggleViewModal();
        toggleResubmitModal();
    };

    const handleResubmitSubmit = () => {
        // 1. Validate Comment
        if (!resubmitComment.trim()) {
            setFormError('Resubmit comment is required.');
            return;
        }

        // 2. Validate Quantities
        let invalidQuantity = false;
        let difference = 0;
        
        const updatedOptions = sectionQuantities.map(item => {
            const managerQuantity = parseInt(item.quantity, 10);
            const officerQuantity = selectedIndent.selectedOptions.find(opt => opt.code === item.code)?.quantity || 0;
            
            // Check for invalid input (empty, non-number, or negative)
            if (item.quantity === '' || item.quantity === null || managerQuantity < 0 || isNaN(managerQuantity)) {
                invalidQuantity = true;
            }
            
            // Calculate the difference if the manager's quantity is greater
            if (managerQuantity > officerQuantity) {
                difference += (managerQuantity - officerQuantity);
            }

            return {
                name: item.name,
                code: item.code,
                quantity: managerQuantity
            };
        });

        if (invalidQuantity) {
            setFormError('All quantities must be entered and be non-negative integers.');
            return;
        }
        
        // If there's a difference, show a warning and allow submission
        if (difference > 0) {
            const message = `Warning: The total quantity you entered is ${difference} more than the officer's confirmed amount. Are you sure you want to resubmit?`;
            setFormError(message);
        }
        
        // 3. Update status and data (This runs even if there's a warning)
        setIndents(prev => prev.map(indent => 
            indent.indentNumber === selectedIndent.indentNumber ? { 
                ...indent, 
                status: 'Resubmitted', 
                managerComment: resubmitComment,
                selectedOptions: updatedOptions
            } : indent
        ));

        // 4. Update the response modal content based on the difference
        let message = `Indent ${selectedIndent.indentNumber} has been sent back to the officer for review with your corrections.`;
        let isSuccess = true;

        if (difference > 0) {
            message = `Warning: The total quantity you entered is ${difference} more than the officer's confirmed amount. This indent has been resubmitted for correction, but please ensure this is a valid discrepancy.`;
            isSuccess = false; // Show a warning/error icon
        }

        setResponseModalContent({
            title: 'Resubmitted',
            message: message,
            isSuccess: isSuccess
        });
        
        toggleResubmitModal();
        toggleResponseModal();
    }; 

    // --- REJECT HANDLERS (unchanged) ---
    const handleOpenReject = () => {
        setRejectionReason('');
        setFormError('');
        toggleViewModal();
        toggleRejectModal();
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            setFormError('Rejection reason is required.');
            return;
        }

        setIndents(prev => prev.map(indent => 
            indent.indentNumber === selectedIndent.indentNumber ? { ...indent, status: 'Rejected' } : indent
        ));

        setResponseModalContent({
            title: 'Rejected',
            message: `Indent ${selectedIndent.indentNumber} has been permanently rejected.`,
            isSuccess: false
        });
        toggleRejectModal();
        toggleResponseModal();
    };

    // --- ACKNOWLEDGE HANDLERS (unchanged) ---
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
            status: 'Acknowledged', // Ensure the preview shows the final state
            selectedOptions: sectionQuantities.map(item => ({
                name: item.name,
                code: item.code,
                quantity: parseInt(item.quantity, 10)
            }))
        };
        
        setAcknowledgementData(ackData);
        toggleQuantityModal();
        toggleAcknowledgementModal();
    };
    
    const handleAcknowledgeFinalSubmit = () => {
        setIndents(prev => prev.map(indent =>
            indent.indentNumber === acknowledgementData.indentNumber ? { 
                ...indent, 
                status: 'Acknowledged', 
                selectedOptions: acknowledgementData.selectedOptions 
            } : indent
        ));

        setResponseModalContent({
            title: 'Acknowledgement Success!',
            message: `Final records for Indent ${acknowledgementData.indentNumber} have been successfully acknowledged.`,
            isSuccess: true
        });
        toggleAcknowledgementModal();
        toggleResponseModal();
    };
    
    const handleSectionQuantityChange = (code, value) => {
        // Allow empty string or non-negative integer input
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setSectionQuantities(prev => prev.map(item =>
                (item.code === code) ? { ...item, quantity: value } : item
            ));
            setFormError(''); // Clear error on change
        }
    };

    // --- RENDER FUNCTIONS (Table and Pagination - largely unchanged) ---
    
    const renderTableHeader = () => (
        <tr>
            {columns.map((col) => {
                if (!col.sortable) { return <th key={col.accessorKey} className="text-center">{col.header}</th>; }
                const isActive = sortConfig.key === col.accessorKey && sortConfig.direction !== null;
                return (
                    <th key={col.accessorKey} onClick={() => {
                        if (sortConfig.key !== col.accessorKey) { setSortConfig({ key: col.accessorKey, direction: 'asc' }); }
                        else if (sortConfig.direction === 'asc') { setSortConfig({ key: col.accessorKey, direction: 'desc' }); }
                        else { setSortConfig({ key: null, direction: null }); }
                        setPage(0);
                    }} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }} >
                        {col.header}
                        <SortArrows active={isActive} direction={sortConfig.direction || 'asc'} />
                    </th>
                );
            })}
        </tr>
    );

    const renderTableRows = () => {
        if (!paginatedData || paginatedData.length === 0) {
            return (<tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>No Indents Found</td></tr>);
        }
        return paginatedData.map((indent) => (
            <tr key={indent.indentNumber}>
                <td>{indent.indentNumber}</td>
                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                <td>{indent.createdBy}</td>
                <td>{new Date(indent.createdOn).toLocaleString()}</td>
                <td className="text-center">
                    <Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button>
                </td>
            </tr>
        ));
    };

    const renderPagination = () => {
        const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
        const pageSizeOptions = [{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 25, label: '25' }, { value: -1, label: 'All' }];
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
                        {pageSize !== -1 && Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
                            let pageNum = i;
                            if (pageCount > 5) {
                                if (page >= 2 && page < pageCount - 2) { pageNum = page - 2 + i; }
                                else if (page >= pageCount - 2) { pageNum = pageCount - 5 + i; }
                            }
                            if (pageNum >= 0 && pageNum < pageCount) {
                                return (<button key={pageNum} type="button" className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`} onClick={() => setPage(pageNum)} disabled={page === pageNum} >{pageNum + 1}</button>);
                            } else { return null; }
                        })}
                        <button type="button" className="btn btn-light" disabled={(page >= pageCount - 1 || pageCount === 0) || pageSize === -1} onClick={() => setPage(Math.min(page + 1, pageCount - 1))} >Next</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-content">
            <style>{`
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
                    <CardHeader className="bg-primary text-white p-3"><h5 className="mb-0 text-white">Internal Indent Review</h5></CardHeader>
                    <CardBody>
                        <Row className="g-4 mb-3 align-items-center">
                            <Col sm={12}>
                                {/* --- Filter Buttons (Manager's View) --- */}
                                <div className="filter-button-group d-flex flex-wrap gap-2">
                                    <Button 
                                        color={viewStatus === 'approved' ? 'success' : 'light'} 
                                        onClick={() => setViewStatus('approved')}>
                                        Acknowledge Queue ({indents.filter(i => i.status === 'Approved').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'acknowledged' ? 'info' : 'light'} 
                                        onClick={() => setViewStatus('acknowledged')}>
                                        Acknowledged ({indents.filter(i => i.status === 'Acknowledged').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'resubmitted' ? 'primary' : 'light'} 
                                        onClick={() => setViewStatus('resubmitted')}>
                                        Resubmitted to Officer ({indents.filter(i => i.status === 'Resubmitted').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'to_approve' ? 'warning' : 'light'} 
                                        onClick={() => setViewStatus('to_approve')}>
                                        Pending Officer Approval ({indents.filter(i => i.status === 'To Be Approved').length})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'rejected' ? 'danger' : 'light'} 
                                        onClick={() => setViewStatus('rejected')}>
                                        Rejected ({indents.filter(i => i.status === 'Rejected').length})
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col sm={4}>
                                <div className="search-box">
                                    <Input type="text" className="form-control" placeholder="Search by Indent # or Creator..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

                {/* 1. View Indent Modal (unchanged) */}
                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.indentNumber} ({selectedIndent.status})</ModalHeader>
                        <ModalBody className="scrollable-modal-body">
                            {/* Logic: If officer has done their part (Approved, Acknowledged, or Resubmitted), show the acknowledgement document template. Otherwise, show the original request. */}
                            {['Approved', 'Acknowledged', 'Resubmitted'].includes(selectedIndent.status) ? 
                                renderAcknowledgementTemplate(selectedIndent) : 
                                renderIndentTemplate(selectedIndent)
                            }
                        </ModalBody>
                        <ModalFooter className="d-flex justify-content-between">
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                            
                            {/* ACTIONS: Manager acts on 'Approved' indents */}
                            {selectedIndent.status === 'Approved' && (
                                <div>
                                    <Button color="primary" className="me-2" onClick={handleOpenResubmit}>Resubmit (Correct Qty & Comment)</Button>
                                    <Button color="info" onClick={handleOpenAcknowledge}>Acknowledge Records</Button> 
                                </div>
                            )}
                            
                            {/* Manager can reject indents still pending at officer level (early rejection) */}
                            {selectedIndent.status === 'To Be Approved' && (
                                <div>
                                    <Button color="danger" onClick={handleOpenReject}>Reject</Button>
                                </div>
                            )}

                            {/* Status display for final/intermediate states */}
                            {['Rejected', 'Acknowledged', 'Resubmitted'].includes(selectedIndent.status) && (
                                <span className={`text-${getStatusColor(selectedIndent.status)} fw-bold`}>Status: {selectedIndent.status}</span>
                            )}
                            
                        </ModalFooter>
                    </Modal>
                )}
                
                {/* 2. Resubmit Modal (MODIFIED: Quantity Table & Submit Logic) */}
                <Modal isOpen={isResubmitModalOpen} toggle={toggleResubmitModal} centered size="lg">
                    <ModalHeader toggle={toggleResubmitModal}>Resubmit Indent: {selectedIndent?.indentNumber}</ModalHeader>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <h5>Confirm Received Quantities (Correction/Record)</h5>
                                <p className="text-muted small">Enter the correct quantity of physical records *received* for this resubmission.</p>
                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <Table bordered size="sm">
                                        <thead>
                                            <tr>
                                                <th>Location</th>
                                                <th>Officer Confirmed Qty</th>
                                                <th>Quantity Received (Correction) <span className="text-danger">*</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedIndent && sectionQuantities.map((item) => {
                                                const officerQty = selectedIndent.selectedOptions.find(opt => opt.code === item.code)?.quantity || '0';
                                                return (
                                                <tr key={item.code}>
                                                    <td>{item.name}</td>
                                                    {/* Display Officer's confirmed quantity */}
                                                    <td><span className="fw-bold text-success">{officerQty}</span></td>
                                                    <td>
                                                        <Input 
                                                            type="number" 
                                                            min="0" 
                                                            value={item.quantity} 
                                                            onChange={(e) => handleSectionQuantityChange(item.code, e.target.value)} 
                                                            style={{ width: '100px' }}
                                                        />
                                                    </td>
                                                </tr>
                                            )})}
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                            <Col md={12}>
                                <FormGroup>
                                    <Label htmlFor="resubmitComment">Reason for Resubmission <span className="text-danger">*</span></Label>
                                    <Input 
                                        type="textarea" 
                                        id="resubmitComment" 
                                        rows="3" 
                                        value={resubmitComment} 
                                        onChange={(e) => { setResubmitComment(e.target.value); setFormError(''); }} 
                                        placeholder="Explain why the officer needs to correct the submission." 
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        {formError && <p className="text-danger mt-2">{formError}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleResubmitModal}>Cancel</Button>
                        <Button color="primary" onClick={handleResubmitSubmit}>Confirm Resubmit</Button>
                    </ModalFooter>
                </Modal>

                {/* 3. Reject Indent Modal (unchanged) */}
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
                
                {/* 4. Quantity Entry Modal (Manager's Final Check before Acknowledge) (unchanged) */}
                <Modal isOpen={isQuantityModalOpen} toggle={toggleQuantityModal} centered>
                    <ModalHeader toggle={toggleQuantityModal}>
                        Confirm Quantities for Final Acknowledgment: {selectedIndent?.indentNumber}
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-muted small">Final check: Enter the quantity of physical records *received* for each listed location. The quantity confirmed by the officer is shown for comparison.</p>
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Table bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>Officer Confirmed Qty</th>
                                        <th>Quantity Received (Final) <span className="text-danger">*</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedIndent && sectionQuantities.map((item) => (
                                        <tr key={item.code}>
                                            <td>{item.name}</td>
                                            {/* Show the quantity submitted by the officer for comparison */}
                                            <td><span className="fw-bold text-success">{selectedIndent.selectedOptions.find(opt => opt.code === item.code)?.quantity || '0'}</span></td>
                                            <td>
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleSectionQuantityChange(item.code, e.target.value)} 
                                                    style={{ width: '100px' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        {formError && <p className="text-danger mt-2">{formError}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleQuantityModal}>Cancel</Button>
                        <Button color="info" onClick={handleQuantitySubmit}>Next: Acknowledge Preview</Button>
                    </ModalFooter>
                </Modal>

                {/* 5. Acknowledgement Preview Modal (unchanged) */}
                {acknowledgementData && (
                    <Modal isOpen={isAcknowledgementModalOpen} toggle={toggleAcknowledgementModal} centered size="lg">
                        <ModalHeader toggle={toggleAcknowledgementModal}>Final Acknowledgment Preview: {acknowledgementData.indentNumber}</ModalHeader>
                        <ModalBody className="scrollable-modal-body">{renderAcknowledgementTemplate(acknowledgementData)}</ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleAcknowledgementModal}>Cancel</Button>
                            <Button color="info" onClick={handleAcknowledgeFinalSubmit}>Confirm Final Acknowledgment</Button>
                        </ModalFooter>
                    </Modal>
                )}

                {/* 6. Final Response Modal (unchanged) */}
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

export default ManagerApprovalView;
