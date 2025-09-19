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

import * as Yup from "yup";
import {useFormik} from "formik";

import {
    postModelMaster,
    putModelMaster,
    getAllModelMaster,
    getAllModelCategory,
    getAllModelType,
    getAllModelSubCategory

} from "../../helpers/fakebackend_helper";


const ModelMaster = () => {

    const [data, setData] = useState([]);
    const [buttonval, setbuttonval] = useState('Add Model');
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
    const [catOptions, setCatOptions] = useState([]);
    const [options, setOptions] = useState([]);
    const [subOptions, setSubOptions] = useState([]);
    const [countries, setCountries] = useState([]);
    const [clients, setClients] = useState([]);
    const [sessCountryId, setSessCountryId] = useState('');
    const [sessClientId, setSessClientId] = useState('');
    const [sessCountryName, setSessCountryName] = useState('');
    const [sessClientName, setSessClientName] = useState('');
    const [tblShowHide, setTblShowHide] = useState(false);

    const [checkedText, setCheckedText] = React.useState('');
    const [submitVal, setSubmitVal] = useState('Save');

    const tog_list = () => {

        setbuttonval('Add Model');
        setSubmitVal('Save');
        setedit_update(false);
        setedit_items([]);
        setmodal_list(!modal_list);
    };

    const updateRow = async (item) => {
        const filterData = item.row.original;


        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update Model')
        setSubmitVal('Update');
        setmodal_list(!modal_list);
    }

    useEffect(() => {
        getOnLoadingData();


    }, []);

    async function getOnLoadingData() {

        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        var usernm = obj.data.username;
        setUserName(usernm);
        setSessClientId(obj.data.clientId);
        setSessCountryId(obj.data.countryId);
        setSessClientName(obj.data.clientName);
        setSessCountryName(obj.data.countryName);

    }

    //load table data
    useEffect(() => {
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
            modelNumber: Yup.string().required("Please Enter Model Number"),
            materialTypeId: Yup.string().required("Please Select Material Type"),
            materialCategoryId: Yup.string().required("Please Select Material Category"),
            materialSubCategoryId: Yup.string().required("Please Select Material Sub category")


        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putModelMaster({
                        modelId: edit_items.modelId,
                        materialTypeId: values.materialTypeId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        modelNumber: values.modelNumber,
                        isDisabled: !checked,
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
            {
                header: 'Material Type Name',
                accessorKey: 'materialTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'MaterialCategoryName',
                accessorKey: 'materialCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'MaterialSub CategoryName',
                accessorKey: 'materialSubCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'ModelNumber',
                accessorKey: 'modelNumber',
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
                accessorKey: 'modelId',
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

        if (materialSubCategoryId === 'materialSubCategoryId') {


        } else {

            let response;
            response = getAllModelMaster(materialSubCategoryId);

            var resp = await response;
            setData(resp);
            setDataBk(resp);
            setTblShowHide(true);

        }

    };


    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.modelNumber.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Model Master | eSoft Digital Platform";

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
                    <BreadCrumb title="Model Master" pageTitle="Material"/>


                    <Col lg={12}>


                        <Card>
                            <CardHeader className="card-header card-primary">
                                <Row className="g-4 align-items-center">
                                    <Col className="col-sm-auto">
                                        <div>
                                            <h4 color="success"
                                                className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                Model Master
                                            </h4>
                                        </div>
                                    </Col>

                                </Row>
                            </CardHeader>
                            <CardBody>


                                <Row className="mb-3 mt-3">
                                    <Col sm={4}>
                                        <Row>
                                            <div className="form-floating">

                                                <Input
                                                    name="searchCountryName"
                                                    type="select"
                                                    className="form-select"
                                                    id="searchCountryName-field"

                                                    aria-label="Floating label select example"
                                                >
                                                    <option value={sessCountryName}
                                                    >{sessCountryName}</option>

                                                    {countries.map((item, key) => (
                                                        <React.Fragment key={key}>
                                                            {<option value={item.value} key={key}>{item.label}</option>}
                                                        </React.Fragment>
                                                    ))}
                                                </Input>


                                                <Label htmlFor="floatingSelect">Country</Label>
                                            </div>

                                        </Row>
                                    </Col>

                                    <Col className="d-flex justify-content-lg-end mb-3">

                                        <Col sm={6}>

                                            <Row>
                                                <div className="form-floating">

                                                    <Input
                                                        name="searchClientId"
                                                        type="select"
                                                        className="form-select"
                                                        id="searchClientId-field"

                                                        aria-label="Floating label select example"
                                                    >
                                                        <option value={sessClientName}
                                                        >{sessClientName}</option>

                                                        {clients.map((item, key) => (
                                                            <React.Fragment key={key}>
                                                                {<option value={item.value}
                                                                         key={key}>{item.label}</option>}
                                                            </React.Fragment>
                                                        ))}
                                                    </Input>


                                                    <Label htmlFor="floatingSelect">Client</Label>
                                                </div>

                                            </Row>
                                        </Col>
                                    </Col>


                                </Row>


                                <Row className="g-4 mb-3">
                                    <Col className="col-sm-2">
                                        <div className="search-box ms-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="searchResultList"
                                                placeholder="Search for Model..."
                                                onKeyUp={(e) => filter(e)}
                                            />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </Col>
                                    <Col className="col-sm">
                                        <div className="d-flex justify-content-sm-end">
                                            <div>
                                                <Button color="primary" className="add-btn me-1"
                                                        onClick={() => tog_list()} id="create-btn"><i
                                                    className="ri-add-line align-bottom me-1"></i> Add Model</Button>
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


                        <Col>

                            <Col className="d-flex justify-content-center">
                                <Col md={10}>

                                    <FormGroup className="mb-3">
                                        <Label htmlFor="validationCustom02">Material Type</Label>

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
                                            <option value="">Select Material Type Name</option>
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


                            <Col className="d-flex justify-content-center">
                                <Col md={10}>

                                    <FormGroup className="mb-10">
                                        <Label htmlFor="validationCustom02">Material Category Name</Label>

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
                                            <option value="">Select Material Category Name</option>
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

                            </Col>


                            <Col className="d-flex justify-content-center">

                                <Col md={10}>

                                    <FormGroup className="mb-10">
                                        <Label htmlFor="validationCustom02">Material Sub Category Name</Label>

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
                                            <option value="">Select Material Sub Category Name</option>
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


                            <Col className="d-flex justify-content-center">
                                <Col sm={10}>

                                    <FormGroup>
                                        <Label htmlFor="validationCustom01"> Model number</Label>
                                        <Input
                                            name="modelNumber"
                                            placeholder="Enter model Number"
                                            type="text"
                                            maxLength={75}
                                            className="form-control"
                                            id="validationCustom01"
                                            onChange={validation.handleChange}
                                            onBlur={validation.handleBlur}
                                            value={validation.values.modelNumber || ""}
                                            invalid={
                                                validation.touched.modelNumber &&
                                                validation.errors.modelNumber
                                                    ? true
                                                    : false
                                            }
                                        />
                                        {validation.touched.modelNumber &&
                                        validation.errors.modelNumber ? (
                                            <FormFeedback type="invalid">
                                                {validation.errors.modelNumber}
                                            </FormFeedback>
                                        ) : null}
                                    </FormGroup>
                                </Col>
                            </Col>


                        </Col>


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


export default ModelMaster;