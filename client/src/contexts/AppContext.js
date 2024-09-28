import React, { createContext, useState, useContext, useEffect } from "react";
import * as Notifications from 'expo-notifications';
import * as Permissions from "expo-permissions";
import { isDevice } from "expo-device";
import { Alert } from 'react-native';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [notificationPermission, setNotificationPermission] = useState(null);

  // Function to request notification permissions
  const requestNotificationPermission = async () => {
    if (isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Ask for permission if it hasn't been granted yet
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permission is not granted, show an alert
      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "You need to enable notifications in your settings to receive alerts."
        );
        return;
      }

      setNotificationPermission(finalStatus);
      console.log("Notification permission status:", finalStatus);
    } else {
      Alert.alert("Error", "Must use physical device for notifications");
    }
  };

  // Hook to request notification permissions when the app starts
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <AppContext.Provider value={{ notificationPermission }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
