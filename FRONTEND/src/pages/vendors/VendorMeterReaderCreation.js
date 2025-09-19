import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button, Card, CardBody, CardHeader, Col, Container, FormGroup, Label, Row, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormFeedback } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { ToastContainer } from 'react-toastify';
import { getVendorMeterReaderCreation, getMeterVendorCreationsDpwns, createVendorMeterReader, updateVendorMeterReader } from "../../helpers/fakebackend_helper";
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

const VendorMeterReaderCreation = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [locationTypeName, setlocationTypeName] = useState([]);
  const [locations, setLocations] = useState([]);
  const [username, setUserName] = useState('system_user');
  const [readingDays, setReadingDays] = useState([]);
  const [response, setResponse] = useState('');
  const [searchText, setSearchText] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [readingDayDropdownOpen, setreadingDayDropdownOpen] = useState(false);

  // --- DROPDOWN Trigger and List refs ---
  const dropdownRef = useRef(null); // dropdown list
  const triggerRef = useRef(null);  // the clickable trigger for dropdown

  // FILTER & SORT
  const filteredData = useMemo(() => {
    if (!searchText) return originalData;
    const lowerSearch = searchText.toLowerCase();
    return originalData.filter(item =>
      item.vendorMeterReaderName?.toLowerCase().includes(lowerSearch) ||
      item.vendorMeterReaderCode?.toLowerCase().includes(lowerSearch) ||
      item.contactNo?.toLowerCase().includes(lowerSearch) ||
      item.locationName?.toLowerCase().includes(lowerSearch) ||
      item.locationTypeName?.toLowerCase().includes(lowerSearch)
    );
  }, [searchText, originalData]);

  const sortData = (data, key, direction) => {
    if (!key) return data;
    return [...data].sort((a, b) => {
      if (a[key] == null && b[key] == null) return 0;
      if (a[key] == null) return 1;
      if (b[key] == null) return -1;
      const aValue = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      return 0;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return sortData(filteredData, sortConfig.key, sortConfig.direction);
  }, [filteredData, sortConfig]);

  // Pagination
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
      header: 'LocationTypeName',
      accessorKey: 'locationTypeName',
      key: 'locationTypeName',
      sortable: true,
    },
    {
      header: 'LocationName',
      accessorKey: 'locationName',
      key: 'locationName',
      sortable: true,
    },
    {
      header: 'MeterReaderName',
      accessorKey: 'vendorMeterReaderName',
      key: 'vendorMeterReaderName',
      sortable: true,
    },
    {
      header: 'MeterReaderCode',
      accessorKey: 'vendorMeterReaderCode',
      key: 'vendorMeterReaderCode',
      sortable: true,
    },
    {
      header: 'ContactNo',
      accessorKey: 'contactNo',
      key: 'contactNo',
      sortable: true,
    },
    {
      header: 'MeterReadingDays',
      accessorKey: 'readingDay',
      key: 'readingDay',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      key: 'status',
      sortable: true,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      key: 'action',
      sortable: false,
    },
  ], []);

  useEffect(() => {
    getOnLoadingData();
  }, []);

  async function getOnLoadingData() {
    try {
      setLoading(true);
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const locationId = obj.user.locationId;
      const usernm = obj.user.loginName;
      const payload = {
        flagId: 1,
        requestUserName: usernm,
        locationId: locationId
      };
      const response = await getVendorMeterReaderCreation(payload);
      const allRoles = response.data;
      setData(allRoles);
      setOriginalData(allRoles);
      setUserName(usernm);
      setError(null);
      setSortConfig(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const flagIdFunction = async (flagId, setState, requestUserName, locationId, locationTypeId) => {
    try {
      const response = await getMeterVendorCreationsDpwns({
        flagId,
        requestUserName,
        locationId,
        locationTypeId
      });
      const options = response?.data || [];
      setState(options);
    } catch (error) {
      console.error(`Error fetching data for flagId ${flagId}:`, error.message);
    }
  };

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const usernm = obj.user.loginName;
    const locationId = obj.user.locationId;
    setUserName(usernm);
    flagIdFunction(4, setReadingDays, usernm);
    flagIdFunction(2, setlocationTypeName, usernm, locationId);
  }, []);

  const handleLocationTypeChange = async (e) => {
    const selectedLocationTypeId = e.target.value;
    formik.setFieldValue("locationTypeId", selectedLocationTypeId);
    await flagIdFunction(3, setLocations, username, null, Number(selectedLocationTypeId));
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      locationTypeId: "",
      locationId: "",
      vendorMeterReaderName: "",
      vendorMeterReaderCode: "",
      contactNo: "",
      readingDay: [],
      isDisabled: false,
    },
    validationSchema: Yup.object({
      locationTypeId: Yup.string().required("Please select LocationType"),
      locationId: Yup.string().required("Please select LocationName"),
      vendorMeterReaderName: Yup.string()
        .max(50, "Name cannot exceed 50 characters")
        .required("Please enter MeterReaderName"),
      vendorMeterReaderCode: Yup.string()
        .max(50, "Code cannot exceed 50 characters")
        .required("Please enter MeterReaderCode"),
      contactNo: Yup.string()
        .matches(/^[0-9]+$/, "ContactNo must be only digits")
        .min(10)
        .max(12)
        .required("Please enter ContactNo"),
      readingDay: Yup.array()
        .min(1, "Please select one or more days")
        .required("MeterReadingDay's is required"),
    }),

    onSubmit: async (values) => {
      try {
        setLoading(true);
        const formattedReadingDay = Array.isArray(values.readingDay)
          ? values.readingDay.join(',')
          : values.readingDay;

        const payload = {
          flagId: editMode ? 6 : 5,
          locationTypeId: parseInt(values.locationTypeId),
          locationId: parseInt(values.locationId),
          vendorMeterReaderId: editMode && editId != null ? editId : 0,
          vendorMeterReaderName: values.vendorMeterReaderName.trim(),
          vendorMeterReaderCode: values.vendorMeterReaderCode.trim(),
          contactNo: values.contactNo.trim(),
          readingDay: formattedReadingDay,
          isDisabled: values.isDisabled,
          requestUserName: username,
        };

        const response = editMode
          ? await updateVendorMeterReader(payload)
          : await createVendorMeterReader(payload);

        const { responseStatusCode, responseStatusCodeGUIDisplay } = response?.data[0] || {};
        setResponse(responseStatusCodeGUIDisplay);

        if (responseStatusCode === '000') {
          if (editMode) {
            setData(prevData =>
              prevData.map(item =>
                item.vendorMeterReaderId === editId
                  ? {
                    ...item,
                    vendorMeterReaderName: values.vendorMeterReaderName,
                    vendorMeterReaderCode: values.vendorMeterReaderCode,
                    contactNo: values.contactNo,
                    readingDay: formattedReadingDay,
                    isDisabled: values.isDisabled,
                    locationTypeId: values.locationTypeId,
                    locationId: values.locationId,
                    locationTypeName: locationTypeName.find(lt => lt.locationTypeId == values.locationTypeId)?.locationTypeName || item.locationTypeName,
                    locationName: locations.find(l => l.locationId == values.locationId)?.locationName || item.locationName,
                  }
                  : item
              )
            );
            setOriginalData(prevData =>
              prevData.map(item =>
                item.vendorMeterReaderId === editId
                  ? {
                    ...item,
                    vendorMeterReaderName: values.vendorMeterReaderName,
                    vendorMeterReaderCode: values.vendorMeterReaderCode,
                    contactNo: values.contactNo,
                    readingDay: formattedReadingDay,
                    isDisabled: values.isDisabled,
                    locationTypeId: values.locationTypeId,
                    locationId: values.locationId,
                    locationTypeName: locationTypeName.find(lt => lt.locationTypeId == values.locationTypeId)?.locationTypeName || item.locationTypeName,
                    locationName: locations.find(l => l.locationId == values.locationId)?.locationName || item.locationName,
                  }
                  : item
              )
            );
          } else {
            await getOnLoadingData();
          }
          setSuccessModal(true);
          setErrorModal(false);
          setModalOpen(false);
        } else {
          setSuccessModal(false);
          setErrorModal(true);
        }
      } catch (e) {
        console.error("Submit error:", e);
        setResponse('Failed to save: ' + (e?.message || 'Unexpected error'));
        setSuccessModal(false);
        setErrorModal(true);
      } finally {
        setLoading(false);
      }
    }
  });

  const prettyDayList = (days) => {
    if (!days) return "";
    if (Array.isArray(days)) return days.join(", ");
    if (typeof days === "string") return days;
    return days?.toString() || "";
  };

  const handleEditModalOpen = async (row) => {
    try {
      setLoading(true);
      setEditMode(true);
      setEditId(row.vendorMeterReaderId);

      const fetchedLocations = await getMeterVendorCreationsDpwns({
        flagId: 3,
        requestUserName: username,
        locationId: null,
        locationTypeId: row.locationTypeId,
      });

      setLocations(fetchedLocations?.data || []);

      const safeReadingDay = (() => {
        if (!row.readingDay) return [];
        if (Array.isArray(row.readingDay)) return row.readingDay.map(d => d?.toString()).filter(Boolean);
        if (typeof row.readingDay === 'string') return row.readingDay.split(',').map(d => d.trim()).filter(Boolean);
        return [row.readingDay?.toString()].filter(Boolean);
      })();

      formik.setValues({
        locationTypeId: row.locationTypeId?.toString() || "",
        locationId: row.locationId?.toString() || "",
        vendorMeterReaderName: row.vendorMeterReaderName || "",
        vendorMeterReaderCode: row.vendorMeterReaderCode || "",
        contactNo: row.contactNo || "",
        readingDay: safeReadingDay,
        isDisabled: row.isDisabled || false,
      });

      setModalOpen(true);
    } catch (error) {
      console.error("Error in edit modal open:", error);
      setError("Failed to load edit data");
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = () => {
    setEditMode(false);
    setEditId(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditId(null);
    formik.resetForm();
    setreadingDayDropdownOpen(false);
  };

  const handleTogglereadingDayDropdown = (e) => {
    setreadingDayDropdownOpen((prev) => !prev);
  };

  // DROPDOWN SELECTIONS: highlight only, no checkboxes
  const handleReadingDayToggle = (day) => {
    const dayStr = day.toString();
    let selected = [...formik.values.readingDay];
    if (selected.includes(dayStr)) {
      selected = selected.filter(d => d !== dayStr);
    } else {
      selected.push(dayStr);
    }
    formik.setFieldValue("readingDay", selected);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchText(term);
    setPage(0);
  };

  // --- OUTSIDE CLICK LOGIC FOR DROPDOWN (updated) ---
  useEffect(() => {
    if (!readingDayDropdownOpen) return;
    function handleClickOutside(event) {
      // If target is NOT the dropdown or trigger, close dropdown
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setreadingDayDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [readingDayDropdownOpen]);

  // Table header: active sort feedback & toggle
  const renderTableHeader = () => (
    <tr>
      {columns.map((col, idx) => {
        if (!col.sortable) {
          return <th key={col.key || idx}>{col.header}</th>;
        }
        const active = sortConfig && sortConfig.key === col.key;
        return (
          <th
            key={col.key || idx}
            onClick={() => {
              if (!col.sortable) return;
              if (sortConfig && sortConfig.key === col.key) {
                setSortConfig({
                  key: col.key,
                  direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                });
              } else {
                setSortConfig({ key: col.key, direction: 'asc' });
              }
            }}
            style={{
              cursor: col.sortable ? 'pointer' : 'default',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              paddingRight: 14,
              verticalAlign: "middle"
            }}
          >
            {col.header}
            <SortArrows active={active} direction={active ? sortConfig.direction : null} />
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
        <td>{row.locationTypeName}</td>
        <td>{row.locationName}</td>
        <td>{row.vendorMeterReaderName}</td>
        <td>{row.vendorMeterReaderCode}</td>
        <td>{row.contactNo}</td>
        <td>{prettyDayList(row.readingDay)}</td>
        <td>
          {row.isDisabled ? (
            <span className="badge bg-danger-subtle text-danger text-uppercase">Inactive</span>
          ) : (
            <span className="badge bg-success-subtle text-success text-uppercase">Active</span>
          )}
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button
              color="primary"
              className="btn-sm edit-item-btn"
              onClick={() => handleEditModalOpen(row)}
              disabled={loading}
            >
              {loading && row.vendorMeterReaderId === editId ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="ri-edit-2-line"></i>
              )}
            </Button>
          </div>
        </td>
      </tr>
    ));
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
          <BreadCrumb title="VendorMeterReader Creation" pageTitle="Pages" />

          {error && (
            <div className="alert alert-danger">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="bg-primary text-white p-3">
                  <Row className="g-4 align-items-center">
                    <Col className="d-flex align-items-center">
                      <h4 className="mb-0 card-title text-white">
                        VendorMeterReader Creation
                      </h4>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row className="g-4 mb-3">
                    <Col sm={4}>
                      <div className="search-box ms-2">
                        <Input
                          id="searchResultList"
                          type="text"
                          className="form-control"
                          placeholder="Search for Meter Reader..."
                          value={searchText}
                          onChange={handleSearch}
                          disabled={loading}
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </Col>
                    <Col sm>
                      <div className="d-flex justify-content-sm-end">
                        <Button
                          color="primary"
                          className="add-btn me-1"
                          onClick={handleModalOpen}
                          disabled={loading}
                          id="create-btn"
                        >
                          <i className="ri-add-fill me-1 align-bottom"></i> Add
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={12}>
                      {loading ? (
                        <div className="text-center my-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      ) : (
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
                      )}
                      {!loading && renderPagination()}
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal Form */}
      <Modal isOpen={modalOpen} toggle={handleModalClose} centered size="lg">
        <ModalHeader
          className="bg-primary text-white p-3"
          toggle={handleModalClose}
        >
          <span className="modal-title text-white">
            {editMode ? "Update VendorMeterReader" : "Add VendorMeterReader"}
          </span>
        </ModalHeader>

        <form
          className="tablelist-form"
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit();
            return false;
          }}
        >
          <ModalBody>
            <div className="mb-3 fw text-muted">
              Please fill mandatory information below <span className="text-danger">*</span>
            </div>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    LocationTypeName <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    name="locationTypeId"
                    onChange={handleLocationTypeChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.locationTypeId}
                    invalid={!!formik.touched.locationTypeId && !!formik.errors.locationTypeId}
                    disabled={loading}
                  >
                    <option value="">Select locationTypeName</option>
                    {locationTypeName.map((t) => (
                      <option key={t.locationTypeId} value={t.locationTypeId}>
                        {t.locationTypeName}
                      </option>
                    ))}
                  </Input>
                  <FormFeedback>{formik.errors.locationTypeId}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>MeterReaderName <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="vendorMeterReaderName"
                    maxLength={50}
                    placeholder="Enter MeterReaderName "
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.vendorMeterReaderName}
                    invalid={!!formik.touched.vendorMeterReaderName && !!formik.errors.vendorMeterReaderName}
                    disabled={loading}
                  />
                  <FormFeedback>{formik.errors.vendorMeterReaderName}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>LocationName <span className="text-danger">*</span></Label>
                  <Input
                    type="select"
                    name="locationId"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.locationId}
                    invalid={!!formik.touched.locationId && !!formik.errors.locationId}
                    disabled={loading || !formik.values.locationTypeId}
                  >
                    <option value="">Select Location</option>
                    {locations.map(l => (
                      <option key={l.locationId} value={l.locationId}>{l.locationName}</option>
                    ))}
                  </Input>
                  <FormFeedback>{formik.errors.locationId}</FormFeedback>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>MeterReaderCode <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="vendorMeterReaderCode"
                    maxLength={50}
                    placeholder="Enter MeterReaderCode"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.vendorMeterReaderCode}
                    invalid={!!formik.touched.vendorMeterReaderCode && !!formik.errors.vendorMeterReaderCode}
                    disabled={loading}
                  />
                  <FormFeedback>{formik.errors.vendorMeterReaderCode}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                {/* Dropdown Trigger + List get new refs */}
                <FormGroup style={{ position: "relative" }}>
                  <Label>MeterReadingDay's <span className="text-danger">*</span></Label>
                  <div
                    className={`form-control d-flex justify-content-between align-items-center`}
                    style={{
                      cursor: "pointer",
                      border: !!formik.touched.readingDay && formik.errors.readingDay ? "1px solid #dc3545" : "",
                    }}
                    tabIndex={0}
                    ref={triggerRef}
                    onClick={e => !loading && handleTogglereadingDayDropdown(e)}
                  >
                    <span>
                      {formik.values.readingDay.length
                        ? prettyDayList(formik.values.readingDay)
                        : "Select Meter ReadingDays"}
                    </span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 8L10 13L15 8"
                        stroke="#6c757d"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {readingDayDropdownOpen && (
                    <div
                      className="shadow"
                      ref={dropdownRef}
                      style={{
                        position: "absolute",
                        width: "100%",
                        background: "#fff",
                        zIndex: 10,
                        borderRadius: 4,
                        border: "1px solid #dee2e6",
                        maxHeight: 240,
                        overflowY: "auto",
                        marginTop: 2,
                      }}
                    >
                      {readingDays.map(day => {
                        const checked = formik.values.readingDay.includes(day.readingDay.toString());
                        return (
                          <div
                            key={day.readingDay}
                            className="dropdown-item"
                            style={{
                              padding: "6px 12px",
                              cursor: "pointer",
                              display: 'flex',
                              alignItems: 'center',
                              background: checked ? '#eaf2fb' : undefined,
                              fontWeight: checked ? 500 : undefined,
                              color: checked ? '#0266d6' : undefined
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              handleReadingDayToggle(day.readingDay);
                            }}
                          >
                            <span style={{ userSelect: 'none' }}>{day.readingDay}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {formik.touched.readingDay && formik.errors.readingDay && (
                    <div className="text-danger mt-1">{formik.errors.readingDay}</div>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>ContactNo <span className="text-danger">*</span></Label>
                  <Input
                    type="text"
                    name="contactNo"
                    maxLength={12}
                    placeholder="Enter ContactNo "
                    onChange={(e) => {
                      const re = /^[0-9\b]+$/;
                      if (e.target.value === '' || re.test(e.target.value)) {
                        formik.handleChange(e);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    value={formik.values.contactNo}
                    invalid={!!formik.touched.contactNo && !!formik.errors.contactNo}
                    disabled={loading}
                  />
                  <FormFeedback>{formik.errors.contactNo}</FormFeedback>
                </FormGroup>
              </Col>
            </Row>

            {editMode && (
              <Row>
                <Col md={12}>
                  <FormGroup className="mb-3">
                    <div className="form-check form-switch form-switch-lg" dir="ltr">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        id="statusToggle"
                        checked={!formik.values.isDisabled}
                        onChange={(e) => {
                          formik.setFieldValue("isDisabled", !e.target.checked);
                        }}
                        disabled={loading}
                      />
                      <Label className="form-check-label" htmlFor="statusToggle">
                        Status: {' '}
                        <span className={`badge text-uppercase ${!formik.values.isDisabled
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                          }`}>
                          {!formik.values.isDisabled ? 'Active' : 'Inactive'}
                        </span>
                      </Label>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter className="text-white justify-content-end" style={{ borderTop: "none" }}>
            <Button color="primary" type="submit" className="me-2" id="add-btn" disabled={loading}>
              {loading ? 'Processing...' : (editMode ? 'Update' : 'Save')}
            </Button>
            <Button color="danger" onClick={handleModalClose}>
              Close
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </React.Fragment>
  );
};

export default VendorMeterReaderCreation;