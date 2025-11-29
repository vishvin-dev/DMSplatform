import {APIClient} from "./api_helper";
import axios from 'axios';

import * as url from "./url_helper";
import {
    DOCUMENT_CATEGORY_GET_TYPE_URL,
    MANAGE_PAGE_APPLICATION_FEATURE_URL,
    MANAGE_PAGE_APPLICATIONS_URL, MANAGE_PAGE_CHILD_PAGES_URL,
    MANAGE_PAGE_PARENT_PAGES_URL, MANAGE_PAGE_SAVE_URL, REASON_CATEGORY_SAVE_URL,
    POST_VENDOR,
    UPDATE_VENDOR,
    GET_VENDORS
} from "./url_helper";


const api = new APIClient();

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
    const user = localStorage.getItem("user");
    if (user) return JSON.parse(user);
    return null;
};

// //is user is logged in
export const isUserAuthenticated = () => {
    return getLoggedInUser() !== null;
};

// Register Method
export const postFakeRegister = data => api.create(url.POST_FAKE_REGISTER, data);

// Login Method
export const postFakeLogin = data => api.create(url.POST_FAKE_LOGIN, data);   //path update

export const getDisplayNotification= data => api.create(url.GET_DISPLAY_NOTIFICATION, data);
export const trackingResult=(data)=> api.create(url.SEND_TRACK_INFORMATION, data);

// Create Es Application
export const postApplicationCreate = data => api.create(url.ES_APPLICATION_URL_CREATE, data);

//Update ES Application
export const putEsApplicationUpdate = data => api.create(url.ES_APPLICATION_URL_UPDATE, data);

//Get Es Application By Id
export const getEsApplicationById = data => api.get(url.ES_APPLICATION_URL_GET_ALL + '/' + data);

//Get All EsApplication
export const getAllEsApplication = () => api.get(url.ES_APPLICATION_URL_GET_ALL);


// Create Subscription Type
export const postSubscriptionTypeCreate = data => api.create(url.SUBSCRIPTION_TYPE_URL_CREATE, data);

//Update Subscription Type
export const putSubscriptionTypeUpdate = data => api.create(url.SUBSCRIPTION_TYPE_URL_UPDATE, data);

//Get Subscription Type By Id
export const getSubscriptionTypeById = data => api.get(url.SUBSCRIPTION_TYPE_URL_GET_ALL + '/' + data);

//Get All Subscription Type
export const getAllSubscriptionType = () => api.get(url.SUBSCRIPTION_TYPE_URL_GET_ALL);

// Create Subscription Category
export const postSubscriptionCategoryCreate = data => api.create(url.SUBSCRIPTION_CATEGORY_URL_CREATE, data);

//Update Subscription Category
export const putSubscriptionCategoryUpdate = data => api.create(url.SUBSCRIPTION_CATEGORY_URL_UPDATE, data);

//Get Subscription Category By Id
export const getSubscriptionCategoryById = data => api.get(url.SUBSCRIPTION_CATEGORY_URL_GET_ALL + '/' + data);

//Get All Subscription Category
export const getAllSubscriptionCategory = () => api.get(url.SUBSCRIPTION_CATEGORY_URL_GET_ALL);


// Create Subscription SubCategory
export const postSubscriptionSubCategoryCreate = data => api.create(url.SUBSCRIPTION_SUB_CATEGORY_URL_CREATE, data);

//Update Subscription SubCategory
export const putSubscriptionSubCategoryUpdate = data => api.create(url.SUBSCRIPTION_SUB_CATEGORY_URL_UPDATE, data);

//Get Subscription SubCategory By Id
export const getSubscriptionSubCategoryById = data => api.get(url.SUBSCRIPTION_SUB_CATEGORY_URL_GET_ALL + '/' + data);

//Get All Subscription SubCategory
export const getAllSubscriptionSubCategory = () => api.get(url.SUBSCRIPTION_SUB_CATEGORY_URL_GET_ALL);

//Get All Subscription Subcategory Apps
export const getAllSubscriptionCategorySelect = () => api.get(url.SUBSCRIPTION_SUB_CATEGORY_URL_CATEGORY_DDL);

// Create Geography Type


//Update Geography Type


//Get All  Geography Type
// export const getGeographyTypesByCountryId = data => api.get(url.GET_GEOGRAPHY_TYPE);

//Get All Parent Geography Type
export const getParentGeographyTypesByCountryId = data => api.get(url.GEOGRAPHY_TYPE_URL_GET_ALL +'/parent'+ '/' + data);

//Get All Countries from Geography Types
export const getAllGeographyTypeCountries = () => api.get(url.GEOGRAPHY_TYPE_URL_COUNTRY_DDL);




//geographyTypeName 
// export const getGeographyType = () => api.get(url.GET_GEOGRAPHY_TYPEE);
export const postGeographyTypeCreate = (data) => api.create(url.GEOGRAPHY_TYPE_URL_CREATE, data);
// export const getGeographyDdwns=(data)=>api.create(url.GET_GEOGRAPHY_DROPDWONS, data);
export const putGeographyTypeUpdate = data => api.put(url.GEOGRAPHY_TYPE_URL_UPDATE, data);

//  export const postGeographyTypeCreate = data => api.create(url.GEOGRAPHY_TYPE_URL_CREATE, data);
//  export const putGeographyTypeUpdate = data => api.put(url.GEOGRAPHY_TYPE_URL_UPDATE, data);
 export const getGeographyTypesByCountryId = data => api.get(url.GEOGRAPHY_TYPE_URL_GET_ALL)





// export const getAllGeographyCountries = () => api.get(url.GEOGRAPHY_URL_COUNTRY_DDL);
// export const putGeographyUpdate = data => api.put(url.GEOGRAPHY_URL_UPDATE, data);
// export const postGeographyCreate = data => api.create(url.GEOGRAPHY_URL_SAVE, data);
// export const getGeoGeographyTypesByCountryId = data => api.get(url.GEOGRAPHY_URL_TYPES_ALL);
// export const getGeographyByCountryId = data => api.get(url.GEOGRAPHY_URL_FIND_ALL + '/' + data);
// export const getParentGeographyByCountryIdAndTypeId = (data, data2) => api.get(url.GEOGRAPHY_URL_PARENT_FIND_ALL + '/' + data + '/' + data2);

