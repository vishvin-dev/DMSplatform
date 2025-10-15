import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Alert, Spinner
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg';
// --- Assuming 'rejected' is exported from the helper file and maps to /indent/rejected ---
import { postcreateindent, resubmittedindent, rejected } from '../../helpers/fakebackend_helper';
// ---------------------------------------------------------------------------------------

// =================================================================
// 1. CONSTANTS AND UTILITY FUNCTIONS
// =================================================================

const INITIAL_INDENTS = [];
// Status IDs: 1: To Be Approved, 2: Approved, 3: Rejected, 5: Status ID from new SS payload
const STATUS_MAP = { 1: 'To Be Approved', 2: 'Approved', 3: 'Rejected', 5: 'Rejected' };
const VIEW_STATUS_MAP = {
    'to_approve': 'To Be Approved',
    'rejected': 'Rejected',
    'all': null,
    'approved': 'Approved',
    'resubmitted_queue': 'Resubmitted Indents'
};

const formatSelectedOptions = (names) => {
    if (!names) return '';
    return names.replace(/,/g, ' and ').replace(/\s*\/\s*/g, ' / ');
};


/**
 * Fetches the main list of indents from the API (Flags 2, 4, 6, or NEW Flags 3/5/6 for Rejected).
 */
const fetchIndentsFromAPI = async (viewStatus, userId, roleId, requestUserName, setIndents, setIsLoading, setError) => {
    setIsLoading(true);
    setError(null);
    setIndents([]);

    let payload;
    let flagId;
    let apiFunction = postcreateindent;
    const filterStatus = VIEW_STATUS_MAP[viewStatus];

    if (viewStatus === 'approved') {
        flagId = 6;
        // Flag 6 uses Role_Id (original payload structure)
        payload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };
    } else if (viewStatus === 'resubmitted_queue') {
        // *** FLAG 2: DEDICATED API (resubmittedindent) with DO_Role_Id ***
        flagId = 2;
        apiFunction = resubmittedindent;
        payload = { "flagId": flagId, "DO_Role_Id": roleId, "RequestUserName": requestUserName };
    } else if (viewStatus === 'rejected') {
        // *** LOGIC: Use 'rejected' API for fetching rejected documents (Flag 3) ***
        flagId = 3;
        apiFunction = rejected;
        // Payload keys match the screenshot for the rejected fetch route:
        payload = {
            "flagId": flagId,
            "Role_Id": roleId,
            "RequestUserName": requestUserName
        };
    }
    else {
        // *** FLAG 4: Pending Approval Data (uses postcreateindent) with Role_Id ***
        flagId = 4;
        payload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };
    }

    try {
        const response = await apiFunction(payload);

        let apiData = [];
        let statusCheck = response && response.status === 'success';

        // 1. Handle nested response for Flag 2 (Resubmitted Queue)
        if (flagId === 2 && statusCheck && Array.isArray(response.result) && response.result.length > 0 && Array.isArray(response.result[0].result)) {
             apiData = response.result[0].result;
        }
        // 2. Handle nested response for Rejected Data (Flag 3)
        else if (flagId === 3 && statusCheck && Array.isArray(response.result)) {
             apiData = response.result;
        }
        else if (statusCheck && response.result) {
            // 3. Handle standard response for other flags (4, 6, etc.)
            apiData = Array.isArray(response.result) ? response.result : [];
        } else if (!statusCheck) {
            setError(response.message || `Failed to fetch indents (Flag ${flagId}). API Status: ${response.status || 'Unknown'}.`);
            setIsLoading(false);
            return;
        }

        // --- Grouping and Aggregation Logic ---
        const groupedDataMap = apiData.reduce((acc, item) => {
            const indentId = item.Indent_Id;
            const sectionsArray = item.sections;

            const sectionNamesString = item.section_names || item.SectionOfficeName || '';
            const soCodesString = item.so_codes || item.so_code || '';
            
            // Capture both PMQty and EnteredQty/OOQty/LastQty (depending on context)
            const pmQtyString = item.PMQty || '';
            const enteredQtyString = item.EnteredQty || '';
            
            // Determine the correct 'Created On' date/time
            const sourceDate = (flagId === 2 && item.ActionOn) ? item.ActionOn : (item.IndentCreatedOn || item.UpdatedOn || item.CreatedOn || new Date());
            const createdDate = new Date(sourceDate);

            if (!acc[indentId]) {

                // CRITICAL FIX FOR STATUS NAME
                let statusFromApi = item.StatusName || STATUS_MAP[item.IndentStatus_Id || item.Status_Id] || 'To Be Approved';
                if (item.IndentStatusName === "ResubmittedToOfficers") {
                     statusFromApi = "Resubmitted Indents"; // Correctly display the status
                }
                // For Flag 3, ensure status is 'Rejected' based on context
                if (flagId === 3) {
                    statusFromApi = 'Rejected';
                }

                // Get initial Division/Sub-Division details
                let divisionName = item.division_names || item.DivisionName || 'N/A';
                let subDivisionName = item.subdivision_names || item.SubDivisionName || 'N/A';
                let divisionCode = item.div_codes || item.div_code || null;
                let subDivisionCode = item.sd_codes || item.sd_code || null;
                let createdByUserId = item.CreatedByIndent || item.ActionByUser_Id || item.UploadedByUser_Id || null;
                let createdByName = item.CreatedByName || item.RequestUserName || item.UploadedByName || 'N/A';


                // *** AGGRESSIVE LOCATION DATA EXTRACTION ***
                // Check nested sections first (common for Flag 2)
                if (Array.isArray(sectionsArray) && sectionsArray.length > 0) {
                    const firstSection = sectionsArray[0];

                    divisionName = divisionName === 'N/A' ? (firstSection.division_names || firstSection.DivisionName || 'N/A') : divisionName;
                    subDivisionName = subDivisionName === 'N/A' ? (firstSection.subdivision_names || firstSection.SubDivisionName || 'N/A') : subDivisionName;
                    divisionCode = divisionCode || firstSection.div_code || null;
                    subDivisionCode = subDivisionCode || firstSection.sd_code || null;
                    createdByUserId = createdByUserId || firstSection.ActionByUser_Id || null;
                }

                // FIX: Fallback for CreatedByName if main fields are null but RequestUserName/UploadedByName is present
                createdByName = createdByName === 'N/A' ? (item.RequestUserName || item.UploadedByName || 'N/A') : createdByName;

                // FIX: Ensure division/subdivision is populated if it exists via the aggregated strings
                // but was null in the root fields (common for approved data)
                if ((divisionName === 'N/A' || subDivisionName === 'N/A') && (sectionNamesString || soCodesString)) {
                    // Try to extract from first non-null available location information
                    if (item.DivisionName) divisionName = item.DivisionName;
                    if (item.SubDivisionName) subDivisionName = item.SubDivisionName;
                    if (item.div_code) divisionCode = item.div_code;
                    if (item.sd_code) subDivisionCode = item.sd_code;
                }
                // ********************************************

                acc[indentId] = {
                    indentNumber: indentId,
                    displayIndentNo: item.fullIndentNo || item.Indent_No || item.Indent_Id,
                    createdOn: sourceDate, // Store the raw date string/timestamp
                    date: createdDate.toLocaleDateString('en-GB'),
                    time: createdDate.toLocaleTimeString('en-US', { hour12: true }),
                    division: divisionName, // Use resolved name
                    subDivision: subDivisionName, // Use resolved name
                    divisionCode: divisionCode, // Use resolved code
                    subDivisionCode: subDivisionCode, // Use resolved code
                    status: statusFromApi,
                    submitToRole: item.SubmitToRole || null, // Store SubmitToRole
                    // Ensure rejection reason is pulled from the appropriate field
                    rejectionReason: item.RejectedComment || item.RejectionReason || item.ApprovalHistoryComment || item.comment || null,
                    createdByUserId: createdByUserId, // Use the extracted ID
                    createdBy: createdByName, // Use the extracted Name
                    selectedOptions: [],
                };
            }

            const currentIndent = acc[indentId];

            if (flagId === 2 && Array.isArray(sectionsArray) && sectionsArray.length > 0) {
                // --- LOGIC FOR NESTED SECTIONS (Flag 2: Resubmitted Queue) ---
                sectionsArray.forEach(section => {
                    // Capture both quantities
                    const pmQty = parseInt(section.PMQty, 10) || 0;
                    const officerQty = parseInt(section.OOQty, 10) || 0;
                    
                    // The primary 'quantity' remains the Officer's latest confirmed quantity for generic logic compatibility
                    const primaryQty = officerQty || pmQty; 
                    
                    const name = section.section_names || section.SubDivisionName || section.subdivision_names || 'N/A';
                    const code = section.so_code || null;
                    
                    if (name && name !== 'N/A' && !currentIndent.selectedOptions.some(o => o.name === name && o.code === code)) {
                        currentIndent.selectedOptions.push({ 
                            name, 
                            code, 
                            quantity: primaryQty, // Main quantity used for generic logic/sorting
                            pmQuantity: pmQty,        // Project Manager's quantity
                            officerQuantity: officerQty // Officer's confirmed quantity
                        });
                    }
                });
            } else {
                // --- LOGIC FOR AGGREGATED STRINGS (Flag 3/4/6) ---
                const names = sectionNamesString.split(',').map(s => s.trim()).filter(s => s);
                const codes = soCodesString.split(',').map(s => s.trim()).filter(s => s);
                
                // For other statuses, we typically rely on EnteredQty/root count.
                const rootCount = item.count !== undefined ? parseInt(item.count, 10) : 0;
                let quantities = enteredQtyString.split(',').map(s => parseInt(s.trim(), 10)).filter(q => !isNaN(q));

                // Fallback for quantities
                if (quantities.length === 0 && rootCount > 0 && names.length > 0) {
                    quantities = Array(names.length).fill(rootCount);
                }

                if (names.length > 0) {
                    names.forEach((name, index) => {
                        const code = codes[index] || null;
                        const qty = quantities.length > index && !isNaN(quantities[index]) ? quantities[index] : 0;
                        if (name && name !== 'N/A' && !currentIndent.selectedOptions.some(o => o.name === name && o.code === code)) {
                            currentIndent.selectedOptions.push({ 
                                name, 
                                code, 
                                quantity: qty,
                                pmQuantity: qty, // Use this for consistency when not in Flag 2
                                officerQuantity: null 
                            });
                        }
                    });
                }

                // Fallback for single item if selectedOptions is still empty
                if (currentIndent.selectedOptions.length === 0 && currentIndent.subDivision && currentIndent.subDivision !== 'N/A') {
                    const nameToUse = (sectionNamesString && sectionNamesString !== '') ? sectionNamesString : currentIndent.subDivision;
                    const codeToUse = (soCodesString && soCodesString !== '') ? soCodesString : currentIndent.subDivisionCode;
                    const fallbackQty = quantities[0] || rootCount || 0;
                    
                    currentIndent.selectedOptions.push({
                                 name: nameToUse,
                                 code: codeToUse,
                                 quantity: fallbackQty,
                                 pmQuantity: fallbackQty,
                                 officerQuantity: null
                    });
                }
            }

            return acc;
        }, {});

        let finalResults = Object.values(groupedDataMap).map(indent => {
            const uniqueNames = [...new Set(indent.selectedOptions.map(o => o.name).filter(n => n && n !== 'N/A'))];
            indent.selectedOptionNames = uniqueNames.join(', ');
            return indent;
        });

        if (flagId === 4 && filterStatus) {
            finalResults = finalResults.filter(indent => indent.status === filterStatus);
        }

        setIndents(finalResults);
        setError(null);

    } catch (err) {
        console.error("API Fetch Error:", err);
        setError('An unexpected network or server error occurred. Check the network connection or API setup.');
    } finally {
        setIsLoading(false);
    }
};

