// import React from 'react';
// import { Col, Container, Row } from 'reactstrap';
// import axios from 'axios';
// import { useState, useEffect } from 'react';

// const Footer = () => {

//     const [appDetails, setAppDetails] = useState();
//     const [username, setUserName] = useState('');

//     async function getOnLoadingData() {
//         const obj = JSON.parse(sessionStorage.getItem("authUser"));
//         const usernm = obj.user.loginName  
//         setUserName(usernm)// Get the username from sessionStorage

//         try {
//             // Pass the username in the request body
//             const responseAppDetails = await axios.post("/application-detail/", {
//                 username: username  // Send the username to the backend
//             });

//             const appDetails = responseAppDetails; // Access the first element of the 'data' array
//             setAppDetails(appDetails.data);
//             setUserName(usernm);
//         } catch (error) {
//             console.error("Error fetching application details:", error);
//         }
//     }

//     useEffect(() => {
//         getOnLoadingData();
//     }, []);

//     return (
//         <React.Fragment>
//             <footer className="footer galaxy-border-none">
//                 <Container fluid>
//                     <Row>
//                         <Col sm={6}>
//                         {appDetails && Array.isArray(appDetails) && appDetails[0]?.copyRight}

//                         </Col>
//                         <Col sm={6}>
//                             <div className="text-sm-end d-none d-sm-block">
//                             {appDetails && Array.isArray(appDetails) && appDetails[0]?.applicationName}
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>
//             </footer>
//         </React.Fragment>
//     );
// };

// export default Footer;




import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Footer = () => {
    const [appDetails, setAppDetails] = useState();
    const [username, setUserName] = useState('');

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;  
        setUserName(usernm);
    }

    useEffect(() => {
        getOnLoadingData();
    }, []);

    return (
        <React.Fragment>
            <footer className="footer galaxy-border-none">
                <Container fluid>
                    <Row>
                        <Col sm={12}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center', // Center the content horizontally
                                gap: '20px',
                                padding: '5px 0', // Add some vertical padding
                                marginTop: '-5px'
                            }}>
                                Copyright © 2025-2026 Vishvin Technologies Pvt Ltd. All rights reserved.
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </React.Fragment>
    );
};

export default Footer;