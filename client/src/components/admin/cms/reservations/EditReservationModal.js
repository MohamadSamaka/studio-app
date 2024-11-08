// EditReservationModal.js

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Modal,
  Text,
  TextInput,
  Button,
  Portal,
  Menu,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import moment from "moment";
import DropDownPicker from "react-native-dropdown-picker";
import { getTrainers } from "../../../../utils/axios"; // Adjust the import path as necessary

const EditReservationModal = ({
  visible,
  onDismiss,
  reservation,
  onUpdateReservation,
}) => {
  const theme = useTheme();

  const [title, setTitle] = useState("Advanced");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(""); // Default duration
  const [maxParticipants, setMaxParticipants] = useState("6"); // as string
  const [trainerId, setTrainerId] = useState(null); // Added trainerId state
  const [loading, setLoading] = useState(false);

  // Menu state for title picker
  const [titleMenuVisible, setTitleMenuVisible] = useState(false);

  // Date and Time pickers visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Trainer dropdown state
  const [trainers, setTrainers] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [trainerError, setTrainerError] = useState(null);
  const [openTrainer, setOpenTrainer] = useState(false);

  useEffect(() => {
    if (reservation) {
      setTitle(reservation.title || "Advanced");
      setDate(reservation.date || "");

      // Use moment.js to format time with seconds
      let timeWithSeconds = reservation.time
        ? moment(reservation.time, ["HH:mm", "HH:mm:ss"]).format("HH:mm:ss")
        : "";
      setTime(timeWithSeconds);

      let durationWithSeconds = reservation.duration
        ? moment(reservation.duration, ["HH:mm", "HH:mm:ss"]).format("HH:mm:ss")
        : "01:00:00";
      setDuration(durationWithSeconds);

      setMaxParticipants(
        reservation.max_participants
          ? reservation.max_participants.toString()
          : "6"
      );

      // Set trainerId after trainers are fetched
      if (trainers.length > 0) {
        initializeTrainerId();
      }
    }
  }, [reservation, trainers]);

  const initializeTrainerId = () => {
    if (reservation.Trainer && reservation.Trainer.id) {
      // If Trainer object has an id, use it
      setTrainerId(reservation.Trainer.id);
    } else if (reservation.Trainer && reservation.Trainer.username) {
      // If Trainer object has username, find the id from trainers array
      const trainer = trainers.find(
        (t) => t.username === reservation.Trainer.username
      );
      setTrainerId(trainer ? trainer.id : null);
    } else if (reservation.trainer_username) {
      // If reservation has trainer_username field, find the id
      const trainer = trainers.find(
        (t) => t.username === reservation.trainer_username
      );
      setTrainerId(trainer ? trainer.id : null);
    } else if (reservation.trainer_name) {
      // If reservation has trainer_name field, find the id
      const trainer = trainers.find(
        (t) => t.username === reservation.trainer_name
      );
      setTrainerId(trainer ? trainer.id : null);
    } else {
      setTrainerId(null);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchTrainers();
    }
  }, [visible]);

  const fetchTrainers = async () => {
    setTrainerLoading(true);
    setTrainerError(null);
    try {
      const response = await getTrainers();
      setTrainers(response.data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      setTrainerError("Failed to load trainers.");
    } finally {
      setTrainerLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updatedReservationData = {
        title,
        date,
        start_time: time,
        duration,
        max_participants: parseInt(maxParticipants, 10),
        trainer_id: trainerId,
      };
      console.log("Sent data: ", updatedReservationData);
      await onUpdateReservation(updatedReservationData);
    } catch (error) {
      console.error("Error updating reservation:", error);
      setSnackbarMessage("Failed to update reservation.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for date and time pickers
  const onDateConfirm = (params) => {
    setShowDatePicker(false);
    setDate(moment(params.date).format("YYYY-MM-DD"));
  };

  const onTimeConfirm = ({ hours, minutes }) => {
    setShowTimePicker(false);
    const selectedTime = moment()
      .hours(hours)
      .minutes(minutes)
      .seconds(0)
      .format("HH:mm:ss");
    setTime(selectedTime);
  };

  const onDurationConfirm = ({ hours, minutes }) => {
    setShowDurationPicker(false);
    const selectedDuration = moment()
      .hours(hours)
      .minutes(minutes)
      .seconds(0)
      .format("HH:mm:ss");
    setDuration(selectedDuration);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.modalTitle}>Edit Reservation</Text>

        {/* Title Picker */}
        <Menu
          visible={titleMenuVisible}
          onDismiss={() => setTitleMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setTitleMenuVisible(true)}>
              <TextInput
                label="Title"
                value={title}
                editable={false}
                right={<TextInput.Icon name="menu-down" />}
                style={styles.input}
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setTitle("Advanced");
              setTitleMenuVisible(false);
            }}
            title="Advanced"
          />
          <Menu.Item
            onPress={() => {
              setTitle("Beginner");
              setTitleMenuVisible(false);
            }}
            title="Beginner"
          />
        </Menu>

        {/* Date Picker */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            label="Date"
            value={date ? date : ""}
            editable={false}
            style={styles.input}
            right={<TextInput.Icon name="calendar" />}
          />
        </TouchableOpacity>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          date={date ? new Date(date) : new Date()}
          onConfirm={onDateConfirm}
          mode="single"
        />

        {/* Start Time Picker */}
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <TextInput
            label="Start Time"
            value={time ? moment(time, "HH:mm:ss").format("hh:mm A") : ""}
            editable={false}
            style={styles.input}
            right={<TextInput.Icon name="clock-outline" />}
          />
        </TouchableOpacity>

        {/* Time Picker Modal */}
        <TimePickerModal
          visible={showTimePicker}
          onDismiss={() => setShowTimePicker(false)}
          onConfirm={onTimeConfirm}
          hours={time ? moment(time, "HH:mm:ss").hours() : 0}
          minutes={time ? moment(time, "HH:mm:ss").minutes() : 0}
          label="Select Start Time"
          uppercase={false}
          cancelLabel="Cancel"
          confirmLabel="OK"
          animationType="fade"
        />

        {/* Duration Picker */}
        <TouchableOpacity onPress={() => setShowDurationPicker(true)}>
          <TextInput
            label="Duration"
            value={duration ? moment(duration, "HH:mm:ss").format("HH:mm") : ""}
            editable={false}
            style={styles.input}
            right={<TextInput.Icon name="clock-outline" />}
          />
        </TouchableOpacity>

        {/* Duration Picker Modal */}
        <TimePickerModal
          visible={showDurationPicker}
          onDismiss={() => setShowDurationPicker(false)}
          onConfirm={onDurationConfirm}
          hours={duration ? moment(duration, "HH:mm:ss").hours() : 0}
          minutes={duration ? moment(duration, "HH:mm:ss").minutes() : 0}
          label="Select Duration"
          uppercase={false}
          cancelLabel="Cancel"
          confirmLabel="OK"
          animationType="fade"
        />

        <TextInput
          label="Max Participants"
          value={maxParticipants}
          onChangeText={(text) => setMaxParticipants(text)}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Trainer Dropdown Picker */}
        <View style={styles.dropdownContainer}>
          {trainerLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Loading Trainers...</Text>
            </View>
          ) : trainerError ? (
            <Text style={styles.errorText}>{trainerError}</Text>
          ) : (
            <DropDownPicker
              open={openTrainer}
              value={trainerId}
              items={trainers.map((trainer) => ({
                label: trainer.username,
                value: trainer.id,
              }))}
              setOpen={setOpenTrainer}
              setValue={setTrainerId}
              placeholder="Select Trainer"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              listMode="SCROLLVIEW"
              searchable={true}
              searchPlaceholder="Search Trainers"
            />
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Update Reservation
        </Button>
        <Button onPress={onDismiss} style={styles.button}>
          Cancel
        </Button>

        {/* Snackbar for errors */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbarError}
        >
          {snackbarMessage}
        </Snackbar>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  snackbarError: {
    backgroundColor: "red",
  },
  button: {
    marginTop: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 1000, // Important for DropDownPicker to render correctly
  },
  dropdown: {
    borderColor: "#ccc",
  },
  dropdownList: {
    borderColor: "#ccc",
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 10,
  },
  errorText: {
    color: "red",
  },
});

export default EditReservationModal;
