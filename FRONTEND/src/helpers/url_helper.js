//REGISTER
export const POST_FAKE_REGISTER = "/auth/signup";

//LOGIN
export const POST_FAKE_LOGIN = "/backend-service/login";
export const POST_FAKE_JWT_LOGIN = "/identity-service/post-jwt-login";
export const POST_FAKE_PASSWORD_FORGET = "/identity-service/auth/forgot-password";
export const POST_FAKE_JWT_PASSWORD_FORGET = "/identity-service/jwt-forget-pwd";
export const SOCIAL_LOGIN = "/identity-service/social-login";
export const GET_DISPLAY_NOTIFICATION = "/backend-service/getDisplayNotification"
export const SEND_TRACK_INFORMATION = "/backend-service/TrackUserDetails"

//Es Application
export const ES_APPLICATION_URL_CREATE = "/es-admin-svc/es/admin/applications/add";
export const ES_APPLICATION_URL_UPDATE = "/es-admin-svc/es/admin/applications/update";
export const ES_APPLICATION_URL_GET_ALL = "/es-admin-svc/es/admin/applications";

//Application Feature
export const ES_APPLICATION_ALL_URL_DDL = "/es-admin-svc/es/admin/appfeature/apps";
export const ES_APPLICATION_FEATURE_URL_CREATE = "/es-admin-svc/es/admin/appfeature/add";
export const ES_APPLICATION_FEATURE_URL_UPDATE = "/es-admin-svc/es/admin/appfeature/update";
export const ES_APPLICATION_FEATURE_URL_GET_ALL = "/es-admin-svc/es/admin/appfeature";

//Subscription Type
export const SUBSCRIPTION_TYPE_URL_CREATE = "/es-subscription-svc/es/subscription/types/add";
export const SUBSCRIPTION_TYPE_URL_UPDATE = "/es-subscription-svc/es/subscription/types/update";
export const SUBSCRIPTION_TYPE_URL_GET_ALL = "/es-subscription-svc/es/subscription/types";

//Subscription Category
export const SUBSCRIPTION_CATEGORY_URL_CREATE = "/es-subscription-svc/es/subscription/category/add";
export const SUBSCRIPTION_CATEGORY_URL_UPDATE = "/es-subscription-svc/es/subscription/category/update";
export const SUBSCRIPTION_CATEGORY_URL_GET_ALL = "/es-subscription-svc/es/subscription/category";

//Subscription Sub Category
export const SUBSCRIPTION_SUB_CATEGORY_URL_CATEGORY_DDL = "/es-subscription-svc/es/subscription/subcategory/category";
export const SUBSCRIPTION_SUB_CATEGORY_URL_CREATE = "/es-subscription-svc/es/subscription/subcategory/add";
export const SUBSCRIPTION_SUB_CATEGORY_URL_UPDATE = "/es-subscription-svc/es/subscription/subcategory/update";
export const SUBSCRIPTION_SUB_CATEGORY_URL_GET_ALL = "/es-subscription-svc/es/subscription/subcategory";

//Geography Type
// export const GEOGRAPHY_TYPE_URL_COUNTRY_DDL = "/es-master-svc/es/master/geographytype/countries";
// export const GEOGRAPHY_TYPE_URL_GET_ALL = "/es-master-svc/es/master/geographytype";




//geographyType

export const GEOGRAPHY_TYPE_URL_COUNTRY_DDL = "/es-master-svc/es/master/geographytype/countries";
export const GEOGRAPHY_TYPE_URL_GET_ALL = "/es-master-svc/es/master/geographytype";
export const GEOGRAPHY_TYPE_URL_CREATE = "/es-master-svc/es/master/geographytype/add";
export const GEOGRAPHY_TYPE_URL_UPDATE = "/es-master-svc/es/master/geographytype/update";


//Geography
export const GEOGRAPHY_URL_COUNTRY_DDL = "/es-master-svc/es/master/geography/countries";
export const GEOGRAPHY_URL_UPDATE = "/es-master-svc/es/master/geography/update";
export const GEOGRAPHY_URL_SAVE = "/es-master-svc/es/master/geography/add";
export const GEOGRAPHY_URL_TYPES_ALL = "/es-master-svc/es/master/geography/types";
export const GEOGRAPHY_URL_FIND_ALL = "/es-master-svc/es/master/geography";
export const GEOGRAPHY_URL_PARENT_FIND_ALL = "/es-master-svc/es/master/geography/parent";

//Location Type

