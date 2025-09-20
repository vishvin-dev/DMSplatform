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
    document.title = ` Consumer search   | DMS`;
    const navigate = useNavigate();
    const location = useLocation();
    const debounceRef = useRef();
    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');

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
    const [reuploadOldDocPreview, setReuploadOldDocPreview] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const modernBtnStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '0.2rem 0.6rem'
    };

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
        setUserLevel(level);

        if (level === 'section') {
            const divisionData = [{ div_code: userZone.div_code, division: userZone.division }];
            const subDivisionData = [{ sd_code: userZone.sd_code, sub_division: userZone.sub_division }];
            const sectionData = zones.map(zone => ({ so_code: zone.so_code, section_office: zone.section_office }));

            setDivisionName(divisionData);
            setSubDivisions(subDivisionData);
            setSectionOptions(sectionData);
            
            setDivision(userZone.div_code);
            setSubDivision(userZone.sd_code);
            setIsFieldsDisabled({ division: true, subDivision: true, section: sectionData.length === 1 });
            
            if (sectionData.length === 1) {
                setSection(sectionData[0].so_code);
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
                
                const sections = await flagIdFunction({ flagId: 3, requestUserName: userName, sd_code: selectedSdCode });
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
                
                const subdivisions = await flagIdFunction({ flagId: 2, requestUserName: userName, div_code: selectedDivCode });
                setSubDivisions(subdivisions);
                
                if (subdivisions.length === 1) {
                    setSubDivision(subdivisions[0].sd_code);
                    setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
                    
                    const sections = await flagIdFunction({ flagId: 3, requestUserName: userName, sd_code: subdivisions[0].sd_code });
                    setSectionOptions(sections);
                    
                    if (sections.length === 1) {
                        setSection(sections[0].so_code);
                        setIsFieldsDisabled(prev => ({ ...prev, section: true }));
                    }
                }
            }
        }
    }, [flagIdFunction, userName]);

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

    const getFileTypeFromPath = (filePath) => {
        if (!filePath) return 'application/octet-stream';
        const extension = filePath.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return 'application/pdf';
            case 'jpg': case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
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
    const fetchApprovedDocuments = async () => {
        try {
            setLoading(true);
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;
            const response = await qcReviewed({ flagId: 1, User_Id: userId });
            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId, DocumentId: doc.DocumentId,
                    name: doc.FilePath ? doc.FilePath.split('\\').pop() : `Document_${doc.DocumentId}`,
                    type: getFileTypeFromPath(doc.FilePath), category: getDocumentTypeFromPath(doc.FilePath),
                    createdAt: new Date(doc.ApprovedOn).toLocaleDateString(),
                    ...doc
                }));
                setApprovedDocuments(transformedDocuments);
            } else {
                setApprovedDocuments([]);
            }
        } catch (error) {
            console.error("Error fetching approved documents:", error);
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
            const response = await qcReviewed({ flagId: 2, User_Id: userId });
            if (response?.status === 'success' && response?.results) {
                const transformedDocuments = response.results.map(doc => ({
                    id: doc.DocumentId, DocumentId: doc.DocumentId,
                    name: doc.FilePath ? doc.FilePath.split('\\').pop() : `Document_${doc.DocumentId}`,
                    type: getFileTypeFromPath(doc.FilePath), category: getDocumentTypeFromPath(doc.FilePath),
                    createdAt: new Date(doc.RejectedOn).toLocaleDateString(),
                    ...doc
                }));
                setRejectedDocuments(transformedDocuments);
            } else {
                setRejectedDocuments([]);
            }
        } catch (error) {
            console.error("Error fetching rejected documents:", error);
            setResponse('Error fetching rejected documents');
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovedClick = () => {
        setSelectedFile(null);
        setSelectedRejectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setApprovedModalOpen(true);
        fetchApprovedDocuments();
    };

    const handleRejectedClick = () => {
        setSelectedFile(null);
        setSelectedRejectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setRejectedModalOpen(true);
        fetchRejectedDocuments();
    };

    const handlePendingClick = () => {
        setStatusModalOpen(true);
    };

    const handleFileSelect = async (file) => {
        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);
        try {
            const response = await view({ flagId: 2, DocumentId: file.DocumentId }, { responseType: "blob" });
            const blob = response;
            const fileUrl = URL.createObjectURL(blob);
            const fileType = blob.type.split('/')[1] || file.type || 'unknown';
            setPreviewContent({ url: fileUrl, type: fileType, name: file.name });
        } catch (error) {
            console.error("Preview error:", error);
            setPreviewError(error.message || "Failed to load preview");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleRejectedFileSelect = async (file) => {
        setSelectedRejectedFile(file);
        await handleFileSelect(file);
    };

    const handleReuploadClick = async (doc) => {
        setReuploadDocument(doc);
        setSelectedRejectedFile(doc);
        setShowReuploadModal(true);
        setReuploadFileLoading(true);
        try {
            const response = await view({ flagId: 2, DocumentId: doc.DocumentId, }, { responseType: "blob" });
            const blob = response;
            const fileUrl = URL.createObjectURL(blob);
            const fileType = blob.type.split('/')[1] || doc.type || 'unknown';
            setReuploadOldDocPreview({ url: fileUrl, type: fileType, name: doc.name });
        } catch (error) {
            console.error("Preview error:", error);
            setReuploadOldDocPreview(null);
        } finally {
            setReuploadFileLoading(false);
        }
    };

    const handleReuploadSubmit = async () => {
        if (!newDocumentFile || !reuploadDocument) return;
        try {
            setUploadLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setShowReuploadModal(false);
            setReuploadDocument(null);
            setNewDocumentFile(null);
            setNewDocumentPreview(null);
            setResponse('Document re-uploaded successfully!');
            setSuccessModal(true);
            await fetchRejectedDocuments();
            await fetchDocumentCounts();
        } catch (error) {
            console.error('Re-upload failed:', error);
            setResponse('Failed to re-upload document');
            setErrorModal(true);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
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
        if (location.state?.refresh) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const userEmail = obj?.user?.Email;
            if (userEmail) {
                loadReportData(userEmail);
            }
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, loadReportData, navigate, location.pathname]);

    useEffect(() => {
        return () => {
            if (newDocumentPreview?.url) URL.revokeObjectURL(newDocumentPreview.url);
            if (previewContent?.url && previewContent.url.startsWith('blob:')) URL.revokeObjectURL(previewContent.url);
        };
    }, [newDocumentPreview, previewContent]);

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

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        resetSubsequentFilters();

        if (selectedDivCode && userLevel === 'division') {
            const subdivisions = await flagIdFunction({ flagId: 2, requestUserName: userName, div_code: selectedDivCode });
            setSubDivisions(subdivisions);

            if (subdivisions.length === 1) {
                setSubDivision(subdivisions[0].sd_code);
                setIsFieldsDisabled(prev => ({ ...prev, subDivision: true }));
                
                const sections = await flagIdFunction({ flagId: 3, requestUserName: userName, sd_code: subdivisions[0].sd_code });
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

        if (!isFieldsDisabled.section) {
            setSection('');
            setSectionOptions([]);
        }
        setAccountSearchInput('');
        setAccountId('');
        setHasSearched(false);
        setSearchResults([]);

        if (selectedSdCode && (userLevel === 'section' || userLevel === 'subdivision' || userLevel === 'division')) {
            const sections = await flagIdFunction({ flagId: 3, requestUserName: userName, sd_code: selectedSdCode });
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

    const handleResetFilters = () => {
        if (!isFieldsDisabled.division) {
            setDivision('');
            setDivisionName([]);
        }
        resetSubsequentFilters();
        loadDropdownDataFromSession();
    };

    // ############ CORRECTED FUNCTION ############
    const handleVerifyAndProceed = async (consumerData) => {
        setVerifyingAccountId(consumerData.account_id);
    
        // Enhance consumer data with selected location CODES for the next screen's API call
        // and also include NAMES for display purposes.
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
            // Payload to check for existing drafts for the consumer
            const payload = {
                flagId: 13,
                account_id: consumerData.account_id,
            };
    
            const response = await postDocumentUploadview(payload);
    
            // If drafts are found, transform them and pass to the next screen
            if (response?.status === "success" && response?.data?.length > 0) {
                const transformedDrafts = response.data.map(draft => ({
                    id: draft.Draft_Id,
                    draftId: draft.Draft_Id,
                    name: draft.DraftName,
                    description: draft.DraftDescription,
                    tags: draft.MetaTags ? draft.MetaTags.split(',').map(tag => tag.trim()) : [],
                    category: draft.MetaTags ? draft.MetaTags.split(',')[0].trim() : 'Draft Document',
                    createdAt: draft.UploadedOn,
                    filePath: draft.FilePath,
                    needsFetching: true
                }));
    
                navigate('/DocumentReview', {
                    state: {
                        consumerData: consumerDataWithLocation,
                        draftDocuments: transformedDrafts
                    }
                });
            } else {
                // If no drafts, navigate with only the consumer data
                navigate('/DocumentReview', { state: { consumerData: consumerDataWithLocation } });
            }
        } catch (error) {
            console.error("Error fetching drafts:", error);
            setResponse("Failed to check for existing documents. Navigating directly.");
            setErrorModal(true);
            // Fallback: Navigate even if the draft check fails
            navigate('/DocumentReview', { state: { consumerData: consumerDataWithLocation } });
        } finally {
            setVerifyingAccountId(null);
        }
    };
    // ############ END OF CORRECTION ############

    const renderSearchTableRows = () => {
        if (!hasSearched) return <tr><td colSpan={6} className="text-center p-4">Please use the filters above and search for an Account ID.</td></tr>;
        if (searchResults.length === 0) return <tr><td colSpan={6} className="text-center p-4">No consumer found with this account ID.</td></tr>;
        return searchResults.map((row) => (
            <tr key={row.account_id}>
                <td>{row.consumer_name || '-'}</td><td>{row.rr_no || '-'}</td><td>{row.account_id || '-'}</td>
                <td>{row.consumer_address || '-'}</td><td>{row.phone || '-'}</td>
                <td>
                    <Button
                        color="primary"
                        onClick={() => handleVerifyAndProceed(row)}
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

    return (
        <div className="page-content">
            <BreadCrumb pageTitle="Scan Documents" />
            <Container fluid>
                <SuccessModal show={successModal} onCloseClick={() => setSuccessModal(false)} successMsg={response} />
                <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} errorMsg={response || 'An error occurred'} />

                <Card className="mb-4">
                    <CardHeader className="bg-primary text-white p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0 text-white">Consumer search and verification</h4>
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
                                    <Input type="select" value={subDivision} onChange={handleSubDivisionChange} disabled={isFieldsDisabled.subDivision || !division}>
                                        <option value="">Select Sub Division</option>
                                        {subDivisions.map(subDiv => <option key={subDiv.sd_code} value={subDiv.sd_code}>{subDiv.sub_division}</option>)}
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

                {/* MODALS */}
                <Modal isOpen={statusModalOpen} toggle={() => setStatusModalOpen(false)} centered>
                    <ModalHeader toggle={() => setStatusModalOpen(false)}>Pending Documents</ModalHeader>
                    <ModalBody><p>A list of documents pending review would be displayed here.</p><p className='text-center'>Total Pending: {documentCounts.pending}</p></ModalBody>
                    <ModalFooter><Button color="secondary" onClick={() => setStatusModalOpen(false)}>Close</Button></ModalFooter>
                </Modal>
                
                <Modal isOpen={approvedModalOpen} toggle={() => setApprovedModalOpen(false)} size="xl">
                    <ModalHeader className="bg-primary text-white" toggle={() => setApprovedModalOpen(false)}>Approved Documents <Badge color="light" pill className="ms-2 text-primary">{documentCounts.approved} Approved</Badge></ModalHeader>
                    <ModalBody className="p-3">
                        <Container fluid>
                            <Row className="g-3 results-container">
                                <Col lg={4} className="d-flex flex-column">
                                    <Card className="flex-fill d-flex flex-column">
                                        <CardHeader className="bg-light"><h5 className="mb-0">Approved Files</h5></CardHeader>
                                        <CardBody className="p-0 flex-grow-1 position-relative">
                                            <div className="scrollable-content">
                                                {loading ? (<div className="text-center p-4"><Spinner /></div>) : 
                                                 approvedDocuments.length > 0 ? (
                                                    <ListGroup flush>
                                                        {approvedDocuments.map((doc) => (
                                                            <ListGroupItem key={doc.DocumentId} action active={selectedFile?.DocumentId === doc.DocumentId} onClick={() => handleFileSelect(doc)} className="d-flex align-items-center">
                                                                <div className="flex-shrink-0 me-3">{getFileIcon(doc.name)}</div>
                                                                <div className="flex-grow-1" style={{minWidth: 0}}>
                                                                    <h6 className="mb-1">{doc.name}</h6>
                                                                    <small className="text-muted">{doc.createdAt} • {doc.category}</small>
                                                                </div>
                                                            </ListGroupItem>
                                                        ))}
                                                    </ListGroup>
                                                 ) : ( <div className="text-center text-muted p-4">No approved documents found.</div> )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col lg={8} className="d-flex flex-column">
                                    <Card className="flex-fill d-flex flex-column">
                                        <CardHeader className="bg-light"><h5 className="mb-0">Document Preview</h5></CardHeader>
                                        <CardBody className="p-0 flex-grow-1 position-relative">
                                            <div className={`scrollable-content ${!previewContent ? 'd-flex justify-content-center align-items-center' : ''}`}>
                                                {previewLoading ? (<div className="text-center p-5"><Spinner /><p>Loading preview...</p></div>) : 
                                                 previewError ? (<Alert color="danger" className="m-3">{previewError}</Alert>) : 
                                                 selectedFile && previewContent ? (
                                                    <div className="d-flex flex-column h-100">
                                                        <div className="flex-grow-1 text-center p-3" style={{ overflow: 'auto' }}>
                                                            {['jpeg', 'jpg', 'png', 'gif'].includes(previewContent.type) ? (
                                                                <img src={previewContent.url} alt="Preview" className="img-fluid" style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.2s ease' }} />
                                                            ) : (
                                                                <div className="py-5"><i className="ri-file-line display-4 text-muted"></i><h5 className="mt-3">Preview not available</h5></div>
                                                            )}
                                                        </div>
                                                        <div className="preview-controls p-2 border-top bg-light d-flex justify-content-center align-items-center">
                                                            <Button color="light" size="sm" onClick={handleZoomOut} className="me-2"><i className="ri-zoom-out-line"></i></Button>
                                                            <span className="mx-2">{zoomLevel}%</span>
                                                            <Button color="light" size="sm" onClick={handleZoomIn} className="ms-2"><i className="ri-zoom-in-line"></i></Button>
                                                            <Button color="light" size="sm" onClick={handleZoomReset} className="ms-3">Reset</Button>
                                                        </div>
                                                    </div>
                                                 ) : (
                                                    <div className="text-center text-muted p-5">
                                                        <i className="ri-file-line display-4"></i>
                                                        <h5 className="mt-3">No document selected</h5>
                                                    </div>
                                                 )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </ModalBody>
                </Modal>

                <Modal isOpen={rejectedModalOpen} toggle={() => setRejectedModalOpen(false)} size="xl" backdrop={showReuploadModal ? 'static' : true}>
                    <ModalHeader className="bg-primary text-white" toggle={() => !showReuploadModal && setRejectedModalOpen(false)}>
                        Rejected Documents <Badge color="light" pill className="ms-2 text-danger">{documentCounts.rejected} Rejected</Badge>
                    </ModalHeader>
                    <ModalBody className="p-3">
                        <Container fluid>
                            <Row className="g-3 results-container">
                                <Col lg={4} className="d-flex flex-column">
                                    <Card className="flex-fill d-flex flex-column">
                                        <CardHeader className="bg-light"><h5 className="mb-0">Rejected Files</h5></CardHeader>
                                        <CardBody className="p-0 flex-grow-1 position-relative">
                                            <div className="scrollable-content">
                                                {loading ? (<div className="text-center p-4"><Spinner /></div>) : 
                                                 rejectedDocuments.length > 0 ? (
                                                    <ListGroup flush>
                                                        {rejectedDocuments.map((doc) => (
                                                            <ListGroupItem key={doc.id} action active={selectedRejectedFile?.id === doc.id} onClick={() => handleRejectedFileSelect(doc)} className="d-flex align-items-center">
                                                                <div className="flex-shrink-0 me-3">{getFileIcon(doc.name)}</div>
                                                                <div className="flex-grow-1" style={{minWidth: 0}}>
                                                                    <h6 className="mb-1">{doc.name}</h6>
                                                                    <small className="text-muted">{doc.createdAt} • {doc.category}</small>
                                                                </div>
                                                                <Button color="light" size="sm" className="btn-icon rounded-circle" onClick={(e) => { e.stopPropagation(); handleReuploadClick(doc); }} title="Re-upload">
                                                                    <i className="ri-upload-2-line"></i>
                                                                </Button>
                                                            </ListGroupItem>
                                                        ))}
                                                    </ListGroup>
                                                 ) : ( <div className="text-center text-muted p-4">No rejected documents found.</div> )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col lg={8} className="d-flex flex-column">
                                    <Card className="flex-fill d-flex flex-column">
                                        <CardHeader className="bg-light"><h5 className="mb-0">Document Preview</h5></CardHeader>
                                        <CardBody className="p-0 flex-grow-1 position-relative">
                                            <div className={`scrollable-content ${!previewContent ? 'd-flex justify-content-center align-items-center' : ''}`}>
                                                {previewLoading ? (<div className="text-center p-5"><Spinner /><p>Loading preview...</p></div>) : 
                                                 previewError ? (<Alert color="danger" className="m-3">{previewError}</Alert>) : 
                                                 selectedRejectedFile && previewContent ? (
                                                    <div className="d-flex flex-column h-100">
                                                        <div className="flex-grow-1 text-center p-3" style={{ overflow: 'auto' }}>
                                                            {['jpeg', 'jpg', 'png', 'gif'].includes(previewContent.type) ? (
                                                                <img src={previewContent.url} alt="Preview" className="img-fluid" style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.2s ease' }} />
                                                            ) : (
                                                                <div className="py-5"><i className="ri-file-line display-4 text-muted"></i><h5 className="mt-3">Preview not available</h5></div>
                                                            )}
                                                        </div>
                                                        <div className="preview-controls p-2 border-top bg-light d-flex justify-content-center align-items-center">
                                                            <Button color="light" size="sm" onClick={handleZoomOut} className="me-2"><i className="ri-zoom-out-line"></i></Button>
                                                            <span className="mx-2">{zoomLevel}%</span>
                                                            <Button color="light" size="sm" onClick={handleZoomIn} className="ms-2"><i className="ri-zoom-in-line"></i></Button>
                                                            <Button color="light" size="sm" onClick={handleZoomReset} className="ms-3">Reset</Button>
                                                        </div>
                                                    </div>
                                                 ) : (
                                                    <div className="text-center text-muted p-5"><i className="ri-file-line display-4"></i><h5 className="mt-3">No document selected</h5></div>
                                                 )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </ModalBody>
                </Modal>

                <Modal isOpen={showReuploadModal} toggle={() => setShowReuploadModal(false)} size="lg" centered backdrop="static">
                    <ModalHeader toggle={() => setShowReuploadModal(false)} className="bg-primary text-white">Re-upload Document</ModalHeader>
                    <ModalBody>{reuploadDocument && (<Row className="g-3"><Col md={6}><h5>Previous Version</h5><div className="d-flex align-items-center mb-2">{getFileIcon(reuploadDocument.name)}<p className="ms-2 mb-1">{reuploadDocument.name}</p></div><Card style={{ height: '300px' }}><CardBody className="p-0 d-flex align-items-center justify-content-center">{reuploadFileLoading ?
                        <Spinner /> : reuploadOldDocPreview ? (['jpeg', 'jpg', 'png', 'gif'].includes(reuploadOldDocPreview.type) ? <img src={reuploadOldDocPreview.url} alt="Old preview" className="img-fluid" style={{ maxHeight: '100%' }} /> : <div className="text-center"><i className="ri-file-line display-4 text-muted"></i><p>No preview</p></div>) : <div className="text-center"><i className="ri-file-line display-4 text-muted"></i><p>No preview available</p></div>}</CardBody></Card></Col><Col md={6}><h5>Upload New Version</h5><FormGroup><Label for="documentReupload">Select new file</Label><Input type="file" id="documentReupload" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setNewDocumentFile(file); if (file.type.startsWith('image/')) { setNewDocumentPreview({ type: file.type.split('/')[1], url: URL.createObjectURL(file) }); } else {
                                    setNewDocumentPreview(null);
                                }
                            }
                        }} /></FormGroup><div className={`mt-2 text-center p-3 border rounded drop-zone ${isDragging ?
                            'drop-zone-active' : ''}`} style={{ height: '300px' }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleReuploadDrop}>{newDocumentPreview ?
                                (<img src={newDocumentPreview.url} alt="New preview" className="img-fluid" style={{ maxHeight: '100%' }} />) : (<div className="d-flex flex-column justify-content-center h-100"><i className="ri-file-upload-line display-4 text-muted"></i><p className="mt-2 text-muted">Drag & Drop file here</p></div>)}</div></Col></Row>)}</ModalBody>
                    <ModalFooter><Button color="light" onClick={() => setShowReuploadModal(false)}>Cancel</Button><Button color="primary" onClick={handleReuploadSubmit} disabled={!newDocumentFile ||
                        uploadLoading}>{uploadLoading ? <><Spinner size="sm" /> Re-uploading...</> : 'Submit Re-upload'}</Button></ModalFooter>
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