import React, { useEffect, useState } from 'react';
import { Portal, Snackbar, Button, Card, FAB, TextInput, Provider as PaperProvider, IconButton, Text, Switch } from 'react-native-paper';

import { View, FlatList, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';

import { theme } from '../../utils/theme';
import styles from '../../styles/admin/subscriptionsManagementStyles';
import { createSubscription, deleteSubscription, getSubscriptions, updateSubscription } from '../../utils/axios'; // Adjust your API calls accordingly
import AppBar from '../../components/common/AppBar';

const SubscriptionManagementScreen = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newSubscription, setNewSubscription] = useState({ subscription_name: "", meetings_num: 0, price: 1.0, active: true });
    const [alert, setAlert] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await getSubscriptions();
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            setAlert({ visible: true, message: 'Error fetching subscriptions', type: 'error' });
        }
    };

    const handleAddSubscription = async () => {
        if (newSubscription.price < 1) {
            setAlert({ visible: true, message: 'Price cannot be less than ₪1', type: 'error' });
            return;
        }
        try {
            await createSubscription(newSubscription);
            setIsModalVisible(false);
            fetchSubscriptions();
            setAlert({ visible: true, message: 'Subscription added successfully', type: 'success' });
        } catch (error) {
            console.error('Error adding subscription:', error);
            setAlert({ visible: true, message: 'Error adding subscription', type: 'error' });
        }
    };

    const handleUpdateSubscription = async () => {
        if (selectedSubscription.price < 1) {
            setAlert({ visible: true, message: 'Price cannot be less than ₪1', type: 'error' });
            return;
        }
        try {
            await updateSubscription(selectedSubscription.id, selectedSubscription);
            setIsModalVisible(false);
            fetchSubscriptions();
            setAlert({ visible: true, message: 'Subscription updated successfully', type: 'success' });
        } catch (error) {
            console.error('Error updating subscription:', error);
            setAlert({ visible: true, message: 'Error updating subscription', type: 'error' });
        }
    };

    const handleDeleteSubscription = (id) => {
        Alert.alert(
            'Delete Subscription',
            'Are you sure you want to delete this subscription?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => deleteSubscriptionById(id),
                },
            ],
            { cancelable: true }
        );
    };

    const deleteSubscriptionById = async (id) => {
        try {
            await deleteSubscription(id);
            fetchSubscriptions();
            setAlert({ visible: true, message: 'Subscription deleted successfully', type: 'success' });
        } catch (error) {
            console.error('Failed to delete subscription:', error);
            setAlert({ visible: true, message: 'Error deleting subscription', type: 'error' });
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.subscriptionCard}>
            <TouchableOpacity onPress={() => setSelectedSubscription(item)} style={styles.row}>
                <Text style={styles.cell}>{item.subscription_name}</Text>
                <Text style={styles.cell}>{item.meetings_num}</Text>
                <Text style={styles.cell}>₪ {item.price.toFixed(2)}</Text>
                <View style={styles.actions}>
                    <IconButton
                        icon="pencil"
                        size={20}
                        color={theme.colors.primary}
                        onPress={() => {
                            setSelectedSubscription(item);
                            setIsModalVisible(true);
                        }}
                    />
                    <IconButton
                        icon="delete"
                        size={20}
                        color={theme.colors.error}
                        onPress={() => handleDeleteSubscription(item.id)}
                    />
                </View>
            </TouchableOpacity>
        </Card>
    );

    const handleNumberOfMeetingsChange = (value) => {
        let meetingNumb = parseFloat(value);
        if (isNaN(meetingNumb) || meetingNumb < 1) {
            meetingNumb = 1; // Minimum price set to 1
        }


        if (selectedSubscription) {
            setSelectedSubscription({ ...selectedSubscription, meetings_num: parseInt(meetingNumb) })
        } else {
            setNewSubscription({ ...newSubscription, meetings_num: parseInt(meetingNumb) });
        }
    }

    const handlePriceChange = (value) => {
        let price = parseFloat(value);
        if (isNaN(price) || price < 1) {
            price = 1; // Minimum price set to 1
        }
        if (selectedSubscription) {
            setSelectedSubscription({ ...selectedSubscription, price });
        } else {
            setNewSubscription({ ...newSubscription, price });
        }
    };

    return (
    <>
        <PaperProvider theme={theme}>
            <AppBar />
            <View style={styles.container}>
                {/* Header Row for Column Titles */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Name</Text>
                    <Text style={styles.headerText}>Meetings #</Text>
                    <Text style={styles.headerText}>Cost</Text>
                    <Text style={styles.headerText}>Actions</Text>
                </View>

                <FlatList
                    data={subscriptions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
                <FAB
                    style={styles.fab}
                    icon="plus"
                    onPress={() => {
                        setNewSubscription({ meetings_num: 0, price: 1.0, active: true });
                        setSelectedSubscription(null);
                        setIsModalVisible(true);
                    }}
                />
            </View>

            {/* Modal */}
            <Portal>
                <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContainer}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {selectedSubscription ? 'Edit Subscription' : 'Add New Subscription'}
                            </Text>
                            <TextInput
                                label="Name"
                                value={selectedSubscription ? selectedSubscription.subscription_name : newSubscription.subscription_name}
                                onChangeText={(value) =>
                                    selectedSubscription
                                        ? setSelectedSubscription({ ...selectedSubscription, subscription_name: value })
                                        : setNewSubscription({ ...newSubscription, subscription_name: value })
                                }
                                style={styles.input}
                                mode="outlined"
                            />
                            <TextInput
                                label="Number of Meetings"
                                value={(selectedSubscription ? selectedSubscription.meetings_num : newSubscription.meetings_num).toString()}
                                onChangeText={(text) => handleNumberOfMeetingsChange(text)}
                                keyboardType="numeric"
                                style={styles.input}
                                mode="outlined"
                            />
                            <TextInput
                                label="Price"
                                value={(selectedSubscription ? selectedSubscription.price : newSubscription.price).toString()}
                                onChangeText={(text) => handlePriceChange(text)}
                                keyboardType="decimal-pad"
                                style={styles.input}
                                mode="outlined"
                            />
                            <View style={styles.switchContainer}>
                                <Text>Active</Text>
                                <Switch
                                    value={selectedSubscription ? selectedSubscription.active : newSubscription.active}
                                    onValueChange={(value) =>
                                        selectedSubscription
                                            ? setSelectedSubscription({ ...selectedSubscription, active: value })
                                            : setNewSubscription({ ...newSubscription, active: value })
                                    }
                                />
                            </View>
                            <Button
                                mode="contained"
                                onPress={selectedSubscription ? handleUpdateSubscription : handleAddSubscription}
                                style={styles.saveButton}
                            >
                                Save
                            </Button>
                            <Button mode="outlined" onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                                Cancel
                            </Button>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </Portal>

            {/* Snackbar inside its own Portal */}
            <Portal>
                <Snackbar
                    visible={alert.visible}
                    onDismiss={() => setAlert({ ...alert, visible: false })}
                    duration={3000}
                    style={[
                        alert.type === 'error' ? styles.errorSnackbar : styles.successSnackbar,
                        styles.snackbar,  // Adjusted styles for higher zIndex and position
                    ]}
                >
                    {alert.message}
                </Snackbar>
            </Portal>
        </PaperProvider>
    </>
);
    
    
   


};

export default SubscriptionManagementScreen;