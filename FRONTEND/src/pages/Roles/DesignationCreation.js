// import React, { useState, useEffect, useMemo } from 'react';
// import {
//     Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
//     Modal, Input, FormGroup
// } from 'reactstrap';

// import ErrorModal from '../../Components/Common/ErrorModal';
// import SuccessModal from '../../Components/Common/SuccessModal';
// import BreadCrumb from '../../Components/Common/BreadCrumb';
// import { ToastContainer } from 'react-toastify';
// import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils";

// import {
//     postCreateDesignation,
//     putUpdateDesignation,
//     getAllDesignations
// } from "../../helpers/fakebackend_helper";

// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { GET_DESIGNATION } from '../../helpers/url_helper';

// const SORT_ARROW_SIZE = 13; // px

// function SortArrows({ direction, active }) {
//   return (
//     <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
//       <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: "block" }}>
//         <polyline
//           points="3,8 6.5,4 10,8"
//           fill="none"
//           stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'}
//           strokeWidth={2}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//       <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: "block", marginTop: -2 }}>
//         <polyline
//           points="3,5 6.5,9 10,5"
//           fill="none"
//           stroke={active && direction === 'desc' ? '#1064ea' : '#c1c5ca'}
//           strokeWidth={2}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//     </span>
//   );
// }

// const DesignationCreation = () => {
//     const [modal_list, setmodal_list] = useState(false);
//     const [edit_update, setedit_update] = useState(false);
//     const [buttonval, setbuttonval] = useState('Add Designation');
//     const [subButtonval, setSubButtonval] = useState('Save');
//     const [edit_items, setedit_items] = useState([]);
//     const [data, setData] = useState([]); // rendered data
//     const [successModal, setSuccessModal] = useState(false);
//     const [errorModal, setErrorModal] = useState(false);
//     const [response, setResponse] = useState('');
//     const [databk, setDataBk] = useState([]); // Original backend order
//     const [username, setUserName] = useState('');
//     const [checked, setChecked] = useState(true);
//     const [checkedText, setCheckedText] = useState('InActive');
//     const [searchTerm, setSearchTerm] = useState('');

//     // Sorting state
//     const [sortConfig, setSortConfig] = useState({
//         key: null,
//         direction: null
//     });

//     // Pagination state
//     const [page, setPage] = useState(0);
//     const [pageSize, setPageSize] = useState(5);

//     const columns = useMemo(() => [
//         {
//             header: 'DesignationName',
//             accessorKey: 'designationName',
//             key: 'designationName',
//             sortable: true,
//         },
//         {
//             header: 'DesignationCode',
//             accessorKey: 'designationCode',
//             key: 'designationCode',
//             sortable: true,
//         },
//         {
//             header: 'CreatedOn',
//             accessorKey: 'requestDate',
//             key: 'requestDate',
//             sortable: true,
//         },
//         {
//             header: 'CreatedBy',
//             accessorKey: 'requestUserName',
//             key: 'requestUserName',
//             sortable: true,
//         },
//         {
//             header: 'Status',
//             accessorKey: 'status',
//             key: 'status',
//             sortable: true,
//         },
//         {
//             header: 'Action',
//             accessorKey: 'action',
//             key: 'action',
//             sortable: false,
//         },
//     ], []);

//     // Sorting function (only if a column is actively sorted, else return as-is)
//     const sortData = (inputData, key, direction) => {
//         if (!key || !direction) return inputData;
//         if (!Array.isArray(inputData)) return [];
//         return [...inputData].sort((a, b) => {
//             const aValue = a?.[key] ?? '';
//             const bValue = b?.[key] ?? '';
//             const av = String(aValue).toLowerCase();
//             const bv = String(bValue).toLowerCase();
//             if (direction === 'asc') {
//                 return av.localeCompare(bv);
//             } else {
//                 return bv.localeCompare(av);
//             }
//         });
//     };

//     // Calculate sorted data (only actively sorted, else use original input order)
//     const sortedData = useMemo(() => {
//         if (!sortConfig.key) return data; // keep natural (filtered) order
//         return sortData(data, sortConfig.key, sortConfig.direction);
//     }, [data, sortConfig]);

//     // Pagination logic, always based on sortedData
//     const paginatedData = useMemo(() => {
//         if (pageSize === -1) return sortedData;
//         const start = page * pageSize;
//         const end = start + pageSize;
//         return sortedData.slice(start, end);
//     }, [sortedData, page, pageSize]);

//     // Calculate page count
//     const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);

//     // Load initial data (always sets data and databk in backend order)
//     useEffect(() => {
//         getOnLoadingData();
//     }, []);

