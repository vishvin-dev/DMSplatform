import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Alert, Spinner
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg';
// Assuming 'postcreateindent' is available and correctly imported
import { postcreateindent } from '../../helpers/fakebackend_helper'; 

// --- Initial Data (Empty) ---
const initialIndents = [];
// --- End of Initial Data ---

// Function to replace '/' with ' and ' for display
const formatSelectedOptions = (names) => {
    if (!names) return '';
    // Use regex to replace ',' with ' and ' (assuming the API returns comma-separated names)
    return names.replace(/,/g, ' and ').replace(/\s\s\/\s\s/g, ' and ');
};

// --- API Data Fetching Logic (Flag ID 4 - Read) ---
const fetchIndentsFromAPI = async (viewStatus, userId, roleId, requestUserName, setIndents, setIsLoading, setError) => {
    setIsLoading(true);
    setError(null); 
    setIndents([]);

    const flagId = 4;

    // Payload for Flag ID 4 (Read)
    const payload = {
        "flagId": flagId, 
        "Role_Id": roleId,
        "RequestUserName": requestUserName,
    };

    try {
        const response = await postcreateindent(payload);

        if (response && response.status === 'success' && response.result) {
            const apiData = Array.isArray(response.result) ? response.result : [];

            const mappedData = apiData.map(item => {
                const createdDate = new Date(item.CreatedOn);
                let selectedOptions = [];
                let selectedOptionNames = 'N/A';

                // --- CRITICAL FIX: Use item.div_codes as the source for divisionCode ---
                let divisionName = item.division_names || null;
                let subDivisionName = item.subdivision_names || null;
                let divisionCode = item.div_codes || null; // <--- FIX APPLIED HERE
                let subDivisionCode = item.sd_codes || null;
                let sectionCodeList = item.so_codes || '';
                let sectionNameList = item.section_names || '';
                let totalQty = item.TotalQty || 0;

                const statusMap = {
                    1: 'To Be Approved',
                    4: 'Returned for Revision',
                    2: 'Approved',
                    3: 'Rejected'
                };
                const statusFromApi = item.StatusName || statusMap[item.Status_Id] || 'To Be Approved';
                
                // Capturing Creator ID (e.g., 'CreatedByIndent' value)
                const indentCreatorId = item.CreatedByIndent || item.CreatedByUser_Id || item.CreatedByUserId || item.Created_By_User_Id || item.Indent_Id || null;


                // --- CORE LOGIC: Parsing Multiple Locations ---
                if (sectionNameList) {
                    const sectionNames = sectionNameList.split(',').map(s => s.trim()).filter(s => s);
                    const sectionCodes = sectionCodeList.split(',').map(s => s.trim()).filter(s => s);

                    selectedOptions = sectionNames.map((name, index) => ({
                        name: name,
                        code: sectionCodes[index] || null,
                        quantity: 0, 
                    }));
                    selectedOptionNames = sectionNames.join(' / ');

                } else if (item.locations && item.locations.length > 0) {
                    selectedOptions = item.locations.map(loc => ({
                        ...loc,
                        quantity: parseInt(loc.quantity, 10) || 0
                    }));
                    selectedOptionNames = selectedOptions.map(loc => loc.name).join(' / ');
                } else {
                    selectedOptions = [
                        { name: subDivisionName, code: subDivisionCode, quantity: totalQty }
                    ];
                    selectedOptionNames = subDivisionName;
                }
                // -----------------------------------------------------------------

                return ({
                    indentNumber: item.Indent_Id, 
                    displayIndentNo: item.fullIndentNo || item.Indent_No || item.Indent_Id, 
                    createdBy: item.RequestUserName || item.FirstName + ' ' + item.LastName,
                    createdOn: item.CreatedOn,
                    date: createdDate.toLocaleDateString('en-GB'),
                    time: createdDate.toLocaleTimeString('en-US', { hour12: true }),
                    division: divisionName,
                    subDivision: subDivisionName,
                    submitTo: (item.submitTo || '').toLowerCase().includes('division') ? 'division' : 'subdivision',
                    divisionCode: divisionCode, // Now uses item.div_codes
                    subDivisionCode: subDivisionCode,
                    sectionCode: sectionCodeList,
                    selectedOptionNames: selectedOptionNames,
                    selectedOptions: selectedOptions,
                    status: statusFromApi,
                    rejectionReason: item.RejectionReason || null,
                    createdByUserId: indentCreatorId 
                });
            });

            let finalResults = mappedData;
            if (viewStatus !== 'all') {
                const targetStatus = {
                    'to_approve': 'To Be Approved',
                    'returned_for_revision': 'Returned for Revision',
                    'approved': 'Approved',
                    'rejected': 'Rejected'
                }[viewStatus];
                finalResults = mappedData.filter(indent => indent.status === targetStatus);
            }

            setIndents(finalResults);
        } else if (response && response.status === 'success' && response.count === 0) {
             setIndents([]);
             setError(null);
        } else {
            setError(response.message || `Failed to fetch indents. Response status: ${response.status || 'Unknown'}`);
        }
    } catch (err) {
        console.error("API Fetch Error:", err);
        setError('An error occurred while connecting to the server. Please check the network and API endpoint.');
    } finally {
        setIsLoading(false);
    }
};

