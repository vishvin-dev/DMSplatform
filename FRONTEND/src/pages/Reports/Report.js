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
// import { useNavigate } from 'react-router-dom';

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
//     const [dateMethod, setDateMethod] = useState('');
//     const [customStartDate, setCustomStartDate] = useState('');
//     const [customEndDate, setCustomEndDate] = useState('');
//     const [selectedDate, setSelectedDate] = useState('');
//     const [selectedMonth, setSelectedMonth] = useState('');
//     const [selectedYear, setSelectedYear] = useState('');

//     // Report results - REMOVED local state for reportData
//     // const [reportData, setReportData] = useState(null);
//     // const [showResults, setShowResults] = useState(false);

//     // Dropdown data
//     const [zoneOptions, setZoneOptions] = useState([]);
//     const [circleOptions, setCircleOptions] = useState([]);
//     const [divisionName, setDivisionName] = useState([]);
//     const [subDivisions, setSubDivisions] = useState([]);
//     const [userOptions, setUserOptions] = useState([]);
//     const [roleOptions, setRoleOptions] = useState([]);

//     // Store all available sections (Source of Truth)
//     const [allSectionOptions, setAllSectionOptions] = useState([]);

//     // Add navigate hook
//     const navigate = useNavigate();

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
//         // REMOVED: setReportData(null);
//         // REMOVED: setShowResults(false);
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
//         // REMOVED: setReportData(null);
//         // REMOVED: setShowResults(false);
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
        
//         // REMOVED: setReportData(null);
//         // REMOVED: setShowResults(false);
//     };

//     const handleResetFilters = async () => {
//         setZone(''); setCircle(''); setDivision(''); setSubDivision(''); setSections(['']);
//         setRole(''); setSelectedUser(''); setReportType(''); setDateMethod('');
//         setCustomStartDate(''); setCustomEndDate('');
//         setSelectedDate(''); setSelectedMonth(''); setSelectedYear('');
//         // REMOVED: setReportData(null); setShowResults(false);
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
//                 filters.so_code = activeSections[0];
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
//                 // Store report data in localStorage
//                 const reportStorageData = {
//                     reportData: reportResponse,
//                     filters: {
//                         zone,
//                         circle,
//                         division,
//                         subDivision,
//                         sections: activeSections,
//                         role,
//                         selectedUser,
//                         reportType,
//                         dateMethod,
//                         customStartDate,
//                         customEndDate,
//                         selectedDate,
//                         selectedMonth,
//                         selectedYear
//                     },
//                     timestamp: new Date().toISOString()
//                 };
                
//                 localStorage.setItem('reportData', JSON.stringify(reportStorageData));
                
//                 setLoading(false);
                
//                 // Show success modal
//                 setResponse('Report generated successfully! Redirecting to report view...');
//                 setSuccessModal(true);
                