export const getAllGeographyCountries = () => api.get(url.GEOGRAPHY_URL_COUNTRY_DDL);
export const putGeographyUpdate = data => api.put(url.GEOGRAPHY_URL_UPDATE, data);
export const postGeographyCreate = data => api.create(url.GEOGRAPHY_URL_SAVE, data);
export const getGeoGeographyTypesByCountryId = data => api.get(url.GEOGRAPHY_URL_TYPES_ALL+ '/'+'?'+'PGeographyTypeID' + '=' + data);
export const getGeographyByCountryId = data => api.get(url.GEOGRAPHY_URL_FIND_ALL);
export const getParentGeographyByCountryIdAndTypeId = (data, data2) => api.get(url.GEOGRAPHY_URL_PARENT_FIND_ALL + '/' + data + '/' + data2);



export const getAllLocationTypeCountries = () => api.get(url.LOCATION_TYPE_URL_COUNTRY_DDL);
export const putLocationTypeUpdate = data => api.put(url.LOCATION_TYPE_URL_UPDATE, data);
export const postLocationTypeCreate = data => api.create(url.LOCATION_TYPE_URL_SAVE, data);   //posting of data of location 
export const getLocationTypeClientByCountryId = data => api.get(url.LOCATION_TYPE_URL_CLIENT_ALL + '/' + data);




export const getLocationTypeByCountryIdAndClientId = (data) => api.create(url.LOCATION_TYPE_URL_FIND_ALL,data);   // changing a location things




export const getParentLocationType = (data) => api.create(url.LOCATION_TYPE_URL_PARENT_FIND_ALL,data);   //here i changed the getParentPage


//all Designation things
export const getAllDesignations=()=>api.get(url.GET_DESIGNATION);                       
export const postCreateDesignation=(data)=>api.create(url.POST_DEGINATION, data);    //here i changed
export const putUpdateDesignation=(data)=>api.put(url.UPDATE_DESIGNATION, data);

//all getAllSatisfactionCreation
export const getAllSatisfactionlevel=(data)=>api.create(url.GET_SATISFACTION,data); 
export const postCreateSatisfaction=(data)=>api.create(url.POST_SATISFACTION, data); 
export const putUpdateSatisfaction=(data)=>api.put(url.UPDATE_SATISFACTION, data);



//getSurevySubCategory
export const getAllSurveyCategory=(data)=>api.create(url.GET_SURVEYSUBCATEGORY,data); 
export const SurveyCategoryDropdownList=()=>api.get(url.GET_SURVEYSUBCATEGORYDROPDOWN); 
export const postCreateSurveySubCategory=(data)=>api.create(url.POST_SURVEYSUBCATEGORY, data); 
export const putUpdateSurveySubCategory=(data)=>api.put(url.UPDATE_SURVEYSUBCATEGORY, data);

//geographyCreation
export const getAllGeographyCreation=()=>api.get(url.GET_GEOGRAPHY_CREATION); 
export const getGeographyDropDowns=(data)=>api.create(url.POST_GEOGRAPHY_DROPDOWNS, data); 
export const postCreateGeographyCreation=(data)=>api.create(url.POST_GEOGRAPHYCREATIONS, data)
export const putUpdateGeographyCreation=(data)=>api.put(url.UPDATE_GEOGRAPHYCREATION, data);
export const getGeographyCreationDpdwns=(data)=>api.create(url.GET_GEOGRAPHY_CREATION_DPWNDS, data)








//All SurveyCategoryCreation
export const getAllSurveyCategoryCreation=(data)=>api.create(url.GET_SURVEY_CATEGORY_CREATION,data); 
export const postAllSurveyCategoryCreation=(data)=>api.create(url.POST_SURVEY_CATEGORY_CREATION, data); 
export const putUpdateSurveyCategoryCreation= (data)=>api.put(url.SURVEY_CATEGORY_UPDATE, data);


//All MeterReadingMaster
export const getAllMeterReadingMaster=(data)=>api.create(url.GET_METER_READING_MASTER,data);    
export const postCreateMeterReadingMaster=(data)=>api.create(url.POST_METER_READING_MASTER, data);
export const putUpdateMeterReadingMaster=(data)=>api.put(url.UPDATE_METER_READING_MASTER, data);

//meterReadingregister

export const getUserDropDowns=(data)=>api.create(url.GET_METER_READING_DROPDOWNS, data)
export const AllUserCreationSubmit=(data)=>api.createMultiPart(url.POST_METER_READING_REGISTRATION, data)

export const getAllUserDropDownss=(data)=>api.create(url.GET_USERR_DROPDOWNSS, data)

//ManagePage
export const getManagePageDpdwns=(data)=>api.create(url.GET_MANAGE_DROPDOWNS, data)
export const getManagePageDetails=()=>api.get(url.GET_MANAGE_PAGE_DETAILS); 
export const savePage=(data)=>api.create(url.ADD_MANAGE_PAGE, data)
export const updatePage=(data)=>api.put(url.UPDATE_MANAGE_PAGE, data);

//meterreadingDeviceAllocation
export const getMeterDeviceAllocationDropDowns=(data)=>api.create(url.GET_METER_READING_DEVICEALLOCATION, data)
export const updateMeterDeviceAllocation=(data)=>api.put(url.UPDATE_METER_DEVICE_ALLOCATION, data);
export const getMeterDeviceAllocationsDetails=(data)=>api.create(url.GET_DEVICE_ALLOCATION_DETAILS,data);

//meterTourplan
export const getMeterTourDropDowns=(data)=>api.create(url.GET_METER_TOURPLAN_DROPDOWNS, data)
export const getMeterTourPlansDetails=(data)=>api.create(url.GET_TOUR_PLAN_DETAILS, data)
export const scheduleTourPlan=(data)=>api.create(url.SAVE_TOUR_PLAN, data)
export const saveTourPlan=(data)=>api.create(url.PROCESSED_TOUR_PLAN, data)


//misReport
export const getMisReportDpdwns=(data)=>api.create(url.GET_ALL_MISREPORT_DPDWNS, data)
export const postMisReport=(data)=>api.create(url.GET_ALL_MIS_REPORT_INFORMATION, data)
export const postBillingReport=(data)=>api.create(url.GET_ALL_BILLING_DATA, data)

//vmsManagement
export const postVmsManagement=(data)=>api.create(url.GET_ALL_VMSMANAGEMET_DATA, data)
export const forWordCloseSubmit=(data)=>api.create(url.POST_FORWOR_CLOSE, data)
export const getVmsConsumerPhoto=(data)=>api.create(url.GET_VMSIMAGES, data)

