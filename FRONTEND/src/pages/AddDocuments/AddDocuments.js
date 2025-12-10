// import React, { useState, useEffect, useRef } from 'react';
// import {
//     Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label,
//     Modal, Input, FormGroup, Form, FormText, Alert, Badge, ListGroup, ListGroupItem, Spinner
// } from 'reactstrap';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import BreadCrumb from '../../Components/Common/BreadCrumb';
// import { getDocumentDropdowns, postDocumentManualUpload, qcReviewed, view, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
// import SuccessModal from '../../Components/Common/SuccessModal';
// import ErrorModal from '../../Components/Common/ErrorModal';
// import '../AddDocuments/AddDocuments.css';
// import axios from 'axios';

// const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes


// const VIEW_DOCUMENT_URL = "http://192.168.23.229:9000/backend-service/documentUpload/documentView";

// const DocumentManagement = () => {
//     // Modal states
//     const [modalOpen, setModalOpen] = useState(false);
//     const [statusModalOpen, setStatusModalOpen] = useState(false);
//     const [editMode, setEditMode] = useState(false);
//     const [currentDocument, setCurrentDocument] = useState(null);
//     const [hasSearched, setHasSearched] = useState(false);
//     const [uploadLoading, setUploadLoading] = useState(false);
//     const [successModal, setSuccessModal] = useState(false);
//     const [errorModal, setErrorModal] = useState(false);
//     const [response, setResponse] = useState('');

//     // Filter states
//     const [zone, setZone] = useState('');
//     const [circle, setCircle] = useState('');
//     const [division, setDivision] = useState('');
//     const [subDivision, setSubDivision] = useState('');
//     const [section, setSection] = useState('');
//     const [userName, setUserName] = useState("");
//     const [zoneOptions, setZoneOptions] = useState([]);
//     const [circleOptions, setCircleOptions] = useState([]);
//     const [divisionOptions, setDivisionOptions] = useState([]);
//     const [subDivisionOptions, setSubDivisionOptions] = useState([]);
//     const [sectionOptions, setSectionOptions] = useState([]);
//     const [account_id, setAccountId] = useState('');
//     const [accountSearchInput, setAccountSearchInput] = useState('');
//     const [accountSuggestions, setAccountSuggestions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [showSuggestions, setShowSuggestions] = useState(false);
//     const [searchResults, setSearchResults] = useState([]);
//     const [documentCategory, setDocumentCategory] = useState([]);
//     const [roles, setRoles] = useState([]);
//     const [documentCounts, setDocumentCounts] = useState({
//         approved: 0,
//         pending: 0,
//         rejected: 0
//     });

//     // *** ADDED/MODIFIED STATES ***
//     const [approvedModalOpen, setApprovedModalOpen] = useState(false);
//     const [rejectedModalOpen, setRejectedModalOpen] = useState(false);
//     const [pendingCountModalOpen, setPendingCountModalOpen] = useState(false); // <-- ADDED FOR SIMPLE COUNT

//     const [approvedDocuments, setApprovedDocuments] = useState([]);
//     const [rejectedDocuments, setRejectedDocuments] = useState([]);

//     const [selectedFile, setSelectedFile] = useState(null); // Used for Approved
//     const [selectedRejectedFile, setSelectedRejectedFile] = useState(null); // Used for Rejected
//     // *** END OF ADDED/MODIFIED STATES ***

//     const [previewContent, setPreviewContent] = useState(null);
//     const [previewLoading, setPreviewLoading] = useState(false);
//     const [previewError, setPreviewError] = useState(null);
//     const [selectedConsumer, setSelectedConsumer] = useState(null);
//     const [showReuploadModal, setShowReuploadModal] = useState(false);
//     const [reuploadDocument, setReuploadDocument] = useState(null);
//     const [newDocumentFile, setNewDocumentFile] = useState(null);
//     const [newDocumentPreview, setNewDocumentPreview] = useState(null);
//     const [reuploadFileLoading, setReuploadFileLoading] = useState(false);
//     const [reuploadOldDocPreview, setReuploadOldDocPreview] = useState(null);
//     const [changeReason, setChangeReason] = useState('');

//     // User level and access info
//     const [userLevel, setUserLevel] = useState('');
//     const [userAccessData, setUserAccessData] = useState([]);

//     // Display values for disabled fields
//     const [displayZone, setDisplayZone] = useState('');
//     const [displayCircle, setDisplayCircle] = useState('');
//     const [displayDivision, setDisplayDivision] = useState('');
//     const [displaySubDivision, setDisplaySubDivision] = useState('');
//     const [displaySection, setDisplaySection] = useState('');

//     document.title = `Document Upload | DMS`;

//     const handleReuploadSubmit = async () => {
//         if (!newDocumentFile || !reuploadDocument || !changeReason) {
//             setResponse('Please provide all required fields');
//             setErrorModal(true);
//             return;
//         }

//         try {
//             setUploadLoading(true);
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userId = authUser?.user?.User_Id;
//             const userName = authUser?.user?.Email || 'Admin';

//             // Debug: Check what data we have
//             console.log("Reupload Document Data:", reuploadDocument);
//             console.log("Account_Id from document:", reuploadDocument.Account_Id);

//             const formData = new FormData();

//             // Use Account_Id from document, fallback to account search values
//             const accountId = reuploadDocument.Account_Id || account_id || accountSearchInput;
//             if (!accountId) {
//                 setResponse('Account ID is required for re-upload');
//                 setErrorModal(true);
//                 return;
//             }

//             // Match the exact structure from your image
//             formData.append('Account_Id', accountId);
//             formData.append('mannualFile', newDocumentFile);
//             formData.append('DocumentName', reuploadDocument.DocumentName || reuploadDocument.name || 'Reuploaded Document');
//             formData.append('DocumentDescription', reuploadDocument.DocumentDescription || reuploadDocument.description || 'Reuploaded after rejection');
//             formData.append('MetaTags', reuploadDocument.MetaTags || reuploadDocument.metaTags || 'reupload,document');
//             formData.append('CreatedByUser_Id', userId);
//             formData.append('CreatedByUserName', userName);
//             formData.append('Category_Id', reuploadDocument.Category_Id || reuploadDocument.category || '1');
//             formData.append('Status_Id', '1');
//             formData.append('div_code', reuploadDocument.div_code || authUser?.user?.zones?.[0]?.div_code || '43005');
//             formData.append('sd_code', reuploadDocument.sd_code || authUser?.user?.zones?.[0]?.sd_code || 'AURAD');
//             formData.append('so_code', reuploadDocument.so_code || authUser?.user?.zones?.[0]?.so_code || 'CHINTAKI');
//             formData.append('Role_Id', '1');
//             formData.append('ChangeReason', changeReason);

//             console.log("Reupload FormData:", {
//                 Account_id: accountId,
//                 DocumentName: reuploadDocument.DocumentName || reuploadDocument.name || 'Reuploaded Document',
//                 DocumentDescription: reuploadDocument.DocumentDescription || reuploadDocument.description || 'Reuploaded after rejection',
//                 MetaTags: reuploadDocument.MetaTags || reuploadDocument.metaTags || 'reupload,document',
//                 CreatedByUser_Id: userId,
//                 CreatedByUserName: userName,
//                 Category_Id: reuploadDocument.Category_Id || reuploadDocument.category || '1',
//                 Status_Id: '1',
//                 div_code: reuploadDocument.div_code || authUser?.user?.zones?.[0]?.div_code || '43005',
//                 sd_code: reuploadDocument.sd_code || authUser?.user?.zones?.[0]?.sd_code || 'AURAD',
//                 so_code: reuploadDocument.so_code || authUser?.user?.zones?.[0]?.so_code || 'CHINTAKI',
//                 Role_Id: '1',
//                 ChangeReason: changeReason,
//                 hasFile: !!newDocumentFile
//             });

//             const response = await postDocumentManualUpload(formData);

//             if (response?.status === 'success') {
//                 setResponse(response.message || 'Document re-uploaded successfully!');
//                 setSuccessModal(true);
//                 await fetchRejectedDocuments();
//                 await fetchDocumentCounts();
//             } else {
//                 setResponse(response?.message || 'Failed to re-upload document');
//                 setErrorModal(true);
//             }
//         } catch (error) {
//             console.error('Re-upload failed:', error);
//             setResponse(error.response?.data?.message ||
//                 error.message ||
//                 'Error re-uploading document. Please try again.');
//             setErrorModal(true);
//         } finally {
//             setUploadLoading(false);
//             setShowReuploadModal(false);
//             setReuploadDocument(null);
//             setNewDocumentFile(null);
//             setNewDocumentPreview(null);
//             setReuploadOldDocPreview(null);
//             setChangeReason('');
//         }
//     }

//     // Get user level and access data from session storage
//     useEffect(() => {
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//         if (authUser?.user?.zones && authUser.user.zones.length > 0) {
//             const userData = authUser.user.zones[0];
//             setUserLevel(userData.level || '');
//             setUserAccessData(authUser.user.zones);

//             // Set initial values based on user level
//             if (userData.level === 'zone') {
//                 setZone(userData.zone_code || '');
//                 setDisplayZone(userData.zone_name || userData.zone_code);
//             } else if (userData.level === 'circle') {
//                 setCircle(userData.circle_code || '');
//                 setDisplayCircle(userData.circle || userData.circle_code);
//                 setDisplayZone(userData.zone_name || userData.zone_code);
//             } else if (userData.level === 'division') {
//                 setDivision(userData.div_code || '');
//                 setDisplayDivision(userData.division || userData.div_code);
//                 setDisplayCircle(userData.circle || userData.circle_code);
//                 setDisplayZone(userData.zone_name || userData.zone_code);
//             } else if (userData.level === 'subdivision') {
//                 setSubDivision(userData.sd_code || '');
//                 setDisplaySubDivision(userData.sub_division || userData.sd_code);
//                 setDisplayDivision(userData.division || userData.div_code);
//                 setDisplayCircle(userData.circle || userData.circle_code);
//                 setDisplayZone(userData.zone_name || userData.zone_code);
//             } else if (userData.level === 'section') {
//                 setSection(userData.so_code || '');
//                 setDisplaySection(userData.section_office || userData.so_code);
//                 setDisplaySubDivision(userData.sub_division || userData.sd_code);
//                 setDisplayDivision(userData.division || userData.div_code);
//                 setDisplayCircle(userData.circle || userData.circle_code);
//                 setDisplayZone(userData.zone_name || userData.zone_code);
//             }
//         }
//     }, []);

//     // Fetch initial data based on user level
//     useEffect(() => {
//         const obj = JSON.parse(sessionStorage.getItem("authUser"));
//         const usernm = obj.user.Email;
//         setUserName(usernm);

//         // Fetch zones for zone level users
//         if (userLevel === 'zone') {
//             fetchZones(usernm);
//         }

//         // Fetch data based on user level
//         if (userLevel === 'zone' && userAccessData[0]?.zone_code) {
//             // Zone level - fetch circles using zone_code
//             fetchCircles(usernm, userAccessData[0].zone_code);
//         } else if (userLevel === 'circle' && userAccessData[0]?.circle_code) {
//             // Circle level - fetch divisions using circle_code
//             setCircle(userAccessData[0].circle_code);
//             fetchDivisions(usernm, userAccessData[0].circle_code);
//         } else if (userLevel === 'division' && userAccessData[0]?.div_code) {
//             // Division level - fetch subdivisions using div_code
//             setDivision(userAccessData[0].div_code);
//             fetchSubDivisions(usernm, userAccessData[0].div_code);
//         } else if (userLevel === 'subdivision' && userAccessData[0]?.sd_code) {
//             // Subdivision level - fetch sections using sd_code
//             setSubDivision(userAccessData[0].sd_code);
//             fetchSections(usernm, userAccessData[0].sd_code);
//         } else if (userLevel === 'section' && userAccessData[0]?.so_code) {
//             // Section level - set section
//             setSection(userAccessData[0].so_code);
//         }

//         fetchRoles(usernm);
//         fetchDocumentCategories(usernm);
//         fetchDocumentCounts();
//     }, [userLevel, userAccessData]);

//     // API functions for dropdowns
//     const fetchZones = async (username) => {
//         try {
//             const params = {
//                 flagId: 8,
//                 requestUserName: username
//             };
//             const response = await getAllUserDropDownss(params);
//             if (response?.status === 'success') {
//                 setZoneOptions(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching zones:', error);
//         }
//     };

//     const fetchCircles = async (username, zoneCode) => {
//         try {
//             const params = {
//                 flagId: 7,
//                 zone_code: zoneCode,
//                 requestUserName: username
//             };
//             const response = await getAllUserDropDownss(params);
//             if (response?.status === 'success') {
//                 setCircleOptions(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching circles:', error);
//         }
//     };

//     const fetchDivisions = async (username, circleCode) => {
//         try {
//             const params = {
//                 flagId: 1,
//                 circle_code: circleCode,
//                 requestUserName: username
//             };
//             const response = await getAllUserDropDownss(params);
//             if (response?.status === 'success') {
//                 setDivisionOptions(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching divisions:', error);
//         }
//     };

//     const fetchSubDivisions = async (username, divCode) => {
//         try {
//             const params = {
//                 flagId: 2,
//                 div_code: divCode,
//                 requestUserName: username
//             };
//             const response = await getAllUserDropDownss(params);
//             if (response?.status === 'success') {
//                 setSubDivisionOptions(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching subdivisions:', error);
//         }
//     };

//     const fetchSections = async (username, sdCode) => {
//         try {
//             const params = {
//                 flagId: 3,
//                 sd_code: sdCode,
//                 requestUserName: username
//             };
//             const response = await getAllUserDropDownss(params);
//             if (response?.status === 'success') {
//                 setSectionOptions(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching sections:', error);
//         }
//     };

//     const fetchRoles = async (username) => {
//         try {
//             const params = {
//                 flagId: 6,
//                 requestUserName: username
//             };
//             const response = await getDocumentDropdowns(params);
//             if (response?.status === 'success') {
//                 setRoles(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching roles:', error);
//         }
//     };

//     const fetchDocumentCategories = async (username) => {
//         try {
//             const params = {
//                 flagId: 7,
//                 requestUserName: username
//             };
//             const response = await getDocumentDropdowns(params);
//             if (response?.status === 'success') {
//                 setDocumentCategory(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching document categories:', error);
//         }
//     };

//     // Handle zone change
//     const handleZoneChange = async (e) => {
//         const selectedZone = e.target.value;
//         const selectedZoneObj = zoneOptions.find(z => z.zone_code === selectedZone);
//         setZone(selectedZone);
//         setDisplayZone(selectedZoneObj ? selectedZoneObj.zone : selectedZone);
//         setCircle('');
//         setDisplayCircle('');
//         setDivision('');
//         setDisplayDivision('');
//         setSubDivision('');
//         setDisplaySubDivision('');
//         setSection('');
//         setDisplaySection('');
//         setCircleOptions([]);
//         setDivisionOptions([]);
//         setSubDivisionOptions([]);
//         setSectionOptions([]);

//         if (selectedZone) {
//             await fetchCircles(userName, selectedZone);
//         }
//     };

//     // Handle circle change
//     const handleCircleChange = async (e) => {
//         const selectedCircle = e.target.value;
//         const selectedCircleObj = circleOptions.find(c => c.circle_code === selectedCircle);
//         setCircle(selectedCircle);
//         setDisplayCircle(selectedCircleObj ? selectedCircleObj.circle : selectedCircle);
//         setDivision('');
//         setDisplayDivision('');
//         setSubDivision('');
//         setDisplaySubDivision('');
//         setSection('');
//         setDisplaySection('');
//         setDivisionOptions([]);
//         setSubDivisionOptions([]);
//         setSectionOptions([]);

//         if (selectedCircle) {
//             await fetchDivisions(userName, selectedCircle);
//         }
//     };

//     // Handle division change
//     const handleDivisionChange = async (e) => {
//         const selectedDivCode = e.target.value;
//         const selectedDivisionObj = divisionOptions.find(d => d.div_code === selectedDivCode);
//         setDivision(selectedDivCode);
//         setDisplayDivision(selectedDivisionObj ? selectedDivisionObj.division : selectedDivCode);
//         setSubDivision('');
//         setDisplaySubDivision('');
//         setSection('');
//         setDisplaySection('');
//         setSubDivisionOptions([]);
//         setSectionOptions([]);

//         if (selectedDivCode) {
//             await fetchSubDivisions(userName, selectedDivCode);
//         }
//     };

//     // Handle sub division change
//     const handleSubDivisionChange = async (e) => {
//         const selectedSdCode = e.target.value;
//         const selectedSubDivisionObj = subDivisionOptions.find(sd => sd.sd_code === selectedSdCode);
//         setSubDivision(selectedSdCode);
//         setDisplaySubDivision(selectedSubDivisionObj ? selectedSubDivisionObj.sub_division : selectedSdCode);
//         setSection('');
//         setDisplaySection('');
//         setSectionOptions([]);

//         if (selectedSdCode) {
//             await fetchSections(userName, selectedSdCode);
//         }
//     };

//     // Handle section change
//     const handleSectionChange = (e) => {
//         const selectedSection = e.target.value;
//         const selectedSectionObj = sectionOptions.find(s => s.so_code === selectedSection);
//         setSection(selectedSection);
//         setDisplaySection(selectedSectionObj ? selectedSectionObj.section_office : selectedSection);
//     };

//     const handleApprovedClick = () => {
//         setSelectedFile(null);
//         setSelectedRejectedFile(null);
//         setPreviewContent(null);
//         setPreviewError(null);
//         setApprovedModalOpen(true);
//         fetchApprovedDocuments();
//         fetchDocumentCounts();
//     };

//     const handleRejectedClick = () => {
//         setSelectedFile(null);
//         setSelectedRejectedFile(null);
//         setPreviewContent(null);
//         setPreviewError(null);
//         setRejectedModalOpen(true);
//         fetchRejectedDocuments();
//         fetchDocumentCounts();
//     };

//     // *** MODIFIED FUNCTION ***
//     const handlePendingClick = () => {
//         fetchDocumentCounts(); // Refresh the count
//         setPendingCountModalOpen(true); // Open the simple count modal
//     };

//     // Simplified Validation Schema
//     const documentSchema = Yup.object().shape({
//         docName: Yup.string().required('Document name is required'),
//         selectedCategory: Yup.string().required('Please select a document category'),
//         description: Yup.string().required('Description is required'),
//         metaTags: Yup.string().required('Meta tags are required'),
//         mannualFile: Yup.mixed()
//             .required('Document file is required')
//             .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
//             .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
//     });

//     const getFileIcon = (fileName) => {
//         if (!fileName) return <i className="ri-file-line fs-4 text-secondary"></i>;
//         const extension = fileName.split('.').pop().toLowerCase();
//         if (extension === 'pdf') return <i className="ri-file-pdf-line fs-4 text-danger"></i>;
//         if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <i className="ri-image-line fs-4 text-success"></i>;
//         if (['doc', 'docx'].includes(extension)) return <i className="ri-file-word-line fs-4 text-primary"></i>;
//         if (['xls', 'xlsx'].includes(extension)) return <i className="ri-file-excel-line fs-4 text-success"></i>;
//         return <i className="ri-file-line fs-4 text-secondary"></i>;
//     };

//     // *** MODIFIED FUNCTION ***
//     const fetchDocumentCounts = async () => {
//         try {
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userId = authUser?.user?.User_Id;
//             const so_code = authUser?.user?.zones?.[0]?.so_code || ''; // Get so_code from session

//             const approvedParams = {
//                 flagId: 1, // Use flagId 1 for approved count
//                 User_Id: userId,
//                 so_code: so_code
//             };
//             const rejectedParams = {
//                 flagId: 3, // Use flagId 3 for rejected count
//                 User_Id: userId,
//                 so_code: so_code
//             };
//             // --- ADDED PENDING COUNT CALL ---
//             const pendingParams = {
//                 flagId: 5, // Use flagId 5 for pending count (from Postman)
//                 User_Id: userId,
//                 so_code: so_code
//             };

//             // Run all count fetches in parallel
//             const [approvedResponse, rejectedResponse, pendingResponse] = await Promise.all([
//                 qcReviewed(approvedParams),
//                 qcReviewed(rejectedParams),
//                 qcReviewed(pendingParams) // <-- ADDED
//             ]);
//             // --- END OF ADDED CALL ---

//             setDocumentCounts({
//                 approved: approvedResponse?.results?.[0]?.ApprovedCount || 0,
//                 pending: pendingResponse?.results?.[0]?.PendingDocsCount || 0, // <-- MODIFIED
//                 rejected: rejectedResponse?.results?.[0]?.RejectedCount || 0
//             });

//         } catch (error) {
//             console.error("Error fetching document counts:", error);
//         }
//     };
//     // *** END OF MODIFIED FUNCTION ***

//     // *****************************************************************
//     // ******************* MODIFIED FUNCTION ***************************
//     // *****************************************************************
//     const fetchApprovedDocuments = async () => {
//         try {
//             setLoading(true);
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userId = authUser?.user?.User_Id;
//             const so_code = authUser?.user?.zones?.[0]?.so_code || ''; // Get so_code from session

