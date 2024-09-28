import React from 'react';
import { View, Modal } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { globalStyles } from '../../../../styles/styles';

const UserModal = ({ visible, onClose, title, children }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContent}>
          <Text style={globalStyles.modalTitle}>{title}</Text>
          {children}
          <Button mode="outlined" onPress={onClose} style={globalStyles.button}>
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default UserModal;