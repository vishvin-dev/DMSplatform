// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//     Card, CardBody, CardHeader, Col, Container, Row,
//     Button, Badge, Input, Label, FormGroup, ListGroup, ListGroupItem,
//     Alert, Spinner
// } from 'reactstrap';
// import { getDocumentDropdowns, viewDocument, view, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
// import { ToastContainer } from 'react-toastify';
// import SuccessModal from '../../Components/Common/SuccessModal';
// import ErrorModal from '../../Components/Common/ErrorModal';
// import BreadCrumb from '../../Components/Common/BreadCrumb';

// const ViewDocuments = () => {
//     // State management
//     const [documents, setDocuments] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [response, setResponse] = useState('');
//     const [previewLoading, setPreviewLoading] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewContent, setPreviewContent] = useState(null);
//     const [previewError, setPreviewError] = useState(null);

//     // Modal states
//     const [successModal, setSuccessModal] = useState(false);
//     const [errorModal, setErrorModal] = useState(false);

//     // Search related states
//     const [division, setDivision] = useState('');
//     const [subDivision, setSubDivision] = useState('');
//     const [section, setSection] = useState('');
//     const [userName, setUserName] = useState("");
//     const [accountSearchInput, setAccountSearchInput] = useState('');
//     const [accountSuggestions, setAccountSuggestions] = useState([]);
//     const [showSuggestions, setShowSuggestions] = useState(false);
//     const [hasSearched, setHasSearched] = useState(false);
//     const [account_id, setaccount_id] = useState('');
//     const [consumerInfo, setConsumerInfo] = useState(null);
//     const [showResults, setShowResults] = useState(false);

//     // Dropdown data
//     const [divisionName, setDivisionName] = useState([]);
//     const [subDivisions, setSubDivisions] = useState([]);
//     const [sectionOptions, setSectionOptions] = useState([]);
    
//     // New states for zone level
//     const [circle, setCircle] = useState('');
//     const [circles, setCircles] = useState([]);

//     // User access level states
//     const [userLevel, setUserLevel] = useState('');
//     const [isFieldsDisabled, setIsFieldsDisabled] = useState({
//         circle: false,
//         division: false,
//         subDivision: false,
//         section: false
//     });

//     document.title = `View Documents | DMS`;

//     const debounceRef = useRef();

//     const flagIdFunction = useCallback(async (params) => {
//         try {
//             const res = await getAllUserDropDownss(params);
//             return res?.data || [];
//         } catch (error) {
//             console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
//             return [];
//         }
//     }, []);

//     // Function to load dropdown data based on user level
//     const loadDropdownDataFromSession = useCallback(async () => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//         const zones = authUser?.user?.zones || [];
        
//         if (zones.length === 0) return;

//         // Get the user's level from the first zone entry
//         const userZone = zones[0];
//         const level = userZone.level;
//         const zoneCode = userZone.zone_code;
//         setUserLevel(level);

//         console.log("User Level:", level);
//         console.log("Zone Code:", zoneCode);
//         console.log("All Zones:", zones);

//         // Handle ZONE level user
//         if (level === 'zone') {
//             setIsFieldsDisabled({
//                 circle: false,
//                 division: false,
//                 subDivision: false,
//                 section: false
//             });

//             // Fetch circles using zone_code
//             if (zoneCode) {
//                 try {
//                     const circlesData = await flagIdFunction({ 
//                         flagId: 7, 
//                         requestUserName: authUser.user.Email,
//                         zone_code: zoneCode
//                     });
//                     setCircles(circlesData);
//                     console.log("Fetched circles:", circlesData);
//                 } catch (error) {
//                     console.error("Error fetching circles:", error);
//                 }
//             }

//             // Don't set any default values for zone level
//             setCircle('');
//             setDivision('');
//             setSubDivision('');
//             setSection('');
//         }
//         // Handle other levels (existing code)
//         else if (level === 'section') {
//             // Get unique divisions from zones
//             const divisionData = [];
//             const seenDivisions = new Set();
//             zones.forEach(zone => {
//                 if (!seenDivisions.has(zone.div_code)) {
//                     seenDivisions.add(zone.div_code);
//                     divisionData.push({ div_code: zone.div_code, division: zone.division });
//                 }
//             });

//             // Get unique sub-divisions from zones
//             const subDivisionData = [];
//             const seenSubDivisions = new Set();
//             zones.forEach(zone => {
//                 if (!seenSubDivisions.has(zone.sd_code)) {
//                     seenSubDivisions.add(zone.sd_code);
//                     subDivisionData.push({ sd_code: zone.sd_code, sub_division: zone.sub_division });
//                 }
//             });

//             // Get all sections from zones
//             const sectionData = zones.map(zone => ({ so_code: zone.so_code, section_office: zone.section_office }));

//             setDivisionName(divisionData);
//             setSubDivisions(subDivisionData);
//             setSectionOptions(sectionData);

//             // Set division if only one exists
//             if (divisionData.length === 1) {
//                 setDivision(divisionData[0].div_code);
//                 setIsFieldsDisabled(prev => ({ ...prev, division: true }));
//             }

//             // Set sub-division display value - ONLY FOR SECTION LEVEL
//             if (subDivisionData.length === 1) {
//                 setSubDivision(subDivisionData[0].sd_code);
//                 setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
//             } else {
//                 // For multiple sub-divisions, set a special value to display all
//                 setSubDivision('multiple');
//                 setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
//             }

//             // Set section if only one exists
//             if (sectionData.length === 1) {
//                 setSection(sectionData[0].so_code);
//                 setIsFieldsDisabled(prev => ({ ...prev, section: true }));
//             }
//         }
//         else if (level === 'subdivision') {
//             const divisionData = [{ 
//                 div_code: userZone.div_code, 
//                 division: userZone.division 
//             }];
            
//             // Get unique subdivisions from zones (in case there are multiple)
//             const uniqueSubDivisions = [];
//             const seenSubDivisions = new Set();
//             zones.forEach(zone => {
//                 if (!seenSubDivisions.has(zone.sd_code)) {
//                     seenSubDivisions.add(zone.sd_code);
//                     uniqueSubDivisions.push({
//                         sd_code: zone.sd_code,
//                         sub_division: zone.sub_division
//                     });
//                 }
//             });

//             setDivisionName(divisionData);
//             setSubDivisions(uniqueSubDivisions);
            
//             // Set default values and disable fields
//             setDivision(userZone.div_code);
//             setIsFieldsDisabled({
//                 circle: true,
//                 division: true,
//                 subDivision: uniqueSubDivisions.length === 1,
//                 section: false
//             });
            
//             // If only one subdivision, auto-select it and load sections
//             if (uniqueSubDivisions.length === 1) {
//                 const selectedSdCode = uniqueSubDivisions[0].sd_code;
//                 setSubDivision(selectedSdCode);
                
//                 // Load sections for the auto-selected subdivision
//                 const sections = await flagIdFunction({
//                     flagId: 3,
//                     requestUserName: userName,
//                     sd_code: selectedSdCode
//                 });
//                 setSectionOptions(sections);
                
//                 // If only one section, auto-select it too
//                 if (sections.length === 1) {
//                     setSection(sections[0].so_code);
//                     setIsFieldsDisabled(prev => ({
//                         ...prev,
//                         section: true
//                     }));
//                 }
//             }
//         }
//         else if (level === 'division') {
//             // Get unique divisions from zones (in case there are multiple)
//             const uniqueDivisions = [];
//             const seenDivisions = new Set();
//             zones.forEach(zone => {
//                 if (!seenDivisions.has(zone.div_code)) {
//                     seenDivisions.add(zone.div_code);
//                     uniqueDivisions.push({
//                         div_code: zone.div_code,
//                         division: zone.division
//                     });
//                 }
//             });

//             setDivisionName(uniqueDivisions);
//             setIsFieldsDisabled({
//                 circle: true,
//                 division: uniqueDivisions.length === 1,
//                 subDivision: false,
//                 section: false
//             });
            
//             // If only one division, auto-select it and load subdivisions
//             if (uniqueDivisions.length === 1) {
//                 const selectedDivCode = uniqueDivisions[0].div_code;
//                 setDivision(selectedDivCode);
                
//                 // Load subdivisions for the auto-selected division
//                 const subdivisions = await flagIdFunction({
//                     flagId: 2,
//                     requestUserName: userName,
//                     div_code: selectedDivCode
//                 });
//                 setSubDivisions(subdivisions);
                
//                 // If only one subdivision, auto-select it too
//                 if (subdivisions.length === 1) {
//                     setSubDivision(subdivisions[0].sd_code);
//                     setIsFieldsDisabled(prev => ({
//                         ...prev,
//                         subDivision: true
//                     }));
                    
//                     // Load sections for the auto-selected subdivision
//                     const sections = await flagIdFunction({
//                         flagId: 3,
//                         requestUserName: userName,
//                         sd_code: subdivisions[0].sd_code
//                     });
//                     setSectionOptions(sections);
                    
//                     // If only one section, auto-select it too
//                     if (sections.length === 1) {
//                         setSection(sections[0].so_code);
//                         setIsFieldsDisabled(prev => ({
//                             ...prev,
//                             section: true
//                         }));
//                     }
//                 }
//             }
//         }
//         else if (level === 'circle') {
//             // For circle level, don't pre-populate anything and keep fields enabled
//             setIsFieldsDisabled({
//                 circle: true,
//                 division: false,
//                 subDivision: false,
//                 section: false
//             });
//             // Don't set any default values for circle level
//             setDivision('');
//             setSubDivision('');
//             setSection('');
//         }
//     }, [flagIdFunction, userName]);

//     useEffect(() => {
//         const loadInitialData = async () => {
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userEmail = authUser?.user?.Email;
//             if (userEmail) {
//                 setUserName(userEmail);
                
//                 // Load dropdown data based on user's access level
//                 await loadDropdownDataFromSession();
//             }
//         };

//         loadInitialData();

//         return () => {
//             if (debounceRef.current) clearTimeout(debounceRef.current);
//             if (previewContent?.url) URL.revokeObjectURL(previewContent.url);
//         };
//     }, [loadDropdownDataFromSession]);