export const LOCATION_TYPE_URL_COUNTRY_DDL = "/es-master-svc/es/master/locationtype/countries";
export const LOCATION_TYPE_URL_UPDATE = "/backend-service/Location-type/updateLocation";   //here i cahnged the url
export const LOCATION_TYPE_URL_SAVE = "/backend-service/Location-type/postLocationType";
export const LOCATION_TYPE_URL_CLIENT_ALL = "/es-master-svc/es/master/locationtype/client";
export const LOCATION_TYPE_URL_FIND_ALL = "/backend-service/Location-type/getLocationType";
export const LOCATION_TYPE_URL_PARENT_FIND_ALL = "/backend-service/Location-type/getParentLocationType";


//designation api

export const GET_DESIGNATION = "/backend-service/getDesignation"     //here i changed the things
export const POST_DEGINATION = "/backend-service/designationAdd"
export const UPDATE_DESIGNATION = "/backend-service/designationUpdate"

//All MeterReadingMaster
export const GET_METER_READING_MASTER = "/backend-service/getMeterReadingReason"
export const POST_METER_READING_MASTER = "/backend-service/MeterReadingReasonAdd"
export const UPDATE_METER_READING_MASTER = "/backend-service/MeterReadingReasonUpdate"

//meterReadingResgisterhtings

export const GET_METER_READING_DROPDOWNS = "/backend-service/api/getUserDropDowns"
export const POST_METER_READING_REGISTRATION = "/backend-service/userCreation/addUser"

export const GET_USERR_DROPDOWNSS="/backend-service/userCreation/getUserDropDowns"

//ManagePage
export const GET_MANAGE_DROPDOWNS = "/backend-service/getManagePageDpdwns"
export const GET_MANAGE_PAGE_DETAILS = "/backend-service/getManagePageDetails"
export const ADD_MANAGE_PAGE = "/backend-service/addManagePage"
export const UPDATE_MANAGE_PAGE = "/backend-service/updateManagePage"


// meterReadingDeviceAllocation
export const GET_METER_READING_DEVICEALLOCATION = "/backend-service/getmeterDeviceAllocationDropDwns"
export const UPDATE_METER_DEVICE_ALLOCATION = "/backend-service/updateMeterDeviceAllocationDetailss"
export const GET_DEVICE_ALLOCATION_DETAILS = "/backend-service/getmeterDeviceAllocationDetails"

//Tourplans
export const GET_METER_TOURPLAN_DROPDOWNS = "/backend-service/getMeterTourPlanDropdowns"
export const GET_TOUR_PLAN_DETAILS = "/backend-service/getMeterTourPlan"
export const SAVE_TOUR_PLAN = "/backend-service/scheduleTourPlan"
export const PROCESSED_TOUR_PLAN = "/backend-service/processTourPlan"

//ConsumerInformation
export const GET_CONSUMER_INFORMATION_DPWNS = "/backend-service/getConsumerInformationDrpdwns"
export const GET_CONSUMER_INFORMATION_SEARCH = "/backend-service/getConsumerDetails"
export const GET_CONSUMER_INFORMATION = "/backend-service/getConsumerDetails"
export const GET_CONSUMER_BILLING_INFORMATION = "/backend-service/getConsumerDetails"
export const GET_CONSUMER_SURVEY_INFORMATION = "/backend-service/getConsumerDetails"

// MisReport
export const GET_ALL_MISREPORT_DPDWNS = "/backend-service/misRepostDpwns"
export const GET_ALL_MIS_REPORT_INFORMATION = "/backend-service/getMisReportInformation"
export const GET_ALL_BILLING_DATA = "/backend-service/getBillingReportInformation"

//vmsManagement
export const GET_ALL_VMSMANAGEMET_DATA = "/backend-service/meterReadingReview"
export const POST_FORWOR_CLOSE = "/backend-service/forWordCloseSubmit"
export const GET_VMSIMAGES = "/backend-service/meterReadingReview"

//getVendoreMtereReaderCreation
export const GET_VENDOR_METER_READER_CREATION = "/backend-service/getVendorMeterReader"
export const GET_METER_VENDOR_METERDPDWNS = "/backend-service/getVendorMeterReaderDpwdns"
export const ADD_VENDOR_METER_READER = "/backend-service/addVendorMeterReader"
export const UPDATE_VENDOR_METER_READER = "/backend-service/updateVendorMeterReader"
export const GET_CONSUMER_PHOTO = "/backend-service/getConsumerInformationDrpdwns"





//All surveyCategoryCreation
export const GET_SURVEY_CATEGORY_CREATION = "/backend-service/getSurveyCategory"
export const POST_SURVEY_CATEGORY_CREATION = "/backend-service/SurveyCategoryAdd"
export const SURVEY_CATEGORY_UPDATE = "/backend-service/SurveyCategoryUpdate"

//all satisfactioncreation
export const GET_SATISFACTION = "/backend-service/getSatisfactionLevel"
export const POST_SATISFACTION = "/backend-service/SatisfactionLevelAdd"
export const UPDATE_SATISFACTION = "/backend-service/SatisfactionLevelUpdate"