//ConsumerInformation
export const getConsumerInformationDpwdns=(data)=>api.create(url.GET_CONSUMER_INFORMATION_DPWNS, data)
export const getConsumerInformationSearch=(data)=>api.create(url.GET_CONSUMER_INFORMATION_SEARCH, data)
export const getConsumerInformation=(data)=>api.create(url.GET_CONSUMER_INFORMATION, data)
export const getConsumerBillingInformation=(data)=>api.create(url.GET_CONSUMER_BILLING_INFORMATION, data)
export const getConsumerSurveyInformation=(data)=>api.create(url.GET_CONSUMER_SURVEY_INFORMATION, data)
export const getConsumerPhoto=(data)=>api.create(url.GET_CONSUMER_PHOTO, data)

//getVendorMeterReaderCreation
export const getVendorMeterReaderCreation=(data)=>api.create(url.GET_VENDOR_METER_READER_CREATION,data); 
export const getMeterVendorCreationsDpwns=(data)=>api.create(url.GET_METER_VENDOR_METERDPDWNS, data)
export const createVendorMeterReader=(data)=>api.create(url.ADD_VENDOR_METER_READER, data)
export const updateVendorMeterReader=(data)=>api.put(url.UPDATE_VENDOR_METER_READER, data);


//notifcations things 
export const getAllNotification = (data) => api.get(url.getAllNotifications,data);
export const NotificationType = () => api.get(url.NotificationTypes)
export const getRolesList = () => api.get(url.getRolesLists)
export const NotificationAdd = (data) => api.create(url.NotificationAdds, data)
export const Notificationupdate = data => api.put(url.Notificationupdates, data);




export const getLocLocationTypes = () => api.get(url.LOCATION_URL_TYPES_DDL);
export const getLocationCountries = () => api.get(url.LOCATION_URL_COUNTRY_DDL);
export const getLocationClientIdByCountryId = (countryId) => api.get(url.LOCATION_URL_CLIENT_DDL + '/' + countryId);
export const getLocationGeoTypeByCountryId = (countryId) => api.get(url.LOCATION_URL_GEOGRAPHY_TYPE_DDL + '/' + countryId);
export const getLocationGeoByCountryIdAndGeoTypeId = (countryId, geoTypeId) => api.get(url.LOCATION_URL_GEOGRAPHY_DDL + '/' + countryId + '/' + geoTypeId);
export const getParentLocations = (countryId, clientId, locationTypeId) => api.get(url.LOCATION_URL_PARENT_LC_DDL + '/' + countryId + '/' + clientId + '/' + locationTypeId);
export const postLocationCreate = data => api.createMultiPart(url.LOCATION_URL_SAVE, data);

//LocationCreation things
export const getAllLocationCreation=()=>api.get(url.GET_LOCATION_CREATION);
export const getAllLocationCreationDpdwns=(data)=>api.create(url.GET_LOCATION_CREATION_DPDWNS,data);
export const postCreateLocationCreation=(data)=>api.create(url.POST_LOCATION_CREATIONS,data);
export const putUpdateLocationCreation=(data)=>api.put(url.UPDATE_LOCATION_CREATION,data);



//getManageUserDetails
export const getManageUserDetails=(data)=>api.create(url.GET_MANAGEUSERDETAILS,data);
export const getManageUserDropDownss=(data)=>api.create(url.GET_MANAGE_USER_DROPDOWNSS,data);
// export const updateMeterMangeUserDetails=(data)=>api.put(url.UPDATE_MANAGE_USER_DETAILSS,data);
// export const updateManageUserPassword=(data)=>api.put(url.UPDATE_MANAGE_USER_PASSWORD,data);
export const updateManageUserStatus=(data)=>api.put(url.UPDATE_MANAGE_USER_STATUS,data);



export const managePageGetApps = () => api.get(url.MANAGE_PAGE_APPLICATIONS_URL);
export const managePageGetAppFeature = (appId) => api.get(url.MANAGE_PAGE_APPLICATION_FEATURE_URL + '/' + appId);
export const managePageGetParentPages = () => api.get(url.MANAGE_PAGE_PARENT_PAGES_URL);
export const managePagePriorParentPages=()=>api.get(url.MANAGE_PAGE_PRIOR_PARENT_PAGES_URL);
export const managePageGetChildPages = (parentPageId) => api.get(url.MANAGE_PAGE_CHILD_PAGES_URL + '/' + parentPageId);
export const managePageGetAllPages = () => api.get(url.MANAGE_PAGE_ALL_PAGES_URL);

export const managePagePostSave = data => api.create(url.MANAGE_PAGE_SAVE_URL, data);
export const managePagePutUpdate = data => api.put(url.MANAGE_PAGE_UPDATE_URL, data);

export const postSupplierCreate = data => api.createMultiPart(url.SUPPLIER_MASTER_SAVE_URL, data);
export const getSupplierBusinessTypes = () => api.get(url.SUPPLIER_MASTER_BUS_TYPES_URL);
export const getSupplierCompanyTypes = () => api.get(url.SUPPLIER_MASTER_COMPANY_TYPES_URL);
export const getSupplierCountries = (countryId) => api.get(url.SUPPLIER_MASTER_COUNTRIES_URL+"/"+countryId);
export const getSupplierGeoTypes = () => api.get(url.SUPPLIER_MASTER_GEO_TYPES_URL);
export const getSupplierGeoByGeoTypeId = (typeId) => api.get(url.SUPPLIER_MASTER_GEO_URL+"/"+ typeId);


//meterReadingRegistration
export const AllFinalSubmit = data => api.createMultiPart(url.METER_REGISTER_DATA, data);
export const getAllMeterReaderRegistration=()=>api.get(url.GET_ALL_METER_READER_REGISTRATION);




export const postCustomerCreate = data => api.createMultiPart(url.CUSTOMER_MASTER_SAVE_URL, data);
export const getCustomerBusinessTypes = () => api.get(url.CUSTOMER_MASTER_BUS_TYPES_URL);
export const getCustomerCompanyTypes = () => api.get(url.CUSTOMER_MASTER_COMPANY_TYPES_URL);
export const getCustomerCountries = (countryId) => api.get(url.CUSTOMER_MASTER_COUNTRIES_URL+"/"+countryId);
export const getCustomerClients = (clientId) => api.get(url.CUSTOMER_MASTER_CLIENT_URL+"/"+clientId);
export const getCustomerGeoTypes = () => api.get(url.CUSTOMER_MASTER_GEO_TYPES_URL);
export const getCustomerGeoByGeoTypeId = (typeId) => api.get(url.CUSTOMER_MASTER_GEO_URL+"/"+ typeId);