//             const params = {
//                 flagId: 2, // Use flagId 2 for approved data
//                 User_Id: userId,
//                 so_code: so_code // Add so_code
//             };

//             const response = await qcReviewed(params);

//             if (response?.status === 'success' && response?.results) {
//                 const transformedDocuments = response.results.map(doc => ({
//                     id: doc.DocumentId + '_' + doc.Version_Id, // Unique ID combining DocumentId and Version_Id
//                     DocumentId: doc.DocumentId,
//                     Version_Id: doc.Version_Id, // <-- ADD THIS CRITICAL FIELD
//                     name: doc.DocumentName, // <-- UPDATED
//                     type: getFileTypeFromPath(doc.FilePath),
//                     category: doc.CategoryName, // <-- UPDATED
//                     createdAt: new Date(doc.ApprovedOn).toLocaleDateString(), // <-- MAPPED to ApprovedOn
//                     createdBy: doc.ApprovedbyUserName, // <-- UPDATED
//                     description: doc.ApprovalComment, // <-- MAPPED to ApprovalComment
//                     status: doc.VersionStatusName, // <-- UPDATED
//                     FilePath: doc.FilePath,
//                     division: doc.division_name, // <-- UPDATED
//                     sub_division: doc.subdivision_name, // <-- UPDATED
//                     section: doc.section_name, // <-- UPDATED
//                     rr_no: doc.rr_no,
//                     consumer_name: doc.consumer_name,
//                     consumer_address: doc.consumer_address,
//                     versionLabel: doc.VersionLabel || '1.0',
//                     isLatest: doc.IsLatest || true
//                 }));

//                 setApprovedDocuments(transformedDocuments);
//             } else {
//                 setApprovedDocuments([]);
//                 setDocumentCounts(prev => ({ ...prev, approved: 0 }));
//             }
//         } catch (error) {
//             console.error("Error fetching approved documents:", error);
//             setApprovedDocuments([]);
//             setResponse('Error fetching approved documents');
//             setErrorModal(true);
//         } finally {
//             setLoading(false);
//         }
//     };
//     // *****************************************************************
//     // ***************** END OF MODIFIED FUNCTION **********************
//     // *****************************************************************

//     const fetchRejectedDocuments = async () => {
//         try {
//             setLoading(true);
//             const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//             const userId = authUser?.user?.User_Id;
//             const so_code = authUser?.user?.zones?.[0]?.so_code || '';

//             const params = {
//                 flagId: 4,
//                 User_Id: userId,
//                 so_code: so_code
//             };

//             const response = await qcReviewed(params);

//             if (response?.status === 'success' && response?.results) {
//                 const transformedDocuments = response.results.map(doc => ({
//                     id: doc.DocumentId + '_' + doc.Version_Id,
//                     DocumentId: doc.DocumentId,
//                     Version_Id: doc.Version_Id,
//                     name: doc.DocumentName || `Document_${doc.DocumentId}`,
//                     type: getFileTypeFromPath(doc.FilePath),
//                     category: doc.CategoryName || getDocumentTypeFromPath(doc.FilePath), // <-- Use CategoryName
//                     createdAt: new Date(doc.RejectedOn).toLocaleDateString(),
//                     createdBy: doc.RejectedBy,
//                     description: doc.RejectionComment,
//                     status: doc.VersionStatusName, // <-- Use VersionStatusName
//                     FilePath: doc.FilePath,
//                     division: doc.division_name, // <-- Use division_name
//                     sub_division: doc.subdivision_name, // <-- Use subdivision_name
//                     section: doc.section_name, // <-- Use section_name
//                     rr_no: doc.rr_no,
//                     consumer_name: doc.consumer_name,
//                     consumer_address: doc.consumer_address,
//                     Rejection_Id: doc.Rejection_Id,
//                     RejectionComment: doc.RejectionComment,
//                     versionLabel: doc.VersionLabel || '1.0',
//                     isLatest: doc.IsLatest || true,
//                     // ADD THESE FIELDS FOR REUPLOAD
//                     Account_Id: doc.Account_Id, // <-- ADD THIS
//                     DocumentName: doc.DocumentName, // <-- ADD THIS
//                     DocumentDescription: doc.DocumentDescription, // <-- ADD THIS
//                     MetaTags: doc.MetaTags, // <-- ADD THIS
//                     Category_Id: doc.Category_Id, // <-- ADD THIS
//                     div_code: doc.div_code, // <-- ADD THIS
//                     sd_code: doc.sd_code, // <-- ADD THIS
//                     so_code: doc.so_code // <-- ADD THIS
//                 }));
//                 setRejectedDocuments(transformedDocuments);
//             } else {
//                 setRejectedDocuments([]);
//             }
//         } catch (error) {
//             console.error("Error fetching rejected documents:", error);
//             setRejectedDocuments([]);
//             setResponse('Error fetching rejected documents');
//             setErrorModal(true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getFileTypeFromPath = (filePath) => {
//         if (!filePath) return 'application/octet-stream';
//         const extension = filePath.split('.').pop().toLowerCase();
//         switch (extension) {
//             case 'pdf': return 'application/pdf';
//             case 'jpg':
//             case 'jpeg': return 'image/jpeg';
//             case 'png': return 'image/png';
//             case 'doc': return 'application/msword';
//             case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//             case 'xls': return 'application/vnd.ms-excel';
//             case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
//             default: return 'application/octet-stream';
//         }
//     };

//     const getDocumentTypeFromPath = (filePath) => {
//         if (!filePath) return 'Additional Document';
//         const fileName = filePath.split('\\').pop().toLowerCase();
//         if (fileName.includes('id') || fileName.includes('proof')) return 'ID Proof';
//         if (fileName.includes('ownership')) return 'Ownership Proof';
//         if (fileName.includes('khata')) return 'Khata Certificate';
//         if (fileName.includes('power')) return 'Power Agreement';
//         if (fileName.includes('site')) return 'Site Sketch';
//         return 'Additional Document';
//     };

//     // *** MODIFIED: handleFileSelect (using direct axios with Version_Id) ***
//     const handleFileSelect = async (file) => {
//         console.log('📄 File selected:', file);
//         console.log('🔑 Version_Id to be sent:', file.Version_Id);

//         setSelectedFile(file);
//         setPreviewLoading(true);
//         setPreviewContent(null);
//         setPreviewError(null);

//         try {
//             if (!file.Version_Id) {
//                 throw new Error("Version_Id is required for document preview");
//             }

//             const requestPayload = {
//                 flagId: 2,
//                 Version_Id: file.Version_Id,
//                 requestUserName: userName,
//             };

//             console.log('🚀 API Request Payload:', requestPayload);

//             // Use direct axios call
//             const response = await axios.post(
//                 VIEW_DOCUMENT_URL,
//                 requestPayload,
//                 { responseType: "blob" } // Critical: ensures data is treated as a blob
//             );

//             // The blob is in response.data
//             const receivedBlob = response;

//             if (!(receivedBlob instanceof Blob)) {
//                 console.error('❌ Response data was not a Blob.', receivedBlob);
//                 throw new Error("Received invalid file data from server.");
//             }

//             console.log('📦 Received Blob. Type:', receivedBlob.type, 'Size:', receivedBlob.size);

//             if (receivedBlob.size === 0) {
//                 throw new Error("Received empty file data (0 bytes).");
//             }

//             let blobToView;

//             // Check if the blob is an error message (as JSON)
//             if (receivedBlob.type === 'application/json') {
//                 console.error('❌ Server returned an error as a JSON blob. Reading error...');
//                 const errorText = await receivedBlob.text();
//                 let errorMessage;
//                 try {
//                     const errorJson = JSON.parse(errorText);
//                     errorMessage = errorJson.message || errorJson.error || "Server returned an error.";
//                 } catch (e) {
//                     errorMessage = errorText || "Failed to load document: Unknown server error.";
//                 }
//                 console.error('Error content:', errorText);
//                 throw new Error(errorMessage);
//             }

//             // If the blob type is not PDF, force it.
//             // This handles 'application/octet-stream' or empty type.
//             if (receivedBlob.type !== 'application/pdf') {
//                 console.warn(`⚠️ Blob type is '${receivedBlob.type}'. Forcing 'application/pdf'.`);
//                 blobToView = new Blob([receivedBlob], { type: 'application/pdf' });
//             } else {
//                 blobToView = receivedBlob;
//             }

//             // Create object URL for the valid blob
//             const fileUrl = URL.createObjectURL(blobToView);
//             console.log('🔗 Object URL created:', fileUrl.substring(0, 50) + '...');

//             setPreviewContent({
//                 url: fileUrl,
//                 type: 'application/pdf', // Always use this for the iframe
//                 name: file.name,
//                 blob: blobToView
//             });

//             console.log('✅ Preview content set successfully');

//         } catch (error) {
//             console.error("❌ Preview error:", error);
//             // Handle axios errors
//             let errorMessage = error.message;
//             if (error.response && error.response.data) {
//                 // If the error response was *also* a blob (e.g., json error), try to read it
//                 if (error.response.data instanceof Blob) {
//                     try {
//                         const errorText = await error.response.data.text();
//                         const errorJson = JSON.parse(errorText);
//                         errorMessage = errorJson.message || errorJson.error || "Server error";
//                     } catch (e) {
//                         errorMessage = "Failed to load document (unreadable error response).";
//                     }
//                 }
//             }

//             setPreviewError(errorMessage);
//             setResponse(errorMessage);
//             setErrorModal(true);
//         } finally {
//             setPreviewLoading(false);
//         }
//     };
//     // *** END OF MODIFIED handleFileSelect ***

//     // *** MODIFIED: handleDownload (using direct axios with Version_Id) ***
//     const handleDownload = async (file) => {
//         try {
//             console.log('📥 Starting download for Version_Id:', file.Version_Id);

//             if (!file.Version_Id) {
//                 throw new Error("Version_Id is required for download");
//             }

//             const requestPayload = {
//                 flagId: 2,
//                 Version_Id: file.Version_Id,
//                 requestUserName: userName,
//             };

//             console.log('🚀 Download API Request:', requestPayload);

//             // Use direct axios call
//             const response = await axios.post(
//                 VIEW_DOCUMENT_URL,
//                 requestPayload,
//                 { responseType: "blob" } // Critical: ensures data is treated as a blob
//             );

//             // The blob is in response.data
//             const receivedBlob = response;

//             if (!(receivedBlob instanceof Blob)) {
//                 console.error('❌ Download response was not a Blob.', receivedBlob);
//                 throw new Error("Received invalid file data from server.");
//             }

//             console.log('📥 Download Blob. Type:', receivedBlob.type, 'Size:', receivedBlob.size);

//             if (receivedBlob.size === 0) {
//                 throw new Error("Received empty file for download (0 bytes).");
//             }

//             // Check for JSON error blob
//             if (receivedBlob.type === 'application/json') {
//                 console.error('❌ Server returned an error as a JSON blob. Reading error...');
//                 const errorText = await receivedBlob.text();
//                 let errorMessage;
//                 try {
//                     const errorJson = JSON.parse(errorText);
//                     errorMessage = errorJson.message || errorJson.error || "Server returned an error.";
//                 } catch (e) {
//                     errorMessage = errorText || "Failed to download: Unknown server error.";
//                 }
//                 console.error('Error content:', errorText);
//                 throw new Error(errorMessage);
//             }

//             let blobToDownload;

//             if (receivedBlob.type !== 'application/pdf') {
//                 console.warn(`⚠️ Download: Blob type is '${receivedBlob.type}'. Forcing 'application/pdf'.`);
//                 blobToDownload = new Blob([receivedBlob], { type: 'application/pdf' });
//             } else {
//                 blobToDownload = receivedBlob;
//             }

//             // Create download link
//             const url = URL.createObjectURL(blobToDownload);
//             const link = document.createElement("a");
//             link.href = url;

//             // Create filename
//             const fileExtension = 'pdf'; // Forcing .pdf as it's the only type we handle
//             const fileName = `${file.name || 'document'}_v${file.versionLabel || file.Version_Id}.${fileExtension}`;

//             link.download = fileName;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);

//             // Clean up URL after download
//             setTimeout(() => {
//                 URL.revokeObjectURL(url);
//             }, 100);

//             console.log('✅ Download completed successfully');

//         } catch (err) {
//             console.error("❌ Download failed:", err);
//             let errorMessage = err.message;
//             // Try to read error from blob if it exists
//             if (err.response && err.response.data && err.response.data instanceof Blob) {
//                 try {
//                     const errorText = await err.response.data.text();
//                     const errorJson = JSON.parse(errorText);
//                     errorMessage = errorJson.message || errorJson.error || "Server error";
//                 } catch (e) {
//                     errorMessage = "Failed to download (unreadable error response).";
//                 }
//             }
//             setResponse(errorMessage);
//             setErrorModal(true);
//         }
//     };
//     // *** END OF MODIFIED handleDownload ***

//     const handleRejectedFileSelect = async (file) => {
//         setSelectedRejectedFile(file);
//         setSelectedFile(file);
//         await handleFileSelect(file);
//     };

//     // *** MODIFIED: handleReuploadClick (using direct axios with Version_Id) ***
//     const handleReuploadClick = async (doc) => {
//         setReuploadDocument(doc);
//         setSelectedRejectedFile(doc);
//         setShowReuploadModal(true);
//         setReuploadFileLoading(true);

//         try {
//             console.log('🔑 Reupload - Version_Id to be sent:', doc.Version_Id);

//             if (!doc.Version_Id) {
//                 throw new Error("Version_Id is required for document preview");
//             }

//             const requestPayload = {
//                 flagId: 2,
//                 Version_Id: doc.Version_Id,
//                 requestUserName: userName,
//             };

//             const response = await axios.post(
//                 VIEW_DOCUMENT_URL,
//                 requestPayload,
//                 { responseType: "blob" }
//             );

//             const receivedBlob = response;

//             if (!(receivedBlob instanceof Blob)) {
//                 throw new Error("Received invalid file data from server.");
//             }

//             if (receivedBlob.size === 0) {
//                 throw new Error("Received empty file data (0 bytes).");
//             }

//             let blobToView;

//             if (receivedBlob.type === 'application/json') {
//                 const errorText = await receivedBlob.text();
//                 let errorMessage;
//                 try {
//                     const errorJson = JSON.parse(errorText);
//                     errorMessage = errorJson.message || errorJson.error || "Server returned an error.";
//                 } catch (e) {
//                     errorMessage = errorText || "Failed to load document: Unknown server error.";
//                 }
//                 throw new Error(errorMessage);
//             }

//             if (receivedBlob.type !== 'application/pdf') {
//                 blobToView = new Blob([receivedBlob], { type: 'application/pdf' });
//             } else {
//                 blobToView = receivedBlob;
//             }

//             const fileUrl = URL.createObjectURL(blobToView);

//             setReuploadOldDocPreview({
//                 url: fileUrl,
//                 type: 'application/pdf',
//                 name: doc.name
//             });
//         } catch (error) {
//             console.error("Preview error:", error);
//             setReuploadOldDocPreview(null);
//             setResponse(error.message || "Failed to load document preview");
//             setErrorModal(true);
//         } finally {
//             setReuploadFileLoading(false);
//         }
//     };
//     // *** END OF MODIFIED handleReuploadClick ***

//     // Formik form setup - Simplified for single file upload
//     const formik = useFormik({
//         initialValues: {
//             docName: '',
//             selectedCategory: '',
//             selectedRole: '',
//             description: '',
//             metaTags: '',
//             mannualFile: null,
//         },
//         validationSchema: documentSchema,
//         validateOnChange: true,
//         validateOnBlur: true,
//         onSubmit: async (values) => {
//             console.log("Formik values on submit:", values);
//             try {
//                 setUploadLoading(true);
//                 const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//                 const userId = authUser?.user?.User_Id;
//                 const userEmail = authUser?.user?.Email;
//                 // Get div_code and sd_code from session storage
//                 const userDivCode = authUser?.user?.zones?.[0]?.div_code || '';
//                 const userSdCode = authUser?.user?.zones?.[0]?.sd_code || '';

//                 const formData = new FormData();
//                 formData.append('Account_Id', account_id || accountSearchInput);
//                 formData.append('DocumentName', values.docName.trim());
//                 formData.append('DocumentDescription', values.description.trim());
//                 formData.append('MetaTags', values.metaTags.trim());
//                 formData.append('CreatedByUser_Id', userId);
//                 formData.append('CreatedByUserName', userEmail);
//                 formData.append('Category_Id', values.selectedCategory);
//                 formData.append('Status_Id', '1'); // Hardcoded as per requirement
//                 formData.append('mannualFile', values.mannualFile); // Single file upload
//                 formData.append('div_code', userDivCode); // Use div_code from session storage
//                 formData.append('sd_code', userSdCode); // Use sd_code from session storage

//                 // Add other location codes if available
//                 if (section) formData.append('so_code', section);

//                 if (values.selectedRole) {
//                     formData.append('Role_Id', values.selectedRole);
//                 }

//                 console.log("FormData being sent:", {
//                     account_id: account_id || accountSearchInput,
//                     DocumentName: values.docName.trim(),
//                     DocumentDescription: values.description.trim(),
//                     MetaTags: values.metaTags.trim(),
//                     CreatedByUser_Id: userId,
//                     CreatedByUserName: userEmail,
//                     Category_Id: values.selectedCategory,
//                     Status_Id: '1',
//                     div_code: userDivCode,
//                     sd_code: userSdCode,
//                     so_code: section || '',
//                     Role_Id: values.selectedRole || '',
//                     hasFile: !!values.mannualFile
//                 });

//                 const response = await postDocumentManualUpload(formData);
//                 if (response?.status === 'success') {
//                     const responseData = response?.message;
//                     if (account_id) {
//                         await handleSearch();
//                     }
//                     resetForm();
//                     setModalOpen(false);
//                     setResponse(responseData);
//                     setSuccessModal(true);
//                     await fetchDocumentCounts();
//                 } else {
//                     setResponse(response?.message || 'Failed to upload document');
//                     setErrorModal(true);
//                 }
//             } catch (error) {
//                 console.error('Error uploading document:', error);
//                 setResponse('Error uploading document. Please try again.');
//                 setErrorModal(true);
//             } finally {
//                 setUploadLoading(false);
//             }
//         }
//     });

//     const handleFileUpload = (e) => {
//         const file = e.currentTarget.files[0];
//         console.log(`File selected:`, file);
//         if (file) {
//             formik.setFieldValue('mannualFile', file);
//             formik.setFieldTouched('mannualFile', true);

//             if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
//                 const fileUrl = URL.createObjectURL(file);
//                 const fileType = file.type.split('/')[1] || 'unknown';

//                 setPreviewContent({
//                     url: fileUrl,
//                     type: fileType,
//                     name: file.name
//                 });
//             } else {
//                 setPreviewContent(null);
//             }
//         } else {
//             formik.setFieldValue('mannualFile', null);
//             formik.setFieldTouched('mannualFile', true);
//             setPreviewContent(null);
//         }
//     };

//     const debounceRef = useRef();

//     const handleAccountSearchChange = (e) => {
//         const value = e.target.value;
//         setAccountSearchInput(value);
//         setAccountSuggestions([]);
//         setAccountId('');
//         setLoading(false);
//         setShowSuggestions(false);

//         if (debounceRef.current) clearTimeout(debounceRef.current);

//         if (value.length >= 5) {
//             debounceRef.current = setTimeout(async () => {
//                 try {
//                     // Get the section name for the API call
//                     const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
//                     const sectionName = selectedSectionObj ? selectedSectionObj.section_office : displaySection;

//                     if (!sectionName) {
//                         setAccountSuggestions([]);
//                         return;
//                     }

//                     const params = {
//                         flagId: 4,
//                         section: sectionName,
//                         account_id: value
//                     };

//                     setLoading(true);
//                     setShowSuggestions(true);
//                     const response = await getDocumentDropdowns(params);
//                     const options = response?.data || [];

//                     setAccountSuggestions(options);
//                 } catch (error) {
//                     console.error('Error fetching Account Suggestions:', error.message);
//                     setAccountSuggestions([]);
//                 } finally {
//                     setLoading(false);
//                 }
//             }, 300);
//         }
//     };

//     const handleAccountSuggestionClick = (accId) => {
//         setAccountId(accId);
//         setAccountSearchInput(accId);
//         setAccountSuggestions([]);
//         setShowSuggestions(false);
//         setHasSearched(false);
//     };

//     const handleSearch = async () => {
//         try {
//             if (!account_id) {
//                 setResponse('Please enter an account ID');
//                 setErrorModal(true);
//                 return;
//             }

//             // Get the section name for the API call
//             const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
//             const sectionName = selectedSectionObj ? selectedSectionObj.section_office : displaySection;

//             if (!sectionName) {
//                 setResponse('Please select a section first');
//                 setErrorModal(true);
//                 return;
//             }

//             setLoading(true);
//             const params = {
//                 flagId: 5,
//                 account_id: account_id,
//                 section: sectionName
//             };
//             const response = await getDocumentDropdowns(params);

