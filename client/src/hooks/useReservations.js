import { useState, useEffect, useCallback } from 'react';
import { getPaginatedReservations } from '../utils/axios';
import { transformReservations } from '../utils/transformReservations';

const useReservations = (searchQuery, dateFilter, timeFilter, limit, showSnackbar) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  

  const prepareParams = (page) => {
    const params = { page, limit };

    // Add search query if present
    if (searchQuery) {
      params.search = searchQuery;
    }
  
    // Add date filters
    if (dateFilter) {
      if (dateFilter.single) {
        params.dateSingle = dateFilter.single;
      } else if (dateFilter.start && dateFilter.end) {
        params.dateStart = dateFilter.start;
        params.dateEnd = dateFilter.end;
      }
    }
  
    // Add time filters
    if (timeFilter) {
      if (timeFilter.single) {
        params.timeSingle = timeFilter.single;
      } else if (timeFilter.start && timeFilter.end) {
        params.timeStart = timeFilter.start;
        params.timeEnd = timeFilter.end;
      }
    }
    return params
  }

  const fetchReservations =  useCallback(async (page = 1) => {
    
    setLoading(true);
    try {
      // const response = await getPaginatedReservations({page, limit})
      const params = prepareParams(page)
      const response = await getPaginatedReservations(params)
      const transformed = transformReservations(response.data.data);
      setReservations(transformed);
      setTotalPages(response.data.totalPages);
      setTotalReservations(response.data.totalReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showSnackbar('Failed to load reservations.', 'error');
    } finally {
      setLoading(false);
    }
}, [limit, searchQuery, dateFilter, timeFilter, showSnackbar]);


useEffect(() => {
  console.log("Filters changed, resetting to page 1");
  setCurrentPage(1);
}, [searchQuery, dateFilter, timeFilter]);

  useEffect(() => {
    fetchReservations(currentPage);

  }, [currentPage, fetchReservations]);


  return {
    reservations,
    loading,
    totalPages,
    totalReservations,
    currentPage,
    setCurrentPage,
    fetchReservations,
    setReservations,
  };
};

export default useReservations;


// useEffect(() => {
//   fetchReservations(currentPage);
// }, [currentPage, searchQuery, dateFilter, timeFilter]);