export const getAllMaterialType=()=>api.get(url.MATERIAL_TYPE_URL_GET_ALL);

//approval process
export const postApprovalProcess=(data)=>api.create(url.APPROVAL_PROCESS_URL_SAVE,data);
export const putApprovalProcess=(data)=>api.put(url.APPROVAL_PROCESS_URL_UPDATE,data);
export const getAllApprovalProcess=()=>api.get(url.APPROVAL_PROCESS_URL_GET_ALL);


//Material Category
export const postMaterialCategory=(data)=>api.create(url.MATERIAL_CATEGORY_URL_SAVE,data);
export const putMaterialCategory=(data)=>api.put(url.MATERIAL_CATEGORY_URL_UPDATE,data);
export const getAllMaterialCategory=()=>api.get(url.MATERIAL_CATEGORY_URL_GET_ALL);
export const getAllMaterialTypes=()=>api.get(url.MATERIAL_TYPES_URL_GET_ALL);


//Material Sub Category
export const postMaterialSubCategory=(data)=>api.create(url.MATERIAL_SUB_CATEGORY_URL_SAVE,data);
export const putMaterialSubCategory=(data)=>api.put(url.MATERIAL_SUB_CATEGORY_URL_UPDATE,data);
export const getAllMaterialSubCategories=()=>api.get(url.MATERIAL_SUB_CATEGORIES_URL_GET_ALL);
export const getAllMaterialSubCategoryCategory=(typeId)=>api.get(url.MATERIAL_SUB_CATEGORY_CATEGORY_URL_GET_ALL+ "/" + typeId);
export const getAllMaterialSubCategoryReceiveModes=()=>api.get(url.MATERIAL_SUB_CATEGORY_RECEIVE_MODES_URL_GET_ALL);
export const getAllMaterialSubCategoryTypes=()=>api.get(url.MATERIAL_SUB_CATEGORY_TYPE_URL);

//Model master
export const postModelMaster=(data)=>api.create(url.MODEL_MASTER_URL_SAVE,data);
export const putModelMaster=(data)=>api.put(url.MODEL_MASTER_URL_UPDATE,data);
export const getAllModelMaster=(materialSubCategoryId)=>api.get(url.MODEL_MASTER_URL_GET_ALL+ "/" + materialSubCategoryId);
export const getAllModelCategory=(materialTypeId)=>api.get(url.MODEL_MASTER_CATEGORY_URL_GET_ALL+ "/"+ materialTypeId);
export const getAllModelType=()=>api.get(url.MODEL_MASTER_TYPE_ID_URL);
export const getAllModelSubCategory=(materialCategoryId)=>api.get(url.MODEL_MASTER_SUB_CATEGORY_URL_GET_ALL + "/" +materialCategoryId);


//Abbreviation master
export const postAbbreviationMaster=(data)=>api.create(url.ABBREVIATION_MASTER_URL_SAVE,data);
export const putAbbreviationMaster=(data)=>api.put(url.ABBREVIATION_MASTER_URL_UPDATE,data);
export const getAllAbbreviationMaster=(materialSubCategoryId)=>api.get(url.ABBREVIATION_MASTER_URL_GET_ALL+ "/" + materialSubCategoryId);
export const getAllAbbreviationCategory=(materialTypeId)=>api.get(url.ABBREVIATION_MASTER_CATEGORY_URL_GET_ALL+ "/"+ materialTypeId);
export const getAllAbbreviationMaterialType=()=>api.get(url.ABBREVIATION_MASTER_MATERIAL_TYPE_ID_URL);
export const getAllAbbreviationSubCategory=(materialCategoryId)=>api.get(url.ABBREVIATION_MASTER_SUB_CATEGORY_URL_GET_ALL + "/" +materialCategoryId);


//Material Receive mode

export const postMaterialReceiveModeId=(data)=>api.create(url.MATERIAL_RECEIVE_MODE_ID_URL_SAVE,data);
export const putMaterialReceiveModeId=(data)=>api.put(url.MATERIAL_RECEIVE_MODE_ID_URL_UPDATE,data);
export const getAllMaterialReceiveModeId=()=>api.get(url.MATERIAL_RECEIVE_MODE_ID_URL_GET_ALL);


export const updateDocument = data => api.put(url.DOCUMENT_TYPE_UPDATE_URL, data);
export const saveDocument = data => api.create(url.DOCUMENT_TYPE_SAVE_URL, data);
export const getDocument = () => api.get(url.DOCUMENT_TYPE_GET_URL);

// thi is the dms document upload api
export const getDocumentDropdowns=(data) => api.create(url.DOCUMENET_UPLOADSS, data);
export const postDocumentUpload =(data) => api.createMultiPart(url.POST_DOCUMENT_UPLOAD,data);
export const postDocumentManualUpload=(data) => api.createMultiPart(url.POST_DOCUMENT_MANUAL_UPLOAD,data);
export const viewDocument = (data) => api.create(url.VIEW_DOCUMENT, data);
export const postDocumentUploadview =(data) => api.create(url.POST_DOCUMENT_UPLOAD_VIEW,data);

export const qcView = (data) => api.create(url.GET_QC_DOCUMENT, data);
export const qcPreview = (data, config = {}) => api.create(url.GET_QC_DOCUMENT, data, config);
export const qcApproveReject = (data) => api.create(url.GET_QC_DOCUMENT, data);
export const bulkscan =(data) => api.create(url.BULK_SCAN,data);
export const scanUpload =(data) => api.create(url.SCAN_UPLOAD,data);
// export const view = (data, config = {}) =>
//   api.create(url.VIEW_DOCUMENT, data, config);
export const view = (data, config = {}) =>
  api.create(url.VIEW_DOCUMENT, data, {
    ...config,
    responseType: 'blob' 
  });

