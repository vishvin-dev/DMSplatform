import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardBody, Input, Table, Button, Modal,
    ModalHeader, ModalBody, ModalFooter, Row, Col, Label, FormGroup, Spinner, Alert
} from 'reactstrap';
import letterheadImg from './VishvinLetterHead.jpg'; 
import { indentView } from '../../helpers/fakebackend_helper'; 

// =================================================================
// 1. CONSTANTS AND UTILITY FUNCTIONS
// =================================================================

const INITIAL_INDENTS = [];
let GLOBAL_STATUS_MAP = {}; 

const BASE_STATUS_OPTIONS = [
    { label: 'All', value: 'all' },
];

const formatSelectedOptions = (names) => {
    if (!names) return '';
    const parts = names.split('/').map(p => p.trim()).filter(p => p.length > 0);
    return parts.join(' / ');
};

const renderIndentTemplate = (indentData) => {
    if (!indentData) return null;
    const submitTo = indentData.submitTo || '';
    const selectedOptions = indentData.selectedOptions || [];
    const isReturned = indentData.status === 'Rejected' || indentData.status === 'Returned for Revision' || indentData.status === 'ResubmittedToOfficers';
    const hasQuantityData = indentData.officerEnteredQty || indentData.finalApprovedQty;

    const getToCode = () => {
        if (submitTo === 'division') return indentData.divisionCode;
        if (submitTo === 'subdivision') return indentData.subDivisionCode;
        return indentData.subDivisionCode || indentData.sectionCode;
    };
    const formattedOptionNames = `${indentData.division} / ${indentData.subDivision} / ${indentData.sectionNames || ''}`; 

    return (
        <div className="a4-sheet-modal" style={{ backgroundImage: `url(${letterheadImg})` }}>
            <div className="content-wrapper-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div><strong>Indent No.:</strong> {indentData.indentNumber}</div>
                    <div style={{ textAlign: 'right' }}>
                        <div><strong>Date:</strong> {indentData.date}</div>
                        <div><strong>Time:</strong> {indentData.time}</div>
                    </div>
                </div>
                
                {isReturned && indentData.rejectionReason && (
                    <div className="alert alert-info p-3 mb-3 border border-info" style={{ fontSize: '14px' }}>
                        <h6 className="mb-1 text-dark">Revision Instructions:</h6>
                        <p className="mb-0 fw-bold">{indentData.rejectionReason}</p>
                    </div>
                )}
                
                <div><p>To,</p><p>The {submitTo.charAt(0).toUpperCase() + submitTo.slice(1)} Officer</p><p>{getToCode()}</p></div>
                <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    <p>Subject: Request for physical records of Gescom Consumer of {formattedOptionNames}</p>
                    <p>DWA No: 14,42,53,250</p>
                </div>
                <div><p>Dear Sir/Madam,</p><p>With reference to the above DWA no and subject, we request for the physical available consumer records of the below listed location(s).</p></div>
                
                <Table bordered size="sm" className="mb-4">
                    <thead>
                        <tr>
                            <th>SL NO</th>
                            <th>Division</th>
                            <th>Sub-Division</th>
                            <th>Section / Sub-Division</th>
                            {hasQuantityData && <th>Officer Confirmed Qty</th>}
                            {hasQuantityData && <th>Final Approved Qty</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedOptions.map((option, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{option.divisionName}</td>
                                <td>{option.subDivisionName}</td>
                                <td>{option.name}</td>
                                {hasQuantityData && <td className="text-center">{indentData.officerEnteredQty || '0'}</td>}
                                {hasQuantityData && <td className="text-center">{indentData.finalApprovedQty || '0'}</td>}
                            </tr>
                        ))}
                    </tbody>
                </Table>
                
                <p>Kindly process and arrange for handover of physical consumer records of above mentioned location.</p>
                <div style={{ marginTop: '40px' }}>
                    <p>Thanking you,</p><p>Yours faithfully,</p><br />
                    <p>_________________________</p>
                    <p><small>Disclaimer * seal is not mandatory</small></p>
                    <p><small>(This is a computer/system generated copy)</small></p>
                </div>
            </div>
        </div>
    );
};

