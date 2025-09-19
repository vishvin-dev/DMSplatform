import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg';

// --- Helper component for Sort Arrows ---
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

// --- Mock Data ---
const mockIndents = [
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/001', createdBy: 'John Doe', createdOn: '2025-09-09T10:30:00Z', date: '09/09/2025', time: '10:30:00 AM', division: 'City Division', subDivision: 'Central Sub-Division', section: 'Main Street Section', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Section A', selectedOptions: [{ name: 'Section A', code: 'SEC-A' }] },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/002', createdBy: 'Jane Smith', createdOn: '2025-09-08T15:45:12Z', date: '08/09/2025', time: '03:45:12 PM', division: 'Rural Division', subDivision: 'West Sub-Division', section: 'Westside Section', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'West Sub-Division / East Sub-Division', selectedOptions: [{ name: 'West Sub-Division', code: 'W-SD' }, { name: 'East Sub-Division', code: 'E-SD' }] },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/003', createdBy: 'Peter Jones', createdOn: '2025-09-07T11:00:00Z', date: '07/09/2025', time: '11:00:00 AM', division: 'City Division', subDivision: 'North Sub-Division', section: 'North Section', submitTo: 'section', sectionCode: 'N-SEC', selectedOptionNames: 'North Section', selectedOptions: [{ name: 'North Section', code: 'N-SEC' }] },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/004', createdBy: 'Mary Williams', createdOn: '2025-09-10T09:20:00Z', date: '10/09/2025', time: '09:20:00 AM', division: 'Metro Division', subDivision: 'East Sub-Division', section: 'Downtown Section', submitTo: 'subdivision', subDivisionCode: 'E-SD', selectedOptionNames: 'Downtown Section / Uptown Section', selectedOptions: [{ name: 'Downtown Section', code: 'DT-SEC' }, { name: 'Uptown Section', code: 'UT-SEC' }] },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/005', createdBy: 'David Brown', createdOn: '2025-09-06T18:05:00Z', date: '06/09/2025', time: '06:05:00 PM', division: 'Rural Division', subDivision: 'South Sub-Division', section: 'South Section', submitTo: 'division', divisionCode: 'RRL-DIV', selectedOptionNames: 'South Sub-Division', selectedOptions: [{ name: 'South Sub-Division', code: 'S-SD' }] },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/006', createdBy: 'Susan Miller', createdOn: '2025-09-05T14:30:00Z', date: '05/09/2025', time: '02:30:00 PM', division: 'City Division', subDivision: 'Central Sub-Division', section: 'Park Avenue Section', submitTo: 'subdivision', subDivisionCode: 'CEN-SD', selectedOptionNames: 'Park Avenue Section', selectedOptions: [{ name: 'Park Avenue Section', code: 'PA-SEC' }] },
];
// --- End of Mock Data ---

// --- Template for the initial Indent ---
const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const submitTo = indentData.submitTo || '';
    const selectedOptions = indentData.selectedOptions || [];
    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><strong>Indent No.:</strong> {indentData.indentNumber}</div><div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {indentData.date}</div><div><strong>Time:</strong> {indentData.time}</div></div></div>
                <div><p>To,</p><p>The {submitTo.charAt(0).toUpperCase() + submitTo.slice(1)} Officer</p><p>{submitTo === 'division' ? indentData.divisionCode : submitTo === 'subdivision' ? indentData.subDivisionCode : indentData.sectionCode}</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Request for physical records of Gescom Consumer of {indentData.selectedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>With reference to the above DWA no and subject, we request for the physical available consumer records of the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4"><thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th></tr></thead><tbody>{selectedOptions.map((option, index) => (<tr key={index}><td>{index + 1}</td><td>{indentData.division}</td><td>{indentData.subDivision}</td><td>{option.name}</td></tr>))}</tbody></Table>
                <p>Kindly process and arrange for handover of physical consumer records of above mentioned location.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};

