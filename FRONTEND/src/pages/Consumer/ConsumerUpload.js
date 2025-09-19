import React, { useState, useEffect } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row, Label, FormFeedback,
    Input, FormGroup, TabContent, TabPane, Nav, NavItem, NavLink
} from 'reactstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import classnames from 'classnames';
import { postconsumerupload, singleConsumerUpload, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';

const ConsumerUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [dropdownOptions, setDropdownOptions] = useState({
        divisions: [],
        subDivisions: [],
        sections: []
    });
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUserName] = useState('');

    document.title = `Consumer Upload | DMS`;

    useEffect(() => {
        // Get username from session storage
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        if (obj?.user?.Email) {
            setUserName(obj.user.Email);
            fetchDivisions(obj.user.Email);
        }
    }, []);

    const fetchDivisions = async (email) => {
        try {
            const response = await getAllUserDropDownss({
                flagId: 1,
                requestUserName: email
            });

            if (response.status === 'success') {
                setDropdownOptions(prev => ({
                    ...prev,
                    divisions: response.data.map(item => ({
                        id: item.div_code,
                        name: item.division
                    }))
                }));
            }
        } catch (error) {
            console.error('Error fetching divisions:', error);
        }
    };

    const fetchSubDivisions = async (divCode) => {
        try {
            const response = await getAllUserDropDownss({
                flagId: 2,
                requestUserName: username,
                div_code: divCode
            });

            if (response.status === 'success') {
                setDropdownOptions(prev => ({
                    ...prev,
                    subDivisions: response.data.map(item => ({
                        id: item.sd_code,
                        name: item.sub_division
                    })),
                    sections: [] // Clear sections when division changes
                }));
            }
        } catch (error) {
            console.error('Error fetching sub divisions:', error);
        }
    };

    const fetchSections = async (sdCode) => {
        try {
            const response = await getAllUserDropDownss({
                flagId: 3,
                requestUserName: username,
                sd_code: sdCode
            });

            if (response.status === 'success') {
                setDropdownOptions(prev => ({
                    ...prev,
                    sections: response.data.map(item => ({
                        id: item.so_code,
                        name: item.section_office
                    }))
                }));
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            singleConsumerForm.resetForm();
            setSelectedFile(null);
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) {
            setResponse('Please select a CSV file to upload');
            setErrorModal(true);
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('csvFile', selectedFile);
            formData.append('requestUserName', username);

            const response = await postconsumerupload(formData);

            if (response.status === 'success') {
                setResponse(response.message);
                setSuccessModal(true);
                setErrorModal(false);
            } else {
                setResponse(response.message);
                setSuccessModal(false);
                setErrorModal(true);
            }

            // Reset form
            setSelectedFile(null);
            document.getElementById('fileUpload').value = "";
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred during upload';
            setResponse(errorMsg);
            setSuccessModal(false);
            setErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const singleConsumerForm = useFormik({
        initialValues: {
            rr_no: '',
            account_id: '',
            consumer_name: '',
            phone: '',
            consumer_address: '', // Added consumer_address field
            zone: '',
            division: '',
            sub_division: '',
            section: ''
        },
        validationSchema: Yup.object({
            rr_no: Yup.string().required('RR No is required'),
            account_id: Yup.string().required('Account ID is required'),
            consumer_name: Yup.string().required('Consumer Name is required'),
            phone: Yup.string().required('Phone Number is required'),
            consumer_address: Yup.string().required('Consumer Address is required'), // Added validation
            zone: Yup.string().required('Zone is required'),
            division: Yup.string().required('Division is required'),
            sub_division: Yup.string().required('Sub Division is required'),
            section: Yup.string().required('Section is required')
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                // Prepare the payload with mandatory fields and null for others
                const payload = {
                    values: [[
                        values.rr_no,          // rr_no
                        values.account_id,      // account_id
                        values.consumer_name,   // consumer_name
                        values.consumer_address, // consumer_address (now from form)
                        null,                   // so_pincode
                        null,                   // sd_pincode
                        null,                   // meter_type
                        null,                   // latitude
                        null,                   // longitude
                        null,                   // tariff
                        null,                   // mrcode
                        null,                   // gescom
                        values.zone,            // zone
                        null,                   // circle
                        values.division,        // division
                        values.section,         // section
                        values.sub_division,    // sub_division
                        null,                   // read_date
                        null,                   // sp_id
                        null,                   // feeder_name
                        null,                   // feeder_code
                        null,                   // old_meter_serial
                        values.phone,           // phone
                        null,                   // phase_type (now null)
                        null                    // category
                    ]],
                    requestUserName: username
                };

                const response = await singleConsumerUpload(payload);

                if (response.success) {
                    setResponse(response.message);
                    setSuccessModal(true);
                    singleConsumerForm.resetForm();
                } else {
                    setResponse(response.message || 'Failed to submit consumer data');
                    setErrorModal(true);
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || 'An error occurred during submission';
                setResponse(errorMsg);
                setErrorModal(true);
            } finally {
                setIsLoading(false);
            }
        },
    });


    //     const singleConsumerForm = useFormik({
    //     initialValues: {
    //         rr_no: '',
    //         account_id: '',
    //         consumer_name: '',
    //         phone: '',
    //         phase_type: '',
    //         zone: '',
    //         division: '',
    //         sub_division: '',
    //         section: ''
    //     },
    //     validationSchema: Yup.object({
    //         rr_no: Yup.string().required('RR No is required'),
    //         account_id: Yup.string().required('Account ID is required'),
    //         consumer_name: Yup.string().required('Consumer Name is required'),
    //         phone: Yup.string().required('Phone Number is required'),
    //         phase_type: Yup.string().required('Phase Type is required'),
    //         zone: Yup.string().required('Zone is required'),
    //         division: Yup.string().required('Division is required'),
    //         sub_division: Yup.string().required('Sub Division is required'),
    //         section: Yup.string().required('Section is required')
    //     }),
    //     onSubmit: async (values) => {
    //         setIsLoading(true);
    //         try {
    //             // Prepare the payload with field names and values
    //             const payload = {
    //                 values: [{
    //                     rr_no: values.rr_no,
    //                     account_id: values.account_id,
    //                     consumer_name: values.consumer_name,
    //                     consumer_address: null,
    //                     so_pincode: null,
    //                     sd_pincode: null,
    //                     meter_type: null,
    //                     latitude: null,
    //                     longitude: null,
    //                     tariff: null,
    //                     mrcode: null,
    //                     gescom: null,
    //                     zone: values.zone,
    //                     circle: null,
    //                     division: values.division,
    //                     section: values.section,
    //                     sub_division: values.sub_division,
    //                     read_date: null,
    //                     sp_id: null,
    //                     feeder_name: null,
    //                     feeder_code: null,
    //                     old_meter_serial: null,
    //                     phone: values.phone,
    //                     phase_type: values.phase_type,
    //                     category: null
    //                 }],
    //                 requestUserName: username
    //             };

    //             const response = await singleConsumerUpload(payload);

    //             if (response.success) {
    //                 setResponse(response.message);
    //                 setSuccessModal(true);
    //                 singleConsumerForm.resetForm();
    //             } else {
    //                 setResponse(response.message || 'Failed to submit consumer data');
    //                 setErrorModal(true);
    //             }
    //         } catch (error) {
    //             const errorMsg = error.response?.data?.message || error.message || 'An error occurred during submission';
    //             setResponse(errorMsg);
    //             setErrorModal(true);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     },
    // });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                setResponse('Only CSV files are allowed');
                setErrorModal(true);
                event.target.value = '';
            }
        }
    };

    const handleClear = () => {
        if (activeTab === '1') {
            setSelectedFile(null);
            document.getElementById('fileUpload').value = '';
        } else {
            singleConsumerForm.resetForm();
        }
    };

    // Handle division change to fetch sub divisions
    const handleDivisionChange = (e) => {
        singleConsumerForm.handleChange(e);
        const divCode = e.target.value;
        singleConsumerForm.setFieldValue('sub_division', '');
        singleConsumerForm.setFieldValue('section', '');
        if (divCode) {
            fetchSubDivisions(divCode);
        } else {
            setDropdownOptions(prev => ({
                ...prev,
                subDivisions: [],
                sections: []
            }));
        }
    };

    // Handle sub division change to fetch sections
    const handleSubDivisionChange = (e) => {
        singleConsumerForm.handleChange(e);
        const sdCode = e.target.value;
        singleConsumerForm.setFieldValue('section', '');
        if (sdCode) {
            fetchSections(sdCode);
        } else {
            setDropdownOptions(prev => ({
                ...prev,
                sections: []
            }));
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Consumer Upload" pageTitle="Consumer Details"/>

                    {/* Modals for success and error messages */}
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

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-primary text-white p-3">
                                    <h4 className="mb-0 card-title text-white">Consumer Upload</h4>
                                </CardHeader>
                                <CardBody className="checkout-tab">
                                    <Nav
                                        className="nav nav-pills arrow-navtabs nav-primary mb-4"
                                        role="tablist"
                                        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
                                    >
                                        <NavItem role="presentation" className="flex-grow-1" style={{ minWidth: '200px' }}>
                                            <NavLink
                                                className={classnames(
                                                    "p-3 fs-16 d-flex align-items-center justify-content-center",
                                                    { active: activeTab === '1', 'bg-primary text-white': activeTab === '1' }
                                                )}
                                                onClick={() => toggleTab('1')}
                                                style={{
                                                    width: '60%',
                                                    height: '80%',
                                                    borderRadius: '8px',
                                                    margin: '4px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                
                                                <i className="ri-upload-cloud-line fs-18 p-2 bg-primary-subtle rounded-circle me-2"></i>
                                                <span className="d-none d-md-inline">Bulk Upload</span>
                                            </NavLink>
                                        </NavItem>

                                        <NavItem role="presentation" className="flex-grow-1" style={{ minWidth: '200px' }}>
                                            <NavLink
                                                className={classnames(
                                                    "p-3 fs-16 d-flex align-items-center justify-content-center",
                                                    { active: activeTab === '2', 'bg-primary text-white': activeTab === '2' }
                                                )}
                                                onClick={() => toggleTab('2')}
                                                style={{
                                                    width: '60%',
                                                    height: '80%',
                                                    borderRadius: '8px',
                                                    margin: '4px',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <i className="ri-user-line fs-18 p-2 bg-primary-subtle rounded-circle me-2"></i>
                                                <span className="d-none d-md-inline">Single Upload</span>
                                            </NavLink>
                                        </NavItem>
                                    </Nav>

                                    <TabContent activeTab={activeTab}>
                                        {/* Bulk Upload Tab */}
                                        <TabPane tabId="1">
                                            <div className="mt-3">
                                                <h5 className="mb-1">Bulk Consumer Upload</h5>
                                                <p className="text-muted mb-4">
                                                    Upload a CSV file containing consumer data <span className="text-danger">*</span>
                                                </p>

                                                <Row>
                                                    <Col md={6}>
                                                        <FormGroup className="mb-3">
                                                            <Label>CSV File <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="file"
                                                                className="form-control"
                                                                id="fileUpload"
                                                                onChange={handleFileChange}
                                                                accept=".csv"
                                                            />
                                                            {selectedFile && (
                                                                <div className="mt-2">
                                                                    <small className="text-muted">
                                                                        Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                        <div className="text-muted small mb-3">
                                                            Note: CSV should contain mandatory fields: RR No, Account ID, Consumer Name, Phone, Phase Type, Zone, Division, Sub Division, Section
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </TabPane>

                                        {/* Single Upload Tab */}
                                        <TabPane tabId="2">
                                            <div className="mt-3">
                                                <h5 className="mb-1">Single Consumer Upload</h5>
                                                <p className="text-muted mb-4">
                                                    Enter mandatory consumer details <span className="text-danger">*</span>
                                                </p>

                                                <form onSubmit={singleConsumerForm.handleSubmit}>
                                                    <Row>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>RR No <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="rr_no"
                                                                    type="text"
                                                                    placeholder="RR No"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.rr_no}
                                                                    invalid={singleConsumerForm.touched.rr_no && !!singleConsumerForm.errors.rr_no}
                                                                />
                                                                {singleConsumerForm.touched.rr_no && singleConsumerForm.errors.rr_no ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.rr_no}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Account ID <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="account_id"
                                                                    type="text"
                                                                    placeholder="Account ID"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.account_id}
                                                                    invalid={singleConsumerForm.touched.account_id && !!singleConsumerForm.errors.account_id}
                                                                />
                                                                {singleConsumerForm.touched.account_id && singleConsumerForm.errors.account_id ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.account_id}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Phone Number <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="phone"
                                                                    type="text"
                                                                    placeholder="Phone Number"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.phone}
                                                                    invalid={singleConsumerForm.touched.phone && !!singleConsumerForm.errors.phone}
                                                                />
                                                                {singleConsumerForm.touched.phone && singleConsumerForm.errors.phone ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.phone}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Consumer Name<span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="consumer_name"
                                                                    type="text"
                                                                    placeholder="Consumer Name"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.consumer_name}
                                                                    invalid={singleConsumerForm.touched.consumer_name && !!singleConsumerForm.errors.consumer_name}
                                                                />
                                                                {singleConsumerForm.touched.consumer_name && singleConsumerForm.errors.consumer_name ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.consumer_name}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Consumer Address<span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="consumer_address"
                                                                    type="textarea"
                                                                    placeholder="Consumer Address"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.consumer_address}
                                                                    invalid={singleConsumerForm.touched.consumer_address && !!singleConsumerForm.errors.consumer_address}
                                                                />
                                                                {singleConsumerForm.touched.consumer_address && singleConsumerForm.errors.consumer_address ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.consumer_address}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Zone<span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="zone"
                                                                    type="text"
                                                                    placeholder="Enter Zone"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.zone}
                                                                    invalid={singleConsumerForm.touched.zone && !!singleConsumerForm.errors.zone}
                                                                />
                                                                {singleConsumerForm.touched.zone && singleConsumerForm.errors.zone ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.zone}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>


                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Division <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="division"
                                                                    onChange={handleDivisionChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.division}
                                                                    invalid={singleConsumerForm.touched.division && !!singleConsumerForm.errors.division}
                                                                >
                                                                    <option value="">Select Division</option>
                                                                    {dropdownOptions.divisions.map(division => (
                                                                        <option key={division.id} value={division.id}>{division.name}</option>
                                                                    ))}
                                                                </Input>
                                                                {singleConsumerForm.touched.division && singleConsumerForm.errors.division ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.division}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Sub Division <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="sub_division"
                                                                    onChange={handleSubDivisionChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.sub_division}
                                                                    invalid={singleConsumerForm.touched.sub_division && !!singleConsumerForm.errors.sub_division}
                                                                    disabled={!singleConsumerForm.values.division}
                                                                >
                                                                    <option value="">Select Sub Division</option>
                                                                    {dropdownOptions.subDivisions.map(subDivision => (
                                                                        <option key={subDivision.id} value={subDivision.id}>{subDivision.name}</option>
                                                                    ))}
                                                                </Input>
                                                                {singleConsumerForm.touched.sub_division && singleConsumerForm.errors.sub_division ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.sub_division}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Section <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="section"
                                                                    onChange={singleConsumerForm.handleChange}
                                                                    onBlur={singleConsumerForm.handleBlur}
                                                                    value={singleConsumerForm.values.section}
                                                                    invalid={singleConsumerForm.touched.section && !!singleConsumerForm.errors.section}
                                                                    disabled={!singleConsumerForm.values.sub_division}
                                                                >
                                                                    <option value="">Select Section</option>
                                                                    {dropdownOptions.sections.map(section => (
                                                                        <option key={section.id} value={section.id}>{section.name}</option>
                                                                    ))}
                                                                </Input>
                                                                {singleConsumerForm.touched.section && singleConsumerForm.errors.section ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleConsumerForm.errors.section}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </form>
                                            </div>
                                        </TabPane>
                                    </TabContent>

                                    <div className="d-flex justify-content-end mt-4">
                                        <Button type="button" color="light" className="me-2" onClick={handleClear}>
                                            Clear
                                        </Button>
                                        {activeTab === '1' ? (
                                            <Button
                                                type="button"
                                                color="primary"
                                                onClick={handleBulkUpload}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Uploading...' : (
                                                    <>
                                                        <i className="ri-upload-2-line align-bottom me-1"></i>
                                                        Upload CSV
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                color="primary"
                                                onClick={singleConsumerForm.handleSubmit}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Submitting...' : (
                                                    <>
                                                        <i className="ri-upload-2-line align-bottom me-1"></i>
                                                        Submit Consumer
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default ConsumerUpload;