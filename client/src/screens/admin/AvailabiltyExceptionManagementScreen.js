import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Button, Modal, Portal, Provider, Text, Switch, FAB, IconButton, Dialog, Paragraph } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import TimeInput from '../../components/common/TimeInput';
import { fetchAvailabiltyExceptions, createAvailabilityException, updateAvailabilityException, deleteAvailabilityException } from '../../utils/api';
import { TimePickerModal } from 'react-native-paper-dates';
import { validateTimeRange } from '../../utils/validationUtils'; // Import the validation function

const AvailabilityExceptionsScreen = () => {
  const [exceptions, setExceptions] = useState({});
  const [selectedDays, setSelectedDays] = useState([]); // Multiple day selection
  const [selectedException, setSelectedException] = useState(null);
  const [initialException, setInitialException] = useState(null); // Stores the original state of the exception
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [breakIndex, setBreakIndex] = useState(null);
  const [isModalVisible, setModalVisibility] = useState(false); // Controls modal visibility
  const [changedExceptions, setChangedExceptions] = useState({});
  const [isEdited, setIsEdited] = useState(false); // Track if the exception has been edited
  const [isDayClosed, setIsDayClosed] = useState(false); // Track if the day is marked as closed
  const [stagedForDeletion, setStagedForDeletion] = useState(false); // Track staged deletion of exceptions
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Show confirmation dialog for deletion
  const [deleteMultiple, setDeleteMultiple] = useState(false); // Track if multiple deletion is happening

  useEffect(() => {
    fetchAvailabiltyExceptionsData();
  }, []);

  const fetchAvailabiltyExceptionsData = async () => {
    try {
      const fetchedExceptions = await fetchAvailabiltyExceptions();
      console.log("fetched: ",fetchedExceptions)
      setExceptions(fetchedExceptions);
    } catch (error) {
      console.error('Error fetching availability exceptions:', error);
    }
  };

  const markSelectedDays = () => {
    const markedDates = {};

    // Mark selected days with blue color
    selectedDays.forEach((day) => {
      markedDates[day] = { selected: true, selectedColor: '#4a90e2' };
    });

    // Mark days with existing exceptions with a red dot, keeping the selected style if already selected
    Object.keys(exceptions).forEach((date) => {
      if (markedDates[date]) {
        // If already selected, add the red dot without removing the selection style
        markedDates[date] = { ...markedDates[date], marked: true, dotColor: 'red' };
      } else {
        // If not selected, just mark it with a red dot
        markedDates[date] = { marked: true, dotColor: 'red' };
      }
    });

    return markedDates;
  };

  const handleDayPress = (day) => {
    const dayString = day.dateString;

    if (exceptions[dayString]) {
      // If the user clicks on a day with an existing exception, open its modal and deselect other days
      setSelectedDays([dayString]); // Clear previous selections and only select this day
      setSelectedException(exceptions[dayString]);
      setInitialException(exceptions[dayString]);
      setIsDayClosed(exceptions[dayString].closed || false);

      setStagedForDeletion(false); // Reset deletion state
      setModalVisibility(true);
      setIsEdited(false);
    } else {
      // New exception: Reset the form and select the new day
      if (selectedDays.includes(dayString)) {
        setSelectedDays(selectedDays.filter((selectedDay) => selectedDay !== dayString));
      } else {
        setSelectedDays([...selectedDays, dayString]);
      }

      // Clear the form when adding a new exception
      setSelectedException({ start_time: '', end_time: '', AvailabilityExceptionBreaks: [] });
      setIsDayClosed(false); // Reset closed state
      setIsEdited(false); // Clear edited state
      setModalVisibility(false); // Modal opens only on confirmation of selection
    }
  };

  // Handle long press to force select a date, no matter its state
  const handleDayLongPress = (day) => {
    const dayString = day.dateString;

    if (selectedDays.includes(dayString)) {
      // If the day is already selected, deselect it (remove it from the array)
      setSelectedDays(selectedDays.filter(selectedDay => selectedDay !== dayString));
    } else {
      // Otherwise, add it to the selected days array
      setSelectedDays([...selectedDays, dayString]);
    }
  };

  const handleExitModal = () => {
    setModalVisibility(false);
    setSelectedDays([]); // Clear selected days when exiting the modal
  };

  const handleAddBreak = () => {
    const newBreak = { start_time: '', end_time: '' };
    const updatedBreaks = [...selectedException.AvailabilityExceptionBreaks, newBreak];
    setSelectedException({
      ...selectedException,
      AvailabilityExceptionBreaks: updatedBreaks,
    });
    setChangedExceptions({
      ...changedExceptions,
      [selectedDays[0]]: {
        ...selectedException,
        AvailabilityExceptionBreaks: updatedBreaks,
      },
    });
    setIsEdited(true);
  };

  const handleRemoveBreak = (index) => {
    const updatedBreaks = selectedException.AvailabilityExceptionBreaks.filter((_, i) => i !== index);
    setSelectedException({
      ...selectedException,
      AvailabilityExceptionBreaks: updatedBreaks,
    });
    setChangedExceptions({
      ...changedExceptions,
      [selectedDays[0]]: {
        ...selectedException,
        AvailabilityExceptionBreaks: updatedBreaks,
      },
    });
    setIsEdited(true);
  };

  const showTimePicker = (field, index = null) => {
    setSelectedField(field);
    setBreakIndex(index);
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleTimeConfirm = ({ hours, minutes }) => {
    const formattedTime = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:00`;

    if (breakIndex !== null) {
      const updatedBreaks = selectedException.AvailabilityExceptionBreaks.map((b, i) =>
        i === breakIndex ? { ...b, [selectedField]: formattedTime } : b
      );
      setSelectedException({
        ...selectedException,
        AvailabilityExceptionBreaks: updatedBreaks,
      });
    } else {
      setSelectedException({ ...selectedException, [selectedField]: formattedTime });
    }

    setChangedExceptions({
      ...changedExceptions,
      [selectedDays[0]]: selectedException,
    });

    setIsEdited(true);
    hideTimePicker();
  };

  const handleSaveChanges = async () => {
    if (stagedForDeletion) {
      handleDeleteException();
      return;
    }

    // If the day is closed, we can skip the time and break validations
    if (!isDayClosed) {
      // Validate Business Hours
      const isBusinessTimeValid = validateTimeRange(
        selectedException?.start_time,
        selectedException?.end_time,
        'Please provide both start and end times for the business hours.',
        'The start time must be earlier than the end time for the business hours.'
      );

      if (!isBusinessTimeValid) return;

      // Validate Break Times
      const businessStartTime = new Date(`1970-01-01T${selectedException?.start_time}`);
      const businessEndTime = new Date(`1970-01-01T${selectedException?.end_time}`);

      for (let i = 0; i < selectedException?.AvailabilityExceptionBreaks?.length; i++) {
        const breakTime = selectedException.AvailabilityExceptionBreaks[i];
        const breakStartTime = new Date(`1970-01-01T${breakTime.start_time}`);
        const breakEndTime = new Date(`1970-01-01T${breakTime.end_time}`);

        const isBreakValid = validateTimeRange(
          breakTime.start_time,
          breakTime.end_time,
          `Please provide both start and end times for break ${i + 1}.`,
          `The start time must be earlier than the end time for break ${i + 1}.`
        );

        if (!isBreakValid) return;

        // Ensure break times fall within business hours
        if (breakStartTime < businessStartTime || breakEndTime > businessEndTime) {
          Alert.alert(
            'Validation Error',
            `Break ${i + 1} must fall between the business start time (${selectedException?.start_time}) and end time (${selectedException?.end_time}).`
          );
          return;
        }
      }
    }

    try {
      for (const day of selectedDays) {
        const updatedException = {
          ...selectedException,
          is_closed: isDayClosed,
          start_time: isDayClosed ? null : selectedException.start_time,
          end_time: isDayClosed ? null : selectedException.end_time,
          AvailabilityExceptionBreaks: selectedException.AvailabilityExceptionBreaks || [],
        };

        if (exceptions[day]) {
          const exceptionId = exceptions[day].id;
          console.log("updated Exception: ",updatedException )
          await updateAvailabilityException(exceptionId, updatedException);
        } else {
          await createAvailabilityException({ date: day, ...updatedException });
        }
      }

      Alert.alert('Success', 'Availability exception saved successfully.');
      setChangedExceptions({});

      // Re-fetch exceptions to update calendar UI
      await fetchAvailabiltyExceptionsData(); // Refresh the data

      // Deselect the days after a successful save
      setSelectedDays([]);
      setModalVisibility(false);
    } catch (error) {
      console.error('Error saving exception:', error);
      Alert.alert('Error', 'An error occurred while saving the exception.');
    }
  };



  const handleReset = () => {
    setSelectedException(initialException);
    setIsDayClosed(initialException.closed || false);
    setIsEdited(false);
  };

  const handleCloseDayToggle = () => {
    setIsDayClosed(!isDayClosed);
    setIsEdited(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    handleDeleteMultiple();
    // setDeleteMultiple(true);
    // handleSaveChanges();
  };

  const handleConfirmMultiDateSelection = () => {
    if (selectedDays.length > 0) {
      // Reset the exception form for a new addition
      setSelectedException({ start_time: '', end_time: '', AvailabilityExceptionBreaks: [] });
      setIsDayClosed(false); // Reset the closed state
      setIsEdited(false); // Clear the edited state

      // Open the modal for adding a new exception
      setModalVisibility(true);
    }
  };

  // const handleDeleteMultiple = () => {
  //   if (selectedDays.length > 1) {
  //     setShowDeleteDialog(true); // Show confirmation dialog
  //   }
  // };

  const handleDeleteMultiple = async () => {
    try {  
      // Create an array of deletion promises
      const deletePromises = selectedDays.map(async (day) => {
        try {
          if (exceptions[day]) {
            const exceptionId = exceptions[day].id;
            await deleteAvailabilityException(exceptionId); // Wait for each delete
          }
        } catch (error) {
          console.error(`Failed to delete exception for day ${day}:`, error);
        }
      });
  
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
  
      console.log('All deletions completed.');
  
      // Re-fetch exceptions to update the calendar UI
      await fetchAvailabiltyExceptionsData(); // Refresh the data
  
      // Reset state after fetching data
      setChangedExceptions({});
      setSelectedException(null);
      setSelectedDays([]); // Deselect the days after deletion
      setModalVisibility(false);
  
      Alert.alert('Success', `Availability exceptions for ${selectedDays.length} days deleted.`);
    } catch (error) {
      console.error('Error deleting multiple exceptions:', error);
      Alert.alert('Error', 'An error occurred while deleting the exceptions.');
    }
  };
  
  

  return (
    <Provider>
      <View style={styles.container}>
        <Calendar
          markedDates={markSelectedDays()} // Mark selected dates
          onDayPress={handleDayPress}
          onDayLongPress={handleDayLongPress} // Handle long press
        />

        {selectedDays.length > 0 && (
          <FAB
            style={styles.fab}
            icon="plus"
            label="Set Exception"
            onPress={handleConfirmMultiDateSelection}
          />
        )}
        {selectedDays.length > 1 && selectedDays.every(date => exceptions.hasOwnProperty(date)) && (
          <FAB
            style={styles.deleteFab}
            icon="delete"
            label="Delete Exceptions"
            onPress={handleDeleteMultiple}
          />
        )}

        <Portal>
          <Modal visible={isModalVisible} onDismiss={handleExitModal} contentContainerStyle={styles.modalContainer}>
            <IconButton
              icon="close"
              size={24}
              onPress={handleExitModal}
              style={styles.closeIcon}
            />

            <ScrollView style={styles.scrollContainer}>
              <Card style={styles.exceptionCard}>
                <Card.Title
                  title={selectedDays.length > 1 ? `Set Exceptions for ${selectedDays.length} days` : selectedDays[0]}
                  titleStyle={isEdited ? styles.editedTitle : styles.normalTitle}
                />
                <Card.Content>
                  <View style={styles.closeDayContainer}>
                    <Text>Close Day</Text>
                    <Switch value={isDayClosed} onValueChange={handleCloseDayToggle} />
                  </View>

                  {!isDayClosed && (
                    <>
                      <TimeInput
                        label="Start Time"
                        value={selectedException?.start_time || ''}
                        onPress={() => showTimePicker('start_time')}
                      />
                      <TimeInput
                        label="End Time"
                        value={selectedException?.end_time || ''}
                        onPress={() => showTimePicker('end_time')}
                      />

                      <Title style={styles.breakTitle}>Break Times</Title>
                      {selectedException?.AvailabilityExceptionBreaks?.map((breakTime, index) => (
                        <View key={index} style={styles.breakContainer}>
                          <TimeInput
                            label="Start Time"
                            value={breakTime.start_time || ''}
                            onPress={() => showTimePicker('start_time', index)}
                          />
                          <TimeInput
                            label="End Time"
                            value={breakTime.end_time || ''}
                            onPress={() => showTimePicker('end_time', index)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            color="red"
                            onPress={() => handleRemoveBreak(index)}
                          />
                        </View>
                      ))}

                      <Button
                        icon="plus"
                        mode="text"
                        onPress={handleAddBreak}
                        labelStyle={styles.addBreakLabel}
                      >
                        Add Break
                      </Button>
                    </>
                  )}

                  {initialException && (
                    <Button
                      icon="delete"
                      mode="contained"
                      buttonColor="red"
                      onPress={() => setShowDeleteDialog(true)}
                      style={styles.deleteButton}
                    >
                      Delete Exception
                    </Button>
                  )}
                </Card.Content>
              </Card>
            </ScrollView>

            <View style={styles.fixedButtonContainer}>
              <Button
                mode="outlined"
                icon="restore"
                onPress={handleReset}
                style={styles.resetButton}
              >
                Reset
              </Button>
              <Button mode="contained" onPress={handleSaveChanges} style={styles.saveChangesButton}>
                {deleteMultiple ? 'Confirm Deletion' : 'Save Changes'}
              </Button>
            </View>
          </Modal>

          <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
            <Dialog.Title>Confirm Deletion</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure you want to delete these exceptions?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button onPress={confirmDelete}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* TimePicker Modal */}
        <TimePickerModal
          visible={isTimePickerVisible}
          onDismiss={hideTimePicker}
          onConfirm={handleTimeConfirm}
          label="Select time"
          cancelLabel="Cancel"
          confirmLabel="Ok"
          locale="en"
          use24HourClock
        />
      </View>
    </Provider>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 0,
    zIndex: 10,
  },
  scrollContainer: {
    marginTop: 20,
  },
  exceptionCard: {
    padding: 10,
    marginBottom: 20,
  },
  breakTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  addBreakLabel: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  fixedButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: '#ff6b6b',
  },
  resetButton: {
    borderColor: '#4a90e2',
    borderWidth: 1,
  },
  saveChangesButton: {
    backgroundColor: '#4a90e2',
  },
  closeDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4a90e2',
  },
  deleteFab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#ff6b6b',
  },
  editedTitle: {
    color: '#ffa500',
  },
  normalTitle: {
    color: '#000',
  },
});

export default AvailabilityExceptionsScreen;
