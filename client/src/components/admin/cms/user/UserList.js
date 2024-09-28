import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Card, IconButton, Divider } from 'react-native-paper';
import { globalStyles } from '../../../../styles/styles';

export const ROLES = [
  { label: 'Admin', value: 1 },
  { label: 'User', value: 2 },
];
const UserList = ({ users, onEdit, onDelete, expandedUserId, onToggleExpand }) => {
  const renderItem = ({ item }) => (
    <Card style={globalStyles.userCard}>
      <TouchableOpacity onPress={() => onToggleExpand(item)} style={globalStyles.row}>
        <Text style={[globalStyles.cell, globalStyles.username]}>{item.username}</Text>
        <Text style={[globalStyles.cell, globalStyles.phoneNumber]}>{item.phone_num}</Text>
        <View style={[globalStyles.cell, globalStyles.actions]}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDelete(item.id)}
          />
        </View>
      </TouchableOpacity>
      {expandedUserId === item.id && (
        <View style={globalStyles.expandedInfo}>
          <Text style={globalStyles.infoText}>Credits: {item.credits}</Text>
          <Text style={globalStyles.infoText}>Active: {item.active ? 'Yes' : 'No'}</Text>
          <Text style={globalStyles.infoText}>Role: {ROLES.find((role) => role.value === item.role_id)?.label}</Text>
          <Text style={globalStyles.infoText}>Default Language: {item.default_lang}</Text>
          <Divider style={globalStyles.divider} />
        </View>
      )}
    </Card>
  );

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={globalStyles.listContent}
    />
  );
};

export default UserList;