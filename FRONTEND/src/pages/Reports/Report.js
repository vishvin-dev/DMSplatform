// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//     Card, CardBody, CardHeader, Col, Container, Row,
//     Button, Input, Label, FormGroup,
//     Alert, Spinner
// } from 'reactstrap';
// import { getDocumentDropdowns } from '../../helpers/fakebackend_helper';
// import { ToastContainer } from 'react-toastify';
// import SuccessModal from '../../Components/Common/SuccessModal';
// import ErrorModal from '../../Components/Common/ErrorModal';
// import BreadCrumb from '../../Components/Common/BreadCrumb';

// const Reports = () => {
//     // State management
//     const [loading, setLoading] = useState(false);
//     const [response, setResponse] = useState('');

//     // Modal states
//     const [successModal, setSuccessModal] = useState(false);
//     const [errorModal, setErrorModal] = useState(false);

//     // Filter related states
//     const [circle, setCircle] = useState('');
//     const [division, setDivision] = useState('');
//     const [subDivision, setSubDivision] = useState('');
//     const [section, setSection] = useState('');
//     const [userName, setUserName] = useState("");
//     const [role, setRole] = useState('');
//     const [selectedUser, setSelectedUser] = useState('');
//     const [reportType, setReportType] = useState('');
//     const [dateRange, setDateRange] = useState('');
//     const [customStartDate, setCustomStartDate] = useState('');
//     const [customEndDate, setCustomEndDate] = useState('');

//     // Report results (retained for flow logic/mock data)
//     const [reportData, setReportData] = useState(null);
//     const [showResults, setShowResults] = useState(false);

//     // Dropdown data
//     const [circleOptions, setCircleOptions] = useState([]);
//     const [divisionName, setDivisionName] = useState([]);
//     const [subDivisions, setSubDivisions] = useState([]);
//     const [sectionOptions, setSectionOptions] = useState([]);
//     const [userOptions, setUserOptions] = useState([]);

//     // User access level states
//     const [userLevel, setUserLevel] = useState('');
//     const [isFieldsDisabled, setIsFieldsDisabled] = useState({
//         circle: false,
//         division: false,
//         subDivision: false,
//         section: false
//     });

//     document.title = `Reports | DMS`;

//     const flagIdFunction = useCallback(async (params) => {
//         try {
//             const res = await getDocumentDropdowns(params);
//             return res?.data || [];
//         } catch (error) {
//             console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
//             return [];
//         }
//     }, []);

//     // --- Core Logic Functions ---

//     const loadUsers = useCallback(async () => {
//         if (!role || !circle || !division || !subDivision || !section) {
//             setUserOptions([]);
//             setSelectedUser('');
//             return;
//         }

//         try {
//             let users = [];
//             // --- MOCK USER DATA INJECTION ---
//             if (role === 'Uploader') {
//                 users = [
//                     { id: 'U1001', user_name: 'Alex Johnson', email: 'alex.j@example.com', name: 'Alex Johnson' },
//                     { id: 'U1002', user_name: 'Priya Sharma', email: 'priya.s@example.com', name: 'Priya Sharma' },
//                 ];
//             } else if (role === 'QC') {
//                 users = [
//                     { id: 'Q2001', user_name: 'Manager Bob', email: 'manager.b@example.com', name: 'Manager Bob' },
//                     { id: 'Q2002', user_name: 'Supervisor Carol', email: 'supervisor.c@example.com', name: 'Supervisor Carol' },
//                 ];
//             } else {
//                 users = [];
//             }
//             // --- END MOCK ---

//             setUserOptions(users);

//             if (users.length === 1) {
//                 setSelectedUser(users[0].id || users[0].user_id || users[0].email);
//             } else if (!users.some(u => (u.id || u.user_id || u.email) === selectedUser)) {
//                 setSelectedUser('');
//             }
//         } catch (error) {
//             console.error('Error loading users:', error.message);
//             setUserOptions([]);
//             setSelectedUser('');
//         }
//     }, [role, circle, division, subDivision, section, selectedUser]);


//     const loadDropdownDataFromSession = useCallback(async () => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//         const zones = authUser?.user?.zones || [];
//         const currentUserEmail = authUser?.user?.Email;
//         setUserName(currentUserEmail || "");

//         if (zones.length === 0) return;

//         const userZone = zones[0];
//         const level = userZone.level;
//         setUserLevel(level);

//         const loadNextLevelAndAutoselect = async (currentLevelCode, flagId, setOptions, setCode, disableKey) => {
//             const nextOptions = await flagIdFunction({
//                 flagId,
//                 requestUserName: currentUserEmail,
//                 ...(flagId === 1 && { circle_code: currentLevelCode }),
//                 ...(flagId === 2 && { div_code: currentLevelCode }),
//                 ...(flagId === 3 && { sd_code: currentLevelCode }),
//             });

//             setOptions(nextOptions);

//             if (nextOptions.length === 1) {
//                 const nextCode = nextOptions[0].circle_code || nextOptions[0].div_code || nextOptions[0].sd_code || nextOptions[0].so_code;
//                 setCode(nextCode);
//                 setIsFieldsDisabled(prev => ({ ...prev, [disableKey]: true }));
//                 return nextCode;
//             } else {
//                 setIsFieldsDisabled(prev => ({ ...prev, [disableKey]: false }));
//                 return null;
//             }
//         };

//         if (level === 'section') {
//             const circleData = [{ circle_code: userZone.circle_code, circle: userZone.circle }];
//             const divisionData = [{ div_code: userZone.div_code, division: userZone.division }];
//             const subDivisionData = [{ sd_code: userZone.sd_code, sub_division: userZone.sub_division }];
//             const sectionData = zones.filter(z => z.sd_code === userZone.sd_code).map(zone => ({
//                 so_code: zone.so_code, section_office: zone.section_office
//             }));

//             setCircleOptions(circleData);
//             setDivisionName(divisionData);
//             setSubDivisions(subDivisionData);
//             setSectionOptions(sectionData);

//             setCircle(userZone.circle_code);
//             setDivision(userZone.div_code);
//             setSubDivision(userZone.sd_code);
//             setIsFieldsDisabled({
//                 circle: true, division: true, subDivision: true,
//                 section: sectionData.length === 1
//             });
//             if (sectionData.length === 1) {
//                 setSection(sectionData[0].so_code);
//             }
//         }
//         else if (level === 'subdivision') {
//             const circleData = [{ circle_code: userZone.circle_code, circle: userZone.circle }];
//             const divisionData = [{ div_code: userZone.div_code, division: userZone.division }];
//             setCircleOptions(circleData);
//             setDivisionName(divisionData);
//             setCircle(userZone.circle_code);
//             setDivision(userZone.div_code);