export const qcReviewed = (data) => api.create(url.QC_REVIEW, data);
export const singleZoneUpload =(data) => api.create(url.SINGLE_ZONE_UPLOAD,data);
export const singleConsumerUpload =(data) => api.create (url.SINGLE_CONSUMER_UPLOAD,data);
export const Scanning =(data) => api.create(url.SCAN_IMPLEMENT,data);
export const documentAudit =(data) => api.create(url.Document_Audit,data);









//Document category
export const updateDocumentCategory = data => api.put(url.DOCUMENT_CATEGORY_UPDATE_URL, data);
export const saveDocumentCategory = data => api.create(url.DOCUMENT_CATEGORY_SAVE_URL, data);
export const getDocumentType = () => api.get(url.DOCUMENT_CATEGORY_GET_TYPE_URL);
export const getDocumentCategory = () => api.get(url.DOCUMENT_CATEGORY_GET_URL);

export const getClientMaterialMappingCountry = (id) => api.get(url.CLIENT_MATERIAL_MAPPING_COUNTRY_URL+"/"+id);
export const getClientMaterialMappingClientByCountry = (countryId,clientId) => api.get(url.CLIENT_MATERIAL_MAPPING_CLIENT_URL+"/"+countryId+"/"+clientId);
export const getClientMaterialMappingNonAllocatedMsByClientId = (clientId) => api.get(url.CLIENT_MATERIAL_MAPPING_NON_ALLOCATED_URL+"/"+clientId);
export const getClientMaterialMappingAllocatedMsByClientId = (clientId) => api.get(url.CLIENT_MATERIAL_MAPPING_ALLOCATED_URL+"/"+clientId);
export const postClientMaterialMapping = data => api.create(url.CLIENT_MATERIAL_MAPPING_SAVE_URL, data);



// Create Application Feature
export const postAppFeatureCreate = data => api.create(url.ES_APPLICATION_FEATURE_URL_CREATE, data);

//Update ES Application
export const putEsAppFeatureUpdate = data => api.create(url.ES_APPLICATION_FEATURE_URL_UPDATE, data);

//Get Es Application By Id
export const getEsAppFeatureById = data => api.get(url.ES_APPLICATION_FEATURE_URL_GET_ALL + '/' + data);

//Get All Es App Feature
export const getAllEsAppFeature = () => api.get(url.ES_APPLICATION_FEATURE_URL_GET_ALL);
//Get All Es App Feature Apps
export const getAllEsAppFeatureApps = () => api.get(url.ES_APPLICATION_ALL_URL_DDL);

// Create Roles
export const postCreateRoles = data => api.create(url.ROLES_URL_CREATE, data);   //post api for roles

//Update Roles
export const putUpdateRoles = data => api.put(url.ROLES_URL_UPDATE, data);       //put api for update

//delete Roles
export const deleteRoles = data => api.delete(url.ROLES_URL_GET_DELETE + '/' + data);

//Get Roles By Id
export const getRoles = data => api.get(url.ROLES_URL_GET_DELETE + '/' + data);
export const postcreateindent = data => api.create(url.POST_CREATE_INDENT, data);
export const IndentProjectHead = data => api.create(url.INDENT_PROJECT_HEAD, data);
export const resubmittedindent = data => api.create(url.RE_SUBMITTED_INDENT, data);
export const rejected = data => api.create(url.REJECTED, data);
export const projectHeadFetch = data => api.create(url.PROJECT_HEAD_FETCH, data);
export const indentView = data => api.create(url.INDENT_VIEW, data);


//DMS peoject api
export const getAllRoles = () => api.get(url.GET_ROLES);
export const getAllUserDetails =(data) => api.create(url.MANAGE_USER_GET,data);
export const postresetpassword =(data) => api.create(url.RESET_PASSWORD_URL,data)
export const postzoneupload =(data) => api.createMultiPart(url.ZONE_UPLOAD_URL,data)


export const postconsumerupload =(data) => api.createMultiPart(url.CONSUMER_UPLOAD_URL,data)


export const LoginAudit =(data) => api.create(url.LOGIN_AUDIT_URL,data)

export const getManageUserDropdwons=(data) => api.create(url.GET_MANAGE_USER_DROPDOWNS,data)
export const updateMeterMangeUserDetails=(data) => api.create(url.MANAGE_USER_GET,data)
export const updateManageUserPassword=(data) => api.create(url.MANAGE_USER_GET,data)
export const getCategoryCreation=(data) => api.create(url.GET_CATEGORY_CREATION,data)





//************************** */


export const getAllvendors=(data)=>api.create(url.GET_VENDORS,data)
export const postAllvendors=(data)=>api.create(url.POST_VENDOR,data)
export const putUpdateVendor=(data)=>api.put(url.UPDATE_VENDOR,data)





export const useCreationSIngleAPI=(data)=>api.create(url.GET_GENDER,data)  //userCreation
export const fetchingDropdowns=(data)=>api.create(url.GET_DROPDOWNS,data)    //meterreadingRegistration


//application-Details
// export const getApplicationDetails=()=>api.get(url.APPLICATION_DETAILS)    ///here i set the url of backend application Details

//Material Type
export const postMaterialType = (data) => api.create(url.MATERIAL_TYPE_URL_SAVE, data);
export const putMaterialType = (data) => api.put(url.MATERIAL_TYPE_URL_UPDATE, data);
export const getAllMatrialType = () => api.get(url.MATERIAL_TYPE_URL_GET_ALL);


//Get Clients for Role
export const getClients = data => api.get(url.CLEINT_ROLES_URL_GET_CLIENTS + '/' + data);

export const getCountry = (data) => api.get(url.CLEINT_ROLES_URL_GET_COUNTRY+'/'+data);
//Get Client Roles
export const getClientRoles = data => api.get(url.CLEINT_ROLES_URL_ALLROLES + '/' + data);

//Save Clients
export const clientRolesSave = data => api.create(url.CLEINT_ROLES_URL_SAVE, data);

//Invoice Processing
export const updateInvoice1 = data => api.put(url.INVOICE_TYPE_UPDATE_URL, data);
export const saveInvoice1 = data => api.create(url.INVOICE_TYPE_SAVE_URL, data);
export const getInvoice = () => api.get(url.INVOICE_TYPE_GET_URL);

export const updateInvoiceCatagory = data => api.put(url.INVOICE_CATAGORY_UPDATE_URL, data);
export const saveInvoiceCatagory = data => api.create(url.INVOICE_CATAGORY_SAVE_URL, data);
export const getInvoiceType = () => api.get(url.INVOICE_CATAGORY_GET_TYPE_URL);
export const getInvoiceCatagory = () => api.get(url.INVOICE_CATAGORY_GET_URL);

