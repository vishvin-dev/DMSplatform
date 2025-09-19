import React, { useState, useEffect } from 'react';
import {
    Container,
    Form,
    Row,
    Col,
    Card,
    CardBody,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Progress,
    Label,
    Input,
    FormGroup,
    Button
} from "reactstrap";
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import classnames from "classnames";
import * as Yup from "yup";
import { useFormik } from "formik";
import { fetchingDropdowns, AllFinalSubmit, getAllMeterReaderRegistration } from "../../helpers/fakebackend_helper";
import { GET_ALL_METER_READER_REGISTRATION } from "../../helpers/url_helper"
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils";

// --- MUI DatePicker imports ---
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const MeterReaderRegistration = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [progressBar, setProgressBar] = useState(25);
    const [locationType, setLocationType] = useState([]);
    const [response, setResponse] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [location, setLocation] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [deviceTypeName, setdeviceTypeName] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [completedTabs, setCompletedTabs] = useState([1]);
    const [data, setData] = useState([]);
    const [username, setUserName] = useState('');
    const [locationcode, setLocationCode] = useState("");

    // Fetch dropdown data
    const flagIdFunction = async (flagId, setState, requestUserName, locationId, locationTypeId) => {
        try {
            const response = await fetchingDropdowns({ flagId, requestUserName, locationId, locationTypeId });
            const options = response?.data || [];
            setState(options);
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
            setState([]);
        }
    };

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;
        const locationCode = obj.user.locationCode
        setLocationCode(locationCode)
        setUserName(usernm)
        const locationId = obj.user.locationId
        flagIdFunction(2, setLocationType, usernm, locationId);
        flagIdFunction(1, setDesignation, usernm);
        flagIdFunction(4, setdeviceTypeName, usernm);
    }, []);

    const handleLocationTypeChange = async (e) => {
        const selectedValue = e.target.value;
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;
        officeInfoValidation.setFieldValue("locationType", Number(selectedValue));
        await flagIdFunction(
            3,
            setLocation,
            usernm,
            null,
            Number(selectedValue)
        );
    };

    // Form validation for Personal Information
    const personalInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            mrCode: '',
            contactNo: '',
            alternateContactNo: '',
            emailAddress: '',
            dateOfJoin: '',
            address: '',
            status: 'Active',
        },
        validationSchema: Yup.object({
            firstName: Yup.string()
                .max(50, 'Maximum 50 characters allowed')
                .required("FirstName is required"),
            lastName: Yup.string()
                .max(50, 'Maximum 50 characters allowed')
                .required("Last Name is required"),
            mrCode: Yup.string()
                .max(20, 'Maximum 20 characters allowed')
                .required("MR Code is required"),
            contactNo: Yup.string()
                .required("Contact Number is required")
                .matches(/^[0-9]+$/, "Must be only digits")
                .min(10, "Must be exactly 10 digits")
                .max(10, "Must be exactly 10 digits"),
            emailAddress: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            dateOfJoin: Yup.date().required("Date of Join is required"),
            address: Yup.string()
                .max(200, 'Maximum 200 characters allowed')
                .required("Address is required")
        }),
        onSubmit: (values) => {
            if (Object.keys(personalInfoValidation.errors).length === 0) {
                setCompletedTabs(prev => [...new Set([...prev, 2])]);
                setActiveTab(2);
                setProgressBar(66);
            }
        }
    });

    // Form validation for Office Information
    const officeInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            locationType: '',
            locationName: '',
            designation: ''
        },
        validationSchema: Yup.object({
            locationType: Yup.string().required("Location Type is required"),
            locationName: Yup.string().required("Location Name is required"),
            designation: Yup.string().required("Designation is required")
        }),
        onSubmit: (values) => {
            if (Object.keys(officeInfoValidation.errors).length === 0) {
                setCompletedTabs(prev => [...new Set([...prev, 3])]);
                setActiveTab(3);
                setProgressBar(100);
            }
        }
    });

    // Form validation for Device Information
    const deviceInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            isDeviceAllocated: false,
            deviceTypeName: '',
            deviceName: '',
            imeiNo: '',
            simNo: '',
            password: '',
            photo: null
        },
        validationSchema: Yup.object({
            deviceTypeName: Yup.string()
                .required("Device Type is required"),
            deviceName: Yup.string()
                .max(50, 'Maximum 50 characters allowed')
                .required("Device Name is required"),
            imeiNo: Yup.string()
                .matches(/^[0-9]+$/, "Must be only digits")
                .min(15, "Must be only digits")
                .max(20, "Must be only digits")
                .required("IMEI No is required"),
            simNo: Yup.string()
                .matches(/^[0-9]+$/, "Must be only digits")
                .min(10, "Must be only digits")
                .max(12, "Must be only digits")
                .required("SIM No is required"),
            password: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters")
                .max(20, "Maximum 20 characters allowed"),
            photo: Yup.mixed().required("Photo is required")
        }),
        onSubmit: (values) => {
            if (Object.keys(deviceInfoValidation.errors).length === 0) {
                handleFinalSubmit();
            }
        }
    });

    // Device allocation duplicate check remains unchanged
    const handleDeviceAllocationChange = (e) => {
        const isChecked = e.target.checked;
        const imei = deviceInfoValidation.values.imeiNo;
        const sim = deviceInfoValidation.values.simNo;

        if (isChecked) {
            const imeiExists = data.some(item => item.imeiNo === imei);
            const simExists = data.some(item => item.simNo === sim);

            if (imeiExists || simExists) {
                alert('IMEI or SIM number is already allocated!');
                deviceInfoValidation.setFieldValue("isDeviceAllocated", false);
                return;
            }
        }

        deviceInfoValidation.setFieldValue("isDeviceAllocated", isChecked);
    };

    // ... other handlers unchanged ...

    // Handle photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            deviceInfoValidation.setFieldValue('photo', file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ... handleTabChange, handleFinalSubmit, useEffect for title ... (unchanged) ...
      useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const menuPage = JSON.parse(obj?.user?.menuPage || "[]");
        const applicationCode = obj?.user?.applicationCode;
        const currentPath = window.location.pathname;
    
        const currentPageLabel = findLabelByLink(menuPage, currentPath) || "Page";
    
        document.title = `${currentPageLabel} | ${applicationCode}`;
      }, []);
    

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
                    <BreadCrumb title="MeterReaderRegistration" pageTitle="MeterManagement" />

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
                                                            done: completedTabs.includes(1)
                                                        }, "p-3 fs-15")}
                                                        onClick={() => handleTabChange(1)}
                                                    >
                                                        <i className="ri-user-line fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
                                                        Personal Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 2,
                                                            done: completedTabs.includes(2),
                                                            disabled: !completedTabs.includes(2) && activeTab !== 2
                                                        }, "p-3 fs-15")}
                                                        onClick={() => handleTabChange(2)}
                                                    >
                                                        <i className="ri-home-office-fill fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
                                                        Office Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 3,
                                                            done: completedTabs.includes(3),
                                                            disabled: !completedTabs.includes(3) && activeTab !== 3
                                                        }, "p-3 fs-15")}
                                                        onClick={() => handleTabChange(3)}
                                                    >
                                                        <i className="ri-smartphone-line"></i>
                                                        Device Information
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                        </div>

                                        <TabContent activeTab={activeTab}>
                                            {/* Personal Information Tab */}
                                            <TabPane tabId={1}>
                                                <div>
                                                    <h5 className="mb-1">Personal Information</h5>
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
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.firstName}
                                                                invalid={
                                                                    personalInfoValidation.touched.firstName &&
                                                                    personalInfoValidation.errors.firstName
                                                                }
                                                            />
                                                            {personalInfoValidation.touched.firstName && personalInfoValidation.errors.firstName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {personalInfoValidation.errors.firstName}
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
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.middleName}
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
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.lastName}
                                                                invalid={
                                                                    personalInfoValidation.touched.lastName &&
                                                                    personalInfoValidation.errors.lastName
                                                                }
                                                            />
                                                            {personalInfoValidation.touched.lastName && personalInfoValidation.errors.lastName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {personalInfoValidation.errors.lastName}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>MR Code<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="mrCode"
                                                                type="text"
                                                                placeholder="MRCode"
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.mrCode}
                                                                invalid={
                                                                    personalInfoValidation.touched.mrCode &&
                                                                    personalInfoValidation.errors.mrCode
                                                                }
                                                            />
                                                            {personalInfoValidation.touched.mrCode && personalInfoValidation.errors.mrCode ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {personalInfoValidation.errors.mrCode}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>ContactNo<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="contactNo"
                                                                type="text"
                                                                placeholder="ContactNo"
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.contactNo}
                                                                invalid={
                                                                    personalInfoValidation.touched.contactNo &&
                                                                    personalInfoValidation.errors.contactNo
                                                                }
                                                            />
                                                            {personalInfoValidation.touched.contactNo && personalInfoValidation.errors.contactNo ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {personalInfoValidation.errors.contactNo}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>AlternateContactNo</Label>
                                                            <Input
                                                                name="alternateContactNo"
                                                                type="text"
                                                                placeholder="AlternateContactNo"
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.alternateContactNo}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Email Address<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="emailAddress"
                                                                type="email"
                                                                placeholder="Email Address"
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.emailAddress}
                                                                invalid={
                                                                    personalInfoValidation.touched.emailAddress &&
                                                                    personalInfoValidation.errors.emailAddress
                                                                }
                                                            />
                                                            {personalInfoValidation.touched.emailAddress && personalInfoValidation.errors.emailAddress ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {personalInfoValidation.errors.emailAddress}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                   <Col md={4}>
  <FormGroup className="mb-3">
    <Label>Date of Join<span className="text-danger">*</span></Label>
    <div style={{ width: '250px' }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          value={personalInfoValidation.values.dateOfJoin ? new Date(personalInfoValidation.values.dateOfJoin) : null}
          onChange={(value) => personalInfoValidation.setFieldValue('dateOfJoin', value)}
          maxDate={new Date()}
          renderInput={(params) => (
            <TextField
              {...params}
              name="dateOfJoin"
              size="small"
              error={Boolean(personalInfoValidation.errors.dateOfJoin && personalInfoValidation.touched.dateOfJoin)}
              helperText={personalInfoValidation.touched.dateOfJoin && personalInfoValidation.errors.dateOfJoin ? personalInfoValidation.errors.dateOfJoin : ''}
             sx={{
    mt: 0.5, // reduce top margin
    mb: 0,   // remove bottom margin if any
    '& .MuiInputBase-root': {
      borderRadius: '6px',
      fontSize: '0.85rem',
      height: '32px',  // reduce height from 40px to 32px or less
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
    </div>
  </FormGroup>
</Col>


                                                </Row>

                                                <Row>
                                                    <Col md={8}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Address<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="address"
                                                                type="textarea"
                                                                rows="3"
                                                                placeholder="Address"
                                                                onChange={personalInfoValidation.handleChange}
                                                                onBlur={personalInfoValidation.handleBlur}
                                                                value={personalInfoValidation.values.address}
                                                                invalid={
                                                                    personalInfoValidation.touched.address &&
                                                                    personalInfoValidation.errors.address
                                                                }
                                                            />
                                                            {personalInfoValidation.touched.address && personalInfoValidation.errors.address ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {personalInfoValidation.errors.address}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            personalInfoValidation.handleSubmit();
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
                                                            <Label>LocationTypeName <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="locationType"
                                                                className="form-select"
                                                                onChange={handleLocationTypeChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.locationType}
                                                                invalid={
                                                                    officeInfoValidation.touched.locationType &&
                                                                    officeInfoValidation.errors.locationType
                                                                }
                                                            >
                                                                <option value="">Select LocationTypeName</option>
                                                                {locationType && locationType.map((item) => (
                                                                    <option key={item.locationTypeId} value={item.locationTypeId}>
                                                                        {item.locationTypeName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.locationType && officeInfoValidation.errors.locationType ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.locationType}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>

                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>LocationName <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="locationName"
                                                                className="form-select"
                                                                onChange={officeInfoValidation.handleChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.locationName}
                                                                invalid={
                                                                    officeInfoValidation.touched.locationName &&
                                                                    !!officeInfoValidation.errors.locationName
                                                                }
                                                            >
                                                                <option value="">Select Location</option>
                                                                {Array.isArray(location) && location.map((item) => (
                                                                    <option key={item.locationId} value={item.locationId}>
                                                                        {item.locationName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.locationName && officeInfoValidation.errors.locationName && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.locationName}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Designation <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="designation"
                                                                className="form-select"
                                                                onChange={officeInfoValidation.handleChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.designation}
                                                                invalid={
                                                                    officeInfoValidation.touched.designation &&
                                                                    !!officeInfoValidation.errors.designation
                                                                }
                                                            >
                                                                <option value="">Select Designation</option>
                                                                {Array.isArray(designation) && designation.map((item) => (
                                                                    <option key={item.designationId} value={item.designationId}>
                                                                        {item.designationName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.designation && officeInfoValidation.errors.designation && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.designation}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>


                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => handleTabChange(1)}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Back to Personal Information
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            officeInfoValidation.validateForm().then(errors => {
                                                                if (Object.keys(errors).length === 0) {
                                                                    officeInfoValidation.handleSubmit();
                                                                } else {
                                                                    officeInfoValidation.setTouched({
                                                                        locationType: true,
                                                                        locationName: true,
                                                                        designation: true
                                                                    });
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <i className="ri-smartphone-line label-icon align-middle fs-16 ms-2"></i>
                                                        Proceed to Device Information
                                                    </button>
                                                </div>
                                            </TabPane>

                                            {/* Device Information Tab */}
                                            <TabPane tabId={3}>
                                                <div>
                                                    <h5 className="mb-1">Device Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                {/* Toggle Switch for Device Allocation */}
                                                <Row>
                                                    <Col md={12}>
                                                        <FormGroup switch className="mb-3">
                                                            <Input
                                                                name="isDeviceAllocated"
                                                                type="switch"
                                                                id="isDeviceAllocated"
                                                                onChange={handleDeviceAllocationChange}
                                                                checked={deviceInfoValidation.values.isDeviceAllocated}
                                                            />
                                                            <Label for="isDeviceAllocated" check>
                                                                IsDeviceAllocated
                                                            </Label>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>


                                                <Row>
                                                    <Col md={6}>
                                                        <FormGroup className="mb-3">
                                                            <Label>DeviceType <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="deviceTypeName"
                                                                className="form-select"
                                                                onChange={deviceInfoValidation.handleChange}
                                                                onBlur={deviceInfoValidation.handleBlur}
                                                                value={deviceInfoValidation.values.deviceTypeName}
                                                                invalid={
                                                                    deviceInfoValidation.touched.deviceTypeName &&
                                                                    !!deviceInfoValidation.errors.deviceTypeName
                                                                }
                                                            >
                                                                <option value="">Select DeviceType</option>
                                                                {Array.isArray(deviceTypeName) && deviceTypeName.map((item) => (
                                                                    <option key={item.deviceTypeNameId} value={item.deviceTypeNameId}>
                                                                        {item.deviceTypeName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {deviceInfoValidation.touched.deviceTypeName && deviceInfoValidation.errors.deviceTypeName && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {deviceInfoValidation.errors.deviceTypeName}
                                                                </div>
                                                            )}
                                                        </FormGroup>

                                                        <FormGroup className="mb-3">
                                                            <Label>DeviceName<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="deviceName"
                                                                type="text"
                                                                placeholder="Device
                                                                
                                                                Name"
                                                                onChange={deviceInfoValidation.handleChange}
                                                                onBlur={deviceInfoValidation.handleBlur}
                                                                value={deviceInfoValidation.values.deviceName}
                                                                invalid={
                                                                    deviceInfoValidation.touched.deviceName &&
                                                                    deviceInfoValidation.errors.deviceName
                                                                }
                                                            />
                                                            {deviceInfoValidation.touched.deviceName && deviceInfoValidation.errors.deviceName && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {deviceInfoValidation.errors.deviceName}
                                                                </div>
                                                            )}
                                                        </FormGroup>

                                                        <FormGroup className="mb-3">
                                                            <Label>IMEI No<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="imeiNo"
                                                                type="text"
                                                                placeholder="IMEI No"
                                                                onChange={deviceInfoValidation.handleChange}
                                                                onBlur={deviceInfoValidation.handleBlur}
                                                                value={deviceInfoValidation.values.imeiNo}
                                                                invalid={
                                                                    deviceInfoValidation.touched.imeiNo &&
                                                                    deviceInfoValidation.errors.imeiNo
                                                                }
                                                            />
                                                            {deviceInfoValidation.touched.imeiNo && deviceInfoValidation.errors.imeiNo && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {deviceInfoValidation.errors.imeiNo}
                                                                </div>
                                                            )}
                                                        </FormGroup>

                                                        <FormGroup className="mb-3">
                                                            <Label>SIM No<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="simNo"
                                                                type="text"
                                                                placeholder="SIM No"
                                                                onChange={deviceInfoValidation.handleChange}
                                                                onBlur={deviceInfoValidation.handleBlur}
                                                                value={deviceInfoValidation.values.simNo}
                                                                invalid={
                                                                    deviceInfoValidation.touched.simNo &&
                                                                    deviceInfoValidation.errors.simNo
                                                                }
                                                            />
                                                            {deviceInfoValidation.touched.simNo && deviceInfoValidation.errors.simNo && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {deviceInfoValidation.errors.simNo}
                                                                </div>
                                                            )}
                                                        </FormGroup>

                                                        <FormGroup className="mb-3">
                                                            <Label>Password<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="password"
                                                                type="password"
                                                                placeholder="Password"
                                                                onChange={deviceInfoValidation.handleChange}
                                                                onBlur={deviceInfoValidation.handleBlur}
                                                                value={deviceInfoValidation.values.password}
                                                                invalid={
                                                                    deviceInfoValidation.touched.password &&
                                                                    deviceInfoValidation.errors.password
                                                                }
                                                            />
                                                            {deviceInfoValidation.touched.password && deviceInfoValidation.errors.password && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {deviceInfoValidation.errors.password}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={6}>
                                                        <FormGroup className="mb-3">
                                                            <div className="text-center">
                                                                <div className="profile-user position-relative d-inline-block mx-auto mb-4 mt-3">
                                                                    {photoPreview ? (
                                                                        <img
                                                                            src={photoPreview}
                                                                            className="rounded-circle bg-light-subtle text-light fs-22 material-shadow"
                                                                            alt="customer-logo"
                                                                            style={{
                                                                                width: "180px",
                                                                                height: "180px",
                                                                                objectFit: "cover"
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="avatar-title rounded-circle fs-4 text-white material-shadow"
                                                                            style={{
                                                                                width: "180px",
                                                                                height: "180px",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                backgroundColor: "#6f4e37" // Coffee color background
                                                                            }}
                                                                        >
                                                                            <strong>Logo</strong>
                                                                        </div>
                                                                    )}

                                                                    <div
                                                                        className="avatar-xs p-0 rounded-circle profile-photo-edit"
                                                                        style={{ position: "absolute", bottom: 0, right: 0 }}
                                                                    >
                                                                        <Input
                                                                            id="profile-img-file-input"
                                                                            type="file"
                                                                            className="profile-img-file-input"
                                                                            accept="image/png, image/jpeg, image/jpg"
                                                                            onChange={handlePhotoUpload}
                                                                            style={{ display: "none" }}
                                                                        />
                                                                        <Label htmlFor="profile-img-file-input" className="profile-photo-edit avatar-xs">
                                                                            <span className="avatar-title rounded-circle bg-light text-body material-shadow">
                                                                                <i className="ri-camera-fill"></i>
                                                                            </span>
                                                                        </Label>
                                                                    </div>
                                                                </div>

                                                                {deviceInfoValidation.touched.photo && deviceInfoValidation.errors.photo && (
                                                                    <div className="invalid-feedback d-block">
                                                                        {deviceInfoValidation.errors.photo}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormGroup>

                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => handleTabChange(2)}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Back to Office Information
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            deviceInfoValidation.handleSubmit();
                                                        }}
                                                    >
                                                        <i className="ri-save-line label-icon align-middle fs-16 ms-2"></i>
                                                        Register
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

export default MeterReaderRegistration;