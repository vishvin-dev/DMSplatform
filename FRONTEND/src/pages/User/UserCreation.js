// import React, { useState, useEffect } from 'react';
// import {
//     Container, Form, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Progress, Label, Input, FormGroup, Button
// } from "reactstrap";
// import BreadCrumb from '../../Components/Common/BreadCrumb';
// import { ToastContainer } from 'react-toastify';
// import classnames from "classnames";
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { getUserDropDowns, AllUserCreationSubmit, getAllUserDropDownss } from "../../helpers/fakebackend_helper"
// import ErrorModal from '../../Components/Common/ErrorModal';
// import SuccessModal from '../../Components/Common/SuccessModal';
// import Male from '../../assets/images/Male.jpg';
// import Female from '../../assets/images/Female.jpg';
// import None from '../../assets/images/None.jpg';
// import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"

// // MUI DatePicker imports
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { TextField } from '@mui/material';
// import dayjs from 'dayjs';

// const UserCreation = () => {
//     // State for active tab and progress
//     const [activeTab, setActiveTab] = useState(1);
//     const [passedSteps, setPassedSteps] = useState([1]);
//     const [progressBar, setProgressBar] = useState(33);
//     const [roles, setLroles] = useState([]);
//     const [section, setsection] = useState([])
//     const [subDivision, setsubDivision] = useState([]);

//     const [divisionName, setDivisionName] = useState([]);
//     const [genders, setGenders] = useState([]);
//     const [maritalStatus, setMaritalStatus] = useState([]);
//     const [response, setResponse] = useState('');
//     const [successModal, setSuccessModal] = useState(false);
//     const [errorModal, setErrorModal] = useState(false);
//     const [src, setSrc] = useState(None);
//     const [username, setUserName] = useState('');
//     const [userId, setUserId] = useState(0);
//     const [selectedGender, setSelectedGender] = useState('');
//     const [circles, setCircles] = useState([]);
//     const [selectedCircle, setSelectedCircle] = useState('');


//     // State for photo upload
//     const [imgLogoInput, setImgLogoInput] = useState('');
//     const [imgLogoData, setImgLogoData] = useState(null);
//     const [photoTouched, setPhotoTouched] = useState(false);

//     // State for dropdown visibility
//     const [showSubDivisionDropdown, setShowSubDivisionDropdown] = useState(false);
//     const [showSectionDropdown, setShowSectionDropdown] = useState(false);
//     const [selectedSubDivisions, setSelectedSubDivisions] = useState([]);
//     const [selectedSections, setSelectedSections] = useState([]);

//     const flagIdFunction = async (flagId, setState, requestUserName, div_code, sd_code, circle_code) => {
//         try {
//             const params = { flagId, requestUserName, div_code, sd_code, circle_code }
//             const response = await getAllUserDropDownss(params);
//             const options = response?.data || [];
//             console.log(`Fetched data for flag ${flagId}:`, options);
//             setState(options);
//         } catch (error) {
//             console.error(`Error fetching options for flag ${flagId}:`, error.message);
//         }
//     };

//     useEffect(() => {
//         const obj = JSON.parse(sessionStorage.getItem("authUser"));
//         const usernm = obj.user.LoginName;
//         setUserName(usernm);

//         flagIdFunction(4, setGenders, usernm);
//         flagIdFunction(5, setMaritalStatus, usernm);
//         flagIdFunction(6, setLroles, usernm);
//         flagIdFunction(7, setCircles, usernm);
//         document.title = `User Creation | DMS`;
//     }, []);

//     // Update photo when gender changes
//     useEffect(() => {
//         if (selectedGender) {
//             const selectedGenderObj = genders.find(g => g.genderId.toString() === selectedGender.toString());

//             if (selectedGenderObj) {
//                 if (selectedGenderObj.genderName.toLowerCase() === 'male') {
//                     setSrc(Male);
//                 } else if (selectedGenderObj.genderName.toLowerCase() === 'female') {
//                     setSrc(Female);
//                 } else {
//                     setSrc(None);
//                 }
//             }
//         } else {
//             setSrc(None);
//         }
//     }, [selectedGender, genders]);

//     // Form validation for Contact Information
//     const contactInfoValidation = useFormik({
//         enableReinitialize: true,
//         initialValues: {
//             firstName: '',
//             middleName: '',
//             lastName: '',
//             gender: '',
//             maritalStatus: '',
//             contactNo: '',
//             dateOfBirth: '',
//         },
//         validationSchema: Yup.object({
//             firstName: Yup.string().required("FirstName is required"),
//             lastName: Yup.string().required("LastName is required"),
//             gender: Yup.string().required("Gender is required"),
//             contactNo: Yup.string()
//                 .required("Contact Number is required")
//                 .matches(/^[0-9]+$/, "Must be only digits")
//                 .min(10, "Must be exactly 10 digits")
//                 .max(10, "Must be exactly 10 digits"),
//             dateOfBirth: Yup.date().required("DateOfBirth is required")
//         }),
//         onSubmit: (values) => {
//             console.log("Contact Info:", values);
//             toggleTab(activeTab + 1);
//         }
//     });

//     // Form validation for Office Information
//     const officeInfoValidation = useFormik({
//         enableReinitialize: true,
//         initialValues: {
//             circle: '',
//             divisionName: '',
//             sub_division: [],
//             RoleName: '',
//             section_office: [],

//         },
//         validationSchema: Yup.object({
//             circle: Yup.string().required("Circle is required"),
//             divisionName: Yup.string().required("DivisionName is required"),
//             sub_division: Yup.array()
//                 .min(1, "At least one SubDivision is required")
//                 .required("SubDivision is required"),
//             RoleName: Yup.string().required("Role Name is required"),

//         }),
//         onSubmit: (values) => {
//             console.log("Office Info:", values);
//             toggleTab(activeTab + 1);
//         }
//     });

//     // Add this function after your other handler functions
//     const getUniqueCircles = (circlesArray) => {
//         const uniqueCircles = [];
//         const seenCodes = new Set();

//         circlesArray.forEach(circle => {
//             if (!seenCodes.has(circle.circle_code)) {
//                 seenCodes.add(circle.circle_code);
//                 uniqueCircles.push(circle);
//             }
//         });

//         return uniqueCircles;
//     };

//     const handleCircleChange = async (e) => {
//         const selectedCircleCode = e.target.value;
//         setSelectedCircle(selectedCircleCode);
//         officeInfoValidation.setFieldValue('circle', selectedCircleCode);

//         // Reset division and related fields when circle changes
//         officeInfoValidation.setFieldValue('divisionName', '');
//         officeInfoValidation.setFieldValue('sub_division', []);
//         officeInfoValidation.setFieldValue('section_office', []);
//         setSelectedSubDivisions([]);
//         setSelectedSections([]);
//         setDivisionName([]);
//         setsubDivision([]);
//         setsection([]);

//         // Fetch divisions for the selected circle
//         if (selectedCircleCode) {
//             const obj = JSON.parse(sessionStorage.getItem("authUser"));
//             const usernm = obj.user.LoginName;
//             await flagIdFunction(1, setDivisionName, usernm, null, null, selectedCircleCode);
//         }
//     };


//     // Form validation for Login Information
//     const loginInfoValidation = useFormik({
//         enableReinitialize: true,
//         initialValues: {
//             email: '',
//             password: '',
//             confirmPassword: ''
//         },
//         validationSchema: Yup.object({
//             email: Yup.string().required("Email is required"),
//             password: Yup.string()
//                 .required("Password is required")
//                 .min(6, "Password must be at least 6 characters"),
//             confirmPassword: Yup.string()
//                 .required("ConfirmPassword is required")
//                 .oneOf([Yup.ref('password'), null], 'Passwords must match')
//         }),
//         onSubmit: (values) => {
//             console.log("Login Info:", values);
//             toggleTab(activeTab + 1);
//         }
//     });

//     const handleDivisionChange = async (e) => {
//         const selectedDivCode = e.target.value;

//         officeInfoValidation.setFieldValue('divisionName', selectedDivCode);

//         // Reset sub_division & section_office values
//         officeInfoValidation.setFieldValue('sub_division', []);
//         officeInfoValidation.setFieldValue('section_office', []);
//         setSelectedSubDivisions([]);
//         setSelectedSections([]);

//         // Reset touched states
//         officeInfoValidation.setFieldTouched('sub_division', false);
//         officeInfoValidation.setFieldTouched('section_office', false);

//         // Clear validation errors
//         officeInfoValidation.setErrors((prevErrors) => ({
//             ...prevErrors,
//             sub_division: '',
//             section_office: '',
//         }));

//         // Reset dropdowns
//         setsubDivision([]);
//         setsection([]);

//         if (selectedDivCode && selectedCircle) {
//             const obj = JSON.parse(sessionStorage.getItem("authUser"));
//             const usernm = obj.user.LoginName;
//             setUserName(usernm);

//             // Fetch sub_division options with circle_code
//             await flagIdFunction(2, setsubDivision, usernm, selectedDivCode, null, selectedCircle);

//             // Clear validation error again once options are loaded
//             officeInfoValidation.setErrors((prevErrors) => ({
//                 ...prevErrors,
//                 sub_division: '',
//             }));
//         }
//     };

//     const handleSubDivisionChange = async (sd_code, isChecked) => {
//         let updatedSelection;

//         if (isChecked) {
//             updatedSelection = [...selectedSubDivisions, sd_code];
//         } else {
//             updatedSelection = selectedSubDivisions.filter(id => id !== sd_code);
//         }

//         setSelectedSubDivisions(updatedSelection);

//         // Update formik value as array of CODES
//         officeInfoValidation.setFieldValue("sub_division", updatedSelection);
//         // Mark the field as touched
//         officeInfoValidation.setFieldTouched("sub_division", true);

//         // Reset sections when subdivisions change
//         setsection([]);
//         setSelectedSections([]);
//         officeInfoValidation.setFieldValue('section_office', []);
//         officeInfoValidation.setFieldTouched('section_office', false);

