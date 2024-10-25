import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage interface
const storage = {
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await SecureStore.setItemAsync(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return await SecureStore.getItemAsync(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

// Use the storage interface in your functions
export const setToken = async (token) => {
  await storage.setItem('token', token);
};

export const setRefreshToken = async (token) => {
  await storage.setItem('refreshToken', token);
};

export const getToken = async () => {
  return await storage.getItem('token');
};

export const getRefreshToken = async () => {
  return await storage.getItem('refreshToken');
};

export const removeToken = async () => {
  await storage.removeItem('token');
};

export const removeRefreshToken = async () => {
  await storage.removeItem('refreshToken');
};

export const clearTokens = async () => {
  await removeToken();
  await removeRefreshToken();
};
