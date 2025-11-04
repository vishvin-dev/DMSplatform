import React, { useState, useMemo, useEffect } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, Container, ModalBody,
  ModalFooter, ModalHeader, Row, Label, FormFeedback, Modal, Input, FormGroup,
  Form
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { ToastContainer } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';
import Select from 'react-select';
import {
  getAllUserDetails,
  getAllUserDropDownss,
  updateMeterMangeUserDetails,
  updateManageUserPassword
} from '../../helpers/fakebackend_helper';

const SORT_ARROW_SIZE = 13;

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
  { key: "userInfo", label: "User Information", icon: "ri-user-line" },
  { key: "password", label: "Force Password Change", icon: "ri-lock-line" },
  { key: "block/unblock", label: "Block/Unblock", icon: "ri-lock-line" }
];

const getPasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length > 5) strength += 1;
  if (password.length > 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const sortData = (arr, key, direction) => {
  if (!key) return arr;
  return [...arr].sort((a, b) => {
    const av = a[key], bv = b[key];
    const aNull = av == null, bNull = bv == null;
    if (aNull && !bNull) return 1;
    if (bNull && !aNull) return -1;
    if (aNull && bNull) return 0;
    const aVal = typeof av === 'string' ? av.toLowerCase() : av;
    const bVal = typeof bv === 'string' ? bv.toLowerCase() : bv;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    return 0;
  });
};

// Helper function to process zone access data for display
const processZoneAccessForDisplay = (zoneAccess) => {
  if (!zoneAccess || zoneAccess.length === 0) {
    return {
      division: '-',
      sub_division: '-',
      section_office: '-'
    };
  }

  // Group by division
  const divisionsMap = {};
  
  zoneAccess.forEach(zone => {
    const division = zone.division || '-';
    const subDivision = zone.sub_division || '-';
    const sectionOffice = zone.section_office || '-';
    
    if (!divisionsMap[division]) {
      divisionsMap[division] = {};
    }
    
    if (!divisionsMap[division][subDivision]) {
      divisionsMap[division][subDivision] = new Set();
    }
    
    if (sectionOffice !== '-') {
      divisionsMap[division][subDivision].add(sectionOffice);
    }
  });
  
  // Convert to arrays and format
  const divisions = Object.keys(divisionsMap);
  const subDivisions = new Set();
  const sectionOffices = new Set();
  
  Object.values(divisionsMap).forEach(subDivMap => {
    Object.keys(subDivMap).forEach(subDiv => {
      if (subDiv !== '-') subDivisions.add(subDiv);
      subDivMap[subDiv].forEach(so => sectionOffices.add(so));
    });
  });
  
  return {
    division: divisions.length > 0 ? divisions.join(', ') : '-',
    sub_division: subDivisions.size > 0 ? Array.from(subDivisions).join(', ') : '-',
    section_office: sectionOffices.size > 0 ? Array.from(sectionOffices).join(', ') : '-',
    rawData: zoneAccess // Keep raw data for tooltips
  };
};

const ManageUser = () => {
  const [data, setData] = useState([]);
  const [dataBk, setDataBk] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modal, setModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('userInfo');
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [response, setResponse] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [username, setUserName] = useState('');
  const [roleName, setRoleName] = useState([]);
  const [genderName, setGenderName] = useState([]);
  const [maritalStatusName, setMaritalStatusName] = useState([]);
  const [maritalStatusCode, setMaritalStatusCode] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for all zoneAccess records in the modal
  const [allZoneAccess, setAllZoneAccess] = useState([]);
  // State for the temporary dropdown selections
  const [tempCircle, setTempCircle] = useState('');
  const [tempDivision, setTempDivision] = useState('');
  const [tempSubDivision, setTempSubDivision] = useState('');
  const [tempSectionOffice, setTempSectionOffice] = useState('');
  
  // State for table sorting and pagination
  const [sortConfig, setSortConfig] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // State for dropdown options
  const [circles, setCircles] = useState([]);
  const [divisionName, setDivisionName] = useState([]);
  const [subDivisionName, setSubDivisionName] = useState([]);
  const [sectionOfficeName, setSectionOfficeName] = useState([]);

  const toggleNew = () => setShowNew(!showNew);
  const toggleConfirm = () => setShowConfirm(!showConfirm);

  useEffect(() => {
    getOnLoadingData();
    document.title = `Manage User | DMS`;
  }, []);

  async function getOnLoadingData() {
    try {
      const payload = {
        flagId: 1,
        requestUserName: username,
      };

      const response = await getAllUserDetails(payload);

      if (response.status === "success") {
        const processedData = response.data.map(user => {
          const processedZone = processZoneAccessForDisplay(user.zoneAccess);
          
          return {
            ...user,
            division: processedZone.division,
            sub_division: processedZone.sub_division,
            section_office: processedZone.section_office,
            zoneAccess: user.zoneAccess || [],
            processedZoneData: processedZone 
          };
        });
        
        setData(processedData);
        setDataBk(processedData);
      } else {
        console.error("Failed to fetch users:", response.message);
      }
    } catch (error) {
      console.error("Error in getOnLoadingData:", error);
    }
  }

  const handleSearchInputChange = (e) => {
    const text = e.target.value;
    setSearchText(text);

    if (text === '') {
      setData(dataBk);
      return;
    }

    const filtered = dataBk.filter(user =>
      user.FirstName?.toLowerCase().includes(text.toLowerCase()) ||
      user.LastName?.toLowerCase().includes(text.toLowerCase()) ||
      user.Email?.toLowerCase().includes(text.toLowerCase()) ||
      user.PhoneNumber?.includes(text) ||
      user.LoginName?.toLowerCase().includes(text.toLowerCase()) ||
      user.division?.toLowerCase().includes(text.toLowerCase()) ||
      user.sub_division?.toLowerCase().includes(text.toLowerCase()) ||
      user.section_office?.toLowerCase().includes(text.toLowerCase()) ||
      (user.zoneAccess && user.zoneAccess.some(zone => 
        zone.division?.toLowerCase().includes(text.toLowerCase()) ||
        zone.sub_division?.toLowerCase().includes(text.toLowerCase()) ||
        zone.section_office?.toLowerCase().includes(text.toLowerCase())
      ))
    );
    setData(filtered);
    setPage(0);
  };

  // Refactored function to fetch all dropdown data
  const flagIdFunction = async (flagId, setState, requestUserName, options = {}) => {
    try {
      const params = { flagId, requestUserName, ...options };
      const response = await getAllUserDropDownss(params);
      const data = response?.data || [];
      console.log(`Fetched data for flag ${flagId} with options ${JSON.stringify(options)}:`, data);
      setState(data);
    } catch (error) {
      console.error(`Error fetching options for flag ${flagId}:`, error.message);
      setState([]); // Set to empty array on error to prevent crashes
    }
  };

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.LoginName;
    setUserName(usernm);

    // Initial dropdowns that don't depend on others
    flagIdFunction(4, setGenderName, usernm);
    flagIdFunction(5, setMaritalStatusName, usernm);
    flagIdFunction(6, setRoleName, usernm);
    
    // Fetch circles with hardcoded zone_code "Kalaburagi"
    fetchCircles(usernm);
  }, []);

  // Function to fetch circles with hardcoded zone_code
  const fetchCircles = async (usernm) => {
    try {
      const params = { 
        flagId: 7, 
        requestUserName: usernm,
        zone_code: "Kalaburagi" // Hardcoded as requested
      };
      const response = await getAllUserDropDownss(params);
      const data = response?.data || [];
      console.log('Fetched circles with Kalaburagi zone:', data);
      setCircles(data);
    } catch (error) {
      console.error('Error fetching circles:', error.message);
      setCircles([]);
    }
  };

  const handleCircleChange = async (circle_code) => {
    setTempCircle(circle_code);
    // Reset downstream selections and data
    setTempDivision('');
    setTempSubDivision('');
    setTempSectionOffice('');
    setDivisionName([]);
    setSubDivisionName([]);
    setSectionOfficeName([]);
    
    if (circle_code) {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj.user.LoginName;
      // Fetch divisions for selected circle
      await flagIdFunction(1, setDivisionName, usernm, { circle_code });
    }
  };

  const handleDivisionChange = async (div_code) => {
    setTempDivision(div_code);
    setTempSubDivision('');
    setTempSectionOffice('');
    setSubDivisionName([]);
    setSectionOfficeName([]);

    if (div_code) {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.LoginName;
        // Fetch sub-divisions for selected division
        await flagIdFunction(2, setSubDivisionName, usernm, { div_code });
    }
  };

  const handleSubDivisionChange = async (sd_code) => {
    setTempSubDivision(sd_code);
    setTempSectionOffice('');
    setSectionOfficeName([]);
    
    if (sd_code && tempDivision) {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.LoginName;
        // Fetch section offices for selected sub-division
        await flagIdFunction(3, setSectionOfficeName, usernm, { div_code: tempDivision, sd_code });
    }
  };
  
  // Function to add a new zone
  const addZone = () => {
    if (!tempCircle || !tempDivision || !tempSubDivision || !tempSectionOffice) {
      return;
    }

    const circleObj = circles.find(c => c.circle_code === tempCircle);
    const divisionObj = divisionName.find(d => d.div_code === tempDivision);
    const subDivisionObj = subDivisionName.find(sd => sd.sd_code === tempSubDivision);
    const sectionOfficeObj = sectionOfficeName.find(so => so.so_code === tempSectionOffice);

    const newZone = {
      zone_code: "Kalaburagi", // Hardcoded as requested
      circle_code: tempCircle,
      div_code: tempDivision,
      sd_code: tempSubDivision,
      so_code: tempSectionOffice,
      circle: circleObj ? circleObj.circle : '',
      division: divisionObj ? divisionObj.division : '',
      sub_division: subDivisionObj ? subDivisionObj.sub_division : '',
      section_office: sectionOfficeObj ? sectionOfficeObj.section_office : ''
    };

    // Check if this zone already exists
    const exists = allZoneAccess.some(zone => 
      zone.circle_code === newZone.circle_code &&
      zone.div_code === newZone.div_code && 
      zone.sd_code === newZone.sd_code && 
      zone.so_code === newZone.so_code
    );

    if (!exists) {
      setAllZoneAccess([...allZoneAccess, newZone]);
    }

    // Reset temporary values
    setTempCircle('');
    setTempDivision('');
    setTempSubDivision('');
    setTempSectionOffice('');
    setDivisionName([]);
    setSubDivisionName([]);
    setSectionOfficeName([]);
  };

  // Function to remove a zone
  const removeZone = (index) => {
    const updatedZones = [...allZoneAccess];
    updatedZones.splice(index, 1);
    setAllZoneAccess(updatedZones);
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      FirstName: selectedUser?.FirstName || '',
      middleName: selectedUser?.middleName || '',
      LastName: selectedUser?.LastName || '',
      Gender_Id: selectedUser?.Gender_Id || '',
      MaritalStatus_Id: selectedUser?.MaritalStatus_Id || '',
      PhoneNumber: selectedUser?.PhoneNumber || '',
      Email: selectedUser?.Email || '',
      DateofBirth: selectedUser?.DateofBirth ? selectedUser.DateofBirth.split('T')[0] : '',
      Role_Id: selectedUser?.Role_Id || '',
      User_Id: selectedUser?.User_Id || '',
      isDisabled: selectedUser?.isDisabled || false,
      LoginName: selectedUser?.LoginName || '',
    },

    validationSchema: Yup.object({
      FirstName: Yup.string().required("First Name is required"),
      LastName: Yup.string().required("Last Name is required"),
      Email: Yup.string().email("Invalid email format").required("Email is required"),
      PhoneNumber: Yup.string().matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),
      Role_Id: Yup.string().required("Role is required"),
    }),

    onSubmit: async (data) => {
      setIsSubmitting(true);
      try {
        const payload = {
          flagId: editMode ? 2 : 1,
          User_Id: Number(data.User_Id),
          FirstName: data.FirstName,
          middleName: data.middleName,
          LastName: data.LastName,
          ProjectName: "DMS",
          DateofBirth: data.DateofBirth,
          PhoneNumber: data.PhoneNumber,
          MaritalStatus_Id: Number(data.MaritalStatus_Id),
          Gender_Id: Number(data.Gender_Id),
          Email: data.Email,
          Password: "",
          IsForcePasswordChange: 0,
          Role_Id: Number(data.Role_Id),
          LoginName: data.LoginName,
          isDisabled: 0,
          Photo: "",
          UpdatedBy: username,
          zoneAccess: allZoneAccess.map(zone => ({
            zone_code: "Kalaburagi", // Hardcoded as requested
            circle_code: zone.circle_code,
            div_code: zone.div_code,
            sd_code: zone.sd_code,
            so_code: zone.so_code
          }))
        };

        console.log('Sending payload with all zoneAccess:', payload);
        const resp = await updateMeterMangeUserDetails(payload);
        console.log('Received response:', resp);
        
        if (resp && resp.status === 'success') {
          setResponse(resp.message);
          setSuccessModal(true);
          getOnLoadingData();
          toggleModal();
        } else {
          setResponse(resp?.message || 'Failed to update user');
          setErrorModal(true);
        }
        
      } catch (error) {
        console.error('Catch block error:', error);
        setResponse('Failed to save user information');
        setErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const passwordFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: '',
      confirmPassword: '',
      User_Id: selectedUser?.User_Id || ''
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
    }),

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const payload = {
          flagId: 3,
          User_Id: values.User_Id,
          newPassword: values.password,
          requestUserName: username
        };

        const resp = await updateManageUserPassword(payload);

        if (resp.status === 'success') {
          setResponse(resp.message);
          setSuccessModal(true);
          toggleModal();
          passwordFormik.resetForm();
        } else {
          setResponse(resp.message || 'Failed to update password');
          setErrorModal(true);
        }
      } catch (error) {
        console.error('Password update error:', error);
        setResponse(error.response?.data?.message || 'Failed to update password');
        setErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const blockUnblockFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      User_Id: selectedUser?.User_Id || '',
      isDisabled: selectedUser?.isDisabled || false,
    },

    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const payload = {
          flagId: 4,
          User_Id: values.User_Id,
          isDisabled: values.isDisabled ? 1 : 0,
          requestUserName: username
        };

        const resp = await updateMeterMangeUserDetails(payload);

        if (resp.status === 'success') {
          setResponse(resp.message);
          setSuccessModal(true);
          toggleModal();
          getOnLoadingData();
        } else {
          setResponse(resp.message || 'Failed to update user status');
          setErrorModal(true);
        }
      } catch (error) {
        console.error('Status update error:', error);
        setResponse(error.response?.data?.message || 'Failed to update user status');
        setErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const toggleModal = () => {
    if (modal) {
      setEditMode(false);
      setSelectedUser(null);
      validation.resetForm();
      passwordFormik.resetForm();
      blockUnblockFormik.resetForm();
      setActiveTab('userInfo');
      setPasswordStrength(0);
      setAllZoneAccess([]);
      // Reset temp dropdowns and their options
      setTempCircle('');
      setTempDivision('');
      setTempSubDivision('');
      setTempSectionOffice('');
      setDivisionName([]);
      setSubDivisionName([]);
      setSectionOfficeName([]);
    }
    setModal(!modal);
  };

  const handleEditClick = async (user) => {
    console.log('Selected user for edit:', user);
    setSelectedUser(user);
    setEditMode(true);
    setAllZoneAccess(user.zoneAccess || []);
    setModal(true);
  };

  // Table configuration
  const columns = useMemo(
    () => [
      { header: 'Login Name', accessorKey: 'LoginName', key: 'LoginName', sortable: true },
      { header: 'First Name', accessorKey: 'FirstName', key: 'FirstName', sortable: true },
      { header: 'Middle Name', accessorKey: 'middleName', key: 'middleName', sortable: true },
      { header: 'Last Name', accessorKey: 'LastName', key: 'LastName', sortable: true },
      { header: 'Gender', accessorKey: 'genderName', key: 'genderName', sortable: true },
      { header: 'Contact No', accessorKey: 'PhoneNumber', key: 'PhoneNumber', sortable: true },
      { header: 'Email Address', accessorKey: 'Email', key: 'Email', sortable: true },
      { header: 'Role', accessorKey: 'RoleName', key: 'RoleName', sortable: true },
      { 
        header: 'Division', 
        accessorKey: 'division', 
        key: 'division', 
        sortable: true
      },
      { 
        header: 'Sub Division', 
        accessorKey: 'sub_division', 
        key: 'sub_division', 
        sortable: true
      },
      { 
        header: 'Section Office', 
        accessorKey: 'section_office', 
        key: 'section_office', 
        sortable: true
      },
      {
        header: 'Status',
        accessorKey: 'isDisabled',
        key: 'isDisabled',
        sortable: true,
        cell: (row) => row.isDisabled === 0
          ? <span className="badge bg-success-subtle text-success">ACTIVE</span>
          : <span className="badge bg-danger-subtle text-danger">INACTIVE</span>
      },
      {
        header: 'Action',
        accessorKey: 'User_Id',
        key: 'action',
        sortable: false,
        cell: (row) => (
          <Button
            color="primary"
            size="sm"
            className="edit-item-btn"
            onClick={() => handleEditClick(row)}
          >
            <i className="ri-edit-2-line"></i>
          </Button>
        )
      }
    ], []
  );

  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.key) return data;
    return sortData(data, sortConfig.key, sortConfig.direction);
  }, [data, sortConfig]);

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
        const active = sortConfig && sortConfig.key === col.key;
        let direction = (active && sortConfig) ? sortConfig.direction : 'asc';
        return (
          <th
            key={col.key || idx}
            onClick={() => {
              if (!col.sortable) return;
              if (!sortConfig || sortConfig.key !== col.key) {
                setSortConfig({ key: col.key, direction: 'asc' });
              } else if (sortConfig.direction === 'asc') {
                setSortConfig({ key: col.key, direction: 'desc' });
              } else if (sortConfig.direction === 'desc') {
                setSortConfig(null);
              }
              setPage(0);
            }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              paddingRight: 14,
              verticalAlign: "middle",
              transition: 'background 0.2s',
            }}
          >
            {col.header}
            <SortArrows active={!!active} direction={direction} />
          </th>
        );
      })}
    </tr>
  );

  const renderTableRows = () => {
    if (paginatedData.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>
            No data found
          </td>
        </tr>
      );
    }
    return paginatedData.map((row, rowIndex) => {
      return (
        <tr key={row.User_Id || rowIndex}>
            {columns.map(col => {
                if (col.key === 'action' || col.key === 'isDisabled') {
                    return null; // Handled separately below
                }
                const cellData = col.accessorKey.split('.').reduce((o, i) => o ? o[i] : null, row);
                return <td key={col.key}>{cellData || '-'}</td>;
            })}
          <td>
            {row.isDisabled === 0 ? (
              <span className="badge bg-success-subtle text-success">ACTIVE</span>
            ) : (
              <span className="badge bg-danger-subtle text-danger">INACTIVE</span>
            )}
          </td>
          <td>
            <Button
              color="primary"
              size="sm"
              className="edit-item-btn"
              onClick={() => handleEditClick(row)}
            >
              <i className="ri-edit-2-line"></i>
            </Button>
          </td>
        </tr>
      );
    });
  };

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
              Showing{' '}
              <b style={{ color: '#222', fontWeight: 600 }}>
                {pageSize === -1 ? sortedData.length : Math.min(pageSize, sortedData.length - (page * pageSize))}
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

  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
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
      <div className="page-content">
        <Container fluid>
          <BreadCrumb pageTitle="ManageUser" />
          <Card>
            <CardHeader className="bg-primary ">
              <Row className="g-4 align-items-center">
                <Col className="col-sm-auto">
                  <div>
                    <h4 className="mb-sm-0 card-title mb-0 flex-grow-1 text-white">
                      Manage User
                    </h4>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row className="mb-3">
                <Col md={12}>
                  <div className="search-box">
                    <Row className="g-2 align-items-center">
                      <Col md="auto" className="flex-grow-1" style={{ maxWidth: '400px' }}>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, email, contact number, or login name..."
                          value={searchText}
                          onChange={handleSearchInputChange}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col lg={12}>
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
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Container>
      </div>

      {/* User Add/Edit Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg" centered className="custom-modal">
        <ModalHeader toggle={toggleModal} className="bg-primary text-white p-3 rounded-top">
          <h5 className="modal-title mb-0 text-white">{editMode ? 'Update User' : 'Add User'}</h5>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="px-4 pt-3 pb-2 border-bottom">
            <small className="text-muted">
              Please fill mandatory information below. <span className="text-danger">*</span>
            </small>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4 pt-3">
            <div className="d-flex gap-2 border-bottom" style={{ marginBottom: '-1px' }}>
              {tabs.map(tab => (
                <button
                  type="button"
                  className={`btn btn-tab ${activeTab === tab.key ? 'active' : ''}`}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "userInfo" && (
              <Form onSubmit={validation.handleSubmit}>
                <Row>
                  {/* Left Column - Personal Information */}
                  <Col md={6}>
                    <h6 className="mb-3">Personal Information</h6>
                    <Row>
                      <Col md={12}>
                        <FormGroup className="mb-3">
                            <Label className="form-label required">Login Name</Label>
                            <Input
                                name="LoginName"
                                value={validation.values.LoginName}
                                onChange={validation.handleChange}
                                disabled={editMode}
                            />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label className="form-label required">First Name</Label>
                          <Input
                            name="FirstName"
                            value={validation.values.FirstName}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={validation.touched.FirstName && !!validation.errors.FirstName}
                          />
                          <FormFeedback>{validation.errors.FirstName}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label className="form-label">Middle Name</Label>
                          <Input
                            name="middleName"
                            value={validation.values.middleName}
                            onChange={validation.handleChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label className="form-label required">Last Name</Label>
                          <Input
                            name="LastName"
                            value={validation.values.LastName}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={validation.touched.LastName && !!validation.errors.LastName}
                          />
                          <FormFeedback>{validation.errors.LastName}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label className="form-label">Gender</Label>
                          <Input
                            type="select"
                            name="Gender_Id"
                            value={validation.values.Gender_Id}
                            onChange={validation.handleChange}
                          >
                            <option value="">Select Gender</option>
                            {genderName.map(opt => (
                              <option key={opt.genderId} value={opt.genderId}>
                                {opt.genderName}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                            <Label className="form-label">Marital Status</Label>
                            <Input
                                type="select"
                                name="MaritalStatus_Id"
                                value={validation.values.MaritalStatus_Id}
                                onChange={validation.handleChange}
                            >
                                <option value="">Select Marital Status</option>
                                {maritalStatusName.map(opt => (

                                    <option key={opt.maritalStatusId} value={opt.maritalStatusId}>
                                        {opt.maritalStatusCode}
                                    </option>
                                ))}

                            </Input>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label className="form-label">Contact No</Label>
                          <Input
                            name="PhoneNumber"
                            value={validation.values.PhoneNumber}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={validation.touched.PhoneNumber && !!validation.errors.PhoneNumber}
                          />
                          <FormFeedback>{validation.errors.PhoneNumber}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label className="form-label required">Email Address</Label>
                          <Input
                            name="Email"
                            type="email"
                            value={validation.values.Email}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={validation.touched.Email && !!validation.errors.Email}
                          />
                          <FormFeedback>{validation.errors.Email}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label className="form-label">Date of Birth</Label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={
                                validation.values.DateofBirth
                                  ? dayjs(validation.values.DateofBirth)
                                  : null
                              }
                              onChange={(newValue) =>
                                validation.setFieldValue(
                                  'DateofBirth',
                                  newValue ? newValue.format('YYYY-MM-DD') : ''
                                )
                              }
                              disableFuture
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  name="DateofBirth"
                                  size="small"
                                  fullWidth
                                  error={Boolean(validation.errors.DateofBirth && validation.touched.DateofBirth)}
                                  helperText={
                                    validation.touched.DateofBirth && validation.errors.DateofBirth
                                      ? validation.errors.DateofBirth
                                      : ''
                                  }
                                  sx={{
                                    '& .MuiInputBase-root': {
                                      borderRadius: '6px',
                                      fontSize: '0.85rem',
                                      height: '38px',
                                      width: '100%'
                                    },
                                    '& .MuiFormHelperText-root': {
                                      marginLeft: 0
                                    }
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>

                  {/* Right Column - Office Information */}
                  <Col md={6}>
                    <h6 className="mb-3">Office Information</h6>
                    <Row>
                      {/* Role Selection */}
                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label className="form-label required">Role</Label>
                          <Input
                            type="select"
                            name="Role_Id"
                            value={validation.values.Role_Id}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={validation.touched.Role_Id && !!validation.errors.Role_Id}
                          >
                            <option value="">Select Role</option>
                            {roleName.map((opt) => (
                              <option key={opt.Role_Id} value={opt.Role_Id}>
                                {opt.RoleName}
                              </option>
                            ))}
                          </Input>
                          <FormFeedback>{validation.errors.Role_Id}</FormFeedback>
                        </FormGroup>
                      </Col>

                      {/* Zone Access Management */}
                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label className="form-label fw-bold">Location Access Management</Label>
                          
                          {/* Current Zone Access Display */}
                          {allZoneAccess.length > 0 && (
                            <div className="mb-3 p-2" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                              <Label className="mb-2">Current Location Access:</Label>
                              {allZoneAccess.map((zone, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded mb-1 bg-light">
                                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    {zone.circle} → {zone.division} → {zone.sub_division} → {zone.section_office}
                                  </span>
                                  <Button 
                                    color="danger" 
                                    size="sm"
                                    className="btn-icon"
                                    onClick={() => removeZone(index)}
                                    style={{ lineHeight: 1 }}
                                  >
                                    <i className="ri-close-line"></i>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add New Zone Dropdowns (2x2 Layout) */}
                          <Row className="mb-2">
                            <Col md={6} className="mb-2">
                                <Label>Circle</Label>
                                <Input
                                    type="select"
                                    value={tempCircle}
                                    onChange={(e) => handleCircleChange(e.target.value)}
                                >
                                    <option value="">Select Circle</option>
                                    {circles.map(opt => (
                                        <option key={opt.circle_code} value={opt.circle_code}>
                                            {opt.circle}
                                        </option>
                                    ))}
                                </Input>
                            </Col>
                            <Col md={6} className="mb-2">
                                <Label>Division</Label>
                                <Input
                                    type="select"
                                    value={tempDivision}
                                    onChange={(e) => handleDivisionChange(e.target.value)}
                                    disabled={!tempCircle || divisionName.length === 0}
                                >
                                    <option value="">Select Division</option>
                                    {divisionName.map(opt => (
                                        <option key={opt.div_code} value={opt.div_code}>
                                            {opt.division}
                                        </option>
                                    ))}
                                </Input>
                            </Col>
                            <Col md={6} className="mb-2">
                                <Label>Sub Division</Label>
                                <Input
                                    type="select"
                                    value={tempSubDivision}
                                    onChange={(e) => handleSubDivisionChange(e.target.value)}
                                    disabled={!tempDivision || subDivisionName.length === 0}
                                >
                                    <option value="">Select Sub Division</option>
                                    {subDivisionName.map(opt => (
                                        <option key={opt.sd_code} value={opt.sd_code}>
                                            {opt.sub_division}
                                        </option>
                                    ))}
                                </Input>
                            </Col>
                            <Col md={6} className="mb-2">
                                <Label>Section Office</Label>
                                <Input
                                    type="select"
                                    value={tempSectionOffice}
                                    onChange={(e) => setTempSectionOffice(e.target.value)}
                                    disabled={!tempSubDivision || sectionOfficeName.length === 0}
                                >
                                    <option value="">Select Section Office</option>
                                    {sectionOfficeName.map(opt => (
                                        <option key={opt.so_code} value={opt.so_code}>
                                            {opt.section_office}
                                        </option>
                                    ))}
                                </Input>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                                <Button 
                                    color="primary" 
                                    outline
                                    size="sm"
                                    onClick={addZone}
                                    disabled={!tempCircle || !tempDivision || !tempSubDivision || !tempSectionOffice}
                                >
                                    + Add Location
                                </Button>
                            </Col>
                          </Row>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>

                </Row>

                <ModalFooter className="border-top p-3">
                  <Button color="light" onClick={toggleModal} className="px-4">
                    Close
                  </Button>
                   <Button color="primary" type='submit' className="px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editMode ? 'Update' : 'Save')}
                  </Button>
                </ModalFooter>
              </Form>
            )}

            {activeTab === "password" && (
              <Form onSubmit={passwordFormik.handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup className="mb-3">
                      <Label className="form-label required">Password</Label>
                      <div className="position-relative">
                        <Input
                          name="password"
                          type={showNew ? 'text' : 'password'}
                          className={`form-control pe-5 ${passwordFormik.touched.password && passwordFormik.errors.password ? 'is-invalid' : ''
                            }`}
                          placeholder="Enter new password"
                          onChange={(e) => {
                            passwordFormik.handleChange(e);
                            setPasswordStrength(getPasswordStrength(e.target.value));
                          }}
                          onBlur={passwordFormik.handleBlur}
                          value={passwordFormik.values.password}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-0 mt-1 me-1 text-decoration-none text-muted"
                          onClick={toggleNew}
                        >
                          <i className={`mdi ${showNew ? 'mdi-eye-off' : 'mdi-eye'}`}></i>
                        </button>
                        <FormFeedback type="invalid">{passwordFormik.errors.password}</FormFeedback>
                      </div>
                      {passwordFormik.values.password && (
                        <div className="mt-2">
                          <div className="progress bg-soft-success" style={{ height: '5px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            Password strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength - 1] || ''}
                          </small>
                        </div>
                      )}
                    </FormGroup>
                    </Col>
                    <Col md={6}>
                    <FormGroup className="mb-3">
                      <Label className="form-label required">Confirm Password</Label>
                      <div className="position-relative">
                        <Input
                          name="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          className={`form-control pe-5 ${passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'is-invalid' : ''
                            }`}
                          placeholder="Confirm new password"
                          onChange={passwordFormik.handleChange}
                          onBlur={passwordFormik.handleBlur}
                          value={passwordFormik.values.confirmPassword}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-0 mt-1 me-1 text-decoration-none text-muted"
                          onClick={toggleConfirm}
                        >
                          <i className={`mdi ${showConfirm ? 'mdi-eye-off' : 'mdi-eye'}`}></i>
                        </button>
                        <FormFeedback type="invalid">{passwordFormik.errors.confirmPassword}</FormFeedback>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <ModalFooter className="border-top p-3">
                  <Button color="light" onClick={toggleModal} className="px-4">
                    Close
                  </Button>
                  <Button color="primary" type="submit" className="px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                  </Button>
                </ModalFooter>
              </Form>
            )}

            {activeTab === "block/unblock" && (
              <Form onSubmit={blockUnblockFormik.handleSubmit}>
                <Row>
                  <Col md={6}>
                    <FormGroup className="mb-4">
                      <Label className="form-label">User Status</Label>
                      <div className="d-flex align-items-center">
                        <div className="form-check form-switch form-switch-lg me-3">
                          <Input
                            type="checkbox"
                            name="isDisabled"
                            className="form-check-input"
                            checked={!blockUnblockFormik.values.isDisabled}
                            onChange={e => blockUnblockFormik.setFieldValue('isDisabled', !e.target.checked)}
                          />
                        </div>
                        <Label className={`badge text-uppercase ${!blockUnblockFormik.values.isDisabled
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                          }`}>
                          {!blockUnblockFormik.values.isDisabled ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                      <small className="text-muted d-block mt-1">
                        Toggle to {blockUnblockFormik.values.isDisabled ? 'activate' : 'deactivate'} this user account
                      </small>
                    </FormGroup>
                  </Col>
                </Row>
                <ModalFooter className="border-top p-3">
                  <Button color="light" onClick={toggleModal} className="px-4">
                    Close
                  </Button>
                  <Button 
                    color="primary" 
                    type="submit" 
                    className="px-4" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Status'}
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </div>
        </ModalBody>

        {/* Custom CSS */}
        <style jsx>{`
          .custom-modal .modal-content {
            border: none;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }
          .btn-tab {
            border: none;
            background: transparent;
            color: #6c757d;
            font-weight: 500;
            padding: 0.75rem 1.5rem;
            border-radius: 0.25rem 0.25rem 0 0;
            transition: all 0.2s;
            position: relative;
            display: flex;
            align-items: center;
            font-size: 0.875rem;
          }
          .btn-tab:hover {
            color: #495057;
          }
          .btn-tab.active {
            color: #405189;
            background: transparent;
            border-bottom: 2px solid #405189;
          }
          .form-label.required:after {
            content: ' *';
            color: #dc3545;
          }
          .form-switch-lg .form-check-input {
            width: 3rem;
            height: 1.5rem;
          }
        `}</style>
      </Modal>
    </React.Fragment>
  );
};

export default ManageUser;