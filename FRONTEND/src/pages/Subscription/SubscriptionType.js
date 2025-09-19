import React, { useState, useEffect ,useMemo} from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Form, Modal, Input, FormGroup
} from 'reactstrap';

import TableContainer from "../../Components/Common/TableContainerReactTable";

import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';

import { Link, useFetcher } from 'react-router-dom';
import * as Yup from "yup";
import { useFormik } from "formik";
import e from 'cors';
import {
    postSubscriptionTypeCreate,
    putSubscriptionTypeUpdate,
    getAllSubscriptionType
} from "../../helpers/fakebackend_helper";

const SubscriptionType = () => {
const [modal_list, setmodal_list] = useState(false);
const [submitVal, setSubmitVal] = useState('Save');
const [buttonval, setbuttonval] = useState('Add Subscription Type');
const [successModal, setSuccessModal] = useState(false);
const [errorModal, setErrorModal] = useState(false);
const [response, setResponse] = useState('');
const [data, setData] = useState([]);
const [databk, setDataBk] = useState([]);
const [username, setUserName] = useState('');
const [edit_items, setedit_items] = useState([]);
const [edit_update, setedit_update] = useState(false);
const [checked, setChecked] = React.useState(false);
const [checkedText, setCheckedText] = React.useState('');
const [name, setName] = useState('');

//modal toggle
const tog_list = () => {
    
    setbuttonval('Add Subscription Type');
    setedit_update(false);
    setedit_items([]);
    setSubmitVal('Save');
    setmodal_list(!modal_list);
};

//load table data
useEffect( () => {
    getSubscriptionType();
}, []);

async function getSubscriptionType() {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));

    let response;
    response = getAllSubscriptionType();
    var allApps = await response;
    var usernm = obj.data.username;
    setData(allApps);
    setDataBk(allApps);
    setUserName(usernm);
}



const updateRow = async (item) => {
    const filterData = item.row.original;

    console.log(filterData);
    tog_list();
    setChecked(!filterData.status);
    setCheckedText(filterData.status ? 'InActive' : 'Active');
    setedit_update(true);
    setedit_items(filterData)
    setbuttonval('Update Subscription Type');
    setSubmitVal('Update');
}

const columns = useMemo(
    () => [
        {
            header: 'SubscriptionTypeName',
            accessorKey: 'subScriptionTypeName',
            disableFilters: false,
            enableColumnFilter: false,
        },
        {
            header: 'SubscriptionTypeCode',
            accessorKey: 'subScriptionTypeCode',
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
                    return (<span className="badge bg-danger-subtle  text-danger text-uppercase"> {"InActive"}</span>);
                } else {
                    return (<span className="badge bg-success-subtle text-success text-uppercase"> {"Active"}</span>);
                }

            },
        },
        {
            header: 'Action',
            accessorKey: 'subScriptionTypeId',
            disableFilters: false,
            enableColumnFilter: false,
            cell: (data) => {

                return (
                    <div className="d-flex gap-2">
                        <div className="edit">
                            <button className="btn btn-sm btn-primary edit-item-btn" onClick={() =>
                                updateRow(data)}
                                data-bs-toggle="modal" data-bs-target="#showModal"><i className="ri-edit-2-line"></i></button>

                        </div>
                        
                    </div>)
            }
        },
    ],
    []
);

