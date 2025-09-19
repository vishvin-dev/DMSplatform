import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Col,
    Container,
    Input,
    Label,
    Row,
    Button,
    Form,
    FormFeedback,
    Spinner,
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
} from 'reactstrap';

import { useSelector, useDispatch } from "react-redux";
import { createSelector } from '@reduxjs/toolkit';
import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
import VishvinLogo from '../../assets/images/Vishvin.png';
import VishvinWhiteLogo from '../../assets/images/VishvinWhiteLogo.png'
import GulbargaLogo from '../../assets/images/GulbargaLogo.jpeg';
import Logo from '../../assets/images/Logo.png';
import * as Yup from "yup";
import { useFormik } from "formik";
import { loginUser, socialLogin, resetLoginFlag } from "../../slices/thunks";
import { FiSun, FiMoon, FiXCircle } from 'react-icons/fi';
import { FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';
import SuccessModal from '../../Components/Common/SuccessModal';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import axios from "axios";


// ++ Custom Error Modal Component ++
const CustomErrorModal = ({ show, onClose, message, darkMode }) => {
    if (!show) {
        return null;
    }

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(5px)',
    };

    const modalContentStyle = {
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        color: darkMode ? '#e2e8f0' : '#1e293b',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out'
    };

    const modalHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15px',
        gap: '10px',
        color: '#dc3545',
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: darkMode ? '#94a3b8' : '#6c757d',
    };

    const actionButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '10px 20px',
        marginTop: '20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100px'
    };


    return (
        <div style={modalOverlayStyle} onClick={onClose} role="dialog" aria-modal="true">
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">&times;</button>
                <div style={modalHeaderStyle}>
                    <FiXCircle size={32} />
                    <h4 style={{ margin: 0, color: '#dc3545' }}>Login Failed</h4>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                    {message}
                </p>
                <button onClick={onClose} style={actionButtonStyle}>
                    Close
                </button>
            </div>
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}
            </style>
        </div>
    );
};


const ProfilePic = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const testimonials = [
    {
        id: 1,
        text: "Vishvin Technologies Pvt Ltd is a forward-thinking company that specializes in delivering innovative technology solutions to meet the ever-evolving needs of businesses. With a focus on leveraging cutting-edge technologies, Vishvin Technologies offers a range of services including software development, IT consulting, and digital transformation support. Their team of skilled professionals is dedicated to helping clients streamline operations, enhance productivity, and achieve sustainable growth. By staying at the forefront of technological advancements, Vishvin Technologies Pvt Ltd ensures that their clients remain competitive in today's fast-paced digital landscape. Whether it's developing custom applications or implementing robust IT infrastructure, Vishvin Technologies is committed to delivering excellence and fostering long-term partnerships.",
        image: ProfilePic
    },
];

const importantUpdates = [
    "Important Update: Scheduled maintenance on September 15th from 2:00 AM to 4:00 AM",
    "New Feature: Online bill payment now available with 0% convenience fee",
    "Alert: Beware of fraudulent calls asking for your account details",
    "Notice: New customer service hours - 8:00 AM to 8:00 PM"
];