//             const uniqueSubDivisions = Array.from(new Set(zones.map(z => z.sd_code)))
//                 .map(sdCode => zones.find(z => z.sd_code === sdCode))
//                 .map(zone => ({ sd_code: zone.sd_code, sub_division: zone.sub_division }));

//             setSubDivisions(uniqueSubDivisions);

//             const isSingleSubDivision = uniqueSubDivisions.length === 1;
//             setIsFieldsDisabled({ circle: true, division: true, subDivision: isSingleSubDivision, section: false });

//             if (isSingleSubDivision) {
//                 const selectedSdCode = uniqueSubDivisions[0].sd_code;
//                 setSubDivision(selectedSdCode);
//                 await loadNextLevelAndAutoselect(selectedSdCode, 3, setSectionOptions, setSection, 'section');
//             }
//         }
//         else if (level === 'division') {
//             const circleData = [{ circle_code: userZone.circle_code, circle: userZone.circle }];
//             setCircleOptions(circleData);
//             setCircle(userZone.circle_code);

//             const uniqueDivisions = Array.from(new Set(zones.map(z => z.div_code)))
//                 .map(divCode => zones.find(z => z.div_code === divCode))
//                 .map(zone => ({ div_code: zone.div_code, division: zone.division }));
//             setDivisionName(uniqueDivisions);

//             const isSingleDivision = uniqueDivisions.length === 1;
//             setIsFieldsDisabled({ circle: true, division: isSingleDivision, subDivision: false, section: false });

//             if (isSingleDivision) {
//                 const selectedDivCode = uniqueDivisions[0].div_code;
//                 setDivision(selectedDivCode);
//                 const sdCode = await loadNextLevelAndAutoselect(selectedDivCode, 2, setSubDivisions, setSubDivision, 'subDivision');
//                 if (sdCode) {
//                     await loadNextLevelAndAutoselect(sdCode, 3, setSectionOptions, setSection, 'section');
//                 }
//             }
//         }
//         else if (level === 'circle') {
//             const uniqueCircles = Array.from(new Set(zones.map(z => z.circle_code)))
//                 .map(circleCode => zones.find(z => z.circle_code === circleCode))
//                 .map(zone => ({ circle_code: zone.circle_code, circle: zone.circle }));
//             setCircleOptions(uniqueCircles);

//             const isSingleCircle = uniqueCircles.length === 1;
//             setIsFieldsDisabled({ circle: isSingleCircle, division: false, subDivision: false, section: false });

//             if (isSingleCircle) {
//                 const selectedCircleCode = uniqueCircles[0].circle_code;
//                 setCircle(selectedCircleCode);

//                 const divCode = await loadNextLevelAndAutoselect(selectedCircleCode, 1, setDivisionName, setDivision, 'division');
//                 if (divCode) {
//                     const sdCode = await loadNextLevelAndAutoselect(divCode, 2, setSubDivisions, setSubDivision, 'subDivision');
//                     if (sdCode) {
//                         await loadNextLevelAndAutoselect(sdCode, 3, setSectionOptions, setSection, 'section');
//                     }
//                 }
//             }
//         }
//     }, [flagIdFunction]);

//     useEffect(() => {
//         const loadInitialData = async () => {
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userEmail = authUser?.user?.Email;
//             if (userEmail) {
//                 setUserName(userEmail);
//                 await loadDropdownDataFromSession();
//             }
//         };
//         loadInitialData();
//     }, [loadDropdownDataFromSession]);

//     // Load users when role or location filters change
//     useEffect(() => {
//         loadUsers();
//     }, [circle, division, subDivision, section, role, loadUsers]);

//     const resetSubsequentFilters = (changedLevel) => {
//         if (changedLevel === 'circle' && !isFieldsDisabled.division) {
//             setDivision('');
//             setDivisionName([]);
//         }
//         if ((changedLevel === 'circle' || changedLevel === 'division') && !isFieldsDisabled.subDivision) {
//             setSubDivision('');
//             setSubDivisions([]);
//         }
//         if ((changedLevel !== 'section') && !isFieldsDisabled.section) {
//             setSection('');
//             setSectionOptions([]);
//         }
//         setSelectedUser('');
//         setUserOptions([]);
//         setReportData(null);
//         setShowResults(false);
//     };

//     const handleCircleChange = async (e) => {
//         const selectedCircleCode = e.target.value;
//         setCircle(selectedCircleCode);
//         resetSubsequentFilters('circle');

//         if (selectedCircleCode && (userLevel === 'circle' || !isFieldsDisabled.division)) {
//             const divisions = await flagIdFunction({
//                 flagId: 1,
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

//         if (selectedDivCode && (userLevel === 'division' || userLevel === 'circle' || !isFieldsDisabled.subDivision)) {
//             const subdivisions = await flagIdFunction({
//                 flagId: 2,
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
//             if (userLevel === 'section' || userLevel === 'subdivision' || userLevel === 'division' || userLevel === 'circle') {
//                 const sections = await flagIdFunction({
//                     flagId: 3,
//                     requestUserName: userName,
//                     sd_code: selectedSdCode
//                 });
//                 setSectionOptions(sections);
//                 setIsFieldsDisabled(prev => ({
//                     ...prev,
//                     section: sections.length === 1
//                 }));
//                 if (sections.length === 1) {
//                     setSection(sections[0].so_code);
//                 }
//             }
//         }
//     };

//     const handleRoleChange = (e) => {
//         setRole(e.target.value);
//         setSelectedUser('');
//         setReportData(null);
//         setShowResults(false);
//     };

//     const handleDateRangeChange = (e) => {
//         setDateRange(e.target.value);
//         if (e.target.value !== 'custom') {
//             setCustomStartDate('');
//             setCustomEndDate('');
//         }
//         setReportData(null);
//         setShowResults(false);
//     };

//     const handleResetFilters = () => {
//         setCircle(''); setDivision(''); setSubDivision(''); setSection('');
//         setRole(''); setSelectedUser(''); setReportType(''); setDateRange('');
//         setCustomStartDate(''); setCustomEndDate('');
//         setReportData(null); setShowResults(false);
//         setCircleOptions([]); setDivisionName([]); setSubDivisions([]); setSectionOptions([]); setUserOptions([]);
//         setIsFieldsDisabled({ circle: false, division: false, subDivision: false, section: false });
//         loadDropdownDataFromSession();
//     };

//     const validateForm = () => {
//         if (!circle || !division || !subDivision || !section) {
//             setResponse('Please fill all required location filters');
//             setErrorModal(true);
//             return false;
//         }
//         if (!role || !selectedUser || !reportType || !dateRange) {
//             setResponse('Please fill all required report parameters');
//             setErrorModal(true);
//             return false;
//         }
//         if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
//             setResponse('Please select both start and end dates for custom range');
//             setErrorModal(true);
//             return false;
//         }
//         return true;
//     };

