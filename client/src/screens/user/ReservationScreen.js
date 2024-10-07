import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  I18nManager,
} from "react-native";
import { WeekCalendar, CalendarProvider } from "react-native-calendars";
import { Card, Title, Paragraph, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import AppBar from "../../components/common/AppBar";
import moment from "moment";
import Modal from "react-native-modal";
import AvatarStack from "../../components/client/reservation/AvatarStack";

import ConfirmationModal from "../../components/common/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../../contexts/UserContext";
import { useConfigContext } from "../../contexts/ConfigContext";
import {
  getOrganizedReservationsByDateAndTime,
  bookTimeSlot,
  cancelUserReservation,
} from "../../utils/axios";

// Import the default avatar image
const defaultAvatar = require("../../../assets/images/user.png"); // Adjust the path as necessary


const ReservationItem = ({
  item,
  handleToggleReservation,
  handleShowAttendees,
  t,
  userId,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    date,
    time,
    title = "Untitled",
    isReserved = false,
    location = "N/A",
    trainer = null, // Initialize as null
    attendees = [],
    max_participants = 0,
  } = item;

  const userIsReserved = attendees.some((attendee) => attendee.id === userId);
  const isFullyBooked = attendees.length >= max_participants;

  // Start fade-in animation for Fully Booked Overlay
  useEffect(() => {
    if (isFullyBooked && !userIsReserved) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isFullyBooked, userIsReserved, fadeAnim]);

  // Helper function to get the first letter of the day based on locale
  const getDayInitial = (date) => {
    const day = moment(date)
      .locale(I18nManager.isRTL ? "ar" : "en")
      .format("dddd");
    const initial = day.charAt(0);
    return initial.toUpperCase();
  };

  return (
    <View style={styles.reservationContainer}>
      <View style={styles.dateContainer}>
        <View style={styles.dateInnerContainer}>
          <Text style={styles.dateNumber}>{moment(date).format("D")}</Text>
          <Text style={styles.dateDay}>{getDayInitial(date)}</Text>
        </View>
      </View>
      <Card style={styles.cardContainer}>
        <TouchableOpacity
          onPress={() => handleToggleReservation(date, time)}
          accessibilityLabel={`Toggle reservation for ${title} on ${date} at ${time}`}
          disabled={isFullyBooked && !userIsReserved}
        >
          <ImageBackground
            source={require("../../../assets/images/studio.jpg")} // Ensure the image exists
            style={styles.cardBackground}
            imageStyle={styles.cardBackgroundImage}
          >
            {/* Apply gradient overlay */}
            <LinearGradient
              colors={
                isReserved
                  ? ["rgba(0,0,0,0.6)", "rgba(0,0,0,0.6)"]
                  : ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]
              }
              style={styles.overlay}
            />
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>{title}</Title>
              <View style={styles.detailsContainer}>
                <View style={styles.iconTextContainer}>
                  <Icon name="clock-outline" size={18} color="#fff" />
                  <Paragraph style={styles.details}>{time}</Paragraph>
                </View>
                <View style={styles.iconTextContainer}>
                  <Icon name="map-marker-outline" size={18} color="#fff" />
                  <Paragraph style={styles.details}>{location}</Paragraph>
                </View>
              </View>
              {/* Render Trainer Icon Safely */}
              <View style={styles.iconTextContainer}>
                <Icon name="account-outline" size={18} color="#fff" />
                <Paragraph style={styles.details}>
                  {trainer && trainer.name ? trainer.name : "N/A"}
                </Paragraph>
              </View>
              <AvatarStack
                participants={attendees}
                onPress={() => handleShowAttendees(attendees)}
              />
            </Card.Content>
            {/* Animated Overlay for Fully Booked */}
            {isFullyBooked && !userIsReserved && (
              <Animated.View
                style={[styles.fullyBookedOverlay, { opacity: fadeAnim }]}
              >
                <Icon name="alert-circle-outline" size={30} color="#fff" />
                <Text style={styles.fullyBookedText}>
                  {t("BookingScreen.fullyBooked")}
                </Text>
              </Animated.View>
            )}
          </ImageBackground>
        </TouchableOpacity>
      </Card>
    </View>
  );
};