//         // Fetch sections only if exactly one subdivision is selected and circle is available
//         if (updatedSelection.length === 1 && selectedCircle) {
//             await flagIdFunction(3, setsection, username, null, updatedSelection[0], selectedCircle);
//         } else if (updatedSelection.length === 0) {
//             // Clear validation error when no selection
//             officeInfoValidation.setErrors((prevErrors) => ({
//                 ...prevErrors,
//                 sub_division: '',
//             }));
//         }
//     };

//     const handleSectionChange = (so_code, isChecked) => {
//         let updatedSelection;

//         if (isChecked) {
//             updatedSelection = [...selectedSections, so_code];
//         } else {
//             updatedSelection = selectedSections.filter(id => id !== so_code);
//         }

//         setSelectedSections(updatedSelection);

//         // Update formik value as array of CODES
//         officeInfoValidation.setFieldValue("section_office", updatedSelection);
//         // Mark the field as touched
//         officeInfoValidation.setFieldTouched("section_office", true);

//         if (updatedSelection.length === 0) {
//             // Clear validation error when no selection
//             officeInfoValidation.setErrors((prevErrors) => ({
//                 ...prevErrors,
//                 section_office: '',
//             }));
//         }
//     };

//     const toggleSubDivisionDropdown = () => {
//         setShowSubDivisionDropdown(!showSubDivisionDropdown);
//         setShowSectionDropdown(false);
//         // Mark as touched when dropdown is opened
//         officeInfoValidation.setFieldTouched('sub_division', true);
//     };

//     const toggleSectionDropdown = () => {
//         setShowSectionDropdown(!showSectionDropdown);
//         setShowSubDivisionDropdown(false);
//         // Mark as touched when dropdown is opened
//         officeInfoValidation.setFieldTouched('section_office', true);
//     };

//     // Close dropdowns when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (!event.target.closest('.dropdown')) {
//                 setShowSubDivisionDropdown(false);
//                 setShowSectionDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     useEffect(() => {
//         // Clear subdivision error when valid selection is made
//         if (selectedSubDivisions.length > 0 && officeInfoValidation.errors.sub_division) {
//             officeInfoValidation.setErrors((prevErrors) => ({
//                 ...prevErrors,
//                 sub_division: '',
//             }));
//         }

//         // Clear section error when valid selection is made (and only one subdivision is selected)
//         if (selectedSubDivisions.length === 1 && selectedSections.length > 0 && officeInfoValidation.errors.section_office) {
//             officeInfoValidation.setErrors((prevErrors) => ({
//                 ...prevErrors,
//                 section_office: '',
//             }));
//         }
//     }, [selectedSubDivisions, selectedSections, officeInfoValidation]);

//     function formatFileSize(bytes, decimalPoint) {
//         if (bytes == 0) return '0 Bytes';
//         var k = 1000,
//             dm = decimalPoint || 2,
//             sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
//             i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, 1)).toFixed(dm));
//     }

//     const inputFileChanged = (e) => {
//         setPhotoTouched(true);
//         if (window.FileReader) {
//             let file = e.target.files[0]
//             const fileExtension = file.name.split(".").at(-1);
//             const allowedFileTypes = ["jpg", "png", "jpeg"];
//             if (!allowedFileTypes.includes(fileExtension)) {
//                 setResponse("File does not support. You must use .png, jpeg or .jpg ");
//                 setErrorModal(true);
//                 return false;
//             }
//             let fileSize = formatFileSize(file.size, 2);
//             if (fileSize <= 200) {
//                 setErrorModal(false);
//                 let reader = new FileReader()
//                 reader.onload = (r) => {
//                     setSrc(r.target.result)
//                 }
//                 reader.readAsDataURL(file);
//                 setImgLogoData(file);
//             } else {
//                 setResponse('Sorry, please upload image will be less than 200kB');
//                 setErrorModal(true);
//             }
//         } else {
//             setResponse('Sorry, your browser doesn\'t support for preview');
//             setErrorModal(true);
//         }
//     }

//     // Toggle between tabs
//     function toggleTab(tab) {
//         if (activeTab !== tab) {
//             var modifiedSteps = [...passedSteps, tab];
//             if (tab >= 1 && tab <= 3) {
//                 var process = tab * 33.33;
//                 setProgressBar(process);
//                 setActiveTab(tab);
//                 setPassedSteps(modifiedSteps);
//             }
//         }
//     }

//     // Handle gender change
//     const handleGenderChange = (e) => {
//         const genderId = e.target.value;
//         setSelectedGender(genderId);
//         contactInfoValidation.handleChange(e);
//     }

//     const handleFinalSubmit = async () => {
//         setPhotoTouched(true);

//         // Manually mark all fields as touched to trigger validation
//         Object.keys(contactInfoValidation.values).forEach(key => {
//             contactInfoValidation.setFieldTouched(key, true);
//         });
//         Object.keys(officeInfoValidation.values).forEach(key => {
//             officeInfoValidation.setFieldTouched(key, true);
//         });
//         Object.keys(loginInfoValidation.values).forEach(key => {
//             loginInfoValidation.setFieldTouched(key, true);
//         });

//         // Validate all forms
//         const contactErrors = await contactInfoValidation.validateForm();
//         const officeErrors = await officeInfoValidation.validateForm();
//         const loginErrors = await loginInfoValidation.validateForm();

//         if (Object.keys(contactErrors).length > 0 ||
//             Object.keys(officeErrors).length > 0 ||
//             Object.keys(loginErrors).length > 0) {
//             setResponse("Please correct all validation errors before submitting.");
//             setErrorModal(true);
//             return;
//         }

//         // Photo validation
//         if (!imgLogoData) {
//             setResponse("Please select a profile photo");
//             setErrorModal(true);
//             return;
//         }

//         // Create zoneAccess array
//         const zoneAccess = [];
//         const divCode = officeInfoValidation.values.divisionName;
//         const subDivisions = officeInfoValidation.values.sub_division;
//         const sections = officeInfoValidation.values.section_office;
//         const circleCode = officeInfoValidation.values.circle;

//         // If only one subdivision is selected, create entries for each section
//         if (subDivisions.length === 1 && sections.length > 0) {
//             sections.forEach((sectionCode, index) => {
//                 zoneAccess.push({
//                     div_code: divCode,
//                     sd_code: subDivisions[0],
//                     so_code: sectionCode,
//                     circle: circleCode, 
//                     zone: "Kalaburagi"    // Hardcoded
//                 });
//             });
//         } else {
//             // If multiple subdivisions or no sections, create entries for each subdivision
//             subDivisions.forEach((subDivCode, index) => {
//                 zoneAccess.push({
//                     div_code: divCode,
//                     sd_code: subDivCode,
//                     so_code: sections[index] || "", // Use corresponding section if available
//                     circle: circleCode, 
//                     zone: "Kalaburagi"    // Hardcoded 
//                 });
//             });
//         }

//         // Create the main data object
//         const userData = {
//             firstName: contactInfoValidation.values.firstName,
//             middleName: contactInfoValidation.values.middleName || '',
//             lastName: contactInfoValidation.values.lastName,
//             projectName: "DMS",
//             dateOfBirth: contactInfoValidation.values.dateOfBirth,
//             phoneNumber: contactInfoValidation.values.contactNo,
//             maritalStatusId: contactInfoValidation.values.maritalStatus ? parseInt(contactInfoValidation.values.maritalStatus) : null,
//             genderId: parseInt(contactInfoValidation.values.gender),
//             email: loginInfoValidation.values.email,
//             password: loginInfoValidation.values.password,
//             isForcePasswordChange: 1,
//             roleId: parseInt(officeInfoValidation.values.RoleName),
//             loginName: username,
//             photo: null,
//             isDisabled: 0,
//             requestUserName: username
//         };

//         // Create FormData
//         const formData = new FormData();

//         // Append all user data fields
//         Object.keys(userData).forEach(key => {
//             formData.append(key, userData[key]);
//         });

//         // Append zoneAccess fields with array indices - UPDATED FIELD NAMES
//         zoneAccess.forEach((access, index) => {
//             formData.append(`zoneAccess[${index}][div_code]`, access.div_code);
//             formData.append(`zoneAccess[${index}][sd_code]`, access.sd_code);
//             formData.append(`zoneAccess[${index}][so_code]`, access.so_code);
//             formData.append(`zoneAccess[${index}][circle_code]`, access.circle); // Changed from 'circle' to 'circle_code'
//             formData.append(`zoneAccess[${index}][zone_code]`, access.zone);     // Changed from 'zone' to 'zone_code'
//         });

//         // Append the photo file
//         formData.append('photo', imgLogoData);

//         // Log the form data for debugging
//         for (let pair of formData.entries()) {
//             console.log(pair[0] + ": " + pair[1]);
//         }

//         try {
//             const response = await AllUserCreationSubmit(formData);
//             const result = response.data[0];

//             if (result.status !== 'success') {
//                 setResponse(result.message || "An error occurred.");
//                 setSuccessModal(false);
//                 setErrorModal(true);
//             } else {
//                 setResponse(result.message || "User created successfully.");
//                 setSuccessModal(true);
//                 setErrorModal(false);

//                 // Reset all forms
//                 contactInfoValidation.resetForm();
//                 officeInfoValidation.resetForm();
//                 loginInfoValidation.resetForm();

//                 // Reset all states
//                 setImgLogoInput('');
//                 setImgLogoData(null);
//                 setSrc(None);
//                 setSelectedGender('');
//                 setSelectedSubDivisions([]);
//                 setSelectedSections([]);
//                 setSelectedCircle('');
//                 setShowSubDivisionDropdown(false);
//                 setShowSectionDropdown(false);
//                 setActiveTab(1);
//                 setProgressBar(33);
//                 setPassedSteps([1]);
//                 setPhotoTouched(false);

