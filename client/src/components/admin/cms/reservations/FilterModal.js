import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Divider,
  Switch,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const FilterModal = ({
  visible,
  onDismiss,
  filterType,
  setFilterType,
  isDateRange,
  setIsDateRange,
  isTimeRange,
  setIsTimeRange,
  tempDateFilter,
  setTempDateFilter,
  tempTimeFilter,
  setTempTimeFilter,
  showSingleDatePicker,
  setShowSingleDatePicker,
  showDatePickerStart,
  setShowDatePickerStart,
  showDatePickerEnd,
  setShowDatePickerEnd,
  showSingleTimePicker,
  setShowSingleTimePicker,
  showTimePickerStart,
  setShowTimePickerStart,
  showTimePickerEnd,
  setShowTimePickerEnd,
  handleDateChange,
  handleTimeChange,
  applyFiltersFromModal,
  resetFilters,
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.filterModalContainer}
      >
        <View style={styles.filterModalHeader}>
          <Text style={styles.filterModalTitle}>Apply Filter</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            accessibilityLabel="Close Filter Modal"
          />
        </View>
        <Divider style={styles.divider} />

        {/* Filter Type Selection */}
        <View style={styles.filterTypeContainer}>
          <Button
            mode={filterType === 'date' ? 'contained' : 'outlined'}
            onPress={() => setFilterType('date')}
            style={styles.filterTypeButton}
            icon="calendar-today"
          >
            Date
          </Button>
          <Button
            mode={filterType === 'time' ? 'contained' : 'outlined'}
            onPress={() => setFilterType('time')}
            style={styles.filterTypeButton}
            icon="clock"
          >
            Time
          </Button>
        </View>

        {/* Conditional Rendering Based on Filter Type */}
        {filterType === 'date' && (
          <View style={styles.filterSection}>
            <View style={styles.filterOption}>
              <Text>Single Date</Text>
              <Switch
                value={isDateRange}
                onValueChange={() => setIsDateRange(!isDateRange)}
                accessibilityLabel="Toggle between single date and date range"
              />
              <Text>Range</Text>
            </View>
            {isDateRange ? (
              <>
                {/* Start Date Picker */}
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePickerStart(true)}
                >
                  <Text>
                    {tempDateFilter.start
                      ? `Start: ${moment(tempDateFilter.start).format(
                          'MM/DD/YYYY'
                        )}`
                      : 'Select Start Date'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={24} color="#6200ee" />
                </TouchableOpacity>

                {/* End Date Picker */}
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => {
                    if (!tempDateFilter.start) {
                      Alert.alert(
                        'Select Start Date First',
                        'Please select the start date before selecting the end date.'
                      );
                      return;
                    }
                    setShowDatePickerEnd(true);
                  }}
                >
                  <Text>
                    {tempDateFilter.end
                      ? `End: ${moment(tempDateFilter.end).format('MM/DD/YYYY')}`
                      : 'Select End Date'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={24} color="#6200ee" />
                </TouchableOpacity>
              </>
            ) : (
              /* Single Date Picker */
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowSingleDatePicker(true)}
              >
                <Text>
                  {tempDateFilter.single
                    ? `Date: ${moment(tempDateFilter.single).format('MM/DD/YYYY')}`
                    : 'Select Date'}
                </Text>
                <MaterialIcons name="calendar-today" size={24} color="#6200ee" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {filterType === 'time' && (
          <View style={styles.filterSection}>
            <View style={styles.filterOption}>
              <Text>Single Time</Text>
              <Switch
                value={isTimeRange}
                onValueChange={() => setIsTimeRange(!isTimeRange)}
                accessibilityLabel="Toggle between single time and time range"
              />
              <Text>Range</Text>
            </View>
            {isTimeRange ? (
              <>
                {/* Start Time Picker */}
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePickerStart(true)}
                >
                  <Text>
                    {tempTimeFilter.start
                      ? `Start: ${moment(tempTimeFilter.start).format('hh:mm A')}`
                      : 'Select Start Time'}
                  </Text>
                  <MaterialIcons name="access-time" size={24} color="#6200ee" />
                </TouchableOpacity>

                {/* End Time Picker */}
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => {
                    if (!tempTimeFilter.start) {
                      Alert.alert(
                        'Select Start Time First',
                        'Please select the start time before selecting the end time.'
                      );
                      return;
                    }
                    setShowTimePickerEnd(true);
                  }}
                >
                  <Text>
                    {tempTimeFilter.end
                      ? `End: ${moment(tempTimeFilter.end).format('hh:mm A')}`
                      : 'Select End Time'}
                  </Text>
                  <MaterialIcons name="access-time" size={24} color="#6200ee" />
                </TouchableOpacity>
              </>
            ) : (
              /* Single Time Picker */
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowSingleTimePicker(true)}
              >
                <Text>
                  {tempTimeFilter.single
                    ? `Time: ${moment(tempTimeFilter.single).format('hh:mm A')}`
                    : 'Select Time'}
                </Text>
                <MaterialIcons name="access-time" size={24} color="#6200ee" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.filterModalActions}>
          <Button
            mode="outlined"
            onPress={resetFilters}
            style={styles.filterActionButton}
          >
            Reset Filters
          </Button>
          <Button
            mode="contained"
            onPress={applyFiltersFromModal}
            style={styles.filterActionButton}
          >
            Apply Filters
          </Button>
        </View>

        {/* DateTimePickers for Dates */}
        {showSingleDatePicker && (
          <DateTimePicker
            value={tempDateFilter.single || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {showDatePickerStart && (
          <DateTimePicker
            value={tempDateFilter.start || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {showDatePickerEnd && (
          <DateTimePicker
            value={tempDateFilter.end || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={tempDateFilter.start || undefined}
          />
        )}

        {/* DateTimePickers for Times */}
        {showSingleTimePicker && (
          <DateTimePicker
            value={tempTimeFilter.single || new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={false}
          />
        )}
        {showTimePickerStart && (
          <DateTimePicker
            value={tempTimeFilter.start || new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={false}
          />
        )}
        {showTimePickerEnd && (
          <DateTimePicker
            value={tempTimeFilter.end || new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={false}
            minuteInterval={5}
          />
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  filterModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.8,
    width: SCREEN_WIDTH * 0.9,
    elevation: 5,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  divider: {
    marginVertical: 10,
  },
  filterTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterTypeButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#6200ee',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#6200ee',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default FilterModal;
