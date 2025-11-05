import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import { setAuthorization } from "../../../helpers/api_helper";
import {
    postFakeLogin,
    postJwtLogin,
    postSocialLogin,
    getDisplayNotification,
    LoginAudit
} from "../../../helpers/fakebackend_helper";

import { detect } from 'detect-browser';
const browserInfo = detect();

import { loginSuccess, logoutUserSuccess, apiError, reset_login_flag, setNotification } from './reducer';

// HELPER FUNCTION FOR GEOLOCATION
/**
 * Gets the user's current geolocation.
 * @returns {Promise<{latitude: number, longitude: number}>} A promise that resolves with coordinates.
 * Defaults to {0, 0} if permission is denied or API is unavailable.
 */
const getGeolocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ latitude: 0, longitude: 0 });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                // Resolve with defaults so login flow is not blocked
                resolve({ latitude: 0, longitude: 0 }); 
            },
            {
                timeout: 5000, // 5 seconds
                enableHighAccuracy: false
            }
        );
    });
};

export const loginUser = (user, history) => async (dispatch) => {
    try {
        let response;

        // ... (your existing login logic) ...
        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            const fireBaseBackend = getFirebaseBackend();
            response = await fireBaseBackend.loginUser(user.email, user.password);
        } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
            response = await postJwtLogin({
                email: user.email,
                password: user.password,
            });
        } else if (process.env.REACT_APP_DEFAULTAUTH) {
            response = await postFakeLogin({
                email: user.email,
                password: user.password,
                requestUserName: user.email,
            });
        }

        const data = response;

        if (data && data.status === "success") {
            sessionStorage.setItem("authUser", JSON.stringify(data));
            setAuthorization();
            dispatch(loginSuccess(data));

            
            try {
                
                const location = await getGeolocation();

                // Construct the payload for flagId: 2
                const auditPayload = {
                    flagId: 2,
                    UserID: data.user.User_Id,
                    HostName: "TBD", 
                    Device: "TBD",   
                    MacAddress: "TBD", 
                    IPAddress: "TBD", 
                    OSName: browserInfo.os || "Unknown",
                    BrowserName: browserInfo.name || "Unknown",
                    BrowserVersion: browserInfo.version || "Unknown",
                    Latitude: location.latitude,
                    Longitude: location.longitude,
                    RequestUserName: user.email,
                };
                
             
                const auditResponse = await LoginAudit(auditPayload);

                
                if (auditResponse && auditResponse.loginDetailId) {
                
                    sessionStorage.setItem("trackingResult", auditResponse.loginDetailId);
                }

            } catch (auditError) {
                
            }
            

            if (data?.user?.isForcePasswordChange) {
                history("/ForceResetPassword");
            } else {
                history("/welcomepage");
            }
        } else {
            const errorMessage =
                data?.message ||
                data?.error ||
                "Login failed. Please check your credentials.";
            dispatch(apiError({ message: errorMessage }));
        }
    } catch (error) {
        let errorMessage = "An unknown error occurred. Please try again."; 
        
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            } else if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
            } else if (typeof errorData.error === 'string') {
                errorMessage = errorData.error;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        dispatch(apiError({ message: errorMessage }));
    }
};

export const logoutUser = (history) => async (dispatch) => {
    try {
        
        const userLoginDetailId = sessionStorage.getItem("trackingResult");
        
        if (userLoginDetailId) {
            
            const payload = {
                flagId: 3,
                UserLoginDetailID: userLoginDetailId,
            };
            try {
                await LoginAudit(payload);
            } catch (err) {
                
            }
        }

        
        sessionStorage.removeItem("authUser");
        sessionStorage.removeItem("trackingResult"); 
        
        dispatch(logoutUserSuccess(true));

        if (history) {
            history('/login');
        }

    } catch (error) {
        dispatch(apiError({ message: error.message || "Logout failed" }));
    }
};

export const socialLogin = (type, history) => async (dispatch) => {
    try {
        let response;

        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            const fireBaseBackend = getFirebaseBackend();
            response = fireBaseBackend.socialLoginUser(type);
        }

        const socialdata = await response;
        if (socialdata) {
            sessionStorage.setItem("authUser", JSON.stringify(response));
            dispatch(loginSuccess(response));
            history('/welcomepage');
        }
    } catch (error) {
        dispatch(apiError({ message: error.message || "Social login failed" }));
    }
};

export const resetLoginFlag = () => async (dispatch) => {
    try {
        const response = dispatch(reset_login_flag());
        return response;
    } catch (error) {
        dispatch(apiError(error));
    }
};