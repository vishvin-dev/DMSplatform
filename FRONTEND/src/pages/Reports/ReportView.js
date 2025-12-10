// import React, { useState, useEffect } from 'react';
// import {
//     Spinner, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
//     Card, CardBody, CardHeader, Col, Container, Row, Button, Table
// } from 'reactstrap';
// import { useNavigate } from 'react-router-dom';
// import BreadCrumb from '../../Components/Common/BreadCrumb';
// import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { toast } from 'react-toastify';

// const ReportView = () => {
//     const navigate = useNavigate();
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const [reportData, setReportData] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [exportLoading, setExportLoading] = useState({ excel: false, pdf: false });
//     const [filters, setFilters] = useState(null);
//     const [sections, setSections] = useState([]);
//     const [groupedData, setGroupedData] = useState([]);
//     const [overallSummary, setOverallSummary] = useState({
//         total: 0,
//         approved: 0,
//         rejected: 0,
//         pending: 0,
//         reuploaded: 0
//     });

//     // Get user info from session
//     const authUser = JSON.parse(sessionStorage.getItem('authUser')) || {};
//     const loginName = authUser?.user?.loginName || authUser?.user?.Email || 'Unknown User';
//     const reportHeaderLocationName = authUser?.user?.reportHeaderLocationName || 'Unknown Office';

//     const reportInfo = {
//         officeName: reportHeaderLocationName,
//         generatedBy: loginName,
//         generatedOn: new Date().toLocaleString('en-IN', {
//             day: 'numeric',
//             month: 'long',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         })
//     };

//     useEffect(() => {
//         const fetchReportData = async () => {
//             try {
//                 setIsLoading(true);
                
//                 // Get stored data from localStorage
//                 const storedData = localStorage.getItem('reportData');
                
//                 if (!storedData) {
//                     toast.error("No report data found");
//                     navigate('/reports');
//                     return;
//                 }

//                 const parsedData = JSON.parse(storedData);
                
//                 // Store filters for display
//                 setFilters(parsedData.filters);
                
//                 // Check if we have report data
//                 if (parsedData.reportData && parsedData.reportData.status) {
//                     const response = parsedData.reportData;
                    
//                     // Set sections data
//                     if (response.data && response.data.sections && Array.isArray(response.data.sections)) {
//                         setSections(response.data.sections);
                        
//                         // Group data by common fields
//                         const grouped = groupSectionsByLocation(response.data.sections);
//                         setGroupedData(grouped);
                        
//                         // Set overall summary from API response
//                         if (response.data.overallSummary) {
//                             setOverallSummary(response.data.overallSummary);
//                         } else {
//                             // Calculate overall summary if not provided
//                             const calculatedOverall = {
//                                 total: 0,
//                                 approved: 0,
//                                 rejected: 0,
//                                 pending: 0,
//                                 reuploaded: 0
//                             };
                            
//                             response.data.sections.forEach(section => {
//                                 if (section.summary) {
//                                     calculatedOverall.total += section.summary.total || 0;
//                                     calculatedOverall.approved += section.summary.approved || 0;
//                                     calculatedOverall.rejected += section.summary.rejected || 0;
//                                     calculatedOverall.pending += section.summary.pending || 0;
//                                     calculatedOverall.reuploaded += section.summary.reuploaded || 0;
//                                 }
//                             });
                            
//                             setOverallSummary(calculatedOverall);
//                         }
//                     }
                    
//                     setReportData(response);
//                 } else {
//                     toast.error("Invalid report data format");
//                 }
//             } catch (err) {
//                 console.error("Error processing report:", err);
//                 toast.error("Error loading report data");
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchReportData();
//     }, [navigate]);

//     // Function to group sections by common location fields
//     const groupSectionsByLocation = (sections) => {
//         const groups = [];
        
//         sections.forEach((section, index) => {
//             // Find existing group with same location
//             const existingGroup = groups.find(group => 
//                 group.zone === section.zone &&
//                 group.circle === section.circle &&
//                 group.divisionName === section.divisionName &&
//                 group.subDivisionName === section.subDivisionName
//             );
            
//             if (existingGroup) {
//                 existingGroup.sections.push(section);
//             } else {
//                 groups.push({
//                     zone: section.zone,
//                     circle: section.circle,
//                     divisionName: section.divisionName,
//                     subDivisionName: section.subDivisionName,
//                     sections: [section]
//                 });
//             }
//         });
        
//         return groups;
//     };

//     const handleExportExcel = () => {
//         setExportLoading(prev => ({ ...prev, excel: true }));
//         try {
//             const wb = XLSX.utils.book_new();
//             const ws = XLSX.utils.aoa_to_sheet([]);

//             // HEADER
//             XLSX.utils.sheet_add_aoa(ws, [
//                 ["Document Management System - Summary Report"],
//                 ["Summary Report"],
//                 [`Office: ${reportInfo.officeName}`, "", "", "", "", `Generated By: ${reportInfo.generatedBy}`],
//                 [`Generated On: ${reportInfo.generatedOn}`],
//                 [`Date Range: ${reportData?.meta?.dateRange?.startDate || 'N/A'} to ${reportData?.meta?.dateRange?.endDate || 'N/A'}`],
//                 []
//             ], { origin: -1 });

