import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, CardBody, Container, Form, Input, Label,
  FormFeedback, Button
} from 'reactstrap';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { postresetpassword } from '../../helpers/fakebackend_helper';
import axios from 'axios';
import { toast } from 'react-toastify';

// Utility function to calculate password strength with complexity requirements
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Too weak', color: 'danger', valid: false };

  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 20;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength && hasMaxLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  // Check if all complexity requirements are met
  const isValid = hasMinLength && hasMaxLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  if (score <= 2) return { score, label: 'Weak', color: 'danger', valid: isValid };
  if (score === 3) return { score, label: 'Moderate', color: 'warning', valid: isValid };
  if (score >= 4) return { score, label: 'Strong', color: 'success', valid: isValid };
};

const ResetPassword = ({ isForcePasswordChange }) => {
  const navigate = useNavigate();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '', valid: false });
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [response, setResponse] = useState('');

  const toggleCurrent = () => setShowCurrent(prev => !prev);
  const toggleNew = () => setShowNew(prev => !prev);
  const toggleConfirm = () => setShowConfirm(prev => !prev);

  document.title = `Reset Password | DMS`;

  const validation = useFormik({
    initialValues: {
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
      currentPassword: Yup.string().required('Current Password is required'),
      newPassword: Yup.string()
        .required('New Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(20, 'Password cannot exceed 20 characters')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, 'Password must contain at least one uppercase letter,one lowercase letter, one number, and one special character')
        .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password'),
      confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    }),
  
    onSubmit: async (values) => {
      try {
        // Additional client-side validation for password complexity
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;
        if (!passwordRegex.test(values.newPassword)) {
          setResponse('Password must contain at least one letter, one number, and one special character');
          setSuccessModal(false);
          setErrorModal(true);
          return;
        }

        // Validate password length
        if (values.newPassword.length < 8 || values.newPassword.length > 20) {
          setResponse('Password must be between 8 and 20 characters');
          setSuccessModal(false);
          setErrorModal(true);
          return;
        }

        const payload = {
          email: values.email,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        };

        const response = await postresetpassword(payload);  // API call

        if (response.status === "success") {
          sessionStorage.removeItem('authUser');
          validation.resetForm();
          setPasswordStrength({ score: 0, label: '', color: '', valid: false });
          setResponse(response.message);
          setErrorModal(false);
          setSuccessModal(true);

          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1000);
        }

      } catch (error) {
        console.error('System Error:', error);

        // Handle different error response structures
        let errorMessage = "A system error occurred. Please try again.";
        
        if (error.response && error.response.data) {
          // Handle axios error response
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.response) {
          // Handle direct response object
          errorMessage = error.response.message || errorMessage;
        } else if (error.message) {
          // Handle error message directly
          errorMessage = error.message;
        }

        setResponse(errorMessage);
        setSuccessModal(false);
        setErrorModal(true);
      }
    }
  });

  // Update password strength when newPassword changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(validation.values.newPassword));
  }, [validation.values.newPassword]);

  return (
    <div className="auth-page-content" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <SuccessModal
        show={successModal}
        onCloseClick={() => setSuccessModal(false)}
        successMsg={response}
      />
      <ErrorModal
        show={errorModal}
        onCloseClick={() => setErrorModal(false)}
        successMsg={response} 
      />
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="mt-4 rounded-4">
              <CardBody className="p-4">
                <div className="text-center mt-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/fgxwhgfp.json"
                    trigger="loop"
                    colors="primary:#0ab39c"
                    className="avatar-xl"
                    style={{ width: "120px", height: "120px" }}
                  >
                  </lord-icon>
                  <h5 className="text-primary">{isForcePasswordChange ? 'Reset Password' : 'Change Password'}</h5>
                  <p className="text-muted">Enter your email and password details</p>
                </div>
                <div className="p-2 mt-4">
                  <Form onSubmit={validation.handleSubmit}>
                    {/* Email Field */}
                    <div className="mb-3">
                      <Label className="form-label">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.email}
                        invalid={validation.touched.email && !!validation.errors.email}
                      />
                      {validation.touched.email && validation.errors.email && (
                        <FormFeedback>{validation.errors.email}</FormFeedback>
                      )}
                    </div>

                    {/* Current Password */}
                    <div className="mb-3">
                      <Label className="form-label">Current Password</Label>
                      <div className="position-relative">
                        <Input
                          name="currentPassword"
                          type={showCurrent ? 'text' : 'password'}
                          className="form-control pe-5"
                          placeholder="Enter current password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.currentPassword}
                          invalid={validation.touched.currentPassword && !!validation.errors.currentPassword}
                          maxLength={20}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-0 mt-1 me-3 text-decoration-none text-muted"
                          onClick={toggleCurrent}
                        >
                          <i className={`mdi ${showCurrent ? 'mdi-eye-off' : 'mdi-eye'}`}></i>
                        </button>
                        {validation.touched.currentPassword && validation.errors.currentPassword && (
                          <FormFeedback>{validation.errors.currentPassword}</FormFeedback>
                        )}
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <Label className="form-label">New Password</Label>
                      <div className="position-relative">
                        <Input
                          name="newPassword"
                          type={showNew ? 'text' : 'password'}
                          className="form-control pe-5"
                          placeholder="Enter new password (8-20 characters)"
                          onChange={(e) => {
                            // Limit input to 20 characters
                            const value = e.target.value.slice(0, 20);
                            validation.setFieldValue('newPassword', value);
                            setPasswordStrength(getPasswordStrength(value));
                          }}
                          onBlur={validation.handleBlur}
                          value={validation.values.newPassword}
                          invalid={
                            (validation.touched.newPassword && !!validation.errors.newPassword) ||
                            (validation.values.newPassword && !passwordStrength.valid)
                          }
                          maxLength={20}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-0 mt-1 me-3 text-decoration-none text-muted"
                          onClick={toggleNew}
                        >
                          <i className={`mdi ${showNew ? 'mdi-eye-off' : 'mdi-eye'}`}></i>
                        </button>
                        {validation.touched.newPassword && validation.errors.newPassword && (
                          <FormFeedback>{validation.errors.newPassword}</FormFeedback>
                        )}
                        {validation.values.newPassword && !passwordStrength.valid && !validation.errors.newPassword && (
                          <FormFeedback className="d-block">
                            Password must contain at least one letter, one number, and one special character
                          </FormFeedback>
                        )}
                      </div>

                      {/* Password Strength Bar */}
                      {validation.values.newPassword && (
                        <div className="mt-2">
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className={`progress-bar bg-${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className={`text-${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </small>
                            <small className="text-muted">
                              {validation.values.newPassword.length}/20
                            </small>
                          </div>
                        </div>
                      )}

                    
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <Label className="form-label">Confirm Password</Label>
                      <div className="position-relative">
                        <Input
                          name="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          className="form-control pe-5"
                          placeholder="Confirm new password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.confirmPassword}
                          invalid={validation.touched.confirmPassword && !!validation.errors.confirmPassword}
                          maxLength={20}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-0 mt-1 me-3 text-decoration-none text-muted"
                          onClick={toggleConfirm}
                        >
                          <i className={`mdi ${showConfirm ? 'mdi-eye-off' : 'mdi-eye'}`}></i>
                        </button>
                        {validation.touched.confirmPassword && validation.errors.confirmPassword && (
                          <FormFeedback>{validation.errors.confirmPassword}</FormFeedback>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 d-flex justify-content-end gap-2">
                      <Button
                        color="success"
                        type="submit"
                        disabled={!(validation.isValid && validation.dirty && passwordStrength.valid)}
                      >
                        {'Submit'}
                      </Button>
                      <Button color="warning" type="button" onClick={validation.handleReset} className="me-2">
                        Reset
                      </Button>
                      <Button color="danger" type="button" onClick={() => navigate('/dashboard')} className="me-2">
                        Close
                      </Button>
                    </div>
                  </Form>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;