//LocationCreation thisngs
export const GET_LOCATION_CREATION = "/backend-service/getLocationCreation"
export const GET_LOCATION_CREATION_DPDWNS = "/backend-service/getLocationCreationDropDowns"
export const POST_LOCATION_CREATIONS = "/backend-service/locationCreationAdd"
export const UPDATE_LOCATION_CREATION = "/backend-service/updateLocationCreation"


//GET_MANAGEUSERDETAILS
export const GET_MANAGEUSERDETAILS = "/backend-service/getManageUser"
export const GET_MANAGE_USER_DROPDOWNSS = "/backend-service/getManageUserDropDowns"
export const UPDATE_MANAGE_USER_DETAILSS = "/backend-service/updateManageUserDetails"
export const UPDATE_MANAGE_USER_PASSWORD = "/backend-service/updateManageUserPassword"
export const UPDATE_MANAGE_USER_STATUS = "/backend-service/updateManageUserStatus"


//getsurveySubcategory
export const GET_SURVEYSUBCATEGORY = "/backend-service/getSurveySubCategory"
export const POST_SURVEYSUBCATEGORY = "/backend-service/SurveySubCategoryAdd"
export const GET_SURVEYSUBCATEGORYDROPDOWN = "/backend-service/SurveyCategoryDropdownList"
export const UPDATE_SURVEYSUBCATEGORY = "/backend-service/SurveySubCategoryUpdate"

export const GET_GEOGRAPHY_CREATION = "/es-master-svc/es/master/geography"
export const POST_GEOGRAPHY_DROPDOWNS = "/es-master-svc/es/master/geography/Geography_type_dropdown"
export const POST_GEOGRAPHYCREATIONS = "/es-master-svc/es/master/geography/add"
export const UPDATE_GEOGRAPHYCREATION = "/es-master-svc/es/master/geography/update"
export const GET_GEOGRAPHY_CREATION_DPWNDS = "/es-master-svc/es/master/geography/Geography_type_dropdown"



//notification
export const getAllNotifications = "/backend-service/getNotification";
export const NotificationTypes = "/backend-service/NotificationType";
export const getRolesLists = "/backend-service/getRolesList";
export const NotificationAdds = "/backend-service/NotificationAdd";
export const Notificationupdates = "/backend-service/NotificationUpdate";


//Location
export const LOCATION_URL_TYPES_DDL = "/es-master-svc/es/master/location/types";
export const LOCATION_URL_COUNTRY_DDL = "/es-master-svc/es/master/location/countries";
export const LOCATION_URL_CLIENT_DDL = "/es-master-svc/es/master/location/client";
export const LOCATION_URL_GEOGRAPHY_TYPE_DDL = "/es-master-svc/es/master/location/geographytype";
export const LOCATION_URL_GEOGRAPHY_DDL = "/es-master-svc/es/master/location/geography";
export const LOCATION_URL_PARENT_LC_DDL = "/es-master-svc/es/master/location/parent";
export const LOCATION_URL_SAVE = "/es-master-svc/es/master/location/add";


export const SUPPLIER_MASTER_BUS_TYPES_URL = "/es-master-svc/es/master/supplier/businesstypes";
export const SUPPLIER_MASTER_COMPANY_TYPES_URL = "/es-master-svc/es/master/supplier/companytypes";
export const SUPPLIER_MASTER_COUNTRIES_URL = "/es-master-svc/es/master/supplier/countries";
export const SUPPLIER_MASTER_GEO_TYPES_URL = "/es-master-svc/es/master/supplier/geographytypes";
export const SUPPLIER_MASTER_GEO_URL = "/es-master-svc/es/master/supplier/geography";
export const SUPPLIER_MASTER_SAVE_URL = "/es-master-svc/es/master/supplier/add";

//meter registartiondata
export const METER_REGISTER_DATA = "/backend-service/MeterReadingRegitsterAdd"
export const GET_ALL_METER_READER_REGISTRATION = "/backend-service/getMeterReadingRegistration"


export const CUSTOMER_MASTER_BUS_TYPES_URL = "/es-master-svc/es/master/customer/businesstypes";
export const CUSTOMER_MASTER_COMPANY_TYPES_URL = "/es-master-svc/es/master/customer/companytypes";
export const CUSTOMER_MASTER_COUNTRIES_URL = "/es-master-svc/es/master/customer/countries";
export const CUSTOMER_MASTER_CLIENT_URL = "/es-master-svc/es/master/customer/client";
export const CUSTOMER_MASTER_GEO_TYPES_URL = "/es-master-svc/es/master/customer/geographytypes";
export const CUSTOMER_MASTER_GEO_URL = "/es-master-svc/es/master/customer/geography";
export const CUSTOMER_MASTER_SAVE_URL = "/es-master-svc/es/master/customer/add";

