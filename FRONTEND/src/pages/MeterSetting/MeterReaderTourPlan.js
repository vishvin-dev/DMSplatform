import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter, ModalHeader, Row, Label,
  Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import SuccessModal from '../../Components/Common/SuccessModal';
import ErrorModal from '../../Components/Common/ErrorModal';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import './MeterReadingTourPlan.css'; // External styling
import { getMeterTourDropDowns, getMeterTourPlansDetails, scheduleTourPlan, saveTourPlan } from "../../helpers/fakebackend_helper";
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"
import { GET_TOUR_PLAN_DETAILS } from "../../helpers/url_helper"

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




const MeterReaderTourPlan = () => {
  // CORE STATE
  const [locationTypes, setLocationTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [months, setMonths] = useState([]);
  const [plan, setPlan] = useState({ locationType: '', location: '', month: '', year: '' });
  const [data, setData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

  // MODALS
  const [scheduleModal, setScheduleModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [username, setUserName] = useState('');
  const [vendorMeterReaderName, setVendorMeterReaderName] = useState([])
  const [meterReaderCode, setMeterReaderCode] = useState([])
  const [response, setResponse] = useState('');
  const [viewSatusView, setViewSatusView] = useState([])
  const [viewStatusModal, setViewStatusModal] = useState(false);
  const [statusDetails, setStatusDetails] = useState({});
  const [statusHistory, setStatusHistory] = useState([]);

  // SUCCESS MODAL
  const [successModal, setSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Operation Successful!');
  const [errorModal, setErrorModal] = useState(false);
  const [isScheduleVisible, setScheduleVisible] = useState(false);
  const [readingDay, setReadingDay] = useState([])
  const [selectedReadingDay, setSelectedReadingDay] = useState("");
  // TABLE SORT AND PAGINATION
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const flagIdFunction = async (flagId, setState, requestUserName, locationId, locationTypeId, vendorMeterReaderId, tourPlanId) => {
    try {
      const params = { flagId, requestUserName, locationId, locationTypeId, vendorMeterReaderId, tourPlanId };
      const response = await getMeterTourDropDowns(params);
      const options = response?.data || [];
      setState(options);
    } catch (error) {
      console.error(`Error fetching options for flag ${flagId}:`, error.message);
    }
  };

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;

    flagIdFunction(2, setLocationTypes, usernm, null);

    const loacationID = obj.user.locationId
    flagIdFunction(2, setLocationTypes, usernm, loacationID, null);
    flagIdFunction(4, setMonths, usernm);
    flagIdFunction(6, setVendorMeterReaderName, usernm, loacationID, null)
    flagIdFunction(5, setMeterReaderCode, usernm, loacationID, null);
    setUserName(usernm);
  }, []);

 const handlePlanChange = async (e) => {
    const { name, value } = e.target;
    setPlan((prev) => ({
      ...prev,
      [name]: value,
    }));

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;

    if (name === "locationType") {
      let fetchedLocations = [];

      const tempSetLocations = (options) => {
        setLocations(options);
        fetchedLocations = options;
      };

      await flagIdFunction(3, tempSetLocations, usernm, null, Number(value));

      if (Array.isArray(fetchedLocations)) {
        if (fetchedLocations.length === 1) {
          setPlan((prev) => ({
            ...prev,
            location: fetchedLocations[0].locationId,
            vendorMeterReader: "",
          }));

          // Trigger dependent dropdowns automatically since location auto-selected
          const locationId = fetchedLocations[0].locationId;
          await flagIdFunction(5, setMeterReaderCode, usernm, locationId, null);
          await flagIdFunction(6, setVendorMeterReaderName, usernm, locationId, null);

        } else {
          // Reset location and dependent fields if multiple locations
          setPlan((prev) => ({
            ...prev,
            location: "",
            vendorMeterReader: "",
          }));
        }
      }
    }

    if (name === "location") {
      const locationId = Number(value);
      await flagIdFunction(5, setMeterReaderCode, usernm, locationId, null);
      await flagIdFunction(6, setVendorMeterReaderName, usernm, locationId, null);
    }
};


  // Handle change for vendorMeterReader select
  const handleVendorMeterReaderChange = async (e) => {
    const { value } = e.target;
    formik.setFieldValue("vendorMeterReader", value);

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;

    // Fetch reading day for the selected vendorMeterReaderId using flagId 7
    await flagIdFunction(7, setReadingDay, usernm, null, null, Number(value));

    // Find the selected reader to update UI display if needed
    const selectedReader = vendorMeterReaderName.find(
      (reader) => reader.vendorMeterReaderId.toString() === value
    );
    setSelectedReadingDay(selectedReader?.readingDay || "");
  };

  const showData = async () => {
    try {
      const { locationType, location, month, year } = plan;
      if (!locationType || !location || !month || !year) {
        return;
      }

      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const requestUserName = obj?.user?.loginName || '';

      const payload = {
        flagId: 1,
        locationTypeId: parseInt(locationType),
        locationId: parseInt(location),
        monthId: parseInt(month),
        yearOfBill: year,
        requestUserName
      };
      const response = await getMeterTourPlansDetails(payload);
      const allDetails = response?.data || [];
      setData(allDetails);
      setShowTable(true);
      setScheduleVisible(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // SORTING
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    if (sortConfig.key === "actions") return data;
    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        aVal = Number(aVal);
        bVal = Number(bVal);
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      }
    });
    return sorted;
  }, [data, sortConfig]);

  // PAGINATION
  const actualPageSize = pageSize === -1 ? sortedData.length : pageSize;
  const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize]);

  const resetPlan = () => {
    setPlan({ locationType: '', location: '', month: '', year: '' });
    setShowTable(false);
    setData([]);
    setPage(0);
  }

  const openSchedule = () => {
    setSelectedRow(data[0] || null);
    setScheduleModal(true);
    
  };
  const closeSchedule = () => setScheduleModal(false);

  const openAction = row => { setSelectedActionRow(row); setActionModal(true); };
  const closeAction = () => setActionModal(false);

  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      { header: 'MeterReaderCode', key: 'meterReaderCode' },
      { header: 'VendorMeterReaderName', key: 'vendorMeterReaderName' },
      { header: 'VendorMeterReadingAreaName', key: 'vendorMeterReadingAreaName' },
      { header: 'ReadingDay', key: 'meterReadingDay' },
      { header: 'RecordCount', key: 'recordCount' },
      { header: 'TourPlanStatus', key: 'tourPlanStatusName' },
      { header: 'ProcessStartedOn', key: 'processStartedOn' },
      { header: 'ProcessEndedOn', key: 'processEndedOn' },
      { header: 'View', key: 'viewStatus' },
      { header: 'Action', key: 'actions' },
    ],
    []
  );

  // TABLE HEADER
  const renderTableHeader = () => (
    <tr>
      {columns.map((col, idx) => {
        if (col.key === 'actions') {
          return <th key={col.key}>{col.header}</th>;
        }
        const active = sortConfig.key === col.key;
        return (
          <th
            key={col.key}
            onClick={() => {
              if (col.key === 'actions') return;
              if (sortConfig.key === col.key) {
                setSortConfig({ key: col.key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
              } else {
                setSortConfig({ key: col.key, direction: 'asc' });
              }
            }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              paddingRight: 14,
              verticalAlign: "middle"
            }}>
            {col.header}
            <SortArrows active={active} direction={sortConfig.direction} />
          </th>
        );
      })}
    </tr>
  );

  // PAGINATION
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
  // SCHEDULE FORM (FORMIK)
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      meterReader: selectedRow?.meterReaderId ? String(selectedRow.meterReaderId) : '',
      vendorMeterReader: selectedRow?.vendorMeterReaderId ? String(selectedRow.vendorMeterReaderId) : '',
      readingDay: selectedRow?.meterReadingDay ? String(selectedRow.meterReadingDay) : '',
    },
    validationSchema: Yup.object({
      meterReader: Yup.string().required('Required'),
      vendorMeterReader: Yup.string().required('Required'),
      readingDay: Yup.string().required('Required'),
    }),

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log('Form submission started with values:', values);

        const payload = {
          flagId: 9,
          tourPlanId: selectedRow?.tourPlanId || 0,
          tourPlanDetailId: selectedRow?.tourPlanDetailId || 0,
          locationTypeId: parseInt(plan.locationType),
          locationId: parseInt(plan.location),
          monthId: parseInt(plan.month),
          yearOfBill: parseInt(plan.year),
          meterReaderId: parseInt(values.meterReader),
          vendorMeterReaderId: parseInt(values.vendorMeterReader),
          vendorMeterReadingAreaId: selectedRow?.vendorMeterReadingAreaId || 0,
          meterReadingDay: parseInt(values.readingDay),
          recordCount: parseInt(selectedRow?.recordCount || 0),
          tourPlanStatusCode: '000',
          isDisabled: false,
          requestUserName: username,
        };

        console.log('Prepared payload:', payload);
        const response = await scheduleTourPlan(payload);
        console.log('API response:', response);

        const responseData = response?.data?.[0];

        if (responseData?.responseStatusCode === '000') {
          // Success handling
          const successMsg = responseData.responseStatusCodeGUIDisplay || "Tour plan scheduled successfully!";
          console.log('Success:', successMsg);
          setResponse(successMsg);
          setSuccessModal(true);
          resetForm();
          closeSchedule();
          showData();
        } else {
          // Error handling using responseData
          const errorMsg =
            responseData?.responseStatusCodeGUIDisplay ||
            response?.displayMessage ||
            "Failed to schedule tour plan";

          console.error('API error:', errorMsg);
          setResponse(errorMsg);
          setSuccessModal(false);
          setErrorModal(true);
        }

      } catch (error) {
        // Catch any unexpected errors
        console.error('Submission error:', error);
        setResponse(`Error: ${error.message || 'Failed to submit form'}`);
        setErrorModal(true);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleStatusUpdate = async (status) => {
    try {
      const payload = {
        flagId: 10,
        tourPlanId: selectedActionRow?.tourPlanId || 0, // Use selectedActionRow instead of selectedRow
        tourPlanDetailId: selectedActionRow?.tourPlanDetailId || 0, // Use selectedActionRow instead of selectedRow
        isDisabled: false,
        updatedByUserName: username,
        processEndsOn: new Date().toISOString(), // Add current date/time
        tourPlanStatusCode: "001", // You need to implement this function
        requestUserName: username,
      };

      const response = await saveTourPlan(payload);
      const responseData = response?.data?.[0];

      if (responseData?.responseStatusCode === '000') {
        const successMsg = responseData.responseStatusCodeGUIDisplay || "Tour plan processed successfully!";
        setResponse(successMsg);
        setSuccessModal(true);
        closeAction();
        showData(); // Refresh the data
      } else {
        const errorMsg = responseData?.responseStatusCodeGUIDisplay ||
          response?.displayMessage ||
          "Failed to update tour plan status";
        setResponse(errorMsg);
        setErrorModal(true);
      }
    } catch (error) {
      console.error('Status update error:', error);
      setResponse(`Error: ${error.message || 'Failed to update status'}`);
      setErrorModal(true);
    }
  };

  const handleStatusCancel = async (status) => {
    try {
      const payload = {
        flagId: 11,
        tourPlanId: selectedActionRow?.tourPlanId || 0, // Use selectedActionRow instead of selectedRow
        tourPlanDetailId: selectedActionRow?.tourPlanDetailId || 0, // Use selectedActionRow instead of selectedRow
        isDisabled: false,
        updatedByUserName: username,
        processEndsOn: new Date().toISOString(), // Add current date/time
        tourPlanStatusCode: "-002", // You need to implement this function
        requestUserName: username,
      };

      const response = await saveTourPlan(payload);
      const responseData = response?.data?.[0];

      if (responseData?.responseStatusCode === '000') {
        const successMsg = responseData.responseStatusCodeGUIDisplay;
        setResponse(successMsg);
        setSuccessModal(true);
        closeAction();
        showData(); // Refresh the data
      } else {
        const errorMsg = responseData?.responseStatusCodeGUIDisplay ||
          response?.displayMessage ||
          "Failed to update tour plan status";
        setResponse(errorMsg);
        setErrorModal(true);
      }
    } catch (error) {
      console.error('Status update error:', error);
      setResponse(`Error: ${error.message || 'Failed to update status'}`);
      setErrorModal(true);
    }
  };

  const handleStatusAbort = async (status) => {
    try {
      const payload = {
        flagId: 11,
        tourPlanId: selectedActionRow?.tourPlanId || 0, // Use selectedActionRow instead of selectedRow
        tourPlanDetailId: selectedActionRow?.tourPlanDetailId || 0, // Use selectedActionRow instead of selectedRow
        isDisabled: false,
        updatedByUserName: username,
        processEndsOn: new Date().toISOString(), // Add current date/time
        tourPlanStatusCode: "-001", // You need to implement this function
        requestUserName: username,
      };

      const response = await saveTourPlan(payload);
      const responseData = response?.data?.[0];

      if (responseData?.responseStatusCode === '000') {
        const successMsg = responseData.responseStatusCodeGUIDisplay;
        setResponse(successMsg);
        setSuccessModal(true);
        closeAction();
        showData(); // Refresh the data
      } else {
        const errorMsg = responseData?.responseStatusCodeGUIDisplay ||
          response?.displayMessage ||
          "Failed to update tour plan status";
        setResponse(errorMsg);
        setErrorModal(true);
      }
    } catch (error) {
      console.error('Status update error:', error);
      setResponse(`Error: ${error.message || 'Failed to update status'}`);
      setErrorModal(true);
    }
  };

  const handleViewStatus = async (row) => {
    try {
      // Set the base status details to display at the top of the modal
      setStatusDetails({
        tourPlanId: row.tourPlanId,
        status: row.tourPlanStatusName,
        startedOn: row.processStartedOn,
        endedOn: row.processEndedOn,
        meterReaderCode: row.meterReaderCode,
        vendorMeterReaderName: row.vendorMeterReaderName,
        vendorMeterReadingAreaName: row.vendorMeterReadingAreaName,
        recordCount: row.recordCount,
      });

      // Open modal immediately (optional: can be after fetch)
      setViewStatusModal(true);

      // Get user info from sessionStorage for API call
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const requestUserName = obj?.user?.loginName || '';

      // Fetch the status timeline (flagId: 12 API)
      const statusHistoryResponse = await getMeterTourDropDowns({
        flagId: 12,
        requestUserName,
        vendorMeterReaderId: row.meterReaderId, // make sure this is present in row
        tourPlanId: row.tourPlanId,
      });

      if (statusHistoryResponse?.status === "success") {
        setStatusHistory(statusHistoryResponse.data || []);
      } else {
        setStatusHistory([]);
      }
    } catch (error) {
      console.error("Error fetching status history:", error);
      setStatusHistory([]);
    }
  };
  const [statusHistorySortConfig, setStatusHistorySortConfig] = useState({ key: '', direction: 'asc' });

  // SORTING for status history table
  const sortedStatusHistory = useMemo(() => {
    if (!statusHistorySortConfig.key) return statusHistory;
    const sorted = [...statusHistory].sort((a, b) => {
      let aVal = a[statusHistorySortConfig.key];
      let bVal = b[statusHistorySortConfig.key];

      // Special handling for dates
      if (statusHistorySortConfig.key === 'processStartedOn' || statusHistorySortConfig.key === 'processEndedOn') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        aVal = Number(aVal);
        bVal = Number(bVal);
        if (aVal < bVal) return statusHistorySortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return statusHistorySortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        return statusHistorySortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });
    return sorted;
  }, [statusHistory, statusHistorySortConfig]);

  // Render
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
          <BreadCrumb title="MeterReadingTourPlan" pageTitle="Pages" />
          <Row>
            <Col lg={12}>
              <Card className="mb-4">
                <CardHeader className="bg-primary text-white p-3">
                  <Row className="g-4 align-items-center">
                    <Col className="d-flex align-items-center">
                      <h4 className="mb-0 card-title text-white">MeterReadingTourPlan</h4>
                    </Col>
                  </Row>
                </CardHeader>
                <span className="text-muted mb-1 ms-3 mt-2">
                  Please fill mandatory information below<span className="text-danger">*</span>
                </span>
                <CardBody>
                  <Row form className="gy-3">
                    <Col md={3}>
                      <FormGroup>
                        <Label for="locationType">
                          LocationTypeName <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="locationType"
                          id="locationType"
                          value={plan.locationType}
                          onChange={handlePlanChange}
                        >
                          <option value="">Select LocationTypeName</option>
                          {locationTypes.map((o) => (
                            <option key={o.locationTypeId} value={o.locationTypeId}>
                              {o.locationTypeName}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="location">LocationName <span className="text-danger">*</span></Label>
                        <Input
                          type="select"
                          name="location"
                          id="location"
                          value={plan.location}
                          onChange={handlePlanChange}
                        >
                          <option value="">Select Location</option>
                          {locations.map(o => (
                            <option key={o.locationId} value={o.locationId}>{o.locationName}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="month">MonthName <span className="text-danger">*</span></Label>
                        <Input
                          type="select"
                          name="month"
                          id="month"
                          value={plan.month}
                          onChange={handlePlanChange}
                        >
                          <option value="">Select Month</option>
                          {months.map(o => (
                            <option key={o.monthId} value={o.monthId}>{o.monthName}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="year">YearOfBill <span className="text-danger">*</span></Label>
                        <Input
                          type="text"
                          name="year"
                          id="year"
                          placeholder="Enter Year"
                          value={plan.year}
                          onChange={handlePlanChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="mt-3 justify-content-between">
                    <Col className="d-flex">
                      {isScheduleVisible && (
                        <Button color="success" className="me-2" onClick={openSchedule}>
                          Schedule
                        </Button>
                      )}
                    </Col>
                    <Col className="text-end">
                      <Button color="primary" className="me-2" onClick={showData}>
                        Show
                      </Button>
                      <Button color="warning" className="me-2" onClick={resetPlan}>
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {showTable && (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader style={{ color: 'black', background: 'rgba(255, 255, 255, 0.69)' }}>
                    <Row className="g-4 align-items-center">
                      <Col className="col-sm-auto">
                        <h6 className="mb-sm-0 card-title mb-0" style={{ color: 'black' }}>
                          Allocated Detail
                        </h6>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody style={{ padding: "12px" }}>
                    <div className="fixed-table-outer" style={{ background: 'transparent' }}>
                      <table className="table table-bordered table-hover mb-0">
                        <thead className="table-light">
                          {renderTableHeader()}
                        </thead>
                        <tbody>
                          {(paginatedData.length === 0) ? (
                            <tr>
                              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>No data found</td>
                            </tr>
                          ) : paginatedData.map((row, idx) => (
                            <tr key={row.tourPlanId || idx}>
                              <td>{row.meterReaderCode}</td>
                              <td>{row.vendorMeterReaderName}</td>
                              <td>{row.vendorMeterReadingAreaName}</td>
                              <td>{row.meterReadingDay}</td>
                              <td>{row.recordCount}</td>
                              <td>{row.tourPlanStatusName}</td>
                              <td>{row.processStartedOn}</td>
                              <td>{row.processEndedOn}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info edit-item-btn"
                                  onClick={e => { e.preventDefault(); handleViewStatus(row); }}
                                >
                                  View
                                </button>

                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary edit-item-btn"
                                  onClick={e => { e.preventDefault(); openAction(row); }}
                                >
                                  <i className="ri-edit-2-line"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {renderPagination()}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* MeterReadingSchedule Modal */}
      <Modal
        isOpen={scheduleModal}
        toggle={closeSchedule}
        centered
        style={{
          maxWidth: 600,        // Large width in px, adjust as needed
          width: '95vw',        // Responsive width
          borderRadius: 10,
          padding: '0 16px',
          margin: '0 auto'
        }}
      >
        <ModalHeader
          className="bg-primary text-white border-bottom-0 justify-content-center"
          toggle={closeSchedule}
        >
          <div className="w-100 text-center" style={{ marginBottom: '12px' }}>
            <span className="modal-title text-white" style={{ fontSize: 17 }}>
              MeterReadingSchedule
            </span>
          </div>
        </ModalHeader>
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="meterReader">MeterReaderCode</Label>
              <Input
                type="select"
                name="meterReader"
                id="meterReader"
                {...formik.getFieldProps('meterReader')}
                invalid={formik.touched.meterReader && !!formik.errors.meterReader}
              >
                <option value="">Select MeterReaderCode</option>
                {meterReaderCode.map(o => (
                  <option key={o.meterReaderId} value={o.meterReaderId}>{o.meterReaderCode}</option>
                ))}
              </Input>
              {formik.touched.meterReader && formik.errors.meterReader && (
                <div className="text-danger mt-1">{formik.errors.meterReader}</div>
              )}
            </FormGroup>

            <FormGroup>
              <Label for="vendorMeterReader">VendorMeterReaderName</Label>
              <Input
                type="select"
                name="vendorMeterReader"
                id="vendorMeterReader"
                value={formik.values.vendorMeterReader}
                onChange={handleVendorMeterReaderChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.vendorMeterReader && !!formik.errors.vendorMeterReader}
              >
                <option value="">Select VendorMeterReaderName</option>
                {vendorMeterReaderName.map((o) => (
                  <option key={o.vendorMeterReaderId} value={o.vendorMeterReaderId}>
                    {o.vendorMeterReaderName}
                  </option>
                ))}
              </Input>
              {formik.touched.vendorMeterReader && formik.errors.vendorMeterReader && (
                <div className="text-danger mt-1">{formik.errors.vendorMeterReader}</div>
              )}
            </FormGroup>

            {/* Show ReadingDay Available only when a vendor meter reader is selected */}
            {formik.values.vendorMeterReader && (
              <FormGroup>
                <Label>ReadingDay Available</Label>
                <div className="form-control-plaintext">
                  {selectedReadingDay || 'Not available'}
                </div>
              </FormGroup>
            )}

            <FormGroup>
              <Label for="readingDay">ReadingDay</Label>
              <Input
                type="select"
                name="readingDay"
                id="readingDay"
                {...formik.getFieldProps('readingDay')}
                invalid={formik.touched.readingDay && !!formik.errors.readingDay}
              >
                <option value="">Select Day</option>
                {readingDay.map(d => (
                  <option key={d.readingId} value={d.readingId}>
                    {d.readingDay}
                  </option>
                ))}
              </Input>
              {formik.touched.readingDay && formik.errors.readingDay && (
                <div className="text-danger mt-1">{formik.errors.readingDay}</div>
              )}
            </FormGroup>
          </ModalBody>

          <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
            <Button color="primary" type="submit" className="me-2">
              Save
            </Button>
            <Button color="warning" className="me-2" onClick={() => formik.resetForm()}>
              Reset
            </Button>
            <Button color="danger" onClick={closeSchedule}>
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* TourPlanStatus Modal (ACTION CARD, BIGGER) */}
      <Modal
        isOpen={actionModal}
        toggle={closeAction}
        centered
        style={{ maxWidth: 400, width: '97%' }} // Increased maxWidth to fit all buttons
        contentClassName="compact-tourplan-modal"
      >
        <ModalHeader
          toggle={closeAction}
          className="bg-primary text-white border-bottom-0 justify-content-center p-3"
          style={{ marginBottom: 15, borderRadius: '10px 10px 0 0', fontSize: 20 }}
        >
          <div className="w-100 text-center" style={{ marginBottom: '0px' }}>
            <span className="modal-title text-white tourplanstatus-title-12">
              TourPlanStatus
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="text-center py-4 px-4">
          {/* Single line buttons without wrapping */}
          <div
            className="d-flex justify-content-center"
            style={{ gap: 12, flexWrap: 'nowrap' }}
          >
            <Button
              color="primary"
              size="md"
              style={{ minWidth: 90 }}
              onClick={() => handleStatusUpdate('Processed')}
            >
              Process
            </Button>

            <Button
              size="md"
              className="btn-primary"
              style={{ minWidth: 90 }}
              onClick={() => handleStatusCancel('Canceled')}
            >
              Cancel
            </Button>

            <Button
              size="md"
              style={{
                minWidth: 90,
                background: '#ff9900',
                color: '#fff',
                border: 'none',
              }}
              onClick={() => handleStatusAbort('Aborted')}
            >
              Abort
            </Button>
          </div>
        </ModalBody>

        <ModalFooter className="py-3 px-4">
          <Button
            color="danger"
            size="md"
            onClick={closeAction}
            style={{ minWidth: 60 }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>


      <Modal
        isOpen={viewStatusModal}
        toggle={() => setViewStatusModal(false)}
        centered
        size="lg"
        className="custom-wide-modal"
      >
        <ModalHeader
          toggle={() => setViewStatusModal(false)}
          className="bg-primary text-white border-bottom-0 justify-content-center p-2"
        >
          <span className="modal-title text-white">TourPlanStatus</span>
        </ModalHeader>


        <ModalBody>
          {statusDetails && (
            <div className="status-details container-fluid">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 style={{ fontWeight: 'bold', color: 'gradient', borderBottom: '1px solid grey', display: 'inline-block', paddingBottom: '4px' }}>
                    TourPlanID
                  </h6>
                  <p>{statusDetails.tourPlanId || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <h6 style={{ fontWeight: 'bold', color: 'gradient', borderBottom: '1px solid grey', display: 'inline-block', paddingBottom: '4px' }}>
                    MeterReaderCode
                  </h6>
                  <p>{statusDetails.meterReaderCode || 'N/A'}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 style={{ fontWeight: 'bold', color: 'gradient', borderBottom: '1px solid grey', display: 'inline-block', paddingBottom: '4px' }}>
                    VendorMeterReaderName
                  </h6>
                  <p>{statusDetails.vendorMeterReaderName || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <h6 style={{ fontWeight: 'bold', color: 'gradient', borderBottom: '1px solid grey', display: 'inline-block', paddingBottom: '4px' }}>
                    MeterReadingAreaName
                  </h6>
                  <p>{statusDetails.vendorMeterReadingAreaName || 'N/A'}</p>
                </div>
              </div>

              <div className="row g-3 mt-4">
                <div className="col-12">
                  {sortedStatusHistory && sortedStatusHistory.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped">
                        <thead className="table-light">
                          <tr>
                            {['tourPlanStatusName', 'processStartedOn', 'processEndedOn', 'timeDuration'].map((key) => (
                              <th
                                key={key}
                                onClick={() => {
                                  if (statusHistorySortConfig.key === key) {
                                    setStatusHistorySortConfig({
                                      key,
                                      direction: statusHistorySortConfig.direction === 'asc' ? 'desc' : 'asc'
                                    });
                                  } else {
                                    setStatusHistorySortConfig({ key, direction: 'asc' });
                                  }
                                }}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                              >
                                {{
                                  tourPlanStatusName: 'Status',
                                  processStartedOn: 'ProcessStartedOn',
                                  processEndedOn: 'ProcessEndedOn',
                                  timeDuration: 'Duration'
                                }[key]}
                                <SortArrows
                                  active={statusHistorySortConfig.key === key}
                                  direction={statusHistorySortConfig.direction}
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStatusHistory.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.tourPlanStatusName || 'N/A'}</td>
                              <td>{item.processStartedOn || 'N/A'}</td>
                              <td>{item.processEndedOn || 'N/A'}</td>
                              <td>{item.timeDuration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info">No status history available</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="danger" onClick={() => setViewStatusModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default MeterReaderTourPlan;