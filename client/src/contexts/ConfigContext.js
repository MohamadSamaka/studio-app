import React, { createContext, useContext, useState, useEffect } from 'react';
import { getConfigs } from '../utils/axios';
import { useAuthContext } from './AuthContext';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async (forceUpdate = false) => {
    if (!forceUpdate && config !== null) {
      return;
    }

    try {
      const response = await getConfigs();
      setConfig(response.data); // Ensure this sets the entire config object
      console.log('Config fetched successfully');
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConfig(); // Fetch initial config on component mount
    }
  }, [user]); // Only depends on 'user'

  return (
    <ConfigContext.Provider value={{ config, setConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook to use config context
export const useConfigContext = () => useContext(ConfigContext);
