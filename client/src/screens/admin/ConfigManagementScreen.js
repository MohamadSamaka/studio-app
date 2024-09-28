import React, { useState, useEffect, memo } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  Snackbar, 
  useTheme, 
  ActivityIndicator, 
  IconButton 
} from 'react-native-paper';
import AppBar from '../../components/common/AppBar';
import { getConfigs, updateConfig } from '../../utils/axios';
import { TimePickerModal } from 'react-native-paper-dates';
import { useConfigContext } from '../../contexts/ConfigContext';

// Memoized ConfigCard to prevent unnecessary re-renders
const ConfigCard = memo(({ title, description, children }) => (
  <Card style={styles.card} elevation={4}>
    <Card.Content>
      <View style={styles.cardHeader}>
        <Title style={styles.cardTitle}>{title}</Title>
        <IconButton 
          icon="information-outline" 
          size={20} 
          onPress={() => {}} // You can define a function to show more info
          style={styles.iconButton}
        />
      </View>
      <Paragraph style={styles.cardDescription}>{description}</Paragraph>
      {children}
    </Card.Content>
  </Card>
));

const ConfigManagementScreen = () => {
  const theme = useTheme();
  
  // State to hold configuration data
  const [config, setConfig] = useState({
    cancelationRefundThresholdTime: '',
    maxUsersPerReservation: '',
    timeslotsDuration: '',
  });

  // State to manage loading status
  const [loading, setLoading] = useState(false);

  // State to manage visibility of time pickers
  const [timePickerVisible, setTimePickerVisible] = useState({
    cancelationRefundThresholdTime: false,
    timeslotsDuration: false,
  });

  // State for Snackbar notifications
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success', // 'success', 'error', 'info'
  });

  // Fetch configuration on component mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Function to fetch configuration from the server
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await getConfigs();
      const data = response.data.reservations;
      setConfig({
        cancelationRefundThresholdTime: formatTime(data["cancelation-refund-threshold-time"]),
        maxUsersPerReservation: data["max-users-per-reservation"] !== undefined 
          ? data["max-users-per-reservation"].toString() 
          : '',
        timeslotsDuration: formatTime(data["timeslots-duration"]),
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      showSnackbar('Error fetching configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle saving the configuration
  const handleSave = async () => {
    // Input validation
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await updateConfig({
        "reservations": {
          "cancelation-refund-threshold-time": config.cancelationRefundThresholdTime,
          "max-users-per-reservation": parseInt(config.maxUsersPerReservation, 10),
          "timeslots-duration": config.timeslotsDuration,
        }
      });
      showSnackbar('Configuration updated successfully', 'success');
    } catch (error) {
      console.error('Error updating config:', error);
      showSnackbar('Failed to update configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to open the time picker
  const openTimePicker = (field) => {
    setTimePickerVisible({ ...timePickerVisible, [field]: true });
  };

  // Function to handle time selection from the picker
  const onConfirmTime = (field, time) => {
    const formattedTime = `${padZero(time.hours)}:${padZero(time.minutes)}`;
    setConfig({ ...config, [field]: formattedTime });
    setTimePickerVisible({ ...timePickerVisible, [field]: false });
  };

  // Utility to pad single digit numbers with a leading zero
  const padZero = (num) => num.toString().padStart(2, '0');

  // Function to format time strings to HH:MM
  const formatTime = (time) => {
    if (!time || typeof time !== 'string') {
      return '00:00'; // Default time
    }
    const [hours, minutes] = time.split(':').map(Number);
    const validHours = !isNaN(hours) && hours >= 0 && hours <= 24 ? padZero(hours) : '00';
    const validMinutes = !isNaN(minutes) && minutes >= 0 && minutes < 60 ? padZero(minutes) : '00';
    return `${validHours}:${validMinutes}`;
  };

  // Function to show Snackbar notifications
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // Function to hide Snackbar
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  // Function to validate input fields
  const validateInputs = () => {
    const { cancelationRefundThresholdTime, maxUsersPerReservation, timeslotsDuration } = config;
    const maxUsers = parseInt(maxUsersPerReservation, 10);

    if (!cancelationRefundThresholdTime.match(/^\d{2}:\d{2}$/)) {
      showSnackbar('Invalid format for Cancelation Refund Threshold Time. Use HH:MM.', 'error');
      return false;
    }

    if (isNaN(maxUsers) || maxUsers <= 0 || !Number.isInteger(maxUsers)) {
      showSnackbar('Max Users Per Reservation must be a positive whole number.', 'error');
      return false;
    }

    if (!timeslotsDuration.match(/^\d{2}:\d{2}$/)) {
      showSnackbar('Invalid format for Timeslots Duration. Use HH:MM.', 'error');
      return false;
    }

    // Additional check for hours <=24
    const [refundHours, refundMinutes] = cancelationRefundThresholdTime.split(':').map(Number);
    if (refundHours > 24 || (refundHours === 24 && refundMinutes !== 0)) {
      showSnackbar('Cancelation Refund Threshold Time cannot exceed 24:00.', 'error');
      return false;
    }

    const [slotHours, slotMinutes] = timeslotsDuration.split(':').map(Number);
    if (slotHours > 24 || (slotHours === 24 && slotMinutes !== 0)) {
      showSnackbar('Timeslots Duration cannot exceed 24:00.', 'error');
      return false;
    }

    return true;
  };

  return (
    <>
      <AppBar title="CRM Configurations" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Cancelation Refund Threshold Time */}
            <ConfigCard
              title="Cancelation Refund Threshold"
              description="Set the time limit for refund eligibility (24-hour format, HH:MM). Max 24:00."
            >
              <Button
                mode="outlined"
                icon="clock-outline"
                onPress={() => openTimePicker('cancelationRefundThresholdTime')}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {config.cancelationRefundThresholdTime || 'Set Time'}
              </Button>
              <TimePickerModal
                visible={timePickerVisible.cancelationRefundThresholdTime}
                onDismiss={() => setTimePickerVisible({ ...timePickerVisible, cancelationRefundThresholdTime: false })}
                onConfirm={(time) => onConfirmTime('cancelationRefundThresholdTime', time)}
                hours={parseInt(config.cancelationRefundThresholdTime.split(':')[0], 10) || 0}
                minutes={parseInt(config.cancelationRefundThresholdTime.split(':')[1], 10) || 0}
                label="Select Refund Threshold Time"
                animationType="fade"
                use24HourClock={true}
                // Optional: Set a minimum and maximum time
                // You can set constraints here if the library supports it
              />
            </ConfigCard>

            {/* Max Users Per Reservation */}
            <ConfigCard
              title="Max Users Per Reservation"
              description="Set the maximum number of users allowed per reservation (whole positive number)."
            >
              <TextInput
                mode="outlined"
                label="Max Users"
                value={config.maxUsersPerReservation}
                onChangeText={(text) => {
                  // Allow only digits
                  const cleanedText = text.replace(/[^0-9]/g, '');
                  setConfig({ ...config, maxUsersPerReservation: cleanedText });
                }}
                keyboardType="number-pad"
                style={styles.input}
                right={<TextInput.Icon name="account-multiple-outline" />}
                // Prevent losing focus on input change
                // No need for extra props; ensure parent components don't re-render unnecessarily
              />
            </ConfigCard>

            {/* Timeslots Duration */}
            <ConfigCard
              title="Timeslots Duration"
              description="Set the duration for each timeslot (24-hour format, HH:MM). Max 24:00."
            >
              <Button
                mode="outlined"
                icon="clock-outline"
                onPress={() => openTimePicker('timeslotsDuration')}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                {config.timeslotsDuration || 'Set Time'}
              </Button>
              <TimePickerModal
                visible={timePickerVisible.timeslotsDuration}
                onDismiss={() => setTimePickerVisible({ ...timePickerVisible, timeslotsDuration: false })}
                onConfirm={(time) => onConfirmTime('timeslotsDuration', time)}
                hours={parseInt(config.timeslotsDuration.split(':')[0], 10) || 0}
                minutes={parseInt(config.timeslotsDuration.split(':')[1], 10) || 0}
                label="Select Timeslot Duration"
                animationType="fade"
                use24HourClock={true}
              />
            </ConfigCard>

            {/* Save Button */}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
              labelStyle={styles.saveButtonLabel}
              icon="content-save-outline"
            >
              Save Changes
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        style={
          snackbar.type === 'error' 
            ? styles.snackbarError 
            : snackbar.type === 'info' 
              ? styles.snackbarInfo 
              : styles.snackbarSuccess
        }
        action={{
          label: 'Close',
          onPress: hideSnackbar,
        }}
      >
        {snackbar.message}
      </Snackbar>

      {/* Activity Indicator Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f3',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 12,
  },
  iconButton: {
    padding: 0, // Reduced padding for better alignment
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  input: {
    marginTop: 8,
    backgroundColor: '#ffffff',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  saveButtonLabel: {
    fontSize: 16,
  },
  snackbarSuccess: {
    backgroundColor: '#4caf50',
  },
  snackbarError: {
    backgroundColor: '#f44336',
  },
  snackbarInfo: {
    backgroundColor: '#2196f3',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(238, 242, 243, 0.7)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConfigManagementScreen;
