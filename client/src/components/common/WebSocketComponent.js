import React, { useEffect } from 'react';
import { useConfigContext } from '../../contexts/ConfigContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { WEBSORCKET_URL } from '@env';

const WebSocketComponent = () => {
  const { config, setConfig } = useConfigContext();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) {
      console.error('No auth token available.');
      return;
    }

    const socket = new WebSocket(WEBSORCKET_URL, [], {
      headers: {
        Authorization: `token ${user.token}`,
      },
    });

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'CONFIG_UPDATED') {
        setConfig((prevConfig) => ({
          ...prevConfig,
          reservations: data.config.reservations,
        }));
      }
    };

    return () => {
      socket.close();
    };
  }, [user, setConfig]);

  useEffect(() => {
    console.log('config changed to:', config);
  }, [config]);

  return null;
};

export default WebSocketComponent;
