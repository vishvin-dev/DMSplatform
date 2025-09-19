import React, { useState, useEffect, useRef } from 'react';
import {
    Button, Card, CardBody, CardHeader, Col, Container, Row, Label,
    Input, FormGroup, Table, Modal, ModalHeader, ModalBody, ModalFooter,
    Toast, ToastHeader, ToastBody, FormFeedback, ButtonGroup
} from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { FiEdit } from 'react-icons/fi';

// Update your react-icons imports to include all needed icons
import {
    FiMinus,
    FiPlus,
    FiX,
    FiStar,
    FiDownload,
    FiUser,
    FiMapPin,
    FiHome,
    FiUserCheck,
    FiCalendar,
    FiChevronUp,
    FiChevronDown,
    FiBarChart2,  // Add this for bar chart icon
    FiPieChart,   // Add this for pie chart icon
    FiTrendingUp,  // Add this for line chart icon
    FiMaximize,
    FiImage,
} from 'react-icons/fi';
import { BsImage } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';
import _ from 'lodash';
import { Form } from 'reactstrap';
import {
    getConsumerInformationDpwdns,
    getConsumerInformationSearch,
    getConsumerInformation,
    getConsumerBillingInformation,
    getConsumerSurveyInformation,
    getConsumerPhoto

} from "../../helpers/fakebackend_helper"
import ErrorModal from '../../Components/Common/ErrorModal';
import SuccessModal from '../../Components/Common/SuccessModal';
import { findLabelByLink } from "../../Layouts/MenuHelper/menuUtils"
// Update your ChartJS imports to this single block:
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';



ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);




