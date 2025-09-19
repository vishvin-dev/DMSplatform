import React, { useState } from 'react'
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { Col, Row } from 'reactstrap';
const options = [
  { value: "1", label: "Admin" },
  { value: "2", label: "Operator" },
];

const DualListbox = () => {
  const [selected, setSelected] = useState(["1"]);
  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <div>
            <h5 className="fs-14 mb-1">Role Allocation</h5>
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
        </Col>

      </Row>
    </React.Fragment>
  )
}
export default DualListbox