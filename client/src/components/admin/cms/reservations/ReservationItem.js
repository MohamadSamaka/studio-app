import React from 'react';
import { DataTable, Checkbox, IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import moment from 'moment';

const ReservationItem = ({
  reservation,
  isSelected,
  toggleSelection,
  openReservationDetails,
  handleDeleteReservation,
}) => (
  <DataTable.Row
    key={reservation.id}
    onPress={() => openReservationDetails(reservation)}
    style={styles.tableRow}
  >
    <DataTable.Cell>
      <Checkbox
        status={isSelected ? 'checked' : 'unchecked'}
        onPress={() => toggleSelection(reservation.id)}
        accessibilityLabel={`Select reservation on ${moment(
          reservation.date,
          'YYYY-MM-DD'
        ).format('MM/DD/YYYY')} at ${moment(reservation.time, 'HH:mm').format('hh:mm A')}`}
      />
    </DataTable.Cell>
    <DataTable.Cell>
      {moment(reservation.date, 'YYYY-MM-DD').format('MM/DD')}
    </DataTable.Cell>
    <DataTable.Cell>
      {moment(reservation.time, 'HH:mm').format('hh:mm A')}
    </DataTable.Cell>
    <DataTable.Cell style={styles.centeredCell}>
      {reservation.participants.length}
    </DataTable.Cell>
    <DataTable.Cell>
      <IconButton
        icon="delete"
        color="#f44336"
        size={20}
        onPress={() => handleDeleteReservation(reservation)}
        accessibilityLabel="Delete Reservation"
      />
    </DataTable.Cell>
  </DataTable.Row>
);

const styles = StyleSheet.create({
  tableRow: {
    height: 60,
  },
  centeredCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReservationItem;
