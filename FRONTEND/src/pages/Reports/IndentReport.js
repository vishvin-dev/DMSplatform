import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Input, Label, FormGroup,
    Alert, Spinner, Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import { getDocumentDropdowns } from '../../helpers/fakebackend_helper';
import { ToastContainer } from 'react-toastify';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';

const IndentReports = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [activeTab, setActiveTab] = useState('1');

    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    // Common filter states
    const [circle, setCircle] = useState('');
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [section, setSection] = useState('');
    const [userName, setUserName] = useState("");
    const [role, setRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [reportType, setReportType] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [version, setVersion] = useState('');

    // Report specific states
    const [reportData, setReportData] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // Dropdown data
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    // User access level states
    const [userLevel, setUserLevel] = useState('');
    const [isFieldsDisabled, setIsFieldsDisabled] = useState({
        circle: false,
        division: false,
        subDivision: false,
        section: false
    });

    document.title = `Indent Reports | DMS`;

    const flagIdFunction = useCallback(async (params) => {
        try {
            const res = await getDocumentDropdowns(params);
            return res?.data || [];
        } catch (error) {
            console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
            return [];
        }
    }, []);

    // Status options for different report categories
    const indentStatusOptions = [
        { value: 'Draft', label: 'Draft' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Resubmitted', label: 'Resubmitted' },
        { value: 'Closed', label: 'Closed' },
        { value: 'PendingApproval', label: 'Pending Approval' }
    ];

    const versionOptions = [
        { value: 'v1', label: 'Version 1' },
        { value: 'v2', label: 'Version 2' },
        { value: 'v3', label: 'Version 3' },
        { value: 'all', label: 'All Versions' }
    ];

    // Load dropdown data from session (same as original)
    const loadDropdownDataFromSession = useCallback(async () => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const zones = authUser?.user?.zones || [];
        const currentUserEmail = authUser?.user?.Email;
        setUserName(currentUserEmail || "");

        if (zones.length === 0) return;

        const userZone = zones[0];
        const level = userZone.level;
        setUserLevel(level);

        const loadNextLevelAndAutoselect = async (currentLevelCode, flagId, setOptions, setCode, disableKey) => {
            const nextOptions = await flagIdFunction({
                flagId,
                requestUserName: currentUserEmail,
                ...(flagId === 1 && { circle_code: currentLevelCode }),
                ...(flagId === 2 && { div_code: currentLevelCode }),
                ...(flagId === 3 && { sd_code: currentLevelCode }),
            });

            setOptions(nextOptions);

            if (nextOptions.length === 1) {
                const nextCode = nextOptions[0].circle_code || nextOptions[0].div_code || nextOptions[0].sd_code || nextOptions[0].so_code;
                setCode(nextCode);
                setIsFieldsDisabled(prev => ({ ...prev, [disableKey]: true }));
                return nextCode;
            } else {
                setIsFieldsDisabled(prev => ({ ...prev, [disableKey]: false }));
                return null;
            }
        };

        // ... (same implementation as original)
        if (level === 'section') {
            const circleData = [{ circle_code: userZone.circle_code, circle: userZone.circle }];
            const divisionData = [{ div_code: userZone.div_code, division: userZone.division }];
            const subDivisionData = [{ sd_code: userZone.sd_code, sub_division: userZone.sub_division }];
            const sectionData = zones.filter(z => z.sd_code === userZone.sd_code).map(zone => ({
                so_code: zone.so_code, section_office: zone.section_office
            }));

            setCircleOptions(circleData);
            setDivisionName(divisionData);
            setSubDivisions(subDivisionData);
            setSectionOptions(sectionData);

            setCircle(userZone.circle_code);
            setDivision(userZone.div_code);
            setSubDivision(userZone.sd_code);
            setIsFieldsDisabled({
                circle: true, division: true, subDivision: true,
                section: sectionData.length === 1
            });
            if (sectionData.length === 1) {
                setSection(sectionData[0].so_code);
            }
        }
        // ... (other levels same as original)
    }, [flagIdFunction]);

    useEffect(() => {
        const loadInitialData = async () => {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userEmail = authUser?.user?.Email;
            if (userEmail) {
                setUserName(userEmail);
                await loadDropdownDataFromSession();
            }
        };
        loadInitialData();
    }, [loadDropdownDataFromSession]);

    // Report category configurations
    const reportCategories = {
        '1': { name: 'Indent Summary Reports', reports: [
            { id: '1.1', name: 'Indent Master Report', description: 'Overview of all indents in the system' },
            { id: '1.2', name: 'Indent Zone Mapping Report', description: 'Shows zone linkage for each indent' }
        ]},
        '2': { name: 'Section Quantity Reports', reports: [
            { id: '2.1', name: 'Section Quantity Entry Report', description: 'Track quantity entries by Division Officers' },
            { id: '2.2', name: 'Quantity Change History Report', description: 'Show quantity changes across versions' }
        ]},
        '3': { name: 'Approval Flow Reports', reports: [
            { id: '3.1', name: 'Approval History Report', description: 'Complete audit trail for approvals' },
            { id: '3.2', name: 'Rejected Indents Report', description: 'Track all rejected indents with reasons' }
        ]},
        '4': { name: 'Final Approval Reports', reports: [
            { id: '4.1', name: 'Final Approved Indent Report', description: 'Summary of PM-approved indents' },
            { id: '4.2', name: 'Final Approval Comparison Report', description: 'Compare Officer vs PM quantities' }
        ]},
        '5': { name: 'Performance Reports', reports: [
            { id: '5.1', name: 'Indent Turnaround Time Report', description: 'Measure time between stages' },
            { id: '5.2', name: 'User Performance Report', description: 'Track productivity by user/role' }
        ]},
        '6': { name: 'Analytical Reports', reports: [
            { id: '6.1', name: 'Indent Status Summary Dashboard', description: 'High-level status distribution' },
            { id: '6.2', name: 'Division-Wise Indent Report', description: 'Track indents zone-wise' },
            { id: '6.3', name: 'Version Tracking Report', description: 'Show revision history' }
        ]},
        '7': { name: 'Document Tracking Reports', reports: [
            { id: '7.1', name: 'Approved Document Tracking Report', description: 'Track final approved files' },
            { id: '7.2', name: 'Missing Document Report', description: 'Find indents without approved files' }
        ]},
        '8': { name: 'Exception Reports', reports: [
            { id: '8.1', name: 'Pending Approval Queue Report', description: 'Identify waiting approvals' },
            { id: '8.2', name: 'Resubmission Follow-up Report', description: 'Show resubmitted indents' }
        ]}
    };

    // Mock data generators for each report type
    const generateMockReportData = (reportId, filters) => {
        const baseData = {
            summary: {
                totalRecords: Math.floor(Math.random() * 1000) + 100,
                approvedCount: Math.floor(Math.random() * 800) + 50,
                pendingCount: Math.floor(Math.random() * 100) + 10,
                rejectedCount: Math.floor(Math.random() * 50) + 5,
            },
            details: [],
            filters: filters
        };

        // Generate report-specific mock data
        switch(reportId) {
            case '1.1': // Indent Master Report
                for (let i = 1; i <= 20; i++) {
                    baseData.details.push({
                        indent_no: `IND${String(i).padStart(6, '0')}`,
                        created_by: `User ${i}`,
                        role: ['PM', 'DO', 'Admin'][Math.floor(Math.random() * 3)],
                        created_on: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        status: indentStatusOptions[Math.floor(Math.random() * indentStatusOptions.length)].value,
                        request_user_name: `user${i}@example.com`
                    });
                }
                break;

            case '1.2': // Indent Zone Mapping Report
                for (let i = 1; i <= 15; i++) {
                    baseData.details.push({
                        indent_no: `IND${String(i).padStart(6, '0')}`,
                        div_code: `DIV${Math.floor(Math.random() * 10) + 1}`,
                        sd_code: `SD${Math.floor(Math.random() * 20) + 1}`,
                        so_code: `SO${Math.floor(Math.random() * 50) + 1}`,
                        created_on: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        division_name: `Division ${i}`,
                        sub_division_name: `Sub Division ${i}`,
                        section_name: `Section ${i}`
                    });
                }
                break;

            case '2.1': // Section Quantity Entry Report
                for (let i = 1; i <= 25; i++) {
                    baseData.details.push({
                        indent_no: `IND${String(i).padStart(6, '0')}`,
                        version_label: `v${Math.floor(Math.random() * 3) + 1}`,
                        uploaded_by: `DO User ${i}`,
                        entered_qty: Math.floor(Math.random() * 1000) + 100,
                        status: ['ApprovedByDO', 'ResubmittedByDO'][Math.floor(Math.random() * 2)],
                        comment: `Comment for entry ${i}`,
                        uploaded_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    });
                }
                break;

            case '3.1': // Approval History Report
                for (let i = 1; i <= 30; i++) {
                    baseData.details.push({
                        indent_no: `IND${String(i).padStart(6, '0')}`,
                        action_by_user: `User ${i}`,
                        role: ['PM', 'DO', 'Admin'][Math.floor(Math.random() * 3)],
                        action_on: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        status: ['Approved', 'Rejected', 'Resubmitted'][Math.floor(Math.random() * 3)],
                        comment: `Approval comment ${i}`,
                        action_type: ['Initial Approval', 'Revision', 'Final Approval'][Math.floor(Math.random() * 3)]
                    });
                }
                break;

            // Add cases for other report types...
            default:
                for (let i = 1; i <= 20; i++) {
                    baseData.details.push({
                        id: i,
                        document_name: `Document_${i}.pdf`,
                        account_id: `ACC${String(i).padStart(6, '0')}`,
                        description: `Sample data for report ${reportId}`
                    });
                }
        }

        return baseData;
    };

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            
            // Validate based on active tab and report type
            if (!validateForm()) return;

            setTimeout(() => {
                const filters = {
                    circle: circleOptions.find(c => c.circle_code === circle)?.circle || circle,
                    division: divisionName.find(d => d.div_code === division)?.division || division,
                    subDivision: subDivisions.find(s => s.sd_code === subDivision)?.sub_division || subDivision,
                    section: sectionOptions.find(s => s.so_code === section)?.section_office || section,
                    role,
                    user: selectedUser,
                    reportType,
                    dateRange: dateRange === 'custom' ? `${customStartDate} to ${customEndDate}` : dateRange,
                    status,
                    version
                };

                const generatedReportData = generateMockReportData(reportType, filters);
                setReportData(generatedReportData);
                setShowResults(true);

                setResponse(`${reportCategories[activeTab].name} generated successfully`);
                setSuccessModal(true);
                setLoading(false);
            }, 2000);

        } catch (error) {
            console.error('Error generating report:', error);
            setResponse('Error generating report');
            setErrorModal(true);
            setLoading(false);
        }
    };

    const validateForm = () => {
        // Basic validation - extend based on specific report requirements
        if (!circle || !division || !subDivision || !section) {
            setResponse('Please fill all required location filters');
            setErrorModal(true);
            return false;
        }
        if (!reportType) {
            setResponse('Please select a report type');
            setErrorModal(true);
            return false;
        }
        if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
            setResponse('Please select both start and end dates for custom range');
            setErrorModal(true);
            return false;
        }
        return true;
    };

    const handleResetFilters = () => {
        setCircle(''); setDivision(''); setSubDivision(''); setSection('');
        setRole(''); setSelectedUser(''); setReportType(''); setDateRange('');
        setCustomStartDate(''); setCustomEndDate(''); setStatus(''); setVersion('');
        setReportData(null); setShowResults(false);
    };

    // Render filter components based on active tab
    const renderAdditionalFilters = () => {
        switch(activeTab) {
            case '1': // Summary Reports
                return (
                    <>
                        <FormGroup>
                            <Label>Status</Label>
                            <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All Status</option>
                                {indentStatusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Role</Label>
                            <Input type="select" value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="">All Roles</option>
                                <option value="PM">PM</option>
                                <option value="DO">Division Officer</option>
                                <option value="Admin">Admin</option>
                            </Input>
                        </FormGroup>
                    </>
                );

            case '2': // Quantity Reports
                return (
                    <>
                        <FormGroup>
                            <Label>Version</Label>
                            <Input type="select" value={version} onChange={(e) => setVersion(e.target.value)}>
                                <option value="">All Versions</option>
                                {versionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Quantity Status</Label>
                            <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="ApprovedByDO">Approved by DO</option>
                                <option value="ResubmittedByDO">Resubmitted by DO</option>
                            </Input>
                        </FormGroup>
                    </>
                );

            case '3': // Approval Reports
                return (
                    <>
                        <FormGroup>
                            <Label>Approval Status</Label>
                            <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Resubmitted">Resubmitted</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Action By Role</Label>
                            <Input type="select" value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="">All Roles</option>
                                <option value="PM">PM</option>
                                <option value="DO">DO</option>
                                <option value="Admin">Admin</option>
                            </Input>
                        </FormGroup>
                    </>
                );

            // Add cases for other tabs...
            default:
                return null;
        }
    };

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <BreadCrumb title="Indent Reports" pageTitle="DMS" />
                <Container fluid>
                    <SuccessModal show={successModal} onCloseClick={() => setSuccessModal(false)} successMsg={response} />
                    <ErrorModal show={errorModal} onCloseClick={() => setErrorModal(false)} errorMsg={response} />

                    {/* Report Category Tabs */}
                    <Card>
                        <CardHeader>
                            <h5 className="card-title mb-0">
                                <i className="ri-bar-chart-line me-2"></i>
                                Indent Reports Dashboard
                            </h5>
                        </CardHeader>
                        <CardBody>
                            <Nav pills className="nav-pills-custom">
                                {Object.entries(reportCategories).map(([tabId, category]) => (
                                    <NavItem key={tabId}>
                                        <NavLink
                                            className={activeTab === tabId ? 'active' : ''}
                                            onClick={() => {
                                                setActiveTab(tabId);
                                                setReportType('');
                                                setShowResults(false);
                                            }}
                                        >
                                            <span className="d-none d-sm-block">{category.name}</span>
                                            <span className="d-block d-sm-none">{tabId}</span>
                                        </NavLink>
                                    </NavItem>
                                ))}
                            </Nav>

                            <TabContent activeTab={activeTab} className="mt-4">
                                {Object.entries(reportCategories).map(([tabId, category]) => (
                                    <TabPane key={tabId} tabId={tabId}>
                                        <Row>
                                            {/* Report Selection */}
                                            <Col lg={4}>
                                                <Card>
                                                    <CardHeader>
                                                        <h6 className="mb-0">Select Report</h6>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <FormGroup>
                                                            <Label>Report Type <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                value={reportType}
                                                                onChange={(e) => setReportType(e.target.value)}
                                                            >
                                                                <option value="">Choose a report...</option>
                                                                {category.reports.map(report => (
                                                                    <option key={report.id} value={report.id}>
                                                                        {report.name}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        </FormGroup>
                                                        {reportType && (
                                                            <Alert color="info" className="mt-2">
                                                                <small>
                                                                    <strong>Description:</strong><br />
                                                                    {category.reports.find(r => r.id === reportType)?.description}
                                                                </small>
                                                            </Alert>
                                                        )}
                                                    </CardBody>
                                                </Card>
                                            </Col>

                                            {/* Common Filters */}
                                            <Col lg={4}>
                                                <Card>
                                                    <CardHeader>
                                                        <h6 className="mb-0">Location Filters</h6>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <div className="d-flex flex-column gap-2">
                                                            <FormGroup>
                                                                <Label>Circle</Label>
                                                                <Input
                                                                    type="select"
                                                                    value={circle}
                                                                    onChange={(e) => setCircle(e.target.value)}
                                                                >
                                                                    <option value="">Select Circle</option>
                                                                    {circleOptions.map(circ => (
                                                                        <option key={circ.circle_code} value={circ.circle_code}>{circ.circle}</option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>

                                                            <FormGroup>
                                                                <Label>Division</Label>
                                                                <Input
                                                                    type="select"
                                                                    value={division}
                                                                    onChange={(e) => setDivision(e.target.value)}
                                                                >
                                                                    <option value="">Select Division</option>
                                                                    {divisionName.map(div => (
                                                                        <option key={div.div_code} value={div.div_code}>{div.division}</option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>

                                                            <FormGroup>
                                                                <Label>Sub Division</Label>
                                                                <Input
                                                                    type="select"
                                                                    value={subDivision}
                                                                    onChange={(e) => setSubDivision(e.target.value)}
                                                                >
                                                                    <option value="">Select Sub Division</option>
                                                                    {subDivisions.map(subDiv => (
                                                                        <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                                            {subDiv.sub_division}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>

                                                            <FormGroup>
                                                                <Label>Section</Label>
                                                                <Input
                                                                    type="select"
                                                                    value={section}
                                                                    onChange={(e) => setSection(e.target.value)}
                                                                >
                                                                    <option value="">Select Section</option>
                                                                    {sectionOptions.map(sec => (
                                                                        <option key={sec.so_code} value={sec.so_code}>
                                                                            {sec.section_office}
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                            </FormGroup>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>

                                            {/* Additional Filters & Actions */}
                                            <Col lg={4}>
                                                <Card>
                                                    <CardHeader>
                                                        <h6 className="mb-0">Report Parameters</h6>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <div className="d-flex flex-column gap-2">
                                                            {/* Date Range */}
                                                            <FormGroup>
                                                                <Label>Date Range</Label>
                                                                <Input
                                                                    type="select"
                                                                    value={dateRange}
                                                                    onChange={(e) => setDateRange(e.target.value)}
                                                                >
                                                                    <option value="">Select Range</option>
                                                                    <option value="today">Today</option>
                                                                    <option value="weekly">Weekly</option>
                                                                    <option value="monthly">Monthly</option>
                                                                    <option value="custom">Custom</option>
                                                                </Input>
                                                            </FormGroup>

                                                            {dateRange === 'custom' && (
                                                                <>
                                                                    <FormGroup>
                                                                        <Label>Start Date</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={customStartDate}
                                                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                                                        />
                                                                    </FormGroup>
                                                                    <FormGroup>
                                                                        <Label>End Date</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={customEndDate}
                                                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                                                        />
                                                                    </FormGroup>
                                                                </>
                                                            )}

                                                            {/* Additional Filters */}
                                                            {renderAdditionalFilters()}

                                                            {/* Action Buttons */}
                                                            <div className="d-flex gap-2 mt-3">
                                                                <Button
                                                                    color="primary"
                                                                    className="w-100"
                                                                    onClick={handleGenerateReport}
                                                                    disabled={loading || !reportType}
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <Spinner size="sm" className="me-2" />
                                                                            Generating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="ri-file-chart-line me-2"></i>
                                                                            Generate Report
                                                                        </>
                                                                    )}
                                                                </Button>

                                                                <Button
                                                                    color="light"
                                                                    onClick={handleResetFilters}
                                                                    disabled={loading}
                                                                >
                                                                    <i className="ri-refresh-line"></i>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Results Display */}
                                        {showResults && reportData && (
                                            <Card className="mt-4">
                                                <CardHeader>
                                                    <h6 className="mb-0">Report Results</h6>
                                                </CardHeader>
                                                <CardBody>
                                                    <div className="table-responsive">
                                                        <table className="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    {reportData.details.length > 0 && 
                                                                        Object.keys(reportData.details[0]).map(key => (
                                                                            <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                                                        ))
                                                                    }
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {reportData.details.map((row, index) => (
                                                                    <tr key={index}>
                                                                        {Object.values(row).map((value, cellIndex) => (
                                                                            <td key={cellIndex}>{value}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </TabPane>
                                ))}
                            </TabContent>
                        </CardBody>
                    </Card>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default IndentReports;