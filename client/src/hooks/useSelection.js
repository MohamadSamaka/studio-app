import { useState } from 'react';

const useSelection = () => {
  const [selectedReservations, setSelectedReservations] = useState([]);

  const toggleSelection = (id) => {
    setSelectedReservations((prev) =>
      prev.includes(id) ? prev.filter((resId) => resId !== id) : [...prev, id]
    );
  };

  const selectAll = (reservations) => {
    const allIds = reservations.map((res) => res.id);
    setSelectedReservations(allIds);
  };

  const deselectAll = () => {
    setSelectedReservations([]);
  };

  return {
    selectedReservations,
    toggleSelection,
    selectAll,
    deselectAll,
    setSelectedReservations,
  };
};

export default useSelection;
