import { Alert } from 'react-native';

const useCustomAlert = () => {

    const showAlert = ({ 
        title = '', 
        message = '', 
        successCallback = null, 
        failCallback = null, 
        successMessage = 'Success!', 
        failMessage = 'Failed!', 
        onSuccess = () => {}, 
        onFailure = (error) => {}, 
        onCancel = () => {},
        showCancelButton = true,
        okButtonText = 'OK',
        cancelButtonText = 'Cancel',
    }) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: cancelButtonText,
                    onPress: onCancel,
                    style: 'cancel',
                    isVisible: showCancelButton, // Conditionally show the cancel button
                },
                {
                    text: okButtonText,
                    onPress: async () => {
                        try {
                            if (successCallback) await successCallback();
                            Alert.alert(successMessage);
                            onSuccess();
                        } catch (error) {
                            Alert.alert(failMessage, error.message || 'An error occurred.');
                            onFailure(error);
                        }
                    }
                }
            ].filter(button => button.isVisible !== false) // Filter out any buttons that are set to not visible
        );
    };

    return {
        showAlert,
    };
};

export default useCustomAlert;
