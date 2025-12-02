// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     Card, CardBody, CardHeader, Col, Container, Row,
//     Button, Input, Label, FormGroup, Spinner, Form
// } from 'reactstrap';
// import { misReportdropdowns, misReportuserdrpdwns, misReportdata } from '../../helpers/fakebackend_helper';
// import { ToastContainer } from 'react-toastify';
// import SuccessModal from '../../Components/Common/SuccessModal';
// import ErrorModal from '../../Components/Common/ErrorModal';
// import BreadCrumb from '../../Components/Common/BreadCrumb';
// import 'react-datepicker/dist/react-datepicker.css';

// const Reports = () => {
//     // State management
//     const [loading, setLoading] = useState(false);
//     const [response, setResponse] = useState('');

//     // Modal states
//     const [successModal, setSuccessModal] = useState(false);
//     const [errorModal, setErrorModal] = useState(false);

//     // Filter related states
//     const [zone, setZone] = useState('');
//     const [circle, setCircle] = useState('');
//     const [division, setDivision] = useState('');
//     const [subDivision, setSubDivision] = useState('');
//     const [sections, setSections] = useState(['']); 
//     const [userName, setUserName] = useState("");
//     const [role, setRole] = useState('');
//     const [selectedUser, setSelectedUser] = useState('');
//     const [reportType, setReportType] = useState('');
//     const [dateMethod, setDateMethod] = useState(''); // Changed from dateRange to dateMethod
//     const [customStartDate, setCustomStartDate] = useState('');
//     const [customEndDate, setCustomEndDate] = useState('');
//     const [selectedDate, setSelectedDate] = useState(''); // For day selection
//     const [selectedMonth, setSelectedMonth] = useState(''); // For month selection
//     const [selectedYear, setSelectedYear] = useState(''); // For month selection

//     // Report results
//     const [reportData, setReportData] = useState(null);
//     const [showResults, setShowResults] = useState(false);

//     // Dropdown data
//     const [zoneOptions, setZoneOptions] = useState([]);
//     const [circleOptions, setCircleOptions] = useState([]);
//     const [divisionName, setDivisionName] = useState([]);
//     const [subDivisions, setSubDivisions] = useState([]);
//     const [userOptions, setUserOptions] = useState([]);
//     const [roleOptions, setRoleOptions] = useState([]);

//     // Store all available sections (Source of Truth)
//     const [allSectionOptions, setAllSectionOptions] = useState([]);

//     document.title = `Reports | DMS`;

//     const flagIdFunction = useCallback(async (params) => {
//         try {
//             const res = await misReportdropdowns(params);
//             return res?.data || [];
//         } catch (error) {
//             console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
//             return [];
//         }
//     }, []);

//     // Get current date in YYYY-MM-DD format
//     const getCurrentDate = () => {
//         return new Date().toISOString().split('T')[0];
//     };

//     // --- Core Logic Functions ---

//     // Load roles from API
//     const loadRoles = useCallback(async () => {
//         try {
//             const rolesData = await flagIdFunction({
//                 flagId: 6,
//                 requestUserName: userName
//             });
//             setRoleOptions(rolesData);
//         } catch (error) {
//             console.error('Error loading roles:', error.message);
//             setRoleOptions([]);
//         }
//     }, [userName, flagIdFunction]);

//     // Load Users Logic with Specific Payload
//     const loadUsers = useCallback(async () => {
//         // Find the Role_Id based on the selected Role Name
//         const selectedRoleObj = roleOptions.find(r => r.RoleName === role);
//         const roleIdToSend = selectedRoleObj ? selectedRoleObj.Role_Id : "";

//         // Determine so_code (taking the first selected section if available, else empty)
//         const activeSections = sections.filter(s => s !== '');
//         const soCodeToSend = activeSections.length > 0 ? activeSections[0] : "";

//         // Construct Payload as requested
//         const payload = {
//             role_id: roleIdToSend,
//             zone_code: zone || "",
//             circle_code: circle || "",
//             div_code: division || "",
//             sd_code: subDivision || "",
//             so_code: soCodeToSend
//         };

//         try {
//             // Call the new API function
//             const userResponse = await misReportuserdrpdwns(payload);

//             if (userResponse && userResponse.status && userResponse.data) {
//                 const users = userResponse.data;
//                 setUserOptions(users);

//                 if (users.length === 1) {
//                     setSelectedUser(users[0].User_Id);
//                 } 
//                 else if (!users.some(u => u.User_Id === selectedUser)) {
//                     setSelectedUser('');
//                 }
//             } else {
//                 setUserOptions([]);
//                 setSelectedUser('');
//             }
//         } catch (error) {
//             console.error('Error loading users:', error.message);
//             setUserOptions([]);
//             setSelectedUser('');
//         }
//     }, [role, zone, circle, division, subDivision, sections, roleOptions, selectedUser]);

//     // Load initial zones and roles
//     useEffect(() => {
//         const loadInitialData = async () => {
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userEmail = authUser?.user?.Email;
//             if (userEmail) {
//                 setUserName(userEmail);

//                 // Load zones initially
//                 try {
//                     const zonesData = await flagIdFunction({
//                         flagId: 1,
//                         requestUserName: userEmail
//                     });
//                     setZoneOptions(zonesData);
//                 } catch (error) {
//                     console.error('Error loading zones:', error.message);
//                 }

//                 // Load roles initially
//                 await loadRoles();
//             }
//         };
//         loadInitialData();
//     }, [flagIdFunction, loadRoles]);

//     // Load users when ANY filter changes (including sections)
//     useEffect(() => {
//         loadUsers();
//     }, [zone, circle, division, subDivision, sections, role, loadUsers]);

//     // Load all sections without exclusions
//     const loadAllSections = useCallback(async () => {
//         if (!subDivision) {
//             setAllSectionOptions([]);
//             return;
//         }

//         try {
//             const sectionsData = await flagIdFunction({
//                 flagId: 5,
//                 requestUserName: userName,
//                 sd_code: subDivision,
//                 exclude_sections: [] 
//             });
//             setAllSectionOptions(sectionsData);
//         } catch (error) {
//             console.error('Error loading sections:', error.message);
//             setAllSectionOptions([]);
//         }
//     }, [subDivision, userName, flagIdFunction]);

//     // Load sections when subDivision changes
//     useEffect(() => {
//         if (subDivision) {
//             loadAllSections();
//         } else {
//             setAllSectionOptions([]);
//         }
//     }, [subDivision, loadAllSections]);

