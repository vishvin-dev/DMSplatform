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
    postSubscriptionCategoryCreate,
    putSubscriptionCategoryUpdate,
    getAllSubscriptionCategory
} from "../../helpers/fakebackend_helper";

const SubscriptionCategory = () => {
const [modal_list, setmodal_list] = useState(false);
const [submitVal, setSubmitVal] = useState('Save');
const [buttonval, setbuttonval] = useState('Add Subscription Category');
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
    
    setbuttonval('Add Subscription Category');
    setedit_update(false);
    setedit_items([]);
    setSubmitVal('Save');
    setmodal_list(!modal_list);
};

//load table data
useEffect( () => {
    getOnLoadingData();
}, []);

const getOnLoadingData = async () => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));

    let response;
    response = getAllSubscriptionCategory();
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
    setbuttonval('Update Subscription Category');
    setSubmitVal('Update');
}

const columns = useMemo(
    () => [
        {
            header: 'SubscriptionCategoryName',
            accessorKey: 'subScriptionCategoryName',
            disableFilters: false,
            enableColumnFilter: false,
        },
        {
            header: 'SubscriptionCategoryCode',
            accessorKey: 'subScriptionCategoryCode',
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
            accessorKey: 'subScriptionCategoryId',
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
        subscriptionCategoryId: edit_items.subScriptionCategoryId || "",
        subscriptionCategoryName: edit_items.subScriptionCategoryName || "",
        subscriptionCategoryCode: edit_items.subScriptionCategoryCode || "",
        isDisabled: false,
        requestUserName: ''
    },
    validationSchema: Yup.object({
        subscriptionCategoryName: Yup.string().required("Enter Subscription Category Name"),
        subscriptionCategoryCode: Yup.string().required("Enter Subscription Category Code")
       
    }),
    onSubmit: async (values) => {
        let response;
        try {
            if (edit_update === true) {
                response = putSubscriptionCategoryUpdate({
                    subscriptionCategoryId: edit_items.subScriptionCategoryId,
                    subscriptionCategoryName: values.subscriptionCategoryName,
                    subscriptionCategoryCode: values.subscriptionCategoryCode,
                    isDisabled: !checked,
                    requestUserName: username
                });
            } else {
                response = postSubscriptionCategoryCreate({
                    subscriptionCategoryName: values.subscriptionCategoryName,
                    subscriptionCategoryCode: values.subscriptionCategoryCode,
                    isDisabled: false,
                    requestUserName: username
                });
            }
            var data = await response;
            if (data) {
                let response = getAllSubscriptionCategory();
                var allApps = await response;
                setedit_update(false);
                setedit_items('')
                setbuttonval('Add Subscription Category')
                setSubmitVal('Save');
                setData(allApps);
                setDataBk(allApps);
                tog_list();
                values.subscriptionCategoryName = "";
                values.subscriptionCategoryCode = "";
                
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
            return d.subScriptionCategoryName.toLowerCase().includes(keyword.toLowerCase());
        });
        setData(results);
    } else {
        setData(databk);
    }
    setName(keyword);
};
document.title = "Subscription Category | eSoft Digital Platform";


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
                    <BreadCrumb title="Subscription Category" pageTitle="Applications" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                Subscription Category
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
                                                    placeholder="Search for Subscription Category..."
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
                                    <Label htmlFor="validationCustom01">Subscription Category Name</Label>
                                    <Input
                                        name="subscriptionCategoryName"
                                        placeholder="Enter Subscription Category Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subscriptionCategoryName || ""}
                                        invalid={
                                            validation.touched.subscriptionCategoryName &&
                                                validation.errors.subscriptionCategoryName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.subscriptionCategoryName &&
                                        validation.errors.subscriptionCategoryName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionCategoryName}
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
                                    <Label htmlFor="validationCustom01">Subscription Category Code</Label>
                                    <Input
                                        name="subscriptionCategoryCode"
                                        placeholder="Enter Subscription Category Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subscriptionCategoryCode || ""}
                                        invalid={
                                            validation.touched.subscriptionCategoryCode &&
                                                validation.errors.subscriptionCategoryCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.subscriptionCategoryCode &&
                                        validation.errors.subscriptionCategoryCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionCategoryCode}
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
export default SubscriptionCategory;