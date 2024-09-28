import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, IconButton, Portal, Modal, Snackbar, Chip, Provider as PaperProvider, Dialog, Paragraph, Searchbar, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppBar from '../../components/common/AppBar';
import { theme } from '../../utils/theme';
import { getRechargeCreditRequests, updateRechargeRequestStatus } from '../../utils/axios';

const RechargeRequestsManagementScreen = () => {
    const [rechargeRequests, setRechargeRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);
    const [currentStatusUpdate, setCurrentStatusUpdate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    useEffect(() => {
        fetchRechargeRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [rechargeRequests, searchQuery, statusFilter]);

    const fetchRechargeRequests = async () => {
        try {
            const response = await getRechargeCreditRequests();
            setRechargeRequests(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching recharge requests:', error);
        }
    };

    // const filterRequests = () => {
    //     let filtered = rechargeRequests;

    //     // Filter by status
    //     if (statusFilter !== 'all') {
    //         filtered = filtered.filter(request => request.status === statusFilter);
    //     }

    //     // Filter by search query (username)
    //     if (searchQuery) {
    //         filtered = filtered.filter(request =>
    //             request.User.username.toLowerCase().includes(searchQuery.toLowerCase())
    //         );
    //     }

    //     // Filter for today and future dates
    //     const today = new Date().setHours(0, 0, 0, 0);
    //     filtered = filtered.filter(request => new Date(request.date) >= today);

    //     setFilteredRequests(filtered);
    // };

    const filterRequests = () => {
        let filtered = rechargeRequests;
    
        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(request => request.status === statusFilter);
        }
    
        // Filter by search query (username)
        if (searchQuery) {
            filtered = filtered.filter(request =>
                request.User.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    
        // No date filtering - allow all dates
        setFilteredRequests(filtered);
    };
    

    const handleStatusChange = async (id, status) => {
        try {
            await updateRechargeRequestStatus(id, { status });
            setSnackbarMessage(`Status updated to ${getHumanReadableStatus(status)}`);
            setSnackbarVisible(true);
            fetchRechargeRequests();
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error updating recharge request status:', error);
        }
    };

    const getHumanReadableStatus = (status) => {
        switch (status) {
            case 'success':
                return 'Success';
            case 'failed':
                return 'Failed';
            case 'awaiting_payment':
                return 'Awaiting';
            case 'pending':
            default:
                return 'Pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return 'check-circle';
            case 'failed':
                return 'close-circle';
            case 'awaiting_payment':
                return 'clock-outline';
            case 'pending':
            default:
                return 'help-circle-outline';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return theme.colors.success;
            case 'failed':
                return theme.colors.error;
            case 'awaiting_payment':
                return theme.colors.awaiting; // Orange color for awaiting payment
            case 'pending':
            default:
                return theme.colors.accent;
        }
    };

    const handleExpand = (request) => {
        setSelectedRequest(request);
        setIsModalVisible(true);
    };

    const closeModal = () => setIsModalVisible(false);

    const confirmStatusChange = (status) => {
        setCurrentStatusUpdate(status);
        setConfirmationDialogVisible(true);
    };

    const renderModalContent = () => (
        <View style={styles.modalContent}>
            {selectedRequest && (
                <>
                    <View style={styles.modalHeader}>
                        <MaterialCommunityIcons
                            name={getStatusIcon(selectedRequest.status)}
                            size={40}
                            color={getStatusColor(selectedRequest.status)}
                        />
                        <Text style={styles.modalTitle}>Request Details</Text>
                    </View>
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="account" size={24} color={theme.colors.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Username</Text>
                                    <Text style={styles.infoValue}>{selectedRequest.User.username}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="package-variant" size={24} color={theme.colors.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Subscription</Text>
                                    <Text style={styles.infoValue}>{selectedRequest.Subscription.subscription_name}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name={getStatusIcon(selectedRequest.status)} size={24} color={getStatusColor(selectedRequest.status)} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Status</Text>
                                    <Text style={[styles.infoValue, { color: getStatusColor(selectedRequest.status) }]}>{getHumanReadableStatus(selectedRequest.status)}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Date</Text>
                                    <Text style={styles.infoValue}>{new Date(selectedRequest.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Time</Text>
                                    <Text style={styles.infoValue}>{new Date(`1970-01-01T${selectedRequest.time}Z`).toLocaleTimeString()}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                    <Divider style={styles.divider} />

                    {selectedRequest.status === 'pending' && (
                        <View style={styles.actionButtons}>
                            <Button
                                mode="contained"
                                onPress={() => confirmStatusChange('awaiting_payment')}
                                style={[styles.actionButton, styles.awaitingPaymentButton]}
                                icon="handshake"
                                labelStyle={styles.buttonLabel}
                            >
                                Agreement Reached
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => confirmStatusChange('failed')}
                                style={[styles.actionButton, styles.failedButton]}
                                icon="close-circle"
                                labelStyle={styles.buttonLabel}
                            >
                                No Agreement
                            </Button>
                        </View>
                    )}
                    {selectedRequest.status === 'awaiting_payment' && (

                        <View style={styles.actionButtons}>
                            <Button
                                mode="contained"
                                onPress={() => confirmStatusChange('success')}
                                style={[styles.actionButton, styles.successButton]}
                                icon="check-circle"
                                labelStyle={styles.buttonLabel}
                            >
                                Payment Received
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => confirmStatusChange('failed')}
                                style={[styles.actionButton, styles.failedButton]}
                                icon="cancel"
                                labelStyle={styles.buttonLabel}
                            >
                                User Canceled
                            </Button>
                        </View>
                    )}
                    <Button mode="outlined" onPress={closeModal} style={styles.closeButton}>
                        Close
                    </Button>
                </>
            )}
        </View>
    );

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <TouchableOpacity onPress={() => handleExpand(item)} style={styles.row}>
                <View style={styles.leftContent}>
                    <Text style={styles.username}>{item.User.username}</Text>
                    <Text style={styles.subscription}>{item.Subscription.subscription_name}</Text>
                    <Text style={styles.dateTime}>
                        {new Date(item.date).toLocaleDateString()}
                        {new Date(`1970-01-01T${item.time}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Text>
                </View>
                <View style={styles.rightContent}>
                    <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                        icon={() => <MaterialCommunityIcons name={getStatusIcon(item.status)} size={20} color="white" />}
                    >
                        {getHumanReadableStatus(item.status)}
                    </Chip>
                    <IconButton
                        icon="chevron-right"
                        color={theme.colors.primary}
                        size={24}
                    />
                </View>
            </TouchableOpacity>
        </Card>
    );

    return (
        <>
            <AppBar title="Recharge Requests" />
            <PaperProvider theme={theme}>
                <View style={styles.container}>
                    <Searchbar
                        placeholder="Search by username"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                    />
                    <View style={styles.filterContainer}>
                        <Menu
                            visible={isMenuVisible}
                            onDismiss={() => setIsMenuVisible(false)}
                            anchor={
                                <Button onPress={() => setIsMenuVisible(true)} mode="outlined" icon="filter-variant">
                                    Filter: {statusFilter === 'all' ? 'All' : getHumanReadableStatus(statusFilter)}
                                </Button>
                            }
                        >
                            <Menu.Item onPress={() => { setStatusFilter('all'); setIsMenuVisible(false); }} title="All" />
                            <Menu.Item onPress={() => { setStatusFilter('pending'); setIsMenuVisible(false); }} title="Pending" />
                            <Menu.Item onPress={() => { setStatusFilter('awaiting_payment'); setIsMenuVisible(false); }} title="Awaiting Payment" />
                            <Menu.Item onPress={() => { setStatusFilter('success'); setIsMenuVisible(false); }} title="Success" />
                            <Menu.Item onPress={() => { setStatusFilter('failed'); setIsMenuVisible(false); }} title="Failed" />
                        </Menu>
                    </View>
                    <FlatList
                        data={filteredRequests}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                    />
                    <Portal>
                        <Modal visible={isModalVisible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
                            {renderModalContent()}
                        </Modal>

                        <Dialog visible={confirmationDialogVisible} onDismiss={() => setConfirmationDialogVisible(false)}>
                            <Dialog.Title>Confirm Status Change</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>Are you sure you want to change the status to {getHumanReadableStatus(currentStatusUpdate)}?</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => setConfirmationDialogVisible(false)}>Cancel</Button>
                                <Button onPress={() => {
                                    handleStatusChange(selectedRequest.id, currentStatusUpdate);
                                    setConfirmationDialogVisible(false);
                                }}>Confirm</Button>
                            </Dialog.Actions>
                        </Dialog>

                        <Snackbar
                            visible={snackbarVisible}
                            onDismiss={() => setSnackbarVisible(false)}
                            duration={3000}
                        >
                            {snackbarMessage}
                        </Snackbar>
                    </Portal>
                </View>
            </PaperProvider>
        </>
    );
};

export default RechargeRequestsManagementScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    searchBar: {
        marginBottom: 10,
        elevation: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        marginVertical: 5,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    leftContent: {
        flexDirection: 'column',
        flex: 1,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme.colors.primary,
    },
    subscription: {
        fontStyle: 'italic',
        color: theme.colors.secondary,
        marginTop: 2,
    },
    dateTime: {
        color: theme.colors.placeholder,
        fontSize: 12,
        marginTop: 4,
    },
    statusChip: {
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        // maxHeight: '80%',
    },
    modalContent: {
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
        color: theme.colors.primary,
    },
    modalCard: {
        marginBottom: 20,
        elevation: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: theme.colors.placeholder,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    divider: {
        marginVertical: 5,
    },
    actionButtons: {
        marginTop: 10,
    },
    actionButton: {
        marginVertical: 5,
        borderRadius: 8,
        elevation: 2,
    },
    awaitingPaymentButton: {
        backgroundColor: '#FFA500',
    },
    successButton: {
        backgroundColor: theme.colors.success,
    },
    failedButton: {
        backgroundColor: theme.colors.error,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 20,
    },
});