//     const resetSubsequentFilters = (changedLevel) => {
//         if (changedLevel === 'zone') {
//             setCircle('');
//             setCircleOptions([]);
//         }
//         if (changedLevel === 'zone' || changedLevel === 'circle') {
//             setDivision('');
//             setDivisionName([]);
//         }
//         if (changedLevel === 'zone' || changedLevel === 'circle' || changedLevel === 'division') {
//             setSubDivision('');
//             setSubDivisions([]);
//         }
//         if (changedLevel === 'zone' || changedLevel === 'circle' || changedLevel === 'division' || changedLevel === 'subDivision') {
//             setSections(['']);
//             setAllSectionOptions([]);
//         }
//         setSelectedUser('');
//         setReportData(null);
//         setShowResults(false);
//     };

//     const handleZoneChange = async (e) => {
//         const selectedZoneCode = e.target.value;
//         setZone(selectedZoneCode);
//         resetSubsequentFilters('zone');

//         if (selectedZoneCode) {
//             const circles = await flagIdFunction({
//                 flagId: 2,
//                 requestUserName: userName,
//                 zone_code: selectedZoneCode
//             });
//             setCircleOptions(circles);
//         }
//     };

//     const handleCircleChange = async (e) => {
//         const selectedCircleCode = e.target.value;
//         setCircle(selectedCircleCode);
//         resetSubsequentFilters('circle');

//         if (selectedCircleCode) {
//             const divisions = await flagIdFunction({
//                 flagId: 3,
//                 requestUserName: userName,
//                 circle_code: selectedCircleCode
//             });
//             setDivisionName(divisions);
//         }
//     };

//     const handleDivisionChange = async (e) => {
//         const selectedDivCode = e.target.value;
//         setDivision(selectedDivCode);
//         resetSubsequentFilters('division');

//         if (selectedDivCode) {
//             const subdivisions = await flagIdFunction({
//                 flagId: 4,
//                 requestUserName: userName,
//                 div_code: selectedDivCode
//             });
//             setSubDivisions(subdivisions);
//         }
//     };

//     const handleSubDivisionChange = async (e) => {
//         const selectedSdCode = e.target.value;
//         setSubDivision(selectedSdCode);
//         resetSubsequentFilters('subDivision');

//         if (selectedSdCode) {
//             loadAllSections();
//         }
//     };

//     const handleSectionChange = (index, value) => {
//         const newSections = [...sections];
//         newSections[index] = value;
//         setSections(newSections);
//     };

//     const addSection = () => {
//         if (sections.length < 3) {
//             setSections([...sections, '']);
//         }
//     };

//     const removeSection = (index) => {
//         if (sections.length > 1) {
//             const newSections = sections.filter((_, i) => i !== index);
//             setSections(newSections);
//         }
//     };

//     const handleRoleChange = (e) => {
//         setRole(e.target.value);
//         setSelectedUser('');
//         setReportData(null);
//         setShowResults(false);
//     };

//     const handleDateMethodChange = (e) => {
//         const method = e.target.value;
//         setDateMethod(method);
        
//         // Reset date-related states
//         setCustomStartDate('');
//         setCustomEndDate('');
//         setSelectedDate('');
//         setSelectedMonth('');
//         setSelectedYear('');
        
//         setReportData(null);
//         setShowResults(false);
//     };

//     const handleResetFilters = async () => {
//         setZone(''); setCircle(''); setDivision(''); setSubDivision(''); setSections(['']);
//         setRole(''); setSelectedUser(''); setReportType(''); setDateMethod('');
//         setCustomStartDate(''); setCustomEndDate('');
//         setSelectedDate(''); setSelectedMonth(''); setSelectedYear('');
//         setReportData(null); setShowResults(false);
//         setCircleOptions([]); setDivisionName([]); setSubDivisions([]);
//         setAllSectionOptions([]); setUserOptions([]);

//         const loadZonesAndRoles = async () => {
//             try {
//                 const zonesData = await flagIdFunction({
//                     flagId: 1,
//                     requestUserName: userName
//                 });
//                 setZoneOptions(zonesData);
//                 await loadRoles();
//             } catch (error) {
//                 console.error('Error loading zones:', error.message);
//             }
//         };
//         loadZonesAndRoles();
//     };

//     const validateForm = () => {
//         if (!zone) {
//             setResponse('Zone is required');
//             setErrorModal(true);
//             return false;
//         }
//         if (!role || !selectedUser || !reportType || !dateMethod) {
//             setResponse('Please fill all required report parameters');
//             setErrorModal(true);
//             return false;
//         }
//         if (dateMethod === 'custom' && (!customStartDate || !customEndDate)) {
//             setResponse('Please select both start and end dates for custom range');
//             setErrorModal(true);
//             return false;
//         }
//         if (dateMethod === 'day' && !selectedDate) {
//             setResponse('Please select a date for day method');
//             setErrorModal(true);
//             return false;
//         }
//         if (dateMethod === 'month' && (!selectedMonth || !selectedYear)) {
//             setResponse('Please select both month and year for month method');
//             setErrorModal(true);
//             return false;
//         }
//         return true;
//     };

//     const buildDatePayload = () => {
//         const today = new Date();
        
//         switch(dateMethod) {
//             case 'day':
//                 if (selectedDate) {
//                     return { date: selectedDate };
//                 }
//                 return { date: getCurrentDate() };
                
//             case 'week':
//                 return { date: getCurrentDate() };
                
//             case 'month':
//                 if (selectedMonth && selectedYear) {
//                     return { 
//                         year: parseInt(selectedYear), 
//                         month: parseInt(selectedMonth) 
//                     };
//                 }
//                 // If no specific month selected, use current month
//                 return { 
//                     year: today.getFullYear(), 
//                     month: today.getMonth() + 1 
//                 };
                
//             case 'custom':
//                 if (customStartDate && customEndDate) {
//                     return {
//                         startDate: customStartDate,
//                         endDate: customEndDate
//                     };
//                 }
//                 return {};
                
//             default:
//                 return {};
//         }
//     };

//     const generateReportData = async () => {
//         try {
//             setLoading(true);
            
//             // Build filters object
//             const filters = {};
//             if (division) filters.div_code = division;
//             if (subDivision) filters.sd_code = subDivision;
            
//             // Add sections if available
//             const activeSections = sections.filter(s => s !== '');
//             if (activeSections.length > 0) {
//                 filters.so_code = activeSections[0]; // Taking first section as per API pattern
//             }

//             // Build date payload
//             const datePayload = buildDatePayload();

//             // Prepare the complete payload
//             const payload = {
//                 filters: filters,
//                 dateMethod: dateMethod,
//                 datePayload: datePayload
//             };

//             console.log('Sending payload:', JSON.stringify(payload, null, 2));

//             // Call the misReportdata API
//             const reportResponse = await misReportdata(payload);
            
//             if (reportResponse && reportResponse.status) {
//                 setReportData(reportResponse);
//                 setShowResults(true);
//                 setLoading(false);
                