//Approval process
export const APPROVAL_PROCESS_URL_SAVE = "/es-material-svc/es/approval-process/add";
export const APPROVAL_PROCESS_URL_UPDATE = "/es-material-svc/es/approval-process/update";
export const APPROVAL_PROCESS_URL_GET_ALL = "/es-material-svc/es/approval-process";


//Material Sub Category
export const MATERIAL_SUB_CATEGORY_URL_SAVE = "/es-material-svc/es/material/subcategory/add";
export const MATERIAL_SUB_CATEGORY_URL_UPDATE = "/es-material-svc/es/material/subcategory/update";
export const MATERIAL_SUB_CATEGORIES_URL_GET_ALL = "/es-material-svc/es/material/subcategories";
export const MATERIAL_SUB_CATEGORY_CATEGORY_URL_GET_ALL = "/es-material-svc/es/material/subcategory/categories";
export const MATERIAL_SUB_CATEGORY_RECEIVE_MODES_URL_GET_ALL = "/es-material-svc/es/material/subcategory/receivemodes";
export const MATERIAL_SUB_CATEGORY_TYPE_URL = "/es-material-svc/es/material/subcategory/types";

//Model master
export const MODEL_MASTER_URL_SAVE = "/es-material-svc/es/material/model/add";
export const MODEL_MASTER_URL_UPDATE = "/es-material-svc/es/material/model/update";
export const MODEL_MASTER_URL_GET_ALL = "/es-material-svc/es/material/model/models";
export const MODEL_MASTER_TYPE_ID_URL = "/es-material-svc/es/material/model/types";
export const MODEL_MASTER_CATEGORY_URL_GET_ALL = "/es-material-svc/es/material/model/categories";
export const MODEL_MASTER_SUB_CATEGORY_URL_GET_ALL = "/es-material-svc/es/material/model/subcategories";

//Abbreviation master
export const ABBREVIATION_MASTER_URL_SAVE = "/es-material-svc/es/material/abbreviation/add";
export const ABBREVIATION_MASTER_URL_UPDATE = "/es-material-svc/es/material/abbreviation/update";
export const ABBREVIATION_MASTER_URL_GET_ALL = "/es-material-svc/es/material/abbreviation/abbreviations";
export const ABBREVIATION_MASTER_MATERIAL_TYPE_ID_URL = "/es-material-svc/es/material/abbreviation/types";
export const ABBREVIATION_MASTER_CATEGORY_URL_GET_ALL = "/es-material-svc/es/material/abbreviation/categories";
export const ABBREVIATION_MASTER_SUB_CATEGORY_URL_GET_ALL = "/es-material-svc/es/material/abbreviation/subcategories";


//Material Category
export const MATERIAL_CATEGORY_URL_SAVE = "/es-material-svc/es/material/category/add";
export const MATERIAL_CATEGORY_URL_UPDATE = "/es-material-svc/es/material/category/update";
export const MATERIAL_CATEGORY_URL_GET_ALL = "/es-material-svc/es/material/categories";
export const MATERIAL_TYPES_URL_GET_ALL = "/es-material-svc/es/material/category/types";

//Material Receive Mode
export const MATERIAL_RECEIVE_MODE_ID_URL_SAVE = "/es-material-svc/es/material/receivemode/add";
export const MATERIAL_RECEIVE_MODE_ID_URL_UPDATE = "/es-material-svc/es/material/receivemode/update";
export const MATERIAL_RECEIVE_MODE_ID_URL_GET_ALL = "/es-material-svc/es/material/receiveModes";

//Document Type
export const DOCUMENT_TYPE_GET_URL = "/es-admin-svc/es/admin/document";
export const DOCUMENT_TYPE_SAVE_URL = "/es-admin-svc/es/admin/document/add";
export const DOCUMENT_TYPE_UPDATE_URL = "/es-admin-svc/es/admin/document/update";

//documenet upload of dms url
export const DOCUMENET_UPLOADSS="/backend-service/documentUpload";
export const POST_DOCUMENT_UPLOAD="/backend-service/documentUpload";
export const POST_DOCUMENT_UPLOAD_VIEW="/backend-service/documentUpload";
export const VIEW_DOCUMENT="/backend-service/documentUpload/documentView";
export const QC_REVIEW="/backend-service/qcUpload/verifiedQc";
export const VIEW="/backend-service/documentUpload/documentView";
export const SINGLE_ZONE_UPLOAD= "/backend-service/zoneupload/singleZoneUpload";
export const SINGLE_CONSUMER_UPLOAD= "/backend-service/consumerUpload/singleConsumerUpload";
export const SCAN_IMPLEMENT="/scan-service/scan";
export const Document_Audit= "/backend-service/document_audit_logs";


