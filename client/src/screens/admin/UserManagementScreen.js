import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import {
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  Searchbar,
  Switch,
  TextInput,
  Snackbar,
  Provider as PaperProvider, // Import PaperProvider
} from "react-native-paper";
import AppBar from "../../components/common/AppBar";
import styles from "../../styles/userManagementStyles";
import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
} from "../../utils/axios";
import { theme } from "../../utils/theme";
import { isFormValid, validateForm } from "../../utils/validationUtils";

const UserManagementScreen = () => {
  // **State Variables**
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // State to store roles
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    phone_num: "",
    password: "",
    credits: 0,
    active: true,
    default_lang: "EN",
    role_id: 1,
    trainer_id: null, // Added
  });
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [openLang, setOpenLang] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [openTrainer, setOpenTrainer] = useState(false); // Added

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const memoizedRoles = useMemo(() => roles, [roles]);

  // **Snackbar State for Inside Modal (Add & Update)**
  const [snackbarVisibleInside, setSnackbarVisibleInside] = useState(false);
  const [snackbarMessageInside, setSnackbarMessageInside] = useState("");
  const [snackbarTypeInside, setSnackbarTypeInside] = useState("success"); // 'success' or 'error'

  // **Snackbar State for Outside Modal (Delete)**
  const [snackbarVisibleOutside, setSnackbarVisibleOutside] = useState(false);
  const [snackbarMessageOutside, setSnackbarMessageOutside] = useState("");
  const [snackbarTypeOutside, setSnackbarTypeOutside] = useState("success"); // 'success' or 'error'

  // **Error State**
  const [errors, setErrors] = useState({});

  // **Snackbar Helper Functions for Inside Modal**
  const showSnackbarInside = (message, type = "success") => {
    setSnackbarMessageInside(message);
    setSnackbarTypeInside(type);
    setSnackbarVisibleInside(true);
  };

  const hideSnackbarInside = () => {
    setSnackbarVisibleInside(false);
    // Close the Modal after Snackbar is dismissed if it's a success message
    if (snackbarTypeInside === "success") {
      setIsModalVisible(false);
      setSelectedUser(null);
      setNewUser({
        username: "",
        phone_num: "",
        password: "",
        credits: 0,
        active: true,
        default_lang: "EN",
        role_id: 1,
        trainer_id: null, // Reset trainer_id
      });
    }
  };

  // **Snackbar Helper Functions for Outside Modal**
  const showSnackbarOutside = (message, type = "success") => {
    setSnackbarMessageOutside(message);
    setSnackbarTypeOutside(type);
    setSnackbarVisibleOutside(true);
  };

  const hideSnackbarOutside = () => {
    setSnackbarVisibleOutside(false);
  };

  const languages = [
    { label: "English", value: "EN" },
    { label: "Arabic", value: "AR" },
    { label: "Hebrew", value: "HE" },
  ];

  const onDropdownOpen = (type) => {
    if (type === "lang") {
      setOpenLang(!openLang);
      setOpenRole(false);
      setOpenTrainer(false); // Close other dropdowns
    } else if (type === "role") {
      setOpenRole(!openRole);
      setOpenLang(false);
      setOpenTrainer(false); // Close other dropdowns
    } else if (type === "trainer") {
      setOpenTrainer(!openTrainer);
      setOpenLang(false);
      setOpenRole(false); // Close other dropdowns
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // **Fetch Users**
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbarOutside("Failed to fetch users.", "error");
    }
  };


  // **Fetch Roles**
  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      const roleItems = response.data.map((role) => ({
        label: role.name,
        value: role.role_id,
        key: role.role_id.toString(), // Ensure each role has a unique key
      }));
      setRoles(roleItems);
    } catch (error) {
      console.log("Errors from roles:", error);
      console.error("Error fetching roles:", error);
      showSnackbarOutside("Failed to fetch roles.", "error");
    }
  };

  // **Handle Adding a New User**
  const handleAddUser = async () => {
    const fields = {
      username: newUser.username,
      phone_num: newUser.phone_num,
      password: newUser.password,
      credits: newUser.credits.toString(),
      // Add other fields as needed
    };

    const validationErrors = validateForm(fields);


    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createUser({
        ...newUser,
        phone_num: stripDashes(newUser.phone_num),
        trainer_id: newUser.trainer_id, // Added
      });
      fetchUsers();
      setErrors({}); // Clear errors on success
      showSnackbarInside("User created successfully!", "success");
      // The Modal will be closed after the Snackbar is dismissed via hideSnackbarInside
    } catch (error) {
      console.error("Error adding user:", error);
      showSnackbarInside("Failed to create user. Please try again.", "error");
    }
  };

  // **Handle Updating a User**
  const handleUpdateUser = async () => {

    // Prepare the fields to validate (exclude password if not changed)
    const fields = {
      username: selectedUser.username,
      phone_num: selectedUser.phone_num,
      credits: selectedUser.credits.toString(),
    };

    // Check if password has been changed (i.e., it's not empty)
    if (selectedUser.password && selectedUser.password.trim() !== "") {
      fields.password = selectedUser.password;
    }

    const validationErrors = validateForm(fields);

    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Prepare the update payload
      const updateData = {
        username: selectedUser.username,
        phone_num: stripDashes(selectedUser.phone_num), // Remove dashes before sending
        credits: selectedUser.credits,
        active: selectedUser.active,
        default_lang: selectedUser.default_lang,
        role_id: selectedUser.role_id,
        trainer_id: selectedUser.trainer_id, // Added
      };

      // Conditionally include password if it's been changed
      if (fields.password) {
        updateData.password = fields.password;
      }
      await updateUser(selectedUser.id, updateData);
      fetchUsers();
      setErrors({}); // Clear errors on success
      showSnackbarInside("User updated successfully!", "success");
      // The Modal will be closed after the Snackbar is dismissed via hideSnackbarInside
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbarInside("Failed to update user. Please try again.", "error");
    }
  };

  // **Handle Deleting a User**
  const handleDeleteUser = (id) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteUserById(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const deleteUserById = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
      showSnackbarOutside("User deleted successfully!", "success");
    } catch (error) {
      console.error("Failed to delete user:", error);
      showSnackbarOutside(
        "There was an error deleting the user. Please try again.",
        "error"
      );
    }
  };

  // **Format Phone Number**
  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Ensure the length is no more than 10 digits
    const trimmed = cleaned.slice(0, 10);

    // Apply dashes (xxx-xxx-xxxx)
    if (trimmed.length > 6) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 6)}-${trimmed.slice(
        6
      )}`;
    } else if (trimmed.length > 3) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
    } else {
      return trimmed;
    }
  };

  // **Handle Phone Number Change**
  const handlePhoneNumberChange = (text) => {
    const formattedPhoneNumber = formatPhoneNumber(text);

    if (selectedUser) {
      setSelectedUser({ ...selectedUser, phone_num: formattedPhoneNumber });
    } else {
      setNewUser({ ...newUser, phone_num: formattedPhoneNumber });
    }
  };

  // **Strip Dashes from Phone Number**
  const stripDashes = (phone) => {
    return phone.replace(/-/g, "");
  };

  // **Toggle Expand for User Details**
  const toggleExpand = (user) => {
    setExpandedUserId(expandedUserId === user.id ? null : user.id);
  };

  // **Handle Edit Press**
  const handleEditPress = (item) => {
    setSelectedUser({
      ...item,
      phone_num: formatPhoneNumber(item.phone_num),
      password: "", // Clear password field when editing
      trainer_id: item.trainer_id || null, // Added
    });
    setIsModalVisible(true);
  };

  // **Handle Search Input Change**
  const onChangeSearch = (query) => setSearchQuery(query); // Handler for search input

  // **Filter Users Based on Search Query (Case-Insensitive)**
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // **Render Each User Item**
  const renderItem = ({ item }) => (
    <Card style={styles.userCard}>
      <TouchableOpacity onPress={() => toggleExpand(item)} style={styles.row}>
        <Text style={[styles.cell, styles.username]}>{item.username}</Text>
        <Text style={[styles.cell, styles.phoneNumber]}>{item.phone_num}</Text>
        <View style={[styles.cell, styles.actions]}>
          <IconButton
            icon="pencil"
            size={20}
            color={theme.colors.primary}
            onPress={() => handleEditPress(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            color={theme.colors.error}
            onPress={() => handleDeleteUser(item.id)}
          />
        </View>
      </TouchableOpacity>
      {expandedUserId === item.id && (
        <View style={styles.expandedInfo}>
          <Text style={styles.infoText}>Credits: {item.credits}</Text>
          <Text style={styles.infoText}>
            Active: {item.active ? "Yes" : "No"}
          </Text>
          <Text style={styles.infoText}>
            Role: {roles.find((role) => role.value === item.role_id)?.label}
          </Text>
          <Text style={styles.infoText}>
            Default Language: {item.default_lang}
          </Text>
          <Divider style={styles.divider} />
        </View>
      )}
    </Card>
  );

  // **Render Modal Content**
  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {selectedUser ? "Edit User" : "Add New User"}
      </Text>
      <TextInput
        label="Username"
        value={selectedUser ? selectedUser.username : newUser.username}
        onChangeText={(text) =>
          selectedUser
            ? setSelectedUser({ ...selectedUser, username: text })
            : setNewUser({ ...newUser, username: text })
        }
        style={styles.input}
        mode="outlined"
        error={!!errors.username}
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username}</Text>
      )}

      <TextInput
        label="Phone Number"
        value={selectedUser ? selectedUser.phone_num : newUser.phone_num}
        onChangeText={handlePhoneNumberChange}
        style={styles.input}
        keyboardType="phone-pad"
        mode="outlined"
        maxLength={12}
        error={!!errors.phone_num}
      />
      {errors.phone_num && (
        <Text style={styles.errorText}>{errors.phone_num}</Text>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          label="Password"
          value={selectedUser ? selectedUser.password : newUser.password}
          onChangeText={(text) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, password: text })
              : setNewUser({ ...newUser, password: text })
          }
          style={[styles.input, { flex: 1 }]}
          secureTextEntry={!passwordVisible}
          mode="outlined"
          error={!!errors.password}
        />
        
        <IconButton
          icon={passwordVisible ? "eye-off" : "eye"}
          size={20}
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.passwordToggle}
        />
      </View>
      

      <TextInput
        label="Credits"
        value={
          selectedUser
            ? selectedUser.credits.toString()
            : newUser.credits.toString()
        }
        onChangeText={(text) => {
          let credits = parseInt(text);
          if (isNaN(credits) || credits < 0) {
            credits = 0;
          }
          selectedUser
            ? setSelectedUser({ ...selectedUser, credits })
            : setNewUser({ ...newUser, credits });
        }}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
        placeholder="Enter credits (min 0)"
        error={!!errors.credits}
      />
      {errors.credits && (
        <Text style={styles.errorText}>{errors.credits}</Text>
      )}

      
      {/* 2. Language Dropdown */}
      <View style={[styles.dropdownContainer, { zIndex: 2000, elevation: 2000, position: 'relative' }]}>
        <DropDownPicker
          open={openLang}
          value={selectedUser ? selectedUser.default_lang : newUser.default_lang}
          items={languages}
          setOpen={() => onDropdownOpen("lang")}
          setValue={(value) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, default_lang: value() })
              : setNewUser({ ...newUser, default_lang: value() })
          }
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholder="Select Language"
          listMode="MODAL"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
        {errors.default_lang && (
          <Text style={styles.errorText}>{errors.default_lang}</Text>
        )}
      </View>

      {/* 3. Role Dropdown */}
      <View style={[styles.dropdownContainer, { zIndex: 3000, elevation: 3000, position: 'relative' }]}>
        <DropDownPicker
          open={openRole}
          value={selectedUser ? selectedUser.role_id : newUser.role_id}
          items={memoizedRoles}
          setOpen={() => onDropdownOpen("role")}
          setValue={(value) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, role_id: value() })
              : setNewUser({ ...newUser, role_id: value() })
          }
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholder="Select Role"
          listMode="MODAL"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
        {errors.role_id && (
          <Text style={styles.errorText}>{errors.role_id}</Text>
        )}
      </View>

      {/* 4. Active Switch */}
      <View style={styles.switchContainer}>
        <Text>Active</Text>
        <Switch
          color={theme.colors.primary} // Ensures Switch color matches theme
          value={selectedUser ? selectedUser.active : newUser.active}
          onValueChange={(value) =>
            selectedUser
              ? setSelectedUser({ ...selectedUser, active: value })
              : setNewUser({ ...newUser, active: value })
          }
        />
      </View>

      {/* 5. Save and Cancel Buttons */}
      <Button
        mode="contained"
        onPress={selectedUser ? handleUpdateUser : handleAddUser}
        style={styles.saveButton}
      >
        Save
      </Button>
      <Button
        mode="outlined"
        onPress={() => {
          setIsModalVisible(false);
          setErrors({});
          // Reset password field
          if (selectedUser) {
            setSelectedUser({ ...selectedUser, password: "" });
          }
        }}
        style={styles.cancelButton}
      >
        Cancel
      </Button>
    </View>
  );

  return (
    <>
      <AppBar />
      <PaperProvider theme={theme}>
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setIsModalVisible(false);
            setErrors({});
            // Reset password field
            if (selectedUser) {
              setSelectedUser({ ...selectedUser, password: "" });
            }
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              {renderModalContent()}
              {/* **Snackbar Inside Modal** */}
              <Snackbar
                visible={snackbarVisibleInside}
                onDismiss={hideSnackbarInside}
                duration={3000}
                style={
                  snackbarTypeInside === "success"
                    ? styles.snackbarSuccess
                    : styles.snackbarError
                }
                action={{
                  label: "Close",
                  onPress: hideSnackbarInside,
                }}
              >
                {snackbarMessageInside}
              </Snackbar>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        <View style={styles.container}>
          <Searchbar
            placeholder="Search by username"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon="magnify"
            clearIcon="close"
          />

          {/* **Header Row** */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Username</Text>
            <Text style={styles.headerText}>Phone Number</Text>
            <Text style={styles.headerText}>Actions</Text>
          </View>

          {/* **Users List** */}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found.</Text>
              </View>
            }
          />

          {/* **Floating Action Button (FAB)** */}
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => {
              setNewUser({
                username: "",
                phone_num: "",
                password: "",
                credits: 0,
                active: true,
                default_lang: "EN",
                role_id: 1,
                trainer_id: null, // Reset trainer_id
              });
              setSelectedUser(null);
              setIsModalVisible(true);
            }}
          />

          {/* **Snackbar Outside Modal (Delete Actions)** */}
          <Snackbar
            visible={snackbarVisibleOutside}
            onDismiss={hideSnackbarOutside}
            duration={3000}
            style={
              snackbarTypeOutside === "success"
                ? styles.snackbarSuccess
                : styles.snackbarError
            }
            action={{
              label: "Close",
              onPress: hideSnackbarOutside,
            }}
          >
            {snackbarMessageOutside}
          </Snackbar>
        </View>
      </PaperProvider>
    </>
  );
};

export default UserManagementScreen;
