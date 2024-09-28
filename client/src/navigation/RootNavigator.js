import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthContext } from '../contexts/AuthContext';
import AdminDrawerNavigator from './AdminDrawerNavigator';
import UserDrawerNavigator from './UserDrawerNavigator';
import LoginScreen from '../screens/common/LoginScreen';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationsScreen from '../screens/common/notificationsScreen'; // Import NotificationsScreen

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        user.role_id === 1 ? (
          <>
            <Stack.Screen name="AdminHome" component={AdminDrawerNavigator} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="UserHome" component={UserDrawerNavigator} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
