import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For icons
import BusinessHoursManagementScreen from './BusinessHoursManagementScreen';
import AvailabiltyExceptionManagementScreen from './AvailabiltyExceptionManagementScreen';
import AppBar from '../../components/common/AppBar'; // Assuming you have an AppBar component
import withProtection from '../../hooks/withProtection';

const Tab = createBottomTabNavigator();

const BusinessHoursAndExceptionsScreen = () => {
  return (
    <View style={styles.container}>
      {/* Custom AppBar at the top */}
      <AppBar title="Business & Exceptions Management" />

      {/* Bottom Tab Navigator */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === 'Business Hours') {
              iconName = focused ? 'clock' : 'clock-outline';
            } else if (route.name === 'Availability Exceptions') {
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4a90e2',  // Active tab color
          tabBarInactiveTintColor: '#8e8e8e',  // Inactive tab color
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500', paddingBottom: 5 },  // Adjusted font size for tab labels
          tabBarStyle: {
            height: 60,  // Compact tab height
            backgroundColor: '#f9f9f9',  // Tab background color
            borderTopWidth: 1,  // Thin border at the top of the tab bar
            borderTopColor: '#e0e0e0',  // Border color
            paddingBottom: 5,
            paddingTop: 5,
            elevation: 5,  // Adds shadow for a modern look
          },
          tabBarIconStyle: { marginBottom: 0 },  // No extra margin below the icons
          tabBarItemStyle: {
            marginHorizontal: 10,  // Adds a bit of space between the buttons
            justifyContent: 'center',  // Ensure icons and labels are centered vertically
          },
        })}
      >
        <Tab.Screen
          name="Business Hours"
          component={withProtection(BusinessHoursManagementScreen)}
          options={{ headerShown: false }}  // Disable header for individual screens
        />
        <Tab.Screen
          name="Availability Exceptions"
          component={withProtection(AvailabiltyExceptionManagementScreen)}
          options={{ headerShown: false }}  // Disable header for individual screens
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BusinessHoursAndExceptionsScreen;
