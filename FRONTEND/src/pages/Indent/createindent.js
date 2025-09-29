import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button,
    Row, Col, Label, FormGroup, Collapse, Spinner, Form
} from 'reactstrap';
import { getAllUserDropDownss } from '../../helpers/fakebackend_helper';
import letterheadImg from './VishvinLetterHead.jpg';

// --- MOCK DATA FOR USER'S SUBMITTED INDENTS ---
const mockSubmittedIndents = [
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/001', createdOn: '2025-09-09', submitTo: 'Executive Engineer', status: 'Pending', division: 'City Division', divisionCode: 'D01' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/002', createdOn: '2025-09-08', submitTo: 'Assistant Engineer', status: 'Approved', division: 'Rural Division', divisionCode: 'D02' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/003', createdOn: '2025-09-07', submitTo: 'Section Officer', status: 'Rejected', division: 'City Division', divisionCode: 'D01' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/004', createdOn: '2025-09-06', submitTo: 'Executive Engineer', status: 'Pending', division: 'Metro Division', divisionCode: 'D03' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/005', createdOn: '2025-09-05', submitTo: 'Assistant Engineer', status: 'Approved', division: 'Rural Division', divisionCode: 'D02' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/006', createdOn: '2025-09-04', submitTo: 'Section Officer', status: 'Pending', division: 'Metro Division', divisionCode: 'D03' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/007', createdOn: '2025-09-03', submitTo: 'Executive Engineer', status: 'Approved', division: 'City Division', divisionCode: 'D01' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/008', createdOn: '2025-09-02', submitTo: 'Assistant Engineer', status: 'Pending', division: 'Rural Division', divisionCode: 'D02' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/009', createdOn: '2025-09-01', submitTo: 'Section Officer', status: 'Rejected', division: 'City Division', divisionCode: 'D01' },
    { indentNumber: 'VTPL/DMS/GESCOM/2025-26/010', createdOn: '2025-08-31', submitTo: 'Executive Engineer', status: 'Pending', division: 'Metro Division', divisionCode: 'D03' },
];

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

    // --- NEW STATE FOR STATUS DASHBOARD (PAGINATION/SEARCH) ---
    const [submittedIndents, setSubmittedIndents] = useState(mockSubmittedIndents);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [isStatusVisible, setIsStatusVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Items per page for pagination

    // --- MOCK/HELPER FUNCTIONS ---

    const flagIdFunction = async (flagId, setState, requestUserName, div_code, sd_code, circle_code) => {
        setLoading(true);
        try {
            const params = { flagId, requestUserName, div_code, sd_code, circle_code };
            // Assuming getAllUserDropDownss is imported from '../../helpers/fakebackend_helper'
            const response = await getAllUserDropDownss(params);
            const options = response?.data || [];
            setState(options);
            return options;
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
            setState([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

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
            default: return 'secondary';
        }
    };

    const fetchIndents = async (user) => {
        setLoadingStatus(true);
        // Simulate API call to fetch submitted indents for the current user
        await new Promise(resolve => setTimeout(resolve, 800));
        // Simulate sorting by date descending
        const sortedIndents = mockSubmittedIndents.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        setSubmittedIndents(sortedIndents);
        setLoadingStatus(false);
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj?.user?.LoginName;
        if (usernm) {
            setUserName(usernm);
            flagIdFunction(7, setCircles, usernm);
            fetchIndents(usernm); // Load dashboard data on mount
        }
    }, []);

    // --- FORM HANDLERS ---

    const resetFormStates = () => {
        setDivision(''); setSubDivision(''); setDivisionName([]); 
        setSubDivisions([]); setSectionOptions([]); // Reset section options here too
        setSubmitToOption(''); setAvailableOptions([]);
        setSelectedOptions([]); setIndentData(null); setSubmissionStatus(null);
    }

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setCircle(selectedCircleCode);
        resetFormStates();
        if (selectedCircleCode) {
            await flagIdFunction(1, setDivisionName, username, null, null, selectedCircleCode);
        }
    };

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        setSubDivision(''); setSubDivisions([]); 
        setSectionOptions([]); // Reset on division change
        setSubmitToOption(''); setAvailableOptions([]); setSelectedOptions([]);
        setIndentData(null); setSubmissionStatus(null);

        if (selectedDivCode && circle) {
            const subDivs = await flagIdFunction(2, setSubDivisions, username, selectedDivCode, null, circle);
            // Fetch sections for all subdivisions under this division for potential 'Division' submission
            if (subDivs.length > 0) {
                 // Fetch all sections across all sub-divisions for the current division/circle context
                 await flagIdFunction(3, setSectionOptions, username, selectedDivCode, null, circle); 
            }
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        setSectionOptions([]); setSubmitToOption(''); setAvailableOptions([]);
        setSelectedOptions([]); setIndentData(null); setSubmissionStatus(null);

        if (selectedSdCode && division && circle) {
            // Fetch only sections under the selected subdivision
            await flagIdFunction(3, setSectionOptions, username, division, selectedSdCode, circle); 
        }
    };

    const handleSubmitToChange = (e) => {
        const option = e.target.value;
        setSubmitToOption(option);
        setSelectedOptions([]);
        setIndentData(null);
        setSubmissionStatus(null);

        if (option === 'division') {
            // Only show SECTIONS when submitting to Division
            const sectionsOnly = sectionOptions
                .map(opt => ({ ...opt, isSubDivision: false, code: opt.so_code, name: opt.section_office }));
            setAvailableOptions(sectionsOnly);

        } else if (option === 'subdivision') {
            // The selection should be the Sections within the selected Sub-Division
            setAvailableOptions(sectionOptions.map(opt => ({ ...opt, isSubDivision: false, code: opt.so_code, name: opt.section_office })));

        } else if (option === 'section') {
            // The selection should be the Sections themselves
            setAvailableOptions(sectionOptions.map(opt => ({ ...opt, isSubDivision: false, code: opt.so_code, name: opt.section_office })));
        }
    };

    const handleOptionSelection = (e, optionCode) => {
        if (e.target.checked) {
            setSelectedOptions([...selectedOptions, optionCode]);
        } else {
            setSelectedOptions(selectedOptions.filter(val => val !== optionCode));
        }
    };
    
    // --- DASHBOARD FILTERING AND PAGINATION LOGIC ---
    
    const filteredAndSearchedIndents = useMemo(() => {
        if (!submittedIndents) return [];
        
        return submittedIndents.filter(indent => 
            indent.indentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indent.submitTo.toLowerCase().includes(searchQuery.toLowerCase())
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
    
    // --- REST OF THE ORIGINAL CODE (handleRefresh, handleSubmit, renderIndentContent, renderSubmissionResult) ---

    const handleRefresh = () => {
        setCircle(''); 
        resetFormStates();
        setDivisionName([]); setSubDivisions([]); setSectionOptions([]);
        fetchIndents(username);
    };

    const handleSubmit = async () => {
        if (!circle || !division || !subDivision || !submitToOption || selectedOptions.length === 0) {
            alert("Please complete all required selections before submitting.");
            return;
        }
        
        // 1. Compile Indent Data
        const selectedCircle = circles.find(c => c.circle_code === circle);
        const selectedDivision = divisionName.find(div => div.div_code === division);
        const selectedSubDivision = subDivisions.find(sd => sd.sd_code === subDivision);
        const actualSelectedOptions = availableOptions
            .filter(opt => selectedOptions.includes(opt.code));
        
        const selectedOptionNames = actualSelectedOptions
            .map(opt => opt.name)
            .join(' / ');

        let designation = '';
        let toCode = '';
        let submitToOffice = '';

        if (submitToOption === 'division') {
            designation = 'Executive Engineer';
            toCode = selectedDivision ? selectedDivision.div_code : division;
            submitToOffice = 'Division';
        } else if (submitToOption === 'subdivision') {
            designation = 'Assistant Engineer';
            toCode = selectedSubDivision ? selectedSubDivision.sd_code : subDivision;
            submitToOffice = 'Sub-Division';
        } else if (submitToOption === 'section') {
            designation = 'Section Officer';
            // Note: Section Officer is typically under the Sub-Division's code for routing
            toCode = selectedSubDivision ? selectedSubDivision.sd_code : subDivision; 
            submitToOffice = 'Section';
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB');
        const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const indentNumber = `VTPL/DMS/GESCOM/${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().slice(2)}/${Math.floor(Math.random() * 900) + 100}`;

        const newIndentData = {
            circle: selectedCircle ? selectedCircle.circle : '',
            circleCode: circle,
            division: selectedDivision ? selectedDivision.division : '',
            divisionCode: division,
            subDivision: selectedSubDivision ? selectedSubDivision.sub_division : '',
            subDivisionCode: subDivision,
            submitTo: submitToOffice.toLowerCase().replace('-', ''), // Used for logic in renderIndentContent
            toCode: toCode,
            selectedOptions: actualSelectedOptions.map(opt => ({
                name: opt.name,
                code: opt.code,
                isSubDivision: !!opt.isSubDivision // uses the flag set in handleSubmitToChange
            })),
            selectedOptionNames,
            designation,
            date: formattedDate,
            time: formattedTime,
            indentNumber
        };

        setIndentData(newIndentData);

        // 2. Simulate API Submission
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);

        // 3. Set Status (Mocking 'Pending' status after creation)
        setSubmissionStatus({
            status: 'Pending',
            message: `Your Indent (${newIndentData.indentNumber}) has been created successfully and it has been forwarded to the concerned officer.`
        });

        // 4. Add new indent to the mock dashboard list for immediate feedback
        const newDashboardIndent = {
            indentNumber: newIndentData.indentNumber,
            createdOn: newIndentData.date,
            submitTo: newIndentData.designation,
            status: 'Pending',
            division: newIndentData.division,
            divisionCode: newIndentData.divisionCode,
        };
        // Prepend the new indent
        setSubmittedIndents(prev => [newDashboardIndent, ...prev]); 

        // Clear form selection states
        setSubmitToOption('');
        setSelectedOptions([]);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('indent-content-inner');
        const printWindow = window.open('', '_blank');
        
        // Minimal HTML/CSS for print (using inline styles for robustness)
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Indent</title>
                    <style>
                        body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .letterhead-container { 
                            width: 210mm; 
                            min-height: 297mm; 
                            margin: 0 auto; 
                            background-image: url(${letterheadImg}); 
                            background-size: 100% 100%; 
                            background-repeat: no-repeat; 
                            position: relative; 
                        }
                        .content-wrapper { 
                            padding: 140px 80px 50px 80px; 
                            font-family: Arial, sans-serif; 
                            line-height: 1.5; 
                            font-size: 11pt; /* Better for print */
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 20px; 
                            table-layout: fixed; /* Fix table width */
                        }
                        table, th, td { border: 1px solid black; }
                        th, td { padding: 8px; text-align: left; vertical-align: top; }
                        strong { font-weight: bold; }
                    </style>
                </head>
                <body onload="window.print(); window.onafterprint = function() { window.close(); }">
                    <div class="letterhead-container">
                        <div class="content-wrapper">
                            ${printContent.innerHTML}
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const renderIndentContent = () => {
        if (!indentData) return null;

        const isDivisionSubmit = indentData.submitTo === 'division';
        // Note: isSubDivisionSubmit and isSectionSubmit are used for context but the table logic is the same for both when selecting sections under one Sub-Division

        const requiresSubDivisionColumn = true; 
        const requiresSectionColumn = true; 

        const titleForSelection = indentData.selectedOptions.length > 1 
            ? 'multiple locations' 
            : indentData.selectedOptions[0]?.name || '';

        // Function to determine the parent Sub-Division name for a selected section code
        const getParentSubDivisionName = (sectionCode) => {
            const section = sectionOptions.find(opt => opt.so_code === sectionCode);
            if (section) {
                // Find the sub-division object using the sd_code from the section object
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
                            // Determine which sub-division name to display:
                            // 1. If submitted to Division (EE), look up the parent Sub-Division of the selected section code.
                            // 2. Otherwise (AE/SO), use the Sub-Division selected in the form.
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

    const renderSubmissionResult = () => {
        if (!submissionStatus || !indentData) return null;

        // Force 'success' color for the successful submission card
        const statusColor = 'success';

        return (
            <Card className="mb-4 text-center">
                <CardHeader className={`bg-${statusColor} text-white p-3`}>
                    <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>Indent Submitted Successfully</h4>
                </CardHeader>
                <CardBody className="py-5">
                    <i className={`ri-checkbox-circle-fill text-${statusColor}`} style={{ fontSize: '5rem' }}></i>
                    <h5 className={`mt-3 mb-4 text-success`}>Success!</h5>
                    <p className="lead">
                        Your Indent (<strong className="text-primary">{indentData.indentNumber}</strong>) has been created successfully and it has been forwarded to the concerned officer.
                    </p>

                    <hr className='my-4' />
                    
                    {/* Render the Indent Content for Viewing */}
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
                        <Button color="secondary" onClick={() => { setIndentData(null); setSubmissionStatus(null); handleRefresh(); }} className="me-3 action-button">
                            Create New Indent
                        </Button>
                        <Button color="primary" onClick={handlePrint} className="action-button">
                            Print Indent 🖨️
                        </Button>
                    </div>
                </CardBody>
            </Card>
        );
    };

    // --- RENDER STATUS DASHBOARD (Updated with Search, Scrollbar, and Pagination) ---
    const renderStatusDashboard = () => (
        <Card className="mb-4">
           
<CardHeader 
    className="bg-primary text-white p-3 d-flex justify-content-between align-items-center"
    style={{ cursor: 'pointer' }}
    onClick={() => setIsStatusVisible(!isStatusVisible)}
>
    <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>Previous Indents</h4>
    <div className="d-flex align-items-center">
        {/* Added "Click Here" text */}
        <span className="me-2" style={{ fontSize: '16px' }}>
            {isStatusVisible ? 'Click to Collapse' : 'Click to View'}
        </span>
        <span style={{ fontSize: '20px', transition: 'transform 0.3s', transform: isStatusVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            &#9660; {/* Downward-pointing triangle/arrow */}
        </span>
    </div>
</CardHeader>
            
            <Collapse isOpen={isStatusVisible}>
                <CardBody>
                    <Row className="mb-3 align-items-center">
                        <Col md={6}>
                            <Input
                                type="text"
                                placeholder="Search by Indent #, Status, or Division..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                            />
                        </Col>
                        <Col md={6} className="text-end">
                            <Button color="info" size="sm" onClick={() => fetchIndents(username)} disabled={loadingStatus}>
                                <i className={`ri-refresh-line me-1 ${loadingStatus ? 'spinner-border spinner-border-sm' : ''}`}></i> Refresh Status
                            </Button>
                        </Col>
                    </Row>

                    {loadingStatus ? (
                        <div className="text-center py-4">
                            <Spinner size="lg" />
                            <p className="mt-2">Loading indent status...</p>
                        </div>
                    ) : submittedIndents.length === 0 ? (
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
                                                    <td>{indent.submitTo}</td>
                                                    <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">No results found for "{searchQuery}"</td>
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
                
                {/* Render Status Dashboard first, collapsed by default */}
                {renderStatusDashboard()}
                
                {/* Main Card for Create Indent form/result */}
                <Card className="mb-4">
                    <CardHeader className="bg-primary text-white p-3">
                        <h4 className="mb-0 text-white" style={{ fontSize: '22px' }}>Create Indent Request</h4>
                    </CardHeader>

                    {loading && <div className="text-center py-5"><Spinner /> <p>Processing Submission...</p></div>}
                    
                    {submissionStatus ? (
                        // Show Submission Result Card (and preview)
                        renderSubmissionResult() 
                    ) : (
                        // Show Form Fields
                        <CardBody>
                            <Form>
                                {/* Location Dropdowns */}
                                <Row className="g-4">
                                    {/* Circle Dropdown */}
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

                                    {/* Division Dropdown */}
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

                                    {/* Sub Division Dropdown */}
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

                                {/* Submit To Options and Multi-Select Area */}
                                {subDivision && (
                                    <>
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

                                        {/* Multi-Select Options Area */}
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
                                                                        const optionCode = option.code; // Already standardized in handleSubmitToChange
                                                                        const optionName = option.name;
                                                                        const isSubDivision = option.isSubDivision; // Will be false for all options when submitting to division
                                                                        return (
                                                                            <Col md={6} key={optionCode}>
                                                                                <div className="form-check mb-3">
                                                                                    <input
                                                                                        className="form-check-input"
                                                                                        type="checkbox"
                                                                                        id={`option-${optionCode}`}
                                                                                        checked={selectedOptions.includes(optionCode)}
                                                                                        onChange={(e) => handleOptionSelection(e, optionCode)}
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
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        )}

                                        {/* Submit and Refresh Buttons */}
                                        <Row className="g-4 mt-5">
                                            <Col md={12} className="d-flex justify-content-between">
                                                <Button color="secondary" onClick={handleRefresh} className="action-button" disabled={loading}>
                                                    Refresh
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    onClick={handleSubmit}
                                                    disabled={!submitToOption || (availableOptions.length > 0 && selectedOptions.length === 0) || loading}
                                                    className="action-button"
                                                >
                                                    {loading ? <Spinner size="sm" /> : 'Submit'}
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
                    {renderIndentContent()}
                </div>

                {/* CSS Styles */}
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