import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TimeInput = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.timeInputContainer} onPress={onPress}>
    <View style={styles.timeInputWrapper}>
      <TextInput
        label={label}
        value={value}
        style={styles.timeInput}
        mode="outlined"
        placeholder="HH:MM:SS"
        editable={false}
        pointerEvents="none"
      />
      <Icon name="clock-outline" size={24} color="#4a90e2" style={styles.clockIcon} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInputContainer: {
    marginVertical: 10,
  },
  timeInput: {
    flex: 1,
  },
  clockIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  }
});

export default TimeInput;
