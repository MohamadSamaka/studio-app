import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import UserManagementScreen from '../screens/admin/UserManagementScreen';

const Drawer = createDrawerNavigator();

const AdminDrawerNavigator = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Users" component={UserManagementScreen} />
    </Drawer.Navigator>
  );
};

export default AdminDrawerNavigator;