//             // Overall Summary Section
//             XLSX.utils.sheet_add_aoa(ws, [
//                 ["Overall Summary"],
//                 ["Total", "Approved", "Rejected", "Pending", "Reuploaded"],
//                 [
//                     overallSummary.total,
//                     overallSummary.approved,
//                     overallSummary.rejected,
//                     overallSummary.pending,
//                     overallSummary.reuploaded
//                 ],
//                 []
//             ], { origin: { r: 6, c: 0 } });

//             // Table Headers
//             XLSX.utils.sheet_add_aoa(ws, [
//                 ["Sl.No.", "Zone", "Circle", "Division", "Sub Division", "Section Code", "Section Name", "Total", "Approved", "Rejected", "Pending", "Reuploaded"]
//             ], { origin: { r: 10, c: 0 } });

//             let rowIndex = 11;
//             let slNo = 1;

//             groupedData.forEach(group => {
//                 const sectionCount = group.sections.length;
                
//                 group.sections.forEach((section, sectionIndex) => {
//                     const isFirstInGroup = sectionIndex === 0;
                    
//                     XLSX.utils.sheet_add_aoa(ws, [
//                         [
//                             slNo++,
//                             isFirstInGroup ? group.zone || 'N/A' : '',
//                             isFirstInGroup ? group.circle || 'N/A' : '',
//                             isFirstInGroup ? group.divisionName || 'N/A' : '',
//                             isFirstInGroup ? group.subDivisionName || 'N/A' : '',
//                             section.sectionCode,
//                             section.sectionName,
//                             section.summary.total || 0,
//                             section.summary.approved || 0,
//                             section.summary.rejected || 0,
//                             section.summary.pending || 0,
//                             section.summary.reuploaded || 0
//                         ]
//                     ], { origin: { r: rowIndex, c: 0 } });
                    
//                     rowIndex++;
//                 });
//             });

//             // Grand Total Row
//             XLSX.utils.sheet_add_aoa(ws, [[""]], { origin: { r: rowIndex, c: 0 } });
//             XLSX.utils.sheet_add_aoa(ws, [
//                 ["", "", "", "", "", "", "GRAND TOTAL", overallSummary.total, overallSummary.approved, overallSummary.rejected, overallSummary.pending, overallSummary.reuploaded]
//             ], { origin: { r: rowIndex + 1, c: 0 } });

//             // Column widths
//             ws["!cols"] = [
//                 { wch: 8 },    // Sl.No.
//                 { wch: 15 },   // Zone
//                 { wch: 15 },   // Circle
//                 { wch: 15 },   // Division
//                 { wch: 15 },   // Sub Division
//                 { wch: 15 },   // Section Code
//                 { wch: 20 },   // Section Name
//                 { wch: 10 },   // Total
//                 { wch: 10 },   // Approved
//                 { wch: 10 },   // Rejected
//                 { wch: 10 },   // Pending
//                 { wch: 10 }    // Reuploaded
//             ];

//             XLSX.utils.book_append_sheet(wb, ws, 'Report');
//             XLSX.writeFile(wb, `DMS_Summary_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
//             toast.success('Excel exported successfully');
//         } catch (error) {
//             console.error(error);
//             toast.error('Excel export failed');
//         } finally {
//             setExportLoading(prev => ({ ...prev, excel: false }));
//         }
//     };

//     const handleExportPDF = () => {
//         setExportLoading(prev => ({ ...prev, pdf: true }));
//         try {
//             const doc = new jsPDF('p', 'mm', 'a4');
//             const pageWidth = doc.internal.pageSize.getWidth();

//             // HEADER
//             doc.setFontSize(14);
//             doc.setTextColor(0, 0, 0);
//             doc.text('Document Management System - Summary Report', pageWidth / 2, 15, { align: 'center' });

//             doc.setFontSize(10);
//             doc.text('Summary Report', pageWidth / 2, 22, { align: 'center' });

//             doc.setFontSize(8);
//             doc.text(`Office: ${reportInfo.officeName}`, 14, 30);
//             doc.text(`Generated By: ${reportInfo.generatedBy}`, pageWidth / 2, 30, { align: 'center' });
//             doc.text(`Generated On: ${reportInfo.generatedOn}`, pageWidth - 14, 30, { align: 'right' });

//             // Date Range
//             doc.text(
//                 `Date Range: ${reportData?.meta?.dateRange?.startDate || 'N/A'} to ${reportData?.meta?.dateRange?.endDate || 'N/A'}`,
//                 pageWidth / 2,
//                 37,
//                 { align: 'center' }
//             );

//             // Overall Summary Section
//             doc.setFontSize(9);
//             doc.text('Overall Summary', 14, 47);
            
//             // Summary Table
//             const summaryHead = [["Total", "Approved", "Rejected", "Pending", "Reuploaded"]];
//             const summaryBody = [[
//                 overallSummary.total.toString(),
//                 overallSummary.approved.toString(),
//                 overallSummary.rejected.toString(),
//                 overallSummary.pending.toString(),
//                 overallSummary.reuploaded.toString()
//             ]];
            