//     const resetSubsequentFilters = (resetLevel = 'circle') => {
//         if (resetLevel === 'circle') {
//             setDivision('');
//             setDivisionName([]);
//             setSubDivision('');
//             setSubDivisions([]);
//             setSection('');
//             setSectionOptions([]);
//         } else if (resetLevel === 'division') {
//             setSubDivision('');
//             setSubDivisions([]);
//             setSection('');
//             setSectionOptions([]);
//         } else if (resetLevel === 'subDivision') {
//             setSection('');
//             setSectionOptions([]);
//         }
        
//         setAccountSearchInput(''); 
//         setaccount_id('');
//         setHasSearched(false); 
//         setDocuments([]);
//         setConsumerInfo(null);
//         setShowResults(false);
//     };

//     // NEW: Handle circle change for zone level users
//     const handleCircleChange = async (e) => {
//         const selectedCircleCode = e.target.value;
//         setCircle(selectedCircleCode);
//         resetSubsequentFilters('circle');

//         if (selectedCircleCode) {
//             const divisions = await flagIdFunction({ 
//                 flagId: 1, 
//                 requestUserName: userName,
//                 circle_code: selectedCircleCode
//             });
//             setDivisionName(divisions);
//         }
//     };

//     // UPDATED: Handle division change
//     const handleDivisionChange = async (e) => {
//         const selectedDivCode = e.target.value;
//         setDivision(selectedDivCode);
//         resetSubsequentFilters('division');

//         if (selectedDivCode) {
//             const subdivisions = await flagIdFunction({ 
//                 flagId: 2, 
//                 requestUserName: userName, 
//                 div_code: selectedDivCode
//             });
//             setSubDivisions(subdivisions);

//             if (subdivisions.length === 1 && userLevel !== 'zone' && userLevel !== 'circle') {
//                 setSubDivision(subdivisions[0].sd_code);
//                 setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));

//                 const sections = await flagIdFunction({ 
//                     flagId: 3, 
//                     requestUserName: userName, 
//                     sd_code: subdivisions[0].sd_code
//                 });
//                 setSectionOptions(sections);

//                 if (sections.length === 1) {
//                     setSection(sections[0].so_code);
//                     setIsFieldsDisabled(prev => ({ ...prev, section: true }));
//                 } else {
//                     setIsFieldsDisabled(prev => ({ ...prev, section: false }));
//                 }
//             } else {
//                 setIsFieldsDisabled(prev => ({ ...prev, subDivision: false, section: false }));
//             }
//         }
//     };

//     // UPDATED: Handle sub-division change
//     const handleSubDivisionChange = async (e) => {
//         const selectedSdCode = e.target.value;
//         setSubDivision(selectedSdCode);
//         resetSubsequentFilters('subDivision');

//         if (!isFieldsDisabled.section) {
//             setSection('');
//             setSectionOptions([]);
//         }

//         if (selectedSdCode) {
//             const sections = await flagIdFunction({ 
//                 flagId: 3, 
//                 requestUserName: userName, 
//                 sd_code: selectedSdCode
//             });
//             setSectionOptions(sections);

//             if (sections.length === 1 && userLevel !== 'zone' && userLevel !== 'circle') {
//                 setSection(sections[0].so_code);
//                 setIsFieldsDisabled(prev => ({ ...prev, section: true }));
//             } else {
//                 setIsFieldsDisabled(prev => ({ ...prev, section: false }));
//             }
//         }
//     };

//     const handleSectionChange = (e) => {
//         const selectedSectionCode = e.target.value;
//         setSection(selectedSectionCode);
        
//         // Reset account search fields when section changes
//         setAccountSearchInput('');
//         setaccount_id('');
//         setHasSearched(false);
//         setDocuments([]);
//         setConsumerInfo(null);
//         setShowResults(false);
//     };

//     const handleAccountSearchChange = (e) => {
//         const value = e.target.value;
//         setAccountSearchInput(value);
//         setAccountSuggestions([]);
//         setaccount_id('');
//         setLoading(false);
//         setShowSuggestions(false);

//         if (debounceRef.current) clearTimeout(debounceRef.current);

//         if (value.length >= 5) {
//             debounceRef.current = setTimeout(async () => {
//                 try {
//                     const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
//                     const params = {
//                         flagId: 4,
//                         section: selectedSectionObj ? selectedSectionObj.section_office : '',
//                         account_id: value
//                     };
//                     setLoading(true);
//                     setShowSuggestions(true);
//                     const response = await getDocumentDropdowns(params);
//                     const options = response?.data || [];
//                     setAccountSuggestions(options);
//                 } catch (error) {
//                     console.error('Error fetching Account Suggestions:', error.message);
//                 } finally {
//                     setLoading(false);
//                 }
//             }, 300);
//         }
//     };

//     const handleAccountSuggestionClick = (accId) => {
//         setaccount_id(accId);
//         setAccountSearchInput(accId);
//         setAccountSuggestions([]);
//         setShowSuggestions(false);
//         setHasSearched(false);
//     };

//     // Function to render sub-division dropdown options
//     const renderSubDivisionOptions = () => {
//         if (subDivisions.length === 0) {
//             return <option value="">Select Sub Division</option>;
//         }

//         // ONLY show comma-separated values for SECTION level users with multiple sub-divisions
//         if (userLevel === 'section' && subDivisions.length > 1) {
//             // For multiple sub-divisions in section level, show comma-separated in a single disabled option
//             const allSubDivisionNames = subDivisions.map(sd => sd.sub_division).join(', ');
//             return (
//                 <>
//                     <option value="multiple" disabled>
//                         {allSubDivisionNames}
//                     </option>
//                 </>
//             );
//         }

//         // For all other cases (including zone and circle level), show normal dropdown options
//         return (
//             <>
//                 <option value="">Select Sub Division</option>
//                 {subDivisions.map(subDiv => (
//                     <option key={subDiv.sd_code} value={subDiv.sd_code}>
//                         {subDiv.sub_division}
//                     </option>
//                 ))}
//             </>
//         );
//     };

//     const getFileIcon = (type) => {
//         const icons = {
//             pdf: 'ri-file-pdf-line text-danger',
//             doc: 'ri-file-word-line text-primary',
//             docx: 'ri-file-word-line text-primary',
//             xls: 'ri-file-excel-line text-success',
//             xlsx: 'ri-file-excel-line text-success',
//             ppt: 'ri-file-ppt-line text-warning',
//             pptx: 'ri-file-ppt-line text-warning',
//             jpg: 'ri-image-line text-info',
//             jpeg: 'ri-image-line text-info',
//             png: 'ri-image-line text-info',
//             gif: 'ri-image-line text-info'
//         };

//         return <i className={`${icons[type] || 'ri-file-line text-secondary'} fs-3`}></i>;
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return '';
//         const date = new Date(dateString);
//         return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
//     };

//     const handleSearch = async () => {
//         try {
//             if (!account_id) {
//                 setResponse('Please enter an account ID');
//                 setErrorModal(true);
//                 return;
//             }

//             setLoading(true);
//             setShowResults(false);
//             setDocuments([]);
//             setConsumerInfo(null); // Reset consumer info when searching
//             setSelectedFile(null);
//             setPreviewContent(null);
//             setPreviewError(null);

//             const obj = JSON.parse(sessionStorage.getItem("authUser"));
//             const requestUserName = obj.user.Email;

//             const roleId = obj.user.Role_Id;

//             const params = {
//                 flagId: 1,
//                 accountId: account_id,
//                 roleId,
//                 requestUserName: requestUserName
//             };
//             const response = await viewDocument(params);

//             if (response?.status === "success") {
//                 // Set consumer info from the first document if available
//                 if (response.data && response.data.length > 0) {
//                     const firstDoc = response.data[0];
//                     setConsumerInfo({
//                         accountId: firstDoc.Account_Id,
//                         name: firstDoc.consumer_name,
//                         address: firstDoc.consumer_address,
//                         phone: firstDoc.phone,
//                         rrNo: firstDoc.rr_no
//                     });
//                 }

//                 // Show consumer info immediately
//                 setShowResults(true);

//                 // Then show documents after a short delay
//                 setTimeout(() => {
//                     const transformedDocuments = response.data.map(doc => ({
//                         id: doc.DocumentId,
//                         name: doc.DocumentName,
//                         description: doc.DocumentDescription,
//                         createdBy: doc.CreatedByUserName,
//                         createdAt: formatDate(doc.CreatedAt),
//                         category: doc.CategoryName,
//                         status: doc.StatusName,
//                         url: doc.FilePath,
//                         type: doc.FilePath.split('.').pop().toLowerCase(),
//                         documentId: doc.DocumentId,
//                         updatedOn: formatDate(doc.UpdatedOn)
//                     }));

//                     setDocuments(transformedDocuments);
//                     setHasSearched(true);
//                     setResponse(response.message || 'Documents found successfully');
//                     setSuccessModal(true);
//                 }, 1000);
//             } else {
//                 setConsumerInfo(null);
//                 setShowResults(true);
//                 setDocuments([]);
//                 setResponse(response?.message || 'No documents found for this account');
//                 setErrorModal(true);
//             }
//         } catch (error) {
//             console.error('Error on submit:', error.message);
//             setResponse('Error fetching documents');
//             setErrorModal(true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleResetFilters = () => {
//         // Reset all fields
//         setCircle('');
//         setDivision('');
//         setSubDivision('');
//         setSection('');
//         setAccountSearchInput('');
//         setaccount_id('');
//         setHasSearched(false);
//         setDocuments([]);
//         setConsumerInfo(null);
//         setShowResults(false);
        
//         // Reload dropdown data from session storage
//         loadDropdownDataFromSession();
//     };

//     const handleFileSelect = async (file) => {
//         setSelectedFile(file);
//         setPreviewLoading(true);
//         setPreviewContent(null);
//         setPreviewError(null);

//         try {
//             const response = await view(
//                 {
//                     flagId: 2,
//                     DocumentId: file.documentId,
//                 },
//                 {
//                     responseType: "blob",
//                     headers: { "Content-Type": "application/json" },
//                     transformResponse: [(data, headers) => ({ data, headers })],
//                 }
//             );

//             const blob = response.data;
//             const fileUrl = URL.createObjectURL(blob);
//             const fileType = blob.type.split('/')[1] || file.type || 'unknown';

//             setPreviewContent({
//                 url: fileUrl,
//                 type: fileType,
//                 name: file.name
//             });
//         } catch (error) {
//             console.error("Preview error:", error);
//             setPreviewError(error.message || "Failed to load preview");
//         } finally {
//             setPreviewLoading(false);
//         }
//     };

