import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, Card, CardBody, CardHeader, Col, Container, ModalBody, ModalFooter,
  ModalHeader, Row, Label, FormFeedback, Modal, Input, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import { getMeterDeviceAllocationDropDowns, updateMeterDeviceAllocation, getMeterDeviceAllocationsDetails } from "../../helpers/fakebackend_helper";
import { GET_DEVICE_ALLOCATION_DETAILS } from "../../helpers/url_helper"
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"
import * as Yup from "yup";
import { useFormik } from "formik";

const SORT_ARROW_SIZE = 13; // px

// SortArrows component using SVG
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

const MeterReaderDeviceAllocation = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [response, setResponse] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [filters, setFilters] = useState({
  locationTypeId: "",
  locationId: ""
});




  const [locationTypeName, setLocationTypeName] = useState([]);
  const [locationName, setLocationName] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [username, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // New state variables for sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Sorting function
  const sortData = (data, key, direction) => {
    if (!key || !direction) return data;
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const vA = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
      const vB = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
      if (direction === 'asc') return vA > vB ? 1 : vA < vB ? -1 : 0;
      return vA < vB ? 1 : vA > vB ? -1 : 0;
    });
  };

  const filteredData = useMemo(() => {
    let rows = data;
    if (filters.allocStatus === 'Allocated') rows = rows.filter((d) => d.isDeviceAllocated === true);
    if (filters.allocStatus === 'Not Allocated') rows = rows.filter((d) => d.isDeviceAllocated === false);
    if (searchTerm)
      rows = rows.filter((r) =>
        Object.values(r).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
      );
    return rows;
  }, [data, filters.allocStatus, searchTerm]);

  // Get sorted and paginated data
  const sortedData = useMemo(() => {
    // sorting only if sortConfig.key && sortConfig.direction
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    return sortData(filteredData, sortConfig.key, sortConfig.direction);
  }, [filteredData, sortConfig]);

  // Calculate pagination values
  const actualPageSize = pageSize === -1 ? sortedData.length : pageSize;
  const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize]);

  const columns = useMemo(() => [
    {
      header: 'FirstName',
      accessorKey: 'firstName',
      key: 'firstName',
      sortable: true,
    },
    {
      header: 'MiddleName',
      accessorKey: 'middleName',
      key: 'middleName',
      sortable: true,
    },
    {
      header: 'LastName',
      accessorKey: 'lastName',
      key: 'lastName',
      sortable: true,
    },
    {
      header: 'MRCode',
      accessorKey: 'mRCode',
      key: 'mRCode',
      sortable: true,
    },
    {
      header: 'DeviceTypeName',
      accessorKey: 'deviceTypeName',
      key: 'deviceTypeName',
      sortable: true,
    },
    {
      header: 'DeviceName',
      accessorKey: 'deviceName',
      key: 'deviceName',
      sortable: true,
    },
    {
      header: 'IMEINo',
      accessorKey: 'iMEINo',
      key: 'iMEINo',
      sortable: true,
    },
    {
      header: 'SIMNo',
      accessorKey: 'sIMNo',
      key: 'sIMNo',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'isDeviceAllocated',
      key: 'isDeviceAllocated',
      sortable: true,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      key: 'action',
      sortable: false,
    }
  ], []);

 const getOnLoadingData = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const usernm = obj?.user?.loginName;

      const params = {
        flagId: 1,
        requestUserName: usernm,
      };

      const response = await getMeterDeviceAllocationsDetails(params);
      const allRoles = response?.data || [];

      setOriginalData(allRoles);
      setData(allRoles);
      setUserName(usernm);
      setIsDataLoaded(true); // Set data loaded flag to true
      setSortConfig({ key: null, direction: null });
    } catch (error) {
      console.error("Error in getOnLoadingData:", error);
      setIsDataLoaded(false);
    }
  };

  useEffect(() => {
    getOnLoadingData();
  }, []);