//DOCUMENT CATEGORY
export const DOCUMENT_CATEGORY_GET_URL = "/es-admin-svc/es/admin/documentCategory";
export const DOCUMENT_CATEGORY_GET_TYPE_URL = "/es-admin-svc/es/admin/documentType";
export const DOCUMENT_CATEGORY_SAVE_URL = "/es-admin-svc/es/admin/documentCategory/add";
export const DOCUMENT_CATEGORY_UPDATE_URL = "/es-admin-svc/es/admin/documentCategory/update";

export const CLIENT_MATERIAL_MAPPING_COUNTRY_URL = "/es-material-svc/es/material/client/subcategory/countries";
export const CLIENT_MATERIAL_MAPPING_CLIENT_URL = "/es-material-svc/es/material/client/subcategory/clients";
export const CLIENT_MATERIAL_MAPPING_NON_ALLOCATED_URL = "/es-material-svc/es/material/client/subcategory/nonallocatedms";
export const CLIENT_MATERIAL_MAPPING_ALLOCATED_URL = "/es-material-svc/es/material/client/subcategory/allocatedms";
export const CLIENT_MATERIAL_MAPPING_SAVE_URL = "/es-material-svc/es/material/client/subcategory/add";


//Manage Page
export const MANAGE_PAGE_APPLICATIONS_URL = "/es-admin-svc/es/admin/managepage/applications";
export const MANAGE_PAGE_APPLICATION_FEATURE_URL = "/es-admin-svc/es/admin/managepage/appfeture";
export const MANAGE_PAGE_PARENT_PAGES_URL = "/es-admin-svc/es/admin/managepage/parentPages";
export const MANAGE_PAGE_PRIOR_PARENT_PAGES_URL = "/es-admin-svc/es/admin/managepage/priorParentPages";
export const MANAGE_PAGE_CHILD_PAGES_URL = "/es-admin-svc/es/admin/managepage/childPages";
export const MANAGE_PAGE_ALL_PAGES_URL = "/es-admin-svc/es/admin/managepage/allPages";
export const MANAGE_PAGE_SAVE_URL = "/es-admin-svc/es/admin/managepage/add";
export const MANAGE_PAGE_UPDATE_URL = "/es-admin-svc/es/admin/managepage/update";


//Material Type
export const MATERIAL_TYPE_URL_SAVE = "/es-material-svc/es/material/type/add";
export const MATERIAL_TYPE_URL_UPDATE = "/es-material-svc/es/material/type/update";
export const MATERIAL_TYPE_URL_GET_ALL = "/es-material-svc/es/material/types";


//Role-creation here===>>>>>>>>>>here i changed the path 
//here i changed the path 
export const ROLES_URL_GET_DELETE = "/roleCreation/getRole";
export const GET_VENDORS = "/backend-service/getVendor";                    //here i changed  
export const POST_VENDOR = "/backend-service/addVendor";
export const UPDATE_VENDOR = "/backend-service/updateVendor";

//Roles creation get role it is


//Dms project apis
export const GET_ROLES = "/backend-service/roleCreation/getRole"
export const ROLES_URL_CREATE = "/backend-service/roleCreation/addRole";
export const ROLES_URL_UPDATE = "/backend-service/roleCreation/updateRole";
export const RESET_PASSWORD_URL = "/backend-service/resetPassword";
export const ZONE_UPLOAD_URL = "/backend-service/zoneupload";


export const CONSUMER_UPLOAD_URL = "/backend-service/consumerUpload";

export const LOGIN_AUDIT_URL = "/backend-service/LoginAudit";
export const MANAGE_USER_GET = "/backend-service/editUser";
export const GET_MANAGE_USER_DROPDOWNS="/backend-service/editUser/getDpdwns";
export const GET_CATEGORY_CREATION = "/backend-service/documentCategory";
export const GET_QC_DOCUMENT = "/backend-service/qcUpload";
export const POST_CREATE_INDENT = "/backend-service/indent";
export const INDENT_PROJECT_HEAD = "/backend-service/indent/IndentProjectHead";

//**************** */



export const CLEINT_ROLES_URL_GET_COUNTRY = "/identity-service/api/client/getCountry";
export const CLEINT_ROLES_URL_GET_CLIENTS = "/identity-service/api/client/getClients";
export const CLEINT_ROLES_URL_ALLROLES = "/identity-service/api/client/getClientAllRoles";
export const CLEINT_ROLES_URL_SAVE = "/identity-service/api/client/save";

