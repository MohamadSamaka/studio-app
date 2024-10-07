// components/ReservationModal/ReservationModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const ReservationModal = ({ visible, slot, onClose }) => {
  const { t } = useTranslation(); // Initialize translation function
  if (!slot) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {t('reservationScreen.reservationsFor', { time: slot.time })}
          </Text>
          <ScrollView>
            {slot.nameList.map((name, index) => (
              <View key={index} style={styles.modalItem}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarText}>
                    {name[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.modalName}>{name}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>
              {t('reservationScreen.close')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#17A2B8',
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#17A2B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalName: {
    fontSize: 16,
    color: '#343A40',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#17A2B8',
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    width: '50%',
    shadowColor: '#17A2B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ReservationModal;