const handleShow = () => {

  const selectedLocationTypeId = Number(filters.locationTypeId);
  const selectedLocationId = Number(filters.locationId);

  setErrorMessage(""); // clear previous error

  // Validation check
  if (!selectedLocationTypeId || !selectedLocationId) {
    setErrorMessage("Please select both Location Type and Location.");
    setData([]); // Clear displayed data
    return;
  }

  // Filter data based on selection
  const filteredData = originalData.filter(item =>
    Number(item.locationTypeId) === selectedLocationTypeId &&
    Number(item.locationID) === selectedLocationId
  );

  if (filteredData.length === 0) {
    setErrorMessage("No data found for the selected Location Type and Location.");
    setData([]); // Show no data
  } else {
    setData(filteredData); // Show filtered data
  }
};







  const flagIdFunction = async (flagId, setState, requestUserName, locationId, locationTypeId) => {
    try {
      const params = { flagId, requestUserName, locationId, locationTypeId };
      const response = await getMeterDeviceAllocationDropDowns(params);
      const options = response?.data || [];
      setState(options);
    } catch (error) {
      console.error(`Error fetching options for flag ${flagId}:`, error.message);
    }
  };

  // On mount: load initial dropdown data
  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    const locationId = obj.user.locationId;

    setUserName(usernm);

    flagIdFunction(2, setLocationTypeName, usernm, Number(locationId), null); // Location Type
    flagIdFunction(4, setDeviceTypes, usernm, null);      // Device Type
  }, []);

  // Handler when location type changes
  const handleLocationTypeChange = async (e) => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    const selectedLocationTypeId = e.target.value;
    console.log(selectedLocationTypeId, "selectedLocationTypeId")

    setFilters({
      ...filters,
      locationTypeId: selectedLocationTypeId,
      locationID: ""
    });

    // Fetch location names for selected locationTypeId
    await flagIdFunction(3, setLocationName, usernm, null, Number(selectedLocationTypeId));
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(0); // Reset to first page when searching
  };

  // Table header rendering
  const renderTableHeader = () => (
    <tr>
      {columns.map((col, idx) => {
        if (!col.sortable) {
          return <th key={col.key || idx}>{col.header}</th>;
        }
        // Sorting: only show as active if this is the sorted col
        const active = sortConfig.key === col.key && sortConfig.direction;
        return (
          <th
            key={col.key || idx}
            onClick={() => {
              if (!col.sortable) return;
              // If not sorted, start ascending; if ascending, make descending; if descending, clear sort
              if (sortConfig.key !== col.key) {
                setSortConfig({ key: col.key, direction: 'asc' });
              } else if (sortConfig.direction === 'asc') {
                setSortConfig({ key: col.key, direction: 'desc' });
              } else if (sortConfig.direction === 'desc') {
                setSortConfig({ key: null, direction: null });
              }
            }}
            style={{
              cursor: col.sortable ? 'pointer' : 'default',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              paddingRight: 14,
              verticalAlign: 'middle',
            }}
          >
            {col.header}
            {/* Only display sort arrow as active when this col is being sorted */}
            <SortArrows active={active} direction={sortConfig.direction} />
          </th>
        );
      })}
    </tr>
  );

  // PAGINATION
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


  // Table row rendering
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
    return paginatedData.map((row, rowIndex) => (
      <tr key={rowIndex}>
        <td>{row.firstName}</td>
        <td>{row.middleName}</td>
        <td>{row.lastName}</td>
        <td>{row.mRCode}</td>
        <td>{row.deviceTypeName}</td>
        <td>{row.deviceName}</td>
        <td>{row.iMEINo}</td>
        <td>{row.sIMNo}</td>
        <td>
          {row.isDeviceAllocated === true ? (
            <span className="badge rounded-pill bg-success-subtle text-success">Allocated</span>
          ) : (
            <span className="badge rounded-pill bg-danger-subtle text-danger">Not Allocated</span>
          )}
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button color="primary" className="btn-sm edit-item-btn" onClick={() => handleEdit(row)}>
              <i className="ri-edit-2-line"></i>
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  const deviceFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      meterReaderId: editRow?.meterReaderId || '',
      deviceTypeId: editRow?.deviceTypeId || '',
      deviceTypeName: editRow?.deviceTypeName || '',
      locationID: editRow?.locationID || '',
      locationTypeId: editRow?.locationTypeId || '',
      deviceName: editRow?.deviceName || '',
      iMEINo: editRow?.iMEINo || '',
      sIMNo: editRow?.sIMNo || '',
      isDeviceAllocated: editRow?.isDeviceAllocated ?? false,
    },

    validationSchema: Yup.object({
      deviceTypeId: Yup.string().required('Required'),
      deviceName: Yup.string().max(50, 'Max 50 characters').required('Required'),
      iMEINo: Yup.string().max(75, 'Max 75 characters').required('Required'),
      sIMNo: Yup.string().max(50, 'Max 50 characters').required('Required'),
    }),

    onSubmit: async (values) => {
      console.log(username, "username")

      try {
        const payload = {
          flagId: 5,
          meterReaderId: values.meterReaderId,
          locationTypeId: values.locationTypeId ? parseInt(values.locationTypeId) : null,
          locationID: values.locationID ? parseInt(values.locationID) : null,
          deviceTypeName: values.deviceTypeName,
          deviceName: values.deviceName,
          iMEINo: values.iMEINo,
          simNo: values.sIMNo,
          isDeviceAllocated: values.isDeviceAllocated,
          isDisabled: false,
          requestUserName: username,
        }

        const response = await updateMeterDeviceAllocation(payload);
        const resData = response.data?.[0];

        if (resData?.responseStatusCode === '000') {
          setResponse(resData.responseStatusCodeGUIDisplay || "Saved Successfully!");
          setSuccessModal(true);
          setErrorModal(false);

          await getOnLoadingData(); // Refresh after successful save
        } else {
          setResponse(resData?.responseStatusCodeGUIDisplay || "Failed to save.");
          setSuccessModal(false);
          setErrorModal(true);
        }

        setModalOpen(false);
      } catch (e) {
        console.error("Submit error:", e);
        setResponse('Failed to save: ' + (e?.message || 'Unexpected error'));
        setSuccessModal(false);
        setErrorModal(true);
      }
    },
  });

  function handleEdit(row) {
    console.log("Editing row:", row);
    console.log("Device Types:", deviceTypes);

    // Find the corresponding deviceTypeId from deviceTypeName
    const matchedDevice = deviceTypes.find(
      (d) => d.deviceTypeName === row.deviceTypeName
    );

    const resolvedDeviceTypeId = matchedDevice ? matchedDevice.deviceTypeId : '';

    setEditRow({
      ...row,
      deviceTypeId: resolvedDeviceTypeId,
      locationID: row.locationID,
      iMEINo: row.iMEINo,
    });

    // Populate Formik values correctly
    deviceFormik.setValues({
      meterReaderId: row.meterReaderId || '',
      deviceTypeId: resolvedDeviceTypeId,
      deviceTypeName: row.deviceTypeName || '',
      locationID: row.locationID || '',
      locationTypeId: row.locationTypeId || '',
      deviceName: row.deviceName || '',
      iMEINo: row.iMEINo || '',
      sIMNo: row.sIMNo || '',
      isDeviceAllocated: row.isDeviceAllocated ?? false,
    });

    setModalOpen(true);
  }

  function handleModalClose() {
    setEditRow(null);
    setModalOpen(false);
    deviceFormik.resetForm();
  }

  async function handleReset() {
    // Clear filters
    setFilters({
      locationTypeId: '',
      locationID: '',
      allocStatus: 'ALL',
    });

    setLocationName([]);
    setData([]);
    setUserName('');
    setSearchTerm('');
    setPage(0);
    getOnLoadingData()
    setErrorMessage('');
    deviceFormik.resetForm();
  }

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
          <BreadCrumb title="MeterReaderDeviceAllocation" pageTitle="Device Allocation" />
          <Card>
            <CardHeader className="bg-primary text-white p-3">
              <Row className="g-4 align-items-center">
                <Col className="d-flex align-items-center">
                  <h4 className="mb-0 card-title text-white">
                    MeterReaderDeviceAllocation
                  </h4>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row className="mb-2 g-3 align-items-end">
                <Col md={4} xs={12}>
                  <FormGroup>
                    <Label className="fw-bold">LocationTypeName</Label>
                    <Input
                      type="select"
                      value={filters.locationTypeId}
                      onChange={handleLocationTypeChange}
                    >
                      <option value="">Select LocationType</option>
                      {locationTypeName.map((locType) => (
                        <option value={locType.locationTypeId} key={locType.locationTypeId}>
                          {locType.locationTypeName}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={4} xs={12}>
                  <FormGroup>
                    <Label className="fw-bold">LocationName</Label>
                    <Input
                      type="select"
                      value={filters.locationId}
                      onChange={(e) =>
                        setFilters({ ...filters, locationId: Number(e.target.value) }) // ✅ convert to number
                      }
                      disabled={!filters.locationTypeId}
                    >

                      <option value="">Select LocationName</option>
                      {locationName.map(loc => (
                        <option value={loc.locationId} key={loc.locationId}>
                          {loc.locationName}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={4} xs={12}>
                  <div className="d-flex flex-column">
                    <Label className="fw-bold mb-1">Filter</Label>
                    <Card className="w-auto" style={{
                      border: "1px solid #12897b",
                      boxShadow: "0 2px 6px 0 rgba(6,44,54,0.08)",
                      background: 'transparent',
                      borderRadius: 14,
                      display: 'inline-block'
                    }}>
                      <CardBody className="p-2">
                        <div className="d-flex flex-wrap gap-3">
                          <FormGroup check inline className="mb-0">
                            <Input
                              type="radio"
                              name="allocStatus"
                              id="filter-all"
                              checked={filters.allocStatus === 'ALL'}
                              onChange={() => setFilters({ ...filters, allocStatus: 'ALL' })}
                            />
                            <Label check htmlFor="filter-all" className="mb-0">All</Label>
                          </FormGroup>
                          <FormGroup check inline className="mb-0">
                            <Input
                              type="radio"
                              name="allocStatus"
                              id="filter-allocated"
                              checked={filters.allocStatus === 'Allocated'}
                              onChange={() => setFilters({ ...filters, allocStatus: 'Allocated' })}
                            />
                            <Label check htmlFor="filter-allocated" className="mb-0">Allocated</Label>
                          </FormGroup>
                          <FormGroup check inline className="mb-0">
                            <Input
                              type="radio"
                              name="allocStatus"
                              id="filter-not-allocated"
                              checked={filters.allocStatus === 'Not Allocated'}
                              onChange={() => setFilters({ ...filters, allocStatus: 'Not Allocated' })}
                            />
                            <Label check htmlFor="filter-not-allocated" className="mb-0">Not Allocated</Label>
                          </FormGroup>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col className="d-flex flex-column align-items-end">
                  {errorMessage && (
                    <div style={{ color: "red", marginBottom: "5px", fontWeight: "500" }}>
                      {errorMessage}
                    </div>
                  )}
                  <div>
                    <Button color="primary" onClick={handleShow} className="me-2">
                      Show
                    </Button>
                    <Button color="success" onClick={handleReset}>
                      Reset
                    </Button>
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

              <Modal isOpen={modalOpen} toggle={handleModalClose} centered>
                <ModalHeader className="bg-primary text-white p-3" toggle={handleModalClose}>
                  <span className="modal-title text-white">
                    Device Information
                  </span>
                </ModalHeader>
                <form onSubmit={deviceFormik.handleSubmit}>
                  <ModalBody>
                    <div className="mb-3 fw text-muted">
                      Please fill mandatory information below <span className="text-danger">*</span>
                    </div>
                    <Row>
                      <Col md={12}>
                        <FormGroup className="mb-3">
                          <Label>
                            DeviceTypeName <span style={{ color: 'red' }}>*</span>
                          </Label>
                          <Input
                            type="select"
                            name="deviceTypeId"
                            value={deviceFormik.values.deviceTypeId}
                            onChange={deviceFormik.handleChange}
                            onBlur={deviceFormik.handleBlur}
                            invalid={deviceFormik.touched.deviceTypeId && !!deviceFormik.errors.deviceTypeId}
                          >
                            <option value="">Select DeviceType</option>
                            {deviceTypes.map((d) => (
                              <option value={d.deviceTypeId} key={d.deviceTypeId}>
                                {d.deviceTypeName}
                              </option>
                            ))}
                          </Input>
                          <FormFeedback>
                            {deviceFormik.errors.deviceTypeId}
                          </FormFeedback>
                        </FormGroup>
                        <FormGroup className="mb-3">
                          <Label>
                            DeviceName <span style={{ color: 'red' }}>*</span>
                          </Label>
                          <Input
                            type="text"
                            name="deviceName"
                            placeholder="Enter Device Name"
                            maxLength={50}
                            value={deviceFormik.values.deviceName}
                            onChange={deviceFormik.handleChange}
                            invalid={deviceFormik.touched.deviceName && !!deviceFormik.errors.deviceName}
                          />
                          <FormFeedback>
                            {deviceFormik.errors.deviceName}
                          </FormFeedback>
                        </FormGroup>
                        <FormGroup className="mb-3">
                          <Label>
                            IMEINo <span style={{ color: 'red' }}>*</span>
                          </Label>
                          <Input
                            type="text"
                            name="iMEINo"
                            placeholder="Enter IMEI No"
                            maxLength={75}
                            value={deviceFormik.values.iMEINo}
                            onChange={deviceFormik.handleChange}
                            invalid={deviceFormik.touched.iMEINo && !!deviceFormik.errors.iMEINo}
                          />
                          <FormFeedback>
                            {deviceFormik.errors.iMEINo}
                          </FormFeedback>
                        </FormGroup>
                        <FormGroup className="mb-3">
                          <Label>
                            SIMNo <span style={{ color: 'red' }}>*</span>
                          </Label>
                          <Input
                            type="text"
                            name="sIMNo"
                            placeholder="Enter SIM No"
                            maxLength={50}
                            value={deviceFormik.values.sIMNo}
                            onChange={deviceFormik.handleChange}
                            invalid={deviceFormik.touched.sIMNo && !!deviceFormik.errors.sIMNo}
                          />
                          <FormFeedback>
                            {deviceFormik.errors.sIMNo}
                          </FormFeedback>
                          <FormGroup switch className='mt-3'>
                            <div className="d-flex align-items-center">
                              <Input
                                type="switch"
                                name="isDeviceAllocated"
                                checked={deviceFormik.values.isDeviceAllocated}
                                onChange={deviceFormik.handleChange}
                              />
                              <Label check className="ms-2">
                                <span className={`badge text-uppercase ${deviceFormik.values.isDeviceAllocated
                                    ? 'bg-success-subtle text-success'
                                    : 'bg-danger-subtle text-danger'
                                  }`}>
                                  {deviceFormik.values.isDeviceAllocated ? 'Allocated' : 'Not Allocated'}
                                </span>
                              </Label>
                            </div>
                          </FormGroup>
                        </FormGroup>
                      </Col>
                    </Row>
                  </ModalBody>
                  <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
                    {/* <Button color="light" className="me-2" onClick={() => deviceFormik.resetForm()}>
                      Reset
                    </Button> */}
                    <Button color="primary" type="submit" className="me-2">
                      Save
                    </Button>
                    <Button color="danger" type="button" onClick={handleModalClose}>
                      Close
                    </Button>
                  </ModalFooter>
                </form>
              </Modal>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
}

export default MeterReaderDeviceAllocation;