//             doc.autoTable({
//                 head: summaryHead,
//                 body: summaryBody,
//                 startY: 52,
//                 margin: { left: 14, right: 14 },
//                 tableWidth: 'auto',
//                 styles: {
//                     fontSize: 8,
//                     cellPadding: 3,
//                     overflow: 'linebreak',
//                     halign: 'center',
//                     lineWidth: 0.1,
//                     lineColor: [200, 200, 200]
//                 },
//                 headStyles: {
//                     fillColor: [240, 240, 240],
//                     textColor: [0, 0, 0],
//                     fontStyle: 'bold',
//                     lineWidth: 0.1
//                 },
//                 columnStyles: {
//                     0: { cellWidth: 30 },
//                     1: { cellWidth: 30 },
//                     2: { cellWidth: 30 },
//                     3: { cellWidth: 30 },
//                     4: { cellWidth: 30 }
//                 }
//             });

//             // Sections Table
//             const lastY = doc.lastAutoTable.finalY || 70;
            
//             // Table Headers
//             const head = [[
//                 "Sl.No.",
//                 "Zone",
//                 "Circle", 
//                 "Division",
//                 "Sub Division",
//                 "Section Code",
//                 "Section Name",
//                 "Total",
//                 "Approved",
//                 "Rejected",
//                 "Pending",
//                 "Reuploaded"
//             ]];

//             let tableBody = [];
//             let slNo = 1;

//             groupedData.forEach(group => {
//                 group.sections.forEach((section, sectionIndex) => {
//                     const isFirstInGroup = sectionIndex === 0;
                    
//                     tableBody.push([
//                         slNo++,
//                         isFirstInGroup ? group.zone || 'N/A' : '',
//                         isFirstInGroup ? group.circle || 'N/A' : '',
//                         isFirstInGroup ? group.divisionName || 'N/A' : '',
//                         isFirstInGroup ? group.subDivisionName || 'N/A' : '',
//                         section.sectionCode,
//                         section.sectionName,
//                         section.summary.total || 0,
//                         section.summary.approved || 0,
//                         section.summary.rejected || 0,
//                         section.summary.pending || 0,
//                         section.summary.reuploaded || 0
//                     ]);
//                 });
//             });

//             // Add Grand Total
//             tableBody.push([
//                 '',
//                 '',
//                 '',
//                 '',
//                 '',
//                 '',
//                 'GRAND TOTAL',
//                 overallSummary.total,
//                 overallSummary.approved,
//                 overallSummary.rejected,
//                 overallSummary.pending,
//                 overallSummary.reuploaded
//             ]);

//             doc.autoTable({
//                 head,
//                 body: tableBody,
//                 startY: lastY + 10,
//                 margin: { left: 7, right: 7 },
//                 styles: {
//                     fontSize: 7,
//                     cellPadding: 2,
//                     overflow: 'linebreak',
//                     halign: 'center',
//                     lineWidth: 0.1,
//                     lineColor: [200, 200, 200]
//                 },
//                 headStyles: {
//                     fillColor: [200, 200, 200],
//                     textColor: [0, 0, 0],
//                     fontStyle: 'bold',
//                     lineWidth: 0.1
//                 },
//                 columnStyles: {
//                     0: { cellWidth: 8 },
//                     1: { cellWidth: 15 },
//                     2: { cellWidth: 15 },
//                     3: { cellWidth: 15 },
//                     4: { cellWidth: 15 },
//                     5: { cellWidth: 15 },
//                     6: { cellWidth: 20 },
//                     7: { cellWidth: 10 },
//                     8: { cellWidth: 10 },
//                     9: { cellWidth: 10 },
//                     10: { cellWidth: 10 },
//                     11: { cellWidth: 10 }
//                 },
//                 willDrawCell: function(data) {
//                     // Style Grand Total row
//                     if (data.row.index === tableBody.length - 1) {
//                         doc.setFillColor(240, 240, 240);
//                         doc.setDrawColor(0, 0, 0);
//                         doc.setFontStyle('bold');
//                     }
//                 }
//             });

//             doc.save(`DMS_Summary_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
//             toast.success('PDF exported successfully');
//         } catch (error) {
//             console.error(error);
//             toast.error('PDF export failed');
//         } finally {
//             setExportLoading(prev => ({ ...prev, pdf: false }));
//         }
//     };

//     const handleGoBack = () => {
//         navigate('/reports');
//     };

//     if (isLoading) {
//         return (
//             <div className="page-content">
//                 <Container fluid>
//                     <Row>
//                         <Col lg={12}>
//                             <div className="text-center my-5">
//                                 <Spinner color="primary" />
//                                 <p className="mt-2">Loading report...</p>
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>
//         );
//     }

//     if (!reportData || sections.length === 0) {
//         return (
//             <div className="page-content">
//                 <Container fluid>
//                     <Row>
//                         <Col lg={12}>
//                             <Card>
//                                 <CardBody className="text-center py-5">
//                                     <i className="ri-file-text-line fs-1 text-muted mb-3"></i>
//                                     <h4>No Report Data Found</h4>
//                                     <p className="text-muted mb-4">Please generate a report first</p>
//                                     <Button color="primary" onClick={handleGoBack}>
//                                         <i className="ri-arrow-left-line me-2"></i>
//                                         Go Back to Reports
//                                     </Button>
//                                 </CardBody>
//                             </Card>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>
//         );
//     }

