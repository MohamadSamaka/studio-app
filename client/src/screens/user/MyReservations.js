import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  I18nManager,
  ActivityIndicator,
} from "react-native";
import {
  Searchbar,
  useTheme,
  Avatar,
  Button,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppBar from "../../components/common/AppBar";
import { getUserReservations, cancelUserReservation } from "../../utils/axios";
import { useUserContext } from "../../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useConfigContext } from "../../contexts/ConfigContext";
import { isWithinThreshold } from "../../utils/validationUtils";

import moment from "moment";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const ReservationsScreen = () => {
  const { t } = useTranslation();
  const { user, updateCredits } = useUserContext();
  const { config, loading: configLoading } = useConfigContext();
  const [cancelRefundThreshold, setCancelRefundThreshold] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState({});
  const theme = useTheme();
  const { height } = Dimensions.get("window");

  useEffect(() => {
    if (config && config.reservations) {
      const thresholdTime =
        config.reservations["cancelation-refund-threshold-time"];
      if (thresholdTime) setCancelRefundThreshold(thresholdTime); // Setting threshold properly
    }
  }, [config, configLoading]); // Make sure config and configLoading are dependencies

  useEffect(() => {
    if (user) fetchUserReservations();
  }, [user]);

  const fetchUserReservations = async () => {
    try {
      const response = await getUserReservations();
      const userReservations = response.data;
      setReservations(userReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      Alert.alert(
        t("myReservationsScreen.error"),
        t("myReservationsScreen.errorFetchingReservations")
      );
    }
  };

  const handleReservationCancellation = useCallback(
    async (reservation, shouldUpdateCredits) => {
      try {
        if (reservation) {
          await cancelUserReservation(reservation.id);
          setReservations((prev) =>
            prev.filter((r) => r.id !== reservation.id)
          );

          if (shouldUpdateCredits) {
            updateCredits(+1);
          }
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
      let modalMessage = t(
        "myReservationsScreen.deleteReservationConfirmation",
        {
          date: reservation.date,
          time: reservation.start_time,
        }
      );

      let shouldUpdateCredits = true;
      console.log("hmmmmmmm: ", config?.reservations?.["cancelation-refund-threshold-time"])
      if (
        !isWithinThreshold(
          reservation.date,
          reservation.start_time,
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
            await handleReservationCancellation(
              reservation,
              shouldUpdateCredits
            );
            Alert.alert(
              t("myReservationsScreen.success"),
              t("myReservationsScreen.reservationCancelledSuccessfully")
            );
          } catch (error) {
            console.error("Error cancelling reservation:", error);
            Alert.alert(
              t("myReservationsScreen.error"),
              t("myReservationsScreen.failedToCancelReservation")
            );
          } finally {
            setConfirmationModalVisible(false);
          }
        },
        onCancel: () => {
          setConfirmationModalVisible(false);
        },
      });

      setConfirmationModalVisible(true);
    },
    [t, handleReservationCancellation, cancelRefundThreshold]
  );

  const handleShowAllParticipants = useCallback(
    (participants) => {
      const sortedParticipants = participants.slice().sort((a, b) => {
        if (a === "admin") return -1;
        if (b === "admin") return 1;
        return a.localeCompare(b);
      });
      setSelectedParticipants(sortedParticipants);
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    [fadeAnim]
  );

  const renderParticipants = useCallback(
    (participants) => {
      const you = t("you");
      const updatedParticipants = [you, ...participants];
      const displayedParticipants = updatedParticipants.slice(0, 3);
      const remainingParticipants =
        updatedParticipants.length - displayedParticipants.length;

      return (
        <View style={styles.participantsList}>
          {displayedParticipants.map((user, index) => (
            <Avatar.Text
              key={`${user}-${index}`}
              size={30}
              label={user.charAt(0).toUpperCase()}
              style={[
                styles.participantAvatar,
                { backgroundColor: theme.colors.accent },
              ]}
              labelStyle={styles.avatarText}
            />
          ))}
          <TouchableOpacity
            onPress={() => handleShowAllParticipants(updatedParticipants)}
          >
            <View style={styles.moreParticipantsChip}>
              <Text style={styles.moreParticipantsText}>
                {remainingParticipants > 0
                  ? t("myReservationsScreen.moreParticipants", {
                      count: remainingParticipants,
                    })
                  : t("myReservationsScreen.showAll")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [theme.colors.accent, handleShowAllParticipants, t]
  );

  const renderReservation = useCallback(
    ({ item }) => {
      // Validate item properties to avoid undefined errors
      if (!item) return null;

      const { date, start_time, duration, trainer, participants } = item;

      if (!date || !start_time || !duration) {
        console.error("Missing required reservation details:", item);
        return null; // If any essential detail is missing, skip rendering this item
      }

      const startTime = moment(start_time, "HH:mm:ss");
      const durationMoment = moment.duration(duration);
      const endTime = startTime.clone().add(durationMoment);

      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="calendar"
              size={24}
              color={theme.colors.primary}
            />
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
                  {t("myReservationsScreen.startTime")}{" "}
                  {startTime.format("HH:mm")}
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
            <TouchableOpacity
              onPress={() => handleCancelReservation(item)}
              style={styles.cancelButton}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color="#C70000"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.trainerContainer}>
            <MaterialCommunityIcons
              name="account-tie"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.trainerText}>
              {t("myReservationsScreen.trainer")}: {trainer ? trainer : "N/A"}
            </Text>
          </View>
          <View style={styles.participantsContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={theme.colors.primary}
            />
            {renderParticipants(participants || [])}
          </View>
        </View>
      );
    },
    [theme.colors.primary, handleCancelReservation, renderParticipants, t]
  );
  const renderParticipantListItem = useCallback(
    (user) => (
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
    ),
    [theme.colors.primary]
  );

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.participants.some((user) =>
        user.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (!reservations) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar />
      <Searchbar
        placeholder={t("myReservationsScreen.searchReservations")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      {filteredReservations.length === 0 ? (
        <View style={styles.noReservationsContainer}>
          <Text style={styles.noReservationsText}>
            {t("myReservationsScreen.noCurrentBooking")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReservation}
          contentContainerStyle={styles.listContainer}
        />
      )}

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
              { opacity: fadeAnim, maxHeight: height * 0.8 },
            ]}
          >
            <Text style={styles.modalTitle}>
              {t("myReservationsScreen.participants")}
            </Text>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedParticipants.map(renderParticipantListItem)}
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

      <ConfirmationModal
        visible={confirmationModalVisible}
        onRequestClose={() => setConfirmationModalVisible(false)}
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
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trainerText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#34495e",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  },
  moreParticipantsText: {
    color: "#2c3e50",
    fontWeight: "600",
  },
  noParticipantsText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#7f8c8d",
  },
  noReservationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReservationsText: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  trainerContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trainerText: {
    fontSize: 16,
    color: "#34495e",
    marginLeft: 12,
    textAlign: I18nManager.isRTL ? "right" : "left",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  divider: {
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 16,
  },
  avatarTextLarge: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default ReservationsScreen;
