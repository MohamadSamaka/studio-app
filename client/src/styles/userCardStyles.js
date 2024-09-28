import { StyleSheet } from 'react-native';
import theme from '../utils/theme';  // Assuming you have a theme.js file in the utils folder

const styles = StyleSheet.create({
  userCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  phoneNumber: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  expandedInfo: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.text,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: theme.colors.disabled,
  },
  iconColor: {
    color: theme.colors.primary,
  },
  iconDeleteColor: {
    color: theme.colors.error,
  },
});

export default styles;
