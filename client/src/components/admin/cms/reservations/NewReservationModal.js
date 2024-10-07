// import React, { useState } from "react";
// import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
// import {
//   Modal,
//   Portal,
//   Button,
//   TextInput,
//   Title,
//   Text,
// } from "react-native-paper";
// import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
// import moment from "moment";
// import { enGB, registerTranslation } from "react-native-paper-dates";

// registerTranslation("en", enGB);

// // Register the Polish locale (keeping this as it might be needed)
// registerTranslation("pl", {
//   save: "Save",
//   selectSingle: "Select date",
//   selectMultiple: "Select dates",
//   selectRange: "Select period",
//   notAccordingToDateFormat: (inputFormat) =>
//     `Date format must be ${inputFormat}`,
//   mustBeHigherThan: (date) => `Must be later than ${date}`,
//   mustBeLowerThan: (date) => `Must be earlier than ${date}`,
//   mustBeBetween: (startDate, endDate) =>
//     `Must be between ${startDate} - ${endDate}`,
//   dateIsDisabled: "Day is not allowed",
//   previous: "Previous",
//   next: "Next",
//   typeInDate: "Type in date",
//   pickDateFromCalendar: "Pick date from calendar",
//   close: "Close",
// });

// const AvailableReservationsModal = ({
//   visible,
//   onDismiss,
//   onAddReservation,
//   maxUsersPerSlot,
//   slotDuration
// }) => {
//   const [formData, setFormData] = useState({
//     title: "",
//     date: null,
//     start_time: null,
//     duration: null,
//     max_participants: `${maxUsersPerSlot}`,
//   });

//   const [datePickerVisible, setDatePickerVisible] = useState(false);
//   const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
//   const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

//   const handleInputChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // const handleDateConfirm = (date) => {
//   //   setFormData(prev => ({ ...prev, date }));
//   //   setDatePickerVisible(false);
//   // };

//   const handleDateConfirm = ({ date }) => {
//     if (date) {
//       setFormData((prev) => ({ ...prev, date: moment(date).toDate() }));
//       setDatePickerVisible(false);
//     }
//   };

//   const handleStartTimeConfirm = (time) => {
//     const [hours, minutes, seconds] = slotDuration.split(':').map(Number);
//     setFormData((prev) => ({ ...prev, start_time: time }));
//     setFormData((prev) => ({
//       ...prev,
//       duration: {
//         hours: hours, 
//         minutes: minutes,
//       },
//     }));
//     setStartTimePickerVisible(false);
//   };

//   const handleEndTimeConfirm = (time) => {
//     setFormData((prev) => ({ ...prev, duration: time }));
//     setEndTimePickerVisible(false);
//   };

//   const handleSubmit = () => {
//     const submissionData = {
//       ...formData,
//       date: formData.date ? moment(formData.date).format("YYYY-MM-DD") : null,
//       start_time: formData.start_time
//         ? moment(formData.start_time).format("HH:mm:ss").toString()
//         : null,
//       duration: formData.duration
//         ? moment(formData.duration).format("HH:mm:ss").toString()
//         : null,
//       max_participants: parseInt(formData.max_participants, 10),
//     };
//     onAddReservation(submissionData);
//     onDismiss();
//   };

//   const isFormValid = () => {
//     return (
//       formData.title &&
//       formData.date &&
//       formData.start_time &&
//       formData.duration &&
//       formData.max_participants &&
//       parseInt(formData.max_participants, 10) > 0
//     );
//   };

//   return (
//     <Portal>
//       <Modal
//         visible={visible}
//         onDismiss={onDismiss}
//         contentContainerStyle={styles.modalContainer}
//       >
//         <ScrollView>
//           <Title style={styles.modalTitle}>
//             {/* {initialData.id
//               ? "Edit Available Reservation"
//               : "Create Available Reservation"} */}
//             Create Available Reservation
//           </Title>

//           <TextInput
//             label="Title"
//             value={formData.title}
//             onChangeText={(value) => handleInputChange("title", value)}
//             style={styles.input}
//           />

