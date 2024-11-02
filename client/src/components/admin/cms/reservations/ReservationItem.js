// ReservationItem.js
import React from "react";
import { DataTable, IconButton } from "react-native-paper";
import { StyleSheet, TouchableOpacity } from "react-native";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from '../../../../utils/theme';
import PropTypes from 'prop-types';

const ReservationItem = ({
  reservation,
  isSelected,
  toggleSelection,
  openReservationDetails,
  handleDeleteReservation, // This function will handle the Dialog
}) => {

  // Remove the confirmDelete function
  const onDeletePress = () => {
    handleDeleteReservation(reservation);
  };

  // Determine the icon based on selection state
  const getCheckboxIcon = () => {
    return isSelected ? 'check-box' : 'check-box-outline-blank';
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
          ).format("MM/DD/YYYY")} at ${moment(reservation.time, "HH:mm").format(
            "hh:mm A"
          )}`}
          style={styles.iconButton}
        />
      </DataTable.Cell>
      {/* Date Cell */}
      <TouchableOpacity style={styles.dateCell} onPress={() => openReservationDetails(reservation)}>
        <DataTable.Cell>
          {moment(reservation.date, "YYYY-MM-DD").format("MM/DD/YYYY")}
        </DataTable.Cell>
      </TouchableOpacity>
      {/* Time Cell */}
      {/* <TouchableOpacity style={styles.timeCell} onPress={() => openReservationDetails(reservation)}>
        <DataTable.Cell>
          {moment(reservation.time, "HH:mm").format("hh:mm A")}
        </DataTable.Cell>
      </TouchableOpacity> */}
      {/* People # Cell */}
      <TouchableOpacity style={styles.peopleCell} onPress={() => openReservationDetails(reservation)}>
        <DataTable.Cell numeric>
          {reservation.participants.length}
        </DataTable.Cell>
      </TouchableOpacity>
      {/* Actions Cell */}
      <DataTable.Cell style={styles.actionsCell}>
        <IconButton
          icon={() => (
            <MaterialIcons name="delete" size={24} color="#f44336" />
          )}
          size={24}
          onPress={onDeletePress} // Directly call handleDeleteReservation
          accessibilityLabel="Delete Reservation"
          style={styles.iconButton}
        />
        {/* Add more action buttons if needed */}
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
};

const styles = StyleSheet.create({
  tableRow: {
    height: 80,
    backgroundColor: theme.colors.surface,
    paddingVertical: 20,
  },
  checkboxCell: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCell: {
    flex: 2,
    justifyContent: 'center',
  },
  timeCell: {
    flex: 2,
    justifyContent: 'center',
  },
  peopleCell: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  actionsCell: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    // Optional: Add any additional styling if needed
  },
});

export default ReservationItem;