//     const handleDocumentAction = async (documentId) => {
//         try {
//             const response = await view(
//                 {
//                     flagId: 2,
//                     DocumentId: documentId,
//                 },
//                 {
//                     responseType: "blob",
//                     headers: { "Content-Type": "application/json" },
//                     transformResponse: [(data, headers) => ({ data, headers })],
//                 }
//             );

//             const contentDisposition = response.headers?.["content-disposition"];
//             let fileName = `document_${documentId}.pdf`;

//             if (contentDisposition) {
//                 const match = contentDisposition.match(/filename="?([^"]+)"?/);
//                 if (match && match[1]) {
//                     fileName = decodeURIComponent(match[1]);
//                 }
//             } else {
//                 console.warn("Content-Disposition header missing — using fallback filename.");
//             }

//             const blob = response.data;
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = fileName;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//         } catch (err) {
//             console.error("Download failed:", err);
//             alert("Failed to download file");
//         }
//     };

//     return (
//         <React.Fragment>
            
//             <ToastContainer closeButton={false} />
//             <div className="page-content">
//                 <BreadCrumb  title="Document Search"pageTitle="DMS" />
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

//                     {/* Search Filters */}
//                     <Card className="mb-3">
//                         <CardHeader className="bg-primary text-white p-3">
//                             <h4 className="mb-0 card-title text-white">Search Documents</h4>
//                         </CardHeader>
//                         <CardBody>
//                             <Row className="g-3 mb-3">
//                                 {/* Circle Field - Only show for zone level users */}
//                                 {userLevel === 'zone' && (
//                                     <Col md={3}>
//                                         <FormGroup>
//                                             <Label>Circle <span className="text-danger">*</span></Label>
//                                             <Input
//                                                 type="select"
//                                                 value={circle}
//                                                 onChange={handleCircleChange}
//                                                 disabled={isFieldsDisabled.circle}
//                                             >
//                                                 <option value="">Select Circle</option>
//                                                 {circles.map(circleItem => (
//                                                     <option key={circleItem.circle_code} value={circleItem.circle_code}>
//                                                         {circleItem.circle}
//                                                     </option>
//                                                 ))}
//                                             </Input>
//                                         </FormGroup>
//                                     </Col>
//                                 )}
//                                 <Col md={userLevel === 'zone' ? 3 : 4}>
//                                     <FormGroup>
//                                         <Label>Division <span className="text-danger">*</span></Label>
//                                         <Input
//                                             type="select"
//                                             value={division}
//                                             onChange={handleDivisionChange}
//                                             disabled={isFieldsDisabled.division || (userLevel === 'zone' && !circle)}
//                                         >
//                                             <option value="">Select Division</option>
//                                             {divisionName.map(div => (
//                                                 <option key={div.div_code} value={div.div_code}>{div.division}</option>
//                                             ))}
//                                         </Input>
//                                     </FormGroup>
//                                 </Col>
//                                 <Col md={userLevel === 'zone' ? 3 : 4}>
//                                     <FormGroup>
//                                         <Label>Sub Division <span className="text-danger">*</span></Label>
//                                         <Input
//                                             type="select"
//                                             value={subDivision}
//                                             onChange={handleSubDivisionChange}
//                                             disabled={isFieldsDisabled.subDivision || !division}
//                                         >
//                                             {renderSubDivisionOptions()}
//                                         </Input>
//                                     </FormGroup>
//                                 </Col>
//                                 <Col md={userLevel === 'zone' ? 3 : 4}>
//                                     <FormGroup>
//                                         <Label>Section <span className="text-danger">*</span></Label>
//                                         <Input
//                                             type="select"
//                                             value={section}
//                                             onChange={handleSectionChange}
//                                             disabled={isFieldsDisabled.section || !subDivision}
//                                         >
//                                             <option value="">Select Section</option>
//                                             {sectionOptions.map(sec => (
//                                                 <option key={sec.so_code} value={sec.so_code}>
//                                                     {sec.section_office}
//                                                 </option>
//                                             ))}
//                                         </Input>
//                                     </FormGroup>
//                                 </Col>
//                             </Row>

//                             <Row className="g-3 mb-4">
//                                 <Col md={8}>
//                                     <FormGroup className="mb-0">
//                                         <Label>
//                                             Enter Account ID (min 5 chars)
//                                             <span className="text-danger">*</span>
//                                         </Label>
//                                         <div className="d-flex align-items-center">
//                                             <div className="position-relative me-3" style={{ width: "350px" }}>
//                                                 <Input
//                                                     type="text"
//                                                     value={accountSearchInput}
//                                                     onChange={handleAccountSearchChange}
//                                                     placeholder="Enter Account ID"
//                                                     disabled={!section}
//                                                     className="form-control"
//                                                 />
//                                                 {showSuggestions && (
//                                                     <ListGroup
//                                                         className="position-absolute w-100"
//                                                         style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
//                                                     >
//                                                         {loading ? (
//                                                             <ListGroupItem>Loading...</ListGroupItem>
//                                                         ) : accountSuggestions.length > 0 ? (
//                                                             accountSuggestions.map((acc) => (
//                                                                 <ListGroupItem
//                                                                     key={acc.account_id}
//                                                                     action
//                                                                     onClick={() => handleAccountSuggestionClick(acc.account_id)}
//                                                                 >
//                                                                     {acc.account_id}
//                                                                 </ListGroupItem>
//                                                             ))
//                                                         ) : (
//                                                             <ListGroupItem>No data found</ListGroupItem>
//                                                         )}
//                                                     </ListGroup>
//                                                 )}
//                                             </div>

//                                             <Button
//                                                 color="primary"
//                                                 className="rounded px-4"
//                                                 style={{ minWidth: "120px" }}
//                                                 onClick={handleSearch}
//                                                 disabled={!account_id || loading}
//                                             >
//                                                 {loading ? (
//                                                     <>
//                                                         <Spinner size="sm" className="me-1" /> Searching...
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <i className="ri-search-line me-1"></i> Search
//                                                     </>
//                                                 )}
//                                             </Button>
//                                             <Button
//                                                 color="light"
//                                                 className="rounded px-4 ms-2"
//                                                 style={{ minWidth: "120px" }}
//                                                 onClick={handleResetFilters}
//                                             >
//                                                 Reset
//                                             </Button>
//                                         </div>
//                                     </FormGroup>
//                                 </Col>
//                             </Row>
//                         </CardBody>
//                     </Card>

//                     {/* Results Section - Only show when showResults is true */}
//                     {showResults && (
//                         <Row className="g-3 results-container">
//                             {/* Left Column (Consumer and Document Info) */}
//                             <Col lg={3} className="h-100 d-flex flex-column">
//                                 {/* Consumer Information Card */}
//                                 <Card className="mb-3 slide-in-left fixed-height-card">
//                                     <CardHeader className="bg-light p-3 position-relative"
//                                         style={{
//                                             borderTop: '3px solid #405189'
//                                         }}>
//                                         <h5 className="mb-0">Consumer Information</h5>
//                                     </CardHeader>
//                                     <CardBody className="p-1 custom-scrollbar">
//                                         {consumerInfo ? (
//                                             <div className="consumer-details">
//                                                 <div className="row g-0">
//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center mb-1">
//                                                             <i className="ri-user-3-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Account ID:</Label>
//                                                                 <span className="fw-semibold x-small">{consumerInfo.accountId}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center mb-1">
//                                                             <i className="ri-profile-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
//                                                                 <span className="fw-semibold x-small">{consumerInfo.name}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center mb-1">
//                                                             <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Address:</Label>
//                                                                 <span className="fw-semibold x-small">{consumerInfo.address}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center mb-1">
//                                                             <i className="ri-phone-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Phone:</Label>
//                                                                 <span className="fw-semibold x-small">{consumerInfo.phone}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center">
//                                                             <i className="ri-file-copy-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">RR No:</Label>
//                                                                 <span className="fw-semibold x-small">{consumerInfo.rrNo}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
//                                                 <i className="ri-user-line fs-5"></i>
//                                                 <p className="mt-1 x-small mb-0">No consumer information</p>
//                                             </div>
//                                         )}
//                                     </CardBody>
//                                 </Card>

//                                 {/* Document Information Card */}
//                                 <Card className="slide-in-left delay-1 fixed-height-card">
//                                     <CardHeader className="bg-light p-3 position-relative"
//                                         style={{
//                                             borderTop: '3px solid #405189'
//                                         }}>
//                                         <h5 className="mb-0">Document Information</h5>
//                                     </CardHeader>
//                                     <CardBody className="p-1 custom-scrollbar">
//                                         {selectedFile ? (
//                                             <div className="document-details">
//                                                 <div className="d-flex align-items-center mb-3">
//                                                     <div className="flex-shrink-0 me-1">
//                                                         {getFileIcon(selectedFile.type)}
//                                                     </div>
//                                                     <div>
//                                                         <h6 className="mb-0 x-small">{selectedFile.name}</h6>
//                                                         <small className="text-muted x-small">{selectedFile.category}</small>
//                                                     </div>
//                                                 </div>

//                                                 <div className="row g-0">
//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center">
//                                                             <i className="ri-file-text-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Description:</Label>
//                                                                 <span className="fw-semibold x-small">{selectedFile.description || 'None'}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center">
//                                                             <i className="ri-user-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Uploaded By:</Label>
//                                                                 <span className="fw-semibold x-small">{selectedFile.createdBy}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center">
//                                                             <i className="ri-calendar-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Uploaded On:</Label>
//                                                                 <span className="fw-semibold x-small">{selectedFile.createdAt}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="col-12 mb-3">
//                                                         <div className="d-flex align-items-center">
//                                                             <i className="ri-checkbox-circle-line me-1 text-primary fs-6"></i>
//                                                             <div className="d-flex align-items-center gap-3">
//                                                                 <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
//                                                                 <Badge color="success" className="badge-soft-success x-small">
//                                                                     {selectedFile.status}
//                                                                 </Badge>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
//                                                 <i className="ri-file-line fs-5"></i>
//                                                 <p className="mt-1 x-small mb-0">No document selected</p>
//                                             </div>
//                                         )}
//                                     </CardBody>
//                                 </Card>
//                             </Col>

