import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Input, Label, FormGroup,
    Alert, Spinner
} from 'reactstrap';
import { getDocumentDropdowns } from '../../helpers/fakebackend_helper';
import { ToastContainer } from 'react-toastify';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import BreadCrumb from '../../Components/Common/BreadCrumb';

const Reports = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');

    // Modal states
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);

    // Filter related states
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

    // Report results
    const [reportData, setReportData] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // Dropdown data
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    // User access level states
    const [userLevel, setUserLevel] = useState('');
    const [isFieldsDisabled, setIsFieldsDisabled] = useState({
        circle: false,
        division: false,
        subDivision: false,
        section: false
    });

    document.title = `Reports | DMS`;

    const flagIdFunction = useCallback(async (params) => {
        try {
            const res = await getDocumentDropdowns(params);
            return res?.data || [];
        } catch (error) {
            console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
            return [];
        }
    }, []);

    // Function to load users based on role and selected filters
    const loadUsers = useCallback(async () => {
        if (!role || !circle || !division || !subDivision || !section) {
            setUserOptions([]);
            setSelectedUser('');
            return;
        }

        try {
            const users = await flagIdFunction({
                flagId: 4, // Assuming flagId 4 is for users
                requestUserName: userName,
                circle_code: circle,
                div_code: division,
                sd_code: subDivision,
                so_code: section,
                role: role
            });
            setUserOptions(users);
            
            // If only one user, auto-select it
            if (users.length === 1) {
                setSelectedUser(users[0].user_id || users[0].email || users[0].id);
            }
        } catch (error) {
            console.error('Error loading users:', error.message);
            setUserOptions([]);
            setSelectedUser('');
        }
    }, [flagIdFunction, userName, role, circle, division, subDivision, section]);

    // Function to load dropdown data based on user level
    const loadDropdownDataFromSession = useCallback(async () => {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const zones = authUser?.user?.zones || [];
        
        if (zones.length === 0) return;

        // Get the user's level from the first zone entry
        const userZone = zones[0];
        const level = userZone.level;
        setUserLevel(level);

        if (level === 'section') {
            // For section level: load circle, division, subdivision (disabled), and section options
            const circleData = [{ 
                circle_code: userZone.circle_code, 
                circle: userZone.circle 
            }];
            const divisionData = [{ 
                div_code: userZone.div_code, 
                division: userZone.division 
            }];
            const subDivisionData = [{ 
                sd_code: userZone.sd_code, 
                sub_division: userZone.sub_division 
            }];
            
            // Get all section offices from zones (in case there are multiple)
            const sectionData = zones.map(zone => ({
                so_code: zone.so_code,
                section_office: zone.section_office
            }));

            setCircleOptions(circleData);
            setDivisionName(divisionData);
            setSubDivisions(subDivisionData);
            setSectionOptions(sectionData);
            
            // Set default values and disable fields
            setCircle(userZone.circle_code);
            setDivision(userZone.div_code);
            setSubDivision(userZone.sd_code);
            setIsFieldsDisabled({
                circle: true,
                division: true,
                subDivision: true,
                section: sectionData.length === 1
            });
            
            // If only one section, auto-select it
            if (sectionData.length === 1) {
                setSection(sectionData[0].so_code);
            }
        }
        else if (level === 'subdivision') {
            // For subdivision level: load circle, division (disabled) and subdivision options
            const circleData = [{ 
                circle_code: userZone.circle_code, 
                circle: userZone.circle 
            }];
            const divisionData = [{ 
                div_code: userZone.div_code, 
                division: userZone.division 
            }];
            
            // Get unique subdivisions from zones (in case there are multiple)
            const uniqueSubDivisions = [];
            const seenSubDivisions = new Set();
            zones.forEach(zone => {
                if (!seenSubDivisions.has(zone.sd_code)) {
                    seenSubDivisions.add(zone.sd_code);
                    uniqueSubDivisions.push({
                        sd_code: zone.sd_code,
                        sub_division: zone.sub_division
                    });
                }
            });

            setCircleOptions(circleData);
            setDivisionName(divisionData);
            setSubDivisions(uniqueSubDivisions);
            
            // Set default values and disable fields
            setCircle(userZone.circle_code);
            setDivision(userZone.div_code);
            setIsFieldsDisabled({
                circle: true,
                division: true,
                subDivision: uniqueSubDivisions.length === 1,
                section: false
            });
            
            // If only one subdivision, auto-select it and load sections
            if (uniqueSubDivisions.length === 1) {
                const selectedSdCode = uniqueSubDivisions[0].sd_code;
                setSubDivision(selectedSdCode);
                
                // Load sections for the auto-selected subdivision
                const sections = await flagIdFunction({
                    flagId: 3,
                    requestUserName: userName,
                    sd_code: selectedSdCode
                });
                setSectionOptions(sections);
                
                // If only one section, auto-select it too
                if (sections.length === 1) {
                    setSection(sections[0].so_code);
                    setIsFieldsDisabled(prev => ({
                        ...prev,
                        section: true
                    }));
                }
            }
        }
        else if (level === 'division') {
            // For division level: load circle, division options
            const circleData = [{ 
                circle_code: userZone.circle_code, 
                circle: userZone.circle 
            }];
            
            // Get unique divisions from zones (in case there are multiple)
            const uniqueDivisions = [];
            const seenDivisions = new Set();
            zones.forEach(zone => {
                if (!seenDivisions.has(zone.div_code)) {
                    seenDivisions.add(zone.div_code);
                    uniqueDivisions.push({
                        div_code: zone.div_code,
                        division: zone.division
                    });
                }
            });

            setCircleOptions(circleData);
            setDivisionName(uniqueDivisions);
            setIsFieldsDisabled({
                circle: true,
                division: uniqueDivisions.length === 1,
                subDivision: false,
                section: false
            });
            
            // Set circle value
            setCircle(userZone.circle_code);
            
            // If only one division, auto-select it and load subdivisions
            if (uniqueDivisions.length === 1) {
                const selectedDivCode = uniqueDivisions[0].div_code;
                setDivision(selectedDivCode);
                
                // Load subdivisions for the auto-selected division
                const subdivisions = await flagIdFunction({
                    flagId: 2,
                    requestUserName: userName,
                    div_code: selectedDivCode
                });
                setSubDivisions(subdivisions);
                
                // If only one subdivision, auto-select it too
                if (subdivisions.length === 1) {
                    setSubDivision(subdivisions[0].sd_code);
                    setIsFieldsDisabled(prev => ({
                        ...prev,
                        subDivision: true
                    }));
                    
                    // Load sections for the auto-selected subdivision
                    const sections = await flagIdFunction({
                        flagId: 3,
                        requestUserName: userName,
                        sd_code: subdivisions[0].sd_code
                    });
                    setSectionOptions(sections);
                    
                    // If only one section, auto-select it too
                    if (sections.length === 1) {
                        setSection(sections[0].so_code);
                        setIsFieldsDisabled(prev => ({
                            ...prev,
                            section: true
                        }));
                    }
                }
            }
        }
        else if (level === 'circle') {
            // For circle level: load circle options
            // Get unique circles from zones (in case there are multiple)
            const uniqueCircles = [];
            const seenCircles = new Set();
            zones.forEach(zone => {
                if (!seenCircles.has(zone.circle_code)) {
                    seenCircles.add(zone.circle_code);
                    uniqueCircles.push({
                        circle_code: zone.circle_code,
                        circle: zone.circle
                    });
                }
            });

            setCircleOptions(uniqueCircles);
            setIsFieldsDisabled({
                circle: uniqueCircles.length === 1,
                division: false,
                subDivision: false,
                section: false
            });
            
            // If only one circle, auto-select it and load divisions
            if (uniqueCircles.length === 1) {
                const selectedCircleCode = uniqueCircles[0].circle_code;
                setCircle(selectedCircleCode);
                
                // Load divisions for the auto-selected circle
                const divisions = await flagIdFunction({
                    flagId: 1,
                    requestUserName: userName,
                    circle_code: selectedCircleCode
                });
                setDivisionName(divisions);
                
                // If only one division, auto-select it too
                if (divisions.length === 1) {
                    setDivision(divisions[0].div_code);
                    setIsFieldsDisabled(prev => ({
                        ...prev,
                        division: true
                    }));
                    
                    // Load subdivisions for the auto-selected division
                    const subdivisions = await flagIdFunction({
                        flagId: 2,
                        requestUserName: userName,
                        div_code: divisions[0].div_code
                    });
                    setSubDivisions(subdivisions);
                    
                    // If only one subdivision, auto-select it too
                    if (subdivisions.length === 1) {
                        setSubDivision(subdivisions[0].sd_code);
                        setIsFieldsDisabled(prev => ({
                            ...prev,
                            subDivision: true
                        }));
                        
                        // Load sections for the auto-selected subdivision
                        const sections = await flagIdFunction({
                            flagId: 3,
                            requestUserName: userName,
                            sd_code: subdivisions[0].sd_code
                        });
                        setSectionOptions(sections);
                        
                        // If only one section, auto-select it too
                        if (sections.length === 1) {
                            setSection(sections[0].so_code);
                            setIsFieldsDisabled(prev => ({
                                ...prev,
                                section: true
                            }));
                        }
                    }
                }
            }
        }
    }, [flagIdFunction, userName]);

    useEffect(() => {
        const loadInitialData = async () => {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userEmail = authUser?.user?.Email;
            if (userEmail) {
                setUserName(userEmail);
                
                // Load dropdown data based on user's access level
                await loadDropdownDataFromSession();
            }
        };

        loadInitialData();
    }, [loadDropdownDataFromSession]);

    // Load users when role or location filters change
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const resetSubsequentFilters = () => {
        // Only reset fields that are not disabled
        if (!isFieldsDisabled.division) {
            setDivision('');
            setDivisionName([]);
        }
        if (!isFieldsDisabled.subDivision) {
            setSubDivision('');
            setSubDivisions([]);
        }
        if (!isFieldsDisabled.section) {
            setSection('');
            setSectionOptions([]);
        }
        // Reset user dropdown when location changes
        setSelectedUser('');
        setUserOptions([]);
    };

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setCircle(selectedCircleCode);
        resetSubsequentFilters();
        
        // Only fetch divisions if circle level or if not disabled
        if (selectedCircleCode && (userLevel === 'circle' || !isFieldsDisabled.division)) {
            const divisions = await flagIdFunction({ 
                flagId: 1, 
                requestUserName: userName, 
                circle_code: selectedCircleCode 
            });
            setDivisionName(divisions);
        }
    };

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        
        // Reset only subsequent fields if not disabled
        if (!isFieldsDisabled.subDivision) {
            setSubDivision('');
            setSubDivisions([]);
        }
        if (!isFieldsDisabled.section) {
            setSection('');
            setSectionOptions([]);
        }
        // Reset user dropdown
        setSelectedUser('');
        setUserOptions([]);
        
        // Only fetch subdivisions if division level or higher, or if not disabled
        if (selectedDivCode && (userLevel === 'division' || userLevel === 'circle' || !isFieldsDisabled.subDivision)) {
            const subdivisions = await flagIdFunction({ 
                flagId: 2, 
                requestUserName: userName, 
                div_code: selectedDivCode 
            });
            setSubDivisions(subdivisions);
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        
        // Reset only section if not disabled
        if (!isFieldsDisabled.section) {
            setSection('');
            setSectionOptions([]);
        }
        // Reset user dropdown
        setSelectedUser('');
        setUserOptions([]);
        
        // Fetch sections based on user level and selected subdivision
        if (selectedSdCode) {
            // For all levels that have subdivision access, fetch sections
            if (userLevel === 'section' || userLevel === 'subdivision' || userLevel === 'division' || userLevel === 'circle') {
                const sections = await flagIdFunction({ 
                    flagId: 3, 
                    requestUserName: userName, 
                    sd_code: selectedSdCode 
                });
                setSectionOptions(sections);
                
                // If only one section, auto-select it and disable the dropdown
                if (sections.length === 1) {
                    setSection(sections[0].so_code);
                    setIsFieldsDisabled(prev => ({
                        ...prev,
                        section: true
                    }));
                } else {
                    // Multiple sections available, enable dropdown
                    setIsFieldsDisabled(prev => ({
                        ...prev,
                        section: false
                    }));
                }
            }
        }
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        // Reset user selection when role changes
        setSelectedUser('');
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
        // Reset custom dates when date range changes
        if (e.target.value !== 'custom') {
            setCustomStartDate('');
            setCustomEndDate('');
        }
    };

    const handleResetFilters = () => {
        // Reset only non-disabled fields
        if (!isFieldsDisabled.circle) {
            setCircle('');
            setCircleOptions([]);
        }
        if (!isFieldsDisabled.division) {
            setDivision('');
            setDivisionName([]);
        }
        resetSubsequentFilters();
        
        // Reset additional filters
        setRole('');
        setSelectedUser('');
        setUserOptions([]);
        setReportType('');
        setDateRange('');
        setCustomStartDate('');
        setCustomEndDate('');
        setReportData(null);
        setShowResults(false);
        
        // Reload dropdown data from session storage
        loadDropdownDataFromSession();
    };

    const validateForm = () => {
        if (!circle || !division || !subDivision || !section) {
            setResponse('Please fill all required location filters');
            setErrorModal(true);
            return false;
        }
        if (!role || !selectedUser || !reportType || !dateRange) {
            setResponse('Please fill all required report parameters');
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

    const handleGenerateReport = async () => {
        try {
            if (!validateForm()) return;

            setLoading(true);
            setShowResults(false);

            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const requestUserName = obj.user.Email;
            const roleId = obj.user.Role_Id;

            // Calculate date range based on selection
            let startDate, endDate;
            const today = new Date();
            
            switch (dateRange) {
                case 'today':
                    startDate = new Date(today);
                    endDate = new Date(today);
                    break;
                case 'weekly':
                    startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
                    endDate = new Date(today);
                    break;
                case 'monthly':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    break;
                case 'custom':
                    startDate = new Date(customStartDate);
                    endDate = new Date(customEndDate);
                    break;
                default:
                    startDate = new Date(today);
                    endDate = new Date(today);
            }

            // Mock report data generation
            setTimeout(() => {
                const mockData = generateMockReportData(role, selectedUser, reportType, startDate, endDate);
                setReportData(mockData);
                setShowResults(true);
                setResponse('Report generated successfully!');
                setSuccessModal(true);
                setLoading(false);
            }, 2000);

        } catch (error) {
            console.error('Error generating report:', error.message);
            setResponse('Error generating report');
            setErrorModal(true);
            setLoading(false);
        }
    };

    const generateMockReportData = (role, userId, reportType, startDate, endDate) => {
        const selectedUser = userOptions.find(user => 
            user.user_id === userId || user.email === userId || user.id === userId
        );
        const userName = selectedUser ? 
            (selectedUser.name || selectedUser.email || selectedUser.user_name || 'Unknown User') : 
            'Selected User';

        const mockData = {
            summary: {
                totalDocuments: Math.floor(Math.random() * 1000) + 100,
                approvedDocuments: Math.floor(Math.random() * 800) + 50,
                pendingDocuments: Math.floor(Math.random() * 100) + 10,
                rejectedDocuments: Math.floor(Math.random() * 50) + 5,
            },
            details: [],
            filters: {
                role,
                user: userName,
                reportType,
                dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                circle: circleOptions.find(c => c.circle_code === circle)?.circle || circle,
                division: divisionName.find(d => d.div_code === division)?.division || division,
                subDivision: subDivisions.find(s => s.sd_code === subDivision)?.sub_division || subDivision,
                section: sectionOptions.find(s => s.so_code === section)?.section_office || section
            }
        };

        // Generate mock detail data
        for (let i = 1; i <= 20; i++) {
            mockData.details.push({
                id: i,
                documentName: `Document_${i}.pdf`,
                accountId: `ACC${String(i).padStart(6, '0')}`,
                consumerName: `Consumer ${i}`,
                uploadedBy: userName,
                uploadDate: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toLocaleDateString(),
                status: ['Approved', 'Pending', 'Rejected'][Math.floor(Math.random() * 3)],
                category: ['Bill', 'Connection', 'Complaint', 'Service'][Math.floor(Math.random() * 4)]
            });
        }

        return mockData;
    };

    const exportToPDF = () => {
        if (!reportData) return;
        
        // Create a simple HTML content for PDF
        const htmlContent = `
            <html>
                <head>
                    <title>Report - ${reportData.filters.reportType}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .filters { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; }
                        .summary { display: flex; justify-content: space-around; margin-bottom: 20px; }
                        .summary-item { text-align: center; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Document Management System Report</h1>
                        <h2>${reportData.filters.reportType} - ${reportData.filters.role}</h2>
                    </div>
                    <div class="filters">
                        <h3>Report Filters</h3>
                        <p><strong>Circle:</strong> ${reportData.filters.circle}</p>
                        <p><strong>Division:</strong> ${reportData.filters.division}</p>
                        <p><strong>Sub Division:</strong> ${reportData.filters.subDivision}</p>
                        <p><strong>Section:</strong> ${reportData.filters.section}</p>
                        <p><strong>Role:</strong> ${reportData.filters.role}</p>
                        <p><strong>User:</strong> ${reportData.filters.user}</p>
                        <p><strong>Date Range:</strong> ${reportData.filters.dateRange}</p>
                    </div>
                    <div class="summary">
                        <div class="summary-item">
                            <h3>${reportData.summary.totalDocuments}</h3>
                            <p>Total Documents</p>
                        </div>
                        <div class="summary-item">
                            <h3>${reportData.summary.approvedDocuments}</h3>
                            <p>Approved</p>
                        </div>
                        <div class="summary-item">
                            <h3>${reportData.summary.pendingDocuments}</h3>
                            <p>Pending</p>
                        </div>
                        <div class="summary-item">
                            <h3>${reportData.summary.rejectedDocuments}</h3>
                            <p>Rejected</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Document Name</th>
                                <th>Account ID</th>
                                <th>Consumer Name</th>
                                <th>Uploaded By</th>
                                <th>Upload Date</th>
                                <th>Status</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.details.map(item => `
                                <tr>
                                    <td>${item.id}</td>
                                    <td>${item.documentName}</td>
                                    <td>${item.accountId}</td>
                                    <td>${item.consumerName}</td>
                                    <td>${item.uploadedBy}</td>
                                    <td>${item.uploadDate}</td>
                                    <td>${item.status}</td>
                                    <td>${item.category}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        // Create blob and download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Report_${reportData.filters.reportType}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToExcel = () => {
        if (!reportData) return;
        
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        csvContent += "Report: " + reportData.filters.reportType + " - " + reportData.filters.role + "\n";
        csvContent += "User: " + reportData.filters.user + "\n";
        csvContent += "Date Range: " + reportData.filters.dateRange + "\n";
        csvContent += "Circle: " + reportData.filters.circle + "\n";
        csvContent += "Division: " + reportData.filters.division + "\n";
        csvContent += "Sub Division: " + reportData.filters.subDivision + "\n";
        csvContent += "Section: " + reportData.filters.section + "\n\n";
        
        // Add summary
        csvContent += "Summary\n";
        csvContent += "Total Documents," + reportData.summary.totalDocuments + "\n";
        csvContent += "Approved Documents," + reportData.summary.approvedDocuments + "\n";
        csvContent += "Pending Documents," + reportData.summary.pendingDocuments + "\n";
        csvContent += "Rejected Documents," + reportData.summary.rejectedDocuments + "\n\n";
        
        // Add table headers
        csvContent += "S.No,Document Name,Account ID,Consumer Name,Uploaded By,Upload Date,Status,Category\n";
        
        // Add data rows
        reportData.details.forEach(row => {
            csvContent += `${row.id},"${row.documentName}","${row.accountId}","${row.consumerName}","${row.uploadedBy}","${row.uploadDate}","${row.status}","${row.category}"\n`;
        });

        // Create and download file
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Report_${reportData.filters.reportType}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            <div className="page-content">
                <BreadCrumb title="Reports" pageTitle="DMS" />
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

                    {/* Progressive Card Display */}
                    <Row className="mb-4">
                        {/* Card 1: Location Filters - Always visible */}
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="h-100">
                                <CardHeader className="bg-primary text-white p-2">
                                    <h6 className="mb-0 card-title text-white">
                                        <i className="ri-map-pin-line me-2"></i>Location Filters
                                    </h6>
                                </CardHeader>
                                <CardBody>
                                    <div className="d-flex flex-column gap-3">
                                        <FormGroup className="mb-0">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Label className="form-label fw-medium mb-0">Circle <span className="text-danger">*</span></Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={circle}
                                                        onChange={handleCircleChange}
                                                        disabled={isFieldsDisabled.circle}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Circle</option>
                                                        {circleOptions.map(circ => (
                                                            <option key={circ.circle_code} value={circ.circle_code}>{circ.circle}</option>
                                                        ))}
                                                    </Input>
                                                </div>
                                            </div>
                                        </FormGroup>
                                        
                                        <FormGroup className="mb-0">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Label className="form-label fw-medium mb-0">Division <span className="text-danger">*</span></Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={division}
                                                        onChange={handleDivisionChange}
                                                        disabled={isFieldsDisabled.division || !circle}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Division</option>
                                                        {divisionName.map(div => (
                                                            <option key={div.div_code} value={div.div_code}>{div.division}</option>
                                                        ))}
                                                    </Input>
                                                </div>
                                            </div>
                                        </FormGroup>
                                        
                                        <FormGroup className="mb-0">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Label className="form-label fw-medium mb-0">Sub Division <span className="text-danger">*</span></Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={subDivision}
                                                        onChange={handleSubDivisionChange}
                                                        disabled={isFieldsDisabled.subDivision || !division}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Sub Division</option>
                                                        {subDivisions.map(subDiv => (
                                                            <option key={subDiv.sd_code} value={subDiv.sd_code}>
                                                                {subDiv.sub_division}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </div>
                                            </div>
                                        </FormGroup>
                                        
                                        <FormGroup className="mb-0">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Label className="form-label fw-medium mb-0">Section <span className="text-danger">*</span></Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={section}
                                                        onChange={(e) => setSection(e.target.value)}
                                                        disabled={isFieldsDisabled.section || !subDivision}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Section</option>
                                                        {sectionOptions.map(sec => (
                                                            <option key={sec.so_code} value={sec.so_code}>
                                                                {sec.section_office}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Card 2: Report Parameters - Show after location filters are complete */}
                        {circle && division && subDivision && section && (
                            <Col lg={3} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-settings-3-line me-2"></i>Report Parameters
                                        </h6>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="d-flex flex-column gap-3">
                                            <FormGroup className="mb-0">
                                                <Label className="form-label fw-medium">Role <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="select"
                                                    value={role}
                                                    onChange={handleRoleChange}
                                                    className="form-select"
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="Uploader">Uploader</option>
                                                    <option value="QC">QC</option>
                                                </Input>
                                            </FormGroup>
                                            
                                            <FormGroup className="mb-0">
                                                <Label className="form-label fw-medium">User <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="select"
                                                    value={selectedUser}
                                                    onChange={(e) => setSelectedUser(e.target.value)}
                                                    disabled={!role}
                                                    className="form-select"
                                                >
                                                    <option value="">Select User</option>
                                                    <option value="Uploader">Uploader</option>
                                                    {userOptions.map(user => (
                                                        <option 
                                                            key={user.user_id || user.email || user.id} 
                                                            value={user.user_id || user.email || user.id}
                                                        >
                                                            {user.name || user.email || user.user_name || 'Unknown User'}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                            
                                            <FormGroup className="mb-0">
                                                <Label className="form-label fw-medium">Report Type <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="select"
                                                    value={reportType}
                                                    onChange={(e) => setReportType(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="">Select Report Type</option>
                                                    <option value="Document Summary">Document Summary</option>
                                                    <option value="User Activity">User Activity</option>
                                                    <option value="Status Report">Status Report</option>
                                                    <option value="Performance Report">Performance Report</option>
                                                </Input>
                                            </FormGroup>
                                            
                                            <FormGroup className="mb-0">
                                                <Label className="form-label fw-medium">Date Range <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="select"
                                                    value={dateRange}
                                                    onChange={handleDateRangeChange}
                                                    className="form-select"
                                                >
                                                    <option value="">Select Date Range</option>
                                                    <option value="today">Today</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="custom">Custom Date Range</option>
                                                </Input>
                                            </FormGroup>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        )}

                        {/* Card 3: Date Range & Actions - Show after report parameters are selected */}
                        {circle && division && subDivision && section && role && selectedUser && reportType && dateRange && (
                            <Col lg={3} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-calendar-line me-2"></i>Date Range & Actions
                                        </h6>
                                    </CardHeader>
                                    <CardBody className="d-flex flex-column">
                                        <div className="flex-grow-1">
                                            {/* Dynamic Date Display - Always show date fields based on selected range */}
                                            <div className="d-flex flex-column gap-3">
                                                {dateRange === 'custom' ? (
                                                    <>
                                                        <FormGroup className="mb-0">
                                                            <Label className="form-label fw-medium">Start Date <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="date"
                                                                value={customStartDate}
                                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                className="form-control"
                                                            />
                                                        </FormGroup>
                                                        
                                                        <FormGroup className="mb-0">
                                                            <Label className="form-label fw-medium">End Date <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="date"
                                                                value={customEndDate}
                                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                                min={customStartDate}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                className="form-control"
                                                            />
                                                        </FormGroup>
                                                    </>
                                                ) : (
                                                    // Show calculated dates for other options (disabled)
                                                    <>
                                                        <FormGroup className="mb-0">
                                                            <Label className="form-label fw-medium">Start Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={(() => {
                                                                    const today = new Date();
                                                                    switch(dateRange) {
                                                                        case 'today':
                                                                            return today.toISOString().split('T')[0];
                                                                        case 'weekly':
                                                                            const weekStart = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
                                                                            return weekStart.toISOString().split('T')[0];
                                                                        case 'monthly':
                                                                            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                                                                            return monthStart.toISOString().split('T')[0];
                                                                        default:
                                                                            return today.toISOString().split('T')[0];
                                                                    }
                                                                })()}
                                                                disabled={true}
                                                                className="form-control"
                                                            />
                                                        </FormGroup>
                                                        
                                                        <FormGroup className="mb-0">
                                                            <Label className="form-label fw-medium">End Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={(() => {
                                                                    const today = new Date();
                                                                    switch(dateRange) {
                                                                        case 'today':
                                                                            return today.toISOString().split('T')[0];
                                                                        case 'weekly':
                                                                            return today.toISOString().split('T')[0];
                                                                        case 'monthly':
                                                                            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                                                            return monthEnd.toISOString().split('T')[0];
                                                                        default:
                                                                            return today.toISOString().split('T')[0];
                                                                    }
                                                                })()}
                                                                disabled={true}
                                                                className="form-control"
                                                            />
                                                        </FormGroup>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="mt-auto pt-3">
                                            <div className="d-flex flex-column gap-2">
                                                <Button 
                                                    color="success" 
                                                    size="sm"
                                                    className="w-100"
                                                    onClick={handleGenerateReport}
                                                    disabled={loading || (dateRange === 'custom' && (!customStartDate || !customEndDate))}
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
                                                    size="sm"
                                                    className="w-100"
                                                    onClick={handleResetFilters}
                                                    disabled={loading}
                                                >
                                                    <i className="ri-refresh-line me-2"></i>
                                                    Reset All
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        )}

                        {/* Card 4: Report Results Preview - Show after all parameters are selected */}
                        {circle && division && subDivision && section && role && selectedUser && reportType && dateRange && (
                            <Col lg={3} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-bar-chart-line me-2"></i>Report Results
                                        </h6>
                                    </CardHeader>
                                    <CardBody className="d-flex flex-column justify-content-center">
                                        {showResults && reportData ? (
                                            <div className="text-center">
                                                <div className="row g-2">
                                                    <div className="col-6">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body p-2">
                                                                <div className="h6 text-primary mb-1">{reportData.summary.totalDocuments}</div>
                                                                <small className="text-muted">Total</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body p-2">
                                                                <div className="h6 text-success mb-1">{reportData.summary.approvedDocuments}</div>
                                                                <small className="text-muted">Approved</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body p-2">
                                                                <div className="h6 text-warning mb-1">{reportData.summary.pendingDocuments}</div>
                                                                <small className="text-muted">Pending</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="card border-0 bg-light">
                                                            <div className="card-body p-2">
                                                                <div className="h6 text-danger mb-1">{reportData.summary.rejectedDocuments}</div>
                                                                <small className="text-muted">Rejected</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <Button 
                                                        color="info" 
                                                        size="sm" 
                                                        className="me-2"
                                                        onClick={exportToPDF}
                                                    >
                                                        <i className="ri-file-pdf-line"></i>
                                                    </Button>
                                                    <Button 
                                                        color="success" 
                                                        size="sm"
                                                        onClick={exportToExcel}
                                                    >
                                                        <i className="ri-file-excel-line"></i>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted">
                                                <i className="ri-file-chart-line display-6 d-block mb-2"></i>
                                                <small>Report preview will appear here after generation</small>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        )}
                    </Row>

                    {/* Report Results Section */}
                    {showResults && reportData && (
                        <Row>
                            <Col lg={12}>
                                <Card>
                                    <CardHeader className="bg-light d-flex justify-content-between align-items-center p-3">
                                        <h5 className="mb-0">
                                            <i className="ri-bar-chart-line me-2"></i>
                                            {reportData.filters.reportType} Report
                                        </h5>
                                        <div className="d-flex gap-2">
                                            <Button
                                                color="success"
                                                size="sm"
                                                onClick={exportToPDF}
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <i className="ri-file-pdf-line"></i>
                                                PDF
                                            </Button>
                                            <Button
                                                color="info"
                                                size="sm"
                                                onClick={exportToExcel}
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <i className="ri-file-excel-line"></i>
                                                Excel
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        {/* Summary Cards */}
                                        <Row className="mb-4">
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm">
                                                    <CardBody className="text-center">
                                                        <div className="display-6 text-primary">{reportData.summary.totalDocuments}</div>
                                                        <p className="text-muted mb-0">Total Documents</p>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm">
                                                    <CardBody className="text-center">
                                                        <div className="display-6 text-success">{reportData.summary.approvedDocuments}</div>
                                                        <p className="text-muted mb-0">Approved</p>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm">
                                                    <CardBody className="text-center">
                                                        <div className="display-6 text-warning">{reportData.summary.pendingDocuments}</div>
                                                        <p className="text-muted mb-0">Pending</p>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="border-0 shadow-sm">
                                                    <CardBody className="text-center">
                                                        <div className="display-6 text-danger">{reportData.summary.rejectedDocuments}</div>
                                                        <p className="text-muted mb-0">Rejected</p>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Filters Applied */}
                                        <Card className="mb-4 border-0 bg-light">
                                            <CardBody>
                                                <h6 className="mb-3">
                                                    <i className="ri-filter-3-line me-2"></i>
                                                    Applied Filters
                                                </h6>
                                                <Row>
                                                    <Col md={2}>
                                                        <small className="text-muted">Circle:</small>
                                                        <div className="fw-semibold">{reportData.filters.circle}</div>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">Division:</small>
                                                        <div className="fw-semibold">{reportData.filters.division}</div>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">Sub Division:</small>
                                                        <div className="fw-semibold">{reportData.filters.subDivision}</div>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">Section:</small>
                                                        <div className="fw-semibold">{reportData.filters.section}</div>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">Role:</small>
                                                        <div className="fw-semibold">{reportData.filters.role}</div>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">User:</small>
                                                        <div className="fw-semibold">{reportData.filters.user}</div>
                                                    </Col>
                                                </Row>
                                                <Row className="mt-2">
                                                    <Col md={12}>
                                                        <small className="text-muted">Date Range:</small>
                                                        <div className="fw-semibold">{reportData.filters.dateRange}</div>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>

                                        {/* Data Table */}
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th>S.No</th>
                                                        <th>Document Name</th>
                                                        <th>Account ID</th>
                                                        <th>Consumer Name</th>
                                                        <th>Uploaded By</th>
                                                        <th>Upload Date</th>
                                                        <th>Status</th>
                                                        <th>Category</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.details.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{item.documentName}</td>
                                                            <td>{item.accountId}</td>
                                                            <td>{item.consumerName}</td>
                                                            <td>{item.uploadedBy}</td>
                                                            <td>{item.uploadDate}</td>
                                                            <td>
                                                                <span className={`badge ${
                                                                    item.status === 'Approved' ? 'bg-success' :
                                                                    item.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                                                                }`}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                            <td>{item.category}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Default Message when no reports */}
                    {!showResults && (
                        <Row>
                            <Col lg={12}>
                                <Card>
                                    <CardHeader className="bg-light p-3">
                                        <h5 className="mb-0">
                                            <i className="ri-bar-chart-line me-2"></i>
                                            Report Results
                                        </h5>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="text-center text-muted py-5">
                                            <i className="ri-file-chart-line display-1 text-muted"></i>
                                            <h5 className="mt-3 text-muted">No reports generated yet</h5>
                                            <p className="mb-0">Fill in the filters above and click "Generate Report" to view your data.</p>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Reports;