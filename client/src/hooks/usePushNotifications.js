import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import { pushNotification } from "../utils/axios";

const usePushNotifications = (shouldRegister) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!shouldRegister) return; // Only register if shouldRegister is true

    console.log("usePushNotifications hook triggered due to login");

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        console.log(`[INFO] Push token set: ${token}`);
        await pushNotification(token);
      }
    });

    // Set up listeners for notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Response:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [shouldRegister]); // Dependency array includes shouldRegister

  return expoPushToken;
};

// Helper function remains the same
async function registerForPushNotificationsAsync() {

  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notification!");
      return;
    }

    // Get the Expo push token and pass the projectId
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: "<YOUR_ID>", // Replace with your actual project ID
    });
    token = expoPushToken.data;
  } else {
    Alert.alert("Must use physical device for Push Notifications");
  }

  // Android-specific notification channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export default usePushNotifications;