//     async function getOnLoadingData() {
//         try {
//             const obj = JSON.parse(sessionStorage.getItem("authUser"));
//             const response = await getAllDesignations(GET_DESIGNATION);
//             const allDesignations = response.data;

//             setUserName(obj.user.loginName);
//             setData(allDesignations);
//             setDataBk(allDesignations); // Keep original order
//             setSortConfig({ key: null, direction: null }); // Reset sort
//             setPage(0); // Reset to first page
//         } catch (error) {
//             console.error("Error loading data:", error);
//             toast.error("Failed to load designations");
//         }
//     }

//     // When searching, always run on databk (backend order)
//     const handleSearch = (e) => {
//         const term = e.target.value.toLowerCase();
//         setSearchTerm(term);
//         setPage(0);

//         if (term === '') {
//             setData([...databk]);
//         } else {
//             const filtered = databk.filter(item => {
//                 return (
//                     (item.designationName || '').toLowerCase().includes(term) ||
//                     (item.designationCode || '').toLowerCase().includes(term) ||
//                     (item.requestUserName || '').toLowerCase().includes(term)
//                 );
//             });
//             setData(filtered);
//         }
//         // Reset sort for new search
//         setSortConfig({ key: null, direction: null });
//     };

//     // Sort handler: no default sort, toggles between asc, desc, and then no sort (returns to backend order)
//     const handleSort = (key) => {
//         let direction = 'asc';
//         if (sortConfig.key === key) {
//             if (sortConfig.direction === 'asc') {
//                 direction = 'desc';
//             } else if (sortConfig.direction === 'desc') {
//                 // Third click: no sort (original backend/filtered order)
//                 setSortConfig({ key: null, direction: null });
//                 return;
//             }
//         }
//         setSortConfig({ key, direction });
//     };

//     // Table header with sort controls
//     const renderTableHeader = () => (
//         <tr>
//             {columns.map((col) => {
//                 if (!col.sortable) {
//                     return <th key={col.key}>{col.header}</th>;
//                 }
//                 const isActive = sortConfig.key === col.key;
//                 const direction = isActive ? sortConfig.direction : null;
//                 return (
//                     <th
//                         key={col.key}
//                         onClick={() => handleSort(col.key)}
//                         style={{
//                             cursor: 'pointer',
//                             userSelect: 'none',
//                             whiteSpace: 'nowrap',
//                             paddingRight: 14,
//                             verticalAlign: "middle"
//                         }}
//                     >
//                         {col.header}
//                         <SortArrows active={isActive} direction={direction} />
//                     </th>
//                 );
//             })}
//         </tr>
//     );

//     // Pagination controls
//     const renderPagination = () => {
//   const pageSizeOptions = [
//     { value: 5, label: '5' },
//     { value: 10, label: '10' },
//     { value: 15, label: '15' },
//     { value: 25, label: '25' },
//     { value: 50, label: '50' },
//     { value: 100, label: '100' },
//     { value: -1, label: 'All' },
//   ];

//   return (
//     <div style={{ margin: '18px 0 12px 0' }}>
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           flexWrap: 'wrap',
//           gap: 10,
//         }}
//       >
//         {/* Left: Showing Results & Page Size */}
//         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
//           <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
//             Showing{' '}
//             <b style={{ color: '#222', fontWeight: 600 }}>
//               {pageSize === -1 ? sortedData.length : Math.min(pageSize, sortedData.length)}
//             </b>{' '}
//             of <b>{sortedData.length}</b> Results
//           </span>
//           <select
//             value={pageSize}
//             onChange={e => {
//               const val = e.target.value === '-1' ? -1 : parseInt(e.target.value, 10);
//               setPageSize(val);
//               setPage(0);
//             }}
//             style={{
//               border: '1px solid #c9ddf7',
//               borderRadius: 7,
//               padding: '7px 10px',
//               fontSize: 15,
//               width: '80px',
//               color: '#444',
//               marginTop: 4,
//               outline: 'none',
//               background: 'white',
//               boxShadow: '0 0 0 2px #d0ebfd66',
//             }}
//           >
//             {pageSizeOptions.map(option => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Right: Pagination Controls */}
//         <div className="btn-group" role="group" aria-label="Pagination">
//           <button
//             type="button"
//             className="btn btn-light"
//             disabled={page === 0 || pageSize === -1}
//             onClick={() => setPage(Math.max(page - 1, 0))}
//           >
//             Previous
//           </button>
//           {pageSize !== -1 && Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
//             let pageNum = i;
//             if (pageCount > 5) {
//               if (page >= 3 && page < pageCount - 2) {
//                 pageNum = page - 2 + i;
//               } else if (page >= pageCount - 2) {
//                 pageNum = pageCount - 5 + i;
//               }
//             }
//             return (
//               <button
//                 key={pageNum}
//                 type="button"
//                 className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`}
//                 onClick={() => setPage(pageNum)}
//                 disabled={page === pageNum}
//                 aria-current={page === pageNum ? 'page' : undefined}
//                 style={{ minWidth: 36 }}
//               >
//                 {pageNum + 1}
//               </button>
//             );
//           })}
//           <button
//             type="button"
//             className="btn btn-light"
//             disabled={(page >= pageCount - 1 || pageCount === 0) || pageSize === -1}
//             onClick={() => setPage(Math.min(page + 1, pageCount - 1))}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

