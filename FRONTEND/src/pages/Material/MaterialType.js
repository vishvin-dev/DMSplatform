import React, {useState, useEffect, useMemo} from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup
} from 'reactstrap';
import TableContainer from "../../Components/Common/TableContainerReactTable";

import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import {ToastContainer} from 'react-toastify';

import {
    postMaterialType,
    putMaterialType,
    getAllMatrialType
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import {useFormik} from "formik";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const MaterialType = () => {

    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [buttonval, setbuttonval] = useState('Add Material Type');
    const [submitVal, setSubmitVal] = useState('Save');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [checkedText, setCheckedText] = React.useState('');
    const [modal_delete, setmodal_delete] = useState(false);

    const tog_list = () => {

        setbuttonval('Add Material Type');
        setSubmitVal('Save');
        setedit_update(false);
        setedit_items([]);
        setmodal_list(!modal_list);
    };



    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        let response;
        response = getAllMatrialType();
        var allMaterial = await response;
        var usernm = obj.data.username;
        setData(allMaterial);
        setDataBk(allMaterial);
        setUserName(usernm);
        setedit_update(false);
        setedit_items([]);
        setbuttonval('Add Material Type')
        setSubmitVal('Save');
    }


    const updateRow = async (item) => {
        const filterData = item.row.original;
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');

        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update Material Type');
        setSubmitVal('Update');
        setmodal_list(!modal_list);
    }

    const columns = useMemo(
        () => [
            {
                header: 'MaterialTypeName',
                accessorKey: 'materialTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'MaterialTypeCode',
                accessorKey: 'materialTypeCode',
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
                accessorKey: 'materialTypeId',
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
            materialTypeName: edit_items.materialTypeName || "",
            materialTypeCode: edit_items.materialTypeCode || "",

            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            materialTypeName: Yup.string().required("Please Enter Material Type Name"),
            materialTypeCode: Yup.string().required("Please Enter Material Type Code"),

        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = putMaterialType({
                        materialTypeId: edit_items.materialTypeId,
                        materialTypeName: values.materialTypeName,
                        materialTypeCode: values.materialTypeCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {
                    response = postMaterialType({
                        materialTypeName: values.materialTypeName,
                        materialTypeCode: values.materialTypeCode,
                        isDisabled: false,
                        requestUserName: username
                    });
                }
                var data = await response;
                if (data) {
                    if (data.responseCode === '-101') {
                        setResponse(data.responseString);
                        setSuccessModal(false);
                        setErrorModal(true);
                    } else {
                        setResponse(data.responseString);
                        setSuccessModal(true);
                        setErrorModal(false);
                    }
                    tog_list();
                    getOnLoadingData();
                    values.materialTypeName = "";
                    values.materialTypeCode = "";

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
                return d.materialTypeName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Material Type | eSoftDigital Platform";

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
                    <BreadCrumb title="Material Type" pageTitle="Material"/>
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Material Type
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
                                                    placeholder="Search for Material type..."
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
                                    <Label htmlFor="validationCustom01">Material Type Name</Label>
                                    <Input
                                        name="materialTypeName"
                                        placeholder="Enter Material Type Name"
                                        type="text"
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialTypeName || ""}
                                        invalid={
                                            validation.touched.materialTypeName &&
                                            validation.errors.materialTypeName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.materialTypeName &&
                                    validation.errors.materialTypeName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialTypeName}
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
                                    <Label htmlFor="validationCustom01">Material Type Code</Label>
                                    <Input
                                        name="materialTypeCode"
                                        placeholder="Enter Material Type Code"
                                        type="text"
                                        className="form-control"
                                        id="validationCustom01"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.materialTypeCode || ""}
                                        invalid={
                                            validation.touched.materialTypeCode &&
                                            validation.errors.materialTypeCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.materialTypeCode &&
                                    validation.errors.materialTypeCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.materialTypeCode}
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
    );
};


export default MaterialType;