// ReservationDetailsModal.js
import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Card,
  Button,
  IconButton,
  Avatar,
  Dialog,
  Paragraph,
} from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import PropTypes from "prop-types";
import { theme } from "../../../../utils/theme";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const ReservationDetailsModal = ({
  visible,
  onDismiss,
  reservation,
  handleRemoveUser,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);
  const [isRemoveUserDialogVisible, setRemoveUserDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  if (!reservation) {
    console.warn("ReservationDetailsModal received undefined reservation.");
    return null; // Safeguard: Do not render if reservation is undefined
  }

  const renderParticipantItem = (participant, index) => {
    return (
      <View key={participant.id} style={styles.userRow}>
        <View style={styles.userInfo}>
          <Avatar.Text
            size={40}
            label={participant.username.charAt(0).toUpperCase()}
          />
          <Text style={styles.userName}>{participant.username}</Text>
        </View>
        <IconButton
          icon={() => (
            <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
          )}
          size={20}
          onPress={() => {
            setParticipantToRemove(participant);
            setDialogVisible(true); // Show confirmation dialog
          }}
          accessibilityLabel={`Remove ${participant.username}`}
        />
      </View>
    );
  };

  const onRemoveParticipant = () => {
    handleRemoveUser(participantToRemove); // Call the parent function to remove the participant
    setDialogVisible(false); // Dismiss the dialog after removal
  };

  const hideRemoveUserDialog = () => {
    setRemoveUserDialogVisible(false);
    setSelectedUser(null);
  };

  const showRemoveUserDialog = () => {
    setSelectedUser(participantToRemove.username);
    setRemoveUserDialogVisible(true);
  };

  const handleConfirmRemoveUser = () => {
    console.log("hii")
  };

    <Portal>
      <Dialog
        visible={isRemoveUserDialogVisible}
        onDismiss={hideRemoveUserDialog}
      >
        <Dialog.Title>Confirm Removal</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            Are you sure you want to remove {selectedUser?.username} from
            this reservation?
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideRemoveUserDialog}>No</Button>
          <Button onPress={handleConfirmRemoveUser}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalTitle}>Reservation Details</Text>
            <Card style={styles.detailCard}>
              <Card.Content>
                {/* Date Row */}
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.detailText}>
                    {moment(reservation.date, "YYYY-MM-DD").format("MM/DD/YYYY")}
                  </Text>
                </View>
                {/* Time Row (Reintroduced) */}
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="access-time"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.detailText}>
                    {moment(reservation.time, "HH:mm").format("hh:mm A")}
                  </Text>
                </View>
                {/* People # Row */}
                <View style={styles.detailRow}>
                  <MaterialIcons name="people" size={24} color={theme.colors.primary} />
                  <Text style={styles.detailText}>
                    {reservation.participants.length} People
                  </Text>
                </View>
                {/* Duration Row */}
                <View style={styles.detailRow}>
                  <MaterialIcons name="timer" size={24} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{reservation.duration}</Text>
                </View>
              </Card.Content>
            </Card>
            <Text style={styles.modalSubtitle}>Participants</Text>
            <Card style={styles.userListCard}>
              <Card.Content>
                {reservation.participants.length > 0 ? (
                  reservation.participants.map((participant, index) =>
                    renderParticipantItem(participant, index)
                  )
                ) : (
                  <Text style={styles.modalText}>
                    No participants in this reservation.
                  </Text>
                )}
              </Card.Content>
            </Card>
          </ScrollView>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.closeButton}
            icon={() => (
              <MaterialCommunityIcons name="close" size={20} color="currentColor" />
            )}
          >
            Close
          </Button>
        </View>
      </Modal>

      {/* Confirmation Dialog for Removing a Participant */}
      <Dialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
      >
        <Dialog.Title>Confirm Removal</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            Are you sure you want to remove {participantToRemove?.username} from this reservation?
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisible(false)}>No</Button>
          <Button onPress={() => onRemoveParticipant()}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

ReservationDetailsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  reservation: PropTypes.shape({
    date: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    time: PropTypes.string.isRequired, // Ensure this prop is passed and implemented
    title: PropTypes.string.isRequired,
    trainer: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  handleRemoveUser: PropTypes.func.isRequired, // Ensure this prop is passed and implemented
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.8,
    width: SCREEN_WIDTH * 0.9,
    elevation: 5,
    // Centering styles
    alignSelf: "center",
    justifyContent: "center",
  },
  modalContent: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.colors.text, // Assuming you want to use theme's text color
    textAlign: "center", // Center the title text
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: theme.colors.text, // Use theme's text color for consistency
    textAlign: "center", // Center the subtitle text
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: theme.colors.placeholder,
    textAlign: "center", // Center the no data text
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 25,
    backgroundColor: theme.colors.primary, // Use theme's primary color
    alignSelf: "center", // Center the close button
    width: "50%", // Optional: Adjust width for better appearance
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 10,
  },
  detailCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: theme.colors.surface, // Use theme's surface color
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: theme.colors.text,
  },
  userListCard: {
    borderRadius: 10,
    backgroundColor: theme.colors.surface, // Use theme's surface color
  },
});

export default ReservationDetailsModal;