//                 // Navigate to report view screen after 2 seconds
//                 setTimeout(() => {
//                     navigate('/report-view');
//                 }, 2000);
                
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
//                                                             onChange={(e) => { setReportType(e.target.value); }}
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

    // Dropdown data
    const [zoneOptions, setZoneOptions] = useState([]);
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    // Store all available sections (Source of Truth)
    const [allSectionOptions, setAllSectionOptions] = useState([]);

    // Track if at least one section is selected
    const [isSectionSelected, setIsSectionSelected] = useState(false);

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

    // Get current month
    const getCurrentMonth = () => {
        return (new Date().getMonth() + 1).toString();
    };

    const getCurrentMonthName = () => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[new Date().getMonth()];
    };

    // Get week range (current week - from Monday to Sunday)
    const getWeekRange = () => {
        const today = new Date();
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        const monday = new Date(today.setDate(diff));
        const sunday = new Date(today.setDate(diff + 6));
        
        return {
            start: monday.toISOString().split('T')[0],
            end: sunday.toISOString().split('T')[0]
        };
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

        // Get all active sections (filter out empty strings)
        const activeSections = sections.filter(s => s !== '');
        
        // For API payload - send array of sections if available
        const soCodeToSend = activeSections.length > 0 ? activeSections : [];

        // Construct Payload as requested
        const payload = {
            role_id: roleIdToSend,
            zone_code: zone || "",
            circle_code: circle || "",
            div_code: division || "",
            sd_code: subDivision || "",
            so_code: soCodeToSend 
        };

        console.log("User API Payload:", JSON.stringify(payload, null, 2));

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

    // Load users when ANY filter changes (including sections) - FIXED with proper dependency
    useEffect(() => {
        if (role && zone && isSectionSelected) {
            loadUsers();
        }
    }, [zone, circle, division, subDivision, sections, role, loadUsers, isSectionSelected]);

    // Check if at least one section is selected
    useEffect(() => {
        const hasSelectedSection = sections.some(section => section !== '');
        setIsSectionSelected(hasSelectedSection);
        
        // If no section is selected, disable role and user dropdowns
        if (!hasSelectedSection) {
            setRole('');
            setSelectedUser('');
            setUserOptions([]);
        }
    }, [sections]);

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
            setIsSectionSelected(false);
        }
        setRole('');
        setSelectedUser('');
        setUserOptions([]);
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
        setUserOptions([]);
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
        
        // Set default values based on date method
        if (method === 'day') {
            setSelectedDate(getCurrentDate());
        } else if (method === 'month') {
            setSelectedMonth(getCurrentMonth());
        }
    };

    const handleResetFilters = async () => {
        setZone(''); setCircle(''); setDivision(''); setSubDivision(''); setSections(['']);
        setRole(''); setSelectedUser(''); setReportType(''); setDateMethod('');
        setCustomStartDate(''); setCustomEndDate('');
        setSelectedDate(''); setSelectedMonth(''); setSelectedYear('');
        setCircleOptions([]); setDivisionName([]); setSubDivisions([]);
        setAllSectionOptions([]); setUserOptions([]);
        setIsSectionSelected(false);

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
        if (!isSectionSelected) {
            setResponse('Please select at least one section');
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
        if (dateMethod === 'month' && !selectedMonth) {
            setResponse('Please select a month for month method');
            setErrorModal(true);
            return false;
        }
        return true;
    };

    const buildDatePayload = () => {
        switch(dateMethod) {
            case 'day':
                return { date: selectedDate || getCurrentDate() };
                
            case 'week':
                const weekRange = getWeekRange();
                return {
                    startDate: weekRange.start,
                    endDate: weekRange.end
                };
                
            case 'month':
                return { 
                    year: new Date().getFullYear(),
                    month: parseInt(selectedMonth || getCurrentMonth()) 
                };
                
            case 'custom':
                return {
                    startDate: customStartDate,
                    endDate: customEndDate
                };
                
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
            
            // Add all active sections as array
            const activeSections = sections.filter(s => s !== '');
            if (activeSections.length > 0) {
                filters.so_code = activeSections;
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
                setResponse('Report generated successfully! Opening report in new tab...');
                setSuccessModal(true);
                
                // Open report in new tab after 1 second
                setTimeout(() => {
                    const newTab = window.open('/report-view', '_blank');
                    
                    // Clear localStorage after successfully opening new tab
                    if (newTab) {
                        setTimeout(() => {
                            localStorage.removeItem('reportData');
                        }, 1000); // Small delay to ensure data is loaded in new tab
                    }
                    
                    setSuccessModal(false);
                }, 1000);
                
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
                                                                        Section {index + 1} {index === 0 && <span className="text-danger">*</span>}
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
                                                            disabled={!isSectionSelected}
                                                        >
                                                            <option value="">Select Role</option>
                                                            {roleOptions.map(role => (
                                                                <option key={role.Role_Id} value={role.RoleName}>
                                                                    {role.RoleName}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                        {!isSectionSelected && (
                                                            <small className="text-muted d-block mt-1">
                                                                Please select a section first
                                                            </small>
                                                        )}
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
                                                            disabled={!role}
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
                                                        {!role && (
                                                            <small className="text-muted d-block mt-1">
                                                                Please select a role first
                                                            </small>
                                                        )}
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
                                                            <option value="day">Day (Current Day)</option>
                                                            <option value="week">Week (Current Week)</option>
                                                            <option value="month">Month (Current Month)</option>
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
                                             dateMethod === 'day' ? 'Select Date (Current Day)' :
                                             dateMethod === 'month' ? 'Select Month (Current Month)' : 'Week (Current Week)'}
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
                                                                <Label className="form-label fw-medium mb-0">Current Date <span className="text-danger">*</span></Label>
                                                            </div>
                                                            <div className="col-8">
                                                                <Input
                                                                    type="date"
                                                                    value={selectedDate || getCurrentDate()}
                                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                                    max={getCurrentDate()}
                                                                    className="form-control"
                                                                    disabled={true}
                                                                />
                                                                <small className="text-muted">Current day selection is fixed</small>
                                                            </div>
                                                        </div>
                                                    </FormGroup>
                                                ) : dateMethod === 'month' ? (
                                                    <FormGroup className="mb-0">
                                                        <div className="row align-items-center">
                                                            <div className="col-4">
                                                                <Label className="form-label fw-medium mb-0">Current Month <span className="text-danger">*</span></Label>
                                                            </div>
                                                            <div className="col-8">
                                                                <Input
                                                                    type="text"
                                                                    value={`${getCurrentMonthName()} ${new Date().getFullYear()}`}
                                                                    className="form-control"
                                                                    disabled={true}
                                                                    readOnly
                                                                />
                                                                <small className="text-muted">Current month selection is fixed</small>
                                                            </div>
                                                        </div>
                                                    </FormGroup>
                                                ) : (
                                                    <div className="text-muted text-center pt-5 pb-5">
                                                        <div>Current Week Range:</div>
                                                        <div className="fw-bold mt-2">
                                                            {getWeekRange().start} to {getWeekRange().end}
                                                        </div>
                                                        <small className="text-muted mt-2 d-block">Week selection is fixed to current week</small>
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
                                                        (dateMethod === 'custom' && (!customStartDate || !customEndDate))}
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