//     const generateMockReportData = (role, userId, reportType, startDate, endDate) => {
//         const selectedUserObj = userOptions.find(user =>
//             user.id === userId || user.user_id === userId || user.email === userId
//         );
//         const userNameDisplay = selectedUserObj ?
//             (selectedUserObj.user_name || selectedUserObj.name || selectedUserObj.email || 'Selected User') :
//             'Selected User';

//         const mockData = {
//             summary: {
//                 totalDocuments: Math.floor(Math.random() * 1000) + 100,
//                 approvedDocuments: Math.floor(Math.random() * 800) + 50,
//                 pendingDocuments: Math.floor(Math.random() * 100) + 10,
//                 rejectedDocuments: Math.floor(Math.random() * 50) + 5,
//             },
//             details: [],
//             filters: {
//                 role, user: userNameDisplay, reportType,
//                 dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
//                 circle: circleOptions.find(c => c.circle_code === circle)?.circle || circle,
//                 division: divisionName.find(d => d.div_code === division)?.division || division,
//                 subDivision: subDivisions.find(s => s.sd_code === subDivision)?.sub_division || subDivision,
//                 section: sectionOptions.find(s => s.so_code === section)?.section_office || section
//             }
//         };

//         for (let i = 1; i <= 20; i++) {
//             mockData.details.push({
//                 id: i,
//                 documentName: `Document_${i}.pdf`,
//                 accountId: `ACC${String(i).padStart(6, '0')}`,
//                 consumerName: `Consumer ${i}`,
//                 uploadedBy: userNameDisplay,
//                 uploadDate: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toLocaleDateString(),
//                 status: ['Approved', 'Pending', 'Rejected'][Math.floor(Math.random() * 3)],
//                 category: ['Bill', 'Connection', 'Complaint', 'Service'][Math.floor(Math.random() * 4)]
//             });
//         }
//         return mockData;
//     };


//     // --- FUNCTION TO OPEN REPORT IN STANDALONE HTML WINDOW ---
//     const openReportInNewWindow = (reportData) => {
//         const safeReportData = JSON.stringify(reportData);

//         // --- PDF EXPORT CONTENT (Clean Data Only) ---
//         const getPdfContent = (data) => {
//             const detailsRows = data.details.map((item, index) => `
//                 <tr>
//                     <td>${index + 1}</td>
//                     <td>${item.documentName}</td>
//                     <td>${item.accountId}</td>
//                     <td>${item.consumerName}</td>
//                     <td>${item.uploadedBy}</td>
//                     <td>${item.uploadDate}</td>
//                     <td>${item.status}</td>
//                     <td>${item.category}</td>
//                 </tr>
//             `).join('');

//             return `
//                 <html>
//                     <head>
//                         <title>Report - ${data.filters.reportType}</title>
//                         <style>
//                             body { font-family: Arial, sans-serif; margin: 20px; }
//                             h2, h4 { margin: 5px 0; text-align: center; }
//                             .filters p { margin: 5px 0; }
//                             .filters { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; font-size: 10pt; }
//                             .summary table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
//                             .summary th, .summary td { border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; }
//                             table.detail-table { width: 100%; border-collapse: collapse; }
//                             table.detail-table th, table.detail-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 9pt; }
//                             table.detail-table th { background-color: #f2f2f2; }
//                         </style>
//                     </head>
//                     <body>
//                         <h2>${data.filters.reportType} Report</h2>
//                         <h4>User: ${data.filters.user} | Role: ${data.filters.role}</h4>

//                         <div class="filters">
//                             <p><strong>Location:</strong> ${data.filters.circle} / ${data.filters.division} / ${data.filters.subDivision} / ${data.filters.section}</p>
//                             <p><strong>Date Range:</strong> ${data.filters.dateRange}</p>
//                         </div>

//                         <div class="summary">
//                             <h4>Summary</h4>
//                             <table>
//                                 <thead>
//                                     <tr>
//                                         <th>Total Documents</th>
//                                         <th>Approved</th>
//                                         <th>Pending</th>
//                                         <th>Rejected</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     <tr>
//                                         <td>${data.summary.totalDocuments}</td>
//                                         <td>${data.summary.approvedDocuments}</td>
//                                         <td>${data.summary.pendingDocuments}</td>
//                                         <td>${data.summary.rejectedDocuments}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         <h4>Detailed Records</h4>
//                         <table class="detail-table">
//                             <thead>
//                                 <tr>
//                                     <th>S.No</th>
//                                     <th>Document Name</th>
//                                     <th>Account ID</th>
//                                     <th>Consumer Name</th>
//                                     <th>Uploaded By</th>
//                                     <th>Upload Date</th>
//                                     <th>Status</th>
//                                     <th>Category</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 ${detailsRows}
//                             </tbody>
//                         </table>
//                     </body>
//                 </html>
//             `;
//         };
        
//         // --- BASE HTML FOR THE VIEWER TAB (With embedded JS functions) ---
//         const baseHtmlContent = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>${reportData.filters.reportType} Report | DMS</title>
//                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
//                 <style>
//                     /* Display Styles */
//                     body { font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
//                     .report-container { max-width: 1400px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
//                     .header { background-color: #007bff; color: white; padding: 15px; border-radius: 6px 6px 0 0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
//                     .filters-box { background-color: #f0f0f0; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
//                     .summary-card { padding: 15px; border: 1px solid #ddd; border-radius: 6px; text-align: center; margin-bottom: 15px; }
//                     table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; }
//                     th, td { border: 1px solid #e9ecef; padding: 8px; text-align: left; vertical-align: middle; }
//                     th { background-color: #343a40; color: white; }
//                     .badge-success { background-color: #28a745; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block; }
//                     .badge-warning { background-color: #ffc107; color: black; padding: 4px 8px; border-radius: 4px; display: inline-block; }
//                     .badge-danger { background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block; }
//                 </style>
//             </head>
//             <body>
//                 <div id="report-root"></div>

//                 <script>
//                     const REPORT_DATA = ${safeReportData};
                    
//                     // --- EXPORT FUNCTIONS (Optimized for data output) ---
                    
//                     function exportToPDF() {
//                         // Use the clean content from the function
//                         const pdfContent = (function(data) {
//                             const detailsRows = data.details.map((item, index) => \`
//                                 <tr>
//                                     <td>\${index + 1}</td>
//                                     <td>\${item.documentName}</td>
//                                     <td>\${item.accountId}</td>
//                                     <td>\${item.consumerName}</td>
//                                     <td>\${item.uploadedBy}</td>
//                                     <td>\${item.uploadDate}</td>
//                                     <td>\${item.status}</td>
//                                     <td>\${item.category}</td>
//                                 </tr>
//                             \`).join('');

