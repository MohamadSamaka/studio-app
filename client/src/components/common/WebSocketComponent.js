import React, { useEffect } from 'react';
import { useConfigContext } from '../../contexts/ConfigContext';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  getToken,
} from "../../utils/tokenManager";
import { WEBSORCKET_URL } from '@env';

const WebSocketComponent = () => {
  const { config, setConfig } = useConfigContext();
  const { user } = useAuthContext();

  const initialSocket = async () => {
    if (!user) {
      console.error('No auth token available.');
      return;
    }
    const token = await getToken()
    const socket = new WebSocket(WEBSORCKET_URL, [], {
      headers: {
        authorization: `token ${token}`,
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

    socket.onerror = (error) => {
      console.error('WebSocket error:', error.message);
    };

    return () => {
      socket.close();
    };
  }

  useEffect(() => {
    initialSocket()
  }, [user, setConfig]);

  useEffect(() => {
    console.log('config changed to:', config);
  }, [config]);

  return null;
};

export default WebSocketComponent;