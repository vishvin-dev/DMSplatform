import React from 'react';
import { CardHeader, Input, Label } from 'reactstrap';

const TableCardHeader = ({ title, button, buttonTitle }) => {
    return (
        <React.Fragment>
            <CardHeader className="align-items-center d-flex">
                <h4 className="mb-sm-0 card-title align-self-center flex-grow-1">
                    {title}
                </h4>
                <div className="flex-shrink-0 d-flex">
                    <button
                        type="button"
                        className="btn btn-sm btn-success mb-3"
                        onClick={button}>
                        {buttonTitle}
                    </button>
                </div>
            </CardHeader>
        </React.Fragment>
    );
}

export default TableCardHeader;