//                             return \`
//                                 <html>
//                                     <head>
//                                         <title>Report - \${data.filters.reportType}</title>
//                                         <style>
//                                             body { font-family: Arial, sans-serif; margin: 20px; }
//                                             h2, h4 { margin: 5px 0; text-align: center; }
//                                             .filters p { margin: 5px 0; }
//                                             .filters { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; font-size: 10pt; }
//                                             .summary table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
//                                             .summary th, .summary td { border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; }
//                                             table.detail-table { width: 100%; border-collapse: collapse; }
//                                             table.detail-table th, table.detail-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 9pt; }
//                                             table.detail-table th { background-color: #f2f2f2; }
//                                         </style>
//                                     </head>
//                                     <body>
//                                         <h2>\${data.filters.reportType} Report</h2>
//                                         <h4>User: \${data.filters.user} | Role: \${data.filters.role}</h4>

//                                         <div class="filters">
//                                             <p><strong>Location:</strong> \${data.filters.circle} / \${data.filters.division} / \${data.filters.subDivision} / \${data.filters.section}</p>
//                                             <p><strong>Date Range:</strong> \${data.filters.dateRange}</p>
//                                         </div>

//                                         <div class="summary">
//                                             <h4>Summary</h4>
//                                             <table>
//                                                 <thead>
//                                                     <tr>
//                                                         <th>Total Documents</th>
//                                                         <th>Approved</th>
//                                                         <th>Pending</th>
//                                                         <th>Rejected</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     <tr>
//                                                         <td>\${data.summary.totalDocuments}</td>
//                                                         <td>\${data.summary.approvedDocuments}</td>
//                                                         <td>\${data.summary.pendingDocuments}</td>
//                                                         <td>\${data.summary.rejectedDocuments}</td>
//                                                     </tr>
//                                                 </tbody>
//                                             </table>
//                                         </div>

//                                         <h4>Detailed Records</h4>
//                                         <table class="detail-table">
//                                             <thead>
//                                                 <tr>
//                                                     <th>S.No</th>
//                                                     <th>Document Name</th>
//                                                     <th>Account ID</th>
//                                                     <th>Consumer Name</th>
//                                                     <th>Uploaded By</th>
//                                                     <th>Upload Date</th>
//                                                     <th>Status</th>
//                                                     <th>Category</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 \${detailsRows}
//                                             </tbody>
//                                         </table>
//                                     </body>
//                                 </html>
//                             \`;
//                         })(REPORT_DATA); 
                        
//                         const printWindow = window.open();
//                         printWindow.document.write(pdfContent);
//                         printWindow.document.close();
//                         // Use timeout to ensure content is fully rendered before print command
//                         setTimeout(() => printWindow.print(), 250); 
//                     }

//                     function exportToExcel() {
//                         let csvContent = "";
                        
//                         // 1. Filter Metadata (Clean)
//                         csvContent += "Report Type," + REPORT_DATA.filters.reportType + "\\n";
//                         csvContent += "User," + REPORT_DATA.filters.user + "\\n";
//                         csvContent += "Date Range," + REPORT_DATA.filters.dateRange + "\\n";
//                         csvContent += "Circle," + REPORT_DATA.filters.circle + "\\n";
//                         csvContent += "Division," + REPORT_DATA.filters.division + "\\n";
//                         csvContent += "Sub Division," + REPORT_DATA.filters.subDivision + "\\n";
//                         csvContent += "Section," + REPORT_DATA.filters.section + "\\n\\n";
                        
//                         // 2. Summary (Clean)
//                         csvContent += "Summary\\n";
//                         csvContent += "Total Documents," + REPORT_DATA.summary.totalDocuments + "\\n";
//                         csvContent += "Approved Documents," + REPORT_DATA.summary.approvedDocuments + "\\n";
//                         csvContent += "Pending Documents," + REPORT_DATA.summary.pendingDocuments + "\\n";
//                         csvContent += "Rejected Documents," + REPORT_DATA.summary.rejectedDocuments + "\\n\\n";
                        
//                         // 3. Table Headers (Clean)
//                         csvContent += "S.No,Document Name,Account ID,Consumer Name,Uploaded By,Upload Date,Status,Category\\n";
                        
//                         // 4. Data Rows (Clean - uses quotes to protect text fields)
//                         REPORT_DATA.details.forEach((row, index) => {
//                             csvContent += (index + 1) + ',"' + row.documentName + '","' + row.accountId + '","' + row.consumerName + '","' + row.uploadedBy + '","' + row.uploadDate + '","' + row.status + '","' + row.category + '"\\n';
//                         });

//                         const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
//                         const link = document.createElement("a");
//                         link.setAttribute("href", encodedUri);
//                         link.setAttribute("download", "Report_" + REPORT_DATA.filters.reportType + "_${new Date().toISOString().split('T')[0]}.csv");
//                         document.body.appendChild(link);
//                         link.click();
//                         document.body.removeChild(link);
//                     }
                    
//                     function windowClose() {
//                         window.close();
//                     }

//                     // --- Render function for the current tab viewer ---
//                     function renderReport(data) {
//                         const root = document.getElementById('report-root');
                        
//                         const summaryHtml = \`
//                             <div class="row g-3">
//                                 <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #007bff;"><div class="display-6 text-primary">\${data.summary.totalDocuments}</div><p class="text-muted mb-0">Total Documents</p></div></div>
//                                 <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #28a745;"><div class="display-6 text-success">\${data.summary.approvedDocuments}</div><p class="text-muted mb-0">Approved</p></div></div>
//                                 <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #ffc107;"><div class="display-6 text-warning">\${data.summary.pendingDocuments}</div><p class="text-muted mb-0">Pending</p></div></div>
//                                 <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #dc3545;"><div class="display-6 text-danger">\${data.summary.rejectedDocuments}</div><p class="text-muted mb-0">Rejected</p></div></div>
//                             </div>
//                         \`;

//                         const detailsRows = data.details.map((item, index) => {
//                             const statusBadge = item.status === 'Approved' ? 'badge-success' : item.status === 'Pending' ? 'badge-warning' : 'badge-danger';
//                             return \`
//                                 <tr>
//                                     <td>\${index + 1}</td>
//                                     <td>\${item.documentName}</td>
//                                     <td>\${item.accountId}</td>
//                                     <td>\${item.consumerName}</td>
//                                     <td>\${item.uploadedBy}</td>
//                                     <td>\${item.uploadDate}</td>
//                                     <td><span class="\${statusBadge}">\${item.status}</span></td>
//                                     <td>\${item.category}</td>
//                                 </tr>
//                             \`;
//                         }).join('');

//                         root.innerHTML = \`
//                             <div class="report-container">
//                                 <div class="header">
//                                     <h4 class="mb-0">\${data.filters.reportType} Report - \${data.filters.user}</h4>
//                                     <div class="d-flex gap-2">
//                                         <button onclick="exportToPDF()" class="btn btn-light btn-sm">Export PDF</button>
//                                         <button onclick="exportToExcel()" class="btn btn-info btn-sm">Export Excel</button>
//                                         <button onclick="windowClose()" class="btn btn-danger btn-sm">Close</button>
//                                     </div>
//                                 </div>