export const USER_GET_CONSTANTS = "/identity-service/api/user/constants";
export const USER_GET_COUNTRY = "/identity-service/api/user/getCountry";
export const USER_GET_CLIENT = "/identity-service/api/user/getClient";
export const USER_GET_USER_LOCATIONTYPE = "/identity-service/api/user/getLocationType";
export const USER_GET_USER_LOCATION = "/identity-service/api/user/getLocation";
export const USER_GET_GEOGRAPHY_TYPE = "/identity-service/api/user/getGeographyType";
export const USER_GET_CHECK_AVAILABILITY = "/identity-service/api/user/checkAvailablity";
export const USER_SAVE_DATA = "/identity-service/api/user/save";
export const USER_GET_GEOGRAPHY = "/identity-service/api/user/getGeography";
export const USER_GET_USERID = "/identity-service/api/user/userId";

export const GET_GENDER = "/backend-service/api"   //gender things
export const GET_DROPDOWNS = "/backend-service/getMeterReadingDropDowns"

//application Details url
// export const APPLICATION_DETAILS="/application-detail/"   // here i changed the application url

//Invoice Process
export const INVOICE_TYPE_GET_URL = "/es-admin-svc/es/admin/invoice";
export const INVOICE_TYPE_SAVE_URL = "/es-admin-svc/es/admin/invoice/add";
export const INVOICE_TYPE_UPDATE_URL = "/es-admin-svc/es/admin/invoice/update";

export const INVOICE_CATAGORY_GET_URL = "/es-admin-svc/es/admin/invoiceCatagory";
export const INVOICE_CATAGORY_GET_TYPE_URL = "/es-admin-svc/es/admin/invoiceType";
export const INVOICE_CATAGORY_SAVE_URL = "/es-admin-svc/es/admin/invoiceCatagory/add";
export const INVOICE_CATAGORY_UPDATE_URL = "/es-admin-svc/es/admin/invoiceCatagory/update";

export const INVOICE_SUBTYPE_GET_URL = "/es-admin-svc/es/admin/subInvoice";
export const INVOICE_SUBTYPE_GET_TYPE_URL = "/es-admin-svc/es/admin/subInvoice/type";
export const INVOICE_SUBTYPE_GET_CAT_URL = "/es-admin-svc/es/admin/subInvoice/catagory";
export const INVOICE_SUBTYPE_SAVE_URL = "/es-admin-svc/es/admin//subInvoice/add";
export const INVOICE_SUBTYPE_UPDATE_URL = "/es-admin-svc/es/admin//subInvoice/update";

//*****************************MASTERS START*********************************************
//CAPACITY MASTER
export const CAPACITY_MATERIAL_TYPE = "/es-master-svc/es/master/capacity/material/type";
export const CAPACITY_MATERIAL_CATAGORY = "es-master-svc/es/master/capacity/material/catagory";
export const CAPACITY_MATERIAL_SUB_CATAGORY = "/es-master-svc/es/master/capacity/material/subCatagory";
export const CAPACITY_VIEW_URL = "/es-master-svc/es/master/capacity";
export const CAPACITY_SAVE_URL = "/es-master-svc/es/master/capacity/save";
export const CAPACITY_UPDATE_URL = "/es-master-svc/es/master/capacity/update";
//MAKE MASTER
export const MAKE_VIEW_URL = "/es-master-svc/es/master/make";
export const MAKE_SAVE_URL = "/es-master-svc/es/master/make/add";
export const MAKE_UPDATE_URL = "/es-master-svc/es/master/make/update";
//PARTICULAR MASTER
export const PARTICULAR_VIEW_URL = "/es-master-svc/es/master/particular";
export const PARTICULAR_SAVE_URL = "/es-master-svc/es/master/particular/add";
export const PARTICULAR_UPDATE_URL = "/es-master-svc/es/master/particular/update";

//Reason Category
export const REASON_CATEGORY_VIEW_URL = "/es-master-svc/es/master/reason";
export const REASON_CATEGORY_SAVE_URL = "/es-master-svc/es/master/reason/add";
export const REASON_CATEGORY_UPDATE_URL = "/es-master-svc/es/master/reason/update";

//Reason Sub Category
export const SUB_REASON_CATEGORY_VIEW_URL = "/es-master-svc/es/master/subReason";
export const SUB_REASONS_CATEGORY_VIEW_URL = "/es-master-svc/es/master/reasonCatagory";
export const SUB_REASON_CATEGORY_SAVE_URL = "/es-master-svc/es/master/subReason/add";
export const SUB_REASON_CATEGORY_UPDATE_URL = "/es-master-svc/es/master/subReason/update";

//UNITS OF MEASUREMENTS
export const UNITS_OF_MEASUREMENT_VIEW_URL = "/es-master-svc/es/master/units";
export const UNITS_OF_MEASUREMENT_SAVE_URL = "/es-master-svc/es/master/units/add";
export const UNITS_OF_MEASUREMENT_UPDATE_URL = "/es-master-svc/es/master/units/update";

