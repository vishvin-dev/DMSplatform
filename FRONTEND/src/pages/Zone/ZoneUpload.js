import React, { useState, useEffect } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row, Label, FormFeedback,
    Input, FormGroup, TabContent, TabPane, Nav, NavItem, NavLink
} from 'reactstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import classnames from 'classnames';
import { postzoneupload, singleZoneUpload, getAllUserDropDownss } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';

const ZoneUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [dropdownOptions, setDropdownOptions] = useState({
        divisions: [],
        subDivisions: [],
        sectionOffices: []
    });
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUserName] = useState('');
    const [isDropdownLoading, setIsDropdownLoading] = useState(false);

    document.title = `Zone Upload | DMS`;

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.Email;
        setUserName(usernm);
        
        // Fetch divisions (flagId: 1)
        fetchDivisions(usernm);
    }, []);

    const fetchDivisions = async (username) => {
        setIsDropdownLoading(true);
        try {
            const response = await getAllUserDropDownss({
                flagId: 1,
                requestUserName: username
            });

            if (response.status === 'success') {
                const divisions = response.data.map(item => ({
                    id: item.div_code,
                    name: item.division,
                    div_code: item.div_code
                }));
                
                setDropdownOptions(prev => ({
                    ...prev,
                    divisions
                }));
            }
        } catch (error) {
            setResponse(error.message || 'Failed to fetch divisions');
            setErrorModal(true);
        } finally {
            setIsDropdownLoading(false);
        }
    };

    const fetchSubDivisions = async (div_code, username) => {
        setIsDropdownLoading(true);
        try {
            const response = await getAllUserDropDownss({
                flagId: 2,
                requestUserName: username,
                div_code: div_code
            });

            if (response.status === 'success') {
                const subDivisions = response.data.map(item => ({
                    id: item.sd_code,
                    name: item.sub_division,
                    sd_code: item.sd_code,
                    divisionId: div_code
                }));
                
                setDropdownOptions(prev => ({
                    ...prev,
                    subDivisions
                }));
            }
        } catch (error) {
            setResponse(error.message || 'Failed to fetch sub divisions');
            setErrorModal(true);
        } finally {
            setIsDropdownLoading(false);
        }
    };

    const fetchSectionOffices = async (sd_code, username) => {
        setIsDropdownLoading(true);
        try {
            const response = await getAllUserDropDownss({
                flagId: 3,
                requestUserName: username,
                sd_code: sd_code
            });

            if (response.status === 'success') {
                const sectionOffices = response.data.map(item => ({
                    id: item.so_code,
                    name: item.section_office,
                    so_code: item.so_code,
                    subDivisionId: sd_code
                }));
                
                setDropdownOptions(prev => ({
                    ...prev,
                    sectionOffices
                }));
            }
        } catch (error) {
            setResponse(error.message || 'Failed to fetch section offices');
            setErrorModal(true);
        } finally {
            setIsDropdownLoading(false);
        }
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            singleEntryForm.resetForm();
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
            formData.append('requestUsername', username); 

            const response = await postzoneupload(formData);

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
            setResponse(error.message || 'An error occurred during upload');
            setSuccessModal(false);
            setErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const singleEntryForm = useFormik({
        initialValues: {
            package: '',
            division: '',
            div_code: '',
            sub_division: '',
            sd_code: '',
            section_office: '',
            so_code: ''
        },
        validationSchema: Yup.object({
            package: Yup.string().required('Package is required'),
            division: Yup.string().required('Division is required'),
            div_code: Yup.string().required('Division Code is required'),
            sub_division: Yup.string().required('Sub Division is required'),
            sd_code: Yup.string().required('Sub Division Code is required'),
            section_office: Yup.string().required('Section Office is required'),
            so_code: Yup.string().required('Section Office Code is required')
        }),
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                // Prepare the request body according to API requirements
                const requestData = {
                    values: [
                        [
                            values.package,
                            values.division,
                            values.div_code,
                            values.sub_division,
                            values.sd_code,
                            values.section_office,
                            values.so_code
                        ]
                    ],
                    requestUserName: username
                };

                const response = await singleZoneUpload(requestData);
                
                if (response.success) {
                    setResponse(response.message || "Zone data uploaded successfully");
                    setSuccessModal(true);
                    singleEntryForm.resetForm();
                } else {
                    setResponse(response.message || "Submission failed");
                    setErrorModal(true);
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message
                    || error.message
                    || "Submission failed";
                setResponse(`Submission failed: ${errorMsg}`);
                setErrorModal(true);
            } finally {
                setIsLoading(false);
            }
        },
    });

    const handleDivisionChange = (e) => {
        const selectedDivision = dropdownOptions.divisions.find(
            div => div.id === e.target.value
        );
        
        singleEntryForm.setFieldValue('division', e.target.value);
        singleEntryForm.setFieldValue('div_code', selectedDivision?.div_code || '');
        singleEntryForm.setFieldValue('sub_division', '');
        singleEntryForm.setFieldValue('sd_code', '');
        singleEntryForm.setFieldValue('section_office', '');
        singleEntryForm.setFieldValue('so_code', '');
        
        if (e.target.value) {
            fetchSubDivisions(e.target.value, username);
        }
    };

    const handleSubDivisionChange = (e) => {
        const selectedSubDivision = dropdownOptions.subDivisions.find(
            subDiv => subDiv.id === e.target.value
        );
        
        singleEntryForm.setFieldValue('sub_division', e.target.value);
        singleEntryForm.setFieldValue('sd_code', selectedSubDivision?.sd_code || '');
        singleEntryForm.setFieldValue('section_office', '');
        singleEntryForm.setFieldValue('so_code', '');
        
        if (e.target.value) {
            fetchSectionOffices(e.target.value, username);
        }
    };

    const handleSectionOfficeChange = (e) => {
        const selectedSectionOffice = dropdownOptions.sectionOffices.find(
            office => office.id === e.target.value
        );
        
        singleEntryForm.setFieldValue('section_office', e.target.value);
        singleEntryForm.setFieldValue('so_code', selectedSectionOffice?.so_code || '');
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                setResponse('Please upload a valid CSV file');
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
            singleEntryForm.resetForm();
        }
    };

    // Filter dropdown options based on selections
    const filteredSubDivisions = dropdownOptions.subDivisions.filter(
        subDiv => subDiv.divisionId === singleEntryForm.values.division
    );

    const filteredSectionOffices = dropdownOptions.sectionOffices.filter(
        office => office.subDivisionId === singleEntryForm.values.sub_division
    );

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Zone Upload" pageTitle="Consumer Details" />

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
                                    <h4 className="mb-0 card-title text-white">Zone Upload</h4>
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
                                                <h5 className="mb-1">Bulk Zone Upload</h5>
                                                <p className="text-muted mb-4">
                                                    Upload a CSV file containing zone data <span className="text-danger">*</span>
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
                                                            Note: CSV should contain columns: package, division, div_code, sub_division, sd_code, section_office, so_code
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </TabPane>

                                        {/* Single Upload Tab */}
                                        <TabPane tabId="2">
                                            <div className="mt-3">
                                                <h5 className="mb-1">Single Zone Entry</h5>
                                                <p className="text-muted mb-4">
                                                    Enter zone details manually <span className="text-danger">*</span>
                                                </p>

                                                <form onSubmit={singleEntryForm.handleSubmit}>
                                                    <Row>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Package <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="package"
                                                                    type="text"
                                                                    placeholder="Enter Package Name"
                                                                    onChange={singleEntryForm.handleChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.package}
                                                                    invalid={singleEntryForm.touched.package && !!singleEntryForm.errors.package}
                                                                />
                                                                {singleEntryForm.touched.package && singleEntryForm.errors.package ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.package}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Division <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="division"
                                                                    onChange={handleDivisionChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.division}
                                                                    invalid={singleEntryForm.touched.division && !!singleEntryForm.errors.division}
                                                                    disabled={isDropdownLoading}
                                                                >
                                                                    <option value="">Select Division</option>
                                                                    {dropdownOptions.divisions.map(div => (
                                                                        <option key={div.id} value={div.id}>{div.name}</option>
                                                                    ))}
                                                                </Input>
                                                                {singleEntryForm.touched.division && singleEntryForm.errors.division ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.division}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Division Code <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="div_code"
                                                                    type="text"
                                                                    placeholder="Division Code"
                                                                    onChange={singleEntryForm.handleChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.div_code}
                                                                    invalid={singleEntryForm.touched.div_code && !!singleEntryForm.errors.div_code}
                                                                    readOnly
                                                                />
                                                                {singleEntryForm.touched.div_code && singleEntryForm.errors.div_code ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.div_code}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>       
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Sub Division <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="sub_division"
                                                                    onChange={handleSubDivisionChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.sub_division}
                                                                    invalid={singleEntryForm.touched.sub_division && !!singleEntryForm.errors.sub_division}
                                                                    disabled={!singleEntryForm.values.division || isDropdownLoading}
                                                                >
                                                                    <option value="">Select Sub Division</option>
                                                                    {filteredSubDivisions.map(subDiv => (
                                                                        <option key={subDiv.id} value={subDiv.id}>{subDiv.name}</option>
                                                                    ))}
                                                                </Input>
                                                                {singleEntryForm.touched.sub_division && singleEntryForm.errors.sub_division ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.sub_division}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Sub Division Code (sd_code) <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="sd_code"
                                                                    type="text"
                                                                    placeholder="Sub Division Code"
                                                                    onChange={singleEntryForm.handleChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.sd_code}
                                                                    invalid={singleEntryForm.touched.sd_code && !!singleEntryForm.errors.sd_code}
                                                                    readOnly
                                                                />
                                                                {singleEntryForm.touched.sd_code && singleEntryForm.errors.sd_code ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.sd_code}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Section Office <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    type="select"
                                                                    name="section_office"
                                                                    onChange={handleSectionOfficeChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.section_office}
                                                                    invalid={singleEntryForm.touched.section_office && !!singleEntryForm.errors.section_office}
                                                                    disabled={!singleEntryForm.values.sub_division || isDropdownLoading}
                                                                >
                                                                    <option value="">Select Section Office</option>
                                                                    {filteredSectionOffices.map(office => (
                                                                        <option key={office.id} value={office.id}>{office.name}</option>
                                                                    ))}
                                                                </Input>
                                                                {singleEntryForm.touched.section_office && singleEntryForm.errors.section_office ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.section_office}
                                                                    </div>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Section Office Code (so_code) <span className="text-danger">*</span></Label>
                                                                <Input
                                                                    name="so_code"
                                                                    type="text"
                                                                    placeholder="Section Office Code"
                                                                    onChange={singleEntryForm.handleChange}
                                                                    onBlur={singleEntryForm.handleBlur}
                                                                    value={singleEntryForm.values.so_code}
                                                                    invalid={singleEntryForm.touched.so_code && !!singleEntryForm.errors.so_code}
                                                                    readOnly
                                                                />
                                                                {singleEntryForm.touched.so_code && singleEntryForm.errors.so_code ? (
                                                                    <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                        {singleEntryForm.errors.so_code}
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
                                                onClick={singleEntryForm.handleSubmit}
                                                disabled={isLoading || isDropdownLoading}
                                            >
                                                {isLoading ? 'Submitting...' : (
                                                    <>
                                                        <i className="ri-upload-2-line align-bottom me-1"></i>
                                                        Submit Data
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

export default ZoneUpload;