//                                 <div class="filters-box">
//                                     <h6 class="mb-3">Applied Filters</h6>
//                                     <div class="row g-2">
//                                         <div class="col-md-3"><small class="text-muted">Circle:</small><div class="fw-semibold">\${data.filters.circle}</div></div>
//                                         <div class="col-md-3"><small class="text-muted">Division:</small><div class="fw-semibold">\${data.filters.division}</div></div>
//                                         <div class="col-md-3"><small class="text-muted">Sub Division:</small><div class="fw-semibold">\${data.filters.subDivision}</div></div>
//                                         <div class="col-md-3"><small class="text-muted">Section:</small><div class="fw-semibold">\${data.filters.section}</div></div>
//                                         <div class="col-md-3"><small class="text-muted">Role:</small><div class="fw-semibold">\${data.filters.role}</div></div>
//                                         <div class="col-md-3"><small class="text-muted">User:</small><div class="fw-semibold">\${data.filters.user}</div></div>
//                                         <div class="col-md-6"><small class="text-muted">Date Range:</small><div class="fw-semibold">\${data.filters.dateRange}</div></div>
//                                     </div>
//                                 </div>

//                                 \${summaryHtml}

//                                 <h5 class="mt-4 mb-3">Detailed Records</h5>
//                                 <div class="table-responsive">
//                                     <table class="table table-striped table-hover">
//                                         <thead>
//                                             <tr>
//                                                 <th>S.No</th>
//                                                 <th>Document Name</th>
//                                                 <th>Account ID</th>
//                                                 <th>Consumer Name</th>
//                                                 <th>Uploaded By</th>
//                                                 <th>Upload Date</th>
//                                                 <th>Status</th>
//                                                 <th>Category</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             \${detailsRows}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         \`;
//                     }

//                     // Render the report immediately on load
//                     document.addEventListener('DOMContentLoaded', () => {
//                         renderReport(REPORT_DATA);
//                     });
//                 </script>
//             </body>
//             </html>
//         `;

//         const newWindow = window.open("", "_blank");
//         newWindow.document.write(baseHtmlContent);
//         newWindow.document.close();
//     };


//     const handleGenerateReport = async () => {
//         try {
//             if (!validateForm()) return;

//             setLoading(true);
//             setReportData(null);
//             setShowResults(false);

