import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, ModalBody,
    ModalFooter, ModalHeader, Row, Label, FormFeedback, Modal, Input, FormGroup,Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import { getAllLocationCreation, getAllLocationCreationDpdwns, postCreateLocationCreation, putUpdateLocationCreation } from "../../helpers/fakebackend_helper"
import { GET_LOCATION_CREATION } from "../../helpers/url_helper"
import * as Yup from "yup";
import { useFormik } from "formik";
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"

const SORT_ARROW_SIZE = 13; // px

function SortArrows({ direction, active }) {
    return (
        <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: "block" }}>
                <polyline
                    points="3,8 6.5,4 10,8"
                    fill="none"
                    stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: "block", marginTop: -2 }}>
                <polyline
                    points="3,5 6.5,9 10,5"
                    fill="none"
                    stroke={active && direction === 'desc' ? '#1064ea' : '#c1c5ca'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

const tabs = [
    { key: "location", label: "Location Information" },
    { key: "contact", label: "Contact Information" }
];

const Location = () => {
    const [buttonval, setbuttonval] = useState('Add Location');
    const [submitVal, setSubmitVal] = useState('Save');
    const [data, setData] = useState([]);
    const [databk, setDataBk] = useState([...data]);
    const [modal_list, setmodal_list] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [edit_items, setedit_items] = useState(null);
    const [edit_update, setedit_update] = useState(false);
    const [response, setResponse] = useState('');
    const [isTableDisbled, setIsTableDisbled] = useState(true);
    const [formEditAllowed, setFormEditAllowed] = useState(false);
    const [formContactEditAllowed, setFormContactEditAllowed] = useState(false);
    const [pendingLocationTypeId, setPendingLocationTypeId] = useState('');
    const [pendingParentLocationId, setPendingParentLocationId] = useState('');
    const [pendingGeographyTypeId, setPendingGeographyTypeId] = useState('');
    const [pendingGeographyId, setPendingGeographyId] = useState('');
    const [activeTab, setActiveTab] = useState("location");
    const [username, setUserName] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const [geographyTypeName, setGeographyTypeName] = useState([])
    const [geographyName, setGeographyName] = useState([])
    const [parentLocationTypeName, setParentLocationName] = useState([])
    const [locationTypeName, setLocationTypeName] = useState([])

    const [localModalEdit, setLocalModalEdit] = useState({});

    useEffect(() => {
        console.log('parentLocationTypeName changed:', parentLocationTypeName);
        console.log('parentLocationTypeName length:', parentLocationTypeName.length);
    }, [parentLocationTypeName]);

   const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const isEditModeRef = useRef(false);
    const [editMode, setEditMode] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);

    useEffect(() => {
        getOnLoadingData();
    }, []);

    useEffect(() => {
        console.log('Modal useEffect triggered - modal_list:', modal_list, 'edit_update:', edit_update, 'edit_items:', edit_items);

        if (modal_list) {
            setActiveTab("location");
            setFormErrors({});

            if (edit_update && edit_items) {
                console.log('=== EDIT MODE DETECTED ===');
                console.log('Modal opened in edit mode with data:', edit_items);
                console.log('edit_update state:', edit_update);

                // Set the edit data immediately with proper field mapping
                const mappedEditData = {
                    ...edit_items,
                    // Fix field name mapping issues - API returns geographyID but form expects geographyId
                    geographyId: edit_items.geographyID || edit_items.geographyId,
                };

                // Try to resolve locationTypeId if missing
                if (!mappedEditData.locationTypeId && edit_items.locationTypeName && locationTypeName.length > 0) {
                    const locationTypeObj = locationTypeName.find(lt =>
                        lt.locationTypeName === edit_items.locationTypeName
                    );
                    if (locationTypeObj) {
                        mappedEditData.locationTypeId = locationTypeObj.locationTypeId;
                        console.log('Modal useEffect resolved locationTypeId:', locationTypeObj.locationTypeId);
                    }
                }

                console.log('Setting localModalEdit with mapped data:', mappedEditData);
                setLocalModalEdit(mappedEditData);

                // For edit mode, ensure checkboxes start unchecked but are visible
                setFormEditAllowed(false);
                setFormContactEditAllowed(false);
                setPendingLocationTypeId('');
                setPendingParentLocationId('');
                setPendingGeographyTypeId('');
                setPendingGeographyId('');
            } else {
                console.log('=== ADD MODE DETECTED ===');
                console.log('Modal opened in add mode');
                console.log('edit_update state:', edit_update);

                setLocalModalEdit({});
                setFormEditAllowed(false);
                setFormContactEditAllowed(false);
                setPendingLocationTypeId('');
                setPendingParentLocationId('');
                setPendingGeographyTypeId('');
                setPendingGeographyId('');
            }
        }
    }, [modal_list, edit_update, edit_items]);

    async function getOnLoadingData() {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));

        try {
            const response = await getAllLocationCreation(GET_LOCATION_CREATION);
            const allLocationCreations = response;

            setData(allLocationCreations.data);
            setDataBk(allLocationCreations.data);

            const usernm = obj.user.loginName;
            setUserName(usernm);

            setedit_update(false);
            setedit_items(null);
            setEditMode(false);
            setCurrentEditItem(null);

            console.log('getOnLoadingData - received data:', allLocationCreations.data);
            console.log('getOnLoadingData - data length:', allLocationCreations.data?.length);

            // Always load parent locations using the existing location data
            if (allLocationCreations.data && allLocationCreations.data.length > 0) {
                console.log('Loading initial parent locations in getOnLoadingData');
                // Set parent locations directly from the existing location data
                const parentOptions = allLocationCreations.data.map(item => ({
                    locationId: item.locationId,
                    locationName: item.locationName,
                    locationTypeId: item.locationTypeId
                }));
                console.log('Setting parent options from existing data:', parentOptions);
                setParentLocationName(parentOptions);

                // Also try the API call as a fallback
                flagIdFunction(5, setParentLocationName, usernm, null, null);
            } else {
                console.log('No initial data, not loading parent locations');
                setParentLocationName([]);
            }
        } catch (error) {
            // Removed debug info
        }
    }

    const validateForm = (values) => {
        const errors = {};

        console.log('Validating form with values:', values);

        // Location Info validation
        if (!values.locationTypeId || values.locationTypeId === '' || values.locationTypeId === '0') {
            console.log('locationTypeId validation failed:', values.locationTypeId);
            errors.locationTypeId = 'Required';
        }
        if (!values.locationName || values.locationName.trim() === '') {
            console.log('locationName validation failed:', values.locationName);
            errors.locationName = 'Required';
        }
        if (!values.locationShortName || values.locationShortName.trim() === '') {
            console.log('locationShortName validation failed:', values.locationShortName);
            errors.locationShortName = 'Required';
        }
        if (!values.vendorLocationCode || values.vendorLocationCode.trim() === '') {
            console.log('vendorLocationCode validation failed:', values.vendorLocationCode);
            errors.vendorLocationCode = 'Required';
        }
        if (!values.locationAddress || values.locationAddress.trim() === '') {
            console.log('locationAddress validation failed:', values.locationAddress);
            errors.locationAddress = 'Required';
        }

        // Contact Info validation
        if (!values.contactPerson || values.contactPerson.trim() === '') {
            console.log('contactPerson validation failed:', values.contactPerson);
            errors.contactPerson = 'Required';
        }
        if (!values.contactNo || values.contactNo.trim() === '') {
            console.log('contactNo validation failed:', values.contactNo);
            errors.contactNo = 'Required';
        }
        if (!values.emailAddress || values.emailAddress.trim() === '') {
            console.log('emailAddress validation failed:', values.emailAddress);
            errors.emailAddress = 'Required';
        }
        if (!values.geographyTypeId || values.geographyTypeId === '' || values.geographyTypeId === '0') {
            console.log('geographyTypeId validation failed:', values.geographyTypeId);
            errors.geographyTypeId = 'Required';
        }
        if (!values.geographyId || values.geographyId === '' || values.geographyId === '0') {
            console.log('geographyId validation failed:', values.geographyId);
            errors.geographyId = 'Required';
        }

        console.log('Validation errors found:', errors);
        return errors;
    };

    const handleSubmit = async (values) => {
        console.log('=== HANDLE SUBMIT CALLED ===');
        console.log('Submitted values:', values);
        console.log('Edit mode:', edit_update);
        console.log('Form edit flags:', { formEditAllowed, formContactEditAllowed });
        console.log('Pending values:', {
            pendingLocationTypeId,
            pendingParentLocationId,
            pendingGeographyTypeId,
            pendingGeographyId
        });

        const errors = validateForm(values);
        if (Object.keys(errors).length > 0) {
            console.log('Validation failed in handleSubmit:', errors);
            setFormErrors(errors);
            if (errors.locationTypeId || errors.locationName || errors.locationShortName ||
                errors.vendorLocationCode || errors.locationAddress) {
                setActiveTab("location");
            } else {
                setActiveTab("contact");
            }
            return;
        }

        try {
            let newValues = { ...values };

            // Ensure proper field mapping for all modes
            if (values.geographyID && !newValues.geographyId) {
                newValues.geographyId = values.geographyID;
            }

            if (edit_update) {
                console.log('Processing edit update with pending values:', {
                    formEditAllowed,
                    formContactEditAllowed,
                    pendingLocationTypeId,
                    pendingParentLocationId,
                    pendingGeographyTypeId,
                    pendingGeographyId
                });

                if (formEditAllowed) {
                    if (pendingLocationTypeId !== '') newValues.locationTypeId = pendingLocationTypeId;
                    if (pendingParentLocationId !== '') newValues.parentLocationId = pendingParentLocationId;
                }
                if (formContactEditAllowed) {
                    if (pendingGeographyTypeId !== '') newValues.geographyTypeId = pendingGeographyTypeId;
                    if (pendingGeographyId !== '') newValues.geographyId = pendingGeographyId;
                }
            }

            console.log('Final newValues before payload:', newValues);

            const payload = {
                isDisabled: newValues.isDisabled || false,
                requestUserName: username,
                locationTypeId: parseInt(newValues.locationTypeId, 10),
                geographyTypeId: parseInt(newValues.geographyTypeId, 10),
                geographyId: parseInt(newValues.geographyId, 10),
                locationName: newValues.locationName,
                locationShortName: newValues.locationShortName,
                locationAddress: newValues.locationAddress,
                vendorLocationCode: newValues.vendorLocationCode,
                contactPerson: newValues.contactPerson,
                contactNo: newValues.contactNo,
                emailAddress: newValues.emailAddress,
                parentLocationId: newValues.parentLocationId ? parseInt(newValues.parentLocationId, 10) : null, // Fixed this line
            };

            if (edit_update) {
                payload.locationId = parseInt(values.locationId, 10);
            }
            console.log('Final payload being sent:', payload);
            console.log('API call type:', edit_update ? 'UPDATE' : 'CREATE');

            let response;
            if (edit_update) {
                response = await putUpdateLocationCreation(payload);
            } else {
                response = await postCreateLocationCreation(payload);
            }

            console.log('API response received:', response);

            // Handle both old and new API response formats
            if (response) {
                console.log('API response details:', response);

                // New API response format
                if (response.status === "success") {
                    setResponse(response.displayMessage || response.message || "Operation completed successfully");
                    setSuccessModal(true);
                    return;
                }

                // Error response format
                if (response.status === "error") {
                    const errorMessage = response.displayMessage || response.message || "Something went wrong";
                    console.log('API error:', errorMessage);
                    setResponse(errorMessage);
                    setErrorModal(true);
                    return;
                }

                // Old API response format (fallback)
                if (response.data && response.data.length > 0) {
                    const { responseStatusCode, responseStatusCodeMessage, responseStatusCodeGUIDisplay } = response.data[0];

                    if (responseStatusCode === '000') {
                        setResponse(responseStatusCodeGUIDisplay);
                        setSuccessModal(true);
                        return;
                    } else {
                        const errorMessage = responseStatusCode === '100' || responseStatusCode === '-100'
                            ? responseStatusCodeGUIDisplay
                            : responseStatusCodeMessage || "Something went wrong";

                        console.log('API error:', errorMessage);
                        setResponse(errorMessage);
                        setErrorModal(true);
                        return;
                    }
                }
            }

            // Fallback for unexpected response structure
            console.log('Unexpected API response structure:', response);
            setResponse("Something went wrong, please try again later.");
            setErrorModal(true);
        } catch (error) {
            console.error('Form submission error:', error);
            let errorMsg = "Something went wrong, please try again later.";
            if (error && error.response && error.response.data && error.response.data.message) {
                errorMsg = error.response.data.message;
            } else if (error && error.message) {
                errorMsg = error.message;
            }
            setResponse(errorMsg);
            setErrorModal(true);
        }
    };

    const handleModalInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Input changed:', name, '=', value);
        setLocalModalEdit(prev => {
            const newData = { ...prev, [name]: value };
            console.log('Updated localModalEdit:', newData);
            return newData;
        });
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const flagIdFunction = async (flagId, setState, requestUserName, geographyTypeId, locationTypeId) => {
        try {
            const params = { flagId, requestUserName, geographyTypeId, locationTypeId };

            if (flagId === 5) {
                try {
                    console.log('Loading parent locations with params:', params);
                    const response = await getAllLocationCreationDpdwns(params);
                    console.log('Parent location response:', response);

                    if (response && response.data) {
                        const options = response.data || [];
                        console.log('Raw parent location options:', options);

                        const validOptions = options.filter(opt =>
                            opt && typeof opt === 'object' &&
                            (opt.locationId !== undefined && opt.locationName !== undefined)
                        );
                        console.log('Filtered parent location options:', validOptions);

                        setState(validOptions);
                    } else {
                        console.log('No parent location data received');
                        setState([]);
                    }
                } catch (error) {
                    console.error('Error loading parent locations:', error);
                    setState([]);
                }
            } else {
                try {
                    const response = await getAllLocationCreationDpdwns(params);
                    const options = response?.data || [];
                    setState(options);
                } catch (error) {
                    setState([]);
                }
            }
        } catch (error) {
            setState([]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj.user.loginName;
            setUserName(usernm);

            await flagIdFunction(2, setLocationTypeName, usernm);
            await flagIdFunction(3, setGeographyTypeName, usernm);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;
        if (localModalEdit.geographyTypeId) {
            flagIdFunction(4, setGeographyName, usernm, Number(localModalEdit.geographyTypeId), null)
        } else {
            setGeographyName([]);
        }
    }, [localModalEdit.geographyTypeId]);

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;
        if (pendingGeographyTypeId) {
            flagIdFunction(4, setGeographyName, usernm, pendingGeographyTypeId, null);
        }
    }, [pendingGeographyTypeId]);

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;

        console.log('useEffect locationTypeId triggered:', {
            locationTypeId: localModalEdit.locationTypeId,
            edit_update,
            dataLength: data.length
        });

        if (localModalEdit.locationTypeId) {
            console.log('Loading parent locations with locationTypeId:', localModalEdit.locationTypeId);
            flagIdFunction(5, setParentLocationName, usernm, null, Number(localModalEdit.locationTypeId));
        }
        else if (!edit_update && data.length > 0) {
            // For add mode, load existing locations as parent options only if there are existing locations
            console.log('Loading parent locations for add mode without locationTypeId');
            const parentOptions = data.map(item => ({
                locationId: item.locationId,
                locationName: item.locationName,
                locationTypeId: item.locationTypeId
            }));
            console.log('Setting parent options from data in useEffect:', parentOptions);
            setParentLocationName(parentOptions);

            // Also try the API call as a fallback
            flagIdFunction(5, setParentLocationName, usernm, null, null);
        }
        else {
            console.log('Clearing parent locations');
            setParentLocationName([]);
        }
    }, [localModalEdit.locationTypeId, edit_update, data.length]);

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj?.user?.loginName || '';

        if (pendingLocationTypeId) {
            flagIdFunction(5, setParentLocationName, usernm, null, Number(pendingLocationTypeId));
        }
        else if (edit_update) {
            // In edit mode, maintain existing parent location data
        }
        else {
            setParentLocationName([]);
        }
    }, [pendingLocationTypeId, edit_update]);

    const columns = useMemo(() => [
        {
            header: 'LocationTypeName',
            accessorKey: 'locationTypeName',
            key: 'locationTypeName',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'LocationName',
            accessorKey: 'locationName',
            key: 'locationName',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'LocationShort Name',
            accessorKey: 'locationShortName',
            key: 'locationShortName',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'VendorLocation Code',
            accessorKey: 'vendorLocationCode',
            key: 'vendorLocationCode',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'LocationAddress',
            accessorKey: 'locationAddress',
            key: 'locationAddress',
            sortable: true,
            cell: (cell) => (
                <div className="text-truncate" style={{ maxWidth: '150px' }}>{cell.getValue()}</div>
            )
        },
        {
            header: 'ParentLocationName',
            accessorKey: 'parentLocationName',
            key: 'parentLocationName',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'GeographyName',
            accessorKey: 'geographyName',
            key: 'geographyName',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'ContactPerson',
            accessorKey: 'contactPerson',
            key: 'contactPerson',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'ContactNumber',
            accessorKey: 'contactNo',
            key: 'contactNo',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'EmailAddress',
            accessorKey: 'emailAddress',
            key: 'emailAddress',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'CreatedByUserName',
            accessorKey: 'requestUserName',
            key: 'requestUserName',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'CreatedOn',
            accessorKey: 'rquestDate',
            key: 'rquestDate',
            sortable: true,
            cell: (cell) => (
                <div className="text-nowrap">{cell.getValue()}</div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            key: 'status',
            sortable: false,
            cell: (cell) =>
                cell.getValue()
                    ? (<span className="badge bg-danger-subtle text-danger text-uppercase">INACTIVE</span>)
                    : (<span className="badge bg-success-subtle text-success text-uppercase">ACTIVE</span>)
        },
        {
            header: 'Action',
            accessorKey: 'action',
            key: 'action',
            sortable: false,
            cell: (row) => (
                <Button
                    color="primary"
                    size="sm"
                    className="edit-item-btn"
                    onClick={() => updateRow(row)}
                >
                    <i className="ri-edit-2-line"></i>
                </Button>
            ),
        },
    ], []);

    const filter = (e) => {
        const keyword = e.target.value;
        const filterData = databk;
        if (keyword !== '') {
            const results = filterData?.filter((d) => (
                d.locationTypeName?.toLowerCase().includes(keyword.toLowerCase()) ||
                d.locationName?.toLowerCase().includes(keyword.toLowerCase()) ||
                d.geographyName?.toLowerCase().includes(keyword.toLowerCase()) ||
                d.vendorLocationCode?.toLowerCase().includes(keyword.toLowerCase()
                )
            ));
            setData(results);
        } else {
            setData(databk);
        }
    };

   const sortData = (data, config) => {
    if (!config || !config.key) return [...data];
    return [...data].sort((a, b) => {
        if (a[config.key] === null || a[config.key] === undefined) return 1;
        if (b[config.key] === null || b[config.key] === undefined) return -1;
        if (a[config.key] === null && b[config.key] === null) return 0;
        const aValue = typeof a[config.key] === 'string' ? a[config.key].toLowerCase() : a[config.key];
        const bValue = typeof b[config.key] === 'string' ? b[config.key].toLowerCase() : b[config.key];
        if (config.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
};

 const sortedData = useMemo(() => {
    // Do not sort by default; show backend order
    if (!sortConfig.key) return data;
    return sortData(data, sortConfig);
}, [data, sortConfig]);

    // Calculate pagination values
const actualPageSize = pageSize === -1 ? sortedData.length : pageSize;
const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
const paginatedData = useMemo(() => {
  if (pageSize === -1) return sortedData;
  const start = page * pageSize;
  const end = start + pageSize;
  return sortedData.slice(start, end);
}, [sortedData, page, pageSize]);

    const renderTableHeader = () => (
        <tr>
            {columns.map((col, idx) => {
                if (!col.sortable) {
                    return <th key={col.key || idx}>{col.header}</th>;
                }
                const active = sortConfig.key === col.key;
                return (
                    <th
                        key={col.key || idx}
                        onClick={() => {
                            if (!col.sortable) return;
                            if (sortConfig.key === col.key) {
                                // Toggle direction
                                setSortConfig({ key: col.key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
                            } else {
                                // Start with asc for new column
                                setSortConfig({ key: col.key, direction: 'asc' });
                            }
                        }}
                        style={{
                            cursor: col.sortable ? 'pointer' : 'default',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            paddingRight: 14,
                            verticalAlign: 'middle',
                        }}
                        aria-sort={active ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                        {col.header}
                        <SortArrows active={active} direction={sortConfig.direction} />
                    </th>
                );
            })}
        </tr>
    );

    const renderTableRows = () => {
        if (paginatedData.length === 0) {
            return (
                <tr>
                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>No data found</td>
                </tr>
            );
        }

        return paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
                <td>{row.locationTypeName}</td>
                <td>{row.locationName}</td>
                <td>{row.locationShortName}</td>
                <td>{row.vendorLocationCode}</td>
                <td className="text-truncate" style={{ maxWidth: '150px' }}>{row.locationAddress}</td>
                <td>{row.parentLocationName}</td>
                <td>{row.geographyName}</td>
                <td>{row.contactPerson}</td>
                <td>{row.contactNo}</td>
                <td>{row.emailAddress}</td>
                <td>{row.requestUserName}</td>
                <td>{row.rquestDate}</td>
                <td>
                    {row.status === true ? (
                        <span className="badge bg-danger-subtle text-danger text-uppercase">INACTIVE</span>
                    ) : (
                        <span className="badge bg-success-subtle text-success text-uppercase">ACTIVE</span>
                    )}
                </td>
                <td>
                    <button
                        className="btn btn-sm btn-primary edit-item-btn"
                        onClick={() => updateRow({ row: { original: row } })}
                    >
                        <i className="ri-edit-2-line"></i>
                    </button>
                </td>
            </tr>
        ));
    };

const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);
    // PAGINATION - Updated with centered results and left-aligned page size dropdown
// PAGINATION - Updated with centered results and left-aligned page size dropdown
const renderPagination = () => {
  const pageSizeOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: -1, label: 'All' },
  ];

  return (
    <div style={{ margin: '18px 0 12px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {/* Left: Showing Results & Page Size */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
            Showing{' '}
            <b style={{ color: '#222', fontWeight: 600 }}>
              {pageSize === -1 ? sortedData.length : Math.min(pageSize, sortedData.length)}
            </b>{' '}
            of <b>{sortedData.length}</b> Results
          </span>
          <select
            value={pageSize}
            onChange={e => {
              const val = e.target.value === '-1' ? -1 : parseInt(e.target.value, 10);
              setPageSize(val);
              setPage(0);
            }}
            style={{
              border: '1px solid #c9ddf7',
              borderRadius: 7,
              padding: '7px 10px',
              fontSize: 15,
              width: '80px',
              color: '#444',
              marginTop: 4,
              outline: 'none',
              background: 'white',
              boxShadow: '0 0 0 2px #d0ebfd66',
            }}
          >
            {pageSizeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Pagination Controls */}
        <div className="btn-group" role="group" aria-label="Pagination">
          <button
            type="button"
            className="btn btn-light"
            disabled={page === 0 || pageSize === -1}
            onClick={() => setPage(Math.max(page - 1, 0))}
          >
            Previous
          </button>
          {pageSize !== -1 && Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
            let pageNum = i;
            if (pageCount > 5) {
              if (page >= 3 && page < pageCount - 2) {
                pageNum = page - 2 + i;
              } else if (page >= pageCount - 2) {
                pageNum = pageCount - 5 + i;
              }
            }
            return (
              <button
                key={pageNum}
                type="button"
                className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`}
                onClick={() => setPage(pageNum)}
                disabled={page === pageNum}
                aria-current={page === pageNum ? 'page' : undefined}
                style={{ minWidth: 36 }}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            type="button"
            className="btn btn-light"
            disabled={(page >= pageCount - 1 || pageCount === 0) || pageSize === -1}
            onClick={() => setPage(Math.min(page + 1, pageCount - 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

    const updateRow = (data) => {
        const filterData = data.row.original;

        console.log('updateRow called with data:', filterData);

        // Load dropdown data first
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj?.user?.loginName || '';

        // Load all dropdown data
        flagIdFunction(2, setLocationTypeName, usernm);
        flagIdFunction(3, setGeographyTypeName, usernm);

        // Load parent locations for edit mode - use existing data as parent options
        if (data && data.length > 0) {
            const parentOptions = data.filter(item => item.locationId !== filterData.locationId).map(item => ({
                locationId: item.locationId,
                locationName: item.locationName,
                locationTypeId: item.locationTypeId
            }));
            console.log('Setting parent options for edit mode (excluding current item):', parentOptions);
            setParentLocationName(parentOptions);
        }

        // Also try the API call as a fallback
        flagIdFunction(5, setParentLocationName, usernm, null, null);

        if (filterData.geographyTypeId) {
            flagIdFunction(4, setGeographyName, usernm, Number(filterData.geographyTypeId), null);
        }

        // Set all states in the correct order
        setEditMode(true);
        setCurrentEditItem(filterData);
        // Map the data fields to match form field names
        const mappedData = {
            ...filterData,
            // Fix field name mapping issues - API returns geographyID but form expects geographyId
            geographyId: filterData.geographyID || filterData.geographyId,
            // Note: locationTypeId might be missing from API response
            // We'll need to get it from the locationTypeName or load it
        };

        // Immediately try to resolve locationTypeId if missing
        if (!mappedData.locationTypeId && filterData.locationTypeName && locationTypeName.length > 0) {
            const locationTypeObj = locationTypeName.find(lt =>
                lt.locationTypeName === filterData.locationTypeName
            );
            if (locationTypeObj) {
                mappedData.locationTypeId = locationTypeObj.locationTypeId;
                console.log('Immediately resolved locationTypeId:', locationTypeObj.locationTypeId);
            }
        }

        console.log('Original filterData:', filterData);
        console.log('Mapped data for form:', mappedData);
        console.log('Checking required fields:');
        console.log('- locationTypeId:', mappedData.locationTypeId);
        console.log('- geographyTypeId:', mappedData.geographyTypeId);
        console.log('- geographyId:', mappedData.geographyId);
        console.log('- contactPerson:', mappedData.contactPerson);
        console.log('- contactNo:', mappedData.contactNo);
        console.log('- emailAddress:', mappedData.emailAddress);

        setLocalModalEdit(mappedData);

        // Load locationTypeId by finding it from the locationTypeName
        // This is a workaround until the API returns locationTypeId
        const findLocationTypeId = () => {
            if (filterData.locationTypeName && locationTypeName.length > 0) {
                const locationTypeObj = locationTypeName.find(lt =>
                    lt.locationTypeName === filterData.locationTypeName
                );
                if (locationTypeObj) {
                    console.log('Found locationTypeId:', locationTypeObj.locationTypeId);
                    setLocalModalEdit(prev => {
                        const updated = {
                            ...prev,
                            locationTypeId: locationTypeObj.locationTypeId
                        };
                        console.log('Updated localModalEdit with locationTypeId:', updated);
                        return updated;
                    });
                    return true;
                } else {
                    console.warn('Could not find locationTypeId for locationTypeName:', filterData.locationTypeName);
                }
            } else {
                console.warn('Missing locationTypeName or dropdown not loaded:', {
                    locationTypeName: filterData.locationTypeName,
                    dropdownLoaded: locationTypeName.length > 0
                });
            }
            return false;
        };

        // Try immediately first, then with timeout
        if (!findLocationTypeId()) {
            setTimeout(() => {
                findLocationTypeId();
            }, 500); // Wait for locationTypeName dropdown to load

            // Additional fallback after more time
            setTimeout(() => {
                if (!findLocationTypeId()) {
                    console.error('Still could not find locationTypeId after extended wait');
                }
            }, 1000);
        }

        setedit_items(filterData);
        setSubmitVal('Update');
        setbuttonval('Update Location');
        setActiveTab("location");
        setFormErrors({});

        // Set edit flags
        setFormEditAllowed(false);
        setFormContactEditAllowed(false);
        setPendingLocationTypeId('');
        setPendingParentLocationId('');
        setPendingGeographyTypeId('');
        setPendingGeographyId('');

        // Set edit mode BEFORE opening modal
        setedit_update(true);

        console.log('About to open modal in edit mode');

        // Use setTimeout to ensure all state updates are processed
        setTimeout(() => {
            setmodal_list(true);
        }, 10);
    };

    const tog_list = () => {
        setEditMode(false);
        setCurrentEditItem(null);
        setedit_update(false);
        setedit_items(null);
        setFormEditAllowed(false);
        setFormContactEditAllowed(false);
        setPendingLocationTypeId('');
        setPendingParentLocationId('');
        setPendingGeographyTypeId('');
        setPendingGeographyId('');
        setbuttonval('Add Location');
        setSubmitVal('Save');
        setmodal_list(!modal_list);
        setActiveTab("location");
        setLocalModalEdit({});
        setFormErrors({});

        if (!modal_list) {
            // Opening modal - load all dropdown data
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const usernm = obj?.user?.loginName || '';

            // Load location types and geography types immediately
            setTimeout(() => {
                flagIdFunction(2, setLocationTypeName, usernm);
                flagIdFunction(3, setGeographyTypeName, usernm);

                // Only load parent locations if there are existing locations
                console.log('Opening modal - current data length:', data.length);
                console.log('Current data array:', data);
                if (data && data.length > 0) {
                    console.log('Loading parent locations for add mode - data exists');
                    // Set parent locations directly from existing data
                    const parentOptions = data.map(item => ({
                        locationId: item.locationId,
                        locationName: item.locationName,
                        locationTypeId: item.locationTypeId
                    }));
                    console.log('Setting parent options from existing data in modal:', parentOptions);
                    setParentLocationName(parentOptions);

                    // Also try the API call as a fallback
                    flagIdFunction(5, setParentLocationName, usernm, null, null);
                } else {
                    console.log('Clearing parent locations - no existing data');
                    setParentLocationName([]);
                }
            }, 100);
        }
    };

    const getLabel = (options, val) => {
        if (val === '' || typeof val === 'undefined' || val === null) return '';
        const numVal = Number(val);

        // Handle different data structures for different dropdown types
        if (options === locationTypeName) {
            return options.find(opt => Number(opt.locationTypeId) === numVal)?.locationTypeName || '';
        } else if (options === parentLocationTypeName) {
            return options.find(opt => Number(opt.locationId) === numVal)?.locationName || '';
        } else if (options === geographyTypeName) {
            return options.find(opt => Number(opt.geographyTypeId) === numVal)?.geographyTypeName || '';
        } else if (options === geographyName) {
            return options.find(opt => Number(opt.geographyId) === numVal)?.geographyName || '';
        }

        return options.find(opt => Number(opt.value) === numVal)?.label || '';
    };

    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const menuPage = JSON.parse(obj?.user?.menuPage || "[]");
        const applicationCode = obj?.user?.applicationCode;
        const currentPath = window.location.pathname;

        const currentPageLabel = findLabelByLink(menuPage, currentPath) || "Page";

        document.title = `${currentPageLabel} | ${applicationCode}`;
    }, []);

    return (
        <React.Fragment>
            <input type="hidden" id="locationTypeNameHidden" data-value="" />
            <input type="hidden" id="parentLocationNameHidden" data-value="" />
            <input type="hidden" id="geographyTypeNameHidden" data-value="" />
            <input type="hidden" id="geographyNameHidden" data-value="" />

            <ToastContainer closeButton={false} />
            <SuccessModal
                show={successModal}
                onCloseClick={() => {
                    setSuccessModal(false);
                    setEditMode(false);
                    setCurrentEditItem(null);
                    setedit_update(false);
                    setedit_items(null);
                    setFormEditAllowed(false);
                    setFormContactEditAllowed(false);
                    setPendingLocationTypeId('');
                    setPendingParentLocationId('');
                    setPendingGeographyTypeId('');
                    setPendingGeographyId('');
                    setbuttonval('Add Location');
                    setSubmitVal('Save');
                    setActiveTab("location");
                    setLocalModalEdit({});
                    setFormErrors({});
                    tog_list();
                    getOnLoadingData();
                }}
                successMsg={response}
            />
            <ErrorModal
                show={errorModal}
                onCloseClick={() => {
                    setErrorModal(false);
                    tog_list();
                }}
                errorMsg={response}
            />
            <style>
                {`
                .fixed-table-outer {
                    style={{ background: 'transparent}
                    position: relative;
                    overflow-x: auto;
                    width: 100%;
                }

                .grid-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .grid-table thead th {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    background-color: #f8f9fa;
                    font-weight: 600;
                    padding: 10px 16px;
                    border-bottom: 2px solid #dee2e6;
                }

                .grid-table tbody td {
                    padding: 8px 16px;
                    border-bottom: 1px solid #dee2e6;
                    vertical-align: middle;
                }

                .grid-table tbody tr:hover {
                    background-color: rgba(0, 0, 0, 0.03);
                }
                `}
            </style>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="LocationCreation" pageTitle="Pages" />

                    <Card>
                        <CardHeader className="card-header card-primary">
                            <Row className="g-4 align-items-center">
                                <Col className="col-sm-auto">
                                    <div>
                                        <h4 color="primary" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1">
                                            LocationCreation
                                        </h4>
                                    </div>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Row className="g-4 mb-3">
                                <Col className="col-sm-4">
                                    <div className="search-box ms-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="searchResultList"
                                            placeholder="Search for Location..."
                                            onKeyUp={(e) => filter(e)}
                                        />
                                        <i className="ri-search-line search-icon"></i>
                                    </div>
                                </Col>
                                <Col className="col-sm">
                                    <div className="d-flex justify-content-sm-end">
                                        <div>
                                            <Button
                                                color="primary"
                                                className="add-btn me-1"
                                                onClick={() => tog_list()}
                                                id="create-btn"
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Add
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={12}>
                                    <div>
                                        <div className="table-responsive">
                                                <table className="table table-bordered table-hover mb-0">
                                                    <thead className="table-light">
                                                        {renderTableHeader()}
                                                    </thead>
                                                    <tbody>
                                                        {renderTableRows()}
                                                    </tbody>
                                                </table>
                                            </div>
                                        {renderPagination()}
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Container>

                <Modal isOpen={modal_list} toggle={tog_list} centered size="lg">
                    <ModalHeader className="bg-primary text-white p-3" toggle={tog_list}>
                        <span className="modal-title text-white">{buttonval}</span>
                        {/* <small className="text-white ms-2" style={{opacity: 0.8}}>
                            [Mode: {edit_update ? 'EDIT' : 'ADD'}] [edit_items: {edit_items ? 'YES' : 'NO'}]
                        </small> */}
                    </ModalHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                    }}>
                        <ModalBody style={{ paddingBottom: 0, paddingTop: 20, maxHeight: '70vh', overflowY: 'auto' }}>

                            

                            <div className="mb-3 fw text-muted ">

                                Please fill mandatory information below <span className="text-danger">*</span>
                            </div>
                            <div className="custom-modal-tabs" style={{ marginBottom: 22 }}>
                                <style>{`
                                    .custom-modal-tabs {
                                      display: flex;
                                      gap: 20px;
                                      border-bottom: none;
                                      align-items: flex-end;
                                      background: transparent;
                                      position: relative;
                                      margin-bottom: 22px;
                                    }
                                    .custom-tab-btn {
                                      position: relative;
                                      min-width: 210px;
                                      min-height: 52px;
                                      display: flex;
                                      align-items: center;
                                      justify-content: flex-start;
                                      gap: 10px;
                                      border: none;
                                      background: transparent;
                                      cursor: pointer;
                                      outline: none;
                                      font-size: 1.18rem;
                                      font-weight: 500;
                                      transition: background 0.16s;
                                      box-shadow: none;
                                      margin-bottom: 0;
                                    }
                                    .custom-tab-btn.active {
                                      background: #389876;
                                      color: #fff;
                                      border-radius: 4px 4px 0 0;
                                      font-weight: 600;
                                      z-index: 2;
                                      box-shadow: none;
                                      margin-bottom: 0;
                                    }
                                    .custom-tab-btn .tab-icon {
                                      display: inline-flex;
                                      align-items: center;
                                      justify-content: center;
                                      width: 28px;
                                      height: 28px;
                                      border-radius: 50%;
                                      font-size: 1.25rem;
                                      transition: all 0.15s;
                                      background: #e4f2ec;
                                      color: #389876;
                                      margin-right: 6px;
                                    }
                                    .custom-tab-btn.active .tab-icon {
                                      background: transparent;
                                      color: #fff;
                                    }
                                    .custom-tab-btn .tab-label {
                                      font-weight: 500;
                                      letter-spacing: 0.02em;
                                      color: #222;
                                    }
                                    .custom-tab-btn.active .tab-label {
                                      color: #fff;
                                    }
                                    .custom-tab-btn .tab-pointer {
                                      display: none;
                                      position: absolute;
                                      left: 50%;
                                      transform: translateX(-50%);
                                      bottom: -9px;
                                      width: 22px;
                                      height: 9px;
                                      z-index: 3;
                                    }
                                    .custom-tab-btn.active .tab-pointer {
                                      display: block;
                                    }
                                    .required-field::after {
                                      content: " *";
                                      color: #dc3545;
                                    }
                                    .is-invalid {
                                      border-color: #dc3545 !important;
                                    }
                                    .table-responsive {
                                        display: block;
                                        width: 100%;
                                        overflow-x: auto;
                                        -webkit-overflow-scrolling: touch;
                                    }
                                    .table {
                                        min-width: 1000px;
                                        width: 100%;
                                    }
                                    @media (max-width: 768px) {
                                        .custom-tab-btn {
                                            min-width: 160px;
                                            font-size: 1rem;
                                        }
                                        .table-responsive {
                                            border: 1px solid #dee2e6;
                                        }
                                    }
                                `}</style>
                                {tabs.map(tab => (
                                    <button
                                        type="button"
                                        className={`custom-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                                        key={tab.key}
                                        // onClick={() => setActiveTab(tab.key)}
                                        tabIndex={0}
                                    >
                                        <span className="tab-icon">
                                            {tab.key === "location" ? (
                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 21s6-5.22 6-10A6 6 0 0 0 6 11c0 4.78 6 10 6 10z" /><circle cx="12" cy="11" r="2.25"></circle></svg>
                                            ) : (
                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path></svg>
                                            )}
                                        </span>
                                        <span className="tab-label">{tab.label}</span>
                                        <span className="tab-pointer">
                                            <svg width="22" height="9" viewBox="0 0 22 9"><polygon points="11,9 0,0 22,0" fill="#389876" /></svg>
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {activeTab === "location" && (
                                <Row className="justify-content-center mb-3">
                                    <Col md={12}>
                                        <div className="p-3 border rounded shadow-sm h-100" style={{ background: 'transparent' }}>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">LocationTypeName</Label>
                                                        {!edit_update ? (
                                                            <Input
                                                                type="select"
                                                                name="locationTypeId"
                                                                value={localModalEdit.locationTypeId || ''}
                                                                onChange={handleModalInputChange}
                                                                className={`form-control fs-6 py-2 px-3 ${formErrors.locationTypeId ? 'is-invalid' : ''}`}
                                                            >
                                                                <option value="">Select LocationType</option>
                                                                {locationTypeName.map(opt => (
                                                                    <option key={opt.locationTypeId} value={opt.locationTypeId}>
                                                                        {opt.locationTypeName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        ) : (
                                                            <Input
                                                                type="text"
                                                                value={getLabel(locationTypeName, localModalEdit.locationTypeId)}
                                                                disabled
                                                                className="form-control fs-6 py-2 px-3 bg-white"
                                                            />
                                                        )}
                                                        {formErrors.locationTypeId &&
                                                            <FormFeedback type="invalid">{formErrors.locationTypeId}</FormFeedback>
                                                        }
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">LocationName</Label>
                                                        <Input
                                                            name="locationName"
                                                            placeholder="Enter LocationName"
                                                            value={localModalEdit.locationName || ''}
                                                            onChange={handleModalInputChange}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.locationName ? 'is-invalid' : ''}`}
                                                            maxLength={50}
                                                        />
                                                        {formErrors.locationName && <FormFeedback type="invalid">{formErrors.locationName}</FormFeedback>}
                                                    </FormGroup>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">LocationShortName</Label>
                                                        <Input
                                                            name="locationShortName"
                                                            placeholder="Enter LocationShortName"
                                                            value={localModalEdit.locationShortName || ''}
                                                            onChange={handleModalInputChange}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.locationShortName ? 'is-invalid' : ''}`}
                                                            maxLength={50}
                                                        />
                                                        {formErrors.locationShortName && <FormFeedback type="invalid">{formErrors.locationShortName}</FormFeedback>}
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">LocationAddress</Label>
                                                        <Input
                                                            name="locationAddress"
                                                            placeholder="Enter LocationAddress"
                                                            value={localModalEdit.locationAddress || ''}
                                                            onChange={handleModalInputChange}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.locationAddress ? 'is-invalid' : ''}`}
                                                            maxLength={100}
                                                        />
                                                        {formErrors.locationAddress && <FormFeedback type="invalid">{formErrors.locationAddress}</FormFeedback>}
                                                    </FormGroup>

                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">VendorLocationCode</Label>
                                                        <Input
                                                            name="vendorLocationCode"
                                                            placeholder="Enter VendorLocationCode"
                                                            value={localModalEdit.vendorLocationCode || ''}
                                                            onChange={handleModalInputChange}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.vendorLocationCode ? 'is-invalid' : ''}`}
                                                            maxLength={50}
                                                        />
                                                        {formErrors.vendorLocationCode && <FormFeedback type="invalid">{formErrors.vendorLocationCode}</FormFeedback>}
                                                    </FormGroup>

                                                   <FormGroup className="mb-2">
    <Label>ParentLocationName</Label>
    {!edit_update ? (
        data.length > 0 ? (
            <Input
                type="select"
                name="parentLocationId"
                value={localModalEdit.parentLocationId || ''}
                onChange={handleModalInputChange}
                className="form-control fs-6 py-2 px-3"
            >
                <option value="">Select Parent</option>
                {parentLocationTypeName.map(opt => (
                    <option key={opt.locationId} value={opt.locationId}>
                        {opt.locationName}
                    </option>
                ))}
            </Input>
        ) : (
            <Input
                type="text"
                value="No parent locations available (This will be the first location)"
                disabled
                className="form-control fs-6 py-2 px-3 bg-light text-muted"
                style={{ fontStyle: 'italic' }}
            />
        )
    ) : (
        <Input
            type="text"
            value={getLabel(parentLocationTypeName, localModalEdit.parentLocationId)}
            disabled
            className="form-control fs-6 py-2 px-3 bg-white"
        />
    )}
</FormGroup>
                                                </Col>
                                            </Row>

                                            {(() => {
                                                console.log('Rendering location edit section - edit_update:', edit_update);
                                                return edit_update;
                                            })() && (
                                                    <>
                                                        <FormGroup className="mb-2 form-check d-flex align-items-center">
                                                            <Input
                                                                type="checkbox"
                                                                checked={formEditAllowed}
                                                                onChange={() => {
                                                                    setFormEditAllowed(!formEditAllowed);
                                                                    if (!formEditAllowed) {
                                                                        // When enabling edit, clear pending values
                                                                        setPendingLocationTypeId('');
                                                                        setPendingParentLocationId('');
                                                                    }
                                                                }}
                                                                className="form-check-input me-2"
                                                                id="locationInfoEditCheckbox"
                                                            />
                                                            <Label check htmlFor="locationInfoEditCheckbox" className="form-check-label text-muted small">Do you want to Change.?</Label>
                                                        </FormGroup>
                                                        {formEditAllowed && (
                                                            <Row className="align-items-start">
                                                                <Col md={6}>
                                                                    <FormGroup className="mb-2">
                                                                        <Label>LocationType Name</Label>
                                                                        <Input
                                                                            type="select"
                                                                            name="pendingLocationTypeId"
                                                                            value={pendingLocationTypeId || ''}
                                                                            onChange={e => setPendingLocationTypeId(e.target.value)}
                                                                            className="form-control fs-6 py-2 px-3"
                                                                        >
                                                                            <option value="">Select Location Type</option>
                                                                            {locationTypeName.map(opt => (
                                                                                <option value={opt.locationTypeId} key={opt.locationTypeId}>
                                                                                    {opt.locationTypeName}
                                                                                </option>
                                                                            ))}
                                                                        </Input>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <FormGroup className="mb-2">
                                                                        <Label>ParentLocationName</Label>
                                                                        <Input
                                                                            type="select"
                                                                            name="pendingParentLocationId"
                                                                            value={pendingParentLocationId || ''}
                                                                            onChange={e => setPendingParentLocationId(e.target.value)}
                                                                            className="form-control fs-6 py-2 px-3"
                                                                        >
                                                                            <option value="">Select Parent</option>
                                                                            {parentLocationTypeName.map(opt => (
                                                                                <option value={opt.locationId} key={opt.locationId}>
                                                                                    {opt.locationName}
                                                                                </option>
                                                                            ))}
                                                                        </Input>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                    </>
                                                )}
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {activeTab === "contact" && (
                                <Row className="justify-content-center mb-3">
                                    <Col md={12}>
                                        <div className="p-3 border rounded shadow-sm h-100" style={{ background: 'transparent' }}>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">Contact Person</Label>
                                                        <Input
                                                            name="contactPerson"
                                                            placeholder="Enter Contact Person"
                                                            value={localModalEdit.contactPerson || ''}
                                                            onChange={handleModalInputChange}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.contactPerson ? 'is-invalid' : ''}`}
                                                            maxLength={50}
                                                        />
                                                        {formErrors.contactPerson && <FormFeedback type="invalid">{formErrors.contactPerson}</FormFeedback>}
                                                    </FormGroup>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">GeographyType Name</Label>
                                                        {!edit_update ? (
                                                            <Input
                                                                type="select"
                                                                name="geographyTypeId"
                                                                value={localModalEdit.geographyTypeId || ''}
                                                                onChange={handleModalInputChange}
                                                                className={`form-control fs-6 py-2 px-3 ${formErrors.geographyTypeId ? 'is-invalid' : ''}`}
                                                            >
                                                                <option value="">Select GeographyType</option>
                                                                {geographyTypeName.map(opt => (
                                                                    <option key={opt.geographyTypeId} value={opt.geographyTypeId}>
                                                                        {opt.geographyTypeName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        ) : (
                                                            <Input
                                                                type="text"
                                                                value={getLabel(geographyTypeName, localModalEdit.geographyTypeId)}
                                                                disabled
                                                                className="form-control fs-6 py-2 px-3 bg-white"
                                                            />
                                                        )}
                                                        {formErrors.geographyTypeId && <FormFeedback type="invalid">{formErrors.geographyTypeId}</FormFeedback>}
                                                    </FormGroup>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">GeographyName</Label>
                                                        {!edit_update ? (
                                                            <Input
                                                                type="select"
                                                                name="geographyId"
                                                                value={localModalEdit.geographyId || ''}
                                                                onChange={handleModalInputChange}
                                                                className={`form-control fs-6 py-2 px-3 ${formErrors.geographyId ? 'is-invalid' : ''}`}
                                                            >
                                                                <option value="">Select Geography</option>
                                                                {geographyName.map(opt => (
                                                                    <option key={opt.geographyId} value={opt.geographyId}>
                                                                        {opt.geographyName}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        ) : (
                                                            <Input
                                                                type="text"
                                                                value={getLabel(geographyName, localModalEdit.geographyId)}
                                                                disabled
                                                                className="form-control fs-6 py-2 px-3 bg-white"
                                                            />
                                                        )}
                                                        {formErrors.geographyId && <FormFeedback type="invalid">{formErrors.geographyId}</FormFeedback>}
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">Contact Email </Label>
                                                        <Input
                                                            name="emailAddress"
                                                            placeholder="Enter Contact Email "
                                                            value={localModalEdit.emailAddress || ''}
                                                            onChange={handleModalInputChange}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.emailAddress ? 'is-invalid' : ''}`}
                                                            maxLength={50}
                                                        />
                                                        {formErrors.emailAddress && <FormFeedback type="invalid">{formErrors.emailAddress}</FormFeedback>}
                                                    </FormGroup>
                                                    <FormGroup className="mb-2">
                                                        <Label className="required-field">Contact Number</Label>
                                                        <Input
                                                            name="contactNo"
                                                            placeholder="Enter Contact Number"
                                                            value={localModalEdit.contactNo || ''}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                                handleModalInputChange({ target: { name: 'contactNo', value: val } });
                                                            }}
                                                            className={`form-control fs-6 py-2 px-3 ${formErrors.contactNo ? 'is-invalid' : ''}`}
                                                            maxLength={12}
                                                        />
                                                        {formErrors.contactNo && <FormFeedback type="invalid">{formErrors.contactNo}</FormFeedback>}
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {(() => {
                                                console.log('Rendering contact edit section - edit_update:', edit_update);
                                                return edit_update;
                                            })() && (
                                                    <Row>
                                                        <Col md={12}>
                                                            <FormGroup className="mb-2 form-check d-flex align-items-center">
                                                                <Input
                                                                    type="checkbox"
                                                                    checked={formContactEditAllowed}
                                                                    onChange={() => {
                                                                        setFormContactEditAllowed(!formContactEditAllowed);
                                                                        if (!formContactEditAllowed) {
                                                                            // When enabling edit, clear pending values
                                                                            setPendingGeographyTypeId('');
                                                                            setPendingGeographyId('');
                                                                        }
                                                                    }}
                                                                    className="form-check-input me-2"
                                                                    id="contactInfoEditCheckbox"
                                                                />
                                                                <Label check htmlFor="contactInfoEditCheckbox" className="form-check-label text-muted small">
                                                                    Do you want to Change.?
                                                                </Label>
                                                            </FormGroup>
                                                            {formContactEditAllowed && (
                                                                <Row className="align-items-start">
                                                                    <Col md={6}>
                                                                        <FormGroup className="mb-2">
                                                                            <Label>Geography Type Name</Label>
                                                                            <Input
                                                                                type="select"
                                                                                name="pendingGeographyTypeId"
                                                                                value={pendingGeographyTypeId || ''}
                                                                                onChange={e => setPendingGeographyTypeId(e.target.value)}
                                                                                className="form-control fs-6 py-2 px-3"
                                                                            >
                                                                                <option value="">Select Geography Type</option>
                                                                                {geographyTypeName.map(opt => (
                                                                                    <option value={opt.geographyTypeId} key={opt.geographyTypeId}>
                                                                                        {opt.geographyTypeName}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md={6}>
                                                                        <FormGroup className="mb-2">
                                                                            <Label>Geography Name</Label>
                                                                            <Input
                                                                                type="select"
                                                                                name="pendingGeographyId"
                                                                                value={pendingGeographyId || ''}
                                                                                onChange={e => setPendingGeographyId(e.target.value)}
                                                                                className="form-control fs-6 py-2 px-3"
                                                                            >
                                                                                <option value="">Select Geography</option>
                                                                                {geographyName.map(opt => (
                                                                                    <option key={opt.geographyId} value={opt.geographyId}>
                                                                                        {opt.geographyName}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                )}
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </ModalBody>
                        <ModalFooter style={{ position: 'sticky', bottom: 0, background: '#fff', zIndex: 100, borderTop: '1px solid #eef0f3', justifyContent: 'flex-end' }}>
                            <div className="hstack gap-2 justify-content-end w-100">
                                <Button color="danger" type="button" onClick={() => setmodal_list(false)}>Close</Button>
                                {activeTab === "location" ? (
                                    <Button
                                        color="primary"
                                        type="button"
                                        onClick={() => {
                                            console.log('Continue button clicked');
                                            console.log('Current localModalEdit:', localModalEdit);
                                            console.log('Edit mode:', edit_update);

                                            // Clear previous errors
                                            setFormErrors({});

                                            // In edit mode, try to resolve missing locationTypeId before validation
                                            let currentData = { ...localModalEdit };
                                            if (edit_update && (!currentData.locationTypeId || currentData.locationTypeId === '')) {
                                                console.log('LocationTypeId missing in Continue, trying to resolve...');
                                                if (edit_items && edit_items.locationTypeName && locationTypeName.length > 0) {
                                                    const locationTypeObj = locationTypeName.find(lt =>
                                                        lt.locationTypeName === edit_items.locationTypeName
                                                    );
                                                    if (locationTypeObj) {
                                                        console.log('Resolved locationTypeId in Continue:', locationTypeObj.locationTypeId);
                                                        currentData.locationTypeId = locationTypeObj.locationTypeId;
                                                        setLocalModalEdit(currentData);
                                                    }
                                                }
                                            }

                                            // Validate location fields with more detailed checking
                                            const locationErrors = {};

                                            const locationTypeId = currentData.locationTypeId;
                                            const locationName = currentData.locationName;
                                            const locationShortName = currentData.locationShortName;
                                            const vendorLocationCode = currentData.vendorLocationCode;
                                            const locationAddress = currentData.locationAddress;

                                            console.log('Field values:', {
                                                locationTypeId,
                                                locationName,
                                                locationShortName,
                                                vendorLocationCode,
                                                locationAddress
                                            });

                                            if (!locationTypeId || locationTypeId === '' || locationTypeId === '0') {
                                                locationErrors.locationTypeId = 'Required';
                                            }
                                            if (!locationName || locationName.trim() === '') {
                                                locationErrors.locationName = 'Required';
                                            }
                                            if (!locationShortName || locationShortName.trim() === '') {
                                                locationErrors.locationShortName = 'Required';
                                            }
                                            if (!vendorLocationCode || vendorLocationCode.trim() === '') {
                                                locationErrors.vendorLocationCode = 'Required';
                                            }
                                            if (!locationAddress || locationAddress.trim() === '') {
                                                locationErrors.locationAddress = 'Required';
                                            }

                                            console.log('Validation errors found:', locationErrors);

                                            // If there are errors, show them and don't proceed
                                            if (Object.keys(locationErrors).length > 0) {
                                                setFormErrors(locationErrors);
                                                console.log('Validation failed, not proceeding');
                                                return;
                                            }

                                            // All location fields are valid, proceed to contact tab
                                            console.log('Validation passed, moving to contact tab');
                                            setActiveTab("contact");
                                        }}
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        color="primary"
                                        type="button"
                                        onClick={() => {
                                            console.log('=== FINAL SUBMIT CLICKED ===');
                                            console.log('Current localModalEdit:', localModalEdit);
                                            console.log('Edit mode:', edit_update);

                                            // Clear previous errors
                                            setFormErrors({});

                                            // Validate all fields before submission
                                            const errors = validateForm(localModalEdit);
                                            console.log('Final validation errors:', errors);

                                            if (Object.keys(errors).length > 0) {
                                                console.log('Validation failed, setting errors and switching tabs');
                                                setFormErrors(errors);
                                                // If there are location errors, go back to location tab
                                                if (errors.locationTypeId || errors.locationName || errors.locationShortName ||
                                                    errors.vendorLocationCode || errors.locationAddress) {
                                                    setActiveTab("location");
                                                } else {
                                                    // Stay on contact tab to show contact errors
                                                    setActiveTab("contact");
                                                }
                                                return;
                                            }

                                            // In edit mode, resolve any missing required fields before submission
                                            let finalSubmitData = { ...localModalEdit };

                                            if (edit_update) {
                                                console.log('Edit mode - checking for missing fields...');
                                                console.log('Current localModalEdit:', localModalEdit);
                                                console.log('Original edit_items:', edit_items);

                                                // Fix locationTypeId if missing
                                                if (!finalSubmitData.locationTypeId || finalSubmitData.locationTypeId === '') {
                                                    console.log('LocationTypeId missing in final submit, trying to resolve...');

                                                    if (edit_items && edit_items.locationTypeName && locationTypeName.length > 0) {
                                                        const locationTypeObj = locationTypeName.find(lt =>
                                                            lt.locationTypeName === edit_items.locationTypeName
                                                        );
                                                        if (locationTypeObj) {
                                                            console.log('Found missing locationTypeId:', locationTypeObj.locationTypeId);
                                                            finalSubmitData.locationTypeId = locationTypeObj.locationTypeId;
                                                        } else {
                                                            console.error('Could not find locationTypeId for:', edit_items.locationTypeName);
                                                        }
                                                    } else {
                                                        console.error('Missing data for locationTypeId resolution');
                                                    }
                                                }

                                                // Fix geographyId if missing (API returns geographyID but form expects geographyId)
                                                if (!finalSubmitData.geographyId || finalSubmitData.geographyId === '') {
                                                    console.log('GeographyId missing, checking for geographyID...');

                                                    if (edit_items && edit_items.geographyID) {
                                                        console.log('Found geographyID, mapping to geographyId:', edit_items.geographyID);
                                                        finalSubmitData.geographyId = edit_items.geographyID;
                                                    } else if (localModalEdit.geographyID) {
                                                        console.log('Found geographyID in localModalEdit:', localModalEdit.geographyID);
                                                        finalSubmitData.geographyId = localModalEdit.geographyID;
                                                    } else {
                                                        console.error('Could not find geographyID in any source');
                                                    }
                                                }

                                                console.log('Final submit data after field resolution:', finalSubmitData);
                                            }

                                            // Re-validate with the final data
                                            const finalErrors = validateForm(finalSubmitData);
                                            if (Object.keys(finalErrors).length > 0) {
                                                console.log('Final validation errors:', finalErrors);
                                                setFormErrors(finalErrors);
                                                // If there are location errors, go back to location tab
                                                if (finalErrors.locationTypeId || finalErrors.locationName || finalErrors.locationShortName ||
                                                    finalErrors.vendorLocationCode || finalErrors.locationAddress) {
                                                    setActiveTab("location");
                                                } else {
                                                    // Stay on contact tab to show contact errors
                                                    setActiveTab("contact");
                                                }
                                                return;
                                            }

                                            console.log('All validation passed, calling handleSubmit with resolved data');
                                            // All validation passed, submit the form with resolved data
                                            handleSubmit(finalSubmitData);
                                        }}
                                        id="add-btn"
                                    >
                                        {submitVal}
                                    </Button>
                                )}
                            </div>
                        </ModalFooter>
                    </form>
                </Modal>
            </div>
        </React.Fragment>
    );
};

export default Location;
