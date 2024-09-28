import React, { useMemo } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';

import UserManagementScreen from '../screens/admin/UserManagementScreen';
import BusinessHoursAndExceptionsScreen from '../screens/admin/BusinessHoursAndExceptionsScreen';
import SubscriptionManagementScreen from '../screens/admin/SubscriptionsManagementScreen';
import RechargeRequestsManagementScreen from '../screens/admin/RechargeRequestsManagementScreen';
import ConfigManagementScreen from '../screens/admin/ConfigManagementScreen';
import ReservationsManagementScreen from '../screens/admin/ReservationsManagementScreen';
import withProtection from '../hooks/withProtection';

const Drawer = createDrawerNavigator();

const AdminDrawerNavigator = () => {
  const { t } = useTranslation();

  // Memoize screen options to prevent re-renders
  const screenOptions = useMemo(() => ({
    headerShown: false,
    drawerLabelStyle: {
      textAlign: 'left',
    },
  }), []);

  // Define screens with static names and translated labels
  const screens = useMemo(() => [
    {
      name: t('userManagementScreen.title'),
      component: withProtection(UserManagementScreen),
      label: t('userManagementScreen.title'),
    },
    {
      name: t('businessHoursAndExceptionsScreen.title'),
      component: BusinessHoursAndExceptionsScreen,
      label: t('businessHoursAndExceptionsScreen.title'),
    },
    {
      name: t('subscriptionManagementScreen.title'),
      component: withProtection(SubscriptionManagementScreen),
      label: t('subscriptionManagementScreen.title'),
    },
    {
      name: t('rechargeRequestsManagementScreen.title'),
      component: withProtection(RechargeRequestsManagementScreen),
      label: t('rechargeRequestsManagementScreen.title'),
    },
    {
      name: t('configManagementScreen.title'),
      component: withProtection(ConfigManagementScreen),
      label: t('configManagementScreen.title'),
    },
    {
      name: t('reservationsManagementScreen.title'),
      component: withProtection(ReservationsManagementScreen),
      label: t('reservationsManagementScreen.title'),
    },
  ], [t]);

  return (
    <Drawer.Navigator screenOptions={screenOptions}>
      {screens.map(screen => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            unmountOnBlur: true,
            independent: true,
            drawerLabel: screen.label,
          }}
        />
      ))}
    </Drawer.Navigator>
  );
};

// Memoize the entire AdminDrawerNavigator to prevent unnecessary re-renders
export default React.memo(AdminDrawerNavigator);