// --- Templates (Unchanged) ---
const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const submitTo = indentData.submitTo || '';
    const selectedOptions = indentData.selectedOptions || [];
    const isReturned = indentData.status === 'Returned for Revision';
    
    const getToCode = () => {
        if (submitTo === 'division') return indentData.divisionCode || 'N/A'; 
        if (submitTo === 'subdivision') return indentData.subDivisionCode || 'N/A';
        return indentData.subDivisionCode || 'N/A'; 
    };
    const formattedOptionNames = formatSelectedOptions(indentData.selectedOptionNames);

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {indentData.displayIndentNo}</div>
                    <div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {indentData.date}</div><div><strong>Time:</strong> {indentData.time}</div></div>
                </div>
                
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

const renderAcknowledgementTemplate = (ackData) => {
    if (!ackData) return null;
    const selectedOptionsWithQuantity = ackData.selectedOptions || [];
    const formattedOptionNames = formatSelectedOptions(ackData.selectedOptionNames);

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {ackData.displayIndentNo}</div>
                    <div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {ackData.date}</div><div><strong>Time:</strong> {ackData.time}</div></div>
                </div>
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
// --- End of Templates ---


const ViewIndent = () => {
    document.title = `Indent Approval Queue | DMS`;

    const [indents, setIndents] = useState(initialIndents);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    
    // --- Session Data Retrieval (Ensuring null fallbacks) ---
    const [sessionData] = useState(() => {
        const defaultData = { userId: null, roleId: null, requestUserName: null };
        const storageKeys = ['loginData', 'authUser', 'user'];

        let userData = null;
        for (const key of storageKeys) {
            const dataString = sessionStorage.getItem(key);
            if (dataString) {
                try {
                    const data = JSON.parse(dataString);
                    if (data.user && data.user.Role_Id) { userData = data.user; break; } 
                    if (data.Role_Id && data.Email) { userData = data; break; }
                } catch (e) { /* silent fail on parse error */ }
            }
        }
        
        if (userData && userData.Role_Id && userData.Email) {
            return {
                userId: userData.User_Id || null, 
                roleId: userData.Role_Id || null,
                requestUserName: userData.Email || null,
            };
        }

        const fallbackRoleId = sessionStorage.getItem('Role_Id') || sessionStorage.getItem('roleId');
        const fallbackEmail = sessionStorage.getItem('Email') || sessionStorage.getItem('requestUserName');
        const fallbackUserId = sessionStorage.getItem('User_Id') || sessionStorage.getItem('userId');

        if (fallbackRoleId && fallbackEmail) {
             return { userId: fallbackUserId || null, roleId: parseInt(fallbackRoleId, 10) || null, requestUserName: fallbackEmail || null };
        }

        return defaultData; 
    });
    // --- End of Session Data Retrieval ---

    // State variables
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [viewStatus, setViewStatus] = useState('to_approve'); 

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [isPmResubmitQtyModalOpen, setIsPmResubmitQtyModalOpen] = useState(false);

    // Data and Form States
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalComments, setApprovalComments] = useState(''); 
    const [formError, setFormError] = useState('');
    const [sectionQuantities, setSectionQuantities] = useState([]);
    const [pmResubmitQuantities, setPmResubmitQuantities] = useState([]); 
    const [resubmitFormError, setResubmitFormError] = useState('');
    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });
    
    // Table States
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- API Data Fetching Effect (Hits API on Mount and Status Change) ---
    useEffect(() => {
        if (sessionData.roleId && sessionData.requestUserName) {
            setFetchError(null); 
            setPage(0); 
            fetchIndentsFromAPI(
                viewStatus, 
                sessionData.userId, 
                sessionData.roleId, 
                sessionData.requestUserName, 
                setIndents, 
                setIsLoading, 
                setFetchError
            );
        } else if (!fetchError) {
             setFetchError("Authentication error: Missing user session data (Role ID or Username). Please ensure you are logged in.");
             setIsLoading(false);
             setIndents([]);
        }
    }, [viewStatus, sessionData.roleId, sessionData.requestUserName, sessionData.userId]);

    // --- Core Filtering Logic ---
    const filteredIndents = useMemo(() => {
        let results = indents;

        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.displayIndentNo || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
                (indent.selectedOptionNames || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return results;
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
    
    // --- PM Resubmit Actions (Simulation - Unchanged) ---
    const handleOpenPmResubmit = (indent) => {
        setSelectedIndent(indent);
        const initialQuantities = indent.selectedOptions.map(option => ({ 
            code: option.code, 
            name: option.name, 
            quantity: option.quantity !== undefined && option.quantity !== null ? option.quantity.toString() : '' 
        }));
        setPmResubmitQuantities(initialQuantities);
        setResubmitFormError('');
        togglePmResubmitQtyModal();
    };

    const handlePmResubmitQuantityChange = (code, value) => {
        const validatedValue = value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0) ? value : '';
        setPmResubmitQuantities(prev => prev.map(item => (item.code === code) ? { ...item, quantity: validatedValue } : item));
        setResubmitFormError('');
    };

    const handlePmResubmitSubmit = async () => {
        const invalidQuantity = pmResubmitQuantities.some(item => item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity)));
        if (invalidQuantity) { setResubmitFormError('All quantities must be entered and be non-negative integers before resubmitting.'); return; }
        
        const updatedSelectedOptions = selectedIndent.selectedOptions.map(original => { 
            const correctedItem = pmResubmitQuantities.find(q => q.code === original.code); 
            return { 
                ...original, 
                quantity: correctedItem ? parseInt(correctedItem.quantity, 10) : original.quantity 
            }; 
        });

        // --- Simulated API Call for Resubmit ---
        
        setIndents(prev => prev.map(i => i.indentNumber === selectedIndent.indentNumber ? { 
            ...i, 
            status: 'To Be Approved', 
            rejectionReason: null, 
            selectedOptions: updatedSelectedOptions
        } : i));
        
        setResponseModalContent({ title: 'Resubmitted!', message: `Indent ${selectedIndent.displayIndentNo} has been corrected and resubmitted successfully for officer approval.`, isSuccess: true });
        togglePmResubmitQtyModal();
        toggleResponseModal();
        setViewStatus('to_approve'); 
        setSelectedIndent(null);
    };

    // --- Officer's Actions (Unchanged) ---
    const handleOpenApprove = (indent) => {
        setSelectedIndent(indent); 
        if (indent && indent.selectedOptions) {
            const initialQuantities = indent.selectedOptions.map(option => ({ 
                code: option.code,
                name: option.name,
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
        if (!rejectionReason.trim()) { setFormError('Rejection reason is required.'); return; }
        
        // --- Simulated API Call for Reject (Flag ID 3) ---

        setIndents(prev => prev.map(indent => indent.indentNumber === selectedIndent.indentNumber ? { ...indent, status: 'Rejected', rejectionReason: rejectionReason } : indent));
        
        setResponseModalContent({ title: 'Rejected', message: `Indent ${selectedIndent.displayIndentNo} has been rejected.`, isSuccess: false });
        toggleRejectModal();
        toggleResponseModal();
        setViewStatus('rejected'); 
    };
    
    // --- CORE INTEGRATION POINT: Officer Approval API Call (flagId: 5) ---
    const handleQuantitySubmit = async () => {
        const invalidQuantity = sectionQuantities.some(item => item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity)));
        if (invalidQuantity) { 
            setFormError('All quantities must be entered and be non-negative integers.'); 
            return; 
        }
        
        if (!selectedIndent) {
            setFormError('No indent selected for approval.');
            return;
        }

        // --- Critical Check: Ensure required session IDs exist before proceeding ---
        if (!sessionData.userId || !sessionData.roleId) {
            setFormError('Session data (User ID or Role ID) is missing. Cannot submit approval.');
            return;
        }

        setIsActionLoading(true);
        setFormError('');

        // 1. Prepare the 'sections' array, omitting fields that are null/empty/falsy
        const sectionsPayload = selectedIndent.selectedOptions.map(original => {
            const enteredItem = sectionQuantities.find(q => q.code === original.code);
            const enteredQty = enteredItem ? parseInt(enteredItem.quantity, 10) : 0;
            const finalComment = approvalComments.trim();
            
            // Base object with fields that should always be present or default to null
            const sectionObject = {
                "sd_code": selectedIndent.subDivisionCode || null,
                "so_code": original.code || null,
                "EnteredQty": enteredQty.toString(), 
            };
            
            // --- FIX: Dynamically add div_code and comment only if they are NOT null/empty ---
            if (selectedIndent.divisionCode) {
                sectionObject.div_code = selectedIndent.divisionCode; // Use value from Flag 4 response (item.div_codes)
            }
            
            if (finalComment) {
                sectionObject.comment = finalComment;
            }

            return sectionObject;
        });
        
        // 2. Construct the Final Approval Payload (Flag ID 5)
        const finalApprovalPayload = {
            "flagId": 5,
            "Indent_Id": selectedIndent.indentNumber,
            
            // *** CRITICAL FIX: Correct Casing - UploadedByUser_Id (Session User ID) ***
            "UploadedByUser_Id": sessionData.userId, 
            
            "Role_Id": sessionData.roleId,
            "Status_Id": 2, // Hardcoded Status ID for 'Approved'
            
            // *** CRITICAL FIX: Correct Casing - CreatedByUser_Id (Original Indent Creator) ***
            "CreatedByUser_Id": selectedIndent.createdByUserId, 
            
            "sections": sectionsPayload
        };

        // 3. Call the API
        try {
            const response = await postcreateindent(finalApprovalPayload);

            if (response && response.status === 'success') {
                // API call successful, proceed to Acknowledgement Preview
                
                // Prepare data for acknowledgement preview
                const ackData = { 
                    ...selectedIndent, 
                    comments: approvalComments, 
                    status: 'Approved',
                    selectedOptions: sectionsPayload.map(s => ({ 
                        name: selectedIndent.selectedOptions.find(o => o.code === s.so_code)?.name || s.so_code,
                        code: s.so_code,
                        quantity: parseInt(s.enteredQty, 10)
                    }))
                };
                setAcknowledgementData(ackData); 
                toggleQuantityModal(); 
                toggleAcknowledgementModal();
                
                // Update local state to reflect the status change
                setIndents(prev => prev.map(i => i.indentNumber === selectedIndent.indentNumber ? { 
                    ...i, 
                    status: 'Approved', 
                    selectedOptions: ackData.selectedOptions 
                } : i));


            } else {
                // API call failed but returned a non-success status
                const errorMessage = response.message || `API Approval Failed. Status: ${response.status || 'Unknown'}.`;
                setFormError(errorMessage);
                console.error("Approval API Error:", response);
            }
        } catch (err) {
            // Network or uncaught error
            console.error("API Call Error:", err);
            setFormError('An unexpected error occurred during API communication.');
        } finally {
            setIsActionLoading(false);
        }
    };
    // --- END CORE INTEGRATION POINT ---

    const handleSubmitAcknowledgement = () => {
        // This function is now purely for client-side UI transition.
        console.log("Final UI transition after successful approval API call:", acknowledgementData.displayIndentNo);
        
        setResponseModalContent({ title: 'Success!', message: `Acknowledgement for ${acknowledgementData.displayIndentNo} has been submitted successfully.`, isSuccess: true });
        toggleAcknowledgementModal(); 
        toggleResponseModal();
        setViewStatus('approved'); 
        setSelectedIndent(null);
    };
    
    // --- Helper functions for common logic ---
    const handleSectionQuantityChange = (code, value) => {
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) { setSectionQuantities(prev => prev.map(item => (item.code === code) ? { ...item, quantity: value } : item)); setFormError(''); }
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
    const columns = useMemo(() => [
        { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
        { header: 'Status', accessorKey: 'status', sortable: true }, 
        { header: 'Section/Sub-Division', accessorKey: 'selectedOptionNames', sortable: true },
        { header: 'Created on', accessorKey: 'createdOn', sortable: true },
        { header: 'View', accessorKey: 'viewAction', sortable: false }, 
        { header: 'Action', accessorKey: 'otherAction', sortable: false }, 
    ], []);

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
                        style={{ cursor: isActionOrUnsortable ? 'default' : 'pointer', userSelect: 'none', whiteSpace: 'nowrap', textAlign: (col.accessorKey === 'viewAction' || col.accessorKey === 'otherAction') ? 'center' : 'left' }} 
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
            return (<tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>No documents found in the selected queue.</td></tr>);
        }
        
        // --- DATA DISPLAY LOGIC ---
        return paginatedData.map((indent) => (
            <tr key={indent.indentNumber}>
                {/* 1. Indent number */}
                <td>{indent.displayIndentNo}</td> 
                
                {/* 2. Status */}
                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td> 
                
                {/* 3. Section/Sub-Division */}
                <td>{formatSelectedOptions(indent.selectedOptionNames)}</td> 
                
                {/* 4. Created on */}
                <td>{new Date(indent.createdOn).toLocaleString()}</td> 
                
                {/* 5. View */}
                <td style={{ textAlign: 'center' }}>
                    <Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button>
                </td>
                
                {/* 6. Action */}
                <td style={{ textAlign: 'center' }}>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                        {indent.status === 'Returned for Revision' && (
                            <Button color="success" size="sm" onClick={() => handleOpenPmResubmit(indent)}>Resubmit</Button>
                        )}
                        {indent.status === 'To Be Approved' && (<>
                            <Button color="success" size="sm" onClick={() => handleOpenApprove(indent)}>Approve</Button>
                            <Button color="danger" size="sm" onClick={() => handleOpenReject(indent)}>Reject</Button>
                        </>)}
                        {(indent.status === 'Approved' || indent.status === 'Rejected') && (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>N/A</span>
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
                                {/* --- Filter Buttons --- */}
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
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.displayIndentNo} ({selectedIndent.status})</ModalHeader>
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
                    <ModalHeader toggle={togglePmResubmitQtyModal}>Correct Quantities & Resubmit: {selectedIndent?.displayIndentNo}</ModalHeader>
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


                {/* 3. Reject Indent Modal (Officer's rejection) */}
                <Modal isOpen={isRejectModalOpen} toggle={toggleRejectModal} centered>
                    <ModalHeader toggle={toggleRejectModal}>Reject Indent: {selectedIndent?.displayIndentNo}</ModalHeader>
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
                
                {/* 4. Quantity Entry Modal (Officer Approves - API Call Integrated) */}
                <Modal isOpen={isQuantityModalOpen} toggle={toggleQuantityModal} centered>
                    <ModalHeader toggle={toggleQuantityModal}>Enter Quantities for: {selectedIndent?.displayIndentNo}</ModalHeader>
                    <ModalBody>
                        {isActionLoading && <div className="text-center"><Spinner size="lg" color="primary" /><p className='mt-2'>Submitting Approval...</p></div>}
                        {!isActionLoading && (
                            <>
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
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleQuantityModal} disabled={isActionLoading}>Cancel</Button>
                        <Button color="success" onClick={handleQuantitySubmit} disabled={isActionLoading}>
                            {isActionLoading ? <Spinner size="sm" /> : 'Next: Acknowledge Preview'}
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* 5. Acknowledgement Preview Modal */}
                {acknowledgementData && (
                    <Modal isOpen={isAcknowledgementModalOpen} toggle={toggleAcknowledgementModal} centered size="lg">
                        <ModalHeader toggle={toggleAcknowledgementModal}>Acknowledgement Preview: {acknowledgementData.displayIndentNo}</ModalHeader>
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