//     return (
//         <div className="page-content">
//             <Container fluid>
//                 <BreadCrumb 
//                     title="Report View" 
//                     pageTitle="DMS"
//                     breadcrumbItems={[
//                         { title: "Reports", link: "/reports" },
//                         { title: "Report View", link: "#" }
//                     ]}
//                 />

//                 {/* Report Header with Export Buttons */}
//                 <Card className="mb-3">
//                     <CardBody>
//                         <Row className="align-items-center">
//                             <Col md={8}>
//                                 <h4 className="card-title mb-1">
//                                     <i className="ri-file-text-line align-middle me-2"></i>
//                                     Summary Report
//                                 </h4>
//                                 <p className="text-muted mb-0">
//                                     Generated on: {reportInfo.generatedOn}
//                                 </p>
//                             </Col>
//                             <Col md={4}>
//                                 <div className="d-flex gap-2 justify-content-end">
//                                     <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
//                                         <DropdownToggle color="success" className="d-flex align-items-center">
//                                             <i className="ri-download-line me-2"></i>
//                                             Export
//                                         </DropdownToggle>
//                                         <DropdownMenu>
//                                             <DropdownItem onClick={handleExportExcel} disabled={exportLoading.excel}>
//                                                 {exportLoading.excel ? (
//                                                     <><Spinner size="sm" className="me-2" /> Exporting Excel...</>
//                                                 ) : (
//                                                     'Export to Excel'
//                                                 )}
//                                             </DropdownItem>
//                                             <DropdownItem onClick={handleExportPDF} disabled={exportLoading.pdf}>
//                                                 {exportLoading.pdf ? (
//                                                     <><Spinner size="sm" className="me-2" /> Exporting PDF...</>
//                                                 ) : (
//                                                     'Export to PDF'
//                                                 )}
//                                             </DropdownItem>
//                                         </DropdownMenu>
//                                     </Dropdown>
//                                     <Button color="secondary" onClick={handleGoBack}>
//                                         <i className="ri-arrow-left-line me-2"></i>
//                                         Back
//                                     </Button>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </CardBody>
//                 </Card>

//                 {/* Overall Summary Card */}
//                 <Card className="mb-4">
//                     <CardHeader>
//                         <h5 className="card-title mb-0">
//                             <i className="ri-bar-chart-line align-middle me-2"></i>
//                             Overall Summary
//                         </h5>
//                     </CardHeader>
//                     <CardBody>
//                         <Row>
//                             <Col md={12}>
//                                 <div className="d-flex flex-wrap gap-3 justify-content-center">
//                                     <div className="text-center p-3 border rounded" style={{ minWidth: '120px' }}>
//                                         <h2 className="mb-1">{overallSummary.total}</h2>
//                                         <p className="text-muted mb-0 fw-medium">Total</p>
//                                     </div>
//                                     <div className="text-center p-3 border rounded" style={{ minWidth: '120px' }}>
//                                         <h2 className="mb-1 text-success">{overallSummary.approved}</h2>
//                                         <p className="text-muted mb-0 fw-medium">Approved</p>
//                                     </div>
//                                     <div className="text-center p-3 border rounded" style={{ minWidth: '120px' }}>
//                                         <h2 className="mb-1 text-danger">{overallSummary.rejected}</h2>
//                                         <p className="text-muted mb-0 fw-medium">Rejected</p>
//                                     </div>
//                                     <div className="text-center p-3 border rounded" style={{ minWidth: '120px' }}>
//                                         <h2 className="mb-1 text-warning">{overallSummary.pending}</h2>
//                                         <p className="text-muted mb-0 fw-medium">Pending</p>
//                                     </div>
//                                     <div className="text-center p-3 border rounded" style={{ minWidth: '120px' }}>
//                                         <h2 className="mb-1 text-info">{overallSummary.reuploaded}</h2>
//                                         <p className="text-muted mb-0 fw-medium">Reuploaded</p>
//                                     </div>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </CardBody>
//                 </Card>

//                 {/* Sections Summary Table */}
//                 <Card>
//                     <CardHeader>
//                         <h5 className="card-title mb-0">
//                             <i className="ri-table-line align-middle me-2"></i>
//                             Section-wise Details
//                         </h5>
//                     </CardHeader>
//                     <CardBody>
//                         <div className="table-responsive">
//                             <Table bordered className="mb-4">
//                                 <thead className="table-light">
//                                     <tr>
//                                         <th className="text-center">Sl.No.</th>
//                                         <th className="text-center">Section Name</th>
//                                         <th className="text-center">Total</th>
//                                         <th className="text-center">Approved</th>
//                                         <th className="text-center">Rejected</th>
//                                         <th className="text-center">Pending</th>
//                                         <th className="text-center">Reuploaded</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {groupedData.map((group, groupIndex) => (
//                                         group.sections.map((section, sectionIndex) => {
//                                             const isFirstInGroup = sectionIndex === 0;
//                                             const slNo = groupedData.slice(0, groupIndex).reduce((acc, g) => acc + g.sections.length, 0) + sectionIndex + 1;
                                            