//*****************************MASTERS END*********************************************
//PROFILE
export const POST_EDIT_JWT_PROFILE = "/identity-service/post-jwt-profile";
export const POST_EDIT_PROFILE = "/identity-service/user";

// Calendar
export const GET_EVENTS = "/events";
export const GET_CATEGORIES = "/categories";
export const GET_UPCOMMINGEVENT = "/upcommingevents";
export const ADD_NEW_EVENT = "/add/event";
export const UPDATE_EVENT = "/update/event";
export const DELETE_EVENT = "/delete/event";

// Chat
export const GET_DIRECT_CONTACT = "/chat";
export const GET_MESSAGES = "/messages";
export const ADD_MESSAGE = "add/message";
export const GET_CHANNELS = "/channels";
export const DELETE_MESSAGE = "delete/message";

//Mailbox
export const GET_MAIL_DETAILS = "/mail";
export const DELETE_MAIL = "/delete/mail";

// Ecommerce
// Product
export const GET_PRODUCTS = "/apps/product";
export const DELETE_PRODUCT = "/apps/product";
export const ADD_NEW_PRODUCT = "/apps/product";
export const UPDATE_PRODUCT = "/apps/product";

// Orders
export const GET_ORDERS = "/apps/order";
export const ADD_NEW_ORDER = "/apps/order";
export const UPDATE_ORDER = "/apps/order";
export const DELETE_ORDER = "/apps/order";

// Customers
export const GET_CUSTOMERS = "/apps/customer";
export const ADD_NEW_CUSTOMER = "/apps/customer";
export const UPDATE_CUSTOMER = "/apps/customer";
export const DELETE_CUSTOMER = "/apps/customer";

// Sellers
export const GET_SELLERS = "/sellers";

// Project list
export const GET_PROJECT_LIST = "/project/list";

// Task
export const GET_TASK_LIST = "/apps/task";
export const ADD_NEW_TASK = "/apps/task";
export const UPDATE_TASK = "/apps/task";
export const DELETE_TASK = "/apps/task";

// CRM
// Conatct
export const GET_CONTACTS = "/apps/contact";
export const ADD_NEW_CONTACT = "/apps/contact";
export const UPDATE_CONTACT = "/apps/contact";
export const DELETE_CONTACT = "/apps/contact";

// Companies
export const GET_COMPANIES = "/apps/company";
export const ADD_NEW_COMPANIES = "/apps/company";
export const UPDATE_COMPANIES = "/apps/company";
export const DELETE_COMPANIES = "/apps/company";

// Lead
export const GET_LEADS = "/apps/lead";
export const ADD_NEW_LEAD = "/apps/lead";
export const UPDATE_LEAD = "/apps/lead";
export const DELETE_LEAD = "/apps/lead";

// Deals
export const GET_DEALS = "/deals";

// Crypto
export const GET_TRANSACTION_LIST = "/transaction-list";
export const GET_ORDRER_LIST = "/order-list";

// Invoice
export const GET_INVOICES = "/apps/invoice";
export const ADD_NEW_INVOICE = "/apps/invoice";
export const UPDATE_INVOICE = "/apps/invoice";
export const DELETE_INVOICE = "/apps/invoice";

// TicketsList
export const GET_TICKETS_LIST = "/apps/ticket";
export const ADD_NEW_TICKET = "/apps/ticket";
export const UPDATE_TICKET = "/apps/ticket";
export const DELETE_TICKET = "/apps/ticket";

// kanban
export const GET_TASKS = "/apps/tasks";
export const ADD_TASKS = "/add/tasks";
export const UPDATE_TASKS = "/update/tasks";
export const DELETE_TASKS = "/delete/tasks";

// Dashboard Analytics

// Sessions by Countries
export const GET_ALL_DATA = "/all-data";
export const GET_HALFYEARLY_DATA = "/halfyearly-data";
export const GET_MONTHLY_DATA = "/monthly-data";

// Audiences Metrics
export const GET_ALLAUDIENCESMETRICS_DATA = "/allAudiencesMetrics-data";
export const GET_MONTHLYAUDIENCESMETRICS_DATA = "/monthlyAudiencesMetrics-data";
export const GET_HALFYEARLYAUDIENCESMETRICS_DATA = "/halfyearlyAudiencesMetrics-data";
export const GET_YEARLYAUDIENCESMETRICS_DATA = "/yearlyAudiencesMetrics-data";

// Users by Device
export const GET_TODAYDEVICE_DATA = "/todayDevice-data";
export const GET_LASTWEEKDEVICE_DATA = "/lastWeekDevice-data";
export const GET_LASTMONTHDEVICE_DATA = "/lastMonthDevice-data";
export const GET_CURRENTYEARDEVICE_DATA = "/currentYearDevice-data";

