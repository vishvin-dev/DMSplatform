import React, {useState, useEffect, useMemo, useCallback} from 'react';
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
    CardHeader,
    Modal,
    ModalFooter,
    ModalHeader,
    ModalBody,
    Label,
    Input,
    FormGroup,
    FormFeedback,
    Table,
    Progress,
} from "reactstrap";

import BreadCrumb from '../../Components/Common/BreadCrumb';
import TableContainer from "../../Components/Common/TableContainerReactTable";
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import {ToastContainer} from 'react-toastify';
import classnames from "classnames";
import {Link} from "react-router-dom";

import * as Yup from "yup";
import {useFormik} from "formik";

import {
    postCustomerCreate,
    getCustomerBusinessTypes,
    getCustomerCountries,
    getCustomerClients,
    getCustomerGeoTypes,
    getCustomerGeoByGeoTypeId,
    getCustomerCompanyTypes


} from "../../helpers/fakebackend_helper";
import Rating from "react-rating";


const CustomerMaster = () => {
    const [src, setSrc] = useState();
    const [srcCheque, setSrcCheque] = useState();
    const [imgLogoInput, setImgLogoInput] = useState('');

    const [imgLogoData, setImgLogoData] = useState(null);


    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [progressBar, setProgressBar] = useState(0);
    const [activeTab, setActiveTab] = useState(1);
    const [passedSteps, setPassedSteps] = useState([1]);

    const [countries, setCountries] = useState([]);
    const [checkedMobile, setCheckedMobile] = React.useState(false);
    const [username, setUserName] = useState('');
    const [companyInfo, setCompanyInfo] = useState([]);
    const [companyInfo_bk, setCompanyInfo_Bk] = useState([]);

    const [contactInfo, setContactInfo] = useState([]);
    const [contactInfo_bk, setContactInfo_Bk] = useState([]);
    const [officeInfo, setOfficeInfo] = useState([]);
    const [officeInfo_bk, setOfficeInfo_Bk] = useState([]);
    const [geoOptions, setGeoOptions] = useState([]);
    const [geoTypeOptions, setGeoTypeOptions] = useState([]);
    const [countryOptions, setCountryOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [busTypesOptions, setBusTypesOptions] = useState([]);
    const [companyTypesOptions, setCompanyTypesOptions] = useState([]);
    const [scountry, setScountry] = useState('');
    const [sclient, setSclient] = useState('');


    const [contactTableShow, setContactTableShow] = useState(false);


    const loadGeographyByGeoType = async (value) => {
        let sGeoTypeId = value.target.value;

        if (sGeoTypeId === '') {
            setGeoOptions([]);

        } else {

            let response;
            response = getCustomerGeoByGeoTypeId(sGeoTypeId);

            var resp = await response;

            const geogrphyList = resp.map((geographies) => ({
                value: geographies.geographyId, // using app's ID as the value
                label: geographies.geographyName, // using app's name as the label
            }));

            setGeoOptions(geogrphyList);


        }

    };


    //load On Page Load
    useEffect(() => {
        getOnLoadingData();
    }, []);

    const getOnLoadingData = async () => {
        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));

            let usernm = obj.data.username;
            setUserName(usernm);
            setScountry(obj.data.countryId);
            setSclient(obj.data.clientId);

            let allCountries;
            allCountries = getCustomerCountries(obj.data.countryId);
            const cResponse = await allCountries;

            const countryList = cResponse.map((country) => ({
                value: country.countryId, // using app's ID as the value
                label: country.countryName, // using app's name as the label
            }));

            setCountryOptions(countryList);

            let allClient;
            allClient = getCustomerClients(obj.data.clientId);
            const clResponse = await allClient;

            const clientList = clResponse.map((client) => ({
                value: client.clientId, // using app's ID as the value
                label: client.clientName, // using app's name as the label
            }));

            setClientOptions(clientList);

            let allBusTypes;
            allBusTypes = getCustomerBusinessTypes();
            const btResponse = await allBusTypes;

            const busTypeList = btResponse.map((busType) => ({
                value: busType.businessTypeId, // using app's ID as the value
                label: busType.businessTypeName, // using app's name as the label
            }));

            setBusTypesOptions(busTypeList);

            let companyTypeResponse;
            companyTypeResponse = getCustomerCompanyTypes();

            const companyTypeResp = await companyTypeResponse;

            const companyTypeList = companyTypeResp.map((compTypes) => ({
                value: compTypes.companyTypeId, // using app's ID as the value
                label: compTypes.companyTypeName, // using app's name as the label
            }));

            setCompanyTypesOptions(companyTypeList);

            let geoTypeResponse;
            geoTypeResponse = getCustomerGeoTypes();

            const geoTypeResp = await geoTypeResponse;

            const geoTypeList = geoTypeResp.map((geoTypes) => ({
                value: geoTypes.geographyTypeId, // using app's ID as the value
                label: geoTypes.geographyTypeName, // using app's name as the label
            }));

            setGeoTypeOptions(geoTypeList);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };


    function formatFileSize(bytes, decimalPoint) {
        if (bytes == 0) return '0 Bytes';
        var k = 1000,
            dm = decimalPoint || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, 1)).toFixed(dm));
    }

    const inputFileChanged = (e) => {
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

    const handleContactClick = (id) => {

        setContactInfo((currentItems) => currentItems.filter(item => item.id !== id));

        if (contactInfo.length < 1) {
            setContactTableShow(false);
        }


    };


    const validation = useFormik({
        // enableReinitialize: use this flag when initial values need to be changed
        enableReinitialize: true,
        initialValues: {

            companyName: '',
            companyCode: '',
            website: '',
            businessType: '',
            companyType: '',
            faxNo: '',
            emailAddress: '',
            contactNo: '',
            gstNo: '',
            panNumber: '',
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({

            companyName: Yup.string().required("Please Fill Company Name"),
            companyCode: Yup.string().required("Please Fill Company Code"),
            website: Yup.string().required("Please Fill Company Website"),
            businessType: Yup.string().required("Select Business Type"),
            companyType: Yup.string().required("Select Company Type"),
            faxNo: Yup.string().required("Please Fill Fax Number"),
            emailAddress: Yup.string().email("Please Enter a Valid Email Address").required("Please Fill Email Address"),
            contactNo: Yup.string().required("Please Fill Contact Number"), // Corrected the error message
            gstNo: Yup.string().required("Please Enter GST Number"),
            panNumber: Yup.string().required("Please Enter PAN Number")

        }),

        onSubmit: (values) => {
            console.log("here", values);
            setCompanyInfo(values);
            setCompanyInfo_Bk(values);
            toggleTab(activeTab + 1);
        }
    });

    const validation2 = useFormik({

        enableReinitialize: true,
        initialValues: {
            address1: '',
            locality: '',
            postalCode: '',
            geographyType: '',
            geographyId: '',
            longitude: '',
            latitude: ''

        },
        validationSchema: Yup.object({
            address1: Yup.string().required("Please Fill Address1"),
            locality: Yup.string().required("Please Fill Locality"),
            postalCode: Yup.string().required("Please Fill Postal Code"),
            geographyType: Yup.string().required("Please Select Geography Type"),
            geographyId: Yup.string().required("Please Select Geography"),
            longitude: Yup.string().required("Please Fill Longitude"),
            latitude: Yup.string().required("Please Fill Latitude"),
        }),

        onSubmit: (values) => {
            setOfficeInfo(values);
            setOfficeInfo_Bk(values);
            toggleTab(activeTab + 1);

        }

    });

    const validation3 = useFormik({

        enableReinitialize: true,
        initialValues: {
            firstName: '',
            designation: '',
            cEmailAddress: '',
            cContactNumber: ''

        },
        validationSchema: Yup.object({
            firstName: Yup.string().required("Please Fill FirstName"),
            designation: Yup.string().required("Please Fill Designation"),
            cEmailAddress: Yup.string().required("Please Fill Email"),
            cContactNumber: Yup.string().required("Please Fill Contact No")
        }),

        onSubmit: (values) => {

            values.id = contactInfo.length + 1;

            setContactInfo(existingContact => [...existingContact, values]);
            setContactInfo_Bk(values);
            setContactTableShow(true);
            validation3.resetForm();
        }

    });
    const validationSubmit = useFormik({

        enableReinitialize: true,
        initialValues: {


        },
        validationSchema: Yup.object({

        }),

        onSubmit: async (values) => {

            const createContactJSON = () => {
                return contactInfo.map((info) => {
                    return {
                        firstName: info.firstName,
                        middleName: info.middleName,
                        lastName: info.lastName,
                        designation: info.designation,
                        contactNumber: info.cContactNumber,
                        alternateContactNumber: info.cAlternateContactNumber,
                        emailAddress: info.cEmailAddress,

                    };
                });
            };

            const customerData = {


                countryId: scountry,
                clientId: sclient,
                companyName: companyInfo.companyName,
                companyCode: companyInfo.companyCode,
                website: companyInfo.website,
                faxNo: companyInfo.faxNo,
                companyTypeId: companyInfo.companyType,
                businessTypeId: companyInfo.businessType,
                emailAddress: companyInfo.emailAddress,
                alternateEmailAddress: companyInfo.alternateEmailAddress,
                contactNumber: companyInfo.contactNo,
                alternateContactNumber: companyInfo.alternateContactNumber,
                gstNo: companyInfo.gstNo,
                panNo: companyInfo.panNumber,

                addressLine1: officeInfo.address1,
                addressLine2: officeInfo.address2,
                addressLine3: officeInfo.address3,
                locality: officeInfo.locality,
                postalCode: officeInfo.postalCode,
                longitude: officeInfo.longitude,
                latitude: officeInfo.latitude,
                geographyTypeId: officeInfo.geographyType,
                geographyId: officeInfo.geographyId,

                isDisabled: false,
                customerContact: createContactJSON(),
                requestUserName: username

            }
            const formData = new FormData();

            formData.append('logo', imgLogoData);
            formData.append("customerData", JSON.stringify(customerData));
            console.log(customerData);
            let response;
            response = postCustomerCreate(formData);
            var data = await response;

            if (data.responseCode === '-101') {

                setResponse(data.responseString);
                setSuccessModal(false);
                setErrorModal(true);

                validationSubmit.resetForm();
                validation2.resetForm();
                validation3.resetForm();
                validation.resetForm();
                setContactInfo([]);
                setImgLogoInput('');
                setActiveTab(1);
                toggleTab(1);


            } else {
                setResponse(data.responseString);
                setSuccessModal(true);
                setErrorModal(false);
                validationSubmit.resetForm();
                validation3.resetForm();
                validation2.resetForm();
                validation.resetForm();
                setContactInfo([]);
                setImgLogoInput('');
                setActiveTab(1);
                toggleTab(1);
            }
        }

    });

    function toggleTab(tab) {
        if (activeTab !== tab) {
            var modifiedSteps = [...passedSteps, tab];
            if (tab >= 1 && tab <= 4) {
                var process = tab * 20;
                setProgressBar(process);
                setActiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    document.title = "Supplier | eSoft Digital Platform";

    return (
        <React.Fragment>

            <ToastContainer closeButton={false}/>
            <SuccessModal
                show={successModal}
                onCloseClick={() => setSuccessModal(false)}
                successMsg={response}
            />
            <ErrorModal
                show={errorModal}
                onCloseClick={() => setErrorModal(false)}
                successMsg={response}
            />

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Supplier" pageTitle="Pages"/>

                    <Row>
                        <Col xl="12">
                            <div className="live-preview">
                                <Progress className="progress progress-xl mb-3" color="primary" value={progressBar}> {progressBar}% </Progress>
                            </div>
                            <Card>
                                <CardBody className="checkout-tab">
                                    <Form action="#">
                                        <div className="nav-pills nav-justified mt-n3 mx-n3 mb-3">
                                            <Nav
                                                className="nav nav-pills arrow-navtabs nav-primary bg-light mb-3"
                                                role="tablist"
                                            >
                                                <NavItem disabled role="presentation">
                                                    <NavLink href="#"
                                                             className={classnames({
                                                                 active: activeTab === 1,
                                                                 done: (activeTab <= 3 && activeTab >= 0)
                                                             }, "p-3 fs-15")}
                                                        // onClick={(e) => {
                                                        //     toggleTab(1);
                                                        //     e.preventDefault();
                                                        //     validation.handleSubmit();
                                                        //     return false;
                                                        // }}
                                                    >
                                                        <i className="ri-truck-line fs-16 p-2 bg-primary-subtle  rounded-circle align-middle me-2"></i>
                                                        Customer Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem disabled role="presentation">
                                                    <NavLink href="#"
                                                             className={classnames({
                                                                 active: activeTab === 2,
                                                                 done: activeTab <= 3 && activeTab > 1
                                                             }, "p-3 fs-15")}
                                                        // onClick={() => { toggleTab(2); }}
                                                    >
                                                        <i className="ri-building-line fs-16 p-2 bg-primary-subtle  rounded-circle align-middle me-2"> </i>
                                                        Office Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem disabled role="presentation">
                                                    <NavLink href="#"
                                                             className={classnames({
                                                                 active: activeTab === 3,
                                                                 done: activeTab <= 3 && activeTab > 2
                                                             }, "p-3 fs-15")}
                                                        // onClick={() => { toggleTab(3); }}
                                                    >
                                                        <i className="ri-phone-line fs-16 p-2 bg-primary-subtle  rounded-circle align-middle me-2"> </i>
                                                        Contact Information
                                                    </NavLink>
                                                </NavItem>




                                            </Nav>
                                        </div>

                                        <TabContent activeTab={activeTab}>

                                             <TabPane tabId={1} id="pills-bill-info">



                                                <div>
                                                    <Row>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="countryId"
                                                                    className="form-label"
                                                                >
                                                                    Country <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="select"
                                                                    className="form-control"
                                                                    id="countryId"
                                                                    name="countryId"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.countryId || ""}
                                                                    invalid={
                                                                        validation.touched.countryId &&
                                                                        validation.errors.countryId
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >

                                                                    {countryOptions.map((item, key) => (
                                                                        <React.Fragment key={key}>
                                                                            {<option value={item.value}
                                                                                     key={key}>{item.label}</option>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </Input>
                                                                {validation.touched.countryId &&
                                                                validation.errors.countryId ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.countryId}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>

                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="countryId"
                                                                    className="form-label"
                                                                >
                                                                    Client <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="select"
                                                                    className="form-control"
                                                                    id="clientId"
                                                                    name="clientId"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.clientId || ""}
                                                                    invalid={
                                                                        validation.touched.clientId &&
                                                                        validation.errors.clientId
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >

                                                                    {clientOptions.map((item, key) => (
                                                                        <React.Fragment key={key}>
                                                                            {<option value={item.value}
                                                                                     key={key}>{item.label}</option>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </Input>
                                                                {validation.touched.clientId &&
                                                                validation.errors.clientId ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.clientId}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>


                                                    </Row>

                                                    <Row>
                                                        <div>
                                                            <h5 className="mb-1">Customer Information</h5>
                                                            <p className="fw text-muted mb-4">
                                                                Please fill mandatory information below <span
                                                                className="text-danger">*</span>
                                                            </p>
                                                        </div>
                                                    </Row>
                                                    <Row>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="companyName"
                                                                        className="form-label"
                                                                    >
                                                                        Company Name <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="companyName"
                                                                        name="companyName"
                                                                        placeholder="Company Name"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.companyName || ""}
                                                                        invalid={
                                                                            validation.touched.companyName &&
                                                                            validation.errors.companyName
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.companyName &&
                                                                    validation.errors.companyName ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.companyName}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="companyCode"
                                                                    className="form-label"
                                                                >
                                                                    Company Code <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="companyCode"
                                                                    placeholder="Company Code"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.companyCode || ""}
                                                                    invalid={
                                                                        validation.touched.companyCode &&
                                                                        validation.errors.companyCode
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation.touched.companyCode &&
                                                                validation.errors.companyCode ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.companyCode}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="website"
                                                                        className="form-label"
                                                                    >
                                                                        Website <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="website"
                                                                        name="website"
                                                                        placeholder="Website"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.website || ""}
                                                                        invalid={
                                                                            validation.touched.website &&
                                                                            validation.errors.website
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.website &&
                                                                    validation.errors.website ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.website}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                    </Row>

                                                    <Row>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="businessType"
                                                                    className="form-label"
                                                                >
                                                                    Business Type <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="select"
                                                                    className="form-control"
                                                                    id="businessType"
                                                                    name="businessType"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.businessType || ""}
                                                                    invalid={
                                                                        validation.touched.businessType &&
                                                                        validation.errors.businessType
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >
                                                                    <option value={""}>Select Business Type</option>
                                                                    {busTypesOptions.map((item, key) => (
                                                                        <React.Fragment key={key}>
                                                                            {<option value={item.value}
                                                                                     key={key}>{item.label}</option>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </Input>
                                                                {validation.touched.businessType &&
                                                                validation.errors.businessType ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.businessType}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>


                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="companyType"
                                                                    className="form-label"
                                                                >
                                                                    Company Type <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="select"
                                                                    className="form-control"
                                                                    id="companyType"
                                                                    name="companyType"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.companyType || ""}
                                                                    invalid={
                                                                        validation.touched.companyType &&
                                                                        validation.errors.companyType
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >
                                                                    <option value={""}>Select Company Type</option>
                                                                    {companyTypesOptions.map((item, key) => (
                                                                        <React.Fragment key={key}>
                                                                            {<option value={item.value}
                                                                                     key={key}>{item.label}</option>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </Input>
                                                                {validation.touched.companyType &&
                                                                validation.errors.companyType ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation.errors.companyType}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="faxNo"
                                                                        className="form-label"
                                                                    >
                                                                        Fax Number <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="faxNo"
                                                                        name="faxNo"
                                                                        placeholder="Fax Number"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.faxNo || ""}
                                                                        invalid={
                                                                            validation.touched.faxNo &&
                                                                            validation.errors.faxNo
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.faxNo &&
                                                                    validation.errors.faxNo ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.faxNo}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                    </Row>

                                                    <Row>


                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="emailAddress"
                                                                        className="form-label"
                                                                    >
                                                                        Email Address <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="emailAddress"
                                                                        name="emailAddress"
                                                                        placeholder="Email Address"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.emailAddress || ""}
                                                                        invalid={
                                                                            validation.touched.emailAddress &&
                                                                            validation.errors.emailAddress
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.emailAddress &&
                                                                    validation.errors.emailAddress ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.emailAddress}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="alternateEmailAddress"
                                                                        className="form-label"
                                                                    >
                                                                        Alternate Email Address
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="alternateEmailAddress"
                                                                        name="alternateEmailAddress"
                                                                        placeholder="Alternate Email Address"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.alternateEmailAddress || ""}
                                                                        invalid={
                                                                            validation.touched.alternateEmailAddress &&
                                                                            validation.errors.alternateEmailAddress
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.alternateEmailAddress &&
                                                                    validation.errors.alternateEmailAddress ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.alternateEmailAddress}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="contactNo"
                                                                        className="form-label"
                                                                    >
                                                                        Contact Number <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="contactNo"
                                                                        name="contactNo"
                                                                        placeholder="Contact Number"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.contactNo || ""}
                                                                        invalid={
                                                                            validation.touched.contactNo &&
                                                                            validation.errors.contactNo
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.contactNo &&
                                                                    validation.errors.contactNo ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.contactNo}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                    </Row>

                                                    <Row>


                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="alternateContactNumber"
                                                                        className="form-label"
                                                                    >
                                                                        Alternate Contact Number
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="alternateContactNumber"
                                                                        name="alternateContactNumber"
                                                                        placeholder="Alternate Contact Number"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.alternateContactNumber || ""}
                                                                        invalid={
                                                                            validation.touched.alternateContactNumber &&
                                                                            validation.errors.alternateContactNumber
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.alternateContactNumber &&
                                                                    validation.errors.alternateContactNumber ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.alternateContactNumber}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="gstNo"
                                                                        className="form-label"
                                                                    >
                                                                        GST Number <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="gstNo"
                                                                        name="gstNo"
                                                                        placeholder="GST Number"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.gstNo || ""}
                                                                        invalid={
                                                                            validation.touched.gstNo &&
                                                                            validation.errors.gstNo
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.gstNo &&
                                                                    validation.errors.gstNo ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.gstNo}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>


                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="panNumber"
                                                                        className="form-label"
                                                                    >
                                                                        PAN Number <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="panNumber"
                                                                        name="panNumber"
                                                                        placeholder="PAN Number"
                                                                        onChange={validation.handleChange}
                                                                        onBlur={validation.handleBlur}
                                                                        value={validation.values.panNumber || ""}
                                                                        invalid={
                                                                            validation.touched.panNumber &&
                                                                            validation.errors.panNumber
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                    {validation.touched.panNumber &&
                                                                    validation.errors.panNumber ? (
                                                                        <FormFeedback type="invalid">
                                                                            {validation.errors.panNumber}
                                                                        </FormFeedback>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <div className="text-center">
                                                                <div
                                                                    className="profile-user position-relative d-inline-block mx-auto mb-4 avatar-xl mt-3">
                                                                    <Label

                                                                        className="form-label"
                                                                    >
                                                                        Logo <span
                                                                        className="text-danger">*</span>
                                                                    </Label>
                                                                    <img src={src}
                                                                         className="avatar-title rounded rounded-circle bg-danger-subtle text-danger fs-22 material-shadow"
                                                                         alt="customer-logo"/>
                                                                    <div
                                                                        className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                                        <Input id="customer-logo" type="file"
                                                                               className="profile-img-file-input"
                                                                               value={imgLogoInput}
                                                                               accept={Array.isArray('image/*') ? 'image/*'.join(',') : 'image/*'}
                                                                               capture={true}
                                                                               onChange={inputFileChanged}
                                                                        />
                                                                        <Label htmlFor="customer-logo"
                                                                               className="profile-photo-edit avatar-xs">
                                                                                <span
                                                                                    className="avatar-title rounded-circle bg-light text-body material-shadow">
                                                                                    <i className="ri-camera-fill"></i>
                                                                                </span>
                                                                        </Label>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </Col>
                                                    </Row>




                                                    <div className="d-flex align-items-start gap-3 mt-3">

                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-label right ms-auto nexttab"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                validation.handleSubmit();

                                                                return false;
                                                            }}>
                                                            <i className="ri-building-line label-icon align-middle fs-16 me-2"></i>
                                                            Proceed to Office Information
                                                        </button>
                                                    </div>
                                                </div>

                                            </TabPane>

                                            <TabPane tabId={2} id="pills-bill-info">

                                                <div>
                                                    <h5 className="mb-1">Office Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill mandatory information below <span
                                                        className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <div>

                                                    <Row>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="address1"
                                                                    className="form-label"
                                                                >
                                                                    Address Line1 <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="address1"
                                                                    name="address1"
                                                                    placeholder="Address Line1"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.address1 || ""}
                                                                    invalid={
                                                                        validation2.touched.address1 &&
                                                                        validation2.errors.address1
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation2.touched.address1 &&
                                                                validation2.errors.address1 ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.address1}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="address2"
                                                                    className="form-label"
                                                                >
                                                                    Address Line2
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="address2"
                                                                    name="address2"
                                                                    placeholder="Address Line2"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.address2 || ""}

                                                                />

                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="address3"
                                                                    className="form-label"
                                                                >
                                                                    Address Line3
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="address3"
                                                                    name="address3"
                                                                    placeholder="Address Line3"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.address3 || ""}

                                                                />

                                                            </FormGroup>
                                                        </Col>


                                                    </Row>

                                                    <Row>


                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="locality"
                                                                    className="form-label"
                                                                >
                                                                    Locality <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="locality"
                                                                    name="locality"
                                                                    placeholder="Locality"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.locality || ""}
                                                                    invalid={
                                                                        validation2.touched.locality &&
                                                                        validation2.errors.locality
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation2.touched.locality &&
                                                                validation2.errors.locality ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.locality}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>


                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="postalCode"
                                                                    className="form-label"
                                                                >
                                                                    Postal Code <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="postalCode"
                                                                    name="postalCode"
                                                                    placeholder="Postal Code"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.postalCode || ""}
                                                                    invalid={
                                                                        validation2.touched.postalCode &&
                                                                        validation2.errors.postalCode
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation2.touched.postalCode &&
                                                                validation2.errors.postalCode ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.postalCode}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="geographyType"
                                                                    className="form-label"
                                                                >
                                                                    Geography Type <span
                                                                    className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="select"
                                                                    className="form-control"
                                                                    id="geographyType"
                                                                    name="geographyType"
                                                                    onChange={validation2.handleChange}
                                                                    onChangeCapture={(value) => loadGeographyByGeoType(value)}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.geographyType || ""}
                                                                    invalid={
                                                                        validation2.touched.geographyType &&
                                                                        validation2.errors.geographyType
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >
                                                                    <option value="">Select Geography Type</option>
                                                                    {geoTypeOptions.map((item, key) => (
                                                                        <React.Fragment key={key}>
                                                                            {<option value={item.value}
                                                                                     key={key}>{item.label}</option>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </Input>
                                                                {validation2.touched.geographyType &&
                                                                validation2.errors.geographyType ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.geographyType}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>


                                                    </Row>


                                                    <Row>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="geographyId"
                                                                    className="form-label"
                                                                >
                                                                    Geography <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="select"
                                                                    className="form-control"
                                                                    id="geographyId"
                                                                    name="geographyId"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.geographyId || ""}
                                                                    invalid={
                                                                        validation2.touched.geographyId &&
                                                                        validation2.errors.geographyId
                                                                            ? true
                                                                            : false
                                                                    }
                                                                >
                                                                    <option value="">Select Geography</option>
                                                                    {geoOptions.map((item, key) => (
                                                                        <React.Fragment key={key}>
                                                                            {<option value={item.value}
                                                                                     key={key}>{item.label}</option>}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </Input>
                                                                {validation2.touched.geographyId &&
                                                                validation2.errors.geographyId ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.geographyId}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="longitude"
                                                                    className="form-label"
                                                                >
                                                                    Longitude<span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="longitude"
                                                                    name="longitude"
                                                                    placeholder="Longitude"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.longitude || ""}
                                                                    invalid={
                                                                        validation2.touched.longitude &&
                                                                        validation2.errors.longitude
                                                                            ? true
                                                                            : false
                                                                    }

                                                                />
                                                                {validation2.touched.longitude &&
                                                                validation2.errors.longitude ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.longitude}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="latitude"
                                                                    className="form-label"
                                                                >
                                                                    Latitude<span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="latitude"
                                                                    name="latitude"
                                                                    placeholder="Latitude"
                                                                    onChange={validation2.handleChange}
                                                                    onBlur={validation2.handleBlur}
                                                                    value={validation2.values.latitude || ""}
                                                                    invalid={
                                                                        validation2.touched.latitude &&
                                                                        validation2.errors.latitude
                                                                            ? true
                                                                            : false
                                                                    }

                                                                />
                                                                {validation2.touched.latitude &&
                                                                validation2.errors.latitude ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation2.errors.latitude}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>


                                                    </Row>


                                                    <div className="d-flex align-items-start gap-3 mt-3">
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-label previestab"
                                                            onClick={() => {
                                                                toggleTab(activeTab - 1);
                                                            }}
                                                        >
                                                            <i className="ri-truck-line label-icon align-middle fs-16 me-2"></i>
                                                            Back to Customer Info
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-label right ms-auto nexttab"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                validation2.handleSubmit();

                                                                return false;
                                                            }}>
                                                            <i className="ri-building-line label-icon align-middle fs-16 me-2"></i>
                                                            Proceed to Office Information
                                                        </button>
                                                    </div>
                                                </div>

                                            </TabPane>

                                            <TabPane tabId={3}>
                                                <div>
                                                    <h5 className="mb-1">Contact Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all information below
                                                    </p>
                                                </div>

                                                <div>
                                                    <Row>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="firstName"
                                                                    className="form-label"
                                                                >
                                                                    FirstName <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="firstName"
                                                                    name="firstName"
                                                                    placeholder="FirstName"
                                                                    onChange={validation3.handleChange}
                                                                    onBlur={validation3.handleBlur}
                                                                    value={validation3.values.firstName || ""}
                                                                    invalid={
                                                                        validation3.touched.firstName &&
                                                                        validation3.errors.firstName
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation3.touched.firstName &&
                                                                validation3.errors.firstName ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation3.errors.firstName}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <div className="mb-3 position-relative">
                                                                    <Label
                                                                        htmlFor="middleName"
                                                                        className="form-label"
                                                                    >
                                                                        Middle Name
                                                                    </Label>
                                                                    <Input
                                                                        type="text"
                                                                        className="form-control"
                                                                        id="middleName"
                                                                        name="middleName"
                                                                        placeholder="Middle Name"
                                                                        onChange={validation3.handleChange}
                                                                        onBlur={validation3.handleBlur}
                                                                        value={validation3.values.middleName || ""}

                                                                    />

                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="lastName"
                                                                    className="form-label"
                                                                >
                                                                    Last Name
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="lastName"
                                                                    placeholder="Last Name"
                                                                    onChange={validation3.handleChange}
                                                                    onBlur={validation3.handleBlur}
                                                                    value={validation3.values.lastName || ""}
                                                                />

                                                            </FormGroup>
                                                        </Col>


                                                    </Row>


                                                    <Row>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="designation"
                                                                    className="form-label"
                                                                >
                                                                    Designation<span className="text-danger">*</span>

                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="designation"
                                                                    name="designation"
                                                                    placeholder="Designation"
                                                                    onChange={validation3.handleChange}
                                                                    onBlur={validation3.handleBlur}
                                                                    value={validation3.values.designation || ""}
                                                                    invalid={
                                                                        validation3.touched.designation &&
                                                                        validation3.errors.designation
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation3.touched.designation &&
                                                                validation3.errors.designation ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation3.errors.designation}
                                                                    </FormFeedback>
                                                                ) : null}

                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="cContactNumber"
                                                                    className="form-label"
                                                                >
                                                                    Contact No <span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="cContactNumber"
                                                                    name="cContactNumber"
                                                                    maxLength={10}
                                                                    placeholder="Contact No"
                                                                    onChange={validation3.handleChange}
                                                                    onBlur={validation3.handleBlur}
                                                                    value={validation3.values.cContactNumber || ""}
                                                                    invalid={
                                                                        validation3.touched.cContactNumber &&
                                                                        validation3.errors.cContactNumber
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation3.touched.cContactNumber &&
                                                                validation3.errors.cContactNumber ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation3.errors.cContactNumber}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="cAlternateContactNumber"
                                                                    className="form-label"
                                                                >
                                                                    Alternate Contact
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="cAlternateContactNumber"
                                                                    name="cAlternateContactNumber"
                                                                    placeholder="Alternate Contact"
                                                                    maxLength={10}
                                                                    onChange={validation3.handleChange}
                                                                    onBlur={validation3.handleBlur}
                                                                    value={validation3.values.cAlternateContactNumber || ""}

                                                                />

                                                            </FormGroup>
                                                        </Col>


                                                    </Row>

                                                    <Row>
                                                        <Col sm={4}>
                                                            <FormGroup className="mb-10">
                                                                <Label
                                                                    htmlFor="cEmailAddress"
                                                                    className="form-label"
                                                                >
                                                                    Email<span className="text-danger">*</span>
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="cEmailAddress"
                                                                    name="cEmailAddress"
                                                                    placeholder="Email"
                                                                    onChange={validation3.handleChange}
                                                                    onBlur={validation3.handleBlur}
                                                                    value={validation3.values.cEmailAddress || ""}
                                                                    invalid={
                                                                        validation3.touched.cEmailAddress &&
                                                                        validation3.errors.cEmailAddress
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                                {validation3.touched.cEmailAddress &&
                                                                validation3.errors.cEmailAddress ? (
                                                                    <FormFeedback type="invalid">
                                                                        {validation3.errors.cEmailAddress}
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>


                                                        <Col sm={2}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-md btn-success mb-3"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    validation3.handleSubmit();
                                                                    return false;
                                                                }}
                                                            >
                                                                Add
                                                            </button>

                                                        </Col>


                                                    </Row>

                                                    <Row>
                                                        {contactTableShow &&
                                                            <Table className="table-nowrap mb-0 table-striped-columns">
                                                                <thead>
                                                                <tr>
                                                                    <th scope="col">FirstName</th>
                                                                    <th scope="col">MiddleName</th>
                                                                    <th scope="col">LastName</th>
                                                                    <th scope="col">Designation</th>
                                                                    <th scope="col">Email</th>
                                                                    <th scope="col">Contact</th>
                                                                    <th scope="col">Alternate Contact</th>
                                                                    <th scope="col">Action</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>

                                                                {contactInfo.map((item, index) => {
                                                                    return <tr key={item.id}>
                                                                        <td>{item.firstName}</td>
                                                                        <td>{item.middleName}</td>
                                                                        <td>{item.lastName}</td>
                                                                        <td>{item.designation}</td>
                                                                        <td>{item.cEmailAddress}</td>
                                                                        <td>{item.cContactNumber}</td>
                                                                        <td>{item.cAlternateContactNumber}</td>
                                                                        <td>
                                                                            <div className="hstack gap-3 fs-15">
                                                                                <Link to="#" className="link-primary"
                                                                                      onClick={() => handleContactClick(item.id)}><i
                                                                                    className="ri-delete-bin-line"></i></Link>
                                                                            </div>
                                                                        </td>
                                                                    </tr>;
                                                                })}
                                                                </tbody>
                                                            </Table>}
                                                    </Row>

                                                    <div className="d-flex align-items-start gap-3 mt-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-light btn-label previestab"
                                                            onClick={() => {
                                                                toggleTab(activeTab - 1);
                                                            }}
                                                        >
                                                            <i className="ri-building-line label-icon align-middle fs-16 me-2"></i>
                                                            Back to Office Info
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-label right ms-auto nexttab"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                validationSubmit.handleSubmit();
                                                                return false;
                                                            }}
                                                        >
                                                            <i className="ri-bank-line label-icon align-middle fs-16 ms-2"></i>
                                                            Save and Submit
                                                        </button>
                                                    </div>
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
const Status = ({status}) => {
    if (status == true) {
        return <span className="badge bg-info-subtle  text-info text-uppercase">yes</span>;
    } else {
        return <span className="badge bg-danger-subtle text-success text-uppercase">no</span>;
    }
};
const Gender = ({genderId}) => {

    if (genderId == 1) {
        return <span className="badge bg-info-subtle  text-info text-uppercase">Male</span>;
    }
    if (genderId == 2) {
        return <span className="badge bg-info-subtle  text-info text-uppercase">Female</span>;
    } else {
        return <span className="badge bg-danger-subtle text-success text-uppercase">Others</span>;
    }
};
export default CustomerMaster;
