import React, { useState, useEffect, useMemo, useRef } from "react";
import { useFormik } from "formik";
import {
  Button, Card, CardBody, CardHeader, Col, Container, Row, Label, Input, Table,
  Modal, ModalHeader, ModalBody, ModalFooter, Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import { FiMinus, FiPlus, FiX, FiEdit, FiChevronUp, FiChevronDown, FiMaximize, FiDownload } from "react-icons/fi";
import classnames from "classnames";
import Select from "react-select";
import { useNavigate } from "react-router-dom"
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getMisReportDpdwns, postVmsManagement, forWordCloseSubmit, getVmsConsumerPhoto } from "../../helpers/fakebackend_helper"
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal'
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"
// import "../VMSManagement/vms.css"




const VMSManagement = () => {

  const navigate = useNavigate()
  // State for UI controls
  const [showTable, setShowTable] = useState(false);
  const [selectedRRNo, setSelectedRRNo] = useState(null);
  const [selectedReview, setSelectedReview] = useState([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedConsumerId, setSelectedConsumerId] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [response, setResponse] = useState('');
  const [vmsImages, setVmsImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [vmsImageModal, setVmsImageModal] = useState(false); // For image preview
  const [isDragging, setIsDragging] = useState(false);



  const [minimized, setMinimized] = useState({
    combinedTable: false,
    rrnoTable: false,
    monthYearTable: false
  });

  const [activeSection, setActiveSection] = useState('');
  const toggleSection = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
  };

  const [editableDescription, setEditableDescription] = useState('');

  // Update non-editable description when selectedRRNo changes
  useEffect(() => {
    if (selectedRRNo?.description) {
      setEditableDescription(selectedRRNo.description);
    } else {
      setEditableDescription('');
    }

  }, [selectedRRNo]);

  const [viewStatusModal, setViewStatusModal] = useState(false);
  const [rrNoModal, setRrNoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoom, setZoom] = useState(1);
  // const [filterValuess, setFilterValues] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupByError, setGroupByError] = useState("");
  const [orderByError, setOrderByError] = useState("");
  const [consumerInfo, setConsumerInfo] = useState([])
  const [consumerId, setConsumerId] = useState(null);
  const [dynamicKey, setDynamicKey] = useState("");
  const [page, setPage] = useState(0);           // Starts from 0 (Frontend pagination)
  const [pageSize, setPageSize] = useState(10);  // Default rows per page
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentLoadingPage, setCurrentLoadingPage] = useState(null);
  const imageContainerRef = useRef(null);




  const [statusHistorySortConfig, setStatusHistorySortConfig] = useState({
    key: 'processStartedOn',
    direction: 'asc'
  });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = selectedImage || selectedRRNo?.meterImageUrl || '';
    link.download = 'meter-image.jpg';
    link.click();
  };

  // Forward/Close tab controls
  const [activeTab, setActiveTab] = useState('1');
  const [forwardCloseTab, setForwardCloseTab] = useState('forward');

  // Forward form data
  const [forwardForm, setForwardForm] = useState({
    roleName: '',
    userName: '',
    priority: '',
    flowDescription: ''
  });

  // Close form data
  const [closeForm, setCloseForm] = useState({
    closeReasonName: '',
    closedDescription: '',
    priority: ''
  });


  const handleDateChange = (newValue, field) => {
    if (field === 'fromDate') {
      setFromDate(newValue);

      // Reset toDate if it's outside the new month
      if (toDate) {
        const fromMonth = dayjs(newValue).month();
        const toMonth = dayjs(toDate).month();
        const fromYear = dayjs(newValue).year();
        const toYear = dayjs(toDate).year();

        if (fromMonth !== toMonth || fromYear !== toYear) {
          setToDate(null);  // Clear toDate if it's outside the new month
        }
      }
    } else if (field === 'toDate') {
      setToDate(newValue);
    }
  };


  useEffect(() => {
    if (rrNoModal) {
      setActiveSection(null);  // Reset Forward/Close section visibility
      setForwardForm({
        userName: "",
        priority: "",
        flowDescription: ""
      });
      setCloseForm({
        priority: "",
        closedDescription: ""
      });
    }
  }, [rrNoModal]);



  const handleSubmit = async (e, initialPageSize = 10) => {
    e.preventDefault();
    let hasError = false;

    // Validate required fields
    if (!locationType) {
      setLocationTypeError('LocationTypeName is required');
      hasError = true;
    } else {
      setLocationTypeError("")
    }
    if (!groupBy) {
      setGroupByError("Please select GroupBy");
      hasError = true;
    } else {
      setGroupByError("");
    }

    if (!orderBy) {
      setOrderByError("Please select OrderBy");
      hasError = true;
    } else {
      setOrderByError("");
    }

    if (hasError) {
      return;
    }

    const payload = {
      flagId: 1,
      userId: userId,
      locationTypeId: Number(locationType),
      locationId: Number(selectedLocationId),
      groupFilterConditionId: Number(groupBy),
      orderFilterConditionId: Number(orderBy),
      filterConditionIds: JSON.stringify(
        filterConditions
          .filter(cond => cond.type && cond.value && cond.value.length > 0)
          .map(cond => ({
            GroupOrderFilterConditionID: Number(cond.type),
            GroupOrderFilterConditionValue: cond.value.join(",")
          }))
      ),
      consumerId: 0,
      fromDate: fromDate,
      toDate: toDate,
      reviewStatusId: Number(formData.reviewStatus),
      reviewUserId: Number(formData.assignedFrom),
      priorityId: Number(formData.priority),
      pageNo: 1,                // Always start with page 1 for initial load
      rowsPerPage: initialPageSize, // Use the initial page size
      thresholdValue: formData.thresholdValue,
      isDisabled: false,
      requestUserName: userName
    };

    try {
      setIsLoading(true);
      setShowTable(false); // Hide table until data is loaded
      setPage(0); // Reset to first page

      // Make API call
      const response = await postVmsManagement(payload);

      // Handle successful response
      if (response.status === "success" && response.code === "000") {
        console.log("Data submitted successfully:", response.data);

        // Don't sort the data - maintain database order
        setConsumerInfo(response.data);
        const keys = Object.keys(response.data[0]);
        const preferredKey = keys.find(k => /name|code$/i.test(k)) || keys[0];

        setDynamicKey(preferredKey || "");
        if (response.data.length > 0) {
          setConsumerId(response.data[0].ConsumerID);
        }

        setShowTable(true);
        const total = response.totalRecords || response.data[0]?.TotalRecordCount || response.data.length;
        setTotalRecords(total);
        setPageSize(initialPageSize); // Set the initial page size

      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified handlePageChange function
  const handlePageChange = async (newPage, newPageSize = pageSize) => {
    // Ensure newPage is within valid bounds
    const calculatedPageCount = Math.ceil(totalRecords / newPageSize);
    newPage = Math.max(0, Math.min(newPage, calculatedPageCount - 1));

    const payload = {
      flagId: 1,
      userId: userId,
      locationTypeId: Number(locationType),
      locationId: Number(selectedLocationId),
      groupFilterConditionId: Number(groupBy),
      orderFilterConditionId: Number(orderBy),
      filterConditionIds: JSON.stringify(
        filterConditions
          .filter(cond => cond.type && cond.value && cond.value.length > 0)
          .map(cond => ({
            GroupOrderFilterConditionID: Number(cond.type),
            GroupOrderFilterConditionValue: cond.value.join(",")
          }))
      ),
      consumerId: 0,
      fromDate: fromDate,
      toDate: toDate,
      reviewStatusId: Number(formData.reviewStatus),
      reviewUserId: Number(formData.assignedFrom),
      priorityId: Number(formData.priority),
      pageNo: newPage + 1, // Convert to 1-based for backend
      rowsPerPage: newPageSize,
      thresholdValue: formData.thresholdValue,
      isDisabled: false,
      requestUserName: userName
    };

    try {
      setIsLoading(true);
      const response = await postVmsManagement(payload);

      if (response.status === "success" && response.code === "000") {
        // Maintain database order - don't sort
        setConsumerInfo(response.data);
        setPage(newPage); // Update the page state only after successful API call
        const total = response.totalRecords || response.data[0]?.TotalRecordCount || response.data.length;
        setTotalRecords(total);

        if (newPageSize !== pageSize) {
          setPageSize(newPageSize); // Update page size if changed
        }
      } else {
        throw new Error(response.data.message || 'Fetch failed');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPagination = () => {
    const pageSizeOptions = [
      { value: 10, label: '10' },
      { value: 20, label: '20' },
      { value: 30, label: '30' },
      { value: 40, label: '40' },
      { value: 50, label: '50' },
    ];

    // Calculate total pages based on total records and current page size
    const calculatedPageCount = Math.ceil(totalRecords / pageSize);

    // Always show Previous, current page numbers, and Next buttons
    // Show up to 3 page numbers at a time
    let startPage = Math.max(0, page - 1);
    let endPage = Math.min(page + 1, calculatedPageCount - 1);

    if (page === 0 && calculatedPageCount > 2) {
      endPage = 2;
    } else if (page === calculatedPageCount - 1 && calculatedPageCount > 2) {
      startPage = calculatedPageCount - 3;
    }

    return (
      <div style={{ margin: '18px 0 12px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}>
          {/* Left: Showing Results & Page Size */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ color: '#748391', fontSize: 15, marginBottom: 2 }}>
              Showing{' '}
              <b style={{ color: '#222', fontWeight: 600 }}>
                {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalRecords)}
              </b>{' '}
              of <b>{totalRecords}</b> Results
            </span>
            <select
              value={pageSize}
              onChange={async (e) => {
                const newSize = parseInt(e.target.value, 10);
                await handlePageChange(0, newSize); // Reset to first page with new size
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
              disabled={isLoading}
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
            {/* Previous Button */}
            <button
              type="button"
              className="btn btn-light"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || isLoading}
              style={{ minWidth: 80 }}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
              const pageNum = startPage + index;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn ${page === pageNum ? 'btn-primary active' : 'btn-light'}`}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={page === pageNum || isLoading}
                  style={{ minWidth: 36 }}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              type="button"
              className="btn btn-light"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= calculatedPageCount - 1 || isLoading}
              style={{ minWidth: 80 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };


  const handleViewReview = async (consumerId) => {
    try {

      const res10 = await postVmsManagement({
        flagId: 2,
        consumerId: Number(consumerId),
        fromDate: fromDate,
        toDate: toDate,
        isDisabled: false,
        requestUserName: userName
      });

      if (res10?.data?.length > 0) {
        setSelectedReview(res10.data);
      } else {
        setSelectedReview(null);
      }
      setReviewModal(true);

    } catch (error) {
      console.error("Error fetching review details:", error.message);
      setSelectedReview(null);
      setReviewModal(true);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "reviewStatus") {
      setSelectedReviewStatusId(Number(value));
    }
  };


  const [groupBy, setGroupBy] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [filterConditions, setFilterConditions] = useState([]);
  const [locationTypeError, setLocationTypeError] = useState('');
  const [filterAddError, setFilterAddError] = useState('');
  const [showMaxFilterMessage, setShowMaxFilterMessage] = useState(false);

  //api useState here
  const [locationTypeName, setLocationTypeName] = useState([])
  const [months, setMonths] = useState([])
  const [locationType, setLocationType] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [locationName, setLocationName] = useState([]);
  const [groupOrderGUIDisplayName, setGroupOrderGUIDisplayName] = useState([])
  const [filterFieldMap, setFilterFieldMap] = useState({});
  const [filterValues, setFilterValues] = useState({});
  const [priorityName, setPriorityName] = useState([])
  const [reviewStatusName, setReviewStatusName] = useState([])
  const [userNames, setUserNames] = useState([])
  const [userName, setUserName] = useState([])
  const [userId, setUserId] = useState(0)
  const [closeReviewStatusName, setCloseReviewStatusName] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [formData, setFormData] = useState({
    priority: '',
    reviewStatus: '',
    assignedFrom: '',
    thresholdValue: '',
    fromDate: null,
    toDate: null
  });
  const [selectedReviewStatusId, setSelectedReviewStatusId] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });



  // api call here
  const fetchMangeUserDetails = async (
    flagId,
    setState,
    requestUserName,
    locationId = null,
    locationTypeId = null,
    groupOrderFilterConditionId = null,
    misReportGroupName = null
  ) => {
    try {
      const response = await getMisReportDpdwns({ flagId, requestUserName, locationId, locationTypeId, groupOrderFilterConditionId, misReportGroupName });

      const options = response?.data || [];
      console.log(`Options for flagId ${flagId}:`, options);
      setState(options);
    } catch (error) {
      console.error(`Error fetching data for flagId ${flagId}:`, error.message);
    }
  };


  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    const userId = obj.user.userId
    const loctionId = obj.user.locationId

    fetchMangeUserDetails(1, setLocationTypeName, usernm);
    fetchMangeUserDetails(7, setMonths, usernm);
    fetchMangeUserDetails(8, setPriorityName, usernm);
    fetchMangeUserDetails(10, setReviewStatusName, usernm);     //this is for the forword and close for the same flagId ok 
    fetchMangeUserDetails(11, setCloseReviewStatusName, usernm);
    fetchMangeUserDetails(9, setUserNames, usernm, loctionId);

    setUserName(usernm)
    setUserId(userId)

  }, []);


  //locationTypechange here collects the id and fecth the locationName
  const handleLocationTypeChange = async (e) => {
    const selectedType = e.target.value;
    setLocationType(selectedType);
    setSelectedLocationId(""); // Reset location dropdown
    setGroupBy(""); // Reset groupBy
    setOrderBy(""); // Reset orderBy
    setGroupOrderGUIDisplayName([]); // Clear existing options
    setLocationName([]);
    setLocationTypeError("");   // Clear existing locations

    if (!selectedType) return;

    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj.user.loginName;

      const response = await getMisReportDpdwns({
        flagId: 2,
        requestUserName: usernm,
        locationTypeId: Number(selectedType),
      });

      const locations = response?.data || [];
      setLocationName(locations);

      if (locations.length === 1) {
        setSelectedLocationId(locations[0].locationId); // Auto-select if only one
      }

      await fetchMangeUserDetails(3, setGroupOrderGUIDisplayName, usernm, null, selectedType);
    } catch (error) {
      console.error("Error fetching locations or group/order:", error.message);
    }
  };



  const fetchFilterValues = async (conditionId) => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj.user.loginName;
      const response = await getMisReportDpdwns({
        flagId: 4,
        requestUserName: usernm,
        groupOrderFilterConditionId: Number(conditionId)
      });

      const data = response?.data || [];

      if (data.length > 0) {
        const sample = data[0];
        const keys = Object.keys(sample);

        // Assuming the shortest key is the ID, and longest is the label (better naming helps!)
        const valueKey = keys.find(k => /id$/i.test(k)) || keys[0];
        const labelKey = keys.find(k => /name|code$/i.test(k)) || keys[1] || keys[0];

        setFilterFieldMap(prev => ({
          ...prev,
          [conditionId]: { valueKey, labelKey }
        }));

        setFilterValues(prev => ({
          ...prev,
          [conditionId]: data
        }));
      }

      return data;
    } catch (error) {
      console.error("Error fetching filter values:", error.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchValuesForAllConditions = async () => {
      const newFilterValues = [];

      for (const condition of filterConditions) {
        if (condition.type) {
          const values = await fetchFilterValues(condition.type);
          newFilterValues[condition.type] = values;
        }
      }

      setFilterValues(newFilterValues);
    };

    fetchValuesForAllConditions();
  }, [filterConditions]);

  //up to here


  // Function to add a new filter
  const addFilterCondition = () => {
    if (filterConditions.length >= 3) {
      setShowMaxFilterMessage(true);
      return;
    }

    setShowMaxFilterMessage(false);

    // Prevent adding empty condition if last one is incomplete
    const lastCondition = filterConditions[filterConditions.length - 1];
    if (lastCondition && (!lastCondition.type || lastCondition.value.length === 0)) {
      setFilterAddError("Please select a filter before adding a new filter.");
      return;
    }

    // Add a new empty filter
    setFilterConditions([...filterConditions, { type: '', value: [] }]);
    setFilterAddError('');
  };

  // Remove filter
  const removeFilterCondition = (index) => {
    const updated = [...filterConditions];
    updated.splice(index, 1);
    setFilterConditions(updated);
    setFilterAddError('');
    setShowMaxFilterMessage(false);
  };

  // OnChange for filter type
  const handleFilterTypeChange = (e, index) => {
    const updated = [...filterConditions];
    updated[index].type = e.target.value;
    updated[index].value = [];
    setFilterConditions(updated);
    setFilterAddError('');
  };



  const SortArrows = ({ active, direction }) => (
    <span className="ms-2">
      {active ? (direction === 'asc' ? '↑' : '↓') : <span style={{ opacity: 0.3 }}>↕</span>}
    </span>
  );

  // Helper functions
  const handleReset = () => {
    // Reset all form state variables
    setLocationType("");
    setSelectedLocationId("");
    setGroupBy("");
    setOrderBy("");
    setFilterConditions([]);
    setShowMaxFilterMessage(false);
    setFilterAddError("");
    setLocationTypeError("");

    // Reset filter options
    setFormData({
      priority: "",
      reviewStatus: "",
      assignedFrom: "",
      thresholdValue: ""
    });

    // Reset date fields
    setFromDate(null);
    setToDate(null);

    // Hide any displayed table
    setShowTable(false);
  };


  const toggleMinimize = (table) => {
    setMinimized(prev => ({ ...prev, [table]: !prev[table] }));
  };

  const toggleClose = (table) => {
    if (table === 'combinedTable') setShowTable(false);
  };

  const toggleRRNoTable = (rrNo) => {
    setSelectedRRNo(consumerInfo.find(consumer => consumer.RRNo === rrNo));
    setRrNoModal(true);
  };

  const handleViewStatus = () => setViewStatusModal(true);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleForwardChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 100) {
      setForwardForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const handleCloseChange = (e) => {
    const { name, value } = e.target;
    setCloseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleForwardCloseTab = (tab) => {
    setForwardCloseTab(tab);
  };



  //this is the forword close submit things
  const handleForwardSubmit = async (e) => {
    e.preventDefault();

    if (!forwardForm.userName || !forwardForm.priority || !forwardForm.flowDescription) {
      alert('Please fill all Forward fields');
      return;
    }

    if (!selectedConsumerId) {
      alert('Consumer ID is missing. Please select a consumer first.');
      return;
    }

    const payload = {
      flagId: 1,
      consumerId: Number(selectedConsumerId),
      priorityId: Number(forwardForm.priority),
      reviewUserId: Number(forwardForm.userName),
      reviewStatusId: Number(forwardForm.reviewStatusId),
      reviewDescription: forwardForm.flowDescription,
      attachment: "",
      fromDate: fromDate,
      toDate: toDate,
      isDisabled: false,
      requestUserName: userName,
    };

    console.log('Forward Payload:', payload);

    try {
      const response = await forWordCloseSubmit(payload);
      const data = response?.data;

      if (data && data.length > 0) {
        const result = data[0];  // Access first item of the array

        if (result.responseStatusCode === '000') {
          setResponse(result.responseStatusCodeGUIDisplay);
          setSuccessModal(true);
          setErrorModal(false);
          handleForwardReset();
          setRrNoModal(false);
        } else {
          setResponse(result.responseStatusCodeGUIDisplay);
          setSuccessModal(false);
          setErrorModal(true);
        }
      } else {
        setResponse('Unexpected response from server.');
        setSuccessModal(false);
        setErrorModal(true);
      }
    } catch (error) {
      console.error('Error submitting forward data:', error.message);
      setResponse('Something went wrong. Please try again.');
      setSuccessModal(false);
      setErrorModal(true);
    }

  };



  const handleForwardReset = () => {
    setForwardForm({
      userName: '',
      priority: '',
      flowDescription: '',
    });
  };



  const handleCloseSubmit = async (e) => {
    e.preventDefault();

    if (!closeForm.priority || !closeForm.closedDescription) {
      alert('Please fill all Close fields');
      return;
    }

    if (!selectedConsumerId) {
      alert('Consumer ID is missing. Please select a consumer first.');
      return;
    }
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const userId = obj.user.userId

    const payload = {
      flagId: 1,
      consumerId: Number(selectedConsumerId),
      priorityId: Number(closeForm.priority),
      reviewUserId: userId,
      reviewStatusId: Number(closeForm.reviewStatusId),
      reviewDescription: closeForm.closedDescription,
      attachment: "",
      fromDate: fromDate,
      toDate: toDate,
      isDisabled: false,
      requestUserName: userName,
    };

    console.log('Close Payload:', payload);

    try {
      const response = await forWordCloseSubmit(payload);
      const data = response?.data;

      if (data && data.length > 0) {
        const result = data[0];

        if (result.responseStatusCode === '000') {
          setResponse(result.responseStatusCodeGUIDisplay);
          setSuccessModal(true);
          setErrorModal(false);
          handleCloseReset();
          setRrNoModal(false);
        } else {
          setResponse(result.responseStatusCodeGUIDisplay);
          setSuccessModal(false);
          setErrorModal(true);
        }
      } else {
        setResponse('Unexpected response from server.');
        setSuccessModal(false);
        setErrorModal(true);
      }
    } catch (error) {
      console.error('Error submitting close data:', error.message);
      setResponse('Something went wrong. Please try again.');
      setSuccessModal(false);
      setErrorModal(true);
    }
  };


  const handleCloseReset = () => {
    setCloseForm({
      priority: '',
      closedDescription: '',
    });
  };

  //document title it is

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const menuPage = JSON.parse(obj?.user?.menuPage || "[]");
    const applicationCode = obj?.user?.applicationCode;
    const currentPath = window.location.pathname;

    const currentPageLabel = findLabelByLink(menuPage, currentPath) || "Page";

    document.title = `${currentPageLabel} | ${applicationCode}`;
  }, []);



  const pageSizeOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 30, label: '30' },
    { value: 40, label: '40' },
    { value: 50, label: '50' },
  ];


  const [readingSortConfig, setReadingSortConfig] = useState({
    key: null,
    direction: 'asc',
    type: null // 'vendor' or 'vigilance'
  });

  // Sorting handler
  const handleReadingSort = (key, type) => {
    setReadingSortConfig(prev => {
      // If clicking the same key, toggle direction
      if (prev.key === key && prev.type === type) {
        return {
          ...prev,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // New sort column
      return {
        key,
        direction: 'asc',
        type
      };
    });
  };


  //    const [sortConfig, setSortConfig] = useState({
  //   statusHistory: { key: null, direction: null }
  // });

  const requestSort = (table, key) => {
    let direction = 'asc';
    if (sortConfig[table]?.key === key && sortConfig[table].direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig(prev => ({
      ...prev,
      [table]: { key, direction }
    }));
  };

  // const getSortedData = (data, table) => {
  //   if (!sortConfig[table]?.key) return data;

  //   return [...data].sort((a, b) => {
  //     if (a[sortConfig[table].key] < b[sortConfig[table].key]) {
  //       return sortConfig[table].direction === 'asc' ? -1 : 1;
  //     }
  //     if (a[sortConfig[table].key] > b[sortConfig[table].key]) {
  //       return sortConfig[table].direction === 'asc' ? 1 : -1;
  //     }
  //     return 0;
  //   });
  // };


  const PhotoView = (consumerID) => {

    console.log(consumerID, "it is consumerIDdddd")
    if (!consumerId) {
      console.error("Consumer ID is missing!");
      return;
    }

    const params = {
      flagId: 3,  // Assuming this flag fetches all images for that bill
      consumerId: Number(consumerID),
      // billNo: 202504000000101,
      fromDate: fromDate,
      toDate: toDate,
      requestUserName: userName
    };

    getVmsConsumerPhoto(params)
      .then(res => {
        if (res?.data?.length > 0) {
          const imageUrls = res.data
            .filter(item => item?.Photo?.data)
            .map(item => {
              const byteArray = new Uint8Array(item.Photo.data);
              const blob = new Blob([byteArray], { type: "image/png" }); // Adjust type if jpeg
              return URL.createObjectURL(blob);
            });

          if (imageUrls.length > 0) {
            setVmsImages(imageUrls);
            setCurrentImageIndex(0);
            setScale(1);
            setVmsImageModal(true);
          } else {
            setResponse("No valid images found");
            setErrorModal(true);
          }
        } else {
          setResponse("No images found");
          setErrorModal(true);
        }
      })
      .catch(err => {
        console.error("Photo fetch error:", err.message);
        setResponse(err.message || "Error fetching images");
        setErrorModal(true);
      });
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX,
        y: e.clientY
      });
      setScrollPos({
        left: imageContainerRef.current.scrollLeft,
        top: imageContainerRef.current.scrollTop
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      imageContainerRef.current.scrollLeft = scrollPos.left - dx;
      imageContainerRef.current.scrollTop = scrollPos.top - dy;
    }
  };


  const downloadImage = async (imageUrl, filename) => {
    try {
      // Fetch the image with CORS mode
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();

      // Create object URL from blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'image.jpg';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback to direct download if blob method fails
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // const requestSort = (key, type) => {
  //   let direction = 'ascending';
  //   if (sortConfig.key === key && sortConfig.direction === 'ascending') {
  //     direction = 'descending';
  //   }
  //   setSortConfig({ key, direction, type });
  // };

  // Sorting utility
  const sortedConsumerInfo = useMemo(() => {
    if (!sortConfig.key) return consumerInfo;

    return [...consumerInfo].sort((a, b) => {
      // Handle numeric fields differently
      const numericFields = ['KWHFR', 'KWHIR', 'PF', 'BMD', 'VendorKWHFR', 'vendorKWHIR', 'VendorPF', 'VendorBMD'];
      const isNumeric = numericFields.includes(sortConfig.key);

      let aValue, bValue;

      // Handle reading-specific fields
      if (sortConfig.type === 'reading') {
        if (sortConfig.key === 'KWHFR') {
          aValue = sortConfig.direction === 'ascending' ? a.VendorKWHFR : a.KWHFR;
          bValue = sortConfig.direction === 'ascending' ? b.VendorKWHFR : b.KWHFR;
        } else if (sortConfig.key === 'BillIssueDate') {
          aValue = sortConfig.direction === 'ascending' ? a.vendorBillIssueDate : a.billIssueDate;
          bValue = sortConfig.direction === 'ascending' ? b.vendorBillIssueDate : b.billIssueDate;
        } else if (sortConfig.key === 'BillingReason') {
          aValue = sortConfig.direction === 'ascending' ? a.vendorBillingReason : a.vigilanceBillingReason;
          bValue = sortConfig.direction === 'ascending' ? b.vendorBillingReason : b.vigilanceBillingReason;
        }
      } else {
        // Regular consumer fields
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (isNumeric) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // For string comparison
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [consumerInfo, sortConfig]);



  const getSortedData = (data, table) => {
    if (!sortConfig[table]?.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig[table].key] < b[sortConfig[table].key]) {
        return sortConfig[table].direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig[table].key] > b[sortConfig[table].key]) {
        return sortConfig[table].direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };


  return (
    <div className="page-content">
      <Container fluid>
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
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="bg-primary text-white p-3">
                <Row className="g-4 align-items-center">
                  <Col className="d-flex align-items-center">
                    <h4 className="mb-0 card-title text-white">VMS Management</h4>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Container fluid>
                  <form onSubmit={(e) => handleSubmit(e, 10)}>
                    <Row>
                      <Col md={5}>
                        <Card className="h-100">
                          <CardHeader className="bg-primary text-white p-3">
                            <Row className="g-4 align-items-center">
                              <Col className="d-flex align-items-center">
                                <h4 className="mb-0 card-title text-white">Office and FilterCondtion</h4>
                              </Col>
                            </Row>
                          </CardHeader>
                          <span className="text-muted mb-1 ms-3 mt-2">
                            Please fill mandatory information below<span className="text-danger">*</span>
                          </span>
                          <CardBody className="p-3">
                            {/* LocationTypeName and LocationName side by side */}
                            <Row className="mb-3">
                              <Col md={6}>
                                <Label className="form-label">LocationTypeName <span className='text-danger'>*</span></Label>
                                <div className="position-relative">
                                  <Input
                                    type="select"
                                    value={locationType}
                                    onChange={handleLocationTypeChange}
                                    className="form-select"
                                  >
                                    <option value="">Select LocationTypeName</option>
                                    {locationTypeName
                                      .slice()
                                      .sort((a, b) => a.locationTypeId - b.locationTypeId)
                                      .map((item) => (
                                        <option key={item.locationTypeId} value={item.locationTypeId}>
                                          {item.locationTypeName}
                                        </option>
                                      ))}
                                  </Input>

                                  {locationTypeError && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                                      {locationTypeError}
                                    </div>
                                  )}


                                  <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                                    <i className="bi bi-chevron-down"></i>
                                  </span>
                                </div>
                              </Col>

                              <Col md={6}>
                                <Label className="form-label">LocationName <span className='text-danger'>*</span></Label>
                                <div className="position-relative">
                                  <Input
                                    type="select"
                                    className="form-select"
                                    disabled={!locationType}
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value)}
                                  >
                                    <option value="">
                                      {locationName.length === 1
                                        ? "Select LocationName"
                                        : "Select LocationName"}
                                    </option>
                                    {locationName.map((item) => (
                                      <option key={item.locationId} value={item.locationId}>
                                        {item.locationName}
                                      </option>
                                    ))}
                                  </Input>
                                  <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                                    <i className="bi bi-chevron-down"></i>
                                  </span>
                                </div>
                              </Col>
                            </Row>

                            {/* GroupBy and OrderBy side by side */}
                            <Row className="mb-3">
                              <Col md={6}>
                                <Label className="form-label">
                                  GroupBy <span className="text-danger">*</span>
                                </Label>
                                <div className="position-relative">
                                  <Input
                                    type="select"
                                    value={groupBy}
                                    onChange={(e) => {
                                      setGroupBy(e.target.value);
                                      setOrderBy("");
                                      setGroupByError(""); // Clear error on change
                                    }}
                                    className="form-select"
                                    disabled={!locationType}
                                  >
                                    <option value="">Select GroupBy</option>
                                    {groupOrderGUIDisplayName.map((item) => (
                                      <option
                                        key={item.groupOrderFilterConditionId}
                                        value={item.groupOrderFilterConditionId}
                                      >
                                        {item.GroupOrderGUIDisplayName}
                                      </option>
                                    ))}
                                  </Input>

                                  {groupByError && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                                      {groupByError}
                                    </div>
                                  )}

                                  <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                                    <i className="bi bi-chevron-down"></i>
                                  </span>
                                </div>
                              </Col>

                              <Col md={6}>
                                <Label className="form-label">
                                  OrderBy <span className="text-danger">*</span>
                                </Label>
                                <div className="position-relative">
                                  <Input
                                    type="select"
                                    value={orderBy}
                                    onChange={(e) => {
                                      setOrderBy(e.target.value);
                                      setOrderByError(""); // Clear error on change
                                    }}
                                    className="form-select"
                                    disabled={!groupBy || !locationType}
                                  >
                                    <option value="">
                                      {groupBy ? "Select OrderBy" : "Select OrderBy"}
                                    </option>
                                    {groupOrderGUIDisplayName
                                      .filter(
                                        (item) =>
                                          item.groupOrderFilterConditionId.toString() !==
                                          groupBy.toString()
                                      )
                                      .map((item) => (
                                        <option
                                          key={item.groupOrderFilterConditionId}
                                          value={item.groupOrderFilterConditionId}
                                        >
                                          {item.GroupOrderGUIDisplayName}
                                        </option>
                                      ))}
                                  </Input>

                                  {orderByError && (
                                    <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                                      {orderByError}
                                    </div>
                                  )}

                                  <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                                    <i className="bi bi-chevron-down"></i>
                                  </span>
                                </div>
                              </Col>
                            </Row>


                            {/* Filter Conditions Section */}
                            {locationType && selectedLocationId && groupBy && orderBy && (
                              <Row>
                                <Col md={12}>
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <Label className="form-label mb-0">
                                      <strong>FilterCondition</strong>
                                    </Label>
                                    <Button
                                      color="primary"
                                      size="sm"
                                      onClick={addFilterCondition}
                                      disabled={filterConditions.length >= 3 || !locationType}
                                    >
                                      +Add
                                    </Button>
                                  </div>
                                  {showMaxFilterMessage && (
                                    <div className="text-danger mb-2" style={{ fontSize: '0.85rem' }}>
                                      * Maximum 3 filters allowed
                                    </div>
                                  )}
                                </Col>

                                <Col md={12}>
                                  {filterConditions.map((condition, index) => (
                                    <div
                                      key={index}
                                      className="d-flex mb-2 align-items-center justify-content-between flex-wrap flex-md-nowrap"
                                      style={{ gap: '10px' }}
                                    >
                                      {/* Filter Type Dropdown */}
                                      <div className="d-flex flex-column position-relative" style={{ flex: 1, minWidth: '200px' }}>
                                        <div className="position-relative">
                                          <Input
                                            type="select"
                                            className="form-select"
                                            value={condition.type}
                                            onChange={(e) => handleFilterTypeChange(e, index)}
                                            disabled={!locationType}
                                          >
                                            <option value="">SelectFilterType</option>
                                            {groupOrderGUIDisplayName
                                              .filter(item =>
                                                !filterConditions.some((fc, i) =>
                                                  i !== index && fc.type === item.groupOrderFilterConditionId.toString()
                                                )
                                              )
                                              .map((item) => (
                                                <option key={item.groupOrderFilterConditionId} value={item.groupOrderFilterConditionId}>
                                                  {item.GroupOrderGUIDisplayName}
                                                </option>
                                              ))}
                                          </Input>
                                          <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                                            <i className="bi bi-chevron-down"></i>
                                          </span>
                                        </div>

                                        <div style={{ height: '1px' }}>
                                          {index === filterConditions.length - 1 && filterAddError && (
                                            <div className="text-danger" style={{ fontSize: '0.85rem' }}>
                                              {filterAddError}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Filter Values (Multi-Select) */}
                                      <div className="position-relative" style={{ flex: 1, minWidth: '200px' }}>
                                        <Select
                                          isMulti
                                          isClearable
                                          classNamePrefix="select"
                                          isSearchable={false}
                                          placeholder="Select FilterValue"
                                          options={
                                            condition.type && filterValues[condition.type]
                                              ? filterValues[condition.type].map(item => {
                                                const keys = filterFieldMap[condition.type];
                                                return {
                                                  value: item?.[keys?.valueKey],
                                                  label: item?.[keys?.labelKey],
                                                };
                                              })
                                              : []
                                          }
                                          value={(condition.value || [])
                                            .map(val => {
                                              const keys = filterFieldMap[condition.type];
                                              const match = filterValues[condition.type]?.find(
                                                item => item?.[keys?.valueKey] === val
                                              );
                                              return match
                                                ? {
                                                  value: match?.[keys?.valueKey],
                                                  label: match?.[keys?.labelKey],
                                                }
                                                : null;
                                            })
                                            .filter(Boolean)}
                                          onChange={(selectedOptions) => {
                                            const selectedValues = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                                            const updated = [...filterConditions];
                                            updated[index].value = selectedValues;
                                            setFilterConditions(updated);

                                            if (index === filterConditions.length - 1 && selectedValues.length > 0) {
                                              const last = updated[index];
                                              if (last.type) {
                                                setFilterAddError('');
                                              }
                                            }
                                          }}
                                          isDisabled={!condition.type || !locationType}
                                        />
                                      </div>

                                      {/* Remove Button */}
                                      {filterConditions.length > 1 && (
                                        <span
                                          className="text-dark"
                                          onClick={() => removeFilterCondition(index)}
                                          style={{
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            padding: '0 5px',
                                            minWidth: '20px',
                                            textAlign: 'center',
                                            userSelect: 'none',
                                          }}
                                        >
                                          ✘
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </Col>
                              </Row>
                            )}
                          </CardBody>
                        </Card>
                      </Col>

                      {/* Filter Options Card */}
                      <Col md={4}>
                        <Card className="h-100">
                          <CardHeader className="bg-primary text-white p-3">
                            <Row className="g-4 align-items-center">
                              <Col className="d-flex align-items-center">
                                <h4 className="mb-0 card-title text-white">Filter Options</h4>
                              </Col>
                            </Row>
                          </CardHeader>
                          <CardBody className="p-3">

                            {/* PriorityName */}
                            <Row className="align-items-center mb-3">
                              <Col xs={5}>
                                <Label className="mb-1 font-weight-bold" style={{ fontSize: "0.95rem" }}>
                                  PriorityName
                                </Label>
                              </Col>
                              <Col xs={7}>
                                <Input
                                  type="select"
                                  bsSize="md"
                                  name="priority"
                                  value={formData.priority}
                                  onChange={handleInputChange}
                                  style={{ fontSize: "0.95rem" }}
                                >
                                  <option value="">Select</option>
                                  {priorityName
                                    .slice()
                                    .sort((a, b) => a.priorityId - b.priorityId)
                                    .map((item) => (
                                      <option key={item.priorityId} value={item.priorityId}>
                                        {item.priorityName}
                                      </option>
                                    ))}
                                </Input>
                              </Col>
                            </Row>

                            {/* ReviewStatus */}
                            <Row className="align-items-center mb-3">
                              <Col xs={5}>
                                <Label className="mb-1 font-weight-bold" style={{ fontSize: "0.95rem" }}>
                                  ReviewStatus
                                </Label>
                              </Col>
                              <Col xs={7}>
                                <Input
                                  type="select"
                                  bsSize="md"
                                  name="reviewStatus"
                                  value={formData.reviewStatus}
                                  onChange={handleInputChange}
                                  style={{ fontSize: "0.95rem" }}
                                >
                                  <option value="">Select</option>
                                  {reviewStatusName
                                    .slice()
                                    .sort((a, b) => a.reviewStatusId - b.reviewStatusId)
                                    .map((item) => (
                                      <option key={item.reviewStatusId} value={item.reviewStatusId}>
                                        {item.reviewStatusName}
                                      </option>
                                    ))}
                                </Input>
                              </Col>
                            </Row>


                            {/* AssignedFrom */}
                            <Row className="align-items-center mb-3">
                              <Col xs={5}>
                                <Label className="mb-1 font-weight-bold" style={{ fontSize: "0.95rem" }}>
                                  AssignedFrom
                                </Label>
                              </Col>
                              <Col xs={7}>
                                <Input
                                  type="select"
                                  bsSize="md"
                                  name="assignedFrom"
                                  value={formData.assignedFrom}
                                  onChange={handleInputChange}
                                  style={{ fontSize: "0.95rem" }}
                                >
                                  <option value="">Select</option>
                                  {userNames.map((el) => (
                                    <option key={el.userId} value={el.userId}>
                                      {el.userName}
                                    </option>
                                  ))}
                                </Input>
                              </Col>
                            </Row>

                          </CardBody>

                        </Card>
                      </Col>

                      <Col md={3}>
                        <Card className="h-100">
                          <CardHeader className="bg-primary text-white p-3">
                            <Row className="g-4 align-items-center">
                              <Col className="d-flex align-items-center">
                                <h4 className="mb-0 card-title text-white">MonthCondition</h4>
                              </Col>
                            </Row>
                          </CardHeader>
                          <CardBody className="p-3">
                            <Row className="align-items-center mb-3">
                              <Col xs={5} className="pe-0">
                                <Label className="mb-1 font-weight-bold" style={{ fontSize: '0.95rem' }}>ThresholdValue</Label>
                              </Col>
                              <Col xs={7}>
                                <Input
                                  type="text"
                                  bsSize="md"
                                  name="thresholdValue"
                                  value={formData.thresholdValue}
                                  onChange={handleInputChange}
                                  style={{ fontSize: '0.95rem' }}
                                  placeholder="Enter threshold value"
                                />
                              </Col>
                            </Row>
                            <Row className="align-items-center mb-3">
                              <Col xs={5}>
                                <Label className="mb-1 font-weight-bold" style={{ fontSize: '0.95rem' }}>
                                  FromDate
                                </Label>
                              </Col>
                              <Col xs={7}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    views={['year', 'month', 'day']}
                                    value={fromDate ? dayjs(fromDate) : null}
                                    onChange={(newValue) => {
                                      const formatted = newValue ? dayjs(newValue).format('YYYY-MM-DD') : '';
                                      setFromDate(formatted);

                                      // Reset ToDate if it's outside new month
                                      if (toDate) {
                                        const toMonth = dayjs(toDate).month();
                                        const toYear = dayjs(toDate).year();
                                        const newMonth = dayjs(newValue).month();
                                        const newYear = dayjs(newValue).year();

                                        if (toMonth !== newMonth || toYear !== newYear) {
                                          setToDate('');
                                        }
                                      }
                                    }}
                                    format="YYYY-MM-DD"
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                  />
                                </LocalizationProvider>
                              </Col>
                            </Row>

                            <Row className="align-items-center mb-3">
                              <Col xs={5}>
                                <Label className="mb-1 font-weight-bold" style={{ fontSize: '0.95rem' }}>
                                  ToDate
                                </Label>
                              </Col>
                              <Col xs={7}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <DatePicker
                                    views={['year', 'month', 'day']}
                                    value={toDate ? dayjs(toDate) : null}
                                    onChange={(newValue) => {
                                      const formatted = newValue ? dayjs(newValue).format('YYYY-MM-DD') : '';
                                      setToDate(formatted);
                                    }}
                                    minDate={fromDate ? dayjs(fromDate) : undefined}
                                    maxDate={fromDate ? dayjs(fromDate).endOf('month') : undefined}
                                    format="YYYY-MM-DD"
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    disabled={!fromDate}
                                  />
                                </LocalizationProvider>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col xs={12}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap">
                                  <Button
                                    color="primary"
                                    type="submit"
                                    style={{ fontSize: '0.9rem' }}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? 'Loading...' : 'Show'}
                                  </Button>

                                  <Button
                                    color="danger"
                                    type="button"
                                    onClick={handleReset}
                                    style={{ fontSize: '0.9rem' }}
                                  >
                                    Reset
                                  </Button>

                                  <Button
                                    color="secondary"
                                    type="button"
                                    onClick={() => navigate("/dashboard")}
                                    style={{ fontSize: '0.9rem' }}
                                  >
                                    Close
                                  </Button>
                                </div>
                              </Col>
                            </Row>

                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </form>



                  <div>
                    {showTable && (
                      <>
                        <Row className="mt-3">
                          <Col md={12}>
                            <Card className="mb-2">
                              <div
                                style={{
                                  height: '4px',
                                  background: 'linear-gradient(to right, rgb(61, 168, 57), rgb(66, 148, 70))',
                                  borderRadius: '4px 4px 0 0',
                                }}
                              ></div>
                              <CardHeader className="py-2 px-2 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 text-dark">Consumer Information</h6>
                                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                  <Button color="link" className="p-0" onClick={() => toggleMinimize('combinedTable')}>
                                    {minimized.combinedTable ? <FiPlus size={14} /> : <FiMinus size={14} />}
                                  </Button>
                                  <Button color="link" className="p-0" onClick={() => toggleClose('combinedTable')}>
                                    <FiX size={14} />
                                  </Button>
                                </div>
                              </CardHeader>

                              {!minimized.combinedTable && (
                                <CardBody className="p-0">
                                  <div style={{
                                    position: 'relative',
                                    maxHeight: 'calc(100vh - 300px)',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#888 #f1f1f1',
                                  }}>
                                    <style>
                                      {`
                                          .custom-scroll::-webkit-scrollbar {
                                                      width: 6px;
                                                      height: 6px;
                                                    }
                                                    .custom-scroll::-webkit-scrollbar-track {
                                                      background: #f1f1f1;
                                                    }
                                                    .custom-scroll::-webkit-scrollbar-thumb {
                                                      background: #888;
                                                      border-radius: 3px;
                                                    }
                                                    .custom-scroll::-webkit-scrollbar-thumb:hover {
                                                      background: #555;
                                                    }
                                                  `}
                                    </style>

                                    {/* Main Table with both header and content */}
                                    <Table bordered className="mb-0 custom-scroll" style={{
                                      width: '150%',
                                      // tableLayout: 'fixed',
                                      marginBottom: 0,

                                    }}>
                                      <thead className="text-center" style={{
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 3,
                                        background: '#1d84c3',
                                        color: 'white',
                                        boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)'
                                      }}>
                                        <tr>
                                          <th colSpan="6" className="text-white py-2 px-2" style={{ fontSize: '0.75rem' }}>
                                            Consumer
                                          </th>
                                          <th colSpan="7" className="text-white py-2 px-2" style={{ fontSize: '0.75rem' }}>
                                            Reading Information
                                          </th>
                                          <th colSpan="6" className="text-white py-2 px-2" style={{ fontSize: '0.75rem' }}>
                                            Review Information
                                          </th>
                                        </tr>
                                        <tr>
                                          <th style={{ fontSize: '0.75rem', width: '50px' }}>
                                            Action
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '100px' }}
                                            onClick={() => requestSort('AreaName', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              AreaName
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'AreaName' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'AreaName' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '100px' }}
                                            onClick={() => requestSort('AccountNo', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              AccountID
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'AccountNo' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'AccountNo' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '100px' }}
                                            onClick={() => requestSort('RRNo', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              RRNo
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'RRNo' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'RRNo' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '150px' }}
                                            onClick={() => requestSort('CustomerName', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              CustomerName
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'CustomerName' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'CustomerName' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '200px' }}
                                            onClick={() => requestSort('Address', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              Address
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'Address' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'Address' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th style={{ fontSize: '0.75rem', width: '100px' }}>
                                            Reading From
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '80px' }}
                                            onClick={() => requestSort('KWHFR', 'reading')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              KWHFR
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'KWHFR' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'KWHFR' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '80px' }}
                                            onClick={() => requestSort('KWHIR', 'reading')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              KWHIR
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'KWHIR' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'KWHIR' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '60px' }}
                                            onClick={() => requestSort('PF', 'reading')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              PF
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'PF' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'PF' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '80px' }}
                                            onClick={() => requestSort('BMD', 'reading')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              BMD
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'BMD' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'BMD' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '120px' }}
                                            onClick={() => requestSort('BillingReason', 'reading')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              BillingReason
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'BillingReason' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'BillingReason' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '100px' }}
                                            onClick={() => requestSort('BillIssueDate', 'reading')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              BillIssueDate
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'BillIssueDate' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'BillIssueDate' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '100px' }}
                                            onClick={() => requestSort('ReviewedBy', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              ReviewedBy
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'ReviewedBy' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'ReviewedBy' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '100px' }}
                                            onClick={() => requestSort('ReviewedOn', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              ReviewedOn
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'ReviewedOn' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'ReviewedOn' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th style={{ fontSize: '0.75rem', width: '150px' }}>
                                            Description
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '80px' }}
                                            onClick={() => requestSort('PriorityName', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              Priority
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'PriorityName' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'PriorityName' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th
                                            style={{ fontSize: '0.75rem', cursor: 'pointer', width: '80px' }}
                                            onClick={() => requestSort('ReviewStatusName', 'consumer')}
                                          >
                                            <div className="d-flex justify-content-between align-items-center">
                                              Status
                                              <div className="d-flex flex-column ml-1">
                                                <FiChevronUp
                                                  size={12}
                                                  color={sortConfig.key === 'ReviewStatusName' && sortConfig.direction === 'ascending' ? 'white' : '#aaaaaa'}
                                                />
                                                <FiChevronDown
                                                  size={12}
                                                  color={sortConfig.key === 'ReviewStatusName' && sortConfig.direction === 'descending' ? 'white' : '#aaaaaa'}
                                                />
                                              </div>
                                            </div>
                                          </th>
                                          <th style={{ fontSize: '0.75rem', width: '80px' }}>
                                            ViewStatus
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sortedConsumerInfo.map((consumer, index) => (
                                          <React.Fragment key={index}>
                                            <tr>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '50px' }}>
                                                <Button
                                                  color="link"
                                                  size="sm"
                                                  className="p-0"
                                                  onClick={() => {
                                                    setSelectedConsumerId(consumer.ConsumerID);
                                                    toggleRRNoTable(consumer.RRNo);
                                                  }}
                                                >
                                                  <FiEdit size={14} />
                                                </Button>
                                              </td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '100px' }}>{consumer.AreaName}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '100px' }}>{consumer.AccountNo}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '100px' }}>{consumer.RRNo}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '150px' }}>{consumer.CustomerName}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '200px' }}>{consumer.Address}</td>
                                              <td className="text-start align-middle" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1d84c3', width: '100px' }}>
                                                Vendor
                                              </td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d84c3', width: '80px' }}>{consumer.VendorKWHFR}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d84c3', width: '80px' }}>{consumer.vendorKWHIR}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d84c3', width: '60px' }}>{consumer.VendorPF}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d84c3', width: '80px' }}>{consumer.VendorBMD}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d84c3', width: '120px' }}>{consumer.VendorMeterReadingReasonName}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d84c3', width: '100px' }}>{consumer.vendorBillIssueDate}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '100px' }}>{consumer.ReviewedBy}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '100px' }}>{consumer.ReviewedOn}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ padding: '0.25rem', width: '150px' }}>
                                                <div style={{ maxWidth: '100%' }}>
                                                  <textarea
                                                    readOnly
                                                    value={consumer.ReviewDescription || 'N/A'}
                                                    style={{
                                                      display: 'block',
                                                      maxHeight: '60px',
                                                      minWidth:"100px",
                                                      overflowY: 'auto',
                                                      width: '80%',
                                                      fontSize: '0.75rem',
                                                      whiteSpace: 'pre-wrap',
                                                      wordWrap: 'break-word',
                                                      border: '1px solid #ced4da',
                                                      borderRadius: '4px',
                                                      padding: '4px',
                                                      backgroundColor: '#f8f9fa',
                                                      resize: 'both',
                                                    }}
                                                    className="custom-scroll"
                                                  />
                                                </div>
                                              </td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '80px' }}>{consumer.PriorityName}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '80px' }}>{consumer.ReviewStatusName}</td>
                                              <td className="text-center align-middle" rowSpan="2" style={{ fontSize: '0.75rem', width: '80px' }}>
                                                <Button color="info" size="sm" className="p-1" onClick={() => handleViewReview(consumer.ConsumerID)} style={{ minWidth: '40px' }}>
                                                  View
                                                </Button>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td className="text-start align-middle" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#d35400', width: '100px' }}>
                                                Vigilance
                                              </td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', width: '80px' }}>{consumer.KWHFR}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', width: '80px' }}>{consumer.vigilanceKWHIR}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', width: '60px' }}>{consumer.PF}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', width: '80px' }}>{consumer.BMD}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', width: '120px' }}>{consumer.MeterReadingReasonName}</td>
                                              <td className="text-center align-middle" style={{ fontSize: '0.75rem', width: '100px' }}>{consumer.billIssueDate}</td>
                                            </tr>
                                          </React.Fragment>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </div>
                                </CardBody>
                              )}
                            </Card>
                          </Col>
                          {renderPagination()}
                        </Row>
                      </>
                    )}
                  </div>
                </Container>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>



      {/* view status model it is */}
      <Modal
        isOpen={reviewModal}
        toggle={() => setReviewModal(false)}
        centered
        size="xl"
        className="custom-wide-modal"
        contentClassName="rounded-modal"
      >
        <ModalHeader
          toggle={() => setReviewModal(false)}
          className="py-3 px-3 bg-primary text-white"
          style={{ borderBottom: '1px solid #dee2e6' }}
        >
          <h6 className="mb-0 text-white">VMSStatus</h6>
        </ModalHeader>

        <ModalBody className="p-3" style={{ overflow: 'hidden' }}>
          {selectedReview && selectedReview.length > 0 ? (
            <div
              style={{
                width: '100%',
                maxHeight: '320px',
                overflowY: selectedReview.length > 8 ? 'auto' : 'visible',
                border: '1px solid #dee2e6'
              }}
              className="custom-scroll"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gridAutoRows: 'minmax(40px, auto)'
                }}
              >
                {/* Sticky Header with Sorting */}
                {['ReviewedOn', 'ReviewedBy', 'ReviewStatusName', 'ReviewDescription', 'Attachment', 'PriorityName'].map(
                  (header, i) => (
                    <div
                      key={`header-${i}`}
                      className="text-center py-2 px-2"
                      style={{
                        fontSize: '0.8rem',
                        backgroundColor: '#1d84c3',
                        color: 'white',
                        borderRight: i < 5 ? '1px solid #dee2e6' : 'none',
                        borderBottom: '1px solid #dee2e6',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        cursor: 'pointer'
                      }}
                      onClick={() => requestSort('statusHistory', header)}
                    >
                      <div className="d-flex justify-content-center align-items-center">
                        {header}
                        <span className="ms-1 d-flex flex-column">
                          <FiChevronUp
                            size={14}
                            style={{
                              color: sortConfig.statusHistory?.key === header &&
                                sortConfig.statusHistory?.direction === 'asc' ? 'white' : 'rgba(255,255,255,0.5)',
                              marginBottom: '-3px'
                            }}
                          />
                          <FiChevronDown
                            size={14}
                            style={{
                              color: sortConfig.statusHistory?.key === header &&
                                sortConfig.statusHistory?.direction === 'desc' ? 'white' : 'rgba(255,255,255,0.5)',
                              marginTop: '-3px'
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  )
                )}

                {/* Data Rows - Using getSortedData */}
                {getSortedData(selectedReview, 'statusHistory').map((review, index) =>
                  ['ReviewedOn', 'ReviewedBy', 'ReviewStatusName', 'ReviewDescription', 'Attachment', 'PriorityName'].map(
                    (field, i) => (
                      <div
                        key={`cell-${index}-${i}`}
                        className="text-center py-2 px-2"
                        style={{
                          fontSize: '0.8rem',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                          borderRight: i < 5 ? '1px solid #dee2e6' : 'none',
                          borderBottom: '1px solid #dee2e6',
                          overflow: 'hidden',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {field === 'ReviewDescription' ? (
                          <textarea
                            readOnly
                            value={review.ReviewDescription || 'N/A'}
                            style={{
                              width: '95%',
                              minHeight: '60px',
                              maxHeight: '80px',
                              resize: 'both',
                              fontSize: '0.75rem',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              padding: '4px',
                              backgroundColor: '#f8f9fa',
                              overflow: 'auto'
                            }}
                            className="custom-scroll"
                          />
                        ) : (
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '95%'
                            }}
                            title={review[field] || 'null'}
                          >
                            {review[field] || 'null'}
                          </div>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          ) : (
            <p>No review details available.</p>
          )}
        </ModalBody>

        <ModalFooter className="py-2 px-3">
          <Button
            color="danger"
            size="sm"
            onClick={() => setReviewModal(false)}
            style={{ minWidth: '80px' }}
          >
            Close
          </Button>
        </ModalFooter>

        {/* Thin scrollbar styles */}
        <style>
          {`
      .custom-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .custom-scroll {
        scrollbar-width: thin;
      }
    `}
        </style>
      </Modal>




      {/* froword and close model it is*/}
      <Modal
        isOpen={rrNoModal}
        toggle={() => setRrNoModal(false)}
        centered
        size="lg"
        className="custom-wide-modal"
      >
        <ModalHeader
          toggle={() => setRrNoModal(false)}
          className="bg-primary text-white border-bottom-0 justify-content-center p-2"
        >
          <span className="modal-title text-white">Update ConsumerInformation</span>
        </ModalHeader>

        <ModalBody>
          <div className="status-details container-fluid">
            {/* Consumer Information */}
            <Card className="mb-3">
              <CardHeader>
                <strong className="fs-4">ConsumerInformation</strong>
              </CardHeader>


              <CardBody>
                {/* Row 2 */}
                <Row className="g-0">
                  <Col md={6} className="p-2">
                    <div className="d-flex align-items-start">
                      <strong style={{ minWidth: '130px' }}>CustomerName:</strong>
                      <textarea
                        readOnly
                        value={selectedRRNo?.CustomerName || 'N/A'}
                        style={{
                          width: '250px',
                          maxHeight: '70px',
                          overflowY: 'auto',
                          resize: 'both',
                          whiteSpace: 'pre-wrap',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '4px',
                          backgroundColor: '#f8f9fa',
                          marginLeft: '8px'
                        }}
                      />
                    </div>
                  </Col>

                  <Col md={6} className="p-2">
                    <div className="d-flex align-items-start">
                      <strong style={{ minWidth: '130px' }}>Address:</strong>
                      <textarea
                        readOnly
                        value={selectedRRNo?.Address || 'N/A'}
                        style={{
                          width: '250px',
                          maxHeight: '70px',
                          overflowY: 'auto',
                          resize: 'both',
                          whiteSpace: 'pre-wrap',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          padding: '4px',
                          backgroundColor: '#f8f9fa',
                          marginLeft: '8px'
                        }}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Row 3 */}
                <Row className="g-0">
                  <Col md={6} className="p-2">
                    <div className="d-flex align-items-start">
                      <strong style={{ minWidth: '130px' }}>AccountID:</strong>
                      <div style={{ flex: 1, marginLeft: '8px', wordBreak: 'break-word' }}>
                        {selectedRRNo?.AccountNo || 'N/A'}
                      </div>
                    </div>
                  </Col>

                  <Col md={6} className="p-2">
                    <div className="d-flex align-items-start">
                      <strong style={{ minWidth: '130px' }}>RRNo:</strong>
                      <div style={{ flex: 1, marginLeft: '8px', wordBreak: 'break-word' }}>
                        {selectedRRNo?.RRNo || 'N/A'}
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>


            </Card>

            {/* Reading Info */}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card className="mb-3" style={{ maxWidth: '1000px', width: '100%' }}>
                <CardHeader className="fw-bold text-center">ReadingInformation</CardHeader>
                <CardBody>
                  <div className="d-flex justify-content-center">
                    <table className="table table-bordered table-sm" style={{ tableLayout: 'auto' }}>
                      <thead className="text-center" style={{ backgroundColor: '#1d84c3', color: 'white' }}>
                        <tr>
                          <th colSpan="3" className="text-center">VendorReading</th>
                          <th colSpan="3" className="text-center">VigilanceReading</th>
                          <th colSpan="2" className="text-center">MeterStatus</th>
                        </tr>
                        <tr>
                          {['KWHFR', 'BillIssueDate', 'BillingReason'].map((key) => (
                            <th key={key} onClick={() => handleReadingSort(key, 'vendor')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <div className="d-flex align-items-center justify-content-center">
                                {key === 'KWHFR' ? 'KWHFR' : key === 'BillingReason' ? 'Reason' : key}
                                <span className="ms-2 d-flex flex-column">
                                  <FiChevronUp
                                    size={14}
                                    style={{
                                      color: readingSortConfig.type === 'vendor' && readingSortConfig.key === key && readingSortConfig.direction === 'asc' ? 'white' : 'rgba(255,255,255,0.5)',
                                      marginBottom: '-4px'
                                    }}
                                  />
                                  <FiChevronDown
                                    size={14}
                                    style={{
                                      color: readingSortConfig.type === 'vendor' && readingSortConfig.key === key && readingSortConfig.direction === 'desc' ? 'white' : 'rgba(255,255,255,0.5)',
                                      marginTop: '-4px'
                                    }}
                                  />
                                </span>
                              </div>
                            </th>
                          ))}

                          {['KWHFR', 'BillIssueDate', 'BillingReason'].map((key) => (
                            <th key={`vig-${key}`} onClick={() => handleReadingSort(key, 'vigilance')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <div className="d-flex align-items-center justify-content-center">
                                {key === 'KWHFR' ? 'KWHFR' : key === 'BillingReason' ? 'Reason' : key}
                                <span className="ms-2 d-flex flex-column">
                                  <FiChevronUp
                                    size={14}
                                    style={{
                                      color: readingSortConfig.type === 'vigilance' && readingSortConfig.key === key && readingSortConfig.direction === 'asc' ? 'white' : 'rgba(255,255,255,0.5)',
                                      marginBottom: '-4px'
                                    }}
                                  />
                                  <FiChevronDown
                                    size={14}
                                    style={{
                                      color: readingSortConfig.type === 'vigilance' && readingSortConfig.key === key && readingSortConfig.direction === 'desc' ? 'white' : 'rgba(255,255,255,0.5)',
                                      marginTop: '-4px'
                                    }}
                                  />
                                </span>
                              </div>
                            </th>
                          ))}

                          <th style={{ whiteSpace: 'nowrap' }}>Location</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Action</th>
                          {/* <th style={{ whiteSpace: 'nowrap' }}>vvvvv</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-center text-nowrap">{selectedRRNo?.VendorKWHFR || 'N/A'}</td>
                          <td className="text-center text-nowrap">{selectedRRNo?.vendorBillIssueDate || 'N/A'}</td>
                          <td className="text-center text-nowrap">{selectedRRNo?.VendorMeterReadingReasonName || 'N/A'}</td>
                          <td className="text-center text-nowrap">{selectedRRNo?.KWHFR || 'N/A'}</td>
                          <td className="text-center text-nowrap">{selectedRRNo?.billIssueDate || 'N/A'}</td>
                          <td className="text-center text-nowrap">{selectedRRNo?.vigilanceBillingReason || 'N/A'}</td>
                          <td className="text-center text-nowrap">{selectedRRNo?.MeterLocationName || 'N/A'}</td>
                          {/* <td className="text-center text-nowrap">{selectedRRNo?.ConsumerID || 'N/A'}ddddddddd</td> */}
                          <td className="text-center">
                            <Button size="sm" color="info" onClick={() => PhotoView(selectedRRNo?.ConsumerID)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>




            {/* Forward/Close Section */}
            <Card className="mb-3">
              <CardHeader className="fw-bold">
                <div className="d-flex gap-4">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={activeSection === 'forward'}
                      onChange={() => toggleSection('forward')}
                    />{' '}
                    Forward
                  </Label>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={activeSection === 'close'}
                      onChange={() => toggleSection('close')}
                    />{' '}
                    Close
                  </Label>
                </div>
              </CardHeader>

              {/* FORWARD SECTION */}
              {activeSection === 'forward' && (
                <CardBody>
                  <form onSubmit={handleForwardSubmit} onReset={handleForwardReset}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Label>UserName</Label>
                        <Input
                          type="select"
                          name="userName"
                          value={forwardForm.userName}
                          onChange={handleForwardChange}
                        >
                          <option value="">Select</option>
                          {userNames.map((el) => (
                            <option key={el.userId} value={el.userId}>
                              {el.userName}
                            </option>
                          ))}
                        </Input>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Label>ForwardReasonName</Label>
                        <Input
                          type="select"
                          name="reviewStatusId"
                          value={forwardForm.reviewStatusId}
                          onChange={handleForwardChange}
                        >
                          <option value="">Select</option>
                          {reviewStatusName
                            .slice()
                            .sort((a, b) => a.reviewStatusId - b.reviewStatusId)
                            .map((item) => (
                              <option key={item.reviewStatusId} value={item.reviewStatusId}>
                                {item.reviewStatusName}
                              </option>
                            ))}
                        </Input>
                      </Col>
                    </Row>



                    <Row className="mb-3">
                      <Col md={6}>
                        <Label>Priority</Label>
                        <Input
                          type="select"
                          name="priority"
                          value={forwardForm.priority}
                          onChange={handleForwardChange}
                        >
                          <option value="">Select</option>
                          {priorityName
                            .slice()
                            .sort((a, b) => a.priorityId - b.priorityId)
                            .map((item) => (
                              <option key={item.priorityId} value={item.priorityId}>
                                {item.priorityName}
                              </option>
                            ))}
                        </Input>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Label>Forward Description</Label>
                        <Input
                          type="textarea"
                          name="flowDescription"
                          maxLength={100}
                          value={forwardForm.flowDescription}
                          onChange={handleForwardChange}
                          rows="4"
                        // style={{ width: '70%' }}
                        />
                        <small className="text-muted">Max 100 characters</small>
                      </Col>
                    </Row>

                    <Row>
                      <Col className="text-end">
                        <Button type="submit" color="primary" className="me-2">
                          Submit
                        </Button>
                        <Button type="reset" color="secondary" className="me-2">
                          Reset
                        </Button>
                        <Button color="danger" onClick={() => setActiveSection(null)}>
                          Close
                        </Button>
                      </Col>
                    </Row>

                  </form>
                </CardBody>
              )}

              {/* CLOSE SECTION */}
              {activeSection === 'close' && (
                <CardBody>
                  <form onSubmit={handleCloseSubmit} onReset={handleCloseReset}>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Label>ClosedReasonName</Label>
                        <Input
                          type="select"
                          name="reviewStatusId"
                          value={closeForm.reviewStatusId}
                          onChange={handleCloseChange}
                        >
                          <option value="">Select</option>
                          {closeReviewStatusName
                            .slice()
                            .sort((a, b) => a.reviewStatusId - b.reviewStatusId)
                            .map((item) => (
                              <option key={item.reviewStatusId} value={item.reviewStatusId}>
                                {item.reviewStatusName}
                              </option>
                            ))}
                        </Input>
                      </Col>
                    </Row>


                    <Row className="mb-3">
                      <Col md={6}>
                        <Label>Priority</Label>
                        <Input
                          type="select"
                          name="priority"
                          value={closeForm.priority}
                          onChange={handleCloseChange}
                        >
                          <option value="">Select</option>
                          {priorityName
                            .slice()
                            .sort((a, b) => a.priorityId - b.priorityId)
                            .map((item) => (
                              <option key={item.priorityId} value={item.priorityId}>
                                {item.priorityName}
                              </option>
                            ))}
                        </Input>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Label>Closed Description</Label>
                        <Input
                          type="textarea"
                          name="closedDescription"
                          maxLength={100}
                          value={closeForm.closedDescription}
                          onChange={handleCloseChange}
                          rows="4"
                        />
                        <small className="text-muted">Max 100 characters</small>
                      </Col>
                    </Row>

                    <Row>
                      <Col className="text-end">
                        <Button type="submit" color="primary" className="me-2">
                          Submit
                        </Button>
                        <Button type="reset" color="secondary" className="me-2">
                          Reset
                        </Button>
                        <Button color="danger" onClick={() => setActiveSection(null)}>
                          Close
                        </Button>
                      </Col>
                    </Row>
                  </form>
                </CardBody>
              )}
            </Card>


          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" onClick={() => setRrNoModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Image Popup Modal */}
      <Modal isOpen={vmsImageModal} toggle={() => setVmsImageModal(false)} size="lg" centered>
        <ModalHeader className="bg-primary text-white p-3" toggle={() => setVmsImageModal(false)}>
          <span className="modal-title text-white">BillNo PhotoPreview</span>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="row g-0">
            {/* Thumbnail sidebar */}
            <div className="col-md-2 p-1" style={{
              backgroundColor: '#f8f9fa',
              borderRight: '1px solid #dee2e6',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}>
              <div className="d-flex flex-column gap-1 align-items-center">
                {vmsImages.map((img, index) => (
                  <div
                    key={index}
                    className={`p-1 ${currentImageIndex === index ? 'border-primary' : 'border-light'} border rounded`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: currentImageIndex === index ? '#e7f1ff' : 'white',
                      width: '80px',
                      height: '80px'
                    }}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setScale(1);
                      if (imageContainerRef.current) {
                        imageContainerRef.current.scrollLeft = 0;
                        imageContainerRef.current.scrollTop = 0;
                      }
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${index + 1}`}
                      className="img-fluid h-100 w-100 object-fit-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Main image view */}
            <div className="col-md-10">
              <div className="d-flex flex-column" style={{ height: '70vh' }}>
                <div className="flex-grow-1 position-relative">
                  {/* Image container with panning */}
                  <div
                    ref={imageContainerRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'auto',
                      cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '20px'
                    }}>
                      <img
                        src={vmsImages[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1}`}
                        style={{
                          transform: `scale(${scale})`,
                          transition: 'transform 0.2s ease-out',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          cursor: scale === 1 ? 'zoom-in' : 'zoom-out',
                          transformOrigin: 'center center',
                          userSelect: 'none'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setScale(prev => prev === 1 ? 1.5 : 1);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* Footer with horizontal zoom controls and status */}
        <div className="d-flex justify-content-between align-items-center p-2 border-top">
          <div className="text-muted small ms-2">
            Image {currentImageIndex + 1} of {vmsImages.length} | Zoom: {Math.round(scale * 100)}%
          </div>

          <div className="d-flex align-items-center gap-4 me-2">
            {/* Horizontal zoom controls */}
            <div className="d-flex gap-1">
              <Button
                color="light"
                onClick={(e) => {
                  e.stopPropagation();
                  setScale(prev => Math.max(prev - 0.25, 0.5));
                }}
                title="Zoom Out (25%)"
                className="p-1"
                disabled={scale <= 0.5}
              >
                <FiMinus size={18} />
              </Button>
              <Button
                color="light"
                onClick={(e) => {
                  e.stopPropagation();
                  setScale(1);
                  if (imageContainerRef.current) {
                    imageContainerRef.current.scrollLeft = 0;
                    imageContainerRef.current.scrollTop = 0;
                  }
                }}
                title="Reset Zoom"
                className="p-1"
                disabled={scale === 1}
              >
                <FiMaximize size={18} />
              </Button>
              <Button
                color="light"
                onClick={(e) => {
                  e.stopPropagation();
                  setScale(prev => Math.min(prev + 0.25, 3));
                }}
                title="Zoom In (25%)"
                className="p-1"
                disabled={scale >= 3}
              >
                <FiPlus size={18} />
              </Button>

            </div>

            {/* Download button */}
            <Button
              outline
              color="info"
              size="sm"
              onClick={() => downloadImage(vmsImages[currentImageIndex], `meter-image-${currentImageIndex + 1}`)}
              title="Download Image"
              className="p-1 ms-2"
            >
              <FiDownload size={18} />
            </Button>
          </div>
        </div>
      </Modal>



      <ToastContainer />
    </div>
  );
};

export default VMSManagement;

