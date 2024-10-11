import React, { useEffect, useState } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    FlatList,
    Alert,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import {
    Card,
    Title,
    Paragraph,
    Button,
    ActivityIndicator,
    Text,
    Snackbar,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import AppBar from '../../components/common/AppBar';
import { getUserSubscriptions, subscriptionRequest } from '../../utils/axios';
import { useUserContext } from '../../contexts/UserContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { theme } from '../../utils/theme'; // Ensure correct path


const SubscriptionsScreen = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const { user } = useUserContext();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [requestingId, setRequestingId] = useState(null);

    const { t } = useTranslation(); // Initialize translation function


    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

    useEffect(() => {
        if(user)
            fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        try {
            const response = await getUserSubscriptions();
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            Alert.alert(t('subscriptionsScreen.failedToLoadSubscriptions'));
        } finally {
            if (isRefreshing) setRefreshing(false);
            else setLoading(false);
        }
    };

    // Handle subscription request with confirmation
    const handleRequestSubscription = (subscriptionId, subscriptionName) => {
        const subscriptionType = t(`subscriptionTypes.${subscriptionName.toLowerCase()}`)
        Alert.alert(
            t(`subscriptionsScreen.requiestingConfirmationTitle`),
            // t(`subscriptionsScreen.requestingSubscriptionConfirmationMessage`, { subscriptionType: subscriptionType }),
            t(`subscriptionsScreen.requestingSubscriptionConfirmationMessage`, { subscriptionType: "" }),
            [
                {
                    text: `${t('cancel')}`,
                    style: 'cancel',
                },
                {
                    // text: `${{t('yes')}}`,
                    text: `${t('yes')}`,
                    onPress: () => requestSubscription(subscriptionId, subscriptionName),
                },
            ],
            { cancelable: true }
        );
    };

    // Perform the subscription request
    const requestSubscription = async (subscriptionType, subscriptionName) => {
        let responseSkeleton = "subscriptionsScreen.requestResponse"
        translatedSubscriptionType = t(`subscriptionTypes.${subscriptionName.toLowerCase()}`)
        setRequestingId(subscriptionType);
        try {
            const userInfo = user;

            const payload = {
                subscriptionType,
                userId: userInfo.id, // Adjust according to your user model
            };

            await subscriptionRequest(payload);
            // setSnackbarMessage(`Subscription "${subscriptionName}" requested successfully!`);
            setSnackbarMessage(t(`${responseSkeleton}.success`));
            setSnackbarColor(theme.colors.success);
        } catch (error) {
            console.error('Error requesting subscription:', error);
            // setSnackbarMessage(`Failed to request "${subscriptionName}" subscription.`);
            setSnackbarMessage(t(`${responseSkeleton}.fail`));

            setSnackbarColor(theme.colors.error);
        } finally {
            setRequestingId(null);
            setSnackbarVisible(true);
        }
    };

    const renderSubscription = ({ item, index }) => (
        <Animatable.View
            animation="fadeInUp"
            delay={index * 100}
            duration={800}
            useNativeDriver
            style={styles.cardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleRequestSubscription(item.id, item.subscription_name)}
            >
                <LinearGradient
                    colors={item.isPopular ? ['#FFF3E0', '#FFE0B2'] : ['#FFFFFF', '#F5F5F5']}
                    style={styles.cardGradient}
                >
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            {/* Subscription Icon */}
                            <MaterialIcons
                                name={getIconName(item.subscription_name)}
                                size={40}
                                color={theme.colors.primary}
                                style={styles.icon}
                            />
                            {/* Subscription Name */}
                            <Text style={styles.featureText}> {t('subscriptionsScreen.meetings', { count: item.meetings_num })}</Text>
                            {/*<Title style={styles.title}>{t(`subscriptionTypes.${item.subscription_name.toLowerCase()}`)}</Title>*/}
                            {/* Subscription Features */}
                            <View style={styles.featureRow}>
                                <FontAwesome5 name="users" size={16} color={theme.colors.placeholder} />
                                {/* <Text>{t('slotsAvailable', { count: availableSlots })}</Text> */}
                                {/* <Text style={styles.featureText}> {item.meetings_num} {t('subscriptionsScreen.meetings')}</Text> */}
                                <Text style={styles.featureText}> {t('subscriptionsScreen.meetings', { count: item.meetings_num })}</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <FontAwesome5
                                    name="shekel-sign"
                                    size={12}
                                    color={theme.colors.placeholder}
                                    style={styles.featureIcon}
                                />
                                <Text style={styles.featureText}>{item.price.toFixed(2)}</Text>
                            </View>
                            {/* Badge for Popular Subscriptions */}
                            {item.isPopular && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Most Popular</Text>
                                </View>
                            )}
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                            <Button
                                mode="contained"
                                onPress={() => handleRequestSubscription(item.id, item.subscription_name)}
                                style={styles.button}
                                disabled={requestingId === item.id}
                                loading={requestingId === item.id}
                                // contentStyle={styles.buttonContent}
                                uppercase={false}
                                icon="send"
                            >
                                {t('subscriptionsScreen.requestingSubscription')}
                            </Button>
                        </Card.Actions>
                    </Card>
                </LinearGradient>
            </TouchableOpacity>
        </Animatable.View>
    );

    // Function to determine icon based on subscription name
    const getIconName = (name) => {
        switch (name.toLowerCase()) {
            case 'basic':
                return 'star-border';
            case 'premium':
                return 'star';
            case 'pro':
                return 'whatshot';
            default:
                return 'subscriptions';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppBar title="Subscriptions" />
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                </View>
            ) : (
                subscriptions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No subscriptions available.</Text>
                    </View>
                ) : (
                    <FlatList
                        key="subscriptions-list"
                        data={subscriptions.filter(sub => sub.active === true)}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderSubscription}
                        numColumns={2}
                        contentContainerStyle={styles.list}
                        refreshing={refreshing}
                        onRefresh={() => fetchSubscriptions(true)}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={<View style={{ height: 20 }} />}
                        columnWrapperStyle={styles.columnWrapper}
                    />
                )
            )}
            {/* Snackbar for feedback */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: snackbarColor }}
                action={{
                    label: t('close'),
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
    );
};

export default SubscriptionsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    list: {
        padding: 16,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        flex: 1,
        margin: 5,
    },
    cardGradient: {
        borderRadius: 12,
        padding: 2,
    },
    card: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        elevation: 3,
    },
    cardContent: {
        alignItems: 'center',
        padding: 16,
        position: 'relative',
    },
    icon: {
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    featureIcon: {
        marginRight: 6,
    },
    featureText: {
        fontSize: 14,
        color: theme.colors.placeholder,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: theme.colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    // badgeText: {
    //     color: '#FFFFFF',
    //     fontSize: 10,
    //     fontWeight: '600',
    // },
    button: {
        flex: 1, // Allows the button to expand horizontally
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
    },
    // buttonContent: {
    //     fontSize: 3,
    //     fontWeight: 700,
    //     paddingVertical: 6,
    //     paddingHorizontal: 8, // Reduced padding to save space
    // },
    cardActions: {
        justifyContent: 'center', // Center the button horizontally
        paddingHorizontal: 16, // Consistent padding around the button
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.placeholder,
    },
    snackbar: {
        backgroundColor: theme.colors.success,
    },
    snackbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    snackbarIcon: {
        marginRight: 8,
    },
    snackbarText: {
        color: '#FFFFFF',
        flex: 1,
    },
});
