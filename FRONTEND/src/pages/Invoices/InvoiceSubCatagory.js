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
    updateInvoiceCatagory,
    saveInvoiceCatagory,
    getInvoiceType,
    getInvoiceCatagory,

    updateInvoiceSubType,
    saveInvoiceSubType,
    getInvoiceSubType,
    getInvoiceSubTypeId,
    getInvoiceCatagoryId
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import {useFormik} from "formik";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import e from 'cors';


const InvoiceSubCatagory = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [buttonval, setbuttonval] = useState('Save');
    const [tittle, setTitle] = useState('Add Invoice Sub Category');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [invoiceType, setInvoiceType] = useState([]);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const [loadCatagory, setLoadCatagory] = useState([]);
    const [checkedText, setCheckedText] = React.useState('');
    const tog_list = () => {

        setbuttonval('Save');
        setedit_update(false);
        setedit_items([]);
        setmodal_list(!modal_list);
        setTitle('Add Invoice Sub Category');
    };


    const [modal_delete, setmodal_delete] = useState(false);
    const tog_delete = () => {
        setmodal_delete(!modal_delete);
    };
    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        let response;
        response = getInvoiceSubType();
        var invoiceSubCatagory = await response;
        var usernm = obj.data.username;
        setData(invoiceSubCatagory);
        setDataBk(invoiceSubCatagory);
        setUserName(usernm);
        setedit_update(false);
        setedit_items('')
        setbuttonval('Save')
        setTitle('Add Invoice Sub Category');
        //Load Invoice Type
        let response1;
        response1 = getInvoiceSubTypeId();
        var invType = await response1;
        setInvoiceType(invType);
    }


    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);
        tog_list();
        loadCategory(filterData.invoiceTypeId);
        setChecked(!filterData.status);
        setCheckedText(filterData.status ? 'InActive' : 'Active');
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update')
        setTitle('Update Invoice Sub Category');
    }

    const loadCategory = async (value) => {
        let id = value;
        if (id === '') {
            setLoadCatagory([])
        } else {
            let response;
            response = getInvoiceCatagoryId(id);
            var category = await response;
            setLoadCatagory(category);


        }

    }

    const columns = useMemo(
        () => [
            {
                header: 'Type Name',
                accessorKey: 'invoiceTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Category Name',
                accessorKey: 'invoiceCategoryTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Sub Category Name',
                accessorKey: 'invoiceSubCategoryTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Sub Category Code',
                accessorKey: 'invoiceSubCategoryTypeCode',
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
                hiddenColumns: true,
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
                accessorKey: 'invoiceSubCategoryTypeId',
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
            invoiceSubCategoryId: edit_items.invoiceSubCategoryTypeId || "",
            invoiceCategoryId: edit_items.invoiceCategoryTypeId || "",
            invoiceTypeId: edit_items.invoiceTypeId || "",
            invoiceSubCategoryCode: edit_items.invoiceSubCategoryTypeCode || "",
            invoiceSubCategoryName: edit_items.invoiceSubCategoryTypeName || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            invoiceTypeId: Yup.string().required("Please Select Invoice Type"),
            invoiceCategoryId: Yup.string().required("Please Select Invoice Category"),
            invoiceSubCategoryName: Yup.string().required("Please Enter Invoice Category Name"),
            invoiceSubCategoryCode: Yup.string().required("Please Enter Invoice Category Code"),
        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = updateInvoiceSubType({
                        invoiceSubCategoryId: edit_items.invoiceSubCategoryTypeId,
                        invoiceCategoryId: values.invoiceCategoryId,
                        invoiceTypeId: values.invoiceTypeId,
                        invoiceSubCategoryName: values.invoiceSubCategoryName,
                        invoiceSubCategoryCode: values.invoiceSubCategoryCode,
                        isDisabled: !checked,
                        requestUserName: username
                    });
                } else {
                    response = saveInvoiceSubType({
                        invoiceCategoryId: values.invoiceCategoryId,
                        invoiceTypeId: values.invoiceTypeId,
                        invoiceSubCategoryName: values.invoiceSubCategoryName,
                        invoiceSubCategoryCode: values.invoiceSubCategoryCode,
                        isDisabled: false,
                        requestUserName: username,
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

    const handleChange = () => {
        setChecked(!checked);
        setCheckedText(checked ? 'InActive' : 'Active');
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.invoiceCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Invoice Sub Category | eSoft Digital Platform";

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
                    <BreadCrumb title="Invoice Sub Catagory" pageTitle="Invoices"/>
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success"
                                                    className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Invoice Sub Category
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
                                                    placeholder="Search for Invoice SubCategories..."
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
            <Modal isOpen={modal_list} toggle={() => {
                tog_list();
            }} centered>
                <ModalHeader className="card-primary text-white p-3" toggle={() => {
                    tog_list();
                }}>
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
                        <div className="mb-3" id="modal-id" style={{display: "none"}}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly/>
                        </div>

                        <Row>
                            <Col md={1}></Col>
                            <Col md={10}>
                                <FormGroup className="mb-10">
                                    <Label htmlFor="invoiceTypeId">Invoice Type</Label>
                                    <Input
                                        name="invoiceTypeId"
                                        type="select"
                                        className="form-control"
                                        id="invoiceTypeId"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        onChangeCapture={(e) => loadCategory(e.target.value)}
                                        value={validation.values.invoiceTypeId || ""}
                                        invalid={
                                            validation.touched.invoiceTypeId &&
                                            validation.errors.invoiceTypeId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value={""}>Select Invoice Type</option>
                                        {invoiceType.map((item) => (
                                            <React.Fragment>
                                                <option value={item.invoiceTypeId}>{item.invoiceTypeName}</option>
                                            </React.Fragment>
                                        ))}
                                    </Input>
                                    {validation.touched.invoiceTypeId &&
                                    validation.errors.invoiceTypeId ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.invoiceTypeId}
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
                                    <Label htmlFor="invoiceCategoryId">Invoice Category Type</Label>
                                    <Input
                                        name="invoiceCategoryId"
                                        type="select"
                                        className="form-control"
                                        id="invoiceCategoryId"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.invoiceCategoryId || ""}
                                        invalid={
                                            validation.touched.invoiceCategoryId &&
                                            validation.errors.invoiceCategoryId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value={""}>Select Category Type</option>
                                        {loadCatagory.map((item) => (
                                            <React.Fragment>
                                                <option
                                                    value={item.invoiceCategoryTypeId}>{item.invoiceCategoryTypeName}</option>
                                            </React.Fragment>
                                        ))}
                                    </Input>
                                    {validation.touched.invoiceCategoryId &&
                                    validation.errors.invoiceCategoryId ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.invoiceCategoryId}
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
                                    <Label htmlFor="invoiceSubCategoryName">Invoice Sub Category Name</Label>
                                    <Input
                                        name="invoiceSubCategoryName"
                                        placeholder="Enter Invoice Sub Category Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="invoiceSubCategoryName"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.invoiceSubCategoryName || ""}
                                        invalid={
                                            validation.touched.invoiceSubCategoryName &&
                                            validation.errors.invoiceSubCategoryName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.invoiceSubCategoryName &&
                                    validation.errors.invoiceSubCategoryName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.invoiceSubCategoryName}
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
                                    <Label htmlFor="invoiceSubCategoryCode">Invoice Sub Category Code</Label>
                                    <Input
                                        name="invoiceSubCategoryCode"
                                        placeholder="Enter Invoice Sub Category Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="invoiceSubCategoryCode"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.invoiceSubCategoryCode || ""}
                                        invalid={
                                            validation.touched.invoiceSubCategoryCode &&
                                            validation.errors.invoiceSubCategoryCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.invoiceSubCategoryCode &&
                                    validation.errors.invoiceSubCategoryCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.invoiceSubCategoryCode}
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
                            <button type="submit" className="btn btn-primary" id="add-btn">{buttonval}</button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>


                </form>
            </Modal>
        </React.Fragment>
    );
};

export default InvoiceSubCatagory;
