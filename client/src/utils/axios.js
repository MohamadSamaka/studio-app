import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearTokens,
} from "./tokenManager";
import { Alert } from "react-native";

import emitter from "../utils/EventEmitter";
import { API_URL } from "@env";

// Axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

// Queue to hold pending requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const token = await getToken(); // or use AsyncStorage for React Native
    const refreshToken = await getRefreshToken();
    if (token) config.headers.Authorization = `token ${token}`;
    if (refreshToken)
      config.headers["x-refresh-token"] = `refreshToken ${refreshToken}`; // Use a custom header for refresh token
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error response exists and is a 401
    if (error.response && error.response.status === 401) {
      const errorMessage =
        error.response.data.message || error.response.data.error;

      // Handle Access Token Expiration
      if (
        errorMessage === "Access denied: Token expired" &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // If refresh is already in progress, queue the request
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              // Retry the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // Mark the request as retried
        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          console.log("Attempting to refresh the token...");
          try {
            // Attempt to refresh the token
            const response = await refreshToken();
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            console.log("Token refresh successful:", response.data);

            // Save the new tokens
            await setToken(accessToken);
            await setRefreshToken(newRefreshToken);

            originalRequest.headers.Authorization = `token ${accessToken}`;
            originalRequest.headers[
              "x-refresh-token"
            ] = `refreshToken ${refreshToken}`; // Use a custom header for refresh token

            api.defaults.headers.common[
              "Authorization"
            ] = `token ${accessToken}`;
            api.defaults.headers.common[
              "x-refresh-token"
            ] = `refreshToken ${refreshToken}`; // Use a custom header for refresh token

            // Process the queued requests with the new token
            processQueue(null, accessToken);
            resolve(api(originalRequest));
          } catch (err) {
            // Refresh token is invalid or expired
            console.log("Error during token refresh:", err);
            processQueue(err, null);
            await clearTokens();
            Alert.alert("Session Expired", "Please log in again.");
            emitter.emit("logout"); // Emit a logout event
            reject(err);
          } finally {
            isRefreshing = false;
          }
        });
      }

      // Handle Refresh Token Expiration
      if (errorMessage === "Refresh token expired") {
        console.log("Refresh token expired, logging out");

        // Reject all pending requests
        processQueue(error, null);

        // Clear stored tokens
        await clearTokens();

        // Emit a logout event to handle application-wide logout
        emitter.emit("logout");

        // Alert the user about session expiration
        Alert.alert("Session Expired", "Please log in again.");

        // Reject the current error
        return Promise.reject(error);
      }
    }

    // For other errors, reject as is
    return Promise.reject(error);
  }
);

// Config
export const getConfigs = () => api.get("/user/config");
export const updateConfig = (configData) =>
  api.put("/admin/config", configData);

