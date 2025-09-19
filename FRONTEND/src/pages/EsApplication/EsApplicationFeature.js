import React, {useState, useEffect, useMemo} from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Form, Modal, Input, FormGroup
} from 'reactstrap';

import TableContainer from "../../Components/Common/TableContainerReactTable";

import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import {ToastContainer} from 'react-toastify';
import Select from "react-select";

import {Link, useFetcher} from 'react-router-dom';
import * as Yup from "yup";
import {useFormik} from "formik";

import {
    getAllEsAppFeatureApps,
    postAppFeatureCreate,
    putEsAppFeatureUpdate,
    getEsAppFeatureById,
    getAllEsAppFeature, getAllEsApplication,

} from "../../helpers/fakebackend_helper";

const EsApplicationFeature = () => {

    const [data, setData] = useState([]);
    const [submitVal, setSubmitVal] = useState('Save');
    const [buttonval, setbuttonval] = useState('Add Application Feature');
    const [response, setResponse] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [modal_list, setmodal_list] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [edit_items, setedit_items] = useState([]);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [selectedSingle, setSelectedSingle] = useState(null);
    const [name, setName] = useState('');
    const [checkedText, setCheckedText] = React.useState('');
    const [options, setOptions] = useState([]);

    const tog_list = () => {
        setedit_update(false);
        setedit_items([]);
        setbuttonval('Add Application Feature');
        setSubmitVal('Save');
        setmodal_list(!modal_list);
    };

    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);
        tog_list();
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update Application Feature')
        setSubmitVal('Update')
    }


    //load table data
    useEffect( () => {
        async function getOnLoadingData(){
            const obj = JSON.parse(sessionStorage.getItem("authUser"));

            let response;
            response = getAllEsAppFeature();

            var allAppFeature = await response;

            var usernm = obj.data.username;
            setData(allAppFeature);
            setDataBk(allAppFeature);
            setUserName(usernm);


            let allApps;
            allApps = getAllEsAppFeatureApps();
            const respDd = await allApps;

            const esAppsOptions = respDd.map((apps) => ({
                value: apps.applicationId, // using app's ID as the value
                label: apps.applicationName, // using app's name as the label
            }));
            setOptions(esAppsOptions);
        }
        getOnLoadingData();
    }, []);

    // Form validation
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            applicationFeatureId: edit_items.applicationFeatureId || "",
            applicationId: edit_items.applicationId || "",
            applicationFeatureName: edit_items.applicationFeatureName || "",
            applicationFeatureCode: edit_items.applicationFeatureCode || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            applicationFeatureName: Yup.string().required("Please Enter Your Application Feature Name"),
            applicationFeatureCode: Yup.string().required("Please Enter Your Application Feature Code"),
            applicationId: Yup.string().required("Please Select Your Application Name")

        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putEsAppFeatureUpdate({
                        applicationId: values.applicationId,
                        applicationFeatureId: edit_items.applicationFeatureId,
                        applicationFeatureName: values.applicationFeatureName,
                        applicationFeatureCode: values.applicationFeatureCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {

                    response = postAppFeatureCreate({
                        applicationId: values.applicationId,
                        applicationFeatureName: values.applicationFeatureName,
                        applicationFeatureCode: values.applicationFeatureCode,
                        isDisabled: false,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    let response = getAllEsAppFeature();
                    var allAppFeatures = await response;
                    setedit_update(false);
                    setedit_items('')
                    setbuttonval('Add Application Feature')
                    setSubmitVal('Save');
                    setData(allAppFeatures);
                    setDataBk(allAppFeatures);
                    tog_list();
                    values.applicationFeatureName = "";
                    values.applicationFeatureCode = "";
                    values.applicationId = "";

                    if (data.responseCode === '-101') {
                        setResponse(data.responseString);
                        setSuccessModal(false);
                        setErrorModal(true);

                    } else {
                        setResponse(data.responseString);
                        setSuccessModal(true);
                        setErrorModal(false);
                    }
validation.resetForm();
                    // toast.success(data.responseString, { autoClose: 3000 });
                }

            } catch (error) {
                setSuccessModal(false);
                setErrorModal(true);
            }
        }
    });

    const columns = useMemo(
        () => [
            {
                header: 'ApplicationName',
                accessorKey: 'applicationName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'ApplicationFeatureName',
                accessorKey: 'applicationFeatureName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'ApplicationFeatureCode',
                accessorKey: 'applicationFeatureCode',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'CreatedOn',
                accessorKey: 'requestDate',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'CreatedBy',
                accessorKey: 'requestUserName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                disableFilters: false,
                enableColumnFilter: false,

                cell: (cell) => {
                    if (cell.getValue() === true) {
                        return (
                            <span className="badge bg-danger-subtle  text-danger text-uppercase"> {"InActive"}</span>);
                    } else {
                        return (
                            <span className="badge bg-success-subtle text-success text-uppercase"> {"Active"}</span>);
                    }

                },
            },
            {
                header: 'Action',
                accessorKey: 'applicationFeatureId',
                disableFilters: false,
                enableColumnFilter: false,
                cell: (data) => {

                    return (
                        <div className="d-flex gap-2">
                            <div className="edit">
                                <button className="btn btn-sm btn-primary edit-item-btn" onClick={() =>
                                    updateRow(data)}
                                        data-bs-toggle="modal" data-bs-target="#showModal"><i
                                    className="ri-edit-2-line"></i></button>

                            </div>

                        </div>)
                }
            },
        ],
        []
    );

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.applicationFeatureName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Application Feature | eSoft Digital Platform";

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
                    <BreadCrumb title="Application Feature" pageTitle="Applications"/>
                    <Row>
                        <Col lg={12}>

                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success"
                                                    className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Application Feature
                                                </h4>
                                            </div>
                                        </Col>

                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Row className="g-4 mb-3">
                                        <Col className="col-sm-2">
                                            <div className="search-box ms-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="searchResultList"
                                                    placeholder="Search for Application Feature..."
                                                    onKeyUp={(e) => filter(e)}
                                                />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>

                                        </Col>
                                        <Col className="col-sm">
                                            <div className="d-flex justify-content-sm-end">
                                                <div>
                                                    <Button color="primary" className="add-btn me-1 btn-primary"
                                                            onClick={() => tog_list()} id="create-btn"><i
                                                        className="ri-add-line align-bottom me-1"></i> Add</Button>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={12}>
                                            <TableContainer
                                                columns={(columns || [])}
                                                data={(data || [])}
                                                isPagination={true}
                                                isGlobalFilter={false}
                                                iscustomPageSize={true}
                                                isBordered={true}
                                                customPageSize={5}

                                                tableClass="table table-responsive table-card mt-3 mb-1"
                                                theadClass="table-light gridjs-thead"

                                            />
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>


                        </Col>

                    </Row>
                </Container>
            </div>

            <Modal isOpen={modal_list} toggle={() => {
                tog_list();
            }} centered>
                <ModalHeader className="card-primary text-white p-3" toggle={() => {
                    tog_list();
                }}>
                    <span className="modal-title text-white">
                        {buttonval}
                    </span>
                </ModalHeader>
                <form className="tablelist-form"
                      onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                      }}>
                    <ModalBody>
                        <div className="mb-3" id="modal-id" style={{display: "none"}}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly/>
                        </div>


                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="validationCustom01">Application Feature Name</Label>
                                    <Input
                                        name="applicationFeatureName"
                                        placeholder="Enter Application Feature Name"
                                        type="text"
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.applicationFeatureName || ""}
                                        invalid={
                                            validation.touched.applicationFeatureName &&
                                            validation.errors.applicationFeatureName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.applicationFeatureName &&
                                    validation.errors.applicationFeatureName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.applicationFeatureName}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                            <Col md={1}></Col>
                        </Row>
                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="validationCustom01">Application Feature Code</Label>
                                    <Input
                                        name="applicationFeatureCode"
                                        placeholder="Enter Application Feature Code"
                                        type="text"
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.applicationFeatureCode || ""}
                                        invalid={
                                            validation.touched.applicationFeatureCode &&
                                            validation.errors.applicationFeatureCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.applicationFeatureCode &&
                                    validation.errors.applicationFeatureCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.applicationFeatureCode}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                            <Col md={1}></Col>
                        </Row>

                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="validationCustom02">Application Name</Label>

                                    <Input
                                        name="applicationId"
                                        type="select"
                                        className="form-control"
                                        id="applicationId-field"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={
                                            validation.values.applicationId || ""
                                        }
                                        invalid={
                                            validation.touched.applicationId &&
                                            validation.errors.applicationId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value="">Select Application</option>
                                        {options.map((item, key) => (
                                            <React.Fragment key={key}>
                                                {<option value={item.value} key={key}>{item.label}</option>}
                                            </React.Fragment>
                                        ))}
                                    </Input>
                                    {validation.touched.applicationId &&
                                    validation.errors.applicationId ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.applicationId}
                                        </FormFeedback>
                                    ) : null}
                                </FormGroup>
                            </Col>
                            <Col md={1}></Col>
                        </Row>

                        {edit_update && <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-3">

                                    <div className="form-check form-switch form-switch-lg">
                                        <Input className="form-check-input" type="checkbox" role="switch"
                                               id="SwitchCheck1" checked={checked} onChange={handleChange}/>
                                        <Label className="form-check-label" for="SwitchCheck1">{checkedText}</Label>
                                    </div>

                                </FormGroup>
                            </Col>
                            <Col md={1}></Col>
                        </Row>}
                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-center">
                            <button type="button" className="btn btn-danger"
                                    onClick={() => setmodal_list(false)}>Close
                            </button>
                            <button type="submit" className="btn btn-primary" id="add-btn">{submitVal}</button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>


                </form>
            </Modal>

        </React.Fragment>
    )
};

export default EsApplicationFeature;