//             let startDate, endDate;
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             switch (dateRange) {
//                 case 'today':
//                     startDate = new Date(today.getTime());
//                     endDate = new Date(today.getTime());
//                     endDate.setHours(23, 59, 59, 999);
//                     break;
//                 case 'weekly':
//                     startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
//                     startDate.setHours(0, 0, 0, 0);
//                     endDate = new Date(today.getTime());
//                     endDate.setHours(23, 59, 59, 999);
//                     break;
//                 case 'monthly':
//                     startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//                     endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//                     endDate.setHours(23, 59, 59, 999);
//                     break;
//                 case 'custom':
//                     startDate = new Date(customStartDate);
//                     startDate.setHours(0, 0, 0, 0);
//                     endDate = new Date(customEndDate);
//                     endDate.setHours(23, 59, 59, 999);
//                     break;
//                 default:
//                     startDate = new Date(today.getTime());
//                     endDate = new Date(today.getTime());
//                     endDate.setHours(23, 59, 59, 999);
//             }

//             setTimeout(() => {
//                 const generatedReportData = generateMockReportData(role, selectedUser, reportType, startDate, endDate);

//                 // Open the custom-generated HTML window directly
//                 openReportInNewWindow(generatedReportData);

//                 setReportData(generatedReportData);
//                 setShowResults(true);

//                 setResponse('Report generated successfully and opened in a new window.');
//                 setSuccessModal(true);
//                 setLoading(false);
//             }, 2000);

//         } catch (error) {
//             console.error('Error generating report:', error.message);
//             setResponse('Error generating report');
//             setErrorModal(true);
//             setLoading(false);
//             setReportData(null);
//             setShowResults(false);
//         }
//     };

//     return (
//         <React.Fragment>
//             <ToastContainer closeButton={false} />
//             <div className="page-content">
//                 <BreadCrumb title="Reports" pageTitle="DMS" />
//                 <Container fluid>
//                     <SuccessModal
//                         show={successModal}
//                         onCloseClick={() => setSuccessModal(false)}
//                         successMsg={response}
//                     />

//                     <ErrorModal
//                         show={errorModal}
//                         onCloseClick={() => setErrorModal(false)}
//                         errorMsg={response || 'An error occurred'}
//                     />

//                     {/* Progressive Card Display */}
//                     <Row className="mb-4">
//                         {/* Card 1: Location Filters - Always visible */}
//                         <Col lg={3} md={6} className="mb-3">
//                             <Card className="h-100">
//                                 <CardHeader className="bg-primary text-white p-2">
//                                     <h6 className="mb-0 card-title text-white">
//                                         <i className="ri-map-pin-line me-2"></i>Location Filters
//                                     </h6>
//                                 </CardHeader>
//                                 <CardBody>
//                                     <div className="d-flex flex-column gap-3">
//                                         <FormGroup className="mb-0">
//                                             <div className="row align-items-center">
//                                                 <div className="col-4">
//                                                     <Label className="form-label fw-medium mb-0">Circle <span className="text-danger">*</span></Label>
//                                                 </div>
//                                                 <div className="col-8">
//                                                     <Input
//                                                         type="select"
//                                                         value={circle}
//                                                         onChange={handleCircleChange}
//                                                         disabled={isFieldsDisabled.circle}
//                                                         className="form-select"
//                                                     >
//                                                         <option value="">Select Circle</option>
//                                                         {circleOptions.map(circ => (
//                                                             <option key={circ.circle_code} value={circ.circle_code}>{circ.circle}</option>
//                                                         ))}
//                                                     </Input>
//                                                 </div>
//                                             </div>
//                                         </FormGroup>

//                                         <FormGroup className="mb-0">
//                                             <div className="row align-items-center">
//                                                 <div className="col-4">
//                                                     <Label className="form-label fw-medium mb-0">Division <span className="text-danger">*</span></Label>
//                                                 </div>
//                                                 <div className="col-8">
//                                                     <Input
//                                                         type="select"
//                                                         value={division}
//                                                         onChange={handleDivisionChange}
//                                                         disabled={isFieldsDisabled.division || !circle}
//                                                         className="form-select"
//                                                     >
//                                                         <option value="">Select Division</option>
//                                                         {divisionName.map(div => (
//                                                             <option key={div.div_code} value={div.div_code}>{div.division}</option>
//                                                         ))}
//                                                     </Input>
//                                                 </div>
//                                             </div>
//                                         </FormGroup>

//                                         <FormGroup className="mb-0">
//                                             <div className="row align-items-center">
//                                                 <div className="col-4">
//                                                     <Label className="form-label fw-medium mb-0">Sub Division <span className="text-danger">*</span></Label>
//                                                 </div>
//                                                 <div className="col-8">
//                                                     <Input
//                                                         type="select"
//                                                         value={subDivision}
//                                                         onChange={handleSubDivisionChange}
//                                                         disabled={isFieldsDisabled.subDivision || !division}
//                                                         className="form-select"
//                                                     >
//                                                         <option value="">Select Sub Division</option>
//                                                         {subDivisions.map(subDiv => (
//                                                             <option key={subDiv.sd_code} value={subDiv.sd_code}>
//                                                                 {subDiv.sub_division}
//                                                             </option>
//                                                         ))}
//                                                     </Input>
//                                                 </div>
//                                             </div>
//                                         </FormGroup>

//                                         <FormGroup className="mb-0">
//                                             <div className="row align-items-center">
//                                                 <div className="col-4">
//                                                     <Label className="form-label fw-medium mb-0">Section <span className="text-danger">*</span></Label>
//                                                 </div>
//                                                 <div className="col-8">
//                                                     <Input
//                                                         type="select"
//                                                         value={section}
//                                                         onChange={(e) => { setSection(e.target.value); resetSubsequentFilters('section'); }}
//                                                         disabled={isFieldsDisabled.section || !subDivision}
//                                                         className="form-select"
//                                                     >
//                                                         <option value="">Select Section</option>
//                                                         {sectionOptions.map(sec => (
//                                                             <option key={sec.so_code} value={sec.so_code}>
//                                                                 {sec.section_office}
//                                                             </option>
//                                                         ))}
//                                                     </Input>
//                                                 </div>
//                                             </div>
//                                         </FormGroup>
//                                     </div>
//                                 </CardBody>
//                             </Card>
//                         </Col>

//                         {/* Card 2: Report Parameters - Show after location filters are complete */}
//                         {circle && division && subDivision && section && (
//                             <Col lg={3} md={6} className="mb-3">
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
//                                                             <option value="Uploader">Uploader</option>
//                                                             <option value="QC">QC</option>
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
//                                                             disabled={!role || userOptions.length === 0}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select User</option>
//                                                             {userOptions.map(user => (
//                                                                 <option
//                                                                     key={user.id || user.user_id || user.email}
//                                                                     value={user.id || user.user_id || user.email}
//                                                                 >
//                                                                     {user.user_name || user.name || user.email || 'Unknown User'}
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
//                                                         <Label className="form-label fw-medium mb-0">Date Range <span className="text-danger">*</span></Label>
//                                                     </div>
//                                                     <div className="col-8">
//                                                         <Input
//                                                             type="select"
//                                                             value={dateRange}
//                                                             onChange={handleDateRangeChange}
//                                                             className="form-select"
//                                                         >
//                                                             <option value="">Select Date Range</option>
//                                                             <option value="today">Today</option>
//                                                             <option value="weekly">Weekly</option>
//                                                             <option value="monthly">Monthly</option>
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

//                         {/* Card 3: Date Range & Actions - Show after report parameters are selected */}
//                         {circle && division && subDivision && section && role && selectedUser && reportType && dateRange && (
//                             <Col lg={3} md={6} className="mb-3">
//                                 <Card className="h-100">
//                                     <CardHeader className="bg-primary text-white p-2">
//                                         <h6 className="mb-0 card-title text-white">
//                                             <i className="ri-calendar-line me-2"></i>Date Range & Actions
//                                         </h6>
//                                     </CardHeader>
//                                     <CardBody className="d-flex flex-column">
//                                         <div className="flex-grow-1">
//                                             <div className="d-flex flex-column gap-3">
//                                                 {dateRange === 'custom' ? (
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
//                                                                         max={new Date().toISOString().split('T')[0]}
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
//                                                                         max={new Date().toISOString().split('T')[0]}
//                                                                         className="form-control"
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         </FormGroup>
//                                                     </>
//                                                 ) : (
//                                                     <div className="text-muted text-center pt-5 pb-5">
//                                                         Date range calculated dynamically for: **{dateRange.toUpperCase()}**
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
//                                                     onClick={handleGenerateReport}
//                                                     disabled={loading || (dateRange === 'custom' && (!customStartDate || !customEndDate))}
//                                                 >
//                                                     {loading ? (
//                                                         <>
//                                                             <Spinner size="sm" className="me-2" />
//                                                             Generating...
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <i className="ri-file-chart-line me-2"></i>
//                                                             Generate Report & Open
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









import React, { useState, useEffect } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Input, Label, FormGroup,
    Alert, Spinner
} from 'reactstrap';
import { ToastContainer } from 'react-toastify';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';

