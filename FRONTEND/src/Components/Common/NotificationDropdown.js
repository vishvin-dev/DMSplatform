import React, { useState, useRef, useEffect } from 'react';
import {
    Col,
    Dropdown,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    Tooltip
} from 'reactstrap';
import classnames from 'classnames';
import { useSelector, useDispatch } from "react-redux";
import SimpleBar from "simplebar-react";
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../../src/slices/auth/login/reducer';

const NotificationDropdown = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.Login?.notification || []);

    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [hoveredNotification, setHoveredNotification] = useState(null);
    const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
    const [viewAllMode, setViewAllMode] = useState({
        '1': false,
        '2': false,
        '3': false
    });

    const notificationRefs = useRef({});
    const dropdownRef = useRef(null);

    const getFilteredNotifications = (tab) => {
        switch (tab) {
            case '1': return notifications;
            case '2': return notifications.filter(n => n.NotificationTypeName === 'IsNotification');
            case '3': return notifications.filter(n => n.NotificationTypeName === 'IsAlter');
            default: return [];
        }
    };

    useEffect(() => {
        if (notifications.length > 0) {
            setIsLoading(false);
        }
    }, [notifications]);

    const unreadCount = notifications.filter(n => n.IsNotification === 1 || n.IsAlter === 1).length;
    const messageCount = notifications.filter(n => n.NotificationTypeName === 'IsNotification').length;
    const alertCount = notifications.filter(n => n.NotificationTypeName === 'IsAlter').length;

    const toggleNotificationDropdown = () => {
        setIsNotificationDropdown(!isNotificationDropdown);
        setHoveredNotification(null);
        if (isNotificationDropdown) {
            setViewAllMode({
                '1': false,
                '2': false,
                '3': false
            });
        }
    };

    const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setHoveredNotification(null);
        }
    };

    const handleMouseEnter = (notification, event) => {
        setHoveredNotification(notification);
        const rect = event.currentTarget.getBoundingClientRect();
        const dropdownRect = dropdownRef.current?.getBoundingClientRect();

        setPreviewPosition({
            top: rect.top,
            left: dropdownRect ? dropdownRect.left - 250 : rect.left - 250
        });
    };

    const handleMouseLeave = () => {
        setHoveredNotification(null);
    };

    const toggleViewAll = (tabId) => {
        setViewAllMode(prev => ({
            ...prev,
            [tabId]: !prev[tabId]
        }));
    };

    const handleMarkAsRead = (notificationId) => {
        try {
            dispatch(markNotificationAsRead(notificationId));
            // Force update the hovered notification state
            setHoveredNotification(prev => {
                if (prev && prev.notificationId === notificationId) {
                    return { ...prev, IsNotification: 0, IsAlter: 0 };
                }
                return prev;
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = () => {
        console.log('Marking all notifications as read'); // Debug log
        dispatch(markAllNotificationsAsRead());
    };

    const renderNotifications = (notifications, tabId) => {
        if (isLoading) {
            return (
                <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        return notifications.length > 0 ? (
            notifications.map((notification) => (
                <div
                    key={notification.notificationId}
                    ref={el => notificationRefs.current[notification.notificationId] = el}
                    className={`text-reset notification-item d-block dropdown-item position-relative ${notification.IsNotification === 1 || notification.IsAlter === 1 ? 'unread' : ''}`}
                    onMouseEnter={(e) => handleMouseEnter(notification, e)}
                    onMouseLeave={handleMouseLeave}
                // Removed the onClick handler that was marking as read
                >
                    <div className="d-flex">
                        <div className="avatar-xs me-2">
                            <span className={`avatar-title ${notification.NotificationTypeName === 'IsAlter' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} rounded-circle fs-14`}>
                                <i className={notification.NotificationTypeName === 'IsAlter' ? 'bx bx-error-circle' : 'bx bx-message-detail'}></i>
                            </span>
                        </div>
                        <div className="flex-grow-1">
                            <h6 className="mt-0 mb-1 lh-base fs-13">{notification.notificationNote}</h6>
                            <p className="mb-0 fs-11 fw-medium text-muted">
                                {notification.startedOn}
                            </p>
                        </div>

                        {(notification.IsNotification === 1 || notification.IsAlter === 1) && (
                            <button
                                className="btn btn-link p-0 mark-as-read-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.notificationId);
                                }}
                                style={{
                                    fontSize: '0.75rem',
                                    backgroundColor: 'transparent', // Bootstrap green color
                                    color: 'black',
                                    padding: '2px 8px',
                                    //   borderRadius: '8px',
                                    marginLeft: '8px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Mark as read
                            </button>
                        )}

                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-2">
                <h6 className="fs-13 text-muted">No notifications found</h6>
            </div>
        );
    };

    return (
        <React.Fragment>
            <Dropdown
                isOpen={isNotificationDropdown}
                toggle={toggleNotificationDropdown}
                className="topbar-head-dropdown ms-1 header-item"
                innerRef={dropdownRef}
            >
                <DropdownToggle
                    type="button"
                    tag="button"
                    className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                    id="notificationTooltip"
                >
                    <i className='bx bx-bell fs-20'></i>
                    {unreadCount > 0 && (
                        <span className="position-absolute topbar-badge fs-9 translate-middle badge rounded-pill bg-danger">
                            {unreadCount}<span className="visually-hidden">unread messages</span>
                        </span>
                    )}
                </DropdownToggle>
                <Tooltip
                    placement="bottom"
                    isOpen={tooltipOpen}
                    target="notificationTooltip"
                    toggle={toggleTooltip}
                >
                    Notifications
                </Tooltip>

                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0" style={{ width: '350px' }}>
                    <div className="dropdown-head bg-primary bg-pattern rounded-top">
                        <div className="p-2">
                            <Row className="align-items-center">
                                <Col>
                                    <h6 className="m-0 fs-15 fw-semibold text-white"> Notifications </h6>
                                </Col>
                                {unreadCount > 0 && (
                                    <Col className="col-auto">
                                        <button
                                            className="btn btn-link text-white p-0 fs-13 fw-semibold"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAllAsRead();
                                            }}
                                        >
                                            Mark all as read
                                        </button>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        <div className="px-2 pt-1">
                            <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({ active: activeTab === '1' }, "fs-13")}
                                        onClick={() => { toggleTab('1'); }}
                                    >
                                        All ({notifications.length})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({ active: activeTab === '2' }, "fs-13")}
                                        onClick={() => { toggleTab('2'); }}
                                    >
                                        Messages ({messageCount})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({ active: activeTab === '3' }, "fs-13")}
                                        onClick={() => { toggleTab('3'); }}
                                    >
                                        Alerts ({alertCount})
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </div>
                    </div>

                    <TabContent activeTab={activeTab}>
                        {['1', '2', '3'].map(tabId => (
                            <TabPane key={tabId} tabId={tabId} className="py-1 ps-1">
                                <SimpleBar
                                    style={{
                                        maxHeight: viewAllMode[tabId] ? "none" : "250px"
                                    }}
                                    className="pe-1"
                                >
                                    {renderNotifications(getFilteredNotifications(tabId), tabId)}
                                </SimpleBar>
                                {getFilteredNotifications(tabId).length > 0 && (
                                    <div className="my-2 text-center">
                                        <button
                                            type="button"
                                            className="btn btn-soft-success waves-effect waves-light fs-13"
                                            onClick={() => toggleViewAll(tabId)}
                                        >
                                            {viewAllMode[tabId] ? 'Collapse' : `View All ${tabId === '1' ? 'Notifications' : tabId === '2' ? 'Messages' : 'Alerts'}`}
                                            <i className={`ri-arrow-${viewAllMode[tabId] ? 'up' : 'right'}-line align-middle ms-1`}></i>
                                        </button>
                                    </div>
                                )}
                            </TabPane>
                        ))}
                    </TabContent>
                </DropdownMenu>
            </Dropdown>

            {/* Preview Panel */}
            {hoveredNotification && (
                <div
                    className="notification-preview shadow-sm"
                    style={{
                        position: 'fixed',
                        top: `${previewPosition.top}px`,
                        left: `${previewPosition.left}px`,
                        width: '250px',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid #e9ecef'
                    }}
                    onMouseEnter={() => setHoveredNotification(hoveredNotification)}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-start">
                            <div className="avatar-sm me-2">
                                <span className={`avatar-title ${hoveredNotification.NotificationTypeName === 'IsAlter' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} rounded-circle fs-14`}>
                                    <i className={hoveredNotification.NotificationTypeName === 'IsAlter' ? 'bx bx-error-circle' : 'bx bx-message-detail'}></i>
                                </span>
                            </div>
                            <div className="flex-grow-1">
                                <h5 className="mb-1 fs-14">
                                    {hoveredNotification.NotificationTypeName === 'IsAlter' ? 'Alert' : 'Message'}
                                </h5>
                                <p className="text-muted mb-0 fs-11">
                                    {hoveredNotification.startedOn}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="notification-content">
                        <p className="mb-1 fs-13">{hoveredNotification.notificationNote}</p>

                        {hoveredNotification.endedOn && (
                            <p className="text-muted fs-11 mb-1">
                                <i className="bx bx-time-five align-middle me-1"></i>
                                Ends: {hoveredNotification.endedOn}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <style>
                {`
                    .notification-preview {
                        transition: opacity 0.2s ease-in-out;
                        animation: fadeIn 0.15s ease-in-out;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateX(-10px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    
                    .notification-item:hover {
                        background-color: rgba(0, 0, 0, 0.03);
                        cursor: pointer;
                    }
                    
                    .notification-item.unread {
                        border-left: 2px solid var(--bs-primary);
                    }

                    .nav-tabs-custom .nav-link {
                        color: #6c757d;
                        padding: 0.4rem 0.75rem;
                        border: none;
                        position: relative;
                        font-size: 13px;
                    }

                    .nav-tabs-custom .nav-link.active {
                        color: #0d6efd;
                        background-color: transparent;
                    }

                    .nav-tabs-custom .nav-link.active:after {
                        content: '';
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background-color: #0d6efd;
                    }

                    .simplebar-content-wrapper {
                        overflow: ${viewAllMode[activeTab] ? 'visible !important' : 'auto'};
                    }

                    .mark-as-read-btn {
      opacity: 0;
      transition: all 0.2s ease;
      border: none;
      align-self: center;
    }

    .notification-item:hover .mark-as-read-btn {
      opacity: 1;
    }

    

    .mark-as-read-btn:active {
      transform: translateY(0);
      box-shadow: none;
    }
                `}
            </style>
        </React.Fragment>
    );
};

export default NotificationDropdown;