//*****************************MASTERS START*********************************************
//Capacity Master
export const materialTypeName = () => api.get(url.CAPACITY_MATERIAL_TYPE);
export const materialCategory = data => api.get(url.CAPACITY_MATERIAL_CATAGORY + '/' + data);
export const materialSubCategory = data => api.get(url.CAPACITY_MATERIAL_SUB_CATAGORY + '/' + data);
export const viewCapacity = () => api.get(url.CAPACITY_VIEW_URL);
export const saveCapacityMaster = data => api.create(url.CAPACITY_SAVE_URL, data);
export const updateCapacityMaster = data => api.put(url.CAPACITY_UPDATE_URL, data);

//Make Master
export const viewMake = () => api.get(url.MAKE_VIEW_URL);
export const saveMakeMaster = data => api.create(url.MAKE_SAVE_URL, data);
export const updateMakeMaster = data => api.put(url.MAKE_UPDATE_URL, data);

//Particular Master
export const viewParticularMaster = (data) => api.get(url.PARTICULAR_VIEW_URL + "/" + data);
export const saveParticularMaster = data => api.create(url.PARTICULAR_SAVE_URL, data);
export const updateParticularMaster = data => api.put(url.PARTICULAR_UPDATE_URL, data);

//Reason Category
export const viewReasonCategory = () => api.get(url.REASON_CATEGORY_VIEW_URL);
export const saveReasonCategory = data => api.create(url.REASON_CATEGORY_SAVE_URL, data);
export const updateReasonCategory = data => api.put(url.REASON_CATEGORY_UPDATE_URL, data);

//Reason Sub Category
export const viewReasonSubCategory = () => api.get(url.SUB_REASON_CATEGORY_VIEW_URL);
export const getReasonCatagory = () => api.get(url.SUB_REASONS_CATEGORY_VIEW_URL);
export const saveReasonSubCategory = data => api.create(url.SUB_REASON_CATEGORY_SAVE_URL, data);
export const updateReasonSubCategory = data => api.put(url.SUB_REASON_CATEGORY_UPDATE_URL, data);

//Units Of Measurments
export const viewUnitsOfMeasurments = () => api.get(url.UNITS_OF_MEASUREMENT_VIEW_URL);
export const saveUnitsOfMeasurments = data => api.create(url.UNITS_OF_MEASUREMENT_SAVE_URL, data);
export const updateUnitsOfMeasurments = data => api.put(url.UNITS_OF_MEASUREMENT_UPDATE_URL, data);
//*****************************MASTERS END***********************************************
export const updateInvoiceSubType = data => api.put(url.INVOICE_SUBTYPE_UPDATE_URL, data);
export const saveInvoiceSubType = data => api.create(url.INVOICE_SUBTYPE_SAVE_URL, data);
export const getInvoiceSubType = () => api.get(url.INVOICE_SUBTYPE_GET_URL);
export const getInvoiceSubTypeId = () => api.get(url.INVOICE_SUBTYPE_GET_TYPE_URL);
export const getInvoiceCatagoryId = data => api.get(url.INVOICE_SUBTYPE_GET_CAT_URL + '/' + data);


// postForgetPwd
export const postFakeForgetPwd = data => api.create(url.POST_FAKE_PASSWORD_FORGET, data);

// Edit profile
export const postJwtProfile = data => api.create(url.POST_EDIT_JWT_PROFILE, data);

export const postFakeProfile = (data) => api.update(url.POST_EDIT_PROFILE + '/' + data.idx, data);

//User Creation Start
export const getConstants = () => api.get(url.USER_GET_CONSTANTS);
export const getCountries = (sCountryId) => api.get(url.USER_GET_COUNTRY+'/'+sCountryId);
// export const getClient = (sCountryId,sclientId) => api.get(url.USER_GET_CLIENT + '/' + sCountryId+'/'+sclientId);
export const getLocationType = data => api.get(url.USER_GET_USER_LOCATIONTYPE + '/' + data);
export const getLocation = (cntId,cId,lId) => api.get(url.USER_GET_USER_LOCATION + '/' + cntId + '/' + cId + '/' + lId);
export const getCheckAvailability = (cId,clId,lName) => api.get(url.USER_GET_CHECK_AVAILABILITY + '/' + cId + '/' + clId + '/' + lName);
export const createUserDetails = data => api.create(url.USER_SAVE_DATA, data);
export const getUserId = () => api.get(url.USER_GET_USERID);


export const fetchGenderOptions=(data)=>api.create(url.GET_GENDER,data)







// Register Method
export const postJwtRegister = (url, data) => {
    return api.create(url, data)
        .catch(err => {
            var message;
            if (err.response && err.response.status) {
                switch (err.response.status) {
                    case 404:
                        message = "Sorry! the page you are looking for could not be found";
                        break;
                    case 500:
                        message = "Sorry! something went wrong, please contact our support team";
                        break;
                    case 401:
                        message = "Invalid credentials";
                        break;
                    default:
                        message = err[1];
                        break;
                }
            }
            throw message;
        });
};

// Login Method
export const postJwtLogin = data => api.create(url.POST_FAKE_JWT_LOGIN, data);

// postForgetPwd
export const postJwtForgetPwd = data => api.create(url.POST_FAKE_JWT_PASSWORD_FORGET, data);

// postSocialLogin
export const postSocialLogin = data => api.create(url.SOCIAL_LOGIN, data);

// Calendar
// get Events
export const getEvents = () => api.get(url.GET_EVENTS);

// get Events
export const getCategories = () => api.get(url.GET_CATEGORIES);

// get Upcomming Events
export const getUpCommingEvent = () => api.get(url.GET_UPCOMMINGEVENT);

// add Events
export const addNewEvent = event => api.create(url.ADD_NEW_EVENT, event);

// update Event
export const updateEvent = event => api.put(url.UPDATE_EVENT, event);

// delete Event
export const deleteEvent = event => api.delete(url.DELETE_EVENT, {headers: {event}});

// Chat
// get Contact
export const getDirectContact = () => api.get(url.GET_DIRECT_CONTACT);

// get Messages
export const getMessages = roomId => api.get(`${url.GET_MESSAGES}/${roomId}`, {params: {roomId}});

