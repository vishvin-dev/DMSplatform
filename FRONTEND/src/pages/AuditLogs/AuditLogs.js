import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Input, Table, Spinner, Badge, Button
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { LoginAudit } from '../../helpers/fakebackend_helper';

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



const LoginAuditLogs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const columns = [
    { key: 'DeviceDateTime', label: 'Login Time', sortable: true },
    { key: 'RequestUserName', label: 'Username', sortable: true },
    { key: 'Device', label: 'Device', sortable: true },
    { key: 'OSName', label: 'OS', sortable: true },
    { key: 'IPAddress', label: 'IP Address', sortable: true },
    { key: 'BrowserName', label: 'Browser', sortable: true },
    { key: 'BrowserVersion', label: 'Version', sortable: true },
    { key: 'Latitude', label: 'Latitude', sortable: true },
    { key: 'Longitude', label: 'Longitude', sortable: true },
    { key: 'CreatedOn', label: 'Created On', sortable: true },
    { key: 'UpdatedOn', label: 'Updated On', sortable: true },
    { key: 'Status', label: 'Status', sortable: false }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const requestPayload = {
          flagId: 1,
          requestUserName: "adminuser"
        };
        const response = await LoginAudit(requestPayload);
        if (response?.status === "success" && Array.isArray(response.result)) {
          setData(response.result);
        } else {
          setError(response?.message || "Unexpected data format from server");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch login audit data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-IN', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateTimeString;
    }
  };

  const formatCoordinate = (coord) => {
    if (!coord && coord !== 0) return 'N/A';
    return parseFloat(coord).toFixed(4);
  };

  const getStatusBadge = (isDisabled) => (
    <Badge className={`text-uppercase ${isDisabled ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
      {isDisabled ? 'Inactive' : 'Active'}
    </Badge>
  );

  document.title = `Audit Logs | DMS`;

  const sortData = (data, key, direction) => {
    if (!key || !direction) return data;
    return [...data].sort((a, b) => {
      if (['DeviceDateTime', 'CreatedOn', 'UpdatedOn'].includes(key)) {
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

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const lower = searchText.toLowerCase();
    return data.filter(item => {
      if (!item) return false;
      
      const searchFields = [
        item.RequestUserName,
        item.IPAddress,
        item.Device,
        item.BrowserName,
        item.BrowserVersion,
        item.OSName
      ];
      
      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(lower)
      );
    });
  }, [data, searchText]);

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
          <td colSpan={columns.length} className="text-center py-4">No data found</td>
        </tr>
      );
    }

    return paginatedData.map((row, idx) => (
      <tr key={row.UserLoginDetailID || idx}>
        <td>{formatDateTime(row.DeviceDateTime)}</td>
        <td>{row.RequestUserName || 'N/A'}</td>
        <td>{row.Device || 'N/A'}</td>
        <td>{row.OSName || 'N/A'}</td>
        <td>{row.IPAddress || 'N/A'}</td>
        <td>{row.BrowserName || 'N/A'}</td>
        <td>{row.BrowserVersion || 'N/A'}</td>
        <td>{formatCoordinate(row.Latitude)}</td>
        <td>{formatCoordinate(row.Longitude)}</td>
        <td>{formatDateTime(row.CreatedOn)}</td>
        <td>{formatDateTime(row.UpdatedOn)}</td>
        <td>{getStatusBadge(row.IsDisabled)}</td>
      </tr>
    ));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Login Audit Logs" pageTitle="Audit Logs" />
        <Card>
          <CardHeader className="bg-primary">
            <h4 className="mb-0 text-white">Login Audit Logs</h4>
          </CardHeader>
          <CardBody>
            <Row className="mb-3">
              <Col md={4}>
                <Input
                  type="text"
                  className="form-control"
                  placeholder="Search by username, IP, device or browser"
                  value={searchText}
                  onChange={e => {
                    setSearchText(e.target.value);
                    setPage(0);
                  }}
                />
              </Col>
            </Row>
            <div className="table-responsive">
              <Table bordered hover>
                <thead className="table-light">{renderTableHeader()}</thead>
                <tbody>{renderTableRows()}</tbody>
              </Table>
            </div>
            {filteredData.length > 0 && !loading && renderPagination()}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default LoginAuditLogs;