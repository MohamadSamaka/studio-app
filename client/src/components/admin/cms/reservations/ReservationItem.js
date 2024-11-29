// ReservationItem.js

import React from "react";
import { DataTable, IconButton, Text } from "react-native-paper";
import { StyleSheet, TouchableOpacity } from "react-native";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../../../utils/theme";
import PropTypes from "prop-types";

const ReservationItem = ({
  reservation,
  isSelected,
  toggleSelection,
  openReservationDetails,
  handleDeleteReservation,
  handleEditReservation,
}) => {
  // Determine the icon based on selection state
  const getCheckboxIcon = () => {
    return isSelected ? "check-box" : "check-box-outline-blank";
  };

  return (
    <DataTable.Row style={styles.tableRow}>
      {/* Checkbox Cell */}
      <DataTable.Cell style={styles.checkboxCell}>
        <IconButton
          icon={() => (
            <MaterialIcons
              name={getCheckboxIcon()}
              size={24}
              color={theme.colors.primary}
            />
          )}
          onPress={() => toggleSelection(reservation.id)}
          accessibilityLabel={`Select reservation on ${moment(
            reservation.date,
            "YYYY-MM-DD"
          ).format("MM/DD/YYYY")}`}
          style={styles.iconButton}
        />
      </DataTable.Cell>
      {/* Date Cell */}
      <DataTable.Cell
        style={styles.dateCell}
        onPress={() => openReservationDetails(reservation)}
      >
        <Text style={styles.cellText}>
          {moment(reservation.date, "YYYY-MM-DD").format("MM/DD/YYYY")}
        </Text>
      </DataTable.Cell>
      {/* People # Cell */}
      <DataTable.Cell
        numeric
        style={styles.peopleCell}
        onPress={() => openReservationDetails(reservation)}
      >
        <Text style={styles.cellText}>{reservation.participants.length}</Text>
      </DataTable.Cell>
      {/* Actions Cell */}
      <DataTable.Cell style={styles.actionsCell}>
        <IconButton
          icon={() => (
            <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
          )}
          size={24}
          onPress={() => handleEditReservation(reservation)}
          accessibilityLabel="Edit Reservation"
          style={styles.iconButton}
        />
        <IconButton
          icon={() => (
            <MaterialIcons name="delete" size={24} color={theme.colors.error} />
          )}
          size={24}
          onPress={() => handleDeleteReservation(reservation)}
          accessibilityLabel="Delete Reservation"
          style={styles.iconButton}
        />
      </DataTable.Cell>
    </DataTable.Row>
  );
};

ReservationItem.propTypes = {
  reservation: PropTypes.shape({
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  toggleSelection: PropTypes.func.isRequired,
  openReservationDetails: PropTypes.func.isRequired,
  handleDeleteReservation: PropTypes.func.isRequired,
  handleEditReservation: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  tableRow: {
    height: 60,
    backgroundColor: theme.colors.surface,
  },
  checkboxCell: {
    width: 50,
  },
  dateCell: {
    flex: 2,
    justifyContent: "center",
  },
  peopleCell: {
    flex: 1.5,
    justifyContent: "center",
  },
  actionsCell: {
    flex: 2,
    flexDirection: "row",
    paddingTop: 0,
    paddingBottom: 0,
  },
  iconButton: {
    margin: 0,
  },
  cellText: {
    textAlign: "center",
  },
});

export default ReservationItem;
