// FilterModal.js
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Divider,
  Switch,
  useTheme,
} from "react-native-paper";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import PropTypes from "prop-types";
import { theme } from "../../../../utils/theme";
import {
  DatePickerModal,
  TimePickerModal,
  enGB,
  registerTranslation,
} from "react-native-paper-dates";

registerTranslation("en", enGB);

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const FilterModal = ({
  visible,
  onDismiss,
  filterType,
  setFilterType,
  isDateRange,
  setIsDateRange,
  isTimeRange,
  setIsTimeRange,
  dateFilter,
  setDateFilter,
  tempDateFilter,
  setTempDateFilter,
  timeFilter,
  setTimeFilter,
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
  applyFiltersFromModal,
  resetFilters,
}) => {
  const paperTheme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.filterModalContainer}
      >
        <ScrollView>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Apply Filter</Text>
            <IconButton
              icon={() => (
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="currentColor"
                />
              )}
              size={24}
              onPress={() => {
                console.log("Close Filter Modal clicked");
                onDismiss();
              }}
              accessibilityLabel="Close Filter Modal"
            />
          </View>
          <Divider style={styles.divider} />

          {/* Filter Type Selection */}
          <View style={styles.filterTypeContainer}>
            <Button
              mode={filterType === "date" ? "contained" : "outlined"}
              onPress={() => {
                console.log("Date filter type selected");
                setFilterType("date");
              }}
              style={styles.filterTypeButton}
              icon={() => (
                <MaterialCommunityIcons
                  name="calendar-today"
                  size={20}
                  color={filterType === "date" ? "#fff" : theme.colors.primary}
                />
              )}
            >
              Date
            </Button>
            <Button
              mode={filterType === "time" ? "contained" : "outlined"}
              onPress={() => {
                console.log("Time filter type selected");
                setFilterType("time");
              }}
              style={styles.filterTypeButton}
              icon={() => (
                <MaterialCommunityIcons
                  name="clock"
                  size={20}
                  color={filterType === "time" ? "#fff" : theme.colors.primary}
                />
              )}
            >
              Time
            </Button>
          </View>

          {/* Conditional Rendering Based on Filter Type */}
          {filterType === "date" && (
            <View style={styles.filterSection}>
              <View style={styles.filterOption}>
                <Text>Single Date</Text>
                <Switch
                  value={isDateRange}
                  onValueChange={() => {
                    console.log("Toggled Date Range to", !isDateRange);
                    setIsDateRange(!isDateRange);
                  }}
                  accessibilityLabel="Toggle between single date and date range"
                />
                <Text>Range</Text>
              </View>
              {isDateRange ? (
                <>
                  {/* Start Date Picker Trigger */}
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      console.log("Show Start Date Picker");
                      setShowDatePickerStart(true);
                    }}
                    accessibilityLabel="Select Start Date"
                  >
                    <Text>
                      {tempDateFilter.start
                        ? `Start: ${moment(tempDateFilter.start).format(
                            "MM/DD/YYYY"
                          )}`
                        : "Select Start Date"}
                    </Text>
                    <MaterialIcons
                      name="calendar-today"
                      size={24}
                      color="#6200ee"
                    />
                  </TouchableOpacity>

                  {/* End Date Picker Trigger */}
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      if (!tempDateFilter.start) {
                        Alert.alert(
                          "Select Start Date First",
                          "Please select the start date before selecting the end date."
                        );
                        return;
                      }
                      console.log("Show End Date Picker");
                      setShowDatePickerEnd(true);
                    }}
                    accessibilityLabel="Select End Date"
                  >
                    <Text>
                      {tempDateFilter.end
                        ? `End: ${moment(tempDateFilter.end).format(
                            "MM/DD/YYYY"
                          )}`
                        : "Select End Date"}
                    </Text>
                    <MaterialIcons
                      name="calendar-today"
                      size={24}
                      color="#6200ee"
                    />
                  </TouchableOpacity>
                </>
              ) : (
                /* Single Date Picker Trigger */
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => {
                    console.log("Show Single Date Picker");
                    setShowSingleDatePicker(true);
                  }}
                  accessibilityLabel="Select Date"
                >
                  <Text>
                    {tempDateFilter.single
                      ? `Date: ${moment(tempDateFilter.single).format(
                          "MM/DD/YYYY"
                        )}`
                      : "Select Date"}
                  </Text>
                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color="#6200ee"
                  />
                </TouchableOpacity>
              )}

              {/* DatePickerModal for Single Date */}
              {showSingleDatePicker && (
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={showSingleDatePicker}
                  onDismiss={() => setShowSingleDatePicker(false)}
                  date={tempDateFilter.single || new Date()}
                  onConfirm={({ date }) => {
                    console.log("Single Date selected:", date);
                    setTempDateFilter((prev) => ({ ...prev, single: date }));
                    setShowSingleDatePicker(false);
                  }}
                  label="Select Date"
                />
              )}

              {/* DatePickerModal for Start Date */}
              {showDatePickerStart && (
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={showDatePickerStart}
                  onDismiss={() => setShowDatePickerStart(false)}
                  date={tempDateFilter.start || new Date()}
                  onConfirm={({ date }) => {
                    console.log("Start Date selected:", date);
                    setTempDateFilter((prev) => ({ ...prev, start: date }));
                    setShowDatePickerStart(false);
                  }}
                  label="Select Start Date"
                />
              )}

              {/* DatePickerModal for End Date */}
              {showDatePickerEnd && (
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={showDatePickerEnd}
                  onDismiss={() => setShowDatePickerEnd(false)}
                  date={tempDateFilter.end || new Date()}
                  onConfirm={({ date }) => {
                    console.log("End Date selected:", date);
                    if (moment(date).isBefore(moment(tempDateFilter.start))) {
                      Alert.alert(
                        "Invalid End Date",
                        "End date cannot be before start date."
                      );
                      return;
                    }
                    setTempDateFilter((prev) => ({ ...prev, end: date }));
                    setShowDatePickerEnd(false);
                  }}
                  label="Select End Date"
                  minimumDate={tempDateFilter.start || undefined}
                />
              )}
            </View>
          )}

          {filterType === "time" && (
            <View style={styles.filterSection}>
              <View style={styles.filterOption}>
                <Text>Single Time</Text>
                <Switch
                  value={isTimeRange}
                  onValueChange={() => {
                    console.log("Toggled Time Range to", !isTimeRange);
                    setIsTimeRange(!isTimeRange);
                  }}
                  accessibilityLabel="Toggle between single time and time range"
                />
                <Text>Range</Text>
              </View>
              {isTimeRange ? (
                <>
                  {/* Start Time Picker Trigger */}
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => {
                      console.log("Show Start Time Picker");
                      setShowTimePickerStart(true);
                    }}
                    accessibilityLabel="Select Start Time"
                  >
                    <Text>
                      {tempTimeFilter.start
                        ? `Start: ${moment(tempTimeFilter.start).format(
                            "hh:mm A"
                          )}`
                        : "Select Start Time"}
                    </Text>
                    <MaterialIcons
                      name="access-time"
                      size={24}
                      color="#6200ee"
                    />
                  </TouchableOpacity>

                  {/* End Time Picker Trigger */}
                  <TouchableOpacity
                    style={styles.timePickerButton}
                    onPress={() => {
                      if (!tempTimeFilter.start) {
                        Alert.alert(
                          "Select Start Time First",
                          "Please select the start time before selecting the end time."
                        );
                        return;
                      }
                      console.log("Show End Time Picker");
                      setShowTimePickerEnd(true);
                    }}
                    accessibilityLabel="Select End Time"
                  >
                    <Text>
                      {tempTimeFilter.end
                        ? `End: ${moment(tempTimeFilter.end).format(
                            "hh:mm A"
                          )}`
                        : "Select End Time"}
                    </Text>
                    <MaterialIcons
                      name="access-time"
                      size={24}
                      color="#6200ee"
                    />
                  </TouchableOpacity>
                </>
              ) : (
                /* Single Time Picker Trigger */
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => {
                    console.log("Show Single Time Picker");
                    setShowSingleTimePicker(true);
                  }}
                  accessibilityLabel="Select Time"
                >
                  <Text>
                    {tempTimeFilter.single
                      ? `Time: ${moment(tempTimeFilter.single).format("hh:mm A")}`
                      : "Select Time"}
                  </Text>
                  <MaterialIcons
                    name="access-time"
                    size={24}
                    color="#6200ee"
                  />
                </TouchableOpacity>
              )}

              {/* TimePickerModal for Single Time */}
              {showSingleTimePicker && (
                <TimePickerModal
                  visible={showSingleTimePicker}
                  onDismiss={() => setShowSingleTimePicker(false)}
                  onConfirm={({ hours, minutes }) => {
                    console.log("Single Time selected:", hours, minutes);
                    const time = new Date();
                    time.setHours(hours);
                    time.setMinutes(minutes);
                    setTempTimeFilter((prev) => ({ ...prev, single: time }));
                    setShowSingleTimePicker(false);
                  }}
                  hours={
                    tempTimeFilter.single
                      ? tempTimeFilter.single.getHours()
                      : 12
                  }
                  minutes={
                    tempTimeFilter.single
                      ? tempTimeFilter.single.getMinutes()
                      : 0
                  }
                  label="Select Time"
                  use24HourClock={false}
                />
              )}

              {/* TimePickerModal for Start Time */}
              {showTimePickerStart && (
                <TimePickerModal
                  visible={showTimePickerStart}
                  onDismiss={() => setShowTimePickerStart(false)}
                  onConfirm={({ hours, minutes }) => {
                    console.log("Start Time selected:", hours, minutes);
                    const time = new Date();
                    time.setHours(hours);
                    time.setMinutes(minutes);
                    setTempTimeFilter((prev) => ({ ...prev, start: time }));
                    setShowTimePickerStart(false);
                  }}
                  hours={
                    tempTimeFilter.start
                      ? tempTimeFilter.start.getHours()
                      : 12
                  }
                  minutes={
                    tempTimeFilter.start
                      ? tempTimeFilter.start.getMinutes()
                      : 0
                  }
                  label="Select Start Time"
                  use24HourClock={false}
                />
              )}

              {/* TimePickerModal for End Time */}
              {showTimePickerEnd && (
                <TimePickerModal
                  visible={showTimePickerEnd}
                  onDismiss={() => setShowTimePickerEnd(false)}
                  onConfirm={({ hours, minutes }) => {
                    console.log("End Time selected:", hours, minutes);
                    const endTime = new Date();
                    endTime.setHours(hours);
                    endTime.setMinutes(minutes);
                    const startTime = tempTimeFilter.start;
                    if (
                      moment(endTime).isBefore(moment(startTime))
                    ) {
                      Alert.alert(
                        "Invalid End Time",
                        "End time cannot be before start time."
                      );
                      return;
                    }
                    setTempTimeFilter((prev) => ({ ...prev, end: endTime }));
                    setShowTimePickerEnd(false);
                  }}
                  hours={
                    tempTimeFilter.end
                      ? tempTimeFilter.end.getHours()
                      : 12
                  }
                  minutes={
                    tempTimeFilter.end
                      ? tempTimeFilter.end.getMinutes()
                      : 0
                  }
                  label="Select End Time"
                  use24HourClock={false}
                />
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.filterModalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                console.log("Reset Filters clicked");
                resetFilters();
              }}
              style={styles.filterActionButton}
              accessibilityLabel="Reset Filters"
            >
              Reset Filters
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                console.log("Apply Filters clicked");
                applyFiltersFromModal();
              }}
              style={styles.filterActionButton}
              accessibilityLabel="Apply Filters"
            >
              Apply Filters
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

FilterModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  filterType: PropTypes.string.isRequired,
  setFilterType: PropTypes.func.isRequired,
  isDateRange: PropTypes.bool.isRequired,
  setIsDateRange: PropTypes.func.isRequired,
  isTimeRange: PropTypes.bool.isRequired,
  setIsTimeRange: PropTypes.func.isRequired,
  dateFilter: PropTypes.shape({
    single: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
  }).isRequired,
  setDateFilter: PropTypes.func.isRequired,
  tempDateFilter: PropTypes.shape({
    single: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
  }).isRequired,
  setTempDateFilter: PropTypes.func.isRequired,
  timeFilter: PropTypes.shape({
    single: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
  }).isRequired,
  setTimeFilter: PropTypes.func.isRequired,
  tempTimeFilter: PropTypes.shape({
    single: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
  }).isRequired,
  setTempTimeFilter: PropTypes.func.isRequired,
  showSingleDatePicker: PropTypes.bool.isRequired,
  setShowSingleDatePicker: PropTypes.func.isRequired,
  showDatePickerStart: PropTypes.bool.isRequired,
  setShowDatePickerStart: PropTypes.func.isRequired,
  showDatePickerEnd: PropTypes.bool.isRequired,
  setShowDatePickerEnd: PropTypes.func.isRequired,
  showSingleTimePicker: PropTypes.bool.isRequired,
  setShowSingleTimePicker: PropTypes.func.isRequired,
  showTimePickerStart: PropTypes.bool.isRequired,
  setShowTimePickerStart: PropTypes.func.isRequired,
  showTimePickerEnd: PropTypes.bool.isRequired,
  setShowTimePickerEnd: PropTypes.func.isRequired,
  applyFiltersFromModal: PropTypes.func.isRequired,
  resetFilters: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  filterModalContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.8,
    width: SCREEN_WIDTH * 0.9,
    elevation: 5,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  divider: {
    marginVertical: 10,
  },
  filterTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
  },
  timePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
  },
  filterModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  filterActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default FilterModal;
