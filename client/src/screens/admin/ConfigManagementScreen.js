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
import { updateConfig } from '../../utils/axios';
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
          onPress={() => {}} 
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
  const { loading: configLoading, config, setConfig } = useConfigContext();  // ConfigContext
  
  // Use local state for form inputs
  const [localConfig, setLocalConfig] = useState({
    cancelationRefundThresholdTime: '',
    maxUsersPerReservation: '',
    timeslotsDuration: '',
  });

  const [loading, setLoading] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState({
    cancelationRefundThresholdTime: false,
    timeslotsDuration: false,
  });

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  // Synchronize config values with the form inputs once config is loaded
  useEffect(() => {
    if (config) {
      setLocalConfig({
        cancelationRefundThresholdTime: config.reservations["cancelation-refund-threshold-time"] || '00:00',
        maxUsersPerReservation: config.reservations["max-users-per-reservation"]?.toString() || '',
        timeslotsDuration: config.reservations["timeslots-duration"] || '00:00',
      });
    }
  }, [config]);  // Only run when config changes

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const newConfig = {
        "reservations": {
          "cancelation-refund-threshold-time": localConfig.cancelationRefundThresholdTime || '00:00',
          "max-users-per-reservation": parseInt(localConfig.maxUsersPerReservation, 10) || 0,
          "timeslots-duration": localConfig.timeslotsDuration || '00:00',
        }
      }
      await updateConfig(newConfig);
      setConfig(newConfig)
      showSnackbar('Configuration updated successfully', 'success');
    } catch (error) {
      console.error('Error updating config:', error);
      showSnackbar('Failed to update configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openTimePicker = (field) => {
    setTimePickerVisible({ ...timePickerVisible, [field]: true });
  };

  const onConfirmTime = (field, time) => {
    const formattedTime = `${padZero(time.hours)}:${padZero(time.minutes)}`;
    setLocalConfig({ ...localConfig, [field]: formattedTime });
    setTimePickerVisible({ ...timePickerVisible, [field]: false });
  };

  const padZero = (num) => num.toString().padStart(2, '0');

  const formatTime = (time) => {
    if (!time || typeof time !== 'string') {
      return '00:00';
    }
    const [hours, minutes] = (time || '00:00').split(':').map(Number);  // Add fallback here
    const validHours = !isNaN(hours) && hours >= 0 && hours <= 24 ? padZero(hours) : '00';
    const validMinutes = !isNaN(minutes) && minutes >= 0 && minutes < 60 ? padZero(minutes) : '00';
    return `${validHours}:${validMinutes}`;
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  const validateInputs = () => {
    const { cancelationRefundThresholdTime, maxUsersPerReservation, timeslotsDuration } = localConfig;
    const maxUsers = parseInt(maxUsersPerReservation, 10);

    if (!cancelationRefundThresholdTime?.match(/^\d{2}:\d{2}$/)) {
      showSnackbar('Invalid format for Cancelation Refund Threshold Time. Use HH:MM.', 'error');
      return false;
    }

    if (isNaN(maxUsers) || maxUsers <= 0 || !Number.isInteger(maxUsers)) {
      showSnackbar('Max Users Per Reservation must be a positive whole number.', 'error');
      return false;
    }

    if (!timeslotsDuration?.match(/^\d{2}:\d{2}$/)) {
      showSnackbar('Invalid format for Timeslots Duration. Use HH:MM.', 'error');
      return false;
    }

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

  if (configLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AppBar title="CRM Configurations" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            <View style={{ minHeight: 600 }}>
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
                  {localConfig.cancelationRefundThresholdTime || 'Set Time'}
                </Button>
                <TimePickerModal
                  visible={timePickerVisible.cancelationRefundThresholdTime}
                  onDismiss={() => setTimePickerVisible({ ...timePickerVisible, cancelationRefundThresholdTime: false })}
                  onConfirm={(time) => onConfirmTime('cancelationRefundThresholdTime', time)}
                  hours={parseInt(localConfig.cancelationRefundThresholdTime?.split(':')[0], 10) || 0}
                  minutes={parseInt(localConfig.cancelationRefundThresholdTime?.split(':')[1], 10) || 0}
                  label="Select Refund Threshold Time"
                  animationType="fade"
                  use24HourClock={true}
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
                  value={localConfig.maxUsersPerReservation}
                  onChangeText={(text) => {
                    const cleanedText = text.replace(/[^0-9]/g, '');
                    setLocalConfig({ ...localConfig, maxUsersPerReservation: cleanedText });
                  }}
                  keyboardType="number-pad"
                  style={styles.input}
                  right={<TextInput.Icon name="account-multiple-outline" />}
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
                  {localConfig.timeslotsDuration || 'Set Time'}
                </Button>
                <TimePickerModal
                  visible={timePickerVisible.timeslotsDuration}
                  onDismiss={() => setTimePickerVisible({ ...timePickerVisible, timeslotsDuration: false })}
                  onConfirm={(time) => onConfirmTime('timeslotsDuration', time)}
                  hours={parseInt(localConfig.timeslotsDuration?.split(':')[0], 10) || 0}
                  minutes={parseInt(localConfig.timeslotsDuration?.split(':')[1], 10) || 0}
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
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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
    padding: 0,
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
    backgroundColor: 'rgba(238, 242, 243, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConfigManagementScreen;