// add Message
export const addMessage = message => api.create(url.ADD_MESSAGE, message);

// add Message
export const deleteMessage = message => api.delete(url.DELETE_MESSAGE, {headers: {message}});

// get Channels
export const getChannels = () => api.get(url.GET_CHANNELS);

// MailBox
//get Mail
export const getMailDetails = () => api.get(url.GET_MAIL_DETAILS);

// delete Mail
export const deleteMail = forId => api.delete(url.DELETE_MAIL, {headers: {forId}});

// Ecommerce
// get Products
export const getProducts = () => api.get(url.GET_PRODUCTS);

// delete Product
export const deleteProducts = product => api.delete(url.DELETE_PRODUCT + '/' + product);

// add Products
export const addNewProduct = product => api.create(url.ADD_NEW_PRODUCT, product);

// update Products
export const updateProduct = product => api.update(url.UPDATE_PRODUCT + '/' + product._id, product);

// get Orders
export const getOrders = () => api.get(url.GET_ORDERS);

// add Order
export const addNewOrder = order => api.create(url.ADD_NEW_ORDER, order);

// update Order
export const updateOrder = order => api.update(url.UPDATE_ORDER + '/' + order._id, order);

// delete Order
export const deleteOrder = order => api.delete(url.DELETE_ORDER + '/' + order);

// get Customers
export const getCustomers = () => api.get(url.GET_CUSTOMERS);

// add Customers
export const addNewCustomer = customer => api.create(url.ADD_NEW_CUSTOMER, customer);

// update Customers
export const updateCustomer = customer => api.update(url.UPDATE_CUSTOMER + '/' + customer._id, customer);

// delete Customers
export const deleteCustomer = customer => api.delete(url.DELETE_CUSTOMER + '/' + customer);

// get Sellers
export const getSellers = () => api.get(url.GET_SELLERS);

// Project
// get Project list 
export const getProjectList = () => api.get(url.GET_PROJECT_LIST);

// Tasks
// get Task
export const getTaskList = () => api.get(url.GET_TASK_LIST);

// add Task
export const addNewTask = task => api.create(url.ADD_NEW_TASK, task);

// update Task
export const updateTask = task => api.update(url.UPDATE_TASK + '/' + task._id, task);

// delete Task
export const deleteTask = task => api.delete(url.DELETE_TASK + '/' + task);

// Kanban Board
export const getTasks = () => api.get(url.GET_TASKS);
export const addNewTasks = (card) => api.create(url.ADD_TASKS, card)
export const updateTasks = (card) => api.put(url.UPDATE_TASKS, card)
export const deleteTasks = (card) => api.delete(url.DELETE_TASKS, {headers: {card}})

// CRM
// get Contacts
export const getContacts = () => api.get(url.GET_CONTACTS);

// add Contact
export const addNewContact = contact => api.create(url.ADD_NEW_CONTACT, contact);

// update Contact
export const updateContact = contact => api.update(url.UPDATE_CONTACT + '/' + contact._id, contact);

// delete Contact
export const deleteContact = contact => api.delete(url.DELETE_CONTACT + '/' + contact);

// get Companies
export const getCompanies = () => api.get(url.GET_COMPANIES);

// add Companies
export const addNewCompanies = company => api.create(url.ADD_NEW_COMPANIES, company);

// update Companies
export const updateCompanies = company => api.update(url.UPDATE_COMPANIES + '/' + company._id, company);

// delete Companies
export const deleteCompanies = company => api.delete(url.DELETE_COMPANIES + '/' + company);

// get Deals
export const getDeals = () => api.get(url.GET_DEALS);

// get Leads
export const getLeads = () => api.get(url.GET_LEADS);

// add Lead
export const addNewLead = lead => api.create(url.ADD_NEW_LEAD, lead);

// update Lead
export const updateLead = lead => api.update(url.UPDATE_LEAD + '/' + lead._id, lead);

// delete Lead
export const deleteLead = lead => api.delete(url.DELETE_LEAD + '/' + lead);

// Crypto
// Transation
export const getTransationList = () => api.get(url.GET_TRANSACTION_LIST);

// Order List
export const getOrderList = () => api.get(url.GET_ORDRER_LIST);

// Invoice
//get Invoice
export const getInvoices = () => api.get(url.GET_INVOICES);

// add Invoice
export const addNewInvoice = invoice => api.create(url.ADD_NEW_INVOICE, invoice);

// update Invoice
export const updateInvoice = invoice => api.update(url.UPDATE_INVOICE + '/' + invoice._id, invoice);

// delete Invoice
export const deleteInvoice = invoice => api.delete(url.DELETE_INVOICE + '/' + invoice);

// Support Tickets 
// Tickets
export const getTicketsList = () => api.get(url.GET_TICKETS_LIST);

// add Tickets 
export const addNewTicket = ticket => api.create(url.ADD_NEW_TICKET, ticket);

// update Tickets 
export const updateTicket = ticket => api.update(url.UPDATE_TICKET + '/' + ticket._id, ticket);

// delete Tickets 
export const deleteTicket = ticket => api.delete(url.DELETE_TICKET + '/' + ticket);

// Dashboard Analytics

// Sessions by Countries
export const getAllData = () => api.get(url.GET_ALL_DATA);
export const getHalfYearlyData = () => api.get(url.GET_HALFYEARLY_DATA);
export const getMonthlyData = () => api.get(url.GET_MONTHLY_DATA);

// Audiences Metrics
export const getAllAudiencesMetricsData = () => api.get(url.GET_ALLAUDIENCESMETRICS_DATA);
export const getMonthlyAudiencesMetricsData = () => api.get(url.GET_MONTHLYAUDIENCESMETRICS_DATA);
export const getHalfYearlyAudiencesMetricsData = () => api.get(url.GET_HALFYEARLYAUDIENCESMETRICS_DATA);
export const getYearlyAudiencesMetricsData = () => api.get(url.GET_YEARLYAUDIENCESMETRICS_DATA);

// Users by Device
export const getTodayDeviceData = () => api.get(url.GET_TODAYDEVICE_DATA);
export const getLastWeekDeviceData = () => api.get(url.GET_LASTWEEKDEVICE_DATA);
export const getLastMonthDeviceData = () => api.get(url.GET_LASTMONTHDEVICE_DATA);
export const getCurrentYearDeviceData = () => api.get(url.GET_CURRENTYEARDEVICE_DATA);

