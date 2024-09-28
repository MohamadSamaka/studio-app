import * as SecureStore from 'expo-secure-store';

// Store token securely
export const setToken = async (token) => {
    await SecureStore.setItemAsync('token', token);
}

export const setRefreshToken = async (token) => {
    await SecureStore.setItemAsync('refreshToken', token);
}

// Get token securely
export const getToken = async () => {
    return await SecureStore.getItemAsync('token');
}

export const getRefreshToken = async () => {
    return await SecureStore.getItemAsync('refreshToken');
}

// Remove token securely
export const removeToken = async () => {
    await SecureStore.deleteItemAsync('token');
}

export const removeRefreshToken = async () => {
    await SecureStore.deleteItemAsync('refreshToken');
}

// Clear all tokens
export const clearTokens = async () => {
    await removeToken();
    await removeRefreshToken();
}
