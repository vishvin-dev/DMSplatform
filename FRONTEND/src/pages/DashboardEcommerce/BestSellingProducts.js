import React from 'react';
import { Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import ReactApexChart from 'react-apexcharts';

const StoreVisitsBySource = () => {

    // Chart series data
    const series = [44, 55, 41, 17, 15];

    // Chart options configuration
    const options = {
        labels: ["Direct", "Social", "Email", "Other", "Referrals"],
        chart: {
            height: 333,
            type: "donut",
        },
        legend: {
            position: "bottom",
        },
        stroke: {
            show: false
        },
        dataLabels: {
            dropShadow: {
                enabled: false,
            },
        },
        colors: [
            "#695eef",
            "rgba(105,94,239, 0.85)",
            "rgba(105,94,239, 0.70)",
            "rgba(105,94,239, 0.60)",
            "rgba(105,94,239, 0.45)",
        ],
    };

    return (
        <React.Fragment>
            <Col xl={6}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Store Visits by Source</h4>
                        <div className="flex-shrink-0">
                           
                        </div>
                    </CardHeader>
                    <CardBody>
                        <ReactApexChart
                            dir="ltr"
                            options={options}
                            series={series}
                            type="donut"
                            height="333"
                            className="apex-charts"
                        />
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default StoreVisitsBySource;