//                             <Col lg={3} className="h-100 d-flex flex-column">
//                                 <Card className="h-100 fade-in delay-2" style={{ minHeight: '450px' }}>
//                                     <CardHeader className="bg-light d-flex justify-content-between align-items-center"
//                                         style={{
//                                             borderTop: '3px solid #405189'
//                                         }}>
//                                         <h5 className="mb-0">Uploaded Documents</h5>
//                                         <Badge color="primary" pill>
//                                             {documents.length} files
//                                         </Badge>
//                                     </CardHeader>
//                                     <CardBody className="p-0 uploaded-documents-container">
//                                         <div className="uploaded-documents-scrollable">
//                                             {documents.length > 0 ? (
//                                                 <ListGroup flush style={{ minHeight: '100%' }}>
//                                                     {documents.map((doc, index) => (
//                                                         <div
//                                                             key={index}
//                                                             className="fade-in-list-item"
//                                                             style={{ animationDelay: `${0.1 * index}s` }}
//                                                         >
//                                                             <ListGroupItem
//                                                                 action
//                                                                 active={selectedFile?.id === doc.id}
//                                                                 onClick={() => handleFileSelect(doc)}
//                                                                 className="d-flex align-items-center"
//                                                                 style={{
//                                                                     backgroundColor: selectedFile?.id === doc.id ? '#e9ecef' : 'transparent',
//                                                                     borderLeft: selectedFile?.id === doc.id ? '3px solid #9299b1ff' : '3px solid transparent',
//                                                                     cursor: "pointer"
//                                                                 }}
//                                                             >
//                                                                 <div className="flex-shrink-0 me-3">
//                                                                     {getFileIcon(doc.type)}
//                                                                 </div>
//                                                                 <div className="flex-grow-1">
//                                                                     <h6 className="mb-1">{doc.name}</h6>
//                                                                     <small className="text-muted">
//                                                                         {doc.createdAt} • {doc.category}
//                                                                     </small>
//                                                                 </div>
//                                                                 <Button
//                                                                     color="link"
//                                                                     size="sm"
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleDocumentAction(doc.documentId);
//                                                                     }}
//                                                                 >
//                                                                     <i className="ri-download-line"></i>
//                                                                 </Button>
//                                                             </ListGroupItem>
//                                                         </div>
//                                                     ))}
//                                                 </ListGroup>
//                                             ) : (
//                                                 <div className="text-center text-muted py-4 h-100 d-flex flex-column justify-content-center">
//                                                     {hasSearched ? 'No documents found for this account' : 'Search for an account to view documents'}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                             </Col>

//                             {/* Document Preview Panel */}
//                             <Col lg={6} className="h-100 d-flex flex-column">
//                                 <Card className="h-100 slide-in-right delay-3 fixed-height-card">
//                                     <CardHeader className="bg-light p-3 position-relative"
//                                         style={{
//                                             borderTop: '3px solid #405189'
//                                         }}>
//                                         <h5 className="mb-0">Document Preview</h5>
//                                     </CardHeader>
//                                     <CardBody className="p-0 preview-container">
//                                         <div className="preview-scrollable">
//                                             {previewLoading ? (
//                                                 <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
//                                                     <div className="spinner-border text-primary" role="status">
//                                                         <span className="visually-hidden">Loading...</span>
//                                                     </div>
//                                                     <p className="mt-2">Loading preview...</p>
//                                                 </div>
//                                             ) : previewError ? (
//                                                 <Alert color="danger" className="m-3 fade-in">
//                                                     <i className="ri-error-warning-line me-2"></i>
//                                                     {previewError}
//                                                 </Alert>
//                                             ) : previewContent ? (
//                                                 <div className="d-flex flex-column h-100">
//                                                     <div className="flex-grow-1 preview-content">
//                                                         {previewContent.type.match(/pdf/) ? (
//                                                             <div className="pdf-viewer-container fade-in h-100">
//                                                                 <embed
//                                                                     src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
//                                                                     type="application/pdf"
//                                                                     className="w-100 h-100"
//                                                                     style={{ border: 'none' }}
//                                                                 />
//                                                             </div>
//                                                         ) : previewContent.type.match(/jpeg|jpg|png|gif/) ? (
//                                                             <div className="text-center fade-in p-3 h-100 d-flex align-items-center justify-content-center">
//                                                                 <img
//                                                                     src={previewContent.url}
//                                                                     alt="Document Preview"
//                                                                     className="img-fluid"
//                                                                     style={{ maxHeight: '100%', maxWidth: '100%' }}
//                                                                 />
//                                                             </div>
//                                                         ) : (
//                                                             <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
//                                                                 <i className="ri-file-line display-4 text-muted"></i>
//                                                                 <h5 className="mt-3">Preview not available</h5>
//                                                                 <p>This file type ({previewContent.type}) cannot be previewed in the browser.</p>
//                                                                 <Button
//                                                                     color="primary"
//                                                                     onClick={() => handleDocumentAction(selectedFile.documentId)}
//                                                                 >
//                                                                     <i className="ri-download-line me-1"></i> Download File
//                                                                 </Button>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center text-muted py-5 h-100 d-flex flex-column justify-content-center fade-in">
//                                                     <i className="ri-file-line display-4"></i>
//                                                     <h5 className="mt-3">No document selected</h5>
//                                                     <p>Select a file from the list to preview it here</p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                             </Col>
//                         </Row>
//                     )}
//                 </Container>
//             </div>

//             {/* Add some custom CSS */}
//             <style>
//                 {`
//                 .suggestion-list {
//                     border: 1px solid #dee2e6;
//                     margin-top: 5px;
//                     padding: 5px;
//                     list-style: none;
//                     max-height: 200px;
//                     overflow-y: auto;
//                     position: absolute;
//                     z-index: 1000;
//                     background-color: white;
//                     width: 100%;
//                     border-radius: 0.25rem;
//                     box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
//                 }
//                 .suggestion-item {
//                     cursor: pointer;
//                     padding: 8px 12px;
//                     border-bottom: 1px solid #eee;
//                     transition: background-color 0.2s;
//                 }
//                 .suggestion-item:hover {
//                     background-color: #f8f9fa;
//                 }
//                 .consumer-details p {
//                     margin-bottom: 0;
//                     padding: 4px 0;
//                     border-bottom: 1px solid #f0f0f0;
//                 }

//                 /* Main page content styling */
//                 .page-content {
//                     min-height: 100vh;
//                     padding-bottom: 60px; /* Space for footer */
//                 }

//                 /* Results container with proper height */
//                 .results-container {
//                     height: calc(100vh - 320px);
//                     min-height: 500px;
//                     margin-bottom: 40px; /* Distance from footer */
//                 }

//                 /* Fixed height cards */
//                 .fixed-height-card {
//                     height: 100%;
//                     display: flex;
//                     flex-direction: column;
//                 }

//                 .fixed-height-card .card-body {
//                     flex: 1;
//                     overflow-y: auto;
//                 }

//                 /* Enhanced Scrollbar Styling */
//                 .uploaded-documents-scrollable,
//                 .preview-scrollable,
//                 .custom-scrollbar {
//                     scrollbar-width: none; /* Firefox */
//                     -ms-overflow-style: none; /* IE and Edge */
//                 }

//                 .uploaded-documents-scrollable::-webkit-scrollbar,
//                 .preview-scrollable::-webkit-scrollbar,
//                 .custom-scrollbar::-webkit-scrollbar {
//                     display: none; /* Chrome, Safari, Opera */
//                 }

//                 /* Uploaded Documents Container */
//                 .uploaded-documents-container {
//                     height: 100%;
//                     overflow: hidden;
//                     display: flex;
//                     flex-direction: column;
//                 }

//                 .uploaded-documents-scrollable {
//                     flex: 1;
//                     overflow-y: auto;
//                     padding-right: 5px; /* Compensate for scrollbar space */
//                     margin-right: -5px; /* Pull content back */
//                 }

//                 /* Document Preview Container */
//                 .preview-container {
//                     height: 100%;
//                     overflow: hidden;
//                     display: flex;
//                     flex-direction: column;
//                 }

//                 .preview-scrollable {
//                     flex: 1;
//                     overflow-y: auto;
//                     padding-right: 5px;
//                     margin-right: -5px;

//                 }

//                 /* Preview specific styling */
//                 .preview-body {
//                     overflow: hidden !important;
//                     height: calc(100% - 60px);
//                 }

//                 .preview-content {
//                     overflow: hidden;
//                     position: relative;
//                 }

//                 .pdf-viewer-container {
//                     width: 100%;
//                     height: 100%;
//                     overflow: hidden;
//                 }

//                 .pdf-viewer-container embed {
//                     width: 100%;
//                     height: 100%;
//                 }


//                 .document-details {
//                     height: 100%;
//                     display: flex;
//                     flex-direction: column;
//                 }

//                 /* Animation Classes */
//                 .slide-in-left {
//                     animation: slideInLeft 0.5s ease-out forwards;
//                     opacity: 0;
//                     transform: translateX(-20px);
//                 }
                
//                 .slide-in-right {
//                     animation: slideInRight 0.5s ease-out forwards;
//                     opacity: 0;
//                     transform: translateX(20px);
//                 }
                
//                 .fade-in {
//                     animation: fadeIn 0.5s ease-out forwards;
//                     opacity: 0;
//                 }
                
//                 .fade-in-list-item {
//                     animation: fadeIn 0.5s ease-out forwards;
//                     opacity: 0;
//                 }
                
//                 .delay-1 {
//                     animation-delay: 0.2s;
//                 }
                
//                 .delay-2 {
//                     animation-delay: 0.4s;
//                 }
                
//                 .delay-3 {
//                     animation-delay: 0.6s;
//                 }
                
//                 @keyframes slideInLeft {
//                     from {
//                         opacity: 0;
//                         transform: translateX(-20px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateX(0);
//                     }
//                 }
                
//                 @keyframes slideInRight {
//                     from {
//                         opacity: 0;
//                         transform: translateX(20px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateX(0);
//                     }
//                 }
                
//                 @keyframes fadeIn {
//                     from {
//                         opacity: 0;
//                     }
//                     to {
//                         opacity: 1;
//                     }
//                 }

//                 /* Responsive adjustments */
//                 @media (max-width: 991px) {
//                     .results-container {
//                         height: auto;
//                         min-height: auto;
//                     }
                    
//                     .fixed-height-card {
//                         height: 400px;
//                         margin-bottom: 20px;
//                     }
                    
//                     .results-container .col-lg-3:first-child .fixed-height-card:first-child,
//                     .results-container .col-lg-3:first-child .fixed-height-card:last-child {
//                         height: 350px;
//                     }
//                 }
//                 `}
//             </style>
//         </React.Fragment>
//     );
// };

