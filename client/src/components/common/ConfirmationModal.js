// // import React from 'react';
// // import { Modal, View, Text, StyleSheet } from 'react-native';
// // import { Button, useTheme } from 'react-native-paper';

// // const ConfirmationModal = ({
// //   visible,
// //   onRequestClose,
// //   title,
// //   message,
// //   confirmText,
// //   cancelText,
// //   onConfirm,
// //   onCancel,
// // }) => {
// //   const theme = useTheme();
// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent={true}
// //       onRequestClose={onRequestClose}
// //       animationType="fade"
// //     >
// //       <View style={styles.overlay}>
// //         <View
// //           style={[
// //             styles.container,
// //             { backgroundColor: theme.colors.background },
// //           ]}
// //         >
// //           <Text style={[styles.title, { color: theme.colors.text }]}>
// //             {title}
// //           </Text>
// //           <Text style={[styles.message, { color: theme.colors.text }]}>
// //             {message}
// //           </Text>
// //           <View style={styles.buttons}>
// //             <Button
// //               mode="contained"
// //               onPress={onConfirm}
// //               style={[
// //                 styles.button,
// //                 { backgroundColor: theme.colors.primary },
// //               ]}
// //               labelStyle={styles.buttonText}
// //               contentStyle={styles.buttonContent}
// //             >
// //               {confirmText}
// //             </Button>
// //             <Button
// //               mode="outlined"
// //               onPress={onCancel}
// //               style={styles.button}
// //               labelStyle={styles.buttonText}
// //               contentStyle={styles.buttonContent}
// //             >
// //               {cancelText}
// //             </Button>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //   },
// //   container: {
// //     width: '85%',
// //     padding: 20,
// //     borderRadius: 12,
// //     elevation: 5,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: '600',
// //     marginBottom: 12,
// //     textAlign: 'center',
// //   },
// //   message: {
// //     fontSize: 16,
// //     marginBottom: 20,
// //     textAlign: 'center',
// //   },
// //   buttons: {
// //     flexDirection: 'column',
// //     alignItems: 'stretch',
// //   },
// //   button: {
// //     marginBottom: 10,
// //   },
// //   buttonText: {
// //     fontSize: 16,
// //   },
// //   buttonContent: {
// //     height: 50,
// //   },
// // });

// // export default ConfirmationModal;


// // components/common/ConfirmationModal.js

// import React from 'react';
// import { Modal, View, Text, StyleSheet } from 'react-native';
// import { Button, useTheme } from 'react-native-paper';

// const ConfirmationModal = ({
//   visible,
//   onRequestClose,
//   title,
//   message,
//   confirmText,
//   cancelText,
//   onConfirm,
//   onCancel,
// }) => {
//   const theme = useTheme();
//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       onRequestClose={onRequestClose}
//       animationType="fade"
//     >
//       <View style={styles.overlay}>
//         <View
//           style={[
//             styles.container,
//             { backgroundColor: theme.colors.background },
//           ]}
//         >
//           <Text style={[styles.title, { color: theme.colors.text }]}>
//             {title}
//           </Text>
//           <Text style={[styles.message, { color: theme.colors.text }]}>
//             {message}
//           </Text>
//           <View style={styles.buttons}>
//             <Button
//               mode="contained"
//               onPress={onConfirm}
//               style={[
//                 styles.button,
//                 { backgroundColor: theme.colors.primary },
//               ]}
//               labelStyle={styles.buttonText}
//               contentStyle={styles.buttonContent}
//             >
//               {confirmText}
//             </Button>
//             <Button
//               mode="outlined"
//               onPress={onCancel}
//               style={styles.button}
//               labelStyle={styles.buttonText}
//               contentStyle={styles.buttonContent}
//             >
//               {cancelText}
//             </Button>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   container: {
//     width: '85%',
//     padding: 20,
//     borderRadius: 12,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   message: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   buttons: {
//     flexDirection: 'column', // Stack buttons vertically
//     alignItems: 'stretch',
//   },
//   button: {
//     marginBottom: 10,
//   },
//   buttonText: {
//     fontSize: 16,
//   },
//   buttonContent: {
//     height: 50,
//   },
// });

// export default ConfirmationModal;


import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const ConfirmationModal = ({
  visible,
  onRequestClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>{cancelText || t("Cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{confirmText || t("Confirm")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#00adf5",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ConfirmationModal;
