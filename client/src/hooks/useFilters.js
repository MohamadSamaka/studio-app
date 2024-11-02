// useFilters.js
import { useState } from 'react';
import { Alert } from 'react-native';
import moment from 'moment';

const useFilters = (setCurrentPage, showSnackbar) => {
  // Filter Modal Visibility
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter Type: 'date' or 'time'
  const [filterType, setFilterType] = useState('date'); // Default to 'date' for better UX

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
    showSnackbar('Filters applied successfully!', 'success');
  };

  // Reset filters function modified to close filter modal if open
  const resetFilters = () => {
    resetDateFilter();
    resetTimeFilter();
    setFilterType('date'); // Reset filter type to default
    setCurrentPage(1); // Reset to first page when filters are reset
    closeFilterModal(); // Close the modal if open
    showSnackbar('All filters have been reset.', 'info');
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
    setTempDateFilter({ single: null, start: null, end: null });
    setIsDateRange(false);
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
    setTempTimeFilter({ single: null, start: null, end: null });
    setIsTimeRange(false);
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

    if (filterType === 'date') {
      if (isDateRange) {
        if (showDatePickerStart) {
          setTempDateFilter(prev => ({ ...prev, start: selectedDate }));
          setShowDatePickerStart(false);
        } else if (showDatePickerEnd) {
          if (selectedDate < tempDateFilter.start) {
            Alert.alert(
              'Invalid Date',
              'End date cannot be before start date.'
            );
            return;
          }
          setTempDateFilter(prev => ({ ...prev, end: selectedDate }));
          setShowDatePickerEnd(false);
        }
      } else {
        setTempDateFilter(prev => ({ ...prev, single: selectedDate }));
        setShowSingleDatePicker(false);
      }
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

    if (filterType === 'time') {
      if (isTimeRange) {
        if (showTimePickerStart) {
          setTempTimeFilter(prev => ({ ...prev, start: selectedTime }));
          setShowTimePickerStart(false);
        } else if (showTimePickerEnd) {
          if (selectedTime < tempTimeFilter.start) {
            Alert.alert(
              'Invalid Time',
              'End time cannot be before start time.'
            );
            return;
          }
          setTempTimeFilter(prev => ({ ...prev, end: selectedTime }));
          setShowTimePickerEnd(false);
        }
      } else {
        setTempTimeFilter(prev => ({ ...prev, single: selectedTime }));
        setShowSingleTimePicker(false);
      }
    }
  };

  return {
    // Filter Modal Visibility
    filterModalVisible,
    openFilterModal,
    closeFilterModal,

    // Filter Type
    filterType,
    setFilterType,

    // Date Filters
    isDateRange,
    setIsDateRange,
    dateFilter,
    tempDateFilter,
    setTempDateFilter,

    // Time Filters
    isTimeRange,
    setIsTimeRange,
    timeFilter,
    tempTimeFilter,
    setTempTimeFilter,

    // Picker Visibility
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

    // Handlers
    handleDateChange,
    handleTimeChange,

    // Actions
    applyFiltersFromModal,
    resetFilters,
    resetDateFilter,
    resetTimeFilter,
  };
};

export default useFilters;
