import { StyleSheet } from 'react-native';
import theme from '../utils/theme';  // Assuming you have a theme.js file in the utils folder

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.backdrop,
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    marginTop: 8,
    borderColor: theme.colors.primary,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    borderColor: theme.colors.primary,
  },
  dropdownList: {
    borderColor: theme.colors.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordToggle: {
    marginLeft: 8,
  },
});

export default styles;