//     // Table rows
//     const renderTableRows = () => {
//         if (paginatedData.length === 0) {
//             return (
//                 <tr>
//                     <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px', }}>
//                         {searchTerm ? 'No matching records found' : 'No data available'}
//                     </td>
//                 </tr>
//             );
//         }
//         return paginatedData.map((row, index) => (
//             <tr key={index}>
//                 <td>{row.designationName}</td>
//                 <td>{row.designationCode}</td>
//                 <td>{row.requestDate}</td>
//                 <td>{row.requestUserName}</td>
//                 <td>
//                     {row.status ? (
//                         <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
//                     ) : (
//                         <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
//                     )}
//                 </td>
//                 <td>
//                     <div className="d-flex gap-2">
//                         <Button
//                             color="primary"
//                             className="btn-sm edit-item-btn"
//                             onClick={() => updateRow(row)}
//                         >
//                             <i className="ri-edit-2-line"></i>
//                         </Button>
//                     </div>
//                 </td>
//             </tr>
//         ));
//     };

//     // Update row handler
//     const updateRow = (item) => {
//         setedit_update(true);
//         setedit_items(item);
//         setbuttonval('Update Designation');
//         setSubButtonval('Update');
//         setChecked(!item.status);
//         setCheckedText(item.status ? 'Active' : 'InActive');
//         setmodal_list(true);
//     };

//     // Form validation
//     const validation = useFormik({
//         enableReinitialize: true,
//         initialValues: {
//             designationId: edit_items.designationId || "",
//             designationName: edit_items.designationName || "",
//             designationCode: edit_items.designationCode || "",
//             isDisabled: false,
//             requestUserName: username
//         },
//         validationSchema: Yup.object({
//             designationName: Yup.string().required("DesignationName is required"),
//             designationCode: Yup.string().required("DesignationCode is required"),
//         }),
//         onSubmit: async (values) => {
//             try {
//                 let response;
//                 if (edit_update) {
//                     response = await putUpdateDesignation({
//                         designationId: edit_items.designationId,
//                         designationName: values.designationName,
//                         designationCode: values.designationCode,
//                         isDisabled: !checked,
//                         requestUserName: username
//                     });
//                 } else {
//                     response = await postCreateDesignation({
//                         designationName: values.designationName,
//                         designationCode: values.designationCode,
//                         isDisabled: false,
//                         requestUserName: username
//                     });
//                 }

//                 if (response.responseStatusCode === '100') {
//                     setErrorModal(true);
//                     setResponse(response.responseStatusCodeGUIDisplay);
//                 } else {
//                     setSuccessModal(true);
//                     setResponse(response.responseStatusCodeGUIDisplay);
//                 }

//                 tog_list();
//                 getOnLoadingData();
//             } catch (error) {
//                 setErrorModal(true);
//                 setResponse("An error occurred while processing your request");
//             }
//         }
//     });

//     // Status toggle handler
//     const handleChange = () => {
//         setChecked(!checked);
//         setCheckedText(checked ? 'InActive' : 'Active');
//     };

//     // Modal toggle
//     const toggleModal = () => {
//         setmodal_list(!modal_list);
//         if (!modal_list) {
//             setedit_update(false);
//             setedit_items([]);
//             setbuttonval('Add Designation');
//             setSubButtonval('Save');
//             validation.resetForm();
//         }
//     };

//     // Alias for modal closing in submit
//     const tog_list = () => toggleModal();

//     // Set page title
//     useEffect(() => {
//         const obj = JSON.parse(sessionStorage.getItem("authUser"));
//         const menuPage = JSON.parse(obj?.user?.menuPage || "[]");
//         const applicationCode = obj?.user?.applicationCode;
//         const currentPath = window.location.pathname;
//         const currentPageLabel = findLabelByLink(menuPage, currentPath) || "Page";
//         document.title = `${currentPageLabel} | ${applicationCode}`;
//     }, []);

