import React from 'react';
import { Container, Row } from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import AllTransactions from './AllTransactions';
import Widgets from './Widgets';


const Transactions = () => {
    document.title="Transactions | ADMS - Asset & Document Management System";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Transactions" pageTitle="Crypto" />
                    <Row>
                        <Widgets />
                    </Row>
                    <AllTransactions />
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Transactions;