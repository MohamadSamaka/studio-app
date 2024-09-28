import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearTokens,
} from "../utils/tokenManager";
import { login, logout as axiosLogout, isAuthorized } from "../utils/axios";
import emitter from "../utils/EventEmitter"; // Import the emitter
import usePushNotifications from '../hooks/usePushNotifications';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null while checking
  const [user, setUser] = useState(null);
  // const expoPushToken = usePushNotifications();
  usePushNotifications(isAuthenticated);


  useEffect(() => {
    const initializeAuth = async () => {
      const token = await getToken();
      if (token) {
        try {
          const response = await isAuthorized();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    initializeAuth();

    // Listen for logout events
    emitter.on("logout", () => {
      logoutUser() // Trigger logout
    });

    // Cleanup listener on unmount
    return () => {
      emitter.removeAllListeners("logout");
    };
  }, []);

  const loginUser = async ({ username, password }) => {
  try {
      const response = await login({ username, password });
      const { accessToken, refreshToken, user } = response.data;
      await setToken(accessToken);
      await setRefreshToken(refreshToken);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await axiosLogout();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Proceed to clear tokens even if API call fails
    } finally {
      await clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