//                 // Reset dropdown data
//                 const obj = JSON.parse(sessionStorage.getItem("authUser"));
//                 const usernm = obj.user.LoginName;
//                 setsubDivision([]);
//                 setsection([]);
//                 setCircles([]);
//             }
//         } catch (error) {
//             console.error("Final submit error:", error);
//             setResponse(error.response?.data?.message || "Server error occurred. Please try again.");
//             setSuccessModal(false);
//             setErrorModal(true);
//         }
//     };
//     return (
//         <React.Fragment>
//             <ToastContainer closeButton={false} />
//             {successModal && (
//                 <SuccessModal
//                     show={true}
//                     onCloseClick={() => setSuccessModal(false)}
//                     successMsg={response}
//                 />
//             )}

//             {errorModal && (
//                 <ErrorModal
//                     show={true}
//                     onCloseClick={() => setErrorModal(false)}
//                     errorMsg={response}
//                 />
//             )}
//             <div className="page-content">
//                 <Container fluid>
//                     <BreadCrumb pageTitle="User Creation" />

//                     <Row>
//                         <Col xl="12">
//                             <div className="live-preview">
//                                 <Progress className="progress progress-xl mb-3" color="primary" value={progressBar}>
//                                     {Math.round(progressBar)}%
//                                 </Progress>
//                             </div>
//                             <Card>
//                                 <CardBody className="checkout-tab">
//                                     <Form action="#">
//                                         <div className="nav-pills nav-justified mt-n3 mx-n3 mb-3">
//                                             <Nav
//                                                 className="nav nav-pills arrow-navtabs nav-primary bg-light mb-3"
//                                                 role="tablist"
//                                             >
//                                                 <NavItem role="presentation">
//                                                     <NavLink
//                                                         className={classnames({
//                                                             active: activeTab === 1,
//                                                             done: (activeTab <= 3 && activeTab >= 0)
//                                                         }, "p-3 fs-15")}
//                                                         onClick={(e) => e.preventDefault()}

//                                                     >
//                                                         <i className="ri-user-line fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
//                                                         Contact Information
//                                                     </NavLink>
//                                                 </NavItem>
//                                                 <NavItem role="presentation">
//                                                     <NavLink
//                                                         className={classnames({
//                                                             active: activeTab === 2,
//                                                             done: activeTab <= 3 && activeTab > 1
//                                                         }, "p-3 fs-15")}
//                                                         onClick={(e) => e.preventDefault()}
//                                                     >
//                                                         <i className="ri-home-office-fill fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
//                                                         Office Information
//                                                     </NavLink>
//                                                 </NavItem>
//                                                 <NavItem role="presentation">
//                                                     <NavLink
//                                                         className={classnames({
//                                                             active: activeTab === 3,
//                                                             done: activeTab <= 3 && activeTab > 2
//                                                         }, "p-3 fs-15")}
//                                                         onClick={(e) => e.preventDefault()}
//                                                     >
//                                                         <i className="ri-lock-line"></i>
//                                                         Login Information
//                                                     </NavLink>
//                                                 </NavItem>
//                                             </Nav>
//                                         </div>

//                                         <TabContent activeTab={activeTab}>
//                                             {/* Contact Information Tab */}
//                                             <TabPane tabId={1}>
//                                                 <div>
//                                                     <h5 className="mb-1">Contact Information</h5>
//                                                     <p className="text-muted mb-4">
//                                                         Please fill all mandatory information below <span className="text-danger">*</span>
//                                                     </p>
//                                                 </div>

//                                                 <Row>
//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>FirstName<span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 name="firstName"
//                                                                 type="text"
//                                                                 placeholder="FirstName"
//                                                                 onChange={contactInfoValidation.handleChange}
//                                                                 onBlur={contactInfoValidation.handleBlur}
//                                                                 value={contactInfoValidation.values.firstName}
//                                                                 invalid={
//                                                                     contactInfoValidation.touched.firstName &&
//                                                                     contactInfoValidation.errors.firstName
//                                                                 }
//                                                             />
//                                                             {contactInfoValidation.touched.firstName && contactInfoValidation.errors.firstName ? (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {contactInfoValidation.errors.firstName}
//                                                                 </div>
//                                                             ) : null}
//                                                         </FormGroup>
//                                                     </Col>
//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>MiddleName</Label>
//                                                             <Input
//                                                                 name="middleName"
//                                                                 type="text"
//                                                                 placeholder="MiddleName"
//                                                                 onChange={contactInfoValidation.handleChange}
//                                                                 onBlur={contactInfoValidation.handleBlur}
//                                                                 value={contactInfoValidation.values.middleName}
//                                                             />
//                                                         </FormGroup>
//                                                     </Col>
//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>LastName<span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 name="lastName"
//                                                                 type="text"
//                                                                 placeholder="LastName"
//                                                                 onChange={contactInfoValidation.handleChange}
//                                                                 onBlur={contactInfoValidation.handleBlur}
//                                                                 value={contactInfoValidation.values.lastName}
//                                                                 invalid={
//                                                                     contactInfoValidation.touched.lastName &&
//                                                                     contactInfoValidation.errors.lastName
//                                                                 }
//                                                             />
//                                                             {contactInfoValidation.touched.lastName && contactInfoValidation.errors.lastName ? (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {contactInfoValidation.errors.lastName}
//                                                                 </div>
//                                                             ) : null}
//                                                         </FormGroup>
//                                                     </Col>
//                                                 </Row>

//                                                 <Row>
//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>Gender<span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 type="select"
//                                                                 name="gender"
//                                                                 onChange={handleGenderChange}
//                                                                 onBlur={contactInfoValidation.handleBlur}
//                                                                 value={contactInfoValidation.values.gender}
//                                                                 invalid={
//                                                                     contactInfoValidation.touched.gender &&
//                                                                     contactInfoValidation.errors.gender
//                                                                 }
//                                                             >
//                                                                 <option value="">Select Gender</option>
//                                                                 {genders.map((gender) => (
//                                                                     <option key={gender.genderId} value={gender.genderId}>
//                                                                         {gender.genderName}
//                                                                     </option>
//                                                                 ))}
//                                                             </Input>

//                                                             {contactInfoValidation.touched.gender && contactInfoValidation.errors.gender ? (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {contactInfoValidation.errors.gender}
//                                                                 </div>
//                                                             ) : null}
//                                                         </FormGroup>
//                                                     </Col>
//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>Marital Status</Label>
//                                                             <Input
//                                                                 type="select"
//                                                                 name="maritalStatus"
//                                                                 onChange={contactInfoValidation.handleChange}
//                                                                 onBlur={contactInfoValidation.handleBlur}
//                                                                 value={contactInfoValidation.values.maritalStatus}
//                                                                 invalid={
//                                                                     contactInfoValidation.touched.maritalStatus &&
//                                                                     contactInfoValidation.errors.maritalStatus
//                                                                 }
//                                                             >
//                                                                 <option value="">Select Marital Status</option>
//                                                                 {maritalStatus.map((status) => (
//                                                                     <option key={status.maritalStatusName} value={status.maritalStatusName}>
//                                                                         {status.maritalStatusCode}
//                                                                     </option>
//                                                                 ))}
//                                                             </Input>
//                                                         </FormGroup>

//                                                     </Col>
//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>ContactNo<span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 name="contactNo"
//                                                                 type="text"
//                                                                 placeholder="Contact No"
//                                                                 onChange={contactInfoValidation.handleChange}
//                                                                 onBlur={contactInfoValidation.handleBlur}
//                                                                 value={contactInfoValidation.values.contactNo}
//                                                                 invalid={
//                                                                     contactInfoValidation.touched.contactNo &&
//                                                                     contactInfoValidation.errors.contactNo
//                                                                 }
//                                                             />
//                                                             {contactInfoValidation.touched.contactNo && contactInfoValidation.errors.contactNo ? (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {contactInfoValidation.errors.contactNo}
//                                                                 </div>
//                                                             ) : null}
//                                                         </FormGroup>
//                                                     </Col>
//                                                 </Row>

//                                                 <Row>
//                                                     <div style={{ width: '320px' }}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label className="form-label required" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
//                                                                 DateOfBirth <span className="text-danger">*</span>
//                                                             </Label>
//                                                             <LocalizationProvider dateAdapter={AdapterDayjs}>
//                                                                 <DatePicker
//                                                                     format="DD-MM-YYYY"
//                                                                     value={
//                                                                         contactInfoValidation.values.dateOfBirth
//                                                                             ? dayjs(contactInfoValidation.values.dateOfBirth)
//                                                                             : null
//                                                                     }
//                                                                     onChange={(newValue) =>
//                                                                         contactInfoValidation.setFieldValue(
//                                                                             'dateOfBirth',
//                                                                             newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
//                                                                         )
//                                                                     }
//                                                                     disableFuture
//                                                                     renderInput={(params) => (
//                                                                         <TextField
//                                                                             {...params}
//                                                                             name="dateOfBirth"
//                                                                             size="small"
//                                                                             fullWidth
//                                                                             error={Boolean(
//                                                                                 contactInfoValidation.touched.dateOfBirth &&
//                                                                                 contactInfoValidation.errors.dateOfBirth
//                                                                             )}
//                                                                             helperText={
//                                                                                 contactInfoValidation.touched.dateOfBirth &&
//                                                                                     contactInfoValidation.errors.dateOfBirth
//                                                                                     ? contactInfoValidation.errors.dateOfBirth
//                                                                                     : ''
//                                                                             }
//                                                                             sx={{
//                                                                                 mt: 0.5,
//                                                                                 mb: 0,
//                                                                                 '& .MuiInputBase-root': {
//                                                                                     borderRadius: '6px',
//                                                                                     fontSize: '0.85rem',
//                                                                                     height: '32px',
//                                                                                     paddingTop: '4px',
//                                                                                     paddingBottom: '4px',
//                                                                                 },
//                                                                                 '& .MuiOutlinedInput-notchedOutline': {
//                                                                                     borderColor: '#ccc',
//                                                                                 },
//                                                                             }}
//                                                                         />
//                                                                     )}
//                                                                 />
//                                                             </LocalizationProvider>