//           <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
//             <TextInput
//               label="Date"
//               value={
//                 formData.date ? moment(formData.date).format("YYYY-MM-DD") : ""
//               }
//               editable={false}
//               right={<TextInput.Icon icon="calendar" />}
//               style={styles.input}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
//             <TextInput
//               label="Start Time"
//               value={
//                 formData.start_time
//                   ? moment(formData.start_time).format("HH:mm")
//                   : ""
//               }
//               editable={false}
//               right={<TextInput.Icon icon="clock-outline" />}
//               style={styles.input}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setEndTimePickerVisible(true)}>
//             <TextInput
//               label="Reservation Duration"
//               value={
//                 formData.duration
//                   ? moment(formData.duration).format("HH:mm")
//                   : ""
//               }
//               editable={false}
//               right={<TextInput.Icon icon="clock-outline" />}
//               style={styles.input}
//             />
//           </TouchableOpacity>

//           <TextInput
//             label="Max Participants"
//             value={formData.max_participants}
//             onChangeText={(value) =>
//               handleInputChange("max_participants", value)
//             }
//             keyboardType="numeric"
//             style={styles.input}
//           />

//           <View style={styles.buttonContainer}>
//             <Button
//               mode="contained"
//               onPress={handleSubmit}
//               disabled={!isFormValid()}
//               style={styles.button}
//             >
//               Save
//             </Button>
//             <Button mode="outlined" onPress={onDismiss} style={styles.button}>
//               Cancel
//             </Button>
//           </View>
//         </ScrollView>

//         <DatePickerModal
//           locale="en"
//           mode="single"
//           visible={datePickerVisible}
//           onDismiss={() => setDatePickerVisible(false)}
//           date={formData.date}
//           onConfirm={handleDateConfirm}
//         />

//         <TimePickerModal
//           visible={startTimePickerVisible}
//           onDismiss={() => setStartTimePickerVisible(false)}
//           onConfirm={handleStartTimeConfirm}
//           hours={formData.start_time ? moment(formData.start_time).hours() : 12}
//           minutes={
//             formData.start_time ? moment(formData.start_time).minutes() : 0
//           }
//         />

//         <TimePickerModal
//           visible={endTimePickerVisible}
//           onDismiss={() => setEndTimePickerVisible(false)}
//           onConfirm={handleEndTimeConfirm}
//           hours={formData.duration ? moment(formData.duration).hours() : ""}
//           minutes={formData.duration ? moment(formData.duration).minutes() : ""}
//         />
//       </Modal>
//     </Portal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     backgroundColor: "white",
//     padding: 20,
//     margin: 20,
//     borderRadius: 10,
//     maxHeight: "80%",
//   },
//   modalTitle: {
//     fontSize: 24,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     marginBottom: 15,
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 20,
//   },
//   button: {
//     width: "40%",
//   },
// });

// export default AvailableReservationsModal;

// AvailableReservationsModal.js

import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  Modal,
  Portal,
  Button,
  TextInput,
  Title,
  Text,
} from "react-native-paper";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import moment from "moment";
import { enGB, registerTranslation } from "react-native-paper-dates";
import DropDownPicker from "react-native-dropdown-picker"; // Import DropDownPicker
import { getTrainers } from "../../../../utils/axios"; // Import getTrainers from your axios utils

registerTranslation("en", enGB);

// Register the Polish locale (keeping this as it might be needed)
registerTranslation("pl", {
  save: "Save",
  selectSingle: "Select date",
  selectMultiple: "Select dates",
  selectRange: "Select period",
  notAccordingToDateFormat: (inputFormat) =>
    `Date format must be ${inputFormat}`,
  mustBeHigherThan: (date) => `Must be later than ${date}`,
  mustBeLowerThan: (date) => `Must be earlier than ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Must be between ${startDate} - ${endDate}`,
  dateIsDisabled: "Day is not allowed",
  previous: "Previous",
  next: "Next",
  typeInDate: "Type in date",
  pickDateFromCalendar: "Pick date from calendar",
  close: "Close",
});

