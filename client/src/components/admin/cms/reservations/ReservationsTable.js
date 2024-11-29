// ReservationsTable.js

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { DataTable, IconButton, Text } from "react-native-paper";
import ReservationItem from "./ReservationItem";
import { theme } from "../../../../utils/theme";
import { MaterialIcons } from "@expo/vector-icons";
import CustomPagination from "./CustomPagination";
import PropTypes from "prop-types";

const ReservationsTable = ({
  reservations,
  loading,
  selectedReservations,
  toggleSelection,
  selectAll,
  deselectAll,
  openReservationDetails,
  handleDeleteReservation,
  handleEditReservation,
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
          <DataTable.Cell style={styles.loadingCell}>
            <Text>Loading...</Text>
          </DataTable.Cell>
        </DataTable.Row>
      );
    }

    if (reservations.length === 0) {
      return (
        <DataTable.Row>
          <DataTable.Cell style={styles.noDataCell}>
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
          handleEditReservation={handleEditReservation}
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
      {/* Scrollable Table Content */}
      <ScrollView style={styles.scrollView}>
        <DataTable>
          <DataTable.Header style={styles.header}>
            {/* Select All IconButton */}
            <DataTable.Title style={styles.checkboxTitle}>
              <IconButton
                icon={() => (
                  <MaterialIcons
                    name={getHeaderCheckboxIcon()}
                    size={24}
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
            <DataTable.Title style={styles.dateTitle}>
              <Text style={styles.headerText}>Date</Text>
            </DataTable.Title>
            <DataTable.Title numeric style={styles.peopleTitle}>
              <Text style={styles.headerText}>People #</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.actionsTitle}>
              <Text style={styles.headerText}>Actions</Text>
            </DataTable.Title>
          </DataTable.Header>

          {/* Render Rows */}
          {renderRows()}
        </DataTable>
      </ScrollView>

      {/* Pagination Fixed at the Bottom */}
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
      time: PropTypes.string.isRequired,
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
  handleEditReservation: PropTypes.func.isRequired,
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.surface,
    height: 56,
    paddingLeft: 0,
    paddingRight: 0,
  },
  checkboxTitle: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  dateTitle: {
    flex: 2,
    justifyContent: "center",
  },
  peopleTitle: {
    flex: 1.5,
    justifyContent: "center",
  },
  actionsTitle: {
    flex: 2,
    justifyContent: "center",
  },
  headerText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  noDataCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  iconButton: {
    margin: 0,
  },
});

export default ReservationsTable;
