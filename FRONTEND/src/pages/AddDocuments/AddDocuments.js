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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const DocumentManagement = () => {
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
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
    const [approvedModalOpen, setApprovedModalOpen] = useState(false);
    const [rejectedDocuments, setRejectedDocuments] = useState([]);
    const [selectedRejectedFile, setSelectedRejectedFile] = useState(null);
    const [rejectedModalOpen, setRejectedModalOpen] = useState(false);
    const [approvedDocuments, setApprovedDocuments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
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

    // Handle document re-upload
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
            const userDivCode = authUser?.user?.zones?.[0]?.div_code || '';


            const formData = new FormData();
            formData.append('ReUploadDocumentId', reuploadDocument.DocumentId);
            formData.append('ChangeReason', changeReason);
            formData.append('CreatedByUser_Id', userId);
            formData.append('mannualFile', newDocumentFile);
            formData.append("Status_Id", "1");
            formData.append('div_code', userDivCode);

            const response = await postDocumentManualUpload(formData);

            if (response?.status === 'success') {
                setResponse(response.message || 'Document re-uploaded successfully!');
                setSuccessModal(true);
                await fetchRejectedDocuments();
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

        fetchRoles(usernm);
        fetchDocumentCategories(usernm);
        fetchDocumentCounts();
    }, [userLevel, userAccessData]);

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
        setCurrentStatus('pending');
        setStatusModalOpen(true);
    };

    // Simplified Validation Schema
    const documentSchema = Yup.object().shape({
        docName: Yup.string().required('Document name is required'),
        selectedCategory: Yup.string().required('Please select a document category'),
        description: Yup.string().required('Description is required'),
        metaTags: Yup.string().required('Meta tags are required'),
        mannualFile: Yup.mixed()
            .required('Document file is required')
            .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
            .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
    });

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
            const so_code = authUser?.user?.zones?.[0]?.so_code || ''; // Get so_code from session

            const approvedParams = {
                flagId: 1, // Use flagId 1 for approved count
                User_Id: userId,
                so_code: so_code // Add so_code
            };
            const approvedResponse = await qcReviewed(approvedParams);

            const rejectedParams = {
                flagId: 3, // Use flagId 3 for rejected count
                User_Id: userId,
                so_code: so_code // Add so_code
            };
            const rejectedResponse = await qcReviewed(rejectedParams);

            // Removed pending call as flagId: 3 is now for rejected count
            
            setDocumentCounts({
                // MODIFIED: Correctly parse the new response structure
                approved: approvedResponse?.results?.[0]?.ApprovedCount || 0,
                pending: 0, // Set pending to 0 or remove if not needed
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
            const so_code = authUser?.user?.zones?.[0]?.so_code || ''; // Get so_code from session

            const params = {
                flagId: 2, // Use flagId 2 for approved data
                User_Id: userId,
                so_code: so_code // Add so_code
            };

            const response = await qcReviewed(params);

            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId,
                    DocumentId: doc.DocumentId,
                    name: doc.documentName,
                    type: getFileTypeFromPath(doc.FilePath),
                    category: doc.DocumentType || getDocumentTypeFromPath(doc.FilePath),
                    createdAt: new Date(doc.ApprovedOn).toLocaleDateString(),
                    createdBy: doc.ApprovedBy,
                    description: doc.ApprovalComment,
                    status: doc.StatusName,
                    FilePath: doc.FilePath,
                    division: doc.division,
                    sub_division: doc.sub_division,
                    section: doc.section,
                    rr_no: doc.rr_no,
                    consumer_name: doc.consumer_name,
                    consumer_address: doc.consumer_address
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
            const so_code = authUser?.user?.zones?.[0]?.so_code || ''; // Get so_code from session

            const params = {
                flagId: 4, // Use flagId 4 for rejected data
                User_Id: userId,
                so_code: so_code // Add so_code
            };

            const response = await qcReviewed(params);

            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId,
                    DocumentId: doc.DocumentId,
                    name: doc.DocumentName || `Document_${doc.DocumentId}`,
                    type: getFileTypeFromPath(doc.FilePath),
                    category: doc.DocumentType || getDocumentTypeFromPath(doc.FilePath),
                    createdAt: new Date(doc.RejectedOn).toLocaleDateString(),
                    createdBy: doc.RejectedBy,
                    description: doc.RejectionComment,
                    status: doc.StatusName,
                    FilePath: doc.FilePath,
                    division: doc.division,
                    sub_division: doc.sub_division,
                    section: doc.section,
                    rr_no: doc.rr_no,
                    consumer_name: doc.consumer_name,
                    consumer_address: doc.consumer_address,
                    Rejection_Id: doc.Rejection_Id,
                    RejectionComment: doc.RejectionComment
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

    const handleFileSelect = async (file) => {
        console.log("File", file.DocumentId)
        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);

        try {
            const response = await view(
                {
                    flagId: 2,
                    DocumentId: file.DocumentId,
                },
                {
                    responseType: "blob",
                    headers: { "Content-Type": "application/json" },
                    transformResponse: [(data, headers) => ({ data, headers })],
                }
            );

            const blob = response.data;
            const fileUrl = URL.createObjectURL(blob);
            const fileType = blob.type.split('/')[1] || file.type || 'unknown';

            setPreviewContent({
                url: fileUrl,
                type: fileType,
                name: file.name
            });
        } catch (error) {
            console.error("Preview error:", error);
            setPreviewError(error.message || "Failed to load preview");
        } finally {
            setPreviewLoading(false);
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
            const response = await view(
                {
                    flagId: 2,
                    DocumentId: doc.DocumentId,
                },
                {
                    responseType: "blob",
                    headers: { "Content-Type": "application/json" },
                    transformResponse: [(data, headers) => ({ data, headers })],
                }
            );

            const blob = response.data;
            const fileUrl = URL.createObjectURL(blob);
            const fileType = blob.type.split('/')[1] || doc.type || 'unknown';

            setReuploadOldDocPreview({
                url: fileUrl,
                type: fileType,
                name: doc.name
            });
        } catch (error) {
            console.error("Preview error:", error);
            setReuploadOldDocPreview(null);
        } finally {
            setReuploadFileLoading(false);
        }
    };

    // Formik form setup - Simplified for single file upload
    const formik = useFormik({
        initialValues: {
            docName: '',
            selectedCategory: '',
            selectedRole: '',
            description: '',
            metaTags: '',
            mannualFile: null,
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
                // Get div_code and sd_code from session storage
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
                formData.append('Status_Id', '1'); // Hardcoded as per requirement
                formData.append('mannualFile', values.mannualFile); // Single file upload
                formData.append('div_code', userDivCode); // Use div_code from session storage
                formData.append('sd_code', userSdCode); // Use sd_code from session storage

                // Add other location codes if available
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
                    hasFile: !!values.mannualFile
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
                    setResponse(response?.message || 'Failed to upload document');
                    setErrorModal(true);
                }
            } catch (error) {
                console.error('Error uploading document:', error);
                setResponse('Error uploading document. Please try again.');
                setErrorModal(true);
            } finally {
                setUploadLoading(false);
            }
        }
    });

    const handleFileUpload = (e) => {
        const file = e.currentTarget.files[0];
        console.log(`File selected:`, file);
        if (file) {
            formik.setFieldValue('mannualFile', file);
            formik.setFieldTouched('mannualFile', true);

            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                const fileUrl = URL.createObjectURL(file);
                const fileType = file.type.split('/')[1] || 'unknown';

                setPreviewContent({
                    url: fileUrl,
                    type: fileType,
                    name: file.name
                });
            } else {
                setPreviewContent(null);
            }
        } else {
            formik.setFieldValue('mannualFile', null);
            formik.setFieldTouched('mannualFile', true);
            setPreviewContent(null);
        }
    };

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

            // Get the section name for the API call
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

    const resetForm = () => {
        formik.resetForm();
        setCurrentDocument(null);
        setEditMode(false);
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (input) input.value = '';
        });
        formik.setFieldValue('mannualFile', null);
        setPreviewContent(null);
    };

    const handleEdit = (document) => {
        formik.setValues({
            docName: document.name,
            selectedCategory: document.category,
            description: document.description || '',
            metaTags: document.metaTags || '',
            selectedRole: document.role || '',
            mannualFile: null,
        });
        setCurrentDocument(document);
        setEditMode(true);
        setModalOpen(true);
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

    // Helper function to check if field should be disabled based on user level
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
                                                            disabled={isFieldDisabled('division') || !circle}
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
                                {/* LEFT SIDE - File Upload Section */}
                                <Col md={6}>
                                    <FormGroup>
                                        <Label className="form-label">Upload Document <span className="text-danger">*</span></Label>
                                        {formik.errors.mannualFile && formik.touched.mannualFile && (
                                            <Alert color="danger" className="py-1 px-2 mb-2">
                                                <i className="ri-error-warning-line me-1"></i>
                                                {formik.errors.mannualFile}
                                            </Alert>
                                        )}

                                        {/* Upload Button */}
                                        <label
                                            className={`btn btn-outline-primary d-flex alignItems-center justify-content-center position-relative w-100 ${formik.values.mannualFile ? 'border-success text-success' : ''}`}
                                            style={{ height: '120px', borderStyle: 'dashed' }}
                                        >
                                            {formik.values.mannualFile ? (
                                                <div className="text-center">
                                                    <i className="ri-check-line display-4 text-success mb-2"></i>
                                                    <div className="text-success fw-semibold">File Selected</div>
                                                    <small className="text-muted d-block">
                                                        {formik.values.mannualFile.name} ({Math.round(formik.values.mannualFile.size / 1024)} KB)
                                                    </small>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <i className="ri-upload-cloud-line display-4 text-primary mb-2"></i>
                                                    <div className="fw-semibold">Click to Upload Document</div>
                                                    <small className="text-muted d-block">Supports PDF, JPG, PNG (Max 2MB)</small>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="d-none"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                                onClick={(event) => {
                                                    event.currentTarget.value = '';
                                                }}
                                            />
                                        </label>

                                        {/* File name display with remove option */}
                                        {formik.values.mannualFile && (
                                            <div className="d-flex alignItems-center mt-2 p-2 border rounded bg-light">
                                                <i className="ri-file-line me-2 text-muted fs-5"></i>
                                                <div className="flex-grow-1">
                                                    <div className="fw-medium">{formik.values.mannualFile.name}</div>
                                                    <small className="text-muted">
                                                        {Math.round(formik.values.mannualFile.size / 1024)} KB • {formik.values.mannualFile.type}
                                                    </small>
                                                </div>
                                                <Button
                                                    color="link"
                                                    size="sm"
                                                    className="p-0 text-danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        formik.setFieldValue('mannualFile', null);
                                                        const fileInput = document.querySelector('input[type="file"]');
                                                        if (fileInput) fileInput.value = '';
                                                        setPreviewContent(null);
                                                    }}
                                                    title="Remove file"
                                                >
                                                    <i className="ri-close-line fs-5"></i>
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
                                disabled={uploadLoading}
                            >
                                {uploadLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        {editMode ? 'Updating...' : 'Uploading...'}
                                    </>
                                ) : editMode ? (
                                    'Update Document'
                                ) : (
                                    <>
                                        <i className="ri-upload-cloud-line me-1"></i> Upload
                                    </>
                                )}
                            </Button>
                        </ModalFooter>
                    </Form>
                </Modal>

                {/* The rest of your modal components (Approved Modal, Rejected Modal, Re-upload Modal) remain exactly the same */}
                {/* Approved Modal */}
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
                                                                key={doc.DocumentId}
                                                                className="fade-in-list-item"
                                                                style={{ animationDelay: `${0.1 * index}s` }}
                                                            >
                                                                <ListGroupItem
                                                                    action
                                                                    active={selectedFile?.DocumentId === doc.DocumentId}
                                                                    onClick={() => handleFileSelect(doc)}
                                                                    className="d-flex align-items-center"
                                                                    style={{
                                                                        backgroundColor: selectedFile?.DocumentId === doc.DocumentId ? '#e9ecef' : 'transparent',
                                                                        borderLeft: selectedFile?.DocumentId === doc.DocumentId ? '3px solid #9299b1ff' : '3px solid transparent',
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
                                                                    </div>
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
                                                            {previewContent.type === 'pdf' ? (
                                                                <div className="pdf-viewer-container fade-in h-100">
                                                                    <embed
                                                                        src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                        type="application/pdf"
                                                                        className="w-100 h-100"
                                                                        style={{ border: 'none' }}
                                                                    />
                                                                </div>
                                                            ) : ['jpeg', 'jpg', 'png', 'gif'].includes(previewContent.type) ? (
                                                                <div className="text-center fade-in p-3 h-100 d-flex alignItems-center justify-content-center">
                                                                    <img
                                                                        src={previewContent.url}
                                                                        alt="Document Preview"
                                                                        className="img-fluid"
                                                                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
                                                                    <i className="ri-file-line display-4 text-muted"></i>
                                                                    <h5 className="mt-3">Preview not available</h5>
                                                                    <p>This file type cannot be previewed in the browser.</p>
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

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex alignItems-center">
                                                                <i className="ri-file-list-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex alignItems-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">RR Number:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.rr_no || 'N/A'}</span>
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
                                                                            {doc.createdAt} • {doc.category}
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
                                                            {previewContent.type === 'pdf' ? (
                                                                <div className="pdf-viewer-container fade-in h-100">
                                                                    <embed
                                                                        src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                        type="application/pdf"
                                                                        className="w-100 h-100"
                                                                        style={{ border: 'none' }}
                                                                    />
                                                                </div>
                                                            ) : ['jpeg', 'jpg', 'png', 'gif'].includes(previewContent.type) ? (
                                                                <div className="text-center fade-in p-3 h-100 d-flex alignItems-center justify-content-center">
                                                                    <img
                                                                        src={previewContent.url}
                                                                        alt="Document Preview"
                                                                        className="img-fluid"
                                                                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
                                                                    <i className="ri-file-line display-4 text-muted"></i>
                                                                    <h5 className="mt-3">Preview not available</h5>
                                                                    <p>This file type cannot be previewed in the browser.</p>
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
                                                    {reuploadOldDocPreview.type === 'pdf' ? (
                                                        <embed
                                                            src={`${reuploadOldDocPreview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            type="application/pdf"
                                                            className="w-100 h-100"
                                                        />
                                                    ) : ['jpeg', 'jpg', 'png', 'gif'].includes(reuploadOldDocPreview.type) ? (
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
                                                        <embed
                                                            src={`${newDocumentPreview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            type="application/pdf"
                                                            className="w-100 h-100"
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
                            disabled={!newDocumentFile || uploadLoading}
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