//             if (response?.status === "success" && response?.data?.length > 0) {
//                 setSearchResults(response.data);
//                 setHasSearched(true);
//                 setResponse(response.message || 'Consumer details found successfully');
//                 setSuccessModal(true);
//             } else {
//                 setSearchResults([]);
//                 setResponse(response?.message || 'No consumer found with this account ID');
//                 setErrorModal(true);
//             }
//         } catch (error) {
//             console.error('Error on submit:', error.message);
//             setResponse('Error fetching consumer details');
//             setErrorModal(true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         formik.resetForm();
//         setCurrentDocument(null);
//         setEditMode(false);
//         const fileInputs = document.querySelectorAll('input[type="file"]');
//         fileInputs.forEach(input => {
//             if (input) input.value = '';
//         });
//         formik.setFieldValue('mannualFile', null);
//         setPreviewContent(null);
//     };

//     const handleEdit = (document) => {
//         formik.setValues({
//             docName: document.name,
//             selectedCategory: document.category,
//             description: document.description || '',
//             metaTags: document.metaTags || '',
//             selectedRole: document.role || '',
//             mannualFile: null,
//         });
//         setCurrentDocument(document);
//         setEditMode(true);
//         setModalOpen(true);
//     };

//     const handleResetFilters = () => {
//         // Reset to user's default values based on their level
//         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
//         if (authUser?.user?.zones && authUser.user.zones.length > 0) {
//             const userData = authUser.user.zones[0];

//             if (userLevel === 'zone') {
//                 setZone(userData.zone_code || '');
//                 setDisplayZone(userData.zone_name || userData.zone_code);
//                 setCircle('');
//                 setDisplayCircle('');
//                 setDivision('');
//                 setDisplayDivision('');
//                 setSubDivision('');
//                 setDisplaySubDivision('');
//                 setSection('');
//                 setDisplaySection('');
//                 // Re-fetch circles for zone level
//                 fetchCircles(userName, userData.zone_code);
//             } else if (userLevel === 'circle') {
//                 setCircle(userData.circle_code || '');
//                 setDisplayCircle(userData.circle || userData.circle_code);
//                 setDivision('');
//                 setDisplayDivision('');
//                 setSubDivision('');
//                 setDisplaySubDivision('');
//                 setSection('');
//                 setDisplaySection('');
//                 // Re-fetch divisions for circle level
//                 fetchDivisions(userName, userData.circle_code);
//             } else if (userLevel === 'division') {
//                 setDivision(userData.div_code || '');
//                 setDisplayDivision(userData.division || userData.div_code);
//                 setSubDivision('');
//                 setDisplaySubDivision('');
//                 setSection('');
//                 setDisplaySection('');
//                 // Re-fetch subdivisions for division level
//                 fetchSubDivisions(userName, userData.div_code);
//             } else if (userLevel === 'subdivision') {
//                 setSubDivision(userData.sd_code || '');
//                 setDisplaySubDivision(userData.sub_division || userData.sd_code);
//                 setSection('');
//                 setDisplaySection('');
//                 // Re-fetch sections for subdivision level
//                 fetchSections(userName, userData.sd_code);
//             } else if (userLevel === 'section') {
//                 setSection(userData.so_code || '');
//                 setDisplaySection(userData.section_office || userData.so_code);
//             }
//         }

//         setAccountId('');
//         setAccountSearchInput('');
//         setSearchResults([]);
//         setHasSearched(false);
//     };

//     const handleAddDocument = () => {
//         resetForm();
//         setModalOpen(true);
//     };

//     const renderTableRows = () => {
//         if (!hasSearched) {
//             return (
//                 <tr>
//                     <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
//                         Enter an account ID and click Search
//                     </td>
//                 </tr>
//             );
//         }

//         if (searchResults.length === 0) {
//             return (
//                 <tr>
//                     <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
//                         No consumer found with this account ID
//                     </td>
//                 </tr>
//             );
//         }

//         return searchResults.map((row, rowIndex) => (
//             <tr key={rowIndex}>
//                 <td>{row.consumer_name || '-'}</td>
//                 <td>{row.rr_no || '-'}</td>
//                 <td>{row.account_id || '-'}</td>
//                 <td>{row.consumer_address || '-'}</td>
//                 <td>{row.phone || '-'}</td>
//             </tr>
//         ));
//     };

//     // Helper function to check if field should be disabled based on user level
//     const isFieldDisabled = (fieldLevel) => {
//         const levelHierarchy = ['zone', 'circle', 'division', 'subdivision', 'section'];
//         const userLevelIndex = levelHierarchy.indexOf(userLevel);
//         const fieldLevelIndex = levelHierarchy.indexOf(fieldLevel);

//         return userLevelIndex >= fieldLevelIndex;
//     };

//     return (
//         <div className="page-content">
//             <BreadCrumb title="Document Manual Upload" pageTitle="DMS" />
//             <Container fluid>
//                 <SuccessModal
//                     show={successModal}
//                     onCloseClick={() => setSuccessModal(false)}
//                     successMsg={response}
//                 />

//                 <ErrorModal
//                     show={errorModal}
//                     onCloseClick={() => setErrorModal(false)}
//                     errorMsg={response || 'An error occurred'}
//                 />

//                 {/* --- ADDED: Simple Modal for Pending Count --- */}
//                 <Modal
//                     isOpen={pendingCountModalOpen}
//                     toggle={() => setPendingCountModalOpen(false)}
//                     centered
//                 >
//                     <ModalHeader
//                         className="bg-primary text-white p-3"
//                         toggle={() => setPendingCountModalOpen(false)}
//                     >
//                         <span className="modal-title text-white">Pending Documents</span>
//                     </ModalHeader>
//                     <ModalBody className="text-center p-4">
//                         <h4>
//                             You have <Badge color="warning" pill className="fs-5 px-3 py-2">{documentCounts.pending}</Badge> pending document(s).
//                         </h4>
//                         <p className="text-muted">These documents are awaiting review.</p>
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button color="primary" onClick={() => setPendingCountModalOpen(false)}>
//                             OK
//                         </Button>
//                     </ModalFooter>
//                 </Modal>
//                 {/* --- END OF ADDED MODAL --- */}

//                 <Row>
//                     <Col lg={12}>
//                         <Card>
//                             <CardHeader className="bg-primary text-white p-3">
//                                 <Row className="g-4 alignItems-center">
//                                     <Col className="d-flex alignItems-center">
//                                         <h4 className="mb-0 card-title text-white">Document Management</h4>
//                                     </Col>
//                                 </Row>
//                             </CardHeader>
//                             <CardBody>
//                                 <Row className="g-4 mb-3">
//                                     <Col sm={12}>
//                                         <Row>
//                                             {/* Zone Dropdown - Only for Zone level users */}
//                                             {userLevel === 'zone' && (
//                                                 <Col md={3}>
//                                                     <FormGroup>
//                                                         <Label>Zone<span className="text-danger">*</span></Label>
//                                                         <Input
//                                                             type="select"
//                                                             value={zone}
//                                                             onChange={handleZoneChange}
//                                                         >
//                                                             <option value="">Select Zone</option>
//                                                             {zoneOptions.map(zone => (
//                                                                 <option key={zone.zone_code} value={zone.zone_code}>{zone.zone}</option>
//                                                             ))}
//                                                         </Input>
//                                                     </FormGroup>
//                                                 </Col>
//                                             )}

//                                             {/* Display Zone value for non-zone users */}
//                                             {userLevel !== 'zone' && displayZone && (
//                                                 <Col md={3}>
//                                                     <FormGroup>
//                                                         <Label>Zone</Label>
//                                                         <Input
//                                                             type="text"
//                                                             value={displayZone}
//                                                             disabled
//                                                             className="bg-light"
//                                                         />
//                                                     </FormGroup>
//                                                 </Col>
//                                             )}

//                                             {/* Circle Dropdown - Only for Zone level users */}
//                                             {userLevel === 'zone' && (
//                                                 <Col md={3}>
//                                                     <FormGroup>
//                                                         <Label>Circle<span className="text-danger">*</span></Label>
//                                                         <Input
//                                                             type="select"
//                                                             value={circle}
//                                                             onChange={handleCircleChange}
//                                                             disabled={!zone}
//                                                         >
//                                                             <option value="">Select Circle</option>
//                                                             {circleOptions.map(circle => (
//                                                                 <option key={circle.circle_code} value={circle.circle_code}>{circle.circle}</option>
//                                                             ))}
//                                                         </Input>
//                                                     </FormGroup>
//                                                 </Col>
//                                             )}

//                                             {/* Display Circle value for non-zone users */}
//                                             {userLevel !== 'zone' && displayCircle && (
//                                                 <Col md={3}>
//                                                     <FormGroup>
//                                                         <Label>Circle</Label>
//                                                         <Input
//                                                             type="text"
//                                                             value={displayCircle}
//                                                             disabled
//                                                             className="bg-light"
//                                                         />
//                                                     </FormGroup>
//                                                 </Col>
//                                             )}

//                                             {/* Division Dropdown */}
//                                             <Col md={3}>
//                                                 <FormGroup>
//                                                     <Label>Division<span className="text-danger">*</span></Label>
//                                                     {isFieldDisabled('division') && displayDivision ? (
//                                                         <Input
//                                                             type="text"
//                                                             value={displayDivision}
//                                                             disabled
//                                                             className="bg-light"
//                                                         />
//                                                     ) : (
//                                                         <Input
//                                                             type="select"
//                                                             value={division}
//                                                             onChange={handleDivisionChange}
//                                                             disabled={isFieldDisabled('division') || (userLevel === 'zone' && !circle)}
//                                                         >
//                                                             <option value="">Select Division</option>
//                                                             {divisionOptions.map(div => (
//                                                                 <option key={div.div_code} value={div.div_code}>{div.division}</option>
//                                                             ))}
//                                                         </Input>
//                                                     )}
//                                                 </FormGroup>
//                                             </Col>

//                                             {/* Sub Division Dropdown */}
//                                             <Col md={3}>
//                                                 <FormGroup>
//                                                     <Label>Sub Division<span className="text-danger">*</span></Label>
//                                                     {isFieldDisabled('subdivision') && displaySubDivision ? (
//                                                         <Input
//                                                             type="text"
//                                                             value={displaySubDivision}
//                                                             disabled
//                                                             className="bg-light"
//                                                         />
//                                                     ) : (
//                                                         <Input
//                                                             type="select"
//                                                             value={subDivision}
//                                                             onChange={handleSubDivisionChange}
//                                                             disabled={isFieldDisabled('subdivision') || !division}
//                                                         >
//                                                             <option value="">Select Sub Division</option>
//                                                             {subDivisionOptions.map(subDiv => (
//                                                                 <option key={subDiv.sd_code} value={subDiv.sd_code}>
//                                                                     {subDiv.sub_division}
//                                                                 </option>
//                                                             ))}
//                                                         </Input>
//                                                     )}
//                                                 </FormGroup>
//                                             </Col>

//                                             {/* Section Dropdown */}
//                                             <Col md={3}>
//                                                 <FormGroup>
//                                                     <Label>Section<span className="text-danger">*</span></Label>
//                                                     {isFieldDisabled('section') && displaySection ? (
//                                                         <Input
//                                                             type="text"
//                                                             value={displaySection}
//                                                             disabled
//                                                             className="bg-light"
//                                                         />
//                                                     ) : (
//                                                         <Input
//                                                             type="select"
//                                                             value={section}
//                                                             onChange={handleSectionChange}
//                                                             disabled={isFieldDisabled('section') || !subDivision}
//                                                         >
//                                                             <option value="">Select Section</option>
//                                                             {sectionOptions.map(sec => (
//                                                                 <option key={sec.so_code} value={sec.so_code}>
//                                                                     {sec.section_office}
//                                                                 </option>
//                                                             ))}
//                                                         </Input>
//                                                     )}
//                                                 </FormGroup>
//                                             </Col>

//                                             <Col md={3}>
//                                                 <FormGroup>
//                                                     <Label>Enter Account ID (min 5 chars)<span className="text-danger">*</span></Label>
//                                                     <Input
//                                                         type="text"
//                                                         value={accountSearchInput}
//                                                         onChange={handleAccountSearchChange}
//                                                         placeholder="Enter Account ID"
//                                                     />
//                                                     {showSuggestions && (
//                                                         <ul style={{ border: '1px solid #ccc', marginTop: '5px', padding: '5px', listStyle: 'none' }}>
//                                                             {loading ? (
//                                                                 <li style={{ color: 'blue', fontStyle: 'italic' }}>Loading...</li>
//                                                             ) : accountSuggestions.length > 0 ? (
//                                                                 accountSuggestions.map(acc => (
//                                                                     <li
//                                                                         key={acc.account_id}
//                                                                         style={{ cursor: 'pointer', padding: '2px 0' }}
//                                                                         onClick={() => handleAccountSuggestionClick(acc.account_id)}
//                                                                     >
//                                                                         {acc.account_id}
//                                                                     </li>
//                                                                 ))
//                                                             ) : (
//                                                                 <li style={{ color: 'red', fontStyle: 'italic' }}>No Data Found</li>
//                                                             )}
//                                                         </ul>
//                                                     )}
//                                                 </FormGroup>
//                                             </Col>
//                                         </Row>
//                                     </Col>
//                                 </Row>
//                                 <Row className="mb-4">
//                                     <Col sm={12}>
//                                         <div className="d-flex justify-content-between alignItems-center">
//                                             <div className="d-flex flex-wrap gap-3">
//                                                 <Button
//                                                     outline
//                                                     color="warning"
//                                                     className="px-3 py-2"
//                                                     style={{
//                                                         borderRadius: '8px',
//                                                         borderWidth: '2px',
//                                                         transition: 'all 0.25s ease',
//                                                         minWidth: '140px',
//                                                         backgroundColor: 'transparent',
//                                                         display: 'flex',
//                                                         alignItems: 'center',
//                                                         gap: '8px',
//                                                         color: '#ffc107',
//                                                         borderColor: '#ffc107'
//                                                     }}
//                                                     onMouseEnter={(e) => {
//                                                         e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
//                                                         e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.5)';
//                                                         e.currentTarget.style.color = 'rgba(255, 193, 7, 0.8)';
//                                                         e.currentTarget.querySelector('i').style.transform = 'scale(1.1)';
//                                                     }}
//                                                     onMouseLeave={(e) => {
//                                                         e.currentTarget.style.backgroundColor = 'transparent';
//                                                         e.currentTarget.style.borderColor = '#ffc107';
//                                                         e.currentTarget.style.color = '#ffc107';
//                                                         e.currentTarget.querySelector('i').style.transform = 'scale(1)';
//                                                     }}
//                                                     onClick={handlePendingClick} // <-- MODIFIED
//                                                 >
//                                                     <i
//                                                         className="ri-time-line"
//                                                         style={{
//                                                             transition: 'transform 0.2s ease',
//                                                             fontSize: '1.1rem'
//                                                         }}
//                                                     ></i>
//                                                     <span>Pending</span>
//                                                     <span
//                                                         className="rounded-pill px-2"
//                                                         style={{
//                                                             marginLeft: 'auto',
//                                                             backgroundColor: 'rgba(255, 193, 7, 0.1)',
//                                                             color: '#ffc107',
//                                                             fontSize: '0.8rem',
//                                                             fontWeight: '500',
//                                                             transition: 'all 0.25s ease'
//                                                         }}
//                                                     >
//                                                         {documentCounts.pending}
//                                                     </span>
//                                                 </Button>

//                                                 <Button
//                                                     outline
//                                                     color="success"
//                                                     className="px-3 py-2"
//                                                     style={{
//                                                         borderRadius: '8px',
//                                                         borderWidth: '2px',
//                                                         transition: 'all 0.25s ease',
//                                                         minWidth: '140px',
//                                                         backgroundColor: 'transparent',
//                                                         display: 'flex',
//                                                         alignItems: 'center',
//                                                         gap: '8px',
//                                                         color: '#28a745',
//                                                         borderColor: '#28a745'
//                                                     }}
//                                                     onMouseEnter={(e) => {
//                                                         e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
//                                                         e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.5)';
//                                                         e.currentTarget.style.color = 'rgba(40, 167, 69, 0.8)';
//                                                         e.currentTarget.querySelector('i').style.transform = 'scale(1.1)';
//                                                     }}
//                                                     onMouseLeave={(e) => {
//                                                         e.currentTarget.style.backgroundColor = 'transparent';
//                                                         e.currentTarget.style.borderColor = '#28a745';
//                                                         e.currentTarget.style.color = '#28a745';
//                                                         e.currentTarget.querySelector('i').style.transform = 'scale(1)';
//                                                     }}
//                                                     onClick={handleApprovedClick}
//                                                 >
//                                                     <i
//                                                         className="ri-checkbox-circle-line"
//                                                         style={{
//                                                             transition: 'transform 0.2s ease',
//                                                             fontSize: '1.1rem'
//                                                         }}
//                                                     ></i>
//                                                     <span>Approved</span>
//                                                     <span
//                                                         className="rounded-pill px-2"
//                                                         style={{
//                                                             marginLeft: 'auto',
//                                                             backgroundColor: 'rgba(40, 167, 69, 0.1)',
//                                                             color: '#28a745',
//                                                             fontSize: '0.8rem',
//                                                             fontWeight: '500',
//                                                             transition: 'all 0.25s ease'
//                                                         }}
//                                                     >
//                                                         {documentCounts.approved}
//                                                     </span>
//                                                 </Button>

//                                                 <Button
//                                                     outline
//                                                     color="danger"
//                                                     className="px-3 py-2"
//                                                     style={{
//                                                         borderRadius: '8px',
//                                                         borderWidth: '2px',
//                                                         transition: 'all 0.25s ease',
//                                                         minWidth: '140px',
//                                                         backgroundColor: 'transparent',
//                                                         display: 'flex',
//                                                         alignItems: 'center',
//                                                         gap: '8px',
//                                                         color: '#dc3545',
//                                                         borderColor: '#dc3545'
//                                                     }}
//                                                     onMouseEnter={(e) => {
//                                                         e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
//                                                         e.currentTarget.style.borderColor = 'rgba(220, 53, 69, 0.5)';
//                                                         e.currentTarget.style.color = 'rgba(220, 53, 69, 0.8)';
//                                                         e.currentTarget.querySelector('i').style.transform = 'scale(1.1)';
//                                                     }}
//                                                     onMouseLeave={(e) => {
//                                                         e.currentTarget.style.backgroundColor = 'transparent';
//                                                         e.currentTarget.style.borderColor = '#dc3545';
//                                                         e.currentTarget.style.color = '#dc3545';
//                                                         e.currentTarget.querySelector('i').style.transform = 'scale(1)';
//                                                     }}
//                                                     onClick={handleRejectedClick}
//                                                 >
//                                                     <i
//                                                         className="ri-close-circle-line"
//                                                         style={{
//                                                             transition: 'transform 0.2s ease',
//                                                             fontSize: '1.1rem'
//                                                         }}
//                                                     ></i>
//                                                     <span>Rejected</span>
//                                                     <span
//                                                         className="rounded-pill px-2"
//                                                         style={{
//                                                             marginLeft: 'auto',
//                                                             backgroundColor: 'rgba(220, 53, 69, 0.1)',
//                                                             color: '#dc3545',
//                                                             fontSize: '0.8rem',
//                                                             fontWeight: '500',
//                                                             transition: 'all 0.25s ease'
//                                                         }}
//                                                     >
//                                                         {documentCounts.rejected}
//                                                     </span>
//                                                 </Button>
//                                             </div>

//                                             <div className="d-flex gap-2">
//                                                 <Button
//                                                     color="light"
//                                                     onClick={handleResetFilters}
//                                                 >
//                                                     Reset
//                                                 </Button>
//                                                 <Button
//                                                     color="primary"
//                                                     onClick={handleSearch}
//                                                     id="search-btn"
//                                                     disabled={loading || !displaySection}
//                                                 >
//                                                     {loading ? (
//                                                         <>
//                                                             <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
//                                                             Searching...
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <i className="ri-search-line me-1 align-bottom"></i> Search
//                                                         </>
//                                                     )}
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                 </Row>

//                                 {hasSearched && (
//                                     <>
//                                         <Row className="g-4 mb-3">
//                                             <Col sm={12} className="d-flex justify-content-end">
//                                                 <Button
//                                                     color="light"
//                                                     className="me-2"
//                                                     onClick={handleAddDocument}
//                                                     disabled={!hasSearched || !account_id}
//                                                 >
//                                                     <i className="ri-add-line me-1 align-bottom"></i> Add Document
//                                                 </Button>
//                                             </Col>
//                                         </Row>
//                                         <Row>
//                                             <Col lg={12}>
//                                                 <div className="fixed-table-outer" style={{ background: 'transparent' }}>
//                                                     <table className="grid-table mb-0" style={{ width: '100%', backgroundColor: 'transparent' }}>
//                                                         <thead>
//                                                             <tr>
//                                                                 <th>ConsumerName</th>
//                                                                 <th>RrNo</th>
//                                                                 <th>AccountID</th>
//                                                                 <th>ConsumerAddress</th>
//                                                                 <th>Phone</th>
//                                                             </tr>
//                                                         </thead>
//                                                         <tbody>{renderTableRows()}</tbody>
//                                                     </table>
//                                                 </div>
//                                             </Col>
//                                         </Row>
//                                     </>
//                                 )}
//                             </CardBody>
//                         </Card>
//                     </Col>
//                 </Row>

