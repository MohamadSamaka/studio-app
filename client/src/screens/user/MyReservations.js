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

import moment from "moment";

const ReservationsScreen = () => {
  const { t } = useTranslation();
  const { user, updateCredits } = useUserContext();
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const theme = useTheme();
  const { height } = Dimensions.get("window");

  useEffect(() => {
    if (user) fetchUserReservations();
  }, []);

  const fetchUserReservations = async () => {
    try {
      const response = await getUserReservations();
      const UserReservations = response.data;
      setReservations(UserReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const handleCancelReservation = useCallback((reservation) => {
    setReservationToDelete(reservation);
    setConfirmationVisible(true);
  }, []);

  const confirmDeleteReservation = useCallback(async () => {
    try {
      if (!reservationToDelete) return;

      // Calculate the difference between the current time and the reservation time
      const reservationTime = moment(
        `${reservationToDelete.date} ${reservationToDelete.time}`,
        "YYYY-MM-DD HH:mm"
      );
      const currentTime = moment();
      const hoursDifference = reservationTime.diff(currentTime, "hours", true);

      // Check if the cancellation is within 6 hours of the reservation time
      if (hoursDifference <= 6) {
        Alert.alert(
          t("myReservationsScreen.cancellationWarning"),
          t("myReservationsScreen.cancellationWarningMessage"),
          [
            {
              text: t("myReservationsScreen.noKeepReservation"),
              onPress: () => setConfirmationVisible(false),
              style: "cancel",
            },
            {
              text: t("myReservationsScreen.yesCancelReservation"),
              onPress: async () => {
                await handleReservationCancellation(false);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        await handleReservationCancellation(true);
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      Alert.alert(
        t("myReservationsScreen.error"),
        t("myReservationsScreen.failedToCancelReservation")
      );
    } finally {
      setReservationToDelete(null);
    }
  }, [reservationToDelete]);

  // Helper function to cancel the reservation and update state
  const handleReservationCancellation = async (shouldUpdateCredits) => {
    try {
      if (reservationToDelete) {
        await cancelUserReservation(reservationToDelete.id);
        setReservations((prev) =>
          prev.filter((r) => r.id !== reservationToDelete.id)
        );

        if (shouldUpdateCredits) {
          updateCredits(+1);
        }

        Alert.alert(
          t("myReservationsScreen.success"),
          t("myReservationsScreen.reservationCancelledSuccessfully")
        );
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      Alert.alert(
        "Error",
        "Failed to cancel the reservation. Please try again."
      );
    } finally {
      setConfirmationVisible(false);
    }
  };

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
    [theme.colors.accent, handleShowAllParticipants]
  );

  const renderReservation = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text
              style={[
                styles.timeText,
                {
                  textAlign: "left",
                  writingDirection: "ltr",
                },
              ]}
            >
              {t("myReservationsScreen.atTime", { time: item.time })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleCancelReservation(item)}
            style={styles.cancelButton}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              style={{ color: "#C70000" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.participantsContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color={theme.colors.primary}
          />
          {renderParticipants(item.otherUsers)}
        </View>
      </View>
    ),
    [theme.colors.primary, handleCancelReservation, renderParticipants]
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
      reservation.otherUsers.some((user) =>
        user.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBar />
      <Searchbar
        placeholder={t("myReservationsScreen.searchReservations")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="none"
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={[styles.modalContainer, { maxHeight: height * 0.65 }]}>
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
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              {t("close")}
            </Button>
          </View>
        </Animated.View>
      </Modal>

      <Modal
        visible={confirmationVisible}
        transparent={true}
        onRequestClose={() => setConfirmationVisible(false)}
        animationType="fade"
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationTitle}>
              {t("myReservationsScreen.areYouSure")}
            </Text>
            <Text style={styles.confirmationMessage}>
              {t("myReservationsScreen.deleteReservationConfirmation", {
                date: reservationToDelete?.date,
                time: reservationToDelete?.time,
              })}
            </Text>
            <View style={styles.confirmationButtons}>
              <Button
                mode="contained"
                onPress={confirmDeleteReservation}
                style={styles.confirmButton}
              >
                {t("myReservationsScreen.yesDelete")}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setConfirmationVisible(false)}
                style={styles.cancelButton}
              >
                {t("myReservationsScreen.cancel")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  timeText: {
    alignContent: "left",
    fontSize: 16,
    color: "#7f8c8d",
  },
  cancelButton: {
    alignSelf: "center",
    borderColor: "#C70000",
    color: "#C70000",
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
    marginRight: 8,
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
  onlyParticipantText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#34495e",
  },
  modalContent: {
    paddingBottom: 16,
  },
  participantListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  participantAvatarLarge: {
    marginRight: 12,
  },
  avatarTextLarge: {
    color: "#ffffff",
    fontWeight: "600",
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
  confirmationOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  confirmationContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 5,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#34495e",
  },
  confirmationMessage: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    backgroundColor: "#e74c3c",
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    borderColor: "#7f8c8d",
  },
});

export default ReservationsScreen;
