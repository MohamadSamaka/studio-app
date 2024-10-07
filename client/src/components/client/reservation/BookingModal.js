// components/BookingModal/BookingModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const BookingModal = ({ visible, booking, onCancel, onClose }) => {
  const { t } = useTranslation(); // Initialize translation function

  return (<Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {t('reservationScreen.yourCurrentBooking')}
        </Text>
        <View style={styles.bookingInfo}>
          <MaterialIcons name="event" size={24} color="#4682B4" />
          <Text style={styles.bookingText}>
            {booking
              ? `${booking.date} at ${booking.time}`
              : t('reservationScreen.noCurrentBooking')}
          </Text>
        </View>
        {booking && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>
              {t('reservationScreen.cancelBooking')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>
            {t('reservationScreen.close')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bookingModalGradient: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#17A2B8',
    textAlign: 'center',
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  bookingText: {
    fontSize: 18,
    color: '#343A40',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#DC3545', // Red for cancel actions
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#17A2B8',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingModal;
