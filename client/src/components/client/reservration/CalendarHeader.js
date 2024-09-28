// components/CalendarHeader/CalendarHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CalendarHeader = ({ currentMonth, canGoBack, canGoForward, onChangeMonth }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() => onChangeMonth('prev')}
      disabled={!canGoBack}
      style={styles.headerButton}
    >
      {canGoBack ? (
        <MaterialIcons name="chevron-left" size={30} color="#4682B4" />
      ) : (
        <View style={styles.disabledArrow} />
      )}
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{currentMonth}</Text>
    <TouchableOpacity
      onPress={() => onChangeMonth('next')}
      disabled={!canGoForward}
      style={styles.headerButton}
    >
      {canGoForward ? (
        <MaterialIcons name="chevron-right" size={30} color="#4682B4" />
      ) : (
        <View style={styles.disabledArrow} />
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerButton: {
    padding: 10,
  },
  disabledArrow: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4682B4',
  },
});

export default CalendarHeader;