//                 <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
//                     <ModalHeader className="bg-primary text-white p-3" toggle={() => setModalOpen(false)}>
//                         <span className="modal-title text-white">{editMode ? 'Edit Document' : 'Add New Document'}</span>
//                     </ModalHeader>
//                     <Form onSubmit={formik.handleSubmit}>
//                         <ModalBody>
//                             <h5 className="mb-3">Document Information</h5>
//                             <Row className="mb-3">
//                                 {/* LEFT SIDE - File Upload Section */}
//                                 <Col md={6}>
//                                     <FormGroup>
//                                         <Label className="form-label">Upload Document <span className="text-danger">*</span></Label>
//                                         {formik.errors.mannualFile && formik.touched.mannualFile && (
//                                             <Alert color="danger" className="py-1 px-2 mb-2">
//                                                 <i className="ri-error-warning-line me-1"></i>
//                                                 {formik.errors.mannualFile}
//                                             </Alert>
//                                         )}

//                                         {/* Upload Button */}
//                                         <label
//                                             className={`btn btn-outline-primary d-flex alignItems-center justify-content-center position-relative w-100 ${formik.values.mannualFile ? 'border-success text-success' : ''}`}
//                                             style={{ height: '120px', borderStyle: 'dashed' }}
//                                         >
//                                             {formik.values.mannualFile ? (
//                                                 <div className="text-center">
//                                                     <i className="ri-check-line display-4 text-success mb-2"></i>
//                                                     <div className="text-success fw-semibold">File Selected</div>
//                                                     <small className="text-muted d-block">
//                                                         {formik.values.mannualFile.name} ({Math.round(formik.values.mannualFile.size / 1024)} KB)
//                                                     </small>
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center">
//                                                     <i className="ri-upload-cloud-line display-4 text-primary mb-2"></i>
//                                                     <div className="fw-semibold">Click to Upload Document</div>
//                                                     <small className="text-muted d-block">Supports PDF, JPG, PNG (Max 2MB)</small>
//                                                 </div>
//                                             )}
//                                             <input
//                                                 type="file"
//                                                 className="d-none"
//                                                 accept=".pdf,.jpg,.jpeg,.png"
//                                                 onChange={handleFileUpload}
//                                                 onClick={(event) => {
//                                                     event.currentTarget.value = '';
//                                                 }}
//                                             />
//                                         </label>

//                                         {/* File name display with remove option */}
//                                         {formik.values.mannualFile && (
//                                             <div className="d-flex alignItems-center mt-2 p-2 border rounded bg-light">
//                                                 <i className="ri-file-line me-2 text-muted fs-5"></i>
//                                                 <div className="flex-grow-1">
//                                                     <div className="fw-medium">{formik.values.mannualFile.name}</div>
//                                                     <small className="text-muted">
//                                                         {Math.round(formik.values.mannualFile.size / 1024)} KB • {formik.values.mannualFile.type}
//                                                     </small>
//                                                 </div>
//                                                 <Button
//                                                     color="link"
//                                                     size="sm"
//                                                     className="p-0 text-danger"
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         formik.setFieldValue('mannualFile', null);
//                                                         const fileInput = document.querySelector('input[type="file"]');
//                                                         if (fileInput) fileInput.value = '';
//                                                         setPreviewContent(null);
//                                                     }}
//                                                     title="Remove file"
//                                                 >
//                                                     <i className="ri-close-line fs-5"></i>
//                                                 </Button>
//                                             </div>
//                                         )}
//                                     </FormGroup>
//                                 </Col>

//                                 {/* Vertical Divider */}
//                                 <Col md={1} className="d-flex justify-content-center">
//                                     <div style={{
//                                         width: '1px',
//                                         backgroundColor: '#dee2e6',
//                                         height: '100%',
//                                         minHeight: '400px'
//                                     }}></div>
//                                 </Col>

//                                 {/* RIGHT SIDE - All Other Form Fields */}
//                                 <Col md={5}>
//                                     <Row>
//                                         <Col md={12}>
//                                             <FormGroup>
//                                                 <Label className="form-label">Document Name <span className="text-danger">*</span></Label>
//                                                 <Input
//                                                     type="text"
//                                                     name="docName"
//                                                     value={formik.values.docName}
//                                                     onChange={formik.handleChange}
//                                                     onBlur={formik.handleBlur}
//                                                     placeholder="Enter document name"
//                                                     className={formik.errors.docName && formik.touched.docName ? 'is-invalid' : ''}
//                                                 />
//                                                 {formik.errors.docName && formik.touched.docName && (
//                                                     <FormText color="danger" className="small">
//                                                         {formik.errors.docName}
//                                                     </FormText>
//                                                 )}
//                                             </FormGroup>
//                                         </Col>
//                                         <Col md={12}>
//                                             <FormGroup>
//                                                 <Label className="form-label">Document Category <span className="text-danger">*</span></Label>
//                                                 <Input
//                                                     type="select"
//                                                     name="selectedCategory"
//                                                     value={formik.values.selectedCategory}
//                                                     onChange={formik.handleChange}
//                                                     onBlur={formik.handleBlur}
//                                                     className={formik.errors.selectedCategory && formik.touched.selectedCategory ? 'is-invalid' : ''}
//                                                 >
//                                                     <option value="">Select Document Category</option>
//                                                     {documentCategory.map((item) => (
//                                                         <option key={item.Category_Id} value={item.Category_Id}>
//                                                             {item.CategoryName}
//                                                         </option>
//                                                     ))}
//                                                 </Input>
//                                                 {formik.errors.selectedCategory && formik.touched.selectedCategory && (
//                                                     <FormText color="danger">
//                                                         {formik.errors.selectedCategory}
//                                                     </FormText>
//                                                 )}
//                                             </FormGroup>
//                                         </Col>
//                                         <Col md={12}>
//                                             <FormGroup>
//                                                 <Label className="form-label">Assign Role</Label>
//                                                 <Input
//                                                     type="select"
//                                                     name="selectedRole"
//                                                     value={formik.values.selectedRole}
//                                                     onChange={formik.handleChange}
//                                                     onBlur={formik.handleBlur}
//                                                     className={formik.errors.selectedRole && formik.touched.selectedRole ?
//                                                         'is-invalid' : ''}
//                                                 >
//                                                     <option value="">Select Role</option>
//                                                     {roles.map((item) => (
//                                                         <option key={item.Role_Id} value={item.Role_Id}>
//                                                             {item.RoleName}
//                                                         </option>
//                                                     ))}
//                                                 </Input>
//                                                 {formik.errors.selectedRole && formik.touched.selectedRole && (
//                                                     <FormText color="danger">
//                                                         {formik.errors.selectedRole}
//                                                     </FormText>
//                                                 )}
//                                             </FormGroup>
//                                         </Col>
//                                         <Col md={12}>
//                                             <FormGroup>
//                                                 <Label className="form-label">Description<span className="text-danger">*</span></Label>
//                                                 <Input
//                                                     type="textarea"
//                                                     name="description"
//                                                     value={formik.values.description}
//                                                     onChange={formik.handleChange}
//                                                     onBlur={formik.handleBlur}
//                                                     rows="3"
//                                                     placeholder="Enter document description"
//                                                     className={formik.errors.description && formik.touched.description ?
//                                                         'is-invalid' : ''}
//                                                 />
//                                                 {formik.errors.description && formik.touched.description && (
//                                                     <FormText color="danger">
//                                                         {formik.errors.description}
//                                                     </FormText>
//                                                 )}
//                                             </FormGroup>
//                                         </Col>
//                                         <Col md={12}>
//                                             <FormGroup>
//                                                 <Label className="form-label">Tags (comma separated)<span className="text-danger">*</span></Label>
//                                                 <Input
//                                                     type="text"
//                                                     name="metaTags"
//                                                     value={formik.values.metaTags}
//                                                     onChange={formik.handleChange}
//                                                     onBlur={formik.handleBlur}
//                                                     placeholder="e.g., invoice, january, payment"
//                                                     className={formik.errors.metaTags && formik.touched.metaTags ?
//                                                         'is-invalid' : ''}
//                                                 />
//                                                 {formik.errors.metaTags && formik.touched.metaTags && (
//                                                     <FormText color="danger">
//                                                         {formik.errors.metaTags}
//                                                     </FormText>
//                                                 )}
//                                             </FormGroup>
//                                         </Col>
//                                     </Row>
//                                 </Col>
//                             </Row>
//                         </ModalBody>

//                         <ModalFooter>
//                             <Button
//                                 color="light"
//                                 onClick={() => {
//                                     setModalOpen(false);
//                                     resetForm();
//                                 }}
//                                 disabled={uploadLoading}
//                             >
//                                 Cancel
//                             </Button>

//                             <Button
//                                 color="primary"
//                                 type="submit"
//                                 disabled={uploadLoading}
//                             >
//                                 {uploadLoading ? (
//                                     <>
//                                         <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
//                                         {editMode ? 'Updating...' : 'Uploading...'}
//                                     </>
//                                 ) : editMode ? (
//                                     'Update Document'
//                                 ) : (
//                                     <>
//                                         <i className="ri-upload-cloud-line me-1"></i> Upload
//                                     </>
//                                 )}
//                             </Button>
//                         </ModalFooter>
//                     </Form>
//                 </Modal>

//                 {/* --- MODALS for Approved, Rejected, and Pending --- */}

//                 {/* Approved Modal */}
//                 <Modal
//                     isOpen={approvedModalOpen}
//                     toggle={() => {
//                         setApprovedModalOpen(false);
//                         setSelectedFile(null);
//                         setPreviewContent(null);
//                         setPreviewError(null);
//                         setSelectedConsumer(null);
//                     }}
//                     size="xl"
//                     className="custom-large-modal"
//                 >
//                     <ModalHeader
//                         className="bg-primary text-white"
//                         toggle={() => {
//                             setApprovedModalOpen(false);
//                             setSelectedFile(null);
//                             setPreviewContent(null);
//                             setPreviewError(null);
//                             setSelectedConsumer(null);
//                         }}
//                         style={{
//                             borderBottom: '1px solid rgba(255,255,255,0.2)',
//                             padding: '1rem 1.5rem'
//                         }}
//                     >
//                         <div className="d-flex alignItems-center">
//                             <h5 className="mb-0 text-white">Approved Documents</h5>
//                             <Badge color="light" pill className="ms-2 text-primary">
//                                 {documentCounts.approved} Approved
//                             </Badge>
//                         </div>
//                     </ModalHeader>
//                     <ModalBody className="p-3">
//                         <Container fluid>
//                             <Row className="g-3 results-container">
//                                 <Col lg={3} className="h-100 d-flex flex-column">
//                                     <Card className="mb-3 slide-in-left fixed-height-card">
//                                         <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Consumer Information</h5>
//                                         </CardHeader>
//                                         <CardBody className="p-1 custom-scrollbar">
//                                             {selectedFile ? (
//                                                 <div className="consumer-details">
//                                                     <div className="row g-0">
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center mb-1">
//                                                                 <i className="ri-user-3-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">RR No:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedFile.rr_no || '-'}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center mb-1">
//                                                                 <i className="ri-profile-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedFile.consumer_name || '-'}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center mb-1">
//                                                                 <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Address:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedFile.consumer_address || '-'}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
//                                                     <i className="ri-user-line fs-5"></i>
//                                                     <p className="mt-1 x-small mb-0">No document selected</p>
//                                                 </div>
//                                             )}
//                                         </CardBody>
//                                     </Card>

//                                     <Card className="slide-in-left delay-1 fixed-height-card">
//                                         <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Document Information</h5>
//                                         </CardHeader>
//                                         <CardBody className="p-1 custom-scrollbar">
//                                             {selectedFile ? (
//                                                 <div className="document-details">
//                                                     <div className="d-flex alignItems-center mb-3">
//                                                         <div className="flex-shrink-0 me-1">
//                                                             {getFileIcon(selectedFile.name)}
//                                                         </div>
//                                                         <div>
//                                                             <h6 className="mb-0 x-small">{selectedFile.name}</h6>
//                                                             <small className="text-muted x-small">{selectedFile.category}</small>
//                                                         </div>
//                                                     </div>

//                                                     <div className="row g-0">
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-file-text-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Approval Comment:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedFile.description || 'None'}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-user-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Approved By:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedFile.createdBy}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-calendar-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Approved On:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedFile.createdAt}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-checkbox-circle-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
//                                                                     <Badge color="success" className="badge-soft-success x-small">
//                                                                         {selectedFile.status}
//                                                                     </Badge>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* ADDED: Version Information */}
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-git-branch-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Version:</Label>
//                                                                     <Badge color="info" className="badge-soft-info x-small">
//                                                                         {selectedFile.versionLabel} {selectedFile.isLatest ? '(Latest)' : ''}
//                                                                     </Badge>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
//                                                     <i className="ri-file-line fs-5"></i>
//                                                     <p className="mt-1 x-small mb-0">No document selected</p>
//                                                 </div>
//                                             )}
//                                         </CardBody>
//                                     </Card>
//                                 </Col>

//                                 <Col lg={3} className="h-100 d-flex flex-column">
//                                     <Card className="h-100 fade-in delay-2">
//                                         <CardHeader
//                                             className="bg-light d-flex justify-content-between align-items-center"
//                                             style={{ borderTop: '3px solid #405189' }}
//                                         >
//                                             <h5 className="mb-0">Approved Documents</h5>
//                                             <Badge color="primary" pill className="text-uppercase px-3 py-2">
//                                                 {approvedDocuments.length} {approvedDocuments.length === 1 ? 'file' : 'files'}
//                                             </Badge>
//                                         </CardHeader>
//                                         <CardBody className="p-0 uploaded-documents-container">
//                                             <div className="uploaded-documents-scrollable" style={{ maxHeight: '500px', overflowY: 'auto' }}>
//                                                 {loading ? (
//                                                     <div className="text-center py-4">
//                                                         <div className="spinner-border text-primary" role="status">
//                                                             <span className="visually-hidden">Loading...</span>
//                                                         </div>
//                                                         <p className="mt-2">Loading approved documents...</p>
//                                                     </div>
//                                                 ) : approvedDocuments.length > 0 ? (
//                                                     <ListGroup flush style={{ minHeight: '100%' }}>
//                                                         {approvedDocuments.map((doc, index) => (
//                                                             <div
//                                                                 key={doc.id}
//                                                                 className="fade-in-list-item"
//                                                                 style={{ animationDelay: `${0.1 * index}s` }}
//                                                             >
//                                                                 <ListGroupItem
//                                                                     action
//                                                                     active={selectedFile?.id === doc.id}
//                                                                     onClick={() => handleFileSelect(doc)}
//                                                                     className="d-flex align-items-center"
//                                                                     style={{
//                                                                         backgroundColor: selectedFile?.id === doc.id ? '#e9ecef' : 'transparent',
//                                                                         borderLeft: selectedFile?.id === doc.id ? '3px solid #9299b1ff' : '3px solid transparent',
//                                                                         cursor: "pointer"
//                                                                     }}
//                                                                 >
//                                                                     <div className="flex-shrink-0 me-3">
//                                                                         {getFileIcon(doc.name)}
//                                                                     </div>
//                                                                     <div className="flex-grow-1 text-truncate">
//                                                                         <h6 className="mb-0 text-truncate" title={doc.name}>
//                                                                             {doc.name}
//                                                                         </h6>
//                                                                         <small className="text-muted d-block text-truncate">
//                                                                             Version: {doc.versionLabel} {doc.isLatest ? '(Latest)' : ''}
//                                                                         </small>
//                                                                     </div>
//                                                                     <Button
//                                                                         color="link"
//                                                                         size="sm"
//                                                                         onClick={(e) => {
//                                                                             e.stopPropagation();
//                                                                             handleDownload(doc);
//                                                                         }}
//                                                                         title="Download"
//                                                                     >
//                                                                         <i className="ri-download-line"></i>
//                                                                     </Button>
//                                                                 </ListGroupItem>
//                                                             </div>
//                                                         ))}
//                                                     </ListGroup>
//                                                 ) : (
//                                                     <div className="text-center text-muted py-4 h-100 d-flex flex-column justify-content-center">
//                                                         No approved documents found
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </CardBody>
//                                     </Card>
//                                 </Col>

