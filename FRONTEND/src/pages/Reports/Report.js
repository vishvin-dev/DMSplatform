import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Card, CardBody, CardHeader, Col, Container, Row,
    Button, Input, Label, FormGroup,
    Alert, Spinner
} from 'reactstrap';
import { misReportdropdowns} from '../../helpers/fakebackend_helper';
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
    const [zone, setZone] = useState('');
    const [circle, setCircle] = useState('');
    const [division, setDivision] = useState('');
    const [subDivision, setSubDivision] = useState('');
    const [sections, setSections] = useState(['']); // Array to handle multiple sections
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
    const [zoneOptions, setZoneOptions] = useState([]);
    const [circleOptions, setCircleOptions] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [subDivisions, setSubDivisions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    // Store all available sections (without exclusions)
    const [allSectionOptions, setAllSectionOptions] = useState([]);

    document.title = `Reports | DMS`;

    const flagIdFunction = useCallback(async (params) => {
        try {
            const res = await misReportdropdowns(params);
            return res?.data || [];
        } catch (error) {
            console.error(`Error fetching data for flag ${params.flagId}:`, error.message);
            return [];
        }
    }, []);

    // --- Core Logic Functions ---

    // Load roles from API
    const loadRoles = useCallback(async () => {
        try {
            const rolesData = await flagIdFunction({
                flagId: 6,
                requestUserName: userName
            });
            setRoleOptions(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error.message);
            setRoleOptions([]);
        }
    }, [userName, flagIdFunction]);

    const loadUsers = useCallback(async () => {
        if (!role || !zone) {
            setUserOptions([]);
            setSelectedUser('');
            return;
        }

        try {
            let users = [];
            // API call to fetch users based on role and location
            const userResponse = await misReportdropdowns({
                flagId: 7, // Assuming flagId 7 for users
                requestUserName: userEmail,
                zone_code: zone,
                circle_code: circle,
                div_code: division,
                sd_code: subDivision,
                role: role
            });
            
            users = userResponse?.data || [];

            setUserOptions(users);

            if (users.length === 1) {
                setSelectedUser(users[0].id || users[0].user_id || users[0].email);
            } else if (!users.some(u => (u.id || u.user_id || u.email) === selectedUser)) {
                setSelectedUser('');
            }
        } catch (error) {
            console.error('Error loading users:', error.message);
            setUserOptions([]);
            setSelectedUser('');
        }
    }, [role, zone, circle, division, subDivision, userName, selectedUser]);

    // Load initial zones and roles
    useEffect(() => {
        const loadInitialData = async () => {
            const authUser = JSON.parse(sessionStorage.getItem("authUser"));
            const userEmail = authUser?.user?.Email;
            if (userEmail) {
                setUserName(userEmail);
                
                // Load zones initially
                try {
                    const zonesData = await flagIdFunction({
                        flagId: 1,
                        requestUserName: userEmail
                    });
                    setZoneOptions(zonesData);
                } catch (error) {
                    console.error('Error loading zones:', error.message);
                }

                // Load roles initially
                await loadRoles();
            }
        };
        loadInitialData();
    }, [flagIdFunction, loadRoles]);

    // Load users when role or location filters change
    useEffect(() => {
        loadUsers();
    }, [zone, circle, division, subDivision, role, loadUsers]);

    // Load all sections without exclusions
    const loadAllSections = useCallback(async () => {
        if (!subDivision) {
            setAllSectionOptions([]);
            setSectionOptions([]);
            return;
        }

        try {
            const sectionsData = await flagIdFunction({
                flagId: 5,
                requestUserName: userName,
                sd_code: subDivision,
                exclude_sections: [] // Get all sections initially
            });
            setAllSectionOptions(sectionsData);
            setSectionOptions(sectionsData); // Set both all sections and current options
        } catch (error) {
            console.error('Error loading sections:', error.message);
            setAllSectionOptions([]);
            setSectionOptions([]);
        }
    }, [subDivision, userName, flagIdFunction]);

    // Load sections when subDivision changes
    useEffect(() => {
        if (subDivision) {
            loadAllSections();
        } else {
            setAllSectionOptions([]);
            setSectionOptions([]);
        }
    }, [subDivision, loadAllSections]);

    // Update section options based on selected sections
    useEffect(() => {
        if (allSectionOptions.length > 0) {
            const selectedSections = sections.filter(section => section !== '');
            
            if (selectedSections.length === 0) {
                // If no sections selected, show all options
                setSectionOptions(allSectionOptions);
            } else {
                // Filter out selected sections from available options
                const availableSections = allSectionOptions.filter(
                    section => !selectedSections.includes(section.so_code)
                );
                setSectionOptions(availableSections);
            }
        }
    }, [sections, allSectionOptions]);

    const resetSubsequentFilters = (changedLevel) => {
        if (changedLevel === 'zone') {
            setCircle('');
            setCircleOptions([]);
        }
        if (changedLevel === 'zone' || changedLevel === 'circle') {
            setDivision('');
            setDivisionName([]);
        }
        if (changedLevel === 'zone' || changedLevel === 'circle' || changedLevel === 'division') {
            setSubDivision('');
            setSubDivisions([]);
        }
        if (changedLevel === 'zone' || changedLevel === 'circle' || changedLevel === 'division' || changedLevel === 'subDivision') {
            setSections(['']);
            setSectionOptions([]);
            setAllSectionOptions([]);
        }
        setSelectedUser('');
        setUserOptions([]);
        setReportData(null);
        setShowResults(false);
    };

    const handleZoneChange = async (e) => {
        const selectedZoneCode = e.target.value;
        setZone(selectedZoneCode);
        resetSubsequentFilters('zone');

        if (selectedZoneCode) {
            const circles = await flagIdFunction({
                flagId: 2,
                requestUserName: userName,
                zone_code: selectedZoneCode
            });
            setCircleOptions(circles);
        }
    };

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setCircle(selectedCircleCode);
        resetSubsequentFilters('circle');

        if (selectedCircleCode) {
            const divisions = await flagIdFunction({
                flagId: 3,
                requestUserName: userName,
                circle_code: selectedCircleCode
            });
            setDivisionName(divisions);
        }
    };

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;
        setDivision(selectedDivCode);
        resetSubsequentFilters('division');

        if (selectedDivCode) {
            const subdivisions = await flagIdFunction({
                flagId: 4,
                requestUserName: userName,
                div_code: selectedDivCode
            });
            setSubDivisions(subdivisions);
        }
    };

    const handleSubDivisionChange = async (e) => {
        const selectedSdCode = e.target.value;
        setSubDivision(selectedSdCode);
        resetSubsequentFilters('subDivision');

        if (selectedSdCode) {
            // Load all sections without any exclusions
            loadAllSections();
        }
    };

    const handleSectionChange = (index, value) => {
        const newSections = [...sections];
        newSections[index] = value;
        setSections(newSections);
        
        // The useEffect above will automatically update sectionOptions based on the new selections
    };

    const addSection = () => {
        if (sections.length < 3) {
            setSections([...sections, '']);
        }
    };

    const removeSection = (index) => {
        if (sections.length > 1) {
            const newSections = sections.filter((_, i) => i !== index);
            setSections(newSections);
            
            // The useEffect above will automatically update sectionOptions when sections change
        }
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setSelectedUser('');
        setReportData(null);
        setShowResults(false);
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
        if (e.target.value !== 'custom') {
            setCustomStartDate('');
            setCustomEndDate('');
        }
        setReportData(null);
        setShowResults(false);
    };

    const handleResetFilters = async () => {
        setZone(''); setCircle(''); setDivision(''); setSubDivision(''); setSections(['']);
        setRole(''); setSelectedUser(''); setReportType(''); setDateRange('');
        setCustomStartDate(''); setCustomEndDate('');
        setReportData(null); setShowResults(false);
        setCircleOptions([]); setDivisionName([]); setSubDivisions([]); 
        setSectionOptions([]); setAllSectionOptions([]); setUserOptions([]);
        
        // Reload zones and roles
        const loadZonesAndRoles = async () => {
            try {
                const zonesData = await flagIdFunction({
                    flagId: 1,
                    requestUserName: userName
                });
                setZoneOptions(zonesData);
                
                await loadRoles();
            } catch (error) {
                console.error('Error loading zones:', error.message);
            }
        };
        loadZonesAndRoles();
    };

    const validateForm = () => {
        if (!zone) {
            setResponse('Zone is required');
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

    const generateReportData = async (role, userId, reportType, startDate, endDate) => {
        try {
            const selectedSections = sections.filter(section => section !== '');
            
            const reportResponse = await misReportdropdowns({
                flagId: 8, // Assuming flagId 8 for report generation
                requestUserName: userName,
                zone_code: zone,
                circle_code: circle,
                div_code: division,
                sd_code: subDivision,
                so_codes: selectedSections, // Send array of selected sections
                role: role,
                user_id: userId,
                report_type: reportType,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            });

            return reportResponse?.data || {
                summary: {
                    totalDocuments: 0,
                    approvedDocuments: 0,
                    pendingDocuments: 0,
                    rejectedDocuments: 0,
                },
                details: [],
                filters: {
                    role,
                    user: selectedUser,
                    reportType,
                    dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                    zone: zoneOptions.find(z => z.zone_code === zone)?.zone || zone,
                    circle: circleOptions.find(c => c.circle_code === circle)?.circle || circle,
                    division: divisionName.find(d => d.div_code === division)?.division || division,
                    subDivision: subDivisions.find(s => s.sd_code === subDivision)?.sub_division || subDivision,
                    sections: selectedSections.map(sec => 
                        allSectionOptions.find(s => s.so_code === sec)?.section_office || sec
                    )
                }
            };
        } catch (error) {
            console.error('Error generating report data:', error);
            throw error;
        }
    };

    const openReportInNewWindow = (reportData) => {
        const safeReportData = JSON.stringify(reportData);

        const baseHtmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${reportData.filters.reportType} Report | DMS</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
                    .report-container { max-width: 1400px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .header { background-color: #007bff; color: white; padding: 15px; border-radius: 6px 6px 0 0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                    .filters-box { background-color: #f0f0f0; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                    .summary-card { padding: 15px; border: 1px solid #ddd; border-radius: 6px; text-align: center; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; }
                    th, td { border: 1px solid #e9ecef; padding: 8px; text-align: left; vertical-align: middle; }
                    th { background-color: #343a40; color: white; }
                    .badge-success { background-color: #28a745; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                    .badge-warning { background-color: #ffc107; color: black; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                    .badge-danger { background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                </style>
            </head>
            <body>
                <div id="report-root"></div>

                <script>
                    const REPORT_DATA = ${safeReportData};
                    
                    function exportToPDF() {
                        const pdfContent = (function(data) {
                            const detailsRows = data.details.map((item, index) => \`
                                <tr>
                                    <td>\${index + 1}</td>
                                    <td>\${item.documentName}</td>
                                    <td>\${item.accountId}</td>
                                    <td>\${item.consumerName}</td>
                                    <td>\${item.uploadedBy}</td>
                                    <td>\${item.uploadDate}</td>
                                    <td>\${item.status}</td>
                                    <td>\${item.category}</td>
                                </tr>
                            \`).join('');

                            return \`
                                <html>
                                    <head>
                                        <title>Report - \${data.filters.reportType}</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; margin: 20px; }
                                            h2, h4 { margin: 5px 0; text-align: center; }
                                            .filters p { margin: 5px 0; }
                                            .filters { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; font-size: 10pt; }
                                            .summary table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
                                            .summary th, .summary td { border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; }
                                            table.detail-table { width: 100%; border-collapse: collapse; }
                                            table.detail-table th, table.detail-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 9pt; }
                                            table.detail-table th { background-color: #f2f2f2; }
                                        </style>
                                    </head>
                                    <body>
                                        <h2>\${data.filters.reportType} Report</h2>
                                        <h4>User: \${data.filters.user} | Role: \${data.filters.role}</h4>

                                        <div class="filters">
                                            <p><strong>Zone:</strong> \${data.filters.zone}</p>
                                            <p><strong>Location:</strong> \${data.filters.circle} / \${data.filters.division} / \${data.filters.subDivision}</p>
                                            <p><strong>Sections:</strong> \${data.filters.sections.join(', ')}</p>
                                            <p><strong>Date Range:</strong> \${data.filters.dateRange}</p>
                                        </div>

                                        <div class="summary">
                                            <h4>Summary</h4>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Total Documents</th>
                                                        <th>Approved</th>
                                                        <th>Pending</th>
                                                        <th>Rejected</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>\${data.summary.totalDocuments}</td>
                                                        <td>\${data.summary.approvedDocuments}</td>
                                                        <td>\${data.summary.pendingDocuments}</td>
                                                        <td>\${data.summary.rejectedDocuments}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <h4>Detailed Records</h4>
                                        <table class="detail-table">
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
                                                \${detailsRows}
                                            </tbody>
                                        </table>
                                    </body>
                                </html>
                            \`;
                        })(REPORT_DATA); 
                        
                        const printWindow = window.open();
                        printWindow.document.write(pdfContent);
                        printWindow.document.close();
                        setTimeout(() => printWindow.print(), 250); 
                    }

                    function exportToExcel() {
                        let csvContent = "";
                        
                        // Filter Metadata
                        csvContent += "Report Type," + REPORT_DATA.filters.reportType + "\\n";
                        csvContent += "User," + REPORT_DATA.filters.user + "\\n";
                        csvContent += "Zone," + REPORT_DATA.filters.zone + "\\n";
                        csvContent += "Date Range," + REPORT_DATA.filters.dateRange + "\\n";
                        csvContent += "Circle," + REPORT_DATA.filters.circle + "\\n";
                        csvContent += "Division," + REPORT_DATA.filters.division + "\\n";
                        csvContent += "Sub Division," + REPORT_DATA.filters.subDivision + "\\n";
                        csvContent += "Sections," + REPORT_DATA.filters.sections.join('; ') + "\\n\\n";
                        
                        // Summary
                        csvContent += "Summary\\n";
                        csvContent += "Total Documents," + REPORT_DATA.summary.totalDocuments + "\\n";
                        csvContent += "Approved Documents," + REPORT_DATA.summary.approvedDocuments + "\\n";
                        csvContent += "Pending Documents," + REPORT_DATA.summary.pendingDocuments + "\\n";
                        csvContent += "Rejected Documents," + REPORT_DATA.summary.rejectedDocuments + "\\n\\n";
                        
                        // Table Headers
                        csvContent += "S.No,Document Name,Account ID,Consumer Name,Uploaded By,Upload Date,Status,Category\\n";
                        
                        // Data Rows
                        REPORT_DATA.details.forEach((row, index) => {
                            csvContent += (index + 1) + ',"' + row.documentName + '","' + row.accountId + '","' + row.consumerName + '","' + row.uploadedBy + '","' + row.uploadDate + '","' + row.status + '","' + row.category + '"\\n';
                        });

                        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "Report_" + REPORT_DATA.filters.reportType + "_${new Date().toISOString().split('T')[0]}.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    
                    function windowClose() {
                        window.close();
                    }

                    function renderReport(data) {
                        const root = document.getElementById('report-root');
                        
                        const summaryHtml = \`
                            <div class="row g-3">
                                <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #007bff;"><div class="display-6 text-primary">\${data.summary.totalDocuments}</div><p class="text-muted mb-0">Total Documents</p></div></div>
                                <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #28a745;"><div class="display-6 text-success">\${data.summary.approvedDocuments}</div><p class="text-muted mb-0">Approved</p></div></div>
                                <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #ffc107;"><div class="display-6 text-warning">\${data.summary.pendingDocuments}</div><p class="text-muted mb-0">Pending</p></div></div>
                                <div class="col-md-3"><div class="summary-card" style="border-left: 5px solid #dc3545;"><div class="display-6 text-danger">\${data.summary.rejectedDocuments}</div><p class="text-muted mb-0">Rejected</p></div></div>
                            </div>
                        \`;

                        const detailsRows = data.details.map((item, index) => {
                            const statusBadge = item.status === 'Approved' ? 'badge-success' : item.status === 'Pending' ? 'badge-warning' : 'badge-danger';
                            return \`
                                <tr>
                                    <td>\${index + 1}</td>
                                    <td>\${item.documentName}</td>
                                    <td>\${item.accountId}</td>
                                    <td>\${item.consumerName}</td>
                                    <td>\${item.uploadedBy}</td>
                                    <td>\${item.uploadDate}</td>
                                    <td><span class="\${statusBadge}">\${item.status}</span></td>
                                    <td>\${item.category}</td>
                                </tr>
                            \`;
                        }).join('');

                        root.innerHTML = \`
                            <div class="report-container">
                                <div class="header">
                                    <h4 class="mb-0">\${data.filters.reportType} Report - \${data.filters.user}</h4>
                                    <div class="d-flex gap-2">
                                        <button onclick="exportToPDF()" class="btn btn-light btn-sm">Export PDF</button>
                                        <button onclick="exportToExcel()" class="btn btn-info btn-sm">Export Excel</button>
                                        <button onclick="windowClose()" class="btn btn-danger btn-sm">Close</button>
                                    </div>
                                </div>

                                <div class="filters-box">
                                    <h6 class="mb-3">Applied Filters</h6>
                                    <div class="row g-2">
                                        <div class="col-md-3"><small class="text-muted">Zone:</small><div class="fw-semibold">\${data.filters.zone}</div></div>
                                        <div class="col-md-3"><small class="text-muted">Circle:</small><div class="fw-semibold">\${data.filters.circle}</div></div>
                                        <div class="col-md-3"><small class="text-muted">Division:</small><div class="fw-semibold">\${data.filters.division}</div></div>
                                        <div class="col-md-3"><small class="text-muted">Sub Division:</small><div class="fw-semibold">\${data.filters.subDivision}</div></div>
                                        <div class="col-md-6"><small class="text-muted">Sections:</small><div class="fw-semibold">\${data.filters.sections.join(', ')}</div></div>
                                        <div class="col-md-3"><small class="text-muted">Role:</small><div class="fw-semibold">\${data.filters.role}</div></div>
                                        <div class="col-md-3"><small class="text-muted">User:</small><div class="fw-semibold">\${data.filters.user}</div></div>
                                        <div class="col-md-6"><small class="text-muted">Date Range:</small><div class="fw-semibold">\${data.filters.dateRange}</div></div>
                                    </div>
                                </div>

                                \${summaryHtml}

                                <h5 class="mt-4 mb-3">Detailed Records</h5>
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
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
                                            \${detailsRows}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        \`;
                    }

                    document.addEventListener('DOMContentLoaded', () => {
                        renderReport(REPORT_DATA);
                    });
                </script>
            </body>
            </html>
        `;

        const newWindow = window.open("", "_blank");
        newWindow.document.write(baseHtmlContent);
        newWindow.document.close();
    };

    const handleGenerateReport = async () => {
        try {
            if (!validateForm()) return;

            setLoading(true);
            setReportData(null);
            setShowResults(false);

            let startDate, endDate;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (dateRange) {
                case 'today':
                    startDate = new Date(today.getTime());
                    endDate = new Date(today.getTime());
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case 'weekly':
                    startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today.getTime());
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case 'monthly':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                case 'custom':
                    startDate = new Date(customStartDate);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                    break;
                default:
                    startDate = new Date(today.getTime());
                    endDate = new Date(today.getTime());
                    endDate.setHours(23, 59, 59, 999);
            }

            const generatedReportData = await generateReportData(role, selectedUser, reportType, startDate, endDate);

            // Open the custom-generated HTML window directly
            openReportInNewWindow(generatedReportData);

            setReportData(generatedReportData);
            setShowResults(true);

            setResponse('Report generated successfully and opened in a new window.');
            setSuccessModal(true);
            setLoading(false);

        } catch (error) {
            console.error('Error generating report:', error.message);
            setResponse('Error generating report');
            setErrorModal(true);
            setLoading(false);
            setReportData(null);
            setShowResults(false);
        }
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
                        <Col lg={4} md={6} className="mb-3">
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
                                                    <Label className="form-label fw-medium mb-0">Zone <span className="text-danger">*</span></Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={zone}
                                                        onChange={handleZoneChange}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Zone</option>
                                                        {zoneOptions.map(zone => (
                                                            <option key={zone.zone_code} value={zone.zone_code}>{zone.zone}</option>
                                                        ))}
                                                    </Input>
                                                </div>
                                            </div>
                                        </FormGroup>

                                        <FormGroup className="mb-0">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Label className="form-label fw-medium mb-0">Circle</Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={circle}
                                                        onChange={handleCircleChange}
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
                                                    <Label className="form-label fw-medium mb-0">Division</Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={division}
                                                        onChange={handleDivisionChange}
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
                                                    <Label className="form-label fw-medium mb-0">Sub Division</Label>
                                                </div>
                                                <div className="col-8">
                                                    <Input
                                                        type="select"
                                                        value={subDivision}
                                                        onChange={handleSubDivisionChange}
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

                                        {/* Multiple Sections */}
                                        {sections.map((sectionValue, index) => (
                                            <FormGroup key={index} className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">
                                                            Section {index + 1}
                                                        </Label>
                                                    </div>
                                                    <div className="col-7">
                                                        <Input
                                                            type="select"
                                                            value={sectionValue}
                                                            onChange={(e) => handleSectionChange(index, e.target.value)}
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
                                                    <div className="col-1">
                                                        {sections.length > 1 && (
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                className="p-1"
                                                                onClick={() => removeSection(index)}
                                                            >
                                                                <i className="ri-close-line"></i>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </FormGroup>
                                        ))}

                                        {/* Add Section Button */}
                                        {sections.length < 3 && (
                                            <div className="text-center mt-2">
                                                <Button
                                                    color="outline-primary"
                                                    size="sm"
                                                    onClick={addSection}
                                                    disabled={!subDivision}
                                                >
                                                    <i className="ri-add-line me-1"></i>
                                                    Add Section
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Card 2: Report Parameters - Show after zone is selected */}
                        {zone && (
                            <Col lg={4} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-settings-3-line me-2"></i>Report Parameters
                                        </h6>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="d-flex flex-column gap-3">
                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Role <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={role}
                                                            onChange={handleRoleChange}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Role</option>
                                                            {roleOptions.map(role => (
                                                                <option key={role.Role_Id} value={role.RoleName}>
                                                                    {role.RoleName}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">User <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={selectedUser}
                                                            onChange={(e) => setSelectedUser(e.target.value)}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select User</option>
                                                            {userOptions.map(user => (
                                                                <option
                                                                    key={user.id || user.user_id || user.email}
                                                                    value={user.id || user.user_id || user.email}
                                                                >
                                                                    {user.user_name || user.name || user.email || 'Unknown User'}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Report Type <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
                                                        <Input
                                                            type="select"
                                                            value={reportType}
                                                            onChange={(e) => { setReportType(e.target.value); setReportData(null); setShowResults(false); }}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Report Type</option>
                                                            <option value="Document Summary">Document Summary</option>
                                                            <option value="User Activity">User Activity</option>
                                                            <option value="Status Report">Status Report</option>
                                                            <option value="Performance Report">Performance Report</option>
                                                        </Input>
                                                    </div>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="mb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Label className="form-label fw-medium mb-0">Date Range <span className="text-danger">*</span></Label>
                                                    </div>
                                                    <div className="col-8">
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
                                                    </div>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        )}

                        {/* Card 3: Date Range & Actions - Show after report parameters are selected */}
                        {zone && role && selectedUser && reportType && dateRange && (
                            <Col lg={4} md={6} className="mb-3">
                                <Card className="h-100">
                                    <CardHeader className="bg-primary text-white p-2">
                                        <h6 className="mb-0 card-title text-white">
                                            <i className="ri-calendar-line me-2"></i>Date Range & Actions
                                        </h6>
                                    </CardHeader>
                                    <CardBody className="d-flex flex-column">
                                        <div className="flex-grow-1">
                                            <div className="d-flex flex-column gap-3">
                                                {dateRange === 'custom' ? (
                                                    <>
                                                        <FormGroup className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">Start Date <span className="text-danger">*</span></Label>
                                                                </div>
                                                                <div className="col-8">
                                                                    <Input
                                                                        type="date"
                                                                        value={customStartDate}
                                                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                                                        max={new Date().toISOString().split('T')[0]}
                                                                        className="form-control"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </FormGroup>

                                                        <FormGroup className="mb-0">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Label className="form-label fw-medium mb-0">End Date <span className="text-danger">*</span></Label>
                                                                </div>
                                                                <div className="col-8">
                                                                    <Input
                                                                        type="date"
                                                                        value={customEndDate}
                                                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                                                        min={customStartDate}
                                                                        max={new Date().toISOString().split('T')[0]}
                                                                        className="form-control"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </>
                                                ) : (
                                                    <div className="text-muted text-center pt-5 pb-5">
                                                        Date range calculated dynamically for: <strong>{dateRange.toUpperCase()}</strong>
                                                    </div>
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
                                                            Generate Report & Open
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
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Reports;