//                 // Show success modal
//                 setResponse('Report generated successfully!');
//                 setSuccessModal(true);
//             } else {
//                 throw new Error('Failed to generate report');
//             }

//         } catch (error) {
//             console.error('Error generating report data:', error);
//             setLoading(false);
//             setResponse(error.message || 'Failed to generate report');
//             setErrorModal(true);
//         }
//     };

//     const renderReportResults = () => {
//         if (!reportData || !showResults) return null;

//         const { meta, data } = reportData;
//         const { summary, rows } = data;
//         const { filters, dateRange } = meta;

//         return (
//             <Card className="mt-4">
//                 <CardHeader className="bg-success text-white">
//                     <h5 className="mb-0 card-title text-white">
//                         <i className="ri-file-chart-line me-2"></i>
//                         Report Results
//                     </h5>
//                 </CardHeader>
//                 <CardBody>
//                     {/* Filters Summary */}
//                     <div className="mb-4 p-3 border rounded bg-light">
//                         <h6 className="mb-3">Filters Applied:</h6>
//                         <Row>
//                             {filters.div_code && (
//                                 <Col md={3}>
//                                     <div className="mb-2">
//                                         <small className="text-muted">Division Code:</small>
//                                         <div className="fw-semibold">{filters.div_code}</div>
//                                     </div>
//                                 </Col>
//                             )}
//                             {filters.sd_code && (
//                                 <Col md={3}>
//                                     <div className="mb-2">
//                                         <small className="text-muted">Sub Division Code:</small>
//                                         <div className="fw-semibold">{filters.sd_code}</div>
//                                     </div>
//                                 </Col>
//                             )}
//                             {filters.so_code && (
//                                 <Col md={3}>
//                                     <div className="mb-2">
//                                         <small className="text-muted">Section Office:</small>
//                                         <div className="fw-semibold">{filters.so_code}</div>
//                                     </div>
//                                 </Col>
//                             )}
//                             <Col md={3}>
//                                 <div className="mb-2">
//                                     <small className="text-muted">Date Range:</small>
//                                     <div className="fw-semibold">
//                                         {dateRange.startDate} to {dateRange.endDate}
//                                     </div>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </div>

//                     {/* Summary Statistics */}
//                     <Row className="mb-4">
//                         <Col md={12}>
//                             <h6 className="mb-3">Summary Statistics:</h6>
//                         </Col>
//                         <Col md={2}>
//                             <div className="summary-card bg-primary text-white">
//                                 <div className="fs-4 fw-bold">{summary.total || 0}</div>
//                                 <div className="small">Total Documents</div>
//                             </div>
//                         </Col>
//                         <Col md={2}>
//                             <div className="summary-card bg-success text-white">
//                                 <div className="fs-4 fw-bold">{summary.approved || 0}</div>
//                                 <div className="small">Approved</div>
//                             </div>
//                         </Col>
//                         <Col md={2}>
//                             <div className="summary-card bg-warning text-white">
//                                 <div className="fs-4 fw-bold">{summary.pending || 0}</div>
//                                 <div className="small">Pending</div>
//                             </div>
//                         </Col>
//                         <Col md={2}>
//                             <div className="summary-card bg-danger text-white">
//                                 <div className="fs-4 fw-bold">{summary.rejected || 0}</div>
//                                 <div className="small">Rejected</div>
//                             </div>
//                         </Col>
//                         <Col md={2}>
//                             <div className="summary-card bg-info text-white">
//                                 <div className="fs-4 fw-bold">{summary.reuploaded || 0}</div>
//                                 <div className="small">Reuploaded</div>
//                             </div>
//                         </Col>
//                     </Row>

//                     {/* Detailed Data Table */}
//                     <div className="table-responsive">
//                         <h6 className="mb-3">Detailed Records:</h6>
//                         {rows && rows.length > 0 ? (
//                             <table className="table table-bordered table-striped">
//                                 <thead className="table-dark">
//                                     <tr>
//                                         <th>#</th>
//                                         <th>Document ID</th>
//                                         <th>Account ID</th>
//                                         <th>Consumer Name</th>
//                                         <th>Uploaded By</th>
//                                         <th>Upload Date</th>
//                                         <th>Status</th>
//                                         <th>Category</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {rows.map((item, index) => (
//                                         <tr key={index}>
//                                             <td>{index + 1}</td>
//                                             <td>{item.documentId || 'N/A'}</td>
//                                             <td>{item.accountId || 'N/A'}</td>
//                                             <td>{item.consumerName || 'N/A'}</td>
//                                             <td>{item.uploadedBy || 'N/A'}</td>
//                                             <td>{item.uploadDate || 'N/A'}</td>
//                                             <td>
//                                                 <span className={`badge ${item.status === 'Approved' ? 'bg-success' : 
//                                                     item.status === 'Pending' ? 'bg-warning' : 
//                                                     item.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'}`}>
//                                                     {item.status || 'Unknown'}
//                                                 </span>
//                                             </td>
//                                             <td>{item.category || 'N/A'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         ) : (
//                             <div className="text-center p-5 border rounded">
//                                 <i className="ri-file-search-line fs-1 text-muted mb-3"></i>
//                                 <p className="text-muted">No data found for the selected filters</p>
//                             </div>
//                         )}
//                     </div>
//                 </CardBody>
//             </Card>
//         );
//     };

//     // Generate month options
//     const monthOptions = [
//         { value: '1', label: 'January' },
//         { value: '2', label: 'February' },
//         { value: '3', label: 'March' },
//         { value: '4', label: 'April' },
//         { value: '5', label: 'May' },
//         { value: '6', label: 'June' },
//         { value: '7', label: 'July' },
//         { value: '8', label: 'August' },
//         { value: '9', label: 'September' },
//         { value: '10', label: 'October' },
//         { value: '11', label: 'November' },
//         { value: '12', label: 'December' }
//     ];

//     // Generate year options (last 5 years and next 1 year)
//     const currentYear = new Date().getFullYear();
//     const yearOptions = Array.from({ length: 7 }, (_, i) => {
//         const year = currentYear - 5 + i;
//         return { value: year.toString(), label: year.toString() };
//     });

//     return (
//         <React.Fragment>
//             <ToastContainer closeButton={false} />
//             <div className="page-content">
//                 <BreadCrumb title="Reports" pageTitle="DMS" />
//                 <Container fluid>
//                     <SuccessModal show={successModal} onCloseClick={() => setSuccessModal(false)} successMsg={response} />
//                     <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} errorMsg={response || 'An error occurred'} />