// --- Template for the Acknowledgement ---
const renderAcknowledgementTemplate = (ackData) => {
    if (!ackData) return null;
    const selectedOptions = ackData.selectedOptions || [];
    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><strong>Indent No.:</strong> {ackData.indentNumber}</div><div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {ackData.date}</div><div><strong>Time:</strong> {ackData.time}</div></div></div>
                <div><p>To,</p><p>The Project Manager</p><p>Vishvin Technologies</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Acknowledgement of Physical Records for {ackData.selectedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>This is to acknowledge the receipt of the physical consumer records with reference to the above DWA no and subject for the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4">
                    <thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th><th>Quantity</th></tr></thead>
                    <tbody>
                        {selectedOptions.map((option, index) => (
                            <tr key={index}><td>{index + 1}</td><td>{ackData.division}</td><td>{ackData.subDivision}</td><td>{option.name}</td><td>{ackData.quantity}</td></tr>
                        ))}
                    </tbody>
                </Table>
                <p>The handover of the physical consumer records for the above mentioned locations has been processed.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};


const ViewIndent = () => {
    document.title = `View Indent | DMS`;

    const [indents, setIndents] = useState(mockIndents);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredIndents, setFilteredIndents] = useState(mockIndents);
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [actionType, setActionType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [formError, setFormError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- NEW: State for the final response modal ---
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });

    useEffect(() => {
        let results = indents;
        if (searchTerm.trim() !== '') {
            results = indents.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredIndents(results);
        setSortConfig({ key: null, direction: null });
        setPage(0);
    }, [searchTerm, indents]);

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

    const columns = useMemo(() => [
        { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
        { header: 'Created by', accessorKey: 'createdBy', sortable: true },
        { header: 'Created on', accessorKey: 'createdOn', sortable: true },
        { header: 'View Indent', accessorKey: 'action', sortable: false },
    ], []);

    const toggleViewModal = () => setIsViewModalOpen(!isViewModalOpen);
    const toggleActionModal = () => setIsActionModalOpen(!isActionModalOpen);
    const toggleAcknowledgementModal = () => setIsAcknowledgementModalOpen(!isAcknowledgementModalOpen);
    const toggleResponseModal = () => setIsResponseModalOpen(!isResponseModalOpen);

    const handleViewClick = (indent) => {
        setSelectedIndent(indent);
        toggleViewModal();
    };

    const handleOpenActionModal = (type) => {
        setActionType(type);
        setQuantity('');
        setRejectionReason('');
        setFormError('');
        toggleActionModal();
    };

    const handleActionSubmit = () => {
        if (actionType === 'approve') {
            if (!quantity) { setFormError('Quantity is required.'); return; }
            const ackData = { ...selectedIndent, quantity };
            setAcknowledgementData(ackData);
            toggleActionModal();
            toggleViewModal();
            toggleAcknowledgementModal();
        } else if (actionType === 'reject') {
            if (!rejectionReason) { setFormError('Rejection reason is required.'); return; }
            setResponseModalContent({
                title: 'Rejected',
                message: `Indent ${selectedIndent.indentNumber} has been rejected.`,
                isSuccess: false
            });
            toggleActionModal();
            toggleViewModal();
            toggleResponseModal();
        }
    };

    // --- NEW: Handler for submitting the acknowledgement ---
    const handleSubmitAcknowledgement = () => {
        console.log("Submitting Acknowledgement:", acknowledgementData);
        // Simulate API call success
        setResponseModalContent({
            title: 'Success!',
            message: `Acknowledgement for ${acknowledgementData.indentNumber} has been submitted successfully.`,
            isSuccess: true
        });
        toggleAcknowledgementModal();
        toggleResponseModal();
    };

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
                <td>{indent.createdBy}</td>
                <td>{new Date(indent.createdOn).toLocaleString()}</td>
                <td className="text-center"><Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button></td>
            </tr>
        ));
    };

    const renderPagination = () => {
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
            `}</style>
            <Container fluid>
                <Card>
                    <CardHeader className="bg-primary text-white p-3"><h5 className="mb-0 text-white">View Indent</h5></CardHeader>
                    <CardBody>
                        <Row className="g-4 mb-3"><Col sm={4}>
                            <div className="search-box">
                                <Input type="text" className="form-control" placeholder="Search for indents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <i className="ri-search-line search-icon"></i>
                            </div>
                        </Col></Row>
                        <div className="table-responsive">
                            <table className="table grid-table table-hover table-nowrap align-middle mb-0">
                                <thead className="table-light">{renderTableHeader()}</thead>
                                <tbody>{renderTableRows()}</tbody>
                            </table>
                        </div>
                        {renderPagination()}
                    </CardBody>
                </Card>

                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.indentNumber}</ModalHeader>
                        <ModalBody className="scrollable-modal-body">{renderIndentTemplate(selectedIndent)}</ModalBody>
                        <ModalFooter className="d-flex justify-content-between">
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                            <div>
                                <Button color="danger" className="me-2" onClick={() => handleOpenActionModal('reject')}>Reject</Button>
                                <Button color="success" onClick={() => handleOpenActionModal('approve')}>Approve</Button>
                            </div>
                        </ModalFooter>
                    </Modal>
                )}

                <Modal isOpen={isActionModalOpen} toggle={toggleActionModal} centered>
                    <ModalHeader toggle={toggleActionModal}>{actionType === 'approve' ? 'Approve Indent' : 'Reject Indent'}</ModalHeader>
                    <ModalBody>
                        {actionType === 'approve' && <FormGroup><Label htmlFor="quantity">Quantity <span className="text-danger">*</span></Label><Input type="number" id="quantity" value={quantity} onChange={(e) => { setQuantity(e.target.value); setFormError(''); }} placeholder="e.g., 150" /></FormGroup>}
                        {actionType === 'reject' && <FormGroup><Label htmlFor="rejectionReason">Rejection Reason <span className="text-danger">*</span></Label><Input type="textarea" id="rejectionReason" rows="3" value={rejectionReason} onChange={(e) => { setRejectionReason(e.target.value); setFormError(''); }} placeholder="Provide a clear reason" /></FormGroup>}
                        {formError && <p className="text-danger mt-2">{formError}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleActionModal}>Cancel</Button>
                        <Button color="primary" onClick={handleActionSubmit}>Submit</Button>
                    </ModalFooter>
                </Modal>

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

                {/* --- NEW: Final Response Modal --- */}
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