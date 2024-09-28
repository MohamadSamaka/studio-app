import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization'; // Use expo-localization

import enTranslation  from '../locales/en/translation.json';
import heTranslation  from '../locales/he/translation.json';
import arTranslation from '../locales/ar/translation.json';

const resources = {
  en: { translation: enTranslation },
  he: { translation: heTranslation },
  ar: { translation: arTranslation },
};

// Function to determine the best available language
const getBestLanguageTag = () => {
  const languageTag = Localization.getLocales()[0].languageTag; // Get device locale
  // console.log("languageTag: ", languageTag)
  const languageCode = languageTag.split('-')[0];
  return resources[languageCode] ? languageCode : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getBestLanguageTag(),
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

// // Listen for changes in the device's language settings
// Localization.addEventListener('change', () => {
//   const newLanguage = getBestLanguageTag();
//   i18n.changeLanguage(newLanguage);
// });

export default i18n;
