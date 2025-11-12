import React, { useState, useEffect } from 'react';
import {
    Container, Form, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Progress, Label, Input, FormGroup, Button
} from "reactstrap";
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import classnames from "classnames";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getUserDropDowns, AllUserCreationSubmit, getAllUserDropDownss } from "../../helpers/fakebackend_helper"
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import Male from '../../assets/images/Male.jpg';
import Female from '../../assets/images/Female.jpg';
import None from '../../assets/images/None.jpg';
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"

// React DatePicker imports
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserCreation = () => {
    // State for active tab and progress
    const [activeTab, setActiveTab] = useState(1);
    const [passedSteps, setPassedSteps] = useState([1]);
    const [progressBar, setProgressBar] = useState(33);
    const [roles, setLroles] = useState([]);
    const [section, setsection] = useState([])
    const [subDivision, setsubDivision] = useState([]);
    const [divisionName, setDivisionName] = useState([]);
    const [genders, setGenders] = useState([]);
    const [maritalStatus, setMaritalStatus] = useState([]);
    const [response, setResponse] = useState('');
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [src, setSrc] = useState(None);
    const [username, setUserName] = useState('');
    const [userId, setUserId] = useState(0);
    const [selectedGender, setSelectedGender] = useState('');

    // New state for zones and circles
    const [zones, setZones] = useState([]);
    const [circles, setCircles] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedCircle, setSelectedCircle] = useState('');

    // State for photo upload
    const [imgLogoInput, setImgLogoInput] = useState('');
    const [imgLogoData, setImgLogoData] = useState(null);
    const [photoTouched, setPhotoTouched] = useState(false);

    // State for dropdown visibility
    const [showSubDivisionDropdown, setShowSubDivisionDropdown] = useState(false);
    const [showSectionDropdown, setShowSectionDropdown] = useState(false);
    const [selectedSubDivisions, setSelectedSubDivisions] = useState([]);
    const [selectedSections, setSelectedSections] = useState([]);

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for date picker
    const [dateOfBirth, setDateOfBirth] = useState(null);

    const flagIdFunction = async (flagId, setState, requestUserName, additionalParams = {}) => {
        try {
            // Create base params object
            const baseParams = { flagId, requestUserName };

            // Add specific parameters based on flagId
            let params = { ...baseParams };

            switch (flagId) {
                case 1: // Division - needs circle_code
                    if (additionalParams.circle_code) {
                        params.circle_code = additionalParams.circle_code;
                    }
                    break;
                case 2: // SubDivision - needs div_code
                    if (additionalParams.div_code) {
                        params.div_code = additionalParams.div_code;
                    }
                    break;
                case 3: // Section - needs sd_code
                    if (additionalParams.sd_code) {
                        params.sd_code = additionalParams.sd_code;
                    }
                    break;
                case 7: // Circle - needs zone_code
                    if (additionalParams.zone_code) {
                        params.zone_code = additionalParams.zone_code;
                    }
                    break;
                // For flagId 4, 5, 6, 8 - only need flagId and requestUserName
                default:
                    // No additional parameters needed
                    break;
            }

            const response = await getAllUserDropDownss(params);
            const options = response?.data || [];
            console.log(`Fetched data for flag ${flagId}:`, options);
            setState(options);
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
        }
    };

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.Email; // Changed from LoginName to Email
        setUserName(usernm);

        // Fetch initial dropdowns - only flagId and requestUserName needed
        flagIdFunction(4, setGenders, usernm);
        flagIdFunction(5, setMaritalStatus, usernm);
        flagIdFunction(6, setLroles, usernm);
        flagIdFunction(8, setZones, usernm); // Fetch zones

        document.title = `User Creation | DMS`;
    }, []);

    // Update photo when gender changes
    useEffect(() => {
        if (selectedGender) {
            const selectedGenderObj = genders.find(g => g.genderId.toString() === selectedGender.toString());

            if (selectedGenderObj) {
                if (selectedGenderObj.genderName.toLowerCase() === 'male') {
                    setSrc(Male);
                } else if (selectedGenderObj.genderName.toLowerCase() === 'female') {
                    setSrc(Female);
                } else {
                    setSrc(None);
                }
            }
        } else {
            setSrc(None);
        }
    }, [selectedGender, genders]);

    // Calculate age from date
    const calculateAge = (birthDate) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Form validation for Contact Information
    const contactInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            maritalStatus: '',
            contactNo: '',
            dateOfBirth: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string()
                .required("First Name is required")
                .matches(/^[A-Za-z][A-Za-z\s]*$/, "First Name should contain only alphabets and spaces between words")
                .max(50, "First Name should not exceed 50 characters")
                .test('no-leading-spaces', 'First Name should not start with space',
                    (value) => !value || !value.startsWith(' ')),
            middleName: Yup.string()
                .matches(/^[A-Za-z\s]*$/, "Middle Name should contain only alphabets and spaces")
                .max(50, "Middle Name should not exceed 50 characters")
                .test('no-leading-spaces-middle', 'Middle Name should not start with space',
                    (value) => !value || !value.startsWith(' ')),
            lastName: Yup.string()
                .required("Last Name is required")
                .matches(/^[A-Za-z][A-Za-z\s]*$/, "Last Name should contain only alphabets and spaces between words")
                .max(50, "Last Name should not exceed 50 characters")
                .test('no-leading-spaces-last', 'Last Name should not start with space',
                    (value) => !value || !value.startsWith(' ')),
            gender: Yup.string().required("Gender is required"),
            contactNo: Yup.string()
                .required("Contact Number is required")
                .matches(/^[6-9][0-9]{9}$/, "Contact Number must start with 6, 7, 8, or 9 and be exactly 10 digits")
                .test('not-all-zeros', 'Contact Number cannot be all zeros',
                    (value) => value !== '0000000000'),
            maritalStatus: Yup.string().required("Marital Status is required"),
            dateOfBirth: Yup.string()
                .required("Date of Birth is required")
                .test('age', 'Must be at least 18 years old', function (value) {
                    if (!value) return false;
                    const birthDate = new Date(value);
                    const age = calculateAge(birthDate);
                    return age >= 18;
                }),
        }),
        onSubmit: (values) => {
            console.log("Contact Info:", values);
            toggleTab(activeTab + 1);
        }
    });

    // Handle date of birth change
    const handleDateOfBirthChange = (date) => {
        setDateOfBirth(date);
        if (date) {
            // Format date to YYYY-MM-DD for backend
            const formattedDate = date.toISOString().split('T')[0];
            contactInfoValidation.setFieldValue('dateOfBirth', formattedDate);
        } else {
            contactInfoValidation.setFieldValue('dateOfBirth', '');
        }
    };

    // Input handlers for name fields
    const handleFirstNameChange = (e) => {
        let value = e.target.value;

        // Prevent leading spaces
        if (value.startsWith(' ')) {
            value = value.trimStart();
        }

        // Only allow alphabets and spaces, and limit to 50 characters
        value = value.replace(/[^A-Za-z\s]/g, '').slice(0, 50);
        contactInfoValidation.setFieldValue('firstName', value);
    };

    const handleMiddleNameChange = (e) => {
        let value = e.target.value;

        // Prevent leading spaces
        if (value.startsWith(' ')) {
            value = value.trimStart();
        }

        // Only allow alphabets and spaces, and limit to 50 characters
        value = value.replace(/[^A-Za-z\s]/g, '').slice(0, 50);
        contactInfoValidation.setFieldValue('middleName', value);
    };

    const handleLastNameChange = (e) => {
        let value = e.target.value;

        // Prevent leading spaces
        if (value.startsWith(' ')) {
            value = value.trimStart();
        }

        // Only allow alphabets and spaces, and limit to 50 characters
        value = value.replace(/[^A-Za-z\s]/g, '').slice(0, 50);
        contactInfoValidation.setFieldValue('lastName', value);
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        contactInfoValidation.setFieldValue('contactNo', value);
    };

    // Password validation function
    const validatePassword = (password) => {
        if (!password) return "Password is required";

        if (password.length < 6) return "Password must be at least 6 characters";
        if (password.length > 20) return "Password cannot exceed 20 characters";

        // Check for at least one letter
        if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";

        // Check for at least one number
        if (!/[0-9]/.test(password)) return "Password must contain at least one number";

        // Check for at least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "Password must contain at least one special character";

        // Check for spaces
        if (/\s/.test(password)) return "Password should not contain spaces";

        return null;
    };

    const handlePasswordChange = (e) => {
        let value = e.target.value;

        // Remove spaces from password
        value = value.replace(/\s/g, '');

        // Limit to 20 characters
        value = value.slice(0, 20);
        loginInfoValidation.setFieldValue('password', value);
    };

    const handleConfirmPasswordChange = (e) => {
        let value = e.target.value;

        // Remove spaces from confirm password
        value = value.replace(/\s/g, '');

        // Limit to 20 characters
        value = value.slice(0, 20);
        loginInfoValidation.setFieldValue('confirmPassword', value);
    };

    // Optional: Prevent typing beyond limit
    const handleKeyPress = (e, currentValue) => {
        if (currentValue.length >= 20) {
            e.preventDefault();
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Custom validation function for office information - UPDATED: Only zone and role are mandatory
    const validateOfficeInfo = (values) => {
        const errors = {};

        if (!values.zone) {
            errors.zone = "Zone is required";
        }

        // Circle is now optional - no validation required
        // DivisionName is optional - no validation required
        // SubDivision and SectionOffice are also optional

        if (!values.RoleName) {
            errors.RoleName = "Role Name is required";
        }

        return errors;
    };

    // Form validation for Office Information
    const officeInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            zone: '',
            circle: '',
            divisionName: '',
            sub_division: [],
            RoleName: '',
            section_office: [],
        },
        validate: validateOfficeInfo, // Use custom validation
        onSubmit: (values) => {
            console.log("Office Info:", values);
            toggleTab(activeTab + 1);
        }
    });

    // Handle zone change
    const handleZoneChange = async (e) => {
        const selectedZoneCode = e.target.value; // This is zone_code
        setSelectedZone(selectedZoneCode);
        officeInfoValidation.setFieldValue('zone', selectedZoneCode);

        // Reset all dependent fields when zone changes
        officeInfoValidation.setFieldValue('circle', '');
        officeInfoValidation.setFieldValue('divisionName', '');
        officeInfoValidation.setFieldValue('sub_division', []);
        officeInfoValidation.setFieldValue('section_office', []);
        setSelectedCircle('');
        setSelectedSubDivisions([]);
        setSelectedSections([]);
        setCircles([]);
        setDivisionName([]);
        setsubDivision([]);
        setsection([]);

        // Fetch circles for the selected zone using zone_code
        if (selectedZoneCode) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.Email; // Changed to Email
            await flagIdFunction(7, setCircles, usernm, { zone_code: selectedZoneCode });
        }
    };

    const handleCircleChange = async (e) => {
        const selectedCircleCode = e.target.value;
        setSelectedCircle(selectedCircleCode);
        officeInfoValidation.setFieldValue('circle', selectedCircleCode);

        // Reset division and related fields when circle changes
        officeInfoValidation.setFieldValue('divisionName', '');
        officeInfoValidation.setFieldValue('sub_division', []);
        officeInfoValidation.setFieldValue('section_office', []);
        setSelectedSubDivisions([]);
        setSelectedSections([]);
        setDivisionName([]);
        setsubDivision([]);
        setsection([]);

        // Fetch divisions for the selected circle
        if (selectedCircleCode && selectedZone) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.Email; // Changed to Email
            await flagIdFunction(1, setDivisionName, usernm, { circle_code: selectedCircleCode });
        }
    };

    // Form validation for Login Information
    const loginInfoValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .required("Email is required")
                .email("Please enter a valid email address")
                .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"),
            password: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters")
                .max(20, "Password cannot exceed 20 characters")
                .test('password-strength', 'Password must contain at least one letter, one number, and one special character without spaces',
                    function (value) {
                        if (!value) return true;

                        // Check for at least one letter
                        const hasLetter = /[a-zA-Z]/.test(value);
                        // Check for at least one number
                        const hasNumber = /[0-9]/.test(value);
                        // Check for at least one special character
                        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
                        // Check for no spaces
                        const hasNoSpaces = !/\s/.test(value);

                        return hasLetter && hasNumber && hasSpecialChar && hasNoSpaces;
                    }),
            confirmPassword: Yup.string()
                .required("Confirm Password is required")
                .max(20, "Confirm Password cannot exceed 20 characters")
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
        }),
        onSubmit: (values) => {
            console.log("Login Info:", values);
            toggleTab(activeTab + 1);
        }
    });

    const handleDivisionChange = async (e) => {
        const selectedDivCode = e.target.value;

        officeInfoValidation.setFieldValue('divisionName', selectedDivCode);

        // Reset sub_division & section_office values
        officeInfoValidation.setFieldValue('sub_division', []);
        officeInfoValidation.setFieldValue('section_office', []);
        setSelectedSubDivisions([]);
        setSelectedSections([]);

        // Reset touched states
        officeInfoValidation.setFieldTouched('sub_division', false);
        officeInfoValidation.setFieldTouched('section_office', false);

        // Clear validation errors
        officeInfoValidation.setErrors((prevErrors) => ({
            ...prevErrors,
            sub_division: '',
            section_office: '',
        }));

        // Reset dropdowns
        setsubDivision([]);
        setsection([]);

        if (selectedDivCode && selectedCircle && selectedZone) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.Email; // Changed to Email
            setUserName(usernm);

            // Fetch sub_division options with div_code
            await flagIdFunction(2, setsubDivision, usernm, { div_code: selectedDivCode });

            // Clear validation error again once options are loaded
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                sub_division: '',
            }));
        }
    };

    const handleSubDivisionChange = async (sd_code, isChecked) => {
        let updatedSelection;

        if (isChecked) {
            updatedSelection = [...selectedSubDivisions, sd_code];
        } else {
            updatedSelection = selectedSubDivisions.filter(id => id !== sd_code);
        }

        setSelectedSubDivisions(updatedSelection);

        // Update formik value as array of CODES
        officeInfoValidation.setFieldValue("sub_division", updatedSelection);
        // Mark the field as touched
        officeInfoValidation.setFieldTouched("sub_division", true);

        // Reset sections when subdivisions change
        setsection([]);
        setSelectedSections([]);
        officeInfoValidation.setFieldValue('section_office', []);
        officeInfoValidation.setFieldTouched('section_office', false);

        // Fetch sections only if exactly one subdivision is selected and circle/zone are available
        if (updatedSelection.length === 1 && selectedCircle && selectedZone) {
            await flagIdFunction(3, setsection, username, { sd_code: updatedSelection[0] });
        } else if (updatedSelection.length === 0) {
            // Clear validation error when no selection
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                sub_division: '',
            }));
        }
    };

    const handleSectionChange = (so_code, isChecked) => {
        let updatedSelection;

        if (isChecked) {
            updatedSelection = [...selectedSections, so_code];
        } else {
            updatedSelection = selectedSections.filter(id => id !== so_code);
        }

        setSelectedSections(updatedSelection);

        // Update formik value as array of CODES
        officeInfoValidation.setFieldValue("section_office", updatedSelection);
        // Mark the field as touched
        officeInfoValidation.setFieldTouched("section_office", true);

        if (updatedSelection.length === 0) {
            // Clear validation error when no selection
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                section_office: '',
            }));
        }
    };

    const toggleSubDivisionDropdown = () => {
        setShowSubDivisionDropdown(!showSubDivisionDropdown);
        setShowSectionDropdown(false);
        // Mark as touched when dropdown is opened
        officeInfoValidation.setFieldTouched('sub_division', true);
    };

    const toggleSectionDropdown = () => {
        setShowSectionDropdown(!showSectionDropdown);
        setShowSubDivisionDropdown(false);
        // Mark as touched when dropdown is opened
        officeInfoValidation.setFieldTouched('section_office', true);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setShowSubDivisionDropdown(false);
                setShowSectionDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Clear subdivision error when valid selection is made
        if (selectedSubDivisions.length > 0 && officeInfoValidation.errors.sub_division) {
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                sub_division: '',
            }));
        }

        // Clear section error when valid selection is made (and only one subdivision is selected)
        if (selectedSubDivisions.length === 1 && selectedSections.length > 0 && officeInfoValidation.errors.section_office) {
            officeInfoValidation.setErrors((prevErrors) => ({
                ...prevErrors,
                section_office: '',
            }));
        }
    }, [selectedSubDivisions, selectedSections, officeInfoValidation]);

    function formatFileSize(bytes, decimalPoint) {
        if (bytes == 0) return '0 Bytes';
        var k = 1000,
            dm = decimalPoint || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, 1)).toFixed(dm));
    }

    const inputFileChanged = (e) => {
        setPhotoTouched(true);
        if (window.FileReader) {
            let file = e.target.files[0]
            const fileExtension = file.name.split(".").at(-1);
            const allowedFileTypes = ["jpg", "png", "jpeg"];
            if (!allowedFileTypes.includes(fileExtension)) {
                setResponse("File does not support. You must use .png, jpeg or .jpg ");
                setErrorModal(true);
                return false;
            }
            let fileSize = formatFileSize(file.size, 2);
            if (fileSize <= 200) {
                setErrorModal(false);
                let reader = new FileReader()
                reader.onload = (r) => {
                    setSrc(r.target.result)
                }
                reader.readAsDataURL(file);
                setImgLogoData(file);
            } else {
                setResponse('Sorry, please upload image will be less than 200kB');
                setErrorModal(true);
            }
        } else {
            setResponse('Sorry, your browser doesn\'t support for preview');
            setErrorModal(true);
        }
    }

    // Toggle between tabs
    function toggleTab(tab) {
        if (activeTab !== tab) {
            var modifiedSteps = [...passedSteps, tab];
            if (tab >= 1 && tab <= 3) {
                var process = tab * 33.33;
                setProgressBar(process);
                setActiveTab(tab);
                setPassedSteps(modifiedSteps);
            }
        }
    }

    // Handle gender change
    const handleGenderChange = (e) => {
        const genderId = e.target.value;
        setSelectedGender(genderId);
        contactInfoValidation.handleChange(e);
    }

    const handleFinalSubmit = async () => {
        setPhotoTouched(true);

        // Manually mark all fields as touched to trigger validation
        Object.keys(contactInfoValidation.values).forEach(key => {
            contactInfoValidation.setFieldTouched(key, true);
        });
        Object.keys(officeInfoValidation.values).forEach(key => {
            officeInfoValidation.setFieldTouched(key, true);
        });
        Object.keys(loginInfoValidation.values).forEach(key => {
            loginInfoValidation.setFieldTouched(key, true);
        });

        // Validate all forms
        const contactErrors = await contactInfoValidation.validateForm();
        const officeErrors = await officeInfoValidation.validateForm();
        const loginErrors = await loginInfoValidation.validateForm();

        if (Object.keys(contactErrors).length > 0 ||
            Object.keys(officeErrors).length > 0 ||
            Object.keys(loginErrors).length > 0) {
            setResponse("Please correct all validation errors before submitting.");
            setErrorModal(true);
            return;
        }

        // REMOVED: Photo validation - photo is now optional

        // Create zoneAccess array
        const zoneAccess = [];
        const zoneCode = officeInfoValidation.values.zone;
        const circleCode = officeInfoValidation.values.circle;
        const divCode = officeInfoValidation.values.divisionName;
        const subDivisions = officeInfoValidation.values.sub_division;
        const sections = officeInfoValidation.values.section_office;

        // If subdivisions are selected, create entries for each subdivision
        if (subDivisions.length > 0) {
            // If only one subdivision is selected and sections are available, create entries for each section
            if (subDivisions.length === 1 && sections.length > 0) {
                sections.forEach((sectionCode, index) => {
                    zoneAccess.push({
                        div_code: divCode,
                        sd_code: subDivisions[0],
                        so_code: sectionCode,
                        circle: circleCode,
                        zone: zoneCode
                    });
                });
            } else {
                // If multiple subdivisions or no sections, create entries for each subdivision
                subDivisions.forEach((subDivCode, index) => {
                    zoneAccess.push({
                        div_code: divCode,
                        sd_code: subDivCode,
                        so_code: sections[index] || "", // Use corresponding section if available
                        circle: circleCode,
                        zone: zoneCode
                    });
                });
            }
        } else {
            // If no subdivisions selected, create entry with only circle and zone (division is optional now)
            zoneAccess.push({
                div_code: divCode || "", // Empty if no division selected
                sd_code: "", // Empty for subdivision
                so_code: "", // Empty for section
                circle: circleCode,
                zone: zoneCode
            });
        }

        // Create the main data object
        const userData = {
            firstName: contactInfoValidation.values.firstName,
            middleName: contactInfoValidation.values.middleName || '',
            lastName: contactInfoValidation.values.lastName,
            projectName: "DMS",
            dateOfBirth: contactInfoValidation.values.dateOfBirth,
            phoneNumber: contactInfoValidation.values.contactNo,
            maritalStatusId: contactInfoValidation.values.maritalStatus ? parseInt(contactInfoValidation.values.maritalStatus) : null,
            genderId: parseInt(contactInfoValidation.values.gender),
            email: loginInfoValidation.values.email,
            password: loginInfoValidation.values.password,
            isForcePasswordChange: 1,
            roleId: parseInt(officeInfoValidation.values.RoleName),
            loginName: username,
            photo: null, // Always send null for photo
            isDisabled: 0,
            requestUserName: username // This will now be the email since we changed it above
        };

        // Create FormData
        const formData = new FormData();

        // Append all user data fields
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });

        // Append zoneAccess fields with array indices - UPDATED FIELD NAMES
        zoneAccess.forEach((access, index) => {
            formData.append(`zoneAccess[${index}][div_code]`, access.div_code);
            formData.append(`zoneAccess[${index}][sd_code]`, access.sd_code);
            formData.append(`zoneAccess[${index}][so_code]`, access.so_code);
            formData.append(`zoneAccess[${index}][circle_code]`, access.circle);
            formData.append(`zoneAccess[${index}][zone_code]`, access.zone);
        });

        // Append the photo file only if it exists
        if (imgLogoData) {
            formData.append('photo', imgLogoData);
        }

        // Log the form data for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }

        try {
            const response = await AllUserCreationSubmit(formData);
            const result = response.data[0];

            if (result.status !== 'success') {
                setResponse(result.message || "An error occurred.");
                setSuccessModal(false);
                setErrorModal(true);
            } else {
                setResponse(result.message || "User created successfully.");
                setSuccessModal(true);
                setErrorModal(false);

                // Reset all forms
                contactInfoValidation.resetForm();
                officeInfoValidation.resetForm();
                loginInfoValidation.resetForm();

                // Reset all states
                setImgLogoInput('');
                setImgLogoData(null);
                setSrc(None);
                setSelectedGender('');
                setSelectedSubDivisions([]);
                setSelectedSections([]);
                setSelectedZone('');
                setSelectedCircle('');
                setShowSubDivisionDropdown(false);
                setShowSectionDropdown(false);
                setActiveTab(1);
                setProgressBar(33);
                setPassedSteps([1]);
                setPhotoTouched(false);
                setDateOfBirth(null); // Reset date picker

                // Reset dropdown data
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const usernm = obj.user.Email; // Changed to Email
                setsubDivision([]);
                setsection([]);
                setCircles([]);
                setDivisionName([]);
            }
        } catch (error) {
            console.error("Final submit error:", error);
            setResponse(error.response?.data?.message || "Server error occurred. Please try again.");
            setSuccessModal(false);
            setErrorModal(true);
        }
    };

    // Custom input component for DatePicker to integrate with Bootstrap styling
    const CustomDateInput = React.forwardRef(({ value, onClick, onChange }, ref) => (
        <Input
            type="text"
            className="form-control"
            onClick={onClick}
            ref={ref}
            value={value}
            onChange={onChange}
            readOnly
            placeholder="Select Date of Birth"
            style={{ cursor: 'pointer' }}
        />
    ));

    return (
        <React.Fragment>
            <ToastContainer closeButton={false} />
            {successModal && (
                <SuccessModal
                    show={true}
                    onCloseClick={() => setSuccessModal(false)}
                    successMsg={response}
                />
            )}

            {errorModal && (
                <ErrorModal
                    show={true}
                    onCloseClick={() => setErrorModal(false)}
                    errorMsg={response}
                />
            )}
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb pageTitle="User Creation" />

                    <Row>
                        <Col xl="12">
                            <div className="live-preview">
                                <Progress className="progress progress-xl mb-3" color="primary" value={progressBar}>
                                    {Math.round(progressBar)}%
                                </Progress>
                            </div>
                            <Card>
                                <CardBody className="checkout-tab">
                                    <Form action="#">
                                        <div className="nav-pills nav-justified mt-n3 mx-n3 mb-3">
                                            <Nav
                                                className="nav nav-pills arrow-navtabs nav-primary bg-light mb-3"
                                                role="tablist"
                                            >
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 1,
                                                            done: (activeTab <= 3 && activeTab >= 0)
                                                        }, "p-3 fs-15")}
                                                        onClick={(e) => e.preventDefault()}

                                                    >
                                                        <i className="ri-user-line fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
                                                        Contact Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 2,
                                                            done: activeTab <= 3 && activeTab > 1
                                                        }, "p-3 fs-15")}
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <i className="ri-home-office-fill fs-16 p-2 bg-primary-subtle rounded-circle align-middle me-2"></i>
                                                        Office Information
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem role="presentation">
                                                    <NavLink
                                                        className={classnames({
                                                            active: activeTab === 3,
                                                            done: activeTab <= 3 && activeTab > 2
                                                        }, "p-3 fs-15")}
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <i className="ri-lock-line"></i>
                                                        Login Information
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                        </div>

                                        <TabContent activeTab={activeTab}>
                                            {/* Contact Information Tab */}
                                            <TabPane tabId={1}>
                                                <div>
                                                    <h5 className="mb-1">Contact Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>First Name<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="firstName"
                                                                type="text"
                                                                placeholder="First Name"
                                                                onChange={handleFirstNameChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.firstName}
                                                                invalid={
                                                                    contactInfoValidation.touched.firstName &&
                                                                    contactInfoValidation.errors.firstName
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.firstName && contactInfoValidation.errors.firstName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.firstName}
                                                                </div>
                                                            ) : null}
                                                            {/* <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                {contactInfoValidation.values.firstName.length}/50 characters
                                                            </div> */}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Middle Name</Label>
                                                            <Input
                                                                name="middleName"
                                                                type="text"
                                                                placeholder="Middle Name"
                                                                onChange={handleMiddleNameChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.middleName}
                                                                invalid={
                                                                    contactInfoValidation.touched.middleName &&
                                                                    contactInfoValidation.errors.middleName
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.middleName && contactInfoValidation.errors.middleName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.middleName}
                                                                </div>
                                                            ) : null}
                                                            {/* <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                {contactInfoValidation.values.middleName.length}/50 characters
                                                            </div> */}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Last Name<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="lastName"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                onChange={handleLastNameChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.lastName}
                                                                invalid={
                                                                    contactInfoValidation.touched.lastName &&
                                                                    contactInfoValidation.errors.lastName
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.lastName && contactInfoValidation.errors.lastName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.lastName}
                                                                </div>
                                                            ) : null}
                                                            {/* <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                {contactInfoValidation.values.lastName.length}/50 characters
                                                            </div> */}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Gender<span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="gender"
                                                                onChange={handleGenderChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.gender}
                                                                invalid={
                                                                    contactInfoValidation.touched.gender &&
                                                                    contactInfoValidation.errors.gender
                                                                }
                                                            >
                                                                <option value="">Select Gender</option>
                                                                {genders.map((gender) => (
                                                                    <option key={gender.genderId} value={gender.genderId}>
                                                                        {gender.genderName}
                                                                    </option>
                                                                ))}
                                                            </Input>

                                                            {contactInfoValidation.touched.gender && contactInfoValidation.errors.gender ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.gender}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Marital Status<span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="maritalStatus"
                                                                onChange={contactInfoValidation.handleChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.maritalStatus}
                                                                invalid={
                                                                    contactInfoValidation.touched.maritalStatus &&
                                                                    contactInfoValidation.errors.maritalStatus
                                                                }
                                                            >
                                                                <option value="">Select Marital Status</option>
                                                                {maritalStatus.map((status) => (
                                                                    <option key={status.maritalStatusName} value={status.maritalStatusName}>
                                                                        {status.maritalStatusCode}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {contactInfoValidation.touched.maritalStatus && contactInfoValidation.errors.maritalStatus ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.maritalStatus}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>

                                                    </Col>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Contact No<span className="text-danger">*</span></Label>
                                                            <Input
                                                                name="contactNo"
                                                                type="text"
                                                                placeholder="Contact No"
                                                                onChange={handlePhoneNumberChange}
                                                                onBlur={contactInfoValidation.handleBlur}
                                                                value={contactInfoValidation.values.contactNo}
                                                                maxLength={10}
                                                                invalid={
                                                                    contactInfoValidation.touched.contactNo &&
                                                                    contactInfoValidation.errors.contactNo
                                                                }
                                                            />
                                                            {contactInfoValidation.touched.contactNo && contactInfoValidation.errors.contactNo ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {contactInfoValidation.errors.contactNo}
                                                                </div>
                                                            ) : null}
                                                            {/* <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                Must start with 6, 7, 8, or 9
                                                            </div> */}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3 date-of-birth-field">
                                                            <Label className="form-label">
                                                                Date of Birth <span className="text-danger">*</span>
                                                            </Label>
                                                            <div className="date-picker-container">
                                                                <DatePicker
                                                                    selected={dateOfBirth}
                                                                    onChange={handleDateOfBirthChange}
                                                                    dateFormat="dd-MM-yyyy"
                                                                    showYearDropdown
                                                                    showMonthDropdown
                                                                    dropdownMode="select"
                                                                    yearDropdownItemNumber={50}
                                                                    scrollableYearDropdown
                                                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                                                                    minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
                                                                    customInput={<CustomDateInput />}
                                                                    className="form-control"
                                                                    placeholderText="Select Date of Birth"
                                                                    isClearable
                                                                    onBlur={contactInfoValidation.handleBlur}
                                                                />
                                                            </div>
                                                            {contactInfoValidation.touched.dateOfBirth && contactInfoValidation.errors.dateOfBirth && (
                                                                <div className="invalid-feedback d-block">
                                                                    {contactInfoValidation.errors.dateOfBirth}
                                                                </div>
                                                            )}
                                                            <div className="form-text">
                                                                Must be at least 18 years old
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            contactInfoValidation.handleSubmit();
                                                        }}
                                                    >
                                                        <i className="ri-home-office-line label-icon align-middle fs-16 ms-2"></i>
                                                        Proceed to Office Information
                                                    </button>
                                                </div>
                                            </TabPane>

                                            {/* Office Information Tab */}
                                            <TabPane tabId={2}>
                                                <div>
                                                    <h5 className="mb-1">Office Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Zone <span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="zone"
                                                                className="form-select"
                                                                onChange={handleZoneChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.zone}
                                                                invalid={officeInfoValidation.touched.zone && !!officeInfoValidation.errors.zone}
                                                            >
                                                                <option value="">Select Zone</option>
                                                                {zones.map((zone) => (
                                                                    <option key={zone.zone_code} value={zone.zone_code}>
                                                                        {zone.zone}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.zone && officeInfoValidation.errors.zone && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.zone}
                                                                </div>
                                                            )}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Circle</Label>
                                                            <Input
                                                                type="select"
                                                                name="circle"
                                                                className="form-select"
                                                                onChange={handleCircleChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.circle}
                                                                disabled={!selectedZone}
                                                            >
                                                                <option value="">Select Circle (Optional)</option>
                                                                {circles.map((circle) => (
                                                                    <option key={circle.circle_code} value={circle.circle_code}>
                                                                        {circle.circle}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Division Name</Label>
                                                            <Input
                                                                type="select"
                                                                name="divisionName"
                                                                className="form-select"
                                                                onChange={handleDivisionChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.divisionName}
                                                                disabled={!selectedCircle}
                                                            >
                                                                <option value="">Select Division (Optional)</option>
                                                                {divisionName.map((division) => (
                                                                    <option key={division.div_code} value={division.div_code}>
                                                                        {division.division}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Sub Division</Label>
                                                            <div className="dropdown">
                                                                <button
                                                                    className="form-select text-start"
                                                                    type="button"
                                                                    onClick={toggleSubDivisionDropdown}
                                                                    style={{
                                                                        position: 'relative',
                                                                        backgroundColor: '#fff',
                                                                        borderColor: '#ced4da'
                                                                    }}
                                                                    disabled={!selectedCircle}
                                                                >
                                                                    {selectedSubDivisions.length > 0
                                                                        ? `${selectedSubDivisions.length} selected`
                                                                        : 'Select Sub Division (Optional)'}
                                                                    <span className="position-absolute top-50 end-0 translate-middle-y me-2">
                                                                    </span>
                                                                </button>

                                                                {showSubDivisionDropdown && (
                                                                    <div
                                                                        className="dropdown-menu show w-100 p-2"
                                                                        style={{
                                                                            maxHeight: '200px',
                                                                            overflowY: 'auto',
                                                                            zIndex: 1000
                                                                        }}
                                                                    >
                                                                        {subDivision.map((subdivision) => (
                                                                            <div key={subdivision.sd_code} className="form-check">
                                                                                <Input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id={`subdiv-${subdivision.sd_code}`}
                                                                                    checked={selectedSubDivisions.includes(subdivision.sd_code)}
                                                                                    onChange={(e) => {
                                                                                        handleSubDivisionChange(subdivision.sd_code, e.target.checked);
                                                                                        officeInfoValidation.setFieldTouched('sub_division', true);
                                                                                    }}
                                                                                />
                                                                                <Label className="form-check-label w-100" htmlFor={`subdiv-${subdivision.sd_code}`}>
                                                                                    {subdivision.sub_division}
                                                                                </Label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>

                                                    {selectedSubDivisions.length === 1 && (
                                                        <Col md={4}>
                                                            <FormGroup className="mb-3">
                                                                <Label>Section Office</Label>
                                                                <div className="dropdown">
                                                                    <button
                                                                        className="form-select text-start"
                                                                        type="button"
                                                                        onClick={toggleSectionDropdown}
                                                                        style={{
                                                                            position: 'relative',
                                                                            backgroundColor: '#fff',
                                                                            borderColor: '#ced4da'
                                                                        }}
                                                                    >
                                                                        {selectedSections.length > 0
                                                                            ? `${selectedSections.length} selected`
                                                                            : 'Select Section (Optional)'}
                                                                        <span className="position-absolute top-50 end-0 translate-middle-y me-2">
                                                                        </span>
                                                                    </button>

                                                                    {showSectionDropdown && (
                                                                        <div
                                                                            className="dropdown-menu show w-100 p-2"
                                                                            style={{
                                                                                maxHeight: '200px',
                                                                                overflowY: 'auto',
                                                                                zIndex: 1000
                                                                            }}
                                                                        >
                                                                            {section.map((sectionItem) => (
                                                                                <div key={sectionItem.so_code} className="form-check">
                                                                                    <Input
                                                                                        className="form-check-input"
                                                                                        type="checkbox"
                                                                                        id={`section-${sectionItem.so_code}`}
                                                                                        checked={selectedSections.includes(sectionItem.so_code)}
                                                                                        onChange={(e) => {
                                                                                            handleSectionChange(sectionItem.so_code, e.target.checked);
                                                                                            officeInfoValidation.setFieldTouched('section_office', true);
                                                                                        }}
                                                                                    />
                                                                                    <Label className="form-check-label w-100" htmlFor={`section-${sectionItem.so_code}`}>
                                                                                        {sectionItem.section_office}
                                                                                    </Label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    )}

                                                    <Col md={4}>
                                                        <FormGroup className="mb-3">
                                                            <Label>Role Name<span className="text-danger">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="RoleName"
                                                                className="form-select"
                                                                onChange={officeInfoValidation.handleChange}
                                                                onBlur={officeInfoValidation.handleBlur}
                                                                value={officeInfoValidation.values.RoleName}
                                                                invalid={
                                                                    officeInfoValidation.touched.RoleName &&
                                                                    officeInfoValidation.errors.RoleName
                                                                }
                                                            >
                                                                <option value="">Select Role</option>
                                                                {roles.map((role) => (
                                                                    <option key={role.Role_Id} value={role.Role_Id}>
                                                                        {role.RoleName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                            {officeInfoValidation.touched.RoleName && officeInfoValidation.errors.RoleName ? (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {officeInfoValidation.errors.RoleName}
                                                                </div>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => toggleTab(1)}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Back to Contact Information
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label right ms-auto nexttab"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            officeInfoValidation.handleSubmit();
                                                        }}
                                                    >
                                                        <i className="ri-lock-line label-icon align-middle fs-16 ms-2"></i>
                                                        Proceed to Login Information
                                                    </button>
                                                </div>
                                            </TabPane>

                                            {/* Login Information Tab */}
                                            <TabPane tabId={3}>
                                                <div>
                                                    <h5 className="mb-1">Login Information</h5>
                                                    <p className="text-muted mb-4">
                                                        Please fill all mandatory information below <span className="text-danger">*</span>
                                                    </p>
                                                </div>

                                                <Row>
                                                    <Col md={6}>
                                                        <Row>
                                                            <Col md={10}>
                                                                <FormGroup className="mb-3">
                                                                    <Label>Email <span className="text-danger">*</span></Label>
                                                                    <Input
                                                                        name="email"
                                                                        type="email"
                                                                        placeholder="Email"
                                                                        onChange={loginInfoValidation.handleChange}
                                                                        onBlur={loginInfoValidation.handleBlur}
                                                                        value={loginInfoValidation.values.email}
                                                                        invalid={
                                                                            loginInfoValidation.touched.email &&
                                                                            loginInfoValidation.errors.email
                                                                        }
                                                                    />
                                                                    {loginInfoValidation.touched.email && loginInfoValidation.errors.email ? (
                                                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                            {loginInfoValidation.errors.email}
                                                                        </div>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col md={10}>
                                                                <FormGroup className="mb-3">
                                                                    <Label>Password<span className="text-danger">*</span></Label>
                                                                    <div className="position-relative">
                                                                        <Input
                                                                            name="password"
                                                                            type={showPassword ? "text" : "password"}
                                                                            placeholder="Password"
                                                                            onChange={handlePasswordChange}
                                                                            onKeyPress={(e) => handleKeyPress(e, loginInfoValidation.values.password)}
                                                                            onBlur={loginInfoValidation.handleBlur}
                                                                            value={loginInfoValidation.values.password}
                                                                            maxLength={20}
                                                                            invalid={
                                                                                loginInfoValidation.touched.password &&
                                                                                loginInfoValidation.errors.password
                                                                            }
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                                                            onClick={togglePasswordVisibility}
                                                                            style={{
                                                                                border: 'none',
                                                                                background: 'none',
                                                                                padding: '0.375rem 0.75rem',
                                                                                zIndex: 5
                                                                            }}
                                                                        >
                                                                            <i className={`ri-eye${showPassword ? '-off' : ''}-line`}></i>
                                                                        </button>
                                                                    </div>
                                                                    {loginInfoValidation.touched.password && loginInfoValidation.errors.password ? (
                                                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                            {loginInfoValidation.errors.password}
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                                        Must contain one letter, one number, one special character
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col md={10}>
                                                                <FormGroup className="mb-3">
                                                                    <Label>Confirm Password<span className="text-danger">*</span></Label>
                                                                    <div className="position-relative">
                                                                        <Input
                                                                            name="confirmPassword"
                                                                            type={showConfirmPassword ? "text" : "password"}
                                                                            placeholder="Confirm Password"
                                                                            onChange={handleConfirmPasswordChange}
                                                                            onKeyPress={(e) => handleKeyPress(e, loginInfoValidation.values.confirmPassword)}
                                                                            onBlur={loginInfoValidation.handleBlur}
                                                                            value={loginInfoValidation.values.confirmPassword}
                                                                            maxLength={20}
                                                                            invalid={
                                                                                loginInfoValidation.touched.confirmPassword &&
                                                                                loginInfoValidation.errors.confirmPassword
                                                                            }
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                                                            onClick={toggleConfirmPasswordVisibility}
                                                                            style={{
                                                                                border: 'none',
                                                                                background: 'none',
                                                                                padding: '0.375rem 0.75rem',
                                                                                zIndex: 5
                                                                            }}
                                                                        >
                                                                            <i className={`ri-eye${showConfirmPassword ? '-off' : ''}-line`}></i>
                                                                        </button>
                                                                    </div>
                                                                    {loginInfoValidation.touched.confirmPassword && loginInfoValidation.errors.confirmPassword ? (
                                                                        <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                            {loginInfoValidation.errors.confirmPassword}
                                                                        </div>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <div className="text-center">
                                                            <div className="profile-user position-relative d-inline-block mx-auto mb-4 avatar-xl mt-3">
                                                                <Label className="form-label">
                                                                    Photo (Optional)
                                                                </Label>
                                                                <img
                                                                    src={src}
                                                                    className="avatar-title rounded rounded-circle bg-danger-subtle text-danger fs-22 material-shadow"
                                                                    alt="user-photo"
                                                                />
                                                                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                                    <Input
                                                                        id="user-photo"
                                                                        type="file"
                                                                        className="profile-img-file-input"
                                                                        value={imgLogoInput}
                                                                        accept={Array.isArray('image/*') ? 'image/*'.join(',') : 'image/*'}
                                                                        capture={true}
                                                                        onChange={inputFileChanged}
                                                                    />
                                                                    <Label htmlFor="user-photo" className="profile-photo-edit avatar-xs">
                                                                        <span className="avatar-title rounded-circle bg-light text-body material-shadow">
                                                                            <i className="ri-camera-fill"></i>
                                                                        </span>
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light btn-label previestab"
                                                        onClick={() => toggleTab(2)}
                                                    >
                                                        <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                                                        Back to Office Information
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-label right ms-auto nexttab"
                                                        onClick={handleFinalSubmit}
                                                    >
                                                        <i className="ri-save-line label-icon align-middle fs-16 ms-2"></i>
                                                        Create User
                                                    </button>
                                                </div>
                                            </TabPane>
                                        </TabContent>
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

export default UserCreation;