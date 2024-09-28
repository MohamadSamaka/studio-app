import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuthContext } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [credits, setCredits] = useState(0);
  const [notificationsCount, setNotificaionsCount] = useState(0)

  useEffect(() => {
    if (user) {
      console.log(JSON.stringify(user, null, 2))
      setCredits(user.credits || 0);  // Assuming user has a credits property
      setNotificaionsCount(user.notificationCount || 0)
    } else {
      setCredits(0);
    }
  }, [user]);


  const updateCredits = (amount) => {
    setCredits((prevCredits) => {
      const newCredits = prevCredits + amount;
      return newCredits >= 0 ? newCredits : 0;
    });
  };

  const value = {
    user,
    credits,
    setCredits,
    updateCredits,
    notificationsCount,
    setNotificaionsCount
    // addCredits,
    // subtractCredits,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  return useContext(UserContext);
};