//                     <Row className="mb-4">
//                         {/* Card 1: Location Filters (Progressive Disclosure) */}
//                         <Col lg={4} md={6} className="mb-3">
//                             <Card className="h-100">
//                                 <CardHeader className="bg-primary text-white p-2">
//                                     <h6 className="mb-0 card-title text-white">
//                                         <i className="ri-map-pin-line me-2"></i>Location Filters
//                                     </h6>
//                                 </CardHeader>
//                                 <CardBody>
//                                     <div className="d-flex flex-column gap-3">
//                                         {/* Zone - Always Visible */}
//                                         <FormGroup className="mb-0">
//                                             <div className="row align-items-center">
//                                                 <div className="col-4">
//                                                     <Label className="form-label fw-medium mb-0">Zone <span className="text-danger">*</span></Label>
//                                                 </div>
//                                                 <div className="col-8">
//                                                     <Input
//                                                         type="select"
//                                                         value={zone}
//                                                         onChange={handleZoneChange}
//                                                         className="form-select"
//                                                     >
//                                                         <option value="">Select Zone</option>
//                                                         {zoneOptions.map(zone => (
//                                                             <option key={zone.zone_code} value={zone.zone_code}>{zone.zone}</option>
//                                                         ))}
//                                                     </Input>
//                                                 </div>
//                                             </div>
//                                         </FormGroup>

//                                         {/* Circle - Visible only if Zone is selected */}
//                                         {zone && (
//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">Circle</Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={circle}
//                                                             onChange={handleCircleChange}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Circle</option>
//                                                             {circleOptions.map(circ => (
//                                                                 <option key={circ.circle_code} value={circ.circle_code}>{circ.circle}</option>
//                                                             ))}
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>
//                                         )}

//                                         {/* Division - Visible only if Circle is selected */}
//                                         {circle && (
//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">Division</Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={division}
//                                                             onChange={handleDivisionChange}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Division</option>
//                                                             {divisionName.map(div => (
//                                                                 <option key={div.div_code} value={div.div_code}>{div.division}</option>
//                                                             ))}
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>
//                                         )}

//                                         {/* Sub Division - Visible only if Division is selected */}
//                                         {division && (
//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">Sub Division</Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={subDivision}
//                                                             onChange={handleSubDivisionChange}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Sub Division</option>
//                                                             {subDivisions.map(subDiv => (
//                                                                 <option key={subDiv.sd_code} value={subDiv.sd_code}>
//                                                                     {subDiv.sub_division}
//                                                                 </option>
//                                                             ))}
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>
//                                         )}

//                                         {/* Sections - Visible only if Sub Division is selected */}
//                                         {subDivision && (
//                                             <>
//                                                 {sections.map((sectionValue, index) => {
//                                                     const optionsForThisDropdown = allSectionOptions.filter(opt => {
//                                                         const isSelectedElsewhere = sections.some((s, i) => i !== index && s === opt.so_code);
//                                                         return !isSelectedElsewhere;
//                                                     });

//                                                     return (
//                                                         <FormGroup key={index} className="mb-0">
//                                                             <div className="row align-items-center">
//                                                                 <div className="col-4">
//                                                                     <Label className="form-label fw-medium mb-0">
//                                                                         Section {index + 1}
//                                                                     </Label>
//                                                                 </div>
//                                                                 <div className="col-7">
//                                                                     <Input
//                                                                         type="select"
//                                                                         value={sectionValue}
//                                                                         onChange={(e) => handleSectionChange(index, e.target.value)}
//                                                                         className="form-select"
//                                                                     >
//                                                                         <option value="">Select Section</option>
//                                                                         {optionsForThisDropdown.map(sec => (
//                                                                             <option key={sec.so_code} value={sec.so_code}>
//                                                                                 {sec.section_office}
//                                                                             </option>
//                                                                         ))}
//                                                                     </Input>
//                                                                 </div>
//                                                                 <div className="col-1">
//                                                                     {sections.length > 1 && (
//                                                                         <Button
//                                                                             color="danger"
//                                                                             size="sm"
//                                                                             className="p-1"
//                                                                             onClick={() => removeSection(index)}
//                                                                         >
//                                                                             <i className="ri-close-line"></i>
//                                                                         </Button>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         </FormGroup>
//                                                     );
//                                                 })}

//                                                 {sections.length < 3 && (
//                                                     <div className="text-center mt-2">
//                                                         <Button
//                                                             color="outline-primary"
//                                                             size="sm"
//                                                             onClick={addSection}
//                                                         >
//                                                             <i className="ri-add-line me-1"></i>
//                                                             Add Section
//                                                         </Button>
//                                                     </div>
//                                                 )}
//                                             </>
//                                         )}
//                                     </div>
//                                 </CardBody>
//                             </Card>
//                         </Col>

//                         {/* Card 2: Report Parameters - Visible immediately after Zone is selected */}
//                         {zone && (
//                             <Col lg={4} md={6} className="mb-3">
//                                 <Card className="h-100">
//                                     <CardHeader className="bg-primary text-white p-2">
//                                         <h6 className="mb-0 card-title text-white">
//                                             <i className="ri-settings-3-line me-2"></i>Report Parameters
//                                         </h6>
//                                     </CardHeader>
//                                     <CardBody>
//                                         <div className="d-flex flex-column gap-3">
//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">Role <span className="text-danger">*</span></Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={role}
//                                                             onChange={handleRoleChange}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Role</option>
//                                                             {roleOptions.map(role => (
//                                                                 <option key={role.Role_Id} value={role.RoleName}>
//                                                                     {role.RoleName}
//                                                                 </option>
//                                                             ))}
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>

//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">User <span className="text-danger">*</span></Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={selectedUser}
//                                                             onChange={(e) => setSelectedUser(e.target.value)}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select User</option>
//                                                             {userOptions.map(user => (
//                                                                 <option
//                                                                     key={user.User_Id}
//                                                                     value={user.User_Id}
//                                                                 >
//                                                                     {user.FirstName}
//                                                                 </option>
//                                                             ))}
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>

//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">Report Type <span className="text-danger">*</span></Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={reportType}
//                                                             onChange={(e) => { setReportType(e.target.value); setReportData(null); setShowResults(false); }}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Report Type</option>
//                                                             <option value="Document Summary">Document Summary</option>
//                                                             <option value="User Activity">User Activity</option>
//                                                             <option value="Status Report">Status Report</option>
//                                                             <option value="Performance Report">Performance Report</option>
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>

//                                             <FormGroup className="mb-0">
//                                                 <div className="row align-items-center">
//                                                     <div className="col-4">
//                                                         <Label className="form-label fw-medium mb-0">Date Method <span className="text-danger">*</span></Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={dateMethod}
//                                                             onChange={handleDateMethodChange}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Date Method</option>
//                                                             <option value="day">Day</option>
//                                                             <option value="week">Week</option>
//                                                             <option value="month">Month</option>
//                                                             <option value="custom">Custom Date Range</option>
//                                                         </Input>
//                                                     </div>
//                                                 </div>
//                                             </FormGroup>
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                             </Col>
//                         )}

