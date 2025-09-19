import React, { useState, useRef, useEffect } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Badge, Input, Label, FormGroup, ListGroup, ListGroupItem,
    Alert, Spinner
} from 'reactstrap';
import { getDocumentDropdowns, viewDocument, view } from '../../helpers/fakebackend_helper';
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

    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    // Search related states
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
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);

    document.title = `View Documents | DMS`;

    const debounceRef = useRef();

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.Email;

        setUserName(usernm);
        flagIdFunction(1, setDivisionName, usernm);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (previewContent?.url) URL.revokeObjectURL(previewContent.url);
        };
    }, []);

    const flagIdFunction = async (flagId, setState, requestUserName, div_code, sd_code, account_id) => {
        try {
            const params = { flagId, requestUserName, div_code, sd_code, account_id }
            const response = await getDocumentDropdowns(params);
            const options = response?.data || [];
            setState(options);
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
        }
    };

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        setSubDivision('');
        setSection('');
        setSubDivisions([]);

        if (selectedDivCode) {
            await flagIdFunction(2, setSubDivisions, userName, selectedDivCode);
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        setSection('');
        setSectionOptions([]);

        if (selectedSdCode) {
            await flagIdFunction(3, setSectionOptions, userName, null, selectedSdCode);
        }
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
                    const selectedSectionObj = sectionOptions.find(sec => sec.so_code === section);
                    const params = {
                        flagId: 4,
                        section: selectedSectionObj ? selectedSectionObj.section_office : '',
                        account_id: value
                    };
                    setLoading(true);
                    setShowSuggestions(true);
                    const response = await getDocumentDropdowns(params);
                    const options = response?.data || [];
                    setAccountSuggestions(options);
                } catch (error) {
                    console.error('Error fetching Account Suggestions:', error.message);
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

    const getFileIcon = (type) => {
        const icons = {
            pdf: 'ri-file-pdf-line text-danger',
            doc: 'ri-file-word-line text-primary',
            docx: 'ri-file-word-line text-primary',
            xls: 'ri-file-excel-line text-success',
            xlsx: 'ri-file-excel-line text-success',
            ppt: 'ri-file-ppt-line text-warning',
            pptx: 'ri-file-ppt-line text-warning',
            jpg: 'ri-image-line text-info',
            jpeg: 'ri-image-line text-info',
            png: 'ri-image-line text-info',
            gif: 'ri-image-line text-info'
        };

        return <i className={`${icons[type] || 'ri-file-line text-secondary'} fs-3`}></i>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const handleSearch = async () => {
        try {
            if (!account_id) {
                setResponse('Please enter an account ID');
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
        setDivision('');
        setSubDivision('');
        setSection('');
        setAccountSearchInput('');
        setaccount_id('');
        setDocuments([]);
        setConsumerInfo(null);
        setShowResults(false);
        setHasSearched(false);
        setSubDivisions([]);
        setSectionOptions([]);
        setSelectedFile(null);
        setPreviewContent(null);
        setPreviewError(null);
        setAccountSuggestions([]);
        setShowSuggestions(false);
    };

    const handleFileSelect = async (file) => {
        setSelectedFile(file);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);

        try {
            const response = await view(
                {
                    flagId: 2,
                    DocumentId: file.documentId,
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

            const blob = response.data;
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

    return (
        <React.Fragment>
            
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <BreadCrumb  title="Document Search"pageTitle="DMS" />
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
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Division</Label>
                                        <Input
                                            type="select"
                                            value={division}
                                            onChange={handleDivisionChange}
                                        >
                                            <option value="">Select Divisions</option>
                                            {divisionName.map(div => (
                                                <option key={div.div_code} value={div.div_code}>{div.division}</option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Sub Division</Label>
                                        <Input
                                            type="select"
                                            value={subDivision}
                                            onChange={handleSubDivisionChange}
                                            disabled={!division}
                                        >
                                            <option value="">All Sub Divisions</option>
                                            {subDivisions.map(subDiv => (
                                                <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                    {subDiv.sub_division}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Section</Label>
                                        <Input
                                            type="select"
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                            disabled={!subDivision}
                                        >
                                            <option value="">All Sections</option>
                                            {sectionOptions.map(sec => (
                                                <option key={sec.so_code} value={sec.so_code}>
                                                    {sec.section_office}
                                                </option>
                                            ))}
                                        </Input>
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
                                                disabled={!account_id || loading}
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
                                                                <embed
                                                                    src={`${previewContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                    type="application/pdf"
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
                                                                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-5 fade-in h-100 d-flex flex-column justify-content-center">
                                                                <i className="ri-file-line display-4 text-muted"></i>
                                                                <h5 className="mt-3">Preview not available</h5>
                                                                <p>This file type ({previewContent.type}) cannot be previewed in the browser.</p>
                                                                <Button
                                                                    color="primary"
                                                                    onClick={() => handleDocumentAction(selectedFile.documentId)}
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

                .pdf-viewer-container embed {
                    width: 100%;
                    height: 100%;
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
                }
                `}
            </style>
        </React.Fragment>
    );
};

export default ViewDocuments;