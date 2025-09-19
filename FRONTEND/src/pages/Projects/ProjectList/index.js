import React from 'react';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import { Container } from 'reactstrap';

import List from './List';

const ProjectList = () => {

    document.title = "Project List | ADMS - Asset & Document Management System";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Project List" pageTitle="Projects" />
                    <List />
                </Container>
            </div>
        </React.Fragment>
    );
};

export default ProjectList;