import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Alert, Spinner
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg';
import { postcreateindent } from '../../helpers/fakebackend_helper';


// =================================================================
// 1. CONSTANTS AND UTILITY FUNCTIONS
// =================================================================

const INITIAL_INDENTS = [];
const STATUS_MAP = { 1: 'To Be Approved', 4: 'Returned for Revision', 2: 'Approved', 3: 'Rejected' };
const VIEW_STATUS_MAP = {
    'to_approve': 'To Be Approved',
    'returned_for_revision': 'Returned for Revision',
    'rejected': 'Rejected',
    'all': null,
    'approved': 'Approved'
};

const formatSelectedOptions = (names) => {
    if (!names) return '';
    // This formats the string for the Subject line (e.g., "ANDOOR and KAMTHAN / GULBARGA")
    return names.replace(/,/g, ' and ').replace(/\s*\/\s*/g, ' / ');
};


/**
 * Fetches the main list of indents from the API (Flags 4 or 6).
 */
const fetchIndentsFromAPI = async (viewStatus, userId, roleId, requestUserName, setIndents, setIsLoading, setError) => {
    setIsLoading(true);
    setError(null);
    setIndents([]);

    let payload;
    let flagId;
    const filterStatus = VIEW_STATUS_MAP[viewStatus];

    if (viewStatus === 'approved') {
        flagId = 6;
        payload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };
    } else {
        flagId = 4;
        payload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };
    }

    try {
        const response = await postcreateindent(payload);

        if (response && response.status === 'success' && response.result) {
            const apiData = Array.isArray(response.result) ? response.result : [];

            // --- Grouping and Aggregation Logic (REVISED FOR ROW SEPARATION AND QUANTITY SPLITTING) ---
            const groupedDataMap = apiData.reduce((acc, item) => {
                const indentId = item.Indent_Id;
                
                // Get the comma-separated strings for names, codes, and quantities
                const sectionNamesString = item.section_names || item.SectionOfficeName || '';
                const soCodesString = item.so_codes || item.so_code || '';
                const enteredQtyString = item.EnteredQty || ''; 

                if (!acc[indentId]) {
                    const createdDate = new Date(item.IndentCreatedOn || item.UpdatedOn || new Date());
                    const statusFromApi = item.StatusName || STATUS_MAP[item.Status_Id] || 'To Be Approved';

                    acc[indentId] = {
                        indentNumber: indentId,
                        displayIndentNo: item.fullIndentNo || item.Indent_No || item.Indent_Id,
                        createdOn: item.IndentCreatedOn || item.UpdatedOn,
                        date: createdDate.toLocaleDateString('en-GB'),
                        time: createdDate.toLocaleTimeString('en-US', { hour12: true }),
                        division: item.division_names || item.DivisionName || 'N/A', // Added DivisionName fallback
                        subDivision: item.subdivision_names || item.SubDivisionName || 'N/A', // Added SubDivisionName fallback
                        divisionCode: item.div_codes || item.div_code || null,
                        subDivisionCode: item.sd_codes || item.sd_code || null,
                        status: statusFromApi,
                        rejectionReason: item.RejectionReason || item.comment || null,
                        createdBy: item.CreatedByName || item.RequestUserName || 'N/A',
                        createdByUserId: item.CreatedByIndent || item.CreatedByUser_Id || null,
                        selectedOptions: [], // Array of {name, code, quantity} - MUST be multiple items for multiple rows
                    };
                }

                const currentIndent = acc[indentId];
                
                // 1. Split the names, codes, and quantities arrays
                const names = sectionNamesString.split(',').map(s => s.trim()).filter(s => s);
                const codes = soCodesString.split(',').map(s => s.trim()).filter(s => s);
                const quantities = enteredQtyString.split(',').map(s => parseInt(s.trim(), 10));
                
                // 2. Iterate over the names (which should be the most reliable count)
                names.forEach((name, index) => {
                    const code = codes[index] || null;
                    const qty = quantities.length > index && !isNaN(quantities[index]) ? quantities[index] : 0;

                    // Only add if the name is valid and we haven't already added this exact section
                    if (name && name !== 'N/A' && !currentIndent.selectedOptions.some(o => o.name === name && o.code === code)) {
                        currentIndent.selectedOptions.push({ 
                            name, 
                            code, 
                            quantity: qty 
                        });
                    }
                });

                // Handle single-item fallback if no aggregated strings were found but SubDivision/SectionOfficeName exists
                if (currentIndent.selectedOptions.length === 0 && (item.SectionOfficeName || item.SubDivisionName)) {
                     const name = item.SectionOfficeName || item.SubDivisionName;
                     const code = item.so_code || item.sd_code;
                     const qty = parseInt(item.EnteredQty, 10) || 0;
                     if (name && name !== 'N/A') {
                         currentIndent.selectedOptions.push({ name, code, quantity: qty });
                     }
                }


                return acc;
            }, {});

            // Convert map back to an array of objects and finalize names
            let finalResults = Object.values(groupedDataMap).map(indent => {
                // Combine unique names for the summary field (used in table list and document subject)
                const uniqueNames = [...new Set(indent.selectedOptions.map(o => o.name).filter(n => n && n !== 'N/A'))];
                indent.selectedOptionNames = uniqueNames.join(', ');

                // Final check to prevent empty selectedOptions if data was tricky
                if (indent.selectedOptions.length === 0 && indent.subDivision && indent.subDivision !== 'N/A') {
                    indent.selectedOptions.push({
                        name: indent.subDivision,
                        code: indent.subDivisionCode,
                        quantity: 0
                    });
                    indent.selectedOptionNames = indent.subDivision;
                }
                
                return indent;
            });

            // Apply client-side filtering if flagId is 4 AND a specific status is targeted
            if (flagId === 4 && filterStatus) {
                finalResults = finalResults.filter(indent => indent.status === filterStatus);
            }

            setIndents(finalResults);

        } else if (response && response.status === 'success' && (response.count === 0 || !response.result)) {
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

/**
 * Fetches an explicit count for a given flag (Flags 7 or 8).
 */
const fetchIndentCount = async (flagId, roleId, requestUserName, setIsLoading, setCount) => {
    setIsLoading(true);
    const countPayload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };

    try {
        const response = await postcreateindent(countPayload);

        if (response && response.status === 'success') {
            let count = 0;
            if (typeof response.result === 'number') {
                count = response.result;
            } else if (Array.isArray(response.result)) {
                count = response.result.length;
            } else if (response.count !== undefined) {
                count = response.count;
            }
            setCount(count);
        } else {
            console.error(`API reported failure for Flag ${flagId} count:`, response.message || 'Unknown API Error');
            setCount(0);
        }
    } catch (err) {
        console.error(`Network error fetching count (Flag ${flagId}):`, err);
        setCount(0);
    } finally {
        setIsLoading(false);
    }
};


// --- Template Rendering Functions (Unchanged as they correctly iterate over selectedOptions) ---

const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const selectedOptions = indentData.selectedOptions || [];
    const isReturned = indentData.status === 'Returned for Revision';

    const getToCode = () => indentData.subDivisionCode || 'N/A';
    const formattedOptionNames = indentData.selectedOptionNames || 'N/A'; 

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

                <div><p>To,</p><p>The Officer</p><p>{getToCode()}</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Request for physical records of Gescom Consumer of {formatSelectedOptions(formattedOptionNames)}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>With reference to the above DWA no and subject, we request for the physical available consumer records of the below listed location(s).</p></div>

                <Table bordered size="sm" className="mb-4">
                    <thead>
                        <tr>
                            <th>SL NO</th>
                            <th>Division</th>
                            <th>Sub-Division</th>
                            <th>Section </th>
                            {(isReturned || indentData.status === 'Approved') && <th style={{ width: '20%' }}>{indentData.status === 'Approved' ? 'Acknowledged Qty' : 'Last Recorded Qty'}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {/* This loop now renders separate rows due to the corrected data loading logic */}
                        {selectedOptions.map((option, index) => {
                            const recordedQty = option.quantity || 0;
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{indentData.division || 'N/A'}</td>
                                    <td>{indentData.subDivision || 'N/A'}</td>
                                    <td>{option.name || 'N/A'}</td>
                                    {(isReturned || indentData.status === 'Approved') && <td className="fw-bold">{recordedQty}</td>}
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
    const formattedOptionNames = ackData.selectedOptionNames || 'N/A';

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {ackData.displayIndentNo}</div>
                    <div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {ackData.date}</div><div><strong>Time:</strong> {ackData.time}</div></div>
                </div>
                <div><p>To,</p><p>The Project Manager</p><p>Vishvin Technologies</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Acknowledgement of Physical Records for {formatSelectedOptions(formattedOptionNames)}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>This is to acknowledge the receipt of the physical consumer records with reference to the above DWA no and subject for the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4">
                    <thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th><th>Quantity Received</th></tr></thead>
                    <tbody>
                        {selectedOptionsWithQuantity.map((option, index) => (
                            <tr key={index}><td>{index + 1}</td><td>{ackData.division || 'N/A'}</td><td>{ackData.subDivision || 'N/A'}</td><td>{option.name || 'N/A'}</td><td>{option.quantity}</td></tr>
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


// =================================================================
// 2. MAIN COMPONENT
// =================================================================

const ViewIndent = () => {
    document.title = `Indent Approval Queue | DMS`;

    // --- State Variables ---
    const [indents, setIndents] = useState(INITIAL_INDENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewStatus, setViewStatus] = useState('to_approve');

    // Counts for Filter Buttons
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [isCountLoading, setIsCountLoading] = useState(false);
    const [isApprovedCountLoading, setIsApprovedCountLoading] = useState(false);

    // Modals & Forms
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [isPmResubmitQtyModalOpen, setIsPmResubmitQtyModalOpen] = useState(false);
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalComments, setApprovalComments] = useState('');
    const [formError, setFormError] = useState('');
    const [resubmitFormError, setResubmitFormError] = useState('');
    const [sectionQuantities, setSectionQuantities] = useState([]);
    const [pmResubmitQuantities, setPmResubmitQuantities] = useState([]);
    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- Session Data Retrieval (Unchanged) ---
    const sessionData = useMemo(() => {
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
            return {
                userId: fallbackUserId ? parseInt(fallbackUserId, 10) : null,
                roleId: parseInt(fallbackRoleId, 10) || null,
                requestUserName: fallbackEmail || null
            };
        }

        return defaultData;
    }, []);

    // --- API Data Fetching Effect (Triggers on mount and status change) ---
    useEffect(() => {
        if (!sessionData.roleId || !sessionData.requestUserName) {
            setFetchError("Authentication error: Missing user session data. Please ensure you are logged in.");
            setIsLoading(false);
            setIndents([]);
            return;
        }

        setFetchError(null);
        setPage(0);

        // 1. Fetch the main queue data for the selected status (uses Flag 4 or 6)
        fetchIndentsFromAPI(
            viewStatus,
            sessionData.userId,
            sessionData.roleId,
            sessionData.requestUserName,
            setIndents,
            setIsLoading,
            setFetchError
        );

        // 2. Separate logic to fetch the *explicit count* for Pending Approval (Flag 7)
        fetchIndentCount(7, sessionData.roleId, sessionData.requestUserName, setIsCountLoading, setPendingApprovalCount);

        // 3. Separate logic to fetch the *explicit count* for Approved (Flag 8)
        fetchIndentCount(8, sessionData.roleId, sessionData.requestUserName, setIsApprovedCountLoading, setApprovedCount);

    }, [viewStatus, sessionData.roleId, sessionData.requestUserName, sessionData.userId]);

    // --- Core Filtering and Pagination Logic (Unchanged) ---

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

    const processedData = filteredIndents;

    const pageCount = pageSize === -1 ? 1 : Math.ceil(processedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return processedData;
        const start = page * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, page, pageSize]);

    // --- Modal Toggles and Handlers (Unchanged) ---

    const toggleViewModal = useCallback(() => setIsViewModalOpen(prev => !prev), []);
    const toggleRejectModal = useCallback(() => setIsRejectModalOpen(prev => !prev), []);
    const toggleQuantityModal = useCallback(() => setIsQuantityModalOpen(prev => !prev), []);
    const toggleAcknowledgementModal = useCallback(() => setIsAcknowledgementModalOpen(prev => !prev), []);
    const toggleResponseModal = useCallback(() => setIsResponseModalOpen(prev => !prev), []);
    const togglePmResubmitQtyModal = useCallback(() => setIsPmResubmitQtyModalOpen(prev => !prev), []);

    const handleViewClick = (indent) => {
        setSelectedIndent(indent);
        toggleViewModal();
    };

    const handleOpenApprove = (indent) => {
        setSelectedIndent(indent);
        if (indent && indent.selectedOptions) {
            const initialQuantities = indent.selectedOptions.map(option => ({
                code: option.code,
                name: option.name,
                // Use quantity from the loaded data for pre-filling
                quantity: option.quantity !== undefined && option.quantity !== null && option.quantity > 0 ? option.quantity.toString() : ''
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

        // Simulate state update for rejection (returns for revision)
        setIndents(prev => prev.map(indent => indent.indentNumber === selectedIndent.indentNumber ? { 
            ...indent, 
            status: 'Returned for Revision', 
            rejectionReason: rejectionReason 
        } : indent));

        setResponseModalContent({ title: 'Returned for Revision', message: `Indent ${selectedIndent.displayIndentNo} has been returned for revision.`, isSuccess: false });
        toggleRejectModal();
        toggleResponseModal();
        setViewStatus('returned_for_revision');
        setSelectedIndent(null);
    };

    const handleSectionQuantityChange = (code, value) => {
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setSectionQuantities(prev => prev.map(item => (item.code === code) ? { ...item, quantity: value } : item));
            setFormError('');
        }
    };

    // --- PM Resubmit Actions (Unchanged) ---
    const handleOpenPmResubmit = (indent) => {
        setSelectedIndent(indent);
        const initialQuantities = indent.selectedOptions.map(option => ({
            code: option.code,
            name: option.name,
            quantity: option.quantity !== undefined && option.quantity !== null && option.quantity > 0 ? option.quantity.toString() : ''
        }));
        setPmResubmitQuantities(initialQuantities);
        setResubmitFormError('');
        togglePmResubmitQtyModal();
    };

    const handlePmResubmitQuantityChange = (code, value) => {
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setPmResubmitQuantities(prev => prev.map(item => (item.code === code) ? { ...item, quantity: value } : item));
            setResubmitFormError('');
        }
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

        // Simulate state update for resubmit
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

    // --- CORE INTEGRATION POINT: Officer Approval API Call (flagId: 5) ---
    const handleQuantitySubmit = async () => {
        const invalidQuantity = sectionQuantities.some(item =>
            item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity))
        );

        if (invalidQuantity) {
            setFormError('All quantities must be entered and be non-negative integers.');
            return;
        }

        if (!selectedIndent || !sessionData.userId || !sessionData.roleId || !sessionData.requestUserName) {
            setFormError("Authentication Error: Missing indent or session data. Cannot submit.");
            return;
        }

        setIsActionLoading(true);
        setFormError('');

        try {
            const finalComment = approvalComments.trim();

            // 1. Prepare the sections payload with the new quantities
            const sectionsPayload = selectedIndent.selectedOptions.map(original => {
                const enteredItem = sectionQuantities.find(q => q.code === original.code);
                const enteredQty = enteredItem ? parseInt(enteredItem.quantity, 10) : 0;

                const sectionObject = {
                    "sd_code": selectedIndent.subDivisionCode || null,
                    "so_code": original.code || null,
                    "EnteredQty": enteredQty.toString(),
                };

                if (selectedIndent.divisionCode) { sectionObject.div_code = selectedIndent.divisionCode; }
                if (finalComment) { sectionObject.comment = finalComment; }

                return sectionObject;
            });

            // 2. Construct the Approval Payload (Flag ID 5)
            const finalApprovalPayload = {
                "flagId": 5,
                "Indent_Id": selectedIndent.indentNumber,
                "UploadedByUser_Id": sessionData.userId,
                "Role_Id": sessionData.roleId,
                "Status_Id": 2, // Hardcoded Status ID for 'Approved'
                "CreatedByUser_Id": selectedIndent.createdByUserId,
                "sections": sectionsPayload
            };

            const response = await postcreateindent(finalApprovalPayload);

            if (response && response.status === 'success') {
                // Update selectedOptions with the acknowledged quantities for the template
                const acknowledgedOptions = sectionsPayload.map(s => ({
                    name: selectedIndent.selectedOptions.find(o => o.code === s.so_code)?.name || s.so_code,
                    code: s.so_code,
                    quantity: parseInt(s.EnteredQty, 10)
                }));

                const ackData = {
                    ...selectedIndent,
                    comments: finalComment,
                    status: 'Approved',
                    selectedOptions: acknowledgedOptions, // Use the new quantities
                    selectedOptionNames: acknowledgedOptions.map(o => o.name).join(', ')
                };
                setAcknowledgementData(ackData);

                // Update local state to reflect the status change
                setIndents(prev => prev.map(i => i.indentNumber === selectedIndent.indentNumber ? {
                    ...i,
                    status: 'Approved',
                    selectedOptions: acknowledgedOptions,
                    rejectionReason: null,
                } : i));

                toggleQuantityModal();
                toggleAcknowledgementModal();

            } else {
                const errorMessage = response.message || `API Approval Failed (Flag 5). Status: ${response.status || 'Unknown'}.`;
                setFormError(errorMessage);
                console.error("Approval API Error (Flag 5):", response);
            }
        } catch (err) {
            console.error("API Call Error (Flag 5):", err);
            setFormError('An unexpected network or server error occurred during submission.');
        } finally {
            setIsActionLoading(false);
        }
    };

    // Handler for the final submit button in the Acknowledgement Modal (Unchanged)
    const handleSubmitAcknowledgement = () => {
        setResponseModalContent({
            title: 'Success!',
            message: `The Indent ${acknowledgementData.displayIndentNo} has been Approved and Acknowledged.`,
            isSuccess: true
        });
        toggleAcknowledgementModal();
        toggleResponseModal();
        setViewStatus('approved'); // Trigger re-fetch using Flag 6
        setSelectedIndent(null);
    };

    // --- Helper for UI (Unchanged) ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'To Be Approved': return 'warning';
            case 'Returned for Revision': return 'info';
            default: return 'secondary';
        }
    };

    // --- Render Logic (Table) (Unchanged) ---
    
    // Determine the columns based on viewStatus
    const tableColumns = useMemo(() => {
        const baseColumns = [
            { header: 'Indent number', accessorKey: 'displayIndentNo', key: 'displayIndentNo' },
            { header: 'Status', accessorKey: 'status', key: 'status' },
            { header: 'Section/Sub-Division', accessorKey: 'selectedOptionNames', key: 'selectedOptionNames' },
            { header: 'Created on', accessorKey: 'createdOn', key: 'createdOn' },
            { header: 'View', accessorKey: 'viewAction', key: 'viewAction' },
        ];

        // Omit the 'Action' column when viewing the 'approved' queue
        if (viewStatus !== 'approved') {
            baseColumns.push({ header: 'Action', accessorKey: 'otherAction', key: 'otherAction' });
        }
        return baseColumns;
    }, [viewStatus]);

    const renderTableHeader = () => (
        <tr>
            {tableColumns.map((col) => {
                return (
                    <th key={col.key}
                        style={{ cursor: 'default', userSelect: 'none', whiteSpace: 'nowrap', textAlign: (col.key === 'viewAction' || col.key === 'otherAction') ? 'center' : 'left' }}
                    >
                        {col.header}
                    </th>
                );
            })}
        </tr>
    );
    
    // Calculate the total column span needed for loading/no data rows
    const totalColumns = tableColumns.length;

    const renderTableRows = () => {
        if (isLoading) { return (<tr><td colSpan={totalColumns} className="text-center py-5"><Spinner size="sm" className="me-2" /> Loading Indents...</td></tr>); }
        if (fetchError) { return (<tr><td colSpan={totalColumns} className="text-center py-5"><Alert color="danger" className="mb-0">{fetchError}</Alert></td></tr>); }
        if (!paginatedData || paginatedData.length === 0) {
            return (<tr><td colSpan={totalColumns} style={{ textAlign: 'center', padding: '24px' }}>No documents found in the selected queue.</td></tr>);
        }

        return paginatedData.map((indent) => (
            <tr key={indent.indentNumber}>
                <td>{indent.displayIndentNo}</td>
                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                <td>{formatSelectedOptions(indent.selectedOptionNames)}</td>
                <td>{new Date(indent.createdOn).toLocaleString()}</td>

                <td style={{ textAlign: 'center' }}>
                    <Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button>
                </td>

                {/* Conditionally render the Action cell */}
                {viewStatus !== 'approved' && (
                    <td style={{ textAlign: 'center' }}>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* PM Action */}
                            {indent.status === 'Returned for Revision' && (
                                <Button color="success" size="sm" onClick={() => handleOpenPmResubmit(indent)}>Resubmit</Button>
                            )}
                            {/* Officer Action */}
                            {indent.status === 'To Be Approved' && (<>
                                <Button color="success" size="sm" onClick={() => handleOpenApprove(indent)}>Approve</Button>
                                <Button color="danger" size="sm" onClick={() => handleOpenReject(indent)}>Reject</Button>
                            </>)}
                            {(indent.status === 'Approved' || indent.status === 'Rejected') && (
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>N/A</span>
                            )}
                        </div>
                    </td>
                )}
            </tr>
        ));
    };

    // --- Render: Pagination (Unchanged) ---
    const renderPagination = () => {
        const pageSizeOptions = [{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 25, label: '25' }, { value: -1, label: 'All' }];
        const totalPages = pageCount;
        return (
            <div style={{ margin: '18px 0 12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }} >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
                            Showing{' '}<b style={{ color: '#222', fontWeight: 600 }}>{paginatedData.length}</b>{' '}of <b>{processedData.length}</b> Results
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
                                        Pending Approval ({isCountLoading ? <Spinner size="sm" color="warning" /> : pendingApprovalCount})
                                    </Button>
                                    <Button
                                        color={viewStatus === 'returned_for_revision' ? 'info' : 'light'}
                                        onClick={() => setViewStatus('returned_for_revision')}>
                                        Resubmit Queue ({indents.filter(i => i.status === 'Returned for Revision').length})
                                    </Button>

                                    <Button
                                        color={viewStatus === 'approved' ? 'success' : 'light'}
                                        onClick={() => setViewStatus('approved')}>
                                        Approved ({isApprovedCountLoading ? <Spinner size="sm" color="success" /> : approvedCount})
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
                        <Button color="danger" onClick={handleRejectSubmit}>Return for Revision</Button>
                    </ModalFooter>
                </Modal>

                {/* 4. Quantity Entry Modal (Officer Approves - Flag 5 Action) */}
                <Modal isOpen={isQuantityModalOpen} toggle={toggleQuantityModal} centered>
                    <ModalHeader toggle={toggleQuantityModal}>Enter Quantities for: {selectedIndent?.displayIndentNo}</ModalHeader>
                    <ModalBody>
                        {isActionLoading && <div className="text-center"><Spinner size="lg" color="primary" /><p className='mt-2'>Submitting Approval (Flag 5)...</p></div>}
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
                                            {selectedIndent?.selectedOptions.map((option) => {
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
        </div>
    );
};

export default ViewIndent;