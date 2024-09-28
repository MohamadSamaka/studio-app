import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, IconButton, Divider } from 'react-native-paper';
import styles from '../../../../styles/userCardStyles';  // Create this file for specific styles

const UserCard = ({ item, toggleExpand, expandedUserId, onEdit, onDelete, roles }) => (
  <Card style={styles.userCard}>
    <TouchableOpacity onPress={() => toggleExpand(item)} style={styles.row}>
      <Text style={[styles.cell, styles.username]}>{item.username}</Text>
      <Text style={[styles.cell, styles.phoneNumber]}>{item.phone_num}</Text>
      <View style={[styles.cell, styles.actions]}>
        <IconButton
          icon="pencil"
          size={20}
          color={styles.iconColor}
          onPress={() => onEdit(item)}
        />
        <IconButton
          icon="delete"
          size={20}
          color={styles.iconDeleteColor}
          onPress={() => onDelete(item.id)}
        />
      </View>
    </TouchableOpacity>
    {expandedUserId === item.id && (
      <View style={styles.expandedInfo}>
        <Text style={styles.infoText}>Credits: {item.credits}</Text>
        <Text style={styles.infoText}>Active: {item.active ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>Role: {roles.find((role) => role.value === item.role_id)?.label}</Text>
        <Text style={styles.infoText}>Default Language: {item.default_lang}</Text>
        <Divider style={styles.divider} />
      </View>
    )}
  </Card>
);

export default UserCard;