/**
 * Fetches an explicit count for a given flag (Flags 1, 7, 8, or NEW Flag 2 for Rejected Count).
 */
const fetchIndentCount = async (flagId, roleId, requestUserName, setIsLoading, setCount) => {
    setIsLoading(true);

    let apiFunction = postcreateindent;
    let countPayload;

    if (flagId === 1) {
        // FLAG 1: DEDICATED API (resubmittedindent) with DO_Role_Id for RESUBMITTED COUNT
        apiFunction = resubmittedindent;
        countPayload = { "flagId": flagId, "DO_Role_Id": roleId, "RequestUserName": requestUserName };
    } else if (flagId === 2) {
        // *** REJECTED COUNT: DEDICATED API (rejected) with Role_Id for REJECTED COUNT (FLAG 2) ***
        apiFunction = rejected;
        countPayload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };
    }
    else {
        // Flags 7, 8 use general API with original "Role_Id" key
        countPayload = { "flagId": flagId, "Role_Id": roleId, "RequestUserName": requestUserName };
    }

    try {
        const response = await apiFunction(countPayload);

        if (response && response.status === 'success') {
            let count = 0;

            // 1. Check for deeply nested object structure (Flag 1 count)
            if (flagId === 1 && response.result && typeof response.result === 'object' && response.result.count !== undefined) {
                 count = response.result.count;
            }
            // 2. Check for nested array structure (Flag 1 previous attempt)
            else if (flagId === 1 && Array.isArray(response.result) && response.result.length > 0 && response.result[0].count !== undefined) {
                 count = response.result[0].count;
            }
            // 3. *** NEW LOGIC: Rejected Count (Flag 2) with nested array result ***
            else if (flagId === 2 && Array.isArray(response.result) && response.result.length > 0 && response.result[0].RejectedIndentCount !== undefined) {
                 count = parseInt(response.result[0].RejectedIndentCount, 10);
            }
            // 4. Check for direct number or array length (Flags 7, 8, etc.)
            else if (typeof response.result === 'number') {
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


// --- Template Rendering Functions ---
const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const selectedOptions = indentData.selectedOptions || [];
    const isRejected = indentData.status === 'Rejected';
    const isResubmitted = indentData.status === 'Resubmitted Indents';

    // Determine the recipient for the "To" field
    const recipientName = indentData.submitToRole || 'The Officer';
    const getToCode = () => indentData.subDivisionCode || 'N/A';
    const formattedOptionNames = indentData.selectedOptionNames || 'N/A';
    
    // Determine the columns to show
    const showSingleQuantityColumn = indentData.status === 'Approved' || isRejected;
    const showDualQuantityColumns = isResubmitted;

    // Determine the single column header
    let singleQuantityHeader = 'Requested Qty';
    if (indentData.status === 'Approved') {
        singleQuantityHeader = 'Acknowledged Qty';
    } else if (isRejected) {
        singleQuantityHeader = 'Last Recorded Qty';
    }


    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {indentData.displayIndentNo}</div>
                    <div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {indentData.date}</div><div><strong>Time:</strong> {indentData.time}</div></div>
                </div>

                {isRejected && indentData.rejectionReason && (
                    <div className="alert alert-info p-3 mb-3 border border-info" style={{ fontSize: '14px' }}>
                        <h6 className="mb-1 text-dark">
                            Rejection Reason:
                        </h6>
                        <p className="mb-0 fw-bold">{indentData.rejectionReason}</p>
                    </div>
                )}


                {/* --- Updated To: section --- */}
                <div>
                    <p>To,</p>
                    <p>{recipientName}</p>
                    {/* Only show the code if the recipient is the general "The Officer" default name */}
                    {recipientName === 'The Officer' && <p>{getToCode()}</p>}
                </div>
                {/* ----------------------------- */}

                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: Request for physical records of Gescom Consumer of {formatSelectedOptions(formattedOptionNames)}</p><p>DWA No: 14,42,53,250</p></div>
                <div><p>Dear Sir/Madam,</p><p>With reference to the above DWA no and subject, we request for the physical available consumer records of the below listed location(s).</p></div>

                <Table bordered size="sm" className="mb-4">
                    <thead>
                        <tr>
                            <th>SL NO</th>
                            <th>Division</th>
                            <th>Sub-Division</th>
                            <th>Section </th>
                            
                            {/* DUAL QUANTITY COLUMNS FOR RESUBMITTED */}
                            {showDualQuantityColumns && 
                                <>
                                    <th style={{ width: '15%' }}>PM Requested Qty</th>
                                    <th style={{ width: '15%' }}>Officer Confirmed Qty</th>
                                </>
                            }
                            {/* SINGLE QUANTITY COLUMN FOR APPROVED/REJECTED */}
                            {showSingleQuantityColumn && <th style={{ width: '20%' }}>{singleQuantityHeader}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedOptions.map((option, index) => {
                            const singleQty = option.quantity || 0; // Generic quantity field
                            const pmQty = option.pmQuantity !== undefined ? option.pmQuantity : singleQty;
                            const officerQty = option.officerQuantity !== undefined ? option.officerQuantity : singleQty;
                            
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{indentData.division || 'N/A'}</td>
                                    <td>{indentData.subDivision || 'N/A'}</td>
                                    <td>{option.name || 'N/A'}</td>
                                    
                                    {/* DUAL QUANTITY COLUMNS FOR RESUBMITTED */}
                                    {showDualQuantityColumns && 
                                        <>
                                            <td className="fw-bold text-end">{pmQty}</td>
                                            <td className="fw-bold text-end">{officerQty}</td>
                                        </>
                                    }
                                    {/* SINGLE QUANTITY COLUMN FOR APPROVED/REJECTED */}
                                    {showSingleQuantityColumn && <td className="fw-bold text-end">{singleQty}</td>}
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
                            <tr key={index}><td>{index + 1}</td><td>{ackData.division || 'N/A'}</td><td>{ackData.subDivision || 'N/A'}</td><td>{option.name || 'N/A'}</td><td className="text-end">{option.quantity}</td></tr>
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

    // --- State Variables (Unchanged) ---
    const [indents, setIndents] = useState(INITIAL_INDENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewStatus, setViewStatus] = useState('to_approve');

    // Counts for Filter Buttons
    const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [resubmittedCount, setResubmittedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);
    const [isCountLoading, setIsCountLoading] = useState(false);
    const [isApprovedCountLoading, setIsApprovedCountLoading] = useState(false);
    const [isResubmittedCountLoading, setIsResubmittedCountLoading] = useState(false);
    const [isRejectedCountLoading, setIsRejectedCountLoading] = useState(false);

    // Modals & Forms (Removed PmResubmit states)
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalComments, setApprovalComments] = useState('');
    const [formError, setFormError] = useState('');
    // const [resubmitFormError, setResubmitFormError] = useState(''); // Removed
    const [sectionQuantities, setSectionQuantities] = useState([]);
    // const [pmResubmitQuantities, setPmResubmitQuantities] = useState([]); // Removed
    // const [isPmResubmitQtyModalOpen, setIsPmResubmitQtyModalOpen] = useState(false); // Removed
    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });

    // Pagination (Unchanged)
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

    // --- API Data Fetching Effect (Calls fetchIndentsFromAPI and fetchIndentCount) ---
    useEffect(() => {
        if (!sessionData.roleId || !sessionData.requestUserName) {
            setFetchError("Authentication error: Missing user session data. Please ensure you are logged in.");
            setIsLoading(false);
            setIndents([]);
            return;
        }

        setFetchError(null);
        setPage(0);

        const { userId, roleId, requestUserName } = sessionData;

        // Function to call fetchIndentsFromAPI, memoized/wrapped for easy reuse after actions
        const refetchData = () => fetchIndentsFromAPI(
            viewStatus,
            userId,
            roleId,
            requestUserName,
            setIndents,
            setIsLoading,
            setFetchError
        );

        refetchData(); // Initial fetch

        // General API calls (Flags 7, 8) use original Role_Id key
        fetchIndentCount(7, roleId, requestUserName, setIsCountLoading, setPendingApprovalCount);
        fetchIndentCount(8, roleId, requestUserName, setIsApprovedCountLoading, setApprovedCount);

        // Dedicated API call for Flag 1 uses DO_Role_Id key (for RESUBMITTED COUNT)
        fetchIndentCount(1, roleId, requestUserName, setIsResubmittedCountLoading, setResubmittedCount);

        // *** Dedicated API call for Flag 2 uses Role_Id key (for REJECTED COUNT) ***
        fetchIndentCount(2, roleId, requestUserName, setIsRejectedCountLoading, setRejectedCount);

    }, [viewStatus, sessionData.roleId, sessionData.requestUserName, sessionData.userId]);

    // --- Core Filtering and Pagination Logic (Removed 'returned_for_revision' filtering) ---

    const filteredIndents = useMemo(() => {
        let results = indents;
        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.displayIndentNo || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.selectedOptionNames || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (viewStatus === 'to_approve') {
             results = results.filter(i => i.status === 'To Be Approved');
        } else if (viewStatus === 'rejected') {
             results = results.filter(i => i.status === 'Rejected');
        } else if (viewStatus === 'resubmitted_queue') {
             results = results.filter(i => i.status === 'Resubmitted Indents');
        }
        // Removed: else if (viewStatus === 'returned_for_revision') { results = results.filter(i => i.status === 'Returned for Revision'); }

        return results;
    }, [searchTerm, indents, viewStatus]);

    const processedData = filteredIndents;

    const pageCount = pageSize === -1 ? 1 : Math.ceil(processedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return processedData;
        const start = page * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, page, pageSize]);

    // --- Modal Toggles and Handlers (Simplified/Removed 'Returned' handlers) ---

    const toggleViewModal = useCallback(() => setIsViewModalOpen(prev => !prev), []);
    const toggleRejectModal = useCallback(() => setIsRejectModalOpen(prev => !prev), []);
    const toggleQuantityModal = useCallback(() => setIsQuantityModalOpen(prev => !prev), []);
    const toggleAcknowledgementModal = useCallback(() => setIsAcknowledgementModalOpen(prev => !prev), []);

    // const togglePmResubmitQtyModal = useCallback(() => setIsPmResubmitQtyModalOpen(prev => !prev), []); // Removed

    // NOTE: This toggle is ONLY used for closure (by clicking the 'Done' button in the modal).
    // The opening is now handled explicitly in the API functions.
    const toggleResponseModal = useCallback(() => {
        const wasOpen = isResponseModalOpen;
        setIsResponseModalOpen(prev => !prev);

        // If the modal was just closed *and* the action was successful, trigger a full data refresh
        if (wasOpen && responseModalContent.isSuccess) {
            const { userId, roleId, requestUserName } = sessionData;
            // Force a reload of the current queue data
            fetchIndentsFromAPI(viewStatus, userId, roleId, requestUserName, setIndents, setIsLoading, setFetchError);
            // Also refresh the counts since an action was performed
            fetchIndentCount(7, roleId, requestUserName, setIsCountLoading, setPendingApprovalCount);
            fetchIndentCount(8, roleId, requestUserName, setIsApprovedCountLoading, setApprovedCount);
            fetchIndentCount(1, roleId, requestUserName, setIsResubmittedCountLoading, setResubmittedCount);
            fetchIndentCount(2, roleId, requestUserName, setIsRejectedCountLoading, setRejectedCount); // Refresh Rejected count
        }
    }, [isResponseModalOpen, responseModalContent.isSuccess, sessionData, viewStatus, setIndents, setIsLoading, setFetchError]);

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
                // When opening the approval modal, pre-fill with the *Officer's latest confirmed quantity* if available, otherwise fallback to the primary quantity
                // The primary quantity is set in fetchIndentsFromAPI (which uses OOQty if it exists for Resubmitted Indents)
                quantity: option.officerQuantity !== undefined && option.officerQuantity !== null && option.officerQuantity > 0 
                          ? option.officerQuantity.toString() 
                          : (option.quantity !== undefined && option.quantity !== null && option.quantity > 0 ? option.quantity.toString() : '')
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

    // -------------------------------------------------------------------------------------------------
    // --- CORE INTEGRATION POINT: REJECT SUBMIT TO HIT DEDICATED API (/indent/rejected) ---
    // --- FLAG ID 1 is used for submission/action, FLAG ID 5 is the Status ID. ---
    // -------------------------------------------------------------------------------------------------
    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            setFormError('Rejection reason is required.');
            return;
        }

        // Status ID 5 as per the new screenshot payload/logic
        const REJECTED_STATUS_ID = 5;

        if (!selectedIndent || !sessionData.userId || !sessionData.roleId || !sessionData.requestUserName) {
            setFormError("Authentication Error: Missing indent or session data. Cannot submit.");
            return;
        }

        setIsActionLoading(true);
        setFormError('');

        try {
            // Constructing the payload using ONLY the keys explicitly listed in the prompt/screenshot:
            const finalRejectPayload = {
                "flagId": 1, // Flag 1 is for rejection action
                "Indent_Id": selectedIndent.indentNumber,
                "UploadedByUser_Id": sessionData.userId,
                "RejectedByRole_Id": sessionData.roleId, // Officer's role ID
                "Status_Id": REJECTED_STATUS_ID, // 5 (for Rejected status)
                "RejectedComment": rejectionReason.trim(),
                "RequestUserName": sessionData.requestUserName // Uses the RequestUserName/Email from session
            };

            const response = await rejected(finalRejectPayload);

            // Define success criteria based on status OR the specific success message from the API.
            const isApiSuccess = (response && response.status === 'success');
            const isMessageSuccess = response && response.message && (response.message.includes("Submitted Successfully") || response.message.includes("success"));

            // Check for SUCCESS
            if (isApiSuccess || isMessageSuccess) {

                // 1. Explicitly close the Reject Modal.
                setIsRejectModalOpen(false);

                // 2. Prepare the SUCCESS message (Green Theme)
                setResponseModalContent({
                    title: 'Indent Rejected Successfully',
                    message: response.message || `Indent ${selectedIndent.displayIndentNo} has been successfully rejected. The list will now reload.`,
                    isSuccess: true
                });

                // 3. Open the Response Modal after a slight delay to avoid conflicts.
                setTimeout(() => {
                    setIsResponseModalOpen(true);
                }, 100);

                setSelectedIndent(null);
            } else {
                // Handle API-reported FAILURE/UNEXPECTED RESPONSE (Red Theme)
                setIsRejectModalOpen(false); // Close the entry modal
                setResponseModalContent({
                    title: 'Rejection Failed',
                    message: response.message || `API Failure (Flag 1). Status: ${response.status || 'Unknown'}. Please check the server logs.`,
                    isSuccess: false
                });
                setTimeout(() => {
                    setIsResponseModalOpen(true);
                }, 100);
            }
        } catch (err) {
            // Handle NETWORK/UNEXPECTED ERROR (Red Theme)
            console.error("API Call Error (Flag 1 - Reject):", err);
            setIsRejectModalOpen(false); // Close the entry modal
            setResponseModalContent({
                title: '❌ Network Error',
                message: 'An unexpected network or server error occurred during rejection. Please check your network connection or API setup.',
                isSuccess: false
            });
            setTimeout(() => {
                setIsResponseModalOpen(true);
            }, 100);
        } finally {
            setIsActionLoading(false);
        }
    };
    // -------------------------------------------------------------------------------------------------


    const handleSectionQuantityChange = (code, value) => {
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setSectionQuantities(prev => prev.map(item => (item.code === code) ? { ...item, quantity: value } : item));
            setFormError('');
        }
    };

    // Removed: handleOpenPmResubmit
    // Removed: handlePmResubmitQuantityChange
    // Removed: handlePmResubmitSubmit

    // --- CORE INTEGRATION POINT: Officer Approval API Call (Flag 5) ---
    // This function uses postcreateindent, which is correct for Approval.
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

            const sectionsPayload = selectedIndent.selectedOptions.map(original => {
                const enteredItem = sectionQuantities.find(q => q.code === original.code);
                // When approving, use the quantity entered by the Officer
                const enteredQty = enteredItem ? parseInt(enteredItem.quantity, 10) : 0; 

                const sectionObject = {
                    // Ensure section level codes are populated from selectedIndent
                    "sd_code": selectedIndent.subDivisionCode || null,
                    "so_code": original.code || null,
                    "EnteredQty": enteredQty.toString(),
                    // Include div_code and comment in the section payload if applicable, matching your backend structure
                    "div_code": selectedIndent.divisionCode || null,
                    "comment": finalComment || null
                };
                return sectionObject;
            });

            // Approval Payload (Flag ID 5) - uses postcreateindent
            const finalApprovalPayload = {
                "flagId": 5,
                "Indent_Id": selectedIndent.indentNumber,
                "UploadedByUser_Id": sessionData.userId,
                "Role_Id": sessionData.roleId, // Retain Role_Id for action payload
                "Status_Id": 2, // 'Approved'
                "CreatedByUser_Id": selectedIndent.createdByUserId, // Ensure CreatedByUser_Id is used (e.g., 6)
                "div_codes": selectedIndent.divisionCode || null, // Included division code
                "sd_codes": selectedIndent.subDivisionCode || null, // Included subdivision code
                "sections": sectionsPayload
            };

            const response = await postcreateindent(finalApprovalPayload);

            if (response && response.status === 'success') {
                const acknowledgedOptions = sectionsPayload.map(s => ({
                    name: selectedIndent.selectedOptions.find(o => o.code === s.so_code)?.name || s.so_code,
                    code: s.so_code,
                    quantity: parseInt(s.EnteredQty, 10)
                }));
                const ackData = {
                    ...selectedIndent,
                    comments: finalComment,
                    status: 'Approved',
                    selectedOptions: acknowledgedOptions,
                    selectedOptionNames: acknowledgedOptions.map(o => o.name).join(', ')
                };
                setAcknowledgementData(ackData);
                setIndents(prev => prev.map(i => i.indentNumber === selectedIndent.indentNumber ? { ...i, status: 'Approved', selectedOptions: acknowledgedOptions, rejectionReason: null } : i));

                // Close Quantity modal, then open Acknowledgement modal after delay
                setIsQuantityModalOpen(false);
                setTimeout(() => setIsAcknowledgementModalOpen(true), 100);
            } else {
                // Handle API failure response
                setResponseModalContent({
                    title: '❌ Approval Failed',
                    message: response.message || `API Failure (Flag 5). Status: ${response.status || 'Unknown'}.`,
                    isSuccess: false
                });
                setIsQuantityModalOpen(false);
                setTimeout(() => setIsResponseModalOpen(true), 100);
            }
        } catch (err) {
            // Handle network error
            console.error("API Call Error (Flag 5):", err);
            setResponseModalContent({
                title: '❌ Network Error',
                message: 'An unexpected network or server error occurred during submission.',
                isSuccess: false
            });
            setIsQuantityModalOpen(false);
            setTimeout(() => setIsResponseModalOpen(true), 100);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSubmitAcknowledgement = () => {
        setResponseModalContent({
            title: 'Success!',
            message: `The Indent ${acknowledgementData.displayIndentNo} has been Approved and Acknowledged.`,
            isSuccess: true
        });

        // Close Acknowledgement modal, then open Response modal after delay
        setIsAcknowledgementModalOpen(false);
        setTimeout(() => setIsResponseModalOpen(true), 100);

        setViewStatus('approved');
        setSelectedIndent(null);
    };

    // --- Helper for UI (Updated to remove 'Returned for Revision' color) ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'To Be Approved': return 'warning';
            case 'Resubmitted Indents': return 'primary';
            default: return 'secondary';
        }
    };

    // --- Render Logic (Table) (Unchanged) ---

    const tableColumns = useMemo(() => {
        const baseColumns = [
            { header: 'Indent number', accessorKey: 'displayIndentNo', key: 'displayIndentNo' },
            { header: 'Status', accessorKey: 'status', key: 'status' },
            { header: 'Section/Sub-Division', accessorKey: 'selectedOptionNames', key: 'selectedOptionNames' },
            { header: 'Created on', accessorKey: 'createdOn', key: 'createdOn' },
            { header: 'View', accessorKey: 'viewAction', key: 'viewAction' },
            { header: 'Action', accessorKey: 'otherAction', key: 'otherAction' },
        ];

        if (viewStatus === 'approved' || viewStatus === 'rejected') {
             return baseColumns.filter(col => col.key !== 'otherAction');
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

                {tableColumns.some(col => col.key === 'otherAction') && (
                    <td style={{ textAlign: 'center' }}>
                        <div className="d-flex justify-content-center align-items-center gap-2">

                            {/* Removed: PM Action: Only available if status is 'Returned for Revision' */}

                            {/* Officer Action: Available if status is 'To Be Approved' or Resubmitted Indents */}
                            {(indent.status === 'To Be Approved' || indent.status === 'Resubmitted Indents') && (<>
                                <Button color="success" size="sm" onClick={() => handleOpenApprove(indent)}>Approve</Button>
                                <Button color="danger" size="sm" onClick={() => handleOpenReject(indent)}>Reject</Button>
                            </>)}

                            {/* Updated condition to only check for status not requiring action */}
                            {(indent.status !== 'To Be Approved' && indent.status !== 'Resubmitted Indents') && (
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
                                {/* --- Filter Buttons (Removed 'Returned for Revision' button) --- */}
                                <div className="filter-button-group d-flex gap-2">
                                    <Button
                                        color={viewStatus === 'to_approve' ? 'warning' : 'light'}
                                        onClick={() => setViewStatus('to_approve')}>
                                        Pending Approval ({isCountLoading ? <Spinner size="sm" color="warning" /> : pendingApprovalCount})
                                    </Button>

                                    <Button
                                        color={viewStatus === 'resubmitted_queue' ? 'primary' : 'light'}
                                        onClick={() => setViewStatus('resubmitted_queue')}>
                                        Resubmitted Queue ({isResubmittedCountLoading ? <Spinner size="sm" color="primary" /> : resubmittedCount})
                                    </Button>

                                    {/* Removed: Returned for Revision Button */}
                                    {/* <Button
                                        color={viewStatus === 'returned_for_revision' ? 'info' : 'light'}
                                        onClick={() => setViewStatus('returned_for_revision')}>
                                        Returned for Revision ({indents.filter(i => i.status === 'Returned for Revision').length})
                                    </Button> */}

                                    <Button
                                        color={viewStatus === 'approved' ? 'success' : 'light'}
                                        onClick={() => setViewStatus('approved')}>
                                        Approved ({isApprovedCountLoading ? <Spinner size="sm" color="success" /> : approvedCount})
                                    </Button>
                                    <Button
                                        color={viewStatus === 'rejected' ? 'danger' : 'light'}
                                        onClick={() => setViewStatus('rejected')}>
                                        Rejected ({isRejectedCountLoading ? <Spinner size="sm" color="danger" /> : rejectedCount})
                                    </Button>
                                    {/* <Button
                                        color={viewStatus === 'all' ? 'primary' : 'light'}
                                        onClick={() => setViewStatus('all')}>
                                        All ({indents.length})
                                    </Button> */}
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

                {/* MODALS */}
                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.displayIndentNo} ({selectedIndent.status})</ModalHeader>
                        <ModalBody className="scrollable-modal-body">
                            {renderIndentTemplate(selectedIndent)}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                            {/* Removed: Resubmit button from view modal */}
                        </ModalFooter>
                    </Modal>
                )}

                {/* Removed: PmResubmitQtyModal */}


                <Modal isOpen={isRejectModalOpen} toggle={toggleRejectModal} centered disabled={isActionLoading}>
                    <ModalHeader toggle={toggleRejectModal}>Reject Indent: {selectedIndent?.displayIndentNo}</ModalHeader>
                    <ModalBody>
                        {isActionLoading && <div className="text-center"><Spinner size="lg" color="danger" /><p className='mt-2'>Submitting Rejection (Flag 1) to /indent/rejected...</p></div>}
                        {!isActionLoading && (
                            <FormGroup>
                                <Label htmlFor="rejectionReason">Rejection Reason <span className="text-danger">*</span></Label>
                                <Input type="textarea" id="rejectionReason" rows="3" value={rejectionReason} onChange={(e) => { setRejectionReason(e.target.value); setFormError(''); }} placeholder="Provide a clear reason (e.g., Quantity mismatch found in section 2)" />
                                {formError && <p className="text-danger mt-2">{formError}</p>}
                            </FormGroup>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleRejectModal} disabled={isActionLoading}>Cancel</Button>
                        <Button color="danger" onClick={handleRejectSubmit} disabled={isActionLoading}>
                            {isActionLoading ? <Spinner size="sm" /> : 'Reject Indent'}
                        </Button>
                    </ModalFooter>
                </Modal>

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

                <Modal isOpen={isAcknowledgementModalOpen} toggle={toggleAcknowledgementModal} centered size="lg">
                    <ModalHeader toggle={toggleAcknowledgementModal}>Acknowledgement Preview: {acknowledgementData?.displayIndentNo}</ModalHeader>
                    <ModalBody className="scrollable-modal-body">{renderAcknowledgementTemplate(acknowledgementData)}</ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleAcknowledgementModal}>Cancel</Button>
                        <Button color="primary" onClick={handleSubmitAcknowledgement}>Submit Acknowledgement</Button>
                    </ModalFooter>
                </Modal>

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
                .text-end { text-align: right; } /* Added for number alignment */
            `}</style>
        </div>
    );
};

export default ViewIndent;