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
    updateDocumentCategory,
    saveDocumentCategory,
    getDocumentType,
    getDocumentCategory,
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import { useFormik } from "formik";

import 'react-toastify/dist/ReactToastify.css';




const DocumentCategory = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [buttonval, setbuttonval] = useState('Save');
    const [tittle, setTitle] = useState('Add Document Category');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [documentType, setDocumentType] = useState([]);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const tog_list = () => {
        setedit_update('');
        setbuttonval('Save');
        setTitle('Add Document Category');
        setedit_items('');
        setmodal_list(!modal_list);
    };


    const [modal_delete, setmodal_delete] = useState(false);
    const tog_delete = () => {
        setmodal_delete(!modal_delete);
    };
    useEffect(() => {
        getOnLoadingData();
    }, []);

    const getOnLoadingData = async () => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        let response;
        response = getDocumentCategory();
        var documentCategory = await response;
        var usernm = obj.data.username;
        setData(documentCategory);
        setDataBk(documentCategory);
        setUserName(usernm);
        setedit_update(false);
        setedit_items('')
        setbuttonval('Save')
        setTitle('Add Document Category');
        //Load Document Type
        let response1;
        response1 = getDocumentType();
        var invType = await response1;
        setDocumentType(invType);
    }


    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);
        tog_list();
        setChecked(filterData.isDisabled);
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update')
        setTitle('Update Document Category');
    }



    const columns = useMemo(
        () => [
            {
                header: 'Document Type Name',
                accessorKey: 'documentTypeName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Document Category Name',
                accessorKey: 'documentCategoryName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Document Category Code',
                accessorKey: 'documentCategoryCode',
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
                accessorKey: 'CategoryId',
                disableFilters: false,
                enableColumnFilter: false,
                cell: (data) => {

                    return (
                        <div className="d-flex gap-2">
                            <div className="edit">
                                <button className="btn btn-sm btn-success edit-item-btn" onClick={() =>
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
            documentCategoryId: edit_items.documentCategoryId || "",
            documentTypeId: edit_items.documentTypeId || "",
            documentCategoryName: edit_items.documentCategoryName || "",
            documentCategoryCode: edit_items.documentCategoryCode || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            documentTypeId: Yup.string().required("Please Select Document Type"),
            documentCategoryName: Yup.string().required("Please Enter Document Category Name"),
            documentCategoryCode: Yup.string().required("Please Enter Document Category Code"),
        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = updateDocumentCategory({
                        documentCategoryId: edit_items.documentCategoryId,
                        documentTypeId: values.documentTypeId,
                        documentCategoryName: values.documentCategoryName,
                        documentCategoryCode: values.documentCategoryCode,
                        isDisabled: checked,
                        requestUserName: username
                    });
                } else {
                    response = saveDocumentCategory({
                        documentTypeId: values.documentTypeId,
                        documentCategoryName: values.documentCategoryName,
                        documentCategoryCode: values.documentCategoryCode,
                        isDisabled: false,
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

    const handleChange = () => {
        setChecked(!checked);
    };

    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.documentCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "Document Category | ADMS";

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
                    <BreadCrumb title="Document Category" pageTitle="Document" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-info p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    DocumentCategory
                                                </h4>
                                            </div>
                                        </Col>

                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Row className="g-4 mb-3">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <Button color="success" className="add-btn me-1" onClick={() => tog_list()} id="create-btn"><i className="ri-add-line align-bottom me-1"></i> Add</Button>
                                            </div>
                                        </Col>
                                        <Col className="col-sm">
                                            <div className="d-flex justify-content-sm-end">
                                                <div className="search-box ms-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="searchResultList"
                                                        placeholder="Search for Document"
                                                        onKeyUp={(e) => filter(e)}
                                                    />
                                                    <i className="ri-search-line search-icon"></i>
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
                                                hiddenColumns={{
                                                    columns: [5],
                                                    indicators: true,
                                                }}
                                                isBordered={true}
                                                customPageSize={5}
                                                className="custom-header-css table align-middle table-nowrap"
                                                tableClass="table-centered align-middle table-nowrap mb-0"
                                                theadClass="text-muted table-light gridjs-thead"

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
                <ModalHeader className="bg-light p-3" toggle={() => { tog_list(); }}> {tittle} </ModalHeader>
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
                                    <Label htmlFor="documentTypeId">Document Type</Label>
                                    <Input
                                        name="documentTypeId"
                                        type="select"
                                        className="form-control"
                                        id="documentTypeId"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.documentTypeId || ""}
                                        invalid={
                                            validation.touched.documentTypeId &&
                                            validation.errors.documentTypeId
                                                ? true
                                                : false
                                        }
                                    >
                                        <option value={""}>Select Document Type</option>
                                        {documentType.map((item) => (
                                            <React.Fragment>
                                                <option value={item.documentTypeId}>{item.documentTypeName}</option>
                                            </React.Fragment>
                                        ))}
                                    </Input>
                                    {validation.touched.documentTypeId &&
                                    validation.errors.documentTypeId ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.documentTypeId}
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
                                    <Label htmlFor="documentCategoryName">
                                        Document Category Name</Label>
                                    <Input
                                        name="documentCategoryName"
                                        placeholder="Enter Document Category Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="documentCategoryName"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.documentCategoryName || ""}
                                        invalid={
                                            validation.touched.documentCategoryName &&
                                            validation.errors.documentCategoryName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.documentCategoryName &&
                                    validation.errors.documentCategoryName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.documentCategoryName}
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
                                    <Label htmlFor="documentCategoryCode">Document Category Code</Label>
                                    <Input
                                        name="documentCategoryCode"
                                        placeholder="Enter Document Category Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="documentCategoryCode"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.documentCategoryCode || ""}
                                        invalid={
                                            validation.touched.documentCategoryCode &&
                                            validation.errors.documentCategoryCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.documentCategoryCode &&
                                    validation.errors.documentCategoryCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.documentCategoryCode}
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
                                    <div className="form-check">
                                        <Input type="checkbox" checked={checked}
                                               onChange={handleChange} className="form-switch-md" id="customSwitchsizemd" />
                                        <Label className="form-check-label" htmlFor="customSwitchsizemd">In-Active</Label>
                                    </div>
                                </FormGroup>
                            </Col>
                            <Col md={1}></Col>
                        </Row>}
                    </ModalBody>
                    <ModalFooter>
                        <div className="hstack gap-2 justify-content-center">
                            <button type="button" className="btn btn-danger" onClick={() => setmodal_list(false)}>Close</button>
                            <button type="submit" className="btn btn-success" id="add-btn">{buttonval}</button>
                            {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                        </div>
                    </ModalFooter>


                </form>
            </Modal>
        </React.Fragment>
    );
};

export default DocumentCategory;