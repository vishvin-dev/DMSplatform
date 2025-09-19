import React, { useState, useEffect, useMemo } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label, FormFeedback,
    Form, Modal, Input, FormGroup
} from 'reactstrap';

import BreadCrumb from '../../Components/Common/BreadCrumb';
import TableContainer from "../../Components/Common/TableContainerReactTable";
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";

import {
    getClientMaterialMappingCountry,
    getClientMaterialMappingClientByCountry,
    getClientMaterialMappingNonAllocatedMsByClientId,
    getClientMaterialMappingAllocatedMsByClientId,
    postClientMaterialMapping

} from "../../helpers/fakebackend_helper";


const ClientSupplierAllocation = () => {


    const [buttonval, setbuttonval] = useState('');
    const [countries, setCountries] = useState([]);
    const [clients, setClients] = useState([]);
    const [username, setUserName] = useState('');
    const [allocatedData, setAllocatedData] = useState([]);
    const [nonAllocatedData, setNonAllocatedData] = useState([]);
    const [allocatedDatabk, setAllocatedDatabk] = useState([]);
    const [nonAllocatedDatabk, setNonAllocatedDatabk] = useState([]);

    const [name, setName] = useState('');
    const [modal_list, setmodal_list] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [edit_items, setedit_items] = useState([]);
    const [edit_update, setedit_update] = useState(false);
    const [checked, setChecked] = React.useState(false);
    const [response, setResponse] = useState('');
    const [client, setClient] = useState([]);
    const [isTableDisbled, setIsTableDisbled] = useState(false);
    const [sessCountryId, setSessCountryId] = useState('');
    const [sessClientId, setSessClientId] = useState('');



    //load table data
    useEffect(() => {
        getOnLoadingData();


    }, []);

    async function getOnLoadingData() {

        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        var usernm = obj.data.username;
        setUserName(usernm);
        setSessClientId(obj.data.clientId);
        setSessCountryId(obj.data.countryId);




        try {
            let allCountries;
            allCountries = getClientMaterialMappingCountry(obj.data.countryId);
            const response = await allCountries;

            const countryList = response.map((country) => ({
                value: country.countryId, // using app's ID as the value
                label: country.countryName, // using app's name as the label
            }));

            setCountries(countryList);

            let allClients;
            allClients = getClientMaterialMappingClientByCountry(obj.data.countryId, obj.data.clientId);
            const cresponse = await allClients;

            const clientList = cresponse.map((client) => ({
                value: client.clientId, // using app's ID as the value
                label: client.clientName, // using app's name as the label
            }));

            setClients(clientList);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }

        let response;
        response = getClientMaterialMappingNonAllocatedMsByClientId(obj.data.clientId);

        var resp = await response;
        console.log(resp);
        setNonAllocatedData(resp);
        setNonAllocatedDatabk(resp);

        let allocatedresponse;
        allocatedresponse = getClientMaterialMappingAllocatedMsByClientId(obj.data.clientId);

        var alcresp = await allocatedresponse;

        setAllocatedData(alcresp);
        setAllocatedDatabk(alcresp);




    }




    const columns = useMemo(
        () => [

            /*  {
                 header: 'Status',
                 accessorKey: 'CheckBox',
                 disableFilters: false,
                 enableColumnFilter: false,
                 cell: (allocatedData) => {

                     return (
                         <div className="d-flex gap-2">
                             <div className="form-check form-check-outline form-check-success mb-3">
                                 <Input className="form-check-input" type="checkbox" id="formCheck15" defaultChecked />
                                 <Label className="form-check-label" for="formCheck15">
                                 </Label>
                             </div>

                         </div>)
                 }
             },
  */
            {
                header: 'Supplier ID',
                accessorKey: 'supplierID',
                disableFilters: false,
                enableColumnFilter: false,
            },

            {
                header: 'Company Name',
                accessorKey: 'companyName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Company Code',
                accessorKey: 'companyCode',
                disableFilters: false,
                enableColumnFilter: false,
            },

            {
                header: 'WebSite',
                accessorKey: 'website',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'ContactNumber',
                accessorKey: 'contactNumber',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'EmailAddress',
                accessorKey: 'emailAddress',
                disableFilters: false,
                enableColumnFilter: false,
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
                                <button className="btn btn-sm btn-success " onClick={() =>
                                    updateRow(data)}
                                >Add</button>

                            </div>

                        </div>)
                }
            },
        ],
        []
    );

    const nonAllocatedColumns = useMemo(
        () => [

            /*  {
                 header: 'Status',
                 accessorKey: 'CheckBox',
                 disableFilters: false,
                 enableColumnFilter: false,
                 cell: (allocatedData) => {

                     return (
                         <div className="d-flex gap-2">
                             <div className="form-check form-check-outline form-check-success mb-3">
                                 <Input className="form-check-input" type="checkbox" id="formCheck15" defaultChecked />
                                 <Label className="form-check-label" for="formCheck15">
                                 </Label>
                             </div>

                         </div>)
                 }
             },
  */
            {
                header: 'Supplier ID',
                accessorKey: 'supplierID',
                disableFilters: false,
                enableColumnFilter: false,
            },

            {
                header: 'Company Name',
                accessorKey: 'companyName',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Company Code',
                accessorKey: 'companyCode',
                disableFilters: false,
                enableColumnFilter: false,
            },

            {
                header: 'WebSite',
                accessorKey: 'website',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'ContactNumber',
                accessorKey: 'contactNumber',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'EmailAddress',
                accessorKey: 'emailAddress',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Address',
                accessorKey: 'aAddress',
                disableFilters: false,
                enableColumnFilter: false,
            },
            {
                header: 'Action',
                accessorKey: 'materialSubCategoryId',
                disableFilters: false,
                enableColumnFilter: false,
                cell: (data) => {

                    return (
                        <div className="d-flex gap-2">
                            <div className="Add">
                                {/*  <button className="btn btn-sm btn-success " onClick={() =>
                                    updateRow(data)}
                                >Add</button> */}
                                <button type="submit" className="btn btn-success" id="add-btn">{buttonval}Add</button>

                            </div>

                        </div>)
                }
            },
        ],
        []
    );
    const filter = (e) => {
        const keyword = e.target.value;

        const filterData = allocatedDatabk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => {
                return d.materialSubCategoryName.toLowerCase().includes(keyword.toLowerCase());
            });
            setAllocatedData(results);
        } else {
            setAllocatedData(allocatedDatabk);
        }
        setName(keyword);
    };


    //nagesh gg

    document.title = "Location Type | eSoft Digital Platform";

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
                    <BreadCrumb title="Client Supplier Allocation" pageTitle="Pages" />

                    <Card>
                        <CardHeader className="card-header card-primary">
                            <Row className="g-4 align-items-center">
                                <Col className="col-sm-auto">
                                    <div>
                                        <h4 color="success"
                                            className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                            Client Supplier Allocation
                                        </h4>
                                    </div>
                                </Col>

                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Row className="g-2 gap-1">
                                <Col sm={4}>
                                    <Row>
                                        <div className="form-floating">

                                            <Input
                                                name="searchCountryId"
                                                type="select"
                                                className="form-select"
                                                id="searchCountryId-field"

                                                aria-label="Floating label select example"
                                            >

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

                                <Col className="d-flex justify-content-lg-end ">

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

                                                    {clients.map((item, key) => (
                                                        <React.Fragment key={key}>
                                                            {<option value={item.value} key={key}>{item.label}</option>}
                                                        </React.Fragment>
                                                    ))}
                                                </Input>


                                                <Label htmlFor="floatingSelect">Client</Label>
                                            </div>

                                        </Row>
                                    </Col>
                                </Col>




                            </Row>
                        </CardBody>
                    </Card>

                    <Card >

                        <CardBody>
                            <Row>
                                <Col>
                                    <div className="d-flex justify-content-sm">
                                        <h5>Non Allocated Supplier View</h5>
                                    </div>
                                </Col>

                                <Col className="d-flex justify-content-lg-end mb-3 ">

                                    <Col sm={6}>
                                        <div className="search-box">
                                            <Input id="searchResultList" type="text" className="form-control" placeholder="Search for Supplier" onChange={(e) => filter(e)} />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </Col>

                                </Col>

                            </Row>

                            <Row>
                                <Col lg={12}>
                                    <TableContainer
                                        columns={(nonAllocatedColumns || [])}
                                        data={(nonAllocatedData || [])}
                                        isPagination={true}
                                        isGlobalFilter={false}
                                        iscustomPageSize={true}
                                        isBordered={true}
                                        customPageSize={5}
                                        className="custom-header-css table align-middle table-nowrap"
                                        tableClass="align-middle table-nowrap mb-0"
                                        theadClass="align-middle table-nowrap mb-0"

                                    />
                                </Col>
                            </Row>

                        </CardBody>
                    </Card>


                    <Card>
                        <CardBody>
                            <Row>

                                <Col>
                                    <div className="d-flex justify-content-sm">

                                        <h5>Allocated Supplier View</h5>

                                    </div>
                                </Col>


                                <Col className="d-flex justify-content-lg-end  ">

                                    <Col sm={6}>
                                        <div className="search-box">
                                            <Input id="searchResultList" type="text" className="form-control" placeholder="Search for Material..." onChange={(e) => filter(e)} />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </Col>

                                </Col>
                            </Row>


                            <Row>
                                <div className='d-flex justify-content-lg-end mt-2 '>
                                    <Col lg={12}>
                                        <TableContainer
                                            columns={(columns || [])}
                                            data={(allocatedData || [])}
                                            isPagination={true}
                                            isGlobalFilter={false}
                                            iscustomPageSize={true}
                                            isBordered={true}
                                            customPageSize={5}
                                            className="custom-header-css table align-middle table-nowrap"
                                            tableClass="table-hover align-middle table-nowrap mb-0"
                                            theadClass="table-hover align-middle table-nowrap mb-0"
                                        />
                                    </Col>
                                </div>
                            </Row>

                        </CardBody>
                    </Card>

                </Container>
            </div>



        </React.Fragment >
    );
};

export default ClientSupplierAllocation;