import React, { useState, useEffect, useRef } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label,
    Modal, Input, FormGroup, Form, FormText, Alert, Badge, ListGroup, ListGroupItem, Spinner
} from 'reactstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getDocumentDropdowns, postDocumentUpload, qcReviewed, view, Scanning } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import { io } from "socket.io-client";
import '../AddDocuments/AddDocuments.css';
import axios from 'axios';

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
    const [documentStatus, setDocumentStatus] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showScanModal, setShowScanModal] = useState(false);
    const [scannedDocument, setScannedDocument] = useState(null);
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadDocument, setReuploadDocument] = useState(null);
    const [newDocumentFile, setNewDocumentFile] = useState(null);
    const [newDocumentPreview, setNewDocumentPreview] = useState(null);
    const [reuploadFileLoading, setReuploadFileLoading] = useState(false);
    const [reuploadOldDocPreview, setReuploadOldDocPreview] = useState(null);
    const [changeReason, setChangeReason] = useState('');
    const [socket, setSocket] = useState(null);
    const [scanningInProgress, setScanningInProgress] = useState(false);
    const [currentScanFileName, setCurrentScanFileName] = useState('');
    const [currentScanDocType, setCurrentScanDocType] = useState('');
    const [wasAddModalOpen, setWasAddModalOpen] = useState(false);
    const [scanTimeout, setScanTimeout] = useState(null);
    const [scans, setScans] = useState([]);

    document.title = `Document Upload | DMS`;

    // Document type to field name mapping
    const getFormikFieldName = (docType) => {
        const mapping = {
            'ID proof': 'IDproof',
            'Ownership proof': 'OwnerShipproof',
            'Khata Certificate': 'KhataCertificate',
            'Power agreement': 'PowerAgreement',
            'Site sketch': 'SiteSketch',
        };
        return mapping[docType];
    };

    // Handle document re-upload
    // const handleReuploadSubmit = async () => {
    //     if (!newDocumentFile || !reuploadDocument || !changeReason) {
    //         setResponse('Please provide all required fields');
    //         setErrorModal(true);
    //         return;
    //     }

    //     try {
    //         setUploadLoading(true);
    //         const authUser = JSON.parse(sessionStorage.getItem("authUser"));
    //         const userId = authUser?.user?.User_Id;

    //         const documentName = reuploadDocument.name.split('-').pop().trim();

    //         const formData = new FormData();
    //         formData.append('flagId', '8');
    //         formData.append('ReUploadDocumentId', reuploadDocument.DocumentId);
    //         formData.append('ChangeReason', changeReason);
    //         formData.append('CreatedByUser_Id', userId);
    //         formData.append(documentName, newDocumentFile);
    //         formData.append("Status_Id", "1");

    //         const response = await postDocumentUpload(formData);

    //         if (response?.status === 'success') {
    //             setResponse(response.message || 'Document re-uploaded successfully!');
    //             setSuccessModal(true);
    //             await fetchRejectedDocuments();
    //         } else {
    //             setResponse(response?.message || 'Failed to re-upload document');
    //             setErrorModal(true);
    //         }
    //     } catch (error) {
    //         console.error('Re-upload failed:', error);
    //         setResponse(error.response?.data?.message ||
    //             error.message ||
    //             'Error re-uploading document. Please try again.');
    //         setErrorModal(true);
    //     } finally {
    //         setUploadLoading(false);
    //         setShowReuploadModal(false);
    //         setReuploadDocument(null);
    //         setNewDocumentFile(null);
    //         setNewDocumentPreview(null);
    //         setReuploadOldDocPreview(null);
    //         setChangeReason('');
    //     }
    // };



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

            const documentName = reuploadDocument.name.split('-').pop().trim();

            // Special handling for "Additional" documents
            const fieldName = documentName === "Additional" ? "otherDocuments" : documentName;

            const formData = new FormData();
            formData.append('flagId', '8');
            formData.append('ReUploadDocumentId', reuploadDocument.DocumentId);
            formData.append('ChangeReason', changeReason);
            formData.append('CreatedByUser_Id', userId);
            formData.append(fieldName, newDocumentFile); // Use the modified field name
            formData.append("Status_Id", "1");

            const response = await postDocumentUpload(formData);

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
    

    // Updated useEffect for socket connection with new-scan-processed event
    useEffect(() => {
        const socketConnection = io("http://192.168.23.58:5000", {
            transports: ["websocket", "polling"],
        });

        socketConnection.on("connect", () => {
            console.log("✅ Scanner Connected:", socketConnection.id);
            setSocket(socketConnection);
        });

        // Handler for receiving processed scanned images
        socketConnection.on("new-scan-processed", (scan) => {
            console.log("📄 New scan received:", scan);

            // Add to scans list for preview
            setScans((prev) => [scan, ...prev]);

            // Only process if we're currently scanning and the filename matches
            if (scanningInProgress && scan.fileName === currentScanFileName) {
                // Clear the timeout since we received the file
                if (scanTimeout) {
                    clearTimeout(scanTimeout);
                    setScanTimeout(null);
                }

                // Create the scanned document object with the image URL
                setScannedDocument({
                    fileName: scan.fileName,
                    imageUrl: `http://192.168.23.58:5000${scan.imageUrl}`,
                    docType: currentScanDocType,
                    timestamp: scan.timestamp || new Date().toISOString()
                });

                // Stop scanning progress
                setScanningInProgress(false);
                setScanning(false);
                setScanProgress(100);

                console.log("Scan completed successfully - image received via websocket");
            }
        });

        socketConnection.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
        });

        socketConnection.on("disconnect", (reason) => {
            console.log("🔌 Socket disconnected:", reason);
            if (scanningInProgress) {
                setScanningInProgress(false);
                setScanning(false);
                setResponse("Scanner disconnected during scan. Please try again.");
                setErrorModal(true);
            }
        });

        return () => {
            if (socketConnection) {
                socketConnection.off("new-scan-processed");
                socketConnection.off("connect_error");
                socketConnection.off("disconnect");
                socketConnection.close();
            }
        };
    }, [scanningInProgress, currentScanFileName, currentScanDocType, scanTimeout]);

    // Update your existing useEffect for cleanup
    useEffect(() => {
        return () => {
            if (newDocumentPreview?.url) {
                URL.revokeObjectURL(newDocumentPreview.url);
            }
            if (previewContent?.url && previewContent.url.startsWith('blob:')) {
                URL.revokeObjectURL(previewContent.url);
            }
            if (socket) {
                socket.close();
            }
        };
    }, [newDocumentPreview, previewContent, socket]);

    // Replace the handleStatusClick function with these:
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

    // Updated Validation Schema
    const documentSchema = Yup.object().shape({
        docType: Yup.string().required('Document type is required'),
        docName: Yup.string().required('Document name is required'),
        selectedCategory: Yup.string().required('Please select a document category'),
        description: Yup.string().required('Description is required'),
        metaTags: Yup.string().required('Meta tags are required'),
        IDproof: Yup.mixed()
            .required('ID proof file is required')
            .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
            .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
        OwnerShipproof: Yup.mixed()
            .required('Ownership proof file is required')
            .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
            .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
        KhataCertificate: Yup.mixed()
            .required('Khata Certificate file is required')
            .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
            .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
        PowerAgreement: Yup.mixed()
            .required('Power agreement file is required')
            .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
            .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
        SiteSketch: Yup.mixed()
            .required('Site sketch file is required')
            .test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE)
            .test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type)),
        otherDocuments: Yup.array().when('docType', {
            is: 'Other',
            then: (schema) =>
                schema.min(1, 'At least one "Other" document is required').of(
                    Yup.object().shape({
                        file: Yup.mixed().required('File for other document is required').test('fileSize', 'File size must be less than 2MB', (value) => value && value.size <= MAX_FILE_SIZE).test('fileType', 'Unsupported file format', (value) => value && ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(value.type)),
                    })
                ),
            otherwise: (schema) => schema.notRequired(),
        }),
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

    // Updated handleRealScan function to use JPG format
    const handleRealScan = async (docType) => {
        let progressInterval;

        try {
            setCurrentScanDocType(docType);

            // Generate unique filename with JPG extension
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${docType.replace(/\s+/g, '_')}_${timestamp}.jpg`;

            setCurrentScanFileName(fileName);
            setScanningInProgress(true);

            setShowScanModal(true);
            setScanning(true);
            setScanProgress(0);

            progressInterval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 90) return 90;
                    return prev + 10;
                });
            }, 500);

            // Call the scanning API with JPG format
            const scanPayload = {
                fileName: fileName,
                format: "jpg"
            };

            const response = await axios.post('http://192.168.23.58:5000/scan-service/scan', scanPayload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            if (response?.data?.message === "Scan completed") {
                console.log("Scan initiated successfully, waiting for file via WebSocket");

                const timeoutRef = setTimeout(() => {
                    console.warn("Websocket response timeout");
                    clearInterval(progressInterval);
                    setScanningInProgress(false);
                    setScanning(false);
                    setScanProgress(0);
                    setResponse('Scan completed but no file received from scanner.');
                    setErrorModal(false);
                    setShowScanModal(true);
                }, 30000);

                setScanTimeout(timeoutRef);
            } else {
                clearInterval(progressInterval);
                setScanningInProgress(false);
                setScanning(false);
                setCurrentScanFileName('');
                setCurrentScanDocType('');
                setShowScanModal(false);
                setResponse('Scan failed. Please try again.');
                setErrorModal(true);
            }
        } catch (error) {
            console.error('Scan error:', error);
            clearInterval(progressInterval);
            if (scanTimeout) {
                clearTimeout(scanTimeout);
                setScanTimeout(null);
            }
            setScanningInProgress(false);
            setScanning(false);
            setCurrentScanFileName('');
            setCurrentScanDocType('');
            setResponse('Error initiating scan. Please try again.');
            setErrorModal(true);
            setShowScanModal(false);
        }
    };

    const fetchDocumentCounts = async () => {
        try {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userId = authUser?.user?.User_Id;

            const approvedParams = {
                flagId: 1,
                User_Id: userId
            };
            const approvedResponse = await qcReviewed(approvedParams);

            const rejectedParams = {
                flagId: 2,
                User_Id: userId
            };
            const rejectedResponse = await qcReviewed(rejectedParams);

            const pendingParams = {
                flagId: 3,
                User_Id: userId
            };
            const pendingResponse = await qcReviewed(pendingParams);

            setDocumentCounts({
                approved: approvedResponse?.count || 0,
                pending: pendingResponse?.count || 0,
                rejected: rejectedResponse?.count || 0
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

            const params = {
                flagId: 1,
                User_Id: userId
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

            const params = {
                flagId: 2,
                User_Id: userId
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

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 25, 50));
    };

    const handleZoomReset = () => {
        setZoomLevel(100);
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

    // Formik form setup
    const formik = useFormik({
        initialValues: {
            docType: '',
            docName: '',
            status: '',
            selectedCategory: '',
            selectedRole: '',
            description: '',
            metaTags: '',
            IDproof: null,
            OwnerShipproof: null,
            KhataCertificate: null,
            PowerAgreement: null,
            SiteSketch: null,
            otherDocuments: undefined,
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

                const formData = new FormData();
                formData.append('flagId', '8');
                formData.append('account_id', account_id || accountSearchInput);
                formData.append('DocumentName', values.docName.trim());
                formData.append('DocumentDescription', values.description.trim());
                formData.append('MetaTags', values.metaTags.trim());
                formData.append('CreatedByUser_Id', userId);
                formData.append('CreatedByUserName', userEmail);
                formData.append('Category_Id', values.selectedCategory);
                formData.append('Status_Id', '1');
                formData.append('IDproof', values.IDproof);
                formData.append('OwnerShipproof', values.OwnerShipproof);
                formData.append('KhataCertificate', values.KhataCertificate);
                formData.append('PowerAgreement', values.PowerAgreement);
                formData.append('SiteSketch', values.SiteSketch);
                if (values.otherDocuments && values.otherDocuments.length > 0) {
                    values.otherDocuments.forEach((doc, index) => {
                        if (doc.file) {
                            formData.append(`otherDocuments`, doc.file);
                        }
                    });
                }

                if (values.selectedRole) {
                    formData.append('Role_Id', values.selectedRole);
                }

                const response = await postDocumentUpload(formData);
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

    const handleSpecificFileUpload = (e, docType) => {
        const file = e.currentTarget.files[0];
        const fieldName = getFormikFieldName(docType);
        console.log(`File selected for ${fieldName}:`, file);
        if (file) {
            formik.setFieldValue(fieldName, file);
            formik.setFieldTouched(fieldName, true);

            if (file.name.includes('scan') || file.name.includes('Scanned') || file.type === 'application/pdf') {
                const fileUrl = URL.createObjectURL(file);
                const fileType = file.type.split('/')[1] || 'unknown';

                setPreviewContent({
                    url: fileUrl,
                    type: fileType,
                    name: file.name,
                    isScanned: true
                });
            } else {
                setPreviewContent(null);
            }
        } else {
            formik.setFieldValue(fieldName, null);
            formik.setFieldTouched(fieldName, true);
            setPreviewContent(null);
        }
    };

    const flagIdFunction = async (flagId, setState, requestUserName, div_code, sd_code, account_id) => {
        try {
            const params = { flagId, requestUserName, div_code, sd_code, account_id };
            const response = await getDocumentDropdowns(params);
            const options = response?.data || [];
            setState(options);
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
        }
    };

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.Email;
        setUserName(usernm);
        flagIdFunction(1, setDivisionName, usernm);
        flagIdFunction(6, setRoles, usernm);
        flagIdFunction(7, setDocumentCategory, usernm);

        fetchDocumentCounts();
    }, []);

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        setSubDivision('');
        setSection('');
        setSection('');
        setSubDivisions([]);
        setSection('');
        setSectionOptions([]);

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

            setLoading(true);
            const params = {
                flagId: 5,
                account_id: account_id
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
        formik.setFieldValue('IDproof', null);
        formik.setFieldValue('OwnerShipproof', null);
        formik.setFieldValue('KhataCertificate', null);
        formik.setFieldValue('PowerAgreement', null);
        formik.setFieldValue('SiteSketch', null);
        formik.setFieldValue('otherDocuments', undefined);
        setPreviewContent(null);
        setZoomLevel(100);
    };

    const handleEdit = (document) => {
        formik.setValues({
            docType: document.docType || '',
            docName: document.name,
            status: document.status,
            selectedCategory: document.category,
            description: document.description || '',
            metaTags: document.metaTags || '',
            selectedRole: document.role || '',
            IDproof: null,
            OwnerShipproof: null,
            KhataCertificate: null,
            PowerAgreement: null,
            SiteSketch: null,
            otherDocuments: undefined,
        });
        setCurrentDocument(document);
        setEditMode(true);
        setModalOpen(true);
    };

    const handleResetFilters = () => {
        setDivision('');
        setSubDivision('');
        setSection('');
        setAccountId('');
        setAccountSearchInput('');
        setSearchResults([]);
        setHasSearched(false);
        setSubDivisions([]);
        setSectionOptions([]);
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

                {/* Scan Document Modal with Image Preview */}
                <Modal isOpen={showScanModal} centered backdrop="static" size="lg">
                    <ModalHeader className="bg-primary text-white p-3" toggle={() => {
                        setShowScanModal(false);
                        setScanning(false);
                        setScanProgress(0);
                        setScannedDocument(null);
                        setScanningInProgress(false);
                        setCurrentScanFileName('');
                        setCurrentScanDocType('');
                    }}>
                        <h5 className="mb-0 card-title text-white">Scanning Document</h5>
                    </ModalHeader>
                    <ModalBody className="text-center py-4">
                        {scanning ? (
                            <div className="scanning-container">
                                <div className="scan-animation mb-4">
                                    <div className="scanner-light">
                                        <div
                                            className="scanner-beam"
                                            style={{
                                                transform: `translateX(${scanProgress - 100}%)`
                                            }}
                                        ></div>
                                    </div>
                                    <div
                                        className="document-placeholder mt-4"
                                        style={{
                                            height: '300px',
                                            border: '2px dashed #dee2e6',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                    >
                                        <div className="text-center">
                                            <i className="ri-printer-line display-4 text-muted mb-3"></i>
                                            <h5>Scanning in Progress</h5>
                                            <p className="text-muted">
                                                {scanProgress < 90 ? 'Initiating scan...' : 'Waiting for document from scanner...'}
                                            </p>
                                            <small className="text-muted">File: {currentScanFileName}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="progress mb-3">
                                    <div
                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar"
                                        style={{ width: `${scanProgress}%` }}
                                        aria-valuenow={scanProgress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {scanProgress}%
                                    </div>
                                </div>
                            </div>
                        ) : scannedDocument ? (
                            <div className="scanned-document-container">
                                <Row>
                                    <Col lg={12}>
                                        <Card className="mb-4">
                                            <CardHeader className="bg-light">
                                                <h5 className="mb-0">Scanned Document Preview</h5>
                                            </CardHeader>
                                            <CardBody>
                                                <div className="d-flex align-items-center mb-3">
                                                    <i className="ri-image-line fs-4 text-success me-3"></i>
                                                    <div>
                                                        <h6 className="mb-0">{scannedDocument.fileName}</h6>
                                                        <small className="text-muted">
                                                            Scanned on: {new Date(scannedDocument.timestamp).toLocaleString()}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div
                                                    className="preview-content border rounded p-2"
                                                    style={{
                                                        height: '400px',
                                                        backgroundColor: '#f8f9fa',
                                                        overflow: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <img
                                                        src={scannedDocument.imageUrl}
                                                        alt={scannedDocument.fileName}
                                                        className="img-fluid rounded shadow-md"
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                        onError={(e) => {
                                                            console.error('Error loading scanned image:', e);
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                                                        }}
                                                    />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        ) : (
                            <div className="scan-error">
                                <i className="ri-error-warning-line display-4 text-danger mb-3"></i>
                                <h5>Scan Failed</h5>
                                <p className="text-muted">There was an issue scanning your document</p>
                                <Button
                                    color="primary"
                                    className="mt-3"
                                    onClick={() => {
                                        setShowScanModal(false);
                                        setScanning(false);
                                        setScanningInProgress(false);
                                        setCurrentScanFileName('');
                                        setCurrentScanDocType('');
                                    }}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {scanning ? (
                            <Button color="secondary" disabled>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Scanning...
                            </Button>
                        ) : scannedDocument ? (
                            <>
                                <Button
                                    color="light"
                                    onClick={() => {
                                        setShowScanModal(false);
                                        setScannedDocument(null);
                                        setScanningInProgress(false);
                                        setCurrentScanFileName('');
                                        setCurrentScanDocType('');
                                        setModalOpen(true);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        try {
                                            const fieldName = getFormikFieldName(scannedDocument.docType);

                                            if (fieldName) {
                                                // Directly set image URL instead of creating a File
                                                formik.setFieldValue(fieldName, {
                                                    url: scannedDocument.imageUrl,
                                                    name: scannedDocument.fileName,
                                                    type: 'jpeg',
                                                    isScanned: true
                                                });
                                                formik.setFieldTouched(fieldName, true);

                                                setPreviewContent({
                                                    url: scannedDocument.imageUrl,
                                                    type: 'jpeg',
                                                    name: scannedDocument.fileName,
                                                    isScanned: true
                                                });
                                            }

                                            // Reset scan state
                                            setShowScanModal(false);
                                            setScannedDocument(null);
                                            setScanningInProgress(false);
                                            setCurrentScanFileName('');
                                            setCurrentScanDocType('');
                                        } catch (error) {
                                            console.error("Error processing scanned document:", error);
                                            setResponse("Error processing scanned document");
                                            setErrorModal(true);
                                        }
                                    }}
                                >
                                    <i className="ri-check-line me-1"></i> Use This Document
                                </Button>

                            </>
                        ) : (
                            <Button
                                color="secondary"
                                onClick={() => {
                                    setShowScanModal(false);
                                    setScanning(false);
                                    setScanningInProgress(false);
                                    setCurrentScanFileName('');
                                    setCurrentScanDocType('');
                                }}
                            >
                                Close
                            </Button>
                        )}
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
                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Division<span className="text-danger">*</span></Label>
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

                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Sub Division<span className="text-danger">*</span></Label>
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

                                            <Col md={3}>
                                                <FormGroup>
                                                    <Label>Section<span className="text-danger">*</span></Label>
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
                                                    disabled={loading}
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

                {/* Add/Edit Document Modal */}
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
                    <ModalHeader className="bg-primary text-white p-3" toggle={() => setModalOpen(false)}>
                        <span className="modal-title text-white">{editMode ? 'Edit Document' : 'Add New Document'}</span>
                    </ModalHeader>
                    <Form onSubmit={formik.handleSubmit}>
                        <ModalBody>
                            <h5 className="mb-3">Document Information</h5>
                            <Row className="mb-3">
                                {/* LEFT SIDE - Document Type Selection Grid */}
                                <Col md={6}>
                                    <FormGroup>
                                        <Label className="form-label">Document Type <span className="text-danger">*</span></Label>
                                        {formik.errors.docType && formik.touched.docType && (
                                            <Alert color="danger" className="py-1 px-2 mb-2">
                                                <i className="ri-error-warning-line me-1"></i>
                                                {formik.errors.docType}
                                            </Alert>
                                        )}

                                        <div className="d-flex flex-column gap-2">
                                            {["ID proof", "Ownership proof", "Khata Certificate", "Power agreement", "Site sketch", "Other"].map((doc) => {
                                                const isOther = doc === "Other";
                                                const isSelected = formik.values.docType === doc;
                                                const formikFieldName = getFormikFieldName(doc);
                                                const hasFile = formik.values[formikFieldName];
                                                const fileError = formik.submitCount > 0 && formik.errors[formikFieldName];

                                                return (
                                                    <div key={doc} className="mb-2">
                                                        <div className="d-flex alignItems-center gap-1">
                                                            {/* Document Type Selector */}
                                                            <div
                                                                className={`flex-grow-1 p-1 border rounded cursor-pointer text-truncate d-flex alignItems-center ${isSelected ? 'border-primary bg-primary-light' : ''} ${formik.errors.docType && formik.touched.docType ? 'border-danger' : ''}`}
                                                                onClick={() => {
                                                                    formik.setFieldValue("docType", doc);
                                                                    formik.setFieldTouched("docType", true);
                                                                    // Clear otherDocuments if changing from "Other"
                                                                    if (doc !== "Other") {
                                                                        formik.setFieldValue("otherDocuments", undefined);
                                                                    }
                                                                }}
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    height: '38px',
                                                                    lineHeight: '20px',
                                                                    ...(isOther && {
                                                                        borderLeft: '2px solid #6c757d',
                                                                        color: isSelected ? '#495057' : '#6c757d',
                                                                        fontStyle: 'italic'
                                                                    })
                                                                }}
                                                            >
                                                                {doc} <span className="text-danger">*</span>
                                                            </div>

                                                            {/* Buttons Container */}
                                                            <div className="d-flex" style={{ height: '38px' }}>
                                                                {/* Scan Button */}
                                                                <Button
                                                                    color="outline-secondary"
                                                                    size="sm"
                                                                    className="d-flex alignItems-center justify-content-center"
                                                                    style={{ width: '80px', height: '100%' }}
                                                                    onClick={() => handleRealScan(doc)}
                                                                    disabled={scanningInProgress}
                                                                >
                                                                    {scanningInProgress && currentScanDocType === doc ? (
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                                    ) : (
                                                                        <i className="ri-scan-line me-1"></i>
                                                                    )}
                                                                    <span>Scan</span>
                                                                </Button>

                                                                {/* Upload Button with checkmark */}
                                                                <label
                                                                    className={`btn btn-sm btn-outline-primary d-flex alignItems-center justify-content-center ms-2 position-relative`}
                                                                    style={{ width: '80px', height: '100%' }}
                                                                >
                                                                    {hasFile ?
                                                                        (
                                                                            <span className="text-success">
                                                                                <i className="ri-check-line me-1"></i>
                                                                            </span>
                                                                        ) : (
                                                                            <>
                                                                                <i className="ri-upload-line me-1"></i>
                                                                                <span>Upload</span>
                                                                            </>
                                                                        )}
                                                                    <input
                                                                        type="file"
                                                                        className="d-none"
                                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                                                        onChange={(e) => {
                                                                            handleSpecificFileUpload(e, doc);
                                                                            if (!isSelected) {
                                                                                formik.setFieldValue("docType", doc);
                                                                            }
                                                                        }}
                                                                        onClick={(event) => {
                                                                            event.currentTarget.value = '';
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {/* File name display with remove option and error messages */}
                                                        {!isOther && (
                                                            <>
                                                                <div className="d-flex alignItems-center mt-1 small">
                                                                    {hasFile ? (
                                                                        <>
                                                                            <i className="ri-file-line me-1 text-muted"></i>
                                                                            <span className="text-truncate flex-grow-1 text-muted" style={{ maxWidth: '200px' }}>
                                                                                {hasFile.name} ({Math.round(hasFile.size / 1024)} KB)
                                                                            </span>
                                                                            <Button
                                                                                color="link"
                                                                                size="sm"
                                                                                className="p-0 text-danger"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    formik.setFieldValue(formikFieldName, null);
                                                                                    const fileInput = e.currentTarget.closest('.mb-2').querySelector('input[type="file"]');
                                                                                    if (fileInput) fileInput.value = '';
                                                                                    setPreviewContent(null);
                                                                                }}
                                                                                title="Remove file"
                                                                            >
                                                                                <i className="ri-close-line"></i>
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-muted">
                                                                            <i className="ri-file-upload-line me-1"></i>
                                                                            <span>No file selected</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {fileError && (
                                                                    <div className="small text-danger mt-1">
                                                                        <i className="ri-error-warning-line me-1"></i>
                                                                        {fileError}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Add + button for Other documents */}
                                            {formik.values.docType === 'Other' && (!formik.values.otherDocuments || formik.values.otherDocuments.length === 0) && (
                                                <div className="mt-2 d-flex justify-content-end">
                                                    <Button
                                                        color="outline-secondary"
                                                        size="sm"
                                                        className="d-flex alignItems-center justify-content-center"
                                                        style={{ width: '38px' }}
                                                        onClick={() => {
                                                            formik.setFieldValue("otherDocuments", [{
                                                                id: Date.now(),
                                                                file: null
                                                            }]);
                                                        }}
                                                        title="Add another document"
                                                    >
                                                        <i className="ri-add-line"></i>
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Render additional Other documents if they exist */}
                                            {formik.values.docType === 'Other' && formik.values.otherDocuments?.map((doc, index) => (
                                                <div key={`other-doc-${doc.id}`} className="mb-2">
                                                    <div className="d-flex alignItems-center gap-1">
                                                        {/* Buttons Container */}
                                                        <div className="d-flex" style={{ height: '38px' }}>
                                                            {/* Scan Button */}
                                                            {/* <Button
                                                                color="outline-secondary"
                                                                size="sm"
                                                                className="d-flex alignItems-center justify-content-center"
                                                                style={{ width: '80px', height: '100%' }}
                                                                // onClick={() => simulateScan('Other')}
                                                            >
                                                                <i className="ri-scan-line me-1"></i>
                                                                <span>Scan</span>
                                                            </Button> */}

                                                            {/* Upload Button with checkmark */}
                                                            <label
                                                                className={`btn btn-sm btn-outline-primary d-flex alignItems-center justify-content-center ms-2 position-relative`}
                                                                style={{ width: '80px', height: '100%' }}
                                                            >
                                                                {doc.file ?
                                                                    (
                                                                        <span className="text-success">
                                                                            <i className="ri-check-line me-1"></i>
                                                                        </span>
                                                                    ) : (
                                                                        <>
                                                                            <i className="ri-upload-line me-1"></i>
                                                                            <span>Upload</span>
                                                                        </>
                                                                    )}
                                                                <input
                                                                    type="file"
                                                                    className="d-none"
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                                                    onChange={(e) => {
                                                                        const file = e.currentTarget.files[0];
                                                                        console.log(`File selected for otherDocuments[${index}]:`, file);
                                                                        if (file) {
                                                                            const newOtherDocs = [...formik.values.otherDocuments];
                                                                            newOtherDocs[index].file = file;
                                                                            formik.setFieldValue("otherDocuments", newOtherDocs);
                                                                            formik.setFieldTouched(`otherDocuments[${index}].file`, true);
                                                                        }
                                                                    }}
                                                                    onClick={(event) => {
                                                                        event.currentTarget.value = '';
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {formik.errors.otherDocuments && formik.errors.otherDocuments[index] && formik.errors.otherDocuments[index].file && (formik.touched.otherDocuments?.[index]?.file || formik.submitCount > 0) && (
                                                        <div className="small text-danger mt-1">
                                                            <i className="ri-error-warning-line me-1"></i>
                                                            {formik.errors.otherDocuments[index].file}
                                                        </div>
                                                    )}

                                                    {/* File name display with remove option */}
                                                    <div className="d-flex alignItems-center mt-1 small">
                                                        {doc.file ?
                                                            (
                                                                <>
                                                                    <i className="ri-file-line me-1 text-muted"></i>
                                                                    <span className="text-truncate flex-grow-1 text-muted" style={{ maxWidth: '200px' }}>
                                                                        {doc.file.name} ({Math.round(doc.file.size / 1024)} KB)
                                                                    </span>
                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        className="p-0 text-danger"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newOtherDocs = [...formik.values.otherDocuments];
                                                                            newOtherDocs[index].file = null;
                                                                            formik.setFieldValue("otherDocuments", newOtherDocs);
                                                                        }}
                                                                        title="Remove file"
                                                                    >
                                                                        <i className="ri-close-line"></i>
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <div className="text-muted">
                                                                    <i className="ri-file-upload-line me-1"></i>
                                                                    <span>No file selected</span>
                                                                </div>
                                                            )}
                                                    </div>

                                                    {/* Remove document button and Add + button */}
                                                    <div className="mt-1 d-flex justify-content-end">
                                                        <Button
                                                            color="outline-danger"
                                                            size="sm"
                                                            className="d-flex alignItems-center justify-content-center me-2"
                                                            style={{ width: '38px' }}
                                                            onClick={() => {
                                                                const newOtherDocs = formik.values.otherDocuments.filter((_, i) => i !== index);
                                                                formik.setFieldValue("otherDocuments", newOtherDocs.length ? newOtherDocs : undefined);
                                                                formik.setFieldTouched('otherDocuments', true);
                                                            }}
                                                            title="Remove this document"
                                                        >
                                                            <i className="ri-close-line"></i>
                                                        </Button>

                                                        {/* Add + button (only show if not at max and is last item) */}
                                                        {index === formik.values.otherDocuments.length - 1 && formik.values.otherDocuments.length < 3 && (
                                                            <Button
                                                                color="outline-secondary"
                                                                size="sm"
                                                                className="d-flex alignItems-center justify-content-center"
                                                                style={{ width: '38px' }}
                                                                onClick={() => {
                                                                    formik.setFieldValue("otherDocuments", [
                                                                        ...formik.values.otherDocuments,
                                                                        {
                                                                            id: Date.now(),
                                                                            file: null
                                                                        }
                                                                    ]);
                                                                }}
                                                                title="Add another document"
                                                            >
                                                                <i className="ri-add-line"></i>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                                    style={{ height: '32px', fontSize: '0.9rem' }}
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
                                                    bsSize="md"
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
                                                    bsSize="md"
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

                {/* Approved Modal with API Integration */}
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

                {/* Rejected Modal with API Integration */}
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
