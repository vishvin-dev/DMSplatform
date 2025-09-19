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
    postMaterialSubCategory,
    putMaterialSubCategory,
    getAllMaterialSubCategories,
    getAllMaterialSubCategoryCategory,
    getAllMaterialSubCategoryReceiveModes,
    getAllMaterialSubCategoryTypes,


} from "../../helpers/fakebackend_helper";


const MaterialSubCategory = () => {

    const [data, setData] = useState([]);
    const [buttonval, setbuttonval] = useState('Add Material  Sub Category');
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
    const [rmOptions, setRmOptions] = useState([]);
    const [checkedText, setCheckedText] = React.useState('');
    const [submitVal, setSubmitVal] = useState('Save');


    const tog_list = () => {

        setbuttonval('Add Material SubCategory');
        setSubmitVal('Save')
        setedit_update(false);
        setedit_items([]);
        setmodal_list(!modal_list);
    };

    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);

        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_update(true);
        setedit_items(filterData)
        setSubmitVal('Update');
        setbuttonval('Update Material SubCategory')
        setmodal_list(!modal_list);
    }

    //load table data
    useEffect(() => {

        fetchOptions();


    }, []);

    async function fetchOptions() {
        try {

            const obj = JSON.parse(sessionStorage.getItem("authUser"));

            let response;
            response = getAllMaterialSubCategories();


            var tableData = await response;

            var usernm = obj.data.username;
            setData(tableData);
            setDataBk(tableData);
            setUserName(usernm);

            let Alltypes;
            Alltypes = getAllMaterialSubCategoryTypes();
            const mtResponse = await Alltypes;

            const MaterialType = mtResponse.map((apps) => ({
                value: apps.materialTypeId, // using app's ID as the value
                label: apps.materialTypeName, // using app's name as the label
            }));
            setOptions(MaterialType);


            //Material RecieModes Start
            let rModes;
            rModes = getAllMaterialSubCategoryReceiveModes();
            var materialRecieveModes = await rModes;

            const receiveModes = materialRecieveModes.map((apps) => ({
                value: apps.materialReceiveModeId, // using app's ID as the value
                label: apps.materialReceiveModeName, // using app's name as the label
            }));

            setRmOptions(receiveModes);
            //Material RecieModes End


        } catch (error) {
            console.error("Error fetching data: ", error);

        }
    };


    // Form validation
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            materialSubCategoryId: edit_items.materialSubCategoryId || "",
            materialTypeId: edit_items.materialTypeId || "",
            materialSubCategoryName: edit_items.materialSubCategoryName || "",
            materialSubCategoryCode: edit_items.materialSubCategoryCode || "",
            materialCategoryId: edit_items.materialCategoryId || "",
            materialReceiveModeId: edit_items.materialReceiveModeId || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            materialSubCategoryName: Yup.string().required("Please Enter Material  Sub Category Name"),
            materialSubCategoryCode: Yup.string().required("Please Enter Material Sub Category Code"),
            materialTypeId: Yup.string().required("Please Select Material Type"),
            materialCategoryId: Yup.string().required("Please Select Material Category"),
            materialReceiveModeId: Yup.string().required("Please Select Material Receive Mode"),


        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putMaterialSubCategory({
                        materialTypeId: values.materialTypeId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryName: values.materialSubCategoryName,
                        materialSubCategoryCode: values.materialSubCategoryCode,
                        materialReceiveModeId: values.materialReceiveModeId,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {

                    response = postMaterialSubCategory({
                        materialTypeId: values.materialTypeId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryName: values.materialSubCategoryName,
                        materialSubCategoryCode: values.materialSubCategoryCode,
                        materialReceiveModeId: values.materialReceiveModeId,
                        isDisabled: false,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    let response = getAllMaterialSubCategories();
                    var AllMaterialSubCategories = await response;
                    setedit_update(false);
                    setedit_items([])
                    setbuttonval('Add Material  Sub Category')
                    setSubmitVal('Save')
                    setData(AllMaterialSubCategories);
                    setDataBk(AllMaterialSubCategories);
                    tog_list();
                    values.materialSubCategoryName = "";
                    values.materialSubCategoryCode = "";
                    values.materialTypeId = "";

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
                header: 'Material Category Name',
                accessorKey: 'materialCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Material Sub Category Name',
                accessorKey: 'materialSubCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Material Sub Category Code',
                accessorKey: 'materialSubCategoryCode',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Material Receive Mode',
                accessorKey: 'materialReceiveModeName',
                disableFilters: false,
                enableColumnFilter: false,
            },

            {
                header: 'Created By',
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
                accessorKey: 'materialSubCategoryId',
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
        let sTypeId = value.target.value;

        if (sTypeId === '') {
            setCatOptions([]);

        } else {

            let response;
            response = getAllMaterialSubCategoryCategory(sTypeId);

            var resp = await response;

            const catList = resp.map((category) => ({
                value: category.materialCategoryId, // using app's ID as the value
                label: category.materialCategoryName, // using app's name as the label
            }));

            setCatOptions(catList);

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
                return d.materialSubCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Material Sub Category | eSoft Digital Platform";

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
                    <BreadCrumb title="Material Sub Category" pageTitle="Material"/>
                    <Row>
                        <Col lg={14}>

                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success"
                                                    className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Material Sub Category
                                                </h4>
                                            </div>
                                        </Col>

                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Row className="g-4 mb-4">
                                        <Col className="col-sm-2">
                                            <div className="search-box ms-2">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="searchResultList"
                                                    placeholder="Search for Material SubCategory..."
                                                    onKeyUp={(e) => filter(e)}
                                                />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </Col>
                                        <Col className="col-md">
                                            <div className="d-flex justify-content-sm-end">

                                                <div>
                                                    <Button color="primary" className="add-btn me-1"
                                                            onClick={() => tog_list()} id="create-btn"><i
                                                        className="ri-add-line align-bottom me-1"></i> Add material Sub
                                                        Category</Button>
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
                            <Col md={1}></Col>
                        </Row>


                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="validationCustom02">Material Category Name</Label>

                                    <Input
                                        name="materialCategoryId"
                                        type="select"
                                        className="form-control"
                                        id="materialCategoryId-field"
                                        onChange={validation.handleChange}
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
                            <Col md={1}></Col>
                        </Row>


                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="validationCustom01">Add Material Sub Category Name</Label>
                                    <Input
                                        name="materialSubCategoryName"
                                        placeholder="Enter Material Sub Category Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialSubCategoryName || ""}
                                        invalid={
                                            validation.touched.materialSubCategoryName &&
                                            validation.errors.materialSubCategoryName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.materialSubCategoryName &&
                                    validation.errors.materialSubCategoryName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialSubCategoryName}
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
                                    <Label htmlFor="validationCustom01">Material Sub Category Code</Label>
                                    <Input
                                        name="materialSubCategoryCode"
                                        placeholder="Enter Material Sub Category Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialSubCategoryCode || ""}
                                        invalid={
                                            validation.touched.materialSubCategoryCode &&
                                            validation.errors.materialSubCategoryCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.materialSubCategoryCode &&
                                    validation.errors.materialSubCategoryCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialSubCategoryCode}
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
                                    <Label htmlFor="validationCustom02">Material Receive Mode</Label>

                                    <Input
                                        name="materialReceiveModeId"
                                        type="select"
                                        className="form-control"
                                        id="materialReceiveModeId-field"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={
                                            validation.values.materialReceiveModeId || ""
                                        }
                                        invalid={
                                            validation.touched.materialReceiveModeId &&
                                            validation.errors.materialReceiveModeId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value="">Select Material Receive Mode</option>
                                        {rmOptions.map((item, key) => (
                                            <React.Fragment key={key}>
                                                {<option value={item.value} key={key}>{item.label}</option>}
                                            </React.Fragment>
                                        ))}
                                    </Input>
                                    {validation.touched.materialReceiveModeId &&
                                    validation.errors.materialReceiveModeId ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialReceiveModeId}
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


export default MaterialSubCategory;