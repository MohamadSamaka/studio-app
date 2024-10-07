import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NativeBaseProvider } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppProvider } from "./src/contexts/AppContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { UserProvider } from "./src/contexts/UserContext";
import { ConfigProvider } from "./src/contexts/ConfigContext"; 
import WebSocketComponent from "./src/components/common/WebSocketComponent"; 
import { I18nextProvider } from "react-i18next";
import { LanguageProvider } from "./src/contexts/LanguageContext"; 
import i18n from "./src/utils/i18n"; 
import * as Font from 'expo-font';
import { DefaultTheme } from 'react-native-paper';

// Disable console logging in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const theme = {
  ...DefaultTheme,
  // other customizations if needed
};

const loadFonts = async () => {
  await Font.loadAsync({
    'HelveticaNeue': require('./assets/fonts/HelveticaNeue.ttf'), // Adjust the path accordingly
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false); // State to track if fonts are loaded

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return null; // Or a loading component
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <NativeBaseProvider>
          <PaperProvider theme={theme}>
            <I18nextProvider i18n={i18n}>
              <AppProvider>
                <AuthProvider>
                  <UserProvider>
                    <ConfigProvider>
                      <LanguageProvider>
                        <WebSocketComponent />
                        <RootNavigator />
                      </LanguageProvider>
                    </ConfigProvider>
                  </UserProvider>
                </AuthProvider>
              </AppProvider>
            </I18nextProvider>
          </PaperProvider>
        </NativeBaseProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