const Login = (props) => {
    const dispatch = useDispatch();
    const [fontSize, setFontSize] = useState(14);
    const [darkMode, setDarkMode] = useState(false);
    const [kannadaMode, setKannadaMode] = useState(false);
    const [passwordShow, setPasswordShow] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [currentUpdate, setCurrentUpdate] = useState(0);
    const [rememberMe, setRememberMe] = useState(false);
    const [appDetails, setAppDetails] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const selectLoginState = (state) => state.Login;

    const loginpageData = createSelector(
        selectLoginState,
        (loginState) => ({
            user: loginState.user,
            error: loginState.error,
            loading: loginState.loading,
            errorMsg: loginState.errorMsg,
        })
    );

    const {
        user, error, loading, errorMsg
    } = useSelector(loginpageData);
    console.log(`🟣 LOGIN COMPONENT STATE: error: "${error}", errorMsg: ${errorMsg}, loading: ${loading}`);


    useEffect(() => {
        console.log('useEffect triggered. Checking for login errors...');
        if (error && errorMsg) {
            if (error === "Invalid email/phone number or account disabled.") {
                setEmailError(error);
                setPasswordError("");
                console.log('✅ Inline EMAIL error condition MET.');
            } else if (error === "Invalid password.") {
                setPasswordError(error);
                setEmailError("");
                setPasswordShow(true); // Show password on incorrect password
                console.log('✅ Inline PASSWORD error condition MET.');
            } else {
                setErrorMessage(error);
                setErrorModal(true);
                setEmailError("");
                setPasswordError("");
                console.log('✅ MODAL error condition MET with message:', error);
            }
        } else {
            // This is key to showing the error on consecutive attempts
            setEmailError("");
            setPasswordError("");
            console.log('❌ Error condition NOT MET.');
        }
    }, [error, errorMsg]);


    const handleErrorModalClose = () => {
        setErrorModal(false);
        dispatch(resetLoginFlag());
    };

    async function getOnLoadingData() {
        try {
            const responseAppDetails = await axios.post("/application-detail/", {
                username: "Admin"
            });
            setAppDetails(responseAppDetails.data);
        } catch (error) {
            console.error("Error fetching application details:", error);
        }
    }

    useEffect(() => {
        getOnLoadingData();
        const savedCredentials = localStorage.getItem('rememberedCredentials');
        if (savedCredentials) {
            const { email, password } = JSON.parse(savedCredentials);
            validation.setValues({ email, password });
            setRememberMe(true);
        }
    }, []);

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return kannadaMode ? 'ಶುಭೋದಯ' : 'Good Morning!';
        if (hour < 18) return kannadaMode ? 'ಶುಭ ಅಪರಾಹ್ನ' : 'Good Afternoon!';
        return kannadaMode ? 'ಶುಭ ಸಂಜೆ' : 'Good Evening!';
    };

    const [timeGreeting, setTimeGreeting] = useState(getTimeBasedGreeting(kannadaMode));
    useEffect(() => {
        const updateGreeting = () => {
            setTimeGreeting(getTimeBasedGreeting(kannadaMode));
        };
        updateGreeting();
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, [kannadaMode]);

    useEffect(() => {
        const updateInterval = setInterval(() => {
            setCurrentUpdate((prev) => (prev + 1) % importantUpdates.length);
        }, 5000);
        return () => clearInterval(updateInterval);
    }, []);

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex);
    };

    const slides = testimonials.map((testimonial) => {
        return (
            <CarouselItem
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
                key={testimonial.id}
            >
                <div className="testimonial-content">
                    <div className="d-flex align-items-center mb-4">
                        <img
                            src={testimonial.image}
                            alt="testimonial"
                            className="rounded-circle me-3"
                            style={{ width: '80px', height: '80px', objectFit: 'cover', justifyContent: 'flex-end' }}
                        />
                    </div>
                    <p style={{
                        color: darkMode ? '#e2e8f0' : '#4a5568',
                        fontStyle: 'normal',
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.6',
                        textAlign: 'justify',
                        hyphens: 'auto',
                        wordBreak: 'break-word',
                        padding: '0 10px'
                    }}>
                        {testimonial.text}
                    </p>
                </div>
            </CarouselItem>
        );
    });

    const [userLogin, setUserLogin] = useState([]);

    useEffect(() => {
        if (user && user.email) {
            const updatedUserData = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? user.multiFactor.user.email : user.email;
            const updatedUserPassword = process.env.REACT_APP_DEFAULTAUTH === "firebase" ? "" : user.confirm_password;
            setUserLogin({
                email: updatedUserData,
                password: updatedUserPassword
            });
        }
    }, [user]);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: userLogin.email || '',
            password: userLogin.password || '',
        },
        validationSchema: Yup.object({
            email: Yup.string().required(
                kannadaMode ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ" : "Please Enter Your UserName"
            ),
            password: Yup.string().required(
                kannadaMode ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್ವರ್ಡ್ ನಮೂದಿಸಿ" : "Please Enter Your Password"
            ),
        }),
        onSubmit: (values) => {
            setEmailError("");
            setPasswordError("");
            dispatch(resetLoginFlag()); // Clear previous errors before a new login attempt

            if (rememberMe) {
                localStorage.setItem('rememberedCredentials', JSON.stringify(values));
            } else {
                localStorage.removeItem('rememberedCredentials');
            }
            dispatch(loginUser(values, props.router.navigate));
        }
    });

    const handleSuccessModalClose = () => {
        setSuccessModal(false);
    };

    const handleRememberMeChange = (e) => {
        setRememberMe(e.target.checked);
        if (!e.target.checked) {
            localStorage.removeItem('rememberedCredentials');
        }
    };

    const signIn = type => {
        dispatch(socialLogin(type, props.router.navigate));
    };

    const socialResponse = type => {
        signIn(type);
    };

    const changeFontSize = (change) => {
        const newSize = fontSize + change;
        if (newSize >= 12 && newSize <= 18) {
            setFontSize(newSize);
            document.body.style.fontSize = `${newSize}px`;
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.className = !darkMode ? 'dark-mode' : '';
    };

    const toggleKannadaMode = () => {
        setKannadaMode(!kannadaMode);
    };

    const headerStyle = {
        backgroundColor: darkMode ? '#1a1a2e' : '#fff',
        padding: '15px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000,
        color: darkMode ? '#fff' : '#333',
        marginTop: '40px'
    };

    const criticalHeaderStyle = {
        background: 'linear-gradient(90deg,rgb(36, 170, 159),rgb(145, 73, 145))',
        color: '#fff',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1050,
        height: '40px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    };

    const cardStyle = {
        backgroundColor: darkMode ? '#16213e' : '#fff',
        color: darkMode ? '#fff' : '#333',
        border: darkMode ? '1px solid #2d3748' : '1px solid #dee2e6',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    const updateBarStyle = {
        backgroundColor: darkMode ? '#2d3748' : '#e9ecef',
        color: darkMode ? '#fff' : '#333',
        padding: '5px',
        borderTop: darkMode ? '1px solid #4a5568' : '1px solid #dee2e6',
        borderBottom: darkMode ? '1px solid #4a5568' : '1px solid #dee2e6',
        background: 'linear-gradient(90deg,rgb(101, 194, 116),rgb(144, 142, 165))',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        overflow: 'hidden',
        position: 'fixed',
        bottom: '40px',
        left: 0,
        right: 0,
        zIndex: 1
    };

    const footerStyle = {
        backgroundColor: 'transparent',
        color: darkMode ? '#fff' : '#333',
        padding: '20px 0 40px 20px',
        position: 'fixed',
        bottom: '40px',
        width: '100%',
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 1000
    };

    const criticalFooterStyle = {
        background: 'linear-gradient(90deg,rgb(30, 111, 114),rgb(136, 74, 145))',
        color: '#fff',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.2)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const inputStyle = {
        backgroundColor: darkMode ? '#1e293b' : '#fff',
        color: darkMode ? '#fff' : '#333',
        borderColor: darkMode ? '#2d3748' : '#ced4da',
        fontSize: `${fontSize}px`
    };

    const toggleButtonStyle = {
        backgroundColor: darkMode ? '#4f46e5' : '#e2e8f0',
        color: darkMode ? '#fff' : '#333',
        border: 'none',
        borderRadius: '20px',
        padding: '8px 15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginLeft: '10px'
    };

    const kannadaButtonStyle = {
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: "'Noto Sans Kannada', sans-serif",
        marginRight: '10px'
    };

    return (
        <React.Fragment>
            <CustomErrorModal
                show={errorModal}
                onClose={handleErrorModalClose}
                message={errorMessage}
                darkMode={darkMode}
            />

            <SuccessModal
                show={successModal}
                onCloseClick={handleSuccessModalClose}
                successMsg="Login successful!"
            />

            {/* Critical Header Section */}
            <div style={criticalHeaderStyle}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginLeft: 'auto'
                }}>
                    <div style={{
                        color: '#fff',
                        fontSize: `${fontSize}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                        <span></span>
                        {new Date()
                            .toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            })
                            .toUpperCase()}

                    </div>

                    <button
                        onClick={toggleDarkMode}
                        style={toggleButtonStyle}
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? (
                            <FiSun size={16} style={{ marginRight: '5px' }} />
                        ) : (
                            <FiMoon size={16} style={{ marginRight: '5px' }} />
                        )}
                    </button>
                    <button
                        onClick={toggleKannadaMode}
                        style={kannadaButtonStyle}
                        aria-label={kannadaMode ? 'Switch to English' : 'Switch to Kannada'}
                    >
                        {kannadaMode ? 'ENG' : 'ಕನ್ನಡ'}
                    </button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        padding: '2px 5px'
                    }}>
                        <button
                            onClick={() => changeFontSize(-1)}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: 'none',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                            disabled={fontSize <= 10}
                        >
                            -
                        </button>
                        <span style={{ margin: '0 5px' }}>A</span>
                        <button
                            onClick={() => changeFontSize(1)}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: 'none',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                            disabled={fontSize >= 18}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="auth-header" style={headerStyle}>
                <Container fluid>
                    <Row className="align-items-center text-center text-md-start">
                        <Col xs={12} md={3} className="mb-3 mb-md-0 d-flex justify-content-center justify-content-md-start">
                            <Link to="http://vishvin.com/" className="d-inline-block">
                                <img
                                    src={darkMode ? VishvinWhiteLogo : VishvinLogo}
                                    alt="Vishvin Logo"
                                    height="60" />
                            </Link>
                        </Col>

                        <Col xs={12} md={6} className="mb-3 mb-md-0 text-center">
                            <div className="d-flex flex-column flex-md-row justify-content-center align-items-center">
                                <div style={{ lineHeight: '1.1' }}>
                                    <h3 style={{
                                        fontWeight: '1000',
                                        marginBottom: '0',
                                        color: darkMode ? '#fff' : '#333',
                                        fontSize: `${fontSize + 8}px`,
                                    }}>
                                        {kannadaMode
                                            ? 'ಡಾಕ್ಯುಮೆಂಟ್ ಮ್ಯಾನೇಜ್ಮೆಂಟ್ ಸಿಸ್ಟಮ್'
                                            : 'Document Management System (DMS)'}
                                    </h3>
                                </div>
                            </div>
                        </Col>

                        <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end align-items-center">
                            <div className="font-size-control" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                marginRight: '10px',
                                fontSize: '14px',
                                color: darkMode ? '#fff' : '#333'
                            }}>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </header>

            {/* Main Content */}
            <div className="auth-page-content" style={{
                backgroundColor: darkMode ? '#0f172a' : '#f8f9fa',
                minHeight: 'calc(100vh - 180px)',
                paddingBottom: '200px',
                paddingTop: '60px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Container fluid className="content-delay">
                    <Row className="justify-content-center">
                        <Col md={4} className="mt-8 mt-md-0">
                            <Card style={{
                                ...cardStyle,
                                backgroundColor: darkMode ? 'rgba(22, 33, 62, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                                backgroundImage: `url(${Logo})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundBlendMode: 'overlay',
                                backgroundRepeat: 'no-repeat',
                                backdropFilter: 'blur(8px)',
                                border: darkMode ? '1px solid rgba(45, 55, 72, 0.3)' : '1px solid rgba(222, 226, 230, 0.3)',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: '400px'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: darkMode ? 'rgba(22, 33, 62, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                                    zIndex: 0
                                }}></div>
                                <CardBody className="p-4" style={{
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <div className="text-left mt-2" style={{ marginLeft: '15px' }}>
                                        <h5 className="text-primary" style={{
                                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                            fontSize: `${fontSize + 8}px`,
                                        }}>
                                            {kannadaMode ? 'ನಮಸ್ಕಾರ!' : 'Hello'}
                                        </h5>
                                        <h5 className="text-primary" style={{
                                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                            fontSize: `${fontSize + 8}px`,
                                        }}>
                                            {timeGreeting}
                                        </h5>
                                        <p className={darkMode ? "text-light" : "text-muted"} style={{
                                            textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                            fontSize: `${fontSize}px`
                                        }}>
                                            {kannadaMode ? 'ಮುಂದುವರೆಯಲು ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Sign in to continue'}
                                        </p>
                                    </div>

                                    <div className="p-2 mt-4">
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                validation.handleSubmit();
                                                return false;
                                            }}
                                            action="#">

                                            <div className={`mb-3 ${emailError ? 'shake-animation' : ''}`}>
                                                <Label htmlFor="UserName" className="form-label" style={{
                                                    color: darkMode ? '#fff' : '#333',
                                                    fontSize: `${fontSize}px`
                                                }}>
                                                    {kannadaMode ? 'ಬಳಕೆದಾರರ ಇಮೇಲ್ / ಫೋನ್ ನಂಬರ್' : 'Email / Phone Number'}
                                                </Label>
                                                <Input
                                                    name="email"
                                                    className="form-control"
                                                    placeholder={kannadaMode ? 'ಬಳಕೆದಾರಇಮೇಲ್ / ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ' : "Enter Email / Phone Number"}
                                                    type="email"
                                                    onChange={validation.handleChange}
                                                    onBlur={validation.handleBlur}
                                                    value={validation.values.email || ""}
                                                    invalid={(validation.touched.email && !!validation.errors.email) || !!emailError}
                                                    style={inputStyle}
                                                    onFocus={() => setEmailError("")}
                                                />
                                                {validation.touched.email && validation.errors.email ? (
                                                    <FormFeedback type="invalid" style={{ fontSize: `${fontSize}px` }}>
                                                        {validation.errors.email}
                                                    </FormFeedback>
                                                ) : emailError ? (
                                                    <FormFeedback type="invalid" style={{ fontSize: `${fontSize}px` }}>
                                                        {emailError}
                                                    </FormFeedback>
                                                ) : null}
                                            </div>

                                            <div className={`mb-3 ${passwordError ? 'shake-animation' : ''}`}>
                                                <Label className="form-label" htmlFor="password-input" style={{
                                                    color: darkMode ? '#fff' : '#333',
                                                    fontSize: `${fontSize}px`
                                                }}>
                                                    {kannadaMode ? 'ಪಾಸ್ವರ್ಡ್' : 'Password'}
                                                </Label>
                                                <div className="position-relative auth-pass-inputgroup mb-3">
                                                    <Input
                                                        name="password"
                                                        value={validation.values.password || ""}
                                                        type={passwordShow ? "text" : "password"}
                                                        className="form-control pe-5"
                                                        placeholder={kannadaMode ? 'ಪಾಸ್ವರ್ಡ್ ನಮೂದಿಸಿ' : "Enter Password"}
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        invalid={(validation.touched.password && !!validation.errors.password) || !!passwordError}
                                                        style={inputStyle}
                                                        onFocus={() => {
                                                            setPasswordError("");
                                                            setPasswordShow(false);
                                                        }}
                                                    />
                                                    {/* Eye icon to toggle password visibility */}
                                                    {!passwordError && (
                                                        <Button
                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none material-shadow-none"
                                                            type="button"
                                                            id="password-addon"
                                                            onClick={() => setPasswordShow(!passwordShow)}
                                                            style={{
                                                                color: darkMode ? '#94a3b8' : '#6c757d',
                                                                backgroundColor: 'transparent',
                                                                border: 'none'
                                                            }}
                                                        >
                                                            {passwordShow ? <FiEyeOff /> : <FiEye />}
                                                        </Button>
                                                    )}
                                                    {/* Show form feedback for validation or API errors */}
                                                    {(validation.touched.password && validation.errors.password) || passwordError ? (
                                                        <FormFeedback type="invalid" style={{ fontSize: `${fontSize}px` }}>
                                                            {validation.errors.password || passwordError}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </div>


                                            <div className="form-check">
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="auth-remember-check"
                                                    checked={rememberMe}
                                                    onChange={handleRememberMeChange}
                                                    style={{
                                                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.7)' : '',
                                                        borderColor: darkMode ? '#4f46e5' : '#adb5bd'
                                                    }}
                                                />
                                                <Label className="form-check-label" htmlFor="auth-remember-check" style={{
                                                    color: darkMode ? '#fff' : '#333',
                                                    fontSize: `${fontSize}px`
                                                }}>
                                                    {kannadaMode ? 'ನನ್ನನ್ನು ನೆನಪಿಡಿ' : 'Remember me'}
                                                </Label>
                                            </div>

                                            {/* ++ MODIFIED: Added 'signin-button' className for CSS targeting ++ */}
                                            <div className="mt-4">
                                                <Button
                                                    color="success"
                                                    className="btn btn-success w-100 signin-button"
                                                    type="submit"
                                                    disabled={loading}
                                                    style={{
                                                        backgroundColor: 'rgba(40, 167, 69, 0.9)',
                                                        borderColor: 'rgba(40, 167, 69, 0.9)',
                                                        fontSize: `${fontSize}px`,
                                                        padding: '10px'
                                                    }}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Spinner size="sm" className='me-2' />
                                                            {kannadaMode ? 'ಲಾಗ್ ಇನ್ ಆಗುತ್ತಿದೆ...' : 'Logging in...'}
                                                        </>
                                                    ) : (
                                                        kannadaMode ? 'ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Sign in'
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="mt-2 text-start">
                                                <Link to="/forgot-password" className="text-muted" style={{ fontSize: `${fontSize}px` }}>
                                                    {kannadaMode ? 'ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?' : 'Forgot password?'}
                                                </Link>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Footer Section */}
            <footer style={footerStyle}>
                <div style={{ position: 'relative', height: '100px', overflow: 'hidden', marginBottom: '-40px', marginLeft: '-30px' }}>
                    <div style={{ position: 'relative', zIndex: 1, padding: '20px', color: darkMode ? '#fff' : '#000' }}>
                        <Row className="align-items-center justify-content-between">
                            <Col xs={12} md="auto">
                                <div className="d-flex flex-wrap justify-content-center justify-content-md-start" style={{ gap: '2.5rem' }}>
                                    <div className="d-flex align-items-center">
                                        <i
                                            className="ri-mail-fill me-2"
                                            style={{
                                                color: darkMode ? '#94a3b8' : '#6c757d',
                                                fontSize: `${fontSize}px`,
                                            }}
                                        ></i>
                                        <a href='mailto:support@vishvin.com'>
                                            <span style={{ color: darkMode ? '#94a3b8' : '#6c757d', fontSize: `${fontSize}px` }}>
                                                support@vishvin.com
                                            </span>
                                        </a>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <i
                                            className="ri-phone-fill me-2"
                                            style={{
                                                color: darkMode ? '#94a3b8' : '#6c757d',
                                                fontSize: `${fontSize}px`,
                                            }}
                                        ></i>
                                        <a href='tel:08035711232'>
                                            <span style={{ color: darkMode ? '#94a3b8' : '#6c757d', fontSize: `${fontSize}px` }}>
                                                080-3571-1232
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} md="auto" >
                                <div className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-4">
                                    <div className="d-flex" style={{ gap: '2.5rem' }}>
                                        <Link to="#" className={darkMode ? "text-light" : "text-muted"}>
                                            <i className="ri-facebook-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </Link>
                                        <Link to="#" className={darkMode ? "text-light" : "text-muted"}>
                                            <i className="ri-twitter-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </Link>
                                        <Link to="https://www.linkedin.com/company/vishvin-technologies-private-limited/" className={darkMode ? "text-light" : "text-muted"}>
                                            <i className="ri-linkedin-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </Link>
                                        <Link to="https://www.instagram.com/letsconnectvishvin?utm_source=qr&igsh=ZXdnajVyM2k4ajNw" className={darkMode ? "text-light" : "text-muted"}>
                                            <i className="ri-instagram-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div style={{ position: 'absolute', inset: '0px', zIndex: -1, borderRadius: '0 0 30px 30px', filter: 'drop-shadow(10px 4px 10px rgba(0, 0, 0, 0.1))' }}>
                        <svg viewBox="0 50 1440 186" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.1)" />
                                </filter>
                            </defs>
                            <path d="M0 52H306.570C327.42 66 335.493 72.5912 344.992 83.9908L365.008 108.009C374.507 119.409 388.58 126 403.419 126H470H650H830H1440V250H0V66Z" fill={darkMode ? '#1a1a2e' : 'white'} stroke={darkMode ? '#2d3748' : '#e9ecef'} strokeWidth="0.1" filter="url(#shadow)" />
                        </svg>
                    </div>
                </div>
            </footer>

            <div style={{
                ...updateBarStyle,
                position: 'fixed',
                bottom: '40px',
                left: 0,
                right: 0,
                zIndex: 999,
                marginBottom: '0'
            }}>
                <Container fluid>
                    <div style={{
                        width: '100%',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            paddingLeft: '100%',
                            animation: 'scrollText 20s linear infinite'
                        }}>
                            <span style={{
                                fontWeight: 'bold',
                                marginRight: '10px',
                                fontSize: `${fontSize}px`
                            }}>
                                {kannadaMode ? 'ಪ್ರಮುಖ ಸುದ್ದಿ:' : 'Important:'}
                            </span>
                            <span style={{ fontSize: `${fontSize}px` }}>
                                {importantUpdates.join(' • ')}
                            </span>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Critical Footer Section */}
            <div style={criticalFooterStyle}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    Copyright © 2025-2026 Vishvin Technologies Pvt Ltd. All rights reserved.

                </div>
            </div>

            {/* ++ MODIFIED: Added CSS for the button click animation ++ */}
            <style>
                {`
                @keyframes scrollText {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-100%);
                    }
                }
                @keyframes shake {
                    10%, 90% {
                        transform: translate3d(-1px, 0, 0);
                    }
                    20%, 80% {
                        transform: translate3d(2px, 0, 0);
                    }
                    30%, 50%, 70% {
                        transform: translate3d(-4px, 0, 0);
                    }
                    40%, 60% {
                        transform: translate3d(4px, 0, 0);
                    }
                }
                .shake-animation {
                    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
                }
                .signin-button {
                    transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
                }
                .signin-button:active {
                    transform: scale(0.98);
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
                }
                `}
            </style>
        </React.Fragment>
    );
};

export default withRouter(Login);