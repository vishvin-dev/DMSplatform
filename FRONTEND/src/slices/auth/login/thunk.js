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

// src/slices/thunks.js

export const loginUser = (user, history) => async (dispatch) => {
    try {
        let response;

        // This logic handles different authentication methods based on your environment variables.
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
        // This log helps you see the exact error structure from your server in the browser console.
        console.error("🔴 THUNK CATCH BLOCK: Full server error response:", error.response);

        let errorMessage = "An unknown error occurred. Please try again."; // Default fallback message

        // **MODIFIED ERROR EXTRACTION LOGIC**
        // This block now robustly finds the error message from the backend response.
        if (error.response && error.response.data) {
            const errorData = error.response.data;

            // Priority 1: Check for a 'message' field, as in {"message":"Invalid password."}
            if (typeof errorData.message === 'string') {
                errorMessage = errorData.message;
            }
            // Priority 2: Check for a 'detail' field (common in Django REST Framework)
            else if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
            }
            // Priority 3: Check for an 'error' field
            else if (typeof errorData.error === 'string') {
                errorMessage = errorData.error;
            }
            // Priority 4: Check if the entire response data is just a string
            else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error.message) {
            // Fallback for generic network issues (e.g., server is down)
            errorMessage = error.message;
        }
console.log("🔵 THUNK DISPATCHING: Extracted error message:", errorMessage);
        // Dispatch the extracted error message to the Redux store.
        dispatch(apiError({ message: errorMessage }));
    }
};

export const logoutUser = (history) => async (dispatch) => {
    try {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        const userLoginDetailId = sessionStorage.getItem("trackingResult");
        const userEmailFromSession = authUser?.user?.Email;

        if (userLoginDetailId) {
            const payload = {
                flagId: 3,
                UserLoginDetailID: userLoginDetailId,
                RequestUserName: userEmailFromSession,
            };
            try {
                await LoginAudit(payload);
            } catch (err) {
                // Logout audit API call failed, but proceed with logout
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