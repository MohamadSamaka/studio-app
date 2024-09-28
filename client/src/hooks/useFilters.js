import { useState } from 'react';
import moment from 'moment';
import { Alert } from 'react-native';

const useFilters = (setCurrentPage, showSnackbar) => {
  // Filter Modal States
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter Type: 'date' or 'time'
  const [filterType, setFilterType] = useState(null);

  // Date Filter States
  const [isDateRange, setIsDateRange] = useState(false);
  const [dateFilter, setDateFilter] = useState({ single: null, start: null, end: null });
  const [tempDateFilter, setTempDateFilter] = useState({ single: null, start: null, end: null });

  // Time Filter States
  const [isTimeRange, setIsTimeRange] = useState(false);
  const [timeFilter, setTimeFilter] = useState({ single: null, start: null, end: null });
  const [tempTimeFilter, setTempTimeFilter] = useState({ single: null, start: null, end: null });

  // DateTimePicker Visibility States
  const [showSingleDatePicker, setShowSingleDatePicker] = useState(false);
  const [showDatePickerStart, setShowDatePickerStart] = useState(false);
  const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);

  const [showSingleTimePicker, setShowSingleTimePicker] = useState(false);
  const [showTimePickerStart, setShowTimePickerStart] = useState(false);
  const [showTimePickerEnd, setShowTimePickerEnd] = useState(false);

  // Open filter modal
  const openFilterModal = () => setFilterModalVisible(true);

  // Close filter modal
  const closeFilterModal = () => setFilterModalVisible(false);

  // Apply filters from the filter modal
  const applyFiltersFromModal = () => {
    if (filterType === 'date') {
      applyDateFilter();
    } else if (filterType === 'time') {
      applyTimeFilter();
    }
    closeFilterModal();
    setCurrentPage(1); // Reset to first page when filters are applied
  };

  // Reset filters function modified to close filter modal if open
  const resetFilters = () => {
    resetDateFilter();
    resetTimeFilter();
    setCurrentPage(1); // Reset to first page when filters are reset
    // Optionally close filter modal
    closeFilterModal();
    showSnackbar('All filters have been reset.', 'success');
  };

  // Apply Date Filter
  const applyDateFilter = () => {
    if (isDateRange) {
      if (!tempDateFilter.start || !tempDateFilter.end) {
        Alert.alert('Incomplete Range', 'Please select both start and end dates.');
        return;
      }
      const start = moment(tempDateFilter.start).format('YYYY-MM-DD');
      const end = moment(tempDateFilter.end).format('YYYY-MM-DD');

      if (moment(end).isBefore(moment(start))) {
        Alert.alert('Invalid Range', 'End date cannot be before start date.');
        return;
      }

      setDateFilter({
        single: null,
        start,
        end,
      });
    } else {
      console.log("is single")
      if (!tempDateFilter.single) {
        Alert.alert('No Date Selected', 'Please select a date.');
        return;
      }
      setDateFilter({
        single: moment(tempDateFilter.single).format('YYYY-MM-DD'),
        start: null,
        end: null,
      });
    }
    setCurrentPage(1); // Reset to first page when filters are applied
  };

  // Reset Date Filter
  const resetDateFilter = () => {
    setDateFilter({ single: null, start: null, end: null });
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  // Apply Time Filter
  const applyTimeFilter = () => {
    if (isTimeRange) {
      if (!tempTimeFilter.start || !tempTimeFilter.end) {
        Alert.alert('Incomplete Range', 'Please select both start and end times.');
        return;
      }

      const start = moment(tempTimeFilter.start).format('HH:mm');
      const end = moment(tempTimeFilter.end).format('HH:mm');

      if (moment(end, 'HH:mm').isBefore(moment(start, 'HH:mm'))) {
        Alert.alert('Invalid Range', 'End time cannot be before start time.');
        return;
      }

      setTimeFilter({
        single: null,
        start,
        end,
      });
    } else {
      if (!tempTimeFilter.single) {
        Alert.alert('No Time Selected', 'Please select a time.');
        return;
      }
      setTimeFilter({
        single: moment(tempTimeFilter.single).format('HH:mm'),
        start: null,
        end: null,
      });
    }
    setCurrentPage(1); // Reset to first page when filters are applied
  };

  // Reset Time Filter
  const resetTimeFilter = () => {
    setTimeFilter({ single: null, start: null, end: null });
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  // Date Picker Handlers
  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      // If the user dismissed the picker, simply hide it
      setShowSingleDatePicker(false);
      setShowDatePickerStart(false);
      setShowDatePickerEnd(false);
      return;
    }

    if (showSingleDatePicker) {
      // Handling single date selection
      setTempDateFilter({ ...tempDateFilter, single: selectedDate });
      setShowSingleDatePicker(false);
    } else if (showDatePickerStart) {
      // Handling start date selection in range
      setTempDateFilter({ ...tempDateFilter, start: selectedDate });
      setShowDatePickerStart(false);
    } else if (showDatePickerEnd) {
      // Handling end date selection in range
      setTempDateFilter({ ...tempDateFilter, end: selectedDate });
      setShowDatePickerEnd(false);
    }
  };

  // Time Picker Handlers
  const handleTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      // If the user dismissed the picker, simply hide it
      setShowSingleTimePicker(false);
      setShowTimePickerStart(false);
      setShowTimePickerEnd(false);
      return;
    }

    if (showSingleTimePicker) {
      // Handling single time selection
      setTempTimeFilter({ ...tempTimeFilter, single: selectedTime });
      setShowSingleTimePicker(false);
    } else if (showTimePickerStart) {
      // Handling start time selection in range
      setTempTimeFilter({ ...tempTimeFilter, start: selectedTime });
      setShowTimePickerStart(false);
    } else if (showTimePickerEnd) {
      // Handling end time selection in range
      setTempTimeFilter({ ...tempTimeFilter, end: selectedTime });
      setShowTimePickerEnd(false);
    }
  };

  return {
    filterModalVisible,
    openFilterModal,
    closeFilterModal,
    filterType,
    setFilterType,
    isDateRange,
    setIsDateRange,
    dateFilter,
    tempDateFilter,
    setTempDateFilter,
    isTimeRange,
    setIsTimeRange,
    timeFilter,
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
    resetDateFilter,
    resetTimeFilter,
  };
};

export default useFilters;
