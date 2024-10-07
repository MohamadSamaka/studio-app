import { Alert } from 'react-native';

export const showConfirmationAlert = ({
  title,
  message,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  cancelable = false,
}) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: onCancel,
        style: 'cancel',
      },
      {
        text: confirmText,
        onPress: onConfirm,
      },
    ],
    { cancelable }
  );
};
