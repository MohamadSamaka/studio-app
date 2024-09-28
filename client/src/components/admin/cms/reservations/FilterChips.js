import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

const FilterChips = ({
  dateFilter,
  timeFilter,
  openFilterModal,
  resetDateFilter,
  resetTimeFilter,
}) => {
  return (
    <View style={styles.filterChips}>
      {/* Date Filters */}
      {dateFilter.single && (
        <Button
          mode="outlined"
          onPress={openFilterModal}
          icon={({ size, color }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          )}
          style={styles.filterChip}
        >
          {`Date: ${moment(dateFilter.single, 'YYYY-MM-DD').format('MM/DD/YYYY')}`}
          <TouchableOpacity onPress={resetDateFilter} style={styles.closeIcon}>
            <MaterialIcons name="close" size={16} color="gray" />
          </TouchableOpacity>
        </Button>
      )}
      {dateFilter.start && dateFilter.end && (
        <Button
          mode="outlined"
          onPress={openFilterModal}
          icon={({ size, color }) => (
            <MaterialIcons name="date-range" size={size} color={color} />
          )}
          style={styles.filterChip}
        >
          {`${moment(dateFilter.start, 'YYYY-MM-DD').format('MM/DD')} - ${moment(
            dateFilter.end,
            'YYYY-MM-DD'
          ).format('MM/DD')}`}
          <TouchableOpacity onPress={resetDateFilter} style={styles.closeIcon}>
            <MaterialIcons name="close" size={16} color="gray" />
          </TouchableOpacity>
        </Button>
      )}

      {/* Time Filters */}
      {timeFilter.single && moment(timeFilter.single, 'HH:mm', true).isValid() && (
        <Button
          mode="outlined"
          onPress={openFilterModal}
          icon={({ size, color }) => (
            <MaterialIcons name="access-time" size={size} color={color} />
          )}
          style={styles.filterChip}
        >
          {`Time: ${moment(timeFilter.single, 'HH:mm').format('hh:mm A')}`}
          <TouchableOpacity onPress={resetTimeFilter} style={styles.closeIcon}>
            <MaterialIcons name="close" size={16} color="gray" />
          </TouchableOpacity>
        </Button>
      )}
      {timeFilter.start &&
        timeFilter.end &&
        moment(timeFilter.start, 'HH:mm', true).isValid() &&
        moment(timeFilter.end, 'HH:mm', true).isValid() && (
          <Button
            mode="outlined"
            onPress={openFilterModal}
            icon={({ size, color }) => (
              <MaterialIcons name="schedule" size={size} color={color} />
            )}
            style={styles.filterChip}
          >
            {`${moment(timeFilter.start, 'HH:mm').format('hh:mm A')} - ${moment(
              timeFilter.end,
              'HH:mm'
            ).format('hh:mm A')}`}
            <TouchableOpacity onPress={resetTimeFilter} style={styles.closeIcon}>
              <MaterialIcons name="close" size={16} color="gray" />
            </TouchableOpacity>
          </Button>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 10,
    marginBottom: 10,
    borderColor: '#6200ee',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
  },
  closeIcon: {
    marginLeft: 5,
  },
});

export default FilterChips;