// User functions
export const getUsers = () => api.get("/admin/users");
export const createUser = (userData) => api.post("/admin/users", userData);
export const updateUser = (id, userData) =>
  api.put(`/admin/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserCredits = (id, credits) =>
  api.put(`/admin/users/${id}/credits`, { credits });

// Role functions
export const getRoles = () => api.get("/admin/roles");
export const createRole = (roleData) => api.post("/admin/roles", roleData);
export const updateRole = (id, roleData) =>
  api.put(`/admin/roles/${id}`, roleData);
export const deleteRole = (id) => api.delete(`/admin/roles/${id}`);

// BusinessHour functions
// export const getBusinessHours = () => api.get('/admin/business-hours');

export const getBusinessHours = () => api.get("/user/business-hours");
export const createBusinessHour = (businessHourData) =>
  api.post("/admin/business-hours", businessHourData);
export const updateBusinessHourByDayOfWeek = (dayOfWeek, businessHourData) =>
  api.put(`/admin/business-hours/${dayOfWeek}`, businessHourData);
export const deleteBusinessHourByDayOfWeek = (dayOfWeek) =>
  api.delete(`/admin/business-hours/${dayOfWeek}`);
export const getBusinessCalender = () =>
  api.get("/user/business-hours/business-calendar");

// BusinessBreakHours functions
export const getBusinessBreakHours = () =>
  api.get("/admin/business-break-hours");
export const createBusinessBreakHour = (breakHourData) =>
  api.post("/admin/business-break-hours", breakHourData);
export const updateBusinessBreakHour = (id, breakHourData) =>
  api.put(`/admin/business-break-hours/${id}`, breakHourData);
export const deleteBusinessBreakHour = (id) =>
  api.delete(`/admin/business-break-hours/${id}`);
// export const getBusinessBreakHoursByBusinessHourId = (business_hour_id) =>
//   api.get(`/admin/business-break-hours`, { params: { business_hour_id }
// });

// AvailabilityException functions
export const getAvailabilityExceptions = () =>
  api.get("/admin/availability-exceptions");
export const createAvailabilityException = (exceptionData) =>
  api.post("/admin/availability-exceptions", exceptionData);
export const updateAvailabilityException = (id, exceptionData) =>
  api.put(`/admin/availability-exceptions/${id}`, exceptionData);
export const deleteAvailabilityException = (id) =>
  api.delete(`/admin/availability-exceptions/${id}`);

// Subscription functions
export const getSubscriptions = () => api.get("/admin/subscriptions");
export const createSubscription = (subscriptionData) =>
  api.post("/admin/subscriptions", subscriptionData);
export const updateSubscription = (id, subscriptionData) =>
  api.put(`/admin/subscriptions/${id}`, subscriptionData);
export const deleteSubscription = (id) =>
  api.delete(`/admin/subscriptions/${id}`);

// Reservation functions
export const getReservations = () => api.get("/admin/reservations");
// export const getPaginatedReservations = ({page, limit}) =>
//   api.get('/admin/reservations/paginated', {
//     params: { page, limit },
//   }
// )

export const getPaginatedReservations = (params) =>
  api.get("/admin/reservations/paginated", { params });

export const createReservation = (reservationData) =>
  api.post("/user/reservations/", reservationData);
export const createUserReservation = (reservationData) =>
  api.post("/user/reservations", reservationData);
export const updateReservation = (id, reservationData) =>
  api.put(`/admin/reservations/${id}`, reservationData);
export const deleteReservation = (id) =>
  api.delete(`/admin/reservations/${id}`);
export const removeUserFromReservation = (reservationId, userId) =>
  api.delete(`/admin/reservations/${reservationId}/users/${userId}`);

export const getOrganizedReservationsByDateAndTime = () =>
  api.get("/user/reservations/organized");

// RechargeCreditRequest functions
export const getRechargeCreditRequests = () =>
  api.get("/admin/recharge-credit-requests");

export const createRechargeCreditRequest = (requestData) =>
  api.post("/admin/recharge-credit-requests", requestData);
export const updateRechargeRequestStatus = (id, status) =>
  api.put(`/admin/recharge-credit-requests/${id}`, status);
export const deleteRechargeCreditRequest = (id) =>
  api.delete(`/admin/recharge-credit-requests/${id}`);

// Auth functions
export const login = (credentials) => {
  isRefreshing = false;
  return api.post("/auth/login", credentials);
};
export const logout = () => api.post("/auth/logout");
export const refreshToken = () =>
  api.post("/auth/refresh-token", {
    skipAuth: true,
  });
export const isAuthorized = () => api.get("/auth/user");

// User-specific functions
export const getUserProfile = () => api.get("/user/profile");
export const updateUserProfile = (profileData) =>
  api.put("/user/profile", profileData);
export const getUserSubscriptions = () => api.get("/user/subscriptions");
export const subscriptionRequest = (requestData) =>
  api.post("/user/subscriptions/request", requestData);
export const getUserReservations = () => api.get(`/user/reservations`);
export const cancelUserReservation = (reservationId) =>
  api.delete(`/user/reservations/${reservationId}`);

export const getUserRechargeRequests = () =>
  api.get("/user/recharge-credit-requests");
export const createUserRechargeRequest = (requestData) =>
  api.post("/user/recharge-credit-requests", requestData);
export const cancelRechargeRequest = (rechargeRequestId) =>
  api.delete(`/user/recharge-credit-requests/${rechargeRequestId}`);

export const updateUserLanguage = (language) =>
  api.put(`/user/language`, {
    language,
  });

export const getNotifications = () => api.get("/user/notification");
export const markNotificationAsRead = (notificationIds) =>
  api.put("/user/notification/read", { notificationIds });
export const pushNotification = (token) =>
  api.post("/auth/push-token", { token });
export const testNotify = (userId) => api.post("/auth/notify-test", { userId });

export default api;