//                                                         </FormGroup>
//                                                     </div>
//                                                 </Row>

//                                                 <div className="d-flex align-items-start gap-3 mt-4">
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-primary btn-label right ms-auto nexttab"
//                                                         onClick={(e) => {
//                                                             e.preventDefault();
//                                                             contactInfoValidation.handleSubmit();
//                                                         }}
//                                                     >
//                                                         <i className="ri-home-office-line label-icon align-middle fs-16 ms-2"></i>
//                                                         Proceed to Office Information
//                                                     </button>
//                                                 </div>
//                                             </TabPane>

//                                             {/* Office Information Tab */}
//                                             <TabPane tabId={2}>
//                                                 <div>
//                                                     <h5 className="mb-1">Office Information</h5>
//                                                     <p className="text-muted mb-4">
//                                                         Please fill all mandatory information below <span className="text-danger">*</span>
//                                                     </p>
//                                                 </div>

//                                                 <Row>

//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>Circle <span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 type="select"
//                                                                 name="circle"
//                                                                 className="form-select"
//                                                                 onChange={handleCircleChange}
//                                                                 onBlur={officeInfoValidation.handleBlur}
//                                                                 value={officeInfoValidation.values.circle}
//                                                                 invalid={officeInfoValidation.touched.circle && !!officeInfoValidation.errors.circle}
//                                                             >
//                                                                 <option value="">Select Circle</option>
//                                                                 {getUniqueCircles(circles).map((circle) => (
//                                                                     <option key={circle.circle_code} value={circle.circle_code}>
//                                                                         {circle.circle}
//                                                                     </option>
//                                                                 ))}
//                                                             </Input>
//                                                             {officeInfoValidation.touched.circle && officeInfoValidation.errors.circle && (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {officeInfoValidation.errors.circle}
//                                                                 </div>
//                                                             )}
//                                                         </FormGroup>
//                                                     </Col>

//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>DivisionName <span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 type="select"
//                                                                 name="divisionName"
//                                                                 className="form-select"
//                                                                 onChange={handleDivisionChange}
//                                                                 onBlur={officeInfoValidation.handleBlur}
//                                                                 value={officeInfoValidation.values.divisionName}
//                                                                 invalid={officeInfoValidation.touched.divisionName && !!officeInfoValidation.errors.divisionName}
//                                                             >
//                                                                 <option value="">Select Division</option>
//                                                                 {divisionName.map((division) => (
//                                                                     <option key={division.div_code} value={division.div_code}>
//                                                                         {division.division}
//                                                                     </option>
//                                                                 ))}
//                                                             </Input>
//                                                             {officeInfoValidation.touched.divisionName && officeInfoValidation.errors.divisionName && (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {officeInfoValidation.errors.divisionName}
//                                                                 </div>
//                                                             )}
//                                                         </FormGroup>
//                                                     </Col>

//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>SubDivision <span className="text-danger">*</span></Label>
//                                                             <div className="dropdown">
//                                                                 <button
//                                                                     className="form-select text-start"
//                                                                     type="button"
//                                                                     onClick={toggleSubDivisionDropdown}
//                                                                     style={{
//                                                                         position: 'relative',
//                                                                         backgroundColor: officeInfoValidation.touched.sub_division && officeInfoValidation.errors.sub_division
//                                                                             ? '#fff6f6'
//                                                                             : '#fff',
//                                                                         borderColor: officeInfoValidation.touched.sub_division && officeInfoValidation.errors.sub_division
//                                                                             ? '#e63757'
//                                                                             : '#ced4da'
//                                                                     }}
//                                                                 >
//                                                                     {selectedSubDivisions.length > 0
//                                                                         ? `${selectedSubDivisions.length} selected`
//                                                                         : 'Select Sub Division'}
//                                                                     <span className="position-absolute top-50 end-0 translate-middle-y me-2">
//                                                                     </span>
//                                                                 </button>

