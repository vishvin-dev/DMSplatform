import React, { useState, useEffect } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row, Label,
    Input, FormGroup
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { postconsumerupload } from '../../helpers/fakebackend_helper';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';

const ConsumerUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
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
        }
    }, []);

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
            if(document.getElementById('fileUpload')) {
                document.getElementById('fileUpload').value = "";
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred during upload';
            setResponse(errorMsg);
            setSuccessModal(false);
            setErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

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
        setSelectedFile(null);
        if(document.getElementById('fileUpload')) {
            document.getElementById('fileUpload').value = '';
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Consumer Upload" pageTitle="Consumer Details" />

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

                                    {/* Bulk Upload Content */}
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
                                                    Note: CSV should contain mandatory fields: RR No, Account ID, Consumer Name, Phone, Consumer Address, Zone, Division, Sub Division, Section
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="d-flex justify-content-end mt-4">
                                        <Button type="button" color="light" className="me-2" onClick={handleClear}>
                                            Clear
                                        </Button>
                                        <Button
                                            type="button"
                                            color="primary"
                                            onClick={handleBulkUpload}
                                            disabled={isLoading || !selectedFile}
                                        >
                                            {isLoading ? 'Uploading...' : (
                                                <>
                                                    <i className="ri-upload-2-line align-bottom me-1"></i>
                                                    Upload CSV
                                                </>
                                            )}
                                        </Button>
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