const Reports = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    // Filter related states
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedUsername, setSelectedUsername] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    // Dynamic filters state
    const [filters, setFilters] = useState([
        { type: '', value: '' }
    ]);
    // Report results
    const [reportData, setReportData] = useState(null);
    // Dropdown data
    const [sectionOptions, setSectionOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [filterTypeOptions, setFilterTypeOptions] = useState([
        { value: 'document_type', label: 'Document Type' },
        { value: 'status', label: 'Status' },
        { value: 'category', label: 'Category' },
        { value: 'priority', label: 'Priority' },
        { value: 'department', label: 'Department' }
    ]);
    // Filter value options based on type
    const [filterValueOptions, setFilterValueOptions] = useState({});
    document.title = `Reports | DMS`;
    // Mock data for demonstration
    const mockSections = [
        { id: 'sec1', name: 'Section A' },
        { id: 'sec2', name: 'Section B' },
        { id: 'sec3', name: 'Section C' }
    ];
    const mockUsers = [
        { id: 'user1', name: 'John Doe', email: 'john@example.com' },
        { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: 'user3', name: 'Bob Wilson', email: 'bob@example.com' }
    ];
    const mockFilterValues = {
        document_type: [
            { value: 'invoice', label: 'Invoice' },
            { value: 'contract', label: 'Contract' },
            { value: 'report', label: 'Report' },
            { value: 'proposal', label: 'Proposal' }
        ],
        status: [
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'in_review', label: 'In Review' }
        ],
        category: [
            { value: 'finance', label: 'Finance' },
            { value: 'hr', label: 'HR' },
            { value: 'operations', label: 'Operations' },
            { value: 'it', label: 'IT' }
        ],
        priority: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' }
        ],
        department: [
            { value: 'sales', label: 'Sales' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'development', label: 'Development' },
            { value: 'support', label: 'Support' }
        ]
    };
    useEffect(() => {
        // Initialize with mock data
        setSectionOptions(mockSections);
        setUserOptions(mockUsers);
        setFilterValueOptions(mockFilterValues);
    }, []);
    // Add new filter
    const addFilter = () => {
        if (filters.length < 5) {
            setFilters([...filters, { type: '', value: '' }]);
        }
    };
    // Remove filter
    const removeFilter = (index) => {
        if (filters.length > 1) {
            const newFilters = filters.filter((_, i) => i !== index);
            setFilters(newFilters);
        }
    };
    // Update filter type
    const updateFilterType = (index, type) => {
        const newFilters = [...filters];
        newFilters[index] = { type, value: '' };
        setFilters(newFilters);
    };
    // Update filter value
    const updateFilterValue = (index, value) => {
        const newFilters = [...filters];
        newFilters[index].value = value;
        setFilters(newFilters);
    };
    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
        if (e.target.value !== 'custom') {
            setCustomStartDate('');
            setCustomEndDate('');
        }
    };
    const handleResetFilters = () => {
        setSelectedSection('');
        setSelectedUsername('');
        setDateRange('');
        setCustomStartDate('');
        setCustomEndDate('');
        setFilters([{ type: '', value: '' }]);
        setReportData(null);
    };
    const validateForm = () => {
        if (!selectedSection || !selectedUsername) {
            setResponse('Please select both Section and Username');
            setErrorModal(true);
            return false;
        }
        if (!dateRange) {
            setResponse('Please select a date range');
            setErrorModal(true);
            return false;
        }
        if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
            setResponse('Please select both start and end dates for custom range');
            setErrorModal(true);
            return false;
        }
        const invalidFilters = filters.filter(filter => filter.type && !filter.value);
        if (invalidFilters.length > 0) {
            setResponse('Please select values for all added filters');
            setErrorModal(true);
            return false;
        }
        return true;
    };
    const generateMockReportData = () => {
        const selectedSectionObj = sectionOptions.find(sec => sec.id === selectedSection);
        const selectedUserObj = userOptions.find(user => user.id === selectedUsername);
        const mockData = {
            summary: {
                totalDocuments: Math.floor(Math.random() * 1000) + 100,
                approvedDocuments: Math.floor(Math.random() * 800) + 50,
                pendingDocuments: Math.floor(Math.random() * 100) + 10,
                rejectedDocuments: Math.floor(Math.random() * 50) + 5,
            },
            details: [],
            filters: {
                section: selectedSectionObj?.name || selectedSection,
                username: selectedUserObj?.name || selectedUsername,
                dateRange: dateRange === 'custom' ?
                    `${customStartDate} to ${customEndDate}` :
                    dateRange,
                additionalFilters: filters.filter(f => f.type && f.value)
            }
        };
        const activeFilters = filters.filter(f => f.type && f.value);
        activeFilters.forEach(filter => {
            const filterTypeObj = filterTypeOptions.find(opt => opt.value === filter.type);
            const filterValueObj = filterValueOptions[filter.type]?.find(opt => opt.value === filter.value);
            mockData.filters[filterTypeObj?.label || filter.type] = filterValueObj?.label || filter.value;
        });
        for (let i = 1; i <= 20; i++) {
            mockData.details.push({
                id: i,
                documentName: `Document_${i}.pdf`,
                accountId: `ACC${String(i).padStart(6, '0')}`,
                consumerName: `Consumer ${i}`,
                uploadedBy: selectedUserObj?.name || selectedUsername,
                uploadDate: new Date().toLocaleDateString(),
                status: ['Approved', 'Pending', 'Rejected'][Math.floor(Math.random() * 3)],
                category: ['Bill', 'Connection', 'Complaint', 'Service'][Math.floor(Math.random() * 4)]
            });
        }
        return mockData;
    };
    const openReportInNewWindow = (reportData) => {
        const baseHtmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Report | DMS</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
                    .report-container { max-width: 1400px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .header { background-color: #007bff; color: white; padding: 15px; border-radius: 6px 6px 0 0; margin-bottom: 20px; }
                    .filters-box { background-color: #f0f0f0; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                    .summary-card { padding: 15px; border: 1px solid #ddd; border-radius: 6px; text-align: center; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; }
                    th, td { border: 1px solid #e9ecef; padding: 8px; text-align: left; }
                    th { background-color: #343a40; color: white; }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h4 class="mb-0">Generated Report</h4>
                    </div>
                    <div class="filters-box">
                        <h6 class="mb-3">Applied Filters</h6>
                        <div class="row g-2">
                            <div class="col-md-3">
                                <small class="text-muted">Section:</small>
                                <div class="fw-semibold">${reportData.filters.section}</div>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted">Username:</small>
                                <div class="fw-semibold">${reportData.filters.username}</div>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted">Date Range:</small>
                                <div class="fw-semibold">${reportData.filters.dateRange}</div>
                            </div>
                            ${Object.keys(reportData.filters)
                                .filter(key => !['section', 'username', 'dateRange', 'additionalFilters'].includes(key))
                                .map(key => `
                                    <div class="col-md-3">
                                        <small class="text-muted">${key}:</small>
                                        <div class="fw-semibold">${reportData.filters[key]}</div>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-3">
                            <div class="summary-card" style="border-left: 5px solid #007bff;">
                                <div class="display-6 text-primary">${reportData.summary.totalDocuments}</div>
                                <p class="text-muted mb-0">Total Documents</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="summary-card" style="border-left: 5px solid #28a745;">
                                <div class="display-6 text-success">${reportData.summary.approvedDocuments}</div>
                                <p class="text-muted mb-0">Approved</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="summary-card" style="border-left: 5px solid #ffc107;">
                                <div class="display-6 text-warning">${reportData.summary.pendingDocuments}</div>
                                <p class="text-muted mb-0">Pending</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="summary-card" style="border-left: 5px solid #dc3545;">
                                <div class="display-6 text-danger">${reportData.summary.rejectedDocuments}</div>
                                <p class="text-muted mb-0">Rejected</p>
                            </div>
                        </div>
                    </div>
                    <h5 class="mt-4 mb-3">Detailed Records</h5>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Document Name</th>
                                    <th>Account ID</th>
                                    <th>Consumer Name</th>
                                    <th>Uploaded By</th>
                                    <th>Upload Date</th>
                                    <th>Status</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.details.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.documentName}</td>
                                        <td>${item.accountId}</td>
                                        <td>${item.consumerName}</td>
                                        <td>${item.uploadedBy}</td>
                                        <td>${item.uploadDate}</td>
                                        <td>${item.status}</td>
                                        <td>${item.category}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </body>
            </html>
        `;
        const newWindow = window.open("", "_blank");
        newWindow.document.write(baseHtmlContent);
        newWindow.document.close();
    };
    const handleGenerateReport = async () => {
        try {
            if (!validateForm()) return;
            setLoading(true);
            setReportData(null);
            setTimeout(() => {
                const generatedReportData = generateMockReportData();
                openReportInNewWindow(generatedReportData);
                setReportData(generatedReportData);
                setResponse('Report generated successfully and opened in a new window.');
                setSuccessModal(true);
                setLoading(false);
            }, 2000);
        } catch (error) {
            console.error('Error generating report:', error.message);
            setResponse('Error generating report');
            setErrorModal(true);
            setLoading(false);
            setReportData(null);
        }
    };
    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <BreadCrumb title="Reports" pageTitle="DMS" />
                <Container fluid>
                    <SuccessModal
                        show={successModal}
                        onCloseClick={() => setSuccessModal(false)}
                        successMsg={response}
                    />
                    <ErrorModal
                        show={errorModal}
                        onCloseClick={() => setErrorModal(false)}
                        errorMsg={response || 'An error occurred'}
                    />
                    <Row className="mb-4">
                        {/* Main Filters Card */}
                        <Col lg={8} md={12} className="mb-3">
                            <Card className="h-100">
                                <CardHeader className="bg-primary text-white p-2">
                                    <h6 className="mb-0 card-title text-white">
                                        <i className="ri-filter-line me-2"></i>Main Filters
                                    </h6>
                                </CardHeader>
                                <CardBody>
                                    {/* Section Dropdown */}
                                    <FormGroup row className="align-items-center mb-2">
                                        <Label for="section" sm={2} className="fw-medium mb-0">Section <span className="text-danger">*</span></Label>
                                        <Col sm={4}>
                                            <Input
                                                id="section"
                                                type="select"
                                                value={selectedSection}
                                                onChange={(e) => setSelectedSection(e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="">Select Section</option>
                                                {sectionOptions.map(section => (
                                                    <option key={section.id} value={section.id}>
                                                        {section.name}
                                                    </option>
                                                ))}
                                            </Input>
                                        </Col>
                                        <Label for="username" sm={2} className="fw-medium mb-0">Username <span className="text-danger">*</span></Label>
                                        <Col sm={4}>
                                            <Input
                                                id="username"
                                                type="select"
                                                value={selectedUsername}
                                                onChange={(e) => setSelectedUsername(e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="">Select Username</option>
                                                {userOptions.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </Input>
                                        </Col>
                                    </FormGroup>
                                    
                                    {/* Dynamic Filters Row */}
                                    <FormGroup row className="align-items-center mb-2">
                                        <Label sm={2} className="fw-medium mb-0">Additional Filters</Label>
                                        <Col sm={10}>
                                            <Row>
                                                {filters.map((filter, index) => (
                                                    <Col md={6} key={index} className="d-flex align-items-center mb-2">
                                                        {/* Filter Type */}
                                                        <FormGroup row className="align-items-center mb-0 flex-grow-1">
                                                            <Label sm={4} className="mb-0 small">Type</Label>
                                                            <Col sm={8}>
                                                                <Input
                                                                    type="select"
                                                                    value={filter.type}
                                                                    onChange={(e) => updateFilterType(index, e.target.value)}
                                                                    className="form-select form-select-sm"
                                                                >
                                                                    <option value="">Select Type</option>
                                                                    {filterTypeOptions.map(option => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                            </Col>
                                                        </FormGroup>
                                                        {/* Filter Value */}
                                                        {filter.type && (
                                                            <FormGroup row className="align-items-center mb-0 flex-grow-1 ms-2">
                                                                <Label sm={4} className="mb-0 small">Value</Label>
                                                                <Col sm={8}>
                                                                    <Input
                                                                        type="select"
                                                                        value={filter.value}
                                                                        onChange={(e) => updateFilterValue(index, e.target.value)}
                                                                        className="form-select form-select-sm"
                                                                    >
                                                                        <option value="">Select Value</option>
                                                                        {filterValueOptions[filter.type]?.map(option => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                </Col>
                                                            </FormGroup>
                                                        )}
                                                        {filters.length > 1 && (
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                className="mb-0 ms-2"
                                                                onClick={() => removeFilter(index)}
                                                            >
                                                                <i className="ri-close-line"></i>
                                                            </Button>
                                                        )}
                                                    </Col>
                                                ))}
                                            </Row>
                                            {filters.length < 5 && (
                                                <Button
                                                    color="outline-primary"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={addFilter}
                                                >
                                                    <i className="ri-add-line me-1"></i>
                                                    Add Filter
                                                </Button>
                                            )}
                                        </Col>
                                    </FormGroup>
                                    
                                    {/* Date Range and Custom Date Row */}
                                    <FormGroup row className="align-items-center mb-2">
                                        <Label for="dateRange" sm={2} className="fw-medium mb-0">Date Range <span className="text-danger">*</span></Label>
                                        <Col sm={4}>
                                            <Input
                                                id="dateRange"
                                                type="select"
                                                value={dateRange}
                                                onChange={handleDateRangeChange}
                                                className="form-select"
                                            >
                                                <option value="">Select Date Range</option>
                                                <option value="today">Today</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="custom">Custom Date Range</option>
                                            </Input>
                                        </Col>
                                        {dateRange === 'custom' && (
                                            <>
                                                <Label for="customStartDate" sm={2} className="fw-medium mb-0">Start Date <span className="text-danger">*</span></Label>
                                                <Col sm={2}>
                                                    <Input
                                                        id="customStartDate"
                                                        type="date"
                                                        value={customStartDate}
                                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                                        max={new Date().toISOString().split('T')[0]}
                                                        className="form-control"
                                                    />
                                                </Col>
                                                <Label for="customEndDate" sm={2} className="fw-medium mb-0">End Date <span className="text-danger">*</span></Label>
                                                <Col sm={2}>
                                                    <Input
                                                        id="customEndDate"
                                                        type="date"
                                                        value={customEndDate}
                                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                                        min={customStartDate}
                                                        max={new Date().toISOString().split('T')[0]}
                                                        className="form-control"
                                                    />
                                                </Col>
                                            </>
                                        )}
                                    </FormGroup>
                                    
                                    {/* Action Buttons Row */}
                                    <FormGroup row className="align-items-center mb-0">
                                        <Col sm={{ size: 6, offset: 2 }}>
                                            <Button
                                                color="success"
                                                size="sm"
                                                className="me-2"
                                                onClick={handleGenerateReport}
                                                disabled={loading || !dateRange || (dateRange === 'custom' && (!customStartDate || !customEndDate))}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-file-chart-line me-2"></i>
                                                        Generate Report & Open
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                color="light"
                                                size="sm"
                                                onClick={handleResetFilters}
                                                disabled={loading}
                                            >
                                                <i className="ri-refresh-line me-2"></i>
                                                Reset All
                                            </Button>
                                        </Col>
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};
cd
export default Reports;
