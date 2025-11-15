import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row, Label,
    ListGroup, ListGroupItem, Spinner, Form, FormGroup, Input, Progress,
    Modal, ModalHeader, ModalBody, ModalFooter, Badge, Alert,
    Collapse
} from 'reactstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import {
    getDocumentDropdowns,
    qcReviewed,
    view,
    postDocumentUploadview,
    postDocumentManualUpload // <-- ADDED
} from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import axios from 'axios'; // <-- ADDED

// --- ADDED CONSTANTS ---
const VIEW_DOCUMENT_URL = "http://192.168.23.229:9000/backend-service/documentUpload/documentView";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
// --- END CONSTANTS ---


const Preview = () => {
    document.title = ` Consumer search | DMS`;
    const navigate = useNavigate();
    const location = useLocation();
    const debounceRef = useRef();

    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');

    // Verification modal states
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [consumerToVerify, setConsumerToVerify] = useState(null);
    const [noOfPages, setNoOfPages] = useState('');
    const [fileNumber, setFileNumber] = useState('');
    const [isProcessingModal, setIsProcessingModal] = useState(false);

    // Filter and Search states
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [section, setSection] = useState('');
    const [userName, setUserName] = useState("");
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [account_id, setAccountId] = useState('');
    const [accountSearchInput, setAccountSearchInput] = useState('');
    const [accountSuggestions, setAccountSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [verifyingAccountId, setVerifyingAccountId] = useState(null);

    // User access level states
    const [userLevel, setUserLevel] = useState('');
    const [isFieldsDisabled, setIsFieldsDisabled] = useState({
        division: false,
        subDivision: false,
        section: false
    });

    // Report-specific states
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(true);
    const [isReportCollapsed, setIsReportCollapsed] = useState(true);

    // --- DOCUMENT MODAL STATES ---
    const [pendingCountModalOpen, setPendingCountModalOpen] = useState(false);
    const [approvedModalOpen, setApprovedModalOpen] = useState(false);
    const [rejectedModalOpen, setRejectedModalOpen] = useState(false);
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [documentCounts, setDocumentCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
    const [approvedDocuments, setApprovedDocuments] = useState([]);
    const [rejectedDocuments, setRejectedDocuments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedRejectedFile, setSelectedRejectedFile] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [reuploadDocument, setReuploadDocument] = useState(null);
    const [newDocumentFile, setNewDocumentFile] = useState(null);
    const [newDocumentPreview, setNewDocumentPreview] = useState(null);
    const [reuploadFileLoading, setReuploadFileLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [reuploadOldDocPreview, setReuploadOldDocPreview] = useState(null);
    const [changeReason, setChangeReason] = useState('');
    // --- END DOCUMENT MODAL STATES ---

    const modernBtnStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '0.2rem 0.6rem'
    };

    const toggleReportCollapse = () => setIsReportCollapsed(prev => !prev);

    // Utility Functions
    const flagIdFunction = useCallback(async (params) => {
        try {
            const res = await getDocumentDropdowns(params);
            return res?.data || [];
        } catch (error) {
            console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
            return [];
        }
    }, []);

    const loadReportData = useCallback(async (userEmail) => {
        setReportLoading(true);
        const reportResult = await flagIdFunction({ flagId: 6, requestUserName: userEmail });
        setReportData(reportResult);
        setReportLoading(false);
    }, [flagIdFunction]);

    const loadDropdownDataFromSession = useCallback(async () => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const zones = authUser?.user?.zones || [];

        if (zones.length === 0) return;

        const userZone = zones[0];
        const level = userZone.level;
        const circleCode = userZone.circle_code;
        setUserLevel(level);

        if (circleCode) {
            try {
                const divisions = await flagIdFunction({
                    flagId: 1,
                    requestUserName: authUser.user.Email,
                    circle_code: circleCode
                });
                setDivisionName(divisions);
            } catch (error) {
                console.error("Error fetching divisions:", error);
            }
        }

        if (level === 'section') {
            const divisionData = [];
            const seenDivisions = new Set();
            zones.forEach(zone => {
                if (!seenDivisions.has(zone.div_code)) {
                    seenDivisions.add(zone.div_code);
                    divisionData.push({ div_code: zone.div_code, division: zone.division });
                }
            });

            const subDivisionData = [];
            const seenSubDivisions = new Set();
            zones.forEach(zone => {
                if (!seenSubDivisions.has(zone.sd_code)) {
                    seenSubDivisions.add(zone.sd_code);
                    subDivisionData.push({ sd_code: zone.sd_code, sub_division: zone.sub_division });
                }
            });

            const sectionData = zones.map(zone => ({ so_code: zone.so_code, section_office: zone.section_office }));

            setDivisionName(divisionData);
            setSubDivisions(subDivisionData);
            setSectionOptions(sectionData);

            if (divisionData.length === 1) {
                setDivision(divisionData[0].div_code);
                setIsFieldsDisabled(prev => ({ ...prev, division: true }));
            }

            if (subDivisionData.length === 1) {
                setSubDivision(subDivisionData[0].sd_code);
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
            } else {
                setSubDivision('multiple');
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
            }

            if (sectionData.length === 1) {
                setSection(sectionData[0].so_code);
                setIsFieldsDisabled(prev => ({ ...prev, section: true }));
            }
        } else if (level === 'subdivision') {
            const divisionData = [{ div_code: userZone.div_code, division: userZone.division }];

            const uniqueSubDivisions = [];
            const seenSubDivisions = new Set();
            zones.forEach(zone => {
                if (!seenSubDivisions.has(zone.sd_code)) {
                    seenSubDivisions.add(zone.sd_code);
                    uniqueSubDivisions.push({ sd_code: zone.sd_code, sub_division: zone.sub_division });
                }
            });

            setDivisionName(divisionData);
            setSubDivisions(uniqueSubDivisions);

            setDivision(userZone.div_code);
            setIsFieldsDisabled({ division: true, subDivision: uniqueSubDivisions.length === 1, section: false });

            if (uniqueSubDivisions.length === 1) {
                const selectedSdCode = uniqueSubDivisions[0].sd_code;
                setSubDivision(selectedSdCode);

                const sections = await flagIdFunction({
                    flagId: 3,
                    requestUserName: authUser.user.Email,
                    sd_code: selectedSdCode,
                    circle_code: circleCode
                });
                setSectionOptions(sections);

                if (sections.length === 1) {
                    setSection(sections[0].so_code);
                    setIsFieldsDisabled(prev => ({ ...prev, section: true }));
                }
            }
        } else if (level === 'division') {
            const uniqueDivisions = [];
            const seenDivisions = new Set();
            zones.forEach(zone => {
                if (!seenDivisions.has(zone.div_code)) {
                    seenDivisions.add(zone.div_code);
                    uniqueDivisions.push({ div_code: zone.div_code, division: zone.division });
                }
            });

            setDivisionName(uniqueDivisions);
            setIsFieldsDisabled({ division: uniqueDivisions.length === 1, subDivision: false, section: false });

            if (uniqueDivisions.length === 1) {
                const selectedDivCode = uniqueDivisions[0].div_code;
                setDivision(selectedDivCode);

                const subdivisions = await flagIdFunction({
                    flagId: 2,
                    requestUserName: authUser.user.Email,
                    div_code: selectedDivCode,
                    circle_code: circleCode
                });
                setSubDivisions(subdivisions);

                if (subdivisions.length === 1) {
                    setIsFieldsDisabled(prev => ({ ...prev, subDivision: false }));
                }
            }
        } else if (level === 'circle') {
            setIsFieldsDisabled({ division: false, subDivision: false, section: false });
        }
    }, [flagIdFunction]);

    // --- REPLACED: `fetchDocumentCounts` from DocumentManagement ---
    const fetchDocumentCounts = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            // Use the 'section' state variable, which is set by the dropdowns
            const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
            const so_code = selectedSectionObj ? selectedSectionObj.so_code : (authUser?.user?.zones?.[0]?.so_code || '');

            const approvedParams = {
                flagId: 1, // Use flagId 1 for approved count
                User_Id: userId,
                so_code: so_code
            };
            const rejectedParams = {
                flagId: 3, // Use flagId 3 for rejected count
                User_Id: userId,
                so_code: so_code
            };
            const pendingParams = {
                flagId: 5, // Use flagId 5 for pending count
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
    // --- END REPLACED FUNCTION ---


    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        resetSubsequentFilters();

        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const circleCode = authUser?.user?.zones?.[0]?.circle_code;

        if (selectedDivCode && circleCode) {
            const subdivisions = await flagIdFunction({
                flagId: 2,
                requestUserName: userName,
                div_code: selectedDivCode,
                circle_code: circleCode
            });
            setSubDivisions(subdivisions);

            if (subdivisions.length === 1 && userLevel === 'section') {
                setSubDivision(subdivisions[0].sd_code);
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));

                const sections = await flagIdFunction({
                    flagId: 3,
                    requestUserName: userName,
                    sd_code: subdivisions[0].sd_code,
                    circle_code: circleCode
                });
                setSectionOptions(sections);

                if (sections.length === 1) {
                    setSection(sections[0].so_code);
                    setIsFieldsDisabled(prev => ({ ...prev, section: true }));
                } else {
                    setIsFieldsDisabled(prev => ({ ...prev, section: false }));
                }
            } else {
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: false, section: false }));
            }
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);

        setAccountSearchInput('');
        setAccountId('');
        setHasSearched(false);
        setSearchResults([]);

        if (!isFieldsDisabled.section) {
            setSection('');
            setSectionOptions([]);
        }

        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const circleCode = authUser?.user?.zones?.[0]?.circle_code;

        if (selectedSdCode && circleCode) {
            const sections = await flagIdFunction({
                flagId: 3,
                requestUserName: userName,
                sd_code: selectedSdCode,
                circle_code: circleCode
            });
            setSectionOptions(sections);

            if (sections.length === 1) {
                setSection(sections[0].so_code);
                setIsFieldsDisabled(prev => ({ ...prev, section: true }));
            } else {
                setIsFieldsDisabled(prev => ({ ...prev, section: false }));
            }
        }
    };

    const handleSectionChange = (e) => {
        const selectedSectionCode = e.target.value;
        setSection(selectedSectionCode);

        setAccountSearchInput('');
        setAccountId('');
        setHasSearched(false);
        setSearchResults([]);
    };

    const handleAccountSearchChange = (e) => {
        const value = e.target.value;
        setAccountSearchInput(value);
        setAccountId('');
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 5) {
            setShowSuggestions(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            setShowSuggestions(true);
            const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
            const suggestions = await flagIdFunction({
                flagId: 4,
                section: selectedSectionObj?.section_office || '',
                account_id: value
            });
            setAccountSuggestions(suggestions);
            setLoading(false);
        }, 300);
    };

    const handleAccountSuggestionClick = (accId) => {
        setAccountId(accId);
        setAccountSearchInput(accId);
        setShowSuggestions(false);
        setHasSearched(false);
    };

    const handleSearch = async () => {
        if (!account_id) {
            setResponse('Please select an account ID from suggestions.');
            setErrorModal(true); return;
        }
        setLoading(true);
        const searchData = await flagIdFunction({ flagId: 5, account_id });
        if (searchData.length > 0) {
            const dataWithDocCount = searchData.map(item => ({ ...item, documentCount: item.documentCount || 0 }));
            setSearchResults(dataWithDocCount);
        } else {
            setSearchResults([]);
            setResponse('No consumer found with this account ID');
            setErrorModal(true);
        }
        setHasSearched(true);
        setLoading(false);
    };

    const resetSubsequentFilters = () => {
        if (!isFieldsDisabled.subDivision) {
            setSubDivision('');
            setSubDivisions([]);
        }
        if (!isFieldsDisabled.section) {
            setSection('');
            setSectionOptions([]);
        }
        setAccountSearchInput('');
        setAccountId('');
        setHasSearched(false);
        setSearchResults([]);
    };

    const handleResetFilters = () => {
        if (!isFieldsDisabled.division) {
            setDivision('');
            setDivisionName([]);
        }
        resetSubsequentFilters();
        loadDropdownDataFromSession();
    };

    // Verification modal handlers
    const handleVerifyClick = (consumerData) => {
        setConsumerToVerify(consumerData);
        setNoOfPages('');
        setFileNumber('');
        setVerificationModalOpen(true);
    };

    const handleModalProceed = async () => {
        setIsProcessingModal(true);
        const consumerData = consumerToVerify;

        const consumerDataWithLocation = {
            ...consumerData,
            div_code: division,
            sd_code: subDivision,
            so_code: section,
            DivisionName: divisionName.find(d => d.div_code === division)?.division || '',
            SubDivisionName: subDivisions.find(sd => sd.sd_code === subDivision)?.sub_division || '',
            SectionName: sectionOptions.find(s => s.so_code === section)?.section_office || '',
            noOfPages: noOfPages || '',
            fileNumber: fileNumber || ''
        };

        try {
            const payload = {
                flagId: 13,
                account_id: consumerData.account_id,
            };
            const response = await postDocumentUploadview(payload);

            if (response?.status === "success" && Array.isArray(response?.data) && response.data.length > 0) {
                const transformedDrafts = response.data.map(draft => ({
                    id: draft.Draft_Id, draftId: draft.Draft_Id, name: draft.DraftName, description: draft.DraftDescription,
                    tags: draft.MetaTags ? draft.MetaTags.split(',').map(tag => tag.trim()) : [],
                    category: draft.MetaTags ? draft.MetaTags.split(',')[0].trim() : 'Draft Document',
                    createdAt: draft.UploadedAt, filePath: draft.FilePath, needsFetching: true
                }));

                navigate('/DocumentReview', {
                    state: { consumerData: consumerDataWithLocation, draftDocuments: transformedDrafts }
                });
            } else {
                navigate('/DocumentReview', { state: { consumerData: consumerDataWithLocation } });
            }
        } catch (error) {
            console.error("Error fetching drafts:", error);
            setResponse("Failed to check for existing documents. Navigating directly.");
            setErrorModal(true);
            navigate('/DocumentReview', { state: { consumerData: consumerDataWithLocation } });
        } finally {
            setIsProcessingModal(false);
            setVerificationModalOpen(false);
        }
    };

    // --- REPLACED: `getFileTypeFromPath` from DocumentManagement ---
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
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: `getDocumentTypeFromPath` from DocumentManagement ---
    const getDocumentTypeFromPath = (filePath) => {
        if (!filePath) return 'Additional Document';
        const fileName = filePath ? filePath.split('\\').pop().toLowerCase() : '';
        if (fileName.includes('id') || fileName.includes('proof')) return 'ID Proof';
        if (fileName.includes('ownership')) return 'Ownership Proof';
        if (fileName.includes('khata')) return 'Khata Certificate';
        if (fileName.includes('power')) return 'Power Agreement';
        if (fileName.includes('site')) return 'Site Sketch';
        return 'Additional Document';
    };
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: `fetchApprovedDocuments` from DocumentManagement ---
    const fetchApprovedDocuments = async () => {
        try {
            setLoading(true);
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const so_code = authUser?.user?.zones?.[0]?.so_code || '';

            const params = {
                flagId: 2, // Use flagId 2 for approved data
                User_Id: userId,
                so_code: so_code
            };

            const response = await qcReviewed(params);

            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId + '_' + doc.Version_Id,
                    DocumentId: doc.DocumentId,
                    Version_Id: doc.Version_Id,
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
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: `fetchRejectedDocuments` from DocumentManagement ---
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
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: Document modal handlers ---
    const handlePendingClick = () => {
        fetchDocumentCounts(); // Refresh count
        setPendingCountModalOpen(true); // Open simple count modal
    };

    const handleApprovedClick = () => {
        setSelectedFile(null);
        setSelectedRejectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setApprovedModalOpen(true);
        fetchApprovedDocuments(); // Fetches data for the modal
        fetchDocumentCounts(); // Refreshes header count
    };

    const handleRejectedClick = () => {
        setSelectedFile(null);
        setSelectedRejectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setRejectedModalOpen(true);
        fetchRejectedDocuments(); // Fetches data for the modal
        fetchDocumentCounts(); // Refreshes header count
    };
    // --- END REPLACED HANDLERS ---

    // --- REPLACED: `handleFileSelect` from DocumentManagement ---
    const handleFileSelect = async (file) => {
        console.log('📄 File selected:', file);
        console.log('🔑 Version_Id to be sent:', file.Version_Id);

        setSelectedFile(file); // Set for Approved modal
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
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: `handleRejectedFileSelect` from DocumentManagement ---
    const handleRejectedFileSelect = async (file) => {
        setSelectedRejectedFile(file);
        setSelectedFile(file); // Also set this for the preview logic
        await handleFileSelect(file); // Reuse the same preview logic
    };
    // --- END REPLACED FUNCTION ---

    // --- ADDED: `handleDownload` from DocumentManagement ---
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
    // --- END ADDED FUNCTION ---

    // --- REPLACED: `handleReuploadClick` from DocumentManagement ---
    const handleReuploadClick = async (doc) => {
        setReuploadDocument(doc);
        setSelectedRejectedFile(doc); // Keep the item selected in the background list
        setShowReuploadModal(true);
        setReuploadFileLoading(true);
        setNewDocumentFile(null);
        setNewDocumentPreview(null);
        setReuploadOldDocPreview(null);
        setChangeReason('');


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
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: `handleReuploadSubmit` from DocumentManagement ---
    const handleReuploadSubmit = async () => {
        if (!newDocumentFile || !reuploadDocument || !changeReason) {
            setResponse('Please select a new file and provide a reason for the change.');
            setErrorModal(true);
            return;
        }

        try {
            setUploadLoading(true);
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const userEmail = authUser?.user?.Email || 'Admin';

            const formData = new FormData();

            // Find the account_id from the consumer search results or the document itself
            const consumerAccountId = (searchResults.length > 0 ? searchResults[0].account_id : null);
            const accountId = reuploadDocument.Account_Id || consumerAccountId || account_id;
            
            if (!accountId) {
                setResponse('Account ID is required for re-upload. Please search for the consumer again.');
                setErrorModal(true);
                setUploadLoading(false);
                return;
            }

            formData.append('Account_Id', accountId);
            formData.append('mannualFile', newDocumentFile);
            formData.append('DocumentName', reuploadDocument.DocumentName || reuploadDocument.name || 'Reuploaded Document');
            formData.append('DocumentDescription', reuploadDocument.DocumentDescription || reuploadDocument.description || 'Reuploaded after rejection');
            formData.append('MetaTags', reuploadDocument.MetaTags || reuploadDocument.metaTags || 'reupload,document');
            formData.append('CreatedByUser_Id', userId);
            formData.append('CreatedByUserName', userEmail);
            formData.append('Category_Id', reuploadDocument.Category_Id || '1'); // Fallback category
            formData.append('Status_Id', '1'); // Re-uploaded documents go to Pending
            formData.append('div_code', reuploadDocument.div_code || division || authUser?.user?.zones?.[0]?.div_code);
            formData.append('sd_code', reuploadDocument.sd_code || subDivision || authUser?.user?.zones?.[0]?.sd_code);
            formData.append('so_code', reuploadDocument.so_code || section || authUser?.user?.zones?.[0]?.so_code);
            formData.append('Role_Id', '1'); // Default role
            formData.append('ChangeReason', changeReason);

            const response = await postDocumentManualUpload(formData);

            if (response?.status === 'success') {
                setResponse(response.message || 'Document re-uploaded successfully!');
                setSuccessModal(true);
                await fetchRejectedDocuments(); // Refresh rejected list
                await fetchDocumentCounts(); // Refresh all counts
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
    // --- END REPLACED FUNCTION ---

    // --- REPLACED: `getFileIcon` (JSX version) ---
    // This is the correct function that returns JSX, not a string
    const getFileIcon = (fileName) => {
        if (!fileName) return <i className="ri-file-line fs-4 text-secondary"></i>;
        const extension = fileName.split('.').pop().toLowerCase();
        if (extension === 'pdf') return <i className="ri-file-pdf-line fs-4 text-danger"></i>;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <i className="ri-image-line fs-4 text-success"></i>;
        if (['doc', 'docx'].includes(extension)) return <i className="ri-file-word-line fs-4 text-primary"></i>;
        if (['xls', 'xlsx'].includes(extension)) return <i className="ri-file-excel-line fs-4 text-success"></i>;
        return <i className="ri-file-line fs-4 text-secondary"></i>;
    };
    // --- END REPLACED FUNCTION ---

    const renderSearchTableRows = () => {
        if (!hasSearched) return <tr><td colSpan={6} className="text-center p-4">Please use the filters above and search for an Account ID.</td></tr>;
        if (searchResults.length === 0) return <tr><td colSpan={6} className="text-center p-4">No consumer found with this account ID.</td></tr>;
        return searchResults.map((row) => (
            <tr key={row.account_id}>
                <td>{row.consumer_name || '-'}</td>
                <td>{row.rr_no || '-'}</td>
                <td>{row.account_id || '-'}</td>
                <td>{row.consumer_address || '-'}</td>
                <td>{row.phone || '-'}</td>
                <td>
                    <Button
                        color="primary"
                        onClick={() => handleVerifyClick(row)}
                        disabled={verifyingAccountId === row.account_id}
                    >
                        {verifyingAccountId === row.account_id ? (
                            <Spinner size="sm" className="me-1" />
                        ) : (
                            <i className="ri-file-search-line me-1"></i>
                        )}
                        {row.documentCount === 0 ? "Verify and Proceed" : "Review Documents"}
                    </Button>
                </td>
            </tr>
        ));
    };

    const ReportCard = ({ report }) => {
        const MAX_DOCS = 10;
        const progressValue = (report.documentCount / MAX_DOCS) * 100;
        const progressColor = progressValue < 50 ? "danger" : progressValue < 80 ? "warning" : "success";

        return (
            <Col xl={3} md={4} sm={6} className="mb-3">
                <Card className="h-100 shadow-sm">
                    <CardBody className="p-3">
                        <div className="d-flex align-items-center mb-2">
                            <div className="flex-shrink-0"><i className="ri-user-3-line fs-4 text-primary"></i></div>
                            <div className="flex-grow-1 ms-2">
                                <h6 className="mb-1">{report.consumer_name || 'N/A'}</h6>
                                <p className="text-muted mb-0 small">ID: {report.account_id || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="fw-medium">Documents Uploaded</small>
                                <small className={`badge ${progressValue > 0 ? 'bg-primary' : 'bg-secondary'}`}>{report.documentCount} / {MAX_DOCS}</small>
                            </div>
                            <Progress value={progressValue} color={progressColor} style={{ height: "6px" }} />
                        </div>
                    </CardBody>
                </Card>
            </Col>
        );
    };

    const getSubDivisionDisplayValue = () => {
        if (userLevel === 'section' && subDivision === 'multiple') {
            const subDivisionNames = subDivisions.map(sd => sd.sub_division).join(', ');
            return subDivisionNames;
        }
        return subDivision;
    };

    const renderSubDivisionOptions = () => {
        if (subDivisions.length === 0) {
            return <option value="">Select Sub Division</option>;
        }

        if (userLevel === 'section' && subDivisions.length > 1) {
            const allSubDivisionNames = subDivisions.map(sd => sd.sub_division).join(', ');
            return (
                <>
                    <option value="multiple" disabled>
                        {allSubDivisionNames}
                    </option>
                </>
            );
        }

        return (
            <>
                <option value="">Select Sub Division</option>
                {subDivisions.map(subDiv => (
                    <option key={subDiv.sd_code} value={subDiv.sd_code}>
                        {subDiv.sub_division}
                    </option>
                ))}
            </>
        );
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const userEmail = obj?.user?.Email;
            if (userEmail) {
                setUserName(userEmail);
                // fetchDocumentCounts(); // Don't call here, wait for section
                loadDropdownDataFromSession();
            }
        };
        loadInitialData();
    }, [loadDropdownDataFromSession]);

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const userEmail = obj?.user?.Email;
        if (userEmail) {
            loadReportData(userEmail);
        } else {
            setReportLoading(false);
        }
    }, [loadReportData]);

    useEffect(() => {
        return () => {
            if (newDocumentPreview?.url) URL.revokeObjectURL(newDocumentPreview.url);
            if (previewContent?.url && previewContent.url.startsWith('blob:')) URL.revokeObjectURL(previewContent.url);
            if (reuploadOldDocPreview?.url) URL.revokeObjectURL(reuploadOldDocPreview.url);
        };
    }, [newDocumentPreview, previewContent, reuploadOldDocPreview]);

    // This effect updates counts when the section filter changes
    useEffect(() => {
        if (userName && section) { // Only fetch counts when a user and section are set
            fetchDocumentCounts();
        }
    }, [section, userName]);


    return (
        <div className="page-content">
            <BreadCrumb pageTitle="Scan Documents" />
            <Container fluid>
                <SuccessModal show={successModal} onCloseClick={() => setSuccessModal(false)} successMsg={response} />
                <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} errorMsg={response || 'An error occurred'} />

                <Card className="mb-4">
                    <CardHeader className="bg-primary text-white p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0 text-white">Consumer Search and Document Verification</h4>
                            <div className="d-flex gap-2">
                                <Button size="sm" onClick={handlePendingClick} style={modernBtnStyle} className="d-flex align-items-center gap-1" title="Pending Documents">
                                    <i className="ri-time-line"></i>
                                    <span style={{ fontSize: '1rem' }}>Pending</span>
                                    <Badge color="warning" pill>{documentCounts.pending}</Badge>
                                </Button>
                                <Button size="sm" onClick={handleApprovedClick} style={modernBtnStyle} className="d-flex align-items-center gap-1" title="Approved Documents">
                                    <i className="ri-checkbox-circle-line"></i>
                                    <span style={{ fontSize: '1rem' }}>Approved</span>
                                    <Badge color="success" pill>{documentCounts.approved}</Badge>
                                </Button>
                                <Button size="sm" onClick={handleRejectedClick} style={modernBtnStyle} className="d-flex align-items-center gap-1" title="Rejected Documents">
                                    <i className="ri-close-circle-line"></i>
                                    <span style={{ fontSize: '1rem' }}>Rejected</span>
                                    <Badge color="danger" pill>{documentCounts.rejected}</Badge>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Row className="g-3 mb-3">
                            <Col md={4}>
                                <FormGroup>
                                    <Label>Division<span className="text-danger">*</span></Label>
                                    <Input type="select" value={division} onChange={handleDivisionChange} disabled={isFieldsDisabled.division}>
                                        <option value="">Select Division</option>
                                        {divisionName.map(div => <option key={div.div_code} value={div.div_code}>{div.division}</option>)}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label>Sub Division<span className="text-danger">*</span></Label>
                                    <Input
                                        type="select"
                                        value={subDivision}
                                        onChange={handleSubDivisionChange}
                                        disabled={isFieldsDisabled.subDivision || !division}
                                    >
                                        {renderSubDivisionOptions()}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label>Section<span className="text-danger">*</span></Label>
                                    <Input type="select" value={section} onChange={handleSectionChange} disabled={isFieldsDisabled.section || !subDivision}>
                                        <option value="">Select Section</option>
                                        {sectionOptions.map(sec => <option key={sec.so_code} value={sec.so_code}>{sec.section_office}</option>)}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="g-3 mb-4 justify-content-center">
                            <Col md={8} lg={6} className="d-flex flex-column align-items-center">
                                <FormGroup className="mb-0 w-100">
                                    <Label className="text-center d-block">Enter Account ID (min 5 chars)<span className="text-danger">*</span></Label>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div className="position-relative me-2" style={{ width: "250px" }}>
                                            <Input type="text" value={accountSearchInput} onChange={handleAccountSearchChange} placeholder="Enter Account ID" disabled={!section} />
                                            {showSuggestions && (
                                                <ListGroup className="position-absolute w-100" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto", textAlign: 'left' }}>
                                                    {loading ? (<ListGroupItem>Loading...</ListGroupItem>) :
                                                        accountSuggestions.length > 0 ? (accountSuggestions.map((acc) => (
                                                            <ListGroupItem key={acc.account_id} action onClick={() => handleAccountSuggestionClick(acc.account_id)}>{acc.account_id}</ListGroupItem>
                                                        ))) : (<ListGroupItem>No data found</ListGroupItem>)}
                                                </ListGroup>
                                            )}
                                        </div>
                                        <Button color="primary" className="rounded px-3" style={{ minWidth: "100px" }} onClick={handleSearch} disabled={!account_id || loading}>
                                            {loading ? <><Spinner size="sm" className="me-1" /> Searching...</> : <><i className="ri-search-line me-1"></i> Search</>}
                                        </Button>
                                        <Button color="light" className="rounded px-3 ms-2" style={{ minWidth: "100px" }} onClick={handleResetFilters}>Reset</Button>
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg={12}>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped align-middle table-nowrap mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Consumer Name</th>
                                                <th>RrNo</th>
                                                <th>Account ID</th>
                                                <th>Consumer Address</th>
                                                <th>Phone</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {renderSearchTableRows()}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader
                        className="bg-light p-3 position-relative d-flex justify-content-between align-items-center"
                        style={{ borderTop: "3px solid #405189", cursor: "pointer" }}
                        onClick={toggleReportCollapse}
                    >
                        <h5 className="mb-0">My Report</h5>
                        <Button color="link" className="p-0" onClick={toggleReportCollapse} style={{ textDecoration: 'none' }} aria-expanded={!isReportCollapsed} aria-controls="report-collapse">
                            <i className={`ri-${isReportCollapsed ? 'add' : 'subtract'}-line fs-5 text-dark`}></i>
                        </Button>
                    </CardHeader>
                    <Collapse isOpen={!isReportCollapsed} id="report-collapse">
                        <CardBody>
                            {reportLoading ?
                                (<div className="text-center p-4"><Spinner size="lg" color="primary" /><h6 className="mt-2">Loading Report...</h6></div>)
                                : reportData.length > 0 ?
                                    (<div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '15px' }}><Row>{reportData.map((report) => (<ReportCard key={report.account_id} report={report} />))}</Row></div>)
                                    : (<div className="text-center p-5"><div className="mb-3"><i className="ri-file-text-line" style={{ fontSize: "4rem", color: "#adb5bd" }}></i></div><h4>No Report Data Found</h4><p className="text-muted">There is currently no report data associated with your account.</p></div>)}
                        </CardBody>
                    </Collapse>
                </Card>


                {/* Verification Modal */}
                <Modal isOpen={verificationModalOpen} toggle={() => setVerificationModalOpen(false)} size="lg" centered backdrop="static">
                    <ModalHeader toggle={() => setVerificationModalOpen(false)} className="bg-primary text-white">
                        Document Verification for: {consumerToVerify?.consumer_name || 'N/A'}
                    </ModalHeader>
                    <ModalBody>
                        <Alert color="info">Please enter the required verification details before proceeding to document review.</Alert>
                        <Form>
                            <Row className="g-3">
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>No. of Pages</Label>
                                        <Input type="number" value={noOfPages} onChange={(e) => setNoOfPages(e.target.value)} placeholder="Enter page count" min="1" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>File Number</Label>
                                        <Input type="text" value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} placeholder="Enter file reference number" />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={() => setVerificationModalOpen(false)} disabled={isProcessingModal}>Cancel</Button>
                        <Button
                            color="success"
                            onClick={handleModalProceed}
                            disabled={isProcessingModal}
                        >
                            {isProcessingModal ? <><Spinner size="sm" className="me-1" /> Processing...</> : 'Save & Proceed'}
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* --- REPLACED: Simple Modal for Pending Count --- */}
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
                {/* --- END REPLACED MODAL --- */}

                {/* --- REPLACED: Approved Modal --- */}
                <Modal
                    isOpen={approvedModalOpen}
                    toggle={() => {
                        setApprovedModalOpen(false);
                        setSelectedFile(null);
                        setPreviewContent(null);
                        setPreviewError(null);
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
                        <div className="d-flex align-items-center">
                            <h5 className="mb-0 text-white">Approved Documents</h5>
                            <Badge color="light" pill className="ms-2 text-primary">
                                {documentCounts.approved} Approved
                            </Badge>
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-3">
                        <Container fluid>
                            {/* --- MODIFIED FOR RESPONSIVENESS --- */}
                            <Row className="g-3 results-container">
                                <Col lg={3} md={6} className="d-flex flex-column"> {/* Info Panels */}
                                    <Card className="mb-3 slide-in-left">
                                        <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Consumer Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedFile ? (
                                                <div className="consumer-details">
                                                    <div className="row g-0">
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="ri-user-3-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">RR No:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.rr_no || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="ri-profile-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.consumer_name || '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
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

                                    <Card className="slide-in-left delay-1">
                                        <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Document Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedFile ? (
                                                <div className="document-details">
                                                    <div className="d-flex align-items-center mb-3">
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
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-file-text-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approval Comment:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.description || 'None'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-user-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approved By:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.createdBy}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-calendar-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approved On:</Label>
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

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-git-branch-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Version:</Label>
                                                                    <Badge color="info" className="badge-soft-info x-small">
                                                                        {selectedFile.versionLabel} {selectedFile.isLatest && '(Latest)'}
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

                                <Col lg={3} md={6} className="d-flex flex-column"> {/* File List */}
                                    <Card className="fade-in delay-2 d-flex flex-column" style={{flexGrow: 1}}>
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
                                            <div className="uploaded-documents-scrollable">
                                                {loading ? (
                                                    <div className="text-center py-4">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <p className="mt-2">Loading approved documents...</p>
                                                    </div>
                                                ) : approvedDocuments.length > 0 ? (
                                                    <ListGroup flush>
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
                                                                            Version: {doc.versionLabel} {doc.isLatest && '(Latest)'}
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

                                <Col lg={6} md={12} className="d-flex flex-column"> {/* Preview */}
                                    <Card className="slide-in-right delay-3 d-flex flex-column" style={{flexGrow: 1}}>
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
                {/* --- END REPLACED MODAL --- */}

                {/* --- REPLACED: Rejected Modal --- */}
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
                        <div className="d-flex align-items-center">
                            <h5 className="mb-0 text-white">Rejected Documents</h5>
                            <Badge color="light" pill className="ms-2 text-danger">
                                {documentCounts.rejected} Rejected
                            </Badge>
                        </div>
                    </ModalHeader>

                    <ModalBody className="p-3">
                        <Container fluid>
                            {/* --- MODIFIED FOR RESPONSIVENESS --- */}
                            <Row className="g-3 results-container">
                                <Col lg={3} md={6} className="d-flex flex-column"> {/* Info Panels */}
                                    <Card className="mb-3 slide-in-left">
                                        <CardHeader className="bg-light p-3 position-relative"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Consumer Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedRejectedFile ? (
                                                <div className="consumer-details">
                                                    <div className="row g-0">
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="ri-user-3-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">RR Number:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.rr_no || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="ri-profile-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Name:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.consumer_name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="ri-map-pin-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
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

                                    <Card className="slide-in-left delay-1">
                                        <CardHeader className="bg-light p-3 position-relative"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Document Information</h5>
                                        </CardHeader>
                                        <CardBody className="p-1 custom-scrollbar">
                                            {selectedRejectedFile ? (
                                                <div className="document-details">
                                                    <div className="d-flex align-items-center mb-3">
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
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-file-text-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Rejection Reason:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.RejectionComment || 'None'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-user-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Rejected By:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.createdBy}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-calendar-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Rejected On:</Label>
                                                                    <span className="fw-semibold x-small">{selectedRejectedFile.createdAt}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-close-circle-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Status:</Label>
                                                                    <Badge color="danger" className="badge-soft-danger x-small">
                                                                        {selectedRejectedFile.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-git-branch-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Version:</Label>
                                                                    <Badge color="info" className="badge-soft-info x-small">
                                                                        {selectedRejectedFile.versionLabel} {selectedRejectedFile.isLatest && '(Latest)'}
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

                                <Col lg={3} md={6} className="d-flex flex-column"> {/* File List */}
                                    <Card className="fade-in delay-2 d-flex flex-column" style={{flexGrow: 1}}>
                                        <CardHeader className="bg-light d-flex justify-content-between align-items-center"
                                            style={{ borderTop: '3px solid #405189' }}>
                                            <h5 className="mb-0">Rejected Documents</h5>
                                            <Badge color="danger" pill className="px-3 py-2">
                                                {rejectedDocuments.length} files
                                            </Badge>
                                        </CardHeader>

                                        <CardBody className="p-0 uploaded-documents-container">
                                            <div className="uploaded-documents-scrollable p-2">
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
                                                                            Version: {doc.versionLabel} {doc.isLatest && '(Latest)'}
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

                                <Col lg={6} md={12} className="d-flex flex-column"> {/* Preview */}
                                    <Card className="slide-in-right delay-3 d-flex flex-column" style={{flexGrow: 1}}>
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
                {/* --- END REPLACED MODAL --- */}

                {/* --- REPLACED: Re-upload Document Modal --- */}
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
                                    <div className="d-flex align-items-center mb-3">
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
                                                        <div className="text-center p-3 h-100 d-flex align-items-center justify-content-center">
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
                                        <Label for="documentReupload">Select new file<span className="text-danger">*</span></Label>
                                        <Input
                                            type="file"
                                            id="documentReupload"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > MAX_FILE_SIZE) {
                                                        setResponse("File size must be less than 2MB");
                                                        setErrorModal(true);
                                                        e.target.value = null; // Clear the input
                                                        return;
                                                    }
                                                    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
                                                        setResponse("Unsupported file format. Please upload PDF, JPG, or PNG.");
                                                        setErrorModal(true);
                                                        e.target.value = null; // Clear the input
                                                        return;
                                                    }

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
                                        <Label for="changeReason">Change Reason<span className="text-danger">*</span></Label>
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
                                                        <div className="text-center p-3 h-100 d-flex align-items-center justify-content-center">
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
                {/* --- END REPLACED MODAL --- */}

                <style>
                    {`
                        /* --- STYLES FROM PREVIEW.JS --- */
                        .results-container {
                            /* Original styles removed as they caused issues */
                        }
                        .scrollable-content {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            overflow-y: auto;
                            overflow-x: hidden;
                        }
                        .drop-zone {
                            border: 2px dashed #e9ecef;
                            transition: all 0.2s ease-in-out;
                        }
                        .drop-zone-active {
                            border-color: #405189;
                            background-color: #f0f3ff;
                        }

                        /* --- STYLES ADDED/MODIFIED FOR RESPONSIVENESS --- */
                        .custom-large-modal .modal-dialog {
                            max-width: 90%;
                            width: 90%;
                        }
                        
                        .fixed-height-card { /* This class is kept but height:100% is removed */
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .uploaded-documents-container {
                            /* Cleaned up styles */
                        }
                        
                        .uploaded-documents-scrollable {
                            overflow-y: auto;
                            padding: 0;
                            max-height: 500px; /* Fixed max-height for scrolling */
                            min-height: 300px; /* Give it some min-height so it doesn't collapse */
                        }
                        
                        .preview-container {
                            background-color: #f8f9fa;
                        }
                        
                        .preview-scrollable {
                            overflow: auto; 
                            padding: 0;
                            display: flex;
                            flex-direction: column;
                            height: 550px; /* Give a fixed height for the preview area */
                        }
                        
                        .pdf-viewer-container {
                            flex-grow: 1;
                            width: 100%;
                            height: 100%;
                        }
                        
                        .preview-content {
                            flex-grow: 1;
                        }
                        
                        .document-card {
                            transition: all 0.2s ease-in-out;
                            cursor: pointer;
                            border-left: 3px solid transparent;
                        }
                        
                        .document-card:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                            border-left-color: #405189;
                        }
                        
                        .document-card.active {
                            background-color: #e9ecef;
                            border-left-color: #9299b1ff;
                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                        }
                        
                        .consumer-details,
                        .document-details {
                            padding: 1rem;
                        }
                        
                        .x-small {
                            font-size: 0.8rem;
                        }
                        
                        .custom-scrollbar {
                            overflow-y: auto;
                            flex-grow: 1;
                        }
                        
                        /* Animations */
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        
                        @keyframes slideInLeft {
                            from { transform: translateX(-20px); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                        
                        @keyframes slideInRight {
                            from { transform: translateX(20px); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                        
                        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                        .slide-in-left { animation: slideInLeft 0.5s ease-out forwards; }
                        .slide-in-right { animation: slideInRight 0.5s ease-out forwards; }
                        
                        .fade-in-list-item {
                            animation: fadeIn 0.4s ease-out forwards;
                            opacity: 0;
                        }
                        
                        .delay-1 { animation-delay: 0.1s; }
                        .delay-2 { animation-delay: 0.2s; }
                        .delay-3 { animation-delay: 0.3s; }
                        
                        .shadow-sm--hover:hover {
                            box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
                        }
                    `}
                </style>
            </Container>
        </div>
    );
};

export default Preview;