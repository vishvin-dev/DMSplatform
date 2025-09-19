import React from 'react'

import { Container } from 'reactstrap'
import BreadCrumb from '../../../Components/Common/BreadCrumb'
import TasksKanban from './MainPage'




const Kanbanboard = () => {

    document.title = "Kanban Board | ADMS - Asset & Document Management System";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Kanban Board" pageTitle="Tasks" />
                    <TasksKanban />
                </Container>
            </div>
        </React.Fragment>


    )
}

export default Kanbanboard