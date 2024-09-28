import React, { useMemo } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ReservationScreen from "../screens/user/ReservationScreen";
import MyReservationsScreen from "../screens/user/MyReservations";
import SubscriptionsScreen from "../screens/user/SubscriptionsScreen";
import RechargeRequestsScreen from "../screens/user/MyRechargeRequests";
import { useTranslation } from "react-i18next";
import withProtection from "../hooks/withProtection";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { t } = useTranslation();

  // Memoize screen options to prevent re-renders
  const screenOptions = useMemo(() => ({
    headerShown: false,
    drawerLabelStyle: {
      textAlign: "left",
    },
  }), []);

  const screens = useMemo(() => [
    {
      name: t("subscriptionsScreen.title"),
      component: withProtection(SubscriptionsScreen),
      label: t("subscriptionsScreen.title"),
      unmountOnBlur: true
    },
    {
      name: t("reservationScreen.title"),
      component: withProtection(ReservationScreen),
      label: t("reservationScreen.title"),
      unmountOnBlur: true

    },
    {
      name: t("myReservationsScreen.title"),
      component: withProtection(MyReservationsScreen),
      label: t("myReservationsScreen.title"),
      unmountOnBlur: true

    },
    {
      name: t("rechargeRequestsScreen.title"),
      component: withProtection(RechargeRequestsScreen),
      label: t("rechargeRequestsScreen.title"),
      unmountOnBlur: true

    },
  ], [t]);

  return (
    <Drawer.Navigator initialRouteName="Subscriptions" screenOptions={screenOptions}>
      {screens.map(screen => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{ drawerLabel: screen.label , unmountOnBlur: screen.unmountOnBlur }}
        />
      ))}
    </Drawer.Navigator>
  );
};

// Memoize the entire DrawerNavigator to prevent unnecessary re-renders
export default React.memo(DrawerNavigator);
