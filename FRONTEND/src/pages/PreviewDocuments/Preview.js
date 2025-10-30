import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row, Label,
    ListGroup, ListGroupItem, Spinner, Form, FormGroup, Input, Progress,
    Modal, ModalHeader, ModalBody, ModalFooter, Badge, Alert
} from 'reactstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getDocumentDropdowns, qcReviewed, view, postDocumentUploadview } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';

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
    const [contractorName, setContractorName] = useState('');
    const [approvedBy, setApprovedBy] = useState('');
    const [category, setCategory] = useState('');
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

    // Document modal states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
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
    const [zoomLevel, setZoomLevel] = useState(100);
    const [reuploadDocument, setReuploadDocument] = useState(null);
    const [newDocumentFile, setNewDocumentFile] = useState(null);
    const [newDocumentPreview, setNewDocumentPreview] = useState(null);
    const [reuploadFileLoading, setReuploadFileLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [reuploadOldDocPreview, setReuploadOldDocPreview] = useState(null);

    const modernBtnStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '0.2rem 0.6rem'
    };

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

    // UPDATED: Load dropdown data using circle_code from user zones
    const loadDropdownDataFromSession = useCallback(async () => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const zones = authUser?.user?.zones || [];

        if (zones.length === 0) return;

        const userZone = zones[0];
        const level = userZone.level;
        const circleCode = userZone.circle_code; // Get circle_code from user zones
        setUserLevel(level);

        console.log("User Level:", level);
        console.log("Circle Code:", circleCode);
        console.log("All Zones:", zones);

        // Fetch divisions using circle_code for all user levels
        if (circleCode) {
            try {
                const divisions = await flagIdFunction({ 
                    flagId: 1, 
                    requestUserName: authUser.user.Email,
                    circle_code: circleCode // Pass circle_code to API
                });
                setDivisionName(divisions);
                console.log("Fetched divisions:", divisions);
            } catch (error) {
                console.error("Error fetching divisions:", error);
            }
        }

        if (level === 'section') {
            // Get unique divisions from zones
            const divisionData = [];
            const seenDivisions = new Set();
            zones.forEach(zone => {
                if (!seenDivisions.has(zone.div_code)) {
                    seenDivisions.add(zone.div_code);
                    divisionData.push({ div_code: zone.div_code, division: zone.division });
                }
            });

            // Get unique sub-divisions from zones
            const subDivisionData = [];
            const seenSubDivisions = new Set();
            zones.forEach(zone => {
                if (!seenSubDivisions.has(zone.sd_code)) {
                    seenSubDivisions.add(zone.sd_code);
                    subDivisionData.push({ sd_code: zone.sd_code, sub_division: zone.sub_division });
                }
            });

            // Get all sections from zones
            const sectionData = zones.map(zone => ({ so_code: zone.so_code, section_office: zone.section_office }));

            setDivisionName(divisionData);
            setSubDivisions(subDivisionData);
            setSectionOptions(sectionData);

            // Set division if only one exists
            if (divisionData.length === 1) {
                setDivision(divisionData[0].div_code);
                setIsFieldsDisabled(prev => ({ ...prev, division: true }));
            }

            // Set sub-division display value
            if (subDivisionData.length === 1) {
                setSubDivision(subDivisionData[0].sd_code);
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
            } else {
                // For multiple sub-divisions, set a special value to display all
                setSubDivision('multiple');
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
            }

            // Set section if only one exists
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

                // For division level, don't auto-select if there's only one sub-division
                // Let the user choose from dropdown normally
                if (subdivisions.length === 1) {
                    // Don't auto-select, just set the field as enabled
                    setIsFieldsDisabled(prev => ({ ...prev, subDivision: false }));
                }
            }
        } else if (level === 'circle') {
            // Handle circle level access - divisions are already fetched above
            setIsFieldsDisabled({ division: false, subDivision: false, section: false });
        }
    }, [flagIdFunction]);

    // Document count function
    const fetchDocumentCounts = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            if (!userId) return;

            const [approvedResponse, rejectedResponse, pendingResponse] = await Promise.all([
                qcReviewed({ flagId: 1, User_Id: userId }),
                qcReviewed({ flagId: 2, User_Id: userId }),
                qcReviewed({ flagId: 3, User_Id: userId })
            ]);
            setDocumentCounts({
                approved: approvedResponse?.count || 0,
                rejected: rejectedResponse?.count || 0,
                pending: pendingResponse?.count || 0
            });
        } catch (error) {
            console.error("Error fetching document counts:", error);
        }
    };

    // UPDATED: Handle division change with circle_code
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

    // UPDATED: Handle sub-division change with circle_code
    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);

        // Reset account search fields when section changes
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
        
        // Reset account search fields when section changes
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
        setContractorName('');
        setApprovedBy('');
        setCategory('');
        setVerificationModalOpen(true);
    };

    const handleModalProceed = async () => {
        // --- 1. Validate Fields ---
        if (!noOfPages || !fileNumber || !contractorName || !approvedBy || !category) {
            setResponse('Please fill all the verification fields.');
            setErrorModal(true);
            return;
        }
        
        setIsProcessingModal(true);
        const consumerData = consumerToVerify;

        const verificationData = {
            noOfPages: noOfPages,
            fileNumber: fileNumber,
            contractorName: contractorName,
            approvedBy: approvedBy,
            category: category,
            account_id: consumerData.account_id,
            timestamp: new Date().toISOString()
        };

        sessionStorage.setItem("verificationData", JSON.stringify(verificationData));
        console.log("Verification Data Stored in Session Storage:", verificationData);
        
        const consumerDataWithLocation = {
            ...consumerData,
            div_code: division,
            sd_code: subDivision,
            so_code: section,
            DivisionName: divisionName.find(d => d.div_code === division)?.division || '',
            SubDivisionName: subDivisions.find(sd => sd.sd_code === subDivision)?.sub_division || '',
            SectionName: sectionOptions.find(s => s.so_code === section)?.section_office || '',
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

    // Document modal handlers
    const handlePendingClick = () => {
        setStatusModalOpen(true);
    };

    const handleApprovedClick = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            if (!userId) return;

            const approvedResponse = await qcReviewed({ flagId: 1, User_Id: userId });
            setApprovedDocuments(approvedResponse?.data || []);
            setApprovedModalOpen(true);
        } catch (error) {
            console.error("Error fetching approved documents:", error);
            setResponse("Failed to fetch approved documents");
            setErrorModal(true);
        }
    };

    const handleRejectedClick = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            if (!userId) return;

            const rejectedResponse = await qcReviewed({ flagId: 2, User_Id: userId });
            setRejectedDocuments(rejectedResponse?.data || []);
            setRejectedModalOpen(true);
        } catch (error) {
            console.error("Error fetching rejected documents:", error);
            setResponse("Failed to fetch rejected documents");
            setErrorModal(true);
        }
    };

    const handleFileSelect = async (file) => {
        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewError(null);

        if (file.type.startsWith('image/')) {
            setPreviewContent({ type: file.type.split('/')[1], url: URL.createObjectURL(file) });
            setPreviewLoading(false);
        } else {
            setPreviewContent(null);
            setPreviewLoading(false);
            setPreviewError('Preview not available for this file type');
        }
    };

    const handleRejectedFileSelect = async (file) => {
        setSelectedRejectedFile(file);
        setPreviewLoading(true);
        setPreviewError(null);

        if (file.type.startsWith('image/')) {
            setPreviewContent({ type: file.type.split('/')[1], url: URL.createObjectURL(file) });
            setPreviewLoading(false);
        } else {
            setPreviewContent(null);
            setPreviewLoading(false);
            setPreviewError('Preview not available for this file type');
        }
    };

    const handleReuploadClick = async (doc) => {
        setReuploadDocument(doc);
        setNewDocumentFile(null);
        setNewDocumentPreview(null);
        setShowReuploadModal(true);
    };

    const handleReuploadSubmit = async () => {
        if (!newDocumentFile) {
            setResponse('Please select a file to re-upload');
            setErrorModal(true);
            return;
        }

        setUploadLoading(true);
        try {
            // Implement re-upload logic here
            setResponse('Document re-uploaded successfully');
            setSuccessModal(true);
            setShowReuploadModal(false);
            fetchDocumentCounts();
        } catch (error) {
            setResponse('Failed to re-upload document');
            setErrorModal(true);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleReuploadDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setNewDocumentFile(file);
            if (file.type.startsWith('image/')) {
                setNewDocumentPreview({ type: file.type.split('/')[1], url: URL.createObjectURL(file) });
            } else {
                setNewDocumentPreview(null);
            }
            e.dataTransfer.clearData();
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleZoomReset = () => setZoomLevel(100);

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return 'ri-file-pdf-line text-danger';
            case 'doc': case 'docx': return 'ri-file-word-line text-primary';
            case 'xls': case 'xlsx': return 'ri-file-excel-line text-success';
            case 'jpg': case 'jpeg': case 'png': case 'gif': return 'ri-image-line text-info';
            default: return 'ri-file-line text-secondary';
        }
    };

    const getFileTypeFromPath = (filePath) => {
        return filePath.split('.').pop()?.toLowerCase() || 'unknown';
    };

    const getDocumentTypeFromPath = (filePath) => {
        const fileName = filePath.split('/').pop() || '';
        if (fileName.includes('aadhar') || fileName.includes('id')) return 'ID Proof';
        if (fileName.includes('contract')) return 'Contract';
        if (fileName.includes('invoice')) return 'Invoice';
        if (fileName.includes('agreement')) return 'Agreement';
        return 'Other';
    };

    const fetchApprovedDocuments = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            if (!userId) return;

            const response = await qcReviewed({ flagId: 1, User_Id: userId });
            setApprovedDocuments(response?.data || []);
        } catch (error) {
            console.error("Error fetching approved documents:", error);
        }
    };

    const fetchRejectedDocuments = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            if (!userId) return;

            const response = await qcReviewed({ flagId: 2, User_Id: userId });
            setRejectedDocuments(response?.data || []);
        } catch (error) {
            console.error("Error fetching rejected documents:", error);
        }
    };

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

    // Function to get display value for sub-division dropdown
    const getSubDivisionDisplayValue = () => {
        if (userLevel === 'section' && subDivision === 'multiple') {
            // Return comma-separated list of all sub-divisions only for section level
            const subDivisionNames = subDivisions.map(sd => sd.sub_division).join(', ');
            return subDivisionNames;
        }
        return subDivision;
    };

    // Function to render sub-division dropdown options
    const renderSubDivisionOptions = () => {
        if (subDivisions.length === 0) {
            return <option value="">Select Sub Division</option>;
        }

        // For section level with multiple sub-divisions, show comma-separated in a single disabled option
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

        // For all other cases (division, circle, subdivision levels), show normal dropdown options
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
                fetchDocumentCounts();
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
        };
    }, [newDocumentPreview, previewContent]);

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
                        <Row className="g-3 mb-4">
                            <Col md={8}>
                                <FormGroup className="mb-0">
                                    <Label>Enter Account ID (min 5 chars)<span className="text-danger">*</span></Label>
                                    <div className="d-flex align-items-center">
                                        <div className="position-relative me-3" style={{ width: "350px" }}>
                                            <Input type="text" value={accountSearchInput} onChange={handleAccountSearchChange} placeholder="Enter Account ID" disabled={!section} />
                                            {showSuggestions && (
                                                <ListGroup className="position-absolute w-100" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                                                    {loading ? ( <ListGroupItem>Loading...</ListGroupItem> ) :
                                                    accountSuggestions.length > 0 ? ( accountSuggestions.map((acc) => (
                                                        <ListGroupItem key={acc.account_id} action onClick={() => handleAccountSuggestionClick(acc.account_id)}>{acc.account_id}</ListGroupItem>
                                                    ))) : ( <ListGroupItem>No data found</ListGroupItem> )}
                                                </ListGroup>
                                            )}
                                        </div>
                                        <Button color="primary" className="rounded px-4" style={{ minWidth: "120px" }} onClick={handleSearch} disabled={!account_id || loading}>
                                            {loading ? <><Spinner size="sm" className="me-1" /> Searching...</> : <><i className="ri-search-line me-1"></i> Search</>}
                                        </Button>
                                        <Button color="light" className="rounded px-4 ms-2" style={{ minWidth: "120px" }} onClick={handleResetFilters}>Reset</Button>
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
                    <CardHeader className="bg-light p-3 position-relative" style={{ borderTop: "3px solid #405189" }}>
                        <h5 className="mb-0">My Report</h5>
                    </CardHeader>
                    <CardBody>
                        {reportLoading ?
                            (<div className="text-center p-4"><Spinner size="lg" color="primary" /><h6 className="mt-2">Loading Report...</h6></div>)
                            : reportData.length > 0 ?
                                (<div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '15px' }}><Row>{reportData.map((report) => (<ReportCard key={report.account_id} report={report} />))}</Row></div>)
                                : (<div className="text-center p-5"><div className="mb-3"><i className="ri-file-text-line" style={{ fontSize: "4rem", color: "#adb5bd" }}></i></div><h4>No Report Data Found</h4><p className="text-muted">There is currently no report data associated with your account.</p></div>)}
                    </CardBody>
                </Card>

                {/* ################################################# */}
                {/* --- NEW VERIFICATION INPUT MODAL --- */}
                {/* ################################################# */}
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
                                        {/* --- MODIFIED: Removed asterisk --- */}
                                        <Label>No. of Pages</Label>
                                        <Input type="number" value={noOfPages} onChange={(e) => setNoOfPages(e.target.value)} placeholder="Enter page count" min="1" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        {/* --- MODIFIED: Removed asterisk --- */}
                                        <Label>File Number</Label>
                                        <Input type="text" value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} placeholder="Enter file reference number" />
                                    </FormGroup>
                                </Col>
                                {/* <Col md={6}>
                                    <FormGroup>
                                        <Label>Contractor Name<span className="text-danger">*</span></Label>
                                        <Input type="text" value={contractorName} onChange={(e) => setContractorName(e.target.value)} placeholder="Enter contractor's name" />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Approved By<span className="text-danger">*</span></Label>
                                        <Input type="text" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} placeholder="Enter approver's name" />
                                            
                                        
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Category<span className="text-danger">*</span></Label>
                                        <Input type="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                            <option value="">Select Category</option>
                                            <option value="Agriculture">Agriculture</option>
                                            <option value="Industry">Industry</option>
                                            <option value="Rural">Rural</option>
                                            <option value="Town">Town</option>
                                            <option value="Domestic">Domestic</option>
                                            <option value="Others">Others</option>
                                        </Input>
                                    </FormGroup>
                                </Col> */}
                            </Row>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={() => setVerificationModalOpen(false)} disabled={isProcessingModal}>Cancel</Button>
                        <Button 
                            color="success" 
                            onClick={handleModalProceed} 
                            // --- MODIFIED: Removed field checks from disabled prop ---
                            disabled={isProcessingModal}
                        >
                            {isProcessingModal ? <><Spinner size="sm" className="me-1" /> Processing...</> : 'Save & Proceed'}
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Other Modals */}
                <Modal isOpen={statusModalOpen} toggle={() => setStatusModalOpen(false)} centered>
                    <ModalHeader toggle={() => setStatusModalOpen(false)}>Pending Documents</ModalHeader>
                    <ModalBody><p>A list of documents pending review would be displayed here.</p><p className='text-center'>Total Pending: {documentCounts.pending}</p></ModalBody>
                    <ModalFooter><Button color="secondary" onClick={() => setStatusModalOpen(false)}>Close</Button></ModalFooter>
                </Modal>

                <Modal isOpen={approvedModalOpen} toggle={() => setApprovedModalOpen(false)} size="xl">
                    <ModalHeader className="bg-primary text-white" toggle={() => setApprovedModalOpen(false)}>Approved Documents <Badge color="light" pill className="ms-2 text-primary">{documentCounts.approved} Approved</Badge></ModalHeader>
                    <ModalBody className="p-3">
                        <p>Approved documents list would be displayed here.</p>
                    </ModalBody>
                </Modal>

                <Modal isOpen={rejectedModalOpen} toggle={() => setRejectedModalOpen(false)} size="xl" backdrop={showReuploadModal ? 'static' : true}>
                    <ModalHeader className="bg-primary text-white" toggle={() => !showReuploadModal && setRejectedModalOpen(false)}>
                        Rejected Documents <Badge color="light" pill className="ms-2 text-danger">{documentCounts.rejected} Rejected</Badge>
                    </ModalHeader>
                    <ModalBody className="p-3">
                        <p>Rejected documents list would be displayed here.</p>
                    </ModalBody>
                </Modal>

                <Modal isOpen={showReuploadModal} toggle={() => setShowReuploadModal(false)} size="lg" centered backdrop="static">
                    <ModalHeader toggle={() => setShowReuploadModal(false)} className="bg-primary text-white">Re-upload Document</ModalHeader>
                    <ModalBody>
                        <p>Re-upload functionality would be implemented here.</p>
                    </ModalBody>
                    <ModalFooter><Button color="light" onClick={() => setShowReuploadModal(false)}>Cancel</Button><Button color="primary" onClick={handleReuploadSubmit} disabled={!newDocumentFile || uploadLoading}>{uploadLoading ? <><Spinner size="sm" /> Re-uploading...</> : 'Submit Re-upload'}</Button></ModalFooter>
                </Modal>

                <style>
                    {`
                        .results-container {
                            height: calc(100vh - 250px);
                            min-height: 500px;
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
                        `}
                </style>
            </Container>
        </div>
    );
};

export default Preview;