//                                 <Col lg={6} className="h-100 d-flex flex-column">
//                                     <Card className="h-100 slide-in-right delay-3 fixed-height-card">
//                                         <CardHeader className="bg-light p-3 position-relative"
//                                             style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Document Preview</h5>
//                                             {selectedFile && (
//                                                 <div className="position-absolute top-50 end-0 translate-middle-y me-3">
//                                                     <Button
//                                                         color="primary"
//                                                         size="sm"
//                                                         onClick={() => handleDownload(selectedFile)}
//                                                         disabled={!previewContent}
//                                                     >
//                                                         <i className="ri-download-line me-1"></i> Download
//                                                     </Button>
//                                                 </div>
//                                             )}
//                                         </CardHeader>
//                                         <CardBody className="p-0 preview-container">
//                                             <div className="preview-scrollable">
//                                                 {previewLoading ? (
//                                                     <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
//                                                         <div className="spinner-border text-primary" role="status">
//                                                             <span className="visually-hidden">Loading...</span>
//                                                         </div>
//                                                         <p className="mt-2">Loading preview...</p>
//                                                     </div>
//                                                 ) : previewError ? (
//                                                     <Alert color="danger" className="m-3 fade-in">
//                                                         <i className="ri-error-warning-line me-2"></i>
//                                                         {previewError}
//                                                     </Alert>
//                                                 ) : selectedFile && previewContent ? (
//                                                     <div className="d-flex flex-column h-100">
//                                                         <div className="flex-grow-1 preview-content">
//                                                             {previewContent.type.includes('pdf') ? (
//                                                                 <div className="pdf-viewer-container fade-in h-100">
//                                                                     <iframe
//                                                                         src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
//                                                                         title="PDF Viewer"
//                                                                         className="w-100 h-100"
//                                                                         style={{ border: 'none' }}
//                                                                         onLoad={(e) => {
//                                                                             console.log('📄 PDF iframe loaded');
//                                                                             // Check if iframe has content
//                                                                             const iframe = e.target;
//                                                                             try {
//                                                                                 const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//                                                                                 console.log('📄 Iframe document readyState:', iframeDoc.readyState);
//                                                                             } catch (err) {
//                                                                                 console.log('🔒 Cannot access iframe content (cross-origin)');
//                                                                             }
//                                                                         }}
//                                                                         onError={(e) => {
//                                                                             console.error('❌ PDF iframe error:', e);
//                                                                             setPreviewError('Failed to load PDF in iframe');
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                             ) : previewContent.type.includes('image') ? (
//                                                                 <div className="text-center fade-in p-3 h-100 d-flex align-items-center justify-content-center">
//                                                                     <img
//                                                                         src={previewContent.url}
//                                                                         alt="Document Preview"
//                                                                         className="img-fluid"
//                                                                         style={{
//                                                                             maxHeight: '100%',
//                                                                             maxWidth: '100%',
//                                                                             objectFit: 'contain'
//                                                                         }}
//                                                                         onError={(e) => {
//                                                                             console.error('❌ Image load error:', e);
//                                                                             setPreviewError('Failed to load image preview');
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                             ) : (
//                                                                 <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
//                                                                     <i className="ri-file-line display-4 text-muted"></i>
//                                                                     <h5 className="mt-3">Preview not available</h5>
//                                                                     <p className="text-muted">
//                                                                         This file type ({previewContent.type}) cannot be previewed in the browser.
//                                                                     </p>
//                                                                     <Button
//                                                                         color="primary"
//                                                                         onClick={() => handleDownload(selectedFile)}
//                                                                         className="mt-2"
//                                                                     >
//                                                                         <i className="ri-download-line me-1"></i> Download File
//                                                                     </Button>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-center text-muted py-5 h-100 d-flex flex-column justify-content-center fade-in">
//                                                         <i className="ri-file-line display-4"></i>
//                                                         <h5 className="mt-3">No document selected</h5>
//                                                         <p>Select an approved file from the list to preview it here</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </CardBody>
//                                     </Card>
//                                 </Col>
//                             </Row>
//                         </Container>
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button color="secondary" onClick={() => {
//                             setApprovedModalOpen(false);
//                             setSelectedFile(null);
//                             setPreviewContent(null);
//                             setPreviewError(null);
//                         }}>
//                             Close
//                         </Button>
//                     </ModalFooter>
//                 </Modal>

//                 {/* Rejected Modal */}
//                 <Modal
//                     isOpen={rejectedModalOpen}
//                     toggle={() => {
//                         setRejectedModalOpen(false);
//                         setSelectedRejectedFile(null);
//                         setPreviewContent(null);
//                         setPreviewError(null);
//                     }}
//                     size="xl"
//                     className="custom-large-modal"
//                     backdrop={showReuploadModal ? 'static' : true}
//                 >
//                     <ModalHeader
//                         className="bg-primary text-white"
//                         toggle={() => {
//                             if (!showReuploadModal) {
//                                 setRejectedModalOpen(false);
//                                 setSelectedRejectedFile(null);
//                                 setPreviewContent(null);
//                                 setPreviewError(null);
//                             }
//                         }}
//                         style={{
//                             borderBottom: '1px solid rgba(255,255,255,0.2)',
//                             padding: '1rem 1.5rem'
//                         }}
//                     >
//                         <div className="d-flex alignItems-center">
//                             <h5 className="mb-0 text-white">Rejected Documents</h5>
//                             <Badge color="light" pill className="ms-2 text-danger">
//                                 {documentCounts.rejected} Rejected
//                             </Badge>
//                         </div>
//                     </ModalHeader>

//                     <ModalBody className="p-3">
//                         <Container fluid>
//                             <Row className="g-3 results-container">
//                                 <Col lg={3} className="h-100 d-flex flex-column">
//                                     <Card className="mb-3 slide-in-left fixed-height-card">
//                                         <CardHeader className="bg-light p-3 position-relative"
//                                             style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Consumer Information</h5>
//                                         </CardHeader>
//                                         <CardBody className="p-1 custom-scrollbar">
//                                             {selectedRejectedFile ? (
//                                                 <div className="consumer-details">
//                                                     <div className="row g-0">
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center mb-1">
//                                                                 <i className="ri-user-3-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">RR Number:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedRejectedFile.rr_no || 'N/A'}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center mb-1">
//                                                                 <i className="ri-profile-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedRejectedFile.consumer_name}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center mb-1">
//                                                                 <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Address:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedRejectedFile.consumer_address}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
//                                                     <i className="ri-user-line fs-5"></i>
//                                                     <p className="mt-1 x-small mb-0">No document selected</p>
//                                                 </div>
//                                             )}
//                                         </CardBody>
//                                     </Card>

//                                     <Card className="slide-in-left delay-1 fixed-height-card">
//                                         <CardHeader className="bg-light p-3 position-relative"
//                                             style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Document Information</h5>
//                                         </CardHeader>
//                                         <CardBody className="p-1 custom-scrollbar">
//                                             {selectedRejectedFile ? (
//                                                 <div className="document-details">
//                                                     <div className="d-flex alignItems-center mb-3">
//                                                         <div className="flex-shrink-0 me-1">
//                                                             {getFileIcon(selectedRejectedFile.name)}
//                                                         </div>
//                                                         <div>
//                                                             <h6 className="mb-0 x-small">{selectedRejectedFile.name}</h6>
//                                                             <small className="text-muted x-small">{selectedRejectedFile.category}</small>
//                                                         </div>
//                                                     </div>

//                                                     <div className="row g-0">
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-file-text-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Rejection Reason:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedRejectedFile.RejectionComment || 'None'}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-user-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Rejected By:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedRejectedFile.createdBy}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-calendar-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Rejected On:</Label>
//                                                                     <span className="fw-semibold x-small">{selectedRejectedFile.createdAt}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-close-circle-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
//                                                                     <Badge color="danger" className="badge-soft-danger x-small">
//                                                                         {selectedRejectedFile.status}
//                                                                     </Badge>
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         {/* ADDED: Version Information */}
//                                                         <div className="col-12 mb-3">
//                                                             <div className="d-flex alignItems-center">
//                                                                 <i className="ri-git-branch-line me-1 text-primary fs-6"></i>
//                                                                 <div className="d-flex alignItems-center gap-3">
//                                                                     <Label className="fw-medium text-muted x-small mb-0">Version:</Label>
//                                                                     <Badge color="info" className="badge-soft-info x-small">
//                                                                         {selectedRejectedFile.versionLabel} {selectedRejectedFile.isLatest ? '(Latest)' : ''}
//                                                                     </Badge>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
//                                                     <i className="ri-file-line fs-5"></i>
//                                                     <p className="mt-1 x-small mb-0">No document selected</p>
//                                                 </div>
//                                             )}
//                                         </CardBody>
//                                     </Card>
//                                 </Col>

//                                 <Col lg={3} className="h-100 d-flex flex-column">
//                                     <Card className="h-100 fade-in delay-2">
//                                         <CardHeader className="bg-light d-flex justify-content-between align-items-center"
//                                             style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Rejected Documents</h5>
//                                             <Badge color="danger" pill className="px-3 py-2">
//                                                 {rejectedDocuments.length} files
//                                             </Badge>
//                                         </CardHeader>

//                                         <CardBody className="p-0 uploaded-documents-container">
//                                             <div className="uploaded-documents-scrollable p-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
//                                                 {loading ? (
//                                                     <div className="text-center py-4">
//                                                         <Spinner color="primary">Loading...</Spinner>
//                                                         <p className="mt-2 text-muted">Loading rejected documents...</p>
//                                                     </div>
//                                                 ) : rejectedDocuments.length > 0 ? (
//                                                     rejectedDocuments.map((doc) => (
//                                                         <Card
//                                                             key={doc.id}
//                                                             className={`document-card mb-2 shadow-sm--hover ${selectedRejectedFile?.id === doc.id ? 'active' : ''}`}
//                                                             onClick={() => handleRejectedFileSelect(doc)}
//                                                         >
//                                                             <CardBody className="p-2">
//                                                                 <div className="d-flex align-items-center">
//                                                                     <div className="flex-shrink-0 me-3">
//                                                                         {getFileIcon(doc.name)}
//                                                                     </div>
//                                                                     <div className="flex-grow-1 overflow-hidden">
//                                                                         <h6 className="mb-0 text-truncate" title={doc.name}>{doc.name}</h6>
//                                                                         <small className="text-muted d-block text-truncate">
//                                                                             Version: {doc.versionLabel} {doc.isLatest ? '(Latest)' : ''}
//                                                                         </small>
//                                                                     </div>
//                                                                     <div className="flex-shrink-0 ms-2">
//                                                                         <Button
//                                                                             color="light"
//                                                                             className="btn-icon rounded-circle"
//                                                                             onClick={(e) => {
//                                                                                 e.stopPropagation();
//                                                                                 handleReuploadClick(doc);
//                                                                             }}
//                                                                             title="Re-upload Document"
//                                                                         >
//                                                                             <i className="ri-upload-2-line"></i>
//                                                                         </Button>
//                                                                     </div>
//                                                                 </div>
//                                                             </CardBody>
//                                                         </Card>
//                                                     ))
//                                                 ) : (
//                                                     <div className="text-center text-muted py-4 h-100 d-flex flex-column justify-content-center">
//                                                         <i className="ri-file-excel-2-line fs-1 mb-3"></i>
//                                                         <h5>No Rejected Documents</h5>
//                                                         <p>You're all caught up!</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </CardBody>
//                                     </Card>
//                                 </Col>

//                                 <Col lg={6} className="h-100 d-flex flex-column">
//                                     <Card className="h-100 slide-in-right delay-3 fixed-height-card">
//                                         <CardHeader className="bg-light p-3 position-relative"
//                                             style={{ borderTop: '3px solid #405189' }}>
//                                             <h5 className="mb-0">Document Preview</h5>
//                                             {selectedRejectedFile && (
//                                                 <div className="position-absolute top-50 end-0 translate-middle-y me-3">
//                                                     <Button
//                                                         color="primary"
//                                                         size="sm"
//                                                         onClick={() => handleDownload(selectedRejectedFile)}
//                                                         disabled={!previewContent}
//                                                     >
//                                                         <i className="ri-download-line me-1"></i> Download
//                                                     </Button>
//                                                 </div>
//                                             )}
//                                         </CardHeader>
//                                         <CardBody className="p-0 preview-container">
//                                             <div className="preview-scrollable">
//                                                 {previewLoading ? (
//                                                     <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
//                                                         <div className="spinner-border text-primary" role="status">
//                                                             <span className="visually-hidden">Loading...</span>
//                                                         </div>
//                                                         <p className="mt-2">Loading preview...</p>
//                                                     </div>
//                                                 ) : previewError ? (
//                                                     <Alert color="danger" className="m-3 fade-in">
//                                                         <i className="ri-error-warning-line me-2"></i>
//                                                         {previewError}
//                                                     </Alert>
//                                                 ) : selectedRejectedFile && previewContent ? (
//                                                     <div className="d-flex flex-column h-100">
//                                                         <div className="flex-grow-1 preview-content">
//                                                             {previewContent.type.includes('pdf') ? (
//                                                                 <div className="pdf-viewer-container fade-in h-100">
//                                                                     <iframe
//                                                                         src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
//                                                                         title="PDF Viewer"
//                                                                         className="w-100 h-100"
//                                                                         style={{ border: 'none' }}
//                                                                         onLoad={(e) => {
//                                                                             console.log('📄 PDF iframe loaded');
//                                                                             const iframe = e.target;
//                                                                             try {
//                                                                                 const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//                                                                                 console.log('📄 Iframe document readyState:', iframeDoc.readyState);
//                                                                             } catch (err) {
//                                                                                 console.log('🔒 Cannot access iframe content (cross-origin)');
//                                                                             }
//                                                                         }}
//                                                                         onError={(e) => {
//                                                                             console.error('❌ PDF iframe error:', e);
//                                                                             setPreviewError('Failed to load PDF in iframe');
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                             ) : previewContent.type.includes('image') ? (
//                                                                 <div className="text-center fade-in p-3 h-100 d-flex align-items-center justify-content-center">
//                                                                     <img
//                                                                         src={previewContent.url}
//                                                                         alt="Document Preview"
//                                                                         className="img-fluid"
//                                                                         style={{
//                                                                             maxHeight: '100%',
//                                                                             maxWidth: '100%',
//                                                                             objectFit: 'contain'
//                                                                         }}
//                                                                         onError={(e) => {
//                                                                             console.error('❌ Image load error:', e);
//                                                                             setPreviewError('Failed to load image preview');
//                                                                         }}
//                                                                     />
//                                                                 </div>
//                                                             ) : (
//                                                                 <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
//                                                                     <i className="ri-file-line display-4 text-muted"></i>
//                                                                     <h5 className="mt-3">Preview not available</h5>
//                                                                     <p className="text-muted">
//                                                                         This file type ({previewContent.type}) cannot be previewed in the browser.
//                                                                     </p>
//                                                                     <Button
//                                                                         color="primary"
//                                                                         onClick={() => handleDownload(selectedRejectedFile)}
//                                                                         className="mt-2"
//                                                                     >
//                                                                         <i className="ri-download-line me-1"></i> Download File
//                                                                     </Button>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-center text-muted py-5 h-100 d-flex flex-column justify-content-center fade-in">
//                                                         <i className="ri-file-line display-4"></i>
//                                                         <h5 className="mt-3">No document selected</h5>
//                                                         <p>Select a rejected file from the list to preview it here</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </CardBody>
//                                     </Card>
//                                 </Col>
//                             </Row>
//                         </Container>
//                     </ModalBody>

//                     <ModalFooter>
//                         <Button color="secondary" onClick={() => {
//                             setRejectedModalOpen(false);
//                             setSelectedRejectedFile(null);
//                             setPreviewContent(null);
//                             setPreviewError(null);
//                         }}>
//                             Close
//                         </Button>
//                     </ModalFooter>
//                 </Modal>

//                 {/* Re-upload Document Modal */}
//                 <Modal
//                     isOpen={showReuploadModal}
//                     toggle={() => setShowReuploadModal(false)}
//                     size="lg"
//                     centered
//                     backdrop="static"
//                 >
//                     <ModalHeader
//                         toggle={() => {
//                             setShowReuploadModal(false);
//                             setReuploadDocument(null);
//                             setNewDocumentFile(null);
//                             setNewDocumentPreview(null);
//                             setReuploadOldDocPreview(null);
//                         }}
//                         className="d-flex align-items-center bg-primary text-white"
//                     >
//                         <span className="align-items-center bg-primary text-white">Re-upload Document</span>
//                     </ModalHeader>

//                     <ModalBody>
//                         {reuploadDocument && (
//                             <Row className="g-3">
//                                 <Col md={6}>
//                                     <h5>Previous Version</h5>
//                                     <div className="d-flex alignItems-center mb-3">
//                                         <div className="flex-shrink-0 me-3">
//                                             {getFileIcon(reuploadDocument.name)}
//                                         </div>
//                                         <div>
//                                             <p className="mb-1">{reuploadDocument.name}</p>
//                                             <small className="text-muted">Uploaded on: {reuploadDocument.createdAt}</small>
//                                         </div>
//                                     </div>
//                                     <Card style={{ height: '400px' }}>
//                                         <CardBody className="p-0 preview-container">
//                                             {reuploadFileLoading ? (
//                                                 <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
//                                                     <Spinner color="primary" />
//                                                     <p className="mt-2">Loading document...</p>
//                                                 </div>
//                                             ) : reuploadOldDocPreview ? (
//                                                 <div className="h-100">
//                                                     {reuploadOldDocPreview.type.includes('pdf') ? (
//                                                         <iframe
//                                                             src={`${reuploadOldDocPreview.url}#toolbar=0&navpanes=0&scrollbar=0`}
//                                                             title="PDF Viewer"
//                                                             className="w-100 h-100"
//                                                             style={{ border: 'none' }}
//                                                         />
//                                                     ) : reuploadOldDocPreview.type.includes('image') ? (
//                                                         <div className="text-center p-3 h-100 d-flex alignItems-center justify-content-center">
//                                                             <img
//                                                                 src={reuploadOldDocPreview.url}
//                                                                 alt="Previous version"
//                                                                 className="img-fluid"
//                                                                 style={{ maxHeight: '100%' }}
//                                                             />
//                                                         </div>
//                                                     ) : (
//                                                         <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
//                                                             <i className="ri-file-line display-4 text-muted"></i>
//                                                             <p>Preview not available</p>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
//                                                     <i className="ri-file-line display-4 text-muted"></i>
//                                                     <p>Preview not available</p>
//                                                 </div>
//                                             )}
//                                         </CardBody>
//                                     </Card>
//                                 </Col>

//                                 <Col md={6}>
//                                     <h5>Upload New Version</h5>
//                                     <FormGroup>
//                                         <Label for="documentReupload">Select new file</Label>
//                                         <Input
//                                             type="file"
//                                             id="documentReupload"
//                                             onChange={(e) => {
//                                                 const file = e.target.files[0];
//                                                 if (file) {
//                                                     setNewDocumentFile(file);
//                                                     if (file.type === 'application/pdf') {
//                                                         setNewDocumentPreview({
//                                                             type: 'pdf',
//                                                             url: URL.createObjectURL(file)
//                                                         });
//                                                     } else if (file.type.startsWith('image/')) {
//                                                         setNewDocumentPreview({
//                                                             type: file.type.split('/')[1],
//                                                             url: URL.createObjectURL(file)
//                                                         });
//                                                     } else {
//                                                         setNewDocumentPreview(null);
//                                                     }
//                                                 }
//                                             }}
//                                         />
//                                     </FormGroup>

//                                     <FormGroup>
//                                         <Label for="changeReason">Change Reason</Label>
//                                         <Input
//                                             type="text"
//                                             id="changeReason"
//                                             value={changeReason}
//                                             onChange={(e) => setChangeReason(e.target.value)}
//                                             placeholder="Enter reason for re-upload"
//                                             required
//                                         />
//                                     </FormGroup>

//                                     {newDocumentPreview ? (
//                                         <div className="mt-3">
//                                             <h6>New Version Preview</h6>
//                                             <Card style={{ height: '400px' }}>
//                                                 <CardBody className="p-0 preview-container">
//                                                     {newDocumentPreview.type === 'pdf' ? (
//                                                         <iframe
//                                                             src={`${newDocumentPreview.url}#toolbar=0&navpanes=0&scrollbar=0`}
//                                                             title="PDF Viewer"
//                                                             className="w-100 h-100"
//                                                             style={{ border: 'none' }}
//                                                         />
//                                                     ) : ['jpeg', 'jpg', 'png', 'gif'].includes(newDocumentPreview.type) ? (
//                                                         <div className="text-center p-3 h-100 d-flex alignItems-center justify-content-center">
//                                                             <img
//                                                                 src={newDocumentPreview.url}
//                                                                 alt="New version preview"
//                                                                 className="img-fluid"
//                                                                 style={{ maxHeight: '100%' }}
//                                                             />
//                                                         </div>
//                                                     ) : (
//                                                         <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
//                                                             <i className="ri-file-line display-4 text-muted"></i>
//                                                             <p>Preview not available</p>
//                                                         </div>
//                                                     )}
//                                                 </CardBody>
//                                             </Card>
//                                         </div>
//                                     ) : (
//                                         <div className="mt-3 text-center py-5 border rounded" style={{ height: '400px' }}>
//                                             <i className="ri-file-upload-line display-4 text-muted"></i>
//                                             <p className="mt-2 text-muted">Select a file to preview the new version</p>
//                                         </div>
//                                     )}
//                                 </Col>
//                             </Row>
//                         )}
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button color="secondary" onClick={() => {
//                             setShowReuploadModal(false);
//                             setReuploadDocument(null);
//                             setNewDocumentFile(null);
//                             setNewDocumentPreview(null);
//                             setReuploadOldDocPreview(null);
//                         }}>
//                             Cancel
//                         </Button>
//                         <Button
//                             color="primary"
//                             onClick={handleReuploadSubmit}
//                             disabled={!newDocumentFile || uploadLoading || !changeReason}
//                         >
//                             {uploadLoading ? (
//                                 <>
//                                     <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
//                                     Re-uploading...
//                                 </>
//                             ) : (
//                                 'Submit Re-upload'
//                             )}
//                         </Button>
//                     </ModalFooter>
//                 </Modal>

//             </Container>
//         </div>
//     );
// };

// export default DocumentManagement;













































import React, { useState, useEffect, useRef } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label,
    Modal, Input, FormGroup, Form, FormText, Alert, Badge, ListGroup, ListGroupItem, Spinner
} from 'reactstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getDocumentDropdowns, postDocumentManualUpload, qcReviewed, view, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import '../AddDocuments/AddDocuments.css';
import axios from 'axios';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const MAX_TOTAL_DOCUMENTS = 5; // Maximum number of documents allowed

const VIEW_DOCUMENT_URL = "http://192.168.23.229:9000/backend-service/documentUpload/documentView";

const DocumentManagement = () => {
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');

    // Filter states
    const [zone, setZone] = useState('');
    const [circle, setCircle] = useState('');
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [section, setSection] = useState('');
    const [userName, setUserName] = useState("");
    const [zoneOptions, setZoneOptions] = useState([]);
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionOptions, setDivisionOptions] = useState([]);
    const [subDivisionOptions, setSubDivisionOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [account_id, setAccountId] = useState('');
    const [accountSearchInput, setAccountSearchInput] = useState('');
    const [accountSuggestions, setAccountSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [documentCategory, setDocumentCategory] = useState([]);
    const [roles, setRoles] = useState([]);
    const [documentCounts, setDocumentCounts] = useState({
        approved: 0,
        pending: 0,
        rejected: 0
    });

    // *** MODIFIED STATES ***
    const [approvedModalOpen, setApprovedModalOpen] = useState(false);
    const [rejectedModalOpen, setRejectedModalOpen] = useState(false);
    const [pendingCountModalOpen, setPendingCountModalOpen] = useState(false);

    const [approvedDocuments, setApprovedDocuments] = useState([]);
    const [rejectedDocuments, setRejectedDocuments] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedRejectedFile, setSelectedRejectedFile] = useState(null);
    
    // *** MODIFIED: Individual document uploads ***
    const [documentUploads, setDocumentUploads] = useState([
        { id: 1, file: null, previewUrl: null, name: '', description: '' }
    ]);
    const [showAddMoreModal, setShowAddMoreModal] = useState(false);
    const [showAddAnotherButton, setShowAddAnotherButton] = useState(false); // NEW: Control add another button visibility

    const [previewContent, setPreviewContent] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [selectedConsumer, setSelectedConsumer] = useState(null);
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadDocument, setReuploadDocument] = useState(null);
    const [newDocumentFile, setNewDocumentFile] = useState(null);
    const [newDocumentPreview, setNewDocumentPreview] = useState(null);
    const [reuploadFileLoading, setReuploadFileLoading] = useState(false);
    const [reuploadOldDocPreview, setReuploadOldDocPreview] = useState(null);
    const [changeReason, setChangeReason] = useState('');

    // User level and access info
    const [userLevel, setUserLevel] = useState('');
    const [userAccessData, setUserAccessData] = useState([]);

    // Display values for disabled fields
    const [displayZone, setDisplayZone] = useState('');
    const [displayCircle, setDisplayCircle] = useState('');
    const [displayDivision, setDisplayDivision] = useState('');
    const [displaySubDivision, setDisplaySubDivision] = useState('');
    const [displaySection, setDisplaySection] = useState('');

    document.title = `Document Upload | DMS`;

    // *** MODIFIED: Handle individual file upload ***
    const handleFileUpload = (documentId, e) => {
        const file = e.currentTarget.files[0];
        if (!file) return;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setResponse(`File ${file.name} exceeds 2MB size limit`);
            setErrorModal(true);
            return;
        }

        // Check file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setResponse(`File ${file.name} must be PDF, JPG, or PNG`);
            setErrorModal(true);
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        
        setDocumentUploads(prev => prev.map(doc => 
            doc.id === documentId 
                ? { ...doc, file, previewUrl, name: file.name }
                : doc
        ));

        // Update formik validation - FIXED: Clear the validation error when files are uploaded
        const allFiles = documentUploads.map(doc => 
            doc.id === documentId ? file : doc.file
        ).filter(file => file !== null);
        
        formik.setFieldValue('mannualFile', allFiles);
        formik.setFieldTouched('mannualFile', true, false); // Set touched without validation

        // Show add more modal if this is not the last document and we haven't reached max
        if (documentUploads.length < MAX_TOTAL_DOCUMENTS && documentUploads.filter(doc => doc.file).length === 0) {
            // Only show modal for the first document upload
            setTimeout(() => {
                setShowAddMoreModal(true);
            }, 500);
        } else {
            // For subsequent uploads or when max reached, show the add another button
            setShowAddAnotherButton(documentUploads.length < MAX_TOTAL_DOCUMENTS);
        }
    };

    // *** MODIFIED: Handle adding another document ***
    const handleAddAnotherDocument = () => {
        if (documentUploads.length >= MAX_TOTAL_DOCUMENTS) {
            setResponse(`Maximum ${MAX_TOTAL_DOCUMENTS} documents allowed`);
            setErrorModal(true);
            return;
        }

        const newDocumentId = Math.max(...documentUploads.map(doc => doc.id)) + 1;
        setDocumentUploads(prev => [
            ...prev,
            { id: newDocumentId, file: null, previewUrl: null, name: '', description: '' }
        ]);
        setShowAddMoreModal(false);
        setShowAddAnotherButton(false); // Hide button after adding new document slot
    };

    // *** MODIFIED: Handle skipping additional document ***
    const handleSkipAdditionalDocument = () => {
        setShowAddMoreModal(false);
        setShowAddAnotherButton(true); // Show the manual add button
    };

    // *** MODIFIED: Remove individual document ***
    const handleRemoveDocument = (documentId) => {
        setDocumentUploads(prev => {
            const updatedDocs = prev.filter(doc => doc.id !== documentId);
            
            // Revoke object URL to prevent memory leaks
            const removedDoc = prev.find(doc => doc.id === documentId);
            if (removedDoc && removedDoc.previewUrl) {
                URL.revokeObjectURL(removedDoc.previewUrl);
            }
            
            // Update formik value
            const allFiles = updatedDocs.map(doc => doc.file).filter(file => file !== null);
            formik.setFieldValue('mannualFile', allFiles);
            
            // Update add another button visibility
            setShowAddAnotherButton(updatedDocs.length < MAX_TOTAL_DOCUMENTS && updatedDocs.some(doc => doc.file));
            
            return updatedDocs;
        });
    };

    // *** MODIFIED: Clear all documents ***
    const handleClearAllDocuments = () => {
        // Revoke all object URLs to prevent memory leaks
        documentUploads.forEach(doc => {
            if (doc.previewUrl) {
                URL.revokeObjectURL(doc.previewUrl);
            }
        });
        
        setDocumentUploads([{ id: 1, file: null, previewUrl: null, name: '', description: '' }]);
        formik.setFieldValue('mannualFile', []);
        setShowAddAnotherButton(false);
        setShowAddMoreModal(false);
    };

    // *** MODIFIED: Manual add another document ***
    const handleManualAddAnother = () => {
        if (documentUploads.length >= MAX_TOTAL_DOCUMENTS) {
            setResponse(`Maximum ${MAX_TOTAL_DOCUMENTS} documents allowed`);
            setErrorModal(true);
            return;
        }

        const newDocumentId = Math.max(...documentUploads.map(doc => doc.id)) + 1;
        setDocumentUploads(prev => [
            ...prev,
            { id: newDocumentId, file: null, previewUrl: null, name: '', description: '' }
        ]);
        setShowAddAnotherButton(false); // Hide button after adding new document slot
    };

    // *** MODIFIED: Validation Schema - Fixed validation logic ***
    const documentSchema = Yup.object().shape({
        docName: Yup.string().required('Document name is required'),
        selectedCategory: Yup.string().required('Please select a document category'),
        description: Yup.string().required('Description is required'),
        metaTags: Yup.string().required('Meta tags are required'),
        mannualFile: Yup.array()
            .min(1, 'At least one document file is required')
            .test('fileSize', 'Each file must be less than 2MB', (files) => {
                return !files || files.every(file => file && file.size <= MAX_FILE_SIZE);
            })
            .test('fileType', 'Unsupported file format', (files) => {
                return !files || files.every(file => 
                    file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
                );
            })
            .test('maxFiles', `Maximum ${MAX_TOTAL_DOCUMENTS} documents allowed`, (files) => {
                return !files || files.length <= MAX_TOTAL_DOCUMENTS;
            }),
    });

    const handleReuploadSubmit = async () => {
        if (!newDocumentFile || !reuploadDocument || !changeReason) {
            setResponse('Please provide all required fields');
            setErrorModal(true);
            return;
        }

        try {
            setUploadLoading(true);
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const userName = authUser?.user?.Email || 'Admin';

            const formData = new FormData();

            const accountId = reuploadDocument.Account_Id || account_id || accountSearchInput;
            if (!accountId) {
                setResponse('Account ID is required for re-upload');
                setErrorModal(true);
                return;
            }

            formData.append('Account_Id', accountId);
            formData.append('mannualFile', newDocumentFile);
            formData.append('DocumentName', reuploadDocument.DocumentName || reuploadDocument.name || 'Reuploaded Document');
            formData.append('DocumentDescription', reuploadDocument.DocumentDescription || reuploadDocument.description || 'Reuploaded after rejection');
            formData.append('MetaTags', reuploadDocument.MetaTags || reuploadDocument.metaTags || 'reupload,document');
            formData.append('CreatedByUser_Id', userId);
            formData.append('CreatedByUserName', userName);
            formData.append('Category_Id', reuploadDocument.Category_Id || reuploadDocument.category || '1');
            formData.append('Status_Id', '1');
            formData.append('div_code', reuploadDocument.div_code || authUser?.user?.zones?.[0]?.div_code || '43005');
            formData.append('sd_code', reuploadDocument.sd_code || authUser?.user?.zones?.[0]?.sd_code || 'AURAD');
            formData.append('so_code', reuploadDocument.so_code || authUser?.user?.zones?.[0]?.so_code || 'CHINTAKI');
            formData.append('Role_Id', '1');
            formData.append('ChangeReason', changeReason);

            const response = await postDocumentManualUpload(formData);

            if (response?.status === 'success') {
                setResponse(response.message || 'Document re-uploaded successfully!');
                setSuccessModal(true);
                await fetchRejectedDocuments();
                await fetchDocumentCounts();
            } else {
                setResponse(response?.message || 'Failed to re-upload document');
                setErrorModal(true);
            }
        } catch (error) {
            console.error('Re-upload failed:', error);
            setResponse(error.response?.data?.message ||
                error.message ||
                'Error re-uploading document. Please try again.');
            setErrorModal(true);
        } finally {
            setUploadLoading(false);
            setShowReuploadModal(false);
            setReuploadDocument(null);
            setNewDocumentFile(null);
            setNewDocumentPreview(null);
            setReuploadOldDocPreview(null);
            setChangeReason('');
        }
    }

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

        if (userLevel === 'zone') {
            fetchZones(usernm);
        }

        if (userLevel === 'zone' && userAccessData[0]?.zone_code) {
            fetchCircles(usernm, userAccessData[0].zone_code);
        } else if (userLevel === 'circle' && userAccessData[0]?.circle_code) {
            setCircle(userAccessData[0].circle_code);
            fetchDivisions(usernm, userAccessData[0].circle_code);
        } else if (userLevel === 'division' && userAccessData[0]?.div_code) {
            setDivision(userAccessData[0].div_code);
            fetchSubDivisions(usernm, userAccessData[0].div_code);
        } else if (userLevel === 'subdivision' && userAccessData[0]?.sd_code) {
            setSubDivision(userAccessData[0].sd_code);
            fetchSections(usernm, userAccessData[0].sd_code);
        } else if (userLevel === 'section' && userAccessData[0]?.so_code) {
            setSection(userAccessData[0].so_code);
        }

        fetchRoles(usernm);
        fetchDocumentCategories(usernm);
        fetchDocumentCounts();
    }, [userLevel, userAccessData]);

    // API functions for dropdowns (unchanged)
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

    const fetchRoles = async (username) => {
        try {
            const params = {
                flagId: 6,
                requestUserName: username
            };
            const response = await getDocumentDropdowns(params);
            if (response?.status === 'success') {
                setRoles(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchDocumentCategories = async (username) => {
        try {
            const params = {
                flagId: 7,
                requestUserName: username
            };
            const response = await getDocumentDropdowns(params);
            if (response?.status === 'success') {
                setDocumentCategory(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching document categories:', error);
        }
    };

    // Handle zone change (unchanged)
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

    // Handle circle change (unchanged)
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

    // Handle division change (unchanged)
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

    // Handle sub division change (unchanged)
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

    // Handle section change (unchanged)
    const handleSectionChange = (e) => {
        const selectedSection = e.target.value;
        const selectedSectionObj = sectionOptions.find(s => s.so_code === selectedSection);
        setSection(selectedSection);
        setDisplaySection(selectedSectionObj ? selectedSectionObj.section_office : selectedSection);
    };

    const handleApprovedClick = () => {
        setSelectedFile(null);
        setSelectedRejectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setApprovedModalOpen(true);
        fetchApprovedDocuments();
        fetchDocumentCounts();
    };

    const handleRejectedClick = () => {
        setSelectedFile(null);
        setSelectedRejectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setRejectedModalOpen(true);
        fetchRejectedDocuments();
        fetchDocumentCounts();
    };

    const handlePendingClick = () => {
        fetchDocumentCounts();
        setPendingCountModalOpen(true);
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <i className="ri-file-line fs-4 text-secondary"></i>;
        const extension = fileName.split('.').pop().toLowerCase();
        if (extension === 'pdf') return <i className="ri-file-pdf-line fs-4 text-danger"></i>;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <i className="ri-image-line fs-4 text-success"></i>;
        if (['doc', 'docx'].includes(extension)) return <i className="ri-file-word-line fs-4 text-primary"></i>;
        if (['xls', 'xlsx'].includes(extension)) return <i className="ri-file-excel-line fs-4 text-success"></i>;
        return <i className="ri-file-line fs-4 text-secondary"></i>;
    };

    const fetchDocumentCounts = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const so_code = authUser?.user?.zones?.[0]?.so_code || '';

            const approvedParams = {
                flagId: 1,
                User_Id: userId,
                so_code: so_code
            };
            const rejectedParams = {
                flagId: 3,
                User_Id: userId,
                so_code: so_code
            };
            const pendingParams = {
                flagId: 5,
                User_Id: userId,
                so_code: so_code
            };

            const [approvedResponse, rejectedResponse, pendingResponse] = await Promise.all([
                qcReviewed(approvedParams),
                qcReviewed(rejectedParams),
                qcReviewed(pendingParams)
            ]);

            setDocumentCounts({
                approved: approvedResponse?.results?.[0]?.ApprovedCount || 0,
                pending: pendingResponse?.results?.[0]?.PendingDocsCount || 0,
                rejected: rejectedResponse?.results?.[0]?.RejectedCount || 0
            });

        } catch (error) {
            console.error("Error fetching document counts:", error);
        }
    };

    const fetchApprovedDocuments = async () => {
        try {
            setLoading(true);
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const so_code = authUser?.user?.zones?.[0]?.so_code || '';

            const params = {
                flagId: 2,
                User_Id: userId,
                so_code: so_code
            };

            const response = await qcReviewed(params);

            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId + '_' + doc.Version_Id,
                    DocumentId: doc.DocumentId,
                    Version_Id: doc.Version_Id,
                    name: doc.DocumentName,
                    type: getFileTypeFromPath(doc.FilePath),
                    category: doc.CategoryName,
                    createdAt: new Date(doc.ApprovedOn).toLocaleDateString(),
                    createdBy: doc.ApprovedbyUserName,
                    description: doc.ApprovalComment,
                    status: doc.VersionStatusName,
                    FilePath: doc.FilePath,
                    division: doc.division_name,
                    sub_division: doc.subdivision_name,
                    section: doc.section_name,
                    rr_no: doc.rr_no,
                    consumer_name: doc.consumer_name,
                    consumer_address: doc.consumer_address,
                    versionLabel: doc.VersionLabel || '1.0',
                    isLatest: doc.IsLatest || true
                }));

                setApprovedDocuments(transformedDocuments);
            } else {
                setApprovedDocuments([]);
                setDocumentCounts(prev => ({ ...prev, approved: 0 }));
            }
        } catch (error) {
            console.error("Error fetching approved documents:", error);
            setApprovedDocuments([]);
            setResponse('Error fetching approved documents');
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchRejectedDocuments = async () => {
        try {
            setLoading(true);
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const so_code = authUser?.user?.zones?.[0]?.so_code || '';

            const params = {
                flagId: 4,
                User_Id: userId,
                so_code: so_code
            };

            const response = await qcReviewed(params);

            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId + '_' + doc.Version_Id,
                    DocumentId: doc.DocumentId,
                    Version_Id: doc.Version_Id,
                    name: doc.DocumentName || `Document_${doc.DocumentId}`,
                    type: getFileTypeFromPath(doc.FilePath),
                    category: doc.CategoryName || getDocumentTypeFromPath(doc.FilePath),
                    createdAt: new Date(doc.RejectedOn).toLocaleDateString(),
                    createdBy: doc.RejectedBy,
                    description: doc.RejectionComment,
                    status: doc.VersionStatusName,
                    FilePath: doc.FilePath,
                    division: doc.division_name,
                    sub_division: doc.subdivision_name,
                    section: doc.section_name,
                    rr_no: doc.rr_no,
                    consumer_name: doc.consumer_name,
                    consumer_address: doc.consumer_address,
                    Rejection_Id: doc.Rejection_Id,
                    RejectionComment: doc.RejectionComment,
                    versionLabel: doc.VersionLabel || '1.0',
                    isLatest: doc.IsLatest || true,
                    Account_Id: doc.Account_Id,
                    DocumentName: doc.DocumentName,
                    DocumentDescription: doc.DocumentDescription,
                    MetaTags: doc.MetaTags,
                    Category_Id: doc.Category_Id,
                    div_code: doc.div_code,
                    sd_code: doc.sd_code,
                    so_code: doc.so_code
                }));
                setRejectedDocuments(transformedDocuments);
            } else {
                setRejectedDocuments([]);
            }
        } catch (error) {
            console.error("Error fetching rejected documents:", error);
            setRejectedDocuments([]);
            setResponse('Error fetching rejected documents');
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const getFileTypeFromPath = (filePath) => {
        if (!filePath) return 'application/octet-stream';
        const extension = filePath.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return 'application/pdf';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'doc': return 'application/msword';
            case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls': return 'application/vnd.ms-excel';
            case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            default: return 'application/octet-stream';
        }
    };

    const getDocumentTypeFromPath = (filePath) => {
        if (!filePath) return 'Additional Document';
        const fileName = filePath.split('\\').pop().toLowerCase();
        if (fileName.includes('id') || fileName.includes('proof')) return 'ID Proof';
        if (fileName.includes('ownership')) return 'Ownership Proof';
        if (fileName.includes('khata')) return 'Khata Certificate';
        if (fileName.includes('power')) return 'Power Agreement';
        if (fileName.includes('site')) return 'Site Sketch';
        return 'Additional Document';
    };

    // handleFileSelect, handleDownload, handleRejectedFileSelect, handleReuploadClick functions remain unchanged
    const handleFileSelect = async (file) => {
        console.log('📄 File selected:', file);
        console.log('🔑 Version_Id to be sent:', file.Version_Id);

        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);

        try {
            if (!file.Version_Id) {
                throw new Error("Version_Id is required for document preview");
            }

            const requestPayload = {
                flagId: 2,
                Version_Id: file.Version_Id,
                requestUserName: userName,
            };

            console.log('🚀 API Request Payload:', requestPayload);

            const response = await axios.post(
                VIEW_DOCUMENT_URL,
                requestPayload,
                { responseType: "blob" }
            );

            const receivedBlob = response;

            if (!(receivedBlob instanceof Blob)) {
                console.error('❌ Response data was not a Blob.', receivedBlob);
                throw new Error("Received invalid file data from server.");
            }

            console.log('📦 Received Blob. Type:', receivedBlob.type, 'Size:', receivedBlob.size);

            if (receivedBlob.size === 0) {
                throw new Error("Received empty file data (0 bytes).");
            }

            let blobToView;

            if (receivedBlob.type === 'application/json') {
                console.error('❌ Server returned an error as a JSON blob. Reading error...');
                const errorText = await receivedBlob.text();
                let errorMessage;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || "Server returned an error.";
                } catch (e) {
                    errorMessage = errorText || "Failed to load document: Unknown server error.";
                }
                console.error('Error content:', errorText);
                throw new Error(errorMessage);
            }

            if (receivedBlob.type !== 'application/pdf') {
                console.warn(`⚠️ Blob type is '${receivedBlob.type}'. Forcing 'application/pdf'.`);
                blobToView = new Blob([receivedBlob], { type: 'application/pdf' });
            } else {
                blobToView = receivedBlob;
            }

            const fileUrl = URL.createObjectURL(blobToView);
            console.log('🔗 Object URL created:', fileUrl.substring(0, 50) + '...');

            setPreviewContent({
                url: fileUrl,
                type: 'application/pdf',
                name: file.name,
                blob: blobToView
            });

            console.log('✅ Preview content set successfully');

        } catch (error) {
            console.error("❌ Preview error:", error);
            let errorMessage = error.message;
            if (error.response && error.response.data) {
                if (error.response.data instanceof Blob) {
                    try {
                        const errorText = await error.response.data.text();
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || "Server error";
                    } catch (e) {
                        errorMessage = "Failed to load document (unreadable error response).";
                    }
                }
            }

            setPreviewError(errorMessage);
            setResponse(errorMessage);
            setErrorModal(true);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDownload = async (file) => {
        try {
            console.log('📥 Starting download for Version_Id:', file.Version_Id);

            if (!file.Version_Id) {
                throw new Error("Version_Id is required for download");
            }

            const requestPayload = {
                flagId: 2,
                Version_Id: file.Version_Id,
                requestUserName: userName,
            };

            console.log('🚀 Download API Request:', requestPayload);

            const response = await axios.post(
                VIEW_DOCUMENT_URL,
                requestPayload,
                { responseType: "blob" }
            );

            const receivedBlob = response;

            if (!(receivedBlob instanceof Blob)) {
                console.error('❌ Download response was not a Blob.', receivedBlob);
                throw new Error("Received invalid file data from server.");
            }

            console.log('📥 Download Blob. Type:', receivedBlob.type, 'Size:', receivedBlob.size);

            if (receivedBlob.size === 0) {
                throw new Error("Received empty file for download (0 bytes).");
            }

            if (receivedBlob.type === 'application/json') {
                console.error('❌ Server returned an error as a JSON blob. Reading error...');
                const errorText = await receivedBlob.text();
                let errorMessage;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || "Server returned an error.";
                } catch (e) {
                    errorMessage = errorText || "Failed to download: Unknown server error.";
                }
                console.error('Error content:', errorText);
                throw new Error(errorMessage);
            }

            let blobToDownload;

            if (receivedBlob.type !== 'application/pdf') {
                console.warn(`⚠️ Download: Blob type is '${receivedBlob.type}'. Forcing 'application/pdf'.`);
                blobToDownload = new Blob([receivedBlob], { type: 'application/pdf' });
            } else {
                blobToDownload = receivedBlob;
            }

            const url = URL.createObjectURL(blobToDownload);
            const link = document.createElement("a");
            link.href = url;

            const fileExtension = 'pdf';
            const fileName = `${file.name || 'document'}_v${file.versionLabel || file.Version_Id}.${fileExtension}`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);

            console.log('✅ Download completed successfully');

        } catch (err) {
            console.error("❌ Download failed:", err);
            let errorMessage = err.message;
            if (err.response && err.response.data && err.response.data instanceof Blob) {
                try {
                    const errorText = await err.response.data.text();
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || "Server error";
                } catch (e) {
                    errorMessage = "Failed to download (unreadable error response).";
                }
            }
            setResponse(errorMessage);
            setErrorModal(true);
        }
    };

    const handleRejectedFileSelect = async (file) => {
        setSelectedRejectedFile(file);
        setSelectedFile(file);
        await handleFileSelect(file);
    };

    const handleReuploadClick = async (doc) => {
        setReuploadDocument(doc);
        setSelectedRejectedFile(doc);
        setShowReuploadModal(true);
        setReuploadFileLoading(true);

        try {
            console.log('🔑 Reupload - Version_Id to be sent:', doc.Version_Id);

            if (!doc.Version_Id) {
                throw new Error("Version_Id is required for document preview");
            }

            const requestPayload = {
                flagId: 2,
                Version_Id: doc.Version_Id,
                requestUserName: userName,
            };

            const response = await axios.post(
                VIEW_DOCUMENT_URL,
                requestPayload,
                { responseType: "blob" }
            );

            const receivedBlob = response;

            if (!(receivedBlob instanceof Blob)) {
                throw new Error("Received invalid file data from server.");
            }

            if (receivedBlob.size === 0) {
                throw new Error("Received empty file data (0 bytes).");
            }

            let blobToView;

            if (receivedBlob.type === 'application/json') {
                const errorText = await receivedBlob.text();
                let errorMessage;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || "Server returned an error.";
                } catch (e) {
                    errorMessage = errorText || "Failed to load document: Unknown server error.";
                }
                throw new Error(errorMessage);
            }

            if (receivedBlob.type !== 'application/pdf') {
                blobToView = new Blob([receivedBlob], { type: 'application/pdf' });
            } else {
                blobToView = receivedBlob;
            }

            const fileUrl = URL.createObjectURL(blobToView);

            setReuploadOldDocPreview({
                url: fileUrl,
                type: 'application/pdf',
                name: doc.name
            });
        } catch (error) {
            console.error("Preview error:", error);
            setReuploadOldDocPreview(null);
            setResponse(error.message || "Failed to load document preview");
            setErrorModal(true);
        } finally {
            setReuploadFileLoading(false);
        }
    };

    // *** MODIFIED: Formik form setup for individual document uploads ***
    const formik = useFormik({
        initialValues: {
            docName: '',
            selectedCategory: '',
            selectedRole: '',
            description: '',
            metaTags: '',
            mannualFile: [],
        },
        validationSchema: documentSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            console.log("Formik values on submit:", values);
            try {
                setUploadLoading(true);
                const authUser = JSON.parse(sessionStorage.getItem("authUser"));
                const userId = authUser?.user?.User_Id;
                const userEmail = authUser?.user?.Email;
                const userDivCode = authUser?.user?.zones?.[0]?.div_code || '';
                const userSdCode = authUser?.user?.zones?.[0]?.sd_code || '';

                const formData = new FormData();
                formData.append('Account_Id', account_id || accountSearchInput);
                formData.append('DocumentName', values.docName.trim());
                formData.append('DocumentDescription', values.description.trim());
                formData.append('MetaTags', values.metaTags.trim());
                formData.append('CreatedByUser_Id', userId);
                formData.append('CreatedByUserName', userEmail);
                formData.append('Category_Id', values.selectedCategory);
                formData.append('Status_Id', '1');
                formData.append('div_code', userDivCode);
                formData.append('sd_code', userSdCode);

                // Append each file
                values.mannualFile.forEach((file, index) => {
                    formData.append(`mannualFile`, file);
                });

                if (section) formData.append('so_code', section);
                if (values.selectedRole) {
                    formData.append('Role_Id', values.selectedRole);
                }

                console.log("FormData being sent:", {
                    account_id: account_id || accountSearchInput,
                    DocumentName: values.docName.trim(),
                    DocumentDescription: values.description.trim(),
                    MetaTags: values.metaTags.trim(),
                    CreatedByUser_Id: userId,
                    CreatedByUserName: userEmail,
                    Category_Id: values.selectedCategory,
                    Status_Id: '1',
                    div_code: userDivCode,
                    sd_code: userSdCode,
                    so_code: section || '',
                    Role_Id: values.selectedRole || '',
                    fileCount: values.mannualFile.length
                });

                const response = await postDocumentManualUpload(formData);
                if (response?.status === 'success') {
                    const responseData = response?.message;
                    if (account_id) {
                        await handleSearch();
                    }
                    resetForm();
                    setModalOpen(false);
                    setResponse(responseData);
                    setSuccessModal(true);
                    await fetchDocumentCounts();
                } else {
                    setResponse(response?.message || 'Failed to upload documents');
                    setErrorModal(true);
                }
            } catch (error) {
                console.error('Error uploading documents:', error);
                setResponse('Error uploading documents. Please try again.');
                setErrorModal(true);
            } finally {
                setUploadLoading(false);
            }
        }
    });

    // *** MODIFIED: Reset form to clear all documents ***
    const resetForm = () => {
        formik.resetForm();
        setCurrentDocument(null);
        setEditMode(false);
        
        // Clear all uploaded documents and revoke URLs
        handleClearAllDocuments();
        
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (input) input.value = '';
        });
        setPreviewContent(null);
        setShowAddMoreModal(false);
        setShowAddAnotherButton(false);
    };

    const handleEdit = (document) => {
        formik.setValues({
            docName: document.name,
            selectedCategory: document.category,
            description: document.description || '',
            metaTags: document.metaTags || '',
            selectedRole: document.role || '',
            mannualFile: [],
        });
        setCurrentDocument(document);
        setEditMode(true);
        setModalOpen(true);
    };

    // Account search and other functions remain unchanged
    const debounceRef = useRef();

    const handleAccountSearchChange = (e) => {
        const value = e.target.value;
        setAccountSearchInput(value);
        setAccountSuggestions([]);
        setAccountId('');
        setLoading(false);
        setShowSuggestions(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.length >= 5) {
            debounceRef.current = setTimeout(async () => {
                try {
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
        setAccountId(accId);
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

            const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
            const sectionName = selectedSectionObj ? selectedSectionObj.section_office : displaySection;

            if (!sectionName) {
                setResponse('Please select a section first');
                setErrorModal(true);
                return;
            }

            setLoading(true);
            const params = {
                flagId: 5,
                account_id: account_id,
                section: sectionName
            };
            const response = await getDocumentDropdowns(params);

            if (response?.status === "success" && response?.data?.length > 0) {
                setSearchResults(response.data);
                setHasSearched(true);
                setResponse(response.message || 'Consumer details found successfully');
                setSuccessModal(true);
            } else {
                setSearchResults([]);
                setResponse(response?.message || 'No consumer found with this account ID');
                setErrorModal(true);
            }
        } catch (error) {
            console.error('Error on submit:', error.message);
            setResponse('Error fetching consumer details');
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
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
                fetchDivisions(userName, userData.circle_code);
            } else if (userLevel === 'division') {
                setDivision(userData.div_code || '');
                setDisplayDivision(userData.division || userData.div_code);
                setSubDivision('');
                setDisplaySubDivision('');
                setSection('');
                setDisplaySection('');
                fetchSubDivisions(userName, userData.div_code);
            } else if (userLevel === 'subdivision') {
                setSubDivision(userData.sd_code || '');
                setDisplaySubDivision(userData.sub_division || userData.sd_code);
                setSection('');
                setDisplaySection('');
                fetchSections(userName, userData.sd_code);
            } else if (userLevel === 'section') {
                setSection(userData.so_code || '');
                setDisplaySection(userData.section_office || userData.so_code);
            }
        }

        setAccountId('');
        setAccountSearchInput('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleAddDocument = () => {
        resetForm();
        setModalOpen(true);
    };

    const renderTableRows = () => {
        if (!hasSearched) {
            return (
                <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                        Enter an account ID and click Search
                    </td>
                </tr>
            );
        }

        if (searchResults.length === 0) {
            return (
                <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                        No consumer found with this account ID
                    </td>
                </tr>
            );
        }

        return searchResults.map((row, rowIndex) => (
            <tr key={rowIndex}>
                <td>{row.consumer_name || '-'}</td>
                <td>{row.rr_no || '-'}</td>
                <td>{row.account_id || '-'}</td>
                <td>{row.consumer_address || '-'}</td>
                <td>{row.phone || '-'}</td>
            </tr>
        ));
    };

    const isFieldDisabled = (fieldLevel) => {
        const levelHierarchy = ['zone', 'circle', 'division', 'subdivision', 'section'];
        const userLevelIndex = levelHierarchy.indexOf(userLevel);
        const fieldLevelIndex = levelHierarchy.indexOf(fieldLevel);

        return userLevelIndex >= fieldLevelIndex;
    };

    return (
        <div className="page-content">
            <BreadCrumb title="Document Manual Upload" pageTitle="DMS" />
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

                {/* Add More Documents Confirmation Modal */}
                <Modal
                    isOpen={showAddMoreModal}
                    toggle={() => setShowAddMoreModal(false)}
                    centered
                >
                    <ModalHeader toggle={() => setShowAddMoreModal(false)}>
                        Add Another Document?
                    </ModalHeader>
                    <ModalBody>
                        <p>Do you want to upload another document?</p>
                        <small className="text-muted">
                            You can upload up to {MAX_TOTAL_DOCUMENTS} documents total.
                        </small>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={handleSkipAdditionalDocument}>
                            No, Continue
                        </Button>
                        <Button color="primary" onClick={handleAddAnotherDocument}>
                            Yes, Add Another
                        </Button>
                    </ModalFooter>
                </Modal>

                <Modal
                    isOpen={pendingCountModalOpen}
                    toggle={() => setPendingCountModalOpen(false)}
                    centered
                >
                    <ModalHeader
                        className="bg-primary text-white p-3"
                        toggle={() => setPendingCountModalOpen(false)}
                    >
                        <span className="modal-title text-white">Pending Documents</span>
                    </ModalHeader>
                    <ModalBody className="text-center p-4">
                        <h4>
                            You have <Badge color="warning" pill className="fs-5 px-3 py-2">{documentCounts.pending}</Badge> pending document(s).
                        </h4>
                        <p className="text-muted">These documents are awaiting review.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => setPendingCountModalOpen(false)}>
                            OK
                        </Button>
                    </ModalFooter>
                </Modal>

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardHeader className="bg-primary text-white p-3">
                                <Row className="g-4 alignItems-center">
                                    <Col className="d-flex alignItems-center">
                                        <h4 className="mb-0 card-title text-white">Document Management</h4>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Row className="g-4 mb-3">
                                    <Col sm={12}>
                                        <Row>
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

                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Enter Account ID (min 5 chars)<span className="text-danger">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        value={accountSearchInput}
                                                        onChange={handleAccountSearchChange}
                                                        placeholder="Enter Account ID"
                                                    />
                                                    {showSuggestions && (
                                                        <ul style={{ border: '1px solid #ccc', marginTop: '5px', padding: '5px', listStyle: 'none' }}>
                                                            {loading ? (
                                                                <li style={{ color: 'blue', fontStyle: 'italic' }}>Loading...</li>
                                                            ) : accountSuggestions.length > 0 ? (
                                                                accountSuggestions.map(acc => (
                                                                    <li
                                                                        key={acc.account_id}
                                                                        style={{ cursor: 'pointer', padding: '2px 0' }}
                                                                        onClick={() => handleAccountSuggestionClick(acc.account_id)}
                                                                    >
                                                                        {acc.account_id}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li style={{ color: 'red', fontStyle: 'italic' }}>No Data Found</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className="mb-4">
                                    <Col sm={12}>
                                        <div className="d-flex justify-content-between alignItems-center">
                                            <div className="d-flex flex-wrap gap-3">
                                                <Button
                                                    outline
                                                    color="warning"
                                                    className="px-3 py-2"
                                                    style={{
                                                        borderRadius: '8px',
                                                        borderWidth: '2px',
                                                        transition: 'all 0.25s ease',
                                                        minWidth: '140px',
                                                        backgroundColor: 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#ffc107',
                                                        borderColor: '#ffc107'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.5)';
                                                        e.currentTarget.style.color = 'rgba(255, 193, 7, 0.8)';
                                                        e.currentTarget.querySelector('i').style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#ffc107';
                                                        e.currentTarget.style.color = '#ffc107';
                                                        e.currentTarget.querySelector('i').style.transform = 'scale(1)';
                                                    }}
                                                    onClick={handlePendingClick}
                                                >
                                                    <i
                                                        className="ri-time-line"
                                                        style={{
                                                            transition: 'transform 0.2s ease',
                                                            fontSize: '1.1rem'
                                                        }}
                                                    ></i>
                                                    <span>Pending</span>
                                                    <span
                                                        className="rounded-pill px-2"
                                                        style={{
                                                            marginLeft: 'auto',
                                                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                            color: '#ffc107',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.25s ease'
                                                        }}
                                                    >
                                                        {documentCounts.pending}
                                                    </span>
                                                </Button>

                                                <Button
                                                    outline
                                                    color="success"
                                                    className="px-3 py-2"
                                                    style={{
                                                        borderRadius: '8px',
                                                        borderWidth: '2px',
                                                        transition: 'all 0.25s ease',
                                                        minWidth: '140px',
                                                        backgroundColor: 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#28a745',
                                                        borderColor: '#28a745'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.5)';
                                                        e.currentTarget.style.color = 'rgba(40, 167, 69, 0.8)';
                                                        e.currentTarget.querySelector('i').style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#28a745';
                                                        e.currentTarget.style.color = '#28a745';
                                                        e.currentTarget.querySelector('i').style.transform = 'scale(1)';
                                                    }}
                                                    onClick={handleApprovedClick}
                                                >
                                                    <i
                                                        className="ri-checkbox-circle-line"
                                                        style={{
                                                            transition: 'transform 0.2s ease',
                                                            fontSize: '1.1rem'
                                                        }}
                                                    ></i>
                                                    <span>Approved</span>
                                                    <span
                                                        className="rounded-pill px-2"
                                                        style={{
                                                            marginLeft: 'auto',
                                                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                                            color: '#28a745',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.25s ease'
                                                        }}
                                                    >
                                                        {documentCounts.approved}
                                                    </span>
                                                </Button>

                                                <Button
                                                    outline
                                                    color="danger"
                                                    className="px-3 py-2"
                                                    style={{
                                                        borderRadius: '8px',
                                                        borderWidth: '2px',
                                                        transition: 'all 0.25s ease',
                                                        minWidth: '140px',
                                                        backgroundColor: 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#dc3545',
                                                        borderColor: '#dc3545'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(220, 53, 69, 0.5)';
                                                        e.currentTarget.style.color = 'rgba(220, 53, 69, 0.8)';
                                                        e.currentTarget.querySelector('i').style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#dc3545';
                                                        e.currentTarget.style.color = '#dc3545';
                                                        e.currentTarget.querySelector('i').style.transform = 'scale(1)';
                                                    }}
                                                    onClick={handleRejectedClick}
                                                >
                                                    <i
                                                        className="ri-close-circle-line"
                                                        style={{
                                                            transition: 'transform 0.2s ease',
                                                            fontSize: '1.1rem'
                                                        }}
                                                    ></i>
                                                    <span>Rejected</span>
                                                    <span
                                                        className="rounded-pill px-2"
                                                        style={{
                                                            marginLeft: 'auto',
                                                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                            color: '#dc3545',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.25s ease'
                                                        }}
                                                    >
                                                        {documentCounts.rejected}
                                                    </span>
                                                </Button>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Button
                                                    color="light"
                                                    onClick={handleResetFilters}
                                                >
                                                    Reset
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    onClick={handleSearch}
                                                    id="search-btn"
                                                    disabled={loading || !displaySection}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                            Searching...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="ri-search-line me-1 align-bottom"></i> Search
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {hasSearched && (
                                    <>
                                        <Row className="g-4 mb-3">
                                            <Col sm={12} className="d-flex justify-content-end">
                                                <Button
                                                    color="light"
                                                    className="me-2"
                                                    onClick={handleAddDocument}
                                                    disabled={!hasSearched || !account_id}
                                                >
                                                    <i className="ri-add-line me-1 align-bottom"></i> Add Document
                                                </Button>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col lg={12}>
                                                <div className="fixed-table-outer" style={{ background: 'transparent' }}>
                                                    <table className="grid-table mb-0" style={{ width: '100%', backgroundColor: 'transparent' }}>
                                                        <thead>
                                                            <tr>
                                                                <th>ConsumerName</th>
                                                                <th>RrNo</th>
                                                                <th>AccountID</th>
                                                                <th>ConsumerAddress</th>
                                                                <th>Phone</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>{renderTableRows()}</tbody>
                                                    </table>
                                                </div>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                    <ModalHeader className="bg-primary text-white p-3" toggle={() => setModalOpen(false)}>
                        <span className="modal-title text-white">{editMode ? 'Edit Document' : 'Add New Document'}</span>
                    </ModalHeader>
                    <Form onSubmit={formik.handleSubmit}>
                        <ModalBody>
                            <h5 className="mb-3">Document Information</h5>
                            <Row className="mb-3">
                                {/* LEFT SIDE - Individual Document Upload Section */}
                                <Col md={6}>
                                    <FormGroup>
                                        <Label className="form-label">Upload Documents <span className="text-danger">*</span></Label>
                                        
                                        {/* FIXED: Validation error display - will only show when no files are uploaded and form is submitted */}
                                        {formik.errors.mannualFile && formik.touched.mannualFile && documentUploads.filter(doc => doc.file).length === 0 && (
                                            <Alert color="danger" className="py-1 px-2 mb-3">
                                                <i className="ri-error-warning-line me-1"></i>
                                                {formik.errors.mannualFile}
                                            </Alert>
                                        )}

                                        {/* Documents Counter and Clear All */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <small className="text-muted">
                                                {documentUploads.filter(doc => doc.file).length} of {MAX_TOTAL_DOCUMENTS} documents uploaded
                                            </small>
                                            {documentUploads.filter(doc => doc.file).length > 0 && (
                                                <Button
                                                    color="link"
                                                    size="sm"
                                                    className="p-0 text-danger"
                                                    onClick={handleClearAllDocuments}
                                                >
                                                    <i className="ri-delete-bin-line me-1"></i>Clear All
                                                </Button>
                                            )}
                                        </div>

                                        {/* Individual Document Upload Areas */}
                                        <div className="individual-documents-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {documentUploads.map((doc, index) => (
                                                <Card key={doc.id} className="mb-3 border">
                                                    <CardBody className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <h6 className="mb-0">Document {index + 1}</h6>
                                                            {documentUploads.length > 1 && (
                                                                <Button
                                                                    color="link"
                                                                    size="sm"
                                                                    className="p-0 text-danger"
                                                                    onClick={() => handleRemoveDocument(doc.id)}
                                                                    title="Remove document"
                                                                >
                                                                    <i className="ri-close-line fs-5"></i>
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {doc.file ? (
                                                            <div className="uploaded-file-info">
                                                                <div className="d-flex align-items-center p-2 border rounded bg-light">
                                                                    <div className="flex-shrink-0 me-3">
                                                                        {getFileIcon(doc.name)}
                                                                    </div>
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-medium text-truncate">
                                                                            {doc.name}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {Math.round(doc.file.size / 1024)} KB • {doc.file.type.split('/')[1].toUpperCase()}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label
                                                                className="btn btn-outline-primary d-flex flex-column align-items-center justify-content-center w-100"
                                                                style={{ 
                                                                    height: '80px', 
                                                                    borderStyle: 'dashed',
                                                                    cursor: 'pointer'
                                                                }}
                                                                htmlFor={`fileUpload-${doc.id}`}
                                                            >
                                                                <i className="ri-add-line display-6 mb-1"></i>
                                                                <small>Add Document</small>
                                                            </label>
                                                        )}
                                                        
                                                        <input
                                                            type="file"
                                                            id={`fileUpload-${doc.id}`}
                                                            className="d-none"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileUpload(doc.id, e)}
                                                        />
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Add More Button (only show if user selected "No" in modal or wants to manually add) */}
                                        {showAddAnotherButton && documentUploads.length < MAX_TOTAL_DOCUMENTS && (
                                            <div className="text-center mt-3">
                                                <Button
                                                    color="outline-primary"
                                                    size="sm"
                                                    onClick={handleManualAddAnother}
                                                >
                                                    <i className="ri-add-line me-1"></i>
                                                    Add Another Document
                                                </Button>
                                            </div>
                                        )}
                                    </FormGroup>
                                </Col>

                                {/* Vertical Divider */}
                                <Col md={1} className="d-flex justify-content-center">
                                    <div style={{
                                        width: '1px',
                                        backgroundColor: '#dee2e6',
                                        height: '100%',
                                        minHeight: '400px'
                                    }}></div>
                                </Col>

                                {/* RIGHT SIDE - All Other Form Fields */}
                                <Col md={5}>
                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label className="form-label">Document Name <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="text"
                                                    name="docName"
                                                    value={formik.values.docName}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    placeholder="Enter document name"
                                                    className={formik.errors.docName && formik.touched.docName ? 'is-invalid' : ''}
                                                />
                                                {formik.errors.docName && formik.touched.docName && (
                                                    <FormText color="danger" className="small">
                                                        {formik.errors.docName}
                                                    </FormText>
                                                )}
                                            </FormGroup>
                                        </Col>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label className="form-label">Document Category <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="select"
                                                    name="selectedCategory"
                                                    value={formik.values.selectedCategory}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={formik.errors.selectedCategory && formik.touched.selectedCategory ? 'is-invalid' : ''}
                                                >
                                                    <option value="">Select Document Category</option>
                                                    {documentCategory.map((item) => (
                                                        <option key={item.Category_Id} value={item.Category_Id}>
                                                            {item.CategoryName}
                                                        </option>
                                                    ))}
                                                </Input>
                                                {formik.errors.selectedCategory && formik.touched.selectedCategory && (
                                                    <FormText color="danger">
                                                        {formik.errors.selectedCategory}
                                                    </FormText>
                                                )}
                                            </FormGroup>
                                        </Col>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label className="form-label">Assign Role</Label>
                                                <Input
                                                    type="select"
                                                    name="selectedRole"
                                                    value={formik.values.selectedRole}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={formik.errors.selectedRole && formik.touched.selectedRole ?
                                                        'is-invalid' : ''}
                                                >
                                                    <option value="">Select Role</option>
                                                    {roles.map((item) => (
                                                        <option key={item.Role_Id} value={item.Role_Id}>
                                                            {item.RoleName}
                                                        </option>
                                                    ))}
                                                </Input>
                                                {formik.errors.selectedRole && formik.touched.selectedRole && (
                                                    <FormText color="danger">
                                                        {formik.errors.selectedRole}
                                                    </FormText>
                                                )}
                                            </FormGroup>
                                        </Col>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label className="form-label">Description<span className="text-danger">*</span></Label>
                                                <Input
                                                    type="textarea"
                                                    name="description"
                                                    value={formik.values.description}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    rows="3"
                                                    placeholder="Enter document description"
                                                    className={formik.errors.description && formik.touched.description ?
                                                        'is-invalid' : ''}
                                                />
                                                {formik.errors.description && formik.touched.description && (
                                                    <FormText color="danger">
                                                        {formik.errors.description}
                                                    </FormText>
                                                )}
                                            </FormGroup>
                                        </Col>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label className="form-label">Tags (comma separated)<span className="text-danger">*</span></Label>
                                                <Input
                                                    type="text"
                                                    name="metaTags"
                                                    value={formik.values.metaTags}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    placeholder="e.g., invoice, january, payment"
                                                    className={formik.errors.metaTags && formik.touched.metaTags ?
                                                        'is-invalid' : ''}
                                                />
                                                {formik.errors.metaTags && formik.touched.metaTags && (
                                                    <FormText color="danger">
                                                        {formik.errors.metaTags}
                                                    </FormText>
                                                )}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                color="light"
                                onClick={() => {
                                    setModalOpen(false);
                                    resetForm();
                                }}
                                disabled={uploadLoading}
                            >
                                Cancel
                            </Button>

                            <Button
                                color="primary"
                                type="submit"
                                disabled={uploadLoading || documentUploads.filter(doc => doc.file).length === 0}
                            >
                                {uploadLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        {editMode ? 'Updating...' : 'Uploading...'}
                                    </>
                                ) : editMode ? (
                                    'Update Documents'
                                ) : (
                                    <>
                                        <i className="ri-upload-cloud-line me-1"></i> 
                                        Upload {documentUploads.filter(doc => doc.file).length > 0 ? `(${documentUploads.filter(doc => doc.file).length} documents)` : ''}
                                    </>
                                )}
                            </Button>
                        </ModalFooter>
                    </Form>
                </Modal>

                {/* The rest of the modals (Approved, Rejected, Re-upload) remain unchanged */}
               <Modal
                    isOpen={approvedModalOpen}
                    toggle={() => {
                        setApprovedModalOpen(false);
                        setSelectedFile(null);
                        setPreviewContent(null);
                        setPreviewError(null);
                        setSelectedConsumer(null);
                    }}
                    size="xl"
                    className="custom-large-modal"
                >
                    <ModalHeader
                        className="bg-primary text-white"
                        toggle={() => {
                            setApprovedModalOpen(false);
                            setSelectedFile(null);
                            setPreviewContent(null);
                            setPreviewError(null);
                            setSelectedConsumer(null);
                        }}
                        style={{
                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                            padding: '1rem 1.5rem'
                        }}
                    >
                        <div className="d-flex alignItems-center">
                            <h5 className="mb-0 text-white">Approved Documents</h5>
                            <Badge color="light" pill className="ms-2 text-primary">
                                {documentCounts.approved} Approved
                            </Badge>
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-3">
                        <Container fluid>
                            <Row className="g-3 results-container">
                                <Col lg={3} className="h-100 d-flex flex-column">
                                    <Card className="mb-3 slide-in-left fixed-height-card">
                                        <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Consumer Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedFile ? (
                                                <div className="consumer-details">
                                                    <div className="row g-0">
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center mb-1">
                                                                <i className="ri-user-3-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">RR No:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.rr_no || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center mb-1">
                                                                <i className="ri-profile-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.consumer_name || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center mb-1">
                                                                <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Address:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.consumer_address || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
                                                    <i className="ri-user-line fs-5"></i>
                                                    <p className="mt-1 x-small mb-0">No document selected</p>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>

                                    <Card className="slide-in-left delay-1 fixed-height-card">
                                        <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Document Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedFile ? (
                                                <div className="document-details">
                                                    <div className="d-flex alignItems-center mb-3">
                                                        <div className="flex-shrink-0 me-1">
                                                            {getFileIcon(selectedFile.name)}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 x-small">{selectedFile.name}</h6>
                                                            <small className="text-muted x-small">{selectedFile.category}</small>
                                                        </div>
                                                    </div>

                                                    <div className="row g-0">
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-file-text-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approval Comment:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.description || 'None'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-user-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approved By:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.createdBy}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-calendar-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approved On:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.createdAt}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-checkbox-circle-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
                                                                    <Badge color="success" className="badge-soft-success x-small">
                                                                        {selectedFile.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ADDED: Version Information */}
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-git-branch-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Version:</Label>
                                                                    <Badge color="info" className="badge-soft-info x-small">
                                                                        {selectedFile.versionLabel} {selectedFile.isLatest ? '(Latest)' : ''}
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
                                    <Card className="h-100 fade-in delay-2">
                                        <CardHeader
                                            className="bg-light d-flex justify-content-between align-items-center"
                                            style={{ borderTop: '3px solid #405189' }}
                                        >
                                            <h5 className="mb-0">Approved Documents</h5>
                                            <Badge color="primary" pill className="text-uppercase px-3 py-2">
                                                {approvedDocuments.length} {approvedDocuments.length === 1 ? 'file' : 'files'}
                                            </Badge>
                                        </CardHeader>
                                        <CardBody className="p-0 uploaded-documents-container">
                                            <div className="uploaded-documents-scrollable" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                {loading ? (
                                                    <div className="text-center py-4">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <p className="mt-2">Loading approved documents...</p>
                                                    </div>
                                                ) : approvedDocuments.length > 0 ? (
                                                    <ListGroup flush style={{ minHeight: '100%' }}>
                                                        {approvedDocuments.map((doc, index) => (
                                                            <div
                                                                key={doc.id}
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
                                                                        {getFileIcon(doc.name)}
                                                                    </div>
                                                                    <div className="flex-grow-1 text-truncate">
                                                                        <h6 className="mb-0 text-truncate" title={doc.name}>
                                                                            {doc.name}
                                                                        </h6>
                                                                        <small className="text-muted d-block text-truncate">
                                                                            Version: {doc.versionLabel} {doc.isLatest ? '(Latest)' : ''}
                                                                        </small>
                                                                    </div>
                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDownload(doc);
                                                                        }}
                                                                        title="Download"
                                                                    >
                                                                        <i className="ri-download-line"></i>
                                                                    </Button>
                                                                </ListGroupItem>
                                                            </div>
                                                        ))}
                                                    </ListGroup>
                                                ) : (
                                                    <div className="text-center text-muted py-4 h-100 d-flex flex-column justify-content-center">
                                                        No approved documents found
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>

                                <Col lg={6} className="h-100 d-flex flex-column">
                                    <Card className="h-100 slide-in-right delay-3 fixed-height-card">
                                        <CardHeader className="bg-light p-3 position-relative"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Document Preview</h5>
                                            {selectedFile && (
                                                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => handleDownload(selectedFile)}
                                                        disabled={!previewContent}
                                                    >
                                                        <i className="ri-download-line me-1"></i> Download
                                                    </Button>
                                                </div>
                                            )}
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
                                                ) : selectedFile && previewContent ? (
                                                    <div className="d-flex flex-column h-100">
                                                        <div className="flex-grow-1 preview-content">
                                                            {previewContent.type.includes('pdf') ? (
                                                                <div className="pdf-viewer-container fade-in h-100">
                                                                    <iframe
                                                                        src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                        title="PDF Viewer"
                                                                        className="w-100 h-100"
                                                                        style={{ border: 'none' }}
                                                                        onLoad={(e) => {
                                                                            console.log('📄 PDF iframe loaded');
                                                                            // Check if iframe has content
                                                                            const iframe = e.target;
                                                                            try {
                                                                                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                                                                console.log('📄 Iframe document readyState:', iframeDoc.readyState);
                                                                            } catch (err) {
                                                                                console.log('🔒 Cannot access iframe content (cross-origin)');
                                                                            }
                                                                        }}
                                                                        onError={(e) => {
                                                                            console.error('❌ PDF iframe error:', e);
                                                                            setPreviewError('Failed to load PDF in iframe');
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : previewContent.type.includes('image') ? (
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
                                                                        onError={(e) => {
                                                                            console.error('❌ Image load error:', e);
                                                                            setPreviewError('Failed to load image preview');
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
                                                                        onClick={() => handleDownload(selectedFile)}
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
                                                        <p>Select an approved file from the list to preview it here</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => {
                            setApprovedModalOpen(false);
                            setSelectedFile(null);
                            setPreviewContent(null);
                            setPreviewError(null);
                        }}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Rejected Modal */}
                <Modal
                    isOpen={rejectedModalOpen}
                    toggle={() => {
                        setRejectedModalOpen(false);
                        setSelectedRejectedFile(null);
                        setPreviewContent(null);
                        setPreviewError(null);
                    }}
                    size="xl"
                    className="custom-large-modal"
                    backdrop={showReuploadModal ? 'static' : true}
                >
                    <ModalHeader
                        className="bg-primary text-white"
                        toggle={() => {
                            if (!showReuploadModal) {
                                setRejectedModalOpen(false);
                                setSelectedRejectedFile(null);
                                setPreviewContent(null);
                                setPreviewError(null);
                            }
                        }}
                        style={{
                            borderBottom: '1px solid rgba(255,255,255,0.2)',
                            padding: '1rem 1.5rem'
                        }}
                    >
                        <div className="d-flex alignItems-center">
                            <h5 className="mb-0 text-white">Rejected Documents</h5>
                            <Badge color="light" pill className="ms-2 text-danger">
                                {documentCounts.rejected} Rejected
                            </Badge>
                        </div>
                    </ModalHeader>

                    <ModalBody className="p-3">
                        <Container fluid>
                            <Row className="g-3 results-container">
                                <Col lg={3} className="h-100 d-flex flex-column">
                                    <Card className="mb-3 slide-in-left fixed-height-card">
                                        <CardHeader className="bg-light p-3 position-relative"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Consumer Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedRejectedFile ? (
                                                <div className="consumer-details">
                                                    <div className="row g-0">
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center mb-1">
                                                                <i className="ri-user-3-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">RR Number:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.rr_no || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center mb-1">
                                                                <i className="ri-profile-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.consumer_name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center mb-1">
                                                                <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Address:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.consumer_address}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted py-1 h-100 d-flex flex-column justify-content-center">
                                                    <i className="ri-user-line fs-5"></i>
                                                    <p className="mt-1 x-small mb-0">No document selected</p>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>

                                    <Card className="slide-in-left delay-1 fixed-height-card">
                                        <CardHeader className="bg-light p-3 position-relative"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Document Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedRejectedFile ? (
                                                <div className="document-details">
                                                    <div className="d-flex alignItems-center mb-3">
                                                        <div className="flex-shrink-0 me-1">
                                                            {getFileIcon(selectedRejectedFile.name)}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 x-small">{selectedRejectedFile.name}</h6>
                                                            <small className="text-muted x-small">{selectedRejectedFile.category}</small>
                                                        </div>
                                                    </div>

                                                    <div className="row g-0">
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-file-text-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Rejection Reason:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.RejectionComment || 'None'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-user-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Rejected By:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.createdBy}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-calendar-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Rejected On:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.createdAt}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-close-circle-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
                                                                    <Badge color="danger" className="badge-soft-danger x-small">
                                                                        {selectedRejectedFile.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ADDED: Version Information */}
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-git-branch-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Version:</Label>
                                                                    <Badge color="info" className="badge-soft-info x-small">
                                                                        {selectedRejectedFile.versionLabel} {selectedRejectedFile.isLatest ? '(Latest)' : ''}
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
                                    <Card className="h-100 fade-in delay-2">
                                        <CardHeader className="bg-light d-flex justify-content-between align-items-center"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Rejected Documents</h5>
                                            <Badge color="danger" pill className="px-3 py-2">
                                                {rejectedDocuments.length} files
                                            </Badge>
                                        </CardHeader>

                                        <CardBody className="p-0 uploaded-documents-container">
                                            <div className="uploaded-documents-scrollable p-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                {loading ? (
                                                    <div className="text-center py-4">
                                                        <Spinner color="primary">Loading...</Spinner>
                                                        <p className="mt-2 text-muted">Loading rejected documents...</p>
                                                    </div>
                                                ) : rejectedDocuments.length > 0 ? (
                                                    rejectedDocuments.map((doc) => (
                                                        <Card
                                                            key={doc.id}
                                                            className={`document-card mb-2 shadow-sm--hover ${selectedRejectedFile?.id === doc.id ? 'active' : ''}`}
                                                            onClick={() => handleRejectedFileSelect(doc)}
                                                        >
                                                            <CardBody className="p-2">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-shrink-0 me-3">
                                                                        {getFileIcon(doc.name)}
                                                                    </div>
                                                                    <div className="flex-grow-1 overflow-hidden">
                                                                        <h6 className="mb-0 text-truncate" title={doc.name}>{doc.name}</h6>
                                                                        <small className="text-muted d-block text-truncate">
                                                                            Version: {doc.versionLabel} {doc.isLatest ? '(Latest)' : ''}
                                                                        </small>
                                                                    </div>
                                                                    <div className="flex-shrink-0 ms-2">
                                                                        <Button
                                                                            color="light"
                                                                            className="btn-icon rounded-circle"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleReuploadClick(doc);
                                                                            }}
                                                                            title="Re-upload Document"
                                                                        >
                                                                            <i className="ri-upload-2-line"></i>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-muted py-4 h-100 d-flex flex-column justify-content-center">
                                                        <i className="ri-file-excel-2-line fs-1 mb-3"></i>
                                                        <h5>No Rejected Documents</h5>
                                                        <p>You're all caught up!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>

                                <Col lg={6} className="h-100 d-flex flex-column">
                                    <Card className="h-100 slide-in-right delay-3 fixed-height-card">
                                        <CardHeader className="bg-light p-3 position-relative"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Document Preview</h5>
                                            {selectedRejectedFile && (
                                                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => handleDownload(selectedRejectedFile)}
                                                        disabled={!previewContent}
                                                    >
                                                        <i className="ri-download-line me-1"></i> Download
                                                    </Button>
                                                </div>
                                            )}
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
                                                ) : selectedRejectedFile && previewContent ? (
                                                    <div className="d-flex flex-column h-100">
                                                        <div className="flex-grow-1 preview-content">
                                                            {previewContent.type.includes('pdf') ? (
                                                                <div className="pdf-viewer-container fade-in h-100">
                                                                    <iframe
                                                                        src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                        title="PDF Viewer"
                                                                        className="w-100 h-100"
                                                                        style={{ border: 'none' }}
                                                                        onLoad={(e) => {
                                                                            console.log('📄 PDF iframe loaded');
                                                                            const iframe = e.target;
                                                                            try {
                                                                                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                                                                                console.log('📄 Iframe document readyState:', iframeDoc.readyState);
                                                                            } catch (err) {
                                                                                console.log('🔒 Cannot access iframe content (cross-origin)');
                                                                            }
                                                                        }}
                                                                        onError={(e) => {
                                                                            console.error('❌ PDF iframe error:', e);
                                                                            setPreviewError('Failed to load PDF in iframe');
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : previewContent.type.includes('image') ? (
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
                                                                        onError={(e) => {
                                                                            console.error('❌ Image load error:', e);
                                                                            setPreviewError('Failed to load image preview');
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
                                                                        onClick={() => handleDownload(selectedRejectedFile)}
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
                                                        <p>Select a rejected file from the list to preview it here</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="secondary" onClick={() => {
                            setRejectedModalOpen(false);
                            setSelectedRejectedFile(null);
                            setPreviewContent(null);
                            setPreviewError(null);
                        }}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Re-upload Document Modal */}
                <Modal
                    isOpen={showReuploadModal}
                    toggle={() => setShowReuploadModal(false)}
                    size="lg"
                    centered
                    backdrop="static"
                >
                    <ModalHeader
                        toggle={() => {
                            setShowReuploadModal(false);
                            setReuploadDocument(null);
                            setNewDocumentFile(null);
                            setNewDocumentPreview(null);
                            setReuploadOldDocPreview(null);
                        }}
                        className="d-flex align-items-center bg-primary text-white"
                    >
                        <span className="align-items-center bg-primary text-white">Re-upload Document</span>
                    </ModalHeader>

                    <ModalBody>
                        {reuploadDocument && (
                            <Row className="g-3">
                                <Col md={6}>
                                    <h5>Previous Version</h5>
                                    <div className="d-flex alignItems-center mb-3">
                                        <div className="flex-shrink-0 me-3">
                                            {getFileIcon(reuploadDocument.name)}
                                        </div>
                                        <div>
                                            <p className="mb-1">{reuploadDocument.name}</p>
                                            <small className="text-muted">Uploaded on: {reuploadDocument.createdAt}</small>
                                        </div>
                                    </div>
                                    <Card style={{ height: '400px' }}>
                                        <CardBody className="p-0 preview-container">
                                            {reuploadFileLoading ? (
                                                <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
                                                    <Spinner color="primary" />
                                                    <p className="mt-2">Loading document...</p>
                                                </div>
                                            ) : reuploadOldDocPreview ? (
                                                <div className="h-100">
                                                    {reuploadOldDocPreview.type.includes('pdf') ? (
                                                        <iframe
                                                            src={`${reuploadOldDocPreview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            title="PDF Viewer"
                                                            className="w-100 h-100"
                                                            style={{ border: 'none' }}
                                                        />
                                                    ) : reuploadOldDocPreview.type.includes('image') ? (
                                                        <div className="text-center p-3 h-100 d-flex alignItems-center justify-content-center">
                                                            <img
                                                                src={reuploadOldDocPreview.url}
                                                                alt="Previous version"
                                                                className="img-fluid"
                                                                style={{ maxHeight: '100%' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
                                                            <i className="ri-file-line display-4 text-muted"></i>
                                                            <p>Preview not available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
                                                    <i className="ri-file-line display-4 text-muted"></i>
                                                    <p>Preview not available</p>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <h5>Upload New Version</h5>
                                    <FormGroup>
                                        <Label for="documentReupload">Select new file</Label>
                                        <Input
                                            type="file"
                                            id="documentReupload"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setNewDocumentFile(file);
                                                    if (file.type === 'application/pdf') {
                                                        setNewDocumentPreview({
                                                            type: 'pdf',
                                                            url: URL.createObjectURL(file)
                                                        });
                                                    } else if (file.type.startsWith('image/')) {
                                                        setNewDocumentPreview({
                                                            type: file.type.split('/')[1],
                                                            url: URL.createObjectURL(file)
                                                        });
                                                    } else {
                                                        setNewDocumentPreview(null);
                                                    }
                                                }
                                            }}
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="changeReason">Change Reason</Label>
                                        <Input
                                            type="text"
                                            id="changeReason"
                                            value={changeReason}
                                            onChange={(e) => setChangeReason(e.target.value)}
                                            placeholder="Enter reason for re-upload"
                                            required
                                        />
                                    </FormGroup>

                                    {newDocumentPreview ? (
                                        <div className="mt-3">
                                            <h6>New Version Preview</h6>
                                            <Card style={{ height: '400px' }}>
                                                <CardBody className="p-0 preview-container">
                                                    {newDocumentPreview.type === 'pdf' ? (
                                                        <iframe
                                                            src={`${newDocumentPreview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            title="PDF Viewer"
                                                            className="w-100 h-100"
                                                            style={{ border: 'none' }}
                                                        />
                                                    ) : ['jpeg', 'jpg', 'png', 'gif'].includes(newDocumentPreview.type) ? (
                                                        <div className="text-center p-3 h-100 d-flex alignItems-center justify-content-center">
                                                            <img
                                                                src={newDocumentPreview.url}
                                                                alt="New version preview"
                                                                className="img-fluid"
                                                                style={{ maxHeight: '100%' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-5 h-100 d-flex flex-column justify-content-center">
                                                            <i className="ri-file-line display-4 text-muted"></i>
                                                            <p>Preview not available</p>
                                                        </div>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        </div>
                                    ) : (
                                        <div className="mt-3 text-center py-5 border rounded" style={{ height: '400px' }}>
                                            <i className="ri-file-upload-line display-4 text-muted"></i>
                                            <p className="mt-2 text-muted">Select a file to preview the new version</p>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => {
                            setShowReuploadModal(false);
                            setReuploadDocument(null);
                            setNewDocumentFile(null);
                            setNewDocumentPreview(null);
                            setReuploadOldDocPreview(null);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onClick={handleReuploadSubmit}
                            disabled={!newDocumentFile || uploadLoading || !changeReason}
                        >
                            {uploadLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Re-uploading...
                                </>
                            ) : (
                                'Submit Re-upload'
                            )}
                        </Button>
                    </ModalFooter>
                </Modal>

            </Container>
        </div>
    );
};

export default DocumentManagement;