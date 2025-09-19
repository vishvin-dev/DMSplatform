import React, { useEffect, useState } from "react";
import {
  Button, Card, CardBody, CardHeader,
  Col, Container, Row, Label, FormGroup, Input,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import Select from "react-select";
import { ToastContainer } from "react-toastify";
import { getMisReportDpdwns, postMisReport } from "../../helpers/fakebackend_helper"
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs from 'dayjs';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { useDispatch } from 'react-redux';
import { generateReport } from '../../slices/misReport/misReportSlice';
import { useNavigate } from 'react-router-dom';





const MisReport = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locationType, setLocationType] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [groupBy, setGroupBy] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [filterConditions, setFilterConditions] = useState([
    { type: "", value: [] } // value is now an array
  ]);
  const [reportType, setReportType] = useState("Billing");
  const [selectedReportName, setSelectedReportName] = useState("");
  const [monthYear, setMonthYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [showMaxFilterMessage, setShowMaxFilterMessage] = useState(false);
  const [locationTypeName, setLocationTypeName] = useState([])
  const [groupOrderGUIDisplayName, setGroupOrderGUIDisplayName] = useState([])
  const [userName, setUserName] = useState("")
  const [locationName, setLocationName] = useState([])
  const [reportGroupName, setReportGroupName] = useState([])
  const [selectedReportTypes, setSelectedReportTypes] = useState([]);

  const [reportInformation, setReportInformation] = useState([])
  const [filterValues, setFilterValues] = useState({});
  const [filterFieldMap, setFilterFieldMap] = useState({});
  const [reportMode, setReportMode] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [months, setMonths] = useState([])
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [locationTypeError, setLocationTypeError] = useState('');
  const [filterAddError, setFilterAddError] = React.useState("");



  const [reportOptions, setReportOptions] = useState({
    MisReportOption: '',
    DateRangeFormat: ''
  });

  const handleReportNameChange = (e) => {
    const selectedId = e.target.value;
    setSelectedReportName(selectedId);
    setReportMode('');
    const selected = reportInformation.find(r => r.MisReportID.toString() === selectedId);
    if (selected) {
      setReportOptions({
        MisReportOption: selected.MisReportOption || '',
        DateRangeFormat: selected.DateRangeFormat || ''
      });
    } else {
      setReportOptions({ MisReportOption: '', DateRangeFormat: '' });
    }
    setFromDate('');
    setToDate('');
    setMonth('');
    setYear('');
  };

  useEffect(() => {
    setReportMode('');
  }, [selectedReportName]);


  // Logic helpers
  const showOnlyAbstract = reportOptions.MisReportOption === 'Abstract';
  const showOnlyDetail = reportOptions.MisReportOption === 'Detail';
  const showAbstractDetails = reportOptions.MisReportOption?.includes('Abstract') && reportOptions.MisReportOption?.includes('Detail');
  const showMonthYear = reportOptions.DateRangeFormat === 'MonthYear';
  const showDatePickers = reportOptions.DateRangeFormat === 'Calender';
  const isOnlyReportName = reportOptions.MisReportOption === 'None' && reportOptions.DateRangeFormat === 'None';



  const fetchMangeUserDetails = async (flagId, setState, requestUserName, locationId, locationTypeId, groupOrderFilterConditionId, misReportGroupName) => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj.user.loginName;
      setUserName(usernm);
      const response = await getMisReportDpdwns({ flagId, requestUserName, locationId, locationTypeId, groupOrderFilterConditionId, misReportGroupName });
      const options = response?.data || [];
      console.log("optionssssssssssssss", options)
      setState(options);
    } catch (error) {
      console.error("Error fetching data for flagId :", error.message);
    }
  };

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    fetchMangeUserDetails(1, setLocationTypeName, usernm);

    fetchMangeUserDetails(5, setReportGroupName, usernm);
    fetchMangeUserDetails(7, setMonths, usernm);

  }, []);

  // New function to fetch filter values based on selected condition
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


  // Effect to fetch values when filter type changes
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


  //this is the locationTypechanges it generates the locationTypeId 
  const handleLocationTypeChange = async (e) => {
    const selectedLocationTypeId = Number(e.target.value);
    setLocationType(selectedLocationTypeId);

    // Reset all dependent dropdowns
    setLocationName([]);
    setGroupBy("");
    setOrderBy("");
    setSelectedLocationId(""); // reset
    setFilterConditions([{ type: "", value: [] }]);
    setShowMaxFilterMessage(false);

    if (selectedLocationTypeId) {
      // Flag 2: Get Location Names
      await fetchMangeUserDetails(2, (data) => {
        setLocationName(data);

        // Set default locationId if available
        if (Array.isArray(data) && data.length > 0) {
          const defaultId = data[0].locationId || data[0].LocationId || data[0].id;
          setSelectedLocationId(defaultId);
        }
      }, userName, null, selectedLocationTypeId);

      // Flag 3: GroupBy/OrderBy using only locationType
      await fetchMangeUserDetails(3, setGroupOrderGUIDisplayName, userName, null, selectedLocationTypeId);
    }
  };


  const handleFilterTypeChange = (e, index) => {
    const value = e.target.value;
    const updated = [...filterConditions];
    updated[index].type = value;
    updated[index].value = []; // reset values on type change
    setFilterConditions(updated);

    // Clear error if fixing the last filter condition
    if (index === filterConditions.length - 1 && value) {
      setFilterAddError("");
    }
  };


  //checkbox things here 
  const handleReportGroupChange = async (reportGroupName) => {
    const isSelected = selectedReportTypes.includes(reportGroupName);

    // Always allow only one selection at a time
    const updatedSelected = isSelected ? [] : [reportGroupName];

    setSelectedReportTypes(updatedSelected);
    setSelectedReportName("");

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;

    await fetchMangeUserDetails(
      6,
      setReportInformation,
      usernm,
      null,
      null,
      null,
      !isSelected ? reportGroupName : null
    );
  };


  // Theme detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(
        document.body.classList.contains("dark") ||
        document.documentElement.classList.contains("dark")
      );
    });
    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);



  // Add a filter
  const addFilterCondition = () => {
    if (filterConditions.length >= 5) return;

    if (filterConditions.length > 0) {
      const lastCondition = filterConditions[filterConditions.length - 1];

      if (!lastCondition.type) {
        setFilterAddError("Please select a filter before adding a new filter.");
        return;
      }

      if (!lastCondition.value || lastCondition.value.length === 0) {
        setFilterAddError("Please select filtervalue before adding a new filter.");
        return;
      }
    }

    setFilterConditions([...filterConditions, { type: "", value: [] }]);
    setFilterAddError(""); // clear error

    if (filterConditions.length === 4) {
      setShowMaxFilterMessage(true);
    }
  };




  // Remove a filter
  const removeFilterCondition = (index) => {
    if (filterConditions.length > 1) {
      const newFilterConditions = filterConditions.filter((_, i) => i !== index);
      setFilterConditions(newFilterConditions);

      // Hide max filter message when we have fewer than 5 filters
      if (newFilterConditions.length < 5) {
        setShowMaxFilterMessage(false);
      }
    }
    setFilterAddError('');
  };

  // Handle export format selection
  const handleExportFormat = (format) => {
    setExportFormat(format);
  };

  // Handle exit
  const handleExit = () => {
    // Exit from present page without confirmation
    window.location.href = '/'; // Redirects to root page or homepage
  };

  // Reset form data
  const handleReset = () => {
    setLocationType("");
    setSelectedLocations([]);
    setGroupBy("");
    setOrderBy("");
    setFilterConditions([{ type: "", value: [] }]);
    setReportType("Billing");
    setSelectedReportName("");
    setMonthYear("");
    setFromDate("");
    setToDate("");
    setExportFormat("PDF");
    setShowMaxFilterMessage(false);
  };


  // Set page title
  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const menuPage = JSON.parse(obj?.user?.menuPage || "[]");
    const applicationCode = obj?.user?.applicationCode;
    const currentPath = window.location.pathname;
    const currentPageLabel = findLabelByLink(menuPage, currentPath) || "Page";
    document.title = `${currentPageLabel} | ${applicationCode}`;
  }, []);


  const handleGenerateReport = async () => {
    let hasError = false;
    setLocationTypeError('');

    // Validation
    if (!locationType) {
      setLocationTypeError("Please select LocationTypeName");
      hasError = true;
    }

    if (!selectedReportName) {
      toast.error("Please select a Report Name");
      return;
    }

    // if (showMonthYear && (!month || !year)) {
    //   toast.error("Please select both Month and Year");
    //   return;
    // }

    // if (showDatePickers && (!fromDate || !toDate)) {
    //   toast.error("Please select both From Date and To Date");
    //   return;
    // }

    const selectedReport = reportInformation.find(
      (r) => r.MisReportID.toString() === selectedReportName
    );

    const payload = {
      flagId: Number(1),
      locationTypeId: Number(locationType),
      locationId: selectedLocationId ? Number(selectedLocationId) : 0,
      groupFilterConditionId: groupBy ? Number(groupBy) : 0,
      orderFilterConditionId: orderBy ? Number(orderBy) : 0,
      filterConditionIds: JSON.stringify(
        filterConditions
          .filter(cond => cond.type && cond.value && cond.value.length > 0)
          .map(cond => ({
            GroupOrderFilterConditionID: Number(cond.type),
            GroupOrderFilterConditionValue: cond.value.join(",")
          }))
      ),
      misReportName: selectedReport
        ? selectedReport.MisReportName
        : selectedReportTypes.length === 1
          ? selectedReportTypes[0]
          : "",
      misReportOption: String(reportMode || ""),
      dateRangeFormat: showDatePickers
        ? "DATE_RANGE"
        : showMonthYear
          ? "MONTH_YEAR"
          : "NONE",
      monthId: showMonthYear ? Number(month) : 0,
      yearId: showMonthYear ? Number(year) : 0,
      fromDate: showDatePickers && fromDate ? fromDate : null,
      toDate: showDatePickers && toDate ? toDate : null,
      isDisabled: false,
      requestUserName: String(userName),
    };

    try {
      localStorage.setItem("reportPayload", JSON.stringify(payload));
      const reportName = selectedReport?.MisReportName;
      if (reportName === "BillingEfficiency") {
        window.open("billingReport", "_blank");
      } else if (reportName === "LocationInformation") {
        window.open("reportPreview", "_blank");
      }
      else if (reportName === "ReasonWiseBillingEfficiency") {
        window.open("reasonWiseBillingEfficiency", "_blank");
      } else {
        window.open("reportPreview", "_blank");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error?.message || "Failed to prepare report preview");
    }
  };


  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="MIS Report" pageTitle="Pages" />
        <Row>
          {/* Left Column - Office Information (Always Visible) */}
          <Col md={6} className="pe-md-2">
            <Card className="border-0 bg-light mb-4">
              <CardHeader className="card-header card-primary">
                <Row className="g-4 align-items-center">
                  <Col className="col-sm-auto">
                    <div>
                      <h4 color="primary" className="mb-sm-0 card-title mb-0 align-self-center flex-grow-1" style={{ fontWeight: 800, fontSize: '1.12rem' }}>
                        MIS Report
                      </h4>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardHeader className="bg-light border-0 p-3" style={{ fontWeight: 800, fontSize: '1.11rem', color: '#343a40' }}>
                Office Information
              </CardHeader>
              <span className="text-muted mb-1 ms-3 mt-1">
                Please fill mandatory information below<span className="text-danger">*</span>
              </span>

              <CardBody className="p-3">
                <Row className="mb-3">
                  <Col md={6}>
                    <Label className="form-label">LocationTypeName <span className='text-danger'>*</span></Label>
                    <div className="position-relative">
                      <Input
                        type="select"
                        value={locationType}
                        onChange={handleLocationTypeChange}
                        className="form-select"
                        style={{ width: '97%' }}
                      >
                        <option value="">Select LocationTypeName</option>

                        {locationTypeName
                          .slice() // copy array to avoid mutating state
                          .sort((a, b) => a.locationTypeId - b.locationTypeId) // sort by locationTypeId
                          .map((item) => (
                            <option key={item.locationTypeId} value={item.locationTypeId}>
                              {item.locationTypeName}
                            </option>
                          ))}

                      </Input>

                      {locationTypeError && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>
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
                      // onChange={handleLocationNameChange} // updated handler
                      >
                        <option value="">Select LocationName</option>
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

                <Row className="mb-3">
                  <Col md={6}>
                    <Label className="form-label">GroupBy <span className='text-danger'>*</span></Label>
                    <div className="position-relative">
                      <Input
                        type="select"
                        value={groupBy}
                        onChange={(e) => {
                          setGroupBy(e.target.value);
                          setOrderBy('');
                        }}
                        className="form-select"
                        disabled={!locationType}
                      >
                        <option value="">SelectGroupBy</option>
                        {groupOrderGUIDisplayName.map((item) => (
                          <option key={item.groupOrderFilterConditionId} value={item.groupOrderFilterConditionId}>
                            {item.GroupOrderGUIDisplayName}
                          </option>
                        ))}
                      </Input>
                      <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                        <i className="bi bi-chevron-down"></i>
                      </span>
                    </div>
                  </Col>

                  <Col md={6}>
                    <Label className="form-label">OrderBy <span className='text-danger'>*</span></Label>
                    <div className="position-relative">
                      <Input
                        type="select"
                        value={orderBy}
                        onChange={(e) => setOrderBy(e.target.value)}
                        className="form-select"
                        disabled={!groupBy || !locationType}
                      >
                        <option value="">{groupBy ? "Select OrderBy " : "Select OrderBy first"}</option>
                        {groupOrderGUIDisplayName
                          .filter((item) => item.groupOrderFilterConditionId.toString() !== groupBy.toString())
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
                  </Col>
                </Row>

                {locationType && selectedLocationId && groupBy && orderBy && (
                  <Row>
                    <Col md={12}>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <Label className="form-label mb-0"><strong>FilterConditions</strong></Label>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={addFilterCondition}
                          disabled={filterConditions.length >= 5 || !locationType}
                        >
                          +Add
                        </Button>
                      </div>
                      {showMaxFilterMessage && (
                        <div className="text-danger mb-2" style={{ fontSize: '0.85rem' }}>
                          * Maximum 5 filters allowed
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
                          <div className="position-relative" style={{ flex: 1, minWidth: '200px' }}>
                            <Input
                              type="select"
                              className="form-select"
                              value={condition.type}
                              onChange={(e) => {
                                handleFilterTypeChange(e, index);

                                // Clear error if this is the last filter and type is selected
                                if (index === filterConditions.length - 1 && e.target.value) {
                                  const last = filterConditions[index];
                                  if (last.value && last.value.length > 0) {
                                    setFilterAddError("");
                                  }
                                }
                              }}


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
                                  <option
                                    key={item.groupOrderFilterConditionId}
                                    value={item.groupOrderFilterConditionId}
                                  >
                                    {item.GroupOrderGUIDisplayName}
                                  </option>
                                ))}
                            </Input>
                            <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                              <i className="bi bi-chevron-down"></i>
                            </span>
                            <div style={{ height: '1px' }}>
                              {index === filterConditions.length - 1 && filterAddError && (
                                <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>
                                  {filterAddError}
                                </div>
                              )}
                            </div>
                          </div>

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
                                      label: item?.[keys?.labelKey]
                                    };
                                  })
                                  : []
                              }
                              value={
                                (condition.value || []).map(val => {
                                  const keys = filterFieldMap[condition.type];
                                  const match = filterValues[condition.type]?.find(
                                    item => item?.[keys?.valueKey] === val
                                  );
                                  return match
                                    ? {
                                      value: match?.[keys?.valueKey],
                                      label: match?.[keys?.labelKey]
                                    }
                                    : null;
                                }).filter(Boolean)
                              }
                              onChange={(selectedOptions) => {
                                const selectedValues = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                                const updated = [...filterConditions];
                                updated[index].value = selectedValues;
                                setFilterConditions(updated);

                                // ✅ Clear error if this is the last filter and value is selected
                                if (
                                  index === filterConditions.length - 1 &&
                                  selectedValues.length > 0
                                ) {
                                  const last = updated[index];
                                  if (last.type) {
                                    setFilterAddError("");
                                  }
                                }
                              }}
                              isDisabled={!condition.type || !locationType}
                            />

                          </div>

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
                                userSelect: 'none'
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

          {(Number(locationType) > 0 && groupBy && orderBy && Number(selectedLocationId) > 0)
            && (
              <Col md={6} className="ps-md-2" style={{ display: "flex", flexDirection: "column" }}>
                <Card className="border-0 bg-light mb-4" style={{ flexGrow: 1, minHeight: "240px" }}>
                  <CardHeader className="bg-light border-0 p-3" style={{ fontWeight: 800, fontSize: '1.11rem', color: '#343a40' }}>
                    MISReport Information
                  </CardHeader>
                  <CardBody className="p-3 d-flex flex-column">
                    <div className="mb-4">
                      {reportGroupName.map((reportGroup) => (
                        <FormGroup check className="mb-3" key={reportGroup.ReportGroupNameID}>
                          <Input
                            type="checkbox"
                            name="reportGroupName"
                            id={`reportGroup-${reportGroup.ReportGroupNameID}`}
                            checked={selectedReportTypes.includes(reportGroup.ReportGroupName)}
                            onChange={() => handleReportGroupChange(reportGroup.ReportGroupName)}
                          />
                          <Label
                            htmlFor={`reportGroup-${reportGroup.ReportGroupNameID}`}
                            className="ms-2"
                            style={{ fontSize: '1.00rem' }}
                          >
                            {reportGroup.ReportGroupName}
                          </Label>
                        </FormGroup>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card className="border-0 bg-light mb-4">
                  <CardHeader className="bg-light border-0 p-3">
                    {selectedReportTypes.length > 0 && (
                      <Row className="w-100">
                        <Col xs={12} md={6}>
                          <span style={{ fontWeight: 800, fontSize: '1.01rem' }}>ReportName</span>
                        </Col>
                        {(selectedReportName && !isOnlyReportName && (showMonthYear || showDatePickers)) && (
                          <Col xs={12} md={6} className="text-md-start text-start mt-2 mt-md-0">
                            <span style={{ fontWeight: 800, fontSize: '1.01rem' }}>MonthCondition</span>
                          </Col>
                        )}
                      </Row>
                    )}
                  </CardHeader>

                  {selectedReportTypes.length > 0 && (
                    <CardBody className="p-3">
                      <Row className="g-2">
                        <Col xs={12} md={6}>
                          <FormGroup className="mb-2">
                            <div className="position-relative" style={{ width: '100%', maxWidth: '250px' }}>
                              <Input
                                type="select"
                                bsSize="sm"
                                className="form-select"
                                value={selectedReportName}
                                onChange={handleReportNameChange}
                                style={{ height: "31px" }}
                              >
                                <option value="">Select Report</option>
                                {reportInformation.map((option) => (
                                  <option key={option.MisReportID} value={option.MisReportID}>
                                    {option.MisReportName}
                                  </option>
                                ))}
                              </Input>
                              <span className="position-absolute end-0 top-50 translate-middle-y me-2">
                                <i className="bi bi-chevron-down"></i>
                              </span>
                            </div>
                          </FormGroup>


                          {selectedReportName && (
                            <>
                              {showOnlyAbstract && (
                                <FormGroup check inline className="mb-2 ms-1">
                                  <Input
                                    type="checkbox"
                                    id="abstract"
                                    checked={reportMode === "Abstract"}
                                    onChange={() => setReportMode(reportMode === "Abstract" ? "" : "Abstract")}
                                  />
                                  <Label for="abstract" className="form-label small ms-1">Abstract</Label>
                                </FormGroup>
                              )}

                              {showOnlyDetail && (
                                <FormGroup check inline className="mb-2 ms-1">
                                  <Input
                                    type="checkbox"
                                    id="details"
                                    checked={reportMode === "Detail"}
                                    onChange={() => setReportMode(reportMode === "Detail" ? "" : "Detail")}
                                  />
                                  <Label for="details" className="form-label small ms-1">Details</Label>
                                </FormGroup>
                              )}

                              {showAbstractDetails && !showOnlyAbstract && !showOnlyDetail && (
                                <>
                                  <FormGroup check inline className="mb-2 ms-1">
                                    <Input
                                      type="checkbox"
                                      id="abstract"
                                      checked={reportMode === "Abstract"}
                                      onChange={() => setReportMode("Abstract")}
                                    />
                                    <Label for="abstract" className="form-label small ms-1">Abstract</Label>
                                  </FormGroup>
                                  <FormGroup check inline className="mb-2">
                                    <Input
                                      type="checkbox"
                                      id="details"
                                      checked={reportMode === "Detail"}
                                      onChange={() => setReportMode("Detail")}
                                    />
                                    <Label for="details" className="form-label small ms-1">Details</Label>
                                  </FormGroup>
                                </>
                              )}

                              <FormGroup className="mb-2 mt-2">
                                <div className="d-flex flex-wrap gap-2">
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={handleGenerateReport}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Generating...
                                      </>
                                    ) : (
                                      "Generate"
                                    )}
                                  </Button>
                                  <Button color="info" size="sm" onClick={handleReset}>Reset</Button>
                                  <Button color="danger" size="sm" onClick={handleExit}>Exit</Button>
                                </div>
                              </FormGroup>
                            </>
                          )}
                        </Col>

                        {selectedReportName && (
                          <Col xs={12} md={6}>
                            {showDatePickers && (
                              <>
                                <FormGroup className="mb-2 mt-1">
                                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                                    <Label className="form-label small mb-1 mb-md-0 me-md-2" style={{ minWidth: "100px" }}>
                                      FromDate:
                                    </Label>
                                    <div className="position-relative w-100">
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
                                          maxDate={dayjs()}
                                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                        />
                                      </LocalizationProvider>
                                    </div>
                                  </div>
                                </FormGroup>

                                <FormGroup className="mb-2 mt-1">
                                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                                    <Label className="form-label small mb-1 mb-md-0 me-md-2" style={{ minWidth: "100px" }}>
                                      ToDate:
                                    </Label>
                                    <div className="position-relative w-100">
                                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                          views={['year', 'month', 'day']}
                                          value={toDate ? dayjs(toDate) : null}
                                          onChange={(newValue) => {
                                            const formatted = newValue ? dayjs(newValue).format('YYYY-MM-DD') : '';
                                            setToDate(formatted);
                                          }}
                                          minDate={fromDate ? dayjs(fromDate).startOf('month') : undefined}
                                          maxDate={fromDate ? dayjs(fromDate).endOf('month') : undefined}
                                          format="YYYY-MM-DD"
                                          
                                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                          disabled={!fromDate}
                                        />
                                      </LocalizationProvider>
                                    </div>
                                  </div>
                                </FormGroup>

                              </>
                            )}

                            {showMonthYear && (
                              <>
                                <FormGroup className="mb-2">
                                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                                    <Label className="form-label mb-1 mb-md-0 me-md-2" style={{ minWidth: "100px" }}>MonthName:</Label>
                                    <Input
                                      type="select"
                                      bsSize="sm"
                                      value={month}
                                      onChange={(e) => setMonth(e.target.value)}
                                      style={{ maxWidth: "100%", height: "32px" }}
                                    >
                                      <option value="">Select MonthName</option>
                                      {months.map((m) => (
                                        <option key={m.monthId} value={m.monthId}>{m.monthName}</option>
                                      ))}
                                    </Input>
                                  </div>
                                </FormGroup>

                                <FormGroup className="mb-2">
                                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                                    <Label className="form-label mb-1 mb-md-0 me-md-2" style={{ minWidth: "100px" }}>YearOfBill:</Label>
                                    <Input
                                      type="text"
                                      bsSize="sm"
                                      value={year}
                                      placeholder="Enter The Year"
                                      onChange={(e) => setYear(e.target.value)}
                                      style={{ maxWidth: "100%", height: "32px" }}
                                    />
                                  </div>
                                </FormGroup>
                              </>
                            )}
                          </Col>
                        )}
                      </Row>
                    </CardBody>
                  )}
                </Card>

              </Col>
            )}

        </Row>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default MisReport;