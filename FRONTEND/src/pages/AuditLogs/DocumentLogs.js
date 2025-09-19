import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Input, Table, Spinner, Badge, Button, Label, Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getAllUserDropDownss, documentAudit } from '../../helpers/fakebackend_helper';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Date range options component
const DateRangeOptions = ({ value, onChange }) => {
  const handleDateRangeChange = (range) => {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setDate(now.getDate() + (6 - now.getDay()));
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        // For custom, set default to last 7 days
        startDate = new Date(now.setDate(now.getDate() - 7));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    onChange({
      selection: range,
      startDate,
      endDate
    });
  };

  const formatDate = (date) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  // Get today's date in YYYY-MM-DD format for max date attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Handle start date change with validation
  const handleStartDateChange = (dateString) => {
    const newStartDate = dateString ? new Date(dateString) : null;

    // If new start date is after current end date, adjust end date
    let newEndDate = value.endDate;
    if (newStartDate && value.endDate && newStartDate > value.endDate) {
      newEndDate = new Date(newStartDate);
      newEndDate.setHours(23, 59, 59, 999);
    }

    onChange({
      ...value,
      startDate: newStartDate,
      endDate: newEndDate
    });
  };

  // Handle end date change with validation
  const handleEndDateChange = (dateString) => {
    const newEndDate = dateString ? new Date(dateString) : null;

    // If new end date is before current start date, adjust start date
    let newStartDate = value.startDate;
    if (newEndDate && value.startDate && newEndDate < value.startDate) {
      newStartDate = new Date(newEndDate);
      newStartDate.setHours(0, 0, 0, 0);
    }

    // Ensure end date doesn't exceed today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (newEndDate && newEndDate > today) {
      newEndDate = new Date(today);
    }

    onChange({
      ...value,
      startDate: newStartDate,
      endDate: newEndDate
    });
  };

  return (
    <div>
      <Label className="form-label">Date Range</Label>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Button
          color={value.selection === 'day' ? 'primary' : 'light'}
          size="sm"
          onClick={() => handleDateRangeChange('day')}
        >
          Day
        </Button>
        <Button
          color={value.selection === 'week' ? 'primary' : 'light'}
          size="sm"
          onClick={() => handleDateRangeChange('week')}
        >
          Week
        </Button>
        <Button
          color={value.selection === 'month' ? 'primary' : 'light'}
          size="sm"
          onClick={() => handleDateRangeChange('month')}
        >
          Monthly
        </Button>
        <Button
          color={value.selection === 'custom' ? 'primary' : 'light'}
          size="sm"
          onClick={() => handleDateRangeChange('custom')}
        >
          Custom Range
        </Button>
      </div>

      {value.selection && (
        <div className="mt-2 p-2 border rounded bg-light">
          <div className="mb-2">
            <strong>Selected Range:</strong> {formatDate(value.startDate)} to {formatDate(value.endDate)}
          </div>

          {value.selection === 'custom' && (
            <Row>
              <Col md={6}>
                <Label className="form-label">From</Label>
                <Input
                  type="date"
                  value={value.startDate ? value.startDate.toISOString().split('T')[0] : ''}
                  onChange={e => handleStartDateChange(e.target.value)}
                  max={getTodayDate()} // Disable future dates
                />
              </Col>
              <Col md={6}>
                <Label className="form-label">To</Label>
                <Input
                  type="date"
                  value={value.endDate ? value.endDate.toISOString().split('T')[0] : ''}
                  onChange={e => handleEndDateChange(e.target.value)}
                  max={getTodayDate()} // Disable future dates
                />
              </Col>
            </Row>
          )}
        </div>
      )}
    </div>
  );
};

const SORT_ARROW_SIZE = 13; // px

