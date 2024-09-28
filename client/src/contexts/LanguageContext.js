import React, { useEffect, createContext, useContext, useState } from 'react';
import i18n from '../utils/i18n';
import { updateUserLanguage } from '../utils/axios';
import { useUserContext } from './UserContext';
// import * as RNLocalize from 'react-native-localize';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user } = useUserContext();
  const [language, setLanguage] = useState(
    user ? user.default_lang : i18n.language
  );

  useEffect(() => {
    const determineLanguage = () => {
      let targetLang = 'en'; // Default fallback

      if (user && user.default_lang) {
        targetLang = user.default_lang.toLowerCase();
      } else {
        // const systemLang = Localization.locale.split('-')[0];
        // targetLang = SUPPORTED_LANGUAGES.includes(systemLang) ? systemLang : 'en';
        targetLang = i18n.language
      }

      updateUiLanguage(targetLang);
    };

    determineLanguage();

  }, [user]);

  const updateUiLanguage = async (lng) => {
    try {
      setLanguage(lng);
      await i18n.changeLanguage(lng);
      console.log(`[INFO] Language set to ${lng}`);
    } catch (error) {
      console.error('[ERROR] Failed to change language:', error);
    }
  };

  const changeLanguage = async (lng) => {
    try {
      await updateUiLanguage(lng);
      if (user) {
        await updateUserLanguage(lng.toUpperCase()); // Ensure language code matches backend expectations
      }
    } catch (error) {
      console.error('[ERROR] Error updating language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => useContext(LanguageContext);