//                                             return (
//                                                 <tr key={`${groupIndex}-${sectionIndex}`}>
//                                                     <td className="text-center">{slNo}</td>
//                                                     <td className="text-center">{section.sectionName}</td>
//                                                     <td className="text-center fw-bold">{section.summary.total || 0}</td>
//                                                     <td className="text-center text-success">{section.summary.approved || 0}</td>
//                                                     <td className="text-center text-danger">{section.summary.rejected || 0}</td>
//                                                     <td className="text-center text-warning">{section.summary.pending || 0}</td>
//                                                     <td className="text-center text-info">{section.summary.reuploaded || 0}</td>
//                                                 </tr>
//                                             );
//                                         })
//                                     ))}
//                                 </tbody>
//                                 <tfoot className="table-active">
//                                     <tr>
//                                         <td colSpan={2} className="text-end fw-bold">GRAND TOTAL</td>
//                                         <td className="text-center fw-bold">{overallSummary.total}</td>
//                                         <td className="text-center fw-bold text-success">{overallSummary.approved}</td>
//                                         <td className="text-center fw-bold text-danger">{overallSummary.rejected}</td>
//                                         <td className="text-center fw-bold text-warning">{overallSummary.pending}</td>
//                                         <td className="text-center fw-bold text-info">{overallSummary.reuploaded}</td>
//                                     </tr>
//                                 </tfoot>
//                             </Table>
//                         </div>
//                     </CardBody>
//                 </Card>
//             </Container>
//         </div>
//     );
// };

// export default ReportView;

















