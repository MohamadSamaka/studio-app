// components/ReservationsTable.js

import React, {useEffect} from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { DataTable, Checkbox, ActivityIndicator } from 'react-native-paper';
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
    const renderItem = ({ item: reservation }) => {
        const isSelected = selectedReservations.includes(reservation.id);
        return (
            <ReservationItem
                key={reservation.id}
                reservation={reservation}
                isSelected={isSelected}
                toggleSelection={toggleSelection}
                openReservationDetails={openReservationDetails}
                handleDeleteReservation={handleDeleteReservation}
            />
        );
    };
    useEffect(() => {
      console.log("the updated limit/itemsPerPage is: ", itemsPerPage)
    }, [itemsPerPage])
    
    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator animating={true} size="large" style={styles.loader} />
            ) : (
                <>
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
                        keyExtractor={(item) => item.id}
                        style={styles.list}
                    />

                    {/* Pagination remains fixed */}
                    <DataTable.Pagination
                        page={currentPage - 1}
                        numberOfPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page + 1)}
                        label={`Page ${currentPage} of ${totalPages}`}
                        showFastPaginationControls
                        numberOfItemsPerPage={itemsPerPage}
                        selectPageDropdownLabel={'Rows per page'}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        marginTop: 20,
    },
    list: {
        flex: 1,
    },
});

export default ReservationsTable;


// components/admin/cms/reservations/ReservationsTable.js
// import React from 'react';
// import { View, FlatList, StyleSheet } from 'react-native';
// import { Checkbox, Text, IconButton } from 'react-native-paper';

// const ReservationsTable = ({
//   reservations,
//   loading,
//   selectedReservations,
//   toggleSelection,
//   selectAll,
//   deselectAll,
//   openReservationDetails,
//   handleDeleteReservation,
// }) => {
//   const allSelected = reservations.length > 0 && reservations.every((res) => selectedReservations.includes(res.id));

//   const renderItem = ({ item }) => (
//     <View style={styles.row}>
//       <Checkbox
//         status={selectedReservations.includes(item.id) ? 'checked' : 'unchecked'}
//         onPress={() => toggleSelection(item.id)}
//         accessibilityLabel={`Select reservation ${item.id}`}
//       />
//       <View style={styles.info}>
//         <Text>{item.date} at {item.time}</Text>
//         <Text>{item.users.map(user => user.username).join(', ')}</Text>
//       </View>
//       <IconButton
//         icon="delete"
//         onPress={() => handleDeleteReservation(item)}
//         accessibilityLabel="Delete Reservation"
//       />
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Checkbox
//           status={allSelected ? 'checked' : 'unchecked'}
//           onPress={() => (allSelected ? deselectAll() : selectAll(reservations.map(res => res.id)))}
//           accessibilityLabel="Select All Reservations"
//         />
//         <Text style={styles.headerText}>Reservations</Text>
//       </View>
//       <FlatList
//         data={reservations}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         ListEmptyComponent={!loading && <Text>No reservations found.</Text>}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#F5F5F5',
//   },
//   headerText: {
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderBottomColor: '#E0E0E0',
//     borderBottomWidth: 1,
//   },
//   info: {
//     flex: 1,
//     marginLeft: 10,
//   },
// });

// export default ReservationsTable;
