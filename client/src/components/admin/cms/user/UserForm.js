import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput, Switch, Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { globalStyles } from '../../../../styles/styles';

const LANGUAGES = [
  { label: 'English', value: 'EN' },
  { label: 'Arabic', value: 'AR' },
  { label: 'Croatian', value: 'HE' },
];

const ROLES = [
  { label: 'Admin', value: 1 },
  { label: 'User', value: 2 },
];

const UserForm = ({ user, onUpdateUser, onSave }) => {
  const [openLang, setOpenLang] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View>
      <TextInput
        label="Username"
        value={user.username}
        onChangeText={(text) => onUpdateUser({ ...user, username: text })}
        style={globalStyles.input}
        mode="outlined"
      />
      <TextInput
        label="Phone Number"
        value={user.phone_num}
        onChangeText={(text) => onUpdateUser({ ...user, phone_num: text })}
        style={globalStyles.input}
        keyboardType="phone-pad"
        mode="outlined"
      />
      <View style={globalStyles.passwordContainer}>
        <TextInput
          label="Password"
          value={user.password}
          onChangeText={(text) => onUpdateUser({ ...user, password: text })}
          style={[globalStyles.input, { flex: 1 }]}
          secureTextEntry={!passwordVisible}
          mode="outlined"
          right={<TextInput.Icon name={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />}
        />
      </View>
      <TextInput
        label="Credits"
        value={user.credits.toString()}
        onChangeText={(text) => {
          const credits = parseInt(text);
          if (!isNaN(credits) && credits >= 0) {
            onUpdateUser({ ...user, credits });
          }
        }}
        style={globalStyles.input}
        keyboardType="numeric"
        mode="outlined"
        placeholder="Enter credits (min 0)"
      />
      <View style={[globalStyles.dropdownContainer, { zIndex: openLang ? 3000 : 1000 }]}>
        <DropDownPicker
          open={openLang}
          value={user.default_lang}
          items={LANGUAGES}
          setOpen={setOpenLang}
          onOpen={() => setOpenRole(false)}
          setValue={(value) => onUpdateUser({ ...user, default_lang: value() })}
          style={globalStyles.dropdown}
          dropDownContainerStyle={globalStyles.dropdownList}
          placeholder="Select Language"
        />
      </View>
      <View style={[globalStyles.dropdownContainer, { zIndex: openRole ? 3000 : 2000 }]}>
        <DropDownPicker
          open={openRole}
          value={user.role_id}
          items={ROLES}
          setOpen={setOpenRole}
          onOpen={() => setOpenLang(false)}
          setValue={(value) => onUpdateUser({ ...user, role_id: value() })}
          style={globalStyles.dropdown}
          dropDownContainerStyle={globalStyles.dropdownList}
          placeholder="Select Role"
        />
      </View>
      <View style={globalStyles.switchContainer}>
        <Text>Active</Text>
        <Switch
          value={user.active}
          onValueChange={(value) => onUpdateUser({ ...user, active: value })}
        />
      </View>
      <Button mode="contained" onPress={onSave} style={globalStyles.button}>
        Save
      </Button>
    </View>
  );
};

export default UserForm;