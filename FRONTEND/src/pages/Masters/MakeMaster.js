import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup
} from 'reactstrap';
import TableContainer from "../../Components/Common/TableContainerReactTable";

import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';

import {
    materialTypeName,
    materialCategory,
    materialSubCategory,
    saveMakeMaster,
    updateMakeMaster,
    viewMake,
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROLES_URL_GET_DELETE } from '../../helpers/url_helper';
import e from 'cors';



const MakeMaster = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [buttonval, setbuttonval] = useState('Save');
    const [tittle, setTitle] = useState('Add Make Master');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [materialType, setMaterialType] = useState([]);
    const [materialCat, setMaterialCat] = useState([]);
    const [materialSubCat, setMaterialSubCat] = useState([]);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [checkedText, setCheckedText] = React.useState('');
    const tog_list = () => {

        setbuttonval('Save');
        setTitle('Add Make Master');
        setedit_update(false);
        setedit_items([])
        setmodal_list(!modal_list);
    };


    const [modal_delete, setmodal_delete] = useState(false);
    const tog_delete = () => {
        setmodal_delete(!modal_delete);
    };
    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData () {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        let response;
        response = viewMake();
        var make = await response;
        var usernm = obj.data.username;
        setData(make);
        setDataBk(make);
        setUserName(usernm);
        setedit_update(false);
        setedit_items('')
        setbuttonval('Save')
        setTitle('Add Make Master');
        //Load Invoice Type
        let response1;
        response1 = materialTypeName();
        var materialType = await response1;
        setMaterialType(materialType);
    }


    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);
        tog_list();
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update')
        setTitle('Update Make Master');
    }



    const columns = useMemo(
        () => [
            {
                header: 'Material Type',
                accessorKey: 'materialTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Material Category',
                accessorKey: 'materialCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Material SubCategory',
                accessorKey: 'materialSubCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Make Name',
                accessorKey: 'makeName',
                disableFilters: false,
                enableColumnFilter: false,
            }, 
            {
                header: 'Make Code',
                accessorKey: 'makeCode',
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
                accessorKey: 'isDisabled',
                hiddenColumns: true,
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
                accessorKey: 'invoiceCategoryId',
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
                            {/* <div className="remove">
                                <button className="btn btn-sm btn-danger remove-item-btn" onClick={() => onClickTodoDelete(data)} data-bs-toggle="modal" data-bs-target="#deleteRecordModal"><i className="ri-delete-bin-line"></i></button>
                            </div>  */}
                        </div>)
                }
            },
        ],
        []
    );



    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            materialTypeId: edit_items.materialTypeId || "",
            materialCategoryId: edit_items.materialCategoryId || "",
            materialSubCategoryId: edit_items.materialSubCategoryId || "",
            makeName: edit_items.makeName || "",
            makeCode: edit_items.makeCode || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            materialTypeId: Yup.string().required("Please Select Material Type"),
            materialCategoryId: Yup.string().required("Please Select Material Category"),
            materialSubCategoryId: Yup.string().required("Please Select Material Sub Category"),
            makeName: Yup.string().required("Please Enter make Name"),
            makeCode: Yup.string().required("Please Enter make Code"),
        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = updateMakeMaster({
                        makeId: edit_items.makeId,
                        materialTypeId: values.materialTypeId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        makeName: values.makeName,
                        makeCode: values.makeCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {
                    response = saveMakeMaster({
                        materialTypeId: values.materialTypeId,
                        materialCategoryId: values.materialCategoryId,
                        materialSubCategoryId: values.materialSubCategoryId,
                        makeName: values.makeName,
                        makeCode: values.makeCode,
                        isDisabled: checked,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    if (data[0].responseCode === '-101') {
                        setResponse(data[0].responseString);
                        setSuccessModal(false);
                        setErrorModal(true);
                    } else {
                        setResponse(data[0].responseString);
                        setSuccessModal(true);
                        setErrorModal(false);
                    }
                    tog_list();
                    getOnLoadingData();
                    validation.resetForm();
                    // toast.success(data.responseString, { autoClose: 3000 });
                }

            } catch (error) {
                setSuccessModal(false);
                setErrorModal(true);
            }
        }
    });

    const loadMaterialCategory = async (value) => {
        let id = value.target.value;
        if (id === '') {
            setMaterialCat([])
        } else {
            let response;
            response = materialCategory(id);
            var catagory = await response;

                setMaterialCat(catagory);

        }
    }
    const loadMaterialSubCategory = async (value) => {
        let id = value.target.value;
        if (id === '') {
            setMaterialSubCat([])
        } else {
            let response;
            response = materialSubCategory(id);
            var subcatagory = await response;

                setMaterialSubCat(subcatagory);

        }
    }

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.makeName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Make Master | eSoft Digital Platform";

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
                    <BreadCrumb title="Make Master" pageTitle="Material" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Make Master
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
                                                    placeholder="Search for Makes..."
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
                <ModalHeader className="card-primary p-3" toggle={() => { tog_list(); }}>
                    <span className="modal-title text-white">
                        {tittle}
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
                                    <Label htmlFor="materialTypeId">Material Type</Label>
                                    <Input
                                        name="materialTypeId"
                                        type="select"
                                        className="form-control"
                                        id="materialTypeId"
                                        onChange={validation.handleChange}
                                        onChangeCapture={(value) => loadMaterialCategory(value)}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialTypeId || ""}
                                        invalid={
                                            validation.touched.materialTypeId &&
                                                validation.errors.materialTypeId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value={""}>Select Material Type</option>
                                        {materialType.map((item) => (
                                            <React.Fragment>
                                                <option value={item.materialTypeId}>{item.materialTypeName}</option>
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
                                    <Label htmlFor="materialCategoryId">Material Category</Label>
                                    <Input
                                        name="materialCategoryId"
                                        type="select"
                                        className="form-control"
                                        id="materialCategoryId"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        onChangeCapture={(value) => loadMaterialSubCategory(value)}
                                        value={validation.values.materialCategoryId || ""}
                                        invalid={
                                            validation.touched.materialCategoryId &&
                                                validation.errors.materialCategoryId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value={""}>Select Material Category</option>
                                        {materialCat.map((item) => (
                                            <React.Fragment>
                                                <option value={item.materialCategoryId}>{item.materialCategoryName}</option>
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
                                    <Label htmlFor="materialSubCategoryId">Material SubCategory</Label>
                                    <Input
                                        name="materialSubCategoryId"
                                        type="select"
                                        className="form-control"
                                        id="materialSubCategoryId"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialSubCategoryId || ""}
                                        invalid={
                                            validation.touched.materialSubCategoryId &&
                                                validation.errors.materialSubCategoryId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value={""}>Select Material SubCategory</option>
                                        {materialSubCat.map((item) => (
                                            <React.Fragment>
                                                <option value={item.materialSubCategoryId}>{item.materialSubCategoryName}</option>
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
                            <Col md={1}></Col>
                        </Row>
                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="makeName">Make Name</Label>
                                    <Input
                                        name="makeName"
                                        placeholder="Enter Make Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="makeName"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.makeName || ""}
                                        invalid={
                                            validation.touched.makeName &&
                                                validation.errors.makeName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.makeName &&
                                        validation.errors.makeName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.makeName}
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
                                    <Label htmlFor="makeCode">Make Code</Label>
                                    <Input
                                        name="makeCode"
                                        placeholder="Enter Make Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="makeCode"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.makeCode || ""}
                                        invalid={
                                            validation.touched.makeCode &&
                                                validation.errors.makeCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.makeCode &&
                                        validation.errors.makeCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.makeCode}
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
                            <button type="submit" className="btn btn-primary" id="add-btn">{buttonval}</button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>


                </form>
            </Modal>
        </React.Fragment>
    );
};

export default MakeMaster;
