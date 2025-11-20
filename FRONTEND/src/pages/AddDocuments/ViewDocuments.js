import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Badge, Input, Label, FormGroup, ListGroup, ListGroupItem,
    Alert, Spinner
} from 'reactstrap';
import { getDocumentDropdowns, viewDocument, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';


// This needs to be the actual URL your 'view' helper was calling
const VIEW_DOCUMENT_URL = "http://192.168.23.229:9000/backend-service/documentUpload/documentView";

const ViewDocuments = () => {
    // State management
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewError, setPreviewError] = useState(null);

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

            // --- ROLE ID PAYLOAD LOGIC ---
            let params = {};

            // Check if Role_Id is 1 or 4
            if (roleId === 1 || roleId === 4) {
                // Special payload for Admins (Role 1 & 4)
                params = {
                    flagId: 3,
                    accountId: account_id
                };
            } else {
                // Default payload for other users
                params = {
                    flagId: 1,
                    accountId: account_id,
                    roleId,
                    requestUserName: requestUserName
                };
            }

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
                    const transformedDocuments = response.data.map(doc => {
                        // --- ERROR FIX HERE: handle missing FilePath safely ---
                        const safeFilePath = doc.FilePath || '';
                        const fileType = safeFilePath ? safeFilePath.split('.').pop().toLowerCase() : 'unknown';

                        return {
                            id: doc.DocumentId + '_' + doc.Version_Id,
                            name: doc.DocumentName,
                            description: doc.DocumentDescription,
                            createdBy: doc.CreatedByUserName,
                            createdAt: formatDate(doc.CreatedAt),
                            category: doc.CategoryName,
                            status: doc.VersionStatusName,
                            approvalComment: doc.ChangeReason,
                            approvedOn: formatDate(doc.UploadedAt),
                            url: safeFilePath,
                            type: fileType,
                            documentId: doc.DocumentId,
                            versionId: doc.Version_Id,
                            versionLabel: doc.VersionLabel,
                            isLatest: doc.IsLatest,
                            updatedOn: formatDate(doc.UpdatedOn)
                        };
                    });

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

    // Handle file selection for preview
    const handleFileSelect = async (file) => {
        console.log('📄 File selected:', file);
        console.log('🔑 Version_Id to be sent:', file.versionId);

        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);

        try {
            if (!file.versionId) {
                throw new Error("Version_Id is required for document preview");
            }

            const requestPayload = {
                flagId: 2,
                Version_Id: file.versionId,
                requestUserName: userName,
            };

            console.log('🚀 API Request Payload:', requestPayload);

            const response = await axios.post(
                VIEW_DOCUMENT_URL,
                requestPayload,
                { responseType: "blob" } // Critical: ensures data is treated as a blob
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

            // Check if the blob is an error message (as JSON)
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

            // If the blob type is not PDF, force it.
            if (receivedBlob.type !== 'application/pdf') {
                console.warn(`⚠️ Blob type is '${receivedBlob.type}'. Forcing 'application/pdf'.`);
                blobToView = new Blob([receivedBlob], { type: 'application/pdf' });
            } else {
                blobToView = receivedBlob;
            }

            // Create object URL for the valid blob
            const fileUrl = URL.createObjectURL(blobToView);
            console.log('🔗 Object URL created:', fileUrl.substring(0, 50) + '...');

            setPreviewContent({
                url: fileUrl,
                type: 'application/pdf', // Always use this for the iframe
                name: file.name,
                blob: blobToView
            });

            console.log('✅ Preview content set successfully');

        } catch (error) {
            console.error("❌ Preview error:", error);
            // Handle axios errors
            let errorMessage = error.message;
            if (error.response && error.response) {
                if (error.response instanceof Blob) {
                    try {
                        const errorText = await error.response.text();
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

    // Handle file download
    const handleDownload = async (file) => {
        try {
            console.log('📥 Starting download for Version_Id:', file.versionId);

            if (!file.versionId) {
                throw new Error("Version_Id is required for download");
            }

            const requestPayload = {
                flagId: 2,
                Version_Id: file.versionId,
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

            // Check for JSON error blob
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

            // Create download link
            const url = URL.createObjectURL(blobToDownload);
            const link = document.createElement("a");
            link.href = url;

            // Create filename
            const fileExtension = 'pdf';
            const fileName = `${file.name || 'document'}_v${file.versionLabel || file.versionId}.${fileExtension}`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URL after download
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);

            console.log('✅ Download completed successfully');

        } catch (err) {
            console.error("❌ Download failed:", err);
            let errorMessage = err.message;
            if (err.response && err.response && err.response instanceof Blob) {
                try {
                    const errorText = await err.response.text();
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

                                                    {selectedFile.approvalComment && (
                                                        <div className="col-12 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="ri-chat-1-line me-1 text-primary fs-6"></i>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Label className="fw-medium text-muted x-small mb-0">Approval Comment:</Label>
                                                                    <span className="fw-semibold x-small">{selectedFile.approvalComment}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <i className="ri-calendar-check-line me-1 text-primary fs-6"></i>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <Label className="fw-medium text-muted x-small mb-0">Approved On:</Label>
                                                                <span className="fw-semibold x-small">{selectedFile.approvedOn}</span>
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
                                                                    {getFileIcon(doc.type)}
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1">{doc.name}</h6>
                                                                    <small className="text-muted">
                                                                        {doc.createdAt} • {doc.category}
                                                                    </small>
                                                                    <br />
                                                                    <small className="text-info">
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
                                            ) : previewContent ? (
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