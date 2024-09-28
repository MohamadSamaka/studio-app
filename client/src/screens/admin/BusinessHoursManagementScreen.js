import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import AppBar from '../../components/common/AppBar';
import { fetchBusinessHours, saveBusinessHoursChanges } from '../../utils/api';
import { validateChanges } from '../../utils/validationUtils';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import BusinessDayCard from '../../components/admin/cms/BusinessHours/BusinessDayCard'
import { TimePickerModal } from 'react-native-paper-dates';

import { enGB, registerTranslation } from 'react-native-paper-dates'
import moment from 'moment'; // Import moment-timezone

const customEnLocale = {
  ...enGB,
  translations: {
    hour: 'Hour',
    minute: 'Minute',
    am: 'AM',
    pm: 'PM',
    ok: 'OK',
    cancel: 'Cancel',
  },
};


registerTranslation('en', customEnLocale);

const BusinessHoursManagementScreen = () => {
  const [businessHours, setBusinessHours] = useState({});
  const [initialBusinessHours, setInitialBusinessHours] = useState({});
  const [expandedDay, setExpandedDay] = useState(null);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [changedBusinessHours, setChangedBusinessHours] = useState({});
  const [selectedBreakIndex, setSelectedBreakIndex] = useState(null);
  const [selectedBreakField, setSelectedBreakField] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimeInput, setSelectedTimeInput] = useState({
    hours: moment().hours(),
    minutes: moment().minutes()
  })


  // Fetch business hours when component mounts
  useEffect(() => {
    fetchBusinessHoursData();
  }, []);

  const fetchBusinessHoursData = async () => {
    try {
      const { businessHours, initialBusinessHours } = await fetchBusinessHours();
      setBusinessHours(businessHours);
      setInitialBusinessHours(initialBusinessHours);
    } catch (error) {
      console.error('Error fetching business hours:', error);
    }
  };

  const handleToggle = (day) => {
    const wasClosed = !businessHours[day].open;
    const updatedBusinessHours = {
      ...businessHours,
      [day]: { ...businessHours[day], open: !businessHours[day].open },
    };

    setBusinessHours(updatedBusinessHours);

    setChangedBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...updatedBusinessHours[day],
        wasPreviouslyClosed: wasClosed,
      },
    }));
  };


  const handleSaveChanges = async () => {
    if (!validateChanges(changedBusinessHours)) return;
    // if (!validateChanges(changedBusinessHours, validateBreakWithinBusinessHours)) return;
    try {
      await saveBusinessHoursChanges(changedBusinessHours, initialBusinessHours);
      Alert.alert('Success', 'Business hours saved successfully.');
      setChangedBusinessHours({});
      fetchBusinessHoursData(); // Refresh after save
    } catch (error) {
      console.error('Error saving business hours:', error);
      Alert.alert('Error', 'An error occurred while saving business hours.');
    }
  };

  const handleResetDay = (day) => {
    setBusinessHours((prevState) => ({
      ...prevState,
      [day]: initialBusinessHours[day],
    }));
    setChangedBusinessHours((prevState) => {
      const { [day]: _, ...rest } = prevState; // Remove this day from changed state
      return rest;
    });
  };

  const handleTimeChange = (timeString) => {
    const time = moment(timeString, 'HH:mm:ss');
    setSelectedTimeInput({
      hours: time.hours(),
      minutes: time.minutes()
    });
  };

  const handleAddBreak = (day) => {
    // moment.tz.setDefault('Asia/Jerusalem');
    const newBreak = { start_time: "", end_time: "", business_hour_id: businessHours[day].id};
    // const newBreak = { start_time: "", end_time: moment().format('HH:mm') };
    const updatedBreaks = [...businessHours[day].breaks, newBreak];
    const updatedBusinessHours = {
      ...businessHours,
      [day]: { ...businessHours[day], breaks: updatedBreaks},
    };
    console.log("updatedBreaks: ",JSON.stringify(updatedBusinessHours, null, 2))
    console.log("businessHours[day]: ", businessHours[day])

    setBusinessHours(updatedBusinessHours);
    setChangedBusinessHours({
      ...changedBusinessHours,
      [day]: updatedBusinessHours[day],
    });
  };

  const showTimePicker = (day, time, index, field) => {
    setSelectedDay(day);
    handleTimeChange(time);
    setSelectedBreakIndex(index);
    setSelectedBreakField(field);
    setTimePickerVisibility(true);
  };
  

  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleBreakTimeChange = (day, index, field, time) => {
    const updatedBreaks = businessHours[day].breaks.map((b, i) =>
      i === index ? { ...b, [field]: time } : b
    );
    const updatedBusinessHours = {
      ...businessHours,
      [day]: { ...businessHours[day], breaks: updatedBreaks },
    };
    setBusinessHours(updatedBusinessHours);
    setChangedBusinessHours({
      ...changedBusinessHours,
      [day]: updatedBusinessHours[day],
    });
  };

  const handleConfirm = ({ hours, minutes }) => {
    // Format the hours and minutes into HH:MM:SS format
    const formattedTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:00`;
    if (selectedBreakIndex === null) {
      const updatedBusinessHours = {
        ...businessHours,
        [selectedDay]: { ...businessHours[selectedDay], [selectedBreakField]: formattedTime },
      };
      setBusinessHours(updatedBusinessHours);
      setChangedBusinessHours({
        ...changedBusinessHours,
        [selectedDay]: updatedBusinessHours[selectedDay],
      });
    } else {
      handleBreakTimeChange(selectedDay, selectedBreakIndex, selectedBreakField, formattedTime);
    }
    hideTimePicker(); // Close the picker after confirming
  };
  

  const handleRemoveBreak = (day, index) => {
    const updatedBreaks = businessHours[day].breaks.filter((_, i) => i !== index);
    const updatedBusinessHours = {
      ...businessHours,
      [day]: { ...businessHours[day], breaks: updatedBreaks },
    };
    setBusinessHours(updatedBusinessHours);
    setChangedBusinessHours({
      ...changedBusinessHours,
      [day]: updatedBusinessHours[day],
    });
  };

  return (
    <View style={styles.container}>
      {/* <AppBar title="Business Hours" /> */}
      <ScrollView contentContainerStyle={styles.dayCardContainer}>
        {Object.keys(businessHours).map((day) => (
          <BusinessDayCard
            key={day}
            day={day}
            data={businessHours[day]}
            initialData={initialBusinessHours[day]}
            expandedDay={expandedDay}
            setExpandedDay={setExpandedDay}
            // setSelectedTimeInput={setSelectedTimeInput}
            handleToggle={handleToggle}
            handleResetDay={handleResetDay}
            handleRemoveBreak={handleRemoveBreak}
            handleAddBreak={handleAddBreak}
            showTimePicker={showTimePicker}
          />
        ))}
      </ScrollView>
      <Button mode="contained" onPress={handleSaveChanges} style={styles.saveChangesButton}>
        Save Changes
      </Button>
      {/* <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideTimePicker}
      /> */}
      <TimePickerModal
        minutes={selectedTimeInput.minutes | "00"}
        hours={selectedTimeInput.hours | "00"}
        visible={isTimePickerVisible}
        onDismiss={hideTimePicker}
        onConfirm={handleConfirm}
        label="Select time"
        cancelLabel="Cancel"
        confirmLabel="Ok"
        animationType="fade"
        locale="en" // Specify the locale here
        use24HourClock // Enable 24-hour time format
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  dayCardContainer: {
    padding: 10,
  },
  saveChangesButton: {
    margin: 20,
    backgroundColor: '#4a90e2',
  },
});

export default BusinessHoursManagementScreen;