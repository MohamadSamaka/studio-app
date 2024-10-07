// NotificationsScreen.jsx

import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Appbar,
  Card,
  Text,
  Badge,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getNotifications, markNotificationAsRead } from "../../utils/axios";
import { useUserContext } from "../../contexts/UserContext";

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { setNotificaionsCount } = useUserContext()
  const theme = useTheme();

  const [notifications, setNotifications] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Simulate fetching notifications
  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      const notifications = response.data;
      setNotifications(notifications);
      setNotificaionsCount(notifications.length)
      setRefreshing(false);
    } catch (error) {
      console.log("Error: failed to fetch notificaions");
    }
  };

  const markAsRead = useCallback(async (notificationIds) => {
    try {
      await markNotificationAsRead(notificationIds);

      // Update local state to mark notifications as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.log("Error: failed to mark notifications as read", error);
      // Optionally, handle the error (e.g., show a user-facing message)
    }
  }, []);

  const clearAllNotifications = () => {
    const notificaionsListId = notifications.map(
      (notificaiton) => notificaiton.id
    );
    markAsRead(notificaionsListId);
    setNotifications([]);
    setNotificaionsCount(notifications.length)
  };

  const renderItem = ({ item }) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: item.read ? "#ffffff" : "#D0E8FF" }, // Light blue for unread
      ]}

      onPress={() => {
        if (!item.read) markAsRead([item.id]);
      }}
    >
      <View style={styles.cardContent}>
        <Icon
          name={item.icon}
          size={30}
          color={item.read ? "#666666" : theme.colors.primary} // Dark gray for read, vibrant blue for unread
          style={styles.cardIcon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.description}>{item.content}</Text>
          <Text style={styles.time}>{moment(item.createdAt).fromNow()}</Text>
        </View>
        {!item.read && <Badge style={styles.unreadBadge} />}
      </View>
    </Card>
  );

  return (
    <>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Notifications"
          titleStyle={styles.screenTitle} // Corrected prop name
        />
        {notifications.length > 0 && (
          <IconButton
            icon="delete-outline"
            color="#ffffff"
            size={24}
            onPress={clearAllNotifications}
            accessibilityLabel="Clear All Notifications"
          />
        )}
      </Appbar.Header>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bell-off-outline" size={80} color="#cccccc" />
          <Text style={styles.emptyText}>No Notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchNotifications}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    color: "#ffffff", // White text for contrast against blue header
    fontSize: 20,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#4a90e2", // Vibrant Blue
    elevation: 4,
  },
  listContent: {
    padding: 10,
    backgroundColor: "#f2f2f2",
  },
  card: {
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: "#333333", // Default title color for read notifications
  },
  unreadTitle: {
    fontWeight: "bold",
    color: "#4a90e2", // Vibrant Blue for unread titles
  },
  description: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: "#FF6F61", // Coral
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  swipeActionContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6F61", // Coral for delete background
    borderRadius: 12,
    marginVertical: 6,
    height: "90%",
    paddingRight: 20,
    width: 60,
  },
  deleteButton: {
    // No additional styling needed as color is set directly
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  emptyText: {
    color: "#888888",
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
});

export default NotificationsScreen;