const ConsumerInformation = () => {


    const [formData, setFormData] = useState({
        locationType: '',
        locationName: '',
        financialYear: '',
        searchType: '',
        accountID: '',
        rrNo: '',
        consumerID: ''
    });

    const [formErrors, setFormErrors] = useState({
        locationType: false,
        locationName: false,
        financialYear: false,
        searchType: false,
        accountID: false,
        rrNo: false,
        consumerID: false
    });

    const [touchedFields, setTouchedFields] = useState({
        locationType: false,
        locationName: false,
        financialYear: false,
        searchType: false,
        accountID: false,
        rrNo: false,
        consumerID: false
    });

    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [locationType, setLocationTypes] = useState([])
    const [locations, setLocations] = useState([])
    const [financialYearr, setFinancialYear] = useState([])
    const [searchTypeName, setSearchTypeName] = useState([])
    const [username, setUserName] = useState('');
    const [consumerInfo, setConsumerInfo] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [response, setResponse] = useState('');
    const [chartData, setChartData] = useState(null);
    const [showGraph, setShowGraph] = useState(false); // Add this to your state declarations
    const [chartType, setChartType] = useState('bar');
    const [hasSearched, setHasSearched] = useState(false);
    const chartRef = useRef(null);
    const [reviewStatus, setReviewStatus] = useState([])
    const [previousSearch, setPreviousSearch] = useState(null);


    // State for minimized/closed components
    const [minimized, setMinimized] = useState({
        consumerInfo: false,
        locationInfo: false,
        geographyInfo: false,
        consumerTable: false,
        billingTable: false
    });
    const [closed, setClosed] = useState({
        consumerInfo: false,
        locationInfo: false,
        geographyInfo: false,
        consumerTable: false,
        billingTable: false
    });

    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        consumerTable: { key: null, direction: 'asc' },
        billingTable: { key: null, direction: 'asc' }
    });

    const [selectedBill, setSelectedBill] = useState(null);
    const [surveyModal, setSurveyModal] = useState(false);
    const [surveyData, setSurveyData] = useState([]);
    const [billingData, setBillingData] = useState([]);
    const [vmsModal, setVmsModal] = useState(false);
    const [vmsImages, setVmsImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [billModal, setBillModal] = useState(false);
    const [selectedBillForModal, setSelectedBillForModal] = useState(null);
    const [selectedReview, setSelectedReview] = useState([]);
    const [vmsImageModal, setVmsImageModal] = useState(false); // For image preview
    const [reviewModal, setReviewModal] = useState(false);     // For review details
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
    const imageContainerRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);




    const consumerTableColumns = [
        { header: 'MainTariff', accessor: 'tariffCategoryName' },
        { header: 'SubTariff', accessor: 'tariffSubCategoryName' },
        { header: 'ConsumerID', accessor: 'consumerId' },
        { header: 'AccountID', accessor: 'accountId' },
        { header: 'RRNo', accessor: 'rRNo' },
        { header: 'Status', accessor: 'status' },
        { header: 'ServiceDate', accessor: 'serviceDate' },
        { header: 'KW', accessor: 'kW' },
        { header: 'HP', accessor: 'hP' },
        { header: 'AvgConsumption', accessor: 'avgConsumption' },
        { header: 'MeterSerialNumber', accessor: 'meterSerialNumber' },
        { header: 'MeterMakeName', accessor: 'meterMakeName' },
        { header: 'MeterCapacity', accessor: 'meterCapacity' }
    ];



    useEffect(() => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const usernm = obj.user.loginName;
        const locationID = obj.user.locationId

        flagIdFunction(1, setLocationTypes, usernm, locationID);
        flagIdFunction(3, setFinancialYear, usernm);
        flagIdFunction(4, setSearchTypeName, usernm)
        setUserName(usernm);
    }, []);

    const flagIdFunction = async (flagId, setState, requestUserName, locationId, locationTypeId) => {
        try {
            const params = { flagId, requestUserName, locationId, locationTypeId };
            const response = await getConsumerInformationDpwdns(params);
            const options = response?.data || [];
            setState(options);
            console.log("dropdownsss", options)
        } catch (error) {
            console.error(`Error fetching options for flag ${flagId}:`, error.message);
        }
    };


    // Create debounced validation for ID fields
    const debouncedValidateID = useRef(
        _.debounce((value, type) => {
            if (type === 'accountID') {
                setFormErrors(prev => ({
                    ...prev,
                    accountID: !value || !validateID(value, type)
                }));
            } else if (type === 'rrNo') {
                setFormErrors(prev => ({
                    ...prev,
                    rrNo: !value || !validateID(value, type)
                }));
            } else if (type === 'consumerID') {
                setFormErrors(prev => ({
                    ...prev,
                    consumerID: !value || !validateID(value, type)
                }));
            }
        }, 500)
    ).current;


    const PhotoView = (billNo, consumerId) => {
        if (!consumerId) {
            console.error("Consumer ID is missing!");
            return;
        }

        const params = {
            flagId: 9,  // Assuming this flag fetches all images for that bill
            consumerId: Number(consumerId),
            billNo: billNo,
            requestUserName: username
        };

        getConsumerPhoto(params)
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

    // For viewing reviews
    const handleViewReview = async (bill) => {
        try {
            const res10 = await getConsumerSurveyInformation({
                flagId: 10,
                consumerId: Number(bill.consumerID),
                billNo: bill.billNo,
                requestUserName: username
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

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedValidateID.cancel();
        };
    }, [debouncedValidateID]);

    // Load favorite status from localStorage on component mount
    useEffect(() => {
        const savedFavorite = localStorage.getItem('consumerSearchFavorite');
        if (savedFavorite) {
            setIsFavorite(JSON.parse(savedFavorite));
        }
    }, []);

    // Save favorite status to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('consumerSearchFavorite', JSON.stringify(isFavorite));
    }, [isFavorite]);

    const validateID = (value, type) => {
        if (!value) return false;

        switch (type) {
            case 'accountID':
                // AccountID validation pattern (1-15 alphanumeric chars)
                return /^[A-Za-z0-9]{1,15}$/.test(value);
            case 'rrNo':
                // RRNo validation pattern (1-12 alphanumeric chars)
                return /^[A-Za-z0-9]{1,12}$/.test(value);
            case 'consumerID':
                // ConsumerID validation pattern (1-12 alphanumeric chars)
                return /^[A-Za-z0-9]{1,12}$/.test(value);
            default:
                return false;
        }
    };

    useEffect(() => {
        if (billingData) {
            // Create an array of all months in order (Jan to Dec) for the current year
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Extract the year from the first billing record (assuming all records are from the same year)
            const year = billingData[0]?.monthYear?.split('-')[1] || new Date().getFullYear();

            // Prepare labels in the format "MMM-YYYY" (e.g., "Apr-2025")
            const labels = monthOrder.map(month => `${month}-${year}`);

            // Create a map of month to data for easier lookup
            const dataMap = billingData.reduce((acc, bill) => {
                const [month] = bill.monthYear.split('-');
                const monthIndex = monthOrder.indexOf(month);
                if (monthIndex !== -1) {
                    acc[monthIndex] = {
                        vendorKWHFR: bill.vendorKWHFR || 0,
                        kWHFR: bill.kWHFR || 0
                    };
                }
                return acc;
            }, {});

            // Prepare data for all 12 months
            const vendorData = monthOrder.map((_, index) =>
                dataMap[index]?.vendorKWHFR || 0
            );
            const vigilanceData = monthOrder.map((_, index) =>
                dataMap[index]?.kWHFR || 0
            );

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Vendor KWH FR',
                        data: vendorData,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        barPercentage: 0.4,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Vigilance KWH FR',
                        data: vigilanceData,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        barPercentage: 0.4,
                        categoryPercentage: 0.8
                    }
                ],
            });
        }
    }, [billingData]);



    const renderChart = () => {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw} KWH`;
                        }
                    }
                }
            },
            scales: chartType === 'pie' ? {} : {
                x: {
                    title: {
                        display: true,
                        text: 'Month',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'KWH FR Value',
                        font: {
                            weight: 'bold'
                        }
                    },
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };

        switch (chartType) {
            case 'line':
                return <Line data={chartData} options={commonOptions} />;
            case 'pie':
                // For pie chart, we need to transform the data
                const pieData = {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.datasets[0].data,
                        backgroundColor: chartData.datasets[0].backgroundColor,
                        borderColor: chartData.datasets[0].borderColor,
                        borderWidth: 1
                    }]
                };
                return <Pie data={pieData} options={{
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            ...commonOptions.plugins.legend,
                            position: 'bottom', // Move legend to bottom
                            labels: {
                                ...commonOptions.plugins.legend.labels,
                                padding: 20, // Add some padding
                                boxWidth: 12 // Adjust box width
                            }
                        }
                    },
                    layout: {
                        padding: {
                            bottom: 30 // Add extra padding at bottom for labels
                        }
                    }
                }} />;
            case 'bar':
            default:
                return <Bar data={chartData} options={commonOptions} />;
        }
    };

    // Add this function for downloading the chart
    const downloadChart = () => {
        // Get all canvas elements in the document
        const canvasElements = document.getElementsByTagName('canvas');

        if (canvasElements.length > 0) {
            // Get the last canvas (assuming your chart is the last one rendered)
            const chartCanvas = canvasElements[canvasElements.length - 1];

            // Create download link
            const link = document.createElement('a');
            link.download = `KWH-FR-Comparison-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = chartCanvas.toDataURL('image/png');

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error('No chart canvas found');
            // Optionally show a toast/alert to user
            setToastMessage('Chart not available for download');
            setShowToast(true);
        }
    };



    const validateForm = () => {
        // Mark all fields as touched
        const newTouchedFields = {
            locationType: true,
            locationName: true,
            financialYear: true,
            searchType: true,
            accountID: formData.searchType === 'accountID',
            rrNo: formData.searchType === 'rrNo',
            consumerID: formData.searchType === 'consumerID'
        };
        setTouchedFields(newTouchedFields);

        const errors = {
            locationType: !formData.locationType,
            locationName: !formData.locationName,
            financialYear: !formData.financialYear,
            searchType: !formData.searchType,
            accountID: formData.searchType === 'accountID' &&
                (!formData.accountID || !validateID(formData.accountID, 'accountID')),
            rrNo: formData.searchType === 'rrNo' &&
                (!formData.rrNo || !validateID(formData.rrNo, 'rrNo')),
            consumerID: formData.searchType === 'consumerID' &&
                (!formData.consumerID || !validateID(formData.consumerID, 'consumerID'))
        };

        setFormErrors(errors);
        return !Object.values(errors).some(error => error);
    };

 const handleChange = async (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));

    // Reset ID fields when searchType changes
    if (name === 'searchType') {
        setFormData(prev => ({
            ...prev,
            accountID: '',
            rrNo: '',
            consumerID: ''
        }));
        setFormErrors(prev => ({
            ...prev,
            accountID: false,
            rrNo: false,
            consumerID: false
        }));
    }

    // Handle locationType change logic
    if (name === 'locationType') {
        // Mark field as touched
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        if (value) {
            // Temp array to capture locations
            let fetchedLocations = [];

            const tempSetLocations = (options) => {
                setLocations(options);
                fetchedLocations = options;
            };

            await flagIdFunction(2, tempSetLocations, username, null, Number(value));

            if (Array.isArray(fetchedLocations)) {
                if (fetchedLocations.length === 1) {
                    // Auto-select if only one location
                    setFormData(prev => ({
                        ...prev,
                        locationName: fetchedLocations[0].locationId
                    }));

                    setTouchedFields(prev => ({
                        ...prev,
                        locationName: true
                    }));

                    setFormErrors(prev => ({
                        ...prev,
                        locationName: false
                    }));
                } else {
                    // Reset locationName if multiple options
                    setFormData(prev => ({
                        ...prev,
                        locationName: ''
                    }));
                }
            }
        } else {
            // Clear locations if no locationType selected
            setLocations([]);
            setFormData(prev => ({
                ...prev,
                locationName: ''
            }));
        }
    }

    // Field-level validation
    if (touchedFields[name]) {
        if (name === 'accountID' || name === 'rrNo' || name === 'consumerID') {
            debouncedValidateID(value, name);
        } else {
            setFormErrors(prev => ({
                ...prev,
                [name]: !value
            }));
        }
    }
};


    const handleBlur = (e) => {
        const { name, value } = e.target;

        // Mark field as touched
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate the field
        if (name === 'accountID') {
            setFormErrors(prev => ({
                ...prev,
                accountID: !value || !validateID(value, 'accountID')
            }));
        } else if (name === 'rrNo') {
            setFormErrors(prev => ({
                ...prev,
                rrNo: !value || !validateID(value, 'rrNo')
            }));
        } else if (name === 'consumerID') {
            setFormErrors(prev => ({
                ...prev,
                consumerID: !value || !validateID(value, 'consumerID')
            }));
        } else {
            setFormErrors(prev => ({
                ...prev,
                [name]: !value
            }));
        }
    };

    const handleReset = () => {
        setFormData({
            locationType: '',
            locationName: '',
            financialYear: '',
            searchType: '',
            accountID: '',
            rrNo: '',
            consumerID: ''
        });
        setPreviousSearch(null);
        setFormErrors({
            locationType: false,
            locationName: false,
            financialYear: false,
            searchType: false,
            accountID: false,
            rrNo: false,
            consumerID: false
        });
        setTouchedFields({
            locationType: false,
            locationName: false,
            financialYear: false,
            searchType: false,
            accountID: false,
            rrNo: false,
            consumerID: false
        });
        setShowDetails(false);
        setMinimized({
            consumerInfo: false,
            locationInfo: false,
            geographyInfo: false,
            consumerTable: false,
            billingTable: false
        });
        setClosed({
            consumerInfo: false,
            locationInfo: false,
            geographyInfo: false,
            consumerTable: false,
            billingTable: false
        });
        setHasSearched(false);
        // Reset chart-related states
        setChartData(null);
        setShowGraph(false);
        setChartType('bar');
        // Reset consumer and billing data
        setConsumerInfo([]);
        setBillingData([]);
        setSurveyData([]);
    };


    const getConsumerDetails = async (searchTypeName, searchTypeValue, selectedYear, username, locationTypeId, locationId) => {
        try {
            // Reset ALL display states before new search
            setShowDetails(false);
            setConsumerInfo([]);
            setBillingData([]);
            setSurveyData([]);
            setSelectedReview([]);
            setChartData(null);
            setShowGraph(false);
            setHasSearched(false);

            const params5 = {
                flagId: 5,
                locationTypeId,
                locationId,
                consumerId: 0,
                yearOfBill: 0,
                billNo: 0,
                searchTypeName,
                searchTypeValue,
                isDisabled: false,
                requestUserName: username
            };

            const res5 = await getConsumerInformationSearch(params5);
            const result = res5?.data?.[0];

            if (result?.responseStatusCode === '000' && result.consumerId) {
                const consumerId = result.consumerId;

                // Fetch consumer and billing data in parallel
                const [consumerRes, billingRes] = await Promise.all([
                    getConsumerInformation({
                        flagId: 6,
                        consumerId,
                        requestUserName: username
                    }),
                    getConsumerBillingInformation({
                        flagId: 7,
                        consumerId,
                        yearOfBill: selectedYear,
                        requestUserName: username
                    })
                ]);

                // Only proceed if we got valid data for both
                if (consumerRes?.data?.length > 0 && billingRes?.data?.length > 0) {
                    setConsumerInfo(consumerRes.data);
                    setBillingData(billingRes.data);

                    // Only show UI components after confirming we have valid data
                    setShowDetails(true);
                    setHasSearched(true);
                    setShowGraph(true);

                    // Fetch additional data if needed
                    const latestBillNo = billingRes.data[0]?.billNo;
                    if (latestBillNo) {
                        const [surveyRes, reviewRes] = await Promise.all([
                            getConsumerSurveyInformation({
                                flagId: 8,
                                consumerId: Number(consumerId),
                                billNo: latestBillNo,
                                requestUserName: username
                            }),
                            getConsumerSurveyInformation({
                                flagId: 10,
                                consumerId: Number(consumerId),
                                billNo: latestBillNo,
                                requestUserName: username
                            })
                        ]);
                        setSurveyData(surveyRes?.data || []);
                        setSelectedReview(reviewRes?.data || []);
                    }
                } else {
                    throw new Error('No valid consumer data found');
                }
            } else {
                throw new Error(result?.responseStatusCodeGUIDisplay || 'Invalid consumer ID or no data found');
            }
        } catch (err) {
            console.error("Search error:", err.message);
            setResponse(err.message || 'Invalid consumer information');
            setErrorModal(true);

            // Ensure all display states are cleared
            setConsumerInfo([]);
            setBillingData([]);
            setSurveyData([]);
            setSelectedReview([]);
            setChartData(null);
            setShowGraph(false);
            setShowDetails(false);
            setHasSearched(false);
        }
    };


    // const handleShow = async () => {
    //     if (!validateForm()) return;

    //     setIsLoading(true);

    //     // Reset all display states before search
    //     setShowDetails(false);
    //     setShowGraph(false);
    //     setHasSearched(false);
    //     setConsumerInfo([]);
    //     setBillingData([]);
    //     setSurveyData([]);
    //     setSelectedReview([]);
    //     setChartData(null);

    //     try {
    //         const obj = JSON.parse(sessionStorage.getItem("authUser"));
    //         const dynamicFieldKey = searchTypeMap[formData.searchType];

    //         await getConsumerDetails(
    //             searchTypeName.find(s => s.SearchTypeId.toString() === formData.searchType)?.SearchTypeName || "",
    //             formData[dynamicFieldKey],
    //             formData.financialYear,
    //             obj.user.loginName,
    //             parseInt(formData.locationType),
    //             parseInt(formData.locationName)
    //         );

    //     } catch (err) {
    //         console.error("Search failed:", err);
    //         setResponse(err.message || 'Invalid search parameters');
    //         setErrorModal(true);

    //         // Ensure all display states are cleared
    //         setShowDetails(false);
    //         setShowGraph(false);
    //         setHasSearched(false);
    //         setConsumerInfo([]);
    //         setBillingData([]);
    //         setSurveyData([]);
    //         setSelectedReview([]);
    //         setChartData(null);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };


    const handleShow = async () => {
        if (!validateForm()) return;

        // Create current search object
        const currentSearch = {
            locationType: formData.locationType,
            locationName: formData.locationName,
            financialYear: formData.financialYear,
            searchType: formData.searchType,
            searchValue: formData[searchTypeMap[formData.searchType]]
        };

        // Check if search values are the same as previous search
        if (previousSearch &&
            previousSearch.locationType === currentSearch.locationType &&
            previousSearch.locationName === currentSearch.locationName &&
            previousSearch.financialYear === currentSearch.financialYear &&
            previousSearch.searchType === currentSearch.searchType &&
            previousSearch.searchValue === currentSearch.searchValue) {
            // Same search, don't fetch again
            return;
        }

        setIsLoading(true);
        setPreviousSearch(currentSearch); // Store current search

        // Reset all display states before search
        setShowDetails(false);
        setShowGraph(false);
        setHasSearched(false);
        setConsumerInfo([]);
        setBillingData([]);
        setSurveyData([]);
        setSelectedReview([]);
        setChartData(null);

        try {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const dynamicFieldKey = searchTypeMap[formData.searchType];

            await getConsumerDetails(
                searchTypeName.find(s => s.SearchTypeId.toString() === formData.searchType)?.SearchTypeName || "",
                formData[dynamicFieldKey],
                formData.financialYear,
                obj.user.loginName,
                parseInt(formData.locationType),
                parseInt(formData.locationName)
            );

        } catch (err) {
            console.error("Search failed:", err);
            setResponse(err.message || 'Invalid search parameters');
            setErrorModal(true);
            // Ensure all display states are cleared
            setShowDetails(false);
            setShowGraph(false);
            setHasSearched(false);
            setConsumerInfo([]);
            setBillingData([]);
            setSurveyData([]);
            setSelectedReview([]);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };



    const toggleFavorite = () => {
        const newFavoriteStatus = !isFavorite;
        setIsFavorite(newFavoriteStatus);
        setToastMessage(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const toggleMinimize = (section) => {
        setMinimized(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleClose = (section) => {
        setClosed(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleBillClick = (billNo) => {
        window.open(`/bills/${billNo}`, '_blank');
    };

    const handleStarClick = (bill) => {
        setSelectedBill(bill);
        setSurveyModal(true);
    };

    // const submitRating = () => {
    //     const updatedData = billingData.map(bill =>
    //         bill.billNo === selectedBill.billNo ? { ...bill, surveyRating: currentRating } : bill
    //     );
    //     setBillingData(updatedData);
    //     setRatingModal(false);
    // };

    const renderStars = (rating, bill) => {
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                onClick={() => handleStarClick(bill, i + 1)}
                style={{ cursor: 'pointer' }}
            >
                {i < rating ?
                    <FaStar className="text-warning" /> :
                    <FiStar className="text-warning" />
                }
            </span>
        ));
    };

    const requestSort = (table, key) => {
        let direction = 'asc';
        if (sortConfig[table] && sortConfig[table].key === key && sortConfig[table].direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig(prev => ({
            ...prev,
            [table]: { key, direction }
        }));
    };

    const getSortedData = (data, table) => {
        if (!sortConfig[table] || !sortConfig[table].key) return data;

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

    const renderSortIcon = (key, table) => {
        if (sortConfig[table]?.key !== key) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '4px' }}>
                    <FiChevronUp size={10} style={{ opacity: 0.5, marginBottom: '-4px' }} />
                    <FiChevronDown size={10} style={{ opacity: 0.5, marginTop: '-4px' }} />
                </div>
            );
        }
        return (
            <div style={{ marginLeft: '4px' }}>
                {sortConfig[table].direction === 'asc' ?
                    <FiChevronUp size={12} /> :
                    <FiChevronDown size={12} />
                }
            </div>
        );
    };

    const isFormValid = () => {
        if (!formData.locationType || !formData.locationName || !formData.financialYear || !formData.searchType) {
            return false;
        }

        const type = searchTypeMap[formData.searchType];
        if (type === 'accountID' && !formData.accountID) return false;
        if (type === 'rrNo' && !formData.rrNo) return false;
        if (type === 'consumerID' && !formData.consumerID) return false;

        return true;
    };


    const searchTypeMap = {
        1: 'accountID',
        2: 'rrNo',
        3: 'consumerID',
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
                    <BreadCrumb title="Consumer History" pageTitle="Consumer" />

                    {/* Toast Notification */}
                    <div style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: 9999,
                        minWidth: '250px'
                    }}>
                        <Toast isOpen={showToast}>
                            <ToastHeader
                                icon={isFavorite ? <FaStar className="text-warning" /> : <FiStar />}
                                toggle={() => setShowToast(false)}
                            >
                                {isFavorite ? 'Favorite Saved' : 'Favorite Removed'}
                            </ToastHeader>
                            <ToastBody>
                                {toastMessage}
                            </ToastBody>
                        </Toast>
                    </div>

                    {/* Compact Cards Row */}
                    <Row className="mb-2">
                        {/* Search Options Card - Larger Size */}
                        <Col
                            xl={hasSearched ? 3 : 4}
                            lg={hasSearched ? 4 : 4}
                            md={6}
                            sm={12}
                            xs={12}
                            className="mb-3"
                        >
                            <Card className="h-100" style={{ minWidth: '320px' }}>
                                <div style={{
                                    height: '4px',
                                    background: isFavorite
                                        ? 'linear-gradient(to right, #ffc107, #ff9800)'
                                        : 'linear-gradient(to right, rgb(61, 168, 57), rgb(66, 148, 70))',
                                    borderRadius: '4px 4px 0 0'
                                }}></div>
                                <CardHeader className="py-1 px-2 d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 text-black">Search Option</h6>
                                    <Button
                                        color="link"
                                        className="p-0"
                                        onClick={toggleFavorite}
                                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        {isFavorite ?
                                            <FaStar className="text-warning" /> :
                                            <FiStar className="text-dark" />
                                        }
                                    </Button>
                                </CardHeader>
                                <span className="text-muted mb-3 ms-2 mt-2">
                                    Please fill mandatory information below<span className="text-danger">*</span>
                                </span>
                                <CardBody className="py-1 px-2">
                                    <Form>
                                        {/* Location Type Field */}
                                        <FormGroup className="mb-2 row align-items-center">
                                            <Label className="col-sm-5 col-form-label col-form-label-sm" for="locationType">
                                                <span>LocationTypeName</span>
                                                <span className='text-danger'>*</span>
                                            </Label>
                                            <Col sm={7} className="ps-sm-2">
                                                <Input
                                                    type="select"
                                                    name="locationType"
                                                    id="locationType"
                                                    value={formData.locationType}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    bsSize="sm"
                                                    invalid={touchedFields.locationType && formErrors.locationType}
                                                    style={{
                                                        width: '100%',
                                                        height: '38px',
                                                        padding: '6px 12px',
                                                        fontSize: '14px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    className="custom-select"
                                                >
                                                    <option value="">Select</option>
                                                    {locationType.map(l => (
                                                        <option
                                                            key={l.locationTypeId}
                                                            value={l.locationTypeId}
                                                            title={l.locationTypeName}
                                                        >
                                                            {l.locationTypeName}
                                                        </option>
                                                    ))}
                                                </Input>
                                                {touchedFields.locationType && formErrors.locationType && (
                                                    <FormFeedback>This field is required</FormFeedback>
                                                )}
                                            </Col>
                                        </FormGroup>

                                        {/* Location Name Field */}
                                        <FormGroup className="mb-2 row align-items-center">
                                            <Label className="col-sm-5 col-form-label col-form-label-sm" for="locationName">
                                                <span>LocationName</span>
                                                <span className='text-danger'>*</span>
                                            </Label>
                                            <Col sm={7} className="ps-sm-2">
                                                <Input
                                                    type="select"
                                                    name="locationName"
                                                    id="locationName"
                                                    value={formData.locationName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    bsSize="sm"
                                                    invalid={touchedFields.locationName && formErrors.locationName}
                                                    style={{
                                                        width: '100%',
                                                        height: '38px',
                                                        padding: '6px 12px',
                                                        fontSize: '14px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    className="custom-select"
                                                >
                                                    <option value="">Select</option>
                                                    {locations.map(l => (
                                                        <option
                                                            key={l.locationId}
                                                            value={l.locationId}
                                                            title={l.locationName}
                                                        >
                                                            {l.locationName}
                                                        </option>
                                                    ))}
                                                </Input>
                                                {touchedFields.locationName && formErrors.locationName && (
                                                    <FormFeedback>This field is required</FormFeedback>
                                                )}
                                            </Col>
                                        </FormGroup>

                                        {/* Financial Year Field */}
                                        <FormGroup className="mb-2 row align-items-center">
                                            <Label className="col-sm-5 col-form-label col-form-label-sm" for="financialYear">
                                                <span>FinancialYear</span>
                                                <span className='text-danger'>*</span>
                                            </Label>
                                            <Col sm={7} className="ps-sm-2">
                                                <Input
                                                    type="select"
                                                    name="financialYear"
                                                    id="financialYear"
                                                    value={formData.financialYear}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    bsSize="sm"
                                                    invalid={touchedFields.financialYear && formErrors.financialYear}
                                                    style={{
                                                        width: '100%',
                                                        height: '38px',
                                                        padding: '6px 12px',
                                                        fontSize: '14px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    className="custom-select"
                                                >
                                                    <option value="">Select</option>
                                                    {financialYearr.map(f => (
                                                        <option
                                                            key={f.FinancialYear}
                                                            value={f.YearOfBill}
                                                            title={f.FinancialYear}
                                                        >
                                                            {f.FinancialYear}
                                                        </option>
                                                    ))}
                                                </Input>
                                                {touchedFields.financialYear && formErrors.financialYear && (
                                                    <FormFeedback>This field is required</FormFeedback>
                                                )}
                                            </Col>
                                        </FormGroup>

                                        {/* Search Type Field */}
                                        <FormGroup className="mb-2 row align-items-center">
                                            <Label className="col-sm-5 col-form-label col-form-label-sm" for="searchType">
                                                <span>SearchTypeName</span>
                                                <span className='text-danger'>*</span>
                                            </Label>
                                            <Col sm={7} className="ps-sm-2">
                                                <Input
                                                    type="select"
                                                    name="searchType"
                                                    id="searchType"
                                                    value={formData.searchType}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    bsSize="sm"
                                                    // disabled={hasSearched}
                                                    // invalid={touchedFields.searchType && formErrors.searchType}
                                                    style={{
                                                        width: '100%',
                                                        height: '38px',
                                                        padding: '6px 12px',
                                                        fontSize: '14px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    className="custom-select"
                                                >
                                                    <option value="">Select</option>
                                                    {searchTypeName.map(s => (
                                                        <option
                                                            key={s.SearchTypeId}
                                                            value={s.SearchTypeId}
                                                            title={s.SearchTypeName}
                                                        >
                                                            {s.SearchTypeName}
                                                        </option>
                                                    ))}
                                                </Input>
                                                {touchedFields.searchType && formErrors.searchType && (
                                                    <FormFeedback>This field is required</FormFeedback>
                                                )}
                                            </Col>
                                        </FormGroup>

                                        {/* Conditional Fields */}
                                        {searchTypeMap[formData.searchType] === 'accountID' && (
                                            <FormGroup className="mb-2 row align-items-center">
                                                <Label className="col-sm-5 col-form-label col-form-label-sm" for="accountID">
                                                    <span>AccountID</span>
                                                    <span className='text-danger'>*</span>
                                                </Label>
                                                <Col sm={7} className="ps-sm-2">
                                                    <Input
                                                        type="text"
                                                        name="accountID"
                                                        id="accountID"
                                                        value={formData.accountID}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onPaste={(e) => e.preventDefault()}
                                                        maxLength={10}
                                                        inputMode='numeric'
                                                        pattern="[0-9]*"
                                                        bsSize="sm"
                                                        invalid={touchedFields.accountID && formErrors.accountID}
                                                        style={{
                                                            width: '100%',
                                                            height: '38px',
                                                            padding: '6px 12px',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                    {touchedFields.accountID && formErrors.accountID && (
                                                        <FormFeedback>This field is required</FormFeedback>
                                                    )}
                                                </Col>
                                            </FormGroup>
                                        )}

                                        {searchTypeMap[formData.searchType] === 'rrNo' && (
                                            <FormGroup className="mb-2 row align-items-center">
                                                <Label className="col-sm-5 col-form-label col-form-label-sm" for="rrNo">
                                                    <span>RRNo</span>
                                                    <span className='text-danger'>*</span>
                                                </Label>
                                                <Col sm={7} className="ps-sm-2">
                                                    <Input
                                                        type="text"
                                                        name="rrNo"
                                                        id="rrNo"
                                                        value={formData.rrNo}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onPaste={(e) => e.preventDefault()}
                                                        maxLength={10}
                                                        pattern="[a-zA-Z0-9]{1,10}"
                                                        bsSize="sm"
                                                        invalid={touchedFields.rrNo && formErrors.rrNo}
                                                        style={{
                                                            width: '100%',
                                                            height: '38px',
                                                            padding: '6px 12px',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                    {touchedFields.rrNo && formErrors.rrNo && (
                                                        <FormFeedback>This field is required</FormFeedback>
                                                    )}
                                                </Col>
                                            </FormGroup>
                                        )}

                                        {searchTypeMap[formData.searchType] === 'consumerID' && (
                                            <FormGroup className="mb-2 row align-items-center">
                                                <Label className="col-sm-5 col-form-label col-form-label-sm" for="consumerID">
                                                    <span>ConsumerID</span>
                                                    <span className='text-danger'>*</span>
                                                </Label>
                                                <Col sm={7} className="ps-sm-2">
                                                    <Input
                                                        type="text"
                                                        name="consumerID"
                                                        id="consumerID"
                                                        value={formData.consumerID}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onPaste={(e) => e.preventDefault()}
                                                        maxLength={10}
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        bsSize="sm"
                                                        invalid={touchedFields.consumerID && formErrors.consumerID}
                                                        style={{
                                                            width: '100%',
                                                            height: '38px',
                                                            padding: '6px 12px',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                    {touchedFields.consumerID && formErrors.consumerID && (
                                                        <FormFeedback>This field is required</FormFeedback>
                                                    )}
                                                </Col>
                                            </FormGroup>
                                        )}
                                        {/* Buttons */}
                                        <div className="d-flex justify-content-end mt-2 gap-1">
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={handleShow}
                                                disabled={!isFormValid() || isLoading}
                                            >
                                                {isLoading ? 'Loading...' : 'Show'}
                                            </Button>
                                            <Button color="secondary" size="sm" onClick={handleReset}>Reset</Button>
                                            <Button color="danger" size="sm">Close</Button>
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Consumer Information Card */}
                        {hasSearched && !closed.consumerInfo && (
                            <Col
                                xl={3}
                                lg={4}
                                md={6}
                                sm={12}
                                xs={12}
                                className="mb-3"
                            >
                                <Card className="h-100">
                                    <div style={{
                                        height: '4px',
                                        background: 'linear-gradient(to right,rgb(61, 168, 57),rgb(66, 148, 70))',
                                        borderRadius: '4px 4px 0 0'
                                    }}></div>
                                    <CardHeader className="mb-3 py-1 px-2 d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-black">Consumer Information</h6>
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleMinimize('consumerInfo')}
                                            >
                                                {minimized.consumerInfo ? (
                                                    <FiPlus size={14} className="text-dark" />
                                                ) : (
                                                    <FiMinus size={14} className="text-dark" />
                                                )}
                                            </Button>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleClose('consumerInfo')}
                                            >
                                                <FiX size={14} className="text-dark" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {!minimized.consumerInfo && (
                                        <CardBody className="py-1 px-2">
                                            <div className="mb-3" style={{ fontSize: '0.8rem', paddingLeft: '4px' }}>
                                                <div className="d-flex align-items-center mb-1">
                                                    <FiUser size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                    <strong> <div>Customer Name</div></strong>
                                                </div>
                                                <hr className="my-2 mb-3" style={{ borderTop: '1px solid rgb(8, 8, 8)' }} />
                                                <div
                                                    style={{
                                                        color: '#2c7be5',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.2rem',
                                                        textAlign: 'center',
                                                        lineHeight: '1.2'
                                                    }}
                                                >
                                                    {consumerInfo.map(c => (c.customerName))}
                                                </div>
                                                <hr className="my-2" style={{ borderTop: '1px solid rgb(8, 8, 8)' }} />

                                                <div className="d-flex align-items-center mb-1 mt-3">
                                                    <FiMapPin size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                    <strong><div>Address</div></strong>
                                                </div>
                                                <div style={{ color: 'black', marginLeft: '20px' }}>
                                                    {consumerInfo.map(c => (c.address))}
                                                </div>
                                            </div>
                                        </CardBody>
                                    )}
                                </Card>
                            </Col>
                        )}

                        {/* Location Information Card */}
                        {hasSearched && !closed.locationInfo && (
                            <Col
                                xl={3}
                                lg={4}
                                md={6}
                                sm={12}
                                xs={12}
                                className="mb-3"
                            >
                                <Card className="h-100">
                                    <div style={{
                                        height: '4px',
                                        background: 'linear-gradient(to right,rgb(61, 168, 57),rgb(66, 148, 70))',
                                        borderRadius: '4px 4px 0 0'
                                    }}></div>
                                    <CardHeader className="mb-3 py-1 px-2 d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-dark">Location Information</h6>
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleMinimize('locationInfo')}
                                            >
                                                {minimized.locationInfo ?
                                                    <FiPlus size={14} className="text-dark" /> :
                                                    <FiMinus size={14} className="text-dark" />
                                                }
                                            </Button>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleClose('locationInfo')}
                                            >
                                                <FiX size={14} className="text-dark" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {!minimized.locationInfo && (
                                        <CardBody className="py-1 px-2">
                                            <div className="mb-3" style={{ fontSize: '0.8rem', paddingLeft: '4px' }}>
                                                <hr className="my-1" style={{ borderTop: '1px solidrgb(8, 8, 8)' }} />
                                                <div className="d-flex align-items-center">
                                                    <FiHome size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                    <strong> <div>SubDivisionName</div></strong>
                                                </div>
                                                <div style={{ color: 'brown', marginLeft: '20px' }}>{consumerInfo.map(c => (c.locationName))}</div>
                                            </div>
                                            <div className="mb-3" style={{ fontSize: '0.8rem', paddingLeft: '4px' }}>
                                                <div className="d-flex align-items-center">
                                                    <FiMapPin size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                    <strong><div>AreaName</div></strong>
                                                </div>
                                                <div style={{ color: 'brown', marginLeft: '20px' }}>{consumerInfo.map(c => (c.meterReadingAreaName))}</div>
                                            </div>
                                            <div className="mb-3" style={{ fontSize: '0.8rem', paddingLeft: '4px' }}>
                                                <div className="d-flex align-items-center">
                                                    <FiUserCheck size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                    <strong><div>MeterReaderName</div></strong>
                                                </div>
                                                <div style={{ color: 'brown', marginLeft: '20px' }}>{consumerInfo.map(c => (c.vendorMeterReaderName))}</div>
                                            </div>
                                            <div className="mb-3" style={{ fontSize: '0.8rem', paddingLeft: '4px' }}>
                                                <div className="d-flex align-items-center">
                                                    <FiCalendar size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                    <strong><div>ReadingDay</div></strong>
                                                </div>
                                                <div style={{ color: 'brown', marginLeft: '20px' }}>{consumerInfo.map(c => (c.meterReadingDay))}</div>
                                            </div>
                                        </CardBody>
                                    )}
                                </Card>
                            </Col>
                        )}

                        {/* Geography Information Card - Smaller and Right-Aligned */}
                        {hasSearched && !closed.geographyInfo && (
                            <Col
                                xl={3}
                                lg={4}
                                md={6}
                                sm={12}
                                xs={12}
                                className="mb-3"
                            >
                                <Card className="h-100">
                                    <div style={{
                                        height: '4px',
                                        background: 'linear-gradient(to right,rgb(61, 168, 57),rgb(66, 148, 70))',
                                        borderRadius: '4px 4px 0 0'
                                    }}></div>
                                    <CardHeader className="mb-3 py-1 px-2 d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-dark">Geography Info</h6>
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleMinimize('geographyInfo')}
                                            >
                                                {minimized.geographyInfo ?
                                                    <FiPlus size={14} className="text-dark" /> :
                                                    <FiMinus size={14} className="text-dark" />
                                                }
                                            </Button>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleClose('geographyInfo')}
                                            >
                                                <FiX size={14} className="text-dark" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {!minimized.geographyInfo && (
                                        <CardBody className="py-1 px-2">
                                            <div style={{ fontSize: '0.8rem', paddingLeft: '4px' }}>
                                                <hr className="my-1" style={{ borderTop: '1px solid rgb(8, 8, 8)' }} />
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <FiMapPin size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                        <strong>Country:</strong>
                                                    </div>
                                                    <div style={{ color: 'brown', marginLeft: '20px' }}>
                                                        {consumerInfo.map(c => (c.countryName || 'N/A'))}
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <FiMapPin size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                        <strong>State:</strong>
                                                    </div>
                                                    <div style={{ color: 'brown', marginLeft: '20px' }}>
                                                        {consumerInfo.map(c => (c.stateName || 'N/A'))}
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <FiMapPin size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                        <strong>District:</strong>
                                                    </div>
                                                    <div style={{ color: 'brown', marginLeft: '20px' }}>
                                                        {consumerInfo.map(c => (c.districtName || 'N/A'))}
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <FiMapPin size={14} className="mr-2" style={{ minWidth: '30px' }} />
                                                        <strong>Taluk:</strong>
                                                    </div>
                                                    <div style={{ color: 'brown', marginLeft: '20px' }}>
                                                        {consumerInfo.map(c => (c.talukName || 'N/A'))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    )}
                                </Card>
                            </Col>
                        )}
                    </Row>

                    {/* Compact Tables Section */}
                    {hasSearched && (
                        <>
                            {!closed.consumerTable && (
                                <Card className="mb-2">
                                    <div style={{
                                        height: '4px',
                                        background: 'linear-gradient(to right,rgb(61, 168, 57),rgb(66, 148, 70))',
                                        borderRadius: '4px 4px 0 0'
                                    }}></div>
                                    <CardHeader className="py-1 px-2 d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-dark">Consumer Information</h6>
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleMinimize('consumerTable')}
                                            >
                                                {minimized.consumerTable ?
                                                    <FiPlus size={14} className="text-dark" /> :
                                                    <FiMinus size={14} className="text-dark" />
                                                }
                                            </Button>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleClose('consumerTable')}
                                            >
                                                <FiX size={14} className="text-dark" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {!minimized.consumerTable && (
                                        <CardBody className="p-0">
                                            <div className="table-responsive">
                                                <Table bordered hover responsive size="sm" className="mb-0">
                                                    <thead className='text-center' style={{ backgroundColor: '#1d84c3', color: 'white' }}>
                                                        <tr>
                                                            {consumerTableColumns.map((column) => (
                                                                <th
                                                                    key={column.accessor}
                                                                    className="text-white fw-semibold py-2 px-2"
                                                                    style={{
                                                                        fontSize: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        position: 'relative'
                                                                    }}
                                                                    onClick={() => requestSort('consumerTable', column.accessor)}
                                                                >
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        width: '100%'
                                                                    }}>
                                                                        <span style={{ flex: 1, textAlign: 'center' }}>{column.header}</span>
                                                                        <span style={{ width: '16px' }}>
                                                                            {sortConfig.consumerTable?.key === column.accessor ? (
                                                                                sortConfig.consumerTable.direction === 'asc' ?
                                                                                    <FiChevronUp size={12} className="text-white" /> :
                                                                                    <FiChevronDown size={12} className="text-white" />
                                                                            ) : (
                                                                                <>
                                                                                    <FiChevronUp size={12} className="text-white" style={{ opacity: 0.8, marginBottom: '-12px' }} />
                                                                                    <FiChevronDown size={12} className="text-white" style={{ opacity: 0.8, marginTop: '-12px' }} />
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {getSortedData(consumerInfo, 'consumerTable').map((data, index) => (
                                                            <tr key={index} style={{
                                                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#dff0fb',
                                                                color: '#000',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                {consumerTableColumns.map((column) => {
                                                                    if (column.accessor === 'status') {
                                                                        return (
                                                                            <td key={`${index}-status`} className="text-center py-2 px-2">
                                                                                {data.status === 'Active' ? (
                                                                                    <span className="badge bg-success-subtle text-success text-uppercase">
                                                                                        Active
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="badge bg-danger-subtle text-danger text-uppercase">
                                                                                        {data.status} {/* This will display whatever the status value is */}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td key={`${index}-${column.accessor}`} className="text-center py-2 px-2">
                                                                            {data[column.accessor]}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </CardBody>
                                    )}
                                </Card>
                            )}

                            {!closed.billingTable && (
                                <Card className="mb-2">
                                    <div style={{
                                        height: '4px',
                                        background: 'linear-gradient(to right,rgb(61, 168, 57),rgb(66, 148, 70))',
                                        borderRadius: '4px 4px 0 0'
                                    }}></div>
                                    <CardHeader className="py-1 px-2 d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-black">Billing Information</h6>
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleMinimize('billingTable')}
                                            >
                                                {minimized.billingTable ?
                                                    <FiPlus size={12} className="text-dark" /> :
                                                    <FiMinus size={12} className="text-dark" />
                                                }
                                            </Button>
                                            <Button
                                                color="link"
                                                className="p-0"
                                                onClick={() => toggleClose('billingTable')}
                                            >
                                                <FiX size={12} className="text-dark" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {!minimized.billingTable && (
                                        <CardBody className="p-0">
                                            <div className="table-responsive">
                                                <Table bordered responsive size="sm" className="mb-0">
                                                    <thead style={{ backgroundColor: '#1d84c3', color: 'white' }}>
                                                        <tr>
                                                            <th
                                                                className="text-white fw-semibold py-2 px-2"
                                                                style={{
                                                                    fontSize: '0.7rem',
                                                                    position: 'relative',
                                                                    cursor: 'pointer'
                                                                }}
                                                                rowSpan="2"
                                                                onClick={() => requestSort('billingTable', 'monthYear')}
                                                            >
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    width: '100%'
                                                                }}>
                                                                    <span style={{ flex: 1, textAlign: 'center' }}>MonthYear</span>
                                                                    <span style={{ width: '16px' }}>
                                                                        {sortConfig.billingTable?.key === 'monthYear' ? (
                                                                            sortConfig.billingTable.direction === 'asc' ?
                                                                                <FiChevronUp size={12} className="text-white" /> :
                                                                                <FiChevronDown size={12} className="text-white" />
                                                                        ) : (
                                                                            <>
                                                                                <FiChevronUp size={12} className="text-white" style={{ opacity: 0.5, marginBottom: '-10px' }} />
                                                                                <FiChevronDown size={12} className="text-white" style={{ opacity: 0.5, marginTop: '-10px' }} />
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                            <th
                                                                className="text-white fw-semibold py-2 px-2"
                                                                style={{
                                                                    fontSize: '0.7rem',
                                                                    position: 'relative',
                                                                    cursor: 'pointer'
                                                                }}
                                                                rowSpan="2"
                                                                onClick={() => requestSort('billingTable', 'billNo')}
                                                            >
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    width: '100%'
                                                                }}>
                                                                    <span style={{ flex: 1, textAlign: 'center' }}>BillNo</span>
                                                                    <span style={{ width: '16px' }}>
                                                                        {sortConfig.billingTable?.key === 'billNo' ? (
                                                                            sortConfig.billingTable.direction === 'asc' ?
                                                                                <FiChevronUp size={12} className="text-white" /> :
                                                                                <FiChevronDown size={12} className="text-white" />
                                                                        ) : (
                                                                            <>
                                                                                <FiChevronUp size={12} className="text-white" style={{ opacity: 0.5, marginBottom: '-10px' }} />
                                                                                <FiChevronDown size={12} className="text-white" style={{ opacity: 0.5, marginTop: '-10px' }} />
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                            <th className="text-white fw-semibold py-2 px-2 text-center" style={{ fontSize: '0.9rem' }} colSpan="6">Vendor Reading Information</th>
                                                            <th className="text-white fw-semibold py-2 px-2 text-center" style={{ fontSize: '0.9rem' }} colSpan="9">Vigilance Reading Information</th>
                                                        </tr>
                                                        <tr>
                                                            {[
                                                                { key: 'vendorKWHFR', label: 'KWH FR' },
                                                                { key: 'vendorKWHIR', label: 'KWH IR' },
                                                                { key: 'vendorPF', label: 'PF' },
                                                                { key: 'vendorBMD', label: 'BMD' },
                                                                { key: 'vendorMeterReadingReasonName', label: 'BillingReason' },
                                                                { key: 'billIssueDate', label: 'BillIssuedDate' },
                                                                { key: 'KWHFR', label: 'KWH FR' },
                                                                { key: 'pF', label: 'PF' },
                                                                { key: 'bMD', label: 'BMD' },
                                                                { key: 'metreReadingReasonName', label: 'BillingReason' },
                                                                { key: 'meterLocationName', label: 'MeterLocation' },
                                                                { key: 'surveyRating', label: 'Survey Rating' },
                                                                { key: 'getBilledLocation', label: 'BilledLocation' },
                                                                { key: 'billIssueDate', label: 'BillIssuedDate' },
                                                                { key: 'VMSStatus', label: 'VMSStatus' }

                                                            ].map((item, i) => (
                                                                <th
                                                                    key={i}
                                                                    className="text-white fw-semibold py-2 px-2"
                                                                    style={{
                                                                        fontSize: '0.7rem',
                                                                        cursor: 'pointer',
                                                                        position: 'relative'
                                                                    }}
                                                                    onClick={() => requestSort('billingTable', item.key)}
                                                                >
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        width: '100%'
                                                                    }}>
                                                                        <span style={{ flex: 1, textAlign: 'center' }}>{item.label}</span>
                                                                        <span style={{ width: '16px' }}>
                                                                            {sortConfig.billingTable?.key === item.key ? (
                                                                                sortConfig.billingTable.direction === 'asc' ?
                                                                                    <FiChevronUp size={12} className="text-white" /> :
                                                                                    <FiChevronDown size={12} className="text-white" />
                                                                            ) : (
                                                                                <>
                                                                                    <FiChevronUp size={12} className="text-white" style={{ opacity: 0.5, marginBottom: '-10px' }} />
                                                                                    <FiChevronDown size={12} className="text-white" style={{ opacity: 0.5, marginTop: '-10px' }} />
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {getSortedData(billingData, 'billingTable').map((bill, index) => (
                                                            <tr key={index} style={{
                                                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#dff0fb',
                                                                color: '#000'
                                                            }}
                                                            >
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.75rem' }}>{bill.monthYear}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.75rem' }}>


                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        className="p-0 d-flex flex-column align-items-center"
                                                                        onClick={() => {
                                                                            setSelectedBillForModal(bill);
                                                                            PhotoView(bill.billNo, consumerInfo?.[0]?.consumerId); // Opens VMS modal with images
                                                                        }}
                                                                        style={{ textDecoration: 'underline', color: "blue" }}
                                                                    >
                                                                        <span className=''>
                                                                            <BsImage size={14} color="#1d84c3" />
                                                                        </span>
                                                                        {/* <span style={{ cursor: 'pointer' }}>
                                                                            <img
                                                                                src="https://cdn-icons-png.flaticon.com/512/709/709592.png"
                                                                                alt="View Image"
                                                                                style={{ width: '16px', height: '16px' }}
                                                                            />
                                                                        </span> */}


                                                                        <span style={{ fontSize: '0.75rem' }}>{bill.billNo}</span>
                                                                    </Button>

                                                                </td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.vendorKWHFR}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.vendorKWHIR}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.vendorPF}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.vendorBMD}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.vendorMeterReadingReasonName}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.vendorBillIssueDate}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.kWHFR}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.pF}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.bMD}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.meterReadingReasonName}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.meterLocationName}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>
                                                                    <div onClick={() => handleStarClick(bill)} style={{ cursor: 'pointer' }}>
                                                                        {renderStars(bill.surveyRating)}
                                                                    </div>
                                                                </td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.getBilledLocation}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.7rem' }}>{bill.billIssueDate}</td>
                                                                <td className="text-center py-2 px-2" style={{ fontSize: '0.75rem' }}>
                                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                                        {/* <span>{bill.VMSStatus}</span> */}
                                                                        <Button
                                                                            color="info"
                                                                            size="sm"
                                                                            className="p-1"
                                                                            onClick={() => handleViewReview(bill)}
                                                                            style={{ minWidth: "40px" }}
                                                                        >
                                                                            View
                                                                        </Button>

                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </CardBody>
                                    )}
                                </Card>
                            )}
                        </>
                    )}


                    {/* vmsStatus ok  */}
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


                    <Modal isOpen={surveyModal} toggle={() => setSurveyModal(false)} centered size="lg" contentClassName="rounded-modal" >

                        <ModalHeader
                            toggle={() => setSurveyModal(false)}
                            className="py-3 px-3 bg-primary text-white"  // Added bg-primary and text-white
                            style={{ borderBottom: '1px solid #dee2e6' }}
                        >
                            <h6 className="mb-0 text-white">MonthYear - {selectedBill?.monthYear}</h6>
                        </ModalHeader>
                        <ModalBody className="p-3">
                            <div className="mb-3">
                                <Label className="mb-1">BillNo: {selectedBill?.billNo}</Label>
                            </div>

                            <Table bordered responsive>
                                <thead style={{ backgroundColor: '#1d84c3', color: 'white' }}>
                                    <tr>
                                        <th className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>SurveyCategoryName</th>
                                        <th className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>SurveyCategorySubName</th>
                                        <th className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>SatisfactionLevelName</th>
                                        <th className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surveyData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>{item.surveyCategoryName}</td>
                                            <td className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>{item.surveySubCategoryName}</td>
                                            <td className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>{item.satisfactionLevelName}</td>
                                            <td className="text-center py-2 px-2" style={{ fontSize: '0.8rem' }}>
                                                <div className="d-flex justify-content-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star}>
                                                            {star <= item.rating ?
                                                                <FaStar className="text-warning" /> :
                                                                <FiStar className="text-warning" />
                                                            }
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </ModalBody>
                        <ModalFooter className="py-2 px-3">
                            <Button
                                color="danger"
                                size="sm"
                                onClick={() => setSurveyModal(false)}
                                style={{ minWidth: '80px' }}
                            >
                                Close
                            </Button>
                        </ModalFooter>
                    </Modal>


                    {/* VMS Image Preview Modal */}
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





                    {/* this is the graph of the consumerhistory */}

                    {showGraph && chartData && (
                        <Card className="mt-3">
                            <CardHeader className="py-2 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">KWH FR Comparison</h6>
                                <div className="d-flex align-items-center">
                                    <ButtonGroup size="sm">
                                        <Button
                                            color={chartType === 'bar' ? 'primary' : 'light'}
                                            onClick={() => setChartType('bar')}
                                            title="Bar Chart"
                                        >
                                            <FiBarChart2 />
                                        </Button>
                                        <Button
                                            color={chartType === 'line' ? 'primary' : 'light'}
                                            onClick={() => setChartType('line')}
                                            title="Line Chart"
                                        >
                                            <FiTrendingUp />
                                        </Button>
                                        <Button
                                            color={chartType === 'pie' ? 'primary' : 'light'}
                                            onClick={() => setChartType('pie')}
                                            title="Pie Chart"
                                        >
                                            <FiPieChart />
                                        </Button>
                                    </ButtonGroup>
                                    <Button
                                        color="light"
                                        size="sm"
                                        className="ms-2"
                                        onClick={downloadChart}
                                        title="Download Chart"
                                    >
                                        <FiDownload />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div style={{ height: '400px', position: 'relative' }}>
                                    {renderChart()}
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </Container>
            </div>

        </React.Fragment>
    );
};

export default ConsumerInformation;