// Audiences Sessions by Country
export const GET_TODAYSESSION_DATA = "/todaySession-data";
export const GET_LASTWEEKSESSION_DATA = "/lastWeekSession-data";
export const GET_LASTMONTHSESSION_DATA = "/lastMonthSession-data";
export const GET_CURRENTYEARSESSION_DATA = "/currentYearSession-data";

// Dashboard CRM

// Balance Overview
export const GET_TODAYBALANCE_DATA = "/todayBalance-data";
export const GET_LASTWEEKBALANCE_DATA = "/lastWeekBalance-data";
export const GET_LASTMONTHBALANCE_DATA = "/lastMonthBalance-data";
export const GET_CURRENTYEARBALANCE_DATA = "/currentYearBalance-data";

// Deal type
export const GET_TODAYDEAL_DATA = "/todayDeal-data";
export const GET_WEEKLYDEAL_DATA = "/weeklyDeal-data";
export const GET_MONTHLYDEAL_DATA = "/monthlyDeal-data";
export const GET_YEARLYDEAL_DATA = "/yearlyDeal-data";

// Sales Forecast

export const GET_OCTSALES_DATA = "/octSales-data";
export const GET_NOVSALES_DATA = "/novSales-data";
export const GET_DECSALES_DATA = "/decSales-data";
export const GET_JANSALES_DATA = "/janSales-data";

// Dashboard Ecommerce
// Revenue
export const GET_ALLREVENUE_DATA = "/allRevenue-data";
export const GET_MONTHREVENUE_DATA = "/monthRevenue-data";
export const GET_HALFYEARREVENUE_DATA = "/halfYearRevenue-data";
export const GET_YEARREVENUE_DATA = "/yearRevenue-data";

// Dashboard Crypto
// Portfolio
export const GET_BTCPORTFOLIO_DATA = "/btcPortfolio-data";
export const GET_USDPORTFOLIO_DATA = "/usdPortfolio-data";
export const GET_EUROPORTFOLIO_DATA = "/euroPortfolio-data";

// Market Graph
export const GET_ALLMARKETDATA_DATA = "/allMarket-data";
export const GET_YEARMARKET_DATA = "/yearMarket-data";
export const GET_MONTHMARKET_DATA = "/monthMarket-data";
export const GET_WEEKMARKET_DATA = "/weekMarket-data";
export const GET_HOURMARKET_DATA = "/hourMarket-data";

// Dashboard Crypto
// Project Overview
export const GET_ALLPROJECT_DATA = "/allProject-data";
export const GET_MONTHPROJECT_DATA = "/monthProject-data";
export const GET_HALFYEARPROJECT_DATA = "/halfYearProject-data";
export const GET_YEARPROJECT_DATA = "/yearProject-data";

// Project Status
export const GET_ALLPROJECTSTATUS_DATA = "/allProjectStatus-data";
export const GET_WEEKPROJECTSTATUS_DATA = "/weekProjectStatus-data";
export const GET_MONTHPROJECTSTATUS_DATA = "/monthProjectStatus-data";
export const GET_QUARTERPROJECTSTATUS_DATA = "/quarterProjectStatus-data";

// Dashboard NFT
// Marketplace
export const GET_ALLMARKETPLACE_DATA = "/allMarketplace-data";
export const GET_MONTHMARKETPLACE_DATA = "/monthMarketplace-data";
export const GET_HALFYEARMARKETPLACE_DATA = "/halfYearMarketplace-data";
export const GET_YEARMARKETPLACE_DATA = "/yearMarketplace-data";

// Project
export const ADD_NEW_PROJECT = "/add/project";
export const UPDATE_PROJECT = "/update/project";
export const DELETE_PROJECT = "/delete/project";

// Pages > Team
export const GET_TEAMDATA = "/teamData";
export const DELETE_TEAMDATA = "/delete/teamData";
export const ADD_NEW_TEAMDATA = "/add/teamData";
export const UPDATE_TEAMDATA = "/update/teamData";

// File Manager
// Folder
export const GET_FOLDERS = "/folder";
export const DELETE_FOLDER = "/delete/folder";
export const ADD_NEW_FOLDER = "/add/folder";
export const UPDATE_FOLDER = "/update/folder";

// File
export const GET_FILES = "/file";
export const DELETE_FILE = "/delete/file";
export const ADD_NEW_FILE = "/add/file";
export const UPDATE_FILE = "/update/file";

// To do
export const GET_TODOS = "/todo";
export const DELETE_TODO = "/delete/todo";
export const ADD_NEW_TODO = "/add/todo";
export const UPDATE_TODO = "/update/todo";

// To do Project
export const GET_PROJECTS = "/projects";
export const ADD_NEW_TODO_PROJECT = "/add/project";

//JOB APPLICATION
export const GET_APPLICATION_LIST = "/application-list";


//JOB APPLICATION
export const GET_API_KEY = "/api-key";