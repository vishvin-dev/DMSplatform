import { createSlice } from "@reduxjs/toolkit";

// Helper function to load notifications with user-specific storage
const loadNotificationsFromStorage = (userId = 'global') => {
    try {
        const notifications = localStorage.getItem(`notifications_${userId}`);
        return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
        console.error('Failed to parse notifications from localStorage', error);
        return [];
    }
};

export const initialState = {
    user: {},
    error: "", // This will now store the error message string
    loading: false,
    isUserLogout: false,
    errorMsg: false, // This will act as a flag to show the modal
    notification: loadNotificationsFromStorage(),
};

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        // **MODIFIED**: This reducer now correctly extracts the error message string.
        apiError(state, action) {
            // The payload from the thunk is an object like { message: '...' }
            // We extract the string and save it to the 'error' state field.
             console.log("🟡 REDUCER (apiError): Action payload received:", action.payload);
            state.error = action.payload.message || "An unknown error occurred.";
            state.loading = false;
            state.isUserLogout = false;
            state.errorMsg = true; // Set flag to true to trigger the modal in the UI
            console.log("🟢 REDUCER (apiError): State after update:", JSON.parse(JSON.stringify(state)));
        },

        loginSuccess(state, action) {
            const userId = action.payload?.id || 'global';
            state.user = action.payload;
            state.loading = false;
            state.errorMsg = false;
            state.error = ""; // Clear any previous errors on success
            state.notification = loadNotificationsFromStorage(userId);
        },
        logoutUserSuccess(state) {
            state.isUserLogout = true;
            state.user = {};
        },
        // **MODIFIED**: This now correctly resets the full error state.
        reset_login_flag(state) {
          console.log("⚪️ REDUCER (reset_login_flag): Resetting error state.");
            state.error = "";
            state.loading = false;
            state.errorMsg = false;
        },
        setNotification(state, action) {
            const userId = state.user?.id || 'global';

            const existingMap = state.notification.reduce((acc, curr) => {
                acc[curr.notificationId] = curr;
                return acc;
            }, {});

            const merged = action.payload.map(notification => {
                const existing = existingMap[notification.notificationId];
                return existing ? {
                    ...notification,
                    IsNotification: existing.IsNotification,
                    IsAlter: existing.IsAlter,
                    lastRead: existing.lastRead || null
                } : notification;
            });

            state.notification = merged;
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(merged));
        },
        markNotificationAsRead(state, action) {
            const userId = state.user?.id || 'global';
            const now = new Date().toISOString();

            const updated = state.notification.map(notification =>
                notification.notificationId === action.payload
                    ? {
                        ...notification,
                        IsNotification: 0,
                        IsAlter: 0,
                        lastRead: now
                    }
                    : notification
            );

            state.notification = updated;
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
        },
        markAllNotificationsAsRead(state) {
            const userId = state.user?.id || 'global';
            const now = new Date().toISOString();

            const updated = state.notification.map(notification => ({
                ...notification,
                IsNotification: 0,
                IsAlter: 0,
                lastRead: now
            }));

            state.notification = updated;
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
        },
        clearUserNotifications(state) {
            const userId = state.user?.id || 'global';
            state.notification = [];
            localStorage.removeItem(`notifications_${userId}`);
        },
        pruneOldNotifications(state, action) {
            const userId = state.user?.id || 'global';
            const cutoffDate = action.payload || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            const filtered = state.notification.filter(
                notification => new Date(notification.createdAt) > new Date(cutoffDate)
            );

            state.notification = filtered;
            localStorage.setItem(`notifications_${userId}`, JSON.stringify(filtered));
        }
    },
});

export const {
    apiError,
    loginSuccess,
    logoutUserSuccess,
    reset_login_flag,
    setNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearUserNotifications,
    pruneOldNotifications
} = loginSlice.actions;

export default loginSlice.reducer;