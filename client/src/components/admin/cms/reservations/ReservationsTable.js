import React from "react";
import { View, StyleSheet } from "react-native";
import { DataTable, IconButton, Text } from "react-native-paper";
import ReservationItem from "./ReservationItem";
import { theme } from "../../../../utils/theme";
import { MaterialIcons } from "@expo/vector-icons";
import CustomPagination from "./CustomPagination";
import PropTypes from 'prop-types';

const ReservationsTable = ({
  reservations,
  loading,
  selectedReservations,
  toggleSelection,
  selectAll,
  deselectAll,
  openReservationDetails,
  handleDeleteReservation,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
}) => {
  // Function to render each row
  const renderRows = () => {
    if (loading) {
      return (
        <DataTable.Row>
          <DataTable.Cell colSpan={4} style={styles.loadingCell}>
            <Text>Loading...</Text>
          </DataTable.Cell>
        </DataTable.Row>
      );
    }

    if (reservations.length === 0) {
      return (
        <DataTable.Row>
          <DataTable.Cell colSpan={4} style={styles.noDataCell}>
            <Text>No reservations found matching your criteria.</Text>
          </DataTable.Cell>
        </DataTable.Row>
      );
    }

    return reservations.map((item) => {
      const isSelected = selectedReservations.includes(item.id);
      return (
        <ReservationItem
          key={item.id}
          reservation={item}
          isSelected={isSelected}
          toggleSelection={toggleSelection}
          openReservationDetails={() => openReservationDetails(item)}
          handleDeleteReservation={handleDeleteReservation}
        />
      );
    });
  };

  // Determine the header checkbox icon based on selection state
  const getHeaderCheckboxIcon = () => {
    if (
      selectedReservations.length === reservations.length &&
      reservations.length > 0
    ) {
      return "check-box"; // Checked
    } else if (selectedReservations.length > 0) {
      return "indeterminate-check-box"; // Indeterminate
    } else {
      return "check-box-outline-blank"; // Unchecked
    }
  };

  return (
    <View style={styles.tableContainer}>
      <DataTable>
        <DataTable.Header style={styles.header}>
          {/* Select All IconButton */}
          <DataTable.Title style={styles.checkboxTitle}>
            <IconButton
              icon={() => (
                <MaterialIcons
                  name={getHeaderCheckboxIcon()}
                  size={28} // Increased icon size for better visibility
                  color={theme.colors.primary}
                />
              )}
              onPress={() => {
                if (
                  selectedReservations.length === reservations.length &&
                  reservations.length > 0
                ) {
                  deselectAll();
                } else {
                  selectAll(reservations); // Pass reservations array
                }
              }}
              accessibilityLabel="Select All Reservations on Current Page"
              style={styles.iconButton}
            />
          </DataTable.Title>
          {/* Other Headers */}
          <DataTable.Title style={styles.dateTitle}>Date</DataTable.Title>
          {/* Time Column Removed */}
          <DataTable.Title numeric style={styles.peopleTitle}>
            People #
          </DataTable.Title>
          <DataTable.Title style={styles.actionsTitle}>Actions</DataTable.Title>
        </DataTable.Header>

        {/* Render Rows */}
        {renderRows()}
      </DataTable>
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </View>
  );
};

ReservationsTable.propTypes = {
  reservations: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      time: PropTypes.string.isRequired, // Remove if time is no longer used
      title: PropTypes.string.isRequired,
      trainer: PropTypes.string.isRequired,
      participants: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          username: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedReservations: PropTypes.arrayOf(PropTypes.number).isRequired,
  toggleSelection: PropTypes.func.isRequired,
  selectAll: PropTypes.func.isRequired,
  deselectAll: PropTypes.func.isRequired,
  openReservationDetails: PropTypes.func.isRequired,
  handleDeleteReservation: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    height: 60, // Reduced height to match row height
    paddingVertical: 10, // Reduced vertical padding for better alignment
    alignItems: "center", // Centers content vertically
  },
  checkboxTitle: {
    width: 60, // Adjusted width to accommodate the IconButton comfortably
    justifyContent: "center",
    alignItems: "center",
  },
  dateTitle: {
    flex: 2, // Allocates more space for the Date column
    textAlign: "left",
    justifyContent: "center",
    fontWeight: "bold", // Bold font for headers
    fontSize: 16, // Increased font size for readability
  },
  peopleTitle: {
    flex: 1.5, // Allocates adequate space for People #
    textAlign: "right",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionsTitle: {
    flex: 2, // Allocates adequate space for Actions
    textAlign: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  noDataCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 10, // Adds vertical padding for better touch area
    justifyContent: "center", // Centers pagination controls
  },
  iconButton: {

  }
});

export default ReservationsTable;