// export default ViewDocuments;








import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Badge, Input, Label, FormGroup, ListGroup, ListGroupItem,
    Alert, Spinner, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { getDocumentDropdowns, viewDocument, view, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
import { ToastContainer } from 'react-toastify';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';

const ViewDocuments = () => {
    // State management
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewError, setPreviewError] = useState(null);
    const [previewModal, setPreviewModal] = useState(false);

    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    // Search related states
    const [zone, setZone] = useState('');
    const [circle, setCircle] = useState('');
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [section, setSection] = useState('');
    const [userName, setUserName] = useState("");
    const [accountSearchInput, setAccountSearchInput] = useState('');
    const [accountSuggestions, setAccountSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [account_id, setaccount_id] = useState('');
    const [consumerInfo, setConsumerInfo] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // Dropdown data
    const [zoneOptions, setZoneOptions] = useState([]);
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [subDivisionOptions, setSubDivisionOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    
    // User access level states
    const [userLevel, setUserLevel] = useState('');
    const [userAccessData, setUserAccessData] = useState([]);

    // Display values for disabled fields
    const [displayZone, setDisplayZone] = useState('');
    const [displayCircle, setDisplayCircle] = useState('');
    const [displayDivision, setDisplayDivision] = useState('');
    const [displaySubDivision, setDisplaySubDivision] = useState('');
    const [displaySection, setDisplaySection] = useState('');

    document.title = `View Documents | DMS`;

    const debounceRef = useRef();

    // API functions for dropdowns
    const fetchZones = async (username) => {
        try {
            const params = {
                flagId: 8,
                requestUserName: username
            };
            const response = await getAllUserDropDownss(params);
            if (response?.status === 'success') {
                setZoneOptions(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const fetchCircles = async (username, zoneCode) => {
        try {
            const params = {
                flagId: 7,
                zone_code: zoneCode,
                requestUserName: username
            };
            const response = await getAllUserDropDownss(params);
            if (response?.status === 'success') {
                setCircleOptions(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching circles:', error);
        }
    };

    const fetchDivisions = async (username, circleCode) => {
        try {
            const params = {
                flagId: 1,
                circle_code: circleCode,
                requestUserName: username
            };
            const response = await getAllUserDropDownss(params);
            if (response?.status === 'success') {
                setDivisionOptions(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching divisions:', error);
        }
    };

    const fetchSubDivisions = async (username, divCode) => {
        try {
            const params = {
                flagId: 2,
                div_code: divCode,
                requestUserName: username
            };
            const response = await getAllUserDropDownss(params);
            if (response?.status === 'success') {
                setSubDivisionOptions(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching subdivisions:', error);
        }
    };

    const fetchSections = async (username, sdCode) => {
        try {
            const params = {
                flagId: 3,
                sd_code: sdCode,
                requestUserName: username
            };
            const response = await getAllUserDropDownss(params);
            if (response?.status === 'success') {
                setSectionOptions(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    // Get user level and access data from session storage
    useEffect(() => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser?.user?.zones && authUser.user.zones.length > 0) {
            const userData = authUser.user.zones[0];
            setUserLevel(userData.level || '');
            setUserAccessData(authUser.user.zones);
            
            // Set initial values based on user level
            if (userData.level === 'zone') {
                setZone(userData.zone_code || '');
                setDisplayZone(userData.zone_name || userData.zone_code);
            } else if (userData.level === 'circle') {
                setCircle(userData.circle_code || '');
                setDisplayCircle(userData.circle || userData.circle_code);
                setDisplayZone(userData.zone_name || userData.zone_code);
            } else if (userData.level === 'division') {
                setDivision(userData.div_code || '');
                setDisplayDivision(userData.division || userData.div_code);
                setDisplayCircle(userData.circle || userData.circle_code);
                setDisplayZone(userData.zone_name || userData.zone_code);
            } else if (userData.level === 'subdivision') {
                setSubDivision(userData.sd_code || '');
                setDisplaySubDivision(userData.sub_division || userData.sd_code);
                setDisplayDivision(userData.division || userData.div_code);
                setDisplayCircle(userData.circle || userData.circle_code);
                setDisplayZone(userData.zone_name || userData.zone_code);
            } else if (userData.level === 'section') {
                setSection(userData.so_code || '');
                setDisplaySection(userData.section_office || userData.so_code);
                setDisplaySubDivision(userData.sub_division || userData.sd_code);
                setDisplayDivision(userData.division || userData.div_code);
                setDisplayCircle(userData.circle || userData.circle_code);
                setDisplayZone(userData.zone_name || userData.zone_code);
            }
        }
    }, []);

    // Fetch initial data based on user level
    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.Email;
        setUserName(usernm);
        
        // Fetch zones for zone level users
        if (userLevel === 'zone') {
            fetchZones(usernm);
        }
        
        // Fetch data based on user level
        if (userLevel === 'zone' && userAccessData[0]?.zone_code) {
            // Zone level - fetch circles using zone_code
            fetchCircles(usernm, userAccessData[0].zone_code);
        } else if (userLevel === 'circle' && userAccessData[0]?.circle_code) {
            // Circle level - fetch divisions using circle_code
            setCircle(userAccessData[0].circle_code);
            fetchDivisions(usernm, userAccessData[0].circle_code);
        } else if (userLevel === 'division' && userAccessData[0]?.div_code) {
            // Division level - fetch subdivisions using div_code
            setDivision(userAccessData[0].div_code);
            fetchSubDivisions(usernm, userAccessData[0].div_code);
        } else if (userLevel === 'subdivision' && userAccessData[0]?.sd_code) {
            // Subdivision level - fetch sections using sd_code
            setSubDivision(userAccessData[0].sd_code);
            fetchSections(usernm, userAccessData[0].sd_code);
        } else if (userLevel === 'section' && userAccessData[0]?.so_code) {
            // Section level - set section
            setSection(userAccessData[0].so_code);
        }
    }, [userLevel, userAccessData]);

    // Handle zone change
    const handleZoneChange = async (e) => {
        const selectedZone = e.target.value;
        const selectedZoneObj = zoneOptions.find(z => z.zone_code === selectedZone);
        setZone(selectedZone);
        setDisplayZone(selectedZoneObj ? selectedZoneObj.zone : selectedZone);
        setCircle('');
        setDisplayCircle('');
        setDivision('');
        setDisplayDivision('');
        setSubDivision('');
        setDisplaySubDivision('');
        setSection('');
        setDisplaySection('');
        setCircleOptions([]);
        setDivisionOptions([]);
        setSubDivisionOptions([]);
        setSectionOptions([]);

        if (selectedZone) {
            await fetchCircles(userName, selectedZone);
        }
    };

    // Handle circle change
    const handleCircleChange = async (e) => {
        const selectedCircle = e.target.value;
        const selectedCircleObj = circleOptions.find(c => c.circle_code === selectedCircle);
        setCircle(selectedCircle);
        setDisplayCircle(selectedCircleObj ? selectedCircleObj.circle : selectedCircle);
        setDivision('');
        setDisplayDivision('');
        setSubDivision('');
        setDisplaySubDivision('');
        setSection('');
        setDisplaySection('');
        setDivisionOptions([]);
        setSubDivisionOptions([]);
        setSectionOptions([]);

        if (selectedCircle) {
            await fetchDivisions(userName, selectedCircle);
        }
    };

    // Handle division change
    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        const selectedDivisionObj = divisionOptions.find(d => d.div_code === selectedDivCode);
        setDivision(selectedDivCode);
        setDisplayDivision(selectedDivisionObj ? selectedDivisionObj.division : selectedDivCode);
        setSubDivision('');
        setDisplaySubDivision('');
        setSection('');
        setDisplaySection('');
        setSubDivisionOptions([]);
        setSectionOptions([]);

        if (selectedDivCode) {
            await fetchSubDivisions(userName, selectedDivCode);
        }
    };

    // Handle sub division change
    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        const selectedSubDivisionObj = subDivisionOptions.find(sd => sd.sd_code === selectedSdCode);
        setSubDivision(selectedSdCode);
        setDisplaySubDivision(selectedSubDivisionObj ? selectedSubDivisionObj.sub_division : selectedSdCode);
        setSection('');
        setDisplaySection('');
        setSectionOptions([]);

        if (selectedSdCode) {
            await fetchSections(userName, selectedSdCode);
        }
    };

    // Handle section change
    const handleSectionChange = (e) => {
        const selectedSection = e.target.value;
        const selectedSectionObj = sectionOptions.find(s => s.so_code === selectedSection);
        setSection(selectedSection);
        setDisplaySection(selectedSectionObj ? selectedSectionObj.section_office : selectedSection);
        
        // Reset account search fields when section changes
        setAccountSearchInput('');
        setaccount_id('');
        setHasSearched(false);
        setDocuments([]);
        setConsumerInfo(null);
        setShowResults(false);
    };

    // Helper function to check if field should be disabled based on user level
    const isFieldDisabled = (fieldLevel) => {
        const levelHierarchy = ['zone', 'circle', 'division', 'subdivision', 'section'];
        const userLevelIndex = levelHierarchy.indexOf(userLevel);
        const fieldLevelIndex = levelHierarchy.indexOf(fieldLevel);
        
        return userLevelIndex >= fieldLevelIndex;
    };

    const handleAccountSearchChange = (e) => {
        const value = e.target.value;
        setAccountSearchInput(value);
        setAccountSuggestions([]);
        setaccount_id('');
        setLoading(false);
        setShowSuggestions(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.length >= 5) {
            debounceRef.current = setTimeout(async () => {
                try {
                    // Get the section name for the API call
                    const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
                    const sectionName = selectedSectionObj ? selectedSectionObj.section_office : displaySection;

                    if (!sectionName) {
                        setAccountSuggestions([]);
                        return;
                    }

                    const params = {
                        flagId: 4,
                        section: sectionName,
                        account_id: value
                    };

                    setLoading(true);
                    setShowSuggestions(true);
                    const response = await getDocumentDropdowns(params);
                    const options = response?.data || [];

                    setAccountSuggestions(options);
                } catch (error) {
                    console.error('Error fetching Account Suggestions:', error.message);
                    setAccountSuggestions([]);
                } finally {
                    setLoading(false);
                }
            }, 300);
        }
    };

    const handleAccountSuggestionClick = (accId) => {
        setaccount_id(accId);
        setAccountSearchInput(accId);
        setAccountSuggestions([]);
        setShowSuggestions(false);
        setHasSearched(false);
    };

    const handleSearch = async () => {
        try {
            if (!account_id) {
                setResponse('Please enter an account ID');
                setErrorModal(true);
                return;
            }

            // Get the section name for the API call
            const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
            const sectionName = selectedSectionObj ? selectedSectionObj.section_office : displaySection;

            if (!sectionName) {
                setResponse('Please select a section first');
                setErrorModal(true);
                return;
            }

            setLoading(true);
            setShowResults(false);
            setDocuments([]);
            setConsumerInfo(null); // Reset consumer info when searching
            setSelectedFile(null);
            setPreviewContent(null);
            setPreviewError(null);

            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const requestUserName = obj.user.Email;
            const roleId = obj.user.Role_Id;

            const params = {
                flagId: 1,
                accountId: account_id,
                roleId,
                requestUserName: requestUserName
            };
            const response = await viewDocument(params);

            if (response?.status === "success") {
                // Set consumer info from the first document if available
                if (response.data && response.data.length > 0) {
                    const firstDoc = response.data[0];
                    setConsumerInfo({
                        accountId: firstDoc.Account_Id,
                        name: firstDoc.consumer_name,
                        address: firstDoc.consumer_address,
                        phone: firstDoc.phone,
                        rrNo: firstDoc.rr_no
                    });
                }

                // Show consumer info immediately
                setShowResults(true);

                // Then show documents after a short delay
                setTimeout(() => {
                    const transformedDocuments = response.data.map(doc => ({
                        id: doc.DocumentId,
                        name: doc.DocumentName,
                        description: doc.DocumentDescription,
                        createdBy: doc.CreatedByUserName,
                        createdAt: formatDate(doc.CreatedAt),
                        category: doc.CategoryName,
                        status: doc.StatusName,
                        url: doc.FilePath,
                        type: doc.FilePath.split('.').pop().toLowerCase(),
                        documentId: doc.DocumentId,
                        updatedOn: formatDate(doc.UpdatedOn)
                    }));

                    setDocuments(transformedDocuments);
                    setHasSearched(true);
                    setResponse(response.message || 'Documents found successfully');
                    setSuccessModal(true);
                }, 1000);
            } else {
                setConsumerInfo(null);
                setShowResults(true);
                setDocuments([]);
                setResponse(response?.message || 'No documents found for this account');
                setErrorModal(true);
            }
        } catch (error) {
            console.error('Error on submit:', error.message);
            setResponse('Error fetching documents');
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        // Reset to user's default values based on their level
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser?.user?.zones && authUser.user.zones.length > 0) {
            const userData = authUser.user.zones[0];
            
            if (userLevel === 'zone') {
                setZone(userData.zone_code || '');
                setDisplayZone(userData.zone_name || userData.zone_code);
                setCircle('');
                setDisplayCircle('');
                setDivision('');
                setDisplayDivision('');
                setSubDivision('');
                setDisplaySubDivision('');
                setSection('');
                setDisplaySection('');
                // Re-fetch circles for zone level
                fetchCircles(userName, userData.zone_code);
            } else if (userLevel === 'circle') {
                setCircle(userData.circle_code || '');
                setDisplayCircle(userData.circle || userData.circle_code);
                setDivision('');
                setDisplayDivision('');
                setSubDivision('');
                setDisplaySubDivision('');
                setSection('');
                setDisplaySection('');
                // Re-fetch divisions for circle level
                fetchDivisions(userName, userData.circle_code);
            } else if (userLevel === 'division') {
                setDivision(userData.div_code || '');
                setDisplayDivision(userData.division || userData.div_code);
                setSubDivision('');
                setDisplaySubDivision('');
                setSection('');
                setDisplaySection('');
                // Re-fetch subdivisions for division level
                fetchSubDivisions(userName, userData.div_code);
            } else if (userLevel === 'subdivision') {
                setSubDivision(userData.sd_code || '');
                setDisplaySubDivision(userData.sub_division || userData.sd_code);
                setSection('');
                setDisplaySection('');
                // Re-fetch sections for subdivision level
                fetchSections(userName, userData.sd_code);
            } else if (userLevel === 'section') {
                setSection(userData.so_code || '');
                setDisplaySection(userData.section_office || userData.so_code);
            }
        }
        
        setAccountSearchInput('');
        setaccount_id('');
        setHasSearched(false);
        setDocuments([]);
        setConsumerInfo(null);
        setShowResults(false);
    };

    const getFileIcon = (type) => {
        const icons = {
            pdf: 'ri-file-pdf-fill text-danger',
            jpg: 'ri-image-fill text-info',
            jpeg: 'ri-image-fill text-info',
            png: 'ri-image-fill text-info',
            gif: 'ri-image-fill text-info',
            doc: 'ri-file-word-fill text-primary',
            docx: 'ri-file-word-fill text-primary',
            xls: 'ri-file-excel-fill text-success',
            xlsx: 'ri-file-excel-fill text-success',
            default: 'ri-file-fill text-secondary'
        };
        return <i className={`${icons[type] || icons.default} me-2`}></i>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // FIXED handleFileSelect function with proper blob handling
    const handleFileSelect = async (file) => {
        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);
        setPreviewModal(true);

        try {
            console.log('📄 Starting document preview for DocumentId:', file.documentId);
            
            const requestPayload = {
                flagId: 2,
                DocumentId: file.documentId,
                requestUserName: userName,
                preview: false
            };
            
            console.log('🚀 API Request Payload:', requestPayload);

            // Use the view function from fakebackend_helper
            const response = await view(requestPayload);

            console.log('✅ API Response received:', response);

            let blobData = null;

            // Handle different response formats
            if (response && response instanceof Blob) {
                blobData = response;
                console.log('✅ Blob data received from response');
            } else if (response instanceof Blob) {
                blobData = response;
                console.log('✅ Blob data received directly');
            } else if (response && response) {
                // If data exists but isn't a blob, try to create blob from it
                console.log('⚠️ Response data is not a Blob, attempting to create blob');
                blobData = new Blob([response], { type: 'application/pdf' });
            } else {
                console.error('❌ Unexpected response format:', response);
                throw new Error("Invalid preview response format - expected Blob data");
            }

            if (blobData) {
                const fileUrl = URL.createObjectURL(blobData);
                const fileType = blobData.type || 'application/pdf';
                
                console.log('📁 File type:', fileType);
                console.log('🔗 Object URL created');

                setPreviewContent({
                    url: fileUrl,
                    type: fileType,
                    name: file.name,
                    blob: blobData
                });
            }
        } catch (error) {
            console.error("❌ Preview error:", error);
            setPreviewError(error.message || "Failed to load preview");
            setResponse(error.message || "Failed to load document");
            setErrorModal(true);
        } finally {
            setPreviewLoading(false);
        }
    };

    const closePreview = () => {
        if (previewContent?.url) {
            URL.revokeObjectURL(previewContent.url);
        }
        setPreviewModal(false);
        setPreviewContent(null);
        setPreviewError(null);
    };

    const handleDownload = () => {
        if (!previewContent?.blob) return;

        const blob = previewContent.blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = previewContent.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDocumentAction = async (documentId) => {
        try {
            const response = await view(
                {
                    flagId: 2,
                    DocumentId: documentId,
                },
                {
                    responseType: "blob",
                    headers: { "Content-Type": "application/json" },
                    transformResponse: [(data, headers) => ({ data, headers })],
                }
            );

            const contentDisposition = response.headers?.["content-disposition"];
            let fileName = `document_${documentId}.pdf`;

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    fileName = decodeURIComponent(match[1]);
                }
            } else {
                console.warn("Content-Disposition header missing — using fallback filename.");
            }

            const blob = response;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download file");
        }
    };

    // Enhanced LazyPreviewContent component with proper document preview
    const LazyPreviewContent = ({ file }) => {
        const [previewLoaded, setPreviewLoaded] = useState(false);
        const [detailsLoaded, setDetailsLoaded] = useState(false);

        useEffect(() => {
            const previewTimer = setTimeout(() => {
                setPreviewLoaded(true);
            }, 1200);

            return () => clearTimeout(previewTimer);
        }, []);
        
        useEffect(() => {
            if (previewLoaded) {
                const detailsTimer = setTimeout(() => {
                    setDetailsLoaded(true);
                }, 1000);

                return () => clearTimeout(detailsTimer);
            }
        }, [previewLoaded]);
        
        // Enhanced PDF/Image viewer
        const renderPreviewContent = () => {
            if (!previewLoaded) {
                return (
                    <div className="text-center h-100 d-flex flex-column justify-content-center align-items-center"
                        style={{ minHeight: '400px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading preview...</p>
                    </div>
                );
            }

            if (previewLoading) {
                return (
                    <div className="text-center h-100 d-flex flex-column justify-content-center align-items-center"
                        style={{ minHeight: '400px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading document content...</p>
                    </div>
                );
            }

            if (previewError) {
                return (
                    <Alert color="danger" className="m-3 fade-in">
                        <i className="ri-error-warning-line me-2"></i>
                        {previewError}
                    </Alert>
                );
            }

            if (previewContent) {
                const isPDF = previewContent.type.includes('pdf');
                const isImage = previewContent.type.includes('image');
                
                return (
                    <div className="d-flex flex-column h-100">
                        {/* Preview Header */}
                        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                            <h6 className="mb-0">
                                <i className="ri-file-text-line me-2"></i>
                                {previewContent.name}
                            </h6>
                            <Button
                                color="primary"
                                size="sm"
                                onClick={handleDownload}
                            >
                                <i className="ri-download-line me-1"></i> Download
                            </Button>
                        </div>
                        
                        {/* Preview Content */}
                        <div className="flex-grow-1 preview-content">
                            {isPDF ? (
                                <div className="pdf-viewer-container fade-in h-100">
                                    <iframe
                                        src={`${previewContent.url}#toolbar=1&navpanes=1&scrollbar=1`}
                                        title="PDF Viewer"
                                        className="w-100 h-100"
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            ) : isImage ? (
                                <div className="text-center fade-in p-3 h-100 d-flex align-items-center justify-content-center">
                                    <img
                                        src={previewContent.url}
                                        alt="Document Preview"
                                        className="img-fluid"
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
                                    <i className="ri-file-line display-4 text-muted"></i>
                                    <h5 className="mt-3">Preview not available</h5>
                                    <p className="text-muted">
                                        This file type ({previewContent.type}) cannot be previewed in the browser.
                                    </p>
                                    <Button
                                        color="primary"
                                        onClick={handleDownload}
                                        className="mt-2"
                                    >
                                        <i className="ri-download-line me-1"></i> Download File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            return (
                <div className="text-center text-muted py-5 h-100 d-flex flex-column justify-content-center fade-in">
                    <i className="ri-file-line display-4"></i>
                    <h5 className="mt-3">No document selected</h5>
                    <p>Select a file from the list to preview it here</p>
                </div>
            );
        };
        
        return (
            <Row>
                <Col lg={6} className="h-100 d-flex flex-column">
                    <Card className="h-100 slide-in-left delay-3 fixed-height-card">
                        <CardHeader className="bg-light p-3 position-relative"
                            style={{
                                borderTop: '3px solid #405189'
                            }}>
                            <h5 className="mb-0">Document Preview</h5>
                        </CardHeader>
                        <CardBody className="p-0 preview-container">
                            <div className="preview-scrollable">
                                {renderPreviewContent()}
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col lg={6}>
                    {!detailsLoaded ? (
                        <Card className="h-100 shadow-sm">
                            <CardHeader className="bg-light p-3 position-relative card-header border-top-primary">
                                <h6 className="mb-0 d-flex align-items-center">
                                    <i className="ri-information-line me-2"></i> Document Details
                                </h6>
                            </CardHeader>
                            <CardBody className="py-5 d-flex justify-content-center">
                                <Spinner color="primary" />
                            </CardBody>
                        </Card>
                    ) : (
                        <Card className="h-100 shadow-sm">
                            <CardHeader className="bg-light p-3 position-relative card-header border-top-primary">
                                <h6 className="mb-0 d-flex align-items-center">
                                    <i className="ri-information-line me-2"></i> Document Details
                                </h6>
                            </CardHeader>

                            <CardBody className="py-3 px-4">
                                <Row>
                                    {/* Left Column */}
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Document Name:</Label>
                                            <p className="mb-1 text-break">{file.name}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Category:</Label>
                                            <p className="mb-1">{file.category || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Description:</Label>
                                            <p className="mb-1 text-break">{file.description || 'N/A'}</p>
                                        </div>
                                    </Col>

                                    {/* Right Column */}
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Uploaded By:</Label>
                                            <p className="mb-1">{file.createdBy || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Upload Date:</Label>
                                            <p className="mb-1">{file.createdAt}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Status:</Label>
                                            <p className="mb-1">
                                                <Badge color="success" className="badge-soft-success">
                                                    {file.status}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">File Type:</Label>
                                            <p className="mb-1 text-capitalize">{file.type || 'N/A'}</p>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    )}
                </Col>
            </Row>
        );
    };

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <BreadCrumb title="Document Search" pageTitle="DMS" />
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

                    {/* Search Filters */}
                    <Card className="mb-3">
                        <CardHeader className="bg-primary text-white p-3">
                            <h4 className="mb-0 card-title text-white">Search Documents</h4>
                        </CardHeader>
                        <CardBody>
                            <Row className="g-3 mb-3">
                                {/* Zone Dropdown - Only for Zone level users */}
                                {userLevel === 'zone' && (
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label>Zone<span className="text-danger">*</span></Label>
                                            <Input
                                                type="select"
                                                value={zone}
                                                onChange={handleZoneChange}
                                            >
                                                <option value="">Select Zone</option>
                                                {zoneOptions.map(zone => (
                                                    <option key={zone.zone_code} value={zone.zone_code}>{zone.zone}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                )}

                                {/* Display Zone value for non-zone users */}
                                {userLevel !== 'zone' && displayZone && (
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label>Zone</Label>
                                            <Input
                                                type="text"
                                                value={displayZone}
                                                disabled
                                                className="bg-light"
                                            />
                                        </FormGroup>
                                    </Col>
                                )}

                                {/* Circle Dropdown - Only for Zone level users */}
                                {userLevel === 'zone' && (
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label>Circle<span className="text-danger">*</span></Label>
                                            <Input
                                                type="select"
                                                value={circle}
                                                onChange={handleCircleChange}
                                                disabled={!zone}
                                            >
                                                <option value="">Select Circle</option>
                                                {circleOptions.map(circle => (
                                                    <option key={circle.circle_code} value={circle.circle_code}>{circle.circle}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                )}

                                {/* Display Circle value for non-zone users */}
                                {userLevel !== 'zone' && displayCircle && (
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label>Circle</Label>
                                            <Input
                                                type="text"
                                                value={displayCircle}
                                                disabled
                                                className="bg-light"
                                            />
                                        </FormGroup>
                                    </Col>
                                )}

                                {/* Division Dropdown */}
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Division<span className="text-danger">*</span></Label>
                                        {isFieldDisabled('division') && displayDivision ? (
                                            <Input
                                                type="text"
                                                value={displayDivision}
                                                disabled
                                                className="bg-light"
                                            />
                                        ) : (
                                            <Input
                                                type="select"
                                                value={division}
                                                onChange={handleDivisionChange}
                                                disabled={isFieldDisabled('division') || (userLevel === 'zone' && !circle)}
                                            >
                                                <option value="">Select Division</option>
                                                {divisionOptions.map(div => (
                                                    <option key={div.div_code} value={div.div_code}>{div.division}</option>
                                                ))}
                                            </Input>
                                        )}
                                    </FormGroup>
                                </Col>

                                {/* Sub Division Dropdown */}
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Sub Division<span className="text-danger">*</span></Label>
                                        {isFieldDisabled('subdivision') && displaySubDivision ? (
                                            <Input
                                                type="text"
                                                value={displaySubDivision}
                                                disabled
                                                className="bg-light"
                                            />
                                        ) : (
                                            <Input
                                                type="select"
                                                value={subDivision}
                                                onChange={handleSubDivisionChange}
                                                disabled={isFieldDisabled('subdivision') || !division}
                                            >
                                                <option value="">Select Sub Division</option>
                                                {subDivisionOptions.map(subDiv => (
                                                    <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                        {subDiv.sub_division}
                                                    </option>
                                                ))}
                                            </Input>
                                        )}
                                    </FormGroup>
                                </Col>

                                {/* Section Dropdown */}
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Section<span className="text-danger">*</span></Label>
                                        {isFieldDisabled('section') && displaySection ? (
                                            <Input
                                                type="text"
                                                value={displaySection}
                                                disabled
                                                className="bg-light"
                                            />
                                        ) : (
                                            <Input
                                                type="select"
                                                value={section}
                                                onChange={handleSectionChange}
                                                disabled={isFieldDisabled('section') || !subDivision}
                                            >
                                                <option value="">Select Section</option>
                                                {sectionOptions.map(sec => (
                                                    <option key={sec.so_code} value={sec.so_code}>
                                                        {sec.section_office}
                                                    </option>
                                                ))}
                                            </Input>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row className="g-3 mb-4">
                                <Col md={8}>
                                    <FormGroup className="mb-0">
                                        <Label>
                                            Enter Account ID (min 5 chars)
                                            <span className="text-danger">*</span>
                                        </Label>
                                        <div className="d-flex align-items-center">
                                            <div className="position-relative me-3" style={{ width: "350px" }}>
                                                <Input
                                                    type="text"
                                                    value={accountSearchInput}
                                                    onChange={handleAccountSearchChange}
                                                    placeholder="Enter Account ID"
                                                    disabled={!section}
                                                    className="form-control"
                                                />
                                                {showSuggestions && (
                                                    <ListGroup
                                                        className="position-absolute w-100"
                                                        style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                                                    >
                                                        {loading ? (
                                                            <ListGroupItem>Loading...</ListGroupItem>
                                                        ) : accountSuggestions.length > 0 ? (
                                                            accountSuggestions.map((acc) => (
                                                                <ListGroupItem
                                                                    key={acc.account_id}
                                                                    action
                                                                    onClick={() => handleAccountSuggestionClick(acc.account_id)}
                                                                >
                                                                    {acc.account_id}
                                                                </ListGroupItem>
                                                            ))
                                                        ) : (
                                                            <ListGroupItem>No data found</ListGroupItem>
                                                        )}
                                                    </ListGroup>
                                                )}
                                            </div>

                                            <Button
                                                color="primary"
                                                className="rounded px-4"
                                                style={{ minWidth: "120px" }}
                                                onClick={handleSearch}
                                                disabled={!account_id || loading || !displaySection}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner size="sm" className="me-1" /> Searching...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ri-search-line me-1"></i> Search
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                color="light"
                                                className="rounded px-4 ms-2"
                                                style={{ minWidth: "120px" }}
                                                onClick={handleResetFilters}
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* Results Section - Only show when showResults is true */}
                    {showResults && (
                        <Row className="g-3 results-container">
                            {/* Left Column (Consumer and Document Info) */}
                            <Col lg={3} className="h-100 d-flex flex-column">
                                {/* Consumer Information Card */}
                                <Card className="mb-3 slide-in-left fixed-height-card">
                                    <CardHeader className="bg-light p-3 position-relative"
                                        style={{
                                            borderTop: '3px solid #405189'
                                        }}>
                                        <h5 className="mb-0">Consumer Information</h5>
                                    </CardHeader>
                                    <CardBody className="p-1 custom-scrollbar">
                                        {consumerInfo ? (
                                            <div className="consumer-details">
                                                <div className="row g-0">
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ri-user-3-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Account ID:</Label>
                                                                <span className="fw-semibold x-small">{consumerInfo.accountId}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ri-profile-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
                                                                <span className="fw-semibold x-small">{consumerInfo.name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Address:</Label>
                                                                <span className="fw-semibold x-small">{consumerInfo.address}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="ri-phone-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Phone:</Label>
                                                                <span className="fw-semibold x-small">{consumerInfo.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <i className="ri-file-copy-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">RR No:</Label>
                                                                <span className="fw-semibold x-small">{consumerInfo.rrNo}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
                                                <i className="ri-user-line fs-5"></i>
                                                <p className="mt-1 x-small mb-0">No consumer information</p>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>

                                {/* Document Information Card */}
                                <Card className="slide-in-left delay-1 fixed-height-card">
                                    <CardHeader className="bg-light p-3 position-relative"
                                        style={{
                                            borderTop: '3px solid #405189'
                                        }}>
                                        <h5 className="mb-0">Document Information</h5>
                                    </CardHeader>
                                    <CardBody className="p-1 custom-scrollbar">
                                        {selectedFile ? (
                                            <div className="document-details">
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="flex-shrink-0 me-1">
                                                        {getFileIcon(selectedFile.type)}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 x-small">{selectedFile.name}</h6>
                                                        <small className="text-muted x-small">{selectedFile.category}</small>
                                                    </div>
                                                </div>

                                                <div className="row g-0">
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <i className="ri-file-text-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Description:</Label>
                                                                <span className="fw-semibold x-small">{selectedFile.description || 'None'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <i className="ri-user-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Uploaded By:</Label>
                                                                <span className="fw-semibold x-small">{selectedFile.createdBy}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <i className="ri-calendar-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Uploaded On:</Label>
                                                                <span className="fw-semibold x-small">{selectedFile.createdAt}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <i className="ri-checkbox-circle-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
                                                                <Badge color="success" className="badge-soft-success x-small">
                                                                    {selectedFile.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
                                                <i className="ri-file-line fs-5"></i>
                                                <p className="mt-1 x-small mb-0">No document selected</p>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col lg={3} className="h-100 d-flex flex-column">
                                <Card className="h-100 fade-in delay-2" style={{ minHeight: '450px' }}>
                                    <CardHeader className="bg-light d-flex justify-content-between align-items-center"
                                        style={{
                                            borderTop: '3px solid #405189'
                                        }}>
                                        <h5 className="mb-0">Uploaded Documents</h5>
                                        <Badge color="primary" pill>
                                            {documents.length} files
                                        </Badge>
                                    </CardHeader>
                                    <CardBody className="p-0 uploaded-documents-container">
                                        <div className="uploaded-documents-scrollable">
                                            {documents.length > 0 ? (
                                                <ListGroup flush style={{ minHeight: '100%' }}>
                                                    {documents.map((doc, index) => (
                                                        <div
                                                            key={index}
                                                            className="fade-in-list-item"
                                                            style={{ animationDelay: `${0.1 * index}s` }}
                                                        >
                                                            <ListGroupItem
                                                                action
                                                                active={selectedFile?.id === doc.id}
                                                                onClick={() => handleFileSelect(doc)}
                                                                className="d-flex align-items-center"
                                                                style={{
                                                                    backgroundColor: selectedFile?.id === doc.id ? '#e9ecef' : 'transparent',
                                                                    borderLeft: selectedFile?.id === doc.id ? '3px solid #9299b1ff' : '3px solid transparent',
                                                                    cursor: "pointer"
                                                                }}
                                                            >
                                                                <div className="flex-shrink-0 me-3">
                                                                    {getFileIcon(doc.type)}
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1">{doc.name}</h6>
                                                                    <small className="text-muted">
                                                                        {doc.createdAt} • {doc.category}
                                                                    </small>
                                                                </div>
                                                                <Button
                                                                    color="link"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDocumentAction(doc.documentId);
                                                                    }}
                                                                >
                                                                    <i className="ri-download-line"></i>
                                                                </Button>
                                                            </ListGroupItem>
                                                        </div>
                                                    ))}
                                                </ListGroup>
                                            ) : (
                                                <div className="text-center text-muted py-4 h-100 d-flex flex-column justify-content-center">
                                                    {hasSearched ? 'No documents found for this account' : 'Search for an account to view documents'}
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Document Preview Panel */}
                            <Col lg={6} className="h-100 d-flex flex-column">
                                <Card className="h-100 slide-in-right delay-3 fixed-height-card">
                                    <CardHeader className="bg-light p-3 position-relative"
                                        style={{
                                            borderTop: '3px solid #405189'
                                        }}>
                                        <h5 className="mb-0">Document Preview</h5>
                                    </CardHeader>
                                    <CardBody className="p-0 preview-container">
                                        <div className="preview-scrollable">
                                            {previewLoading ? (
                                                <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p className="mt-2">Loading preview...</p>
                                                </div>
                                            ) : previewError ? (
                                                <Alert color="danger" className="m-3 fade-in">
                                                    <i className="ri-error-warning-line me-2"></i>
                                                    {previewError}
                                                </Alert>
                                            ) : previewContent ? (
                                                <div className="d-flex flex-column h-100">
                                                    <div className="flex-grow-1 preview-content">
                                                        {previewContent.type.match(/pdf/) ? (
                                                            <div className="pdf-viewer-container fade-in h-100">
                                                                <iframe
                                                                    src={`${previewContent.url}#toolbar=1&navpanes=1&scrollbar=1`}
                                                                    title="PDF Viewer"
                                                                    className="w-100 h-100"
                                                                    style={{ border: 'none' }}
                                                                />
                                                            </div>
                                                        ) : previewContent.type.match(/jpeg|jpg|png|gif/) ? (
                                                            <div className="text-center fade-in p-3 h-100 d-flex align-items-center justify-content-center">
                                                                <img
                                                                    src={previewContent.url}
                                                                    alt="Document Preview"
                                                                    className="img-fluid"
                                                                    style={{ 
                                                                        maxHeight: '100%', 
                                                                        maxWidth: '100%',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
                                                                <i className="ri-file-line display-4 text-muted"></i>
                                                                <h5 className="mt-3">Preview not available</h5>
                                                                <p className="text-muted">
                                                                    This file type ({previewContent.type}) cannot be previewed in the browser.
                                                                </p>
                                                                <Button
                                                                    color="primary"
                                                                    onClick={handleDownload}
                                                                    className="mt-2"
                                                                >
                                                                    <i className="ri-download-line me-1"></i> Download File
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted py-5 h-100 d-flex flex-column justify-content-center fade-in">
                                                    <i className="ri-file-line display-4"></i>
                                                    <h5 className="mt-3">No document selected</h5>
                                                    <p>Select a file from the list to preview it here</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>

            {/* Document Preview Modal */}
            <Modal
                isOpen={previewModal}
                toggle={closePreview}
                size="xl"
                centered
                className="document-preview-modal"
                style={{ maxWidth: '95%' }}
            >
                <ModalHeader className="bg-primary text-white p-3" toggle={closePreview}>
                    <span className="modal-title text-white">
                        <i className="ri-file-text-line me-2"></i>
                        {selectedFile?.name || 'Document Preview'}
                    </span>
                </ModalHeader>
                <ModalBody style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {selectedFile && <LazyPreviewContent file={selectedFile} />}
                </ModalBody>
                <ModalFooter style={{ borderTop: 'none' }}>
                    <Button color="secondary" onClick={closePreview}>
                        <i className="ri-close-line me-1"></i>
                        Close
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleDownload}
                        disabled={!previewContent}
                    >
                        <i className="ri-download-line me-1"></i>
                        Download
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Add some custom CSS */}
            <style>
                {`
                .suggestion-list {
                    border: 1px solid #dee2e6;
                    margin-top: 5px;
                    padding: 5px;
                    list-style: none;
                    max-height: 200px;
                    overflow-y: auto;
                    position: absolute;
                    z-index: 1000;
                    background-color: white;
                    width: 100%;
                    border-radius: 0.25rem;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }
                .suggestion-item {
                    cursor: pointer;
                    padding: 8px 12px;
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                }
                .suggestion-item:hover {
                    background-color: #f8f9fa;
                }
                .consumer-details p {
                    margin-bottom: 0;
                    padding: 4px 0;
                    border-bottom: 1px solid #f0f0f0;
                }

                /* Main page content styling */
                .page-content {
                    min-height: 100vh;
                    padding-bottom: 60px; /* Space for footer */
                }

                /* Results container with proper height */
                .results-container {
                    height: calc(100vh - 320px);
                    min-height: 500px;
                    margin-bottom: 40px; /* Distance from footer */
                }

                /* Fixed height cards */
                .fixed-height-card {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .fixed-height-card .card-body {
                    flex: 1;
                    overflow-y: auto;
                }

                /* Enhanced Scrollbar Styling */
                .uploaded-documents-scrollable,
                .preview-scrollable,
                .custom-scrollbar {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE and Edge */
                }

                .uploaded-documents-scrollable::-webkit-scrollbar,
                .preview-scrollable::-webkit-scrollbar,
                .custom-scrollbar::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }

                /* Uploaded Documents Container */
                .uploaded-documents-container {
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .uploaded-documents-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 5px; /* Compensate for scrollbar space */
                    margin-right: -5px; /* Pull content back */
                }

                /* Document Preview Container */
                .preview-container {
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .preview-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 5px;
                    margin-right: -5px;

                }

                /* Preview specific styling */
                .preview-body {
                    overflow: hidden !important;
                    height: calc(100% - 60px);
                }

                .preview-content {
                    overflow: hidden;
                    position: relative;
                }

                .pdf-viewer-container {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }

                .pdf-viewer-container iframe {
                    width: 100%;
                    height: 100%;
                    min-height: 500px;
                    border: none;
                    background: #f8f9fa;
                }

                .document-details {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                /* Animation Classes */
                .slide-in-left {
                    animation: slideInLeft 0.5s ease-out forwards;
                    opacity: 0;
                    transform: translateX(-20px);
                }
                
                .slide-in-right {
                    animation: slideInRight 0.5s ease-out forwards;
                    opacity: 0;
                    transform: translateX(20px);
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                .fade-in-list-item {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                .delay-1 {
                    animation-delay: 0.2s;
                }
                
                .delay-2 {
                    animation-delay: 0.4s;
                }
                
                .delay-3 {
                    animation-delay: 0.6s;
                }
                
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .border-top-primary { border-top: 3px solid #405189 !important; }
                .preview-content { background: #f8f9fa; border-radius: 8px; }
                .spinner-border { width: 3rem; height: 3rem; }

                /* Responsive adjustments */
                @media (max-width: 991px) {
                    .results-container {
                        height: auto;
                        min-height: auto;
                    }
                    
                    .fixed-height-card {
                        height: 400px;
                        margin-bottom: 20px;
                    }
                    
                    .results-container .col-lg-3:first-child .fixed-height-card:first-child,
                    .results-container .col-lg-3:first-child .fixed-height-card:last-child {
                        height: 350px;
                    }
                    
                    .pdf-viewer-container iframe {
                        min-height: 400px;
                    }
                }
                `}
            </style>
        </React.Fragment>
    );
};

export default ViewDocuments;