const ReservationSystem = () => {
  const { t, i18n } = useTranslation();
  const { config } = useConfigContext();
  const { user, credits, updateCredits } = useUserContext();

  const [reservations, setReservations] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [markedDates, setMarkedDates] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalAttendees, setModalAttendees] = useState([]);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState({});
  const [slotDuration, setSlotDuration] = useState(null);
  const [cancelRefundThreshold, setCancelRefundThreshold] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to manage data fetching

  // Function to fetch reservations from API
  const fetchUserReservations = async () => {
    try {
      const response = await getOrganizedReservationsByDateAndTime(); // Ensure this function is correctly imported
      const fetchedReservations = response.data;

      // Validate fetchedReservations
      if (!fetchedReservations || typeof fetchedReservations !== "object") {
        console.warn(
          "Fetched reservations data is invalid:",
          fetchedReservations
        );
        setReservations({});
        setMarkedDates({});
        return;
      }

      // Sanitize attendees to include only id and name
      const sanitizedReservations = Object.keys(fetchedReservations).reduce(
        (acc, date) => {
          acc[date] = Object.keys(fetchedReservations[date]).reduce(
            (timeAcc, time) => {
              const reservation = fetchedReservations[date][time];
              const sanitizedAttendees = reservation.attendees.map(
                (attendee) => ({
                  id: attendee.id,
                  name: attendee.name,
                })
              );
              timeAcc[time] = {
                ...reservation,
                attendees: sanitizedAttendees,
              };
              return timeAcc;
            },
            {}
          );
          return acc;
        },
        {}
      );

      setReservations(sanitizedReservations);
      console.log("Fetched Reservations: ", sanitizedReservations);

      const marked = Object.keys(sanitizedReservations).reduce((acc, date) => {
        acc[date] = { marked: true, dots: [{ color: "#00adf5" }] };
        return acc;
      }, {});
      setMarkedDates(marked);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      Alert.alert(
        t("myReservationsScreen.error"),
        t("myReservationsScreen.errorFetchingReservations")
      );
    }
  };

  // Load slotDuration and cancelRefundThreshold from config
  useEffect(() => {
    if (config && config.reservations) {
      setSlotDuration(config.reservations["timeslots-duration"]);
      setCancelRefundThreshold(
        config.reservations["cancelation-refund-threshold-time"]
      );
    }
  }, [config]);

  // Fetch reservations when component mounts
  useEffect(() => {
    if (!user) return; // Prevent fetching if user is null
    fetchUserReservations();
  }, []);

  // Set loading to false once cancelRefundThreshold and reservations are loaded
  useEffect(() => {
    if (
      cancelRefundThreshold !== null &&
      Object.keys(reservations).length > 0
    ) {
      setLoading(false);
    }
  }, [cancelRefundThreshold, reservations]);

  // Helper function to check if the user is already booked in the reservation
  const isUserReserved = (attendees) => {
    return attendees.some((attendee) => attendee.id === user.id);
  };

  // Function to handle booking a reservation
  const bookReservation = async (date, time, reservation) => {
    try {
      await bookTimeSlot(reservation.id);

      setReservations((prevReservations) => {
        const currentAttendees = prevReservations[date][time].attendees;
        const userAlreadyAttending = currentAttendees.some(
          (attendee) => attendee.id === user.id
        );

        // Define a sanitized user object with only id and name
        const sanitizedUser = { id: user.id, name: user.username };

        return {
          ...prevReservations,
          [date]: {
            ...prevReservations[date],
            [time]: {
              ...prevReservations[date][time],
              isReserved: true,
              attendees: userAlreadyAttending
                ? currentAttendees
                : [...currentAttendees, sanitizedUser],
            },
          },
        };
      });

      updateCredits(-1); // Deduct one credit
      Alert.alert(
        t("BookingScreen.title"),
        t("BookingScreen.confirmBookingSuccess")
      );
    } catch (error) {
      console.error("Failed to book reservation:", error);
      Alert.alert(t("BookingScreen.error"), t("BookingScreen.bookingFailed"));
    }
  };

  // Function to handle canceling a reservation
  const cancelReservation = async (date, time, reservation) => {
    try {
      await cancelUserReservation(reservation.id);

      // Update the reservation's isReserved status and remove the user from attendees
      setReservations((prevReservations) => ({
        ...prevReservations,
        [date]: {
          ...prevReservations[date],
          [time]: {
            ...prevReservations[date][time],
            isReserved: false,
            attendees: prevReservations[date][time].attendees.filter(
              (attendee) => attendee.id !== user.id
            ),
          },
        },
      }));

      const now = moment();
      const reservationDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");
      const durationHours = moment
        .duration(cancelRefundThreshold, "HH:mm:ss")
        .asHours();
      const timeDifference = reservationDateTime.diff(now, "hours", true);

      if (timeDifference > durationHours) {
        // Eligible for credit refund
        updateCredits(1); // Add one credit
        Alert.alert(
          t("BookingScreen.title"),
          t("BookingScreen.cancelSuccessWithRefund")
        );
      } else {
        // Not eligible for credit refund
        Alert.alert(
          t("BookingScreen.title"),
          t("BookingScreen.cancelSuccessNoRefund")
        );
      }
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
      Alert.alert(
        t("BookingScreen.error"),
        t("BookingScreen.cancellationFailed")
      );
    }
  };

  // Function to handle toggling a reservation with confirmation and pre-checks
  const handleToggleReservation = useCallback(
    (date, time) => {
      const reservation = reservations[date]?.[time];
      if (!reservation) {
        console.error(`Reservation not found for date: ${date}, time: ${time}`);
        Alert.alert(
          t("myReservationsScreen.error"),
          t("myReservationsScreen.reservationNotFound")
        );
        return;
      }

      const userIsReserved = isUserReserved(reservation.attendees);
      // If user is already reserved, handle cancellation
      if (userIsReserved) {
        const now = moment();
        const reservationDateTime = moment(
          `${date} ${time}`,
          "YYYY-MM-DD HH:mm"
        );

        // Ensure cancelRefundThreshold is valid
        if (
          !cancelRefundThreshold ||
          typeof cancelRefundThreshold !== "string"
        ) {
          console.error(
            "Invalid cancelRefundThreshold:",
            cancelRefundThreshold
          );
          Alert.alert(
            t("myReservationsScreen.error"),
            t("myReservationsScreen.invalidRefundThreshold")
          );
          return;
        }

        // Parse cancelRefundThreshold as a duration in hours
        const durationHours = moment
          .duration(cancelRefundThreshold, "HH:mm:ss")
          .asHours();

        if (isNaN(durationHours)) {
          console.error("Parsed durationHours is NaN:", cancelRefundThreshold);
          Alert.alert(
            t("myReservationsScreen.error"),
            t("myReservationsScreen.invalidRefundThresholdFormat")
          );
          return;
        }

        const timeDifference = reservationDateTime.diff(now, "hours", true);

        let warningMessage = null;

        if (timeDifference <= durationHours) {
          warningMessage = t("BookingScreen.cancellationWarningNoRefund");
        }

        setConfirmationModalProps({
          title: t("BookingScreen.areYouSure"),
          message:
            warningMessage ||
            t("BookingScreen.confirmCancelBooking", {
              title: reservation.title,
              date: date,
              time: time,
            }),
          confirmText: t("BookingScreen.yesCancel"),
          cancelText: t("BookingScreen.cancel"),
          onConfirm: () => {
            cancelReservation(date, time, reservation);
            setConfirmationModalVisible(false);
          },
          onCancel: () => {
            setConfirmationModalVisible(false);
          },
        });
        setConfirmationModalVisible(true);
      } else {
        // User is not reserved, handle booking
        // Check if user has enough credits
        if (credits <= 0) {
          Alert.alert(
            t("BookingScreen.insufficientCreditsTitle"),
            t("BookingScreen.insufficientCredits")
          );
          return;
        }

        // Check if reservation is fully booked
        if (reservation.attendees.length >= reservation.max_participants) {
          Alert.alert(
            t("BookingScreen.fullyBookedTitle"),
            t("BookingScreen.fullyBooked")
          );
          return;
        }

        // All checks passed, proceed to booking confirmation
        setConfirmationModalProps({
          title: t("BookingScreen.areYouSure"),
          message: t("BookingScreen.confirmBooking", {
            title: reservation.title,
            date: date,
            time: time,
          }),
          confirmText: t("BookingScreen.yesBook"),
          cancelText: t("BookingScreen.cancel"),
          onConfirm: () => {
            bookReservation(date, time, reservation);
            setConfirmationModalVisible(false);
          },
          onCancel: () => {
            setConfirmationModalVisible(false);
          },
        });
        setConfirmationModalVisible(true);
      }
    },
    [reservations, t, cancelRefundThreshold, credits]
  );

  // Function to handle showing attendees modal
  const handleShowAttendees = (attendees) => {
    setModalAttendees(attendees);
    setModalVisible(true);
  };

  // Transform the reservations[selectedDate] object into an array for FlatList
  const reservationsForSelectedDate = selectedDate
    ? Object.entries(reservations[selectedDate] || {}).map(
        ([time, reservation]) => ({
          date: selectedDate,
          time,
          ...reservation,
        })
      )
    : [];

  // Render item for FlatList using ReservationItem component
  const renderItem = ({ item }) => (
    <ReservationItem
      item={item}
      handleToggleReservation={handleToggleReservation}
      handleShowAttendees={handleShowAttendees}
      t={t}
      userId={user.id}
    />
  );

  // If loading, show ActivityIndicator
  if (loading) {
    return (
      <View style={styles.container}>
        <AppBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00adf5" />
        </View>
      </View>
    );
  }


  if (!user) {
    return (
      <View style={styles.container}>
        <AppBar />
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>
            {t("BookingScreen.notLoggedIn")}
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')} // Replace 'Login' with your actual login route name
          >
            <Text style={styles.loginButtonText}>{t("BookingScreen.login")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar />
      <View style={styles.calendarContainer}>
        <CalendarProvider
          date={selectedDate}
          onDateChanged={(date) => {
            setSelectedDate(date);
          }}
          showTodayButton={false}
          minDate={moment().format("YYYY-MM-DD")} // Added minDate
          disabledDates={(date) =>
            moment(date).isBefore(moment().format("YYYY-MM-DD"))
          }
        >
          <WeekCalendar
            firstDay={1}
            minDate={moment().format("YYYY-MM-DD")} // Added minDate
            maxDate={moment().add(2, 'month').format("YYYY-MM-DD")}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...(markedDates[selectedDate] || {}),
                selected: true,
                selectedColor: "#00adf5",
              },
            }}
            renderArrow={(direction) => (
              <Icon
                name={direction === "left" ? "chevron-left" : "chevron-right"}
                size={24}
                color="#00adf5"
              />
            )}
            theme={{
              selectedDayBackgroundColor: "#00adf5",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#00adf5",
              arrowColor: "#00adf5",
              monthTextColor: "#00adf5",
              textMonthFontWeight: "bold",
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
            }}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            style={styles.calendar}
          />
        </CalendarProvider>
      </View>
      <View style={styles.reservationsContainer}>
        {reservationsForSelectedDate.length > 0 ? (
          <FlatList
            data={reservationsForSelectedDate}
            keyExtractor={(item) => `${item.date}-${item.time}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : (
          <View style={styles.emptyDate}>
            <Text>{t("BookingScreen.noReservationsForThisDate")}</Text>
          </View>
        )}
      </View>

      {/* Modal for Attendees */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("BookingScreen.attendees")}</Text>
          <FlatList
            data={modalAttendees}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              // Ensure attendee properties are defined
              const { name = "Unnamed", avatarUrl } = item;
              return (
                <View style={styles.modalAttendeeContainer}>
                  <Avatar.Image
                    size={50}
                    source={avatarUrl ? { uri: avatarUrl } : defaultAvatar}
                    style={styles.modalAvatar}
                  />
                  <Text style={styles.modalAttendeeName}>{name}</Text>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
            accessibilityLabel="Close Attendees Modal"
          >
            <Text style={styles.closeButtonText}>
              {t("BookingScreen.close")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationModalVisible}
        onRequestClose={() => setConfirmationModalVisible(false)}
        {...confirmationModalProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    height: 80,
    overflow: "hidden",
  },
  calendar: {
    height: 80,
  },
  reservationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  reservationContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dateContainer: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  dateInnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  dateDay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555555",
    textAlign: "center",
    writingDirection: I18nManager.isRTL ? "rtl" : "ltr",
  },
  cardContainer: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
  },
  cardBackground: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  cardBackgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  details: {
    fontSize: 16,
    marginLeft: 4,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  trainer: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 8,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  emptyDate: {
    flex: 1,
    paddingTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalAttendeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalAvatar: {
    marginRight: 15,
    backgroundColor: "#007bff",
  },
  modalAttendeeName: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: "#00adf5",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  participantsList: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
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
  participantListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  participantAvatarLarge: {
    marginHorizontal: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullyBookedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "column",
  },
  fullyBookedText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default ReservationSystem;
