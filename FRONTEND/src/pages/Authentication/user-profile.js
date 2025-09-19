import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";

import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { useSelector, useDispatch } from "react-redux";

import avatar from "../../assets/images/users/avatar-1.jpg";
// actions
import { editProfile, resetProfileFlag } from "../../slices/thunks";
import { createSelector } from "reselect";

const UserProfile = () => {
  const dispatch = useDispatch();

  const [email, setemail] = useState("admin@gmail.com");
  const [idx, setidx] = useState("1");

  const [userName, setUserName] = useState("Admin");
  const [roleName, setRoleName] = useState("");
  const [locationTypeName, setLocationTypeName] = useState("");
  const [profileImage, setProfileImage] = useState(avatar);
  const [locationName, setLocationName] = useState("")
  const [firstName, setFirstName]=useState("")
  const [lastName, setLastName]=useState("")
  const [dateOfBirth, setDateOfBirth]=useState("")
  const [maritalStatusName, setMaritalStatusName]=useState("")
  

  const selectLayoutState = (state) => state.Profile;
  const userprofileData = createSelector(
    selectLayoutState,
    (state) => ({
      user: state.user,
      success: state.success,
      error: state.error
    })
  );
  // Inside your component
  const {
    user, success, error
  } = useSelector(userprofileData);

  useEffect(() => {
    const authUser = sessionStorage.getItem("authUser");
    if (authUser) {
      const obj = JSON.parse(authUser);

      const userObj = obj.user;
      if (!isEmpty(user)) {
        userObj.firstName = user.firstName;

        sessionStorage.removeItem("authUser");
        sessionStorage.setItem("authUser", JSON.stringify(obj));
      }

      setUserName(userObj.loginName);
      setemail(userObj.emailAddress);
      setidx(userObj.userId);
      setRoleName(userObj.roleName);
      setLocationTypeName(userObj.locationTypeName)
      setLocationName(userObj.locationName)
      setFirstName(userObj.firstName)
      setLastName(userObj.lastName)
      setDateOfBirth(userObj.dateOfBirth)
      setMaritalStatusName(userObj.maritalStatusName)

      // 👇 Convert buffer photo to image
      if (userObj.photo && userObj.photo.data) {
        const byteArray = new Uint8Array(userObj.photo.data);
        const blob = new Blob([byteArray], { type: "image/png" }); // change if it's jpeg
        const imageUrl = URL.createObjectURL(blob);
        setProfileImage(imageUrl);
      }

      setTimeout(() => {
        dispatch(resetProfileFlag());
      }, 3000);
    }
  }, [dispatch, user]);

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      firstName: userName || 'Admin',
      roleName: roleName || "",
      locationTypeName: locationTypeName || "",
      locationName: locationName,
      firstName:firstName,
      lastName:lastName,
      dateOfBirth:dateOfBirth,
      maritalStatusName:maritalStatusName,
      idx: idx || '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Please Enter Your UserName"),
    }),
    onSubmit: (values) => {
      dispatch(editProfile(values));
    }
  });

  document.title = "Profile | DMS"
  return (
    <React.Fragment>
      <div className="page-content mt-lg-5">
        <Container fluid>
          <Row>
            <Col lg="12">
              {error && error ? <Alert color="danger">{error}</Alert> : null}
              {success ? <Alert color="success">Username Updated To {userName}</Alert> : null}

              <Card className="mb-4">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="me-4">
                      {/* <img
                        src={profileImage}
                        alt="Profile"
                        className="avatar-xl rounded-circle img-thumbnail"
                      /> */}
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted">
                        <h4 className="mb-1">{userName || "Admin"}</h4>
                        <p className="mb-1"><strong>Email:</strong> {email}</p>
                        <p className="mb-0"><strong>ID:</strong> #{idx}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Profile Information</h4>
                  <Form
                    className="form-horizontal"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    <Row>
                      {/* Left Column - Current Fields */}
                      <Col lg="6">
                        <div className="mb-3">
                          <Label className="form-label">UserName</Label>
                          <Input
                            name="firstName"
                            className="form-control"
                            placeholder="User Name"
                            type="text"
                            disabled
                            value={validation.values.firstName || ""}
                          />
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">RoleName</Label>
                          <Input
                            name="roleName"
                            className="form-control"
                            placeholder="Role Name"
                            type="text"
                            disabled
                            value={validation.values.roleName || ""}
                          />
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">LocationTypeName</Label>
                          <Input
                            name="locationTypeName"
                            className="form-control"
                            placeholder="Location Type"
                            type="text"
                            disabled
                            value={validation.values.locationTypeName || ""}
                          />
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">LocationName</Label>
                          <Input
                            name="locationName"
                            className="form-control"
                            // placeholder="Location Name"
                            type="text"
                            disabled
                            value={validation.values.locationName || ""}
                          />
                        </div>
                      </Col>

                      {/* Right Column - Future Fields */}
                      <Col lg="6">
                       
                        <div className="mb-3">
                          <Label className="form-label">FirstName</Label>
                          <Input
                            name="firstName"
                            className="form-control"
                            // placeholder="firstNameName"
                            type="text"
                            disabled
                            value={validation.values.firstName || ""}
                          />
                        </div>

                      <div className="mb-3">
                          <Label className="form-label">LastName</Label>
                          <Input
                            name="lastName"
                            className="form-control"
                            // placeholder="firstNameName"
                            type="text"
                            disabled
                            value={validation.values.lastName || ""}
                          />
                        </div>

                          <div className="mb-3">
                          <Label className="form-label">DateOfBirth</Label>
                          <Input
                            name="lastName"
                            className="form-control"
                            // placeholder="firstNameName"
                            type="text"
                            disabled
                            value={validation.values.dateOfBirth || ""}
                          />
                        </div>

                         <div className="mb-3">
                          <Label className="form-label">MaritalStatusName</Label>
                          <Input
                            name="lastName"
                            className="form-control"
                            // placeholder="firstNameName"
                            type="text"
                            disabled
                            value={validation.values.maritalStatusName || ""}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;