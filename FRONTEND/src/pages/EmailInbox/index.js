import React from 'react';
import { Container } from 'reactstrap';
import EmailToolbar from './EmailToolbar';

const MailInbox = () => {
    document.title="Mailbox | ADMS - Asset & Document Management System";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <EmailToolbar />
                </Container>
            </div>
        </React.Fragment>
    );
};

export default MailInbox;