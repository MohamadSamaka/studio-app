import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
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
// TabView/TabBar/SceneMap come from 'react-native-tab-view'
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";

// If you have a custom theme or just inline styles, adjust accordingly
const theme = {
  colors: {
    primary: "#6200EE",
    text: "#000",
    surface: "#FFF",
    placeholder: "#999",
  },
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// ===============================
// Helper: Show one ghost log entry
// ===============================
const GhostLogEntry = ({ log }) => {
  // Choose an icon/color if user is punished
  const iconName = log.punished ? "alert-circle" : "check-circle";
  const iconColor = log.punished ? "#f44336" : "#4CAF50";

  return (
    <View style={styles.ghostLogRow}>
      <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      <Text style={styles.ghostLogText}>
        Canceled at {log.cancellationTime}{" "}
        {log.punished ? "(punished)" : "(not punished)"}
      </Text>
    </View>
  );
};

// ===============================
// Active Participants Tab
// ===============================
const ActiveParticipantsTab = ({ participants, onRemove }) => {
  // Filter only those with isCurrentParticipant = true
  const activeUsers = participants.filter((p) => p.isCurrentParticipant);

  return (
    <ScrollView style={styles.tabScroll}>
      <Card style={styles.userListCard}>
        <Card.Content>
          {activeUsers.length > 0 ? (
            activeUsers.map((participant) => (
              <View key={participant.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Avatar.Text
                    size={40}
                    label={
                      participant.username
                        ? participant.username.charAt(0).toUpperCase()
                        : "?"
                    }
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.userName}>{participant.username}</Text>
                    {/* If they have ghostLogs from previous cancellations but are now rejoined */}
                    {participant.ghostLogs?.length > 0 && (
                      <Text style={{ color: "#999", fontSize: 12 }}>
                        {participant.ghostLogs.length} past cancellation(s)
                      </Text>
                    )}
                  </View>
                </View>
                {/* Remove button for active participants */}
                <IconButton
                  icon={() => (
                    <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
                  )}
                  size={20}
                  onPress={() => onRemove(participant)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.modalText}>No active participants.</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// ===============================
// Ghost (canceled) Participants Tab
// ===============================
const GhostParticipantsTab = ({ participants }) => {
  // Filter out those that have ghostLogs or are simply isCurrentParticipant=false
  // Some users might have ghostLogs while also isCurrentParticipant=true if they rejoined,
  // so let's show them if they have ANY ghost logs
  const ghostUsers = participants.filter(
    (p) => p.ghostLogs && p.ghostLogs.length > 0
  );

  return (
    <ScrollView style={styles.tabScroll}>
      <Card style={styles.userListCard}>
        <Card.Content>
          {ghostUsers.length > 0 ? (
            ghostUsers.map((ghost) => (
              <View key={ghost.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Avatar.Text
                    size={40}
                    label={
                      ghost.username ? ghost.username.charAt(0).toUpperCase() : "?"
                    }
                    style={{ backgroundColor: "#FFC107" }} // color-coded avatar
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.userName}>{ghost.username}</Text>
                    {/* Show each ghost log entry */}
                    {ghost.ghostLogs.map((log, index) => (
                      <GhostLogEntry key={index} log={log} />
                    ))}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.modalText}>
              No ghost (canceled) participants.
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// ===============================
// Participants TabView
// ===============================
const ParticipantsTabView = ({ reservation, onRemoveParticipant }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: "active", title: "Active" },
    { key: "ghosts", title: "Ghosts" },
  ]);

  // We'll pass the entire array to both tabs, and let each tab filter as it sees fit
  const participants = reservation?.participants || [];

  // Scenes for each tab
  const renderScene = SceneMap({
    active: () => (
      <ActiveParticipantsTab
        participants={participants}
        onRemove={onRemoveParticipant}
      />
    ),
    ghosts: () => <GhostParticipantsTab participants={participants} />,
  });

  // Custom TabBar
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: "white" }}
      activeColor={theme.colors.primary}
      inactiveColor="#999"
    />
  );

  return (
    <View style={styles.tabViewContainer}>
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

// ===============================
// Main ReservationDetailsModal
// ===============================
const ReservationDetailsModal = ({
  visible,
  onDismiss,
  reservation,
  handleRemoveUser,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);

  if (!reservation) return null;

  const onRemoveParticipant = (participant) => {
    // Show confirmation dialog
    setParticipantToRemove(participant);
    setDialogVisible(true);
  };

  const confirmRemoveParticipant = () => {
    if (handleRemoveUser) handleRemoveUser(participantToRemove);
    setDialogVisible(false);
  };

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
                {/* Title Row */}
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="title"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.detailText}>
                    {reservation.title}
                  </Text>
                </View>
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
                {/* Time Row */}
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
                  <MaterialIcons
                    name="people"
                    size={24}
                    color={theme.colors.primary}
                  />
                  {console.log(reservation)}
                  <Text style={styles.detailText}>
                    {(reservation.participants || []).length} People
                  </Text>
                </View>
                {/* Duration Row */}
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="timer"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.detailText}>{reservation.duration}</Text>
                </View>
              </Card.Content>
            </Card>

            <Text style={styles.modalSubtitle}>Participants</Text>

            <ParticipantsTabView
              reservation={reservation}
              onRemoveParticipant={onRemoveParticipant}
            />
          </ScrollView>

          {/* Close button */}
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

      {/* Confirmation Dialog for Removing an Active Participant */}
      <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
        <Dialog.Title>Confirm Removal</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            Are you sure you want to remove {participantToRemove?.username} from
            this reservation?
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisible(false)}>No</Button>
          <Button onPress={confirmRemoveParticipant}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

// ===============================
// Styles
// ===============================
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.8,
    width: SCREEN_WIDTH * 0.9,
    elevation: 5,
    alignSelf: "center",
    justifyContent: "center",
  },
  modalContent: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
  },
  modalScroll: {
    // This scroll is for the entire modal, 
    // but each tab also has its own scroll
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.colors.text,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: theme.colors.text,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignSelf: "center",
    width: "50%",
  },
  detailCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
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
    marginLeft: 0,
  },
  tabScroll: {
    flexGrow: 0,
    maxHeight: 300, // adjust as needed
  },
  tabViewContainer: {
    height: 350, // or another suitable height for the tabs
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
    color: theme.colors.placeholder,
    textAlign: "center",
  },
  ghostLogRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  ghostLogText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
});

export default ReservationDetailsModal;
