// Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, type = 'primary', disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[type], disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, styles[`${type}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#FFF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  disabled: {
    backgroundColor: '#B0B0B0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#FFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
});

export default Button;