//     return (
//         <React.Fragment>
//             <ToastContainer closeButton={false} position="top-right" />
//             <SuccessModal
//                 show={successModal}
//                 onCloseClick={() => setSuccessModal(false)}
//                 successMsg={response}
//             />
//             <ErrorModal
//                 show={errorModal}
//                 onCloseClick={() => setErrorModal(false)}
//                 successMsg={response}
//             />

//             <div className="page-content">
//                 <Container fluid>
//                     <BreadCrumb title="Designation Creation" pageTitle="Designation" />

//                     <Row>
//                         <Col lg={12}>
//                             <Card>
//                                 <CardHeader className="bg-primary text-white p-3">
//                                     <Row className="g-4 align-items-center">
//                                         <Col className="d-flex align-items-center">
//                                             <h4 className="mb-0 card-title text-white">
//                                                 Designation Creation
//                                             </h4>
//                                         </Col>
//                                     </Row>
//                                 </CardHeader>

//                                 <CardBody>
//                                     <Row className="g-4 mb-3">
//                                         <Col sm={4}>
//                                             <div className="search-box ms-2">
//                                                 <Input
//                                                     type="text"
//                                                     className="form-control"
//                                                     placeholder="Search..."
//                                                     value={searchTerm}
//                                                     onChange={handleSearch}
//                                                 />
//                                                 <i className="ri-search-line search-icon"></i>
//                                             </div>
//                                         </Col>
//                                         <Col sm className="d-flex justify-content-sm-end">
//                                             <Button
//                                                 color="primary"
//                                                 className="add-btn"
//                                                 onClick={toggleModal}
//                                             >
//                                                 <i className="ri-add-fill me-1 align-bottom"></i> Add 
//                                             </Button>
//                                         </Col>
//                                     </Row>

//                                     <Row>
//                                         <Col lg={12}>
//                                             <div className="table-responsive">
//                                                 <table className="table table-bordered table-hover mb-0">
//                                                     <thead className="table-light">
//                                                         {renderTableHeader()}
//                                                     </thead>
//                                                     <tbody>
//                                                         {renderTableRows()}
//                                                     </tbody>
//                                                 </table>
//                                             </div>

//                                             {renderPagination()}
//                                         </Col>
//                                     </Row>
//                                 </CardBody>
//                             </Card>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>

//            {/* Add Modal */}
//             <Modal isOpen={modal_list} toggle={() => { tog_list(); }} centered >
//                 <ModalHeader className="bg-primary text-white p-3" toggle={() => {
//                     tog_list();
//                 }}>
//                     <span className="modal-title text-white">
//                         {buttonval}
//                     </span>
//                 </ModalHeader>
//                 <form className="tablelist-form"
//                     onSubmit={(e) => {
//                         e.preventDefault();
//                         validation.handleSubmit();
//                         return false;
//                     }}>
//                     <ModalBody>
//                         <div className="mb-3 fw text-muted">
//                             Please fill mandatory information below <span className="text-danger">*</span>
//                         </div>

//                         <Row>
//                             <Col md={12}>
//                                 <FormGroup className="mb-3">
//                                     <Label>DesignationName <span className="text-danger">*</span></Label>
//                                     <Input
//                                         name="designationName"
//                                         placeholder="Enter DesignationName"
//                                         type="text"
//                                         maxLength={75}
//                                         value={validation.values.designationName || ""}
//                                         onChange={validation.handleChange}
//                                         onBlur={validation.handleBlur}
//                                         invalid={validation.touched.designationName && validation.errors.designationName ? true : false}
//                                     />
//                                     {validation.touched.designationName && validation.errors.designationName ? (
//                                         <FormFeedback>{validation.errors.designationName}</FormFeedback>
//                                     ) : null}
//                                 </FormGroup>
//                             </Col>
//                         </Row>

//                         <Row>
//                             <Col md={12}>
//                                 <FormGroup className="mb-3">
//                                     <Label>DesignationCode <span className="text-danger">*</span></Label>
//                                     <Input
//                                         name="designationCode"
//                                         placeholder="Enter DesignationCode"
//                                         type="text"
//                                         maxLength={75}
//                                         value={validation.values.designationCode || ""}
//                                         onChange={validation.handleChange}
//                                         onBlur={validation.handleBlur}
//                                         invalid={validation.touched.designationCode && validation.errors.designationCode ? true : false}
//                                     />
//                                     {validation.touched.designationCode && validation.errors.designationCode ? (
//                                         <FormFeedback>{validation.errors.designationCode}</FormFeedback>
//                                     ) : null}
//                                 </FormGroup>
//                             </Col>
//                         </Row>

