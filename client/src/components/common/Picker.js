// Picker.js
import React from 'react';
import { View, Text, StyleSheet, Picker as RNPicker } from 'react-native';

const Picker = ({ label, selectedValue, onValueChange, items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <RNPicker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {items.map((item) => (
            <RNPicker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </RNPicker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    borderRadius: 8,
    borderColor: '#007AFF',
    borderWidth: 1,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // For Android shadow
  },
  picker: {
    height: 50,
    color: '#333',
  },
});

export default Picker;
