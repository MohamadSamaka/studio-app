import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Modal,
  Portal,
  Button,
  TextInput,
  Title,
  Text,
  useTheme,
  

  Card,
  Paragraph,
  Snackbar,
  IconButton,
} from "react-native-paper";
import {
  DatePickerModal,
  TimePickerModal,
  enGB,
  registerTranslation,
} from "react-native-paper-dates";
import moment from "moment";
import DropDownPicker from "react-native-dropdown-picker";
import { getTrainers } from "../../../../utils/axios";

registerTranslation("en", enGB);

const AvailableReservationsModal = ({
  visible,
  onDismiss,
  onAddReservation,
  maxUsersPerSlot,
  slotDuration,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    modalContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      margin: 20,
      borderRadius: 10,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: "center",
      color: theme.colors.primary,
    },
    input: {
      marginBottom: 15,
      backgroundColor: theme.colors.surface,
    },
    dropdownContainer: {
      marginBottom: 15,
      zIndex: 1000,
    },
    dropdown: {
      borderColor: theme.colors.primary,
    },
    dropdownList: {
      borderColor: theme.colors.primary,
    },
    loaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    loadingText: {
      marginLeft: 10,
      color: theme.colors.text,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
    },
    button: {
      width: "40%",
    },
    errorText: {
      color: theme.colors.error,
      marginTop: 5,
      marginLeft: 5,
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    date: null,
    start_time: null,
    duration: null,
    max_participants: `${maxUsersPerSlot}`,
    trainer_id: null,
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [durationPickerVisible, setDurationPickerVisible] = useState(false);

  // State for Trainer Dropdown
  const [openTrainer, setOpenTrainer] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [trainerError, setTrainerError] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch Trainers when Modal becomes visible
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

  const handleSubmit = () => {
    const submissionData = {
      ...formData,
      date: formData.date ? moment(formData.date).format("YYYY-MM-DD") : null,
      start_time: formData.start_time
        ? moment(formData.start_time).format("HH:mm:ss").toString()
        : null,
      duration: formData.duration
        ? moment(formData.duration).format("HH:mm:ss").toString()
        : null,
      max_participants: parseInt(formData.max_participants, 10),
    };
    onAddReservation(submissionData);
    onDismiss();
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.date &&
      formData.start_time &&
      formData.duration &&
      formData.max_participants &&
      parseInt(formData.max_participants, 10) > 0 &&
      formData.trainer_id
    );
  };

  // Handlers for Date and Time Picker Modals
  const onDateConfirm = ({ date }) => {
    setDatePickerVisible(false);
    if (date) {
      handleInputChange("date", date);
    }
  };

  const onStartTimeConfirm = ({ hours, minutes }) => {
    setStartTimePickerVisible(false);
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    handleInputChange("start_time", time);
  };

  const onDurationConfirm = ({ hours, minutes }) => {
    setDurationPickerVisible(false);
    const duration = new Date();
    duration.setHours(hours);
    duration.setMinutes(minutes);
    handleInputChange("duration", duration);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Title style={styles.modalTitle}>Create Available Reservation</Title>

          <TextInput
            label="Title"
            value={formData.title}
            onChangeText={(value) => handleInputChange("title", value)}
            style={styles.input}
          />

          {/* Date Input */}
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput
              label="Date"
              value={
                formData.date ? moment(formData.date).format("YYYY-MM-DD") : ""
              }
              editable={false}
              right={<TextInput.Icon name="calendar" />}
              style={styles.input}
            />
          </TouchableOpacity>

          {/* Start Time Input */}
          <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
            <TextInput
              label="Start Time"
              value={
                formData.start_time
                  ? moment(formData.start_time).format("HH:mm")
                  : ""
              }
              editable={false}
              right={<TextInput.Icon name="clock-outline" />}
              style={styles.input}
            />
          </TouchableOpacity>

          {/* Duration Input */}
          <TouchableOpacity onPress={() => setDurationPickerVisible(true)}>
            <TextInput
              label="Reservation Duration"
              value={
                formData.duration
                  ? moment(formData.duration).format("HH:mm")
                  : ""
              }
              editable={false}
              right={<TextInput.Icon name="clock-outline" />}
              style={styles.input}
            />
          </TouchableOpacity>

          <TextInput
            label="Max Participants"
            value={formData.max_participants}
            onChangeText={(value) =>
              handleInputChange("max_participants", value)
            }
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
                value={formData.trainer_id}
                items={trainers.map((trainer) => ({
                  label: trainer.username,
                  value: trainer.id,
                }))}
                setOpen={setOpenTrainer}
                setValue={(callback) =>
                  handleInputChange(
                    "trainer_id",
                    callback(formData.trainer_id)
                  )
                }
                placeholder="Select Trainer"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                listMode="SCROLLVIEW"
                searchable={true}
                searchPlaceholder="Search Trainers"
              />
            )}
          </View>

          {!trainerLoading && !trainerError && !formData.trainer_id && (
            <Text style={styles.errorText}>Please select a trainer.</Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!isFormValid()}
              style={styles.button}
            >
              Save
            </Button>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>
              Cancel
            </Button>
          </View>
        </ScrollView>

        {/* DatePickerModal */}
        <DatePickerModal
          locale="en"
          mode="single"
          visible={datePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          date={formData.date || new Date()}
          onConfirm={onDateConfirm}
        />

        {/* TimePickerModal for Start Time */}
        <TimePickerModal
          visible={startTimePickerVisible}
          onDismiss={() => setStartTimePickerVisible(false)}
          onConfirm={onStartTimeConfirm}
          hours={
            formData.start_time
              ? formData.start_time.getHours()
              : new Date().getHours()
          }
          minutes={
            formData.start_time
              ? formData.start_time.getMinutes()
              : new Date().getMinutes()
          }
          label="Select Start Time"
          use24HourClock
        />

        {/* TimePickerModal for Duration */}
        <TimePickerModal
          visible={durationPickerVisible}
          onDismiss={() => setDurationPickerVisible(false)}
          onConfirm={onDurationConfirm}
          hours={
            formData.duration
              ? formData.duration.getHours()
              : new Date().getHours()
          }
          minutes={
            formData.duration
              ? formData.duration.getMinutes()
              : new Date().getMinutes()
          }
          label="Select Duration"
          use24HourClock
        />
      </Modal>
    </Portal>
  );
};

export default AvailableReservationsModal;
