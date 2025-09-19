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
    updateDocument,
    saveDocument,
    getDocument,
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import { useFormik } from "formik";

import 'react-toastify/dist/ReactToastify.css';




const DocumentType = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [buttonval, setbuttonval] = useState('Save');
    const [title, setTitle] = useState('Add Document Type');
    const [edit_items, setedit_items] = useState([]);
    const [data, setData] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [name, setName] = useState('');
    const [databk, setDataBk] = useState([]);
    const [username, setUserName] = useState('');
    const tog_list = () => {
        setedit_update('');
        setbuttonval('Save');
        setTitle('Add Document Type');
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
        response = getDocument();
        var DocumentType = await response;
        var usernm = obj.data.username;
        setData(DocumentType);
        setDataBk(DocumentType);
        setUserName(usernm);
        setedit_update(false);
        setedit_items('')
        setbuttonval('Save')
        setTitle('Add Document Type');
    }

    // Delete To do
    const onClickTodoDelete = (data) => {
        setedit_items(data);
        setSuccessModal(true);
    };

    const updateRow = async (item) => {
        const filterData = item.row.original;

        console.log(filterData);
        tog_list();
        setChecked(filterData.isDisabled);
        setedit_update(true);
        setedit_items(filterData)
        setbuttonval('Update')
        setTitle('Update Document Type');
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
                header: 'Document Type Code',
                accessorKey: 'documentTypeCode',
                disableFilters: false,
                enableColumnFilter: false,
            },

            {
                header: 'Created Date',
                accessorKey: 'requestDate',
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
                accessorKey: 'documentTypeId',
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
            documentTypeId: edit_items.documentTypeId || "",
            documentTypeName: edit_items.documentTypeName || "",
            documentTypeCode: edit_items.documentTypeCode || "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            documentTypeName: Yup.string().required("Please Enter Your Document Type Name"),
            documentTypeCode: Yup.string().required("Please Enter Your Document Type Code"),
        }),
        onSubmit: async (values) => {
            let response;
            try {
                if (edit_update === true) {
                    response = updateDocument({
                        documentTypeId: edit_items.documentTypeId,
                        documentTypeName: values.documentTypeName,
                        documentTypeCode: values.documentTypeCode,
                        isDisabled: checked,
                        requestUserName: username
                    });
                } else {
                    response = saveDocument({
                        documentTypeName: values.documentTypeName,
                        documentTypeCode: values.documentTypeCode,
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
                return d.documentTypeName.toLowerCase().includes(keyword.toLowerCase());
            });
            setData(results);
        } else {
            setData(databk);
        }
        setName(keyword);
    };

    document.title = "DocumentType | ADMS";

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
                    <BreadCrumb title="Document Type" pageTitle="Document" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="bg-info p-3">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="success" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Document Type
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
                                                        placeholder="Search for Document..."
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
                <ModalHeader className="bg-light p-3" toggle={() => { tog_list(); }}> {title} </ModalHeader>
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
                                    <Label htmlFor="documentTypeName">Document Type Name</Label>
                                    <Input
                                        name="documentTypeName"
                                        placeholder="Enter Document Type Name"
                                        type="text"
                                        maxLength={75}
                                        className="form-control"
                                        id="documentTypeName"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.documentTypeName || ""}
                                        invalid={
                                            validation.touched.documentTypeName &&
                                            validation.errors.documentTypeName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.documentTypeName &&
                                    validation.errors.documentTypeName ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.documentTypeName}
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
                                    <Label htmlFor="documentTypeCode">Document Type Code</Label>
                                    <Input
                                        name="documentTypeCode"
                                        placeholder="Enter Document Type Code"
                                        type="text"
                                        maxLength={50}
                                        className="form-control"
                                        id="documentTypeCode"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.documentTypeCode || ""}
                                        invalid={
                                            validation.touched.documentTypeCode &&
                                            validation.errors.documentTypeCode
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched.documentTypeCode &&
                                    validation.errors.documentTypeCode ? (
                                        <FormFeedback type="invalid">
                                            {validation.errors.documentTypeCode}
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

export default DocumentType;