//                                                                 {showSubDivisionDropdown && (
//                                                                     <div
//                                                                         className="dropdown-menu show w-100 p-2"
//                                                                         style={{
//                                                                             maxHeight: '200px',
//                                                                             overflowY: 'auto',
//                                                                             zIndex: 1000
//                                                                         }}
//                                                                     >
//                                                                         {subDivision.map((subdivision) => (
//                                                                             <div key={subdivision.sd_code} className="form-check">
//                                                                                 <Input
//                                                                                     className="form-check-input"
//                                                                                     type="checkbox"
//                                                                                     id={`subdiv-${subdivision.sd_code}`}
//                                                                                     checked={selectedSubDivisions.includes(subdivision.sd_code)}
//                                                                                     onChange={(e) => {
//                                                                                         handleSubDivisionChange(subdivision.sd_code, e.target.checked);
//                                                                                         officeInfoValidation.setFieldTouched('sub_division', true);
//                                                                                     }}
//                                                                                 />
//                                                                                 <Label className="form-check-label w-100" htmlFor={`subdiv-${subdivision.sd_code}`}>
//                                                                                     {subdivision.sub_division}
//                                                                                 </Label>
//                                                                             </div>
//                                                                         ))}
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                             {officeInfoValidation.touched.sub_division && officeInfoValidation.errors.sub_division && (
//                                                                 <div className="text-danger" style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
//                                                                     {officeInfoValidation.errors.sub_division}
//                                                                 </div>
//                                                             )}
//                                                         </FormGroup>
//                                                     </Col>


//                                                 </Row>

//                                                 <Row>
//                                                     {selectedSubDivisions.length === 1 && (
//                                                         <Col md={4}>
//                                                             <FormGroup className="mb-3">
//                                                                 <Label>SectionOffice <span className="text-danger"></span></Label>
//                                                                 <div className="dropdown">
//                                                                     <button
//                                                                         className="form-select text-start"
//                                                                         type="button"
//                                                                         onClick={toggleSectionDropdown}
//                                                                         style={{
//                                                                             position: 'relative',
//                                                                             backgroundColor: officeInfoValidation.touched.section_office && officeInfoValidation.errors.section_office
//                                                                                 ? '#fff6f6'
//                                                                                 : '#fff',
//                                                                             borderColor: officeInfoValidation.touched.section_office && officeInfoValidation.errors.section_office
//                                                                                 ? '#e63757'
//                                                                                 : '#ced4da'
//                                                                         }}
//                                                                     >
//                                                                         {selectedSections.length > 0
//                                                                             ? `${selectedSections.length} selected`
//                                                                             : 'Select Section'}
//                                                                         <span className="position-absolute top-50 end-0 translate-middle-y me-2">
//                                                                         </span>
//                                                                     </button>

//                                                                     {showSectionDropdown && (
//                                                                         <div
//                                                                             className="dropdown-menu show w-100 p-2"
//                                                                             style={{
//                                                                                 maxHeight: '200px',
//                                                                                 overflowY: 'auto',
//                                                                                 zIndex: 1000
//                                                                             }}
//                                                                         >
//                                                                             {section.map((sectionItem) => (
//                                                                                 <div key={sectionItem.so_code} className="form-check">
//                                                                                     <Input
//                                                                                         className="form-check-input"
//                                                                                         type="checkbox"
//                                                                                         id={`section-${sectionItem.so_code}`}
//                                                                                         checked={selectedSections.includes(sectionItem.so_code)}
//                                                                                         onChange={(e) => {
//                                                                                             handleSectionChange(sectionItem.so_code, e.target.checked);
//                                                                                             officeInfoValidation.setFieldTouched('section_office', true);
//                                                                                         }}
//                                                                                     />
//                                                                                     <Label className="form-check-label w-100" htmlFor={`section-${sectionItem.so_code}`}>
//                                                                                         {sectionItem.section_office}
//                                                                                     </Label>
//                                                                                 </div>
//                                                                             ))}
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                                 {officeInfoValidation.touched.section_office && officeInfoValidation.errors.section_office && (
//                                                                     <div className="text-danger" style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
//                                                                         {officeInfoValidation.errors.section_office}
//                                                                     </div>
//                                                                 )}
//                                                             </FormGroup>
//                                                         </Col>
//                                                     )}

//                                                     <Col md={4}>
//                                                         <FormGroup className="mb-3">
//                                                             <Label>RoleName<span className="text-danger">*</span></Label>
//                                                             <Input
//                                                                 type="select"
//                                                                 name="RoleName"
//                                                                 className="form-select"
//                                                                 onChange={officeInfoValidation.handleChange}
//                                                                 onBlur={officeInfoValidation.handleBlur}
//                                                                 value={officeInfoValidation.values.RoleName}
//                                                                 invalid={
//                                                                     officeInfoValidation.touched.RoleName &&
//                                                                     officeInfoValidation.errors.RoleName
//                                                                 }
//                                                             >
//                                                                 <option value="">Select Role</option>
//                                                                 {roles.map((role) => (
//                                                                     <option key={role.Role_Id} value={role.Role_Id}>
//                                                                         {role.RoleName}
//                                                                     </option>
//                                                                 ))}
//                                                             </Input>
//                                                             {officeInfoValidation.touched.RoleName && officeInfoValidation.errors.RoleName ? (
//                                                                 <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                     {officeInfoValidation.errors.RoleName}
//                                                                 </div>
//                                                             ) : null}
//                                                         </FormGroup>
//                                                     </Col>
//                                                 </Row>

//                                                 <div className="d-flex align-items-start gap-3 mt-4">
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-light btn-label previestab"
//                                                         onClick={() => toggleTab(1)}
//                                                     >
//                                                         <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
//                                                         Back to Contact Information
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-primary btn-label right ms-auto nexttab"
//                                                         onClick={(e) => {
//                                                             e.preventDefault();
//                                                             officeInfoValidation.handleSubmit();
//                                                         }}
//                                                     >
//                                                         <i className="ri-lock-line label-icon align-middle fs-16 ms-2"></i>
//                                                         Proceed to Login Information
//                                                     </button>
//                                                 </div>
//                                             </TabPane>


//                                             {/* Login Information Tab */}
//                                             <TabPane tabId={3}>
//                                                 <div>
//                                                     <h5 className="mb-1">Login Information</h5>
//                                                     <p className="text-muted mb-4">
//                                                         Please fill all mandatory information below <span className="text-danger">*</span>
//                                                     </p>
//                                                 </div>

//                                                 <Row>
//                                                     <Col md={6}>
//                                                         <Row>
//                                                             <Col md={10}>
//                                                                 <FormGroup className="mb-3">
//                                                                     <Label>Email <span className="text-danger">*</span></Label>
//                                                                     <Input
//                                                                         name="email"
//                                                                         type="email"
//                                                                         placeholder="Email"
//                                                                         onChange={loginInfoValidation.handleChange}
//                                                                         onBlur={loginInfoValidation.handleBlur}
//                                                                         value={loginInfoValidation.values.email}
//                                                                         invalid={
//                                                                             loginInfoValidation.touched.email &&
//                                                                             loginInfoValidation.errors.email
//                                                                         }
//                                                                     />
//                                                                     {loginInfoValidation.touched.email && loginInfoValidation.errors.email ? (
//                                                                         <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                             {loginInfoValidation.errors.email}
//                                                                         </div>
//                                                                     ) : null}
//                                                                 </FormGroup>

//                                                             </Col>
//                                                         </Row>
//                                                         <Row>
//                                                             <Col md={10}>
//                                                                 <FormGroup className="mb-3">
//                                                                     <Label>Password<span className="text-danger">*</span></Label>
//                                                                     <Input
//                                                                         name="password"
//                                                                         type="password"
//                                                                         placeholder="Password"
//                                                                         onChange={loginInfoValidation.handleChange}
//                                                                         onBlur={loginInfoValidation.handleBlur}
//                                                                         value={loginInfoValidation.values.password}
//                                                                         invalid={
//                                                                             loginInfoValidation.touched.password &&
//                                                                             loginInfoValidation.errors.password
//                                                                         }
//                                                                     />
//                                                                     {loginInfoValidation.touched.password && loginInfoValidation.errors.password ? (
//                                                                         <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                             {loginInfoValidation.errors.password}
//                                                                         </div>
//                                                                     ) : null}
//                                                                 </FormGroup>
//                                                             </Col>
//                                                         </Row>
//                                                         <Row>
//                                                             <Col md={10}>
//                                                                 <FormGroup className="mb-3">
//                                                                     <Label>Confirm Password<span className="text-danger">*</span></Label>
//                                                                     <Input
//                                                                         name="confirmPassword"
//                                                                         type="password"
//                                                                         placeholder="ConfirmPassword"
//                                                                         onChange={loginInfoValidation.handleChange}
//                                                                         onBlur={loginInfoValidation.handleBlur}
//                                                                         value={loginInfoValidation.values.confirmPassword}
//                                                                         invalid={
//                                                                             loginInfoValidation.touched.confirmPassword &&
//                                                                             loginInfoValidation.errors.confirmPassword
//                                                                         }
//                                                                     />
//                                                                     {loginInfoValidation.touched.confirmPassword && loginInfoValidation.errors.confirmPassword ? (
//                                                                         <div className="invalid-feedback" style={{ display: 'block' }}>
//                                                                             {loginInfoValidation.errors.confirmPassword}
//                                                                         </div>
//                                                                     ) : null}
//                                                                 </FormGroup>
//                                                             </Col>
//                                                         </Row>
//                                                     </Col>
//                                                     <Col sm={6}>
//                                                         <div className="text-center">
//                                                             <div className="profile-user position-relative d-inline-block mx-auto mb-4 avatar-xl mt-3">
//                                                                 <Label className="form-label">
//                                                                     Photo <span className="text-danger">*</span>
//                                                                 </Label>
//                                                                 <img
//                                                                     src={src}
//                                                                     className="avatar-title rounded rounded-circle bg-danger-subtle text-danger fs-22 material-shadow"
//                                                                     alt="user-photo"
//                                                                 />
//                                                                 <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
//                                                                     <Input
//                                                                         id="user-photo"
//                                                                         type="file"
//                                                                         className="profile-img-file-input"
//                                                                         value={imgLogoInput}
//                                                                         accept={Array.isArray('image/*') ? 'image/*'.join(',') : 'image/*'}
//                                                                         capture={true}
//                                                                         onChange={inputFileChanged}
//                                                                     />
//                                                                     <Label htmlFor="user-photo" className="profile-photo-edit avatar-xs">
//                                                                         <span className="avatar-title rounded-circle bg-light text-body material-shadow">
//                                                                             <i className="ri-camera-fill"></i>
//                                                                         </span>
//                                                                     </Label>
//                                                                 </div>
//                                                                 {photoTouched && !imgLogoData && (
//                                                                     <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
//                                                                         Please select a profile photo
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </Col>
//                                                 </Row>

//                                                 <div className="d-flex align-items-start gap-3 mt-4">
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-light btn-label previestab"
//                                                         onClick={() => toggleTab(2)}
//                                                     >
//                                                         <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
//                                                         Back to Office Information
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         className="btn btn-success btn-label right ms-auto nexttab"
//                                                         onClick={handleFinalSubmit}
//                                                     >
//                                                         <i className="ri-save-line label-icon align-middle fs-16 ms-2"></i>
//                                                         Create User
//                                                     </button>
//                                                 </div>
//                                             </TabPane>
//                                         </TabContent>
//                                     </Form>
//                                 </CardBody>
//                             </Card>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>
//         </React.Fragment>
//     );
// };

// export default UserCreation;













import React, { useState, useEffect } from 'react';
import {
    Container, Form, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Progress, Label, Input, FormGroup, Button
} from "reactstrap";
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import classnames from "classnames";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getUserDropDowns, AllUserCreationSubmit, getAllUserDropDownss } from "../../helpers/fakebackend_helper"
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import Male from '../../assets/images/Male.jpg';
import Female from '../../assets/images/Female.jpg';
import None from '../../assets/images/None.jpg';
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"

// MUI DatePicker imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';

const UserCreation = () => {
    // State for active tab and progress
    const [activeTab, setActiveTab] = useState(1);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [progressBar, setProgressBar] = useState(33);
    const [roles, setLroles] = useState([]);
    const [section, setsection] = useState([])
    const [subDivision, setsubDivision] = useState([]);

    const [divisionName, setDivisionName] = useState([]);
    const [genders, setGenders] = useState([]);
    const [maritalStatus, setMaritalStatus] = useState([]);
    const [response, setResponse] = useState('');
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [src, setSrc] = useState(None);
    const [username, setUserName] = useState('');
    const [userId, setUserId] = useState(0);
    const [selectedGender, setSelectedGender] = useState('');
    const [circles, setCircles] = useState([]);
    const [selectedCircle, setSelectedCircle] = useState('');


    // State for photo upload
    const [imgLogoInput, setImgLogoInput] = useState('');
    const [imgLogoData, setImgLogoData] = useState(null);
    const [photoTouched, setPhotoTouched] = useState(false);

    // State for dropdown visibility
    const [showSubDivisionDropdown, setShowSubDivisionDropdown] = useState(false);
    const [showSectionDropdown, setShowSectionDropdown] = useState(false);
    const [selectedSubDivisions, setSelectedSubDivisions] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);

    const flagIdFunction = async (flagId, setState, requestUserName, div_code, sd_code, circle_code) => {
        try {
            const params = { flagId, requestUserName, div_code, sd_code, circle_code }
            const response = await getAllUserDropDownss(params);
            const options = response?.data || [];
            console.log(`Fetched data for flag ${flagId}:`, options);
            setState(options);
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
        }
    };

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.LoginName;
        setUserName(usernm);

        flagIdFunction(4, setGenders, usernm);
        flagIdFunction(5, setMaritalStatus, usernm);
        flagIdFunction(6, setLroles, usernm);
        flagIdFunction(7, setCircles, usernm);
        document.title = `User Creation | DMS`;
    }, []);

    // Update photo when gender changes
    useEffect(() => {
        if (selectedGender) {
            const selectedGenderObj = genders.find(g => g.genderId.toString() === selectedGender.toString());

            if (selectedGenderObj) {
                if (selectedGenderObj.genderName.toLowerCase() === 'male') {
                    setSrc(Male);
                } else if (selectedGenderObj.genderName.toLowerCase() === 'female') {
                    setSrc(Female);
                } else {
                    setSrc(None);
                }
            }
        } else {
            setSrc(None);
        }
    }, [selectedGender, genders]);

    // Form validation for Contact Information
    const contactInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            maritalStatus: '',
            contactNo: '',
            dateOfBirth: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required("FirstName is required"),
            lastName: Yup.string().required("LastName is required"),
            gender: Yup.string().required("Gender is required"),
            contactNo: Yup.string()
                .required("Contact Number is required")
                .matches(/^[0-9]+$/, "Must be only digits")
                .min(10, "Must be exactly 10 digits")
                .max(10, "Must be exactly 10 digits"),
            dateOfBirth: Yup.date()
                .required("DateOfBirth is required")
                .test('age', 'Must be at least 18 years old', function (value) {
                    if (!value) return false;
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return age >= 18;
                }),
            maritalStatus: Yup.string().required("Marital Status is required")
        }),
        onSubmit: (values) => {
            console.log("Contact Info:", values);
            toggleTab(activeTab + 1);
        }
    });

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        contactInfoValidation.setFieldValue('contactNo', value);
    };


    const handlePasswordChange = (e) => {
        const value = e.target.value.slice(0, 20);
        loginInfoValidation.setFieldValue('password', value);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value.slice(0, 20);
        loginInfoValidation.setFieldValue('confirmPassword', value);
    };

    // Optional: Prevent typing beyond limit
    const handleKeyPress = (e, currentValue) => {
        if (currentValue.length >= 20) {
            e.preventDefault();
        }
    };

    // Custom validation function for office information
    const validateOfficeInfo = (values) => {
        const errors = {};

        if (!values.circle) {
            errors.circle = "Circle is required";
        }

        if (!values.divisionName) {
            errors.divisionName = "DivisionName is required";
        }

        if (!values.RoleName) {
            errors.RoleName = "Role Name is required";
        }

        // SubDivision and SectionOffice are now optional
        // No validation required for sub_division and section_office

        return errors;
    };

    // Form validation for Office Information
    const officeInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            circle: '',
            divisionName: '',
            sub_division: [],
            RoleName: '',
            section_office: [],
        },
        validate: validateOfficeInfo, // Use custom validation
        onSubmit: (values) => {
            console.log("Office Info:", values);
            toggleTab(activeTab + 1);
        }
    });

    // Add this function after your other handler functions
    const getUniqueCircles = (circlesArray) => {
        const uniqueCircles = [];
        const seenCodes = new Set();

        circlesArray.forEach(circle => {
            if (!seenCodes.has(circle.circle_code)) {
                seenCodes.add(circle.circle_code);
                uniqueCircles.push(circle);
            }
        });

        return uniqueCircles;
    };

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setSelectedCircle(selectedCircleCode);
        officeInfoValidation.setFieldValue('circle', selectedCircleCode);

        // Reset division and related fields when circle changes
        officeInfoValidation.setFieldValue('divisionName', '');
        officeInfoValidation.setFieldValue('sub_division', []);
        officeInfoValidation.setFieldValue('section_office', []);
        setSelectedSubDivisions([]);
        setSelectedSections([]);
        setDivisionName([]);
        setsubDivision([]);
        setsection([]);

        // Fetch divisions for the selected circle
        if (selectedCircleCode) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.LoginName;
            await flagIdFunction(1, setDivisionName, usernm, null, null, selectedCircleCode);
        }
    };


    // Form validation for Login Information
    const loginInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .required("Email is required")
                .email("Please enter a valid email address"),
            password: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters")
                .max(20, "Password cannot exceed 20 characters"),
            confirmPassword: Yup.string()
                .required("ConfirmPassword is required")
                .max(20, "Confirm Password cannot exceed 20 characters")
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
        }),
        onSubmit: (values) => {
            console.log("Login Info:", values);
            toggleTab(activeTab + 1);
        }
    });

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;

        officeInfoValidation.setFieldValue('divisionName', selectedDivCode);

        // Reset sub_division & section_office values
        officeInfoValidation.setFieldValue('sub_division', []);
        officeInfoValidation.setFieldValue('section_office', []);
        setSelectedSubDivisions([]);
        setSelectedSections([]);

        // Reset touched states
        officeInfoValidation.setFieldTouched('sub_division', false);
        officeInfoValidation.setFieldTouched('section_office', false);

        // Clear validation errors
        officeInfoValidation.setErrors((prevErrors) => ({
            ...prevErrors,
            sub_division: '',
            section_office: '',
        }));

        // Reset dropdowns
        setsubDivision([]);
        setsection([]);

        if (selectedDivCode && selectedCircle) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.LoginName;
            setUserName(usernm);

            // Fetch sub_division options with circle_code
            await flagIdFunction(2, setsubDivision, usernm, selectedDivCode, null, selectedCircle);

            // Clear validation error again once options are loaded
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                sub_division: '',
            }));
        }
    };

    const handleSubDivisionChange = async (sd_code, isChecked) => {
        let updatedSelection;

        if (isChecked) {
            updatedSelection = [...selectedSubDivisions, sd_code];
        } else {
            updatedSelection = selectedSubDivisions.filter(id => id !== sd_code);
        }

        setSelectedSubDivisions(updatedSelection);

        // Update formik value as array of CODES
        officeInfoValidation.setFieldValue("sub_division", updatedSelection);
        // Mark the field as touched
        officeInfoValidation.setFieldTouched("sub_division", true);

        // Reset sections when subdivisions change
        setsection([]);
        setSelectedSections([]);
        officeInfoValidation.setFieldValue('section_office', []);
        officeInfoValidation.setFieldTouched('section_office', false);

        // Fetch sections only if exactly one subdivision is selected and circle is available
        if (updatedSelection.length === 1 && selectedCircle) {
            await flagIdFunction(3, setsection, username, null, updatedSelection[0], selectedCircle);
        } else if (updatedSelection.length === 0) {
            // Clear validation error when no selection
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                sub_division: '',
            }));
        }
    };

    const handleSectionChange = (so_code, isChecked) => {
        let updatedSelection;

        if (isChecked) {
            updatedSelection = [...selectedSections, so_code];
        } else {
            updatedSelection = selectedSections.filter(id => id !== so_code);
        }

        setSelectedSections(updatedSelection);

        // Update formik value as array of CODES
        officeInfoValidation.setFieldValue("section_office", updatedSelection);
        // Mark the field as touched
        officeInfoValidation.setFieldTouched("section_office", true);

        if (updatedSelection.length === 0) {
            // Clear validation error when no selection
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                section_office: '',
            }));
        }
    };

    const toggleSubDivisionDropdown = () => {
        setShowSubDivisionDropdown(!showSubDivisionDropdown);
        setShowSectionDropdown(false);
        // Mark as touched when dropdown is opened
        officeInfoValidation.setFieldTouched('sub_division', true);
    };

    const toggleSectionDropdown = () => {
        setShowSectionDropdown(!showSectionDropdown);
        setShowSubDivisionDropdown(false);
        // Mark as touched when dropdown is opened
        officeInfoValidation.setFieldTouched('section_office', true);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setShowSubDivisionDropdown(false);
                setShowSectionDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Clear subdivision error when valid selection is made
        if (selectedSubDivisions.length > 0 && officeInfoValidation.errors.sub_division) {
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                sub_division: '',
            }));
        }

        // Clear section error when valid selection is made (and only one subdivision is selected)
        if (selectedSubDivisions.length === 1 && selectedSections.length > 0 && officeInfoValidation.errors.section_office) {
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                section_office: '',
            }));
        }
    }, [selectedSubDivisions, selectedSections, officeInfoValidation]);

    function formatFileSize(bytes, decimalPoint) {
        if (bytes == 0) return '0 Bytes';
        var k = 1000,
            dm = decimalPoint || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, 1)).toFixed(dm));
    }

    const inputFileChanged = (e) => {
        setPhotoTouched(true);
        if (window.FileReader) {
            let file = e.target.files[0]
            const fileExtension = file.name.split(".").at(-1);
            const allowedFileTypes = ["jpg", "png", "jpeg"];
            if (!allowedFileTypes.includes(fileExtension)) {
                setResponse("File does not support. You must use .png, jpeg or .jpg ");
                setErrorModal(true);
                return false;
            }
            let fileSize = formatFileSize(file.size, 2);
            if (fileSize <= 200) {
                setErrorModal(false);
                let reader = new FileReader()
                reader.onload = (r) => {
                    setSrc(r.target.result)
                }
                reader.readAsDataURL(file);
                setImgLogoData(file);
            } else {
                setResponse('Sorry, please upload image will be less than 200kB');
                setErrorModal(true);
            }
        } else {
            setResponse('Sorry, your browser doesn\'t support for preview');
            setErrorModal(true);
        }
    }

    // Toggle between tabs
    function toggleTab(tab) {
        if (activeTab !== tab) {
            var modifiedSteps = [...passedSteps, tab];
            if (tab >= 1 && tab <= 3) {
                var process = tab * 33.33;
                setProgressBar(process);
                setActiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    // Handle gender change
    const handleGenderChange = (e) => {
        const genderId = e.target.value;
        setSelectedGender(genderId);
        contactInfoValidation.handleChange(e);
    }

    const handleFinalSubmit = async () => {
        setPhotoTouched(true);

        // Manually mark all fields as touched to trigger validation
        Object.keys(contactInfoValidation.values).forEach(key => {
            contactInfoValidation.setFieldTouched(key, true);
        });
        Object.keys(officeInfoValidation.values).forEach(key => {
            officeInfoValidation.setFieldTouched(key, true);
        });
        Object.keys(loginInfoValidation.values).forEach(key => {
            loginInfoValidation.setFieldTouched(key, true);
        });

        // Validate all forms
        const contactErrors = await contactInfoValidation.validateForm();
        const officeErrors = await officeInfoValidation.validateForm();
        const loginErrors = await loginInfoValidation.validateForm();

        if (Object.keys(contactErrors).length > 0 ||
            Object.keys(officeErrors).length > 0 ||
            Object.keys(loginErrors).length > 0) {
            setResponse("Please correct all validation errors before submitting.");
            setErrorModal(true);
            return;
        }

        // Photo validation
        if (!imgLogoData) {
            setResponse("Please select a profile photo");
            setErrorModal(true);
            return;
        }

        // Create zoneAccess array
        const zoneAccess = [];
        const divCode = officeInfoValidation.values.divisionName;
        const subDivisions = officeInfoValidation.values.sub_division;
        const sections = officeInfoValidation.values.section_office;
        const circleCode = officeInfoValidation.values.circle;

        // If subdivisions are selected, create entries for each subdivision
        if (subDivisions.length > 0) {
            // If only one subdivision is selected and sections are available, create entries for each section
            if (subDivisions.length === 1 && sections.length > 0) {
                sections.forEach((sectionCode, index) => {
                    zoneAccess.push({
                        div_code: divCode,
                        sd_code: subDivisions[0],
                        so_code: sectionCode,
                        circle: circleCode,
                        zone: "Kalaburagi"
                    });
                });
            } else {
                // If multiple subdivisions or no sections, create entries for each subdivision
                subDivisions.forEach((subDivCode, index) => {
                    zoneAccess.push({
                        div_code: divCode,
                        sd_code: subDivCode,
                        so_code: sections[index] || "", // Use corresponding section if available
                        circle: circleCode,
                        zone: "Kalaburagi"
                    });
                });
            }
        } else {
            // If no subdivisions selected, create entry with only division
            zoneAccess.push({
                div_code: divCode,
                sd_code: "", // Empty for subdivision
                so_code: "", // Empty for section
                circle: circleCode,
                zone: "Kalaburagi"
            });
        }

        // Create the main data object
        const userData = {
            firstName: contactInfoValidation.values.firstName,
            middleName: contactInfoValidation.values.middleName || '',
            lastName: contactInfoValidation.values.lastName,
            projectName: "DMS",
            dateOfBirth: contactInfoValidation.values.dateOfBirth,
            phoneNumber: contactInfoValidation.values.contactNo,
            maritalStatusId: contactInfoValidation.values.maritalStatus ? parseInt(contactInfoValidation.values.maritalStatus) : null,
            genderId: parseInt(contactInfoValidation.values.gender),
            email: loginInfoValidation.values.email,
            password: loginInfoValidation.values.password,
            isForcePasswordChange: 1,
            roleId: parseInt(officeInfoValidation.values.RoleName),
            loginName: username,
            photo: null,
            isDisabled: 0,
            requestUserName: username
        };

        // Create FormData
        const formData = new FormData();

        // Append all user data fields
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });

        // Append zoneAccess fields with array indices - UPDATED FIELD NAMES
        zoneAccess.forEach((access, index) => {
            formData.append(`zoneAccess[${index}][div_code]`, access.div_code);
            formData.append(`zoneAccess[${index}][sd_code]`, access.sd_code);
            formData.append(`zoneAccess[${index}][so_code]`, access.so_code);
            formData.append(`zoneAccess[${index}][circle_code]`, access.circle);
            formData.append(`zoneAccess[${index}][zone_code]`, access.zone);
        });

        // Append the photo file
        formData.append('photo', imgLogoData);

        // Log the form data for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }

        try {
            const response = await AllUserCreationSubmit(formData);
            const result = response.data[0];

            if (result.status !== 'success') {
                setResponse(result.message || "An error occurred.");
                setSuccessModal(false);
                setErrorModal(true);
            } else {
                setResponse(result.message || "User created successfully.");
                setSuccessModal(true);
                setErrorModal(false);

                // Reset all forms
                contactInfoValidation.resetForm();
                officeInfoValidation.resetForm();
                loginInfoValidation.resetForm();

                // Reset all states
                setImgLogoInput('');
                setImgLogoData(null);
                setSrc(None);
                setSelectedGender('');
                setSelectedSubDivisions([]);
                setSelectedSections([]);
                setSelectedCircle('');
                setShowSubDivisionDropdown(false);
                setShowSectionDropdown(false);
                setActiveTab(1);
                setProgressBar(33);
                setPassedSteps([1]);
                setPhotoTouched(false);

                // Reset dropdown data
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const usernm = obj.user.LoginName;
                setsubDivision([]);
                setsection([]);
                setCircles([]);
            }
        } catch (error) {
            console.error("Final submit error:", error);
            setResponse(error.response?.data?.message || "Server error occurred. Please try again.");
            setSuccessModal(false);
            setErrorModal(true);
        }
    };

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            {successModal && (
                <SuccessModal
                    show={true}
                    onCloseClick={() => setSuccessModal(false)}
                    successMsg={response}
                />
            )}

            {errorModal && (
                <ErrorModal
                    show={true}
                    onCloseClick={() => setErrorModal(false)}
                    errorMsg={response}
                />
            )}
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb pageTitle="User Creation" />

                    <Row>
                        <Col xl="12">
                            <div className="live-preview">
                                <Progress className="progress progress-xl mb-3" color="primary" value={progressBar}>
                                    {Math.round(progressBar)}%
                                </Progress>
                            </div>
                            <Card>
                                <CardBody className="checkout-tab">
                                    <Form action="#">
                                        <div className="nav-pills nav-justified mt-n3 mx-n3 mb-3">
                                            <Nav
                                                className="nav nav-pills arrow-navtabs nav-primary bg-light mb-3"
                                                role="tablist"
                                            >
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 1,
                                                            done: (activeTab <= 3 && activeTab >= 0)
                                                        }, "p-3 fs-15")}
                                                        onClick={(e) => e.preventDefault()}

                                                    >
                                                        <i className="ri-user-line fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
                                                        Contact Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 2,
                                                            done: activeTab <= 3 && activeTab > 1
                                                        }, "p-3 fs-15")}
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <i className="ri-home-office-fill fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
                                                        Office Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 3,
                                                            done: activeTab <= 3 && activeTab > 2
                                                        }, "p-3 fs-15")}
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <i className="ri-lock-line"></i>
                                                        Login Information
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                        </div>

                                        <TabContent activeTab={activeTab}>
                                            {/* Contact Information Tab */}
                                            <TabPane tabId={1}>
                                                <div>
                                                    <h5 className="mb-1">Contact Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>FirstName<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="firstName"
                                                                type="text"
                                                                placeholder="FirstName"
                                                                onChange={contactInfoValidation.handleChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.firstName}
                                                                invalid={
                                                                    contactInfoValidation.touched.firstName &&
                                                                    contactInfoValidation.errors.firstName
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.firstName && contactInfoValidation.errors.firstName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.firstName}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>MiddleName</Label>
                                                            <Input
                                                                name="middleName"
                                                                type="text"
                                                                placeholder="MiddleName"
                                                                onChange={contactInfoValidation.handleChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.middleName}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>LastName<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="lastName"
                                                                type="text"
                                                                placeholder="LastName"
                                                                onChange={contactInfoValidation.handleChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.lastName}
                                                                invalid={
                                                                    contactInfoValidation.touched.lastName &&
                                                                    contactInfoValidation.errors.lastName
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.lastName && contactInfoValidation.errors.lastName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.lastName}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Gender<span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="gender"
                                                                onChange={handleGenderChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.gender}
                                                                invalid={
                                                                    contactInfoValidation.touched.gender &&
                                                                    contactInfoValidation.errors.gender
                                                                }
                                                            >
                                                                <option value="">Select Gender</option>
                                                                {genders.map((gender) => (
                                                                    <option key={gender.genderId} value={gender.genderId}>
                                                                        {gender.genderName}
                                                                    </option>
                                                                ))}
                                                            </Input>

                                                            {contactInfoValidation.touched.gender && contactInfoValidation.errors.gender ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.gender}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Marital Status<span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="maritalStatus"
                                                                onChange={contactInfoValidation.handleChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.maritalStatus}
                                                                invalid={
                                                                    contactInfoValidation.touched.maritalStatus &&
                                                                    contactInfoValidation.errors.maritalStatus
                                                                }
                                                            >
                                                                <option value="">Select Marital Status</option>
                                                                {maritalStatus.map((status) => (
                                                                    <option key={status.maritalStatusName} value={status.maritalStatusName}>
                                                                        {status.maritalStatusCode}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        </FormGroup>

                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>ContactNo<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="contactNo"
                                                                type="text"
                                                                placeholder="Contact No"
                                                                onChange={handlePhoneNumberChange} // Use custom handler
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.contactNo}
                                                                maxLength={10}
                                                                invalid={
                                                                    contactInfoValidation.touched.contactNo &&
                                                                    contactInfoValidation.errors.contactNo
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.contactNo && contactInfoValidation.errors.contactNo ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.contactNo}
                                                                </div>
                                                            ) : null}
                                                            {/* Add character count display */}
                                                            <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                {contactInfoValidation.values.contactNo.length}/10 digits
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <div style={{ width: '320px' }}>
                                                        <FormGroup className="mb-3">
                                                            <Label className="form-label required" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                DateOfBirth <span className="text-danger">*</span> (Must be 18+ years)
                                                            </Label>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker
                                                                    format="DD-MM-YYYY"
                                                                    value={
                                                                        contactInfoValidation.values.dateOfBirth
                                                                            ? dayjs(contactInfoValidation.values.dateOfBirth)
                                                                            : null
                                                                    }
                                                                    onChange={(newValue) =>
                                                                        contactInfoValidation.setFieldValue(
                                                                            'dateOfBirth',
                                                                            newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                                                                        )
                                                                    }
                                                                    disableFuture
                                                                    maxDate={dayjs().subtract(18, 'year')} // This will prevent selecting dates less than 18 years ago
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            name="dateOfBirth"
                                                                            size="small"
                                                                            fullWidth
                                                                            error={Boolean(
                                                                                contactInfoValidation.touched.dateOfBirth &&
                                                                                contactInfoValidation.errors.dateOfBirth
                                                                            )}
                                                                            helperText={
                                                                                contactInfoValidation.touched.dateOfBirth &&
                                                                                    contactInfoValidation.errors.dateOfBirth
                                                                                    ? contactInfoValidation.errors.dateOfBirth
                                                                                    : 'Must be at least 18 years old'
                                                                            }
                                                                            sx={{
                                                                                mt: 0.5,
                                                                                mb: 0,
                                                                                '& .MuiInputBase-root': {
                                                                                    borderRadius: '6px',
                                                                                    fontSize: '0.85rem',
                                                                                    height: '32px',
                                                                                    paddingTop: '4px',
                                                                                    paddingBottom: '4px',
                                                                                },
                                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                                    borderColor: '#ccc',
                                                                                },
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </LocalizationProvider>
                                                        </FormGroup>
                                                    </div>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            contactInfoValidation.handleSubmit();
                                                        }}
                                                    >
                                                        <i className="ri-home-office-line label-icon align-middle fs-16 ms-2"></i>
                                                        Proceed to Office Information
                                                    </button>
                                                </div>
                                            </TabPane>

                                            {/* Office Information Tab */}
                                            <TabPane tabId={2}>
                                                <div>
                                                    <h5 className="mb-1">Office Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <Row>

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Circle <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="circle"
                                                                className="form-select"
                                                                onChange={handleCircleChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.circle}
                                                                invalid={officeInfoValidation.touched.circle && !!officeInfoValidation.errors.circle}
                                                            >
                                                                <option value="">Select Circle</option>
                                                                {getUniqueCircles(circles).map((circle) => (
                                                                    <option key={circle.circle_code} value={circle.circle_code}>
                                                                        {circle.circle}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.circle && officeInfoValidation.errors.circle && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.circle}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>DivisionName <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="divisionName"
                                                                className="form-select"
                                                                onChange={handleDivisionChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.divisionName}
                                                                invalid={officeInfoValidation.touched.divisionName && !!officeInfoValidation.errors.divisionName}
                                                            >
                                                                <option value="">Select Division</option>
                                                                {divisionName.map((division) => (
                                                                    <option key={division.div_code} value={division.div_code}>
                                                                        {division.division}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.divisionName && officeInfoValidation.errors.divisionName && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.divisionName}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>SubDivision</Label>
                                                            <div className="dropdown">
                                                                <button
                                                                    className="form-select text-start"
                                                                    type="button"
                                                                    onClick={toggleSubDivisionDropdown}
                                                                    style={{
                                                                        position: 'relative',
                                                                        backgroundColor: '#fff',
                                                                        borderColor: '#ced4da'
                                                                    }}
                                                                >
                                                                    {selectedSubDivisions.length > 0
                                                                        ? `${selectedSubDivisions.length} selected`
                                                                        : 'Select Sub Division (Optional)'}
                                                                    <span className="position-absolute top-50 end-0 translate-middle-y me-2">
                                                                    </span>
                                                                </button>

                                                                {showSubDivisionDropdown && (
                                                                    <div
                                                                        className="dropdown-menu show w-100 p-2"
                                                                        style={{
                                                                            maxHeight: '200px',
                                                                            overflowY: 'auto',
                                                                            zIndex: 1000
                                                                        }}
                                                                    >
                                                                        {subDivision.map((subdivision) => (
                                                                            <div key={subdivision.sd_code} className="form-check">
                                                                                <Input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id={`subdiv-${subdivision.sd_code}`}
                                                                                    checked={selectedSubDivisions.includes(subdivision.sd_code)}
                                                                                    onChange={(e) => {
                                                                                        handleSubDivisionChange(subdivision.sd_code, e.target.checked);
                                                                                        officeInfoValidation.setFieldTouched('sub_division', true);
                                                                                    }}
                                                                                />
                                                                                <Label className="form-check-label w-100" htmlFor={`subdiv-${subdivision.sd_code}`}>
                                                                                    {subdivision.sub_division}
                                                                                </Label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>


                                                </Row>

                                                <Row>
                                                    {selectedSubDivisions.length === 1 && (
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>SectionOffice</Label>
                                                                <div className="dropdown">
                                                                    <button
                                                                        className="form-select text-start"
                                                                        type="button"
                                                                        onClick={toggleSectionDropdown}
                                                                        style={{
                                                                            position: 'relative',
                                                                            backgroundColor: '#fff',
                                                                            borderColor: '#ced4da'
                                                                        }}
                                                                    >
                                                                        {selectedSections.length > 0
                                                                            ? `${selectedSections.length} selected`
                                                                            : 'Select Section (Optional)'}
                                                                        <span className="position-absolute top-50 end-0 translate-middle-y me-2">
                                                                        </span>
                                                                    </button>

                                                                    {showSectionDropdown && (
                                                                        <div
                                                                            className="dropdown-menu show w-100 p-2"
                                                                            style={{
                                                                                maxHeight: '200px',
                                                                                overflowY: 'auto',
                                                                                zIndex: 1000
                                                                            }}
                                                                        >
                                                                            {section.map((sectionItem) => (
                                                                                <div key={sectionItem.so_code} className="form-check">
                                                                                    <Input
                                                                                        className="form-check-input"
                                                                                        type="checkbox"
                                                                                        id={`section-${sectionItem.so_code}`}
                                                                                        checked={selectedSections.includes(sectionItem.so_code)}
                                                                                        onChange={(e) => {
                                                                                            handleSectionChange(sectionItem.so_code, e.target.checked);
                                                                                            officeInfoValidation.setFieldTouched('section_office', true);
                                                                                        }}
                                                                                    />
                                                                                    <Label className="form-check-label w-100" htmlFor={`section-${sectionItem.so_code}`}>
                                                                                        {sectionItem.section_office}
                                                                                    </Label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    )}

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>RoleName<span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="RoleName"
                                                                className="form-select"
                                                                onChange={officeInfoValidation.handleChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.RoleName}
                                                                invalid={
                                                                    officeInfoValidation.touched.RoleName &&
                                                                    officeInfoValidation.errors.RoleName
                                                                }
                                                            >
                                                                <option value="">Select Role</option>
                                                                {roles.map((role) => (
                                                                    <option key={role.Role_Id} value={role.Role_Id}>
                                                                        {role.RoleName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.RoleName && officeInfoValidation.errors.RoleName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.RoleName}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => toggleTab(1)}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Back to Contact Information
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            officeInfoValidation.handleSubmit();
                                                        }}
                                                    >
                                                        <i className="ri-lock-line label-icon align-middle fs-16 ms-2"></i>
                                                        Proceed to Login Information
                                                    </button>
                                                </div>
                                            </TabPane>


                                            {/* Login Information Tab */}
                                            <TabPane tabId={3}>
                                                <div>
                                                    <h5 className="mb-1">Login Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <Row>
                                                    <Col md={6}>
                                                        <Row>
                                                            <Col md={10}>
                                                                <FormGroup className="mb-3">
                                                                    <Label>Email <span className="text-danger">*</span></Label>
                                                                    <Input
                                                                        name="email"
                                                                        type="email"
                                                                        placeholder="Email"
                                                                        onChange={loginInfoValidation.handleChange}
                                                                        onBlur={loginInfoValidation.handleBlur}
                                                                        value={loginInfoValidation.values.email}
                                                                        invalid={
                                                                            loginInfoValidation.touched.email &&
                                                                            loginInfoValidation.errors.email
                                                                        }
                                                                    />
                                                                    {loginInfoValidation.touched.email && loginInfoValidation.errors.email ? (
                                                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                            {loginInfoValidation.errors.email}
                                                                        </div>
                                                                    ) : null}
                                                                </FormGroup>

                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col md={10}>
                                                                <FormGroup className="mb-3">
                                                                    <Label>Password<span className="text-danger">*</span></Label>
                                                                    <Input
                                                                        name="password"
                                                                        type="password"
                                                                        placeholder="Password"
                                                                        onChange={handlePasswordChange}
                                                                        onKeyPress={(e) => handleKeyPress(e, loginInfoValidation.values.password)}
                                                                        onBlur={loginInfoValidation.handleBlur}
                                                                        value={loginInfoValidation.values.password}
                                                                        maxLength={20}
                                                                        invalid={
                                                                            loginInfoValidation.touched.password &&
                                                                            loginInfoValidation.errors.password
                                                                        }
                                                                    />
                                                                    {loginInfoValidation.touched.password && loginInfoValidation.errors.password ? (
                                                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                            {loginInfoValidation.errors.password}
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                        {loginInfoValidation.values.password.length}/20 characters
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col md={10}>
                                                                <FormGroup className="mb-3">
                                                                    <Label>Confirm Password<span className="text-danger">*</span></Label>
                                                                    <Input
                                                                        name="confirmPassword"
                                                                        type="password"
                                                                        placeholder="ConfirmPassword"
                                                                        onChange={handleConfirmPasswordChange}
                                                                        onKeyPress={(e) => handleKeyPress(e, loginInfoValidation.values.confirmPassword)}
                                                                        onBlur={loginInfoValidation.handleBlur}
                                                                        value={loginInfoValidation.values.confirmPassword}
                                                                        maxLength={20}
                                                                        invalid={
                                                                            loginInfoValidation.touched.confirmPassword &&
                                                                            loginInfoValidation.errors.confirmPassword
                                                                        }
                                                                    />
                                                                    {loginInfoValidation.touched.confirmPassword && loginInfoValidation.errors.confirmPassword ? (
                                                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                            {loginInfoValidation.errors.confirmPassword}
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                        {loginInfoValidation.values.confirmPassword.length}/20 characters
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <div className="text-center">
                                                            <div className="profile-user position-relative d-inline-block mx-auto mb-4 avatar-xl mt-3">
                                                                <Label className="form-label">
                                                                    Photo <span className="text-danger">*</span>
                                                                </Label>
                                                                <img
                                                                    src={src}
                                                                    className="avatar-title rounded rounded-circle bg-danger-subtle text-danger fs-22 material-shadow"
                                                                    alt="user-photo"
                                                                />
                                                                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                                    <Input
                                                                        id="user-photo"
                                                                        type="file"
                                                                        className="profile-img-file-input"
                                                                        value={imgLogoInput}
                                                                        accept={Array.isArray('image/*') ? 'image/*'.join(',') : 'image/*'}
                                                                        capture={true}
                                                                        onChange={inputFileChanged}
                                                                    />
                                                                    <Label htmlFor="user-photo" className="profile-photo-edit avatar-xs">
                                                                        <span className="avatar-title rounded-circle bg-light text-body material-shadow">
                                                                            <i className="ri-camera-fill"></i>
                                                                        </span>
                                                                    </Label>
                                                                </div>
                                                                {photoTouched && !imgLogoData && (
                                                                    <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                                                                        Please select a profile photo
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => toggleTab(2)}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Back to Office Information
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-label right ms-auto nexttab"
                                                        onClick={handleFinalSubmit}
                                                    >
                                                        <i className="ri-save-line label-icon align-middle fs-16 ms-2"></i>
                                                        Create User
                                                    </button>
                                                </div>
                                            </TabPane>
                                        </TabContent>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default UserCreation;