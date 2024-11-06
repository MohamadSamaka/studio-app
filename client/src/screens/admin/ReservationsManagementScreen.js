// ReservationsManagementScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  Searchbar,
  IconButton,
  Snackbar,
  ActivityIndicator,
  Portal,
  Dialog,
  Button,
} from "react-native-paper";
import { theme } from "../../utils/theme";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import moment from "moment";
import debounce from "lodash.debounce";

// Import components and hooks
import AppBar from "../../components/common/AppBar";
import NewReservationModal from "../../components/admin/cms/reservations/NewReservationModal";
import ReservationDetailsModal from "../../components/admin/cms/reservations/ReservationDetailsModal";
import FilterModal from "../../components/admin/cms/reservations/FilterModal";
import FilterChips from "../../components/admin/cms/reservations/FilterChips";
import ActionButtons from "../../components/admin/cms/reservations/ActionButtons";
import ReservationsTable from "../../components/admin/cms/reservations/ReservationsTable";
import useReservations from "../../hooks/useReservations";
import useFilters from "../../hooks/useFilters";
import useSelection from "../../hooks/useSelection";
import useSnackbar from "../../hooks/useSnackbar";
import { useConfigContext } from "../../contexts/ConfigContext";
import {
  createReservationSlot,
  deleteReservation,
  removeUserFromReservation,
} from "../../utils/axios";

