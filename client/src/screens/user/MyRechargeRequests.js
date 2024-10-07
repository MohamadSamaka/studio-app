import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  Dimensions,
  View,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Text,
  Snackbar,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import AppBar from "../../components/common/AppBar";
import {
  getUserRechargeRequests,
  cancelRechargeRequest,
} from "../../utils/axios";
import { useUserContext } from "../../contexts/UserContext";
import { theme } from "../../utils/theme"; // Ensure correct path

const { width } = Dimensions.get("window");

const RechargeRequestsScreen = () => {
  const { t } = useTranslation();
  const [rechargeRequests, setRechargeRequests] = useState([]);
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null); // To track which request is being cancelled

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success); // Default to success color

  const navigation = useNavigation();

  useEffect(() => {
    if (user) fetchRechargeRequests();
  }, []);

  const fetchRechargeRequests = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const response = await getUserRechargeRequests();
      setRechargeRequests(response.data);
    } catch (error) {
      console.error("Error fetching recharge requests:", error);
      Alert.alert(
        t("rechargeRequestsScreen.error"),
        t("rechargeRequestsScreen.failedToLoadRechargeRequests")
      );
    } finally {
      if (isRefreshing) setRefreshing(false);
      else setLoading(false);
    }
  };

  // Handle cancellation with confirmation
  const handleCancelRequest = (requestId) => {
    Alert.alert(
      t("rechargeRequestsScreen.confirmCancellation"),
      t("rechargeRequestsScreen.confirmCancellationMessage"),
      [
        {
          text: t("rechargeRequestsScreen.no"),
          style: "cancel",
        },
        {
          text: t("rechargeRequestsScreen.yes"),
          onPress: () => cancelRequest(requestId),
        },
      ],
      { cancelable: true }
    );
  };

  // Perform the cancellation
  const cancelRequest = async (requestId) => {
    setCancellingId(requestId);
    try {
      await cancelRechargeRequest(requestId);
      setSnackbarMessage(
        t("rechargeRequestsScreen.rechargeRequestCancelledSuccessfully")
      );
      setSnackbarColor(theme.colors.success);
      // Refresh the list
      fetchRechargeRequests();
    } catch (error) {
      console.error("Error cancelling recharge request:", error);
      setSnackbarMessage(
        t("rechargeRequestsScreen.failedToCancelRechargeRequest")
      );
      setSnackbarColor(theme.colors.error);
    } finally {
      setCancellingId(null);
      setSnackbarVisible(true);
    }
  };

  // Determine if a request is cancellable based on status
  const isCancellable = (status) => {
    const cancellableStatuses = ["pending", "awaiting_payment"];
    return cancellableStatuses.includes(status.toLowerCase());
  };

  // Render each recharge request item
  const renderRechargeRequest = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={800}
      useNativeDriver
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={getGradientColors(item.status)}
        style={styles.cardGradient}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Icon based on status */}
            <MaterialIcons
              name={getStatusIcon(item.status)}
              size={40}
              color={getStatusColor(item.status)}
              style={styles.icon}
            />
            {/* Request Details */}
            <Title style={styles.title}>
              {t("rechargeRequestsScreen.requestNumber", { id: item.id })}
            </Title>
            <Paragraph style={styles.detailText}>
              {t(
                `subscriptionTypes.${item.Subscription[
                  "subscription_name"
                ].toLowerCase()}`
              )}
              {/* {t('rechargeRequestsScreen.subscriptionType', {
                                type: capitalizeFirstLetter(item.Subscription["subscription_name"]),
                            })} */}
            </Paragraph>
            <Paragraph style={styles.detailText}>
              {t("rechargeRequestsScreen.dateAtTime", {
                date: formatDate(item.date),
                time: formatTime(item.time),
              })}
            </Paragraph>

            {/* Status Display */}
            <View style={styles.statusContainer}>
              {/* Optional: Remove the status icon if redundant */}
              {/* <FontAwesome5
                                name="circle"
                                size={12}
                                color={getStatusColor(item.status)}
                                style={styles.statusIcon}
                            /> */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBadgeColor(item.status) },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {getFriendlyStatus(item.status)}
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            {isCancellable(item.status) && (
              <Button
                mode="contained"
                onPress={() => handleCancelRequest(item.id)}
                style={styles.button}
                disabled={cancellingId === item.id}
                loading={cancellingId === item.id}
                contentStyle={styles.buttonContent}
                uppercase={false}
                icon="cancel"
              >
                Cancel
              </Button>
            )}
          </Card.Actions>
        </Card>
      </LinearGradient>
    </Animatable.View>
  );

  // Helper functions

  // Determine gradient colors based on status
  const getGradientColors = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "awaiting_payment":
        return ["#FFF3E0", "#FFE0B2"]; // Light Orange
      case "success":
        return ["#E8F5E9", "#C8E6C9"]; // Light Green
      case "cancelled":
        return ["#FFEBEE", "#FFCDD2"]; // Light Red
      default:
        return ["#FFFFFF", "#F5F5F5"]; // Default Grey
    }
  };

  // Get icon based on status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "awaiting_payment":
        return "hourglass-empty";
      case "success":
        return "check-circle";
      case "cancelled":
        return "cancel";
      default:
        return "info";
    }
  };

  // Get color based on status for icon
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "awaiting_payment":
        return theme.colors.warning || "#FFA726"; // Define in theme or use default
      case "success":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "awaiting_payment":
        return "#FFA726"; // Orange
      case "success":
        return "#66BB6A"; // Green
      case "cancelled":
        return "#EF5350"; // Red
      default:
        return "#9E9E9E"; // Grey
    }
  };

  // Map status to friendly label
  const getFriendlyStatus = (status) => {
    console.log("status; ", status)
    const statusKey = status.toLowerCase();
    return t(`rechargeRequestsScreen.statusLabels.${statusKey}`, {
      defaultValue: t("rechargeRequestsScreen.statusLabels.unknown"),
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (timeString) => {
    const [hour, minute, second] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    date.setSeconds(parseInt(second, 10));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title={t("rechargeRequestsScreen.rechargeRequests")} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : rechargeRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t("rechargeRequestsScreen.noRechargeRequestsFound")}
          </Text>
        </View>
      ) : (
        <FlatList
          key="recharge-requests-list"
          data={rechargeRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRechargeRequest}
          numColumns={1}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => fetchRechargeRequests(true)}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
        action={{
          label: t("rechargeRequestsScreen.close"),
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

export default RechargeRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  cardContainer: {
    flex: 1,
    marginVertical: 8,
  },
  cardGradient: {
    borderRadius: 12,
    padding: 2, // Creates a thin gradient border
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    elevation: 3, // Android shadow
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 12, // Reduced vertical padding
    paddingHorizontal: 16,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20, // Increased font size for better visibility
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  detailText: {
    fontSize: 16, // Adjusted font size
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 100, // Ensures a minimum width for better consistency
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  cardActions: {
    justifyContent: "flex-end", // Align button to the end
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    borderRadius: 8,
    backgroundColor: theme.colors.error, // Typically red for cancel
  },
  buttonContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18, // Increased font size for better visibility
    color: theme.colors.placeholder,
  },
  snackbar: {
    backgroundColor: theme.colors.success, // Default color
  },
  snackbarContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  snackbarIcon: {
    marginRight: 8,
  },
  snackbarText: {
    color: "#FFFFFF",
    flex: 1,
  },
});
