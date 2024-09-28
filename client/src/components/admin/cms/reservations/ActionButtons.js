import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const ActionButtons = ({
  handleCancelReservations,
  selectedReservations,
  cancelling,
  loading,
  fetchReservations,
  currentPage,
}) => {
  return (
    <View style={styles.actionsContainer}>
      <Button
        mode="contained"
        onPress={handleCancelReservations}
        disabled={selectedReservations.length === 0 || cancelling}
        loading={cancelling}
        icon="cancel"
        accessibilityLabel="Cancel Selected Reservations"
      >
        Cancel Selected
      </Button>
      <Button
        mode="outlined"
        onPress={() => fetchReservations(currentPage)}
        icon="refresh"
        disabled={loading}
        accessibilityLabel="Refresh Reservations"
      >
        Refresh
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    gap: 10,
  },
});

export default ActionButtons;
