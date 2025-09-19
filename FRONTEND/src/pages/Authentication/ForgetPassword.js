import PropTypes from "prop-types";
import React, { useState } from "react";
import { Row, Col, Alert, Card, CardBody, Container, FormFeedback, Input, Label, Form, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

// Redux
import { useSelector, useDispatch } from "react-redux";

// Import useNavigate for routing
import { Link, useNavigate } from "react-router-dom";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// Action
import { userForgetPassword } from "../../slices/thunks";

// Import images
import vishvinLogo from '../../assets/images/Vishvin.png';
import { createSelector } from "reselect";

// Import eye icons for password visibility toggle
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ForgetPasswordPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State for managing the multi-step form flow
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    
    // State for OTP input and errors
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    // State for new password fields, errors, and success message
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // State for success modal
    const [successModal, setSuccessModal] = useState(false);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            emailOrPhone: '',
        },
        validationSchema: Yup.object({
            emailOrPhone: Yup.string().required("Please Enter Your Email or Phone Number"),
        }),
        onSubmit: (values) => {
            dispatch(userForgetPassword(values.emailOrPhone, navigate));
            setIsOtpSent(true);
        }
    });

    const handleResendOtp = () => {
        setOtpError("");
        setOtp("");
        validation.handleSubmit();
    }

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setOtpError("");

        if (otp.length === 6 && /^\d{6}$/.test(otp)) {
            console.log("OTP Verified:", otp);
            setIsOtpVerified(true);
        } else {
            setOtpError("Invalid OTP. Please enter the 6-digit code.");
        }
    }

    // Updated: This function now shows a modal on success
    const handleResetPassword = (e) => {
        e.preventDefault();
        setPasswordError("");

        if (!newPassword || !confirmPassword) {
            setPasswordError("Please fill in both password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match. Please try again.");
            return;
        }
        
        console.log(`Password reset successfully for ${validation.values.emailOrPhone}`);
        
        // Show success modal instead of inline message
        setSuccessModal(true);
    };

    // Function to handle modal close and redirect to login
    const handleModalClose = () => {
        setSuccessModal(false);
        navigate("/login");
    };

    const selectLayoutState = (state) => state.ForgetPassword;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (state) => ({
            forgetError: state.forgetError,
            forgetSuccessMsg: state.forgetSuccessMsg,
        })
    );

    const { forgetError, forgetSuccessMsg } = useSelector(selectLayoutProperties);

    document.title = "Reset Password | ADMS - Asset & Document Management System";

    const pageStyle = {
        backgroundImage: `linear-gradient(rgba(248, 249, 250, 0.85), rgba(248, 249, 250, 0.85)), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '15vh',
    };
    
    const getAlertMessage = () => {
        if (isOtpVerified) {
            return "OTP Verified! Please create your new password.";
        }
        if (isOtpSent) {
            return `An OTP has been sent to ${validation.values.emailOrPhone}`;
        }
        return "Enter your email or phone no, an OTP will be sent to you!";
    }

    return (
        <div style={pageStyle}>
            <div className="auth-page-content" style={{ width: '100%' }}>
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mb-4 text-dark">
                                <div>
                                    <Link to="#" className="d-inline-block auth-logo">
                                        <img src={vishvinLogo} alt="Vishvin Logo" height="50" />
                                    </Link>
                                </div>
                                <p className="mt-3 fs-15 fw-medium">GESCOM Document Management System.</p>
                            </div>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="mt-4">
                                <CardBody className="p-4">
                                    <div className="text-center mt-2">
                                        <h5 className="text-primary">Forgot Password?</h5>
                                        <lord-icon
                                            src="https://cdn.lordicon.com/rhvddzym.json"
                                            trigger="loop"
                                            colors="primary:#0ab39c"
                                            className="avatar-xl"
                                            style={{ width: "120px", height: "120px" }}
                                        ></lord-icon>
                                    </div>

                                    <Alert className="border-0 alert-warning text-center mb-2 mx-2" role="alert">
                                        {getAlertMessage()}
                                    </Alert>

                                    <div className="p-2">
                                        {forgetError && (
                                            <Alert color="danger" style={{ marginTop: "13px" }}>
                                                {typeof forgetError === 'object' && forgetError.message ? forgetError.message : forgetError}
                                            </Alert>
                                        )}
                                        {forgetSuccessMsg && !isOtpSent && (
                                            <Alert color="success" style={{ marginTop: "13px" }}>
                                                {forgetSuccessMsg}
                                            </Alert>
                                        )}

                                        {!isOtpSent && (
                                            <Form onSubmit={(e) => { e.preventDefault(); validation.handleSubmit(); return false; }}>
                                                <div className="mb-4">
                                                    <Label className="form-label">Email / Phone Number</Label>
                                                    <Input name="emailOrPhone" className="form-control" placeholder="Enter email or phone number" type="text" onChange={validation.handleChange} onBlur={validation.handleBlur} value={validation.values.emailOrPhone || ""} invalid={validation.touched.emailOrPhone && !!validation.errors.emailOrPhone} />
                                                    {validation.touched.emailOrPhone && validation.errors.emailOrPhone ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.emailOrPhone}</div></FormFeedback>
                                                    ) : null}
                                                </div>
                                                <div className="text-center mt-4">
                                                    <button className="btn btn-success w-100" type="submit">Send OTP</button>
                                                </div>
                                            </Form>
                                        )}

                                        {isOtpSent && !isOtpVerified && (
                                            <Form onSubmit={handleVerifyOtp}>
                                                {otpError && (<Alert color="danger" className="text-center">{otpError}</Alert>)}
                                                <div className="mb-4">
                                                    <Label className="form-label">Enter OTP</Label>
                                                    <Input name="otp" className="form-control" placeholder="Enter 6-digit OTP" type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} />
                                                </div>
                                                <div className="text-center mt-4">
                                                    <Button color="success" className="w-100" type="submit">Verify OTP</Button>
                                                </div>
                                                <div className="mt-4 text-center">
                                                    <p className="mb-0">Didn't receive an OTP?{" "}
                                                        <Button color="link" className="p-0" type="button" onClick={handleResendOtp}>Resend</Button>
                                                    </p>
                                                </div>
                                            </Form>
                                        )}
                                       
                                        {isOtpVerified && (
                                            <Form onSubmit={handleResetPassword}>
                                                {passwordError && (<Alert color="danger" className="text-center">{passwordError}</Alert>)}
                                              <div className="mb-3">
  <Label className="form-label" htmlFor="password-input">New Password</Label>
  <div className="d-flex align-items-center position-relative">
    <Input
      name="newPassword"
      type={showNewPassword ? "text" : "password"}
      className="form-control pe-5" // add right padding so text doesn't overlap the icon
      placeholder="Enter new password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />
    <span
      className="position-absolute end-0 pe-3 d-flex align-items-center"
      style={{ height: "100%", cursor: "pointer" }}
      onClick={() => setShowNewPassword(!showNewPassword)}
    >
      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>
<div className="mb-3">
  <Label className="form-label" htmlFor="confirm-password-input">Confirm Password</Label>
  <div className="d-flex align-items-center position-relative">
    <Input
      name="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      className="form-control pe-5" // padding so text doesn't clash with the icon
      placeholder="Confirm new password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />
    <span
      className="position-absolute end-0 pe-3 d-flex align-items-center"
      style={{ height: "100%", cursor: "pointer" }}
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

                                                <div className="text-center mt-4">
                                                    <Button color="success" className="w-100" type="submit">Reset Password</Button>
                                                </div>
                                            </Form>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            <div className="mt-4 text-center">
                                <p className="mb-0">Wait, I remember my password... <Link to="/login" className="fw-semibold text-primary text-decoration-underline"> Click here </Link> </p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Success Modal */}
            <Modal isOpen={successModal} centered>
                <ModalHeader className="bg-success text-white">
                    Password Changed Successfully
                </ModalHeader>
                <ModalBody>
                    <div className="text-center">
                        <lord-icon
                            src="https://cdn.lordicon.com/lupuorrc.json"
                            trigger="loop"
                            colors="primary:#0ab39c,secondary:#405189"
                            style={{ width: "120px", height: "120px" }}
                        ></lord-icon>
                        <p className="mt-3">Your password has been reset successfully.</p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={handleModalClose}>
                        OK
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

ForgetPasswordPage.propTypes = {};

export default ForgetPasswordPage;