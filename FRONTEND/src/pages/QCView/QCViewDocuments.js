import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Spinner, Input, Table, Label, FormGroup, Alert, Badge
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { qcView, view, qcApproveReject, getDocumentDropdowns } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';

const SORT_ARROW_SIZE = 13; // px

function SortArrows({ direction, active }) {
    return (
        <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block' }}>
                <polyline
                    points="3,8 6.5,4 10,8"
                    fill="none"
                    stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block', marginTop: -2 }}>
                <polyline
                    points="3,5 6.5,9 10,5"
                    fill="none"
                    stroke={active && direction === 'desc' ? '#1064ea' : '#c1c5ca'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

const QCViewDocuments = () => {
    // State initialization
    document.title = `Quality Control | DMS`;
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionModal, setRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [previewError, setPreviewError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [userInfo, setUserInfo] = useState({
        email: '',
        roleId: null,
        userId: null,
        loginName: ''
    });
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState(null);
    const [databk, setDataBk] = useState([]);
    const [statusCounts, setStatusCounts] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });

    // New dropdown states from Preview.js
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [section, setSection] = useState('');
    const [userName, setUserName] = useState("");
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [userLevel, setUserLevel] = useState('');
    const [isFieldsDisabled, setIsFieldsDisabled] = useState({
        division: false,
        subDivision: false,
        section: false
    });
    const [dropdownsInitialized, setDropdownsInitialized] = useState(false);
    const [dropdownsLoading, setDropdownsLoading] = useState(true);
    const [shouldShowDropdowns, setShouldShowDropdowns] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    
    // Store original sections for proper filtering
    const [originalSectionOptions, setOriginalSectionOptions] = useState([]);

    // Table columns configuration
    const columns = useMemo(
        () => [
            {
                header: 'Document Name',
                accessorKey: 'DocumentName',
                key: 'DocumentName',
                sortable: true,
            },
            {
                header: 'Account ID',
                accessorKey: 'Account_Id',
                key: 'Account_Id',
                sortable: true,
            },
            {
                header: 'RR No',
                accessorKey: 'rr_no',
                key: 'rr_no',
                sortable: true,
            },
            {
                header: 'Consumer Name',
                accessorKey: 'consumer_name',
                key: 'consumer_name',
                sortable: true,
            },
            {
                header: 'Uploaded By',
                accessorKey: 'UploadedBy',
                key: 'UploadedBy',
                sortable: true,
            },
            {
                header: 'Upload Date',
                accessorKey: 'CreatedAt',
                key: 'CreatedAt',
                sortable: true,
            },
            {
                header: 'Actions',
                accessorKey: 'actions',
                key: 'actions',
                sortable: false,
            },
        ],
        []
    );

    // Flag ID function from Preview.js
    const flagIdFunction = useCallback(async (params) => {
        try {
            const res = await getDocumentDropdowns(params);
            return res?.data || [];
        } catch (error) {
            console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
            return [];
        }
    }, []);

    // Load dropdown data from session (from Preview.js)
    const loadDropdownDataFromSession = useCallback(async () => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const zones = authUser?.user?.zones || [];
        
        if (zones.length === 0) {
            setDropdownsInitialized(true);
            setDropdownsLoading(false);
            return;
        }

        const userZone = zones[0];
        const level = userZone.level;
        setUserLevel(level);

        try {
            if (level === 'section') {
                const divisionData = [{ div_code: userZone.div_code, division: userZone.division }];
                
                // Get unique subdivisions
                const uniqueSubDivisions = [];
                const seenSubDivisions = new Set();
                zones.forEach(zone => {
                    if (!seenSubDivisions.has(zone.sd_code)) {
                        seenSubDivisions.add(zone.sd_code);
                        uniqueSubDivisions.push({ sd_code: zone.sd_code, sub_division: zone.sub_division });
                    }
                });

                // Get all sections
                const allSections = zones.map(zone => ({ so_code: zone.so_code, section_office: zone.section_office, sd_code: zone.sd_code }));

                setDivisionName(divisionData);
                setSubDivisions(uniqueSubDivisions);
                setSectionOptions(allSections);
                setOriginalSectionOptions(allSections); // Store original sections
                
                setDivision(userZone.div_code);
                setIsFieldsDisabled({ division: true, subDivision: false, section: false });
                
                // Show dropdowns if there are multiple subdivisions
                if (uniqueSubDivisions.length > 1) {
                    setShouldShowDropdowns(true);
                } else {
                    // If only one subdivision, auto-select it and check sections
                    setSubDivision(uniqueSubDivisions[0].sd_code);
                    const sectionsForSubDiv = allSections.filter(sec => sec.sd_code === uniqueSubDivisions[0].sd_code);
                    if (sectionsForSubDiv.length === 1) {
                        setSection(sectionsForSubDiv[0].so_code);
                        setShouldShowDropdowns(false);
                    } else {
                        setShouldShowDropdowns(true);
                    }
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
                    setOriginalSectionOptions(sections); // Store original sections
                    
                    if (sections.length === 1) {
                        setSection(sections[0].so_code);
                        setIsFieldsDisabled(prev => ({ ...prev, section: true }));
                        setShouldShowDropdowns(false);
                    } else {
                        setShouldShowDropdowns(sections.length > 1);
                    }
                } else {
                    setShouldShowDropdowns(true);
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
                        setOriginalSectionOptions(sections); // Store original sections
                        
                        if (sections.length === 1) {
                            setSection(sections[0].so_code);
                            setIsFieldsDisabled(prev => ({ ...prev, section: true }));
                            setShouldShowDropdowns(false);
                        } else {
                            setShouldShowDropdowns(sections.length > 1);
                        }
                    } else {
                        setShouldShowDropdowns(true);
                    }
                } else {
                    setShouldShowDropdowns(true);
                }
            }
        } catch (error) {
            console.error('Error loading dropdown data:', error);
        } finally {
            setDropdownsInitialized(true);
            setDropdownsLoading(false);
        }
    }, [flagIdFunction, userName]);

    // Dropdown change handlers from Preview.js
    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        setSubDivision('');
        setSubDivisions([]);
        setSection('');
        setSectionOptions([]);
        setOriginalSectionOptions([]);

        if (selectedDivCode && userLevel === 'division') {
            const subdivisions = await flagIdFunction({ flagId: 2, requestUserName: userName, div_code: selectedDivCode });
            setSubDivisions(subdivisions);
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        setSection(''); // Clear section when subdivision changes

        if (selectedSdCode) {
            // For section level users, filter sections based on selected subdivision
            if (userLevel === 'section') {
                const filteredSections = originalSectionOptions.filter(sec => sec.sd_code === selectedSdCode);
                setSectionOptions(filteredSections);
            } else {
                // For other levels, fetch sections normally
                const sections = await flagIdFunction({ flagId: 3, requestUserName: userName, sd_code: selectedSdCode });
                setSectionOptions(sections);
                setOriginalSectionOptions(sections);
            }
        } else {
            // Reset sections if no subdivision selected
            if (userLevel === 'section') {
                // Show all sections for section level users
                setSectionOptions(originalSectionOptions);
            } else {
                setSectionOptions([]);
                setOriginalSectionOptions([]);
            }
        }
    };

    const handleSectionChange = (e) => {
        const selectedSectionCode = e.target.value;
        setSection(selectedSectionCode);
    };

    // Reset function to clear all dropdowns and search state
    const handleReset = () => {
        setDivision('');
        setSubDivision('');
        setSection('');
        setSubDivisions([]);
        setSectionOptions([]);
        setOriginalSectionOptions([]);
        setHasSearched(false);
        setDocuments([]);
        setFilteredDocuments([]);
        setDataBk([]);
        setSearchValue('');
        setSortConfig({ key: null, direction: null });
        setPage(0);
        setActiveTab('pending');
        setStatusCounts({ pending: 0, approved: 0, rejected: 0 });
        
        // Reload dropdown data from session
        loadDropdownDataFromSession();
    };

    // Get user info from session storage
    useEffect(() => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser && authUser.user) {
            const userData = {
                email: authUser.user.Email || '',
                roleId: authUser.user.Role_Id || null,
                userId: authUser.user.User_Id || null,
                loginName: authUser.user.LoginName || ''
            };
            setUserInfo(userData);
            setUserName(userData.email);
        }
    }, []);

    // Initialize dropdowns when userName is set
    useEffect(() => {
        if (userName) {
            loadDropdownDataFromSession();
        }
    }, [userName, loadDropdownDataFromSession]);

    // Handle search button click
    const handleSearchClick = async () => {
        if (subDivisions.length > 1 && !subDivision) {
            setResponse('Please select a subdivision before searching.');
            setErrorModal(true);
            return;
        }
        if (sectionOptions.length > 1 && !section) {
            setResponse('Please select a section before searching.');
            setErrorModal(true);
            return;
        }
        
        setSearchLoading(true);
        setHasSearched(false);
        
        try {
            await fetchInitialData(userInfo);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
            setResponse('Failed to load documents');
            setErrorModal(true);
        } finally {
            setSearchLoading(false);
        }
    };

    // Fetch initial data (pending documents and all counts)
    const fetchInitialData = async (userData) => {
        setLoading(true);
        try {
            // Fetch pending documents (flagId: 1)
            const response = await qcView({
                flagId: 1, // Using flagId: 1 for actual pending documents
                roleId: userData.roleId,
                requestUserName: userData.email
            });
            if (response.status === "success") {
                const pendingDocs = response.results || [];
                setDocuments(pendingDocs);
                setFilteredDocuments(pendingDocs);
                setDataBk(pendingDocs); // Store in databk for pending tab
            } else {
                setResponse(response.message || "Failed to fetch initial data");
                setErrorModal(true);
            }
            // Fetch counts for all tabs
            await fetchAllDocumentCounts(userData);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setResponse(error.message || 'Failed to fetch initial data');
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all document counts
    const fetchAllDocumentCounts = async (userData) => {
        try {
            // Fetch pending count (flagId: 3)
            const pendingResponse = await qcView({
                flagId: 3,
                roleId: userData.roleId,
                User_Id: userData.userId,
                requestUserName: userData.email
            });
            // Fetch approved count (flagId: 4)
            const approvedResponse = await qcView({
                flagId: 4,
                roleId: userData.roleId,
                User_Id: userData.userId,
                requestUserName: userData.email
            });
            // Fetch rejected count (flagId: 5)
            const rejectedResponse = await qcView({
                flagId: 5,
                roleId: userData.roleId,
                User_Id: userData.userId,
                requestUserName: userData.email
            });

            setStatusCounts({
                pending: pendingResponse.status === "success" ? pendingResponse.count || 0 : 0,
                approved: approvedResponse.status === "success" ? approvedResponse.count || 0 : 0,
                rejected: rejectedResponse.status === "success" ? rejectedResponse.count || 0 : 0
            });
        } catch (error) {
            console.error('Error fetching document counts:', error);
        }
    };

    // Fetch documents for a specific tab
    const fetchDocuments = async (tab, userData) => {
        let flagId;
        switch (tab) {
            case 'approved':
                flagId = 4;
                break;
            case 'rejected':
                flagId = 5;
                break;
            case 'pending':
                flagId = 1;
                break;
            default:
                return;
        }

        try {
            const response = await qcView({
                flagId: flagId,
                roleId: userData.roleId,
                User_Id: userData.userId,
                requestUserName: userData.email
            });

            if (response.status === "success") {
                const docs = response.results || [];
                setDocuments(docs);
                setFilteredDocuments(docs);
                if (tab === 'pending') {
                    setDataBk(docs); // Update the backup for pending docs
                }
            } else {
                setResponse(response.message || `Failed to fetch ${tab} documents`);
                setErrorModal(true);
                setDocuments([]);
                setFilteredDocuments([]);
            }
        } catch (error) {
            console.error(`Fetch error for ${tab} tab:`, error);
            setResponse(error.message || `Failed to fetch ${tab} documents`);
            setErrorModal(true);
            setDocuments([]);
            setFilteredDocuments([]);
        }
    };

    // Handle tab change
    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        setPage(0);
        setSearchValue('');
        setSortConfig({ key: null, direction: null });
        setLoading(true);

        try {
            await fetchDocuments(tab, userInfo);
        } finally {
            setLoading(false);
        }
    };
    
    // Refresh handler to reload current tab data and all counts
    const handleRefresh = async () => {
        setLoading(true);
        setSearchValue('');
        setRejectionReason(''); // Clear any stale rejection reason
        try {
            await Promise.all([
                fetchDocuments(activeTab, userInfo),
                fetchAllDocumentCounts(userInfo)
            ]);
        } catch (error) {
            console.error("Error during refresh:", error);
            setResponse("Failed to refresh data.");
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    // Sorting function
    const sortData = (data, key, direction) => {
        if (!key || !direction) return data;
        return [...data].sort((a, b) => {
            const aValue = a[key] === null || a[key] === undefined ? '' : a[key];
            const bValue = b[key] === null || b[key] === undefined ? '' : b[key];
            let aVal = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
            let bVal = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
            if (direction === 'asc') {
                if (aVal < bVal) return -1;
                if (aVal > bVal) return 1;
                return 0;
            } else {
                if (aVal > bVal) return -1;
                if (aVal < bVal) return 1;
                return 0;
            }
        });
    };

    // Enhanced search across all document fields
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchValue(term);
        setSortConfig({ key: null, direction: null });

        const sourceData = activeTab === 'pending' ? databk : documents;

        if (!term) {
            setFilteredDocuments(sourceData);
            setPage(0);
            return;
        }

        const filtered = sourceData.filter(doc => {
            const fieldsToSearch = [
                'DocumentName', 'Account_Id', 'rr_no', 'consumer_name',
                'UploadedBy', 'division', 'sub_division', 'section',
                'MetaTags', 'CreatedAt', 'Status', 'RejectionReason',
                'consumer_address'
            ];
            return fieldsToSearch.some(field => {
                const value = doc[field];
                return value && value.toString().toLowerCase().includes(term);
            });
        });

        setFilteredDocuments(filtered);
        setPage(0);
    };

    const handleFileSelect = async (doc) => {
        setCurrentDoc(doc);
        setPreviewLoading(true);
        setPreviewContent(null);
        setPreviewError(null);
        setPreviewModal(true);

        try {
            const response = await view({
                flagId: 2,
                DocumentId: doc.DocumentId,
                requestUserName: userInfo.email
            }, {
                responseType: 'blob'
            });
            if (response instanceof Blob) {
                const fileUrl = URL.createObjectURL(response);
                const fileType = response.type.split('/')[1] || doc.DocumentName?.split('.').pop() || 'unknown';

                setPreviewContent({
                    url: fileUrl,
                    type: fileType,
                    name: doc.DocumentName,
                    blob: response
                });
            }
            else if (response.data && response.data instanceof Blob) {
                const fileUrl = URL.createObjectURL(response.data);
                const fileType = response.data.type.split('/')[1] || doc.DocumentName?.split('.').pop() || 'unknown';

                setPreviewContent({
                    url: fileUrl,
                    type: fileType,
                    name: doc.DocumentName,
                    blob: response.data
                });
            }
            else {
                throw new Error("Invalid preview response format");
            }
        } catch (error) {
            console.error("Preview error:", error);
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

    // Handlers for the rejection modal to ensure state is always clean
    const openRejectionModal = () => {
        setRejectionReason(''); // Clear previous reason before opening
        setRejectionModal(true);
    };

    const closeRejectionModal = () => {
        setRejectionModal(false);
        setRejectionReason(''); // Also clear reason on close
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

    const handleStatusUpdate = async (docId, status, reason = '') => {
        setActionLoading(true);
        try {
            const payload = {
                flagId: status === 'Approved' ? 6 : 7, // 6 for approve, 7 for reject
                roleId: userInfo.roleId,
                User_Id: userInfo.userId,
                requestUserName: userInfo.email,
                DocumentId: docId,
                ...(status === 'Rejected' && { RejectionComment: reason })
            };

            const response = await qcApproveReject(payload);
            if (response.status === "success") {
                setPreviewModal(false);
                closeRejectionModal(); // Use the new handler to close and clear

                setResponse(status === 'Approved'
                    ? 'Document approved successfully'
                    : 'Document rejected successfully');
                setSuccessModal(true);

                // Refresh the view to get updated lists and counts
                handleRefresh();
            } else {
                setResponse(response.message || 'Failed to update document status');
                setErrorModal(true);
            }
        } catch (error) {
            console.error('Update error:', error);
            setResponse(error.message || 'Failed to update document status');
            setErrorModal(true);
        } finally {
            setActionLoading(false);
        }
    };

    // Memoized data for performance
    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return filteredDocuments;
        return sortData(filteredDocuments, sortConfig.key, sortConfig.direction);
    }, [filteredDocuments, sortConfig]);
    
    const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, page, pageSize]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch {
            return dateString;
        }
    };

    // Get file icon based on file extension
    const getFileIcon = (fileName) => {
        if (!fileName) return <i className="ri-file-fill text-secondary"></i>;
        const extension = fileName.split('.').pop().toLowerCase();
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
        return <i className={`${icons[extension] || icons.default} me-2`}></i>;
    };

    // Table header rendering
    const renderTableHeader = () => (
        <tr>
            {columns.map((col, idx) => {
                if (!col.sortable) {
                    return <th key={col.key || idx}>{col.header}</th>;
                }
                const active = sortConfig.key === col.key && sortConfig.direction !== null;
                const direction = active ? sortConfig.direction : 'asc';
                return (
                    <th
                        key={col.key || idx}
                        onClick={() => {
                            if (!col.sortable) return;
                            if (sortConfig.key !== col.key) {
                                setSortConfig({ key: col.key, direction: 'asc' });
                            } else if (sortConfig.direction === 'asc') {
                                setSortConfig({ key: col.key, direction: 'desc' });
                            } else if (sortConfig.direction === 'desc') {
                                setSortConfig({ key: null, direction: null });
                            } else {
                                setSortConfig({ key: col.key, direction: 'asc' });
                            }
                            setPage(0);
                        }}
                        style={{
                            cursor: col.sortable ? 'pointer' : 'default',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            paddingRight: 14,
                            verticalAlign: 'middle',
                        }}
                    >
                        {col.header}
                        <SortArrows active={active} direction={direction} />
                        {sortConfig.key === col.key && sortConfig.direction === null && (
                            <span style={{ fontSize: 10, color: '#748391', marginLeft: 4 }}>(Original)</span>
                        )}
                    </th>
                );
            })}
        </tr>
    );
    
    const renderTableRows = () => {
        if (loading || dropdownsLoading) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
                        <Spinner color="primary" />
                        <div className="mt-2">
                            {dropdownsLoading ? 'Initializing system...' : 'Loading documents...'}
                        </div>
                    </td>
                </tr>
            );
        }

        if (paginatedData.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="text-center py-4">
                        {documents.length === 0 ? 'No documents available' : 'No documents match your search'}
                    </td>
                </tr>
            );
        }

        return paginatedData.map((doc, index) => (
            <tr key={doc.DocumentId || index}>
                <td>
                    <div className="d-flex align-items-center">
                        {getFileIcon(doc.DocumentName)}
                        <span title={doc.DocumentName}>
                            {doc.DocumentName?.length > 30
                                ? `${doc.DocumentName.substring(0, 30)}...`
                                : doc.DocumentName}
                        </span>
                        {doc.Status === 'Approved' && (
                            <Badge color="success" className="ms-2">Approved</Badge>
                        )}
                        {doc.Status === 'Rejected' && (
                            <Badge color="danger" className="ms-2">Rejected</Badge>
                        )}
                    </div>
                </td>
                <td>{doc.Account_Id || 'N/A'}</td>
                <td>{doc.rr_no || 'N/A'}</td>
                <td>{doc.consumer_name || 'N/A'}</td>
                <td>{doc.UploadedBy || 'N/A'}</td>
                <td>{formatDate(doc.CreatedAt)}</td>
                <td>
                    <Button
                        color="primary"
                        size="sm"
                        onClick={() => handleFileSelect(doc)}
                        className="me-1"
                    >
                        <i className="ri-eye-line"></i> View
                    </Button>
                </td>
            </tr>
        ));
    };

    // PAGINATION
    const renderPagination = () => {
        const pageSizeOptions = [
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 15, label: '15' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
            { value: -1, label: 'All' },
        ];
        return (
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: 'white',
                padding: '15px 0',
                borderTop: '1px solid #dee2e6',
                zIndex: 1
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                }}>
                    {/* Left: Showing Results & Page Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
                            Showing{' '}
                            <b style={{ color: '#222', fontWeight: 600 }}>
                                {pageSize === -1 ? sortedData.length : Math.min(pageSize, sortedData.length - (page * pageSize))}
                            </b>{' '}
                            of <b>{sortedData.length}</b> Results
                        </span>
                        <select
                            value={pageSize}
                            onChange={e => {
                                const val = e.target.value === '-1' ? -1 : parseInt(e.target.value, 10);
                                setPageSize(val);
                                setPage(0);
                            }}
                            style={{
                                border: '1px solid #c9ddf7',
                                borderRadius: 7,
                                padding: '7px 10px',
                                fontSize: 15,
                                width: '80px',
                                color: '#444',
                                marginTop: 4,
                                outline: 'none',
                                background: 'white',
                                boxShadow: '0 0 0 2px #d0ebfd66',
                            }}
                        >
                            {pageSizeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Pagination Controls */}
                    <div className="btn-group" role="group" aria-label="Pagination">
                        <button
                            type="button"
                            className="btn btn-light"
                            disabled={page === 0 || pageSize === -1}
                            onClick={() => setPage(Math.max(page - 1, 0))}
                        >
                            Previous
                        </button>
                        {pageSize !== -1 && Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
                            let pageNum = i;
                            if (pageCount > 5) {
                                if (page >= 3 && page < pageCount - 2) {
                                    pageNum = page - 2 + i;
                                } else if (page >= pageCount - 2) {
                                    pageNum = pageCount - 5 + i;
                                }
                            }
                            if (pageNum >= 0 && pageNum < pageCount) {
                                return (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`}
                                        onClick={() => setPage(pageNum)}
                                        disabled={page === pageNum}
                                        aria-current={page === pageNum ? 'page' : undefined}
                                        style={{ minWidth: 36 }}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            } else {
                                return null;
                            }
                        })}
                        <button
                            type="button"
                            className="btn btn-light"
                            disabled={(page >= pageCount - 1 || pageCount === 0) || pageSize === -1}
                            onClick={() => setPage(Math.min(page + 1, pageCount - 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const LazyPreviewContent = ({ doc }) => {
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
                                {!previewLoaded ? (
                                    <div className="text-center h-100 d-flex flex-column justify-content-center align-items-center"
                                        style={{ minHeight: '400px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading preview...</p>
                                    </div>
                                ) : previewLoading ? (
                                    <div className="text-center h-100 d-flex flex-column justify-content-center align-items-center"
                                        style={{ minHeight: '400px' }}>
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading document content...</p>
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
                                                    <p>This file type ({previewContent.type}) cannot be previewed in the browser.</p>
                                                    <Button
                                                        color="primary"
                                                        onClick={handleDownload}
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
                                            <p className="mb-1 text-break">{doc.DocumentName}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Account ID:</Label>
                                            <p className="mb-1">{doc.Account_Id || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">RR No:</Label>
                                            <p className="mb-1">{doc.rr_no || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Consumer Name:</Label>
                                            <p className="mb-1">{doc.consumer_name || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Consumer Address:</Label>
                                            <p className="mb-1 text-break">{doc.consumer_address || 'N/A'}</p>
                                        </div>
                                    </Col>

                                    {/* Right Column */}
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Division:</Label>
                                            <p className="mb-1">{doc.division || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Sub Division:</Label>
                                            <p className="mb-1">{doc.sub_division || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Section:</Label>
                                            <p className="mb-1">{doc.section || 'N/A'}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Uploaded By:</Label>
                                            <p className="mb-1">{doc.UploadedBy}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Upload Date:</Label>
                                            <p className="mb-1">{formatDate(doc.CreatedAt)}</p>
                                        </div>
                                        <div className="mb-2">
                                            <Label className="fw-semibold">Meta Tags:</Label>
                                            <p className="mb-1">{doc.MetaTags || 'N/A'}</p>
                                        </div>
                                        {doc.Status === 'Rejected' && doc.RejectionReason && (
                                            <div className="mb-2">
                                                <Label className="fw-semibold">Rejection Reason:</Label>
                                                <p className="mb-1 text-danger">{doc.RejectionReason}</p>
                                            </div>
                                        )}
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
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="QC Document Review" pageTitle="Quality Control" />

                    <Card>
                        <CardHeader className="bg-primary text-white p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0 card-title text-white">
                                    <i className="ri-checkbox-multiple-line me-2"></i>
                                    Document Quality Control
                                </h4>
                                {userInfo.loginName && (
                                    <div className="text-white">
                                        <small>
                                            <i className="ri-user-line me-1"></i>
                                            Welcome, {userInfo.loginName}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardBody style={{ paddingBottom: '80px' }}>
                            {/* Dropdown Filters - Only show when needed */}
                            {shouldShowDropdowns && !dropdownsLoading && (
                                <Card className="mb-4">
                                    <CardHeader className="bg-light p-3">
                                        <h5 className="mb-0">
                                            <i className="ri-filter-line me-2"></i>
                                            Filter Options
                                        </h5>
                                    </CardHeader>
                                    <CardBody>
                                        <Row className="g-3 mb-3">
                                            {!isFieldsDisabled.division && divisionName.length > 1 && (
                                                <Col md={3}>
                                                    <FormGroup>
                                                        <Label>Division<span className="text-danger">*</span></Label>
                                                        <Input 
                                                            type="select" 
                                                            value={division} 
                                                            onChange={handleDivisionChange}
                                                        >
                                                            <option value="">Select Division</option>
                                                            {divisionName.map(div => (
                                                                <option key={div.div_code} value={div.div_code}>
                                                                    {div.division}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            )}
                                            
                                            {!isFieldsDisabled.subDivision && subDivisions.length > 1 && (
                                                <Col md={3}>
                                                    <FormGroup>
                                                        <Label>Sub Division<span className="text-danger">*</span></Label>
                                                        <Input 
                                                            type="select" 
                                                            value={subDivision} 
                                                            onChange={handleSubDivisionChange}
                                                        >
                                                            <option value="">Select Sub Division</option>
                                                            {subDivisions.map(subDiv => (
                                                                <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                                    {subDiv.sub_division}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            )}
                                            
                                            {/* Section dropdown - Fixed filtering logic */}
                                            {sectionOptions.length > 1 && (
                                                <Col md={3}>
                                                    <FormGroup>
                                                        <Label>Section<span className="text-danger">*</span></Label>
                                                        <Input 
                                                            type="select" 
                                                            value={section} 
                                                            onChange={handleSectionChange}
                                                        >
                                                            <option value="">Select Section</option>
                                                            {sectionOptions.map(sec => (
                                                                <option key={sec.so_code} value={sec.so_code}>
                                                                    {sec.section_office}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            )}
                                            
                                            <Col md={3} className="d-flex align-items-end">
                                                <div className="d-flex gap-2 w-100">
                                                    <FormGroup className="mb-0 flex-grow-1">
                                                        <Button 
                                                            color="primary" 
                                                            size="sm"
                                                            className="w-100"
                                                            onClick={handleSearchClick}
                                                            disabled={searchLoading || (subDivisions.length > 1 && !subDivision) || (sectionOptions.length > 1 && !section)}
                                                            style={{ height: '38px' }}
                                                        >
                                                            {searchLoading ? (
                                                                <>
                                                                    <Spinner size="sm" className="me-1" />
                                                                    Searching...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="ri-search-line me-1"></i>
                                                                    Search
                                                                </>
                                                            )}
                                                        </Button>
                                                    </FormGroup>
                                                    <FormGroup className="mb-0">
                                                        <Button 
                                                            color="warning" 
                                                            size="sm"
                                                            onClick={handleReset}
                                                            disabled={searchLoading || dropdownsLoading}
                                                            style={{ height: '38px' }}
                                                        >
                                                            <i className="ri-refresh-line me-1"></i>
                                                            Reset
                                                        </Button>
                                                    </FormGroup>
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Only show document interface after search is performed */}
                            {dropdownsInitialized && hasSearched && (
                                <>
                                    <Row className="mb-3 align-items-center">
                                        <Col md={6}>
                                            <div className="d-flex flex-wrap gap-2">
                                                {/* Tabs */}
                                                <Button
                                                    color={activeTab === 'pending' ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleTabChange('pending')}
                                                    className="position-relative px-4"
                                                >
                                                    <i className="ri-time-line me-1"></i> Pending
                                                    <Badge
                                                        color="danger" pill
                                                        className="position-absolute top-0 start-100 translate-middle"
                                                        style={{ fontSize: '0.65rem', minWidth: '18px' }}
                                                    >
                                                        {statusCounts.pending}
                                                    </Badge>
                                                </Button>
                                                <Button
                                                    color={activeTab === 'approved' ? 'success' : 'outline-success'}
                                                    onClick={() => handleTabChange('approved')}
                                                    className="position-relative px-4"
                                                >
                                                    <i className="ri-checkbox-circle-line me-1"></i> Approved
                                                    <Badge
                                                        color="success" pill
                                                        className="position-absolute top-0 start-100 translate-middle"
                                                        style={{ fontSize: '0.65rem', minWidth: '18px' }}
                                                    >
                                                        {statusCounts.approved}
                                                    </Badge>
                                                </Button>
                                                <Button
                                                    color={activeTab === 'rejected' ? 'danger' : 'outline-danger'}
                                                    onClick={() => handleTabChange('rejected')}
                                                    className="position-relative px-4"
                                                >
                                                    <i className="ri-close-circle-line me-1"></i> Rejected
                                                    <Badge
                                                        color="warning" pill
                                                        className="position-absolute top-0 start-100 translate-middle"
                                                        style={{ fontSize: '0.65rem', minWidth: '18px' }}
                                                    >
                                                        {statusCounts.rejected}
                                                    </Badge>
                                                </Button>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex flex-wrap justify-content-end gap-2">
                                                <div className="search-box">
                                                    <Input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search across all fields..."
                                                        value={searchValue}
                                                        onChange={handleSearch}
                                                    />
                                                    <i className="ri-search-line search-icon"></i>
                                                </div>
                                                <Button color="success" onClick={handleRefresh} disabled={loading}>
                                                    {loading ? (
                                                        <>
                                                            <Spinner size="sm" className="me-2" />
                                                            Refreshing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="ri-refresh-line me-1"></i> Refresh
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="table-responsive" style={{
                                        maxHeight: 'calc(100vh - 300px)',
                                        overflowY: 'auto'
                                    }}>
                                        <table className="grid-table mb-0" style={{ minWidth: 1020, width: '100%', backgroundColor: 'transparent' }}>
                                            <thead className="table-light" style={{
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 1,
                                                background: 'white'
                                            }}>
                                                {renderTableHeader()}
                                            </thead>
                                            <tbody>
                                                {renderTableRows()}
                                            </tbody>
                                        </table>
                                    </div>

                                    {!loading && !dropdownsLoading && renderPagination()}
                                </>
                            )}

                            {/* Show search instruction when dropdowns are not shown or search hasn't been performed */}
                            {dropdownsInitialized && !shouldShowDropdowns && !hasSearched && (
                                <Card className="mb-4">
                                    <CardBody className="text-center py-5">
                                        <i className="ri-search-line display-4 text-primary mb-3"></i>
                                        <h5>Ready to Search Documents</h5>
                                        <p className="text-muted mb-3">Click the button below to load your quality control documents</p>
                                        <Button 
                                            color="primary" 
                                            size="lg"
                                            onClick={handleSearchClick}
                                            disabled={searchLoading}
                                        >
                                            {searchLoading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Loading Documents...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ri-search-line me-2"></i>
                                                    Load QC Documents
                                                </>
                                            )}
                                        </Button>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Loading state for initialization */}
                            {dropdownsLoading && (
                                <div className="text-center py-5">
                                    <Spinner size="lg" color="primary" />
                                    <h5 className="mt-3">Initializing Quality Control System...</h5>
                                    <p className="text-muted">Loading user permissions and system configuration</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Document Preview Modal */}
                    <Modal
                        isOpen={previewModal}
                        toggle={closePreview}
                        size="xl"
                        centered
                        className="document-preview-modal"
                    >
                        <ModalHeader className="bg-primary text-white p-3" toggle={closePreview}>
                            <span className="modal-title text-white">
                                <i className="ri-file-text-line me-2"></i>
                                {currentDoc?.DocumentName || 'Document Preview'}
                                {currentDoc?.Status === 'Approved' && (
                                    <Badge color="success" className="ms-2">Approved</Badge>
                                )}
                                {currentDoc?.Status === 'Rejected' && (
                                    <Badge color="danger" className="ms-2">Rejected</Badge>
                                )}
                            </span>
                        </ModalHeader>
                        <ModalBody style={{
                            maxHeight: '60vh',
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {currentDoc && <LazyPreviewContent doc={currentDoc} />}
                        </ModalBody>
                        <ModalFooter style={{ borderTop: 'none' }}>
                            <Button color="secondary" onClick={closePreview}>
                                <i className="ri-close-line me-1"></i>
                                Close
                            </Button>
                            {activeTab === 'pending' && (
                                <>
                                    <Button
                                        color="success"
                                        onClick={() => handleStatusUpdate(currentDoc.DocumentId, 'Approved')}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? ( <> <Spinner size="sm" className="me-2" /> Approving... </> ) : ( <> <i className="ri-check-line me-1"></i> Approve </> )}
                                    </Button>
                                    <Button
                                        color="danger"
                                        onClick={openRejectionModal}
                                        disabled={actionLoading}
                                    >
                                        <i className="ri-close-line me-1"></i>
                                        Reject
                                    </Button>
                                </>
                            )}
                        </ModalFooter>
                    </Modal>

                    {/* Rejection Reason Modal */}
                    <Modal isOpen={rejectionModal} toggle={closeRejectionModal} centered>
                        <ModalHeader className="bg-primary text-white p-3" toggle={closeRejectionModal}>
                            <span className="modal-title text-white">
                                <i className="ri-close-circle-line me-2"></i>
                                Reject Document
                            </span>
                        </ModalHeader>
                        <ModalBody>
                            <Alert color="warning" className="mb-3">
                                <i className="ri-alert-line me-2"></i>
                                Please provide a reason for rejecting this document.
                            </Alert>
                            <FormGroup>
                                <Label for="rejectionReason">Reason for Rejection *</Label>
                                <Input
                                    type="textarea"
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows="4"
                                    placeholder="Enter detailed reason for rejection..."
                                    required
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter style={{ borderTop: 'none' }}>
                            <Button color="light" onClick={closeRejectionModal}>
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                onClick={() => {
                                    if (rejectionReason.trim()) {
                                        handleStatusUpdate(currentDoc.DocumentId, 'Rejected', rejectionReason.trim());
                                    }
                                }}
                                disabled={!rejectionReason.trim() || actionLoading}
                            >
                                {actionLoading ? ( <> <Spinner size="sm" className="me-2" /> Rejecting... </> ) : ( <> <i className="ri-close-line me-1"></i> Confirm Rejection </> )}
                            </Button>
                        </ModalFooter>
                    </Modal>
                </Container>
            </div>

            <SuccessModal
                show={successModal}
                onCloseClick={() => setSuccessModal(false)}
                successMsg={response}
            />
            <ErrorModal
                show={errorModal}
                onCloseClick={() => setErrorModal(false)}
                errorMsg={response}
            />

            <style>
                {`
                .page-content { min-height: 100vh; padding-bottom: 60px; }
                .results-container { height: calc(100vh - 320px); min-height: 500px; margin-bottom: 40px; }
                .fixed-height-card { height: 100%; display: flex; flex-direction: column; }
                .fixed-height-card .card-body { flex: 1; overflow-y: auto; }
                .preview-scrollable, .custom-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
                .preview-scrollable::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar { display: none; }
                .preview-container { height: 100%; overflow: hidden; display: flex; flex-direction: column; }
                .preview-scrollable { flex: 1; overflow-y: auto; padding-right: 5px; margin-right: -5px; }
                .preview-body { overflow: hidden !important; height: calc(100% - 60px); }
                .preview-content { overflow: hidden; position: relative; }
                .pdf-viewer-container { width: 100%; height: 100%; overflow: hidden; }
                .pdf-viewer-container embed { width: 100%; height: 100%; min-height: 500px; }
                .document-details { height: 100%; display: flex; flex-direction: column; }
                .slide-in-left { animation: slideInLeft 0.5s ease-out forwards; opacity: 0; transform: translateX(-20px); }
                .slide-in-right { animation: slideInRight 0.5s ease-out forwards; opacity: 0; transform: translateX(20px); }
                .fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
                .fade-in-list-item { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
                .delay-3 { animation-delay: 0.6s; }
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .border-top-primary { border-top: 3px solid #405189 !important; }
                @media (max-width: 991px) {
                    .results-container { height: auto; min-height: auto; }
                    .fixed-height-card { height: 400px; margin-bottom: 20px; }
                    .results-container .col-lg-3:first-child .fixed-height-card:first-child,
                    .results-container .col-lg-3:first-child .fixed-height-card:last-child { height: 350px; }
                }
                `}
            </style>
        </React.Fragment>
    );
};

export default QCViewDocuments;