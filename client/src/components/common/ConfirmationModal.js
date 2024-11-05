// ConfirmationModal.js
import React from "react";
import { StyleSheet } from "react-native";
import { Portal, Dialog, Text, Button } from "react-native-paper";

const ConfirmationModal = ({
  visible,
  onDismiss,
  onConfirm,
  onCancel, // Added onCancel prop
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "No",
  confirmColor = "red",
}) => {
  // If onCancel is not provided, default it to onDismiss
  const handleCancel = onCancel || onDismiss;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleCancel}>{cancelText}</Button> {/* Mapped to handleCancel */}
          <Button onPress={onConfirm} color={confirmColor}>
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  // Add any custom styles if needed
});

export default ConfirmationModal;
