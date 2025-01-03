import React, { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Button,
  ActivityIndicator,
  Text,
  Snackbar,
  Dialog,
  Portal,
  Paragraph,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import AppBar from "../../components/common/AppBar";
import { getUserSubscriptions, subscriptionRequest } from "../../utils/axios";
import { useUserContext } from "../../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { theme } from "../../utils/theme";

const SubscriptionsScreen = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingId, setRequestingId] = useState(null);

  const { t } = useTranslation();

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    if (user) fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const response = await getUserSubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setSnackbarMessage(t("subscriptionsScreen.failedToLoadSubscriptions"));
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    } finally {
      if (isRefreshing) setRefreshing(false);
      else setLoading(false);
    }
  };

  const handleRequestSubscription = (subscriptionId, subscriptionName) => {
    setSelectedSubscription({ id: subscriptionId, name: subscriptionName });
    setDialogVisible(true);
  };

  const confirmSubscriptionRequest = () => {
    if (selectedSubscription) {
      requestSubscription(selectedSubscription.id, selectedSubscription.name);
    }
    setDialogVisible(false);
  };

  const cancelSubscriptionRequest = () => {
    setDialogVisible(false);
  };

  // Perform the subscription request
  const requestSubscription = async (subscriptionTypeId, subscriptionName) => {
    const responseSkeleton = "subscriptionsScreen.requestResponse";
    setRequestingId(subscriptionTypeId);
    try {
      const userInfo = user;

      const payload = {
        subscriptionTypeId,
        userId: userInfo.id,
      };

      await subscriptionRequest(payload);
      setSnackbarMessage(t(`${responseSkeleton}.success`));
      setSnackbarColor(theme.colors.success);
    } catch (error) {
      console.error("Error requesting subscription:", error);
      setSnackbarMessage(t(`${responseSkeleton}.fail`));
      setSnackbarColor(theme.colors.error);
    } finally {
      setRequestingId(null);
      setSnackbarVisible(true);
    }
  };

  const renderSubscription = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={800}
      useNativeDriver
      style={styles.cardContainer}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          handleRequestSubscription(item.id, item.subscriptionName)
        }
      >
        <LinearGradient
          colors={
            item.isPopular ? ["#FFF3E0", "#FFE0B2"] : ["#FFFFFF", "#F5F5F5"]
          }
          style={styles.cardGradient}
        >
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {/* Subscription Icon */}
              <MaterialIcons
                name={getIconName(item.subscriptionName)}
                size={40}
                color={theme.colors.primary}
                style={styles.icon}
              />
              {/* Subscription Name */}
              <Text style={styles.featureText}>
                {t("subscriptionsScreen.meetings", {
                  count: item.meetingsNum,
                })}
              </Text>
              {/* Subscription Features */}
              <View style={styles.featureRow}>
                <FontAwesome5
                  name="users"
                  size={16}
                  color={theme.colors.placeholder}
                />
                <Text style={styles.featureText}>
                  {t("subscriptionsScreen.meetings", {
                    count: item.meetingsNum,
                  })}
                </Text>
              </View>
              <View style={styles.featureRow}>
                <FontAwesome5
                  name="shekel-sign"
                  size={12}
                  color={theme.colors.placeholder}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>{item.price.toFixed(2)}</Text>
              </View>
              {/* Badge for Popular Subscriptions */}
              {item.isPopular && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Most Popular</Text>
                </View>
              )}
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="contained"
                onPress={() =>
                  handleRequestSubscription(item.id, item.subscriptionName)
                }
                style={styles.button}
                disabled={requestingId === item.id}
                loading={requestingId === item.id}
                uppercase={false}
                icon={() => (
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                )}
              >
                {t("subscriptionsScreen.requestingSubscription")}
              </Button>
            </Card.Actions>
          </Card>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  // Function to determine icon based on subscription name
  const getIconName = (name) => {
    switch (name.toLowerCase()) {
      case "basic":
        return "star-border";
      case "premium":
        return "star";
      case "pro":
        return "whatshot";
      default:
        return "subscriptions";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title={t("subscriptionsScreen.title")} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
        </View>
      ) : subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t("subscriptionsScreen.noSubscriptionsAvailable")}
          </Text>
        </View>
      ) : (
        <FlatList
          key="subscriptions-list"
          data={subscriptions.filter((sub) => sub.active === true)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSubscription}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => fetchSubscriptions(true)}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 20 }} />}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
        action={{
          label: t("close"),
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Dialog for confirmation */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={cancelSubscriptionRequest}>
          <Dialog.Title>
            {t("subscriptionsScreen.requestingConfirmationTitle")}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {t(
                "subscriptionsScreen.requestingSubscriptionConfirmationMessage",
                {
                  subscriptionTypeId:
                    selectedSubscription?.name?.toLowerCase() &&
                    t(
                      `subscriptionTypeIds.${selectedSubscription?.name?.toLowerCase()}`
                    ) !==
                      `subscriptionTypeIds.${selectedSubscription?.name?.toLowerCase()}`
                      ? t(
                          `subscriptionTypeIds.${selectedSubscription?.name?.toLowerCase()}`
                        )
                      : "",
                }
              )}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelSubscriptionRequest}>{t("cancel")}</Button>
            <Button onPress={confirmSubscriptionRequest}>{t("yes")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardContainer: {
    flex: 1,
    margin: 5,
  },
  cardGradient: {
    borderRadius: 12,
    padding: 2,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    elevation: 3,
  },
  cardContent: {
    alignItems: "center",
    padding: 16,
    position: "relative",
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  featureIcon: {
    marginRight: 6,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // badgeText: {
  //     color: '#FFFFFF',
  //     fontSize: 10,
  //     fontWeight: '600',
  // },
  button: {
    flex: 1, // Allows the button to expand horizontally
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  // buttonContent: {
  //     fontSize: 3,
  //     fontWeight: 700,
  //     paddingVertical: 6,
  //     paddingHorizontal: 8, // Reduced padding to save space
  // },
  cardActions: {
    justifyContent: "center", // Center the button horizontally
    paddingHorizontal: 16, // Consistent padding around the button
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
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  snackbar: {
    backgroundColor: theme.colors.success,
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
