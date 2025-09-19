import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Form, Modal, Input, FormGroup
} from 'reactstrap';

import TableContainer from "../../Components/Common/TableContainerReactTable";

import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import Select from "react-select";

import { Link, useFetcher } from 'react-router-dom';
import * as Yup from "yup";
import { useFormik } from "formik";

import {
    getAllSubscriptionSubCategory,
    postSubscriptionSubCategoryCreate,
    putSubscriptionSubCategoryUpdate,
    getSubscriptionSubCategoryById,
    getAllSubscriptionCategorySelect,

} from "../../helpers/fakebackend_helper";

const SubscriptionSubCategory = () => {

    const [data, setData] = useState([]);
    const [submitVal, setSubmitVal] = useState('Save');
    const [buttonval, setbuttonval] = useState('Add Subscription SubCategory');
    const [response, setResponse] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [modal_list, setmodal_list] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [edit_items, setedit_items] = useState([]);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [checkedText, setCheckedText] = React.useState('');
    const [name, setName] = useState('');

    const [options, setOptions] = useState([]);

    const tog_list = () => {
        setSubmitVal('Save')
        setbuttonval('Add Subscription SubCategory');
        setedit_update(false);
        setedit_items([]);
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
        setbuttonval('Update Subscription SubCategory');
        setSubmitVal('Update');
    }

    //load table data
    useEffect( () => {
    getSubscriptionData();
    }, []);

async function getSubscriptionData() {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));

    let response;
    response = getAllSubscriptionSubCategory();

    var allSCResp = await response;

    var usernm = obj.data.username;
    setData(allSCResp);
    setDataBk(allSCResp);
    setUserName(usernm);
    fetchOptions();
}
const fetchOptions = async () => {
    try {
        let allSC;
        allSC = getAllSubscriptionCategorySelect();
        const response = await allSC;

        const categoryOptions = response.map((category) => ({
            value: category.subScriptionCategoryId, // using app's ID as the value
            label: category.subScriptionCategoryName, // using app's name as the label
        }));
        setOptions(categoryOptions);
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};


    // Form validation
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            subscriptionSubCategoryId: edit_items.subScriptionSubCategoryId || "",
            subscriptionCategoryId: edit_items.SubScriptionCategoryId || "",
            subscriptionSubCategoryName: edit_items.subScriptionSubCategoryName || "",
            subscriptionSubCategoryCode: edit_items.subScriptionSubCategoryCode || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            subscriptionSubCategoryName: Yup.string().required("Please Enter Subscription SubCategory Name"),
            subscriptionSubCategoryCode: Yup.string().required("Please Enter Subscription SubCategory Code"),
            subscriptionCategoryId: Yup.string().required("Please Select Subscription Category")

        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putSubscriptionSubCategoryUpdate({
                        subscriptionCategoryId: values.subscriptionCategoryId,
                        subscriptionSubCategoryId: edit_items.subScriptionSubCategoryId,
                        subscriptionSubCategoryName: values.subscriptionSubCategoryName,
                        subscriptionSubCategoryCode: values.subscriptionSubCategoryCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {

                    response = postSubscriptionSubCategoryCreate({
                        subscriptionCategoryId: values.subscriptionCategoryId,
                        subscriptionSubCategoryName: values.subscriptionSubCategoryName,
                        subscriptionSubCategoryCode: values.subscriptionSubCategoryCode,
                        isDisabled: false,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    let response = getAllSubscriptionSubCategory();
                    var allSSC = await response;
                    setedit_update(false);
                    setedit_items('')
                    setbuttonval('Add Subscription SubCategory')
                    setSubmitVal('Save');
                    setData(allSSC);
                    setDataBk(allSSC);
                    tog_list();
                    values.subscriptionSubCategoryName = "";
                    values.subscriptionSubCategoryCode = "";
                    values.subscriptionCategoryId = "";

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

    const columns = useMemo(
        () => [
            {
                header: 'SubscriptionCategory',
                accessorKey: 'subScriptionCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'SubscriptionSubCategory',
                accessorKey: 'subScriptionSubCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Subscription SubCategory Code',
                accessorKey: 'subScriptionSubCategoryCode',
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
                accessorKey: 'subScriptionSubCategoryId',
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

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.subScriptionSubCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Subscription SubCategory | eSoft Digital Platform";

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
                    <BreadCrumb title="Subscription SubCategory" pageTitle="Applications" />
                    <Row>
                        <Col lg={12}>

                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Subscription SubCategory
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
                                                    maxLength={75}
                                                    className="form-control"
                                                    id="searchResultList"
                                                    placeholder="Search for Subscription subcategory..."
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
                                    <Label htmlFor="validationCustom01">Subscription SubCategory Name</Label>
                                    <Input
                                        name="subscriptionSubCategoryName"
                                        placeholder="Enter Subscription SubCategory Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subscriptionSubCategoryName || ""}
                                        invalid={
                                            validation.touched.subscriptionSubCategoryName &&
                                                validation.errors.subscriptionSubCategoryName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.subscriptionSubCategoryName &&
                                        validation.errors.subscriptionSubCategoryName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionSubCategoryName}
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
                                    <Label htmlFor="validationCustom01">Subscription SubCategory Code</Label>
                                    <Input
                                        name="subscriptionSubCategoryCode"
                                        placeholder="Enter Subscription SubCategory Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.subscriptionSubCategoryCode || ""}
                                        invalid={
                                            validation.touched.subscriptionSubCategoryCode &&
                                                validation.errors.subscriptionSubCategoryCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.subscriptionSubCategoryCode &&
                                        validation.errors.subscriptionSubCategoryCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionSubCategoryCode}
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
                                    <Label htmlFor="validationCustom02">Subscription Category</Label>

                                    <Input
                                        name="subscriptionCategoryId"
                                        type="select"
                                        className="form-control"
                                        id="subscriptionCategoryId-field"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={
                                            validation.values.subscriptionCategoryId || ""
                                        }
                                        invalid={
                                            validation.touched.subscriptionCategoryId &&
                                                validation.errors.subscriptionCategoryId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value="">Select Subscription Category</option>
                                        {options.map((item, key) => (
                                            <React.Fragment key={key}>
                                                {<option value={item.value} key={key}>{item.label}</option>}
                                            </React.Fragment>
                                        ))}
                                    </Input>
                                    {validation.touched.subscriptionCategoryId &&
                                        validation.errors.subscriptionCategoryId ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.subscriptionCategoryId}
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

export default SubscriptionSubCategory;