//                         {/* Card 3: Date Configuration & Actions */}
//                         {zone && dateMethod && (
//                             <Col lg={4} md={6} className="mb-3">
//                                 <Card className="h-100">
//                                     <CardHeader className="bg-primary text-white p-2">
//                                         <h6 className="mb-0 card-title text-white">
//                                             <i className="ri-calendar-line me-2"></i>
//                                             {dateMethod === 'custom' ? 'Custom Date Range' : 
//                                              dateMethod === 'day' ? 'Select Date' :
//                                              dateMethod === 'month' ? 'Select Month' : 'Date Configuration'}
//                                         </h6>
//                                     </CardHeader>
//                                     <CardBody className="d-flex flex-column">
//                                         <div className="flex-grow-1">
//                                             <div className="d-flex flex-column gap-3">
//                                                 {dateMethod === 'custom' ? (
//                                                     <>
//                                                         <FormGroup className="mb-0">
//                                                             <div className="row align-items-center">
//                                                                 <div className="col-4">
//                                                                     <Label className="form-label fw-medium mb-0">Start Date <span className="text-danger">*</span></Label>
//                                                                 </div>
//                                                                 <div className="col-8">
//                                                                     <Input
//                                                                         type="date"
//                                                                         value={customStartDate}
//                                                                         onChange={(e) => setCustomStartDate(e.target.value)}
//                                                                         max={getCurrentDate()}
//                                                                         className="form-control"
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         </FormGroup>

//                                                         <FormGroup className="mb-0">
//                                                             <div className="row align-items-center">
//                                                                 <div className="col-4">
//                                                                     <Label className="form-label fw-medium mb-0">End Date <span className="text-danger">*</span></Label>
//                                                                 </div>
//                                                                 <div className="col-8">
//                                                                     <Input
//                                                                         type="date"
//                                                                         value={customEndDate}
//                                                                         onChange={(e) => setCustomEndDate(e.target.value)}
//                                                                         min={customStartDate}
//                                                                         max={getCurrentDate()}
//                                                                         className="form-control"
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         </FormGroup>
//                                                     </>
//                                                 ) : dateMethod === 'day' ? (
//                                                     <FormGroup className="mb-0">
//                                                         <div className="row align-items-center">
//                                                             <div className="col-4">
//                                                                 <Label className="form-label fw-medium mb-0">Select Date <span className="text-danger">*</span></Label>
//                                                             </div>
//                                                             <div className="col-8">
//                                                                 <Input
//                                                                     type="date"
//                                                                     value={selectedDate}
//                                                                     onChange={(e) => setSelectedDate(e.target.value)}
//                                                                     max={getCurrentDate()}
//                                                                     className="form-control"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </FormGroup>
//                                                 ) : dateMethod === 'month' ? (
//                                                     <>
//                                                         <FormGroup className="mb-0">
//                                                             <div className="row align-items-center">
//                                                                 <div className="col-4">
//                                                                     <Label className="form-label fw-medium mb-0">Month <span className="text-danger">*</span></Label>
//                                                                 </div>
//                                                                 <div className="col-8">
//                                                                     <Input
//                                                                         type="select"
//                                                                         value={selectedMonth}
//                                                                         onChange={(e) => setSelectedMonth(e.target.value)}
//                                                                         className="form-select"
//                                                                     >
//                                                                         <option value="">Select Month</option>
//                                                                         {monthOptions.map(month => (
//                                                                             <option key={month.value} value={month.value}>
//                                                                                 {month.label}
//                                                                             </option>
//                                                                         ))}
//                                                                     </Input>
//                                                                 </div>
//                                                             </div>
//                                                         </FormGroup>

//                                                         <FormGroup className="mb-0">
//                                                             <div className="row align-items-center">
//                                                                 <div className="col-4">
//                                                                     <Label className="form-label fw-medium mb-0">Year <span className="text-danger">*</span></Label>
//                                                                 </div>
//                                                                 <div className="col-8">
//                                                                     <Input
//                                                                         type="select"
//                                                                         value={selectedYear}
//                                                                         onChange={(e) => setSelectedYear(e.target.value)}
//                                                                         className="form-select"
//                                                                     >
//                                                                         <option value="">Select Year</option>
//                                                                         {yearOptions.map(year => (
//                                                                             <option key={year.value} value={year.value}>
//                                                                                 {year.label}
//                                                                             </option>
//                                                                         ))}
//                                                                     </Input>
//                                                                 </div>
//                                                             </div>
//                                                         </FormGroup>
//                                                     </>
//                                                 ) : (
//                                                     <div className="text-muted text-center pt-5 pb-5">
//                                                         Date range calculated dynamically for: <strong>{dateMethod.toUpperCase()}</strong>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         {/* Action Buttons */}
//                                         <div className="mt-auto pt-3">
//                                             <div className="d-flex flex-column gap-2">
//                                                 <Button
//                                                     color="success"
//                                                     size="sm"
//                                                     className="w-100"
//                                                     onClick={generateReportData}
//                                                     disabled={loading || 
//                                                         (dateMethod === 'custom' && (!customStartDate || !customEndDate)) ||
//                                                         (dateMethod === 'day' && !selectedDate) ||
//                                                         (dateMethod === 'month' && (!selectedMonth || !selectedYear))}
//                                                 >
//                                                     {loading ? (
//                                                         <>
//                                                             <Spinner size="sm" className="me-2" />
//                                                             Getting Data...
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <i className="ri-database-2-line me-2"></i>
//                                                             Get Data
//                                                         </>
//                                                     )}
//                                                 </Button>

//                                                 <Button
//                                                     color="light"
//                                                     size="sm"
//                                                     className="w-100"
//                                                     onClick={handleResetFilters}
//                                                     disabled={loading}
//                                                 >
//                                                     <i className="ri-refresh-line me-2"></i>
//                                                     Reset All
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                             </Col>
//                         )}
//                     </Row>

//                     {/* Display Report Results */}
//                     {renderReportResults()}
//                 </Container>
//             </div>
//         </React.Fragment>
//     );
// };

// export default Reports;










import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Input, Label, FormGroup, Spinner, Form
} from 'reactstrap';
import { misReportdropdowns, misReportuserdrpdwns, misReportdata } from '../../helpers/fakebackend_helper';
import { ToastContainer } from 'react-toastify';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom'; // Add this import

