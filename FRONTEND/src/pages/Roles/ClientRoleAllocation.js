import React, {useState, useEffect, useMemo} from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Modal, Input, FormGroup
} from 'reactstrap';
import Select from "react-select";
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import BreadCrumb from '../../Components/Common/BreadCrumb';
import {ToastContainer} from 'react-toastify';
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";

import {
    getClients,
    getCountry,
    getClientRoles,
    clientRolesSave
} from "../../helpers/fakebackend_helper";
import * as Yup from "yup";
import {useFormik} from "formik";

import 'react-toastify/dist/ReactToastify.css';



const ClientRoleAllocation = () => {


    const [buttonval, setbuttonval] = useState('Save Client Role');


    const [client, setClient] = useState([]);
    const [country, setCountry] = useState([]);

    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');


    const [username, setUserName] = useState('');
    const [scountry, setScountry] = useState('');
    const [sclient, setSclient] = useState('');

    //Roles 
    const [selected, setSelected] = useState([]);
    const [options, setOptions] = useState([]);




    useEffect(() => {
        getOnLoadingData();
    }, []);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        var usernm = obj.data.username;
        setUserName(usernm);
        setScountry(obj.data.countryId);
        setSclient(obj.data.clientId);
        let response;
        response = getCountry(obj.data.countryId);
        var country = await response;
        setCountry(country);

        let clientResponse;
        clientResponse = getClients(obj.data.clientId);
        var client = await clientResponse;
        setClient(client);

    }

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            countryId:  "",
            clientId:  "",
            roleId:  "",
            isDisabled: false,
            requestUserName: ''
        },
        validationSchema: Yup.object({
            countryId: Yup.string().required("Please Enter Your Country Name"),
            clientId: Yup.string().required("Please Enter Your Client name"),
        }),
        onSubmit: async (values) => {
            let response;
            try {
                const roleIds = selected;
                response = clientRolesSave({
                    countryId: values.countryId,
                    clientId: values.clientId,
                    roleId: roleIds.toString(),
                    isDisabled: false,
                    requestUserName: username
                });

                var data = await response;
                if (data) {
                    getOnLoadingData();
                    values.countryId = "";
                    values.clientId = "";
                    setSelected([]);
                    setOptions([]);
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



    const loadRoles = async (value) => {
        let id = value.target.value;
        if (id === '') {
            setOptions([]);
            setSelected([]);
        } else {
            let response;
            response = getClientRoles(id);
            var client = await response;
            setOptions(client.options);
            setSelected(client.selected);
        }


    }



    document.title = "Client Roles Allocation | eSoft Digital Platform";

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
                    <BreadCrumb title="Client Role Allocation" pageTitle="Roles"/>
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader className="card-header card-primary">
                                    <Row className="g-4 align-items-center">
                                        <Col className="col-sm-auto">
                                            <div>
                                                <h4 color="primary"
                                                    className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                                    Client Role Allocation
                                                </h4>
                                            </div>
                                        </Col>

                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        <form className="tablelist-form"
                                              onSubmit={(e) => {
                                                  e.preventDefault();
                                                  validation.handleSubmit();
                                                  return false;
                                              }}>
                                            <ModalBody>
                                                <div className="mb-3" id="modal-id" style={{display: "none"}}>
                                                    <label htmlFor="id-field" className="form-label">ID</label>
                                                    <input type="text" id="id-field" className="form-control"
                                                           placeholder="ID" readOnly/>
                                                </div>

                                                <Row>
                                                    <Col md={1}></Col>
                                                    <Col md={10}>
                                                        <FormGroup className="mb-10">
                                                            <Label htmlFor="countryId">Country Name</Label>
                                                            <Input
                                                                name="countryId"
                                                                type="select"

                                                                classNamePrefix="select2-selection form-select"
                                                                id="countryId"
                                                                onChange={validation.handleChange}

                                                                onBlur={validation.handleBlur}
                                                                value={validation.values.countryId || ""}
                                                                invalid={
                                                                    validation.touched.countryId &&
                                                                    validation.errors.countryId
                                                                        ? true
                                                                        : false
                                                                }
                                                            >
                                                                <option value={""}>Select Country</option>
                                                                {country.map((item) => (
                                                                    <React.Fragment>
                                                                        <option
                                                                            value={item.countryId}>{item.countryName}</option>
                                                                    </React.Fragment>
                                                                ))}
                                                            </Input>
                                                            {validation.touched.countryId &&
                                                            validation.errors.countryId ? (
                                                                <FormFeedback type="invalid">
                                                                    {validation.errors.countryId}
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
                                                            <Label htmlFor="clientId">Client Name</Label>
                                                            <Input
                                                                name="clientId"
                                                                type="select"
                                                                className="form-control"
                                                                id="clientId"
                                                                value={validation.values.clientId || ""}
                                                                onChange={validation.handleChange}
                                                                onBlur={validation.handleBlur}
                                                                onChangeCapture={(value) => loadRoles(value)}
                                                                invalid={
                                                                    validation.touched.clientId &&
                                                                    validation.errors.clientId
                                                                        ? true
                                                                        : false
                                                                }
                                                            >
                                                                <option value={""}>Select Client</option>
                                                                {client.map((item) => (
                                                                    <React.Fragment>
                                                                        <option
                                                                            value={item.clientId}>{item.clientName}</option>
                                                                    </React.Fragment>
                                                                ))}
                                                            </Input>
                                                            {validation.touched.clientId &&
                                                            validation.errors.clientId ? (
                                                                <FormFeedback type="invalid">
                                                                    {validation.errors.clientId}
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
                                                            <div>
                                                                <h4>Role Allocation</h4>
                                                                <Row>
                                                                    <Col className="col-2"></Col>
                                                                    <Col className="col-6"><h5
                                                                        className="fs-14 mb-1">Non Allocated Roles</h5>
                                                                    </Col>
                                                                    <Col className="col-4"><h5
                                                                        className="fs-14 mb-1">Allocated Roles</h5>
                                                                    </Col>
                                                                </Row>
                                                                <DualListBox
                                                                    options={options}
                                                                    selected={selected}
                                                                    onChange={(e) => setSelected(e)}
                                                                    icons={{
                                                                        moveLeft: <span className="mdi mdi-chevron-left" key="key" />,
                                                                        moveAllLeft: [
                                                                            <span className="mdi mdi-chevron-double-left" key="key" />,
                                                                        ],
                                                                        moveRight: <span className="mdi mdi-chevron-right" key="key" />,
                                                                        moveAllRight: [
                                                                            <span className="mdi mdi-chevron-double-right" key="key" />,
                                                                        ],
                                                                        moveDown: <span className="mdi mdi-chevron-down" key="key" />,
                                                                        moveUp: <span className="mdi mdi-chevron-up" key="key" />,
                                                                        moveTop: (
                                                                            <span className="mdi mdi-chevron-double-up" key="key" />
                                                                        ),
                                                                        moveBottom: (
                                                                            <span className="mdi mdi-chevron-double-down" key="key" />
                                                                        ),
                                                                    }}
                                                                />
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={1}></Col>
                                                </Row>

                                            </ModalBody>
                                            <ModalFooter>
                                                <div className="hstack gap-2 justify-content-center">

                                                    <button type="submit" className="btn btn-primary"
                                                            id="add-btn">{buttonval}</button>
                                                    {/* <button type="button" className="btn btn-success" id="edit-btn">Update</button> */}
                                                </div>
                                            </ModalFooter>


                                        </form>


                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>


        </React.Fragment>
    );
};

export default ClientRoleAllocation;
