// CustomPagination.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons'; // For Expo
import PropTypes from 'prop-types';
import { theme } from '../../../../utils/theme';

const CustomPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
}) => {
  const goToFirstPage = () => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToLastPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(totalPages);
    }
  };

  return (
    <View style={styles.paginationContainer}>
      <IconButton
        icon={() => <MaterialIcons name="first-page" size={24} color={theme.colors.primary} />}
        onPress={goToFirstPage}
        disabled={currentPage === 1}
        accessibilityLabel="First Page"
      />
      <IconButton
        icon={() => <MaterialIcons name="chevron-left" size={24} color={theme.colors.primary} />}
        onPress={goToPreviousPage}
        disabled={currentPage === 1}
        accessibilityLabel="Previous Page"
      />
      <Text style={styles.label}>{`Page ${currentPage} of ${totalPages}`}</Text>
      <IconButton
        icon={() => <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />}
        onPress={goToNextPage}
        disabled={currentPage === totalPages}
        accessibilityLabel="Next Page"
      />
      <IconButton
        icon={() => <MaterialIcons name="last-page" size={24} color={theme.colors.primary} />}
        onPress={goToLastPage}
        disabled={currentPage === totalPages}
        accessibilityLabel="Last Page"
      />
    </View>
  );
};

CustomPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
  },
  label: {
    marginHorizontal: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default CustomPagination;
