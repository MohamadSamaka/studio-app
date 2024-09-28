import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Card,
  Button,
  IconButton,
  Avatar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const ReservationDetailsModal = ({
  visible,
  onDismiss,
  reservation,
  handleRemoveUser,
}) => {
  const renderUserItem = (user, index) => (
    <View key={index} style={styles.userRow}>
      <View style={styles.userInfo}>
        <Avatar.Text size={40} label={user.username.charAt(0).toUpperCase()} />
        <Text style={styles.userName}>{user.username}</Text>
      </View>
      <IconButton
        icon="delete"
        color="#f44336"
        size={20}
        onPress={() => handleRemoveUser(user)}
        accessibilityLabel={`Remove ${user.username}`}
      />
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        {reservation && (
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalTitle}>Reservation Details</Text>
              <Card style={styles.detailCard}>
                <Card.Content>
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name="calendar-today"
                      size={24}
                      color="#6200ee"
                    />
                    <Text style={styles.detailText}>
                      {moment(reservation.date, 'YYYY-MM-DD').format('MM/DD/YYYY')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="access-time" size={24} color="#6200ee" />
                    <Text style={styles.detailText}>
                      {moment(reservation.time, 'HH:mm').format('hh:mm A')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="people" size={24} color="#6200ee" />
                    <Text style={styles.detailText}>
                      {reservation.users.length} People
                    </Text>
                  </View>
                </Card.Content>
              </Card>
              <Text style={styles.modalSubtitle}>Users</Text>
              <Card style={styles.userListCard}>
                <Card.Content>
                  {reservation.users.length > 0 ? (
                    reservation.users.map((user, index) => renderUserItem(user, index)
                    )
                  ) : (
                    <Text style={styles.modalText}>
                      No users in this reservation.
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </ScrollView>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={styles.closeButton}
              icon="close"
            >
              Close
            </Button>
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.8,
    width: SCREEN_WIDTH * 0.9,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6200ee',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#424242',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#424242',
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 25,
    backgroundColor: '#6200ee',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 10,
  },
  detailCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#F3E5F5',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#424242',
  },
  userListCard: {
    borderRadius: 10,
    backgroundColor: '#F3E5F5',
  },
});

export default ReservationDetailsModal;