// Form validation
const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
        subscriptionTypeId: edit_items.subScriptionTypeId || "",
        subscriptionTypeName: edit_items.subScriptionTypeName || "",
        subscriptionTypeCode: edit_items.subScriptionTypeCode || "",
        isDisabled: false,
        requestUserName: ''
    },
    validationSchema: Yup.object({
        subscriptionTypeName: Yup.string().required("Please Enter Your Subscription Type Name"),
        subscriptionTypeCode: Yup.string().required("Please Enter Your Subscription Type Code")
       
    }),
    onSubmit: async (values) => {
        let response;
        try {
            if (edit_update === true) {
                response = putSubscriptionTypeUpdate({
                    subscriptionTypeId: edit_items.subScriptionTypeId,
                    subscriptionTypeName: values.subscriptionTypeName,
                    subscriptionTypeCode: values.subscriptionTypeCode,
                    isDisabled: !checked,
                    requestUserName: username
                });
            } else {
                response = postSubscriptionTypeCreate({
                    subscriptionTypeName: values.subscriptionTypeName,
                    subscriptionTypeCode: values.subscriptionTypeCode,
                    isDisabled: false,
                    requestUserName: username
                });
            }
            var data = await response;
            if (data) {
                let response = getAllSubscriptionType();
                var allApps = await response;
                setedit_update(false);
                setedit_items('')
                setbuttonval('Add Subscription Type')
                setSubmitVal('Save');
                setData(allApps);
                setDataBk(allApps);
                tog_list();
                values.subscriptionTypeName = "";
                values.subscriptionTypeCode = "";
                
                if (data.responseCode === '-101') {
                    setResponse(data.responseString);
                    setSuccessModal(false);
                    setErrorModal(true);

                } else {
                    setResponse(data.responseString);
                    setSuccessModal(true);
                    setErrorModal(false);
                }

                // toast.success(data.responseString, { autoClose: 3000 });
            }

        } catch (error) {
            setSuccessModal(false);
            setErrorModal(true);
        }
    }
});

const handleChange = () => {
    setChecked(!checked);
    setCheckedText(checked ? 'InActive' : 'Active');
};

const filter = (e) => {
    const keyword = e.target.value;

    const filterData = databk;
    if (keyword !== '') {
        const results = filterData?.filter((d) => {
            return d.subScriptionTypeName.toLowerCase().includes(keyword.toLowerCase());
        });
        setData(results);
    } else {
        setData(databk);
    }
    setName(keyword);
};
document.title = "Subscription Type | eSoft Digital Platform";


return (
    <React.Fragment>
        <ToastContainer closeButton={false} />
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
                    <BreadCrumb title="Subscription Type" pageTitle="Applications" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                Subscription Type
                                                </h4>
                                            </div>
                                        </Col>

                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Row className="g-4 mb-3">
                                        <Col className="col-sm-3">
                                            <div className="search-box ms-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="searchResultList"
                                                    placeholder="Search for Subscription types..."
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

            {/* Add Modal */}
            <Modal isOpen={modal_list} toggle={() => { tog_list(); }} centered >
                <ModalHeader className="card-primary p-3" toggle={() => {
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
                        <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
                        </div>

                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="validationCustom01">Subscription Type Name</Label>
                                    <Input
                                        name="subscriptionTypeName"
                                        placeholder="Enter Subscription Type Name"
                                        maxLength={75}
                                        type="text"
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subscriptionTypeName || ""}
                                        invalid={
                                            validation.touched.subscriptionTypeName &&
                                                validation.errors.subscriptionTypeName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.subscriptionTypeName &&
                                        validation.errors.subscriptionTypeName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionTypeName}
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
                                    <Label htmlFor="validationCustom01">Subscription Type Code</Label>
                                    <Input
                                        name="subscriptionTypeCode"
                                        placeholder="Enter Subscription Type Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subscriptionTypeCode || ""}
                                        invalid={
                                            validation.touched.subscriptionTypeCode &&
                                                validation.errors.subscriptionTypeCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.subscriptionTypeCode &&
                                        validation.errors.subscriptionTypeCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionTypeCode}
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
                                        <Input className="form-check-input" type="checkbox" role="switch" id="SwitchCheck1" checked={checked} onChange={handleChange}/>
                                        <Label className="form-check-label" for="SwitchCheck1">{checkedText}</Label>
                                    </div>

                                </FormGroup>
                            </Col>
                            <Col md={1}></Col>
                        </Row>}
                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-center">
                            <button type="button" className="btn btn-danger" onClick={() => setmodal_list(false)}>Close</button>
                            <button type="submit" className="btn btn-primary" id="add-btn">{submitVal}</button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>

                    
                </form>
            </Modal>
        
    </React.Fragment>
)
};
export default SubscriptionType;