// Audiences Sessions by Country
export const getTodaySessionData = () => api.get(url.GET_TODAYSESSION_DATA);
export const getLastWeekSessionData = () => api.get(url.GET_LASTWEEKSESSION_DATA);
export const getLastMonthSessionData = () => api.get(url.GET_LASTMONTHSESSION_DATA);
export const getCurrentYearSessionData = () => api.get(url.GET_CURRENTYEARSESSION_DATA);

// Dashboard CRM

// Balance Overview
export const getTodayBalanceData = () => api.get(url.GET_TODAYBALANCE_DATA);
export const getLastWeekBalanceData = () => api.get(url.GET_LASTWEEKBALANCE_DATA);
export const getLastMonthBalanceData = () => api.get(url.GET_LASTMONTHBALANCE_DATA);
export const getCurrentYearBalanceData = () => api.get(url.GET_CURRENTYEARBALANCE_DATA);

// Dial Type
export const getTodayDealData = () => api.get(url.GET_TODAYDEAL_DATA);
export const getWeeklyDealData = () => api.get(url.GET_WEEKLYDEAL_DATA);
export const getMonthlyDealData = () => api.get(url.GET_MONTHLYDEAL_DATA);
export const getYearlyDealData = () => api.get(url.GET_YEARLYDEAL_DATA);

// Sales Forecast
export const getOctSalesData = () => api.get(url.GET_OCTSALES_DATA);
export const getNovSalesData = () => api.get(url.GET_NOVSALES_DATA);
export const getDecSalesData = () => api.get(url.GET_DECSALES_DATA);
export const getJanSalesData = () => api.get(url.GET_JANSALES_DATA);

// Dashboard Ecommerce
// Revenue
export const getAllRevenueData = () => api.get(url.GET_ALLREVENUE_DATA);
export const getMonthRevenueData = () => api.get(url.GET_MONTHREVENUE_DATA);
export const getHalfYearRevenueData = () => api.get(url.GET_HALFYEARREVENUE_DATA);
export const getYearRevenueData = () => api.get(url.GET_YEARREVENUE_DATA);


// Dashboard Crypto
// Portfolio
export const getBtcPortfolioData = () => api.get(url.GET_BTCPORTFOLIO_DATA);
export const getUsdPortfolioData = () => api.get(url.GET_USDPORTFOLIO_DATA);
export const getEuroPortfolioData = () => api.get(url.GET_EUROPORTFOLIO_DATA);

// Market Graph
export const getAllMarketData = () => api.get(url.GET_ALLMARKETDATA_DATA);
export const getYearMarketData = () => api.get(url.GET_YEARMARKET_DATA);
export const getMonthMarketData = () => api.get(url.GET_MONTHMARKET_DATA);
export const getWeekMarketData = () => api.get(url.GET_WEEKMARKET_DATA);
export const getHourMarketData = () => api.get(url.GET_HOURMARKET_DATA);

// Dashboard Project
// Project Overview
export const getAllProjectData = () => api.get(url.GET_ALLPROJECT_DATA);
export const getMonthProjectData = () => api.get(url.GET_MONTHPROJECT_DATA);
export const gethalfYearProjectData = () => api.get(url.GET_HALFYEARPROJECT_DATA);
export const getYearProjectData = () => api.get(url.GET_YEARPROJECT_DATA);

// Project Status
export const getAllProjectStatusData = () => api.get(url.GET_ALLPROJECTSTATUS_DATA);
export const getWeekProjectStatusData = () => api.get(url.GET_WEEKPROJECTSTATUS_DATA);
export const getMonthProjectStatusData = () => api.get(url.GET_MONTHPROJECTSTATUS_DATA);
export const getQuarterProjectStatusData = () => api.get(url.GET_QUARTERPROJECTSTATUS_DATA);

// Dashboard NFT
// Marketplace
export const getAllMarketplaceData = () => api.get(url.GET_ALLMARKETPLACE_DATA);
export const getMonthMarketplaceData = () => api.get(url.GET_MONTHMARKETPLACE_DATA);
export const gethalfYearMarketplaceData = () => api.get(url.GET_HALFYEARMARKETPLACE_DATA);
export const getYearMarketplaceData = () => api.get(url.GET_YEARMARKETPLACE_DATA);

// Project
export const addProjectList = (project) => api.create(url.ADD_NEW_PROJECT, project);
export const updateProjectList = (project) => api.put(url.UPDATE_PROJECT, project);
export const deleteProjectList = (project) => api.delete(url.DELETE_PROJECT, {headers: {project}});

// Pages > Team
export const getTeamData = (team) => api.get(url.GET_TEAMDATA, team);
export const deleteTeamData = (team) => api.delete(url.DELETE_TEAMDATA, {headers: {team}});
export const addTeamData = (team) => api.create(url.ADD_NEW_TEAMDATA, team);
export const updateTeamData = (team) => api.put(url.UPDATE_TEAMDATA, team);

// File Manager

// Folder
export const getFolders = (folder) => api.get(url.GET_FOLDERS, folder);
export const deleteFolder = (folder) => api.delete(url.DELETE_FOLDER, {headers: {folder}});
export const addNewFolder = (folder) => api.create(url.ADD_NEW_FOLDER, folder);
export const updateFolder = (folder) => api.put(url.UPDATE_FOLDER, folder);

// File
export const getFiles = (file) => api.get(url.GET_FILES, file);
export const deleteFile = (file) => api.delete(url.DELETE_FILE, {headers: {file}});
export const addNewFile = (file) => api.create(url.ADD_NEW_FILE, file);
export const updateFile = (file) => api.put(url.UPDATE_FILE, file);

// To Do
export const getTodos = (todo) => api.get(url.GET_TODOS, todo);
export const deleteTodo = (todo) => api.delete(url.DELETE_TODO, {headers: {todo}});
export const addNewTodo = (todo) => api.create(url.ADD_NEW_TODO, todo);
export const updateTodo = (todo) => api.put(url.UPDATE_TODO, todo);

// To do Project
export const getProjects = (project) => api.get(url.GET_PROJECTS, project);
export const addNewProject = (project) => api.create(url.ADD_NEW_TODO_PROJECT, project);

//Job Application
export const getJobApplicationList = () => api.get(url.GET_APPLICATION_LIST);

//API Key
export const getAPIKey = () => api.get(url.GET_API_KEY);
