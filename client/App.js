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
import { theme } from "./src/utils/theme";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; // Import both icon sets
// Disable console logging in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}


// Load custom and MaterialCommunityIcons fonts
const loadFonts = async () => {
  await Font.loadAsync({
    'HelveticaNeue': require('./assets/fonts/HelveticaNeue.ttf'), // Adjust the path accordingly
    ...MaterialCommunityIcons.font, // Load MaterialCommunityIcons font
    ...MaterialIcons.font, // Load MaterialIcons font
  });
};


export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);


  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        // Load the MaterialCommunityIcons font
        ...MaterialCommunityIcons.font,
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);


  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <NativeBaseProvider>
          <PaperProvider
            theme={theme}
            settings={{
              icon: props => {
                const { name, color, size, direction } = props;
                return (
                  <MaterialCommunityIcons
                    name={name}
                    color={color}
                    size={size}
                    style={[
                      { transform: [{ scaleX: direction === 'rtl' ? -1 : 1 }] },
                    ]}
                  />
                );
              },
            }}
          >
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
