import axios from "axios";
import { api } from "../config"; // Assuming you have a config file

// Default axios config
axios.defaults.baseURL = api.API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// MODIFIED: This interceptor now correctly handles backend errors.
axios.interceptors.response.use(
    function (response) {
        // On success, return the response data
        return response.data ? response.data : response;
    },
    function (error) {
        // On error, we don't modify the error. We pass it along as-is.
        // This ensures our Redux thunk receives the full error object
        // with `error.response.data` intact.
        return Promise.reject(error);
    }
);

export const setAuthorization = () => {
    const authUser = sessionStorage.getItem("authUser");
    if (authUser) {
        const { token } = JSON.parse(authUser);
        if (token) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }
};

class APIClient {
    /**
     * Performs a GET request
     */
    get = (url, params) => {
        setAuthorization();
        let response;
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            response = axios.get(`${url}?${queryString}`);
        } else {
            response = axios.get(url);
        }
        return response;
    };

    /**
     * Performs a POST request
     */
    create = (url, data) => {
        setAuthorization();
        return axios.post(url, data);
    };

    /**
     * Performs a multipart POST request
     */
    createMultiPart = (url, formData) => {
        setAuthorization();
        return axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    };

    /**
     * Performs a PATCH request
     */
    update = (url, data) => {
        setAuthorization();
        return axios.patch(url, data);
    };

    /**
     * Performs a PUT request
     */
    put = (url, data) => {
        setAuthorization();
        return axios.put(url, data);
    };

    /**
     * Performs a DELETE request
     */
    delete = (url, config) => {
        setAuthorization();
        return axios.delete(url, { ...config });
    };
}

export const getLoggedinUser = () => {
    const user = sessionStorage.getItem("authUser");
    if (user) {
        return JSON.parse(user);
    }
    return null;
};

export { APIClient };