// Normalize API response
const normalizeIndentData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map(item => {
        const createdDate = new Date(item.CreatedOn || new Date());
        const status = GLOBAL_STATUS_MAP[item.Status_Id] || item.IndentStatus || 'Unknown';
        const division = item.division_names || 'N/A';
        const subDivision = item.subdivision_names || 'N/A';
        const sectionNames = item.section_names || 'N/A';
        const submitTo = (item.CreatedByRole || '').includes('Section') ? 'section' : 
                        (item.CreatedByRole || '').includes('SubDivision') ? 'subdivision' : 'division';

        const soCodesArray = (item.so_codes || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
        const sectionNamesArray = (item.section_names || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
        const maxLen = Math.max(soCodesArray.length, sectionNamesArray.length);
        
        const normalizedSections = Array.from({ length: maxLen }).map((_, index) => ({
            name: sectionNamesArray[index] || soCodesArray[index] || 'N/A',
            code: soCodesArray[index] || item.sd_codes, 
            quantity: 0, 
            divisionName: division, 
            subDivisionName: subDivision
        }));

        return {
            indentNumber: item.fullIndentNo || item.Indent_No || 'N/A',
            createdBy: item.FirstName || item.RequestUserName || 'N/A',
            approvedBy: item.FinalApprovedByUser || 'N/A', 
            createdOn: item.CreatedOn,
            date: createdDate.toLocaleDateString('en-GB'),
            time: createdDate.toLocaleTimeString('en-US', { hour12: true }),
            division: division,
            subDivision: subDivision,
            subDivisionCode: item.sd_codes,
            divisionCode: item.div_codes,
            sectionCode: item.so_codes,
            submitTo: submitTo,
            status: status,
            sectionNames: sectionNames,
            finalApprovedQty: item.FinalApprovedQty || null,
            officerEnteredQty: item.OfficerEnteredQty || null,
            selectedOptionNames: `${division}/${subDivision}/${sectionNames}`, 
            selectedOptions: normalizedSections, 
            rejectionReason: item.RejectedComment || null, 
        };
    });
};

// Fetch Indent Data
const fetchIndentData = async (sessionData, setIndents, setTotalCount, setIsLoading, setError, setStatusOptions) => {
    const requestUserName = sessionData.requestUserName || null;
    setIsLoading(true);
    setError(null);
    setIndents(INITIAL_INDENTS);

    const statusPayload = { "flagId": 1, "RequestUserName": requestUserName };
    const dataPayload = { "flagId": 2, "RequestUserName": requestUserName };

    try {
        const [statusResponse, dataResponse] = await Promise.all([
            indentView(statusPayload),
            indentView(dataPayload)
        ]);

        if (statusResponse?.status === 'success' && Array.isArray(statusResponse.result)) {
            const statusMap = {};
            const dynamicStatusOptions = [...BASE_STATUS_OPTIONS];
            statusResponse.result.forEach(s => {
                statusMap[s.Status_Id] = s.StatusName;
                dynamicStatusOptions.push({ label: s.StatusName, value: s.StatusName });
            });
            GLOBAL_STATUS_MAP = statusMap;
            setStatusOptions(dynamicStatusOptions);
        } else setStatusOptions(BASE_STATUS_OPTIONS);

        if (dataResponse?.status === 'success') {
            const normalizedData = normalizeIndentData(dataResponse.result || []);
            setIndents(normalizedData);
            setTotalCount(dataResponse.count || normalizedData.length || 0);
        } else {
            setError(dataResponse.message || 'Failed to fetch Indent data.');
        }

    } catch (err) {
        console.error("API Fetch Error:", err);
        setError('Network error while fetching data.');
    } finally {
        setIsLoading(false);
    }
};

// =================================================================
// 4. MAIN COMPONENT
// =================================================================

const IndentView = () => {
    document.title = `Indent Queue | DMS`;
    const sessionData = useMemo(() => {
        const fallbackEmail = sessionStorage.getItem('Email') || sessionStorage.getItem('requestUserName') || "projectmanager@gmail.com";
        return { requestUserName: fallbackEmail };
    }, []);

    const [indents, setIndents] = useState(INITIAL_INDENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [totalCount, setTotalCount] = useState(0); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndent, setSelectedIndent] = useState(null);
    const [viewStatus, setViewStatus] = useState('all'); 
    const [statusOptions, setStatusOptions] = useState(BASE_STATUS_OPTIONS); 
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const refreshData = useCallback(() => {
        fetchIndentData(sessionData, setIndents, setTotalCount, setIsLoading, setFetchError, setStatusOptions);
        setPage(0);
    }, [sessionData]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const filteredIndents = useMemo(() => {
        let results = indents;
        if (viewStatus !== 'all') results = results.filter(i => i.status === viewStatus);
        if (searchTerm.trim() !== '') {
            results = results.filter(indent =>
                (indent.indentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.selectedOptionNames || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (indent.createdBy || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return results;
    }, [searchTerm, indents, viewStatus]);

    const sortData = (data, key, direction) => {
        if (!key || !direction) return data;
        return [...data].sort((a, b) => {
            const aVal = (a[key] ?? '').toString().toLowerCase();
            const bVal = (b[key] ?? '').toString().toLowerCase();
            return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    };

    const sortedData = useMemo(() => sortData(filteredIndents, sortConfig.key, sortConfig.direction), [filteredIndents, sortConfig]);
    const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        if (pageSize === -1) return sortedData;
        const start = page * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, page, pageSize]);

    const toggleViewModal = () => setIsViewModalOpen(!isViewModalOpen);
    const handleViewClick = (indent) => { setSelectedIndent(indent); toggleViewModal(); };
    const getStatusColor = (status) => ({
        'Approved': 'success',
        'Rejected': 'danger',
        'To Be Approved': 'warning',
        'Resubmitted': 'info',
        'ResubmittedToOfficers': 'info',
        'Returned for Revision': 'info',
        'Acknowledged': 'info',
        'Closed': 'dark'
    }[status] || 'secondary');

    return (
        <div className="page-content">
            <style>{`
                 .table-responsive { overflow-x: auto; }

                 .a4-sheet-modal{width:100%;border:1px solid #ccc;background-color:#fff;background-size:100% 100%;background-repeat:no-repeat;font-family:Arial,sans-serif;color:#000;font-size:13px;line-height:1.6;margin:0 auto}
                 .content-wrapper-modal{padding:14% 8% 8%}
                 .a4-sheet-modal table,.a4-sheet-modal th,.a4-sheet-modal td{font-size:12px;padding:5px}
                 .scrollable-modal-body{max-height:70vh;overflow-y:auto;}
                 .filter-row { display: flex; flex-wrap: wrap; gap: 10px 15px; align-items: flex-end; }
                 .filter-col { flex-grow: 0; max-width: 200px; }
                 .search-col {
                     flex-grow: 0;
                     max-width: 300px; /* ✅ Reduced width */
                     min-width: 250px;
                 }
                 .search-box {
                     position: relative;
                 }
                 .search-icon {
                     position: absolute;
                     right: 12px;
                     top: 50%;
                     transform: translateY(-50%);
                     color: #999;
                     font-size: 16px;
                 }
            `}</style>
            <Container fluid>
                <Card>
                    <CardHeader className="bg-primary text-white p-3">
                        <h5 className="mb-0 text-white">Indent Request View</h5>
                    </CardHeader>
                    <CardBody>
                        <Row className="g-3 mb-3 align-items-end filter-row">
                            <Col md="auto" sm={6} className="filter-col">
                                <FormGroup className="mb-0">
                                    <Label for="statusFilter">Filter by Status</Label>
                                    <Input
                                        type="select"
                                        id="statusFilter"
                                        value={viewStatus}
                                        onChange={(e) => setViewStatus(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>

                            <Col md={true} sm={12} className="search-col">
                                <FormGroup className="mb-0">
                                    <Label for="searchBox" style={{ opacity: 0 }}>Search Label</Label>
                                    <div className="search-box">
                                        <Input 
                                            type="text" 
                                            id="searchBox"
                                            className="form-control" 
                                            placeholder="Search by Indent #, Location, or Creator..." 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                            
                                        />
                                        {/* <i className="ri-search-line search-icon"></i> */}
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>

                        <div className="table-responsive">
                            <table className="table grid-table table-hover table-nowrap align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Indent number</th>
                                        <th>Status</th>
                                        <th>Created by</th>
                                        <th>Section/Sub-Division</th>
                                        <th>Created on</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="6" className="text-center py-5"><Spinner size="sm" className="me-2" /> Loading Indents...</td></tr>
                                    ) : fetchError ? (
                                        <tr><td colSpan="6" className="text-center py-5"><Alert color="danger" className="mb-0">{fetchError}</Alert></td></tr>
                                    ) : paginatedData.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-4">No Documents Found.</td></tr>
                                    ) : (
                                        paginatedData.map(indent => (
                                            <tr key={indent.indentNumber}>
                                                <td>{indent.indentNumber}</td>
                                                <td><span className={`badge bg-${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                                                <td>{indent.createdBy}</td>
                                                <td>{formatSelectedOptions(indent.selectedOptionNames)}</td>
                                                <td>{new Date(indent.createdOn).toLocaleString()}</td>
                                                <td><Button color="primary" size="sm" onClick={() => handleViewClick(indent)}>View</Button></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                {selectedIndent && (
                    <Modal isOpen={isViewModalOpen} toggle={toggleViewModal} centered size="lg">
                        <ModalHeader toggle={toggleViewModal}>Indent Details: {selectedIndent.indentNumber} ({selectedIndent.status})</ModalHeader>
                        <ModalBody className="scrollable-modal-body">
                            {renderIndentTemplate(selectedIndent)}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleViewModal}>Close</Button>
                        </ModalFooter>
                    </Modal>
                )}
            </Container>
        </div>
    );
};

export default IndentView;
