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
    postMaterialCategory,
    putMaterialCategory,
    getAllMaterialCategory,
    getAllMaterialTypes

} from "../../helpers/fakebackend_helper";


const MaterialCategory = () => {

    const [data, setData] = useState([]);
    const [buttonval, setbuttonval] = useState('Add Material Category');
    const [response, setResponse] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [modal_list, setmodal_list] = useState(false);
    const [submitVal, setSubmitVal] = useState('Save');
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

        setbuttonval('Add Material Category');
        setSubmitVal('Save')
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

        setbuttonval('Update Material Category');
        setSubmitVal('Update');
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

            response = getAllMaterialCategory();

            var AllMatrialCategory = await response;


            var usernm = obj.data.username;
            setData(AllMatrialCategory);
            setDataBk(AllMatrialCategory);
            setUserName(usernm);


            let allApps;
            allApps = getAllMaterialTypes();
            const mResponse = await allApps;

            const materialTypes = mResponse.map((apps) => ({
                value: apps.materialTypeId, // using app's ID as the value
                label: apps.materialTypeName, // using app's name as the label
            }));
            setOptions(materialTypes);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    }

    // Form validation
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            materialCategoryId: edit_items.materialCategoryId || "",
            materialTypeId: edit_items.materialTypeId || "",
            materialCategoryName: edit_items.materialCategoryName || "",
            materialCategoryCode: edit_items.materialCategoryCode || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            materialCategoryName: Yup.string().required("Please Enter Material Category Name"),
            materialCategoryCode: Yup.string().required("Please Enter Material Category Code"),
            materialTypeId: Yup.string().required("Please Select Material Type")

        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putMaterialCategory({
                        materialTypeId: values.materialTypeId,
                        materialCategoryId: edit_items.materialCategoryId,
                        materialCategoryName: values.materialCategoryName,
                        materialCategoryCode: values.materialCategoryCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {

                    response = postMaterialCategory({
                        materialTypeId: values.materialTypeId,
                        materialCategoryName: values.materialCategoryName,
                        materialCategoryCode: values.materialCategoryCode,
                        isDisabled: false,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    let response = getAllMaterialCategory();
                    var allMaterialCategory = await response;
                    setedit_update(false);
                    setedit_items([])
                    setbuttonval('Add Material Category')
                    setSubmitVal('Save');
                    setData(allMaterialCategory);
                    setDataBk(allMaterialCategory);
                    tog_list();
                    values.materialCategoryName = "";
                    values.materialCategoryCode = "";
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
                header: 'MaterialTypeName',
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
                header: 'MaterialCategoryCode',
                accessorKey: 'materialCategoryCode',
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
                accessorKey: 'materialCategoryId',
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
                return d.materialCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Material Category | eSoft Digital Platform";

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
                    <BreadCrumb title="MaterialCategory" pageTitle="Material"/>
                    <Row>
                        <Col lg={12}>

                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success"
                                                    className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Material Category
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
                                                    placeholder="Search for Material Category..."
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
                                                        className="ri-add-line align-bottom me-1"></i> Add material
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
                                    <Label htmlFor="validationCustom01">Add Material Category Name</Label>
                                    <Input
                                        name="materialCategoryName"
                                        placeholder="Enter Material Category Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialCategoryName || ""}
                                        invalid={
                                            validation.touched.materialCategoryName &&
                                            validation.errors.materialCategoryName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.materialCategoryName &&
                                    validation.errors.materialCategoryName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialCategoryName}
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
                                    <Label htmlFor="validationCustom01">Material Category Code</Label>
                                    <Input
                                        name="materialCategoryCode"
                                        placeholder="Enter Material Category Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialCategoryCode || ""}
                                        invalid={
                                            validation.touched.materialCategoryCode &&
                                            validation.errors.materialCategoryCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.materialCategoryCode &&
                                    validation.errors.materialCategoryCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialCategoryCode}
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


export default MaterialCategory;