function SortArrows({ direction, active }) {
  return (
    <span style={{ marginLeft: 6, display: 'inline-block', verticalAlign: 'middle', height: 28 }}>
      <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block' }}>
        <polyline
          points="3,8 6.5,4 10,8"
          fill="none"
          stroke={active && direction === 'asc' ? '#1064ea' : '#c1c5ca'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg width={SORT_ARROW_SIZE} height={SORT_ARROW_SIZE} viewBox="0 0 13 13" style={{ display: 'block', marginTop: -2 }}>
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

const DocumentLogs = () => {
  // State for UI flow
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedSubOption, setSelectedSubOption] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(''); // New state to store Role_Id
  const [searchValue, setSearchValue] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState({
    selection: '',
    startDate: null,
    endDate: null
  });

  // New state to track if search has been performed
  const [searchPerformed, setSearchPerformed] = useState(false);

  // State for data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // State for API data
  const [roleDropdownData, setRoleDropdownData] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  // State for export dropdown
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Hardcoded options for first dropdown
  const mainOptions = [
    { value: '', label: 'Select Category' },
    { value: 'User Logs', label: 'User Logs' },
    { value: 'accountID', label: 'Account ID' }
  ];

  // Updated columns based on API response
  const columns = [
    { key: 'rr_no', label: 'RR No', sortable: true },
    { key: 'DocumentName', label: 'Document Name', sortable: true },
    { key: 'DocumentCategory', label: 'Document Category', sortable: true },
    { key: 'CurrentStatus', label: 'Status', sortable: true },
    { key: 'UploadedByFirstName', label: 'Uploaded By', sortable: true },
    { key: 'DocumentCreatedAt', label: 'Created At', sortable: true },
    { key: 'UploadedAt', label: 'Uploaded At', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'ActionByFirstName', label: 'Action By', sortable: true },
  ];

  // Fetch role dropdown data
  useEffect(() => {
    const fetchRoleDropdownData = async () => {
      try {
        setLoadingDropdown(true);
        const userEmail = sessionStorage.getItem('userEmail')// Fallback to default if not found
        const requestData = {
          flagId: 6,
          requestUserName: userEmail
        };

        const response = await getAllUserDropDownss(requestData);

        if (response.status === "success") {
          setRoleDropdownData(response.data);
        } else {
          setError("Failed to fetch role dropdown data");
        }
      } catch (error) {
        console.error("Error fetching role dropdown data:", error);
        setError("Error fetching role dropdown data");
        setRoleDropdownData([]);
      } finally {
        setLoadingDropdown(false);
      }
    };

    fetchRoleDropdownData();
  }, []);

  // Get unique values for the selected option from API data
  const getSubOptions = () => {
    if (!selectedOption || !roleDropdownData.length) return [];

    // For role dropdown, we want to show RoleName values but store Role_Id
    const uniqueValues = new Set();
    const options = [];

    roleDropdownData.forEach(role => {
      // Check if the RoleName exists and has a value
      if (role.RoleName && !uniqueValues.has(role.RoleName)) {
        uniqueValues.add(role.RoleName);
        options.push({
          value: role.Role_Id, // Store Role_Id as value
          label: role.RoleName, // Display RoleName as label
          roleName: role.RoleName // Keep RoleName for reference
        });
      }
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeString;
    }
  };

  const getStatusBadge = (status) => {
    let color = 'secondary';
    if (status === 'Approved') color = 'success';
    if (status === 'Rejected') color = 'danger';
    if (status === 'Pending') color = 'warning';
    if (status === 'In Review') color = 'info';

    return (
      <Badge className={`text-uppercase bg-${color}-subtle text-${color}`}>
        {status || 'Pending'}
      </Badge>
    );
  };

  document.title = `Document Logs | DMS`;

  const sortData = (data, key, direction) => {
    if (!key || !direction) return data;
    return [...data].sort((a, b) => {
      if (['DocumentCreatedAt', 'UploadedAt', 'ActionTime'].includes(key)) {
        const dateA = new Date(a[key]).getTime();
        const dateB = new Date(b[key]).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      const aValue = a[key] === null || a[key] === undefined ? '' : a[key];
      const bValue = b[key] === null || b[key] === undefined ? '' : b[key];
      let aVal = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
      let bVal = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;

      if (direction === 'asc') {
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      } else {
        if (aVal > bVal) return -1;
        if (aVal < bVal) return 1;
        return 0;
      }
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const userEmail = sessionStorage.getItem('userEmail') || 'Admin';

      // Prepare request data based on search type
      let requestData;

      if (selectedOption === 'accountID') {
        // Account ID search - use flagId: 2
        requestData = {
          flagId: 2,
          account_Id: searchValue,
          requestUserName: userEmail
        };
      } else {
        // Other searches - use flagId: 1
        requestData = {
          flagId: 1,
          searchValue: searchValue,
          Role_Id: selectedRoleId,
          requestUserName: userEmail
        };

        // Add filterType and filterValue based on date range selection
        if (dateRange.selection) {
          switch (dateRange.selection) {
            case 'day':
              requestData.filterType = 'datewise';
              requestData.filterValue = dateRange.startDate.toISOString().split('T')[0];
              break;
            case 'week':
              requestData.filterType = 'weekly';
              requestData.filterValue = dateRange.startDate.toISOString().split('T')[0];
              break;
            case 'month':
              requestData.filterType = 'monthly';
              requestData.filterValue = [
                dateRange.startDate.getMonth() + 1,
                dateRange.startDate.getFullYear()
              ];
              break;
            case 'custom':
              requestData.filterType = 'range';
              requestData.filterValue = [
                dateRange.startDate.toISOString().split('T')[0],
                dateRange.endDate.toISOString().split('T')[0]
              ];
              break;
            default:
              // No filter
              break;
          }
        }
      }

      const response = await documentAudit(requestData);

      if (response.status === "success") {
        setData(response.result || []);
      } else {
        setError(response.message || "Failed to fetch document logs");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching document logs:", error);
      setError("Error fetching document logs");
      setData([]);
    } finally {
      setLoading(false);
      setSearchPerformed(true);
    }
  };

  const handleClear = () => {
    setSelectedOption('');
    setSelectedSubOption('');
    setSelectedRoleId('');
    setSearchValue('');
    setShowDateRange(false);
    setDateRange({
      selection: '',
      startDate: null,
      endDate: null
    });
    setPage(0);
    setData([]);
    setSearchPerformed(false);
  };

  // Export to Excel function
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedData.map(item => ({
      'RR No': item.rr_no || 'N/A',
      'Document Name': item.DocumentName || 'N/A',
      'Document Category': item.DocumentCategory || 'N/A',
      'Status': item.CurrentStatus || 'N/A',
      'Uploaded By': item.UploadedByFirstName || 'N/A',
      'Created At': formatDateTime(item.DocumentCreatedAt),
      'Uploaded At': formatDateTime(item.UploadedAt),
      'Section': item.section || 'N/A',
      'Action By': item.ActionByFirstName || 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Document Logs');

    // Generate file name with timestamp
    const fileName = `Document_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Document Audit Logs', 14, 15);

    // Add date range if available
    if (dateRange.startDate && dateRange.endDate) {
      doc.setFontSize(10);
      doc.text(`Date Range: ${dateRange.startDate.toISOString().split('T')[0]} to ${dateRange.endDate.toISOString().split('T')[0]}`, 14, 22);
    }

    // Add export date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 29);

    // Prepare table data
    const tableData = sortedData.map(item => [
      item.rr_no || 'N/A',
      item.DocumentName || 'N/A',
      item.DocumentCategory || 'N/A',
      item.CurrentStatus || 'N/A',
      item.UploadedByFirstName || 'N/A',
      formatDateTime(item.DocumentCreatedAt),
      formatDateTime(item.UploadedAt),
      item.section || 'N/A',
      item.ActionByFirstName || 'N/A'
    ]);

    // Define table columns
    const tableColumns = [
      'RR No',
      'Document Name',
      'Document Category',
      'Status',
      'Uploaded By',
      'Created At',
      'Uploaded At',
      'Section',
      'Action By'
    ];

    // Add table
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Save the PDF
    doc.save(`Document_Logs_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const filteredData = useMemo(() => {
    let result = data;

    // Apply search text filter
    if (searchValue && selectedOption !== 'accountID') {
      const lower = searchValue.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(lower)
        )
      );
    }

    return result;
  }, [data, searchValue, selectedOption]);

  const sortedData = useMemo(() => {
    return sortData(filteredData, sortConfig.key, sortConfig.direction);
  }, [filteredData, sortConfig]);

  const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    return sortedData.slice(page * pageSize, (page + 1) * pageSize);
  }, [sortedData, page, pageSize]);

  const renderTableHeader = () => (
    <tr>
      {columns.map((col, idx) => {
        if (!col.sortable) {
          return <th key={col.key || idx}>{col.label}</th>;
        }
        const active = sortConfig.key === col.key && sortConfig.direction !== null;
        const direction = sortConfig.direction;
        return (
          <th
            key={col.key || idx}
            onClick={() => {
              if (!col.sortable) return;
              setSortConfig(prev =>
                prev.key !== col.key
                  ? { key: col.key, direction: 'asc' }
                  : prev.direction === 'asc'
                    ? { key: col.key, direction: 'desc' }
                    : { key: null, direction: null }
              );
              setPage(0);
            }}
            style={{
              cursor: col.sortable ? 'pointer' : 'default',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              paddingRight: 14,
              verticalAlign: 'middle',
            }}
          >
            {col.label}
            {col.sortable && <SortArrows active={active} direction={direction} />}
          </th>
        );
      })}
    </tr>
  );

  const renderPagination = () => {
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
                {pageSize === -1 ? sortedData.length : (page * pageSize) + 1}-{Math.min((page + 1) * pageSize, sortedData.length)}
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
                border: '1px solid ',
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
              {[5, 10, 15, 25, 50, 100, -1].map(size => (
                <option key={size} value={size}>{size === -1 ? 'All' : size}</option>
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
              if (pageNum >= 0 && pageNum < pageCount) {
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
              } else {
                return null;
              }
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
    if (loading) {
      return (
        <tr>
          <td colSpan={columns.length} className="text-center py-4">
            <Spinner color="primary" /> <span className="ms-2">Loading...</span>
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={columns.length} className="text-danger text-center py-4">{error}</td>
        </tr>
      );
    }
    if (paginatedData.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="text-center py-4">No documents found</td>
        </tr>
      );
    }

    return paginatedData.map((row, idx) => (
      <tr key={row.rr_no || idx}>
        <td>{row.rr_no || 'N/A'}</td>
        <td>{row.DocumentName || 'N/A'}</td>
        <td>{row.DocumentCategory || 'N/A'}</td>
        <td>{getStatusBadge(row.CurrentStatus)}</td>
        <td>{row.UploadedByFirstName || 'N/A'}</td>
        <td>{formatDateTime(row.DocumentCreatedAt)}</td>
        <td>{formatDateTime(row.UploadedAt)}</td>
        <td>{row.section || 'N/A'}</td>
        <td>{row.ActionByFirstName || 'N/A'}</td>
      </tr>
    ));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Document Audit Logs" pageTitle="Audit Logs" />
        <Card>
          <CardHeader className="bg-primary">
            <h4 className="mb-0 text-white">Document Audit Logs</h4>
          </CardHeader>
          <CardBody>
            <Row className="mb-3">
              <Col md={3}>
                <Label className="form-label">Filter By</Label>
                <Input
                  type="select"
                  value={selectedOption}
                  onChange={e => {
                    setSelectedOption(e.target.value);
                    setSelectedSubOption('');
                    setSelectedRoleId('');
                    setSearchValue('');
                    setShowDateRange(false);
                    setDateRange({ selection: '', startDate: null, endDate: null });
                    setPage(0);
                    setSearchPerformed(false);
                  }}
                >
                  {mainOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Input>
              </Col>

              {selectedOption && selectedOption !== 'accountID' && (
                <Col md={3}>
                  <Label className="form-label">Select Role</Label>
                  {loadingDropdown ? (
                    <div className="d-flex align-items-center">
                      <Spinner size="sm" className="me-2" /> Loading...
                    </div>
                  ) : (
                    <Input
                      type="select"
                      value={selectedSubOption}
                      onChange={e => {
                        const selectedValue = e.target.value;
                        const selectedOption = getSubOptions().find(opt => opt.value.toString() === selectedValue);

                        setSelectedSubOption(selectedValue);
                        setSelectedRoleId(selectedValue); // Store Role_Id
                        setSearchValue('');
                        setShowDateRange(true);
                        setDateRange({ selection: '', startDate: null, endDate: null });
                        setPage(0);
                        setSearchPerformed(false);
                      }}
                    >
                      <option value="">Select Role</option>
                      {getSubOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Input>
                  )}
                </Col>
              )}

              {selectedOption === 'accountID' && (
                <Col md={3}>
                  <Label className="form-label">Account ID</Label>
                  <Input
                    type="text"
                    placeholder="Enter Account ID..."
                    value={searchValue}
                    onChange={e => {
                      setSearchValue(e.target.value);
                      setPage(0);
                    }}
                  />
                </Col>
              )}

              {showDateRange && selectedOption !== 'accountID' && (
                <Col md={3}>
                  <Label className="form-label">Search Text</Label>
                  <Input
                    type="text"
                    placeholder="Enter search text..."
                    value={searchValue}
                    onChange={e => {
                      setSearchValue(e.target.value);
                      setPage(0);
                    }}
                  />
                </Col>
              )}


              {showDateRange && selectedOption !== 'accountID' && (
                <Col md={3}>
                  <DateRangeOptions value={dateRange} onChange={setDateRange} />
                </Col>
              )}
            </Row>


            {(showDateRange || selectedOption === 'accountID') && (
              <Row className="mb-3">
                <Col className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      color="primary"
                      onClick={handleSearch}
                      disabled={selectedOption === 'accountID' ? !searchValue : !selectedRoleId}
                    >
                      Search
                    </Button>
                    <Button
                      color="secondary"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                    {data.length > 0 && (
                      <Dropdown isOpen={exportDropdownOpen} toggle={() => setExportDropdownOpen(!exportDropdownOpen)}>
                        <DropdownToggle color="primary" caret>
                          <i className="ri-download-line align-bottom me-1"></i> Export
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={exportToExcel}>
                            <i className="ri-file-excel-line align-bottom me-1"></i> Export to Excel
                          </DropdownItem>
                          <DropdownItem onClick={exportToPDF}>
                            <i className="ri-file-pdf-line align-bottom me-1"></i> Export to PDF
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>
                </Col>
              </Row>
            )}

            {/* Only show table when search has been performed */}
            {searchPerformed && (
              <>
                <h5 className="mb-3">Search Results</h5>

                <div className="table-responsive">
                  <Table bordered hover>
                    <thead className="table-light">{renderTableHeader()}</thead>
                    <tbody>{renderTableRows()}</tbody>
                  </Table>
                </div>
                {renderPagination()}
              </>
            )}

            {(searchPerformed && data.length === 0 && !loading) && (
              <div className="text-center py-4">
                No documents match your search criteria
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default DocumentLogs;