import React, { useState, useEffect } from 'react';
import {
    Spinner, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Card, CardBody, CardHeader, Col, Container, Row, Button, Table
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

const ReportView = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState({ excel: false, pdf: false });
    const [filters, setFilters] = useState(null);
    const [sections, setSections] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [overallSummary, setOverallSummary] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        reuploaded: 0
    });

    // Get user info from session
    const authUser = JSON.parse(sessionStorage.getItem('authUser')) || {};
    const loginName = authUser?.user?.loginName || authUser?.user?.Email || 'Unknown User';
    const reportHeaderLocationName = authUser?.user?.reportHeaderLocationName || 'Unknown Office';

    const reportInfo = {
        officeName: reportHeaderLocationName,
        generatedBy: loginName,
        generatedOn: new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setIsLoading(true);
                
                // Get stored data from localStorage
                const storedData = localStorage.getItem('reportData');
                
                if (!storedData) {
                    toast.error("No report data found");
                    navigate('/reports');
                    return;
                }

                const parsedData = JSON.parse(storedData);
                
                // Store filters for display
                setFilters(parsedData.filters);
                
                // Check if we have report data
                if (parsedData.reportData && parsedData.reportData.status) {
                    const response = parsedData.reportData;
                    
                    // Set sections data
                    if (response.data && response.data.sections && Array.isArray(response.data.sections)) {
                        setSections(response.data.sections);
                        
                        // Group data by common fields
                        const grouped = groupSectionsByLocation(response.data.sections);
                        setGroupedData(grouped);
                        
                        // Set overall summary from API response
                        if (response.data.overallSummary) {
                            setOverallSummary(response.data.overallSummary);
                        } else {
                            // Calculate overall summary if not provided
                            const calculatedOverall = {
                                total: 0,
                                approved: 0,
                                rejected: 0,
                                pending: 0,
                                reuploaded: 0
                            };
                            
                            response.data.sections.forEach(section => {
                                if (section.summary) {
                                    calculatedOverall.total += section.summary.total || 0;
                                    calculatedOverall.approved += section.summary.approved || 0;
                                    calculatedOverall.rejected += section.summary.rejected || 0;
                                    calculatedOverall.pending += section.summary.pending || 0;
                                    calculatedOverall.reuploaded += section.summary.reuploaded || 0;
                                }
                            });
                            
                            setOverallSummary(calculatedOverall);
                        }
                    }
                    
                    setReportData(response);
                } else {
                    toast.error("Invalid report data format");
                }
            } catch (err) {
                console.error("Error processing report:", err);
                toast.error("Error loading report data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReportData();
    }, [navigate]);

    // Function to group sections by common location fields
    const groupSectionsByLocation = (sections) => {
        const groups = [];
        
        sections.forEach((section, index) => {
            // Find existing group with same location
            const existingGroup = groups.find(group => 
                group.zone === section.zone &&
                group.circle === section.circle &&
                group.divisionName === section.divisionName &&
                group.subDivisionName === section.subDivisionName
            );
            
            if (existingGroup) {
                existingGroup.sections.push(section);
            } else {
                groups.push({
                    zone: section.zone,
                    circle: section.circle,
                    divisionName: section.divisionName,
                    subDivisionName: section.subDivisionName,
                    sections: [section]
                });
            }
        });
        
        return groups;
    };

    const handleExportExcel = () => {
        setExportLoading(prev => ({ ...prev, excel: true }));
        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([]);

            // HEADER
            XLSX.utils.sheet_add_aoa(ws, [
                ["Document Management System - Summary Report"],
                ["Summary Report"],
                [`Office: ${reportInfo.officeName}`, "", "", "", "", `Generated By: ${reportInfo.generatedBy}`],
                [`Generated On: ${reportInfo.generatedOn}`],
                [`Date Range: ${reportData?.meta?.dateRange?.startDate || 'N/A'} to ${reportData?.meta?.dateRange?.endDate || 'N/A'}`],
                []
            ], { origin: -1 });

            // Overall Summary Section
            XLSX.utils.sheet_add_aoa(ws, [
                ["Overall Summary"],
                ["Total", "Approved", "Rejected", "Pending", "Reuploaded"],
                [
                    overallSummary.total,
                    overallSummary.approved,
                    overallSummary.rejected,
                    overallSummary.pending,
                    overallSummary.reuploaded
                ],
                []
            ], { origin: { r: 6, c: 0 } });

            // Table Headers
            XLSX.utils.sheet_add_aoa(ws, [
                ["Sl.No.", "Zone", "Circle", "Division", "Sub Division", "Section Code", "Section Name", "Total", "Approved", "Rejected", "Pending", "Reuploaded"]
            ], { origin: { r: 10, c: 0 } });

            let rowIndex = 11;
            let slNo = 1;

            groupedData.forEach(group => {
                const sectionCount = group.sections.length;
                
                group.sections.forEach((section, sectionIndex) => {
                    const isFirstInGroup = sectionIndex === 0;
                    
                    XLSX.utils.sheet_add_aoa(ws, [
                        [
                            slNo++,
                            isFirstInGroup ? group.zone || 'N/A' : '',
                            isFirstInGroup ? group.circle || 'N/A' : '',
                            isFirstInGroup ? group.divisionName || 'N/A' : '',
                            isFirstInGroup ? group.subDivisionName || 'N/A' : '',
                            section.sectionCode,
                            section.sectionName,
                            section.summary.total || 0,
                            section.summary.approved || 0,
                            section.summary.rejected || 0,
                            section.summary.pending || 0,
                            section.summary.reuploaded || 0
                        ]
                    ], { origin: { r: rowIndex, c: 0 } });
                    
                    rowIndex++;
                });
            });

            // Grand Total Row
            XLSX.utils.sheet_add_aoa(ws, [[""]], { origin: { r: rowIndex, c: 0 } });
            XLSX.utils.sheet_add_aoa(ws, [
                ["", "", "", "", "", "", "GRAND TOTAL", overallSummary.total, overallSummary.approved, overallSummary.rejected, overallSummary.pending, overallSummary.reuploaded]
            ], { origin: { r: rowIndex + 1, c: 0 } });

            // Column widths
            ws["!cols"] = [
                { wch: 8 },    // Sl.No.
                { wch: 15 },   // Zone
                { wch: 15 },   // Circle
                { wch: 15 },   // Division
                { wch: 15 },   // Sub Division
                { wch: 15 },   // Section Code
                { wch: 10 },   // Section Name
                { wch: 10 },   // Total
                { wch: 10 },   // Approved
                { wch: 10 },   // Rejected
                { wch: 10 },   // Pending
                { wch: 10 }    // Reuploaded
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            XLSX.writeFile(wb, `DMS_Summary_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Excel export failed');
        } finally {
            setExportLoading(prev => ({ ...prev, excel: false }));
        }
    };

    const handleExportPDF = () => {
        setExportLoading(prev => ({ ...prev, pdf: true }));
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();

            // HEADER
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Document Management System - Summary Report', pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.text('Summary Report', pageWidth / 2, 22, { align: 'center' });

            doc.setFontSize(8);
            doc.text(`Office: ${reportInfo.officeName}`, 14, 30);
            doc.text(`Generated By: ${reportInfo.generatedBy}`, pageWidth / 2, 30, { align: 'center' });
            doc.text(`Generated On: ${reportInfo.generatedOn}`, pageWidth - 14, 30, { align: 'right' });

            // Date Range
            doc.text(
                `Date Range: ${reportData?.meta?.dateRange?.startDate || 'N/A'} to ${reportData?.meta?.dateRange?.endDate || 'N/A'}`,
                pageWidth / 2,
                37,
                { align: 'center' }
            );

            // Overall Summary Section
            doc.setFontSize(9);
            doc.text('Overall Summary', 14, 47);
            
            // Summary Table
            const summaryHead = [["Total", "Approved", "Rejected", "Pending", "Reuploaded"]];
            const summaryBody = [[
                overallSummary.total.toString(),
                overallSummary.approved.toString(),
                overallSummary.rejected.toString(),
                overallSummary.pending.toString(),
                overallSummary.reuploaded.toString()
            ]];
            
            doc.autoTable({
                head: summaryHead,
                body: summaryBody,
                startY: 52,
                margin: { left: 14, right: 14 },
                tableWidth: 'auto',
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                headStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 30 }
                }
            });

            // Sections Table
            const lastY = doc.lastAutoTable.finalY || 70;
            
            // Table Headers
            const head = [[
                "Sl.No.",
                "Zone",
                "Circle", 
                "Division",
                "Sub Division",
                "Section Code",
                "Section Name",
                "Total",
                "Approved",
                "Rejected",
                "Pending",
                "Reuploaded"
            ]];

            let tableBody = [];
            let slNo = 1;

            groupedData.forEach(group => {
                group.sections.forEach((section, sectionIndex) => {
                    const isFirstInGroup = sectionIndex === 0;
                    
                    tableBody.push([
                        slNo++,
                        isFirstInGroup ? group.zone || 'N/A' : '',
                        isFirstInGroup ? group.circle || 'N/A' : '',
                        isFirstInGroup ? group.divisionName || 'N/A' : '',
                        isFirstInGroup ? group.subDivisionName || 'N/A' : '',
                        section.sectionCode,
                        section.sectionName,
                        section.summary.total || 0,
                        section.summary.approved || 0,
                        section.summary.rejected || 0,
                        section.summary.pending || 0,
                        section.summary.reuploaded || 0
                    ]);
                });
            });

            // Add Grand Total
            tableBody.push([
                '',
                '',
                '',
                '',
                '',
                '',
                'GRAND TOTAL',
                overallSummary.total,
                overallSummary.approved,
                overallSummary.rejected,
                overallSummary.pending,
                overallSummary.reuploaded
            ]);

            doc.autoTable({
                head,
                body: tableBody,
                startY: lastY + 10,
                margin: { left: 7, right: 7 },
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                headStyles: {
                    fillColor: [200, 200, 200],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { cellWidth: 8 },
                    1: { cellWidth: 15 },
                    2: { cellWidth: 15 },
                    3: { cellWidth: 15 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 15 },
                    6: { cellWidth: 20 },
                    7: { cellWidth: 10 },
                    8: { cellWidth: 10 },
                    9: { cellWidth: 10 },
                    10: { cellWidth: 10 },
                    11: { cellWidth: 10 }
                },
                willDrawCell: function(data) {
                    // Style Grand Total row
                    if (data.row.index === tableBody.length - 1) {
                        doc.setFillColor(240, 240, 240);
                        doc.setDrawColor(0, 0, 0);
                        doc.setFontStyle('bold');
                    }
                }
            });

            doc.save(`DMS_Summary_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('PDF exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('PDF export failed');
        } finally {
            setExportLoading(prev => ({ ...prev, pdf: false }));
        }
    };

    // const handleGoBack = () => {
    //     navigate('/reports');
    // };

    if (isLoading) {
        return (
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center my-5">
                                <Spinner color="primary" />
                                <p className="mt-2">Loading report...</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    if (!reportData || sections.length === 0) {
        return (
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody className="text-center py-5">
                                    <i className="ri-file-text-line fs-1 text-muted mb-3"></i>
                                    <h4>No Report Data Found</h4>
                                    <p className="text-muted mb-4">Please generate a report first</p>
                                    <Button color="primary" onClick={handleGoBack}>
                                        <i className="ri-arrow-left-line me-2"></i>
                                        Go Back to Reports
                                    </Button>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    return (
        <div className="page-content">
            <Container fluid>
                <BreadCrumb 
                    title="Report View" 
                    pageTitle="DMS"
                    breadcrumbItems={[
                        { title: "Reports", link: "/reports" },
                        { title: "Report View", link: "#" }
                    ]}
                />

                {/* Common Table Header */}
                <Card className="mb-4 shadow-sm border">
                    <CardHeader className="bg-white py-3">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h4 className="mb-0 text-primary">
                                    <i className="ri-file-text-line align-middle me-2"></i>
                                    Summary Report
                                </h4>
                            </Col>
                            <Col md={4} className="text-md-end">
                                <p className="text-muted mb-0">
                                    Generated on: {reportInfo.generatedOn}
                                </p>
                            </Col>
                        </Row>
                    </CardHeader>
                </Card>

                {/* Overall Summary Card with Simple Styling */}
                <Card className="mb-4 shadow-sm border">
                    <CardBody className="p-4">
                        <h5 className="mb-4 text-dark">
                            <i className="ri-bar-chart-line align-middle me-2 text-primary"></i>
                            Overall Summary
                        </h5>
                        <Row className="g-4">
                            <Col xs={6} sm={4} md={2} className="mb-2">
                                <div className="p-3 border rounded bg-light text-center">
                                    <h3 className="mb-1 text-dark">{overallSummary.total}</h3>
                                    <p className="text-muted mb-0 small">Total</p>
                                </div>
                            </Col>
                            <Col xs={6} sm={4} md={2} className="mb-2">
                                <div className="p-3 border rounded bg-success bg-opacity-10 text-center">
                                    <h3 className="mb-1 text-success">{overallSummary.approved}</h3>
                                    <p className="text-muted mb-0 small">Approved</p>
                                </div>
                            </Col>
                            <Col xs={6} sm={4} md={2} className="mb-2">
                                <div className="p-3 border rounded bg-danger bg-opacity-10 text-center">
                                    <h3 className="mb-1 text-danger">{overallSummary.rejected}</h3>
                                    <p className="text-muted mb-0 small">Rejected</p>
                                </div>
                            </Col>
                            <Col xs={6} sm={4} md={2} className="mb-2">
                                <div className="p-3 border rounded bg-warning bg-opacity-10 text-center">
                                    <h3 className="mb-1 text-warning">{overallSummary.pending}</h3>
                                    <p className="text-muted mb-0 small">Pending</p>
                                </div>
                            </Col>
                            <Col xs={6} sm={4} md={2} className="mb-2">
                                <div className="p-3 border rounded bg-info bg-opacity-10 text-center">
                                    <h3 className="mb-1 text-info">{overallSummary.reuploaded}</h3>
                                    <p className="text-muted mb-0 small">Reuploaded</p>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Sections Summary Table with Action Buttons */}
                <Card className="shadow-sm border">
                    <CardHeader className="bg-white py-3">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h5 className="mb-0 text-dark">
                                    <i className="ri-table-line align-middle me-2 text-primary"></i>
                                    Section-wise Details
                                </h5>
                            </Col>
                            <Col md={4}>
                                <div className="d-flex gap-2 justify-content-end">
                                    <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
                                        <DropdownToggle color="success" className="d-flex align-items-center">
                                            <i className="ri-download-line me-2"></i>
                                            Export
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem onClick={handleExportExcel} disabled={exportLoading.excel}>
                                                {exportLoading.excel ? (
                                                    <><Spinner size="sm" className="me-2" /> Exporting Excel...</>
                                                ) : (
                                                    <><i className="ri-file-excel-line me-2"></i>Export to Excel</>
                                                )}
                                            </DropdownItem>
                                            <DropdownItem onClick={handleExportPDF} disabled={exportLoading.pdf}>
                                                {exportLoading.pdf ? (
                                                    <><Spinner size="sm" className="me-2" /> Exporting PDF...</>
                                                ) : (
                                                    <><i className="ri-file-pdf-line me-2"></i>Export to PDF</>
                                                )}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    {/* <Button color="secondary" onClick={handleGoBack} className="d-flex align-items-center">
                                        <i className="ri-arrow-left-line me-2"></i>
                                        Back
                                    </Button> */}
                                </div>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="table-responsive">
                            <Table bordered className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center" style={{ width: '60px' }}>Sl.No.</th>
                                        <th className="text-center" style={{ width: '80px' }}>Section Name</th>
                                        <th className="text-center" style={{ width: '80px' }}>Total</th>
                                        <th className="text-center" style={{ width: '90px' }}>Approved</th>
                                        <th className="text-center" style={{ width: '90px' }}>Rejected</th>
                                        <th className="text-center" style={{ width: '90px' }}>Pending</th>
                                        <th className="text-center" style={{ width: '100px' }}>Reuploaded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedData.map((group, groupIndex) => (
                                        group.sections.map((section, sectionIndex) => {
                                            const isFirstInGroup = sectionIndex === 0;
                                            const slNo = groupedData.slice(0, groupIndex).reduce((acc, g) => acc + g.sections.length, 0) + sectionIndex + 1;
                                            
                                            return (
                                                <tr key={`${groupIndex}-${sectionIndex}`}>
                                                    <td className="text-center align-middle">{slNo}</td>
                                                    <td className="align-middle">
                                                        <div>
                                                            <div className="fw-medium">{section.sectionName}</div>
                                                            {/* <small className="text-muted">{section.sectionCode}</small> */}
                                                        </div>
                                                    </td>
                                                    <td className="text-center align-middle fw-bold text-dark">{section.summary.total || 0}</td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-success bg-opacity-10 text-success p-2 d-inline-block" style={{ width: '40px' }}>
                                                            {section.summary.approved || 0}
                                                        </span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-danger bg-opacity-10 text-danger p-2 d-inline-block" style={{ width: '40px' }}>
                                                            {section.summary.rejected || 0}
                                                        </span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-warning bg-opacity-10 text-warning p-2 d-inline-block" style={{ width: '40px' }}>
                                                            {section.summary.pending || 0}
                                                        </span>
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-info bg-opacity-10 text-info p-2 d-inline-block" style={{ width: '40px' }}>
                                                            {section.summary.reuploaded || 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ))}
                                </tbody>
                                <tfoot className="table-active">
                                    <tr>
                                        <td colSpan={2} className="text-end fw-bold align-middle">GRAND TOTAL</td>
                                        <td className="text-center fw-bold align-middle text-dark">{overallSummary.total}</td>
                                        <td className="text-center fw-bold align-middle">
                                            <span className="badge bg-success bg-opacity-10 text-success p-2 d-inline-block" style={{ width: '40px' }}>
                                                {overallSummary.approved}
                                            </span>
                                        </td>
                                        <td className="text-center fw-bold align-middle">
                                            <span className="badge bg-danger bg-opacity-10 text-danger p-2 d-inline-block" style={{ width: '40px' }}>
                                                {overallSummary.rejected}
                                            </span>
                                        </td>
                                        <td className="text-center fw-bold align-middle">
                                            <span className="badge bg-warning bg-opacity-10 text-warning p-2 d-inline-block" style={{ width: '40px' }}>
                                                {overallSummary.pending}
                                            </span>
                                        </td>
                                        <td className="text-center fw-bold align-middle">
                                            <span className="badge bg-info bg-opacity-10 text-info p-2 d-inline-block" style={{ width: '40px' }}>
                                                {overallSummary.reuploaded}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default ReportView;