import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
  I18nManager,
  Text,
} from "react-native";
import {
  Searchbar,
  useTheme,
  Avatar,
  Button,
  Divider,
  Snackbar,
} from "react-native-paper";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";

// Import your context / hooks
import { useUserContext } from "../../contexts/UserContext";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useTranslation } from "react-i18next";
import AppBar from "../../components/common/AppBar";
import ConfirmationModal from "../../components/common/ConfirmationModal";

// Import your API methods
import {
  getUserReservations, // Suppose this returns { activeReservations: [], canceledReservations: [] }
  cancelUserReservation,
} from "../../utils/axios";

import { isWithinThreshold } from "../../utils/validationUtils";
import { isDateTimePast } from "../../utils/timeUtils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MyReservationsScreen = () => {
  const { t } = useTranslation();
  const { user, updateCredits } = useUserContext();
  const { config, loading: configLoading } = useConfigContext();
  const theme = useTheme();

  // Cancel threshold from config
  const [cancelRefundThreshold, setCancelRefundThreshold] = useState(null);

  // We store two arrays from backend
  const [activeReservations, setActiveReservations] = useState([]);
  const [canceledReservations, setCanceledReservations] = useState([]);

  // Searching
  const [searchQuery, setSearchQuery] = useState("");

  // Participants modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Confirmation modal
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState({});

  // Snackbar for success / error
  const [snackbarVisibleSuccess, setSnackbarVisibleSuccess] = useState(false);
  const [snackbarMessageSuccess, setSnackbarMessageSuccess] = useState("");
  const [snackbarVisibleError, setSnackbarVisibleError] = useState(false);
  const [snackbarMessageError, setSnackbarMessageError] = useState("");

  // For the tab switching (active vs canceled)
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: "active", title: t("active") },
    { key: "canceled", title: t("canceled") },
  ]);

  // ================================
  // SNACKBAR Helpers
  // ================================
  const showSuccessSnackbar = (msg) => {
    setSnackbarMessageSuccess(msg);
    setSnackbarVisibleSuccess(true);
  };
  const hideSuccessSnackbar = () => setSnackbarVisibleSuccess(false);

  const showErrorSnackbar = (msg) => {
    setSnackbarMessageError(msg);
    setSnackbarVisibleError(true);
  };
  const hideErrorSnackbar = () => setSnackbarVisibleError(false);

  // ================================
  // FETCH & SETUP
  // ================================
  useEffect(() => {
    if (config && config.reservations) {
      const thresholdTime =
        config.reservations["cancelation-refund-threshold-time"];
      if (thresholdTime) setCancelRefundThreshold(thresholdTime);
    }
  }, [config, configLoading]);

  useEffect(() => {
    if (user) fetchUserReservations();
  }, [user]);

  const fetchUserReservations = async () => {
    try {
      // Suppose this returns { activeReservations, canceledReservations }
      const response = await getUserReservations();
      setActiveReservations(response.data.activeReservations);
      setCanceledReservations(response.data.canceledReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      showErrorSnackbar(t("myReservationsScreen.errorFetchingReservations"));
    }
  };

  // ================================
  // CANCEL & CONFIRMATION
  // ================================
  const handleReservationCancellation = useCallback(
    async (reservation, shouldUpdateCredits) => {
      try {
        // Actually call your cancel endpoint
        await cancelUserReservation(reservation.id);
        // Remove from activeReservations
        setActiveReservations((prev) => prev.filter((r) => r.id !== reservation.id));
        // Possibly add it to canceled reservations array
        // or re-fetch from backend to keep data consistent
        await fetchUserReservations();

        if (shouldUpdateCredits) {
          updateCredits(+1);
        }
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        throw error;
      }
    },
    [updateCredits]
  );

  const handleCancelReservation = useCallback(
    (reservation) => {
      let modalTitle = t("myReservationsScreen.areYouSure");
      let modalMessage = t("myReservationsScreen.deleteReservationConfirmation", {
        date: reservation.date,
        time: reservation.startTime,
      });

      let shouldUpdateCredits = true;
      if (
        !isWithinThreshold(
          reservation.date,
          reservation.startTime,
          cancelRefundThreshold
        )
      ) {
        modalTitle = t("myReservationsScreen.cancellationWarning");
        modalMessage = t("cancellationWarningMessageSimple");
        shouldUpdateCredits = false;
      }

      setConfirmationModalProps({
        title: modalTitle,
        message: modalMessage,
        confirmText: t("myReservationsScreen.yesCancelReservation"),
        cancelText: t("myReservationsScreen.noKeepReservation"),
        onConfirm: async () => {
          try {
            await handleReservationCancellation(reservation, shouldUpdateCredits);
            showSuccessSnackbar(
              t("myReservationsScreen.reservationCancelledSuccessfully")
            );
          } catch (error) {
            console.error("Error cancelling reservation:", error);
            showErrorSnackbar(t("myReservationsScreen.failedToCancelReservation"));
          } finally {
            setConfirmationModalVisible(false);
          }
        },
        onCancel: () => setConfirmationModalVisible(false),
      });

      setConfirmationModalVisible(true);
    },
    [t, handleReservationCancellation, cancelRefundThreshold]
  );

  // ================================
  // PARTICIPANTS MODAL
  // ================================
  const handleShowAllParticipants = useCallback(
    (participants) => {
      setSelectedParticipants(participants);
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    [fadeAnim]
  );

  // ================================
  // RENDERING
  // ================================
  const renderParticipants = useCallback(
    (participants) => {
      // Just an example: show first 3, then "more"
      const displayed = participants.slice(0, 3);
      const remaining = participants.length - displayed.length;
      return (
        <View style={styles.participantsList}>
          {displayed.length <= 0 ? (
            <Text style={styles.emptyReservationText}>
              {t("myReservationsScreen.noParticipantsYet")}
            </Text>
          ) : (
            displayed.map((user, idx) => (
              <Avatar.Text
                key={`${user}-${idx}`}
                size={30}
                label={user.charAt(0).toUpperCase()}
                style={[styles.participantAvatar, { backgroundColor: theme.colors.accent }]}
                labelStyle={styles.avatarText}
              />
            ))
          )}
          {remaining > 0 && (
            <TouchableOpacity onPress={() => handleShowAllParticipants(participants)}>
              <View style={styles.moreParticipantsChip}>
                <Text style={styles.moreParticipantsText}>
                  {t("myReservationsScreen.moreParticipants", {
                    count: remaining,
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [theme.colors.accent, handleShowAllParticipants, t]
  );

  const renderReservation = useCallback(
    ({ item, fromActiveTab }) => {
      const { date, startTime, duration, trainer, participants, ghostInfo } = item;

      // Compute times
      const startTimeMoment = moment(startTime, "HH:mm:ss");
      const durationMoment = moment.duration(duration);
      const endTime = startTimeMoment.clone().add(durationMoment);

      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.primary} />
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{date}</Text>
              <View style={styles.timeRow}>
                <MaterialCommunityIcons
                  name="clock-start"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>
                  {t("myReservationsScreen.startTime")} {startTimeMoment.format("HH:mm")}
                </Text>
              </View>
              <View style={styles.timeRow}>
                <MaterialCommunityIcons
                  name="clock-end"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>
                  {t("myReservationsScreen.endTime")} {endTime.format("HH:mm")}
                </Text>
              </View>
            </View>
            {/* If fromActiveTab, show cancel button if it's future */}
            {fromActiveTab && !isDateTimePast(date, startTime) && (
              <TouchableOpacity
                onPress={() => handleCancelReservation(item)}
                style={styles.cancelButton}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#C70000" />
              </TouchableOpacity>
            )}
          </View>
          {/* Trainer row */}
          <View style={styles.trainerContainer}>
            <MaterialCommunityIcons name="account-tie" size={24} color={theme.colors.primary} />
            <Text style={styles.trainerText}>
              {t("myReservationsScreen.trainer")}: {trainer || "N/A"}
            </Text>
          </View>
          {/* Participants row */}
          <View style={styles.participantsContainer}>
            <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.primary} />
            {renderParticipants(participants || [])}
          </View>

          {/* If ghostInfo is present (the user canceled previously), show some info */}
          {ghostInfo && ghostInfo.length > 0 && (
            <View style={styles.ghostLogsContainer}>
              <Text style={styles.ghostLogsTitle}>
                {t("myReservationsScreen.previousCancellations")} ({ghostInfo.length})
              </Text>
              {ghostInfo.map((log, idx) => (
                <View key={idx} style={styles.ghostLogItem}>
                  <MaterialCommunityIcons
                    name={log.punished ? "alert-circle" : "check-circle"}
                    size={20}
                    color={log.punished ? "#f44336" : "#4CAF50"}
                  />
                  <Text style={styles.ghostLogText}>
                    {t("myReservationsScreen.cancelTime")} {log.cancellationTime} -{" "}
                    {log.punished ? t("myReservationsScreen.punished") : t("myReservationsScreen.notPunished")}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    },
    [theme.colors.primary, handleCancelReservation, renderParticipants, t]
  );

  // For the participants modal
  const renderParticipantListItem = useCallback(
    (user) => (
      <View key={user} style={styles.participantListItem}>
        <Avatar.Text
          size={40}
          label={user.charAt(0).toUpperCase()}
          style={[styles.participantAvatarLarge, { backgroundColor: theme.colors.primary }]}
          labelStyle={styles.avatarTextLarge}
        />
        <Text style={styles.participantName}>{user}</Text>
      </View>
    ),
    [theme.colors.primary]
  );

  // ================================
  // FILTERS & SEARCH
  // ================================
  // Filter for searching
  const filterBySearch = (reservationsList) => {
    if (!searchQuery) return reservationsList;

    return reservationsList.filter((res) => {
      const inDate = res.date.toLowerCase().includes(searchQuery.toLowerCase());
      const inTrainer =
        (res.trainer && res.trainer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        false;
      const inParticipants =
        (res.participants &&
          res.participants.some((p) =>
            p.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        false;
      return inDate || inTrainer || inParticipants;
    });
  };

  // Final lists to show:
  const activeList = filterBySearch(activeReservations);
  const canceledList = filterBySearch(canceledReservations);

  // Tab Scenes
  const renderActiveScene = () => (
    <FlatList
      data={activeList}
      keyExtractor={(item) => item.id.toString()}
      renderItem={(info) => renderReservation({ ...info, fromActiveTab: true })}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={() => (
        <Text style={styles.noReservationsText}>
          {t("myReservationsScreen.noCurrentBooking")}
        </Text>
      )}
    />
  );

  const renderCanceledScene = () => (
    <FlatList
      data={canceledList}
      keyExtractor={(item) => item.id.toString()}
      renderItem={(info) => renderReservation({ ...info, fromActiveTab: false })}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={() => (
        <Text style={styles.noReservationsText}>
          {t("myReservationsScreen.noCanceledBooking")}
        </Text>
      )}
    />
  );

  // TabView's main renderScene
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "active":
        return renderActiveScene();
      case "canceled":
        return renderCanceledScene();
      default:
        return null;
    }
  };

  // Custom TabBar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: "#fff" }}
      activeColor={theme.colors.primary}
      inactiveColor="#999"
    />
  );

  // ================================
  // MAIN COMPONENT RENDER
  // ================================
  if (configLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    // If user not logged in, prompt
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBar />
        <View style={styles.noReservationsContainer}>
          <Text style={styles.noReservationsText}>
            {t("myReservationsScreen.notLoggedIn")}
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")} // or use useNavigation
          >
            <Text style={styles.loginButtonText}>
              {t("myReservationsScreen.login")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar />

      {/* Searchbar */}
      <Searchbar
        placeholder={t("myReservationsScreen.searchReservations")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        icon={() => (
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={theme.colors.placeholder}
          />
        )}
        clearIcon="close"
      />

      {/* TabView for Active vs Canceled reservations */}
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={renderTabBar}
      />

      {/* Modal for Participants */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              { opacity: fadeAnim, maxHeight: SCREEN_HEIGHT * 0.8 },
            ]}
          >
            <Text style={styles.modalTitle}>
              {t("myReservationsScreen.participants")}
            </Text>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedParticipants.map((user) => (
                <View key={user} style={styles.participantListItem}>
                  <Avatar.Text
                    size={40}
                    label={user.charAt(0).toUpperCase()}
                    style={[
                      styles.participantAvatarLarge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    labelStyle={styles.avatarTextLarge}
                  />
                  <Text style={styles.participantName}>{user}</Text>
                </View>
              ))}
            </ScrollView>
            <Divider style={styles.divider} />
            <Button
              mode="contained"
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              {t("close")}
            </Button>
          </Animated.View>
        </View>
      </Modal>

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbarVisibleSuccess}
        onDismiss={hideSuccessSnackbar}
        duration={3000}
        style={styles.snackbarSuccess}
        action={{
          label: "Close",
          onPress: hideSuccessSnackbar,
        }}
      >
        {snackbarMessageSuccess}
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        visible={snackbarVisibleError}
        onDismiss={hideErrorSnackbar}
        duration={3000}
        style={styles.snackbarError}
        action={{
          label: "Close",
          onPress: hideErrorSnackbar,
        }}
      >
        {snackbarMessageError}
      </Snackbar>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationModalVisible}
        onDismiss={() => setConfirmationModalVisible(false)}
        {...confirmationModalProps}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchBar: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReservationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReservationsText: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#00adf5",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateTimeContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34495e",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeIcon: {
    marginRight: 6,
  },
  timeText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  cancelButton: {
    padding: 8,
  },
  trainerContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trainerText: {
    fontSize: 16,
    color: "#34495e",
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  participantsList: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  participantAvatar: {
    marginHorizontal: 4,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  moreParticipantsChip: {
    backgroundColor: "#bdc3c7",
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 15,
    alignItems: "center",
    marginLeft: 8,
  },
  moreParticipantsText: {
    color: "#2c3e50",
    fontWeight: "600",
  },
  ghostLogsContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  ghostLogsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  ghostLogItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  ghostLogText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#34495e",
    textAlign: "center",
  },
  modalContent: {
    flexGrow: 1,
  },
  participantListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  participantAvatarLarge: {
    marginRight: 16,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  avatarTextLarge: {
    color: "#ffffff",
    fontWeight: "600",
  },
  divider: {
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 16,
    borderRadius: 25,
  },
  snackbarSuccess: {
    backgroundColor: "#4CAF50",
  },
  snackbarError: {
    backgroundColor: "#F44336",
  },
});

export default MyReservationsScreen;
