import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { DataTable, Checkbox } from 'react-native-paper';
import ReservationItem from './ReservationItem';

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
  const renderItem = ({ item }) => {
    const isSelected = selectedReservations.includes(item.id);
    return (
      <ReservationItem
        reservation={item}
        isSelected={isSelected}
        toggleSelection={toggleSelection}
        openReservationDetails={() => openReservationDetails(item)} // Ensure item is passed
        handleDeleteReservation={handleDeleteReservation}
      />
    );
  };

  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>
            <Checkbox
              status={
                selectedReservations.length === reservations.length &&
                reservations.length > 0
                  ? 'checked'
                  : selectedReservations.length > 0
                    ? 'indeterminate'
                    : 'unchecked'
              }
              onPress={() => {
                if (
                  selectedReservations.length === reservations.length &&
                  reservations.length > 0
                ) {
                  deselectAll();
                } else {
                  selectAll(reservations);
                }
              }}
              accessibilityLabel="Select All Reservations on Current Page"
            />
          </DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title>Time</DataTable.Title>
          <DataTable.Title numeric>People #</DataTable.Title>
          <DataTable.Title style={styles.centeredCell}>Actions</DataTable.Title>
        </DataTable.Header>
      </DataTable>

      {/* Use FlatList to render rows */}
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      {/* Pagination */}
      <DataTable.Pagination
        page={currentPage - 1}
        numberOfPages={totalPages}
        onPageChange={(page) => setCurrentPage(page + 1)}
        label={`Page ${currentPage} of ${totalPages}`}
        showFastPaginationControls
        numberOfItemsPerPage={itemsPerPage}
        selectPageDropdownLabel={'Rows per page'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  centeredCell: {
    flex: 2, // Adjust as needed
  },
});

export default ReservationsTable;
