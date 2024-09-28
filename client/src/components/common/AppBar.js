import React, { useState, useCallback, useMemo} from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Appbar, Surface, Badge, Menu, Portal, Modal, RadioButton, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import { useLanguageContext } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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


  const getActiveRouteName = (route) => {
    if (!route.state) return route.params?.Title ? route.params.Title : route.name;
    const { routes, index } = route.state;
    return getActiveRouteName(routes[index]);
  };

  const activeRouteName = getActiveRouteName(route);

  const handleLanguageChange = useCallback(() => {
    // Implement language change logic
    changeLanguage(tempSelectedLanguage);
    setLanguageModalVisible(false);
  }, [tempSelectedLanguage]);

  return (
    <>
      <Appbar.Header style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>{activeRouteName}</Text>

        <View style={styles.rightContainer}>
          <Surface style={styles.pointsContainer}>
            <Icon name="ticket-percent" size={18} color="#fff" />
            <Text style={styles.pointsText}>{credits}</Text>
          </Surface>

          {/* Notifications Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notificationButton}
          >
            <Icon name="bell-outline" size={24} color="#fff" />
            {notificationsCount > 0 && (
              <Badge style={styles.badge}>{notificationsCount}</Badge>
            )}
          </TouchableOpacity>

          {/* Profile/Menu Button */}
          <Menu
            visible={profileMenuVisible}
            onDismiss={() => setProfileMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setProfileMenuVisible(true)}
                style={styles.profileAnchor}
              >
                <Icon name="account-circle" size={24} color="#fff" />
                <Text style={styles.selectedLanguage}>{language.toUpperCase()}</Text>
              </TouchableOpacity>
            }
            contentStyle={styles.profileMenuStyle}
          >
            <Menu.Item
              onPress={() => {
                setProfileMenuVisible(false);
                setLanguageModalVisible(true);
              }}
              title={t('changeLanguage')}
              leadingIcon="translate"
              titleStyle={styles.menuItemText}
            />
            <Menu.Item
              onPress={() => {
                setProfileMenuVisible(false);
                logoutUser();
              }}
              title={t('logout')}
              leadingIcon="logout"
              titleStyle={styles.menuItemText}
            />
          </Menu>
        </View>
      </Appbar.Header>

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
    textAlign: 'left', // Ensures text is aligned to the left

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
  profileMenuStyle: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    width: 200,
  },
  menuItemText: {
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
