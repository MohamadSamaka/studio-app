import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Searchbar,
  Provider as PaperProvider,
  IconButton,
  Snackbar,
} from "react-native-paper";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import debounce from 'lodash.debounce'; // <-- Import debounce here


// Import components and hooks
import AppBar from "../../components/common/AppBar";
import ReservationDetailsModal from "../../components/admin/cms/reservations/ReservationDetailsModal";
import FilterModal from "../../components/admin/cms/reservations/FilterModal";
import FilterChips from "../../components/admin/cms/reservations/FilterChips";
import ActionButtons from "../../components/admin/cms/reservations/ActionButtons";
import ReservationsTable from "../../components/admin/cms/reservations/ReservationsTable";
import useReservations from "../../hooks/useReservations";
import useFilters from "../../hooks/useFilters";
import useSelection from "../../hooks/useSelection";
import useSnackbar from "../../hooks/useSnackbar";
import {
  deleteReservation,
  removeUserFromReservation,
} from "../../utils/axios";

const ReservationsManagementScreen = () => {
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  // Items Per Page
  const [limit] = useState(10);

  // Snackbar Hook
  const { snackbar, showSnackbar, onDismissSnackbar } = useSnackbar();

  // Filters Hook
  const {
    filterModalVisible,
    openFilterModal,
    closeFilterModal,
    filterType,
    setFilterType,
    isDateRange,
    setIsDateRange,
    dateFilter,
    tempDateFilter,
    setTempDateFilter,
    isTimeRange,
    setIsTimeRange,
    timeFilter,
    tempTimeFilter,
    setTempTimeFilter,
    showSingleDatePicker,
    setShowSingleDatePicker,
    showDatePickerStart,
    setShowDatePickerStart,
    showDatePickerEnd,
    setShowDatePickerEnd,
    showSingleTimePicker,
    setShowSingleTimePicker,
    showTimePickerStart,
    setShowTimePickerStart,
    showTimePickerEnd,
    setShowTimePickerEnd,
    handleDateChange,
    handleTimeChange,
    applyFiltersFromModal,
    resetFilters,
    resetDateFilter,
    resetTimeFilter,
  } = useFilters(() => setCurrentPage(1), showSnackbar);

  // Reservations Hook
  const {
    reservations,
    loading,
    totalPages,
    currentPage,
    setCurrentPage,
    fetchReservations,
    setReservations,
  } = useReservations(searchQuery, dateFilter, timeFilter, limit, showSnackbar);

  // Selection Hook
  const {
    selectedReservations,
    toggleSelection,
    selectAll,
    deselectAll,
    setSelectedReservations,
  } = useSelection();

  // Modal States
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [removingUser, setRemovingUser] = useState(false);

  // Handler for search input changes
  // const onChangeSearch = (query) => {
  //   setSearchQuery(query);
  //   setCurrentPage(1);
  // };

  const onChangeSearch = (query) => {
    debouncedSearch(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Open reservation details modal
  const openReservationDetails = (reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  // Close reservation details modal
  const closeReservationDetails = () => {
    setSelectedReservation(null);
    setModalVisible(false);
  };

  // Handle cancellation of selected reservations
  const handleCancelReservations = () => {
    if (selectedReservations.length === 0) {
      Alert.alert(
        "No Selection",
        "Please select at least one reservation to cancel."
      );
      return;
    }

    Alert.alert(
      "Confirm Cancellation",
      `Are you sure you want to cancel ${selectedReservations.length} reservation(s)?`,
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: cancelReservations },
      ]
    );
  };

  // Cancel selected reservations
  const cancelReservations = async () => {
    setCancelling(true);
    try {
      const deletePromises = selectedReservations.map((id) =>
        deleteReservation(id)
      );
      await Promise.all(deletePromises);
      setReservations((prev) =>
        prev.filter((res) => !selectedReservations.includes(res.id))
      );
      setSelectedReservations([]);
      showSnackbar("Selected reservations have been canceled.", "success");
      fetchReservations(currentPage);
    } catch (error) {
      console.error("Error cancelling reservations:", error);
      showSnackbar("Failed to cancel reservations.", "error");
    } finally {
      setCancelling(false);
    }
  };

  // Handle deletion of a single reservation
  const handleDeleteReservation = (reservation) => {
    // const test = reservation.id.split('-')[0]
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the reservation on ${moment(
        reservation.date,
        "YYYY-MM-DD"
      ).format("MM/DD/YYYY")} at ${moment(reservation.time, "HH:mm").format(
        "hh:mm A"
      )}?`,
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => deleteReservationById(reservation.id) },
      ]
    );
  };

  // Delete a reservation by ID
  const deleteReservationById = async (id) => {
    // const reservationId = id.split('-')[0]
    setCancelling(true);
    try {
      await deleteReservation(id);
      setReservations((prev) => prev.filter((res) => res.id !== id));
      showSnackbar("Reservation deleted successfully.", "success");
      fetchReservations(currentPage);
    } catch (error) {
      console.error("Error deleting reservation:", error);
      showSnackbar("Failed to delete reservation.", "error");
    } finally {
      setCancelling(false);
    }
  };

  // Handle removal of a user from a reservation
  const handleRemoveUser = (user) => {
    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove ${user.username} from this reservation?`,
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => removeUser(user) },
      ]
    );
  };

  // Remove a user from the selected reservation
  const removeUser = async ({ username, id }) => {
    if (!selectedReservation) return;
    setRemovingUser(true);
    try {
      await removeUserFromReservation(selectedReservation.id, id);
      setReservations((prev) =>
        prev
          .map((res) => {
            if (res.id === selectedReservation.id) {
              const updatedUsers = res.users.filter((user) => user.id !== id);
              if (updatedUsers.length === 0) {
                // Return `null` or `undefined` to mark this reservation for removal
                return null;
              }
              return { ...res, users: updatedUsers };
            }
            return res;
          })
          .filter((res) => res !== null)
      );
      showSnackbar(`${username} removed from reservation.`, "success");
      setSelectedReservation((prev) => ({
        ...prev,
        users: prev.users.filter((user) => user.username !== username),
      }));
    } catch (error) {
      console.error("Error removing user:", error);
      showSnackbar("Failed to remove user.", "error");
    } finally {
      setRemovingUser(false);
    }
  };

  return (
    <PaperProvider>
      <AppBar title="Reservations Management" />
      <View style={styles.container}>
        {/* Top Bar with Search and Filter */}
        <View style={styles.topBar}>
          <Searchbar
            placeholder="Search by username"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon={({ size, color }) => (
              <Feather name="search" size={size} color={color} />
            )}
            accessibilityLabel="Search by username"
          />
          <IconButton
            icon={({ size, color }) => (
              <MaterialIcons name="filter-list" size={size} color={color} />
            )}
            onPress={openFilterModal}
            accessibilityLabel="Open Filters"
          />
        </View>

        {/* Display Active Filters as Chips */}
        <FilterChips
          dateFilter={dateFilter}
          timeFilter={timeFilter}
          openFilterModal={openFilterModal}
          resetDateFilter={resetDateFilter}
          resetTimeFilter={resetTimeFilter}
        />

        {/* Action Buttons */}
        <ActionButtons
          handleCancelReservations={handleCancelReservations}
          selectedReservations={selectedReservations}
          cancelling={cancelling}
          loading={loading}
          fetchReservations={fetchReservations}
          currentPage={currentPage}
        />

        {/* Reservations Table */}
        <ReservationsTable
          reservations={reservations}
          loading={loading}
          selectedReservations={selectedReservations}
          toggleSelection={toggleSelection}
          selectAll={selectAll}
          deselectAll={deselectAll}
          openReservationDetails={openReservationDetails}
          handleDeleteReservation={handleDeleteReservation}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          itemsPerPage={limit}
        />

        {!loading && reservations.length === 0 && (
          <View style={styles.noDataContainer}>
            <Text>No reservations found matching your criteria.</Text>
          </View>
        )}

        {/* Reservation Details Modal */}
        <ReservationDetailsModal
          visible={modalVisible}
          onDismiss={closeReservationDetails}
          reservation={selectedReservation}
          handleRemoveUser={handleRemoveUser}
        />

        {/* Filter Modal */}
        <FilterModal
          visible={filterModalVisible}
          onDismiss={closeFilterModal}
          filterType={filterType}
          setFilterType={setFilterType}
          isDateRange={isDateRange}
          setIsDateRange={setIsDateRange}
          isTimeRange={isTimeRange}
          setIsTimeRange={setIsTimeRange}
          tempDateFilter={tempDateFilter}
          setTempDateFilter={setTempDateFilter}
          tempTimeFilter={tempTimeFilter}
          setTempTimeFilter={setTempTimeFilter}
          showSingleDatePicker={showSingleDatePicker}
          setShowSingleDatePicker={setShowSingleDatePicker}
          showDatePickerStart={showDatePickerStart}
          setShowDatePickerStart={setShowDatePickerStart}
          showDatePickerEnd={showDatePickerEnd}
          setShowDatePickerEnd={setShowDatePickerEnd}
          showSingleTimePicker={showSingleTimePicker}
          setShowSingleTimePicker={setShowSingleTimePicker}
          showTimePickerStart={showTimePickerStart}
          setShowTimePickerStart={setShowTimePickerStart}
          showTimePickerEnd={showTimePickerEnd}
          setShowTimePickerEnd={setShowTimePickerEnd}
          handleDateChange={handleDateChange}
          handleTimeChange={handleTimeChange}
          applyFiltersFromModal={applyFiltersFromModal}
          resetFilters={resetFilters}
        />

        {/* Snackbar for Notifications */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={onDismissSnackbar}
          duration={3000}
          style={
            snackbar.type === "error"
              ? styles.snackbarError
              : styles.snackbarSuccess
          }
        >
          {snackbar.message}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  snackbarSuccess: {
    backgroundColor: "#4CAF50",
  },
  snackbarError: {
    backgroundColor: "#F44336",
  },
});

export default ReservationsManagementScreen;
