import { StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.accent,
  },
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
  button: {
    marginTop: 16,
  },
});