import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import moment from 'moment';

const ReservationsTable = ({
  reservations,
  selectedReservations,
  toggleSelection,
  selectAll,
  deselectAll,
  openReservationDetails,
  handleDeleteReservation,
  handleEditReservation,
  // other props
}) => {
  const theme = useTheme();

  const allSelected =
    selectedReservations.length === reservations.length && reservations.length > 0;
  const someSelected =
    selectedReservations.length > 0 && selectedReservations.length < reservations.length;

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll(reservations);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedReservations.includes(item.id);
    return (
      <View style={styles.row}>
        <IconButton
          icon={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
          onPress={() => toggleSelection(item.id)}
          color={theme.colors.primary}
          size={24}
        />
        <TouchableOpacity onPress={() => openReservationDetails(item)} style={styles.cell}>
          <Text>{moment(item.date).format('MM/DD/YYYY')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openReservationDetails(item)} style={styles.cell}>
          <Text>{moment(item.time, 'HH:mm:ss').format('hh:mm A')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openReservationDetails(item)} style={styles.cell}>
          <Text>{item.title}</Text>
        </TouchableOpacity>
        {/* Actions */}
        <View style={styles.actionsCell}>
          <IconButton
            icon="pencil"
            onPress={() => handleEditReservation(item)}
          />
          <IconButton
            icon="delete"
            onPress={() => handleDeleteReservation(item)}
          />
        </View>
      </View>
    );
  };

  const headerIcon = allSelected
    ? 'checkbox-marked'
    : someSelected
    ? 'checkbox-indeterminate'
    : 'checkbox-blank-outline';

  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.header}>
        <IconButton
          icon={headerIcon}
          onPress={handleSelectAll}
          color={theme.colors.primary}
          size={24}
        />
        <Text style={styles.headerCell}>Date</Text>
        <Text style={styles.headerCell}>Time</Text>
        <Text style={styles.headerCell}>Title</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>
      {/* Table Body */}
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    // Add your styles here
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    // Add more styles as needed
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    // Add more styles as needed
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    // Add more styles as needed
  },
  cell: {
    flex: 1,
    // Add more styles as needed
  },
  actionsCell: {
    flexDirection: 'row',
    // Add more styles as needed
  },
});

export default ReservationsTable;
