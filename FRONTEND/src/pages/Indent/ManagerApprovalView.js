import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Alert, Spinner
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg';
// Added projectHeadFetch import. IndentProjectHead remains for original Flags 1-9.
import { IndentProjectHead, projectHeadFetch } from '../../helpers/fakebackend_helper';

// =================================================================
// 1. CONSTANTS AND UTILITY FUNCTIONS
// =================================================================

const INITIAL_INDENTS = [];
const STATUS_MAP = {
    1: 'To Be Approved',
    2: 'Approved',
    3: 'Acknowledged', // Status ID 3 is explicitly used for 'Acknowledged' in the Flag 3 API call
    4: 'Resubmitted', // Status ID 4 for Resubmitted
    6: 'Rejected',    // Status ID 6 from your latest screenshot
};

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
                <Table bordered size="sm" className="mb-4"><thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th></tr></thead><tbody>{selectedOptions.map((option, index) => (<tr key={index}><td>{index + 1}</td><td>{option.divisionName || indentData.division}</td><td>{option.subDivisionName || indentData.subDivision}</td><td>{option.name}</td></tr>))}</tbody></Table>
                <p>Kindly process and arrange for handover of physical consumer records of above mentioned location.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};

const renderAcknowledgementTemplate = (ackData) => {
    if (!ackData) return null;
    const selectedOptionsWithQuantity = ackData.selectedOptions || [];
    const isApprovedStatus = ackData.status === 'Approved';
    const isResubmittedStatus = ackData.status === 'Resubmitted';
    const isAcknowledgedStatus = ackData.status === 'Acknowledged';
    
    let titleText = 'Acknowledgement of Physical Records';
    if (isApprovedStatus) titleText = 'Confirmation of Records for Manager Review (Officer Approved)';
    if (isResubmittedStatus) titleText = 'RESUBMITTED: Records Awaiting Correction';
    if (isAcknowledgedStatus) titleText = 'FINAL ACKNOWLEDGEMENT: Physical Records Received';
    
    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><div><strong>Indent No.:</strong> {ackData.indentNumber}</div><div style={{ textAlign: 'right' }}><div><strong>Date:</strong> {ackData.date}</div><div><strong>Time:</strong> {ackData.time}</div></div></div>
                <div><p>To,</p><p>The Project Manager</p><p>Vishvin Technologies</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}><p>Subject: {titleText} for {ackData.selectedOptionNames}</p><p>DWA No: 14,42,53,250</p></div>
                
                {/* REMOVED: The display of the historical managerComment for resubmitted status. */}
                {/* {isResubmittedStatus && ackData.managerComment && (
                    <div className="alert alert-primary mb-3 p-2 border border-primary">
                        <strong>Reason for Resubmission:</strong> {ackData.managerComment}
                    </div>
                )} */}

                <div><p>Dear Sir/Madam,</p><p>This is to acknowledge the receipt of the physical consumer records with reference to the above DWA no and subject for the below listed location(s).</p></div>
                <Table bordered size="sm" className="mb-4">
                    <thead><tr><th>SL NO</th><th>Division</th><th>Sub-Division</th><th>Section / Sub-Division</th><th>Quantity Received</th></tr></thead>
                    <tbody>
                        {selectedOptionsWithQuantity.map((option, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{option.divisionName}</td>
                                <td>{option.subDivisionName}</td>
                                <td>{option.name}</td>
                                <td>{option.quantity}</td> {/* This is the displayed quantity (OOQty for Resubmitted) */}
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <p>The handover of the physical consumer records for the above mentioned locations has been processed.</p>
                <div style={{ marginTop: '40px' }}><p>Thanking you,</p><p>Yours faithfully,</p><br /><p>_________________________</p><p><small>Disclaimer * seal is not mandatory</small></p><p><small>(This is a computer/system generated copy)</small></p></div>
            </div>
        </div>
    );
};

// =================================================================
// 2. API DATA FETCHING LOGIC 
// =================================================================

const normalizeManagerIndentData = (apiData) => {
    return apiData.map(item => {
        // Use ApprovedOn or ActionOn (for resubmit)
        const createdDate = new Date(item.ApprovedOn || item.ActionOn || item.UploadedAt || item.IndentCreatedOn || new Date());
        // Determine Status
        // Note: StatusName might be "ResubmittedToOfficers", which maps to "Resubmitted" via IndentStatus_Id: 4
        const status = item.StatusName || STATUS_MAP[item.IndentStatus_Id || item.Status_Id] || 'Unknown';
        const isResubmitted = status === 'Resubmitted' || status === 'ResubmittedToOfficers';

        let selectedOptions = [];
        
        // Extract required fields from API response item
        const indentId = item.Indent_Id || 0;
        const versionLabel = item.VersionLabels || item.VersionLabel || 'v1';
        const divCode = item.div_codes || '';
        const sdCode = item.sd_codes || '';
        
        // **CRITICAL FIELDS FOR QUANTITY AND NAMES**
        const officerEnteredQtys = item.OfficerEnteredQtys || item.OfficerEnteredQty || item.EnteredQtys || item.EnteredQty || '0';
        
        const sectionQtyDetailId = item.SectionQtyDetail_Id || 0;
        const sectionOfficeCode = item.so_codes || item.sd_codes || '';
        
        // Use the collective names from the primary object
        const divisionNames = item.division_names || item.DivisionNames || 'N/A';
        const subDivisionNames = item.subdivision_names || item.SubDivisionNames || 'N/A';
        const sectionNames = item.section_names || item.SectionNames || 'N/A';
        
        // **Extract DO_Role_Id dynamically from the API response**
        let doRoleId = item.SubmitToRole_Id || item.DO_Role_Id || item.ActionByRole_Id || item.ApprovedByRole_Id || item.LastActionByRole_Id || null;
        
        if (doRoleId) {
            const parsedDoRoleId = parseInt(doRoleId, 10);
            doRoleId = !isNaN(parsedDoRoleId) ? parsedDoRoleId : null;
        }

        // Determine the overall manager comment (if available in the first section for simplicity)
        let managerComment = null;

        // --- Populate selectedOptions array ---
        if (Array.isArray(item.sections) && item.sections.length > 0) {
            
            // Extract comment from the first section if resubmitted
            if (isResubmitted) {
                managerComment = item.sections[0].ApprovalHistoryComment || null;
            }

            selectedOptions = item.sections.map((section, index) => {
                // PMQty is Project Manager's (Officer's previous) quantity. OOQty is Overridden Quantity (Manager's corrected).
                const officerQty = section.OQty || section.PMQty || '0'; 
                const managerQty = section.OOQty || '0'; 
                const finalQty = section.FinalApprovedQty || managerQty;
                
                let quantityToDisplay;

                if (isResubmitted) {
                    quantityToDisplay = parseInt(managerQty, 10) || 0; // Show manager's corrected quantity (OOQty)
                } else if (status === 'Acknowledged') {
                    quantityToDisplay = parseInt(finalQty, 10) || 0;
                } else {
                    quantityToDisplay = parseInt(officerQty, 10) || 0; // Show officer's original confirmed quantity (OQty/PMQty)
                }
                
                // CRITICAL FIX FOR DISPLAY: Use division_names/subdivision_names/section_names from the section object 
                const sectionDivisionName = section.division_names || divisionNames;
                const sectionSubDivisionName = section.subdivision_names || subDivisionNames;
                const sectionName = section.section_names || section.so_code || 'N/A';
                

                return {
                    name: sectionName, 
                    code: section.so_code || section.sd_code,
                    quantity: quantityToDisplay,
                    
                    // Fields for row display in Modal (FIXED for 'N/A' issue)
                    divisionName: sectionDivisionName, 
                    subDivisionName: sectionSubDivisionName, 
                    
                    // Fields required for the final Flag 3/6 API payload
                    SectionQtyDetail_Id: section.SectionQtyDetail_Id || 0,
                    Indent_Id: indentId, 
                    VersionLabel: versionLabel,
                    div_code: section.div_code || divCode,
                    sd_code: section.sd_code || sdCode,
                    so_code: section.so_code || section.sd_code, 
                    OfficerEnteredQty: officerQty, // Officer's last recorded quantity
                    FinalApprovedQty: managerQty, // Manager's last recorded quantity (used for Flag 6/3 updates)
                };
            });
        } 
        // 2. Fallback to comma-separated fields 
        else {
            // This path is complex to accurately map OOQty/PMQty and is simplified.
            const displayQuantities = (isResubmitted ? (item.OOQtys || item.OOQty || '0') : officerEnteredQtys).toString().split(',').map(qty => parseInt(qty.trim(), 10) || 0);
            const officerQuantities = (officerEnteredQtys.toString()).split(',').map(qty => parseInt(qty.trim(), 10) || 0);
            const names = (sectionNames).split(',').map(name => name.trim()).filter(name => name.length > 0);
            const codes = (item.so_codes || item.sd_codes || sectionOfficeCode).split(',').map(code => code.trim()).filter(code => code.length > 0);
            const detailIds = (item.SectionQtyDetail_Ids || sectionQtyDetailId.toString()).split(',').map(id => parseInt(id.trim(), 10) || 0);
            
            selectedOptions = names.map((name, index) => {
                const finalQuantity = displayQuantities[index] !== undefined ? displayQuantities[index] : 0;
                const officerQty = officerQuantities[index] !== undefined ? officerQuantities[index] : 0;
                const code = codes[index] || sectionOfficeCode; 
                const detailId = detailIds[index] || sectionQtyDetailId;

                return {
                    name: name, 
                    code: code,
                    quantity: finalQuantity, 
                    
                    divisionName: divisionNames, // Use the collective division name
                    subDivisionName: subDivisionNames, // Use the collective sub-division name
                    
                    SectionQtyDetail_Id: detailId,
                    Indent_Id: indentId, 
                    VersionLabel: versionLabel,
                    div_code: divCode,
                    sd_code: sdCode,
                    so_code: codes[index] || sectionOfficeCode, 
                    OfficerEnteredQty: officerQty.toString(), 
                    FinalApprovedQty: finalQuantity.toString(), 
                };
            });
        }

        const selectedOptionNames = selectedOptions.map(o => o.name).filter(n => n && n !== 'N/A').join(' / ');
        
        const approvedBy = (status === 'Approved' || status === 'Acknowledged' || isResubmitted) 
                                ? item.ApprovedByName || item.RequestUserName 
                                : item.CreatedByName || item.RequestUserName;

        return {
            // General Display fields
            indentNumber: item.fullIndentNo || item.Indent_No || item.Indent_Id,
            createdBy: item.CreatedByName || item.RequestUserName || 'N/A', 
            approvedBy: approvedBy || 'N/A', 
            createdOn: item.ApprovedOn || item.ActionOn || item.UploadedAt || item.IndentCreatedOn || new Date(),
            date: createdDate.toLocaleDateString('en-GB'),
            time: createdDate.toLocaleTimeString('en-US', { hour12: true }),
            division: divisionNames,
            subDivision: subDivisionNames,
            divisionCode: item.div_codes || null,
            subDivisionCode: item.sd_codes || null,
            submitTo: item.SubmitTo || 'subdivision', 
            status: isResubmitted ? 'Resubmitted' : status, // Ensure status is consistent 'Resubmitted'
            selectedOptionNames: selectedOptionNames,
            managerComment: managerComment, // Comment for resubmission/rejection
            
            // Section data array with API payload fields
            selectedOptions: selectedOptions, 
            Indent_Id_For_API: indentId, 
            ApprovedFilePath: item.ApprovedFilePath || '',
            doRoleId: doRoleId, 
        };
    });
};

// --- API FETCH UTILITY (Improved for Flag 1/3's nested count) ---

const extractCountFromResponse = (response) => {
    if (response && response.status === 'success') {
        // Priority 1: Direct numeric count field (Flag 2 format: { "count": 1, ... })
        if (response.count !== undefined && typeof response.count === 'number') {
            return response.count;
        }
        
        // Priority 2: Count nested in the 'count' array (Flag 1/3 format: {"count": [ { "TotalIndents": 1 } ]} or {"count": [ { "RejectedIndentCount": 1 } ]})
        if (Array.isArray(response.count) && response.count.length > 0) {
            if (response.count[0].TotalIndents !== undefined) {
                 return parseInt(response.count[0].TotalIndents, 10) || 0;
            }
            // **CRITICAL FIX for Flag 3 Rejected Count**
            if (response.count[0].RejectedIndentCount !== undefined) {
                 return parseInt(response.count[0].RejectedIndentCount, 10) || 0;
            }
        }
        
        // Priority 3: Direct count field from the result wrapper (as seen in Flag 7 response)
        if (response.result && response.result.count !== undefined) {
            return parseInt(response.result.count, 10) || 0;
        }
        
        // Priority 4: Nested result array for totalCount (Fallback for other flags)
        const nestedResult = response.result && response.result.result && Array.isArray(response.result.result) 
            ? response.result.result : response.result;
        
        if (Array.isArray(nestedResult) && nestedResult.length > 0) {
            if (nestedResult[0].totalCount !== undefined) {
                return parseInt(nestedResult[0].totalCount, 10) || 0;
            }
            if (nestedResult[0].TotalApprovedIndents !== undefined) {
                return parseInt(nestedResult[0].TotalApprovedIndents, 10) || 0;
            }
            if (nestedResult[0].TotalIndents !== undefined) {
                 return parseInt(nestedResult[0].TotalIndents, 10) || 0;
            }
        } 
    }
    return 0; // Always return a number
}


// =================================================================
// **ORIGINAL API FETCH FUNCTIONS for Acknowledge Queue (Flags 1 & 2 on IndentProjectHead)**
// =================================================================
// NOTE: These functions remain UNTOUCHED, using IndentProjectHead.

const fetchManagerAcknowledgeData = async (sessionData, setIndents, setIsLoading, setError) => {
    const userId = sessionData.userId || null;
    const requestUserName = sessionData.requestUserName || null; 

    setIsLoading(true);
    setError(null);
    setIndents([]);

    const payload = { "flagId": 2, "CreatedByUser_Id": userId, "RequestUserName": requestUserName };

    try {
        const response = await IndentProjectHead(payload);

        // **CRITICAL FIX: Handle nested response structure**
        const resultData = response && response.result && response.result.result ? response.result.result : response.result;
        
        if (response && response.status === 'success' && resultData) {
            const apiData = Array.isArray(resultData) ? resultData : [];
            const normalizedData = normalizeManagerIndentData(apiData);
            setIndents(normalizedData);
        } else if (response && response.status === 'success') {
            setIndents([]);
        } else {
            setError(response.message || response.result?.message || 'Failed to fetch acknowledge indents (Flag 2).');
        }
    } catch (err) {
        console.error("API Fetch Error (Flag 2 - IndentProjectHead):", err);
        setError('An unexpected network error occurred while fetching the acknowledge queue.');
    } finally {
        setIsLoading(false);
    }
};

const fetchManagerAcknowledgeCount = async (sessionData, setIsCountLoading, setCount) => {
    const userId = sessionData.userId || null;
    const requestUserName = sessionData.requestUserName || null;
    
    setIsCountLoading(true);

    const countPayload = { 
        "flagId": 1, // API Flag for Approved/Acknowledge Queue Count (Pending Manager Acknowledge)
        "CreatedByUser_Id": userId, 
        "RequestUserName": requestUserName 
    };

    try {
        const response = await IndentProjectHead(countPayload);
        let count = 0;

        if (response && response.status === 'success') {
            const nestedResult = response.result && response.result.result && Array.isArray(response.result.result) ? response.result.result : response.result;
            
            // Priority 1: Check nested 'totalCount' from the result array (common new structure)
            if (Array.isArray(nestedResult) && nestedResult.length > 0 && nestedResult[0].totalCount !== undefined) {
                count = nestedResult[0].totalCount;
            } 
            // Priority 2: Fallback to top-level 'count' or nested count field (common generic fallback)
            else if (response.count !== undefined) {
                count = response.count;
            } 
            // Fallback 3: Check nested 'TotalApprovedIndents' (older structure for Flag 1)
            else if (Array.isArray(nestedResult) && nestedResult.length > 0 && nestedResult[0].TotalApprovedIndents !== undefined) {
                count = nestedResult[0].TotalApprovedIndents;
            } else if (response.result && response.result.count !== undefined) {
                count = response.result.count;
            }
            
            setCount(count);
        } else {
            console.error("API reported failure for Flag 1 count:", response.message || 'Unknown API Error');
            setCount(0);
        }
    } catch (err) {
        console.error("Network error fetching acknowledge count (Flag 1 - IndentProjectHead):", err);
        setCount(0);
    } finally {
        setIsCountLoading(false);
    }
};


// =================================================================
// **NEW API FETCH FUNCTIONS for Pending Officer Approval (Flags 1 & 2 on projectHeadFetch)**
// =================================================================

const fetchPendingOfficerApprovalData = async (sessionData, setIndents, setIsLoading, setError) => {
    const requestUserName = sessionData.requestUserName || null; 

    setIsLoading(true);
    setError(null);
    setIndents([]);

    // Flag 2 payload from previous request
    const payload = { "flagId": 2, "RequestUserName": requestUserName };

    try {
        // **Uses projectHeadFetch**
        const response = await projectHeadFetch(payload); 

        // Response structure for Flag 2: { status: 'success', count: 1, result: [...] }
        const resultData = response && response.result ? response.result : [];
        
        if (response && response.status === 'success' && resultData) {
            const apiData = Array.isArray(resultData) ? resultData : [];
            const normalizedData = normalizeManagerIndentData(apiData);
            setIndents(normalizedData);
        } else if (response && response.status === 'success') {
            setIndents([]);
        } else {
            setError(response.message || 'Failed to fetch pending officer indents (Flag 2 - new route).');
        }
    } catch (err) {
        console.error("API Fetch Error (Flag 2 - projectHeadFetch):", err);
        setError('An unexpected network error occurred while fetching the pending officer approval queue.');
    } finally {
        setIsLoading(false);
    }
};

const fetchPendingOfficerApprovalCount = async (sessionData, setIsCountLoading, setCount) => {
    const requestUserName = sessionData.requestUserName || null;
    
    setIsCountLoading(true);

    // Flag 1 payload from previous request
    const countPayload = { "flagId": 1, "RequestUserName": requestUserName };

    try {
        // **Uses projectHeadFetch**
        const response = await projectHeadFetch(countPayload);
        
        setCount(extractCountFromResponse(response));
        
    } catch (err) {
        console.error("Network error fetching pending officer approval count (Flag 1 - projectHeadFetch):", err);
        setCount(0);
    } finally {
        setIsCountLoading(false);
    }
};

// =================================================================
// **NEW API FETCH FUNCTIONS for Rejected Officer Data (Flags 3 & 4 on projectHeadFetch)**
// =================================================================

/**
 * Fetches the count for the rejected officer indents (Flag 3) using projectHeadFetch.
 */
const fetchPendingOfficerRejectedCount = async (sessionData, setIsCountLoading, setCount) => {
    const requestUserName = sessionData.requestUserName || null;
    
    setIsCountLoading(true);

    // Flag 3: Fetching rejected count. Payload mimics screenshot.
    const countPayload = { "flagId": 3, "RequestUserName": requestUserName };

    try {
        // **Uses projectHeadFetch**
        const response = await projectHeadFetch(countPayload);
        
        // Count extraction is robust for this nested format
        setCount(extractCountFromResponse(response));
        
    } catch (err) {
        console.error("Network error fetching rejected officer count (Flag 3 - projectHeadFetch):", err);
        setCount(0);
    } finally {
        setIsCountLoading(false);
    }
};

/**
 * Fetches the data for the rejected officer indents (Flag 4) using projectHeadFetch.
 */
const fetchPendingOfficerRejectedData = async (sessionData, setIndents, setIsLoading, setError) => {
    const requestUserName = sessionData.requestUserName || null; 

    setIsLoading(true);
    setError(null);
    setIndents([]);

    // Flag 4: Fetching rejected data. Payload mimics screenshot.
    const payload = { "flagId": 4, "RequestUserName": requestUserName };

    try {
        // **Uses projectHeadFetch**
        const response = await projectHeadFetch(payload); 

        // Response structure for Flag 4: { status: 'success', count: 1, result: [...] }
        const resultData = response && response.result ? response.result : [];
        
        if (response && response.status === 'success' && resultData) {
            const apiData = Array.isArray(resultData) ? resultData : [];
            // Map status manually if needed, but normalizeManagerIndentData should handle the Status_Id: 6 -> 'Rejected'
            const normalizedData = normalizeManagerIndentData(apiData);
            setIndents(normalizedData);
        } else if (response && response.status === 'success') {
            setIndents([]);
        } else {
            setError(response.message || 'Failed to fetch pending rejected indents (Flag 4 - new route).');
        }
    } catch (err) {
        console.error("API Fetch Error (Flag 4 - projectHeadFetch):", err);
        setError('An unexpected network error occurred while fetching the rejected officer queue.');
    } finally {
        setIsLoading(false);
    }
};

// =================================================================
// **REMAINING API FETCH FUNCTIONS** (Original - Uses IndentProjectHead)
// =================================================================

const fetchManagerAcknowledgedData = async (sessionData, setIndents, setIsLoading, setError) => {
    const userId = sessionData.userId || null;
    const requestUserName = sessionData.requestUserName || null; 

    setIsLoading(true);
    setError(null);
    setIndents([]);

    // Flag 5 original payload (uses IndentProjectHead)
    const payload = { "flagId": 5, "CreatedByUser_Id": userId, "RequestUserName": requestUserName };

    try {
        const response = await IndentProjectHead(payload);
        const resultData = response && response.result && response.result.result ? response.result.result : response.result;

        if (response && response.status === 'success' && resultData) {
            const apiData = Array.isArray(resultData) ? resultData : [];
            const normalizedData = normalizeManagerIndentData(apiData.map(item => ({...item, IndentStatus_Id: 3})));
            setIndents(normalizedData);
        } else if (response && response.status === 'success') {
            setIndents([]);
        } else {
            setError(response.message || response.result?.message || 'Failed to fetch acknowledged indents (Flag 5).');
        }
    } catch (err) {
        console.error("API Fetch Error (Flag 5):", err);
        setError('An unexpected network error occurred while fetching the acknowledged indents.');
    } finally {
        setIsLoading(false);
    }
};

const fetchManagerAcknowledgedCount = async (sessionData, setIsCountLoading, setCount) => {
    const userId = sessionData.userId || null;
    const requestUserName = sessionData.requestUserName || null;
    
    setIsCountLoading(true);
    // Flag 4 original payload (uses IndentProjectHead)
    const countPayload = { "flagId": 4, "CreatedByUser_Id": userId, "RequestUserName": requestUserName };

    try {
        const response = await IndentProjectHead(countPayload);
        setCount(extractCountFromResponse(response));
    } catch (err) {
        console.error("Network error fetching acknowledged count (Flag 4):", err);
        setCount(0);
    } finally {
        setIsCountLoading(false);
    }
};

const fetchManagerResubmitCount = async (sessionData, setIsCountLoading, setCount) => {
    const userId = sessionData.userId || null;
    const requestUserName = sessionData.requestUserName || null;
    
    setIsCountLoading(true);
    
    // Flag 7 original payload (uses IndentProjectHead)
    const countPayload = { 
        "flagId": 7, // API Flag for Resubmitted to Officer Count
        "CreatedByUser_Id": userId, 
        "RequestUserName": requestUserName 
    };

    try {
        const response = await IndentProjectHead(countPayload);
        setCount(extractCountFromResponse(response)); 
    } catch (err) {
        console.error("Network error fetching resubmit count (Flag 7):", err);
        setCount(0);
    } finally {
        setIsCountLoading(false);
    }
};

const fetchManagerResubmitData = async (sessionData, setIndents, setIsLoading, setError) => {
    const userId = sessionData.userId || null;
    const requestUserName = sessionData.requestUserName || null; 

    setIsLoading(true);
    setError(null);
    setIndents([]);

    // Flag 8 original payload (uses IndentProjectHead)
    const payload = { 
        "flagId": 8, // API Flag for Resubmitted to Officer Data
        "CreatedByUser_Id": userId, 
        "RequestUserName": requestUserName 
    };

    try {
        const response = await IndentProjectHead(payload);

        const resultData = response && response.result && response.result.result ? response.result.result : response.result;

        if (response && response.status === 'success' && resultData) {
            const apiData = Array.isArray(resultData) ? resultData : [];
            const normalizedData = normalizeManagerIndentData(apiData.map(item => ({...item, IndentStatus_Id: 4, StatusName: 'Resubmitted'})));
            setIndents(normalizedData);
        } else if (response && response.status === 'success') {
            setIndents([]);
        } else {
            setError(response.message || response.result?.message || 'Failed to fetch resubmitted indents (Flag 8).');
        }
    } catch (err) {
        console.error("API Fetch Error (Flag 8):", err);
        setError('An unexpected network error occurred while fetching resubmitted indents.');
    } finally {
        setIsLoading(false);
    }
};


// =================================================================
// 3. MAIN COMPONENT
// =================================================================

const ManagerApprovalView = () => {
    document.title = `Manager Review | DMS`;

    // --- State Variables ---
    const [indents, setIndents] = useState(INITIAL_INDENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // View Statuses: 'approved'(Flag 2 IH), 'acknowledged'(Flag 5 IH), 'resubmitted'(Flag 8 IH), 
    // 'to_approve'(Flag 2 PF), 'rejected_officer'(NEW Flag 4 PF)
    const [viewStatus, setViewStatus] = useState('approved'); 

    // Counts (API driven)
    const [acknowledgeCount, setAcknowledgeCount] = useState(0); // Original Flag 1 (IndentProjectHead)
    const [acknowledgedCount, setAcknowledgedCount] = useState(0); // Flag 4 (Acknowledged)
    const [resubmitCount, setResubmitCount] = useState(0); // Flag 7 (Resubmitted to Officer)
    const [pendingOfficerApprovalCount, setPendingOfficerApprovalCount] = useState(0); // NEW Flag 1 (projectHeadFetch)
    // NEW state for the new Rejected queue
    const [pendingOfficerRejectedCount, setPendingOfficerRejectedCount] = useState(0); 

    const [isCountLoading, setIsCountLoading] = useState(false); 

    // Modals & Forms
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isAcknowledgementModalOpen, setIsAcknowledgementModalOpen] = useState(false);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false); 
    const [acknowledgementData, setAcknowledgementData] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [resubmitComment, setResubmitComment] = useState('');
    const [formError, setFormError] = useState('');
    const [sectionQuantities, setSectionQuantities] = useState([]);
    const [responseModalContent, setResponseModalContent] = useState({ title: '', message: '', isSuccess: false });
    
    // State for the generated PDF path
    const [finalPdfPath, setFinalPdfPath] = useState('');

    // Table States
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // --- Session Data Retrieval ---
    const sessionData = useMemo(() => {
        const defaultData = { userId: null, roleId: null, requestUserName: null };
        const storageKeys = ['loginData', 'authUser', 'user'];

        let userData = null;
        for (const key of storageKeys) {
            const dataString = sessionStorage.getItem(key);
            if (dataString) {
                try {
                    const data = JSON.parse(dataString);
                    if (data.user && data.user.User_Id) { userData = data.user; break; }
                    if (data.User_Id && data.Email) { userData = data; break; }
                } catch (e) { /* ignore */ }
            }
        }
        
        const fallbackUserId = sessionStorage.getItem('User_Id') || sessionStorage.getItem('userId');
        const fallbackRoleId = sessionStorage.getItem('Role_Id') || sessionStorage.getItem('roleId');
        const fallbackEmail = sessionStorage.getItem('Email') || sessionStorage.getItem('requestUserName');

        if (userData && userData.User_Id && userData.Email) {
            return {
                userId: userData.User_Id || null,
                roleId: userData.Role_Id || null,
                requestUserName: userData.Email || null,
            };
        } else if (fallbackUserId && fallbackEmail) {
            return {
                userId: parseInt(fallbackUserId, 10) || null,
                roleId: parseInt(fallbackRoleId, 10) || null,
                requestUserName: fallbackEmail,
            };
        }

        return defaultData;
    }, []);

    // --- Effects (API Calls & Data Refresh) ---
    const refreshData = useCallback(() => {
        if (!sessionData.requestUserName) {
            setFetchError("Authentication error: Missing RequestUserName session data.");
            return;
        }

        setFetchError(null);
        setPage(0);

        // --- Data Fetching ---
        if (viewStatus === 'approved') {
            fetchManagerAcknowledgeData(sessionData, setIndents, setIsLoading, setFetchError); 
        } else if (viewStatus === 'acknowledged') {
            fetchManagerAcknowledgedData(sessionData, setIndents, setIsLoading, setFetchError);
        } else if (viewStatus === 'resubmitted') {
            fetchManagerResubmitData(sessionData, setIndents, setIsLoading, setFetchError);
        } else if (viewStatus === 'to_approve') {
            fetchPendingOfficerApprovalData(sessionData, setIndents, setIsLoading, setFetchError);
        } else if (viewStatus === 'rejected_officer') {
             // NEW Flag 4, projectHeadFetch logic (Pending Rejected)
            fetchPendingOfficerRejectedData(sessionData, setIndents, setIsLoading, setFetchError);
        }
           else {
            setIndents([]);
            setIsLoading(false);
        }
        
        // --- Count Fetching ---
        fetchManagerAcknowledgeCount(sessionData, setIsCountLoading, setAcknowledgeCount); 
        fetchPendingOfficerApprovalCount(sessionData, setIsCountLoading, setPendingOfficerApprovalCount);
        fetchManagerAcknowledgedCount(sessionData, setIsCountLoading, setAcknowledgedCount); 
        fetchManagerResubmitCount(sessionData, setIsCountLoading, setResubmitCount); 
        // NEW Flag 3 count (projectHeadFetch)
        fetchPendingOfficerRejectedCount(sessionData, setIsCountLoading, setPendingOfficerRejectedCount);
    }, [sessionData, viewStatus]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);


    // --- Core Filtering, Sorting, and Pagination Logic ---
    const filteredIndents = useMemo(() => {
        let results = indents;
        
        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.approvedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) // Filter on Approved By
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

    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, page, pageSize]);

    // --- MODAL TOGGLES ---
    const toggleViewModal = useCallback(() => setIsViewModalOpen(prev => !prev), []);
    const toggleRejectModal = useCallback(() => setIsRejectModalOpen(prev => !prev), []);
    const toggleQuantityModal = useCallback(() => setIsQuantityModalOpen(prev => !prev), []);
    const toggleAcknowledgementModal = useCallback(() => setIsAcknowledgementModalOpen(prev => !prev), []);
    const toggleResponseModal = useCallback(() => setIsResponseModalOpen(prev => !prev), []);
    const toggleResubmitModal = useCallback(() => setIsResubmitModalOpen(prev => !prev), []);

    // --- PDF PATH SIMULATION ---
    const generateFinalPdf = (indentNumber) => {
        // **PLACEHOLDER: This simulates generating the PDF and getting its path/URL**
        const path = `/files/approved_indents/${indentNumber}-${Date.now()}.pdf`;
        setFinalPdfPath(path);
        return path;
    };
    
    // --- HELPER & ACTION FUNCTIONS ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Acknowledged': return 'info';
            case 'Rejected': return 'danger';
            case 'To Be Approved': return 'warning';
            case 'Resubmitted': return 'primary';
            default: return 'secondary';
        }
    };
    
    const handleViewClick = (indent) => {
        setSelectedIndent(indent);
        toggleViewModal();
    };

    const handleOpenAcknowledge = () => {
        if (!selectedIndent || selectedIndent.status !== 'Approved') return;
        
        // Prepare initial section quantities for editing in the modal
        const initialQuantities = selectedIndent.selectedOptions.map(option => ({
            ...option,
            // When opening acknowledge modal (from Approved queue), pre-fill the input with the quantity 
            // the officer confirmed, which is stored in the 'quantity' field of normalized data for Flag 2.
            quantity: option.quantity.toString() || '' 
        }));
        
        setSectionQuantities(initialQuantities);
        setFormError('');
        toggleViewModal();
        toggleQuantityModal();
    };
    
    const handleOpenResubmit = () => {
        if (!selectedIndent || selectedIndent.status !== 'Approved') return;

        // Pre-fill with the officer's confirmed quantity
        const initialQuantities = selectedIndent.selectedOptions.map(option => ({
            ...option,
            quantity: option.quantity.toString() || ''
        }));
        
        setSectionQuantities(initialQuantities);
        setResubmitComment(''); // Clears previous comment state
        setFormError('');
        toggleViewModal();
        toggleResubmitModal();
    };

    /**
     * Integrates the Resubmit logic using flagId: 6 and dynamically retrieved DO_Role_Id.
     */
    const handleResubmitSubmit = async () => {
        if (!resubmitComment.trim()) { setFormError('Resubmit comment is required.'); return; }
        
        if (!selectedIndent.doRoleId) { 
            setFormError('Cannot resubmit: Missing destination DO_Role_Id from fetched data.'); 
            console.error('Missing DO_Role_Id for resubmission on indent. Fetched value:', selectedIndent.doRoleId);
            return; 
        }

        const invalidQuantity = sectionQuantities.some(item =>
            item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity))
        );

        if (invalidQuantity) {
            setFormError('All quantities must be entered and be non-negative integers.');
            return;
        }

        setFormError('');
        setIsActionLoading(true);

        // 1. Construct the 'sections' array for Flag 6 payload
        const sectionsPayload = sectionQuantities.map(q => {
            const originalOption = selectedIndent.selectedOptions.find(opt => opt.code === q.code);
            
            // Structure matching the screenshot for resubmitting the corrected qty
            return {
                "SectionQtyDetail_Id": originalOption.SectionQtyDetail_Id,
                "PMQty": originalOption.OfficerEnteredQty,            // Project Manager (Officer) Quantity - Officer's confirmed qty
                "OOQty": q.quantity,                                 // Override/Overridden Quantity - Manager's corrected/final quantity
                "ApprovalHistoryComment": resubmitComment,           // The main comment needs to be attached to each section
            };
        });

        // 2. Construct the main Flag 6 payload
        const resubmitPayload = {
            "flagId": 6,                                             // **REQUIRED FLAG ID 6**
            "Indent_Id": selectedIndent.Indent_Id_For_API,           
            "ActionByUser_Id": sessionData.userId,                   // User performing the action
            "Role_Id": sessionData.roleId,                           // User's Role ID (Project Manager)
            "DO_Role_Id": selectedIndent.doRoleId,                   // **DYNAMICALLY SET DO_Role_Id from Flag 2 response**
            "Status_Id": 4,                                          // Status ID 4 often means 'Resubmitted'
            "sections": sectionsPayload                              
        };
        
        console.log("Flag 6 Resubmit Payload:", resubmitPayload);

        try {
            // **API CALL for Flag 6 (Uses IndentProjectHead)**
            const response = await IndentProjectHead(resubmitPayload); 

            if (response && response.status === 'success') {
                setResponseModalContent({
                    title: 'Resubmitted Successfully!',
                    message: `Indent ${selectedIndent.indentNumber} has been sent back to the officer for review.`,
                    isSuccess: true
                });
                toggleResubmitModal();
                toggleResponseModal();
                refreshData();
            } else {
                setFormError(response.message || response.error || "Failed to submit resubmission.");
            }
        } catch (error) {
            console.error("API Error (Flag 6):", error);
            setFormError("A network error occurred during resubmission.");
        } finally {
            setIsActionLoading(false);
        }
    }; 

    const handleOpenReject = () => {
        setRejectionReason('');
        setFormError('');
        toggleViewModal();
        toggleRejectModal();
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) { setFormError('Rejection reason is required.'); return; }

        setIsActionLoading(true);

        // API Call Mockup for Reject (Flag 9 - Placeholder)
        const rejectPayload = {
            "flagId": 9, 
            "Indent_Id": selectedIndent.Indent_Id_For_API, // Use the numeric ID
            "RejectionReason": rejectionReason,
            "UpdatedByUser_Id": sessionData.userId || null,
            "RequestUserName": sessionData.requestUserName || null,
        };

        try {
            // NOTE: Using a simulated response here as the full backend implementation for flag 9 is missing.
            const response = { status: 'success', message: 'Indent permanently rejected.' }; 
            // const response = await IndentProjectHead(rejectPayload); 

            if (response.status === 'success') {
                setResponseModalContent({
                    title: 'Rejected',
                    message: `Indent ${selectedIndent.indentNumber} has been permanently rejected.`,
                    isSuccess: false
                });
                toggleRejectModal();
                toggleResponseModal();
                refreshData();
            } else {
                setFormError(response.message || "Failed to reject indent.");
            }
        } catch (error) {
            setFormError("A network error occurred during rejection.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleQuantitySubmit = () => {
        const invalidQuantity = sectionQuantities.some(item =>
            item.quantity === '' || item.quantity === null || parseInt(item.quantity) < 0 || isNaN(parseInt(item.quantity))
        );

        if (invalidQuantity) {
            setFormError('All quantities must be entered and be non-negative integers.');
            return;
        }

        // 1. Prepare data for the acknowledgement preview and the final API payload
        const ackData = {
            ...selectedIndent,
            status: 'Acknowledged',
            // CRITICAL FIX: Ensure top-level division/subDivision names are available for the modal header/rows
            division: selectedIndent.division,
            subDivision: selectedIndent.subDivision,
            
            selectedOptions: sectionQuantities.map(item => {
                const originalOption = selectedIndent.selectedOptions.find(opt => opt.code === item.code) || {};
                
                return {
                    name: item.name,
                    code: item.code,
                    quantity: parseInt(item.quantity, 10), // This is the FinalApprovedQty for display
                    
                    // CRITICAL FIX FOR THE BUG: Explicitly set division/subDivision names for the table rows in the final template preview
                    divisionName: originalOption.divisionName || selectedIndent.division,
                    subDivisionName: originalOption.subDivisionName || selectedIndent.subDivision,
                    
                    // Fields required for the final Flag 3 API payload
                    SectionQtyDetail_Id: originalOption.SectionQtyDetail_Id || 0,
                    Indent_Id: originalOption.Indent_Id || selectedIndent.Indent_Id_For_API, // Indent_Id REMAINS in sections
                    VersionLabel: originalOption.VersionLabel || 'v1',
                    div_code: originalOption.div_code || selectedIndent.divisionCode,
                    sd_code: originalOption.sd_code || selectedIndent.subDivisionCode,
                    so_code: originalOption.so_code || item.code, // Use so_code if available, otherwise the main code
                    OfficerEnteredQty: originalOption.OfficerEnteredQty || '0', 
                    FinalApprovedQty: item.quantity, // Manager's entered final quantity (as a string)
                };
            })
        };
        
        // 2. Generate the PDF path now (simulated)
        generateFinalPdf(selectedIndent.indentNumber);

        setAcknowledgementData(ackData);
        toggleQuantityModal();
        toggleAcknowledgementModal();
    };
    
    // **THE REQUIRED API INTEGRATION FUNCTION (FLAG 3) - MODIFIED FOR FORM-DATA**
    const handleAcknowledgeFinalSubmit = async () => {
        if (!acknowledgementData || !finalPdfPath) {
             setFormError("PDF path is missing. Please review the process.");
             return;
        }
        
        setIsActionLoading(true);

        const { selectedOptions } = acknowledgementData;

        // 1. Construct the 'sections' payload array for Form Data
        const sectionsPayload = selectedOptions.map(section => ({
            "SectionQtyDetail_Id": section.SectionQtyDetail_Id,
            "Indent_Id": section.Indent_Id, // REMAINS HERE as per original sample structure
            "VersionLabel": section.VersionLabel,
            "div_code": section.div_code,
            "sd_code": section.sd_code,
            "so_code": section.so_code,
            "OfficerEnteredQty": section.OfficerEnteredQty,
            "FinalApprovedQty": section.FinalApprovedQty, 
        }));
        
        // Stringify the sections array, as FormData requires simple string/file values
        const sectionsString = JSON.stringify(sectionsPayload);

        // 2. Construct the final FormData payload
        const finalApprovedPayload = new FormData();
        
        // Append all required fields as form-data key-value pairs (as strings)
        finalApprovedPayload.append("flagId", '3'); // Must be a string for FormData
        finalApprovedPayload.append("ApprovedByUser_Id", sessionData.userId.toString());
        finalApprovedPayload.append("ApprovedByRole_Id", sessionData.roleId.toString());
        finalApprovedPayload.append("Status_Id", '3'); // Hardcoded as 3 (Acknowledged)
        finalApprovedPayload.append("requestUserName", sessionData.requestUserName); // Renamed to requestUserName as per screenshot
        
        // Appending the stringified complex array
        finalApprovedPayload.append("sections", sectionsString); 
        
        // Appending the path.
        finalApprovedPayload.append("ApprovedFilePath", finalPdfPath); 

        // Log the contents of FormData for debugging (requires iteration)
        const debugPayload = {};
        finalApprovedPayload.forEach((value, key) => { debugPayload[key] = value; });
        console.log("Final Acknowledge Payload (FormData):", debugPayload);


        try {
            // **API CALL for Flag 3 (Uses IndentProjectHead)**
            const response = await IndentProjectHead(finalApprovedPayload); 

            if (response && response.status === 'success') {
                setResponseModalContent({
                    title: 'Acknowledgement Success!',
                    message: `Final records for Indent ${acknowledgementData.indentNumber} have been successfully acknowledged.`,
                    isSuccess: true
                });
                toggleAcknowledgementModal();
                toggleResponseModal();
                refreshData();
            } else {
                setFormError(response.message || response.error || "Failed to finalize acknowledgment.");
            }
        } catch (error) {
            console.error("API Error (Flag 3):", error);
            setFormError("A network error occurred during final submission.");
        } finally {
            setIsActionLoading(false);
        }
    };
    
    const handleSectionQuantityChange = (code, value) => {
        // Allow empty string (clearing the field) or non-negative integers
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setSectionQuantities(prev => prev.map(item =>
                (item.code === code) ? { ...item, quantity: value } : item
            ));
            setFormError('');
        }
    };

    // --- RENDER FUNCTIONS ---
    
    const renderTableHeader = () => {
        const columns = [
            { header: 'Indent number', accessorKey: 'indentNumber', sortable: true },
            { header: 'Status', accessorKey: 'status', sortable: true },
            // UPDATED: Change 'Created by' to 'Approved By' and use accessorKey 'approvedBy'
            { header: 'Approved By', accessorKey: 'approvedBy', sortable: true }, 
            { header: 'Created on', accessorKey: 'createdOn', sortable: true },
            { header: 'View Indent', accessorKey: 'action', sortable: false },
        ];
        return (
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
    };

    const renderTableRows = () => {
        if (isLoading) { return (<tr><td colSpan={5} className="text-center py-5"><Spinner size="sm" className="me-2" /> Loading Indents...</td></tr>); }
        if (fetchError) { return (<tr><td colSpan={5} className="text-center py-5"><Alert color="danger" className="mb-0">{fetchError}</Alert></td></tr>); }
        if (!paginatedData || paginatedData.length === 0) {
            const noDataMessage = viewStatus === 'approved' 
                ? "No pending indents in the Acknowledge Queue." 
                : viewStatus === 'acknowledged'
                ? "No indents found in the Acknowledged list."
                : viewStatus === 'resubmitted'
                ? "No indents found in the Resubmitted to Officer list."
                : viewStatus === 'to_approve'
                ? "No pending indents in the Officer Approval queue."
                : viewStatus === 'rejected_officer'
                ? "No rejected indents pending officer action."
                : "No indents found in this queue.";

            return (<tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>{noDataMessage}</td></tr>);
        }
        return paginatedData.map((indent) => (
            <tr key={indent.indentNumber}>
                <td>{indent.indentNumber}</td>
                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                {/* UPDATED: Display Approved By Name */}
                <td>{indent.approvedBy}</td> 
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
            <Container fluid>
                <Card>
                    <CardHeader className="bg-primary text-white p-3"><h5 className="mb-0 text-white">Internal Indent Review</h5></CardHeader>
                    <CardBody>
                        <Row className="g-4 mb-3 align-items-center">
                            <Col sm={12}>
                                <div className="filter-button-group d-flex flex-wrap gap-2">
                                    <Button 
                                        color={viewStatus === 'approved' ? 'success' : 'light'} 
                                        onClick={() => setViewStatus('approved')}
                                        disabled={isLoading}>
                                        Acknowledge Queue ({isCountLoading ? <Spinner size="sm" color="success" /> : acknowledgeCount})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'acknowledged' ? 'info' : 'light'} 
                                        onClick={() => setViewStatus('acknowledged')}
                                        disabled={isLoading}>
                                        Acknowledged ({isCountLoading ? <Spinner size="sm" color="info" /> : acknowledgedCount})
                                    </Button>
                                    <Button 
                                        color={viewStatus === 'resubmitted' ? 'primary' : 'light'} 
                                        onClick={() => setViewStatus('resubmitted')}
                                        disabled={isLoading}>
                                        Resubmitted to Officer ({isCountLoading ? <Spinner size="sm" color="primary" /> : resubmitCount})
                                    </Button>
                                    {/* BUTTON FOR PENDING OFFICER APPROVAL (Uses projectHeadFetch) */}
                                    <Button 
                                        color={viewStatus === 'to_approve' ? 'warning' : 'light'} 
                                        onClick={() => setViewStatus('to_approve')}
                                        disabled={isLoading}>
                                        Pending Officer Approval ({isCountLoading ? <Spinner size="sm" color="warning" /> : pendingOfficerApprovalCount})
                                    </Button>
                                    {/* NEW BUTTON FOR REJECTED INDENTS (Uses projectHeadFetch) */}
                                    <Button 
                                        color={viewStatus === 'rejected_officer' ? 'danger' : 'light'} 
                                        onClick={() => setViewStatus('rejected_officer')}
                                        disabled={isLoading}>
                                        Rejected ({isCountLoading ? <Spinner size="sm" color="danger" /> : pendingOfficerRejectedCount})
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col sm={4}>
                                <div className="search-box">
                                    <Input type="text" className="form-control" placeholder="Search by Indent # or Creator/Approver..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

                {/* 1. View Indent Modal */}
                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.indentNumber} ({selectedIndent.status})</ModalHeader>
                        <ModalBody className="scrollable-modal-body">
                            {/* The acknowledge template relies on 'selectedIndent.selectedOptions[i].quantity' for the count display */}
                            {['Approved', 'Acknowledged', 'Resubmitted'].includes(selectedIndent.status) ? 
                                renderAcknowledgementTemplate(selectedIndent) : 
                                renderIndentTemplate(selectedIndent)
                            }
                        </ModalBody>
                        <ModalFooter className="d-flex justify-content-between">
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                            
                            {selectedIndent.status === 'Approved' && viewStatus === 'approved' && (
                                <div>
                                    <Button color="primary" className="me-2" onClick={handleOpenResubmit} disabled={isActionLoading}>Resubmit (Correct Qty & Comment)</Button>
                                    <Button color="info" onClick={handleOpenAcknowledge} disabled={isActionLoading}>Acknowledge Records</Button> 
                                </div>
                            )}
                            
                            {/* Original Reject button for the original queue */}
                            {selectedIndent.status === 'To Be Approved' && viewStatus === 'approved' && (
                                <div>
                                    <Button color="danger" onClick={handleOpenReject} disabled={isActionLoading}>Reject</Button>
                                </div>
                            )}

                            {/* Status display for all queues where explicit action is not required in the modal footer */}
                            {['Rejected', 'Acknowledged', 'Resubmitted'].includes(selectedIndent.status) || viewStatus === 'to_approve' || viewStatus === 'rejected_officer' ? (
                                <span className={`text-${getStatusColor(selectedIndent.status)} fw-bold`}>
                                    Status: {selectedIndent.status}
                                    {selectedIndent.status === 'To Be Approved' && viewStatus === 'to_approve' && " (Awaiting Officer Action)"}
                                    {selectedIndent.status === 'Rejected' && viewStatus === 'rejected_officer' && " (Pending Officer Review)"}
                                </span>
                            ) : null}
                            
                        </ModalFooter>
                    </Modal>
                )}
                
                {/* 2. Resubmit Modal */}
                <Modal isOpen={isResubmitModalOpen} toggle={toggleResubmitModal} centered size="lg">
                    <ModalHeader toggle={toggleResubmitModal}>Resubmit Indent: {selectedIndent?.indentNumber}</ModalHeader>
                    <ModalBody>
                        <Row className="g-3">
                            <Col md={12}>
                                <h5>Confirm Received Quantities (Correction/Record)</h5>
                                <p className="text-muted small">Enter the **correct quantity** of physical records *received* for this resubmission. **Officer Confirmed Qty is shown for reference.**</p>
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
                                                // OfficerEnteredQty field is correctly available in item.OfficerEnteredQty because of the normalization logic
                                                const officerQty = selectedIndent.selectedOptions.find(opt => opt.code === item.code)?.OfficerEnteredQty || '0';
                                                return (
                                                    <tr key={item.code}>
                                                        <td>{item.name}</td>
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
                        <Button color="secondary" onClick={toggleResubmitModal} disabled={isActionLoading}>Cancel</Button>
                        <Button color="primary" onClick={handleResubmitSubmit} disabled={isActionLoading}>
                            {isActionLoading ? <Spinner size="sm" /> : 'Confirm Resubmit'}
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* 3. Reject Indent Modal */}
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
                        <Button color="secondary" onClick={toggleRejectModal} disabled={isActionLoading}>Cancel</Button>
                        <Button color="danger" onClick={handleRejectSubmit} disabled={isActionLoading}>
                            {isActionLoading ? <Spinner size="sm" /> : 'Confirm Rejection'}
                        </Button>
                    </ModalFooter>
                </Modal>
                
                {/* 4. Quantity Entry Modal (Manager's Final Check before Acknowledge) */}
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
                                            {/* **DISPLAYING OFFICER CONFIRMED QTY (From normalized data)** */}
                                            <td><span className="fw-bold text-success">{selectedIndent.selectedOptions.find(opt => opt.code === item.code)?.OfficerEnteredQty || '0'}</span></td>
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
                        <Button color="secondary" onClick={toggleQuantityModal} disabled={isActionLoading}>Cancel</Button>
                        <Button color="info" onClick={handleQuantitySubmit} disabled={isActionLoading}>Next: Acknowledge Preview</Button>
                    </ModalFooter>
                </Modal>

                {/* 5. Acknowledgement Preview Modal */}
                {acknowledgementData && (
                    <Modal isOpen={isAcknowledgementModalOpen} toggle={toggleAcknowledgementModal} centered size="lg">
                        <ModalHeader toggle={toggleAcknowledgementModal}>Final Acknowledgment Preview: {acknowledgementData.indentNumber}</ModalHeader>
                        <ModalBody className="scrollable-modal-body">{renderAcknowledgementTemplate(acknowledgementData)}</ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleAcknowledgementModal} disabled={isActionLoading}>Cancel</Button>
                            <Button color="info" onClick={handleAcknowledgeFinalSubmit} disabled={isActionLoading}>
                                {isActionLoading ? <Spinner size="sm" /> : 'Confirm Final Acknowledgment'}
                            </Button>
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
            {/* =================================================================
            6. STYLES
            ================================================================= */}
            <style>{`
                .a4-sheet-modal{width:100%;border:1px solid #ccc;background-color:#fff;background-size:100% 100%;background-repeat:no-repeat;font-family:Arial,sans-serif;color:#000;font-size:13px;line-height:1.6;margin:0 auto}
                .content-wrapper-modal{padding:14% 8% 8%}
                .a4-sheet-modal table,.a4-sheet-modal th,.a4-sheet-modal td{font-size:12px;padding:5px}
                .scrollable-modal-body{max-height:70vh;overflow-y:auto;}
                .response-modal-body{text-align:center;padding:2.5rem 1.5rem;}
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

export default ManagerApprovalView;