//                     {edit_update && (
//                             <Row>
//                                 <Col md={12}>
//                                     <FormGroup className="mb-3">
//                                         <Label>Status</Label>
//                                         <div className="d-flex align-items-center gap-2">
//                                             <div className="form-check form-switch">
//                                                 <Input
//                                                     type="switch"
//                                                     className="form-check-input"
//                                                     checked={checked}
//                                                     onChange={handleChange}
//                                                     style={{ height: "24px", width: "46px" }}
//                                                 />
//                                             </div>
//                                             {checked ? (
//                                                 <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
//                                             ) : (
//                                                 <span className="badge bg-danger-subtle text-danger text-uppercase">InActive</span>
//                                             )}
//                                         </div>
//                                     </FormGroup>
//                                 </Col>
//                             </Row>
//                         )}
//                     </ModalBody>

//                     <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
//                         {/* <Button color="light" className="me-2" onClick={() => validation.resetForm()}>
//                             Reset
//                         </Button> */}
//                         <Button color="primary" type="submit" className="me-2" id="add-btn">
//                             {subButtonval}
//                         </Button>
//                         <Button color="danger" onClick={tog_list}>
//                             Close
//                         </Button>
//                     </ModalFooter>
//                 </form>
//             </Modal>
//         </React.Fragment>
//     );
// };

// export default DesignationCreation;

// / frontend/src/components/ScannerPreview.jsx
// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";

// export default function ScannerPreview() {
//   const [scans, setScans] = useState([]);

//   useEffect(() => {
//     const socket = io("http://localhost:5000", {
//       transports: ["websocket", "polling"],
//     });

//     socket.on("new-scan-processed", (scan) => {
//       // ✅ If merged PDF → show only that, remove earlier single images
//       if (scan.pdfUrl || scan.mergedFile) {
//         setScans([{ ...scan, pdfUrl: scan.pdfUrl || scan.mergedFile }]);
//       }
//       // ✅ If single image scan → just append
//       else if (scan.imageUrl) {
//         setScans((prev) => [scan, ...prev]);
//       }
//     });

//     return () => socket.disconnect();
//   }, []);

//   return (
//     <div className="p-5 m-5">
//       <h2 className="text-xl font-bold mb-4">Scanner Preview</h2>

//       {scans.length === 0 ? (
//         <p className="text-gray-500">No scans yet…</p>
//       ) : (
//         <ul className="space-y-6">
//           {scans.map((scan, idx) => (
//             <li key={idx} className="p-4 border rounded-lg shadow bg-white">
//               <h3 className="font-semibold mb-2">{scan.fileName || "Scan"}</h3>

//               {/* ✅ Show image preview if single-side scan */}
//               {scan.imageUrl && (
//                 <img
//                   src={`http://localhost:5000${scan.imageUrl}`}
//                   alt={scan.fileName}
//                   className="rounded-lg shadow-md"
//                   style={{ maxWidth: "400px", height: "auto", display: "block" }}
//                 />
//               )}

//               {/* ✅ Show PDF preview if merged two-sided scan */}
//               {scan.pdfUrl && (
//                 <div className="mt-4">
//                   <a
//                     href={`http://localhost:5000${scan.pdfUrl}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline"
//                   >
//                     Open Merged PDF
//                   </a>

//                   <iframe
//                     src={`http://localhost:5000${scan.pdfUrl}`}
//                     style={{
//                       width: "100%",
//                       height: "500px",
//                       marginTop: "10px",
//                       border: "1px solid #ddd",
//                     }}
//                     title={scan.fileName}
//                   ></iframe>
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";

const DocumentViewer = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleViewPdf = async (documentId) => {
    try {
      setLoading(true);
      setError("");
      setPdfUrl(null);

      const response = await axios.post(
        "http://localhost:9000/backend-service/documentUpload/documentView",
        { Version_Id: documentId, flagId: 2 },
        {
          responseType: "blob", // Important
        }
      );

      // Convert blob to object URL
      const file = new Blob([response], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    } catch (err) {
      console.error("Error viewing PDF:", err);
      setError("Unable to load document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>📄 Document Viewer</h3>

      <button
        onClick={() => handleViewPdf(72)}
        disabled={loading}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : "View PDF"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {pdfUrl && (
        <div style={{ marginTop: "20px" }}>
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            width="100%"
            height="600px"
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
