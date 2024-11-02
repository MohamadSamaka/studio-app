// ActionButtons.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../../../utils/theme";
import PropTypes from 'prop-types';

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
        onPress={() => handleCancelReservations()} // Ensure this is correctly passed
        disabled={selectedReservations.length === 0 || cancelling}
        loading={cancelling}
        uppercase={false}
        icon={() => (
          <MaterialCommunityIcons name="cancel" size={20} color="#fff" />
        )}
        accessibilityLabel="Cancel Selected Reservations"
        style={styles.cancelButton}
      >
        Cancel Selected
      </Button>

      {/* Refresh Reservations Button */}
      <Button
        mode="outlined"
        onPress={() => fetchReservations(currentPage)}
        disabled={loading}
        uppercase={false}
        icon={() => (
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color={theme.colors.primary}
          />
        )}
        accessibilityLabel="Refresh Reservations"
        style={styles.refreshButton}
      >
        Refresh
      </Button>
    </View>
  );
};

ActionButtons.propTypes = {
  handleCancelReservations: PropTypes.func.isRequired,
  selectedReservations: PropTypes.arrayOf(PropTypes.number).isRequired,
  cancelling: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  fetchReservations: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10, // Add some space below the buttons
    gap: 10,
  },
  cancelButton: {
    flex: 1, // Make buttons take equal space
    borderRadius: 25,
    backgroundColor: theme.colors.primary, // Ensure consistent styling
  },
  refreshButton: {
    flex: 1, // Make buttons take equal space
    borderRadius: 25,
    borderColor: theme.colors.primary, // Ensure consistent styling
  },
});

export default ActionButtons;