const AvailableReservationsModal = ({
  visible,
  onDismiss,
  onAddReservation,
  maxUsersPerSlot,
  slotDuration
}) => {
  const [formData, setFormData] = useState({
    title: "",
    date: null,
    start_time: null,
    duration: null,
    max_participants: `${maxUsersPerSlot}`,
    trainer_id: null, // **Added**: Trainer ID
  });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // **State for Trainer Dropdown**
  const [openTrainer, setOpenTrainer] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [trainerError, setTrainerError] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // **Fetch Trainers when Modal becomes visible**
  useEffect(() => {
    if (visible) {
      fetchTrainers();
    }
  }, [visible]);

  const fetchTrainers = async () => {
    setTrainerLoading(true);
    setTrainerError(null);
    try {
      const response = await getTrainers(); // Adjust based on your API
      // Assuming response.data is an array of trainers with 'id' and 'username'
      setTrainers(response.data);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      setTrainerError("Failed to load trainers.");
    } finally {
      setTrainerLoading(false);
    }
  };

  const handleDateConfirm = ({ date }) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date: moment(date).toDate() }));
      setDatePickerVisible(false);
    }
  };

  const handleStartTimeConfirm = (time) => {
    const [hours, minutes, seconds] = slotDuration.split(':').map(Number);
    setFormData((prev) => ({ ...prev, start_time: time }));
    setFormData((prev) => ({
      ...prev,
      duration: {
        hours: hours, 
        minutes: minutes,
      },
    }));
    setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = (time) => {
    setFormData((prev) => ({ ...prev, duration: time }));
    setEndTimePickerVisible(false);
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
      formData.trainer_id // **Ensure Trainer is Selected**
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Title style={styles.modalTitle}>
            Create Available Reservation
          </Title>

          <TextInput
            label="Title"
            value={formData.title}
            onChangeText={(value) => handleInputChange("title", value)}
            style={styles.input}
          />

          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <TextInput
              label="Date"
              value={
                formData.date ? moment(formData.date).format("YYYY-MM-DD") : ""
              }
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
            <TextInput
              label="Start Time"
              value={
                formData.start_time
                  ? moment(formData.start_time).format("HH:mm")
                  : ""
              }
              editable={false}
              right={<TextInput.Icon icon="clock-outline" />}
              style={styles.input}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEndTimePickerVisible(true)}>
            <TextInput
              label="Reservation Duration"
              value={
                formData.duration
                  ? moment(formData.duration).format("HH:mm")
                  : ""
              }
              editable={false}
              right={<TextInput.Icon icon="clock-outline" />}
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

          {/* **Trainer Dropdown Picker** */}
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
                  label: trainer.username, // Assuming trainer has 'username' field
                  value: trainer.id,
                }))}
                setOpen={setOpenTrainer}
                setValue={(callback) =>
                  handleInputChange("trainer_id", callback(formData.trainer_id))
                }
                placeholder="Select Trainer"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                listMode="SCROLLVIEW" // You can change the list mode as needed
                // Optional: Customize searchable
                searchable={true}
                searchPlaceholder="Search Trainers"
              />
            )}
          </View>

          {/* **Validation Error for Trainer Selection** */}
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

        <DatePickerModal
          locale="en"
          mode="single"
          visible={datePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          date={formData.date}
          onConfirm={handleDateConfirm}
        />

        <TimePickerModal
          visible={startTimePickerVisible}
          onDismiss={() => setStartTimePickerVisible(false)}
          onConfirm={handleStartTimeConfirm}
          hours={formData.start_time ? moment(formData.start_time).hours() : 12}
          minutes={
            formData.start_time ? moment(formData.start_time).minutes() : 0
          }
        />

        <TimePickerModal
          visible={endTimePickerVisible}
          onDismiss={() => setEndTimePickerVisible(false)}
          onConfirm={handleEndTimeConfirm}
          hours={formData.duration ? moment(formData.duration).hours() : ""}
          minutes={formData.duration ? moment(formData.duration).minutes() : ""}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 1000, // Ensure dropdown appears above other elements
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
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: "#555",
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
    color: "red",
    marginTop: 5,
    marginLeft: 5,
  },
});

export default AvailableReservationsModal;