const ReservationsManagementScreen = () => {
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const { config, loading: configLoading } = useConfigContext();
  const [maxUsersPerSlot, setMaxUsersPerSlot] = useState(null);
  const [slotDuration, setSlotDuration] = useState(null);

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
  const [newReservationModalVisible, setNewReservationModalVisible] =
    useState(false);

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
  } = useReservations(
    searchQuery,
    dateFilter,
    timeFilter,
    limit,
    showSnackbar
  );

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

  // State for Delete Confirmation Dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  // New State Variables for Dialogs
  const [confirmCancelDialogVisible, setConfirmCancelDialogVisible] = useState(false);
  const [noSelectionSnackbarVisible, setNoSelectionSnackbarVisible] = useState(false);

  // Handler for search input changes
  const onChangeSearch = (query) => {
    debouncedSearch(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (config && config.reservations) {
      setMaxUsersPerSlot(config.reservations["max-users-per-reservation"]);
      setSlotDuration(config.reservations["timeslots-duration"]);
    }
  }, [config]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const openReservationDetails = (reservation) => {
    if (!reservation) {
      console.warn(
        "openReservationDetails called with undefined reservation."
      );
      return;
    }
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  // Close reservation details modal
  const closeReservationDetails = () => {
    setSelectedReservation(null);
    setModalVisible(false);
  };

  const handleAddReservation = async (newReservationData) => {
    try {
      // Call your API or function to add the new reservation
      await createReservationSlot(newReservationData); // Uncomment and implement this

      showSnackbar("New reservation added successfully.", "success");
      setNewReservationModalVisible(false);
      fetchReservations(currentPage); // Refresh reservations list
    } catch (error) {
      console.error("Error adding reservation:", error);
      showSnackbar("Failed to add new reservation.", "error");
    }
  };

  // Handle cancellation of selected reservations
  const handleCancelReservations = () => {
    if (selectedReservations.length === 0) {
      // Show Snackbar instead of Alert
      setNoSelectionSnackbarVisible(true);
      return;
    }

    // Show Confirmation Dialog
    setConfirmCancelDialogVisible(true);
  };

  // Cancel selected reservations
  const cancelReservations = async () => {
    setCancelling(true);
    try {
      // Perform deletion for each selected reservation
      const deletePromises = selectedReservations.map((id) =>
        deleteReservation(id)
      );

      await Promise.all(deletePromises);

      // Update reservations state by removing cancelled reservations
      setReservations((prev) =>
        prev.filter((res) => !selectedReservations.includes(res.id))
      );

      // Clear selection
      setSelectedReservations([]);

      showSnackbar("Selected reservations have been canceled.", "success");
      fetchReservations(currentPage);
    } catch (error) {
      console.error("Error cancelling reservations:", error);
      showSnackbar("Failed to cancel some reservations.", "error");
    } finally {
      setCancelling(false);
    }
  };

  // Handler for delete reservation with confirmation dialog
  const handleDeleteReservation = (reservation) => {
    console.log("handleDeleteReservation called for reservation ID:", reservation.id);
    setReservationToDelete(reservation);
    setDeleteDialogVisible(true);
  };

  // Function to confirm deletion
  const confirmDeleteReservation = () => {
    if (reservationToDelete) {
      deleteReservationById(reservationToDelete.id);
      // Reset the reservation to delete
      setReservationToDelete(null);
      setDeleteDialogVisible(false);
    }
  };

  // Function to cancel deletion
  const cancelDeleteReservation = () => {
    setReservationToDelete(null);
    setDeleteDialogVisible(false);
  };

  // Delete a reservation by ID
  const deleteReservationById = async (id) => {
    console.log("Deleting reservation with ID:", id);
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
              const updatedParticipants = res.participants.filter(
                (user) => user.id !== id
              );
              return { ...res, participants: updatedParticipants };
            }
            return res;
          })
          .filter((res) => res !== null)
      );
      showSnackbar(`${username} removed from reservation.`, "success");
      fetchReservations(currentPage);
      setSelectedReservation((prev) => ({
        ...prev,
        participants: prev.participants.filter(
          (user) => user.username !== username
        ),
      }));
    } catch (error) {
      console.error("Error removing user:", error);
      showSnackbar("Failed to remove user.", "error");
    } finally {
      setRemovingUser(false);
    }
  };

  return (
    <>
      <AppBar title="Reservations Management" />
      <View style={styles.container}>
        {/* Show Loading Indicator if configLoading or loading is true */}
        {(configLoading || loading) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Top Bar with Search and Actions */}
            <View style={styles.topBar}>
              <Searchbar
                placeholder="Search By Username"
                onChangeText={onChangeSearch}
                value={searchQuery}
                style={styles.searchBar}
                icon={() => (
                  <Feather
                    name="search"
                    size={20}
                    color={theme.colors.placeholder}
                  />
                )}
                accessibilityLabel={"Search By Username"}
              />

              <IconButton
                icon={() => (
                  <MaterialIcons
                    name="filter-list"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
                onPress={openFilterModal}
                accessibilityLabel="Open Filters"
              />

              <IconButton
                icon={() => (
                  <MaterialIcons
                    name="add"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
                onPress={() => setNewReservationModalVisible(true)}
                accessibilityLabel="Add New Reservation"
              />
            </View>

            {/* New Reservation Modal */}
            <NewReservationModal
              visible={newReservationModalVisible}
              onDismiss={() => setNewReservationModalVisible(false)}
              onAddReservation={handleAddReservation}
              maxUsersPerSlot={maxUsersPerSlot}
              slotDuration={slotDuration}
            />

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
            {!loading && reservations.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text>No reservations found matching your criteria.</Text>
              </View>
            ) : (
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
            )}

            {/* Reservation Details Modal */}
            {selectedReservation && (
              <ReservationDetailsModal
                visible={modalVisible}
                onDismiss={closeReservationDetails}
                reservation={selectedReservation}
                handleRemoveUser={handleRemoveUser}
              />
            )}

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
          </>
        )}

        {/* Confirmation Dialog for Canceling Reservations */}
        <Portal>
          <Dialog
            visible={confirmCancelDialogVisible}
            onDismiss={() => setConfirmCancelDialogVisible(false)}
          >
            <Dialog.Title>Confirm Cancellation</Dialog.Title>
            <Dialog.Content>
              <Text>
                Are you sure you want to cancel {selectedReservations.length} reservation(s)?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmCancelDialogVisible(false)}>No</Button>
              <Button onPress={() => { 
                setConfirmCancelDialogVisible(false); 
                cancelReservations(); 
              }}>Yes</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog
            visible={deleteDialogVisible}
            onDismiss={cancelDeleteReservation}
          >
            <Dialog.Title>Delete Reservation</Dialog.Title>
            <Dialog.Content>
              <Text>
                Are you sure you want to delete this reservation on{" "}
                {reservationToDelete
                  ? moment(reservationToDelete.date, "YYYY-MM-DD").format("MM/DD/YYYY")
                  : ""}{" "}
                at{" "}
                {reservationToDelete
                  ? moment(reservationToDelete.time, "HH:mm").format("hh:mm A")
                  : ""}{" "}
                ?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={cancelDeleteReservation}>Cancel</Button>
              <Button onPress={confirmDeleteReservation}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* "No Selection" Snackbar */}
        <Snackbar
          visible={noSelectionSnackbarVisible}
          onDismiss={() => setNoSelectionSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbarError}
        >
          Please select at least one reservation to cancel.
        </Snackbar>

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen
    padding: 10,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    backgroundColor: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  snackbarSuccess: {
    backgroundColor: theme.colors.success,
  },
  snackbarError: {
    backgroundColor: theme.colors.error,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});

export default ReservationsManagementScreen;