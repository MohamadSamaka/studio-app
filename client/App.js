// import React from "react";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { NativeBaseProvider } from "native-base";
// import { NavigationContainer } from "@react-navigation/native";
// import { Provider as PaperProvider } from 'react-native-paper';
// import RootNavigator from "./src/navigation/RootNavigator";
// import { AuthProvider } from "./src/contexts/AuthContext";
// import { UserProvider } from "./src/contexts/UserContext";

// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <NavigationContainer>
//         <NativeBaseProvider>
//           <PaperProvider>
//             <AuthProvider>
//               <UserProvider>
//                 <RootNavigator />
//               </UserProvider>
//             </AuthProvider>
//           </PaperProvider>
//         </NativeBaseProvider>
//       </NavigationContainer>
//     </GestureHandlerRootView>
//   );
// }

// import React from "react";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { NativeBaseProvider } from "native-base";
// import { NavigationContainer } from "@react-navigation/native";
// import { Provider as PaperProvider } from 'react-native-paper';
// import RootNavigator from "./src/navigation/RootNavigator";
// import { AuthProvider } from "./src/contexts/AuthContext";
// import { UserProvider } from "./src/contexts/UserContext";
// import { ConfigProvider } from './src/contexts/ConfigContext'; // Import ConfigProvider

// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <NavigationContainer>
//         <NativeBaseProvider>
//           <PaperProvider>
//             <AuthProvider>
//               <UserProvider>
//                 <ConfigProvider>
//                   <RootNavigator />
//                 </ConfigProvider>
//               </UserProvider>
//             </AuthProvider>
//           </PaperProvider>
//         </NativeBaseProvider>
//       </NavigationContainer>
//     </GestureHandlerRootView>
//   );
// }

import React, { useRef, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NativeBaseProvider } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import RootNavigator from "./src/navigation/RootNavigator";
import { AppProvider } from "./src/contexts/AppContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { UserProvider } from "./src/contexts/UserContext";
import { ConfigProvider } from "./src/contexts/ConfigContext"; // Import your config context
import WebSocketComponent from "./src/components/common/WebSocketComponent"; // Import WebSocketComponent
import { I18nextProvider } from "react-i18next";
import { LanguageProvider } from "./src/contexts/LanguageContext"; // Adjusted path
import i18n from "./src/utils/i18n"; // Import the i18n configuration


// making sure to disable consoling on production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <NativeBaseProvider>
          <PaperProvider>
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
