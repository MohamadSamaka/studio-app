// src/screens/LoginScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { useAuthContext } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger'; // Import the custom logger
import { useTranslation } from 'react-i18next';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation(); // Initialize translation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser, user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [error, setError] = useState(''); // Track error messages
  const [snackbarVisible, setSnackbarVisible] = useState(false); // Snackbar visibility

  useEffect(() => {
    if (user) {
      // logger.info('User state updated', user); // Static English log
      // Redirect to appropriate screen after successful login
      const userRole = user.Role.name.toLowerCase()
      if (userRole === 'admin') {
        navigation.navigate('AdminHome');
      } else {
        navigation.navigate('UserHome');
      }
    }
  }, [user, navigation]);

  const validateInputs = () => {
    if (!username.trim()) {
      setError(t('loginScreen.username_required'));
      return false;
    }
    if (!password) {
      setError(t('loginScreen.password_required'));
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = useCallback(async () => {
    if (isLoading) return; // Prevent duplicate calls if already loading

    logger.info('Attempting to log in', { username }); // Static English log

    if (!validateInputs()) {
      logger.warn('Validation failed', { username, password }); // Static English log
      setSnackbarVisible(true);
      return;
    }

    setIsLoading(true); // Set loading state to true

    try {
      const userData = await loginUser({ username, password });
      logger.info('Login successful', userData); // Static English log
    } catch (error) {
      logger.error('Login error', error); // Static English log

      if (error.response) {
        setError(error.response.data.message || t('loginScreen.invalid_credentials'));
      } else if (error.request) {
        setError(t('loginScreen.network_error'));
      } else {
        setError(t('loginScreen.unexpected_error'));
      }
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }, [username, password, isLoading, loginUser, navigation, t]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{t('loginScreen.welcome_back')}</Text>
        <TextInput
          label={t('loginScreen.username')}
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          accessibilityLabel={t('loginScreen.username')}
        />
        <HelperText type="error" visible={!!error && error.includes(t('loginScreen.username'))}>
          {error.includes(t('loginScreen.username')) ? error : ''}
        </HelperText>
        <TextInput
          label={t('loginScreen.password')}
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          accessibilityLabel={t('loginScreen.password')}
        />
        <HelperText type="error" visible={!!error && error.includes(t('loginScreen.password'))}>
          {error.includes(t('loginScreen.password')) ? error : ''}
        </HelperText>
        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.button}
          accessibilityLabel={t('loginScreen.login')}
        >
          {isLoading ? t('loginScreen.logging_in') : t('loginScreen.login')}
        </Button>
        {isLoading && <ActivityIndicator animating={true} size="large" style={styles.loader} />}
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  loader: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: '#ff1744',
  },
});

export default LoginScreen;
