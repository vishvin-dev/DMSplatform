
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
    postModelMaster,
    putModelMaster,
    getAllModelMaster,
    getAllModelCategory,
    getAllModelType,
    getAllModelSubCategory,

} from "../../helpers/fakebackend_helper";

const ClientPagePermission = () => {

    const [data, setData] = useState([]);
    const [buttonval, setbuttonval] = useState();
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

    const [options, setOptions] = useState([]);
    const [catOptions, setCatOptions] = useState([]);
    const [subOptions, setSubOptions] = useState([]);
    //const [tblShowHide, setTblShowHide] = useState(false);


    const tog_list = () => {

        setbuttonval('Add');
        setmodal_list(!modal_list);
    };

    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);
        tog_list();
        setChecked(filterData.status);
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('add')
    }

    //load table data
    useEffect(async () => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        let response;
        response = getAllModelMaster(materialSubCategoryId);

        var master = await response;
        setData(master);
        setDataBk(master);

        var usernm = obj.data.username;
        setUserName(usernm);


        fetchOptions();

    }, []);

    const fetchOptions = async () => {
        try {
            let allApps;
            allApps = getAllModelType();
            const response = await allApps;

            const ModelType = response.map((apps) => ({
                value: apps.materialTypeId, // using app's ID as the value
                label: apps.materialTypeName, // using app's name as the label
            }));
            setOptions(ModelType);

            let response1;
            response1 = getAllModelMaster(0);

            var resp = await response1;
            setData(resp);
            setDataBk(resp);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    // Form validation
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            materialCategoryId: edit_items.materialCategoryId || "",
            materialTypeId: edit_items.materialTypeId || "",
            materialSubCategoryId: edit_items.materialSubCategoryId || "",
            modelNumber: edit_items.modelNumber,
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            modelNumber: Yup.string().required("Please Select Model Number"),
            materialTypeId: Yup.string().required("Please Select Material Type"),
            materialCategoryId: Yup.string().required("Please Select Material Category"),
            materialSubCategoryId: Yup.string().required("Please Select Material Sub category")


        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putModelMaster({
                        materialTypeId: values.materialTypeId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        modelNumber: values.modelNumber,
                        isDisabled: checked,
                        requestUserName: username
                    });
                } else {

                    response = postModelMaster({
                        materialTypeId: values.materialTypeId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        modelNumber: values.modelNumber,
                        isDisabled: false,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    let response = getAllModelMaster(0);
                    var allMaterialsubCategory = await response;
                    setedit_update(false);
                    setedit_items('')
                    setbuttonval('Add')
                    setData(allMaterialsubCategory);
                    setDataBk(allMaterialsubCategory);
                    tog_list();
                    values.modelId = "";
                    values.modelNumber = "";

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


        ],
        []
    );

    const loadCatByTypeId = async (value) => {
        let materialTypeId = value.target.value;

        if (materialTypeId === '') {
            setCatOptions([]);

        } else {

            let response;
            response = getAllModelCategory(materialTypeId);

            var resp = await response;

            const catList = resp.map((category) => ({
                value: category.materialCategoryId, // using app's ID as the value
                label: category.materialCategoryName, // using app's name as the label
            }));

            setCatOptions(catList);

        }

    };

    const loadSubCatByCategory = async (value) => {
        let materialCategoryId = value.target.value;

        if (materialCategoryId === '') {
            setSubOptions([]);

        } else {

            let response;
            response = getAllModelSubCategory(materialCategoryId);

            var resp = await response;
            const subCatList = resp.map((subcategory) => ({
                value: subcategory.materialSubCategoryId, // using app's ID as the value
                label: subcategory.materialSubCategoryName, // using app's name as the label
            }));

            setSubOptions(subCatList);

        }

    };

    const loadTableDataBySubCategory = async (value) => {
        let materialSubCategoryId = value.target.value;

        if (materialSubCategoryId === ' materialSubCategoryId ') {


        } else {

            let response;
            response = getAllModelMaster(materialSubCategoryId);

            var resp = await response;
            setData(resp);
            setDataBk(resp);
            // setTblShowHide(true);

        }

    };



    const handleChange = () => {
        setChecked(!checked);
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.materialCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Client Page Permission| eSoft Digital Platform";

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
                    <BreadCrumb title="Client Page" pageTitle="Material" />
                    <Row>
                        <Col lg={12}>

                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success"
                                                    className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Client Page Permission
                                                </h4>
                                            </div>
                                        </Col>

                                    </Row>
                                </CardHeader>
                                <form className="tablelist-form"
                                      onSubmit={(e) => {
                                          e.preventDefault();
                                          validation.handleSubmit();
                                          return false;
                                      }}>
                                    <CardBody>


                                        <Row className='g-1 mb-4'>
                                            <Row className='Col-sm-4'>
                                                <Col className="d-flex justify-content-lg-center">
                                                    <Row md={2}></Row>
                                                    <Col md={3}>
                                                        <FormGroup className="mb-3">
                                                            <Label htmlFor="validationCustom02">Client Name</Label>

                                                            <Input
                                                                name="materialTypeId"
                                                                type="select"
                                                                className="form-control"
                                                                id="materialTypeId-field"
                                                                onChange={validation.handleChange}
                                                                onChangeCapture={(value) => loadCatByTypeId(value)}
                                                                onBlur={validation.handleBlur}
                                                                value={
                                                                    validation.values.materialTypeId || ""
                                                                }
                                                                invalid={
                                                                    validation.touched.materialTypeId &&
                                                                    validation.errors.materialTypeId
                                                                        ? true
                                                                        : false
                                                                }
                                                            >
                                                                <option value="">Select client Name </option>
                                                                {options.map((item, key) => (
                                                                    <React.Fragment key={key}>
                                                                        {<option value={item.value} key={key}>{item.label}</option>}
                                                                    </React.Fragment>
                                                                ))}
                                                            </Input>
                                                            {validation.touched.materialTypeId &&
                                                            validation.errors.materialTypeId ? (
                                                                <FormFeedback type="invalid">
                                                                    {validation.errors.materialTypeId}
                                                                </FormFeedback>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Col>
                                            </Row>




                                            <Col>
                                                <Row className="d-flex justify-content-lg-center">
                                                    <Col md={3}></Col>
                                                    <Col md={6}>
                                                        <FormGroup className="mb-10">
                                                            <Label htmlFor="validationCustom02">Appication Feature Name</Label>

                                                            <Input
                                                                name="materialCategoryId"
                                                                type="select"
                                                                className="form-control"
                                                                id="materialCategoryId-field"
                                                                onChange={validation.handleChange}
                                                                onChangeCapture={(value) => loadSubCatByCategory(value)}
                                                                onBlur={validation.handleBlur}
                                                                value={
                                                                    validation.values.materialCategoryId || ""
                                                                }
                                                                invalid={
                                                                    validation.touched.materialCategoryId &&
                                                                    validation.errors.materialCategoryId
                                                                        ? true
                                                                        : false
                                                                }
                                                            >
                                                                <option value="">Select Appication Feature Name</option>
                                                                {catOptions.map((item, key) => (
                                                                    <React.Fragment key={key}>
                                                                        {<option value={item.value} key={key}>{item.label}</option>}
                                                                    </React.Fragment>
                                                                ))}
                                                            </Input>
                                                            {validation.touched.materialCategoryId &&
                                                            validation.errors.materialCategoryId ? (
                                                                <FormFeedback type="invalid">
                                                                    {validation.errors.materialCategoryId}
                                                                </FormFeedback>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>



                                            <Col>
                                                <Col md={3}></Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-10">
                                                        <Label htmlFor="validationCustom02">Page Name  </Label>

                                                        <Input
                                                            name="materialSubCategoryId"
                                                            type="select"
                                                            className="form-control"
                                                            id="materialSubCategoryId-field"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            onChangeCapture={(value) => loadTableDataBySubCategory(value)}
                                                            value={
                                                                validation.values.materialSubCategoryId || ""
                                                            }
                                                            invalid={
                                                                validation.touched.materialSubCategoryId &&
                                                                validation.errors.materialSubCategoryId
                                                                    ? true
                                                                    : false
                                                            }
                                                        >
                                                            <option value="">Select Page Name </option>
                                                            {subOptions.map((item, key) => (
                                                                <React.Fragment key={key}>
                                                                    {<option value={item.value} key={key}>{item.label}</option>}
                                                                </React.Fragment>
                                                            ))}
                                                        </Input>
                                                        {validation.touched.materialSubCategoryId &&
                                                        validation.errors.materialSubCategoryId ? (
                                                            <FormFeedback type="invalid">
                                                                {validation.errors.materialSubCategoryId}
                                                            </FormFeedback>
                                                        ) : null}
                                                    </FormGroup>
                                                </Col>

                                            </Col>
                                        </Row>



                                        <Row>
                                            {/* {tblShowHide && <Row className='g-4 mb-3'>*/}
                                            <Col lg={12}>

                                                <Card>
                                                    <CardBody>
                                                        <div className="listjs-table" id="customerList">
                                                            <Row className="g-4 mb-3">
                                                                <Col className="col-sm-auto">
                                                                    <div>
                                                                        <Button color="success" className="add-btn me-1" onClick={() => tog_list()} id="create-btn"><i className="ri-add-line align-bottom me-1"></i>Save</Button>
                                                                        <Button className="btn btn-soft-danger"
                                                                            // onClick="deleteMultiple()"
                                                                        ><i className="ri-delete-bin-2-line"></i></Button>
                                                                    </div>
                                                                </Col>
                                                                <Col className="col-sm">
                                                                    <div className="d-flex justify-content-sm-end">
                                                                        <div className="search-box ms-2">
                                                                            <input type="text" className="form-control search" placeholder="Search..." />
                                                                            <i className="ri-search-line search-icon"></i>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>

                                                            <div className="table-responsive table-card mt-3 mb-1">
                                                                <table className="table align-middle table-nowrap" id="customerTable">
                                                                    <thead className="table-light">
                                                                    <tr>

                                                                        <th className="sort" data-sort="Role">Role Id</th>
                                                                        <th className="sort" data-sort="Role">Role Name</th>
                                                                        <th className="sort" data-sort="Role">Status</th>
                                                                        <th scope="col" style={{ width: "50px" }}>
                                                                            <div className="form-check">
                                                                                <input className="form-check-input" type="checkbox" id="checkAll" value="option" />
                                                                            </div>
                                                                        </th>
                                                                    </tr>
                                                                    </thead>

                                                                </table>
                                                                <div className="noresult" style={{ display: "none" }}>
                                                                    <div className="text-center">
                                                                        <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop"
                                                                                   colors="primary:#121331,secondary:#08a88a" style={{ width: "75px", height: "75px" }}>
                                                                        </lord-icon>
                                                                        <h5 className="mt-2">Sorry! No Result Found</h5>
                                                                        <p className="text-muted mb-0">We've searched more than 150+ Orders We did not find any
                                                                            orders for you search.</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex justify-content-end">
                                                                <div className="pagination-wrap hstack gap-2">
                                                                    <Link className="page-item pagination-prev disabled" to="#">
                                                                        Previous
                                                                    </Link>
                                                                    <ul className="pagination listjs-pagination mb-0"></ul>
                                                                    <Link className="page-item pagination-next" to="#">
                                                                        Next
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>

                                        </Row>



                                    </CardBody>
                                </form>
                            </Card>


                        </Col>

                    </Row>
                </Container>
            </div>

        </React.Fragment>
    )
};


export default ClientPagePermission;