const Reports = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');

    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    // Filter related states
    const [zone, setZone] = useState('');
    const [circle, setCircle] = useState('');
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [sections, setSections] = useState(['']); 
    const [userName, setUserName] = useState("");
    const [role, setRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [reportType, setReportType] = useState('');
    const [dateMethod, setDateMethod] = useState('');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    // Report results - REMOVED local state for reportData
    // const [reportData, setReportData] = useState(null);
    // const [showResults, setShowResults] = useState(false);

    // Dropdown data
    const [zoneOptions, setZoneOptions] = useState([]);
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    // Store all available sections (Source of Truth)
    const [allSectionOptions, setAllSectionOptions] = useState([]);

    // Add navigate hook
    const navigate = useNavigate();

    document.title = `Reports | DMS`;

    const flagIdFunction = useCallback(async (params) => {
        try {
            const res = await misReportdropdowns(params);
            return res?.data || [];
        } catch (error) {
            console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
            return [];
        }
    }, []);

    // Get current date in YYYY-MM-DD format
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // --- Core Logic Functions ---

    // Load roles from API
    const loadRoles = useCallback(async () => {
        try {
            const rolesData = await flagIdFunction({
                flagId: 6,
                requestUserName: userName
            });
            setRoleOptions(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error.message);
            setRoleOptions([]);
        }
    }, [userName, flagIdFunction]);

    // Load Users Logic with Specific Payload
    const loadUsers = useCallback(async () => {
        // Find the Role_Id based on the selected Role Name
        const selectedRoleObj = roleOptions.find(r => r.RoleName === role);
        const roleIdToSend = selectedRoleObj ? selectedRoleObj.Role_Id : "";

        // Determine so_code (taking the first selected section if available, else empty)
        const activeSections = sections.filter(s => s !== '');
        const soCodeToSend = activeSections.length > 0 ? activeSections[0] : "";

        // Construct Payload as requested
        const payload = {
            role_id: roleIdToSend,
            zone_code: zone || "",
            circle_code: circle || "",
            div_code: division || "",
            sd_code: subDivision || "",
            so_code: soCodeToSend
        };

        try {
            // Call the new API function
            const userResponse = await misReportuserdrpdwns(payload);

            if (userResponse && userResponse.status && userResponse.data) {
                const users = userResponse.data;
                setUserOptions(users);

                if (users.length === 1) {
                    setSelectedUser(users[0].User_Id);
                } 
                else if (!users.some(u => u.User_Id === selectedUser)) {
                    setSelectedUser('');
                }
            } else {
                setUserOptions([]);
                setSelectedUser('');
            }
        } catch (error) {
            console.error('Error loading users:', error.message);
            setUserOptions([]);
            setSelectedUser('');
        }
    }, [role, zone, circle, division, subDivision, sections, roleOptions, selectedUser]);

    // Load initial zones and roles
    useEffect(() => {
        const loadInitialData = async () => {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userEmail = authUser?.user?.Email;
            if (userEmail) {
                setUserName(userEmail);

                // Load zones initially
                try {
                    const zonesData = await flagIdFunction({
                        flagId: 1,
                        requestUserName: userEmail
                    });
                    setZoneOptions(zonesData);
                } catch (error) {
                    console.error('Error loading zones:', error.message);
                }

                // Load roles initially
                await loadRoles();
            }
        };
        loadInitialData();
    }, [flagIdFunction, loadRoles]);

    // Load users when ANY filter changes (including sections)
    useEffect(() => {
        loadUsers();
    }, [zone, circle, division, subDivision, sections, role, loadUsers]);

    // Load all sections without exclusions
    const loadAllSections = useCallback(async () => {
        if (!subDivision) {
            setAllSectionOptions([]);
            return;
        }

        try {
            const sectionsData = await flagIdFunction({
                flagId: 5,
                requestUserName: userName,
                sd_code: subDivision,
                exclude_sections: [] 
            });
            setAllSectionOptions(sectionsData);
        } catch (error) {
            console.error('Error loading sections:', error.message);
            setAllSectionOptions([]);
        }
    }, [subDivision, userName, flagIdFunction]);

    // Load sections when subDivision changes
    useEffect(() => {
        if (subDivision) {
            loadAllSections();
        } else {
            setAllSectionOptions([]);
        }
    }, [subDivision, loadAllSections]);

    const resetSubsequentFilters = (changedLevel) => {
        if (changedLevel === 'zone') {
            setCircle('');
            setCircleOptions([]);
        }
        if (changedLevel === 'zone' || changedLevel === 'circle') {
            setDivision('');
            setDivisionName([]);
        }
        if (changedLevel === 'zone' || changedLevel === 'circle' || changedLevel === 'division') {
            setSubDivision('');
            setSubDivisions([]);
        }
        if (changedLevel === 'zone' || changedLevel === 'circle' || changedLevel === 'division' || changedLevel === 'subDivision') {
            setSections(['']);
            setAllSectionOptions([]);
        }
        setSelectedUser('');
        // REMOVED: setReportData(null);
        // REMOVED: setShowResults(false);
    };

    const handleZoneChange = async (e) => {
        const selectedZoneCode = e.target.value;
        setZone(selectedZoneCode);
        resetSubsequentFilters('zone');

        if (selectedZoneCode) {
            const circles = await flagIdFunction({
                flagId: 2,
                requestUserName: userName,
                zone_code: selectedZoneCode
            });
            setCircleOptions(circles);
        }
    };

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setCircle(selectedCircleCode);
        resetSubsequentFilters('circle');

        if (selectedCircleCode) {
            const divisions = await flagIdFunction({
                flagId: 3,
                requestUserName: userName,
                circle_code: selectedCircleCode
            });
            setDivisionName(divisions);
        }
    };

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        resetSubsequentFilters('division');

        if (selectedDivCode) {
            const subdivisions = await flagIdFunction({
                flagId: 4,
                requestUserName: userName,
                div_code: selectedDivCode
            });
            setSubDivisions(subdivisions);
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        resetSubsequentFilters('subDivision');

        if (selectedSdCode) {
            loadAllSections();
        }
    };

    const handleSectionChange = (index, value) => {
        const newSections = [...sections];
        newSections[index] = value;
        setSections(newSections);
    };

    const addSection = () => {
        if (sections.length < 3) {
            setSections([...sections, '']);
        }
    };

    const removeSection = (index) => {
        if (sections.length > 1) {
            const newSections = sections.filter((_, i) => i !== index);
            setSections(newSections);
        }
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setSelectedUser('');
        // REMOVED: setReportData(null);
        // REMOVED: setShowResults(false);
    };

    const handleDateMethodChange = (e) => {
        const method = e.target.value;
        setDateMethod(method);
        
        // Reset date-related states
        setCustomStartDate('');
        setCustomEndDate('');
        setSelectedDate('');
        setSelectedMonth('');
        setSelectedYear('');
        
        // REMOVED: setReportData(null);
        // REMOVED: setShowResults(false);
    };

    const handleResetFilters = async () => {
        setZone(''); setCircle(''); setDivision(''); setSubDivision(''); setSections(['']);
        setRole(''); setSelectedUser(''); setReportType(''); setDateMethod('');
        setCustomStartDate(''); setCustomEndDate('');
        setSelectedDate(''); setSelectedMonth(''); setSelectedYear('');
        // REMOVED: setReportData(null); setShowResults(false);
        setCircleOptions([]); setDivisionName([]); setSubDivisions([]);
        setAllSectionOptions([]); setUserOptions([]);

        const loadZonesAndRoles = async () => {
            try {
                const zonesData = await flagIdFunction({
                    flagId: 1,
                    requestUserName: userName
                });
                setZoneOptions(zonesData);
                await loadRoles();
            } catch (error) {
                console.error('Error loading zones:', error.message);
            }
        };
        loadZonesAndRoles();
    };

    const validateForm = () => {
        if (!zone) {
            setResponse('Zone is required');
            setErrorModal(true);
            return false;
        }
        if (!role || !selectedUser || !reportType || !dateMethod) {
            setResponse('Please fill all required report parameters');
            setErrorModal(true);
            return false;
        }
        if (dateMethod === 'custom' && (!customStartDate || !customEndDate)) {
            setResponse('Please select both start and end dates for custom range');
            setErrorModal(true);
            return false;
        }
        if (dateMethod === 'day' && !selectedDate) {
            setResponse('Please select a date for day method');
            setErrorModal(true);
            return false;
        }
        if (dateMethod === 'month' && (!selectedMonth || !selectedYear)) {
            setResponse('Please select both month and year for month method');
            setErrorModal(true);
            return false;
        }
        return true;
    };

    const buildDatePayload = () => {
        const today = new Date();
        
        switch(dateMethod) {
            case 'day':
                if (selectedDate) {
                    return { date: selectedDate };
                }
                return { date: getCurrentDate() };
                
            case 'week':
                return { date: getCurrentDate() };
                
            case 'month':
                if (selectedMonth && selectedYear) {
                    return { 
                        year: parseInt(selectedYear), 
                        month: parseInt(selectedMonth) 
                    };
                }
                // If no specific month selected, use current month
                return { 
                    year: today.getFullYear(), 
                    month: today.getMonth() + 1 
                };
                
            case 'custom':
                if (customStartDate && customEndDate) {
                    return {
                        startDate: customStartDate,
                        endDate: customEndDate
                    };
                }
                return {};
                
            default:
                return {};
        }
    };

    const generateReportData = async () => {
        try {
            setLoading(true);
            
            // Build filters object
            const filters = {};
            if (division) filters.div_code = division;
            if (subDivision) filters.sd_code = subDivision;
            
            // Add sections if available
            const activeSections = sections.filter(s => s !== '');
            if (activeSections.length > 0) {
                filters.so_code = activeSections[0];
            }

            // Build date payload
            const datePayload = buildDatePayload();

            // Prepare the complete payload
            const payload = {
                filters: filters,
                dateMethod: dateMethod,
                datePayload: datePayload
            };

            console.log('Sending payload:', JSON.stringify(payload, null, 2));

            // Call the misReportdata API
            const reportResponse = await misReportdata(payload);
            
            if (reportResponse && reportResponse.status) {
                // Store report data in localStorage
                const reportStorageData = {
                    reportData: reportResponse,
                    filters: {
                        zone,
                        circle,
                        division,
                        subDivision,
                        sections: activeSections,
                        role,
                        selectedUser,
                        reportType,
                        dateMethod,
                        customStartDate,
                        customEndDate,
                        selectedDate,
                        selectedMonth,
                        selectedYear
                    },
                    timestamp: new Date().toISOString()
                };
                
                localStorage.setItem('reportData', JSON.stringify(reportStorageData));
                
                setLoading(false);
                
                // Show success modal
                setResponse('Report generated successfully! Redirecting to report view...');
                setSuccessModal(true);
                
                // Navigate to report view screen after 2 seconds
                setTimeout(() => {
                    navigate('/report-view');
                }, 2000);
                
            } else {
                throw new Error('Failed to generate report');
            }

        } catch (error) {
            console.error('Error generating report data:', error);
            setLoading(false);
            setResponse(error.message || 'Failed to generate report');
            setErrorModal(true);
        }
    };

    // Generate month options
    const monthOptions = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    // Generate year options (last 5 years and next 1 year)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 7 }, (_, i) => {
        const year = currentYear - 5 + i;
        return { value: year.toString(), label: year.toString() };
    });

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <BreadCrumb title="Reports" pageTitle="DMS" />
                <Container fluid>
                    <SuccessModal show={successModal} onCloseClick={() => setSuccessModal(false)} successMsg={response} />
                    <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} errorMsg={response || 'An error occurred'} />

                    <Row className="mb-4">
                        {/* Card 1: Location Filters (Progressive Disclosure) */}
                        <Col lg={4} md={6} className="mb-3">
                            <Card className="h-100">
                                <CardHeader className="bg-primary text-white p-2">
                                    <h6 className="mb-0 card-title text-white">
                                        <i className="ri-map-pin-line me-2"></i>Location Filters
                                    </h6>
                                </CardHeader>
                                <CardBody>
                                    <div className="d-flex flex-column gap-3">
                                        {/* Zone - Always Visible */}
                                        <FormGroup className="mb-0">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Label className="form-label fw-medium mb-0">Zone <span className="text-danger">*</span></Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={zone}
                                                        onChange={handleZoneChange}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Zone</option>
                                                        {zoneOptions.map(zone => (
                                                            <option key={zone.zone_code} value={zone.zone_code}>{zone.zone}</option>
                                                        ))}
                                                    </Input>
                                                </div>
                                            </div>
                                        </FormGroup>

                                        {/* Circle - Visible only if Zone is selected */}
                                        {zone && (
                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Circle</Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={circle}
                                                            onChange={handleCircleChange}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Circle</option>
                                                            {circleOptions.map(circ => (
                                                                <option key={circ.circle_code} value={circ.circle_code}>{circ.circle}</option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                        )}

                                        {/* Division - Visible only if Circle is selected */}
                                        {circle && (
                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Division</Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={division}
                                                            onChange={handleDivisionChange}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Division</option>
                                                            {divisionName.map(div => (
                                                                <option key={div.div_code} value={div.div_code}>{div.division}</option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                        )}

                                        {/* Sub Division - Visible only if Division is selected */}
                                        {division && (
                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Sub Division</Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={subDivision}
                                                            onChange={handleSubDivisionChange}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Sub Division</option>
                                                            {subDivisions.map(subDiv => (
                                                                <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                                    {subDiv.sub_division}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                        )}

                                        {/* Sections - Visible only if Sub Division is selected */}
                                        {subDivision && (
                                            <>
                                                {sections.map((sectionValue, index) => {
                                                    const optionsForThisDropdown = allSectionOptions.filter(opt => {
                                                        const isSelectedElsewhere = sections.some((s, i) => i !== index && s === opt.so_code);
                                                        return !isSelectedElsewhere;
                                                    });

                                                    return (
                                                        <FormGroup key={index} className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">
                                                                        Section {index + 1}
                                                                    </Label>
                                                                </div>
                                                                <div className="col-7">
                                                                    <Input
                                                                        type="select"
                                                                        value={sectionValue}
                                                                        onChange={(e) => handleSectionChange(index, e.target.value)}
                                                                        className="form-select"
                                                                    >
                                                                        <option value="">Select Section</option>
                                                                        {optionsForThisDropdown.map(sec => (
                                                                            <option key={sec.so_code} value={sec.so_code}>
                                                                                {sec.section_office}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                </div>
                                                                <div className="col-1">
                                                                    {sections.length > 1 && (
                                                                        <Button
                                                                            color="danger"
                                                                            size="sm"
                                                                            className="p-1"
                                                                            onClick={() => removeSection(index)}
                                                                        >
                                                                            <i className="ri-close-line"></i>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    );
                                                })}

                                                {sections.length < 3 && (
                                                    <div className="text-center mt-2">
                                                        <Button
                                                            color="outline-primary"
                                                            size="sm"
                                                            onClick={addSection}
                                                        >
                                                            <i className="ri-add-line me-1"></i>
                                                            Add Section
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Card 2: Report Parameters - Visible immediately after Zone is selected */}
                        {zone && (
                            <Col lg={4} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-settings-3-line me-2"></i>Report Parameters
                                        </h6>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="d-flex flex-column gap-3">
                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Role <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={role}
                                                            onChange={handleRoleChange}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Role</option>
                                                            {roleOptions.map(role => (
                                                                <option key={role.Role_Id} value={role.RoleName}>
                                                                    {role.RoleName}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">User <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={selectedUser}
                                                            onChange={(e) => setSelectedUser(e.target.value)}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select User</option>
                                                            {userOptions.map(user => (
                                                                <option
                                                                    key={user.User_Id}
                                                                    value={user.User_Id}
                                                                >
                                                                    {user.FirstName}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Report Type <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={reportType}
                                                            onChange={(e) => { setReportType(e.target.value); }}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Report Type</option>
                                                            <option value="Document Summary">Document Summary</option>
                                                            <option value="User Activity">User Activity</option>
                                                            <option value="Status Report">Status Report</option>
                                                            <option value="Performance Report">Performance Report</option>
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Date Method <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={dateMethod}
                                                            onChange={handleDateMethodChange}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Date Method</option>
                                                            <option value="day">Day</option>
                                                            <option value="week">Week</option>
                                                            <option value="month">Month</option>
                                                            <option value="custom">Custom Date Range</option>
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        )}

                        {/* Card 3: Date Configuration & Actions */}
                        {zone && dateMethod && (
                            <Col lg={4} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-calendar-line me-2"></i>
                                            {dateMethod === 'custom' ? 'Custom Date Range' : 
                                             dateMethod === 'day' ? 'Select Date' :
                                             dateMethod === 'month' ? 'Select Month' : 'Date Configuration'}
                                        </h6>
                                    </CardHeader>
                                    <CardBody className="d-flex flex-column">
                                        <div className="flex-grow-1">
                                            <div className="d-flex flex-column gap-3">
                                                {dateMethod === 'custom' ? (
                                                    <>
                                                        <FormGroup className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">Start Date <span className="text-danger">*</span></Label>
                                                                </div>
                                                                <div className="col-8">
                                                                    <Input
                                                                        type="date"
                                                                        value={customStartDate}
                                                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                                                        max={getCurrentDate()}
                                                                        className="form-control"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </FormGroup>

                                                        <FormGroup className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">End Date <span className="text-danger">*</span></Label>
                                                                </div>
                                                                <div className="col-8">
                                                                    <Input
                                                                        type="date"
                                                                        value={customEndDate}
                                                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                                                        min={customStartDate}
                                                                        max={getCurrentDate()}
                                                                        className="form-control"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </>
                                                ) : dateMethod === 'day' ? (
                                                    <FormGroup className="mb-0">
                                                        <div className="row align-items-center">
                                                            <div className="col-4">
                                                                <Label className="form-label fw-medium mb-0">Select Date <span className="text-danger">*</span></Label>
                                                            </div>
                                                            <div className="col-8">
                                                                <Input
                                                                    type="date"
                                                                    value={selectedDate}
                                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                                    max={getCurrentDate()}
                                                                    className="form-control"
                                                                />
                                                            </div>
                                                        </div>
                                                    </FormGroup>
                                                ) : dateMethod === 'month' ? (
                                                    <>
                                                        <FormGroup className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">Month <span className="text-danger">*</span></Label>
                                                                </div>
                                                                <div className="col-8">
                                                                    <Input
                                                                        type="select"
                                                                        value={selectedMonth}
                                                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                                                        className="form-select"
                                                                    >
                                                                        <option value="">Select Month</option>
                                                                        {monthOptions.map(month => (
                                                                            <option key={month.value} value={month.value}>
                                                                                {month.label}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                </div>
                                                            </div>
                                                        </FormGroup>

                                                        <FormGroup className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">Year <span className="text-danger">*</span></Label>
                                                                </div>
                                                                <div className="col-8">
                                                                    <Input
                                                                        type="select"
                                                                        value={selectedYear}
                                                                        onChange={(e) => setSelectedYear(e.target.value)}
                                                                        className="form-select"
                                                                    >
                                                                        <option value="">Select Year</option>
                                                                        {yearOptions.map(year => (
                                                                            <option key={year.value} value={year.value}>
                                                                                {year.label}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </>
                                                ) : (
                                                    <div className="text-muted text-center pt-5 pb-5">
                                                        Date range calculated dynamically for: <strong>{dateMethod.toUpperCase()}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-auto pt-3">
                                            <div className="d-flex flex-column gap-2">
                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    className="w-100"
                                                    onClick={generateReportData}
                                                    disabled={loading || 
                                                        (dateMethod === 'custom' && (!customStartDate || !customEndDate)) ||
                                                        (dateMethod === 'day' && !selectedDate) ||
                                                        (dateMethod === 'month' && (!selectedMonth || !selectedYear))}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Spinner size="sm" className="me-2" />
                                                            Getting Data...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="ri-database-2-line me-2"></i>
                                                            Get Data
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    color="light"
                                                    size="sm"
                                                    className="w-100"
                                                    onClick={handleResetFilters}
                                                    disabled={loading}
                                                >
                                                    <i className="ri-refresh-line me-2"></i>
                                                    Reset All
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Reports;