import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button,
    Row, Col, Label, FormGroup, Collapse, Spinner, Form, Alert
} from 'reactstrap';
// Assuming both flags hit the same API route as requested
import { getAllUserDropDownss , postcreateindent} from '../../helpers/fakebackend_helper'; 
import letterheadImg from './VishvinLetterHead.jpg';

/**
 * Helper to reliably convert string, undefined, or null values into a database-safe integer or null.
 * @param {string|number|null|undefined} value The input value from state or session.
 * @returns {number|string|null} The converted integer, string code, or null.
 */
const safeParseInt = (value) => {
    // If null, undefined, or empty string, return JS null for DB compatibility
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue) && String(intValue) === String(value)) {
        return intValue;
    }
    return value;
};


const IndentNoPrefix = "VTPL/DMS/GESCOM/2025-26/"; // Hardcoded prefix

const CreateIndent = () => {
    document.title = `Create Indent | DMS`;

    // --- STATE FOR INDENT CREATION FORM ---
    const [circle, setCircle] = useState('');
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [circles, setCircles] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [username, setUserName] = useState('');
    const [submitToOption, setSubmitToOption] = useState('');
    const [availableOptions, setAvailableOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [indentData, setIndentData] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    
    // NEW STATE for Confirmation Checkbox
    const [isConfirmed, setIsConfirmed] = useState(false); 
    
    // To hold the result of the submission (Indent ID/No)
    const [finalSubmissionData, setFinalSubmissionData] = useState(null); 

    // --- NEW STATE FOR STATUS DASHBOARD (PAGINATION/SEARCH) ---
    const [submittedIndents, setSubmittedIndents] = useState([]);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [isStatusVisible, setIsStatusVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    // --- CORE API HELPER: FETCH DROPDOWN OPTIONS (FLAG 7, 1, 2, 3) ---
    const flagIdFunction = async (flagId, setState, requestUserName, div_code, sd_code, circle_code) => {
        setLoading(true);
        try {
            const params = { 
                flagId: flagId, 
                requestUserName: requestUserName,
                div_code: div_code || '',  
                sd_code: sd_code || '',    
                circle_code: circle_code || '', 
            };

            const response = await getAllUserDropDownss(params);
            const options = response?.data || [];
            setState(options);
            return options;
        } catch (error) {
            setState([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    /**
     * 🚀 MODIFIED FUNCTION: FETCH USER'S INDENTS (FLAG 3 for dashboard list) 🚀
     * Updated to use explicit name fields from the API response (division_names, etc.)
     */
    const fetchUserIndents = async (requestUserName, userId) => {
        setLoadingStatus(true);
        try {
            const payloadFlag3 = {
                "flagId": 3,
                "CreatedByUser_Id": safeParseInt(userId) || 0, 
                "RequestUserName": requestUserName,
            };
            
            const response = await postcreateindent(payloadFlag3); 

            if (response?.status === 'success' && Array.isArray(response.result)) {
                const formattedIndents = response.result.map(indent => ({
                    indentNumber: `${IndentNoPrefix}${indent.Indent_No || indent.indent_no || 'N/A'}`,
                    createdOn: new Date(indent.CreatedOn).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                    
                    // 🔑 UPDATED MAPPING: Using the explicit name fields for dashboard display
                    division: indent.division_names || 'N/A', 
                    subDivision: indent.subdivision_names || 'N/A',
                    section: indent.section_names || 'N/A',
                    
                    submitTo: indent.submitTo || 'Unknown Officer',
                    status: indent.StatusName || 'Pending', 
                    divisionCode: indent.div_codes || 'N/A',
                }));
                
                const sortedIndents = formattedIndents.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

                setSubmittedIndents(sortedIndents);
            } else {
                setSubmittedIndents([]);
                console.error("Failed to fetch indents (Flag 3/Dashboard):", response);
            }
        } catch (error) {
            console.error("API error during fetchUserIndents (Flag 3/Dashboard):", error);
            setSubmittedIndents([]);
        } finally {
            setLoadingStatus(false);
        }
    };


    // --- HELPER FUNCTIONS ---

    const getUniqueCircles = (circlesArray) => {
        const uniqueCircles = [];
        const seenCodes = new Set();
        circlesArray.forEach(circle => {
            if (!seenCodes.has(circle.circle_code)) {
                seenCodes.add(circle.circle_code);
                uniqueCircles.push(circle);
            }
        });
        return uniqueCircles;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'Pending': return 'warning';
            case 'Created': return 'info'; 
            default: return 'secondary';
        }
    };
    
    // --- INITIALIZATION ---
    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        
        const usernm = obj?.user?.Email; 
        const userId = obj?.user?.User_Id; 
        
        if (usernm && userId) {
            setUserName(usernm);
            flagIdFunction(7, setCircles, usernm);
            fetchUserIndents(usernm, userId); 
        }
    }, []); 

    // --- FORM HANDLERS (Unchanged) ---

    const resetFormStates = () => {
        setDivision(''); setSubDivision(''); setDivisionName([]); 
        setSubDivisions([]); setSectionOptions([]);
        setSubmitToOption(''); setAvailableOptions([]);
        setSelectedOptions([]); setIndentData(null); 
        setSubmissionStatus(null);
        setFinalSubmissionData(null); 
        // Reset confirmation checkbox
        setIsConfirmed(false);
    }

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setCircle(selectedCircleCode);
        resetFormStates();
        if (selectedCircleCode) {
            await flagIdFunction(1, setDivisionName, username, '', '', selectedCircleCode);
        }
    };

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        setSubDivision(''); setSubDivisions([]); 
        setSectionOptions([]); 
        setSubmitToOption(''); setAvailableOptions([]); setSelectedOptions([]);
        setIndentData(null); setSubmissionStatus(null); setFinalSubmissionData(null); setIsConfirmed(false);

        if (selectedDivCode && circle) {
            const subDivs = await flagIdFunction(2, setSubDivisions, username, selectedDivCode, '', circle);
            if (subDivs.length > 0) {
                await flagIdFunction(3, setSectionOptions, username, selectedDivCode, '', circle); 
            }
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        setSectionOptions([]); 
        setSubmitToOption(''); setAvailableOptions([]);
        setSelectedOptions([]); setIndentData(null); setSubmissionStatus(null); setFinalSubmissionData(null); setIsConfirmed(false);

        if (selectedSdCode && division && circle) {
            await flagIdFunction(3, setSectionOptions, username, division, selectedSdCode, circle); 
        }
    };

    const handleSubmitToChange = (e) => {
        const option = e.target.value;
        setSubmitToOption(option);
        setSelectedOptions([]);
        setIndentData(null);
        setSubmissionStatus(null);
        setFinalSubmissionData(null);
        setIsConfirmed(false);

        if (option === 'division') {
            const allDivSections = sectionOptions
                .map(opt => ({ ...opt, isSubDivision: false, code: opt.so_code, name: opt.section_office }));
            setAvailableOptions(allDivSections);

        } else if (option === 'subdivision' || option === 'section') {
            const subDivSections = sectionOptions.map(opt => ({ 
                ...opt, 
                isSubDivision: false, 
                code: opt.so_code, 
                name: opt.section_office 
            }));
            setAvailableOptions(subDivSections);
        }
    };

    /**
     * 🔑 MODIFIED FUNCTION: handleOptionSelection
     * Enforces single selection when submitToOption is 'section'.
     */
    const handleOptionSelection = (e, optionCode) => {
        // Reset confirmation if options are changed
        setIsConfirmed(false);
        
        if (submitToOption === 'section') {
            // For 'section' submission, only one selection is allowed
            if (e.target.checked) {
                // If checked, set THIS option as the ONLY selected option
                setSelectedOptions([optionCode]);
            } else {
                // If unchecked, clear all selected options (only this one was present)
                setSelectedOptions([]);
            }
        } else {
            // For 'division' or 'subdivision', multi-select logic remains
            if (e.target.checked) {
                setSelectedOptions([...selectedOptions, optionCode]);
            } else {
                setSelectedOptions(selectedOptions.filter(val => val !== optionCode));
            }
        }
    };
    
    const handleRefresh = () => {
        setCircle(''); 
        resetFormStates();
        setDivisionName([]); setSubDivisions([]); setSectionOptions([]);
        
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj?.user?.Email; 
        const userId = obj?.user?.User_Id; 
        
        if (usernm && userId) {
             flagIdFunction(7, setCircles, usernm);
             fetchUserIndents(usernm, userId);
        }
    };
    // ----------------------------------------------------

    // --- DASHBOARD FILTERING AND PAGINATION LOGIC (Unchanged) ---
    const filteredAndSearchedIndents = useMemo(() => {
        if (!submittedIndents) return [];
        return submittedIndents.filter(indent => 
            indent.indentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.submitTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.subDivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.section.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [submittedIndents, searchQuery]);

    const paginatedIndents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSearchedIndents.slice(startIndex, endIndex);
    }, [filteredAndSearchedIndents, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSearchedIndents.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    /**
     * 🚀 --- SINGLE-STAGE SUBMISSION (FLAG 1 & FLAG 2) --- 🚀 (Unchanged logic)
     */
    const handleSubmit = async () => {
        // Combined validation checks
        if (!circle || !division || !subDivision || !submitToOption || selectedOptions.length === 0 || !isConfirmed) {
            alert("Please complete all required selections and confirm the inputs are correct before submitting.");
            return;
        }
        
        // 🔑 NEW VALIDATION: Enforce single selection for 'section'
        if (submitToOption === 'section' && selectedOptions.length > 1) {
            alert("Submission to a Section Officer must only target ONE Section.");
            return;
        }

        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const submissionUserId = safeParseInt(obj?.user?.User_Id); 
        const submissionRequestUserName = username || null; 

        let submissionRoleId;
        if (submitToOption === 'division') {
            submissionRoleId = 5; 
        } else if (submitToOption === 'subdivision') {
            submissionRoleId = 6; 
        } else if (submitToOption === 'section') {
            submissionRoleId = 7; 
        } else {
            submissionRoleId = 4; // Fallback
        }

        const divCodeStr = division;
        const sdCodeStr = subDivision;
        
        setLoading(true);

        const selectedCircle = circles.find(c => c.circle_code === circle);
        const selectedDivision = divisionName.find(div => div.div_code === division);
        const selectedSubDivision = subDivisions.find(sd => sd.sd_code === subDivision);

        const actualSelectedOptions = availableOptions
            .filter(opt => selectedOptions.includes(opt.code));

        let designation = '';
        let toCode = selectedSubDivision ? selectedSubDivision.sd_code : subDivision; 

        if (submitToOption === 'division') {
            designation = 'Executive Engineer';
            toCode = selectedDivision ? selectedDivision.div_code : division; 
        } else if (submitToOption === 'subdivision') {
            designation = 'Assistant Engineer';
        } else if (submitToOption === 'section') {
            designation = 'Section Officer';
        }

        // --- STAGE 1: API PAYLOAD (FLAG 1: CREATE INDENT) ---
        const apiPayloadFlag1 = {
            flagId: 1, 
            CreatedByUser_Id: submissionUserId,
            Role_Id: safeParseInt(submissionRoleId), 
            RequestUserName: submissionRequestUserName, 
            zones: actualSelectedOptions.map(opt => ({
                div_code: divCodeStr || null, 
                sd_code: sdCodeStr || null, 
                so_code: opt.code || null, 
            })),
        };

        let apiIndentId = 0;
        let apiIndentNo = 'N/A';

        try {
            // 1. Call API for Flag 1 (Create Indent)
            const response1 = await postcreateindent(apiPayloadFlag1); 

            if (response1 && response1.status === 'success' && response1.result && response1.result.length > 0) {
                const resultObject = response1.result[0]; 
                apiIndentNo = String(resultObject.Indent_No || resultObject.indent_no || 'N/A');
                apiIndentId = safeParseInt(resultObject.Indent_Id || 0); 
                
                if (apiIndentId === 0 || apiIndentNo === 'N/A') {
                    throw new Error("Missing Indent ID or Number from Flag 1 response.");
                }

                const currentDate = new Date();
                const formattedDate = currentDate.toLocaleDateString('en-GB');
                
                const fullIndentNo = `${IndentNoPrefix}${apiIndentNo}`; 
                
                const finalIndentData = {
                    circle: selectedCircle ? selectedCircle.circle : '',
                    circleCode: circle,
                    division: selectedDivision ? selectedDivision.division : '',
                    divisionCode: division,
                    subDivision: selectedSubDivision ? selectedSubDivision.sub_division : '',
                    subDivisionCode: subDivision,
                    submitTo: submitToOption.toLowerCase().replace('-', ''),
                    toCode: toCode,
                    selectedOptions: actualSelectedOptions.map(opt => ({ name: opt.name, code: opt.code })),
                    selectedOptionNames: actualSelectedOptions.map(opt => opt.name).join(' / '),
                    designation,
                    date: formattedDate,
                    time: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
                    indentNumber: fullIndentNo, 
                };

                setFinalSubmissionData({
                    Indent_Id: apiIndentId,
                    Indent_No: apiIndentNo, 
                    Full_Indent_No: fullIndentNo, 
                    division: finalIndentData.division, 
                    divisionCode: finalIndentData.divisionCode, 
                    designation: finalIndentData.designation, 
                    date: finalIndentData.date, 
                });

                setIndentData(finalIndentData);
                
                // 2. Call API for Flag 2 (Update Status to Pending)
                const apiPayloadFlag2 = {
                    "flagId": 2,
                    "Indent_Id": apiIndentId,
                    "Indent_No": apiIndentNo, 
                    "Status_Id": 1, // 'Pending' status
                    "RequestUserName": submissionRequestUserName,
                };
                
                const response2 = await postcreateindent(apiPayloadFlag2); 

                if (response2 && response2.status === 'success') {
                    
                    // Final Success Message
                    setSubmissionStatus({
                        status: 'Pending',
                        message: `Your Indent (${fullIndentNo}) has been successfully created and forwarded to the concerned officer. It is now Pending for Approval.`
                    });

                    // Update Dashboard
                    const newDashboardIndent = {
                        indentNumber: fullIndentNo,
                        createdOn: formattedDate,
                        submitTo: designation,
                        status: 'Pending',
                        division: finalIndentData.division,
                        // Note: Using the single selected/created values here. 
                        // If multiple sections are selected, this is a simplification for the dashboard.
                        subDivision: finalIndentData.subDivision, 
                        section: finalIndentData.selectedOptionNames, 
                        divisionCode: finalIndentData.divisionCode,
                    };
                    setSubmittedIndents(prev => [newDashboardIndent, ...prev].sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn)));

                } else {
                    // Failed at Stage 2
                    alert(`Submission Failed at final step (Stage 2: Update Status). The indent was created but not marked 'Pending'. Please contact support. Indent No: ${fullIndentNo}.`);
                    setSubmissionStatus({
                        status: 'Created',
                        message: `Indent ${fullIndentNo} was created in the system but failed to update status to 'Pending'. Contact support.`
                    });
                }
            } else {
                // Failed at Stage 1
                throw new Error(`Server returned non-success status for Stage 1: ${response1?.status || 'unknown'}.`);
            }
        } catch (error) {
            console.error('Full Submission Error:', error);
            alert(`Full Submission Failed. Please ensure all data is valid. Error: ${error.message || 'Server error occurred.'}`);
            setSubmissionStatus(null);
        } finally {
            setLoading(false);
        }
    };
    // --- END SINGLE-STAGE SUBMISSION ---

    // --- RENDER FUNCTIONS (Print/Result/Dashboard) ---
    
    // handlePrint and renderIndentContent remain logically the same
    const handlePrint = () => { /* ... print logic ... */ };
    const renderIndentContent = () => {
        if (!indentData) return null;

        const isDivisionSubmit = indentData.submitTo === 'division';
        const requiresSubDivisionColumn = true; 
        const requiresSectionColumn = true; 

        const titleForSelection = indentData.selectedOptions.length > 1 
            ? 'multiple locations' 
            : indentData.selectedOptions[0]?.name || '';

        const getParentSubDivisionName = (sectionCode) => {
            const section = sectionOptions.find(opt => opt.so_code === sectionCode);
            if (section) {
                const parentSubDiv = subDivisions.find(sd => sd.sd_code === section.sd_code);
                return parentSubDiv ? parentSubDiv.sub_division : indentData.subDivision;
            }
            return indentData.subDivision;
        }

        return (
            <div id="indent-content-inner">
                <div className="indent-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '12pt' }}>
                    <div><strong>Indent No.:</strong> {indentData.indentNumber}</div>
                    <div style={{ textAlign: 'right' }}>
                        <div><strong>Date:</strong> {indentData.date}</div>
                        <div><strong>Time:</strong> {indentData.time}</div>
                    </div>
                </div>

                <div className="to-section" style={{ marginBottom: '20px' }}>
                    <p>To,</p>
                    <p>The **{indentData.designation}**</p>
                    <p>({indentData.submitTo.charAt(0).toUpperCase() + indentData.submitTo.slice(1)} Office)</p>
                    <p>Ref: {indentData.toCode}</p>
                </div>

                <div className="subject" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    <p>Subject: Request for physical records of Gescom Consumer of **{titleForSelection}**</p>
                    <p>DWA No: 14,42,53,250</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <p>Dear Sir/Madam,</p>
                    <p>With reference to the above DWA no and subject, we request for the physical available consumer records of below listed location(s):</p>
                </div>

                <Table bordered size="sm">
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }}>SL NO</th>
                            <th style={{ width: '25%' }}>Circle</th>
                            <th style={{ width: '25%' }}>Division</th>
                            {requiresSubDivisionColumn && <th style={{ width: '25%' }}>Sub-Division</th>}
                            {requiresSectionColumn && <th style={{ width: '20%' }}>Section</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {indentData.selectedOptions.map((option, index) => {
                            const subDivisionName = isDivisionSubmit 
                                ? getParentSubDivisionName(option.code)
                                : indentData.subDivision;
                                
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{indentData.circle}</td>
                                    <td>{indentData.division}</td>
                                    
                                    {/* Sub-Division Column */}
                                    {requiresSubDivisionColumn && (
                                        <td>
                                            {subDivisionName}
                                        </td>
                                    )}

                                    {/* Section Column */}
                                    {requiresSectionColumn && (
                                        <td>
                                            {option.name}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>

                <div style={{ marginBottom: '40px' }}>
                    <p>Kindly process and arrange for handover of physical consumer records of above mentioned location(s).</p>
                </div>

                <div className="signature" style={{ marginTop: '50px' }}>
                    <p>Thanking you,</p>
                    <p>Yours faithfully,</p>
                    <p style={{ marginTop: '40px' }}>_________________________</p>
                    <p>Disclaimer * seal is not mandatory</p>
                    <p>(This is computer/system generated copy)</p>
                </div>
            </div>
        );
    };
    
    const renderSubmissionResult = () => { /* ... result rendering logic ... */
        if (!submissionStatus || !indentData) return null;

        const statusColor = submissionStatus.status === 'Pending' ? 'success' : 'warning';
        const headerText = 'Indent Submitted Successfully';
        
        return (
            <Card className="mb-4 text-center">
                <CardHeader className={`bg-${statusColor} text-white p-3`}>
                    <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>{headerText}</h4>
                </CardHeader>
                <CardBody className="py-5">
                    <i className={`ri-checkbox-circle-fill text-${statusColor}`} style={{ fontSize: '5rem'}}></i>
                    
                    <h5 className={`mt-3 mb-4 text-${statusColor}`}>Success!</h5>
                    <p className="lead">
                        <strong className="text-primary">{indentData.indentNumber}</strong> 
                        : {submissionStatus.message}
                    </p>

                    {finalSubmissionData && (
                        <Alert color={statusColor} className="mt-3">
                            <strong>Indent ID/No Stored:</strong> {finalSubmissionData.Indent_Id} / {finalSubmissionData.Full_Indent_No}
                        </Alert>
                    )}

                    <hr className='my-4' />
                    
                    <Card className="shadow-lg" style={{ textAlign: 'left', border: '2px solid #0d6efd', backgroundColor: '#e9f3ff' }}>
                        <CardHeader className='bg-light'>
                           <h5 className='mb-0 text-primary'>Generated Indent Letter Preview (Ready for Print)</h5>
                        </CardHeader>
                        <CardBody className='p-4'>
                           <div style={{ maxHeight: '450px', overflowY: 'auto', border: '1px solid #ccc', padding: '15px', backgroundColor: '#fff' }}>
                               {renderIndentContent()}
                           </div>
                        </CardBody>
                    </Card>

                    <div className="mt-5 d-flex justify-content-center">
                        <Button 
                            color="secondary" 
                            onClick={() => { setIndentData(null); setSubmissionStatus(null); handleRefresh(); }} 
                            className="me-3 action-button"
                            disabled={loading}
                        >
                            Create New Indent
                        </Button>

                        <Button 
                            color="primary" 
                            onClick={handlePrint} 
                            className="me-3 action-button"
                        >
                            Print Indent 🖨️
                        </Button>
                    </div>
                </CardBody>
            </Card>
        );
    };

    /**
     * 🚀 MODIFIED FUNCTION: renderStatusDashboard
     * Added Sub-Division and Section Columns
     */
    const renderStatusDashboard = () => (
        <Card className="mb-4">
            
            <CardHeader 
                className="bg-primary text-white p-3 d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsStatusVisible(!isStatusVisible)}
            >
                <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>Previous Indents ({submittedIndents.length})</h4>
                <div className="d-flex align-items-center">
                    <span className="me-2" style={{ fontSize: '16px' }}>
                        {isStatusVisible ? 'Click to Collapse' : 'Click to View'}
                    </span>
                    <span style={{ fontSize: '20px', transition: 'transform 0.3s', transform: isStatusVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        &#9660; 
                    </span>
                </div>
            </CardHeader>
            
            <Collapse isOpen={isStatusVisible}>
                <CardBody>
                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Input
                                type="text"
                                placeholder="Search by Indent #, Status, or Location..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); 
                                }}
                            />
                        </Col>
                        <Col md={6} className="text-end">
                            <Button color="info" size="sm" onClick={handleRefresh} disabled={loadingStatus}>
                                <i className={`ri-refresh-line me-1 ${loadingStatus ? 'spinner-border spinner-border-sm' : ''}`}></i> Refresh Status
                            </Button>
                        </Col>
                    </Row>

                    {loadingStatus ? (
                        <div className="text-center py-4">
                            <Spinner size="lg" />
                            <p className="mt-2">Loading indent status...</p>
                        </div>
                    ) : submittedIndents.length === 0 && searchQuery === '' ? (
                        <p className="text-center py-4">You have not submitted any indents yet.</p>
                    ) : (
                        <>
                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <Table className="table-hover table-striped table-nowrap align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Indent #</th>
                                            <th>Date</th>
                                            <th>Division</th>
                                            <th>Sub-Division</th> {/* 🔑 NEW COLUMN */}
                                            <th>Section</th> {/* 🔑 NEW COLUMN */}
                                            <th>Submitted To</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedIndents.length > 0 ? (
                                            paginatedIndents.map((indent) => (
                                                <tr key={indent.indentNumber}>
                                                    <td>{indent.indentNumber}</td>
                                                    <td>{indent.createdOn}</td>
                                                    <td>{indent.division}</td>
                                                    <td>{indent.subDivision}</td> {/* 🔑 NEW DATA */}
                                                    <td>{indent.section}</td>     {/* 🔑 NEW DATA */}
                                                    <td>{indent.submitTo}</td>
                                                    <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No results found for "{searchQuery}"</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-3">
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <Button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                                Previous
                                            </Button>
                                        </li>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                <Button className="page-link" onClick={() => handlePageChange(index + 1)}>
                                                    {index + 1}
                                                </Button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <Button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                                Next
                                            </Button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Collapse>
        </Card>
    );


    return (
        <div className="page-content">
            <Container fluid>
                
                {renderStatusDashboard()}
                
                <Card className="mb-4">
                    <CardHeader className="bg-primary text-white p-3">
                        <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>Create Indent Request</h4>
                    </CardHeader>

                    {loading && !submissionStatus && <div className="text-center py-5"><Spinner /> <p>Processing Submission...</p></div>}
                    
                    {submissionStatus ? (
                        renderSubmissionResult() 
                    ) : (
                        <CardBody>
                            <Form>
                                {/* Location Dropdowns (Unchanged) */}
                                <Row className="g-4">
                                    <Col md={4}>
                                        <FormGroup className="mb-4">
                                            <Label className="form-label">Circle <span className="text-danger">*</span></Label>
                                            <Input
                                                type="select"
                                                value={circle}
                                                onChange={handleCircleChange}
                                                disabled={loading}
                                                className="custom-dropdown"
                                            >
                                                <option value="">Select Circle</option>
                                                {getUniqueCircles(circles).map(circle => (
                                                <option key={circle.circle_code} value={circle.circle_code}>
                                                    {circle.circle}
                                                </option>
                                                ))}
                                            </Input>
                                            {loading && circles.length === 0 && <Spinner size="sm" className="mt-2" />}
                                        </FormGroup>
                                    </Col>

                                    <Col md={4}>
                                        <FormGroup className="mb-4">
                                            <Label className="form-label">Division <span className="text-danger">*</span></Label>
                                            <Input
                                                type="select"
                                                value={division}
                                                onChange={handleDivisionChange}
                                                disabled={!circle || loading}
                                                className="custom-dropdown"
                                            >
                                                <option value="">Select Division</option>
                                                {divisionName.map(div => (
                                                <option key={div.div_code} value={div.div_code}>
                                                    {div.division}
                                                </option>
                                                ))}
                                            </Input>
                                            {loading && circle && divisionName.length === 0 && <Spinner size="sm" className="mt-2" />}
                                        </FormGroup>
                                    </Col>

                                    <Col md={4}>
                                        <FormGroup className="mb-4">
                                            <Label className="form-label">Sub Division <span className="text-danger">*</span></Label>
                                            <Input
                                                type="select"
                                                value={subDivision}
                                                onChange={handleSubDivisionChange}
                                                disabled={!division || loading}
                                                className="custom-dropdown"
                                            >
                                                <option value="">Select Sub Division</option>
                                                {subDivisions.map(subDiv => (
                                                <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                    {subDiv.sub_division}
                                                </option>
                                                ))}
                                            </Input>
                                            {loading && division && subDivisions.length === 0 && <Spinner size="sm" className="mt-2" />}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {subDivision && (
                                    <>
                                        {/* Submit To Options (Unchanged) */}
                                        <Row className="g-4 mt-4">
                                            <Col md={12}>
                                                <FormGroup className="submit-to-container mb-4">
                                                    <Label className="submit-to-label">Indent submitting to -</Label>
                                                    <div className="d-flex flex-wrap submit-to-options mt-3">
                                                        <div className="form-check me-5 custom-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="submit-division"
                                                                name="submitTo"
                                                                value="division"
                                                                checked={submitToOption === 'division'}
                                                                onChange={handleSubmitToChange}
                                                            />
                                                            <label className="form-check-label custom-radio-label" htmlFor="submit-division">
                                                                Division (Executive Engineer)
                                                            </label>
                                                        </div>
                                                        <div className="form-check me-5 custom-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="submit-subdivision"
                                                                name="submitTo"
                                                                value="subdivision"
                                                                checked={submitToOption === 'subdivision'}
                                                                onChange={handleSubmitToChange}
                                                            />
                                                            <label className="form-check-label custom-radio-label" htmlFor="submit-subdivision">
                                                                Sub Division (Assistant Engineer)
                                                            </label>
                                                        </div>
                                                        <div className="form-check custom-radio">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="submit-section"
                                                                name="submitTo"
                                                                value="section"
                                                                checked={submitToOption === 'section'}
                                                                onChange={handleSubmitToChange}
                                                            />
                                                            <label className="form-check-label custom-radio-label" htmlFor="submit-section">
                                                                Section (Section Officer)
                                                            </label>
                                                        </div>
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Multi-Select Options Area (Checkboxes used as radio for 'section') */}
                                        {submitToOption && availableOptions.length > 0 && (
                                            <Row className="g-4 mt-4">
                                                <Col md={12}>
                                                    <FormGroup className="mb-4">
                                                        <Label className="form-label">
                                                            Select **Sections** for Indent <span className="text-danger">*</span>
                                                        </Label>
                                                        <div className="border p-4 mt-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                            <Row>
                                                                {availableOptions.map(option => {
                                                                    const optionCode = option.code; 
                                                                    const optionName = option.name;
                                                                    const isSubDivision = option.isSubDivision || false; 
                                                                    return (
                                                                        <Col md={6} key={optionCode}>
                                                                            <div className="form-check mb-3">
                                                                                <input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id={`option-${optionCode}`}
                                                                                    // Use Checkbox for all for UI consistency, but control logic in handler
                                                                                    checked={selectedOptions.includes(optionCode)}
                                                                                    onChange={(e) => handleOptionSelection(e, optionCode)}
                                                                                    // 🔑 Added logic to hint at radio-button behavior for 'section'
                                                                                    // by setting a unique name/type for screen readers/assistive technologies if possible,
                                                                                    // though for this component structure, controlling via state is primary.
                                                                                />
                                                                                <label
                                                                                    className="form-check-label option-label"
                                                                                    
                                                                                    htmlFor={`option-${optionCode}`}
                                                                                >
                                                                                    {optionName} {isSubDivision ? ' (Sub-Division)' : ' (Section)'}
                                                                                </label>
                                                                            </div>
                                                                        </Col>
                                                                    );
                                                                })}
                                                            </Row>
                                                            {submitToOption === 'section' && (
                                                                <Alert color="info" className="mt-3 py-2">
                                                                    Note: Only one section selection is permitted. Choosing a new one will unselect the previous one.
                                                                </Alert>
                                                            )}
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        )}

                                        {/* Error Message (Unchanged) */}
                                        {submitToOption && availableOptions.length === 0 && !loading && (
                                            <Row className="mt-2">
                                                <Col md={12}>
                                                    <p className='text-danger'>No sections available for the selected location hierarchy. Please check data or make a different selection.</p>
                                                </Col>
                                            </Row>
                                        )}
                                        
                                        {/* CONFIRMATION CHECKBOX (Unchanged) */}
                                        {selectedOptions.length > 0 && (
                                            <Row className="mt-4">
                                                <Col md={12}>
                                                    <FormGroup check>
                                                        <Input
                                                            type="checkbox"
                                                            id="input-confirmation"
                                                            checked={isConfirmed}
                                                            onChange={(e) => setIsConfirmed(e.target.checked)}
                                                            className="form-check-input"
                                                        />
                                                        <Label check htmlFor="input-confirmation" className="form-label" style={{ fontWeight: 'normal' }}>
                                                            I confirm that all above given inputs are correct.<span className="text-danger">*</span>
                                                        </Label>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        )}


                                        {/* Submit and Refresh Buttons (Logic Updated with single-select check for 'section' in disabled prop) */}
                                        <Row className="g-4 mt-5">
                                            <Col md={12} className="d-flex justify-content-between">
                                                <Button color="secondary" onClick={handleRefresh} className="action-button" disabled={loading}>
                                                    Refresh
                                                </Button>
                                                <Button
                                                    color="success" 
                                                    onClick={handleSubmit}
                                                    className="action-button"
                                                    disabled={
                                                        !submitToOption || 
                                                        (availableOptions.length > 0 && selectedOptions.length === 0) || 
                                                        (submitToOption === 'section' && selectedOptions.length > 1) || // 🔑 ADDED: Disable if 'section' is selected but multiple options are somehow selected (should be prevented by handler, but as a safeguard)
                                                        loading || 
                                                        !isConfirmed // Mandatory check
                                                    }
                                                >
                                                    {loading ? <Spinner size="sm" /> : 'Submit '}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </Form>
                        </CardBody>
                    )}
                </Card>

                {/* Print Content Container (Hidden, used by handlePrint) */}
                <div style={{ display: 'none' }}>
                    {indentData && renderIndentContent()}
                </div>

                {/* CSS Styles (Unchanged) */}
                <style>
                    {`
                        .form-label { font-size: 17px; font-weight: 600; margin-bottom: 10px; color: #495057; }
                        .custom-dropdown { background-color: #f8f9fa; border: 2px solid #ced4da; border-radius: 8px; padding: 12px 16px; font-size: 17px; color: #495057; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 50px; }
                        .custom-dropdown:focus { border-color: #80bdff; outline: 0; box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25); background-color: #fff; }
                        .custom-dropdown:hover { border-color: #adb5bd; background-color: #e9ecef; }
                        .custom-dropdown:disabled { background-color: #e9ecef; opacity: 0.7; cursor: not-allowed; }
                        .submit-to-container { background-color: #f8f9fa; border-radius: 10px; padding: 20px; border: 1px solid #e9ecef; }
                        .submit-to-label { font-weight: 700; color: #495057; margin-bottom: 15px; font-size: 18px; }
                        .submit-to-options { gap: 25px; }
                        .custom-radio { margin-bottom: 0; }
                        .custom-radio .form-check-input { width: 20px; height: 20px; margin-top: 0.2rem; }
                        .custom-radio .form-check-input:checked { background-color: #0d6efd; border-color: #0d6efd; }
                        .custom-radio-label { font-weight: 600; color: #495057; padding-left: 10px; cursor: pointer; transition: color 0.2s; font-size: 17px; }
                        .custom-radio:hover .custom-radio-label { color: #0d6efd; }
                        .option-label { font-size: 16px; padding-left: 8px; }
                        .action-button { padding: 12px 24px; font-size: 17px; font-weight: 600; border-radius: 8px; }
                        .table-responsive { max-height: 400px; overflow-y: auto; } /* Scrollbar applied here */
                        .table-nowrap th { position: sticky; top: 0; background-color: #fff; z-index: 10; }
                    `}
                </style>
            </Container>
        </div>
    );
};

export default CreateIndent;