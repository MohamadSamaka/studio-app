import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TouchableOpacity,
  findNodeHandle,
  UIManager,
} from 'react-native';
import {
  Appbar,
  Surface,
  Badge,
  Portal,
  Modal,
  RadioButton,
  Button,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AppBarComponent = React.memo(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logoutUser } = useAuthContext();
  const { credits, notificationsCount } = useUserContext();
  const { language, changeLanguage } = useLanguageContext();
  const { t } = useTranslation();

  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState(language);

  const profileAnchorRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleProfileMenuOpen = () => {
    if (profileAnchorRef.current) {
      UIManager.measure(
        findNodeHandle(profileAnchorRef.current),
        (x, y, width, height, pageX, pageY) => {
          setMenuPosition({ top: pageY + height, left: pageX });
          setProfileMenuVisible(true);
        }
      );
    }
  };

  const handleLanguageChange = () => {
    changeLanguage(tempSelectedLanguage);
    setLanguageModalVisible(false);
  };

  const getActiveRouteName = (route) => {
    if (!route.state)
      return route.params?.Title ? route.params.Title : route.name;
    const { routes, index } = route.state;
    return getActiveRouteName(routes[index]);
  };

  const activeRouteName = getActiveRouteName(route);

  return (
    <>
      <Appbar.Header style={styles.header}>
        <Pressable onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.title}>{activeRouteName}</Text>

        <View style={styles.rightContainer}>
          <Surface style={styles.pointsContainer}>
            <MaterialCommunityIcons name="ticket-percent" size={18} color="#fff" />
            <Text style={styles.pointsText}>{credits}</Text>
          </Surface>

          {/* Notifications Button */}
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notificationButton}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
            {notificationsCount > 0 && (
              <Badge style={styles.badge}>{notificationsCount}</Badge>
            )}
          </Pressable>

          {/* Profile/Menu Button */}
          <Pressable
            onPress={handleProfileMenuOpen}
            style={styles.profileAnchor}
            ref={profileAnchorRef}
          >
            <MaterialCommunityIcons name="account-circle" size={24} color="#fff" />
            <Text style={styles.selectedLanguage}>{language.toUpperCase()}</Text>
          </Pressable>
        </View>
      </Appbar.Header>

      {/* Custom Menu rendered in Portal */}
      <Portal>
        {profileMenuVisible && (
          <>
            {/* Overlay to detect outside clicks */}
            <Pressable
              style={styles.overlay}
              onPress={() => setProfileMenuVisible(false)}
            />

            {/* Menu positioned absolutely */}
            <View
              style={[
                styles.customMenu,
                { top: menuPosition.top, left: menuPosition.left - 150 }, // Adjust 'left' as needed
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setProfileMenuVisible(false);
                  setLanguageModalVisible(true);
                }}
                style={styles.menuItem}
              >
                <MaterialCommunityIcons name="translate" size={20} color="#333" />
                <Text style={styles.menuItemText}>{t('changeLanguage')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setProfileMenuVisible(false);
                  logoutUser();
                }}
                style={styles.menuItem}
              >
                <MaterialCommunityIcons name="logout" size={20} color="#333" />
                <Text style={styles.menuItemText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Portal>

      {/* Language Modal */}
      <Portal>
        <Modal
          visible={languageModalVisible}
          onDismiss={() => setLanguageModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
          <RadioButton.Group
            onValueChange={(newValue) => setTempSelectedLanguage(newValue)}
            value={tempSelectedLanguage}
          >
            <RadioButton.Item label={t('english')} value="en" />
            <RadioButton.Item label={t('hebrew')} value="he" />
            <RadioButton.Item label={t('arabic')} value="ar" />
          </RadioButton.Group>
          <View style={styles.modalButtonContainer}>
            <Button
              mode="outlined"
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalButton}
            >
              {t('cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleLanguageChange}
              style={styles.modalButton}
            >
              {t('save')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
});

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4a90e2',
    elevation: 4,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  menuButton: {
    marginLeft: 10,
  },
  title: {
    color: '#fff',
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    borderRadius: 18,
    right: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    color: '#fff',
    marginLeft: 5,
  },
  notificationButton: {
    marginRight: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3b30',
    color: '#fff',
    fontSize: 10,
    height: 16,
    minWidth: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  profileAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguage: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  customMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    width: 200,
    paddingVertical: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuItemText: {
    marginLeft: 10,
    color: '#333',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default AppBarComponent;
